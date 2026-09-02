document.addEventListener('DOMContentLoaded', () => {
  const questions = window.__MBTI_QUESTIONS__;
  if (!Array.isArray(questions) || !questions.length) return;

  const start = document.getElementById('mbti-start');
  const intro = document.getElementById('mbti-intro');
  const play = document.getElementById('mbti-play');
  const count = document.getElementById('mbti-count');
  const progress = document.getElementById('mbti-progress');
  const question = document.getElementById('mbti-question');
  const left = document.getElementById('mbti-left');
  const right = document.getElementById('mbti-right');

  let index = 0;
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function render() {
    const item = questions[index];
    count.textContent = `${index + 1} / ${questions.length}`;
    progress.style.width = `${(index / questions.length) * 100}%`;
    question.textContent = item.text;
    left.textContent = item.leftLabel;
    right.textContent = item.rightLabel;
  }

  function choose(letter) {
    scores[letter] += 1;
    index += 1;
    if (index < questions.length) return render();

    const type = `${scores.E > scores.I ? 'E' : 'I'}${scores.S > scores.N ? 'S' : 'N'}${scores.T > scores.F ? 'T' : 'F'}${scores.J > scores.P ? 'J' : 'P'}`;
    const pct = (a, b) => Math.round((scores[a] / (scores[a] + scores[b])) * 100);
    const params = new URLSearchParams({
      from: 'test',
      ei: String(pct('E', 'I')),
      sn: String(pct('S', 'N')),
      tf: String(pct('T', 'F')),
      jp: String(pct('J', 'P')),
    });
    let redirected = false;
    const redirect = () => {
      if (redirected) return;
      redirected = true;
      window.location.href = `/mbti/type/${type}?${params.toString()}`;
    };
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_complete', {
        quiz_id: 'mbti',
        result_type: type,
        event_callback: redirect,
        event_timeout: 800,
      });
      window.setTimeout(redirect, 900);
    } else {
      redirect();
    }
  }

  start.addEventListener('click', () => {
    intro.hidden = true;
    play.hidden = false;
    track('quiz_start', { quiz_id: 'mbti' });
    render();
  });
  left.addEventListener('click', () => choose(questions[index].left));
  right.addEventListener('click', () => choose(questions[index].right));
});
