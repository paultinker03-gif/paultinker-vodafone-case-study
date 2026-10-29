/* The TOBi live demo (see tobi-play.css). The demo is same-origin, so its own portfolio bar and toolbar
   are hidden from here and its breakpoint buttons are pressed for it. Phones get the mobile chat only. */
(() => {
  const root = document.querySelector('.tp-play');
  if (!root) return;
  const frame = root.querySelector('.tp-frame');
  const phone = matchMedia('(max-width: 700px)');
  let bp = phone.matches ? 'mobile' : 'desktop';
  const doc = () => { try { return frame.contentDocument; } catch (e) { return null; } };
  const press = (id) => { const d = doc(), b = d && d.getElementById(id); if (b) b.click(); };
  const sync = () => root.querySelectorAll('.tp-seg button[data-bp]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.bp === bp)));
  frame.addEventListener('load', () => {
    const d = doc();
    if (!d) return;
    const st = d.createElement('style');
    st.textContent = '.portfolio-bar,.toolbar{display:none!important}html,body,.shell,.stage{background:transparent!important}.frame{box-shadow:none!important;border:8px solid #cbb3b5!important;border-radius:18px!important;overflow:hidden!important}#sendBtn{padding:0!important;display:grid!important;place-items:center!important;aspect-ratio:1}#sendBtn>span{display:none!important}#sendBtn::before{content:"";width:20px;height:20px;background:#fff;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27black%27 stroke=%27black%27 stroke-width=%272%27 stroke-linejoin=%27round%27%3E%3Cpath transform=%27rotate(-45 12 12)%27 d=%27M4.4 4.5 21 12 4.4 19.5 9.2 12Z%27/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27black%27 stroke=%27black%27 stroke-width=%272%27 stroke-linejoin=%27round%27%3E%3Cpath transform=%27rotate(-45 12 12)%27 d=%27M4.4 4.5 21 12 4.4 19.5 9.2 12Z%27/%3E%3C/svg%3E") center/contain no-repeat}';
    d.head.appendChild(st);
    d.documentElement.setAttribute('data-theme', 'light');
    press({ mobile: 'bpMobile', tablet: 'bpTablet', desktop: 'bpDesktop' }[bp]);
  });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('.tp-seg button');
    if (!b) return;
    if (b.dataset.act === 'restart') { press('restart'); return; }
    bp = b.dataset.bp;
    sync();
    press({ mobile: 'bpMobile', tablet: 'bpTablet', desktop: 'bpDesktop' }[bp]);
  });
  phone.addEventListener('change', () => { if (phone.matches && bp !== 'mobile') { bp = 'mobile'; sync(); press('bpMobile'); } });
  sync();
  // load the demo (about 1 MB) only as it comes near the screen
  new IntersectionObserver((es, io) => {
    if (es.some((x) => x.isIntersecting)) { io.disconnect(); frame.src = frame.dataset.src; }
  }, { rootMargin: '800px 0px' }).observe(root);
})();
