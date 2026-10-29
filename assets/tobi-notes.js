/* Labels beside the TOBi live demo (Paul 2026-10-28): each building block of the chat gets a small tag
   with a line to it, following the latest message, card and options as the conversation plays.
   Tags sit outside the chat, on the pink, wherever there is room. */
(() => {
  const root = document.querySelector('.tp-play');
  if (!root) return;
  const panel = root.querySelector('.tp-panel');
  const frame = root.querySelector('.tp-frame');
  const layer = document.createElement('div');
  layer.className = 'tp-notes';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<svg class="tp-lines"></svg>';
  panel.appendChild(layer);
  const svg = layer.firstChild;

  const cardName = (el) => {
    const t = el.textContent.toLowerCase();
    if (/spend/.test(t)) return 'Spend card';
    if (/call ?back|call you/.test(t)) return 'Call-back card';
    if (/bill/.test(t)) return 'Bill card';
    if (/iphone|samsung|galaxy|pixel|handset/.test(t)) return 'Phone card';
    if (/plan|data|unlimited/.test(t)) return 'Plan card';
    return 'Content card';
  };
  const last = (d, sel) => { const all = d.querySelectorAll(sel); return all[all.length - 1] || null; };
  // side: where the tag goes; wide: the element spans the chat, so the tag only fits outside it
  const TARGETS = [
    { key: 'header', side: 'right', wide: true, find: (d) => d.querySelector('.chat-header'), name: () => 'Header and presence' },
    { key: 'bot', side: 'right', find: (d) => last(d, '#thread .row:not(.me) .bubble'), name: () => 'Message bubble' },
    { key: 'me', side: 'left', alt: 'right', find: (d) => last(d, '#thread .row.me .stack'), name: () => 'Sent message and read state' },
    { key: 'typing', side: 'right', find: (d) => last(d, '#thread .typing'), name: () => 'Typing state' },
    { key: 'notice', side: 'left', find: (d) => last(d, '#thread .notice'), name: () => 'Notification' },
    { key: 'card', side: 'right', find: (d) => last(d, '#thread .card'), name: cardName },
    { key: 'quick', side: 'right', pane: '#quick', find: (d) => {
      // the options scroll sideways: point at the last one in view
      const q = d.getElementById('quick'); if (!q) return null;
      const qr = q.getBoundingClientRect();
      const shown = [...q.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().right <= qr.right + 1);
      return shown[shown.length - 1] || null;
    }, name: () => 'Options' },
    { key: 'composer', side: 'left', wide: true, find: (d) => d.querySelector('.composer'), name: () => 'Composer' },
  ];
  const tags = {};
  TARGETS.forEach((t) => {
    const el = document.createElement('span');
    el.className = 'tp-tag';
    layer.appendChild(el);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '3.5');
    svg.append(line, dot);
    tags[t.key] = { el, line, dot, target: null };
  });

  const GAP = 32, PAD = 16, ROW = 36;
  const draw = () => {
    let d;
    try { d = frame.contentDocument; } catch (e) { return; }
    const chat = d && d.getElementById('frame');
    const pr = panel.getBoundingClientRect();
    if (!chat || innerWidth <= 700) { layer.classList.remove('on'); return; }
    layer.classList.add('on');
    svg.setAttribute('width', pr.width); svg.setAttribute('height', pr.height);
    const fr = frame.getBoundingClientRect();
    const ox = fr.left - pr.left, oy = fr.top - pr.top;
    const box = (r) => ({ l: r.left + ox, r: r.right + ox, t: r.top + oy, b: r.bottom + oy });
    const c = box(chat.getBoundingClientRect());
    const thread = d.getElementById('thread');
    const tv = thread ? box(thread.getBoundingClientRect()) : c;
    const minX = PAD, maxX = pr.width - PAD;
    const placed = { left: [], right: [] };
    TARGETS.forEach((t) => {
      const tag = tags[t.key];
      const el = t.find(d);
      const r = el && el.getClientRects().length ? box(el.getBoundingClientRect()) : null;
      const inThread = el && thread && thread.contains(el);
      const ay = r && r.t + Math.min((r.b - r.t) / 2, 22);
      const seen = r && r.b - r.t > 4 && (!inThread || (ay > tv.t + 6 && ay < tv.b - 6));
      if (!seen) { tag.el.classList.remove('in'); tag.line.classList.remove('in'); tag.dot.classList.remove('in'); tag.target = null; return; }
      const name = t.name(el);
      if (tag.el.textContent !== name) tag.el.textContent = name;
      if (tag.target !== el) { tag.target = el; tag.el.classList.remove('in'); void tag.el.offsetWidth; }
      const w = tag.el.offsetWidth;
      // always outside the chat, on the pink, and only from a pane that reaches the chat's edge
      // (a line never crosses the conversation list); no room, no tag
      const pane = inThread ? tv : t.pane ? box(d.querySelector(t.pane).getBoundingClientRect()) : r;
      const fit = (side) => {
        if (side === 'right') {
          const out = Math.max(r.r + GAP, c.r + GAP);
          if (out + w <= maxX && c.r - pane.r < 40) return out;
        } else {
          const out = Math.min(r.l - GAP, c.l - GAP) - w;
          if (out >= minX && pane.l - c.l < 40) return out;
        }
        return null;
      };
      let side = t.side, x = fit(side);
      if (x == null && t.alt) { side = t.alt; x = fit(side); }
      if (x == null) { tag.el.classList.remove('in'); tag.line.classList.remove('in'); tag.dot.classList.remove('in'); return; }
      // the line starts at the chat's edge, level with the element, and never crosses the screen
      placed[side].push({ tag, x, w, ay, ex: side === 'right' ? c.r : c.l });
    });
    ['left', 'right'].forEach((s) => {
      let floor = -Infinity;
      placed[s].sort((a, b) => a.ay - b.ay).forEach((p) => {
        const y = Math.max(p.ay, floor + ROW);
        floor = y;
        p.tag.el.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(y)}px) translateY(-50%)`;
        const tx = s === 'right' ? p.x : p.x + p.w;
        const ex = p.ex + (s === 'right' ? 6 : -6);
        const bend = s === 'right' ? tx - 12 : tx + 12;
        p.tag.line.setAttribute('d', `M${ex},${p.ay} L${bend},${p.ay} L${tx},${y}`);
        p.tag.dot.setAttribute('cx', ex); p.tag.dot.setAttribute('cy', p.ay);
        [p.tag.el, p.tag.line, p.tag.dot].forEach((n) => n.classList.add('in'));
      });
    });
  };

  // redraw every frame while the demo is on screen: messages arrive, the thread scrolls and the
  // chat resizes between breakpoints, and the tags follow all of it
  let raf = 0, live = false;
  const loop = () => { draw(); raf = live ? requestAnimationFrame(loop) : 0; };
  new IntersectionObserver(([e]) => { live = e.isIntersecting; if (live && !raf) loop(); }).observe(panel);
})();
