#!/bin/bash
set -uo pipefail
PORT=3010
BASE="http://localhost:$PORT"
cd "$(dirname "$0")"

echo "=== 서버 기동 ==="
PORT=$PORT node server.js > /tmp/yozeum_test_server.log 2>&1 &
SERVER_PID=$!
sleep 1.5
echo "server pid: $SERVER_PID"

pass=0
fail=0

check_status() {
  local desc="$1" url="$2" expected="$3" extra="${4:-}"
  local code
  code=$(curl -s -o /tmp/yozeum_resp.html $extra -w '%{http_code}' "$url")
  if [ "$code" == "$expected" ]; then
    echo "PASS  [$code] $desc"
    pass=$((pass+1))
  else
    echo "FAIL  [$code, expected $expected] $desc ($url)"
    fail=$((fail+1))
  fi
}

check_contains() {
  local desc="$1" url="$2" needle="$3" extra="${4:-}"
  curl -s $extra "$url" -o /tmp/yozeum_resp.html
  if grep -q "$needle" /tmp/yozeum_resp.html; then
    echo "PASS  contains '$needle': $desc"
    pass=$((pass+1))
  else
    echo "FAIL  missing '$needle': $desc ($url)"
    fail=$((fail+1))
  fi
}

check_redirect_location() {
  local desc="$1" url="$2" needle="$3" extra="${4:-}"
  loc=$(curl -s -o /dev/null -D - $extra "$url" | grep -i '^location:' | tr -d '\r')
  if echo "$loc" | grep -q "$needle"; then
    echo "PASS  redirect→'$needle': $desc ($loc)"
    pass=$((pass+1))
  else
    echo "FAIL  redirect expected '$needle': $desc (got: $loc)"
    fail=$((fail+1))
  fi
}

check_header_contains() {
  local desc="$1" url="$2" needle="$3" extra="${4:-}"
  local headers
  headers=$(curl -s -o /dev/null -D - $extra "$url" | tr -d '\r')
  if echo "$headers" | grep -qi "$needle"; then
    echo "PASS  header contains '$needle': $desc"
    pass=$((pass+1))
  else
    echo "FAIL  header missing '$needle': $desc ($url)"
    fail=$((fail+1))
  fi
}

check_valid_jsonld() {
  local desc="$1" url="$2"
  curl -s "$url" -o /tmp/yozeum_resp.html
  node -e '
    const fs = require("fs");
    const html = fs.readFileSync("/tmp/yozeum_resp.html", "utf8");
    const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!m) { console.error("NO_MATCH"); process.exit(1); }
    try {
      const data = JSON.parse(m[1]);
      if (!Array.isArray(data) || data.length < 2) { console.error("UNEXPECTED_SHAPE"); process.exit(1); }
      const hasWebPage = data.some((d) => d["@type"] === "WebPage");
      const hasBreadcrumb = data.some((d) => d["@type"] === "BreadcrumbList");
      if (!hasWebPage || !hasBreadcrumb) { console.error("MISSING_TYPE"); process.exit(1); }
      process.exit(0);
    } catch (e) {
      console.error("PARSE_ERROR: " + e.message);
      process.exit(1);
    }
  ' 2>/tmp/yozeum_jsonld_err.txt
  if [ $? -eq 0 ]; then
    echo "PASS  valid JSON-LD (WebPage+BreadcrumbList): $desc"
    pass=$((pass+1))
  else
    echo "FAIL  invalid JSON-LD ($(cat /tmp/yozeum_jsonld_err.txt)): $desc ($url)"
    fail=$((fail+1))
  fi
}

echo ""
echo "=== 기본 페이지 ==="
check_status "홈" "$BASE/" 200
check_contains "홈에 사주·운세 섹션" "$BASE/" "사주"
check_contains "홈에 테스트 섹션" "$BASE/" "가볍게 해보는 테스트"
check_contains "홈에 목적 중심 H1" "$BASE/" "지금 궁금한 나를"
check_contains "홈에 WebSite 구조화데이터" "$BASE/" '"@type":"WebSite"'
check_contains "홈에 콘텐츠 제작 기준 안내" "$BASE/" "결과는 이렇게 만들어요"
check_contains "홈에 추천 콘텐츠 섹션" "$BASE/" "먼저 해볼 만한 콘텐츠"
check_contains "홈 우선순위 카드에 GA4 선택 추적값" "$BASE/" 'data-content-placement="home_priority"'
check_contains "홈에 관심사별 빠른 탐색" "$BASE/" 'aria-label="관심사별 바로가기"'
check_contains "홈에 저장형 오늘 운세 폼" "$BASE/" "data-save-birth-year"
check_contains "홈에 접근성 본문 바로가기" "$BASE/" "본문으로 바로가기"
check_contains "홈에 전역 주요 메뉴" "$BASE/" 'aria-label="주요 메뉴"'
check_contains "전역 메뉴에 핵심 콘텐츠 링크" "$BASE/mbti/type/INFP" 'href="/unse">오늘운세'
check_header_contains "홈 보안 헤더 nosniff" "$BASE/" "X-Content-Type-Options: nosniff"
check_header_contains "홈 보안 헤더 referrer policy" "$BASE/" "Referrer-Policy: strict-origin-when-cross-origin"
if curl -s -D - "$BASE/" -o /dev/null | grep -qi '^X-Powered-By:'; then
  echo "FAIL  프레임워크 식별 헤더가 노출됨"
  fail=$((fail+1))
else
  echo "PASS  프레임워크 식별 헤더 제거"
  pass=$((pass+1))
fi
curl -s "$BASE/" -o /tmp/yozeum_home.html
priority_order=$(grep -o 'data-priority-rank="[1-6]"' /tmp/yozeum_home.html | tr -cd '1-6')
if [ "$priority_order" = "123456" ]; then
  echo "PASS  홈 인기 콘텐츠가 수요 우선순위 1→6으로 배치"
  pass=$((pass+1))
else
  echo "FAIL  홈 인기 콘텐츠 순서 불일치 (got $priority_order)"
  fail=$((fail+1))
fi
check_status "사이트 소개" "$BASE/about" 200
check_contains "사이트 소개에 채점 기준" "$BASE/about" "심리테스트 채점 기준"
check_contains "사이트 소개에 AboutPage 구조화데이터" "$BASE/about" '"@type":"AboutPage"'
check_contains "사이트 소개에 제작·검토 과정" "$BASE/about" "누가, 어떻게 만들고 검토하나요?"
check_contains "사이트 소개에 자동화 보조 공개" "$BASE/about" "자동화 도구를 보조적으로"
check_contains "사이트 소개에 오류 수정 원칙" "$BASE/about" "업데이트와 오류 수정 원칙"
check_status "읽을거리 허브" "$BASE/guides" 200
check_contains "읽을거리 허브에 CollectionPage 구조화데이터" "$BASE/guides" '"@type":"CollectionPage"'
for guide in saju-first-read five-elements-balance zodiac-compatibility personality-test-results; do
  check_status "가이드 페이지: $guide" "$BASE/guides/$guide" 200
  check_contains "가이드 Article 구조화데이터: $guide" "$BASE/guides/$guide" '"@type":"Article"'
done
check_contains "사주 가이드에 읽는 순서 설명" "$BASE/guides/saju-first-read" "먼저 ‘일간’을 찾으세요"
check_contains "심리테스트 가이드에 일치율 설명" "$BASE/guides/personality-test-results" "일치율은 선택 횟수를"
check_status "개인정보처리방침" "$BASE/privacy.html" 200
check_status "이용약관" "$BASE/terms.html" 200
check_contains "개인정보처리방침 canonical" "$BASE/privacy.html" 'rel="canonical" href="https://yozeum-test.com/privacy.html"'
check_contains "이용약관 canonical" "$BASE/terms.html" 'rel="canonical" href="https://yozeum-test.com/terms.html"'
check_contains "개인정보처리방침에 분석 정보 항목" "$BASE/privacy.html" "방문 페이지, 유입 경로"
check_contains "개인정보처리방침에 Google 정책 링크" "$BASE/privacy.html" "policies.google.com/privacy"
check_contains "개인정보처리방침에서 실제 수집 범위 명시" "$BASE/privacy.html" "회원 계정, 이름, 전화번호, 이메일을 직접 수집하는 기능을 현재 제공하지 않습니다"
check_status "확장자 없는 개인정보 주소는 정규 URL로 영구 이동" "$BASE/privacy" 301
check_redirect_location "개인정보 주소 정규화" "$BASE/privacy" "/privacy.html"
check_status "확장자 없는 약관 주소는 정규 URL로 영구 이동" "$BASE/terms" 301
check_redirect_location "약관 주소 정규화" "$BASE/terms" "/terms.html"
check_status "ads.txt" "$BASE/ads.txt" 200
check_contains "ads.txt 판매자 레코드" "$BASE/ads.txt" "google.com, pub-8602848692420724, DIRECT, f08c47fec0942fa0"
check_status "robots.txt" "$BASE/robots.txt" 200
check_contains "robots.txt sitemap 링크" "$BASE/robots.txt" "Sitemap:"
check_contains "robots.txt 공식 도메인" "$BASE/robots.txt" "https://yozeum-test.com/sitemap.xml"
check_status "sitemap.xml" "$BASE/sitemap.xml" 200
check_contains "sitemap에 /saju 포함" "$BASE/sitemap.xml" "/saju"
check_contains "sitemap에 /unse 포함" "$BASE/sitemap.xml" "/unse"
check_contains "sitemap에 /gunghap 포함" "$BASE/sitemap.xml" "/gunghap"
check_contains "sitemap에 /about 포함" "$BASE/sitemap.xml" "/about<"
check_contains "sitemap에 /guides 포함" "$BASE/sitemap.xml" "/guides<"
check_contains "sitemap에 개별 가이드 포함" "$BASE/sitemap.xml" "/guides/saju-first-read<"
check_contains "sitemap에 MBTI 허브 포함" "$BASE/sitemap.xml" "/mbti<"
check_contains "sitemap에 MBTI 테스트 포함" "$BASE/sitemap.xml" "/mbti/test<"
check_contains "sitemap에 MBTI 궁합 폼 포함" "$BASE/sitemap.xml" "/mbti/compatibility<"
check_contains "sitemap에 INFP 유형 포함" "$BASE/sitemap.xml" "/mbti/type/INFP<"
check_contains "sitemap 공식 도메인" "$BASE/sitemap.xml" "https://yozeum-test.com/"
check_contains "sitemap에 /unse/rat(동적 페이지) 포함" "$BASE/sitemap.xml" "/unse/rat<"
if curl -s "$BASE/sitemap.xml" | grep -q "/gunghap/r/"; then
  echo "FAIL  sitemap에 유사한 궁합 결과 페이지가 남아 있음"
  fail=$((fail+1))
else
  echo "PASS  sitemap에서 78개 궁합 결과 페이지 제외"
  pass=$((pass+1))
fi
if curl -s "$BASE/sitemap.xml" | grep -q "/mbti/compatibility/.*/"; then
  echo "FAIL  sitemap에 MBTI 궁합 조합 결과가 남아 있음"
  fail=$((fail+1))
else
  echo "PASS  sitemap에서 MBTI 궁합 조합 결과 제외"
  pass=$((pass+1))
fi
check_contains "sitemap에 /ilgan/gap(일간 랜딩) 포함" "$BASE/sitemap.xml" "/ilgan/gap<"
check_contains "sitemap에 /ilgan/gye(일간 랜딩 마지막) 포함" "$BASE/sitemap.xml" "/ilgan/gye<"

curl -s "$BASE/sitemap.xml" -o /tmp/yozeum_resp.html
url_count=$(grep -o '<url>' /tmp/yozeum_resp.html | wc -l)
quiz_count=$(node -e "console.log(require('./data/quizzes').length)")
expected=$((31 + quiz_count + 12 + 10))
echo "sitemap내 URL수: $url_count (기대값: 정적·가이드·MBTI31+퀴즈${quiz_count}+운세12+일간10=${expected})"
if [ "$url_count" == "$expected" ]; then
  echo "PASS  sitemap URL 수가 예상과 일치"
  pass=$((pass+1))
else
  echo "FAIL  sitemap URL 수 불일치 (got $url_count, expected $expected)"
  fail=$((fail+1))
fi

echo ""
echo "=== MBTI 16유형·검사·궁합 ==="
check_status "MBTI 16유형 허브" "$BASE/mbti" 200
check_contains "MBTI 허브에 16유형 설명" "$BASE/mbti" "16가지 유형 자세히 보기"
check_contains "MBTI 허브에 네 축 설명" "$BASE/mbti" "정보를 받아들이는 방식"
check_contains "MBTI 허브에 공식 검사 아님 안내" "$BASE/mbti" "공식 MBTI 검사나 전문 심리 평가가 아니며"
check_contains "MBTI 허브 CollectionPage 구조화데이터" "$BASE/mbti" '"@type":"CollectionPage"'
check_status "MBTI 20문항 테스트" "$BASE/mbti/test" 200
check_contains "MBTI 테스트 문항 수 안내" "$BASE/mbti/test" "총 20개 문항"
check_contains "MBTI 테스트 클라이언트 스크립트" "$BASE/mbti/test" "/js/mbti-test.js"
check_contains "MBTI 시작 이벤트를 공통 퍼널로 통합" "$BASE/js/mbti-test.js" "quiz_start"
check_contains "MBTI 완료 이벤트를 공통 퍼널로 통합" "$BASE/js/mbti-test.js" "quiz_complete"
for type in ISTJ ISFJ INFJ INTJ ISTP ISFP INFP INTP ESTP ESFP ENFP ENTP ESTJ ESFJ ENFJ ENTJ; do
  check_status "MBTI 유형 페이지: $type" "$BASE/mbti/type/$type" 200
done
check_contains "INFP 유형에 성격 설명" "$BASE/mbti/type/INFP" "가치 중심 이상형"
check_contains "INFP 유형에 연애·관계 설명" "$BASE/mbti/type/INFP" "연애와 인간관계"
check_contains "INFP 유형에 업무 환경 설명" "$BASE/mbti/type/INFP" "일할 때 강점과 어울리는 환경"
check_contains "유형 페이지 Article 구조화데이터" "$BASE/mbti/type/INFP" '"@type":"Article"'
check_contains "유형 페이지에 작성 주체와 검토일" "$BASE/mbti/type/INFP" "요즘테스트 운영자 · 2026년 9월 2일 검토"
check_status "소문자 MBTI 유형은 정규 URL로 영구 이동" "$BASE/mbti/type/infp" 301
check_redirect_location "소문자 유형 URL 정규화" "$BASE/mbti/type/infp" "/mbti/type/INFP"
check_contains "테스트 결과 비율 표시" "$BASE/mbti/type/INFP?ei=20&sn=40&tf=20&jp=20" "E 20%"
check_contains "테스트 결과 반대 비율 표시" "$BASE/mbti/type/INFP?ei=20&sn=40&tf=20&jp=20" "80% I"
check_status "MBTI 궁합 선택 폼" "$BASE/mbti/compatibility" 200
check_contains "MBTI 궁합 폼에 도구 식별값" "$BASE/mbti/compatibility" 'data-tool-id="mbti_compatibility"'
check_contains "MBTI 궁합에 점수화하지 않는 원칙" "$BASE/mbti/compatibility" "좋고 나쁜 조합을 단정하는 대신"
check_contains "MBTI 궁합에 친구 초대 기능" "$BASE/mbti/compatibility?first=INFP" "내 유형을 담아 초대하기"
check_contains "MBTI 친구 초대 스크립트" "$BASE/js/compat-invite.js" "mbti_friend_invite"
check_redirect_location "MBTI 궁합 계산→정규 결과" "$BASE/mbti/compatibility/result?first=INFP&second=ENFJ" "/mbti/compatibility/ENFJ/INFP"
check_status "MBTI 궁합 결과" "$BASE/mbti/compatibility/ENFJ/INFP" 200
check_contains "MBTI 궁합 네 축 비교" "$BASE/mbti/compatibility/ENFJ/INFP" "에너지와 대화 속도"
check_contains "MBTI 궁합은 예측·점수화하지 않음" "$BASE/mbti/compatibility/ENFJ/INFP" "성공 가능성을 예측하거나 점수화하지 않습니다"
check_header_contains "MBTI 궁합 조합 결과 색인 제외" "$BASE/mbti/compatibility/ENFJ/INFP" "X-Robots-Tag: noindex, follow"
check_contains "MBTI 궁합 결과 공유 URL에 유입 식별값" "$BASE/mbti/compatibility/ENFJ/INFP" "utm_campaign=result_share"
check_status "역순 MBTI 궁합 URL은 정규 URL로 영구 이동" "$BASE/mbti/compatibility/INFP/ENFJ" 301
check_redirect_location "역순 MBTI 궁합 URL 정규화" "$BASE/mbti/compatibility/INFP/ENFJ" "/mbti/compatibility/ENFJ/INFP"

echo ""
echo "=== 기존 퀴즈 회귀 테스트 ==="
check_status "퀴즈 페이지" "$BASE/q/meta-sensing" 200
check_status "퀴즈 결과 페이지" "$BASE/q/meta-sensing/r/detective" 200
check_contains "퀴즈 페이지에 이용 안내" "$BASE/q/meta-sensing" "총 8개 문항"
check_contains "퀴즈 페이지에 결과 유형 설명" "$BASE/q/meta-sensing" "어떤 결과 유형이 있나요?"
check_contains "퀴즈 페이지에 고유 해석 가이드" "$BASE/q/meta-sensing" "감정이 생긴 순간을 알아차리는지"
check_contains "밸런스게임 제목과 실제 문항 수 일치" "$BASE/q/balance-game" "총 20개 문항"
check_contains "퀴즈 결과에 채점 설명" "$BASE/q/meta-sensing/r/detective" "이 결과는 어떻게 정해졌나요?"
check_header_contains "퀴즈 결과 페이지 색인 제외" "$BASE/q/meta-sensing/r/detective" "X-Robots-Tag: noindex, follow"
check_status "존재하지 않는 퀴즈는 실제 404" "$BASE/q/nope" 404
check_contains "404 페이지에 검색 제외 메타" "$BASE/q/nope" 'name="robots" content="noindex, follow"'
check_header_contains "404 페이지에 검색 제외 헤더" "$BASE/q/nope" "X-Robots-Tag: noindex, follow"
check_status "존재하지 않는 일반 주소는 실제 404" "$BASE/not-a-real-page" 404
check_status "존재하지 않는 가이드는 실제 404" "$BASE/guides/not-a-guide" 404
check_status "존재하지 않는 MBTI 유형은 실제 404" "$BASE/mbti/type/XXXX" 404

if node -e "for (const q of require('./data/quizzes')) for (const item of q.questions) { const texts=item.options.map(o=>o.text); if (texts.length < 2 || texts.length > 4 || new Set(texts).size !== texts.length) process.exit(1); }"; then
  echo "PASS  모든 테스트 문항의 선택지 수·중복 검증"
  pass=$((pass+1))
else
  echo "FAIL  선택지 수가 잘못되었거나 중복 문구가 있는 테스트 문항 발견"
  fail=$((fail+1))
fi

check_status "Render 기본 주소는 공식 도메인으로 영구 이동" "$BASE/q/meta-sensing" 301 "-HHost:yozeum-test.onrender.com"
check_redirect_location "Render 기본 주소 리다이렉트 목적지" "$BASE/q/meta-sensing" "https://yozeum-test.com/q/meta-sensing" "-HHost:yozeum-test.onrender.com"

echo ""
echo "=== 유형+점수(일치율) 결합형 결과 ==="
check_status "점수 파라미터 포함 결과 페이지" "$BASE/q/meta-sensing/r/detective?s=87" 200
check_contains "점수 파라미터 있으면 일치율 표시" "$BASE/q/meta-sensing/r/detective?s=87" "87%"
if curl -s "$BASE/q/meta-sensing/r/detective" -o /tmp/yozeum_resp.html && ! grep -q 'class="compat-box"' /tmp/yozeum_resp.html; then
  echo "PASS  점수 파라미터 없으면 일치율 블록이 나타나지 않음"
  pass=$((pass+1))
else
  echo "FAIL  점수 파라미터 없는데도 일치율 블록이 나타남"
  fail=$((fail+1))
fi
check_status "범위 밖 점수(999)는 무시하고 정상 렌더링" "$BASE/q/meta-sensing/r/detective?s=999" 200
check_status "다른 퀴즈(vibe-shift)도 점수 결합 정상 동작" "$BASE/q/vibe-shift/r/steady?s=62" 200
check_contains "vibe-shift 결과에도 일치율 표시" "$BASE/q/vibe-shift/r/steady?s=62" "62%"

echo ""
echo "=== 신규 트렌드 테스트: 전생/연애 스타일 ==="
check_status "전생 테스트 페이지" "$BASE/q/past-life" 200
check_status "전생 테스트 결과 페이지" "$BASE/q/past-life/r/strategist" 200
check_contains "전생 테스트 결과에 유형명 노출" "$BASE/q/past-life/r/strategist" "궁중 책사형"
check_status "연애 스타일 테스트 페이지" "$BASE/q/love-style" 200
check_status "연애 스타일 결과 페이지" "$BASE/q/love-style/r/direct" 200
check_contains "연애 스타일 결과에 유형명 노출" "$BASE/q/love-style/r/direct" "직진끝판왕형"
check_status "신규 퀴즈도 일치율 결합 정상 동작" "$BASE/q/past-life/r/mystic?s=73" 200
check_contains "신규 퀴즈 결과에도 일치율 표시" "$BASE/q/past-life/r/mystic?s=73" "73%"

echo ""
echo "=== 신규: 테토·에겐 유형 테스트 ==="
check_status "테토·에겐 테스트 페이지" "$BASE/q/teto-egen" 200
check_contains "홈에 테토·에겐 카드 노출" "$BASE/" "테토·에겐 유형 테스트"
check_contains "테토·에겐의 한계 안내" "$BASE/q/teto-egen" "호르몬 수치를 측정하는 검사가 아니라"
check_status "결과(테토형)" "$BASE/q/teto-egen/r/teto" 200
check_contains "테토형 결과에 유형명 노출" "$BASE/q/teto-egen/r/teto" "테토형"
check_status "결과(에겐형)" "$BASE/q/teto-egen/r/egen" 200
check_contains "에겐형 결과에 유형명 노출" "$BASE/q/teto-egen/r/egen" "에겐형"
check_status "테토 에겐 결과도 일치율 결합 정상 동작" "$BASE/q/teto-egen/r/teto?s=88" 200
check_contains "테토 에겐 결과에도 일치율 표시" "$BASE/q/teto-egen/r/teto?s=88" "88%"
check_contains "sitemap에 /q/teto-egen 포함" "$BASE/sitemap.xml" "/q/teto-egen<"

echo ""
echo "=== 구조화 데이터(JSON-LD) 확장 — 퀴즈·사주결과·일간·운세·궁합 결과 페이지 ==="
check_contains "퀴즈 인트로(teto-egen)에 JSON-LD" "$BASE/q/teto-egen" "application/ld+json"
check_valid_jsonld "퀴즈 인트로(teto-egen)의 JSON-LD 유효성" "$BASE/q/teto-egen"
check_valid_jsonld "퀴즈 결과(teto-egen/teto)의 JSON-LD 유효성" "$BASE/q/teto-egen/r/teto"
check_valid_jsonld "기존 퀴즈 결과(meta-sensing/detective)의 JSON-LD 유효성" "$BASE/q/meta-sensing/r/detective"
check_valid_jsonld "사주 결과의 JSON-LD 유효성" "$BASE/saju/r/1990/5/20/14"
check_valid_jsonld "일간 랜딩(갑목)의 JSON-LD 유효성" "$BASE/ilgan/gap"
check_valid_jsonld "오늘의 운세(쥐띠)의 JSON-LD 유효성" "$BASE/unse/rat"
check_valid_jsonld "띠 궁합 결과의 JSON-LD 유효성" "$BASE/gunghap/r/tiger/horse"

echo ""
echo "=== 사주팔자 계산기 ==="
check_status "사주 폼" "$BASE/saju" 200
check_contains "사주 폼 H1에 무료 만세력 검색어" "$BASE/saju" "무료 만세력·사주팔자 오행 계산기"
check_contains "사주 폼 메타 설명에 양력·절기·오행 정보" "$BASE/saju" "무료 만세력과 사주팔자 오행 계산기"
check_contains "사주 폼에 FAQ 구조화데이터" "$BASE/saju" '"@type":"FAQPage"'
check_contains "사주 폼에 출생시간 FAQ" "$BASE/saju" "태어난 시간을 몰라도 계산할 수 있나요?"
check_contains "사주 폼에 결과 읽는 순서" "$BASE/saju" "만세력 결과는 이 순서로 확인하세요"
check_redirect_location "compute(시간있음)→결과 리다이렉트" "$BASE/saju/compute?year=1990&month=5&day=20&hour=14" "/saju/r/1990/5/20/14"
check_status "결과(시간있음, 1990-05-20 14시)" "$BASE/saju/r/1990/5/20/14" 200
check_header_contains "개인화 사주 결과 색인 제외" "$BASE/saju/r/1990/5/20/14" "X-Robots-Tag: noindex, follow"
check_contains "1990-05-20 년주=庚午" "$BASE/saju/r/1990/5/20/14" "庚午"
check_contains "1990-05-20 14시 시주=癸未" "$BASE/saju/r/1990/5/20/14" "癸未"
check_contains "시간있음 결과는 8글자 기준" "$BASE/saju/r/1990/5/20/14" "8글자 기준"
check_status "결과(시간모름)" "$BASE/saju/r/1990/5/20/unknown" 200
check_contains "시간모름 안내문구" "$BASE/saju/r/1990/5/20/unknown" "시주는 계산에서 제외"
check_contains "시간모름 결과는 6글자 기준" "$BASE/saju/r/1990/5/20/unknown" "6글자 기준"

echo "--- 입춘 경계 테스트 (2000년, 절기 반영 여부) ---"
check_contains "2000-02-03(입춘 전)→己卯" "$BASE/saju/r/2000/2/3/unknown" "己卯"
check_contains "2000-02-05(입춘 후)→庚辰" "$BASE/saju/r/2000/2/5/unknown" "庚辰"

echo "--- 연도 경계값 ---"
check_status "1920년생" "$BASE/saju/r/1920/6/15/unknown" 200
check_status "2026년생" "$BASE/saju/r/2026/6/15/unknown" 200

echo "--- 잘못된 날짜(2월 30일) 처리 ---"
check_status "compute 단계에서 캘린더상 존재 안하는 날짜 차단(폼+에러문구, 200)" "$BASE/saju/compute?year=2000&month=2&day=30&hour=unknown" 200
check_contains "에러 문구 노출" "$BASE/saju/compute?year=2000&month=2&day=30&hour=unknown" "생년월일을 다시 확인해주세요"
check_status "잘못된 날짜 딥링크는 실제 404" "$BASE/saju/r/2000/2/30/unknown" 404

echo "--- 잘못된 입력 방어 ---"
check_status "범위 밖 연도(1800) → 폼으로" "$BASE/saju/compute?year=1800&month=1&day=1&hour=unknown" 200
check_status "시간 파라미터 조작(abc)은 실제 404" "$BASE/saju/r/1990/5/20/abc" 404

echo ""
echo "=== 오늘의 띠별 운세 ==="
check_status "운세 홈" "$BASE/unse" 200
for a in rat ox tiger rabbit dragon snake horse goat monkey rooster dog pig; do
  check_status "운세 개별 페이지: $a" "$BASE/unse/$a" 200
done
check_contains "운세 홈에 12띠 모두 노출" "$BASE/unse" "쥐띠"
check_contains "운세 홈에 출생연도 저장 기능" "$BASE/unse" "data-save-birth-year"
check_contains "운세 결과에 띠 저장 기능" "$BASE/unse/rat" 'data-save-zodiac="rat"'
check_contains "운세 결과에 띠별 고유 활용 가이드" "$BASE/unse/rat" "필요한 정보와 비용부터"
check_contains "선호 저장 스크립트는 로컬 저장소 사용" "$BASE/js/preferences.js" "window.localStorage"
check_redirect_location "연도로 띠 찾기(1990→午=말띠)" "$BASE/unse/find?year=1990" "/unse/horse"
check_status "잘못된 띠 파라미터는 실제 404" "$BASE/unse/notanaimal" 404

echo ""
echo "=== 띠 궁합 ==="
check_status "궁합 폼" "$BASE/gunghap" 200
check_contains "궁합 폼에 계산 원리 설명" "$BASE/gunghap" "띠 궁합은 어떻게 계산하나요?"
check_contains "궁합 폼에 점수를 만들지 않는 원칙" "$BASE/gunghap" "임의의 퍼센트를 만들거나"
check_redirect_location "compute→결과 리다이렉트" "$BASE/gunghap/compute?my=tiger&partner=horse" "/gunghap/r/tiger/horse"
check_contains "인오술 삼합 관계 판정" "$BASE/gunghap/r/tiger/horse" "삼합"
check_contains "자오 충 관계 판정" "$BASE/gunghap/r/rat/horse" "충"
check_contains "자축 육합 관계 판정" "$BASE/gunghap/r/rat/ox" "육합"
check_contains "신자진 삼합 관계 판정" "$BASE/gunghap/r/rat/dragon" "삼합"
check_contains "동갑띠 판정" "$BASE/gunghap/r/rat/rat" "동갑띠"
check_contains "평범한 관계 판정(무관계 쌍)" "$BASE/gunghap/r/rat/tiger" "평범한 관계"
check_header_contains "궁합 결과 페이지 색인 제외" "$BASE/gunghap/r/rat/tiger" "X-Robots-Tag: noindex, follow"
check_status "역순 궁합 URL은 정규 URL로 영구 리다이렉트" "$BASE/gunghap/r/horse/tiger" 301
check_redirect_location "역순 궁합 URL 정규화" "$BASE/gunghap/r/horse/tiger" "/gunghap/r/tiger/horse"
check_status "잘못된 띠 파라미터는 실제 404" "$BASE/gunghap/r/xxx/yyy" 404

echo ""
echo "=== 일간(日干) 랜딩 페이지 ==="
for k in gap eul byeong jeong mu gi gyeong sin im gye; do
  check_status "일간 랜딩: $k" "$BASE/ilgan/$k" 200
done
check_contains "갑목 페이지에 오행 성격 노출" "$BASE/ilgan/gap" "갑목"
check_contains "갑목 페이지에 다른 일간 링크그리드" "$BASE/ilgan/gap" "link-grid"
check_status "잘못된 일간 키는 실제 404" "$BASE/ilgan/notakey" 404

echo ""
echo "=== 내부 링크 그리드(폼 화면) ==="
check_contains "사주 폼에 일간별 링크그리드" "$BASE/saju" "link-grid"
check_contains "궁합 폼에 인기 조합 링크그리드" "$BASE/gunghap" "link-grid"

echo ""
echo "=== 공유·개인정보·정적 자원 보호 ==="
check_contains "공유 URL에 캠페인 식별값" "$BASE/q/meta-sensing/r/detective" "utm_campaign=result_share"
check_contains "공유 이벤트는 GA4 권장 share 이름 사용" "$BASE/js/result-share.js" "'event', 'share'"
check_contains "공유 취소는 복사로 오인 처리하지 않음" "$BASE/js/result-share.js" "AbortError"
check_contains "개인정보처리방침에 로컬 저장 안내" "$BASE/privacy.html" "브라우저의 로컬 저장소"
for i in $(seq 1 305); do curl -s -o /dev/null "$BASE/css/style.css"; done
check_status "정적 파일 반복 요청이 페이지 제한량을 소모하지 않음" "$BASE/about" 200

echo ""
echo "=== 네이버 서치어드바이저 검증 태그 (env 미설정 시 노출 안함) ==="
curl -s "$BASE/" -o /tmp/yozeum_resp.html
if grep -q "naver-site-verification" /tmp/yozeum_resp.html; then
  echo "FAIL  env 미설정인데 naver-site-verification 태그가 출력됨"
  fail=$((fail+1))
else
  echo "PASS  env 미설정 시 naver-site-verification 태그 없음"
  pass=$((pass+1))
fi

echo ""
echo "=== 결과 ==="
echo "PASS: $pass  FAIL: $fail"

kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

if [ "$fail" -gt 0 ]; then
  echo ""
  echo "=== 서버 로그 (실패 있어 출력) ==="
  cat /tmp/yozeum_test_server.log
  exit 1
fi
exit 0
