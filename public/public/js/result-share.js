document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('copy-link-btn');
  if (!btn) return;

  const url = btn.dataset.url;
  const text = btn.dataset.text;

  btn.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url });
        return;
      } catch (err) {
        // 사용자가 공유를 취소한 경우 등 - 클립보드 복사로 폴백
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      const original = btn.textContent;
      btn.textContent = '복사 완료! 붙여넣기로 공유해보세요';
      setTimeout(() => {
        btn.textContent = original;
      }, 2000);
    } catch (err) {
      window.prompt('아래 링크를 복사해서 공유하세요', url);
    }
  });
});
