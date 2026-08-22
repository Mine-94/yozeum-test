const {
  STEM_CONTENT,
  WUXING_CONTENT,
  wuxingDominant,
  TTI_CONTENT,
  TTI_COMPAT_TEXT,
  DAILY_FORTUNE_POOL,
} = require('../data/fortune-content');
const {
  TTI_ORDER,
  getTodayKST,
  pickSeeded,
  STEM_ROMAN,
  STEM_ROMAN_TO_KO,
  STEM_KO_TO_ROMAN,
  STEM_ROMAN_TO_ELEMENT,
  STEM_ROMAN_TO_YINYANG,
} = require('../lib/fortune');

const SITE_NAME = '요즘테스트';
const SITE_URL = process.env.SITE_URL || 'https://yozeum-test.onrender.com';
const NAVER_SITE_VERIFICATION = process.env.NAVER_SITE_VERIFICATION || '';
const ADSENSE_CLIENT_ID = process.env.ADSENSE_CLIENT_ID || ''; // 예: ca-pub-8602848692420724
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || 'G-YMN47H27JQ';

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTodayKorean(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${y}년 ${m}월 ${d}일 (${WEEKDAY_KO[dt.getUTCDay()]}요일)`;
}

// 검색어 노출용 짧은 날짜 표기(예: "8월21일") — "8월21일 오늘의 운세" 형태의
// 실제 검색 패턴에 맞춰 title/description 맨 앞에 노출하기 위한 포맷입니다.
function formatTodayKoreanShort(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${m}월${d}일`;
}

function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function baseLayout({ title, description, ogUrl, canonicalUrl, bodyClass, content, themeColor, structuredData }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${escapeHtml(canonicalUrl || ogUrl)}" />
${NAVER_SITE_VERIFICATION ? `<meta name="naver-site-verification" content="${escapeHtml(NAVER_SITE_VERIFICATION)}" />` : ''}
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${escapeHtml(ogUrl)}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
${themeColor ? `<meta name="theme-color" content="${themeColor}" />` : ''}
${structuredData ? `<script type="application/ld+json">${serializeJsonLd(structuredData)}</script>` : ''}
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
<link rel="stylesheet" href="/css/style.css" />
${ADSENSE_CLIENT_ID ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${escapeHtml(ADSENSE_CLIENT_ID)}" crossorigin="anonymous"></script>` : ''}
${GA_MEASUREMENT_ID ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(GA_MEASUREMENT_ID)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeHtml(GA_MEASUREMENT_ID)}');</script>` : ''}
</head>
<body class="${bodyClass || ''}">
${content}
<footer class="site-footer">
  <div class="container">
    <p class="disclaimer">본 사이트의 사주·운세·테스트 콘텐츠는 재미를 위한 것이며 공식 심리검사·의학적 진단·전문 명리 상담을 대신하지 않습니다.</p>
    <nav class="footer-nav">
      <a href="/">홈</a>
      <a href="/privacy.html">개인정보처리방침</a>
      <a href="/terms.html">이용약관</a>
    </nav>
  </div>
</footer>
${GA_MEASUREMENT_ID ? `<script>
(function () {
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || form.tagName !== 'FORM') return;
    track('tool_submit', {
      tool_path: form.getAttribute('action') || window.location.pathname,
    });
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link || link.origin === window.location.origin) return;
    track('outbound_click', { link_url: link.href });
  });
})();
</script>` : ''}
</body>
</html>`;
}

// --- 공통 셸 ---
function formPageShell({ accent, emoji, title, subtitle, formHtml, ogUrl, description, structuredData, extraHtml }) {
  const content = `
  <header class="site-header quiz-header" style="--accent:${accent}">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <div class="quiz-hero-badge">${emoji}</div>
      <h1>${escapeHtml(title)}</h1>
      <p class="tagline">${escapeHtml(subtitle)}</p>
    </div>
  </header>

  <main class="container">
    <section class="tool-card" style="--accent:${accent}">
      ${formHtml}
    </section>

    <div class="ad-slot ad-slot-bottom">
      <div class="ad-placeholder">광고 영역 (하단)</div>
    </div>

    ${extraHtml || ''}
  </main>`;

  return baseLayout({
    title: `${title} - ${SITE_NAME}`,
    description,
    ogUrl,
    themeColor: accent,
    content,
    structuredData,
  });
}

function resultPageShell({ accent, eyebrow, emoji, titleHtml, bodyHtml, ogUrl, ogTitle, description, backHref, backLabel, shareUrl, shareText, extraHtml }) {
  const content = `
  <header class="site-header quiz-header" style="--accent:${accent}">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
    </div>
  </header>

  <main class="container">
    <section class="tool-card result-card" style="--accent:${accent}">
      <p class="result-eyebrow">${escapeHtml(eyebrow)}</p>
      <div class="result-badge">${emoji}</div>
      <h1>${titleHtml}</h1>
      ${bodyHtml}
      ${
        shareUrl
          ? `<div class="result-actions" style="margin-bottom:14px;">
        <button id="copy-link-btn" class="quiz-btn" data-url="${escapeHtml(shareUrl)}" data-text="${escapeHtml(shareText || '')}">
          링크 복사해서 공유하기
        </button>
      </div>
      <script src="/js/result-share.js"></script>`
          : ''
      }
      <div class="result-actions">
        <a href="${backHref}" class="quiz-btn quiz-btn-outline">${escapeHtml(backLabel)}</a>
      </div>
    </section>

    <div class="ad-slot ad-slot-bottom">
      <div class="ad-placeholder">광고 영역 (하단)</div>
    </div>

    ${extraHtml || ''}

    <section class="info-card">
      <h2>다른 콘텐츠도 확인해보세요</h2>
      <p><a href="/">${SITE_NAME} 홈에서 둘러보기 →</a></p>
    </section>
  </main>`;

  return baseLayout({
    title: ogTitle,
    description,
    ogUrl,
    themeColor: accent,
    content,
  });
}

// --- 홈 ---
function renderHome(quizzes, fortuneTools) {
  const fortuneCards = fortuneTools
    .map(
      (t) => `
      <a href="${t.href}" class="quiz-card" style="--accent:${t.themeColor}">
        <div class="quiz-card-badge">${t.emoji}</div>
        <h2>${escapeHtml(t.title)}</h2>
        <p>${escapeHtml(t.subtitle)}</p>
        <span class="quiz-card-cta">확인하기 →</span>
      </a>`
    )
    .join('\n');

  const quizCards = quizzes
    .map(
      (q) => `
      <a href="/q/${q.id}" class="quiz-card" style="--accent:${q.themeColor}">
        <div class="quiz-card-badge">${q.emoji}</div>
        <h2>${escapeHtml(q.title)}</h2>
        <p>${escapeHtml(q.subtitle)}</p>
        <span class="quiz-card-cta">테스트 시작하기 →</span>
      </a>`
    )
    .join('\n');

  const content = `
  <header class="site-header">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <h1 class="home-title">무료 사주·운세·심리테스트</h1>
      <p class="tagline">사주·운세부터 요즘 화제인 테스트까지 — 무료, 회원가입 없이</p>
    </div>
  </header>

  <div class="ad-slot ad-slot-top container">
    <div class="ad-placeholder">광고 영역 (상단)</div>
  </div>

  <main class="container">
    <section class="content-section">
      <h2 class="section-title">🔮 사주·운세</h2>
      <div class="quiz-grid">${fortuneCards}</div>
    </section>

    <section class="content-section">
      <h2 class="section-title">🎯 트렌드 테스트</h2>
      <div class="quiz-grid">${quizCards}</div>
    </section>

    <div class="ad-slot ad-slot-bottom">
      <div class="ad-placeholder">광고 영역 (하단)</div>
    </div>
  </main>`;

  return baseLayout({
    title: '요즘테스트 - 사주팔자·오늘의 운세·심리테스트 모음',
    description: '정식 사주팔자 계산, 오늘의 띠별 운세, 띠 궁합부터 요즘 SNS 화제 심리테스트·밸런스게임까지 한곳에서 무료로.',
    ogUrl: `${SITE_URL}/`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: '무료 사주팔자 계산, 오늘의 띠별 운세, 띠 궁합, 심리테스트 모음',
      inLanguage: 'ko-KR',
    },
    content,
  });
}

// --- 트렌드 테스트 (기존) ---
function renderQuizPage(quiz) {
  const content = `
  <header class="site-header quiz-header" style="--accent:${quiz.themeColor}">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <div class="quiz-hero-badge">${quiz.emoji}</div>
      <h1>${escapeHtml(quiz.title)}</h1>
      <p class="tagline">${escapeHtml(quiz.subtitle)}</p>
    </div>
  </header>

  <main class="container">
    <section class="tool-card quiz-app" style="--accent:${quiz.themeColor}" data-quiz-id="${quiz.id}">
      <div id="quiz-intro">
        <p class="tool-desc">${escapeHtml(quiz.intro)}</p>
        <button id="start-btn" class="quiz-btn">테스트 시작하기</button>
      </div>

      <div id="quiz-play" hidden>
        <div class="quiz-progress"><div class="quiz-progress-bar" id="progress-bar"></div></div>
        <p class="quiz-question-count" id="question-count"></p>
        <h2 id="question-text"></h2>
        <div id="options-list" class="quiz-options"></div>
      </div>
    </section>

    <div class="ad-slot ad-slot-bottom">
      <div class="ad-placeholder">광고 영역 (하단)</div>
    </div>
  </main>

  <script>window.__QUIZ__ = ${JSON.stringify(quiz)};</script>
  <script src="/js/quiz-app.js"></script>
  `;

  return baseLayout({
    title: `${quiz.title} - ${SITE_NAME}`,
    description: quiz.subtitle,
    ogUrl: `${SITE_URL}/q/${quiz.id}`,
    themeColor: quiz.themeColor,
    content,
  });
}

function renderResultPage(quiz, resultKey) {
  const result = quiz.results[resultKey];
  const shareUrl = `${SITE_URL}/q/${quiz.id}/r/${resultKey}`;

  const content = `
  <header class="site-header quiz-header" style="--accent:${quiz.themeColor}">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
    </div>
  </header>

  <main class="container">
    <section class="tool-card result-card" style="--accent:${quiz.themeColor}">
      <p class="result-eyebrow">${escapeHtml(quiz.title)} 결과</p>
      <div class="result-badge">${result.emoji}</div>
      <h1>${escapeHtml(result.title)}</h1>
      <p class="result-desc">${escapeHtml(result.desc)}</p>

      <div class="result-actions">
        <button id="copy-link-btn" class="quiz-btn" data-url="${escapeHtml(shareUrl)}" data-text="${escapeHtml(result.shareText)}">
          링크 복사해서 공유하기
        </button>
        <a href="/q/${quiz.id}" class="quiz-btn quiz-btn-outline">다시 테스트하기</a>
      </div>
    </section>

    <div class="ad-slot ad-slot-bottom">
      <div class="ad-placeholder">광고 영역 (하단)</div>
    </div>

    <section class="info-card">
      <h2>다른 테스트도 해보세요</h2>
      <p><a href="/">${SITE_NAME} 홈에서 다른 테스트 둘러보기 →</a></p>
    </section>
  </main>

  <script src="/js/result-share.js"></script>
  `;

  return baseLayout({
    title: `나의 결과는 "${result.title}" ${result.emoji} - ${quiz.title}`,
    description: result.shareText,
    ogUrl: shareUrl,
    themeColor: quiz.themeColor,
    content,
  });
}

// --- 사주팔자 계산기 ---
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => h);

function renderSajuForm({ error } = {}) {
  const yearOptions = [];
  for (let y = 2026; y >= 1920; y -= 1) yearOptions.push(y);

  const faqItems = [
    {
      question: '만세력이란 무엇인가요?',
      answer: '태어난 연·월·일·시를 천간과 지지로 바꾸어 년주·월주·일주·시주의 네 기둥을 확인하는 표입니다. 이 계산기는 절기 경계를 반영해 네 기둥과 오행 분포를 보여줍니다.',
    },
    {
      question: '태어난 시간을 몰라도 계산할 수 있나요?',
      answer: '가능합니다. 출생시간을 모르면 시주는 제외하고 년주·월주·일주의 여섯 글자를 계산합니다. 따라서 오행 분포도 여섯 글자 기준으로 표시됩니다.',
    },
    {
      question: '양력과 음력 중 어떤 날짜를 입력하나요?',
      answer: '현재 계산기는 양력 생년월일 입력만 지원합니다. 음력 생일만 알고 있다면 먼저 양력 날짜로 변환한 뒤 입력해야 합니다.',
    },
    {
      question: '오행 개수만으로 사주를 판단할 수 있나요?',
      answer: '아닙니다. 이 페이지의 오행 분포는 사주 여덟 글자 또는 시간 미상 시 여섯 글자의 기본 오행을 센 간이 지표입니다. 실제 해석에는 십성·용신·격국 등 다른 요소도 함께 필요합니다.',
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const extraHtml = `
    <section class="info-card">
      <h2>만세력 결과는 이 순서로 확인하세요</h2>
      <ol class="result-desc" style="text-align:left;line-height:1.8;padding-left:20px;">
        <li><strong>일간(日干)</strong> — 일주의 첫 글자로, 나 자신을 상징합니다.</li>
        <li><strong>오행 분포</strong> — 목·화·토·금·수의 기본 개수와 상대적인 강약을 봅니다.</li>
        <li><strong>네 기둥</strong> — 년주·월주·일주·시주를 함께 확인합니다. 시간을 모르면 시주는 제외됩니다.</li>
      </ol>
    </section>
    <section class="info-card">
      <h2>무료 만세력 자주 묻는 질문</h2>
      ${faqItems
        .map(
          (item) => `<details style="text-align:left;margin:12px 0;">
        <summary style="cursor:pointer;font-weight:700;">${escapeHtml(item.question)}</summary>
        <p class="result-desc" style="margin:8px 0 0;">${escapeHtml(item.answer)}</p>
      </details>`,
        )
        .join('')}
    </section>`;

  const formHtml = `
    <p class="tool-desc">태어난 양력 연·월·일과 출생시간을 입력하면 절기(입춘 등) 경계를 반영해 년주·월주·일주·시주와 오행 분포를 계산합니다. 시각을 모르면 년·월·일주만 확인할 수 있어요.</p>
    ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
    <form action="/saju/compute" method="GET">
      <div class="form-row">
        <label for="year">태어난 연도(양력)</label>
        <select name="year" id="year" required>
          ${yearOptions.map((y) => `<option value="${y}" ${y === 1994 ? 'selected' : ''}>${y}년</option>`).join('')}
        </select>
      </div>
      <div class="form-select-group">
        <div class="form-row">
          <label for="month">월</label>
          <select name="month" id="month" required>
            ${Array.from({ length: 12 }, (_, i) => i + 1)
              .map((m) => `<option value="${m}">${m}월</option>`)
              .join('')}
          </select>
        </div>
        <div class="form-row">
          <label for="day">일</label>
          <select name="day" id="day" required>
            ${Array.from({ length: 31 }, (_, i) => i + 1)
              .map((d) => `<option value="${d}">${d}일</option>`)
              .join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <label for="hour">태어난 시각 (모르면 "시간 모름" 선택)</label>
        <select name="hour" id="hour">
          <option value="unknown">시간 모름 (년·월·일주만 계산)</option>
          ${HOUR_OPTIONS.map((h) => `<option value="${h}">${String(h).padStart(2, '0')}시대 (${h}:00~${h}:59)</option>`).join('')}
        </select>
      </div>
      <button type="submit" class="quiz-btn">무료 만세력 계산하기</button>
    </form>
    <p class="disclaimer" style="text-align:left;margin-top:16px;">본 계산기는 양력 생년월일(시)을 기준으로 절기(입춘 등)를 반영해 년·월·일·시주를 계산하는 정식 사주 계산기입니다. 다만 실제 사주 해석은 십성·용신·격국 등 훨씬 복잡한 요소를 함께 봐야 하므로, 본 결과는 오행 분포와 일간 기준의 간이 해설로 참고만 해주세요.</p>
    <div class="link-grid">
      <p class="link-grid-title">일간(日干)별 성격이 궁금하다면?</p>
      <div class="link-grid-items">
        ${STEM_ROMAN.map((rk) => {
          const ko = STEM_ROMAN_TO_KO[rk];
          const el = STEM_ROMAN_TO_ELEMENT[rk];
          return `<a href="/ilgan/${rk}" class="link-grid-item">${ko}${el} 성격</a>`;
        }).join('\n        ')}
      </div>
    </div>
  `;

  return formPageShell({
    accent: '#5b4b8a',
    emoji: '🔮',
    title: '무료 만세력·사주팔자 오행 계산기',
    subtitle: '양력 생년월일시로 일간·오행·년월일시주를 절기 기준으로 계산해요',
    formHtml,
    ogUrl: `${SITE_URL}/saju`,
    description: '무료 만세력과 사주팔자 오행 계산기. 양력 생년월일시를 입력하면 절기 경계를 반영한 년·월·일·시주, 일간과 목화토금수 오행 분포를 확인할 수 있어요.',
    structuredData,
    extraHtml,
  });
}

function renderSajuResult(year, month, day, timeSeg, saju) {
  const { pillars, wuxingCounts, dayStemKo, hasTime, tti } = saju;
  const dominant = wuxingDominant(wuxingCounts);
  const stemInfo = STEM_CONTENT[dayStemKo];

  const pillarTableHtml = `
    <div class="saju-table-wrap">
      <table class="saju-table">
        <thead>
          <tr><th></th><th>년주</th><th>월주</th><th>일주</th><th>시주</th></tr>
        </thead>
        <tbody>
          <tr>
            <td class="saju-label">한자</td>
            <td>${pillars.year.hanja}</td>
            <td>${pillars.month.hanja}</td>
            <td>${pillars.day.hanja}</td>
            <td>${pillars.time ? pillars.time.hanja : '—'}</td>
          </tr>
          <tr>
            <td class="saju-label">한글</td>
            <td>${pillars.year.ko}</td>
            <td>${pillars.month.ko}</td>
            <td>${pillars.day.ko}</td>
            <td>${pillars.time ? pillars.time.ko : '(모름)'}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ${!hasTime ? '<p class="disclaimer" style="text-align:left;">시간 정보가 없어 시주는 계산에서 제외했어요.</p>' : ''}
  `;

  const wuxingHtml = `
    <div class="wuxing-bars">
      ${Object.entries(wuxingCounts)
        .map(([k, v]) => {
          const width = Math.min(v, 8) * 12.5;
          return `
          <div class="wuxing-bar-row">
            <span class="wuxing-bar-label">${WUXING_CONTENT[k].label}</span>
            <div class="wuxing-bar-track"><div class="wuxing-bar-fill" style="width:${width}%"></div></div>
            <span class="wuxing-bar-count">${v}</span>
          </div>`;
        })
        .join('')}
    </div>
  `;

  const dominantHtml = dominant
    ? `<p class="result-desc">오행 중에서는 <strong>${WUXING_CONTENT[dominant.maxKey].label}</strong>(${WUXING_CONTENT[dominant.maxKey].trait}) 기운이 가장 강하게 나타나요. ${WUXING_CONTENT[dominant.maxKey].many} 반대로 <strong>${WUXING_CONTENT[dominant.minKey].label}</strong> 기운은 상대적으로 약한 편이에요. ${WUXING_CONTENT[dominant.minKey].few}</p>`
    : '';

  const missingElements = Object.entries(wuxingCounts)
    .filter(([, count]) => count === 0)
    .map(([key]) => WUXING_CONTENT[key].label);
  const elementCount = Object.values(wuxingCounts).reduce((sum, count) => sum + count, 0);
  const wuxingSummaryHtml = `<p class="result-desc" style="margin:0 0 12px;">총 <strong>${elementCount}글자 기준</strong>으로 센 기본 오행 분포예요.${
    missingElements.length
      ? ` 기본 오행이 없는 항목은 <strong>${missingElements.join(', ')}</strong>예요. 다만 개수가 0이라고 해서 곧바로 나쁘다는 뜻은 아닙니다.`
      : ' 다섯 오행이 모두 포함되어 있어요.'
  }</p>`;

  const bodyHtml = `
    <p class="result-desc" style="text-align:center;margin-bottom:20px;">${year}년 ${month}월 ${day}일생${hasTime ? '' : ' · 시간 미입력'}</p>
    ${pillarTableHtml}
    <h2 style="font-size:1.05rem;margin:24px 0 10px;">나를 상징하는 일간(日干) — ${dayStemKo}(${pillars.day.hanja[0]})</h2>
    <p class="result-desc"><strong>${stemInfo.symbol}</strong>. ${stemInfo.desc}</p>
    <h2 style="font-size:1.05rem;margin:24px 0 10px;">오행(五行) 분포</h2>
    ${wuxingSummaryHtml}
    ${wuxingHtml}
    ${dominantHtml}
    ${
      tti
        ? `<div class="compat-box">
      <p class="result-eyebrow">덤으로 확인하는 나의 띠</p>
      <p class="result-desc">${tti.emoji} <strong>${tti.name}띠</strong>예요. <a href="/unse/${tti.key}">오늘의 ${tti.name}띠 운세 보기 →</a> · <a href="/gunghap?my=${tti.key}">${tti.name}띠 궁합 보기 →</a></p>
    </div>`
        : ''
    }
    <p class="disclaimer" style="text-align:left;margin-top:20px;">
      · 띠는 사주학 정통 기준인 입춘(2월 4일 무렵)을 기준으로 계산돼요. 음력설이나 양력 1월 1일 기준으로 알고 계셨던 띠와 1~2월생의 경우 다를 수 있어요.<br/>
      · 이 결과는 오행 분포와 일간 상징을 바탕으로 한 간이 해설이며, 실제 정통 사주 해석(십성·용신·격국 등)과는 다를 수 있어요. 재미로 참고해주세요.
    </p>
  `;

  const shareUrl = `${SITE_URL}/saju/r/${year}/${month}/${day}/${timeSeg}`;

  return resultPageShell({
    accent: '#5b4b8a',
    eyebrow: '사주팔자 계산 결과',
    emoji: '🔮',
    titleHtml: '나의 사주팔자',
    bodyHtml,
    ogUrl: shareUrl,
    ogTitle: `나의 사주팔자 — 일간 ${dayStemKo}(${stemInfo.symbol}) - ${SITE_NAME}`,
    description: `${year}년 ${month}월 ${day}일생 사주팔자 — 일간 ${dayStemKo}, ${stemInfo.symbol}. 오행 분포와 간이 풀이를 확인해보세요.`,
    backHref: '/saju',
    backLabel: '다시 계산하기',
    shareUrl,
    shareText: `나의 사주 일간은 ${dayStemKo}(${stemInfo.symbol})! 오행 분포까지 확인해보세요 🔮`,
  });
}

// --- 일간(日干) 단독 랜딩 페이지 (예: "갑목 성격" 검색어 타겟) ---
// 생년월일 계산 없이 일간 하나만으로 성격 콘텐츠를 보여주는 SEO용 정적 랜딩 페이지입니다.
const ILGAN_ACCENT = '#5b4b8a';

function renderIlganPage(stemRomanKey) {
  const ko = STEM_ROMAN_TO_KO[stemRomanKey];
  const el = STEM_ROMAN_TO_ELEMENT[stemRomanKey];
  const yy = STEM_ROMAN_TO_YINYANG[stemRomanKey];
  const stemInfo = STEM_CONTENT[ko];
  const wx = WUXING_CONTENT[el];
  const pageUrl = `${SITE_URL}/ilgan/${stemRomanKey}`;

  const otherStemsHtml = STEM_ROMAN.filter((rk) => rk !== stemRomanKey)
    .map((rk) => {
      const oko = STEM_ROMAN_TO_KO[rk];
      const oel = STEM_ROMAN_TO_ELEMENT[rk];
      return `<a href="/ilgan/${rk}" class="link-grid-item">${oko}${oel} 성격</a>`;
    })
    .join('\n        ');

  const bodyHtml = `
    <p class="result-desc" style="text-align:center;margin-bottom:20px;">일간(日干) ${ko}(${el}) · ${yy === '양' ? '양간(陽干)' : '음간(陰干)'}</p>
    <div class="compat-box">
      <p class="result-eyebrow">${ko}일간은 이런 상징을 가져요</p>
      <p class="result-desc"><strong>${stemInfo.symbol}</strong>. ${stemInfo.desc}</p>
    </div>
    <h2 style="font-size:1.05rem;margin:24px 0 10px;">${el}(${el === '목' ? '木' : el === '화' ? '火' : el === '토' ? '土' : el === '금' ? '金' : '水'}) 기운의 특징</h2>
    <p class="result-desc">${wx.trait}. ${wx.many}</p>
    <p class="result-desc" style="margin-top:16px;">일간은 사주팔자 여덟 글자 중에서도 '나 자신'을 상징하는 가장 중요한 글자예요. 다만 실제 나의 일간이 무엇인지, 그리고 오행 전체 분포까지 정확히 알려면 정식 사주 계산이 필요해요.</p>
    <div class="result-actions" style="margin-top:8px;">
      <a href="/saju" class="quiz-btn">내 일간 정확히 계산하기 →</a>
    </div>
    <div class="link-grid">
      <p class="link-grid-title">다른 일간도 확인해보세요</p>
      <div class="link-grid-items">
        ${otherStemsHtml}
      </div>
    </div>
    <p class="disclaimer" style="text-align:left;margin-top:20px;">이 페이지는 일간 하나만으로 보는 간이 상징·성격 해설이며, 실제 사주 해석은 년·월·일·시주 전체와 오행 분포, 십성·용신 등을 함께 봐야 훨씬 정확해요.</p>
  `;

  return resultPageShell({
    accent: ILGAN_ACCENT,
    eyebrow: '일간(日干) 성격',
    emoji: '🔮',
    titleHtml: `${ko}일간(${ko}${el}) 성격`,
    bodyHtml,
    ogUrl: pageUrl,
    ogTitle: `${ko}${el} 성격 — 일간 ${ko}일간이란? - ${SITE_NAME}`,
    description: `일간 ${ko}(${el}) 성격 해설. ${stemInfo.symbol} — ${stemInfo.desc}`,
    backHref: '/saju',
    backLabel: '내 사주팔자 계산하기',
  });
}

// --- 오늘의 띠별 운세 ---
function dailyLinesFor(animalKey, dateStr) {
  const categories = ['총운', '애정운', '금전운', '건강운'];
  const lines = {};
  categories.forEach((cat) => {
    lines[cat] = pickSeeded(DAILY_FORTUNE_POOL[cat], dateStr, animalKey, cat);
  });
  return lines;
}

function renderUnseHome() {
  const dateStr = getTodayKST();
  const todayKo = formatTodayKorean(dateStr);
  const todayShort = formatTodayKoreanShort(dateStr);

  const cards = TTI_ORDER.map((key) => {
    const info = TTI_CONTENT[key];
    const lines = dailyLinesFor(key, dateStr);
    return `
    <a href="/unse/${key}" class="quiz-card" style="--accent:#c9622a">
      <div class="quiz-card-badge">${info.emoji}</div>
      <h2>${info.name}띠</h2>
      <p>${escapeHtml(lines['총운'])}</p>
      <span class="quiz-card-cta">전체 운세 보기 →</span>
    </a>`;
  }).join('\n');

  const findFormHtml = `
    <section class="info-card">
      <h2>내 띠를 빠르게 찾고 싶다면?</h2>
      <p class="tool-desc" style="margin-bottom:14px;">태어난 연도만 입력하면 바로 내 띠의 오늘 운세로 이동해요. (1~2월생은 정확한 계산을 위해 <a href="/saju">사주팔자 계산기</a>를 이용해주세요)</p>
      <form action="/unse/find" method="GET" style="display:flex;gap:8px;">
        <select name="year" style="flex:1;padding:12px;border-radius:10px;border:1.5px solid var(--border);font-size:0.95rem;">
          ${Array.from({ length: 2026 - 1920 + 1 }, (_, i) => 2026 - i)
            .map((y) => `<option value="${y}" ${y === 1994 ? 'selected' : ''}>${y}년생</option>`)
            .join('')}
        </select>
        <button type="submit" class="quiz-btn" style="width:auto;padding:12px 20px;">내 띠 찾기</button>
      </form>
    </section>
  `;

  const content = `
  <header class="site-header quiz-header" style="--accent:#c9622a">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <div class="quiz-hero-badge">🌙</div>
      <h1>오늘의 띠별 운세</h1>
      <p class="tagline">${todayKo} · 매일 자동으로 바뀌는 12띠 운세</p>
    </div>
  </header>

  <main class="container">
    <section class="quiz-grid" style="margin-top:22px;">
      ${cards}
    </section>

    <div class="ad-slot ad-slot-bottom">
      <div class="ad-placeholder">광고 영역 (하단)</div>
    </div>

    ${findFormHtml}
  </main>`;

  return baseLayout({
    title: `${todayShort} 오늘의 띠별 운세 - ${SITE_NAME}`,
    description: `${todayShort} 오늘의 띠별 운세. ${todayKo} 기준 12띠 총운·애정운·금전운·건강운을 확인해보세요.`,
    ogUrl: `${SITE_URL}/unse`,
    themeColor: '#c9622a',
    content,
  });
}

function renderUnseResult(animalKey) {
  const dateStr = getTodayKST();
  const todayKo = formatTodayKorean(dateStr);
  const todayShort = formatTodayKoreanShort(dateStr);
  const info = TTI_CONTENT[animalKey];
  const lines = dailyLinesFor(animalKey, dateStr);
  const shareUrl = `${SITE_URL}/unse/${animalKey}`;

  const bodyHtml = `
    <p class="result-desc" style="text-align:center;margin-bottom:20px;">${todayKo}</p>
    <div class="daily-fortune-list">
      <div class="daily-fortune-row"><span class="daily-fortune-cat">총운</span><p>${escapeHtml(lines['총운'])}</p></div>
      <div class="daily-fortune-row"><span class="daily-fortune-cat">애정운</span><p>${escapeHtml(lines['애정운'])}</p></div>
      <div class="daily-fortune-row"><span class="daily-fortune-cat">금전운</span><p>${escapeHtml(lines['금전운'])}</p></div>
      <div class="daily-fortune-row"><span class="daily-fortune-cat">건강운</span><p>${escapeHtml(lines['건강운'])}</p></div>
    </div>
    <div class="compat-box">
      <p class="result-eyebrow">${info.name}띠는 원래 이런 성향이에요</p>
      <p class="result-desc">${info.desc}</p>
    </div>
    <p class="result-desc" style="margin-top:16px;"><a href="/gunghap?my=${animalKey}">${info.name}띠 궁합 확인하러 가기 →</a></p>
    <p class="disclaimer" style="text-align:left;margin-top:16px;">오늘의 운세는 날짜별로 자동 생성되는 재미 콘텐츠이며 실제 운세를 예측·보장하지 않아요.</p>
  `;

  return resultPageShell({
    accent: '#c9622a',
    eyebrow: '오늘의 띠별 운세',
    emoji: info.emoji,
    titleHtml: `${info.name}띠, 오늘의 운세`,
    bodyHtml,
    ogUrl: shareUrl,
    ogTitle: `${todayShort} ${info.name}띠 오늘의 운세 - ${SITE_NAME}`,
    description: `${todayShort} ${info.name}띠 오늘의 운세 — ${lines['총운']}`,
    backHref: '/unse',
    backLabel: '다른 띠 운세도 보기',
    shareUrl,
    shareText: `오늘 ${info.name}띠 운세: ${lines['총운']}`,
  });
}

// --- 띠 궁합 ---
// 폼 화면에 노출할 인기 조합 예시(전체 144쌍은 sitemap에만 반영, 폼에는 대표 8쌍만 노출)
const GUNGHAP_FEATURED = [
  ['tiger', 'horse'],
  ['rat', 'ox'],
  ['rat', 'horse'],
  ['snake', 'monkey'],
  ['dragon', 'rooster'],
  ['rabbit', 'dog'],
  ['pig', 'rabbit'],
  ['monkey', 'rat'],
];

function renderGunghapForm({ prefillMy } = {}) {
  const options = (selected) =>
    TTI_ORDER.map((key) => {
      const info = TTI_CONTENT[key];
      return `<option value="${key}" ${key === selected ? 'selected' : ''}>${info.emoji} ${info.name}띠</option>`;
    }).join('');

  const formHtml = `
    <p class="tool-desc">나와 상대방의 띠를 고르면 삼합·육합·충 등 실제 지지(地支) 이론으로 궁합을 확인해드려요.</p>
    <form action="/gunghap/compute" method="GET">
      <div class="form-select-group">
        <div class="form-row">
          <label for="my">나의 띠</label>
          <select name="my" id="my" required>${options(prefillMy)}</select>
        </div>
        <div class="form-row">
          <label for="partner">상대방 띠</label>
          <select name="partner" id="partner" required>${options(null)}</select>
        </div>
      </div>
      <button type="submit" class="quiz-btn">궁합 확인하기</button>
    </form>
    <p class="disclaimer" style="text-align:left;margin-top:16px;">내 띠를 정확히 모르겠다면 <a href="/saju">사주팔자 계산기</a>에서 절기 기준으로 정확하게 확인할 수 있어요(1~2월생은 특히 추천).</p>
    <div class="link-grid">
      <p class="link-grid-title">인기 궁합 조합 바로 보기</p>
      <div class="link-grid-items">
        ${GUNGHAP_FEATURED.map(([a, b]) => {
          const ia = TTI_CONTENT[a];
          const ib = TTI_CONTENT[b];
          return `<a href="/gunghap/r/${a}/${b}" class="link-grid-item">${ia.emoji}${ia.name}띠 × ${ib.emoji}${ib.name}띠</a>`;
        }).join('\n        ')}
      </div>
    </div>
  `;

  return formPageShell({
    accent: '#b0473e',
    emoji: '🤝',
    title: '띠 궁합 보기',
    subtitle: '삼합·육합·충 — 실제 지지 이론으로 보는 두 띠의 궁합',
    formHtml,
    ogUrl: `${SITE_URL}/gunghap`,
    description: '두 띠를 선택하면 삼합·육합·충 등 명리학의 지지 관계 이론으로 궁합을 확인할 수 있어요.',
  });
}

function renderGunghapResult(myKey, partnerKey, relation) {
  const my = TTI_CONTENT[myKey];
  const partner = TTI_CONTENT[partnerKey];
  const rel = TTI_COMPAT_TEXT[relation];
  const shareUrl = `${SITE_URL}/gunghap/r/${myKey}/${partnerKey}`;

  const bodyHtml = `
    <p class="result-desc" style="text-align:center;font-size:1.1rem;margin-bottom:18px;">${my.emoji} ${my.name}띠 × ${partner.emoji} ${partner.name}띠</p>
    <div class="compat-box">
      <p class="result-eyebrow">${rel.label}</p>
      <p class="result-desc">${rel.desc}</p>
    </div>
    <h2 style="font-size:1.02rem;margin:22px 0 8px;">${my.name}띠는</h2>
    <p class="result-desc">${my.desc}</p>
    <h2 style="font-size:1.02rem;margin:22px 0 8px;">${partner.name}띠는</h2>
    <p class="result-desc">${partner.desc}</p>
    <p class="disclaimer" style="text-align:left;margin-top:16px;">이 결과는 명리학의 지지(地支) 관계 이론(삼합·육합·충) 중 두 띠 사이의 기본 관계만 본 참고용 콘텐츠예요. 실제 궁합은 생년월일시 전체를 함께 봐야 훨씬 정확해요 — <a href="/saju">사주팔자 계산기</a>도 확인해보세요.</p>
  `;

  return resultPageShell({
    accent: '#b0473e',
    eyebrow: '띠 궁합 결과',
    emoji: '🤝',
    titleHtml: `${my.name}띠 × ${partner.name}띠 궁합`,
    bodyHtml,
    ogUrl: shareUrl,
    ogTitle: `${my.name}띠 × ${partner.name}띠 궁합은? (${rel.label}) - ${SITE_NAME}`,
    description: `${my.name}띠와 ${partner.name}띠의 궁합: ${rel.label}. ${rel.desc}`,
    backHref: '/gunghap',
    backLabel: '다른 궁합도 보기',
    shareUrl,
    shareText: `${my.name}띠 × ${partner.name}띠 궁합은 ${rel.label}! 🔮`,
  });
}

module.exports = {
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
  formatTodayKorean,
  SITE_NAME,
  SITE_URL,
};
