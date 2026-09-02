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
const OFFICIAL_SITE_URL = 'https://yozeum-test.com';
const configuredSiteUrl = (process.env.SITE_URL || OFFICIAL_SITE_URL).replace(/\/+$/, '');
// Render에 예전 기본 주소가 환경변수로 남아 있어도 canonical·sitemap은 공식 도메인을 사용합니다.
const SITE_URL = configuredSiteUrl === 'https://yozeum-test.onrender.com' ? OFFICIAL_SITE_URL : configuredSiteUrl;
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

function currentYearKST() {
  return Number(getTodayKST().slice(0, 4));
}

function trackedShareUrl(url, campaign = 'result_share') {
  const parsed = new URL(url);
  parsed.searchParams.set('utm_source', 'user_share');
  parsed.searchParams.set('utm_medium', 'referral');
  parsed.searchParams.set('utm_campaign', campaign);
  return parsed.toString();
}

function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function baseLayout({ title, description, ogUrl, canonicalUrl, bodyClass, content, themeColor, structuredData, robots }) {
  const accessibleContent = content.replace(/<main(?![^>]*\bid=)/, '<main id="main-content"');
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
${robots ? `<meta name="robots" content="${escapeHtml(robots)}" />` : ''}
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
<a class="skip-link" href="#main-content">본문으로 바로가기</a>
${accessibleContent}
<footer class="site-footer">
  <div class="container">
    <p class="disclaimer">본 사이트의 사주·운세·테스트 콘텐츠는 재미를 위한 것이며 공식 심리검사·의학적 진단·전문 명리 상담을 대신하지 않습니다.</p>
    <nav class="footer-nav">
      <a href="/">홈</a>
      <a href="/mbti">MBTI</a>
      <a href="/guides">읽을거리</a>
      <a href="/about">사이트 소개</a>
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
    var toolId = form.getAttribute('data-tool-id') || form.getAttribute('action') || window.location.pathname;
    track('tool_submit', {
      tool_id: toolId,
      tool_path: form.getAttribute('action') || window.location.pathname,
    });
    try { window.sessionStorage.setItem('yozeum_pending_tool', toolId); } catch (error) {}
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    if (link.origin !== window.location.origin) {
      track('outbound_click', { link_url: link.href });
      return;
    }
    if (link.hasAttribute('data-content-id')) {
      var rank = Number(link.getAttribute('data-content-rank'));
      track('select_content', {
        content_type: link.getAttribute('data-content-type') || 'internal_content',
        content_id: link.getAttribute('data-content-id'),
        content_placement: link.getAttribute('data-content-placement') || 'unknown',
        content_rank: Number.isFinite(rank) ? rank : 0,
        destination_path: link.pathname,
      });
    }
  });

  try {
    var completedTool = window.sessionStorage.getItem('yozeum_pending_tool');
    if (completedTool) {
      window.sessionStorage.removeItem('yozeum_pending_tool');
      track('tool_complete', { tool_id: completedTool, destination_path: window.location.pathname });
    }
  } catch (error) {}
})();
</script>` : ''}
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js').catch(function () {});
  });
}
</script>
<script src="/js/preferences.js" defer></script>
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

function resultPageShell({ accent, eyebrow, emoji, titleHtml, bodyHtml, ogUrl, ogTitle, description, backHref, backLabel, shareUrl, shareText, extraHtml, structuredData }) {
  const shareLink = shareUrl ? trackedShareUrl(shareUrl) : '';
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
        <button id="copy-link-btn" class="quiz-btn" data-url="${escapeHtml(shareLink)}" data-text="${escapeHtml(shareText || '')}" data-share-id="${escapeHtml(new URL(shareUrl).pathname)}">
          결과 공유하기
        </button>
        <p id="share-status" class="action-status" role="status" aria-live="polite"></p>
      </div>
      <script src="/js/result-share.js"></script>`
          : ''
      }
      <div class="result-actions">
        <a href="${backHref}" class="quiz-btn quiz-btn-outline">${escapeHtml(backLabel)}</a>
      </div>
    </section>


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
    structuredData,
  });
}

// --- 홈 ---
function renderHome(quizzes, fortuneTools, guides) {
  const currentYear = currentYearKST();
  const yearOptions = Array.from({ length: currentYear - 1920 + 1 }, (_, index) => currentYear - index)
    .map((year) => `<option value="${year}">${year}년생</option>`)
    .join('');

  const quickPaths = [
    { href: '/unse', label: '오늘', title: '오늘의 운세', emoji: '☀️', placement: 'home_intent_today' },
    { href: '/mbti/test', label: '나', title: '성격 알아보기', emoji: '🧭', placement: 'home_intent_self' },
    { href: '/mbti/compatibility', label: '우리', title: '관계 비교하기', emoji: '🤝', placement: 'home_intent_together' },
    { href: '/mbti', label: '유형', title: 'MBTI 찾아보기', emoji: '🧩', placement: 'home_intent_types' },
  ]
    .map((item) => `
      <a href="${item.href}" class="quick-path" data-content-id="${item.href}" data-content-type="intent_navigation" data-content-placement="${item.placement}">
        <span class="quick-path-emoji">${item.emoji}</span>
        <span><small>${item.label}</small><strong>${item.title}</strong></span>
      </a>`)
    .join('');

  const fortuneCards = fortuneTools
    .map(
      (t) => `
      <a href="${t.href}" class="quiz-card" style="--accent:${t.themeColor}" data-content-id="${escapeHtml(t.href)}" data-content-type="fortune_tool" data-content-placement="home_fortune">
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
      <a href="/q/${q.id}" class="quiz-card" style="--accent:${q.themeColor}" data-content-id="${escapeHtml(q.id)}" data-content-type="personality_quiz" data-content-placement="home_quiz">
        <div class="quiz-card-badge">${q.emoji}</div>
        <h2>${escapeHtml(q.title)}</h2>
        <p>${escapeHtml(q.subtitle)}</p>
        <span class="quiz-card-cta">테스트 시작하기 →</span>
      </a>`
    )
    .join('\n');

  const guideCards = guides
    .map(
      (guide) => `
      <a href="/guides/${guide.slug}" class="guide-card" data-content-id="${escapeHtml(guide.slug)}" data-content-type="guide" data-content-placement="home_guide">
        <span class="guide-card-label">요즘테스트 가이드</span>
        <h3>${escapeHtml(guide.title)}</h3>
        <p>${escapeHtml(guide.description)}</p>
        <span class="quiz-card-cta">읽어보기 →</span>
      </a>`,
    )
    .join('\n');

  const popularCards = [
    { rank: 1, href: '/unse', emoji: '☀️', title: '오늘의 띠별 운세', text: '오늘의 총운·연애운·재물운을 띠별로 확인해보세요.' },
    { rank: 2, href: '/mbti/test', emoji: '🧭', title: 'MBTI 성격 테스트', text: '20개 문항으로 네 가지 선호 지표를 차근차근 살펴봅니다.' },
    { rank: 3, href: '/mbti', emoji: '🧩', title: 'MBTI 16유형 설명', text: '성격·관계·일·스트레스 반응을 유형별로 자세히 읽어보세요.' },
    { rank: 4, href: '/saju', emoji: '📜', title: '무료 만세력·사주팔자', text: '생년월일로 사주 네 기둥과 오행 분포를 계산합니다.' },
    { rank: 5, href: '/mbti/compatibility', emoji: '🤝', title: 'MBTI 궁합', text: '두 유형의 공통점과 차이를 네 가지 축으로 비교합니다.' },
    { rank: 6, href: '/q/teto-egen', emoji: '⚡', title: '테토·에겐 유형 테스트', text: '행동과 관계에서 드러나는 두 가지 성향을 가볍게 살펴봅니다.' },
  ]
    .map(
      (item) => `
      <a href="${item.href}" class="popular-card" data-priority-rank="${item.rank}" data-content-rank="${item.rank}" data-content-id="${escapeHtml(item.href)}" data-content-type="priority_content" data-content-placement="home_priority">
        <span class="popular-rank">${item.rank}</span>
        <span class="popular-emoji">${item.emoji}</span>
        <span class="popular-copy"><strong>${item.title}</strong><small>${item.text}</small></span>
        <span class="popular-arrow">→</span>
      </a>`,
    )
    .join('\n');

  const content = `
  <header class="site-header home-header">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <p class="home-kicker">오늘의 운세부터 성격과 궁합까지</p>
      <h1 class="home-title">지금 궁금한 나를<br>가볍게 알아보세요</h1>
      <p class="tagline">회원가입 없이 바로 시작할 수 있어요. 결과를 단정하지 않고, 계산 방식과 한계를 함께 알려드립니다.</p>
    </div>
  </header>


  <main class="container">
    <nav class="quick-path-grid" aria-label="관심사별 바로가기">
      ${quickPaths}
    </nav>

    <section class="home-daily-card" aria-labelledby="home-daily-title">
      <div class="home-daily-copy">
        <span class="home-daily-label">매일 새로 확인하기</span>
        <h2 id="home-daily-title">내 띠의 오늘 운세</h2>
        <p>태어난 연도를 고르면 오늘의 총운·애정운·금전운·건강운을 바로 보여드려요.</p>
      </div>
      <form action="/unse/find" method="GET" class="home-daily-form" data-tool-id="daily_fortune" data-save-birth-year>
        <label for="home-birth-year" class="sr-only">태어난 연도</label>
        <select name="year" id="home-birth-year" required>${yearOptions}</select>
        <button type="submit" class="quiz-btn">오늘 운세 보기</button>
      </form>
      <a href="/unse" class="saved-fortune-link" data-saved-fortune hidden>저장한 띠의 오늘 운세 바로 보기 →</a>
      <p class="home-daily-note">1~2월생은 입춘 경계에 따라 띠가 다를 수 있어요. 이 경우 <a href="/saju">사주팔자 계산기</a>에서 확인해주세요.</p>
    </section>

    <section class="content-section popular-section">
      <div class="section-heading-row">
        <h2 class="section-title">먼저 해볼 만한 콘텐츠</h2>
        <span class="section-note">검색 관심도와 이용 목적을 함께 반영했어요</span>
      </div>
      <div class="popular-grid">${popularCards}</div>
    </section>

    <section class="content-section">
      <h2 class="section-title">🔮 사주·운세</h2>
      <div class="quiz-grid">${fortuneCards}</div>
    </section>

    <section class="content-section">
      <h2 class="section-title">🎯 가볍게 해보는 테스트</h2>
      <div class="quiz-grid">${quizCards}</div>
    </section>

    <section class="content-section">
      <h2 class="section-title">📖 결과를 더 잘 이해하는 글</h2>
      <div class="guide-grid">${guideCards}</div>
    </section>

    <section class="info-card editorial-guide">
      <h2>결과는 이렇게 만들어요</h2>
      <p>사주 계산기는 양력 생년월일과 절기 경계를 기준으로 네 기둥과 오행을 계산합니다. 심리테스트는 답변마다 연결된 유형 점수를 합산해 가장 가까운 결과를 보여줍니다.</p>
      <p>운세와 테스트는 가볍게 참고할 콘텐츠입니다. 중요한 결정은 결과 하나에 맡기기보다 현재 상황과 자신의 판단을 함께 살펴보세요.</p>
      <p><a href="/about">계산 방식과 콘텐츠 운영 기준 보기 →</a></p>
    </section>

  </main>`;

  return baseLayout({
    title: '무료 사주팔자·오늘의 운세·MBTI·심리테스트 - 요즘테스트',
    description: '사주팔자 계산, 오늘의 띠별 운세, MBTI 16유형과 궁합, 성격·연애 테스트를 회원가입 없이 무료로 이용하세요.',
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

function renderAboutPage() {
  const aboutUrl = `${SITE_URL}/about`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `사이트 소개 - ${SITE_NAME}`,
      description: '요즘테스트의 사주·운세 계산 방식과 심리테스트 채점 기준, 콘텐츠 운영 원칙을 안내합니다.',
      url: aboutUrl,
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: '사이트 소개', item: aboutUrl },
      ],
    },
  ];

  const content = `
  <header class="site-header">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <h1>요즘테스트는 이렇게 운영합니다</h1>
      <p class="tagline">재미로 시작하되, 계산 방식과 한계는 분명하게 알려드려요</p>
    </div>
  </header>

  <main class="container about-page">
    <section class="info-card">
      <h2>무엇을 제공하나요?</h2>
      <p>요즘테스트는 회원가입 없이 이용할 수 있는 사주·오늘의 운세·띠 궁합·유형 테스트를 한곳에 모은 서비스입니다. 결과를 빨리 보여주는 데서 그치지 않고, 어떤 기준으로 계산했는지 함께 설명하는 것을 원칙으로 삼고 있습니다.</p>
    </section>

    <section class="info-card">
      <h2>사주와 궁합 계산 기준</h2>
      <p>사주팔자는 입력한 양력 생년월일과 출생시간을 바탕으로 년주·월주·일주·시주를 계산합니다. 월주는 입춘 등 절기 경계를 반영하며, 출생시간을 모르면 시주를 제외한 여섯 글자를 보여줍니다.</p>
      <p>띠 궁합은 전통적인 삼합·육합·충 관계를 기준으로 두 띠의 관계를 설명합니다. 오행 개수나 띠 하나만으로 사람의 성격과 미래를 단정할 수 없으므로, 결과는 기본 구조를 이해하는 참고 자료로 봐주세요.</p>
    </section>

    <section class="info-card">
      <h2>오늘의 운세를 만드는 방식</h2>
      <p>오늘의 띠별 운세는 날짜와 띠를 기준으로 같은 날에는 같은 결과가 나오도록 구성합니다. 종합운·연애운·금전운·건강운 문구를 조합해 매일 확인할 수 있게 했으며, 실제 사건을 예측하거나 투자·의료 판단을 대신하지 않습니다.</p>
    </section>

    <section class="info-card">
      <h2>심리테스트 채점 기준</h2>
      <p>각 선택지는 하나의 결과 유형과 연결됩니다. 모든 문항에 답하면 유형별 선택 횟수를 합산하고, 가장 많이 선택된 유형을 결과로 보여줍니다. 동점일 때는 먼저 점수가 쌓인 유형을 우선합니다.</p>
      <p>이 테스트들은 임상심리 검사나 성격 진단 도구가 아닙니다. 정답을 찾기보다 평소 선택 습관을 가볍게 돌아보는 용도로 이용해 주세요.</p>
    </section>

    <section class="info-card">
      <h2>콘텐츠 운영 원칙</h2>
      <ul class="about-principles">
        <li>계산에 필요한 정보만 받고 회원가입을 요구하지 않습니다.</li>
        <li>결과의 계산 방식과 참고 범위를 페이지 안에서 설명합니다.</li>
        <li>검색어를 억지로 반복하지 않고, 실제 이용에 필요한 설명을 우선합니다.</li>
        <li>새 콘텐츠는 문항과 결과 설명을 직접 검토한 뒤 공개합니다.</li>
      </ul>
    </section>
  </main>`;

  return baseLayout({
    title: `사이트 소개·계산 방식 - ${SITE_NAME}`,
    description: '요즘테스트의 사주·운세 계산 방식과 심리테스트 채점 기준, 콘텐츠 운영 원칙을 확인하세요.',
    ogUrl: aboutUrl,
    content,
    structuredData,
  });
}

function renderGuidesHome(guides) {
  const guidesUrl = `${SITE_URL}/guides`;
  const cards = guides
    .map(
      (guide) => `
      <a href="/guides/${guide.slug}" class="guide-card">
        <span class="guide-card-label">읽는 데 약 4분</span>
        <h2>${escapeHtml(guide.title)}</h2>
        <p>${escapeHtml(guide.description)}</p>
        <span class="quiz-card-cta">본문 읽기 →</span>
      </a>`,
    )
    .join('\n');

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `사주·운세·심리테스트 가이드 - ${SITE_NAME}`,
      description: '사주 결과와 오행, 띠 궁합, 심리테스트 결과를 이해하는 데 필요한 기본 내용을 정리했습니다.',
      url: guidesUrl,
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: guides.map((guide, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: guide.title,
          url: `${guidesUrl}/${guide.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: '읽을거리', item: guidesUrl },
      ],
    },
  ];

  const content = `
  <header class="site-header">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <h1>사주·운세·심리테스트 가이드</h1>
      <p class="tagline">결과만 보여드리지 않고, 읽는 방법과 한계까지 설명합니다</p>
    </div>
  </header>

  <main class="container guide-hub">
    <p class="guide-hub-intro">사주표의 한자부터 테스트 일치율까지, 결과 화면에서 생기는 궁금증을 하나씩 풀었습니다. 필요한 글부터 골라 읽어보세요.</p>
    <div class="guide-grid">${cards}</div>
  </main>`;

  return baseLayout({
    title: `사주·운세·심리테스트 가이드 - ${SITE_NAME}`,
    description: '사주팔자와 오행, 띠 궁합, 심리테스트 결과를 제대로 이해하기 위한 읽을거리 모음입니다.',
    ogUrl: guidesUrl,
    content,
    structuredData,
  });
}

function renderGuidePage(guide) {
  const guideUrl = `${SITE_URL}/guides/${guide.slug}`;
  const sectionHtml = guide.sections
    .map(
      (section) => `
      <section class="guide-section">
        <h2>${escapeHtml(section.heading)}</h2>
        ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')}
        ${
          section.bullets
            ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
            : ''
        }
      </section>`,
    )
    .join('\n');

  const relatedHtml = guide.related
    .map((item) => `<a href="${item.href}" class="guide-related-link">${escapeHtml(item.label)} →</a>`)
    .join('\n');

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.description,
      url: guideUrl,
      mainEntityOfPage: guideUrl,
      datePublished: '2026-09-01',
      dateModified: '2026-09-01',
      inLanguage: 'ko-KR',
      author: { '@type': 'Organization', name: `${SITE_NAME} 운영자`, url: `${SITE_URL}/about` },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: '읽을거리', item: `${SITE_URL}/guides` },
        { '@type': 'ListItem', position: 3, name: guide.title, item: guideUrl },
      ],
    },
  ];

  const content = `
  <header class="site-header article-header">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <p class="article-category">요즘테스트 가이드</p>
      <h1>${escapeHtml(guide.title)}</h1>
      <p class="tagline">${escapeHtml(guide.description)}</p>
      <p class="article-meta">요즘테스트 운영자 · 2026년 9월 1일 검토</p>
    </div>
  </header>

  <main class="container article-page">
    <article class="article-card">
      <p class="article-lead">${escapeHtml(guide.summary)}</p>
      ${sectionHtml}
      <aside class="guide-takeaway">
        <strong>핵심만 정리하면</strong>
        <p>${escapeHtml(guide.takeaway)}</p>
      </aside>
    </article>

    <section class="info-card guide-related">
      <h2>이어서 확인하기</h2>
      ${relatedHtml}
    </section>
  </main>`;

  return baseLayout({
    title: `${guide.title} - ${SITE_NAME}`,
    description: guide.description,
    ogUrl: guideUrl,
    content,
    structuredData,
  });
}

// --- MBTI 성격 유형 ---
const MBTI_NOTICE = 'MBTI®는 The Myers-Briggs Company의 상표입니다. 이 페이지는 공식 MBTI 검사나 전문 심리 평가가 아니며, 4가지 선호 지표를 참고한 자기이해용 콘텐츠입니다.';

function mbtiBreadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function renderMbtiHome(types, axisInfo) {
  const pageUrl = `${SITE_URL}/mbti`;
  const typeCards = Object.entries(types)
    .map(
      ([code, type]) => `
      <a href="/mbti/type/${code}" class="mbti-type-card">
        <span class="mbti-code">${code}</span>
        <strong>${escapeHtml(type.name)}</strong>
        <p>${escapeHtml(type.tagline)}</p>
        <span>자세히 보기 →</span>
      </a>`,
    )
    .join('\n');
  const axes = axisInfo
    .map(
      (axis) => `
      <article class="mbti-axis-card">
        <span>${axis.left} ↔ ${axis.right}</span>
        <h3>${escapeHtml(axis.title)}</h3>
        <p>${escapeHtml(axis.description)}</p>
      </article>`,
    )
    .join('\n');

  const content = `
  <header class="site-header mbti-header">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <p class="article-category">성격 유형 가이드</p>
      <h1>MBTI 16유형 성격·연애·직업 설명</h1>
      <p class="tagline">네 글자만 확인하고 끝내지 말고, 내가 편하게 쓰는 방식과 놓치기 쉬운 부분까지 읽어보세요</p>
      <div class="mbti-hero-actions">
        <a href="/mbti/test" class="quiz-btn">20문항 테스트 시작하기</a>
        <a href="/mbti/compatibility" class="quiz-btn quiz-btn-outline">두 유형 궁합 보기</a>
      </div>
    </div>
  </header>

  <main class="container mbti-hub">
    <section class="info-card mbti-intro-card">
      <h2>MBTI 네 글자는 무엇을 뜻하나요?</h2>
      <p>MBTI 유형은 에너지 방향, 정보 인식, 판단 기준, 생활 방식에서 어느 쪽을 상대적으로 편하게 쓰는지 네 글자로 표현합니다. 사람을 네 글자에 가두는 분류가 아니라, 익숙한 반응을 돌아보기 위한 하나의 언어에 가깝습니다.</p>
      <div class="mbti-axis-grid">${axes}</div>
    </section>

    <section class="content-section">
      <h2 class="section-title">16가지 유형 자세히 보기</h2>
      <div class="mbti-type-grid">${typeCards}</div>
    </section>

    <section class="info-card mbti-notice">
      <h2>읽기 전에 확인해주세요</h2>
      <p>${MBTI_NOTICE}</p>
      <p>같은 유형이어도 경험과 환경에 따라 모습은 달라집니다. 유형 설명은 나와 타인을 단정하는 근거보다 대화를 시작하는 질문으로 활용해주세요.</p>
    </section>
  </main>`;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `MBTI 16유형 성격·연애·직업 설명 - ${SITE_NAME}`,
      description: 'MBTI 16가지 유형의 성격, 강점, 관계, 일, 스트레스 반응과 성장 방향을 자세히 설명합니다.',
      url: pageUrl,
      inLanguage: 'ko-KR',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: 16,
        itemListElement: Object.entries(types).map(([code, type], index) => ({
          '@type': 'ListItem', position: index + 1, name: `${code} ${type.name}`, url: `${pageUrl}/type/${code}`,
        })),
      },
    },
    mbtiBreadcrumb([
      { name: '홈', url: `${SITE_URL}/` },
      { name: 'MBTI 16유형', url: pageUrl },
    ]),
  ];

  return baseLayout({
    title: `MBTI 16유형 성격·연애·직업 상세 설명 - ${SITE_NAME}`,
    description: 'MBTI 16가지 유형의 성격과 강점, 연애·관계 방식, 잘 맞는 업무 환경, 스트레스 반응과 성장 방향을 자세히 확인하세요.',
    ogUrl: pageUrl,
    themeColor: '#6657c7',
    content,
    structuredData,
  });
}

function renderMbtiTest(questions, axisInfo) {
  const pageUrl = `${SITE_URL}/mbti/test`;
  const axisList = axisInfo
    .map((axis) => `<li><strong>${axis.left}/${axis.right} ${escapeHtml(axis.title)}</strong> — ${escapeHtml(axis.description)}</li>`)
    .join('');
  const safeQuestions = JSON.stringify(questions).replace(/</g, '\\u003c');
  const content = `
  <header class="site-header quiz-header mbti-header" style="--accent:#6657c7">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <div class="quiz-hero-badge">🧭</div>
      <h1>MBTI 성격 유형 테스트</h1>
      <p class="tagline">일상에서 더 자주 보이는 반응을 골라 네 가지 선호 지표를 살펴보세요</p>
    </div>
  </header>
  <main class="container">
    <section class="tool-card mbti-test-card" style="--accent:#6657c7">
      <div id="mbti-intro">
        <p class="result-eyebrow">총 20개 문항 · 약 3분</p>
        <h2>지금의 나와 가까운 답을 골라주세요</h2>
        <p class="result-desc">되고 싶은 모습보다 평소 자연스럽게 하는 행동을 고르면 결과를 이해하는 데 도움이 됩니다. 정답이나 좋은 유형은 없습니다.</p>
        <button type="button" id="mbti-start" class="quiz-btn">테스트 시작하기</button>
      </div>
      <div id="mbti-play" hidden>
        <div class="mbti-progress-meta"><span id="mbti-count">1 / 20</span><span>한 문항씩 선택</span></div>
        <div class="progress-track"><div id="mbti-progress" class="progress-fill"></div></div>
        <h2 id="mbti-question" class="mbti-question"></h2>
        <div class="mbti-answer-grid">
          <button type="button" id="mbti-left" class="answer-btn"></button>
          <button type="button" id="mbti-right" class="answer-btn"></button>
        </div>
      </div>
    </section>
    <section class="info-card mbti-test-guide">
      <h2>결과는 이렇게 계산합니다</h2>
      <p>각 축마다 5개 질문을 두고 선택한 횟수가 많은 글자를 결과에 반영합니다. 네 축을 합치면 ISTJ, ENFP처럼 하나의 유형이 됩니다.</p>
      <ul>${axisList}</ul>
      <p class="disclaimer">${MBTI_NOTICE}</p>
    </section>
  </main>
  <script>window.__MBTI_QUESTIONS__=${safeQuestions};</script>
  <script src="/js/mbti-test.js"></script>`;

  const structuredData = [
    {
      '@context': 'https://schema.org', '@type': 'WebPage', name: `MBTI 성격 유형 테스트 - ${SITE_NAME}`,
      description: '20개 문항으로 네 가지 MBTI 선호 지표를 살펴보는 무료 자기이해용 테스트입니다.', url: pageUrl, inLanguage: 'ko-KR',
    },
    mbtiBreadcrumb([
      { name: '홈', url: `${SITE_URL}/` }, { name: 'MBTI 16유형', url: `${SITE_URL}/mbti` }, { name: 'MBTI 테스트', url: pageUrl },
    ]),
  ];
  return baseLayout({
    title: `무료 MBTI 성격 유형 테스트 20문항 - ${SITE_NAME}`,
    description: '일상 행동을 묻는 20개 문항으로 E/I, S/N, T/F, J/P 선호를 확인하고 16가지 MBTI 유형 설명까지 읽어보세요.',
    ogUrl: pageUrl, themeColor: '#6657c7', content, structuredData,
  });
}

function renderMbtiType(typeCode, type, breakdown) {
  const pageUrl = `${SITE_URL}/mbti/type/${typeCode}`;
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  const breakdownHtml = breakdown
    ? `<section class="mbti-breakdown">
        <h2>내 선택 비율</h2>
        <p>각 축의 5개 답변을 백분율로 바꾼 값입니다. 수치가 비슷하면 상황에 따라 양쪽 특성을 모두 사용할 수 있어요.</p>
        ${breakdown.map((axis) => `
          <div class="mbti-bar-row">
            <div class="mbti-bar-labels"><strong>${axis.left} ${axis.leftValue}%</strong><span>${escapeHtml(axis.title)}</span><strong>${axis.rightValue}% ${axis.right}</strong></div>
            <div class="mbti-bar"><span style="width:${axis.leftValue}%"></span></div>
          </div>`).join('')}
      </section>`
    : '';
  const content = `
  <header class="site-header mbti-header">
    <div class="container">
      <a href="/" class="logo">${SITE_NAME}</a>
      <p class="article-category">MBTI 16유형</p>
      <p class="mbti-type-hero-code">${typeCode}</p>
      <h1>${typeCode} ${escapeHtml(type.name)}</h1>
      <p class="tagline">${escapeHtml(type.tagline)}</p>
    </div>
  </header>
  <main class="container mbti-type-page">
    <article class="article-card">
      <p class="article-lead">${escapeHtml(type.summary)}</p>
      ${breakdownHtml}
      <div class="mbti-detail-grid">
        <section><h2>잘하는 것</h2>${list(type.strengths)}</section>
        <section><h2>놓치기 쉬운 부분</h2>${list(type.blindSpots)}</section>
      </div>
      <section class="guide-section"><h2>연애와 인간관계</h2><p>${escapeHtml(type.relationships)}</p></section>
      <section class="guide-section"><h2>일할 때 강점과 어울리는 환경</h2><p>${escapeHtml(type.work)}</p></section>
      <section class="guide-section"><h2>스트레스를 받을 때</h2><p>${escapeHtml(type.stress)}</p></section>
      <aside class="guide-takeaway"><strong>성장을 위한 한 가지 제안</strong><p>${escapeHtml(type.growth)}</p></aside>
    </article>
    <section class="info-card mbti-next-actions">
      <h2>이어서 살펴보기</h2>
      <a href="/mbti/compatibility?first=${typeCode}">이 유형과 다른 유형의 궁합 비교하기 →</a>
      <a href="/mbti/test">20문항 테스트 다시 해보기 →</a>
      <a href="/mbti">16유형 전체 보기 →</a>
    </section>
    <section class="info-card mbti-notice"><h2>유형보다 사람이 먼저입니다</h2><p>${MBTI_NOTICE}</p><p>유형은 선호 경향을 설명할 뿐 능력, 성숙도, 관계의 성공 여부를 결정하지 않습니다.</p></section>
  </main>`;
  const structuredData = [
    {
      '@context': 'https://schema.org', '@type': 'Article', headline: `${typeCode} ${type.name}: 성격·연애·직업 상세 설명`,
      description: type.summary, url: pageUrl, mainEntityOfPage: pageUrl, inLanguage: 'ko-KR',
      datePublished: '2026-09-01', dateModified: '2026-09-01',
      author: { '@type': 'Organization', name: `${SITE_NAME} 운영자`, url: `${SITE_URL}/about` },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    mbtiBreadcrumb([
      { name: '홈', url: `${SITE_URL}/` }, { name: 'MBTI 16유형', url: `${SITE_URL}/mbti` }, { name: typeCode, url: pageUrl },
    ]),
  ];
  return baseLayout({
    title: `${typeCode} 특징·연애·직업·장단점 상세 설명 - ${SITE_NAME}`,
    description: `${typeCode} ${type.name}의 성격 특징, 강점과 약점, 연애·인간관계, 잘 맞는 업무 환경, 스트레스 반응과 성장 방향을 자세히 설명합니다.`,
    ogUrl: pageUrl, themeColor: '#6657c7', content, structuredData,
  });
}

function renderMbtiCompatibilityForm(types, prefillFirst) {
  const pageUrl = `${SITE_URL}/mbti/compatibility`;
  const options = (selected) => Object.entries(types)
    .map(([code, type]) => `<option value="${code}"${selected === code ? ' selected' : ''}>${code} · ${escapeHtml(type.name)}</option>`)
    .join('');
  const formHtml = `
    <form action="/mbti/compatibility/result" method="GET" data-tool-id="mbti_compatibility">
      <div class="mbti-compare-selects">
        <label for="mbti-first">첫 번째 유형<select id="mbti-first" name="first" required><option value="">유형 선택</option>${options(prefillFirst)}</select></label>
        <span class="mbti-compare-mark">×</span>
        <label for="mbti-second">두 번째 유형<select id="mbti-second" name="second" required><option value="">유형 선택</option>${options()}</select></label>
      </div>
      <button type="submit" class="quiz-btn">두 유형 비교하기</button>
    </form>
    <div class="friend-invite">
      <strong>친구 유형을 아직 모른다면</strong>
      <p>내 유형만 고른 뒤 초대 링크를 보내세요. 친구가 자신의 유형을 선택하면 바로 비교할 수 있어요.</p>
      <button type="button" id="mbti-invite-btn" class="quiz-btn quiz-btn-outline" data-base-url="${pageUrl}" disabled>내 유형을 담아 초대하기</button>
      <p id="invite-status" class="action-status" role="status" aria-live="polite"></p>
    </div>
    <script src="/js/compat-invite.js"></script>`;
  const extraHtml = `
    <section class="info-card mbti-compat-guide">
      <h2>MBTI 궁합은 어떻게 보나요?</h2>
      <p>좋고 나쁜 조합을 단정하는 대신 네 가지 축에서 대화 방식이 어디서 편하고, 어디서 엇갈릴 수 있는지 비교합니다. 같은 글자는 익숙함을, 다른 글자는 새로운 관점을 줄 수 있습니다.</p>
      <p>관계의 만족도는 유형보다 의사소통, 경험, 가치관, 갈등을 다루는 방식의 영향을 더 많이 받습니다. 결과는 상대를 판단하는 점수가 아니라 대화할 주제를 찾는 데 활용해주세요.</p>
      <p class="disclaimer">${MBTI_NOTICE}</p>
    </section>`;
  const structuredData = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: `MBTI 궁합 비교 - ${SITE_NAME}`, description: '두 MBTI 유형의 공통점과 차이를 네 가지 선호 지표로 비교합니다.', url: pageUrl, inLanguage: 'ko-KR' },
    mbtiBreadcrumb([{ name: '홈', url: `${SITE_URL}/` }, { name: 'MBTI 16유형', url: `${SITE_URL}/mbti` }, { name: 'MBTI 궁합', url: pageUrl }]),
  ];
  return formPageShell({
    accent: '#6657c7', emoji: '🤝', title: 'MBTI 궁합 비교', subtitle: '두 유형의 공통점과 차이를 네 가지 축으로 살펴보세요',
    formHtml, ogUrl: pageUrl, description: '두 MBTI 유형을 선택하면 E/I, S/N, T/F, J/P 축별 관계 방식과 대화 포인트를 비교해드립니다.',
    structuredData, extraHtml,
  });
}

function mbtiAxisComparison(firstCode, secondCode) {
  const definitions = [
    { index: 0, title: '에너지와 대화 속도', same: { E: '둘 다 사람과 활동 속에서 생각이 또렷해지는 편이라 대화와 약속이 자연스럽습니다. 다만 쉬지 않고 일정을 채우면 함께 지칠 수 있어요.', I: '둘 다 혼자 정리할 시간을 존중해 편안합니다. 속마음을 미루지 않도록 중요한 이야기는 시간을 정해 꺼내는 편이 좋습니다.' }, mixed: '한 사람은 대화하며 풀고, 다른 사람은 혼자 정리한 뒤 말하기 쉽습니다. 바로 답을 요구하지 말고 다시 이야기할 시간을 합의해보세요.' },
    { index: 1, title: '정보를 이해하는 방식', same: { S: '구체적인 사실과 현실 조건을 함께 확인해 실용적인 결정을 내리기 쉽습니다. 장기적인 가능성도 가끔 질문하면 선택의 폭이 넓어집니다.', N: '아이디어와 의미를 주고받는 대화가 잘 이어집니다. 기대가 커질수록 일정과 비용 같은 현실 조건을 함께 적어보는 것이 좋습니다.' }, mixed: '한 사람은 구체적인 사실을, 다른 사람은 전체 의미와 가능성을 먼저 봅니다. 예시와 큰 그림을 한 번씩 번갈아 설명하면 오해가 줄어듭니다.' },
    { index: 2, title: '판단과 갈등 해결', same: { T: '문제를 논리적으로 정리하고 해결책을 찾는 속도가 비슷합니다. 맞는 결론을 찾기 전에 서로 어떤 기분인지도 확인해주세요.', F: '서로의 감정과 관계에 미칠 영향을 세심하게 살핍니다. 불편함을 피하려고 기준과 결론을 흐리지 않는 것이 중요합니다.' }, mixed: '한 사람은 기준과 해결책을, 다른 사람은 감정과 영향을 먼저 살핍니다. 공감이 필요한지 해결이 필요한지 먼저 묻는 것만으로 대화가 훨씬 편해집니다.' },
    { index: 3, title: '계획과 생활 리듬', same: { J: '일정과 약속을 미리 정하는 편이라 함께 움직이기 수월합니다. 계획이 바뀔 여지도 조금 남겨두면 부담을 줄일 수 있어요.', P: '상황에 맞춰 즉흥적으로 움직이는 리듬이 잘 맞습니다. 돈·시간·마감처럼 꼭 지켜야 하는 약속만큼은 미리 정해두세요.' }, mixed: '한 사람은 정해진 계획에서, 다른 사람은 열려 있는 선택지에서 편안함을 느낍니다. 반드시 정할 부분과 현장에서 정할 부분을 나눠보세요.' },
  ];
  return definitions.map((item) => {
    const first = firstCode[item.index];
    const second = secondCode[item.index];
    return { title: item.title, first, second, same: first === second, text: first === second ? item.same[first] : item.mixed };
  });
}

function renderMbtiCompatibilityResult(firstCode, first, secondCode, second) {
  const pageUrl = `${SITE_URL}/mbti/compatibility/${firstCode}/${secondCode}`;
  const comparisons = mbtiAxisComparison(firstCode, secondCode);
  const sameCount = comparisons.filter((item) => item.same).length;
  const labels = ['정반대의 시선이 만나는 조합', '서로 다른 방식이 선명한 조합', '공통점과 차이가 균형 잡힌 조합', '편안한 공통점이 많은 조합', '매우 비슷한 리듬'];
  const rows = comparisons.map((item) => `
    <article class="mbti-compat-row">
      <div class="mbti-compat-axis"><span>${item.first}</span><strong>${escapeHtml(item.title)}</strong><span>${item.second}</span></div>
      <p>${escapeHtml(item.text)}</p>
      <small>${item.same ? '같은 선호' : '다른 선호'}</small>
    </article>`).join('');
  const bodyHtml = `
    <p class="result-desc" style="text-align:center;font-size:1.05rem;">${escapeHtml(first.name)} × ${escapeHtml(second.name)}</p>
    <div class="compat-box mbti-compat-summary"><p class="result-eyebrow">네 축 중 ${sameCount}개가 같은 조합</p><h2>${labels[sameCount]}</h2><p>같은 글자가 많다고 더 좋은 궁합은 아닙니다. 편한 부분과 조율이 필요한 부분을 구분해보세요.</p></div>
    <div class="mbti-compat-rows">${rows}</div>
    <p class="disclaimer" style="text-align:left;margin-top:18px;">이 결과는 관계의 성공 가능성을 예측하거나 점수화하지 않습니다. 실제 관계는 대화 습관, 가치관, 경험과 서로를 존중하는 태도에 따라 달라집니다.</p>`;
  const structuredData = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: `${firstCode}와 ${secondCode} MBTI 궁합`, description: `${firstCode}와 ${secondCode}의 공통점과 차이를 네 가지 선호 지표로 비교한 자기이해용 콘텐츠입니다.`, url: pageUrl, inLanguage: 'ko-KR' },
    mbtiBreadcrumb([{ name: '홈', url: `${SITE_URL}/` }, { name: 'MBTI 궁합', url: `${SITE_URL}/mbti/compatibility` }, { name: `${firstCode} × ${secondCode}`, url: pageUrl }]),
  ];
  return resultPageShell({
    accent: '#6657c7', eyebrow: 'MBTI 궁합 비교', emoji: '🤝', titleHtml: `${firstCode} × ${secondCode}`,
    bodyHtml, ogUrl: pageUrl, ogTitle: `${firstCode} ${secondCode} MBTI 궁합·관계 특징 - ${SITE_NAME}`,
    description: `${firstCode}와 ${secondCode}의 대화, 정보 이해, 갈등 해결, 생활 리듬을 네 가지 MBTI 축으로 비교합니다.`,
    backHref: '/mbti/compatibility', backLabel: '다른 유형 비교하기', shareUrl: pageUrl,
    shareText: `${firstCode}와 ${secondCode}의 MBTI 관계 특징을 함께 살펴봐요.`, structuredData,
  });
}

// 각 테스트가 무엇을 보고 어떻게 읽어야 하는지 별도로 설명합니다.
// 문항과 결과만 있는 얇은 화면을 피하고, 사용자가 결과를 오해하지 않도록 테스트별 한계를 함께 밝힙니다.
const QUIZ_EDITORIAL = {
  'meta-sensing': {
    focus: '감정이 생긴 순간을 알아차리는지, 원인을 말로 정리하는지, 표현하거나 혼자 삭이는지, 다시 균형을 찾을 때 어떤 행동을 택하는지를 함께 봅니다. 감정이 크고 작다는 기준보다 자신에게 익숙한 처리 방식을 찾는 데 초점을 맞췄어요.',
    reading: '가장 많이 선택한 유형은 최근의 주된 반응을 보여줄 뿐, 감정 조절 능력의 높고 낮음을 평가하지 않습니다. 결과에서 낯익은 장면 하나를 골라 “다음에는 어떻게 반응하고 싶은가”까지 생각해보면 더 유용합니다.',
  },
  'long-flight': {
    focus: '준비와 즉흥성, 이동 중 회복 방식, 낯선 사람과의 거리, 일정이 틀어졌을 때의 대응을 장거리 비행이라는 한정된 상황에 담았습니다. 여행 계획을 세울 때 무엇을 먼저 챙기는지 돌아보기 위한 테스트예요.',
    reading: '비행 경험, 동행자, 컨디션에 따라 답은 달라질 수 있습니다. 결과를 고정된 여행 성격으로 보기보다 다음 여행에서 필요한 준비물과 일정 밀도를 조절하는 참고로 활용해주세요.',
  },
  'vibe-shift': {
    focus: '최근의 약속, 스트레스 해소, SNS 사용, 주말과 인간관계가 예전과 어떻게 달라졌는지를 묻습니다. 성격 자체가 바뀌었는지 단정하기보다 지금의 생활 리듬이 어느 방향으로 움직이는지 살펴봅니다.',
    reading: '최근 몇 주간 큰 일정이나 환경 변화가 있었다면 그 영향이 결과에 크게 반영될 수 있습니다. 세 달쯤 뒤 다시 해보고 같은 선택이 이어지는지 비교하면 일시적인 변화와 새로운 습관을 구분하기 쉬워요.',
  },
  'balance-game': {
    focus: '일, 소비, 여행, 관계와 생활 습관에서 익숙하고 예측 가능한 선택과 새롭고 불확실한 선택 중 어디에 더 자주 마음이 가는지 20개 장면으로 비교합니다. 정답을 찾기보다 망설임 끝에 남는 쪽을 고르는 방식입니다.',
    reading: '두 선택지만 제시하는 밸런스게임은 실제 삶의 다양한 조건을 단순하게 줄여 보여줍니다. 안정추구형과 도전추구형 중 어느 쪽이 더 낫다는 의미는 아니며, 중요한 결정을 대신하는 결과로 사용해서는 안 됩니다.',
  },
  'past-life': {
    focus: '정보를 모으는 방식, 사람 사이에서 맡는 역할, 갈등을 푸는 방법과 중요하게 여기는 가치를 옛이야기 속 네 역할에 빗대어 보여줍니다. 현재의 선택 성향을 조금 다른 언어로 바라보는 창작형 놀이입니다.',
    reading: '결과는 실제 전생이나 초자연적 사실을 판정하지 않습니다. 책사·거상·예인·도인은 선택의 특징을 기억하기 쉽게 만든 비유이며, 마음에 맞는 장점과 보완점을 가볍게 골라 읽으면 충분해요.',
  },
  'love-style': {
    focus: '호감 표현, 연락 속도, 데이트 준비, 갈등 이후의 대화, 배려와 개인 공간을 다루는 방식을 살펴봅니다. 연애를 잘하고 못한다는 평가가 아니라 관계에서 반복하기 쉬운 행동을 발견하는 데 목적이 있습니다.',
    reading: '상대와 관계의 단계에 따라 누구나 다른 모습을 보일 수 있습니다. 결과가 현재 관계와 맞지 않는다면 유형에 상대를 끼워 맞추기보다 서로 편한 연락 빈도와 갈등 해결 방식을 대화해보세요.',
  },
  'teto-egen': {
    focus: '온라인에서 쓰이는 ‘테토·에겐’ 표현을 행동의 주도성, 감정 표현, 관계 속 속도와 분위기라는 일상적인 선택으로 풀었습니다. 성별이나 외모를 판정하지 않고 두 경향 중 최근 어느 쪽이 더 익숙한지만 살펴봅니다.',
    reading: '테토와 에겐은 학술적인 성격 분류나 의학적 개념이 아닙니다. 상황에 따라 두 모습이 함께 나타날 수 있으므로 결과를 정체성이나 능력의 기준으로 삼지 말고, 재미있는 대화 소재로만 활용해주세요.',
  },
};

// --- 트렌드 테스트 ---
function renderQuizPage(quiz) {
  const quizUrl = `${SITE_URL}/q/${quiz.id}`;
  const editorial = QUIZ_EDITORIAL[quiz.id];
  const editorialHtml = editorial
    ? `<section class="info-card quiz-editorial">
        <h2>이 테스트는 무엇을 살펴보나요?</h2>
        <p>${escapeHtml(editorial.focus)}</p>
        <h2>결과는 이렇게 읽어주세요</h2>
        <p>${escapeHtml(editorial.reading)}</p>
      </section>`
    : '';
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${quiz.title} - ${SITE_NAME}`,
      description: quiz.subtitle,
      url: quizUrl,
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: quiz.title, item: quizUrl },
      ],
    },
  ];

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
        <div class="quiz-guide">
          <strong>이 테스트는 이렇게 진행돼요</strong>
          <ul>
            <li>총 ${quiz.questions.length}개 문항에 차례로 답합니다.</li>
            <li>선택할 때마다 해당 답변과 연결된 유형에 1점이 더해집니다.</li>
            <li>마지막에 점수가 가장 높은 유형과 전체 문항 대비 일치율을 보여드립니다.</li>
          </ul>
          <p>재미와 자기 이해를 위한 콘텐츠로, 공식 심리검사나 의학적 진단은 아닙니다.</p>
        </div>
        <details class="quiz-result-guide">
          <summary>어떤 결과 유형이 있나요?</summary>
          <div class="result-type-list">
            ${Object.values(quiz.results)
              .map(
                (result) => `<article>
              <h3>${result.emoji} ${escapeHtml(result.title)}</h3>
              <p>${escapeHtml(result.desc)}</p>
            </article>`,
              )
              .join('')}
          </div>
        </details>
        <button id="start-btn" class="quiz-btn">테스트 시작하기</button>
      </div>

      <div id="quiz-play" hidden>
        <div class="quiz-progress"><div class="quiz-progress-bar" id="progress-bar"></div></div>
        <p class="quiz-question-count" id="question-count"></p>
        <h2 id="question-text"></h2>
        <div id="options-list" class="quiz-options"></div>
      </div>
    </section>

    ${editorialHtml}

  </main>

  <script>window.__QUIZ__ = ${JSON.stringify(quiz)};</script>
  <script src="/js/quiz-app.js"></script>
  `;

  return baseLayout({
    title: `${quiz.title} - ${SITE_NAME}`,
    description: quiz.subtitle,
    ogUrl: quizUrl,
    themeColor: quiz.themeColor,
    content,
    structuredData,
  });
}

function renderResultPage(quiz, resultKey, matchScore) {
  const result = quiz.results[resultKey];
  const shareUrl = `${SITE_URL}/q/${quiz.id}/r/${resultKey}`;
  const shareLink = trackedShareUrl(shareUrl);
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `나의 결과는 "${result.title}" - ${quiz.title}`,
      description: result.shareText,
      url: shareUrl,
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: quiz.title, item: `${SITE_URL}/q/${quiz.id}` },
        { '@type': 'ListItem', position: 3, name: result.title, item: shareUrl },
      ],
    },
  ];
  const scoreHtml = Number.isInteger(matchScore)
    ? `
      <div class="compat-box" style="text-align:center;">
        <p class="result-eyebrow">나의 "${escapeHtml(result.title)}" 일치율</p>
        <p style="font-size:2.2rem;font-weight:800;color:${quiz.themeColor};margin:4px 0;">${matchScore}%</p>
      </div>`
    : '';

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
      ${scoreHtml}

      <details class="result-guide">
        <summary>이 결과는 어떻게 정해졌나요?</summary>
        <p>총 ${quiz.questions.length}개 답변에 연결된 유형별 점수를 합산했습니다. 그중 가장 많이 선택된 유형이 <strong>${escapeHtml(result.title)}</strong>이었습니다. 일치율은 이 유형을 고른 횟수를 전체 문항 수로 나눈 값입니다.</p>
        <p>선택이 비슷하게 나왔다면 다른 유형의 특징도 함께 있을 수 있어요. 결과는 가벼운 자기 이해용으로 봐주세요.</p>
      </details>

      <div class="result-actions">
        <button id="copy-link-btn" class="quiz-btn" data-url="${escapeHtml(shareLink)}" data-text="${escapeHtml(result.shareText)}" data-share-id="/q/${escapeHtml(quiz.id)}/r/${escapeHtml(resultKey)}">
          결과 공유하기
        </button>
        <a href="/q/${quiz.id}" class="quiz-btn quiz-btn-outline">다시 테스트하기</a>
      </div>
      <p id="share-status" class="action-status" role="status" aria-live="polite"></p>
    </section>


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
    structuredData,
  });
}

// --- 사주팔자 계산기 ---
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => h);

function renderSajuForm({ error } = {}) {
  const yearOptions = [];
  for (let y = currentYearKST(); y >= 1920; y -= 1) yearOptions.push(y);

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
    <form action="/saju/compute" method="GET" data-tool-id="saju">
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
  const pageTitle = `${year}년 ${month}월 ${day}일생 사주팔자 — 일간 ${dayStemKo}(${stemInfo.symbol})`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageTitle,
      description: `${year}년 ${month}월 ${day}일생 사주팔자 — 일간 ${dayStemKo}, ${stemInfo.symbol}. 오행 분포와 간이 풀이를 확인해보세요.`,
      url: shareUrl,
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: '사주팔자 계산기', item: `${SITE_URL}/saju` },
        { '@type': 'ListItem', position: 3, name: pageTitle, item: shareUrl },
      ],
    },
  ];

  return resultPageShell({
    accent: '#5b4b8a',
    eyebrow: '사주팔자 계산 결과',
    emoji: '🔮',
    titleHtml: '나의 사주팔자',
    bodyHtml,
    ogUrl: shareUrl,
    ogTitle: `${pageTitle} - ${SITE_NAME}`,
    description: `${year}년 ${month}월 ${day}일생 사주팔자 — 일간 ${dayStemKo}, ${stemInfo.symbol}. 오행 분포와 간이 풀이를 확인해보세요.`,
    backHref: '/saju',
    backLabel: '다시 계산하기',
    shareUrl,
    shareText: `나의 사주 일간은 ${dayStemKo}(${stemInfo.symbol})! 오행 분포까지 확인해보세요 🔮`,
    structuredData,
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

  const pageTitle = `${ko}${el} 성격 — 일간 ${ko}일간이란?`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageTitle,
      description: `일간 ${ko}(${el}) 성격 해설. ${stemInfo.symbol} — ${stemInfo.desc}`,
      url: pageUrl,
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: '사주팔자 계산기', item: `${SITE_URL}/saju` },
        { '@type': 'ListItem', position: 3, name: `${ko}일간 성격`, item: pageUrl },
      ],
    },
  ];

  return resultPageShell({
    accent: ILGAN_ACCENT,
    eyebrow: '일간(日干) 성격',
    emoji: '🔮',
    titleHtml: `${ko}일간(${ko}${el}) 성격`,
    bodyHtml,
    ogUrl: pageUrl,
    ogTitle: `${pageTitle} - ${SITE_NAME}`,
    description: `일간 ${ko}(${el}) 성격 해설. ${stemInfo.symbol} — ${stemInfo.desc}`,
    backHref: '/saju',
    backLabel: '내 사주팔자 계산하기',
    structuredData,
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
  const currentYear = currentYearKST();

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
      <form action="/unse/find" method="GET" data-tool-id="daily_fortune" data-save-birth-year style="display:flex;gap:8px;">
        <label for="unse-birth-year" class="sr-only">태어난 연도</label>
        <select id="unse-birth-year" name="year" style="flex:1;padding:12px;border-radius:10px;border:1.5px solid var(--border);font-size:0.95rem;">
          ${Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i)
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


    ${findFormHtml}
  </main>`;

  return baseLayout({
    title: `${todayShort} 오늘의 띠별 운세 무료 - ${SITE_NAME}`,
    description: `${todayShort} 오늘의 띠별 운세 무료로 확인하세요. ${todayKo} 기준 12띠 총운·애정운·금전운·건강운을 확인해보세요.`,
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
    <section class="info-card fortune-reading-guide">
      <h2>오늘 운세를 생활에 적용한다면</h2>
      <p>${escapeHtml(info.dailyFocus)}</p>
      <p>네 가지 운세 가운데 지금 상황과 가까운 문장만 골라 가볍게 참고해보세요. 맞지 않는 해석까지 억지로 적용할 필요는 없습니다.</p>
    </section>
    <div class="save-preference-panel">
      <button type="button" class="save-preference-btn" data-save-zodiac="${animalKey}">${info.name}띠로 저장하기</button>
      <p class="action-status" data-save-status role="status" aria-live="polite">저장하면 다음 방문부터 오늘 운세로 더 빠르게 이동할 수 있어요.</p>
    </div>
    <p class="result-desc" style="margin-top:16px;"><a href="/gunghap?my=${animalKey}">${info.name}띠 궁합 확인하러 가기 →</a></p>
    <p class="disclaimer" style="text-align:left;margin-top:16px;">오늘의 운세는 날짜별로 자동 생성되는 재미 콘텐츠이며 실제 운세를 예측·보장하지 않아요.</p>
  `;

  const pageTitle = `${todayShort} ${info.name}띠 오늘의 운세`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageTitle,
      description: `${todayShort} ${info.name}띠 오늘의 운세 — ${lines['총운']}`,
      url: shareUrl,
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: '오늘의 띠별 운세', item: `${SITE_URL}/unse` },
        { '@type': 'ListItem', position: 3, name: `${info.name}띠`, item: shareUrl },
      ],
    },
  ];

  return resultPageShell({
    accent: '#c9622a',
    eyebrow: '오늘의 띠별 운세',
    emoji: info.emoji,
    titleHtml: `${info.name}띠, 오늘의 운세`,
    bodyHtml,
    ogUrl: shareUrl,
    ogTitle: `${pageTitle} - ${SITE_NAME}`,
    description: `${todayShort} ${info.name}띠 오늘의 운세 — ${lines['총운']}`,
    backHref: '/unse',
    backLabel: '다른 띠 운세도 보기',
    shareUrl,
    shareText: `오늘 ${info.name}띠 운세: ${lines['총운']}`,
    structuredData,
  });
}

// --- 띠 궁합 ---
// 조합 결과는 색인하지 않고, 폼에서는 사용자가 바로 비교해볼 대표 예시만 보여줍니다.
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
    <form action="/gunghap/compute" method="GET" data-tool-id="zodiac_compatibility">
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

  const extraHtml = `
    <section class="info-card">
      <h2>띠 궁합은 어떻게 계산하나요?</h2>
      <p>두 사람의 띠를 십이지 순서로 바꾼 뒤, 전통 명리학에서 함께 묶어 보는 삼합·육합과 서로 마주 보는 충 관계에 해당하는지 확인합니다. 같은 띠는 별도로 표시하고, 어느 관계에도 해당하지 않으면 평범한 관계로 설명합니다.</p>
      <p>이 도구는 임의의 퍼센트를 만들거나 두 사람의 관계를 좋고 나쁨으로 순위 매기지 않습니다. 띠 하나만으로는 태어난 날짜와 시간, 각자의 경험과 대화 방식을 알 수 없기 때문이에요.</p>
      <h2>결과를 활용하는 방법</h2>
      <p>편한 점과 부딪히기 쉬운 점을 대화의 출발점으로만 사용해주세요. 특히 1~2월생은 입춘 전후에 따라 일반적인 출생연도 기준 띠와 사주에서 사용하는 띠가 달라질 수 있으므로, 정확한 확인이 필요하면 사주팔자 계산기를 이용하는 편이 좋습니다.</p>
      <p class="disclaimer">명리학의 상징 체계를 설명하는 재미 콘텐츠이며 관계의 성공, 결혼 생활 또는 미래를 예측하지 않습니다.</p>
    </section>`;

  return formPageShell({
    accent: '#b0473e',
    emoji: '🤝',
    title: '무료 띠 궁합 보기',
    subtitle: '삼합·육합·충 — 실제 지지 이론으로 보는 두 띠의 궁합',
    formHtml,
    ogUrl: `${SITE_URL}/gunghap`,
    description: '무료로 두 띠를 선택하면 삼합·육합·충 등 명리학의 지지 관계 이론으로 궁합을 확인할 수 있어요.',
    extraHtml,
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

  const pageTitle = `${my.name}띠 × ${partner.name}띠 궁합은? (${rel.label})`;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageTitle,
      description: `${my.name}띠와 ${partner.name}띠의 궁합: ${rel.label}. ${rel.desc}`,
      url: shareUrl,
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: '띠 궁합', item: `${SITE_URL}/gunghap` },
        { '@type': 'ListItem', position: 3, name: `${my.name}띠 × ${partner.name}띠`, item: shareUrl },
      ],
    },
  ];

  return resultPageShell({
    accent: '#b0473e',
    eyebrow: '띠 궁합 결과',
    emoji: '🤝',
    titleHtml: `${my.name}띠 × ${partner.name}띠 궁합`,
    bodyHtml,
    ogUrl: shareUrl,
    ogTitle: `${pageTitle} - ${SITE_NAME}`,
    description: `${my.name}띠와 ${partner.name}띠의 궁합: ${rel.label}. ${rel.desc}`,
    backHref: '/gunghap',
    backLabel: '다른 궁합도 보기',
    shareUrl,
    shareText: `${my.name}띠 × ${partner.name}띠 궁합은 ${rel.label}! 🔮`,
    structuredData,
  });
}

function renderNotFound() {
  const pageUrl = `${SITE_URL}/404`;
  const content = `
  <header class="site-header">
    <div class="container"><a href="/" class="logo">${SITE_NAME}</a></div>
  </header>
  <main class="container not-found-page">
    <section class="info-card">
      <p class="result-eyebrow">404</p>
      <h1>페이지를 찾을 수 없어요</h1>
      <p>주소가 바뀌었거나 입력이 잘못된 것 같아요. 아래에서 원하는 콘텐츠를 다시 선택해주세요.</p>
      <div class="not-found-links">
        <a class="quiz-btn" href="/">홈으로 돌아가기</a>
        <a class="quiz-btn quiz-btn-outline" href="/mbti/test">MBTI 테스트</a>
        <a class="quiz-btn quiz-btn-outline" href="/unse">오늘의 운세</a>
      </div>
    </section>
  </main>`;
  return baseLayout({
    title: `페이지를 찾을 수 없습니다 - ${SITE_NAME}`,
    description: '요청한 페이지를 찾을 수 없습니다. 요즘테스트 홈에서 운세, MBTI, 성격 테스트를 다시 찾아보세요.',
    ogUrl: pageUrl,
    canonicalUrl: pageUrl,
    robots: 'noindex, follow',
    content,
  });
}

module.exports = {
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
  formatTodayKorean,
  SITE_NAME,
  SITE_URL,
};
