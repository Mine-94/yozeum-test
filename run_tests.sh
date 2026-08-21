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
  local desc="$1" url="$2" needle="$3"
  loc=$(curl -s -o /dev/null -D - "$url" | grep -i '^location:' | tr -d '\r')
  if echo "$loc" | grep -q "$needle"; then
    echo "PASS  redirect→'$needle': $desc ($loc)"
    pass=$((pass+1))
  else
    echo "FAIL  redirect expected '$needle': $desc (got: $loc)"
    fail=$((fail+1))
  fi
}

echo ""
echo "=== 기본 페이지 ==="
check_status "홈" "$BASE/" 200
check_contains "홈에 사주·운세 섹션" "$BASE/" "사주"
check_contains "홈에 트렌드 테스트 섹션" "$BASE/" "트렌드 테스트"
check_status "개인정보처리방침" "$BASE/privacy.html" 200
check_status "이용약관" "$BASE/terms.html" 200
check_status "robots.txt" "$BASE/robots.txt" 200
check_contains "robots.txt sitemap 링크" "$BASE/robots.txt" "Sitemap:"
check_status "sitemap.xml" "$BASE/sitemap.xml" 200
check_contains "sitemap에 /saju 포함" "$BASE/sitemap.xml" "/saju"
check_contains "sitemap에 /unse 포함" "$BASE/sitemap.xml" "/unse"
check_contains "sitemap에 /gunghap 포함" "$BASE/sitemap.xml" "/gunghap"

echo ""
echo "=== 기존 퀴즈 회귀 테스트 ==="
check_status "퀴즈 페이지" "$BASE/q/meta-sensing" 200
check_status "퀴즈 결과 페이지" "$BASE/q/meta-sensing/r/detective" 200
check_status "존재하지 않는 퀴즈 → 홈 리다이렉트" "$BASE/q/nope" 302

echo ""
echo "=== 사주팔자 계산기 ==="
check_status "사주 폼" "$BASE/saju" 200
check_redirect_location "compute(시간있음)→결과 리다이렉트" "$BASE/saju/compute?year=1990&month=5&day=20&hour=14" "/saju/r/1990/5/20/14"
check_status "결과(시간있음, 1990-05-20 14시)" "$BASE/saju/r/1990/5/20/14" 200
check_contains "1990-05-20 년주=庚午" "$BASE/saju/r/1990/5/20/14" "庚午"
check_contains "1990-05-20 14시 시주=癸未" "$BASE/saju/r/1990/5/20/14" "癸未"
check_status "결과(시간모름)" "$BASE/saju/r/1990/5/20/unknown" 200
check_contains "시간모름 안내문구" "$BASE/saju/r/1990/5/20/unknown" "시주는 계산에서 제외"

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
check_status "잘못된 띠 파라미터 → 폼 리다이렉트" "$BASE/gunghap/r/xxx/yyy" 302

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
