const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const quizzes = require('./data/quizzes');
const fortuneTools = require('./data/fortune-tools');
const { calcSaju, getTtiByYear, getTtiRelation, TTI_ORDER, STEM_ROMAN, STEM_ROMAN_TO_KO } = require('./lib/fortune');
const {
  renderHome,
  renderQuizPage,
  renderResultPage,
  renderSajuForm,
  renderSajuResult,
  renderUnseHome,
  renderUnseResult,
  renderGunghapForm,
  renderGunghapResult,
  renderIlganPage,
  SITE_URL,
} = require('./views/render');

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300, // 정적 리소스(css/js)도 이 리미터를 통과하므로, 페이지 하나만 봐도 여러 요청이 소모됩니다.
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.static(path.join(__dirname, 'public')));

function findQuiz(id) {
  return quizzes.find((q) => q.id === id);
}

// --- 홈 ---
app.get('/', (req, res) => {
  res.send(renderHome(quizzes, fortuneTools));
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
    ...quizzes.map((q) => `/q/${q.id}`),
    '/privacy.html',
    '/terms.html',
  ];

  // 오늘의 띠별 운세: /unse/:animal (12개) — 기존 라우트지만 sitemap에서 누락돼 있었음
  const unsePaths = TTI_ORDER.map((a) => `/unse/${a}`);

  // 띠 궁합: /gunghap/r/:my/:partner (12×12=144, 순서쌍 전체 — my/partner가 바뀌면 문구가 달라지므로 모두 포함)
  const gunghapPaths = [];
  TTI_ORDER.forEach((my) => {
    TTI_ORDER.forEach((partner) => {
      gunghapPaths.push(`/gunghap/r/${my}/${partner}`);
    });
  });

  // 일간(日干) 랜딩 페이지: /ilgan/:stemKey (10개, "OO목 성격" 등 검색어 타겟)
  const ilganPaths = STEM_ROMAN.map((k) => `/ilgan/${k}`);

  const allPaths = [...staticPaths, ...unsePaths, ...gunghapPaths, ...ilganPaths];
  const urls = allPaths.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n');
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
});

// --- 트렌드 테스트 (기존, 선택식 퀴즈) ---
app.get('/q/:id', (req, res) => {
  const quiz = findQuiz(req.params.id);
  if (!quiz) return res.redirect('/');
  res.send(renderQuizPage(quiz));
});

app.get('/q/:id/r/:resultKey', (req, res) => {
  const quiz = findQuiz(req.params.id);
  if (!quiz || !quiz.results[req.params.resultKey]) return res.redirect('/');
  res.send(renderResultPage(quiz, req.params.resultKey));
});

// --- 사주팔자 계산기 ---
// new Date(y, m-1, d)는 존재하지 않는 날짜(2월 30일 등)를 다음 달로 자동 이월시키는데,
// 이월된 결과의 연/월/일을 원래 입력과 비교하면 실제 달력에 존재하는 날짜인지 안전하게 검증할 수 있습니다.
function isRealCalendarDate(year, month, day) {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

function validYmd(year, month, day) {
  return (
    Number.isInteger(year) && year >= 1920 && year <= 2026 &&
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

  if (!validYmd(year, month, day)) return res.redirect('/saju');

  let hour = null;
  if (timeParam !== 'unknown') {
    hour = parseInt(timeParam, 10);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) return res.redirect('/saju');
  }

  try {
    const saju = calcSaju(year, month, day, hour);
    res.send(renderSajuResult(year, month, day, timeParam, saju));
  } catch (e) {
    res.send(renderSajuForm({ error: '입력하신 날짜를 계산할 수 없어요. 날짜를 다시 확인해주세요.' }));
  }
});

// --- 일간(日干) 단독 랜딩 페이지 ---
app.get('/ilgan/:stemKey', (req, res) => {
  if (!STEM_ROMAN_TO_KO[req.params.stemKey]) return res.redirect('/saju');
  res.send(renderIlganPage(req.params.stemKey));
});

// --- 오늘의 띠별 운세 ---
app.get('/unse', (req, res) => {
  res.send(renderUnseHome());
});

app.get('/unse/find', (req, res) => {
  const year = parseInt(req.query.year, 10);
  if (!Number.isInteger(year) || year < 1920 || year > 2026) return res.redirect('/unse');
  try {
    const tti = getTtiByYear(year);
    if (!tti) return res.redirect('/unse');
    res.redirect(`/unse/${tti.key}`);
  } catch (e) {
    res.redirect('/unse');
  }
});

app.get('/unse/:animal', (req, res) => {
  if (!TTI_ORDER.includes(req.params.animal)) return res.redirect('/unse');
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
  res.redirect(`/gunghap/r/${my}/${partner}`);
});

app.get('/gunghap/r/:my/:partner', (req, res) => {
  const { my, partner } = req.params;
  if (!TTI_ORDER.includes(my) || !TTI_ORDER.includes(partner)) return res.redirect('/gunghap');
  const relation = getTtiRelation(my, partner);
  res.send(renderGunghapResult(my, partner, relation));
});

// 알 수 없는 경로는 홈으로
app.get('*', (req, res) => {
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`요즘테스트 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
