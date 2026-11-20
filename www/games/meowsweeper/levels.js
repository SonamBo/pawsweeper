/**
 * The 500-level table. Nothing is stored: every level's shape comes from its
 * number, so level 137 is the same board for every player.
 */

export const LEVELS = 500;
export const CHAPTER_SIZE = 10;
export const ROOMS = 20;
/** The room a level is played for: rooms 1-20 take 10 levels each, then come round again (redecorating). */
export const roomOfLevel = (n) => ((Math.ceil(Math.max(1, n) / CHAPTER_SIZE) - 1) % ROOMS) + 1;
/** Which time round the rooms level n is on: 1 for levels 1-200, 2 for 201-400, ... */
export const roundOfLevel = (n) => Math.floor((Math.ceil(Math.max(1, n) / CHAPTER_SIZE) - 1) / ROOMS) + 1;

// Milestones from the design doc; levels between them are interpolated.
const MILESTONES = [
  { lvl: 1, cols: 5, rows: 5, dn: 12 },
  { lvl: 5, cols: 6, rows: 7, dn: 13 },
  { lvl: 10, cols: 8, rows: 8, dn: 15 },
  { lvl: 25, cols: 9, rows: 10, dn: 16 },
  { lvl: 50, cols: 10, rows: 12, dn: 17 },
  { lvl: 100, cols: 11, rows: 13, dn: 18 },
  { lvl: 150, cols: 12, rows: 14, dn: 18.5 },
  { lvl: 200, cols: 12, rows: 16, dn: 19 },
  { lvl: 300, cols: 12, rows: 17, dn: 19.5 },
  { lvl: 400, cols: 12, rows: 18, dn: 20 },
  { lvl: 500, cols: 12, rows: 18, dn: 20.5 },
];

/**
 * When each feature opens. Spread out so a new player learns one thing at a
 * time: marking from the start, then Hint, chords, Scan, Hard levels,
 * special boards (14), walls, Catnip as the reward for reaching chapter 2, knots.
 */
export const UNLOCK = { paw: 1, hint: 3, chord: 5, scan: 10, hard: 12, walls: 21, catnip: 26, knots: 45 };

const lerp = (a, b, t) => a + (b - a) * t;

export const isHard = (n) => n >= UNLOCK.hard && (n % 4 === 0 || n % CHAPTER_SIZE === 0);

/* ---------------- special boards ---------------- */

const inTri = (px, py, [ax, ay], [bx, by], [cx, cy]) => {
  const d = (x1, y1, x2, y2, x3, y3) => (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  const d1 = d(px, py, ax, ay, bx, by), d2 = d(px, py, bx, by, cx, cy), d3 = d(px, py, cx, cy, ax, ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};
/** Shapes as "is this cell inside": u, v from 0 to 1 across the board. */
const SHAPES = {
  heart: (u, v) => { const x = u * 2.5 - 1.25, y = 1.22 - v * 2.6; return (x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0; },
  cat: (u, v) => ((u - 0.5) ** 2) / 0.44 ** 2 + ((v - 0.6) ** 2) / 0.4 ** 2 <= 1
    || inTri(u, v, [0.04, 0.5], [0.14, -0.08], [0.5, 0.3]) || inTri(u, v, [0.96, 0.5], [0.86, -0.08], [0.5, 0.3]),
  teacup: (u, v) => ((v >= 0.12 && v <= 0.8 && ((u - 0.4) ** 2) / 0.38 ** 2 + ((v - 0.12) ** 2) / 0.68 ** 2 <= 1))
    || (u > 0.7 && Math.hypot((u - 0.8) * 1.2, v - 0.4) <= 0.2 && Math.hypot((u - 0.8) * 1.2, v - 0.4) >= 0.07)
    || (v >= 0.82 && u >= 0.04 && u <= 0.84),
};
export const SPECIALS = ['shape', 'lantern', 'catnap'];
export const SHAPE_NAMES = ['heart', 'teacup', 'cat'];
let specialEvery = 7;
/** Remote Config can change how often special boards come round. */
export const setSpecialEvery = (k) => { if (Number.isFinite(k) && k >= 3) specialEvery = Math.round(k); };

export function specialOf(n) {
  // Never on a Hard level, a finale, or a level that introduces something new.
  if (n < 8 || isHard(n) || n % CHAPTER_SIZE === 0 || n % specialEvery !== 0 || Object.values(UNLOCK).includes(n)) return null;
  const k = Math.max(0, Math.floor(n / specialEvery) - 2);
  const type = SPECIALS[k % 3];
  return type === 'shape' ? { type, shape: SHAPE_NAMES[Math.floor(k / 3) % 3] } : { type };
}

function maskFor(shape, cols, rows) {
  const f = SHAPES[shape];
  return Array.from({ length: cols * rows }, (_, i) => !f(((i % cols) + 0.5) / cols, (Math.floor(i / cols) + 0.5) / rows));
}

/** The daily puzzle: the same board for everyone on a given day. */
export function dailySpec(day) {
  let h = 2166136261;
  for (const ch of day) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const cols = 9, rows = 11, cells = cols * rows;
  return {
    level: 0, daily: day, cols, rows, hard: false, breather: false, special: null,
    cats: Math.round(cells * 0.17), walls: 0, knots: 0, chapter: 1, boss: false, seed: h >>> 0,
  };
}

export function levelSpec(n) {
  n = Math.max(1, n);
  const m = Math.min(n, LEVELS);            // past 500 the endless tail keeps the last shape
  let i = 0;
  while (i < MILESTONES.length - 2 && MILESTONES[i + 1].lvl <= m) i += 1;
  const a = MILESTONES[i], b = MILESTONES[i + 1];
  const t = Math.min(1, (m - a.lvl) / (b.lvl - a.lvl));
  const cols = Math.round(lerp(a.cols, b.cols, t));
  const rows = Math.round(lerp(a.rows, b.rows, t));
  const hard = isHard(n);
  const breather = !hard && isHard(n - 1);
  const density = lerp(a.dn, b.dn, t) + (hard ? 3 : 0) - (breather ? 2 : 0);
  // Twists never arrive on a Hard level: walls from 20, yarn knots from 45.
  const walls = !hard && n >= UNLOCK.walls && (n === UNLOCK.walls || n % 3 === 2) ? 0.07 : 0;
  const knots = !hard && n >= UNLOCK.knots && (n === UNLOCK.knots || n % 2 === 1) ? 0.08 : 0;
  const cells = cols * rows;
  const special = specialOf(n);
  if (special?.type === 'shape') {
    const mask = maskFor(special.shape, cols, rows);
    const inside = mask.filter((w) => !w).length;
    return {
      level: n, cols, rows, hard, breather, special, mask,
      cats: Math.max(2, Math.round(inside * density / 100)), walls: 0, knots: 0,
      chapter: roomOfLevel(n), boss: false, seed: 0x9e3779b1 ^ (n * 2654435761),
    };
  }
  const nap = special?.type === 'catnap' ? 4 : 0;
  return {
    level: n, cols, rows, hard, breather, special,
    cats: Math.max(2, Math.round(cells * (1 - walls) * (density + nap) / 100)),
    walls: Math.round(cells * walls),
    knots: Math.round(cells * knots),
    chapter: roomOfLevel(n),
    boss: n % CHAPTER_SIZE === 0,
    seed: 0x9e3779b1 ^ (n * 2654435761),
  };
}

/** Coins for winning level n: 20, plus 2 every 10 levels; Hard pays double. */
/*
 * The coin economy (2.2). Coins come in slowly enough that boosters, extra
 * hearts, cats and fabrics are real choices, and a coin pack is worth having.
 * Every number here can be changed from Remote Config (setEconomy).
 */
export const ECON = {
  base: 10,          // coins for level 1
  per10: 1,          // + this many every 10 levels (60 at level 500)
  heart1: 4,         // first extra heart = this many level rewards
  heart2: 2.5,       // second extra heart = this many times the first
};
export const setEconomy = (o = {}) => {
  for (const k of Object.keys(ECON)) if (Number.isFinite(o[k]) && o[k] >= 0) ECON[k] = o[k];
};
const round5 = (x) => Math.max(5, Math.round(x / 5) * 5);
export const baseReward = (n) => ECON.base + ECON.per10 * Math.floor(Math.min(n, LEVELS) / 10);
export const levelReward = (n) => baseReward(n) * (isHard(n) ? 2 : 1);
/** The price of extra heart `k` (1 or 2) on level n. */
export const heartPrice = (n, k = 1) => round5(ECON.heart1 * baseReward(n) * (k >= 2 ? ECON.heart2 : 1));
