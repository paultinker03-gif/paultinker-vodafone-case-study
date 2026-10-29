/* "TOBi today": on tablet and up the still phone becomes the live conversation from the AI log
   (assets/tobi/chat.html, a copy of ai.paultinker.uk/assets/tobi/chat.html), playing all six
   steps on a loop while it's on screen, with a pause button. Phones, reduced motion and no-JS keep
   the still image. */
(() => {
  const fig = document.querySelector('[data-tobi-live]');
  if (!fig) return;
  if (matchMedia('(max-width: 700px), (max-height: 500px) and (orientation: landscape)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const DWELL = 3200, REST = 6000;
  const phone = document.createElement('div');
  phone.className = 'now-phone';
  phone.innerHTML = '<iframe src="assets/tobi/chat.html?v=1" title="TOBi on a phone, answering why a bill is higher" tabindex="-1" aria-hidden="true"></iframe>';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'now-pause';
  const PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>';
  btn.innerHTML = PAUSE;
  btn.setAttribute('aria-label', 'Pause the conversation');
  const still = fig.querySelector('img');
  fig.classList.add('is-live');
  fig.append(phone, btn);
  const frame = phone.querySelector('iframe');

  let at = 0, paused = false, visible = false, waiting = false, timer = 0, started = false;
  const demo = () => { try { return frame.contentWindow && frame.contentWindow.tobiDemo; } catch (e) { return null; } };
  // once a step's messages are all in, wait, then the next step; after the last, rest and start again
  const next = () => {
    clearTimeout(timer);
    if (paused || !visible) { waiting = true; return; }
    timer = setTimeout(() => {
      if (paused || !visible) { waiting = true; return; }
      const d = demo(); if (!d) return;
      at = at >= d.steps - 1 ? 0 : at + 1;
      d.go(at, next, false);
    }, at >= (demo() || { steps: 6 }).steps - 1 ? REST : DWELL);
  };
  const start = () => {
    if (started || !demo()) return;
    started = true;
    still.setAttribute('aria-hidden', 'true');
    demo().go(0, next, false);
  };
  frame.addEventListener('load', () => { if (visible) start(); });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (!visible) return;
    if (!started) start();
    else if (waiting) { waiting = false; next(); }
  }, { threshold: 0.35 }).observe(fig);
  btn.addEventListener('click', () => {
    paused = !paused;
    btn.innerHTML = paused ? PLAY : PAUSE;
    btn.setAttribute('aria-label', paused ? 'Play the conversation' : 'Pause the conversation');
    if (!paused && waiting) { waiting = false; next(); }
  });
})();
