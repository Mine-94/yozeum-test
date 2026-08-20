// 요즘테스트 — 퀴즈 데이터
// 새 퀴즈를 추가하려면 이 배열에 객체 하나만 추가하면 홈/네비/서버라우팅에 자동 반영됩니다.

const quizzes = [
  {
    id: 'meta-sensing',
    title: '나의 메타센싱 유형 테스트',
    subtitle: '2026년 Z세대 메가트렌드 "메타센싱" — 내 감정, 나는 얼마나 잘 알아차리고 다스릴까?',
    emoji: '🧠',
    themeColor: '#7c5cff',
    intro: '메타센싱은 "내가 지금 어떤 기분인지 알아차리고, 그 원인을 파악하고, 행동으로 조율하는 능력"을 뜻해요. 8개 질문으로 나의 메타센싱 유형을 확인해보세요.',
    questions: [
      {
        text: '친구와 대화하다가 갑자기 기분이 상했다. 나는?',
        options: [
          { text: '어떤 말 때문에 상했는지 바로 짚어낸다', type: 'detective' },
          { text: '일단 표정·말투에 티가 확 난다', type: 'storm' },
          { text: '티 안 내고 속으로 삼킨다', type: 'deepsea' },
          { text: '"그런가?" 하고 금방 잊는다', type: 'cool' },
        ],
      },
      {
        text: '오늘따라 유난히 예민한 것 같다. 나는?',
        options: [
          { text: '어제 잠을 못 잤는지, 뭘 먹었는지부터 되짚어본다', type: 'detective' },
          { text: '예민한 채로 하루를 그냥 밀어붙인다', type: 'storm' },
          { text: '사람을 피해서 혼자 있는 시간을 만든다', type: 'deepsea' },
          { text: '예민한지도 잘 모르고 넘어간다', type: 'cool' },
        ],
      },
      {
        text: '친구가 "너 요즘 좀 힘들어 보여"라고 말했다. 나는?',
        options: [
          { text: '"어? 맞아, 사실 요즘 이런 일이 있었어" 하고 바로 설명한다', type: 'detective' },
          { text: '갑자기 눈물이 핑 돈다', type: 'storm' },
          { text: '"아니야 괜찮아"라고 반사적으로 답한다', type: 'deepsea' },
          { text: '"내가? 딱히?" 하고 진짜 몰랐다는 반응', type: 'cool' },
        ],
      },
      {
        text: '스트레스를 풀 때 나의 방식은?',
        options: [
          { text: '왜 스트레스 받았는지 원인부터 정리하고 해결책을 찾는다', type: 'detective' },
          { text: '매운 음식·매장에서 소리지르기 등 강하게 발산한다', type: 'storm' },
          { text: '아무도 모르게 조용히 잠수 탄다(연락 두절)', type: 'deepsea' },
          { text: '딱히 방법이랄 것도 없이 자연스레 풀린다', type: 'cool' },
        ],
      },
      {
        text: '화가 났을 때 겉으로 드러나는 정도는?',
        options: [
          { text: '차분하게 "나 지금 좀 화났어"라고 말로 설명한다', type: 'detective' },
          { text: '표정·목소리에서 바로 티가 난다', type: 'storm' },
          { text: '전혀 티 안 내고 나중에 혼자 곱씹는다', type: 'deepsea' },
          { text: '화가 잘 안 나는 편이다', type: 'cool' },
        ],
      },
      {
        text: '누군가 나 때문에 서운해했다는 걸 알게 됐을 때?',
        options: [
          { text: '내가 뭘 어떻게 말해서 그랬는지 대화로 원인을 찾는다', type: 'detective' },
          { text: '미안한 마음이 확 커져서 바로 연락한다', type: 'storm' },
          { text: '어떻게 말을 꺼내야 할지 몰라 며칠을 고민만 한다', type: 'deepsea' },
          { text: '"그럴 수도 있지" 하고 크게 신경 안 쓴다', type: 'cool' },
        ],
      },
      {
        text: '기분이 안 좋은 날, SNS에 올리는 글은?',
        options: [
          { text: '올리지 않고 대신 다이어리·메모앱에 원인을 정리한다', type: 'detective' },
          { text: '감정이 담긴 글이나 스토리를 바로 올린다', type: 'storm' },
          { text: '평소처럼 아무렇지 않은 척 밝은 글을 올린다', type: 'deepsea' },
          { text: '기분과 무관하게 딱히 뭘 올리지 않는다', type: 'cool' },
        ],
      },
      {
        text: '가장 친한 친구가 나를 표현한다면?',
        options: [
          { text: '"쟤는 자기 감정을 되게 잘 설명해"', type: 'detective' },
          { text: '"감정 기복이 있는 편이야, 근데 솔직해"', type: 'storm' },
          { text: '"속을 잘 안 보여줘서 가끔 궁금해"', type: 'deepsea' },
          { text: '"뭘 해도 되게 평온해 보여"', type: 'cool' },
        ],
      },
    ],
    results: {
      detective: {
        title: '감정탐정형',
        emoji: '🔍',
        desc: '내 감정의 원인을 끝까지 파고드는 타입이에요. 기분이 왜 이런지 스스로 분석하고 설명할 수 있어서, 감정에 휘둘리기보다 감정을 "다루는" 쪽에 가까워요. 다만 가끔은 분석보다 그냥 느끼는 것도 필요해요.',
        shareText: '나의 메타센싱 유형은 감정탐정형 🔍 — 내 감정, 원인까지 다 파악하는 편!',
      },
      storm: {
        title: '폭풍직진형',
        emoji: '⛈️',
        desc: '감정이 생기면 숨기지 않고 바로 표현하는 솔직한 타입이에요. 순간의 감정 표출력은 최고지만, 가끔은 감정이 지나간 뒤 "내가 왜 그랬지"를 돌아보는 한 박자가 메타센싱 지수를 더 올려줄 거예요.',
        shareText: '나의 메타센싱 유형은 폭풍직진형 ⛈️ — 감정 표현만큼은 솔직 그 자체!',
      },
      deepsea: {
        title: '심해잠수형',
        emoji: '🌊',
        desc: '감정을 깊은 곳에 저장해두고 잘 안 꺼내는 타입이에요. 주변 사람들은 몰라도 사실 내면에서는 다 느끼고 있어요. 가끔은 믿을 수 있는 사람에게 조금씩 꺼내 보이는 연습도 메타센싱에 도움이 돼요.',
        shareText: '나의 메타센싱 유형은 심해잠수형 🌊 — 감정을 깊이 담아두는 편!',
      },
      cool: {
        title: '쿨거리형',
        emoji: '😎',
        desc: '감정 기복이 크지 않고 웬만한 일엔 무던한 타입이에요. 덕분에 안정적이라는 평을 자주 듣지만, 가끔은 "진짜 괜찮은 건지" 스스로에게 한 번 더 물어보는 것도 좋아요.',
        shareText: '나의 메타센싱 유형은 쿨거리형 😎 — 웬만한 일엔 다 무던!',
      },
    },
  },
  {
    id: 'long-flight',
    title: '장시간비행 여행 성향 테스트',
    subtitle: '요즘 SNS에서 화제인 "장시간비행" 밈 기반 — 12시간 비행, 나의 진짜 여행 성향은?',
    emoji: '✈️',
    themeColor: '#00b894',
    intro: '장거리 비행기 안에서의 선택으로 진짜 여행 성향이 드러난다는 요즘 밈, 알고 계셨나요? 8개 상황으로 내 여행 성향 유형을 확인해보세요.',
    questions: [
      {
        text: '비행기 좌석에 앉자마자 가장 먼저 하는 일은?',
        options: [
          { text: '기내 엔터테인먼트에서 미리 찜해둔 영화부터 튼다', type: 'planner' },
          { text: '창밖부터 구경하며 설렘을 만끽한다', type: 'wanderer' },
          { text: '목베개·수면안대부터 챙겨서 잘 준비를 한다', type: 'healer' },
          { text: '옆자리 사람에게 먼저 말을 걸어본다', type: 'networker' },
        ],
      },
      {
        text: '기내식 메뉴를 고를 때 나는?',
        options: [
          { text: '미리 찾아본 항공사 시그니처 메뉴를 주문한다', type: 'planner' },
          { text: '승무원 추천을 듣고 즉흥적으로 고른다', type: 'wanderer' },
          { text: '아무거나 상관없이 빨리 먹고 자고 싶다', type: 'healer' },
          { text: '옆자리와 메뉴 비교하며 한입씩 나눠 먹는다', type: 'networker' },
        ],
      },
      {
        text: '비행 중 난기류를 만났다. 나는?',
        options: [
          { text: '항로·고도 정보를 확인하며 상황을 파악한다', type: 'planner' },
          { text: '"오히려 스릴있다"며 재밌어한다', type: 'wanderer' },
          { text: '눈을 감고 명상하듯 가만히 있는다', type: 'healer' },
          { text: '옆자리 사람과 "괜찮으신가요" 하며 대화가 튼다', type: 'networker' },
        ],
      },
      {
        text: '목적지 도착 후 첫 일정은 이미 정해뒀는가?',
        options: [
          { text: '시간 단위로 일정표가 다 짜여있다', type: 'planner' },
          { text: '숙소만 예약, 나머진 도착해서 정한다', type: 'wanderer' },
          { text: '일정보다 "얼마나 쉴 수 있는가"가 먼저다', type: 'healer' },
          { text: '현지 친구·SNS 팔로워부터 만날 계획이다', type: 'networker' },
        ],
      },
      {
        text: '옆자리에 낯선 사람이 앉았다. 나는?',
        options: [
          { text: '가볍게 목례만 하고 각자 할 일을 한다', type: 'planner' },
          { text: '어디서 왔는지 궁금해서 눈이 마주치면 말을 건다', type: 'wanderer' },
          { text: '헤드폰부터 끼고 방해받지 않을 준비를 한다', type: 'healer' },
          { text: '자연스럽게 대화를 시작해서 도착할 즈음엔 친해져 있다', type: 'networker' },
        ],
      },
      {
        text: '여행 가방을 쌀 때 나의 스타일은?',
        options: [
          { text: '체크리스트를 만들어 하나씩 확인하며 싼다', type: 'planner' },
          { text: '일단 대충 싸고 현지에서 필요한 걸 산다', type: 'wanderer' },
          { text: '수면용품·상비약 등 "편안함" 용품이 절반이다', type: 'healer' },
          { text: '선물할 것, SNS에 올릴 소품까지 챙긴다', type: 'networker' },
        ],
      },
      {
        text: '비행시간이 예상보다 2시간 지연됐다. 나는?',
        options: [
          { text: '뒤 일정을 어떻게 조정할지 바로 계산에 들어간다', type: 'planner' },
          { text: '"어차피 이렇게 된 거" 하고 공항을 구경한다', type: 'wanderer' },
          { text: '차라리 잘됐다며 라운지에서 더 쉰다', type: 'healer' },
          { text: '대기줄에서 만난 사람들과 이야기꽃을 피운다', type: 'networker' },
        ],
      },
      {
        text: '여행에서 돌아온 뒤 가장 먼저 하는 일은?',
        options: [
          { text: '사진·영수증을 정리하며 다음 여행 계획을 세운다', type: 'planner' },
          { text: '아직 여운이 남아 다음 목적지부터 검색한다', type: 'wanderer' },
          { text: '며칠은 아무 일정 없이 푹 쉰다', type: 'healer' },
          { text: '현지에서 만난 사람들과 SNS로 계속 연락한다', type: 'networker' },
        ],
      },
    ],
    results: {
      planner: {
        title: '계획형 내비게이터',
        emoji: '🗺️',
        desc: '여행의 즐거움은 "완벽한 준비"에서 나온다고 믿는 타입이에요. 시간 단위 일정표와 체크리스트 덕분에 여행지에서 헤매는 시간이 거의 없어요. 가끔은 계획에 없던 골목에 한번 들어가 보는 것도 추천해요.',
        shareText: '나의 여행 성향은 계획형 내비게이터 🗺️ — 일정표 없인 못 떠남!',
      },
      wanderer: {
        title: '즉흥 방랑자',
        emoji: '🎒',
        desc: '숙소 하나만 예약해두고 나머진 현장에서 결정하는 타입이에요. 계획에 없던 우연한 발견이야말로 진짜 여행이라고 믿어요. 가끔은 미리 예약 안 해서 낭패 보는 것도 자유의 대가로 여겨요.',
        shareText: '나의 여행 성향은 즉흥 방랑자 🎒 — 계획은 최소, 우연은 최대!',
      },
      healer: {
        title: '휴식형 힐러',
        emoji: '🛏️',
        desc: '여행은 관광이 아니라 회복이라고 믿는 타입이에요. 일정을 빽빽이 채우기보다, 낯선 곳에서 푹 쉬는 것 자체가 목적이에요. 비행기에서부터 이미 "쉬는 모드"에 돌입해요.',
        shareText: '나의 여행 성향은 휴식형 힐러 🛏️ — 여행은 곧 힐링!',
      },
      networker: {
        title: '소셜 네트워커',
        emoji: '🤝',
        desc: '여행지에서 만나는 사람들 자체가 여행의 하이라이트인 타입이에요. 옆자리 승객도, 숙소 직원도 금방 친해지고, 도착할 즈음엔 새 인연이 하나 생겨있어요. 사람을 통해 여행지를 기억하는 편이에요.',
        shareText: '나의 여행 성향은 소셜 네트워커 🤝 — 여행지보다 사람이 남는 여행!',
      },
    },
  },
  {
    id: 'vibe-shift',
    title: '요즘 내 성향, 예전이랑 같을까?',
    subtitle: '"나 요즘 성격 바뀐 듯" — SNS에서 화제인 자가진단, 재미로 확인해보세요 (공식 성격유형 검사 아님)',
    emoji: '🔄',
    themeColor: '#ff6b81',
    intro: '"나 MBTI 바뀐 듯?"이라는 말, 한 번쯤 들어보셨죠. 이건 공식 심리검사가 아니라, 최근 나의 태도 변화를 재미로 짚어보는 자가진단 테스트예요.',
    questions: [
      {
        text: '요즘 약속을 잡을 때 나는?',
        options: [
          { text: '예전과 비슷하게 먼저 약속을 잡는 편이다', type: 'steady' },
          { text: '예전보다 사람 만나는 게 더 좋아졌다', type: 'expand' },
          { text: '예전보다 혼자 있는 시간을 더 찾게 됐다', type: 'inward' },
          { text: '만나는 사람 자체가 예전과 많이 달라졌다', type: 'reset' },
        ],
      },
      {
        text: '스트레스 받을 때 대처법이?',
        options: [
          { text: '늘 하던 방식 그대로 푼다', type: 'steady' },
          { text: '사람들과 어울리면서 푸는 게 늘었다', type: 'expand' },
          { text: '혼자 조용히 있는 시간이 더 늘었다', type: 'inward' },
          { text: '아예 새로운 취미·방법을 시도하게 됐다', type: 'reset' },
        ],
      },
      {
        text: '요즘 SNS 사용 패턴은?',
        options: [
          { text: '예전과 비슷한 빈도로 사용한다', type: 'steady' },
          { text: '더 적극적으로 올리고 반응한다', type: 'expand' },
          { text: '보기만 하고 잘 안 올리게 됐다', type: 'inward' },
          { text: '관심사 자체가 바뀌어서 팔로우 목록을 싹 정리했다', type: 'reset' },
        ],
      },
      {
        text: '새로운 사람을 만났을 때?',
        options: [
          { text: '예전 그대로 낯가림 정도가 똑같다', type: 'steady' },
          { text: '예전보다 훨씬 편하게 다가간다', type: 'expand' },
          { text: '예전보다 낯을 더 가리게 됐다', type: 'inward' },
          { text: '만나는 사람들의 결이 완전히 달라졌다', type: 'reset' },
        ],
      },
      {
        text: '주말을 보내는 방식이?',
        options: [
          { text: '늘 하던 루틴 그대로다', type: 'steady' },
          { text: '약속·모임으로 꽉 채우게 됐다', type: 'expand' },
          { text: '집에서 혼자 보내는 시간이 늘었다', type: 'inward' },
          { text: '완전히 새로운 활동으로 채우게 됐다', type: 'reset' },
        ],
      },
      {
        text: '요즘 나의 관심사는?',
        options: [
          { text: '몇 년째 비슷한 것에 관심이 있다', type: 'steady' },
          { text: '관심사가 늘어나서 더 다양해졌다', type: 'expand' },
          { text: '관심사가 좁아지고 더 깊어졌다', type: 'inward' },
          { text: '예전 관심사는 다 접고 새로운 걸 파고 있다', type: 'reset' },
        ],
      },
      {
        text: '친구가 "너 좀 달라진 것 같아"라고 하면?',
        options: [
          { text: '"그런가? 나는 똑같은 것 같은데"', type: 'steady' },
          { text: '"맞아, 요즘 훨씬 밝아졌어"', type: 'expand' },
          { text: '"맞아, 요즘 좀 조용해졌어"', type: 'inward' },
          { text: '"응 완전 다른 사람 됐어"', type: 'reset' },
        ],
      },
      {
        text: '1년 전의 나와 지금의 나를 비교하면?',
        options: [
          { text: '거의 그대로, 변화가 크지 않다', type: 'steady' },
          { text: '훨씬 적극적이고 외향적으로 변했다', type: 'expand' },
          { text: '훨씬 신중하고 내향적으로 변했다', type: 'inward' },
          { text: '가치관 자체가 크게 달라졌다', type: 'reset' },
        ],
      },
    ],
    results: {
      steady: {
        title: '안정형 (그대로)',
        emoji: '🌳',
        desc: '주변에서 뭐라 하든 나의 중심은 잘 흔들리지 않는 타입이에요. 급격한 변화보다 꾸준함이 나의 무기예요. 이런 안정감이 주변 사람들에게 믿음을 줘요.',
        shareText: '요즘 내 성향 변화 체크 결과: 안정형(그대로) 🌳 — 흔들리지 않는 나!',
      },
      expand: {
        title: '확장형 (더 외향적으로)',
        emoji: '🌟',
        desc: '요즘 부쩍 사람 만나는 게 즐거워지고 활동 반경이 넓어진 타입이에요. 새로운 인연과 자극을 반기는 시기를 지나고 있어요. 다만 가끔은 혼자만의 재충전 시간도 챙겨보세요.',
        shareText: '요즘 내 성향 변화 체크 결과: 확장형(더 외향적으로) 🌟 — 요즘 텐션 업!',
      },
      inward: {
        title: '내실형 (더 내향적으로)',
        emoji: '🌙',
        desc: '예전보다 혼자만의 시간과 깊이를 더 중요하게 여기게 된 타입이에요. 밖으로 향하던 에너지를 안으로 돌려서 스스로를 다지는 시기예요. 조용하지만 단단해지고 있는 중이에요.',
        shareText: '요즘 내 성향 변화 체크 결과: 내실형(더 내향적으로) 🌙 — 혼자의 시간이 좋아짐!',
      },
      reset: {
        title: '재정비형 (가치관 변화)',
        emoji: '🔄',
        desc: '관심사도, 만나는 사람도, 우선순위도 크게 달라진 타입이에요. 인생의 방향을 새로 잡는 전환기를 지나고 있을 가능성이 커요. 낯설겠지만, 그만큼 새로운 가능성이 열려있는 시기예요.',
        shareText: '요즘 내 성향 변화 체크 결과: 재정비형(가치관 변화) 🔄 — 완전히 다른 나!',
      },
    },
  },
  {
    id: 'balance-game',
    title: '인생 밸런스게임 20선',
    subtitle: '둘 중 하나만 고를 수 있다면? 선택으로 알아보는 나의 결정 스타일',
    emoji: '⚖️',
    themeColor: '#feca57',
    intro: '고민할 필요 없이 직관적으로 골라보세요. 8개 밸런스게임으로 나의 결정 스타일을 확인합니다.',
    questions: [
      {
        text: '평생 여름만 vs 평생 겨울만',
        options: [
          { text: '평생 여름만', type: 'safe' },
          { text: '평생 겨울만', type: 'bold' },
        ],
      },
      {
        text: '연봉 조금 적어도 워라밸 완벽 vs 워라밸 없어도 연봉 2배',
        options: [
          { text: '워라밸 완벽', type: 'safe' },
          { text: '연봉 2배', type: 'bold' },
        ],
      },
      {
        text: '이미 가본 최애 여행지 재방문 vs 한 번도 안 가본 낯선 나라',
        options: [
          { text: '최애 여행지 재방문', type: 'safe' },
          { text: '낯선 나라', type: 'bold' },
        ],
      },
      {
        text: '평생 같은 메뉴만 먹기 vs 매일 랜덤으로 배정된 음식 먹기',
        options: [
          { text: '평생 같은 메뉴', type: 'safe' },
          { text: '매일 랜덤 음식', type: 'bold' },
        ],
      },
      {
        text: '안정적인 대기업 vs 성공하면 대박인 스타트업',
        options: [
          { text: '안정적인 대기업', type: 'safe' },
          { text: '대박날 스타트업', type: 'bold' },
        ],
      },
      {
        text: '친한 친구 5명 vs 얕게 아는 친구 50명',
        options: [
          { text: '친한 친구 5명', type: 'safe' },
          { text: '얕게 아는 친구 50명', type: 'bold' },
        ],
      },
      {
        text: '결과를 아는 영화 다시보기 vs 어떤 내용일지 모르는 영화 처음보기',
        options: [
          { text: '아는 영화 다시보기', type: 'safe' },
          { text: '모르는 영화 처음보기', type: 'bold' },
        ],
      },
      {
        text: '실패 확률 0%인 평범한 계획 vs 실패 확률 50%인 인생역전 계획',
        options: [
          { text: '실패 확률 0% 평범한 계획', type: 'safe' },
          { text: '실패 확률 50% 인생역전 계획', type: 'bold' },
        ],
      },
    ],
    results: {
      safe: {
        title: '안정추구형',
        emoji: '🛡️',
        desc: '검증된 것, 익숙한 것에서 오는 편안함을 아는 타입이에요. 리스크를 최소화하면서도 꾸준히 원하는 걸 쌓아가는 스타일이에요. 무모한 도전보다 확실한 한 걸음을 선호해요.',
        shareText: '인생 밸런스게임 결과: 안정추구형 🛡️ — 확실한 게 최고!',
      },
      bold: {
        title: '도전추구형',
        emoji: '🔥',
        desc: '익숙함보다 새로움과 가능성에 끌리는 타입이에요. 리스크가 있어도 그만큼의 보상과 재미를 더 중요하게 생각해요. 인생을 좀 더 다이나믹하게 사는 편이에요.',
        shareText: '인생 밸런스게임 결과: 도전추구형 🔥 — 리스크는 있어도 재미는 확실!',
      },
    },
  },
];

module.exports = quizzes;
