/* TOBi badge on the live demo (Paul 2026-10-28): top right of the pink, a white rounded rectangle
   with "Try the demo, tap a reply" and TOBi in a white oval. TOBi idles as in the hero, and while the pill is open
   he now and then eases into whistling, as if waiting; once someone uses the chat the text folds away and only
   TOBi stays, until the chat is restarted. */
(() => {
  const root = document.querySelector('.tp-play');
  if (!root || !window.TOBI_FACE) return;
  const panel = root.querySelector('.tp-panel');
  const frame = root.querySelector('.tp-frame');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const st = document.createElement('style');
  st.textContent = window.TOBI_FACES_CSS;
  document.head.appendChild(st);

  const badge = document.createElement('div');
  badge.className = 'tp-badge';
  badge.innerHTML = '<p class="tp-badge-text"><span class="tp-badge-k">Try the demo</span><span>Tap a reply</span></p><span class="tp-badge-face" aria-hidden="true"><span class="on"></span></span>';
  panel.appendChild(badge);
  const layer = badge.querySelector('.tp-badge-face > span');
  layer.innerHTML = window.TOBI_FACE;
  const q = (s) => layer.querySelector(s);
  const head = q('[data-head]'), mark = q('[data-mark]'), feats = q('[data-feats]');
  const smile = q('[data-smile]'), whistle = q('[data-whistle]'), notes = q('[data-notes]');

  // One face, one clock. Idle 1 as in the hero: bob 3.6 s, and the face turns so the eyes, mouth and the mark
  // slide across the helmet (the mark travels further). Whistling is the same face eased into a sway with the
  // whistle mouth and notes, so there is no picture swap to spot.
  const TAU = Math.PI * 2, IDLE = 8000, WHISTLE = 4600;
  let w = 0, goal = 0, last = 0, raf = 0, timer = 0, live = false;
  const frameAt = (now) => {
    const dt = last ? Math.min(now - last, 100) : 0; last = now;
    w += (goal - w) * (1 - Math.exp(-dt / 320));
    const s = now / 1000, k = w * w * (3 - 2 * w);
    const bob = 0.5 - 0.5 * Math.cos(s / 3.6 * TAU), sw = 0.5 - 0.5 * Math.cos(s / 2.8 * TAU);
    const y = -(2.4 * (1 - k) * bob + 3 * k * sw), r = 2.4 * k * -Math.cos(s / 2.8 * TAU);
    head.style.transform = `translateY(${y.toFixed(3)}%) rotate(${r.toFixed(3)}deg)`;
    const t = s / 3.6 * TAU, x = Math.sin(t) * (1 - k), v = Math.sin(2 * t) * (1 - k);
    feats.setAttribute('transform', `translate(${(6.5 * x).toFixed(2)} ${(-1.6 * v).toFixed(2)})`);
    mark.setAttribute('transform', `translate(${(8.5 * x).toFixed(2)} ${(-1.2 * v + 1.2 * Math.abs(x)).toFixed(2)})`);
    smile.style.opacity = (1 - k).toFixed(3);
    whistle.style.opacity = notes.style.opacity = k.toFixed(3);
    raf = requestAnimationFrame(frameAt);
  };
  // he only whistles while the pill is open, as if waiting for a tap; once used he stays on idle
  const waiting = () => !badge.classList.contains('used');
  const next = () => { goal = goal ? 0 : 1; timer = setTimeout(next, goal ? WHISTLE : IDLE); };
  const run = (on) => {
    live = on; clearTimeout(timer); cancelAnimationFrame(raf); last = 0;
    if (!on || still) return;
    raf = requestAnimationFrame(frameAt);
    if (waiting()) timer = setTimeout(next, goal ? WHISTLE : IDLE);
  };
  new IntersectionObserver(([e]) => run(e.isIntersecting)).observe(panel);

  // pop in each time the badge comes on screen, so it arrives again after scrolling away
  new IntersectionObserver(([e]) => badge.classList.toggle('in', e.isIntersecting), { threshold: .6 }).observe(badge);

  // the first tap, click or key inside the chat folds the text away; restarting the chat brings it back
  const done = () => { badge.classList.add('used'); clearTimeout(timer); goal = 0; };
  const arm = () => {
    let d; try { d = frame.contentDocument; } catch (e) { return; }
    if (!d) return;
    ['pointerdown', 'keydown'].forEach((t) => { d.removeEventListener(t, done); d.addEventListener(t, done, { once: true }); });
  };
  frame.addEventListener('load', arm);
  root.addEventListener('click', (e) => {
    if (!e.target.closest('[data-act="restart"]')) return;
    badge.classList.remove('used');
    arm();
    run(live);
  });
})();
