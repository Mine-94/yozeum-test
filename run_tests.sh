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
check_contains "홈에 트렌드 테스트 섹션" "$BASE/" "트렌드 테스트"
check_contains "홈에 검색용 H1" "$BASE/" "<h1 class=\"home-title\">무료 사주·운세·심리테스트</h1>"
check_contains "홈에 WebSite 구조화데이터" "$BASE/" '"@type":"WebSite"'
check_contains "홈에 콘텐츠 제작 기준 안내" "$BASE/" "결과는 이렇게 만들어요"
check_status "사이트 소개" "$BASE/about" 200
check_contains "사이트 소개에 채점 기준" "$BASE/about" "심리테스트 채점 기준"
check_contains "사이트 소개에 AboutPage 구조화데이터" "$BASE/about" '"@type":"AboutPage"'
check_status "개인정보처리방침" "$BASE/privacy.html" 200
check_status "이용약관" "$BASE/terms.html" 200
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
check_contains "sitemap 공식 도메인" "$BASE/sitemap.xml" "https://yozeum-test.com/"
check_contains "sitemap에 /unse/rat(동적 페이지) 포함" "$BASE/sitemap.xml" "/unse/rat<"
check_contains "sitemap에 /gunghap/r/rat/ox(정규 궁합 조합) 포함" "$BASE/sitemap.xml" "/gunghap/r/rat/ox<"
check_contains "sitemap에 /ilgan/gap(일간 랜딩) 포함" "$BASE/sitemap.xml" "/ilgan/gap<"
check_contains "sitemap에 /ilgan/gye(일간 랜딩 마지막) 포함" "$BASE/sitemap.xml" "/ilgan/gye<"

curl -s "$BASE/sitemap.xml" -o /tmp/yozeum_resp.html
url_count=$(grep -o '<url>' /tmp/yozeum_resp.html | wc -l)
quiz_count=$(node -e "console.log(require('./data/quizzes').length)")
expected=$((7 + quiz_count + 12 + 78 + 10))
echo "sitemap내 URL수: $url_count (기대값: 정적7+퀴즈${quiz_count}+운세12+궁합78+일간10=${expected})"
if [ "$url_count" == "$expected" ]; then
  echo "PASS  sitemap URL 수가 예상과 일치"
  pass=$((pass+1))
else
  echo "FAIL  sitemap URL 수 불일치 (got $url_count, expected $expected)"
  fail=$((fail+1))
fi

echo ""
echo "=== 기존 퀴즈 회귀 테스트 ==="
check_status "퀴즈 페이지" "$BASE/q/meta-sensing" 200
check_status "퀴즈 결과 페이지" "$BASE/q/meta-sensing/r/detective" 200
check_contains "퀴즈 페이지에 이용 안내" "$BASE/q/meta-sensing" "총 8개 문항"
check_contains "퀴즈 페이지에 결과 유형 설명" "$BASE/q/meta-sensing" "어떤 결과 유형이 있나요?"
check_contains "퀴즈 결과에 채점 설명" "$BASE/q/meta-sensing/r/detective" "이 결과는 어떻게 정해졌나요?"
check_header_contains "퀴즈 결과 페이지 색인 제외" "$BASE/q/meta-sensing/r/detective" "X-Robots-Tag: noindex, follow"
check_status "존재하지 않는 퀴즈 → 홈 리다이렉트" "$BASE/q/nope" 302

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
echo "=== 신규: 테토 에겐 유형 테스트 ==="
check_status "테토 에겐 테스트 페이지" "$BASE/q/teto-egen" 200
check_contains "홈에 테토 에겐 카드 노출" "$BASE/" "테토 에겐 유형 테스트"
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
check_status "딥링크로 우회 시도해도 크래시 없이 폼으로 리다이렉트" "$BASE/saju/r/2000/2/30/unknown" 302

echo "--- 잘못된 입력 방어 ---"
check_status "범위 밖 연도(1800) → 폼으로" "$BASE/saju/compute?year=1800&month=1&day=1&hour=unknown" 200
check_status "시간 파라미터 조작(abc) → 홈/폼 리다이렉트" "$BASE/saju/r/1990/5/20/abc" 302

echo ""
echo "=== 오늘의 띠별 운세 ==="
check_status "운세 홈" "$BASE/unse" 200
for a in rat ox tiger rabbit dragon snake horse goat monkey rooster dog pig; do
  check_status "운세 개별 페이지: $a" "$BASE/unse/$a" 200
done
check_contains "운세 홈에 12띠 모두 노출" "$BASE/unse" "쥐띠"
check_redirect_location "연도로 띠 찾기(1990→午=말띠)" "$BASE/unse/find?year=1990" "/unse/horse"
check_status "잘못된 띠 파라미터 → 홈 리다이렉트" "$BASE/unse/notanaimal" 302

echo ""
echo "=== 띠 궁합 ==="
check_status "궁합 폼" "$BASE/gunghap" 200
check_redirect_location "compute→결과 리다이렉트" "$BASE/gunghap/compute?my=tiger&partner=horse" "/gunghap/r/tiger/horse"
check_contains "인오술 삼합 관계 판정" "$BASE/gunghap/r/tiger/horse" "삼합"
check_contains "자오 충 관계 판정" "$BASE/gunghap/r/rat/horse" "충"
check_contains "자축 육합 관계 판정" "$BASE/gunghap/r/rat/ox" "육합"
check_contains "신자진 삼합 관계 판정" "$BASE/gunghap/r/rat/dragon" "삼합"
check_contains "동갑띠 판정" "$BASE/gunghap/r/rat/rat" "동갑띠"
check_contains "평범한 관계 판정(무관계 쌍)" "$BASE/gunghap/r/rat/tiger" "평범한 관계"
check_status "역순 궁합 URL은 정규 URL로 영구 리다이렉트" "$BASE/gunghap/r/horse/tiger" 301
check_redirect_location "역순 궁합 URL 정규화" "$BASE/gunghap/r/horse/tiger" "/gunghap/r/tiger/horse"
check_status "잘못된 띠 파라미터 → 폼 리다이렉트" "$BASE/gunghap/r/xxx/yyy" 302

echo ""
echo "=== 일간(日干) 랜딩 페이지 ==="
for k in gap eul byeong jeong mu gi gyeong sin im gye; do
  check_status "일간 랜딩: $k" "$BASE/ilgan/$k" 200
done
check_contains "갑목 페이지에 오행 성격 노출" "$BASE/ilgan/gap" "갑목"
check_contains "갑목 페이지에 다른 일간 링크그리드" "$BASE/ilgan/gap" "link-grid"
check_status "잘못된 일간 키 → /saju로 리다이렉트" "$BASE/ilgan/notakey" 302

echo ""
echo "=== 내부 링크 그리드(폼 화면) ==="
check_contains "사주 폼에 일간별 링크그리드" "$BASE/saju" "link-grid"
check_contains "궁합 폼에 인기 조합 링크그리드" "$BASE/gunghap" "link-grid"

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
