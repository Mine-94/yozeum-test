document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('mbti-first');
  const button = document.getElementById('mbti-invite-btn');
  const status = document.getElementById('invite-status');
  if (!select || !button) return;

  function updateButton() {
    button.disabled = !select.value;
  }

  function track(method, type) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'share', { method, content_type: 'mbti_friend_invite', item_id: type });
    }
  }

  async function copyInvite(text, url) {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      if (status) status.textContent = '초대 링크를 복사했어요. 친구에게 붙여넣어 보내주세요.';
      track('copy_link', select.value);
    } catch (error) {
      window.prompt('아래 링크를 복사해서 친구에게 보내주세요.', url);
      if (status) status.textContent = '링크를 선택해 직접 복사해주세요.';
      track('manual_copy', select.value);
    }
  }

  select.addEventListener('change', updateButton);
  updateButton();

  button.addEventListener('click', async () => {
    if (!select.value) return;
    const url = new URL(button.dataset.baseUrl);
    url.searchParams.set('first', select.value);
    url.searchParams.set('utm_source', 'user_share');
    url.searchParams.set('utm_medium', 'referral');
    url.searchParams.set('utm_campaign', 'mbti_friend_invite');
    const text = `나는 ${select.value}야. 너의 MBTI를 골라 우리 관계 방식을 비교해보자.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'MBTI 궁합 같이 보기', text, url: url.toString() });
        if (status) status.textContent = '초대 링크를 공유했어요.';
        track('web_share', select.value);
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
      }
    }
    await copyInvite(text, url.toString());
  });
});
