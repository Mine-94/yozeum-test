const SITE_NAME = '요즘테스트';
const SITE_URL = process.env.SITE_URL || 'https://example.onrender.com'; // 배포 후 실제 도메인으로 교체하세요

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function baseLayout({ title, description, ogUrl, bodyClass, content, themeColor }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${escapeHtml(ogUrl)}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
${themeColor ? `<meta name="theme-color" content="${themeColor}" />` : ''}
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
<link rel="stylesheet" href="/css/style.css" />
</head>
<body class="${bodyClass || ''}">
${content}
<footer class="site-footer">
  <div class="container">
    <p class="disclaimer">본 사이트의 테스트는 재미를 위한 콘텐츠이며 공식 심리검사·의학적 진단이 아닙니다.</p>
    <nav class="footer-nav">
      <a href="/">홈</a>
      <a href="/privacy.html">개인정보처리방침</a>
      <a href="/terms.html">이용약관</a>
    </nav>
  </div>
</footer>
</body>
</html>`;
}

function renderHome(quizzes) {
  const cards = quizzes
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
      <a href="/" class="logo">요즘테스트</a>
      <p class="tagline">요즘 화제인 테스트만 모았어요 — 무료, 회원가입 없이 30초 완성</p>
    </div>
  </header>

  <div class="ad-slot ad-slot-top container">
    <div class="ad-placeholder">광고 영역 (상단)</div>
  </div>

  <main class="container">
    <section class="quiz-grid">
      ${cards}
    </section>

    <div class="ad-slot ad-slot-bottom">
      <div class="ad-placeholder">광고 영역 (하단)</div>
    </div>
  </main>`;

  return baseLayout({
    title: '요즘테스트 - 요즘 화제인 심리테스트·밸런스게임 모음',
    description: '메타센싱, 여행 성향, 성향 변화 체크, 인생 밸런스게임까지. 요즘 SNS에서 화제인 테스트를 한곳에 모았어요.',
    ogUrl: SITE_URL + '/',
    content,
  });
}

function renderQuizPage(quiz) {
  const content = `
  <header class="site-header quiz-header" style="--accent:${quiz.themeColor}">
    <div class="container">
      <a href="/" class="logo">요즘테스트</a>
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
    title: `${quiz.title} - 요즘테스트`,
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
      <a href="/" class="logo">요즘테스트</a>
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
      <p><a href="/">요즘테스트 홈에서 다른 테스트 둘러보기 →</a></p>
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

module.exports = { renderHome, renderQuizPage, renderResultPage, SITE_NAME };
