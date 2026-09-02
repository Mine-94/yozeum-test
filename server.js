const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const quizzes = require('./data/quizzes');
const fortuneTools = require('./data/fortune-tools');
const guides = require('./data/guides');
const { questions: mbtiQuestions, types: mbtiTypes, axisInfo: mbtiAxisInfo } = require('./data/mbti');
const { calcSaju, getTtiByYear, getTtiRelation, getTodayKST, TTI_ORDER, STEM_ROMAN, STEM_ROMAN_TO_KO } = require('./lib/fortune');
const {
  renderHome,
  renderAboutPage,
  renderGuidesHome,
  renderGuidePage,
  renderMbtiHome,
  renderMbtiTest,
  renderMbtiType,
  renderMbtiCompatibilityForm,
  renderMbtiCompatibilityResult,
  renderQuizPage,
  renderResultPage,
  renderSajuForm,
  renderSajuResult,
  renderUnseHome,
  renderUnseResult,
  renderGunghapForm,
  renderGunghapResult,
  renderIlganPage,
  renderNotFound,
  SITE_URL,
} = require('./views/render');

const app = express();
const PORT = process.env.PORT || 3000;
const ADSENSE_PUBLISHER_ID = (process.env.ADSENSE_CLIENT_ID || 'ca-pub-8602848692420724').replace(/^ca-/, '');
const LEGACY_HOST = 'yozeum-test.onrender.com';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// 검색 신호가 Render 기본 주소와 공식 도메인으로 갈라지지 않도록 한 곳으로 모읍니다.
app.use((req, res, next) => {
  if (String(req.hostname || '').toLowerCase() === LEGACY_HOST) {
    return res.redirect(301, `${SITE_URL}${req.originalUrl}`);
  }
  next();
});

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  next();
});

// CSS·JS·아이콘은 요청 제한에 포함하지 않아 정상적인 페이지 열람이 제한량을 소모하지 않게 합니다.
app.use(express.static(path.join(__dirname, 'public')));
app.use(limiter);

// AdSense가 소유권과 판매자 정보를 확인할 수 있도록 반드시 루트에서
// text/plain으로 응답합니다. catch-all 리다이렉트보다 먼저 선언해야 합니다.
app.get('/ads.txt', (req, res) => {
  res.type('text/plain');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`);
});

function findQuiz(id) {
  return quizzes.find((q) => q.id === id);
}

function notFound(res) {
  res.set('X-Robots-Tag', 'noindex, follow');
  return res.status(404).send(renderNotFound());
}

// --- 홈 ---
app.get('/', (req, res) => {
  res.send(renderHome(quizzes, fortuneTools, guides));
});

app.get('/about', (req, res) => {
  res.send(renderAboutPage());
});

app.get('/guides', (req, res) => {
  res.send(renderGuidesHome(guides));
});

app.get('/guides/:slug', (req, res) => {
  const guide = guides.find((item) => item.slug === req.params.slug);
  if (!guide) return notFound(res);
  res.send(renderGuidePage(guide));
});

// --- SEO: robots.txt / sitemap.xml ---
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  const staticPaths = [
    '/',
    '/saju',
    '/unse',
    '/gunghap',
    '/about',
    '/guides',
    '/mbti',
    '/mbti/test',
    '/mbti/compatibility',
    ...guides.map((guide) => `/guides/${guide.slug}`),
    ...Object.keys(mbtiTypes).map((type) => `/mbti/type/${type}`),
    ...quizzes.map((q) => `/q/${q.id}`),
    '/privacy.html',
    '/terms.html',
  ];

  // 오늘의 띠별 운세: /unse/:animal (12개) — 기존 라우트지만 sitemap에서 누락돼 있었음
  const unsePaths = TTI_ORDER.map((a) => `/unse/${a}`);

  // 일간(日干) 랜딩 페이지: /ilgan/:stemKey (10개, "OO목 성격" 등 검색어 타겟)
  const ilganPaths = STEM_ROMAN.map((k) => `/ilgan/${k}`);

  const allPaths = [...staticPaths, ...unsePaths, ...ilganPaths];
  const urls = allPaths.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n');
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
});

// --- MBTI 16유형·테스트·궁합 ---
app.get('/mbti', (req, res) => {
  res.send(renderMbtiHome(mbtiTypes, mbtiAxisInfo));
});

app.get('/mbti/test', (req, res) => {
  res.send(renderMbtiTest(mbtiQuestions, mbtiAxisInfo));
});

app.get('/mbti/type/:type', (req, res) => {
  const typeCode = String(req.params.type || '').toUpperCase();
  if (!mbtiTypes[typeCode]) return notFound(res);
  if (req.params.type !== typeCode) return res.redirect(301, `/mbti/type/${typeCode}`);

  const values = ['ei', 'sn', 'tf', 'jp'].map((key) => parseInt(req.query[key], 10));
  const validBreakdown = values.every((value) => Number.isInteger(value) && value >= 0 && value <= 100);
  const breakdown = validBreakdown
    ? [
        { title: '에너지 방향', left: 'E', right: 'I', leftValue: values[0], rightValue: 100 - values[0] },
        { title: '정보 인식', left: 'S', right: 'N', leftValue: values[1], rightValue: 100 - values[1] },
        { title: '판단 기준', left: 'T', right: 'F', leftValue: values[2], rightValue: 100 - values[2] },
        { title: '생활 방식', left: 'J', right: 'P', leftValue: values[3], rightValue: 100 - values[3] },
      ]
    : null;
  res.send(renderMbtiType(typeCode, mbtiTypes[typeCode], breakdown));
});

app.get('/mbti/compatibility', (req, res) => {
  const first = mbtiTypes[String(req.query.first || '').toUpperCase()] ? String(req.query.first).toUpperCase() : null;
  res.send(renderMbtiCompatibilityForm(mbtiTypes, first));
});

app.get('/mbti/compatibility/result', (req, res) => {
  const first = String(req.query.first || '').toUpperCase();
  const second = String(req.query.second || '').toUpperCase();
  if (!mbtiTypes[first] || !mbtiTypes[second]) return res.redirect('/mbti/compatibility');
  const pair = [first, second].sort();
  res.redirect(`/mbti/compatibility/${pair[0]}/${pair[1]}`);
});

app.get('/mbti/compatibility/:first/:second', (req, res) => {
  const first = String(req.params.first || '').toUpperCase();
  const second = String(req.params.second || '').toUpperCase();
  if (!mbtiTypes[first] || !mbtiTypes[second]) return notFound(res);
  const pair = [first, second].sort();
  if (req.params.first !== pair[0] || req.params.second !== pair[1]) {
    return res.redirect(301, `/mbti/compatibility/${pair[0]}/${pair[1]}`);
  }
  res.set('X-Robots-Tag', 'noindex, follow');
  res.send(renderMbtiCompatibilityResult(pair[0], mbtiTypes[pair[0]], pair[1], mbtiTypes[pair[1]]));
});

// --- 트렌드 테스트 (기존, 선택식 퀴즈) ---
app.get('/q/:id', (req, res) => {
  const quiz = findQuiz(req.params.id);
  if (!quiz) return notFound(res);
  res.send(renderQuizPage(quiz));
});

app.get('/q/:id/r/:resultKey', (req, res) => {
  const quiz = findQuiz(req.params.id);
  if (!quiz || !quiz.results[req.params.resultKey]) return notFound(res);
  // 유형+점수 결합형: 클라이언트에서 계산한 "일치율"(?s=0~100)이 있으면 결과에 함께 표시.
  // 값이 없거나 유효 범위를 벗어나면 조용히 무시하고 기존과 동일하게 렌더링(캐노니컬 URL은 그대로 유지).
  const scoreRaw = parseInt(req.query.s, 10);
  const matchScore = Number.isInteger(scoreRaw) && scoreRaw >= 0 && scoreRaw <= 100 ? scoreRaw : null;
  res.set('X-Robots-Tag', 'noindex, follow');
  res.send(renderResultPage(quiz, req.params.resultKey, matchScore));
});

// --- 사주팔자 계산기 ---
// new Date(y, m-1, d)는 존재하지 않는 날짜(2월 30일 등)를 다음 달로 자동 이월시키는데,
// 이월된 결과의 연/월/일을 원래 입력과 비교하면 실제 달력에 존재하는 날짜인지 안전하게 검증할 수 있습니다.
function isRealCalendarDate(year, month, day) {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

function validYmd(year, month, day) {
  const currentYear = Number(getTodayKST().slice(0, 4));
  return (
    Number.isInteger(year) && year >= 1920 && year <= currentYear &&
    Number.isInteger(month) && month >= 1 && month <= 12 &&
    Number.isInteger(day) && day >= 1 && day <= 31 &&
    isRealCalendarDate(year, month, day)
  );
}

app.get('/saju', (req, res) => {
  res.send(renderSajuForm());
});

app.get('/saju/compute', (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  const day = parseInt(req.query.day, 10);
  const hourRaw = req.query.hour;

  if (!validYmd(year, month, day)) {
    return res.send(renderSajuForm({ error: '생년월일을 다시 확인해주세요.' }));
  }

  let timeSeg = 'unknown';
  if (hourRaw && hourRaw !== 'unknown') {
    const hour = parseInt(hourRaw, 10);
    if (Number.isInteger(hour) && hour >= 0 && hour <= 23) {
      timeSeg = String(hour).padStart(2, '0');
    }
  }

  res.redirect(`/saju/r/${year}/${month}/${day}/${timeSeg}`);
});

app.get('/saju/r/:year/:month/:day/:time', (req, res) => {
  const year = parseInt(req.params.year, 10);
  const month = parseInt(req.params.month, 10);
  const day = parseInt(req.params.day, 10);
  const timeParam = req.params.time;

  if (!validYmd(year, month, day)) return notFound(res);

  let hour = null;
  if (timeParam !== 'unknown') {
    hour = parseInt(timeParam, 10);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) return notFound(res);
  }

  try {
    const saju = calcSaju(year, month, day, hour);
    res.set('X-Robots-Tag', 'noindex, follow');
    res.send(renderSajuResult(year, month, day, timeParam, saju));
  } catch (e) {
    res.send(renderSajuForm({ error: '입력하신 날짜를 계산할 수 없어요. 날짜를 다시 확인해주세요.' }));
  }
});

// --- 일간(日干) 단독 랜딩 페이지 ---
app.get('/ilgan/:stemKey', (req, res) => {
  if (!STEM_ROMAN_TO_KO[req.params.stemKey]) return notFound(res);
  res.send(renderIlganPage(req.params.stemKey));
});

// --- 오늘의 띠별 운세 ---
app.get('/unse', (req, res) => {
  res.send(renderUnseHome());
});

app.get('/unse/find', (req, res) => {
  const year = parseInt(req.query.year, 10);
  const currentYear = Number(getTodayKST().slice(0, 4));
  if (!Number.isInteger(year) || year < 1920 || year > currentYear) return res.redirect('/unse');
  try {
    const tti = getTtiByYear(year);
    if (!tti) return res.redirect('/unse');
    res.redirect(`/unse/${tti.key}`);
  } catch (e) {
    res.redirect('/unse');
  }
});

app.get('/unse/:animal', (req, res) => {
  if (!TTI_ORDER.includes(req.params.animal)) return notFound(res);
  res.send(renderUnseResult(req.params.animal));
});

// --- 띠 궁합 ---
app.get('/gunghap', (req, res) => {
  const prefillMy = TTI_ORDER.includes(req.query.my) ? req.query.my : null;
  res.send(renderGunghapForm({ prefillMy }));
});

app.get('/gunghap/compute', (req, res) => {
  const my = req.query.my;
  const partner = req.query.partner;
  if (!TTI_ORDER.includes(my) || !TTI_ORDER.includes(partner)) {
    return res.redirect('/gunghap');
  }
  const pair = [my, partner].sort((a, b) => TTI_ORDER.indexOf(a) - TTI_ORDER.indexOf(b));
  res.redirect(`/gunghap/r/${pair[0]}/${pair[1]}`);
});

app.get('/gunghap/r/:my/:partner', (req, res) => {
  const { my, partner } = req.params;
  if (!TTI_ORDER.includes(my) || !TTI_ORDER.includes(partner)) return notFound(res);
  if (TTI_ORDER.indexOf(my) > TTI_ORDER.indexOf(partner)) {
    return res.redirect(301, `/gunghap/r/${partner}/${my}`);
  }
  const relation = getTtiRelation(my, partner);
  res.set('X-Robots-Tag', 'noindex, follow');
  res.send(renderGunghapResult(my, partner, relation));
});

// 없는 주소는 실제 404로 응답해 사용자와 검색엔진 모두에게 상태를 명확히 알립니다.
app.use((req, res) => {
  notFound(res);
});

app.listen(PORT, () => {
  console.log(`요즘테스트 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
