(function () {
  const YEAR_KEY = 'yozeum_birth_year';
  const ZODIAC_KEY = 'yozeum_zodiac';
  const zodiacNames = {
    rat: '쥐', ox: '소', tiger: '호랑이', rabbit: '토끼', dragon: '용', snake: '뱀',
    horse: '말', goat: '양', monkey: '원숭이', rooster: '닭', dog: '개', pig: '돼지',
  };

  function read(key) {
    try { return window.localStorage.getItem(key); } catch (error) { return null; }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function track(type) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'save_preference', { preference_type: type });
    }
  }

  const savedYear = Number(read(YEAR_KEY));
  document.querySelectorAll('form[data-save-birth-year]').forEach((form) => {
    const select = form.querySelector('select[name="year"]');
    if (!select) return;
    if (Number.isInteger(savedYear) && select.querySelector(`option[value="${savedYear}"]`)) {
      select.value = String(savedYear);
    }
    form.addEventListener('submit', () => {
      if (select.value && write(YEAR_KEY, select.value)) track('birth_year');
    });
  });

  const savedZodiac = read(ZODIAC_KEY);
  if (zodiacNames[savedZodiac]) {
    document.querySelectorAll('[data-saved-fortune]').forEach((link) => {
      link.href = `/unse/${savedZodiac}`;
      link.textContent = `저장한 ${zodiacNames[savedZodiac]}띠 오늘 운세 바로 보기 →`;
      link.hidden = false;
    });
  }

  document.querySelectorAll('[data-save-zodiac]').forEach((button) => {
    const zodiac = button.dataset.saveZodiac;
    const status = button.parentElement.querySelector('[data-save-status]');
    if (!zodiacNames[zodiac]) return;

    if (savedZodiac === zodiac) {
      button.textContent = `${zodiacNames[zodiac]}띠 저장됨`;
      if (status) status.textContent = '이 브라우저에 저장되어 있어요.';
    }

    button.addEventListener('click', () => {
      if (!write(ZODIAC_KEY, zodiac)) {
        if (status) status.textContent = '브라우저 설정 때문에 저장하지 못했어요.';
        return;
      }
      button.textContent = `${zodiacNames[zodiac]}띠 저장됨`;
      if (status) status.textContent = '다음 방문부터 홈에서 바로 이동할 수 있어요.';
      track('zodiac');
    });
  });
})();
