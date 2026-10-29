/* Products built from Source: arrows and a counter, like the other carousels. Swipe, scroll
   or press an arrow; the counter follows the scroll. */
(() => {
  document.querySelectorAll('.showcase').forEach((fig) => {
    const track = fig.querySelector('.sc-track');
    const cards = [...track.querySelectorAll('.sc-card')];
    const controls = fig.querySelector('.sc-controls');
    if (cards.length < 2) { controls.hidden = true; return; }
    const prev = controls.querySelector('.carousel-prev');
    const next = controls.querySelector('.carousel-next');
    const count = controls.querySelector('.carousel-count');
    let at = 0;
    const go = (i) => {
      i = Math.max(0, Math.min(cards.length - 1, i));
      track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft });
    };
    const update = () => {
      const x = track.scrollLeft;
      at = 0;
      cards.forEach((c, i) => { if (Math.abs(c.offsetLeft - cards[0].offsetLeft - x) < Math.abs(cards[at].offsetLeft - cards[0].offsetLeft - x)) at = i; });
      // at the very end the last card can't snap to the start, so count it as reached
      if (x + track.clientWidth >= track.scrollWidth - 4) at = cards.length - 1;
      count.textContent = (at + 1) + ' / ' + cards.length;
      prev.disabled = at === 0;
      next.disabled = at === cards.length - 1;
    };
    prev.addEventListener('click', () => go(at - 1));
    next.addEventListener('click', () => go(at + 1));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(at - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(at + 1); }
    });
    track.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  });
})();
