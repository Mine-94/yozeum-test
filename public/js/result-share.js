document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('copy-link-btn');
  if (!btn) return;

  const url = btn.dataset.url;
  const text = btn.dataset.text;
  const status = document.getElementById('share-status');

  function trackShare(method) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'share', {
        method,
        content_type: 'result',
        item_id: btn.dataset.shareId || window.location.pathname,
      });
    }
  }

  btn.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url });
        if (status) status.textContent = '공유를 완료했어요.';
        trackShare('web_share');
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      trackShare('copy_link');
      if (status) status.textContent = '링크를 복사했어요. 원하는 곳에 붙여넣어 공유해주세요.';
      const original = btn.textContent;
      btn.textContent = '복사 완료! 붙여넣기로 공유해보세요';
      setTimeout(() => {
        btn.textContent = original;
      }, 2000);
    } catch (err) {
      window.prompt('아래 링크를 복사해서 공유하세요', url);
      if (status) status.textContent = '링크를 선택해 직접 복사해주세요.';
      trackShare('manual_copy');
    }
  });
});
