/* "Cards for every task" as a moving band, tablet and up: the card wall sits at the page's content
   width, shorter than the image, and drifts slowly sideways and back. Phones, reduced motion
   and no-JS keep the still image. Only a transform animates, and only while it's on screen. */
(() => {
  const fig = document.querySelector('[data-cards-drift]');
  if (!fig) return;
  if (matchMedia('(max-width: 700px), (max-height: 500px) and (orientation: landscape)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const media = fig.querySelector('.slide-media');
  const img = media.querySelector('img');
  const RATIO = 3600 / 1650, SECONDS = 22;   // one way across
  fig.classList.add('is-drift');
  img.classList.remove('zoom');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cd-pause';
  const PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>';
  btn.innerHTML = PAUSE;
  btn.setAttribute('aria-label', 'Pause the moving cards');
  media.appendChild(btn);

  // the band keeps to the page's content width (full-bleed made the cards huge on big screens); the
  // image is sized a little wider than the band, and the extra width is how far it travels
  let travel = 0;
  const fit = () => {
    const w = media.clientWidth, h = media.clientHeight;
    const imgH = Math.max(h, (w * 1.3) / RATIO);
    img.style.height = imgH + 'px';
    img.style.width = imgH * RATIO + 'px';
    img.style.top = (h - imgH) / 2 + 'px';
    travel = imgH * RATIO - w;
  };

  let t = 0, last = 0, raf = 0, visible = false, paused = false;
  const frame = (now) => {
    raf = 0;
    const dt = last ? Math.min(now - last, 50) / 1000 : 0;
    last = now;
    if (!paused) t += dt;
    // eases in and out at each end: 0 → 1 → 0 over two crossings
    const p = (1 - Math.cos((t / SECONDS) * Math.PI)) / 2;
    img.style.transform = `translate3d(${(-p * travel).toFixed(2)}px, 0, 0)`;
    if (visible && !paused) raf = requestAnimationFrame(frame); else last = 0;
  };
  const start = () => { if (!raf && visible && !paused) raf = requestAnimationFrame(frame); };

  btn.addEventListener('click', () => {
    paused = !paused;
    btn.innerHTML = paused ? PLAY : PAUSE;
    btn.setAttribute('aria-label', paused ? 'Play the moving cards' : 'Pause the moving cards');
    start();
  });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { rootMargin: '100px 0px' }).observe(media);
  addEventListener('resize', fit);
  fit();
  frame(performance.now());
})();
