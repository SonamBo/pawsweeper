/**
 * Seeded board generator with a no-guess guarantee.
 *
 * Cats are scattered, then a solver plays the board from the opened start
 * patch using only logic a person can follow (one number at a time, pairs of
 * numbers, and the count of cats left). Wherever it would have to guess, the
 * cat causing the stall is moved away from the frontier (or removed, when
 * there is nowhere to put it) and the solver starts again. What comes out can
 * always be finished without a guess.
 */

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function neighbours(cols, rows) {
  const out = [];
  for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) {
    const list = [];
    for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) list.push(rr * cols + cc);
    }
    out.push(list);
  }
  return out;
}

export function numbers(cat, wall, nb) {
  return cat.map((_, i) => (wall[i] || cat[i] ? -1 : nb[i].reduce((s, j) => s + (cat[j] ? 1 : 0), 0)));
}

/** Play from `start` with logic only. Returns { solved, open, known, frontierCats }. */
export function solve(cat, wall, nb, start) {
  const n = cat.length;
  const num = numbers(cat, wall, nb);
  const open = new Uint8Array(n);
  const known = new Uint8Array(n);          // deduced cats
  const total = cat.reduce((s, v) => s + (v ? 1 : 0), 0);
  const safeTotal = n - total - wall.reduce((s, v) => s + (v ? 1 : 0), 0);
  let opened = 0;
  let knownCount = 0;

  const reveal = (i) => {
    const stack = [i];
    while (stack.length) {
      const k = stack.pop();
      if (open[k] || wall[k] || cat[k]) continue;
      open[k] = 1; opened += 1;
      if (num[k] === 0) for (const j of nb[k]) if (!open[j]) stack.push(j);
    }
  };
  const mark = (i) => { if (!known[i]) { known[i] = 1; knownCount += 1; } };
  reveal(start);

  for (;;) {
    if (opened === safeTotal) return { solved: true, open, known };
    let moved = false;
    const cons = [];
    for (let i = 0; i < n; i += 1) {
      if (!open[i] || num[i] <= 0) continue;
      const u = [];
      let m = num[i];
      for (const j of nb[i]) {
        if (wall[j] || open[j]) continue;
        if (known[j]) m -= 1; else u.push(j);
      }
      if (!u.length) continue;
      if (m === 0) { u.forEach(reveal); moved = true; }
      else if (m === u.length) { u.forEach(mark); moved = true; }
      else cons.push({ u, m });
    }
    if (moved) continue;

    // Pairs: when one number's unknowns sit inside another's, the rest is settled.
    for (let a = 0; a < cons.length && !moved; a += 1) for (let b = 0; b < cons.length && !moved; b += 1) {
      if (a === b) continue;
      const A = cons[a], B = cons[b];
      if (A.u.length >= B.u.length) continue;
      if (!A.u.every((x) => B.u.includes(x))) continue;
      const rest = B.u.filter((x) => !A.u.includes(x));
      const m = B.m - A.m;
      if (m === 0) { rest.forEach(reveal); moved = true; }
      else if (m === rest.length) { rest.forEach(mark); moved = true; }
    }
    if (moved) continue;

    // The count of cats left.
    const unknown = [];
    for (let i = 0; i < n; i += 1) if (!open[i] && !wall[i] && !known[i]) unknown.push(i);
    const left = total - knownCount;
    if (left === 0) { unknown.forEach(reveal); continue; }
    if (left === unknown.length) { unknown.forEach(mark); continue; }

    return { solved: false, open, known };
  }
}

export function generate(spec) {
  const { cols, rows } = spec;
  const n = cols * rows;
  const nb = neighbours(cols, rows);
  const rand = rng(spec.seed);
  const pick = (list) => list[Math.floor(rand() * list.length)];

  // The start: near the middle, with its neighbours kept clear so it opens an area.
  const sc = Math.floor(cols / 2) + Math.floor(rand() * 3) - 1;
  const sr = Math.floor(rows / 2) + Math.floor(rand() * 3) - 1;
  const start = Math.max(0, Math.min(rows - 1, sr)) * cols + Math.max(0, Math.min(cols - 1, sc));
  const clear = new Set([start, ...nb[start]]);

  const wall = new Array(n).fill(false);
  const cat = new Array(n).fill(false);
  const free = () => { const f = []; for (let i = 0; i < n; i += 1) if (!wall[i] && !cat[i] && !clear.has(i)) f.push(i); return f; };
  for (let k = 0; k < spec.walls; k += 1) { const f = free(); if (f.length) wall[pick(f)] = true; }
  for (let k = 0; k < spec.cats; k += 1) { const f = free(); if (f.length) cat[pick(f)] = true; }

  for (let round = 0; round < 5000; round += 1) {
    const res = solve(cat, wall, nb, start);
    if (res.solved) break;
    const nearOpen = (i) => nb[i].some((j) => res.open[j]);
    const stuck = [];
    for (let i = 0; i < n; i += 1) if (cat[i] && !res.known[i] && nearOpen(i)) stuck.push(i);
    const from = stuck.length ? pick(stuck) : pick(cat.map((v, i) => (v && !res.known[i] ? i : -1)).filter((i) => i >= 0));
    if (from === undefined) break;
    cat[from] = false;
    const far = [];
    for (let i = 0; i < n; i += 1) {
      if (i !== from && !wall[i] && !cat[i] && !res.open[i] && !clear.has(i) && !nearOpen(i)) far.push(i);
    }
    if (far.length && round < 300) cat[pick(far)] = true;   // later rounds only remove, so it always ends
  }

  const num = numbers(cat, wall, nb);
  // Yarn knots sit on covered cushions away from the start.
  const knot = new Array(n).fill(false);
  for (let k = 0; k < spec.knots; k += 1) {
    const f = []; for (let i = 0; i < n; i += 1) if (!wall[i] && !knot[i] && !clear.has(i)) f.push(i);
    if (f.length) knot[pick(f)] = true;
  }
  return { cols, rows, nb, cat, wall, num, knot, start, cats: cat.filter(Boolean).length };
}
