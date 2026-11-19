/**
 * Sounds and small animations for Meowsweeper 2.x. Everything is synthesized
 * with Web Audio (no files) and drawn with CSS (no extra art).
 */

/* ---------------- sounds ---------------- */

let noiseBuf = null;
function noise(ctx) {
  if (noiseBuf && noiseBuf.sampleRate === ctx.sampleRate) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}
function noiseBurst(ctx, bus, at, dur, { type = 'lowpass', freq = 1200, q = 0.7, gain = 0.03, attack = 0.4, release = 0.6 } = {}) {
  const src = ctx.createBufferSource(); src.buffer = noise(ctx); src.loop = true;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(gain, at + attack);
  g.gain.setValueAtTime(gain, at + Math.max(attack, dur - release));
  g.gain.linearRampToValueAtTime(0.0001, at + dur);
  src.connect(f); f.connect(g); g.connect(bus);
  src.start(at, Math.random()); src.stop(at + dur + 0.05);
}
function blip(ctx, bus, at, freq, { type = 'sine', dur = 0.12, gain = 0.05, to = null } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, at);
  if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
  g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(gain, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g); g.connect(bus); o.start(at); o.stop(at + dur + 0.02);
}

/** One 4-second stretch of each room's ambience; the game repeats it. */
const AMB = {
  birds: (at, { ctx, bus }) => {
    for (let i = 0, n = 1 + Math.floor(Math.random() * 3); i < n; i += 1) {
      const t = at + Math.random() * 3.4, f = 2600 + Math.random() * 1400;
      for (let k = 0; k < 2 + Math.floor(Math.random() * 3); k += 1) blip(ctx, bus, t + k * 0.11, f, { to: f * 1.25, dur: 0.08, gain: 0.018 });
    }
  },
  fire: (at, { ctx, bus }) => {
    noiseBurst(ctx, bus, at, 4.2, { freq: 500, gain: 0.012, attack: 0.5, release: 0.5 });
    for (let i = 0; i < 9; i += 1) noiseBurst(ctx, bus, at + Math.random() * 4, 0.03, { type: 'highpass', freq: 2500, gain: 0.03, attack: 0.002, release: 0.02 });
  },
  rain: (at, { ctx, bus }) => noiseBurst(ctx, bus, at, 4.3, { freq: 1600, gain: 0.016, attack: 0.5, release: 0.5 }),
  water: (at, { ctx, bus }) => noiseBurst(ctx, bus, at, 4.3, { freq: 520, gain: 0.02, attack: 1.4, release: 1.4 }),
  wind: (at, { ctx, bus }) => noiseBurst(ctx, bus, at, 4.3, { type: 'bandpass', freq: 380 + Math.random() * 200, q: 1.2, gain: 0.02, attack: 1.6, release: 1.6 }),
  drip: (at, { ctx, bus }) => {
    for (let i = 0; i < 3; i += 1) { const f = 900 + Math.random() * 500; blip(ctx, bus, at + Math.random() * 4, f, { to: f * 1.8, dur: 0.07, gain: 0.03 }); }
  },
  clock: (at, { ctx, bus }) => {
    for (let i = 0; i < 4; i += 1) noiseBurst(ctx, bus, at + i, 0.025, { type: 'bandpass', freq: i % 2 ? 2400 : 1900, q: 6, gain: 0.08, attack: 0.002, release: 0.02 });
  },
  crickets: (at, { ctx, bus }) => {
    for (let c = 0; c < 2; c += 1) {
      const t0 = at + Math.random() * 3;
      for (let k = 0; k < 4; k += 1) blip(ctx, bus, t0 + k * 0.06, 4300, { dur: 0.04, gain: 0.012 });
    }
  },
};

const SCALE = [0, 2, 4, 7, 9, 12, 14, 16];
export const SOUNDS = {
  ...Object.fromEntries(Object.entries(AMB).map(([k, fn]) => [`amb_${k}`, fn])),
  ...Object.fromEntries(SCALE.map((s, i) => [`note${i}`, (at, { ctx, bus }) => {
    const f = 523.25 * 2 ** (s / 12);
    blip(ctx, bus, at, f, { type: 'triangle', dur: 0.22, gain: 0.07 });
    blip(ctx, bus, at, f * 2, { type: 'sine', dur: 0.12, gain: 0.02 });
  }])),
  sparkle: (at, { ctx, bus }) => { [1568, 2093, 2637, 3136].forEach((f, i) => blip(ctx, bus, at + i * 0.07, f, { dur: 0.18, gain: 0.035 })); },
  sweep: (at, { ctx, bus }) => noiseBurst(ctx, bus, at, 0.28, { type: 'bandpass', freq: 2200, q: 0.9, gain: 0.09, attack: 0.06, release: 0.2 }),
  chime: (at, { ctx, bus }) => { [1318, 1760, 2093, 1568, 2637].forEach((f, i) => { blip(ctx, bus, at + i * 0.11, f, { dur: 0.9, gain: 0.03 }); blip(ctx, bus, at + i * 0.11, f * 2.76, { dur: 0.3, gain: 0.006 }); }); },
  water: (at, { ctx, bus }) => { for (let i = 0; i < 7; i += 1) { const f = 700 + Math.random() * 700; blip(ctx, bus, at + i * 0.07 + Math.random() * 0.04, f, { to: f * 2.1, dur: 0.07, gain: 0.04 }); } },
  whoosh: (at, { ctx, bus }) => noiseBurst(ctx, bus, at, 0.45, { type: 'bandpass', freq: 900, q: 0.6, gain: 0.08, attack: 0.15, release: 0.28 }),
  flame: (at, { ctx, bus }) => { noiseBurst(ctx, bus, at, 0.5, { freq: 700, gain: 0.06, attack: 0.03, release: 0.4 }); blip(ctx, bus, at + 0.05, 220, { type: 'triangle', dur: 0.4, gain: 0.05, to: 440 }); },
  pop: (at, { ctx, bus }) => { blip(ctx, bus, at, 420, { type: 'sine', dur: 0.12, gain: 0.09, to: 900 }); },
  thud: (at, { ctx, bus }) => { blip(ctx, bus, at, 140, { type: 'sine', dur: 0.18, gain: 0.12, to: 70 }); noiseBurst(ctx, bus, at, 0.15, { freq: 400, gain: 0.04, attack: 0.005, release: 0.12 }); },
  fanfare: (at, { ctx, bus }) => { [523, 659, 784, 1047].forEach((f, i) => { blip(ctx, bus, at + i * 0.12, f, { type: 'triangle', dur: 0.32, gain: 0.07 }); blip(ctx, bus, at + i * 0.12, f * 2, { dur: 0.2, gain: 0.02 }); }); blip(ctx, bus, at + 0.5, 1047, { type: 'triangle', dur: 0.9, gain: 0.06 }); },
  keepsake: (at, { ctx, bus }) => { [784, 988, 1175, 1568].forEach((f, i) => blip(ctx, bus, at + i * 0.16, f, { dur: 0.8, gain: 0.04 })); },
  star: (at, { ctx, bus }) => blip(ctx, bus, at, 1760, { dur: 0.12, gain: 0.04, to: 2400 }),
  door: (at, { ctx, bus }) => { noiseBurst(ctx, bus, at, 0.7, { type: 'bandpass', freq: 300, q: 2, gain: 0.05, attack: 0.1, release: 0.4 }); blip(ctx, bus, at + 0.05, 180, { type: 'sawtooth', dur: 0.5, gain: 0.02, to: 120 }); },
};

/* ---------------- animations ---------------- */

const reduce = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Where `el` sits inside `box`, in px. */
function within(el, box) {
  const a = el.getBoundingClientRect(), b = box.getBoundingClientRect();
  return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2, w: a.width, h: a.height };
}

/** A woken cat jumps out of its tile with a puff of fur. */
export function catPop(stage, cell, imgSrc) {
  if (reduce() || !cell) return;
  const p = within(cell, stage);
  const el = document.createElement('div');
  el.className = 'ms-catpop';
  el.style.left = `${p.x}px`; el.style.top = `${p.y}px`;
  el.innerHTML = `<i></i><i></i><i></i><i></i><i></i><i></i><img src="${imgSrc}" alt="">`;
  stage.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

/** "+3 ★" floats up from the board to the top of the screen. */
export function starFly(screen, from, n, starSrc) {
  if (!n) return;
  const p = within(from, screen);
  const el = document.createElement('div');
  el.className = 'ms-starfly';
  el.style.left = `${p.x}px`; el.style.top = `${p.y}px`;
  el.innerHTML = `<img src="${starSrc}" alt="">+${n}`;
  screen.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

/** Sparkles over an element (restoration). */
export function sparkles(box, count = 14) {
  if (reduce()) return;
  const layer = document.createElement('div');
  layer.className = 'ms-sparkles';
  for (let i = 0; i < count; i += 1) {
    const s = document.createElement('i');
    s.style.left = `${10 + Math.random() * 80}%`; s.style.top = `${10 + Math.random() * 80}%`;
    s.style.animationDelay = `${Math.random() * 0.9}s`; s.style.setProperty('--s', (0.6 + Math.random() * 0.9).toFixed(2));
    layer.appendChild(s);
  }
  box.appendChild(layer);
  setTimeout(() => layer.remove(), 2200);
}

/** Two doors swing open over `box`. */
export async function doors(box) {
  if (reduce()) return;
  const el = document.createElement('div');
  el.className = 'ms-doors';
  el.innerHTML = '<i></i><i></i>';
  box.appendChild(el);
  await wait(40);
  el.classList.add('open');
  await wait(900);
  el.remove();
}


/**
 * Small images fly one after another from `from` to `to` along an arc, each
 * calling `onLand` as it arrives (the counter ticks up as stars land).
 */
export async function flyTo(screen, from, to, src, count, { onLand, size = 30, gap = 110, ms = 720 } = {}) {
  if (!from || !to || !count) { for (let i = 0; i < count; i += 1) onLand?.(i); return; }
  const a = within(from, screen), b = within(to, screen);
  const n = Math.min(count, 12);
  const runs = [];
  for (let i = 0; i < n; i += 1) {
    runs.push((async () => {
      await wait(i * gap);
      if (reduce()) { onLand?.(i); return; }
      const el = document.createElement('img');
      el.className = 'ms-flyer'; el.src = src; el.alt = '';
      el.style.width = el.style.height = `${size}px`;
      const sx = a.x + (Math.random() - 0.5) * 40, sy = a.y + (Math.random() - 0.5) * 20;
      el.style.left = `${sx - size / 2}px`; el.style.top = `${sy - size / 2}px`;
      screen.appendChild(el);
      const dx = b.x - sx, dy = b.y - sy;
      const lift = Math.min(160, Math.abs(dy) * 0.5 + 60);
      const anim = el.animate([
        { transform: 'translate(0,0) scale(.4)', opacity: 0 },
        { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - lift}px) scale(1.25)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(.7)`, opacity: 1 },
      ], { duration: ms, easing: 'cubic-bezier(.45,.05,.55,.95)' });
      await anim.finished.catch(() => {});
      el.remove();
      onLand?.(i);
    })());
  }
  await Promise.all(runs);
  for (let i = n; i < count; i += 1) onLand?.(i);
}

/** A symbol stamps onto the middle of `box` (a special board, a finale), then fades. */
export async function stamp(box, src, label = '') {
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'ms-stamp';
  el.innerHTML = `<span class="ms-stamp-ring"></span><img src="${src}" alt="">${label ? `<b>${label}</b>` : ''}`;
  box.appendChild(el);
  await wait(reduce() ? 900 : 1700);
  el.classList.add('out');
  await wait(320);
  el.remove();
}

/** Particles for the moment a decoration arrives: light, water, plant, steam, bubbles, notes, dust, shine, fabric. */
export function arriveFx(layer, kind, x, y, w, h) {
  if (reduce()) return;
  const box = document.createElement('div');
  box.className = `ms-arrive k-${kind}`;
  box.style.left = `${x}px`; box.style.top = `${y}px`; box.style.width = `${w}px`; box.style.height = `${h}px`;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const parts = { light: 10, water: 14, plant: 12, steam: 6, bubbles: 10, music: 7, chime: 7, dust: 12, shine: 6, fabric: 10 }[kind] || 10;
  let html = kind === 'light' ? '<span class="ms-halo"></span>' : kind === 'shine' ? '<span class="ms-sheen"></span>' : '';
  for (let i = 0; i < parts; i += 1) {
    const sx = rnd(15, 85), dx = rnd(-60, 60), dy = rnd(-110, -40), d = rnd(0, 500), s = rnd(0.6, 1.3).toFixed(2);
    html += `<i style="left:${sx}%;--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--s:${s};animation-delay:${d.toFixed(0)}ms">${kind === 'music' || kind === 'chime' ? (i % 2 ? '♪' : '♫') : ''}</i>`;
  }
  box.innerHTML = html;
  layer.appendChild(box);
  setTimeout(() => box.remove(), 2400);
}
