/* ExeedFit — interactive layer: neural network hero, DNA helix, counters, reveals */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- neural / molecular network (hero) ---------- */
  const net = document.getElementById('net');
  if (net) {
    const ctx = net.getContext('2d');
    let w, h, nodes = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    function resize() {
      const r = net.parentElement.getBoundingClientRect();
      w = r.width; h = r.height;
      net.width = w * dpr; net.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(130, (w * h) / 11000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        r: 1.2 + Math.random() * 2.2, hue: Math.random() < .7 ? '34,211,238' : (Math.random() < .5 ? '52,211,153' : '167,139,250')
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      const link = 140;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 160) { a.x += (a.x - mouse.x) / dm * .6; a.y += (a.y - mouse.y) / dm * .6; }
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < link) {
            ctx.strokeStyle = 'rgba(' + a.hue + ',' + (0.35 * (1 - d / link)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const a of nodes) {
        ctx.fillStyle = 'rgba(' + a.hue + ',.9)';
        ctx.shadowColor = 'rgba(' + a.hue + ',.8)'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      if (!reduce) requestAnimationFrame(frame);
    }
    resize(); frame();
    window.addEventListener('resize', resize);
    net.parentElement.addEventListener('pointermove', e => {
      const r = net.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    net.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  }

  /* ---------- DNA helix (technology) ---------- */
  const hx = document.getElementById('helix');
  if (hx) {
    const c = hx.getContext('2d');
    let w, h, t = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      const r = hx.getBoundingClientRect(); w = r.width; h = r.height;
      hx.width = w * dpr; hx.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      c.clearRect(0, 0, w, h);
      const cx = w / 2, amp = Math.min(w * .28, 150), steps = 34, gap = h / steps;
      const pts = [];
      for (let i = -1; i <= steps + 1; i++) {
        const y = i * gap, ph = i * .42 + t;
        const x1 = cx + Math.sin(ph) * amp, x2 = cx + Math.sin(ph + Math.PI) * amp;
        const z1 = (Math.cos(ph) + 1) / 2, z2 = (Math.cos(ph + Math.PI) + 1) / 2;
        pts.push({ y, x1, x2, z1, z2 });
      }
      // rungs (base pairs)
      pts.forEach((p, i) => {
        if (i % 2) return;
        const g = c.createLinearGradient(p.x1, p.y, p.x2, p.y);
        g.addColorStop(0, 'rgba(34,211,238,.55)'); g.addColorStop(.5, 'rgba(167,139,250,.35)'); g.addColorStop(1, 'rgba(52,211,153,.55)');
        c.strokeStyle = g; c.lineWidth = 2;
        c.beginPath(); c.moveTo(p.x1, p.y); c.lineTo(p.x2, p.y); c.stroke();
      });
      // strands
      [['x1', 'z1', '34,211,238'], ['x2', 'z2', '52,211,153']].forEach(([k, zk, col]) => {
        c.lineWidth = 3; c.strokeStyle = 'rgba(' + col + ',.45)';
        c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[k], p.y) : c.moveTo(p[k], p.y)); c.stroke();
        pts.forEach(p => {
          const z = p[zk], r = 3 + z * 5;
          c.fillStyle = 'rgba(' + col + ',' + (0.35 + z * .65).toFixed(2) + ')';
          c.shadowColor = 'rgba(' + col + ',.9)'; c.shadowBlur = 6 + z * 14;
          c.beginPath(); c.arc(p[k], p.y, r, 0, Math.PI * 2); c.fill();
        });
      });
      c.shadowBlur = 0;
      // HUD text
      c.fillStyle = 'rgba(143,166,194,.9)'; c.font = '11px "IBM Plex Mono", monospace';
      c.fillText('SEQ // PATIENT-DOCTOR MATCH', 14, 22);
      c.fillText('MODEL: CLOUD → AI', 14, h - 14);
      t += reduce ? 0 : .018;
      if (!reduce) requestAnimationFrame(draw);
    }
    size(); draw(); window.addEventListener('resize', size);
  }

  /* ---------- counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const fmt = n => n.toLocaleString('en-IN');
  function runCounter(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '', dur = 1600, start = performance.now();
    if (reduce) { el.textContent = fmt(target) + suffix; return; }
    (function tick(now) {
      const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * e)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      en.target.querySelectorAll('[data-count]').forEach(c => { if (!c.dataset.done) { c.dataset.done = 1; runCounter(c); } });
      io.unobserve(en.target);
    });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  // fallback: anything already visible on load
  setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('in'); el.querySelectorAll('[data-count]').forEach(c => { if (!c.dataset.done) { c.dataset.done = 1; runCounter(c); } }); }
  }), 400);
  counters.forEach(c => { if (!c.closest('.reveal')) runCounter(c); });

  /* ---------- card spotlight ---------- */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ---------- status readout flicker ---------- */
  const st = document.getElementById('r-status');
  if (st && !reduce) {
    const states = ['ONLINE', 'SYNCING', 'ONLINE', 'ONLINE', 'SECURE'];
    let i = 0; setInterval(() => { st.textContent = states[i++ % states.length]; }, 2600);
  }

  /* ---------- form ---------- */
  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const note = document.getElementById('form-note');
    if (!form.checkValidity()) { note.textContent = 'Please fill in your name, a valid email and a message.'; return; }
    note.textContent = 'Thanks. This demo form is not connected to a backend yet, so nothing was sent.';
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
