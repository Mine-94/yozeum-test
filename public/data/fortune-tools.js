// 사주/운세 도구 — 홈 화면 "사주·운세" 섹션에 노출되는 네비게이션 데이터

const fortuneTools = [
  {
    id: 'saju',
    href: '/saju',
    title: '정식 사주팔자 계산기',
    subtitle: '생년월일(시)로 년·월·일·시주와 오행 분포까지, 절기 경계를 반영한 정식 계산',
    emoji: '🔮',
    themeColor: '#5b4b8a',
  },
  {
    id: 'unse',
    href: '/unse',
    title: '오늘의 띠별 운세',
    subtitle: '매일 바뀌는 12띠 오늘의 총운·애정운·금전운·건강운',
    emoji: '🌙',
    themeColor: '#c9622a',
  },
  {
    id: 'gunghap',
    href: '/gunghap',
    title: '띠 궁합 보기',
    subtitle: '삼합·육합·충 등 실제 지지 이론으로 보는 두 띠의 궁합',
    emoji: '🤝',
    themeColor: '#b0473e',
  },
];

module.exports = fortuneTools;
