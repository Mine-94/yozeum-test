// 사주팔자 / 띠 / 오늘의 운세 계산 로직
// lunar-javascript(6tail)를 사용해 절기(입춘) 경계를 정확히 반영한 정식 사주 계산을 수행합니다.
// (일본판 しんだんラボ의 簡易四柱推命은 절입시각 데이터 부재로 연주만 간이 계산했지만,
//  이 라이브러리는 절기 경계를 정확히 반영하므로 년/월/일/시주 전체를 정식으로 계산합니다.)

const { Solar } = require('lunar-javascript');

// --- 한자 → 한글 매핑 (10천간 / 12지지 / 5행) ---
// 사주학의 가장 기초적인 고정 대응표로, 유파에 따라 달라지지 않는 표준 표기입니다.
const STEM_KO = { 甲: '갑', 乙: '을', 丙: '병', 丁: '정', 戊: '무', 己: '기', 庚: '경', 辛: '신', 壬: '임', 癸: '계' };
const BRANCH_KO = { 子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사', 午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해' };
const WUXING_KO = { 木: '목', 火: '화', 土: '토', 金: '금', 水: '수' };

// --- 일간(日干) 랜딩 페이지용 로마자 URL 키 매핑 ---
// 한글 자모를 URL에 그대로 쓰지 않기 위한 매핑. "갑목 성격" 같은 검색어를 노리는
// 독립 랜딩 페이지(/ilgan/:stemKey)에서 사용합니다(사주 전체 계산과 무관한 일간 단독 콘텐츠).
const STEM_ORDER_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const STEM_ROMAN = ['gap', 'eul', 'byeong', 'jeong', 'mu', 'gi', 'gyeong', 'sin', 'im', 'gye'];
const STEM_ELEMENT_KO = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];
const STEM_YINYANG_KO = ['양', '음', '양', '음', '양', '음', '양', '음', '양', '음'];

const STEM_ROMAN_TO_KO = {};
const STEM_KO_TO_ROMAN = {};
const STEM_ROMAN_TO_ELEMENT = {};
const STEM_ROMAN_TO_YINYANG = {};
STEM_ORDER_KO.forEach((ko, i) => {
  STEM_ROMAN_TO_KO[STEM_ROMAN[i]] = ko;
  STEM_KO_TO_ROMAN[ko] = STEM_ROMAN[i];
  STEM_ROMAN_TO_ELEMENT[STEM_ROMAN[i]] = STEM_ELEMENT_KO[i];
  STEM_ROMAN_TO_YINYANG[STEM_ROMAN[i]] = STEM_YINYANG_KO[i];
});

// 12지지 → 띠(십이지 동물). 자축인묘진사오미신유술해 순서 고정.
const BRANCH_TO_TTI = {
  子: { key: 'rat', name: '쥐', emoji: '🐭' },
  丑: { key: 'ox', name: '소', emoji: '🐮' },
  寅: { key: 'tiger', name: '호랑이', emoji: '🐯' },
  卯: { key: 'rabbit', name: '토끼', emoji: '🐰' },
  辰: { key: 'dragon', name: '용', emoji: '🐲' },
  巳: { key: 'snake', name: '뱀', emoji: '🐍' },
  午: { key: 'horse', name: '말', emoji: '🐴' },
  未: { key: 'goat', name: '양', emoji: '🐑' },
  申: { key: 'monkey', name: '원숭이', emoji: '🐵' },
  酉: { key: 'rooster', name: '닭', emoji: '🐔' },
  戌: { key: 'dog', name: '개', emoji: '🐶' },
  亥: { key: 'pig', name: '돼지', emoji: '🐷' },
};

const TTI_ORDER = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];

const TTI_BY_KEY = {};
Object.values(BRANCH_TO_TTI).forEach((t) => {
  TTI_BY_KEY[t.key] = t;
});

// --- 지지(地支) 관계 이론: 삼합/육합/충 ---
// 명리학의 가장 표준적인 지지 관계 3종. (원진살 등은 유파차이가 커서 제외 — 아래 3종은
// 12지지를 시계 형태로 배치했을 때의 기하학적 구조로도 교차검증되는 확립된 이론입니다.)
const SAMHAP_GROUPS = [
  ['tiger', 'horse', 'dog'], // 인오술 - 火局
  ['snake', 'rooster', 'ox'], // 사유축 - 金局
  ['monkey', 'rat', 'dragon'], // 신자진 - 水局
  ['pig', 'rabbit', 'goat'], // 해묘미 - 木局
];

const YUKHAP_PAIRS = [
  ['rat', 'ox'],
  ['tiger', 'pig'],
  ['rabbit', 'dog'],
  ['dragon', 'rooster'],
  ['snake', 'monkey'],
  ['horse', 'goat'],
];

const CHUNG_PAIRS = [
  ['rat', 'horse'],
  ['ox', 'goat'],
  ['tiger', 'monkey'],
  ['rabbit', 'rooster'],
  ['dragon', 'dog'],
  ['snake', 'pig'],
];

function pillarKo(hanja) {
  if (!hanja || hanja.length < 2) return '';
  const gan = hanja[0];
  const zhi = hanja[1];
  return (STEM_KO[gan] || gan) + (BRANCH_KO[zhi] || zhi);
}

/**
 * 정식 사주팔자 계산.
 * @param {number} year 양력 연도
 * @param {number} month 양력 월(1-12)
 * @param {number} day 양력 일
 * @param {number|null} hour 시(0-23) — 모르면 null
 * @param {number|null} minute 분(0-59) — 모르면 null 또는 생략
 */
function calcSaju(year, month, day, hour = null, minute = null) {
  const hasTime = hour !== null && hour !== undefined && !Number.isNaN(hour);
  // 시간을 모를 때는 자시(23~01시) 등 일주 경계에서 먼 정오(12:00)를 더미값으로 사용해
  // 년/월/일주 계산에는 영향이 없도록 합니다. 시주는 이 경우 아예 표시하지 않습니다.
  const solar = Solar.fromYmdHms(year, month, day, hasTime ? hour : 12, hasTime ? minute || 0 : 0, 0);
  const lunar = solar.getLunar();
  const bazi = lunar.getEightChar();

  const yearPillar = bazi.getYear();
  const monthPillar = bazi.getMonth();
  const dayPillar = bazi.getDay();
  const timePillar = hasTime ? bazi.getTime() : null;

  const yearWx = bazi.getYearWuXing();
  const monthWx = bazi.getMonthWuXing();
  const dayWx = bazi.getDayWuXing();
  const timeWx = hasTime ? bazi.getTimeWuXing() : '';

  const wuxingCounts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const ch of yearWx + monthWx + dayWx + timeWx) {
    const ko = WUXING_KO[ch];
    if (ko) wuxingCounts[ko] += 1;
  }

  const dayStemHanja = bazi.getDayGan();
  const yearBranchHanja = bazi.getYearZhi();
  const tti = BRANCH_TO_TTI[yearBranchHanja] || null;

  return {
    hasTime,
    pillars: {
      year: { hanja: yearPillar, ko: pillarKo(yearPillar) },
      month: { hanja: monthPillar, ko: pillarKo(monthPillar) },
      day: { hanja: dayPillar, ko: pillarKo(dayPillar) },
      time: hasTime ? { hanja: timePillar, ko: pillarKo(timePillar) } : null,
    },
    wuxingCounts,
    dayStemHanja,
    dayStemKo: STEM_KO[dayStemHanja] || dayStemHanja,
    tti,
  };
}

/**
 * 연도만으로 띠 계산(입춘 기준, 사주학 정식 방식).
 * 정확도를 위해 사주팔자 계산과 동일한 로직(월/일까지 반영)을 내부적으로 사용합니다.
 * month/day를 모르면(예: 궁합 도구에서 "연도만" 입력) 7월 1일을 더미로 사용 —
 * 입춘(2/4 무렵) 경계와 충분히 멀어 항상 해당 연도의 "일반적으로 알려진 띠"와 일치합니다.
 */
function getTtiByYear(year, month, day) {
  const m = month || 7;
  const d = day || 1;
  const { tti } = calcSaju(year, m, d, null, null);
  return tti;
}

function getTtiRelation(key1, key2) {
  if (key1 === key2) return 'same';
  if (SAMHAP_GROUPS.some((g) => g.includes(key1) && g.includes(key2))) return 'samhap';
  if (YUKHAP_PAIRS.some((p) => p.includes(key1) && p.includes(key2))) return 'yukhap';
  if (CHUNG_PAIRS.some((p) => p.includes(key1) && p.includes(key2))) return 'chung';
  return 'normal';
}

// --- 날짜 기반 시드(오늘의 운세용) ---
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// 렌더 서버가 UTC로 동작하는 것을 감안해 KST(UTC+9) 기준 "오늘" 날짜 문자열을 만듭니다.
// 이 보정이 없으면 한국 자정이 아니라 UTC 자정(=한국시간 오전 9시)에 운세가 바뀌어 버립니다.
function getTodayKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function pickSeeded(pool, ...seedParts) {
  const seed = simpleHash(seedParts.join(':'));
  return pool[seed % pool.length];
}

module.exports = {
  calcSaju,
  getTtiByYear,
  getTtiRelation,
  getTodayKST,
  pickSeeded,
  simpleHash,
  BRANCH_TO_TTI,
  TTI_BY_KEY,
  TTI_ORDER,
  STEM_KO,
  STEM_ROMAN,
  STEM_ROMAN_TO_KO,
  STEM_KO_TO_ROMAN,
  STEM_ROMAN_TO_ELEMENT,
  STEM_ROMAN_TO_YINYANG,
};
