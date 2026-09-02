// 요즘테스트 — 퀴즈 데이터
// 새 퀴즈를 추가하려면 이 배열에 객체 하나만 추가하면 홈/네비/서버라우팅에 자동 반영됩니다.

const quizzes = [
  {
    id: 'meta-sensing',
    title: '나의 메타센싱 유형 테스트',
    subtitle: '내 감정을 얼마나 잘 알아차리고 조율하는지 일상 속 선택으로 살펴보세요.',
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
          { text: '"내가? 딱히?" 하고 별다른 변화가 없었다고 느낀다', type: 'cool' },
        ],
      },
      {
        text: '스트레스를 풀 때 나의 방식은?',
        options: [
          { text: '왜 스트레스 받았는지 원인부터 정리하고 해결책을 찾는다', type: 'detective' },
          { text: '운동이나 노래처럼 몸을 쓰며 강하게 풀어낸다', type: 'storm' },
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
        desc: '감정이 생기면 숨기지 않고 바로 표현하는 솔직한 타입이에요. 반응이 빠른 만큼 감정이 지나간 뒤 무엇이 마음을 움직였는지 한 번 돌아보면 자신을 더 잘 이해할 수 있어요.',
        shareText: '나의 메타센싱 유형은 폭풍직진형 ⛈️ — 감정 표현만큼은 솔직 그 자체!',
      },
      deepsea: {
        title: '심해잠수형',
        emoji: '🌊',
        desc: '감정을 깊은 곳에 저장해두고 잘 안 꺼내는 타입이에요. 주변 사람들은 몰라도 사실 내면에서는 다 느끼고 있어요. 가끔은 믿을 수 있는 사람에게 조금씩 꺼내 보이는 연습도 메타센싱에 도움이 돼요.',
        shareText: '나의 메타센싱 유형은 심해잠수형 🌊 — 감정을 깊이 담아두는 편!',
      },
      cool: {
        title: '평온유지형',
        emoji: '😎',
        desc: '감정 기복이 크지 않고 웬만한 일에는 차분하게 반응하는 타입이에요. 주변에 안정감을 주는 강점이 있지만, 무심히 지나친 감정은 없는지 가끔 몸과 마음의 신호를 확인해보는 것도 좋아요.',
        shareText: '나의 메타센싱 유형은 평온유지형 😎 — 차분하게 균형을 지키는 편!',
      },
    },
  },
  {
    id: 'long-flight',
    title: '장시간비행 여행 성향 테스트',
    subtitle: '12시간 비행에서 마주칠 법한 상황으로 나의 여행 습관을 살펴보세요.',
    emoji: '✈️',
    themeColor: '#00b894',
    intro: '좌석에 앉은 순간부터 도착 뒤까지, 장거리 비행에서 마주칠 법한 8개 상황으로 나의 여행 습관을 확인해보세요.',
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
        desc: '숙소 하나만 예약해두고 나머지는 현장에서 결정하는 타입이에요. 계획에 없던 우연한 발견을 즐기지만, 꼭 필요한 교통편과 입장권만큼은 미리 확인하면 여행의 여유를 더 잘 지킬 수 있어요.',
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
    subtitle: '최근 달라진 생활과 관계의 리듬을 가볍게 돌아보는 자가 점검 테스트예요.',
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
  {
    id: 'past-life',
    title: '나의 전생은 누구였을까? 테스트',
    subtitle: '상상 속 옛이야기를 배경으로 지금의 선택 성향과 닮은 역할을 찾아보세요.',
    emoji: '📜',
    themeColor: '#8b5e3c',
    intro: '옛이야기 속에 들어간다면 어떤 역할과 닮았을까요? 8개 질문에 직관적으로 답해보세요. 실제 전생을 판정하는 기능이 아닌 창작형 테스트예요.',
    questions: [
      {
        text: '낯선 마을에 도착했다. 가장 먼저 하는 일은?',
        options: [
          { text: '마을의 구조와 정보부터 파악한다', type: 'strategist' },
          { text: '시장부터 둘러보며 물건 가격을 흥정해본다', type: 'merchant' },
          { text: '마을 풍경이 예뻐서 그림이나 글로 남기고 싶어진다', type: 'artist' },
          { text: '마을 어르신께 이 땅의 기운과 사연을 여쭤본다', type: 'mystic' },
        ],
      },
      {
        text: '중요한 결정을 내려야 할 때 나는?',
        options: [
          { text: '여러 정보를 모아 치밀하게 전략을 세운다', type: 'strategist' },
          { text: '손익을 계산해 가장 이득이 되는 쪽을 고른다', type: 'merchant' },
          { text: '마음이 이끄는 대로, 직관을 따른다', type: 'artist' },
          { text: '조용히 눈을 감고 마음속 신호를 기다린다', type: 'mystic' },
        ],
      },
      {
        text: '친구들 사이에서 나의 역할은?',
        options: [
          { text: '상황을 정리하고 다음 수를 알려주는 사람', type: 'strategist' },
          { text: '필요한 걸 구해오고 서로를 연결해주는 사람', type: 'merchant' },
          { text: '분위기를 즐겁게 만들고 영감을 주는 사람', type: 'artist' },
          { text: '고민을 들어주고 조언해주는 사람', type: 'mystic' },
        ],
      },
      {
        text: '갈등이 생겼을 때 나의 대처는?',
        options: [
          { text: '원인과 이해관계를 분석해 중재안을 낸다', type: 'strategist' },
          { text: '서로에게 이득이 되는 타협점을 제안한다', type: 'merchant' },
          { text: '대화나 글, 그림 등 감정을 표현하는 것으로 풀어낸다', type: 'artist' },
          { text: '시간을 두고 마음이 가라앉기를 기다린다', type: 'mystic' },
        ],
      },
      {
        text: '갖고 싶은 능력을 하나만 고른다면?',
        options: [
          { text: '미래를 내다보는 통찰력', type: 'strategist' },
          { text: '무엇이든 원하는 걸 얻어내는 협상력', type: 'merchant' },
          { text: '사람들의 마음을 움직이는 표현력', type: 'artist' },
          { text: '보이지 않는 것을 느끼는 직감', type: 'mystic' },
        ],
      },
      {
        text: '주말에 가장 끌리는 활동은?',
        options: [
          { text: '책이나 다큐멘터리로 새로운 지식을 쌓는다', type: 'strategist' },
          { text: '마켓이나 쇼핑몰을 구경하며 좋은 물건을 찾는다', type: 'merchant' },
          { text: '전시회나 공연을 보러 간다', type: 'artist' },
          { text: '혼자 산책하거나 명상하며 시간을 보낸다', type: 'mystic' },
        ],
      },
      {
        text: '스트레스 받을 때 나는?',
        options: [
          { text: '원인을 분석하고 해결 계획을 세운다', type: 'strategist' },
          { text: '갖고 싶던 걸 사거나 맛있는 걸 먹는다', type: 'merchant' },
          { text: '음악을 듣거나 뭔가를 만들며 푼다', type: 'artist' },
          { text: '조용한 곳에서 혼자 시간을 보낸다', type: 'mystic' },
        ],
      },
      {
        text: '인생에서 가장 중요하게 생각하는 가치는?',
        options: [
          { text: '지혜와 통찰', type: 'strategist' },
          { text: '풍요와 안정', type: 'merchant' },
          { text: '자유와 표현', type: 'artist' },
          { text: '균형과 평온', type: 'mystic' },
        ],
      },
    ],
    results: {
      strategist: {
        title: '궁중 책사형',
        emoji: '🧭',
        desc: '옛이야기 속 역할로 비유하면 왕이나 영주 곁에서 지략을 펼치던 책사와 닮았어요. 상황을 차분히 읽고 최선의 수를 찾는 편이지만, 때로는 계산을 잠시 내려놓고 마음이 가는 쪽을 살펴봐도 좋아요.',
        shareText: '나의 전생은 궁중 책사형 🧭 — 지략과 통찰로 살아온 삶!',
      },
      merchant: {
        title: '저잣거리 거상형',
        emoji: '💰',
        desc: '옛이야기 속 역할로 비유하면 큰 장사를 이끌던 거상과 닮았어요. 사람과 물건, 기회를 연결하고 현실적인 이익을 살피는 감각이 좋은 실속파예요.',
        shareText: '나의 전생은 저잣거리 거상형 💰 — 실속과 감각으로 살아온 삶!',
      },
      artist: {
        title: '방랑 예인형',
        emoji: '🎨',
        desc: '옛이야기 속 역할로 비유하면 여러 곳을 다니며 그림과 소리로 마음을 움직이던 예인과 닮았어요. 감정을 표현하고 새로운 자극을 만날 때 활력이 생기는 자유로운 편이에요.',
        shareText: '나의 전생은 방랑 예인형 🎨 — 자유와 표현으로 살아온 삶!',
      },
      mystic: {
        title: '산속 도인형',
        emoji: '🌙',
        desc: '옛이야기 속 역할로 비유하면 소란을 벗어나 깊이 생각하던 도인과 닮았어요. 눈에 바로 보이지 않는 분위기와 흐름을 살피며, 혼자만의 고요한 시간에서 힘을 얻는 편이에요.',
        shareText: '나의 전생은 산속 도인형 🌙 — 고요와 직감으로 살아온 삶!',
      },
    },
  },
  {
    id: 'love-style',
    title: '나의 연애 스타일 테스트',
    subtitle: '호감, 연락, 갈등 상황에서 나타나는 나의 관계 습관을 가볍게 살펴보세요.',
    emoji: '💘',
    themeColor: '#e84393',
    intro: '연애를 시작할 때, 좋아하는 사람 앞에서, 다투고 난 뒤의 선택을 통해 내가 관계에서 자주 보이는 모습을 살펴보세요.',
    questions: [
      {
        text: '좋아하는 사람이 생기면 나는?',
        options: [
          { text: '마음을 숨기지 못하고 바로 티가 난다', type: 'direct' },
          { text: '상대방 마음을 먼저 파악하려 관찰한다', type: 'careful' },
          { text: '어떻게 하면 잘해줄 수 있을지부터 고민한다', type: 'devoted' },
          { text: '좋아하지만 내 일상 페이스는 그대로 유지한다', type: 'independent' },
        ],
      },
      {
        text: '연애 초반, 연락 빈도는?',
        options: [
          { text: '하루 종일 실시간으로 연락한다', type: 'direct' },
          { text: '상대 스타일에 맞춰서 천천히 늘려간다', type: 'careful' },
          { text: '내가 먼저 자주 연락하는 편이다', type: 'devoted' },
          { text: '필요할 때만, 무리해서 자주 하진 않는다', type: 'independent' },
        ],
      },
      {
        text: '데이트 코스를 정할 때?',
        options: [
          { text: '내가 원하는 곳으로 적극적으로 이끈다', type: 'direct' },
          { text: '상대가 좋아할 만한 곳을 미리 조사해둔다', type: 'careful' },
          { text: '상대가 원하는 대로 다 맞춰준다', type: 'devoted' },
          { text: '각자 좋아하는 걸 번갈아 하자고 제안한다', type: 'independent' },
        ],
      },
      {
        text: '다툼이 생겼을 때?',
        options: [
          { text: '바로 대화로 풀자고 먼저 다가간다', type: 'direct' },
          { text: '상대가 진정할 시간을 준 뒤 접근한다', type: 'careful' },
          { text: '내가 뭘 잘못했는지부터 되돌아본다', type: 'devoted' },
          { text: '각자 시간을 갖고 감정이 정리되면 얘기한다', type: 'independent' },
        ],
      },
      {
        text: '상대의 친구들을 만날 때?',
        options: [
          { text: '먼저 나서서 친해지려 한다', type: 'direct' },
          { text: '조심스럽게 분위기를 살피며 다가간다', type: 'careful' },
          { text: '상대 친구들에게도 잘 보이려 애쓴다', type: 'devoted' },
          { text: '자연스럽게, 무리하지 않고 어울린다', type: 'independent' },
        ],
      },
      {
        text: '연인이 바쁜 시기에 나는?',
        options: [
          { text: '서운함을 바로 표현한다', type: 'direct' },
          { text: '이유가 있겠거니 하고 조용히 기다린다', type: 'careful' },
          { text: '힘들지 않게 더 많이 챙겨주려 한다', type: 'devoted' },
          { text: '나도 내 할 일에 집중하며 각자 시간을 보낸다', type: 'independent' },
        ],
      },
      {
        text: '기념일을 준비할 때?',
        options: [
          { text: '큰 이벤트로 화끈하게 표현한다', type: 'direct' },
          { text: '상대가 예전에 흘렸던 말을 기억해뒀다 챙긴다', type: 'careful' },
          { text: '내가 가진 걸 아낌없이 다 쏟아붓는다', type: 'devoted' },
          { text: '소소하지만 부담 없는 선물을 고른다', type: 'independent' },
        ],
      },
      {
        text: '연애에서 가장 중요하게 생각하는 것은?',
        options: [
          { text: '서로에 대한 솔직한 표현', type: 'direct' },
          { text: '서로를 이해하려는 배려', type: 'careful' },
          { text: '아낌없이 주는 사랑', type: 'devoted' },
          { text: '각자의 삶을 존중하는 균형', type: 'independent' },
        ],
      },
    ],
    results: {
      direct: {
        title: '직진끝판왕형',
        emoji: '🎯',
        desc: '마음이 생기면 숨기지 않고 바로 표현하는 타입이에요. 눈치 보며 시간을 끄는 것보다 솔직하게 다가가는 쪽이 훨씬 편해요. 그 솔직함 덕분에 상대방도 마음을 빨리 열게 되는 편이에요.',
        shareText: '나의 연애 스타일은 직진끝판왕형 🎯 — 마음은 숨기지 않는 성격!',
      },
      careful: {
        title: '신중관찰형',
        emoji: '🔭',
        desc: '상대방의 마음과 상황을 충분히 살핀 뒤에 움직이는 타입이에요. 성급하게 다가가기보다 상대에게 맞춰가는 배려심이 강점이에요. 다만 너무 재다가 타이밍을 놓치지 않게 조심하세요.',
        shareText: '나의 연애 스타일은 신중관찰형 🔭 — 배려 있게 다가가는 성격!',
      },
      devoted: {
        title: '올인헌신형',
        emoji: '💝',
        desc: '한번 마음을 주면 아낌없이 다 쏟아붓는 타입이에요. 상대를 챙기는 데서 행복을 느끼고, 연애에 진심을 다해요. 나 자신을 챙기는 것도 잊지 않는 게 오래가는 연애의 비결이에요.',
        shareText: '나의 연애 스타일은 올인헌신형 💝 — 사랑에 진심인 성격!',
      },
      independent: {
        title: '자유로운밸런스형',
        emoji: '🦋',
        desc: '연애 중에도 나만의 삶과 페이스를 지키는 타입이에요. 상대에게 의존하기보다 서로의 공간을 존중하는 균형 잡힌 연애를 추구해요. 이런 여유가 오히려 관계를 더 건강하게 만들어줘요.',
        shareText: '나의 연애 스타일은 자유로운밸런스형 🦋 — 균형 잡힌 연애 스타일!',
      },
    },
  },
  {
    id: 'teto-egen',
    title: '테토·에겐 유형 테스트',
    subtitle: '행동과 관계에서 나는 직진형과 공감형 중 어느 쪽에 더 가까울까요?',
    emoji: '🌗',
    themeColor: '#0abde3',
    intro: '테토·에겐은 호르몬 수치를 측정하는 검사가 아니라 온라인에서 쓰이는 유행 표현이에요. 8개 질문으로 내 행동과 소통 방식이 어느 쪽 묘사에 더 가까운지 가볍게 살펴보세요.',
    questions: [
      {
        text: '팀 과제에서 의견이 갈릴 때, 나는?',
        options: [
          { text: '내 생각이 맞다고 판단되면 밀어붙이는 편이다', type: 'teto' },
          { text: '다들 어떻게 생각하는지 먼저 들어보는 편이다', type: 'egen' },
        ],
      },
      {
        text: '누군가 나에게 무례하게 굴면?',
        options: [
          { text: '그 자리에서 바로 짚고 넘어간다', type: 'teto' },
          { text: '일단 넘기고 나중에 혼자 곱씹는다', type: 'egen' },
        ],
      },
      {
        text: '친구가 힘든 일을 털어놓으면?',
        options: [
          { text: '해결 방법부터 같이 찾아준다', type: 'teto' },
          { text: '일단 옆에서 가만히 들어주고 공감해준다', type: 'egen' },
        ],
      },
      {
        text: '연애할 때 나는?',
        options: [
          { text: '리드하는 걸 좋아하고 표현도 직접적이다', type: 'teto' },
          { text: '상대 마음을 세심하게 챙기고 맞춰주는 편이다', type: 'egen' },
        ],
      },
      {
        text: '스트레스 받을 때 푸는 방법은?',
        options: [
          { text: '운동이든 뭐든 몸을 움직여서 확 풀어버린다', type: 'teto' },
          { text: '혼자 조용히 있거나 감성적인 걸로 달랜다', type: 'egen' },
        ],
      },
      {
        text: '처음 보는 사람들과 있을 때?',
        options: [
          { text: '먼저 말을 걸고 분위기를 주도하는 편이다', type: 'teto' },
          { text: '상대가 편해질 때까지 조심스럽게 다가간다', type: 'egen' },
        ],
      },
      {
        text: '중요한 결정을 내려야 할 때?',
        options: [
          { text: '고민은 짧게, 일단 결정하고 나아간다', type: 'teto' },
          { text: '여러 사람의 의견과 감정까지 충분히 살핀다', type: 'egen' },
        ],
      },
      {
        text: '주변에서 나를 이렇게 표현한다면?',
        options: [
          { text: '"뭘 좀 아는 사람", "주도적인 사람"', type: 'teto' },
          { text: '"같이 있으면 편한 사람", "섬세한 사람"', type: 'egen' },
        ],
      },
    ],
    results: {
      teto: {
        title: '테토형',
        emoji: '⚡',
        desc: '직진과 확신이 무기인 타입이에요. 망설임보다 행동이 빠르고, 내 생각을 숨기지 않고 표현하는 데 거침이 없어요. 그 자신감 덕분에 자연스럽게 분위기를 주도하는 역할을 맡게 되는 경우가 많아요. 가끔은 한 박자 천천히, 주변을 살피는 여유도 챙겨보면 좋아요.',
        shareText: '나는 테토형 ⚡ — 망설임 없이 직진하는 스타일!',
      },
      egen: {
        title: '에겐형',
        emoji: '🌙',
        desc: '섬세함과 공감이 강점인 타입이에요. 큰 목소리를 내기보다 상대의 마음을 먼저 살피고, 조용히 배려하는 방식으로 관계를 채워가요. 그 다정함 덕분에 곁에 있으면 편안한 사람이라는 말을 자주 듣는 편이에요. 가끔은 내 생각도 좀 더 당당하게 표현해봐도 괜찮아요.',
        shareText: '나는 에겐형 🌙 — 섬세하고 다정한 스타일!',
      },
    },
  },
];

module.exports = quizzes;
