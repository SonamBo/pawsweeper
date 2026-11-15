/**
 * The 500-level table. Nothing is stored: every level's shape comes from its
 * number, so level 137 is the same board for every player.
 */

export const LEVELS = 500;
export const CHAPTER_SIZE = 25;

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

export const UNLOCK = { paw: 3, chord: 5, sniff: 6, hard: 12, scan: 15, walls: 20, catnip: 40, knots: 45 };

const lerp = (a, b, t) => a + (b - a) * t;

export const isHard = (n) => n >= UNLOCK.hard && (n % 4 === 0 || n % CHAPTER_SIZE === 0);

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
  const walls = n >= UNLOCK.walls && (n === UNLOCK.walls || n % 3 === 2) ? 0.07 : 0;
  const knots = n >= UNLOCK.knots && (n === UNLOCK.knots || n % 2 === 1) ? 0.08 : 0;
  const cells = cols * rows;
  return {
    level: n, cols, rows, hard, breather,
    cats: Math.max(2, Math.round(cells * (1 - walls) * density / 100)),
    walls: Math.round(cells * walls),
    knots: Math.round(cells * knots),
    chapter: Math.min(20, Math.ceil(m / CHAPTER_SIZE)),
    boss: n % CHAPTER_SIZE === 0,
    seed: 0x9e3779b1 ^ (n * 2654435761),
  };
}

/** Coins for winning level n: 20, plus 2 every 10 levels; Hard pays double. */
export const levelReward = (n) => (20 + 2 * Math.floor(Math.min(n, LEVELS) / 10)) * (isHard(n) ? 2 : 1);
export const baseReward = (n) => 20 + 2 * Math.floor(Math.min(n, LEVELS) / 10);
export const heartPrice = (n) => 3 * baseReward(n);
