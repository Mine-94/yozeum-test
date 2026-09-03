// 공개 콘텐츠에서 당사자가 밝힌 결과만 사용합니다.
// 표정·말투·작품 이미지로 유형을 추정하지 않으며, 공개 시점을 함께 표시합니다.
const SOOMPI_2020 = {
  label: 'Soompi 공개 결과 정리',
  url: 'https://www.soompi.com/article/1381302wpp/korean-celebrities-who-revealed-their-mbti',
  published: '2020년 2월',
};

const BTS_2022 = {
  label: 'BANGTANTV MBTI Lab',
  url: 'https://www.youtube.com/watch?v=pGX-Qgppy9k',
  published: '2022년 5월',
};

const TWICE_2020 = {
  label: 'TWICE 공식 영상 결과 정리',
  url: 'https://www.soompi.com/article/1411229wpp/watch',
  published: '2020년 7월',
};

const BLACKPINK_2023 = {
  label: '지수 공식 영상 결과 정리',
  url: 'https://www.dipe.co.kr/2262128',
  published: '2023년 8월',
};

const celebrityResults = {
  ISTJ: [
    { name: '써니', group: '소녀시대', source: SOOMPI_2020 },
    { name: '마크', group: 'GOT7', source: SOOMPI_2020 },
  ],
  ISFJ: [
    { name: '다현', group: 'TWICE', source: TWICE_2020 },
    { name: '정연', group: 'TWICE', source: TWICE_2020 },
  ],
  INFJ: [
    { name: '제이홉', group: 'BTS', source: BTS_2022 },
    { name: '원우', group: 'SEVENTEEN', source: SOOMPI_2020 },
  ],
  INTJ: [
    { name: '공민지', group: '가수', source: SOOMPI_2020 },
    { name: '다원', group: 'SF9', source: SOOMPI_2020 },
  ],
  ISTP: [
    { name: '슈가', group: 'BTS', source: BTS_2022 },
    { name: '지수', group: 'BLACKPINK', source: BLACKPINK_2023 },
  ],
  ISFP: [
    { name: '미나', group: 'TWICE', source: TWICE_2020 },
    { name: '지효', group: 'TWICE', source: TWICE_2020 },
  ],
  INFP: [
    { name: '뷔', group: 'BTS', source: BTS_2022 },
    { name: '모모', group: 'TWICE', source: TWICE_2020 },
  ],
  INTP: [
    { name: '진', group: 'BTS', source: BTS_2022 },
    { name: '정국', group: 'BTS', source: BTS_2022 },
  ],
  ESTP: [
    { name: '태현', group: 'TXT', source: SOOMPI_2020 },
  ],
  ESFP: [
    { name: '김도연', group: '가수·배우', source: SOOMPI_2020 },
    { name: '배진영', group: 'CIX', source: SOOMPI_2020 },
  ],
  ENFP: [
    { name: 'RM', group: 'BTS', source: BTS_2022 },
    { name: '로제', group: 'BLACKPINK', source: BLACKPINK_2023 },
    { name: '사나', group: 'TWICE', source: TWICE_2020 },
  ],
  ENTP: [
    { name: '제시', group: '가수', source: SOOMPI_2020 },
    { name: '라미란', group: '배우', source: SOOMPI_2020 },
  ],
  ESTJ: [
    { name: '한채영', group: '배우', source: SOOMPI_2020 },
    { name: '뱀뱀', group: 'GOT7', source: SOOMPI_2020 },
  ],
  ESFJ: [
    { name: '승민', group: 'Stray Kids', source: SOOMPI_2020 },
    { name: '리노', group: 'Stray Kids', source: SOOMPI_2020 },
  ],
  ENFJ: [
    { name: '지민', group: 'BTS', source: BTS_2022 },
    { name: '방찬', group: 'Stray Kids', source: SOOMPI_2020 },
  ],
  ENTJ: [
    { name: '티파니 영', group: '가수', source: SOOMPI_2020 },
  ],
};

module.exports = celebrityResults;
