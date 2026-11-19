/**
 * Whiskerwood Manor: the story, decorating and meta layer around the board.
 *
 * Rooms open one every 10 levels (the 10th is the room's finale). Stars won on
 * levels are spent on six objects per room; the player picks each object's
 * style (Cosy Cottage, Pastel Dream or Royal Garden) and it arrives in the room
 * with its own little moment. After level 200 the rooms come round again to be
 * redecorated in a style not used yet; from level 600 restyling is free.
 * Two keepsakes per room tell the Duchess's story; they live in the album.
 * Decorating never blocks play.
 */

import {
  ROOM_COUNT, TASK_COSTS, ROOM_LEVELS, STYLES, KEEPSAKES, ROOM_NAMES, HOSTS, CAT_NAMES,
  WIN_LINES, RESTORE_LINES, INTRO, UI, FRIEND_AT, FRIEND_LINES, FRIEND_PERKS, DAILY_NOTES,
} from './manor-data.js';
import { DECO_NAMES, PLACE, ASPECT } from './deco-data.js';
import { getLang } from './strings.js';
import { sparkles, doors, wait, arriveFx, stamp } from './fx.js';

const fmt = (s, v = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CATS5 = ['marmalade', 'mittens', 'biscuit', 'patch', 'pepper'];
/** The lobby's tagline, as a ribbon the game draws. */
const TAGLINE = {
  en: ['Tap', 'Think', 'Don’t Wake the Cat!'], es: ['Toca', 'Piensa', '¡No despiertes al gato!'],
  pt: ['Toque', 'Pense', 'Não acorde o gato!'], hi: ['टैप करो', 'सोचो', 'बिल्ली को मत जगाओ!'],
  de: ['Tippen', 'Denken', 'Weck die Katze nicht!'], fr: ['Touche', 'Réfléchis', 'Ne réveille pas le chat !'],
};
const OBJS = 6;

export const roomName = (i) => (ROOM_NAMES[getLang()] || ROOM_NAMES.en)[i - 1] || ROOM_NAMES.en[i - 1];
export const hostOf = (i) => HOSTS[(Math.max(1, i) - 1) % ROOM_COUNT];
export const winLine = (i) => `${CAT_NAMES[hostOf(i)]}: “${pick(WIN_LINES[hostOf(i)])}”`;

export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayBefore = (s) => { const d = new Date(`${s}T12:00:00`); d.setDate(d.getDate() - 1); return today(d); };
const mmss = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/** Levels are numbered from 1; room r's k-th level in round `round`. */
/** In 3.0 rooms opened every 10 levels; saves from then map onto rooms this way. */
const oldLevelIn = (r, k) => (r - 1) * ROOM_LEVELS + k;

/* ---------------- pictures ---------------- */

const images = new Map();
function load(src) {
  if (!images.has(src)) {
    images.set(src, new Promise((resolve) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = src;
    }));
  }
  return images.get(src);
}

const W = 424, H = 632;
const canFilter = (() => {
  try { const c = document.createElement('canvas').getContext('2d'); return typeof c.filter === 'string'; } catch { return false; }
})();

const roomSrc = (host, n) => host.asset(`img/room-${n}.jpg`);
export const decoSrc = (host, r, o, s) => host.asset(`img/deco/r${r}-${o}-${s}.webp`);
export const keepSrc = (host, r, i) => host.asset(`img/keep/k${String(r).padStart(2, '0')}${i ? 'b' : 'a'}.webp`);
export const symSrc = (host, id) => host.asset(`img/sym/${id}.webp`);

/** Where object o of room r sits, as fractions of the picture: left, top, width, height. */
export function boxOf(r, o, s) {
  const [x, y, h] = PLACE[r - 1][o];
  const w = h * (ASPECT[r - 1][o][Math.max(0, s)] || 1) * (H / W);
  return { l: x - w / 2, t: y - h, w, h, x, y };
}

/**
 * Draw room r with its objects: `cur[o]` is the style shown (-1 for none).
 * `skip` leaves one object out (it is about to arrive). Objects further back
 * (higher up the picture) are drawn first.
 */
export async function drawScene(host, canvas, r, cur, { skip = -1, w = W, h = H, locked = false } = {}) {
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const img = await load(roomSrc(host, r));
  if (!img) return;
  if (locked) {
    ctx.filter = canFilter ? 'grayscale(.7) brightness(.5) blur(2px)' : 'none';
    ctx.drawImage(img, 0, 0, w, h); ctx.filter = 'none';
    if (!canFilter) { ctx.fillStyle = 'rgba(30,20,10,.55)'; ctx.fillRect(0, 0, w, h); }
    return;
  }
  const order = [...Array(OBJS).keys()].filter((o) => cur[o] >= 0 && o !== skip).sort((a, b) => PLACE[r - 1][a][1] - PLACE[r - 1][b][1]);
  const sprites = await Promise.all(order.map((o) => load(decoSrc(host, r, o, cur[o]))));
  ctx.drawImage(img, 0, 0, w, h);
  order.forEach((o, k) => {
    const sp = sprites[k];
    if (!sp) return;
    const b = boxOf(r, o, cur[o]);
    const bw = b.h * h * (sp.naturalWidth / sp.naturalHeight);
    const left = b.x * w - bw / 2, top = b.t * h;
    if (PLACE[r - 1][o][3] === 'h') {
      ctx.strokeStyle = '#5b3b1f'; ctx.lineWidth = Math.max(1.5, w / 280);
      ctx.beginPath(); ctx.moveTo(b.x * w, 0); ctx.lineTo(b.x * w, top + b.h * h * 0.04); ctx.stroke();
    }
    ctx.drawImage(sp, left, top, bw, b.h * h);
  });
}

/** The room as it stands, as a picture URL (the board's background). Cached per look. */
const shots = new Map();
export function roomPicture(host, r, cur) {
  const key = `${r}:${cur.join('')}`;
  if (!shots.has(key)) {
    shots.set(key, (async () => {
      const c = document.createElement('canvas');
      await drawScene(host, c, r, cur, { w: 636, h: 948 });
      try { return c.toDataURL('image/jpeg', 0.86); } catch { return roomSrc(host, r); }
    })());
    if (shots.size > 12) shots.delete(shots.keys().next().value);
  }
  return shots.get(key);
}

/* ---------------- the manor ---------------- */

/**
 * `game` gives what the manor needs from the board:
 *   level() (the level to play next), stars() (total best stars), fabric(),
 *   onPlay(), onDaily(), onReplay(n), starsOf(n), onRoomChanged(), onSettings(),
 *   save(), root(), costScale(), dailyCoins(), onStars() (balance changed).
 */
export function createManor(host, game) {
  const freshRoom = () => ({ round: 1, cur: Array(OBJS).fill(-1), used: Array.from({ length: OBJS }, () => []), added: Array(OBJS).fill(0) });
  const fresh = () => ({
    v: 3, spent: 0, bonus: 0,
    rooms: Array.from({ length: ROOM_COUNT }, freshRoom),
    sel: 0, selAt: 0,
    chap: 1, starts: [1],               // rooms opened so far (keeps counting past 20), and the level each began on
    keep: [], keepRead: [], letterRead: false,
    friend: {}, friendSeen: {}, daily: { streak: 0, last: '', days: [], best: [] },
    settings: { cb: false, left: false, vib: true },
  });
  let state = fresh();
  let overlay = null;
  let view = 1;
  let busy = false;

  const lvl = () => Math.max(1, game.level());
  const chapterIdx = () => state.chap;                                     // 1, 2, 3 ... (keeps counting past 20)
  const chapStart = (c = state.chap) => state.starts[c - 1] || 1;
  /** Levels won in the room being played now. */
  const levelsHere = () => Math.max(0, lvl() - chapStart());
  /** The k-th level (1-based) of the current room. */
  const kthHere = (level) => level - chapStart() + 1;
  const newestRoom = () => ((chapterIdx() - 1) % ROOM_COUNT) + 1;         // the room the next level is played for
  const openRooms = () => Math.min(ROOM_COUNT, chapterIdx());
  const isOpenRoom = (r) => r >= 1 && r <= openRooms();
  const roundOf = (r) => (chapterIdx() >= r ? Math.floor((chapterIdx() - r) / ROOM_COUNT) + 1 : 0);
  const selRoom = () => (state.sel && state.selAt === newestRoom() && isOpenRoom(state.sel) ? state.sel : newestRoom());
  const R = (r) => state.rooms[r - 1];

  const cost = (i) => Math.max(1, Math.round(TASK_COSTS[Math.min(i, TASK_COSTS.length - 1)] * (game.costScale?.() || 1)));
  const balance = () => Math.max(0, game.stars() + state.bonus - state.spent);
  const addedCount = (r) => R(r).added.reduce((s, v) => s + (v ? 1 : 0), 0);
  const pending = (r) => [...Array(OBJS).keys()].filter((o) => !R(r).added[o]);
  const nextCost = (r) => (addedCount(r) < OBJS ? cost(addedCount(r)) : null);
  const freeRestyle = (r) => R(r).round >= 4;
  /** The next room opens once 10 levels are won here and all six objects are placed. */
  const canAdvance = () => levelsHere() >= ROOM_LEVELS && addedCount(newestRoom()) >= OBJS;
  function advance() {
    state.chap += 1;
    state.starts[state.chap - 1] = lvl();
    state.sel = 0;
    sync();
    host.track('room_open', { room: newestRoom(), chapter: state.chap, level: lvl() });
    game.save();
    game.onRoomChanged?.();
  }
  /** The level a keepsake of room r appears on, when it is known (the room being played). */
  const keepAt = (r, i) => (state.chap <= ROOM_COUNT && r === newestRoom() ? chapStart() + (i ? ROOM_LEVELS - 1 : 4) : 0);
  /** Styles object o may take this round: any not used before (all three once each has been used). */
  const allowed = (r, o) => {
    if (freeRestyle(r)) return [0, 1, 2];
    const free = [0, 1, 2].filter((s) => !R(r).used[o].includes(s));
    return free.length ? free : [0, 1, 2];
  };
  const keyOf = (r, i) => `${r}.${i}`;
  const hasKeep = (r, i) => state.keep.includes(keyOf(r, i));
  const unread = () => state.keep.filter((k) => !state.keepRead.includes(k)).length + (state.letterRead ? 0 : 1);
  const friendPts = (c) => state.friend[c] || 0;
  const friendLevel = (c) => FRIEND_AT.reduce((l, at, i) => (friendPts(c) >= at ? i : l), 0);
  const stars = () => `<img src="${host.asset('img/star-seal.png')}" alt="">`;

  /** Rooms reached again start a new round of decorating; keepsakes from levels already won are kept. */
  function sync() {
    for (let r = 1; r <= openRooms(); r += 1) {
      const rr = roundOf(r), room = R(r);
      if (rr > room.round) {
        room.round = rr;
        room.added = room.cur.map((s) => (rr >= 4 && s >= 0 ? 1 : 0));
      }
    }
  }

  /* ---- friendship ---- */

  function befriend(cat, pts) {
    if (!CATS5.includes(cat)) return null;
    const before = friendLevel(cat);
    state.friend[cat] = friendPts(cat) + pts;
    const after = friendLevel(cat);
    if (after > before) {
      host.track('friend_level', { cat, level: after });
      return fmt(UI.friendUp, { cat: CAT_NAMES[cat], n: after });
    }
    return null;
  }
  const perkBoost = (cat) => (friendLevel(cat) >= 3 ? FRIEND_PERKS[cat]?.boost || null : null);

  /* ---- keepsakes ---- */

  /** The keepsake a win on `level` brings, if any: { r, i }. Round one only. */
  function keepsakeFor(level) {
    if (state.chap > ROOM_COUNT) return null;
    const r = newestRoom(), k = kthHere(level);
    const i = k === 5 ? 0 : k === ROOM_LEVELS ? 1 : -1;
    if (i < 0 || hasKeep(r, i)) return null;
    return { r, i };
  }
  function collect(r, i) {
    if (!hasKeep(r, i)) state.keep.push(keyOf(r, i));
    host.track('keepsake_found', { room: r, n: i + 1 });
    game.save();
  }

  /** Called by the game after every level win. Returns extra lines for the win card. */
  function onLevelWon() {
    const up = befriend(hostOf(selRoom()), 1);
    return up ? [up] : [];
  }

  /* ---- the lobby ---- */

  let lobbyCanvas = null;
  function refreshLobby() {
    sync();
    const r = selRoom();
    if (!lobbyCanvas) { lobbyCanvas = document.createElement('canvas'); lobbyCanvas.className = 'ms-scene-room'; }
    drawScene(host, lobbyCanvas, r, R(r).cur);
    const bg = document.createElement('div');
    bg.className = 'ms-scene';
    bg.append(lobbyCanvas);
    const shade = document.createElement('div'); shade.className = 'ms-scene-shade'; bg.append(shade);
    const cushion = host.asset(`img/cushion-${game.fabric()}.png`);
    const hero = `
      <div class="ms-hero" data-hero-cat>
        <span class="ms-hero-shadow"></span>
        <img class="ms-hero-cu c1" src="${cushion}" alt="" draggable="false">
        <span class="ms-hero-cat">${host.art.cat('sleep', 210, 'ms-hero-img')}</span>
        <span class="ms-zzz" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></span>
      </div>`;
    const tg = TAGLINE[getLang()] || TAGLINE.en;
    host.lobbyScene?.(bg, hero, `<p class="tagline-ribbon">${tg.map(esc).map((w) => `<span>${w}</span>`).join('<i>✦</i>')}</p>`);
    const c = nextCost(r);
    const can = c !== null && balance() >= c;
    host.lobbyButton('manor', {
      icon: 'img/star-seal.png', pill: `★ ${balance()}`, news: can, badge: can ? '!' : '',
      label: `${UI.manor}: ${balance()} ★`,
    });
    const solved = state.daily.last === today();
    host.lobbyButton('daily', { icon: 'img/icon-daily.png', pill: solved ? '✓' : UI.daily.split(' ')[0], news: !solved, badge: solved ? '' : '!', label: UI.daily });
    const u = unread();
    host.lobbyButton('diary', { icon: 'img/icon-diary.png', pill: UI.album, badge: u ? String(u) : '', news: u > 0, label: UI.album });
    game.onStars?.();
  }

  /* ---- overlays ---- */

  function screenEl() { return game.root().closest('.screen') || game.root(); }
  function close() { overlay?.remove(); overlay = null; }
  function open(html, cls) {
    close();
    host.coach?.clear();
    overlay = document.createElement('div');
    overlay.className = `ms-ovl ${cls}`;
    overlay.innerHTML = html;
    screenEl().appendChild(overlay);
    return overlay;
  }
  const topBar = (title, sub, right = '') => `
    <div class="ms-mtop">
      <button class="ms-mbtn" data-act="back" aria-label="${UI.back}">‹</button>
      <div class="ms-mtitle"><b>${esc(title)}</b>${sub ? `<small>${sub}</small>` : ''}</div>
      ${right}
    </div>`;
  const starPill = () => `<span class="ms-stars" data-starpill aria-label="${balance()} stars">${stars()}<b>${balance()}</b></span>`;

  /* ---- the manor: one room, its objects, the picker ---- */

  /** A room's subtitle: its number, and the round when it is being redecorated. */
  const roomSub = (r) => {
    const rd = isOpenRoom(r) ? R(r).round : 1;
    const tag = rd >= 4 ? UI.restyle : rd >= 2 ? `${UI.redecorate} ${'✦'.repeat(Math.min(3, rd - 1))}` : '';
    return `${esc(fmt(UI.room, { n: r }))}${tag ? ` · <em class="ms-roundtag">${esc(tag)}</em>` : ''}`;
  };

  function chipHtml(r, o) {
    const room = R(r), s = room.cur[o], done = !!room.added[o];
    const src = decoSrc(host, r, o, Math.max(0, s));
    return `<button class="ms-chip ${done ? 'done' : ''} ${s < 0 ? 'empty' : ''}" data-obj="${o}" aria-label="${esc(DECO_NAMES[r - 1][o])}">
      <img src="${src}" alt="" draggable="false">${done ? `<i class="ms-tick">${freeRestyle(r) ? '↻' : '✓'}</i>` : `<i class="ms-plus">${s >= 0 ? '↻' : '+'}</i>`}</button>`;
  }

  /** What still stands between the player and a locked room: the objects and the levels. */
  function lockBadge(r) {
    if (r !== openRooms() + 1) return `<div class="ms-lockbadge"><img src="${symSrc(host, 'lock')}" alt=""></div>`;
    const here = newestRoom(), n = addedCount(here), lv = Math.min(ROOM_LEVELS, levelsHere());
    const row = (ok, icon, text) => `<span class="ms-need ${ok ? 'ok' : ''}">${icon}<b>${text}</b>${ok ? '<i>✓</i>' : ''}</span>`;
    return `<div class="ms-lockbadge"><img src="${symSrc(host, 'lock')}" alt="">
      <small>${esc(roomName(here))}</small>
      ${row(n >= OBJS, `<img src="${symSrc(host, 'trophy')}" alt="">`, `${n} / ${OBJS}`)}
      ${row(lv >= ROOM_LEVELS, `<img src="${symSrc(host, 'catcushion')}" alt="">`, `${fmt(UI.lvlShort, { n: '' }).trim()} ${lv} / ${ROOM_LEVELS}`)}</div>`;
  }

  /** The manor view on room r. Rooms one past the open ones show locked. */
  function openManor(r = selRoom()) {
    sync();
    const last = Math.min(ROOM_COUNT, openRooms() + 1);
    view = Math.min(Math.max(1, r), last);
    const locked = !isOpenRoom(view);
    if (!locked && view !== selRoom()) { state.sel = view; state.selAt = newestRoom(); game.onRoomChanged?.(); game.save(); }
    const room = R(view);
    const c = locked ? null : nextCost(view);
    const can = c !== null && balance() >= c;
    const n = locked ? 0 : addedCount(view);
    const u = unread();
    const ghosts = locked ? '' : pending(view).map((o) => {
      const b = boxOf(view, o, Math.max(0, room.cur[o]));
      return `<button class="ms-ghost ${can ? 'can' : ''} ${room.cur[o] >= 0 ? 'swap' : ''}" data-obj="${o}" style="left:${(b.x * 100).toFixed(1)}%;top:${((b.t + b.h * 0.55) * 100).toFixed(1)}%" aria-label="${esc(DECO_NAMES[view - 1][o])}">${room.cur[o] >= 0 ? '↻' : '+'}</button>`;
    }).join('');
    const el = open(`
      ${topBar(roomName(view), roomSub(view), `${starPill()}<button class="ms-mbtn ms-gear" data-act="settings" aria-label="${UI.settings}">${GEAR}</button>`)}
      <div class="ms-mroom">
        <div class="ms-mframe" data-frame>
          <div class="ms-zoomlayer"><canvas class="ms-mcanvas"></canvas></div>
          ${n >= OBJS && !freeRestyle(view) ? `<canvas class="ms-mcanvas ms-before"></canvas><input class="ms-slider" type="range" min="0" max="100" value="100" aria-label="${UI.before} / ${UI.after}"><span class="ms-ba l">${UI.before}</span><span class="ms-ba r">${UI.after}</span>` : ''}
          <div class="ms-ghosts">${ghosts}</div>
          ${locked ? lockBadge(view) : ''}
          ${!locked && n >= 1 ? `<button class="ms-share" data-act="share" aria-label="${UI.share}">${SHARE}</button>` : ''}
          <span class="ms-mcat" data-mcat aria-hidden="true">${host.art.cat('cheer', 96, 'ms-mcat-img', hostOf(view))}</span>
        </div>
        <button class="ms-marrow l" data-act="prev" aria-label="‹" ${view <= 1 ? 'hidden' : ''}>‹</button>
        <button class="ms-marrow r" data-act="next" aria-label="›" ${view >= last ? 'hidden' : ''}>›</button>
      </div>
      ${locked ? `<div class="ms-strip ms-strip-locked">${[...Array(OBJS).keys()].map((o) => `<span class="ms-chip empty locked"><img src="${decoSrc(host, view, o, 0)}" alt=""></span>`).join('')}</div>`
        : `<div class="ms-strip">${[...Array(OBJS).keys()].map((o) => chipHtml(view, o)).join('')}</div>`}
      <div class="ms-mtask">
        ${locked ? '' : c === null
          ? `<p class="ms-mdone"><img src="${symSrc(host, 'trophy')}" alt=""> ${UI.allDone}</p>`
          : `<button class="ms-restore ${can ? 'ready' : ''}" data-act="add">
               <span>${room.cur[pending(view)[0]] < 0 ? UI.decorate : UI.redecorate}</span><span class="ms-cost-star">${stars()}${c}</span>
             </button>
             ${!can ? `<p class="ms-mneed">${stars()} ${balance()} / ${c}</p>` : ''}`}
      </div>
      <div class="ms-mfoot">
        <button class="ms-mbtn ms-icobtn" data-act="rooms"><span class="ms-ico40">${ROOMS_ICON}</span><span>${UI.rooms}</span></button>
        <button class="ms-mbtn ms-icobtn" data-act="album"><img src="${host.asset('img/icon-diary.png')}" alt=""><span>${UI.album}</span>${u ? `<i class="ms-badge-n">${u}</i>` : ''}</button>
        <button class="ms-mbtn ms-icobtn" data-act="replay" ${locked ? 'disabled' : ''}><span class="ms-ico40">${REPLAY}</span><span>${UI.replay}</span></button>
        <button class="ms-mbtn wide primary" data-act="play">${fmt(UI.play, { n: lvl() })}</button>
      </div>`, 'ms-manor');
    const canvas = el.querySelector('.ms-mcanvas');
    drawScene(host, canvas, view, room.cur, { locked });
    const before = el.querySelector('.ms-before');
    if (before) {
      drawScene(host, before, view, Array(OBJS).fill(-1));
      const slider = el.querySelector('.ms-slider');
      const clip = () => { before.style.clipPath = `inset(0 ${slider.value}% 0 0)`; };
      slider.addEventListener('input', clip); clip();
    }
    el.addEventListener('click', async (e) => {
      if (busy) return;
      const b = e.target.closest('[data-act],[data-obj]');
      if (!b || b.disabled) return;
      if (b.dataset.obj !== undefined) { if (!locked) openPicker(view, Number(b.dataset.obj)); return; }
      const act = b.dataset.act;
      if (act === 'back') { close(); host.exit(); }
      else if (act === 'play') { close(); game.onPlay(); }
      else if (act === 'prev') { host.sound('tap'); openManor(view - 1); }
      else if (act === 'next') { host.sound('tap'); openManor(view + 1); }
      else if (act === 'rooms') openRoomGrid();
      else if (act === 'album') openAlbum(() => openManor(view));
      else if (act === 'replay') openReplay(view);
      else if (act === 'settings') openSettings(view);
      else if (act === 'share') shareRoom(view);
      else if (act === 'add') { const p = pending(view); if (p.length) openPicker(view, p[0]); }
    });
    // Swipe between rooms.
    let x0 = null;
    const frame = el.querySelector('[data-frame]');
    frame.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    frame.addEventListener('touchend', (e) => {
      if (x0 === null || busy) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 60 && !e.target.closest('.ms-slider')) openManor(view + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /** The style picker for object o: three versions side by side; a tap places it. */
  function openPicker(r, o) {
    const room = R(r);
    if (room.added[o] && !freeRestyle(r)) { host.sound('tap'); bounceChip(o); return; }
    const free = freeRestyle(r) && room.cur[o] >= 0;
    const c = free ? 0 : nextCost(r);
    if (c === null) return;
    const ok = allowed(r, o), can = balance() >= c;
    const sheet = document.createElement('div');
    sheet.className = 'ms-sheet';
    sheet.innerHTML = `
      <div class="ms-sheetbox" role="dialog" aria-label="${esc(DECO_NAMES[r - 1][o])}">
        <div class="ms-sheethead"><b>${esc(DECO_NAMES[r - 1][o])}</b>
          <span class="ms-cost-star ${can ? '' : 'short'}">${free ? UI.free : `${stars()}${c}`}</span>
          <button class="ms-x" data-x aria-label="${UI.back}">×</button></div>
        <div class="ms-styles">${STYLES.map((st, s) => {
          const usable = ok.includes(s) && s !== room.cur[o];
          return `<button class="ms-style ${usable && can ? '' : 'off'} ${room.cur[o] === s ? 'now' : ''}" data-style="${s}" ${usable && can ? '' : 'disabled'}>
            <span class="ms-style-img"><img src="${decoSrc(host, r, o, s)}" alt="" draggable="false"></span>
            <span class="ms-sw">${st.sw.map((col) => `<i style="background:${col}"></i>`).join('')}</span>
            <small>${esc(st.name)}</small>
            ${!usable ? `<em class="ms-usedtag">${room.cur[o] === s ? '✓' : UI.used}</em>` : ''}</button>`;
        }).join('')}</div>
        ${can ? '' : `<p class="ms-mneed">${stars()} ${balance()} / ${c}</p><button class="ms-mbtn wide primary" data-play>${fmt(UI.play, { n: lvl() })}</button>`}
      </div>`;
    overlay.appendChild(sheet);
    host.sound('open');
    requestAnimationFrame(() => sheet.classList.add('in'));
    const shut = () => { sheet.classList.remove('in'); setTimeout(() => sheet.remove(), 220); };
    sheet.addEventListener('click', async (e) => {
      if (e.target === sheet || e.target.closest('[data-x]')) { shut(); return; }
      if (e.target.closest('[data-play]')) { shut(); close(); game.onPlay(); return; }
      const b = e.target.closest('[data-style]');
      if (!b || b.disabled) return;
      shut();
      await place(r, o, Number(b.dataset.style), c);
    });
  }

  function bounceChip(o) {
    const chip = overlay?.querySelector(`.ms-chip[data-obj="${o}"]`);
    chip?.classList.remove('nudge'); void chip?.offsetWidth; chip?.classList.add('nudge');
  }

  /** Pay, then the object arrives in the room with its own moment, and the host cat reacts. */
  async function place(r, o, s, c) {
    const room = R(r);
    if (balance() < c || busy) return;
    busy = true;
    const prev = room.cur[o];
    state.spent += c;
    room.cur[o] = s;
    if (!room.used[o].includes(s)) room.used[o].push(s);
    room.added[o] = 1;
    const up = befriend(hostOf(r), 2);
    host.track('decorate', { room: r, obj: o + 1, style: STYLES[s].id, round: room.round, cost: c });
    game.save();
    game.onStars?.();
    const el = overlay;
    el.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    const pill = el.querySelector('[data-starpill] b'); if (pill) pill.textContent = balance();
    await arrive(el, r, o, s, prev);
    game.onRoomChanged?.();
    refreshLobby();
    busy = false;
    const doneAll = addedCount(r) >= OBJS;
    openManor(r);
    if (up) say(up);
    if (doneAll) {
      await roomComplete(r);
      if (r === newestRoom() && canAdvance()) { advance(); await openNewRoom(); }
      else if (r === newestRoom() && state.chap <= ROOM_COUNT * 50) say(fmt(UI.moreLevels, { n: ROOM_LEVELS - Math.min(ROOM_LEVELS, levelsHere()) }));
    }
  }

  /** The arrival: drop, swing in, descend on a chain, grow or unroll; then its effect. */
  async function arrive(el, r, o, s, prev) {
    const frame = el.querySelector('[data-frame]');
    const canvas = el.querySelector('.ms-mcanvas');
    el.querySelector('.ms-ghosts')?.remove();
    const room = R(r);
    const without = room.cur.slice(); without[o] = prev;
    const [x, , , kind, fx] = PLACE[r - 1][o];
    const b = boxOf(r, o, s);
    const reduce = matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // The old version (redecorating) lifts away first.
    if (prev >= 0) {
      await drawScene(host, canvas, r, without, { skip: o });
      const old = spriteEl(r, o, prev, boxOf(r, o, prev));
      (frame.querySelector('.ms-zoomlayer') || frame).appendChild(old);
      host.sound('whoosh');
      old.classList.add('leave');
      await wait(reduce ? 50 : 420);
      old.remove();
    } else {
      await drawScene(host, canvas, r, without, { skip: o });
    }
    // Zoom gently towards the spot.
    const layer = frame.querySelector('.ms-zoomlayer') || frame;
    const fr = frame.getBoundingClientRect();
    const zoom = reduce ? 1 : Math.max(1.12, Math.min(1.6, 0.4 / Math.max(0.12, b.h)));
    layer.style.transformOrigin = `${(x * 100).toFixed(1)}% ${((b.t + b.h / 2) * 100).toFixed(1)}%`;
    layer.style.transition = 'transform .4s cubic-bezier(.3,.7,.3,1)';
    layer.style.transform = `scale(${zoom})`;
    await wait(reduce ? 0 : 400);
    const sp = spriteEl(r, o, s, b);
    sp.classList.add(`in-${fx === 'fabric' ? 'unroll' : fx === 'plant' ? 'grow' : kind === 'h' ? 'hang' : kind === 'w' ? 'swing' : 'drop'}`);
    layer.appendChild(sp);
    host.sound(kind === 'h' || fx === 'fabric' ? 'whoosh' : fx === 'plant' ? 'pop' : 'thud');
    host.haptic?.([0, 18]);
    await wait(reduce ? 60 : 680);
    const SOUND = { light: 'flame', water: 'water', chime: 'chime', music: 'chime', bubbles: 'pop', steam: 'whoosh', plant: 'sparkle', shine: 'sparkle', fabric: 'sparkle', dust: 'sweep' };
    host.sound(SOUND[fx] || 'sparkle');
    arriveFx(layer, fx, b.l * fr.width, b.t * fr.height, b.w * fr.width, b.h * fr.height);
    await wait(reduce ? 60 : 1000);
    await drawScene(host, canvas, r, room.cur);
    sp.remove();
    layer.style.transform = 'scale(1)';
    await wait(reduce ? 0 : 420);
    layer.style.transition = ''; layer.style.transform = '';
    sparkles(frame, 12);
    // The host cat pops up, pleased.
    const cat = el.querySelector('[data-mcat]');
    cat?.classList.add('show');
    host.sound('purr');
    await wait(reduce ? 200 : 1000);
    cat?.classList.remove('show');
  }

  function spriteEl(r, o, s, b) {
    const im = document.createElement('img');
    im.className = 'ms-arriving';
    im.src = decoSrc(host, r, o, s);
    im.alt = '';
    im.style.left = `${(b.l * 100).toFixed(2)}%`;
    im.style.top = `${(b.t * 100).toFixed(2)}%`;
    im.style.width = `${(b.w * 100).toFixed(2)}%`;
    im.style.height = `${(b.h * 100).toFixed(2)}%`;
    if (PLACE[r - 1][o][3] === 'h') im.style.setProperty('--chain', `${(b.t * 100).toFixed(1)}%`);
    return im;
  }

  /** Six of six: a trophy stamps on the room, confetti, a chest of coins. */
  async function roomComplete(r) {
    const frame = overlay?.querySelector('[data-frame]');
    if (!frame) return;
    host.sound('fanfare'); host.haptic?.([0, 30, 40, 30]);
    sparkles(frame, 26);
    host.track('room_complete', { room: r, round: R(r).round });
    await stamp(frame, symSrc(host, 'trophy'), UI.allDone);
  }

  /** A short line under the room (a friendship level, a nudge). */
  function say(text) {
    const box = overlay?.querySelector('.ms-mtask');
    if (!box) return;
    const p = document.createElement('p'); p.className = 'ms-mline'; p.textContent = text;
    box.prepend(p);
  }

  /* ---- all rooms ---- */

  function openRoomGrid() {
    sync();
    const here = selRoom();
    const cells = Array.from({ length: ROOM_COUNT }, (_, k) => {
      const r = k + 1, opn = isOpenRoom(r);
      const n = opn ? addedCount(r) : 0;
      return `<button class="ms-rcell ${opn ? '' : 'locked'} ${r === here ? 'here' : ''}" data-room="${r}" ${opn || r === openRooms() + 1 ? '' : 'disabled'}>
        <canvas width="120" height="179" data-thumb="${r}"></canvas>
        <b>${esc(roomName(r))}</b>
        ${opn ? `<span class="ms-rdots">${[...Array(OBJS).keys()].map((o) => `<i class="${R(r).added[o] ? 'on' : ''}"></i>`).join('')}</span>`
          : `<span class="ms-rlock"><img src="${symSrc(host, 'lock')}" alt="">${r === openRooms() + 1 ? `${addedCount(newestRoom())}/${OBJS}` : ''}</span>`}
        ${r === here ? `<em class="ms-here">${UI.here}</em>` : ''}
        ${opn && n < OBJS && balance() >= (nextCost(r) ?? 1e9) ? '<i class="ms-rnew">!</i>' : ''}</button>`;
    }).join('');
    const el = open(`${topBar(UI.rooms, esc(UI.manor), starPill())}<div class="ms-rgrid">${cells}</div>`, 'ms-roomgrid');
    el.querySelectorAll('[data-thumb]').forEach((cv) => {
      const r = Number(cv.dataset.thumb);
      drawScene(host, cv, r, R(r).cur, { w: 120, h: 179, locked: !isOpenRoom(r) });
    });
    el.querySelector('.ms-rcell.here')?.scrollIntoView?.({ block: 'center' });
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="back"]')) { openManor(view); return; }
      const b = e.target.closest('[data-room]');
      if (b && !b.disabled) { host.sound('tap'); openManor(Number(b.dataset.room)); }
    });
  }

  /** After a win with stars to spend: show the next object in its spot. */
  function offerRestore() {
    const r = selRoom(), c = nextCost(r);
    if (c === null || balance() < c) return Promise.resolve(false);
    const o = pending(r)[0];
    return new Promise((resolve) => {
      const card = document.createElement('div');
      card.className = 'ms-pagecard ms-offer';
      const b = boxOf(r, o, Math.max(0, R(r).cur[o]));
      card.innerHTML = `
        <div class="ms-paper ms-offerbox">
          <div class="ms-offerframe"><canvas class="ms-offerroom"></canvas>
            <span class="ms-ghost can solo" style="left:${(b.x * 100).toFixed(1)}%;top:${((b.t + b.h * 0.55) * 100).toFixed(1)}%">${R(r).cur[o] >= 0 ? '↻' : '+'}</span></div>
          <div class="ms-offerstyles">${allowed(r, o).map((s) => `<img src="${decoSrc(host, r, o, s)}" alt="">`).join('')}</div>
          <p class="ms-offerline"><b>${esc(DECO_NAMES[r - 1][o])}</b><span class="ms-cost-star">${stars()}${c}</span></p>
          <button class="ms-mbtn wide primary" data-go>${R(r).cur[o] >= 0 ? UI.redecorate : UI.decorate}</button>
          <button class="ms-mbtn wide ghost" data-skip>${UI.later}</button>
        </div>`;
      screenEl().appendChild(card);
      drawScene(host, card.querySelector('canvas'), r, R(r).cur);
      host.track('restore_offer', { room: r });
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-go]')) { card.remove(); host.track('restore_offer_go', { room: r }); openManor(r); openPicker(r, o); resolve(true); }
        else if (e.target.closest('[data-skip]')) { card.remove(); resolve(false); }
      });
    });
  }

  /* ---- replay ---- */

  function openReplay(r) {
    const done = lvl() - 1;
    const levels = [];
    for (let c = 1; c <= state.chap; c += 1) {
      if (((c - 1) % ROOM_COUNT) + 1 !== r) continue;
      const a = chapStart(c), b = c < state.chap ? chapStart(c + 1) - 1 : Math.max(done, a + ROOM_LEVELS - 1);
      for (let n = a; n <= b; n += 1) levels.push({ n, fin: n - a + 1 === ROOM_LEVELS });
    }
    const cells = levels.map(({ n, fin }) => {
      const st = game.starsOf(n), opn = n <= done;
      return opn
        ? `<button class="ms-lvl ${fin ? 'fin' : ''}" data-lvl="${n}"><b>${n}</b><span>${'★'.repeat(st)}<em>${'★'.repeat(3 - st)}</em></span></button>`
        : `<span class="ms-lvl locked"><b>${n}</b>${LOCK}</span>`;
    }).join('');
    const el = open(`${topBar(UI.replayTitle, esc(roomName(r)))}
      <p class="ms-hintline">${stars()} ${UI.replayLine}</p>
      <div class="ms-lvlgrid">${cells}</div>`, 'ms-replay');
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="back"]')) { openManor(r); return; }
      const b = e.target.closest('[data-lvl]');
      if (b) { close(); game.onReplay(Number(b.dataset.lvl)); }
    });
  }

  /* ---- the keepsake album ---- */

  let albumBack = null;
  function openAlbum(onClose) {
    if (onClose !== undefined) albumBack = onClose;
    sync();
    if (!state.letterRead) { showLetter().then(() => openAlbum()); return; }
    let rows = `<div class="ms-krow ms-letterrow"><b>✉</b><span class="ms-kname">${esc(UI.letterTitle)}</span><div class="ms-kslots"><button class="ms-keep" data-letter><img src="${host.asset('img/item-duchess-letter.png')}" alt=""></button></div></div>`;
    for (let r = 1; r <= ROOM_COUNT; r += 1) {
      const slots = [0, 1].map((i) => (hasKeep(r, i)
        ? `<button class="ms-keep ${state.keepRead.includes(keyOf(r, i)) ? '' : 'new'}" data-keep="${r}.${i}"><img src="${keepSrc(host, r, i)}" alt="${esc(KEEPSAKES[r - 1][i].name)}"></button>`
        : `<span class="ms-keep empty"><img src="${keepSrc(host, r, i)}" alt="">${keepAt(r, i) ? `<small>${fmt(UI.lvlShort, { n: keepAt(r, i) })}</small>` : ''}</span>`)).join('');
      rows += `<div class="ms-krow ${isOpenRoom(r) ? '' : 'dim'}"><b>${r}</b><span class="ms-kname">${esc(roomName(r))}</span><div class="ms-kslots">${slots}</div></div>`;
    }
    const el = open(`${topBar(UI.album, `${state.keep.length} / ${ROOM_COUNT * 2}`, `<img class="ms-dicon" src="${host.asset('img/icon-diary.png')}" alt="">`)}<div class="ms-klist">${rows}</div>`, 'ms-album');
    el.querySelector('.ms-keep.new, .ms-keep:not(.empty)')?.scrollIntoView?.({ block: 'center' });
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="back"]')) {
        const f = albumBack; albumBack = null;
        if (f) { close(); f(); } else { close(); host.exit(); }
        return;
      }
      if (e.target.closest('[data-letter]')) { showLetter().then(() => openAlbum()); return; }
      const k = e.target.closest('[data-keep]');
      if (k) { const [r, i] = k.dataset.keep.split('.').map(Number); showKeepsake(r, i).then(() => openAlbum()); }
    });
  }

  /** The Duchess's welcome letter: the diary's first page, there from the start. */
  function showLetter() {
    if (!state.letterRead) { state.letterRead = true; host.track('letter_read', {}); game.save(); }
    refreshLobby();
    return cardFor(host.asset('img/item-duchess-letter.png'), UI.manor, UI.letterTitle, INTRO[0].text, false);
  }

  /** One keepsake on its card: the object, its name, and the handwritten line. */
  function showKeepsake(r, i, { fresh = false } = {}) {
    if (!state.keepRead.includes(keyOf(r, i))) { state.keepRead.push(keyOf(r, i)); game.save(); }
    refreshLobby();
    const k = KEEPSAKES[r - 1][i];
    return cardFor(keepSrc(host, r, i), fmt(UI.keepFrom, { room: roomName(r), i: i + 1 }), k.name, k.line, fresh);
  }

  function cardFor(src, from, name, line, fresh) {
    return new Promise((resolve) => {
      const card = document.createElement('div');
      card.className = `ms-pagecard ms-keepcard ${fresh ? 'fresh' : ''}`;
      card.innerHTML = `
        <div class="ms-paper ms-keepbox">
          <span class="ms-keepglow"></span>
          <img class="ms-keepimg" src="${src}" alt="">
          <small>${esc(from)}</small>
          <h3>${esc(name)}</h3>
          <p class="ms-hand">${esc(line)}</p>
          <span class="ms-tapon">${UI.tapContinue}</span>
        </div>`;
      screenEl().appendChild(card);
      requestAnimationFrame(() => card.classList.add('in'));
      setTimeout(() => card.addEventListener('click', () => { card.remove(); resolve(); }), 450);
    });
  }

  /* ---- cats ---- */

  function openCats(from = selRoom()) {
    const rows = CATS5.map((c) => {
      const lv = friendLevel(c);
      const hearts = [1, 2, 3, 4, 5].map((i) => `<img class="${i <= lv ? 'on' : ''}" src="${host.asset('img/friendship-heart.png')}" alt="">`).join('');
      const next = lv < 5 ? fmt(UI.nextAt, { n: FRIEND_AT[lv + 1] - friendPts(c), l: lv + 1 }) : UI.maxLevel;
      const said = lv >= 2 ? `“${FRIEND_LINES[c][Math.min(3, lv - 2)]}”` : '';
      const perk = lv >= 3 ? `<span class="ms-perk">${fmt(UI.perkUp, { t: FRIEND_PERKS[c].text })}</span>` : '';
      return `<div class="ms-crow">${host.art.cat('face', 64, 'ms-cface', c)}
        <div class="ms-cinfo"><b>${CAT_NAMES[c]}</b><span class="ms-hearts5">${hearts}</span><small>${next}</small>${said ? `<i>${esc(said)}</i>` : ''}${perk}</div></div>`;
    }).join('');
    const el = open(`${topBar(UI.cats, UI.friendship)}<div class="ms-dlist">${rows}</div>`, 'ms-cats');
    el.addEventListener('click', (e) => { if (e.target.closest('[data-act="back"]')) openManor(from); });
  }

  /* ---- settings ---- */

  function openSettings(from = selRoom()) {
    const row = (k, label) => `<label class="ms-set"><span>${label}</span><input type="checkbox" data-set="${k}" ${state.settings[k] ? 'checked' : ''}><i></i></label>`;
    const el = open(`${topBar(UI.settings, esc(UI.manor))}
      <div class="ms-setlist">${row('cb', UI.cbNumbers)}${row('left', UI.leftHanded)}${row('vib', UI.vibration)}</div>
      <button class="ms-mbtn wide" data-act="cats">${UI.cats}</button>`, 'ms-settings');
    el.addEventListener('change', (e) => {
      const k = e.target.dataset.set;
      if (!k) return;
      state.settings[k] = e.target.checked;
      host.track('settings_change', { key: k, on: e.target.checked ? 1 : 0 });
      game.onSettings(state.settings);
      game.save();
    });
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="back"]')) openManor(from);
      else if (e.target.closest('[data-act="cats"]')) openCats(from);
    });
  }

  /* ---- sharing ---- */

  async function shareRoom(r) {
    const a = document.createElement('canvas'), b = document.createElement('canvas');
    await drawScene(host, a, r, Array(OBJS).fill(-1));
    await drawScene(host, b, r, R(r).cur);
    const out = document.createElement('canvas'); out.width = W * 2 + 30; out.height = H + 110;
    const x = out.getContext('2d');
    x.fillStyle = '#f3dcbd'; x.fillRect(0, 0, out.width, out.height);
    x.drawImage(a, 10, 60); x.drawImage(b, W + 20, 60);
    x.fillStyle = '#3e2210'; x.font = '900 30px Nunito, sans-serif'; x.textAlign = 'center';
    x.fillText(`${roomName(r)} · Whiskerwood Manor`, out.width / 2, 42);
    x.font = '800 22px Nunito, sans-serif';
    x.fillText(UI.before, 10 + W / 2, H + 92); x.fillText(UI.after, W + 20 + W / 2, H + 92);
    const blob = await new Promise((res) => out.toBlob(res, 'image/png'));
    host.track('share_room', { room: r, objects: addedCount(r) });
    await host.shareFile?.({ blob, name: `whiskerwood-${r}.png`, text: `I decorated the ${roomName(r)} in Meowsweeper!`, from: 'room' });
  }

  /* ---- daily puzzle ---- */

  function openDaily() {
    const d = state.daily, t = today(), solved = d.last === t;
    const now = new Date(`${t}T12:00:00`);
    const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const week = Array.from({ length: 7 }, (_, i) => { const x = new Date(monday); x.setDate(monday.getDate() + i); return today(x); });
    const cal = week.map((day, i) => `<span class="ms-day ${d.days.includes(day) ? 'done' : ''} ${day === t ? 'today' : ''}"><small>${'MTWTFSS'[i]}</small>${d.days.includes(day) ? PAW : ''}</span>`).join('');
    const best = d.best.length
      ? d.best.slice(0, 5).map((b, i) => `<li><b>${i + 1}</b><span>${mmss(b.ms)}</span><span>${'♥'.repeat(b.hearts)}</span><small>${b.day.slice(5)}</small></li>`).join('')
      : '<li class="empty">–</li>';
    const sk = d.last === t || d.last === dayBefore(t) ? d.streak : 0;
    const el = open(`${topBar(UI.daily, esc(sk ? fmt(sk === 1 ? UI.streak1 : UI.streak, { n: sk }) : UI.streak0), `<img class="ms-dicon" src="${host.asset('img/icon-daily.png')}" alt="">`)}
      <div class="ms-cal">${cal}</div>
      <div class="ms-drow"><b>${UI.best}</b><ol class="ms-best">${best}</ol></div>
      ${solved ? `<div class="ms-drow ms-note"><small>${UI.note}</small><p class="ms-hand">${esc(DAILY_NOTES[dayNum(t) % DAILY_NOTES.length])}</p></div>` : ''}
      <div class="ms-grow"></div>
      ${solved ? `<p class="ms-mdone">${UI.dailyDone}</p>` : ''}
      <div class="ms-mfoot">
        <button class="ms-mbtn wide ${solved ? 'primary' : ''}" data-act="manor">${UI.manor}</button>
        ${solved ? '' : `<button class="ms-mbtn wide primary" data-act="daily">${UI.dailyPlay}</button>`}
      </div>`, 'ms-daily');
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'back') { close(); host.exit(); }
      else if (b.dataset.act === 'manor') openManor();
      else if (b.dataset.act === 'daily') { close(); game.onDaily(); }
    });
  }
  const dayNum = (s) => Math.floor(Date.parse(`${s}T12:00:00Z`) / 864e5);

  function paperCard(top, title, text, extra = '') {
    return new Promise((resolve) => {
      const card = document.createElement('div');
      card.className = 'ms-pagecard';
      card.innerHTML = `
        <div class="ms-paper">
          <img class="ms-seal" src="${top}" alt="">
          ${title ? `<small>${esc(title)}</small>` : ''}
          ${text ? `<p class="ms-hand">${esc(text)}</p>` : ''}${extra}
          <button class="ms-mbtn wide primary" data-close>${UI.next}</button>
        </div>`;
      screenEl().appendChild(card);
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]') || e.target === card) { card.remove(); resolve(); }
      });
    });
  }

  /** After today's puzzle is solved: streak, rewards, the household note. */
  async function onDailyWon({ ms, hearts }) {
    const d = state.daily, t = today();
    if (d.last === t) return;
    d.streak = d.last === dayBefore(t) ? d.streak + 1 : 1;
    d.last = t;
    if (!d.days.includes(t)) d.days.push(t);
    d.days = d.days.slice(-30);
    d.best.push({ ms, hearts, day: t });
    d.best.sort((a, b) => b.hearts - a.hearts || a.ms - b.ms);
    d.best = d.best.slice(0, 10);
    const coins = game.dailyCoins?.() ?? 60;
    host.wallet.earn(coins, 'daily');
    state.bonus += 3;
    let extra = `<p class="ms-reward">${host.art.coin(18)} +${coins} · ${stars()} +3 · ⏱ ${mmss(ms)}</p>`;
    if (d.streak % 7 === 0) {
      host.wallet.earn(300, 'daily_week');
      extra += `<img class="ms-chest" src="${host.asset('img/chest-open.png')}" alt=""><p class="ms-reward">${host.art.coin(18)} +300</p>`;
    }
    host.track('daily_win', { ms, hearts, streak: d.streak });
    game.save();
    refreshLobby();
    await paperCard(host.asset('img/icon-daily.png'), `${UI.note} · ${fmt(UI.streak, { n: d.streak })}`, DAILY_NOTES[dayNum(t) % DAILY_NOTES.length], extra);
  }

  /** The finale's chest of coins. */
  function finaleChest(chest) {
    return paperCard(host.asset('img/chest-open.png'), '', '', `<p class="ms-reward big">${host.art.coin(26)} +${chest}</p>`);
  }

  /** Doors swing open on the room just opened, which becomes the room you play in. */
  function openNewRoom() {
    state.sel = 0;
    game.onRoomChanged?.();
    return new Promise((resolve) => {
      openManor(newestRoom());
      host.sound('door');
      const fr = overlay?.querySelector('[data-frame]');
      if (fr) { doors(fr); setTimeout(() => { sparkles(fr, 16); host.sound('fanfare'); stamp(fr, symSrc(host, 'pawkey'), UI.newRoom); }, 700); }
      const prev = game.onPlay;
      const done = () => { game.onPlay = prev; resolve(); };
      game.onPlay = () => { prev(); done(); };
      overlay?.querySelector('[data-act="back"]')?.addEventListener('click', done, { once: true });
    });
  }

  /** The room's 10 levels are won but objects are still missing: show the room with what is left. */
  function roomToFinish() {
    const r = newestRoom();
    return new Promise((resolve) => {
      openManor(r);
      say(fmt(UI.placeRest, { n: OBJS - addedCount(r) }));
      const fr = overlay?.querySelector('[data-frame]');
      if (fr) host.sound('open');
      const prev = game.onPlay;
      const done = () => { game.onPlay = prev; resolve(); };
      game.onPlay = () => { prev(); done(); };
      overlay?.querySelector('[data-act="back"]')?.addEventListener('click', done, { once: true });
    });
  }

  function intro() {
    return new Promise((resolve) => {
      let i = 0;
      const show = () => {
        const s = INTRO[i];
        const art = s.art === 'letter'
          ? `<img class="ms-iart letter" src="${host.asset('img/item-duchess-letter.png')}" alt="">`
          : s.art === 'room' ? '<canvas class="ms-iart room"></canvas>'
            : host.art.cat('peek', 180, 'ms-iart cat', 'marmalade');
        const el = open(`
          <div class="ms-intro">
            <div class="ms-iframe">${art}</div>
            <p class="ms-itext ${s.art === 'letter' ? 'ms-hand' : ''}">${esc(s.text)}</p>
            <div class="ms-idots">${INTRO.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
            <div class="ms-mfoot">
              <button class="ms-mbtn wide" data-act="skip">${UI.skip}</button>
              <button class="ms-mbtn wide primary" data-act="next">${i === INTRO.length - 1 ? UI.go : UI.next}</button>
            </div>
          </div>`, 'ms-introwrap');
        if (s.art === 'room') drawScene(host, el.querySelector('canvas'), 1, [0, 1, -1, 0, -1, -1]);
        el.addEventListener('click', (e) => {
          const b = e.target.closest('[data-act]');
          if (!b) return;
          if (b.dataset.act === 'next' && i < INTRO.length - 1) { i += 1; show(); return; }
          close(); resolve();
        });
      };
      show();
    });
  }

  return {
    load(saved) {
      const f = fresh();
      const L = lvl();
      // Before rooms waited for their decorating, a room opened every 10 levels.
      const oldChap = Math.max(1, Math.ceil(L / ROOM_LEVELS));
      const oldStarts = Array.from({ length: oldChap }, (_, i) => i * ROOM_LEVELS + 1);
      const oldKeeps = () => {
        const out = [];
        for (let r = 1; r <= ROOM_COUNT; r += 1) for (let i = 0; i < 2; i += 1) if (oldLevelIn(r, i ? ROOM_LEVELS : 5) <= L - 1) out.push(keyOf(r, i));
        return out;
      };
      if (!saved) { state = f; sync(); return; }
      if (saved.v !== 3) {
        // From 2.x: dusting tasks become decorating, so their stars come back.
        state = { ...f, friend: saved.friend || {}, friendSeen: saved.friendSeen || {}, daily: { ...f.daily, ...(saved.daily || {}) }, settings: { ...f.settings, ...(saved.settings || {}) }, bonus: saved.bonus || 0,
          chap: oldChap, starts: oldStarts, keep: oldKeeps() };
      } else {
        state = {
          ...f, ...saved,
          rooms: f.rooms.map((fr, i) => {
            const s = saved.rooms?.[i] || {};
            return {
              round: s.round || 1,
              cur: fr.cur.map((_, o) => (Number.isInteger(s.cur?.[o]) ? s.cur[o] : -1)),
              used: fr.used.map((_, o) => (Array.isArray(s.used?.[o]) ? s.used[o].filter((x) => x >= 0 && x <= 2) : [])),
              added: fr.added.map((_, o) => (s.added?.[o] ? 1 : 0)),
            };
          }),
          chap: Number.isInteger(saved.chap) && saved.chap >= 1 ? saved.chap : oldChap,
          starts: Array.isArray(saved.starts) && saved.starts.length ? saved.starts : oldStarts,
          keep: Array.isArray(saved.keep) ? saved.keep : [],
          keepRead: Array.isArray(saved.keepRead) ? saved.keepRead : [],
          letterRead: !!saved.letterRead,
          daily: { ...f.daily, ...(saved.daily || {}) },
          settings: { ...f.settings, ...(saved.settings || {}) },
          friend: saved.friend || {},
        };
      }
      sync();
    },
    serialize: () => state,
    settings: () => state.settings,
    refreshLobby, openManor, openAlbum, openDaily, onDailyWon, finaleChest, openNewRoom, roomToFinish, intro, onLevelWon, perkBoost,
    canAdvance, advance, isFinale: (level) => kthHere(level) === ROOM_LEVELS, roomComplete: () => addedCount(newestRoom()) >= OBJS,
    letterRead: () => state.letterRead,
    offerRestore, unread, keepsakeFor, collect, showKeepsake,
    room: () => selRoom(),
    look: (r = selRoom()) => R(r).cur.slice(),
    canRestore: () => { const r = selRoom(), c = nextCost(r); return c !== null && balance() >= c; },
    dailySolved: () => state.daily.last === today(),
    isOpen: () => !!overlay,
    close,
    balance,
    sync,
    devStars: (n) => { state.bonus += n; game.save(); },
  };
}

const GEAR = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2.5l2 .4.5 2.4 1.7 1 2.3-.8 1.4 1.6-1 2.2.4 1.9 2.2 1.1-.1 2.1-2.4.6-.9 1.7.8 2.3-1.6 1.4-2.2-1-1.9.4-1.1 2.2h-2.1l-.6-2.4-1.7-.9-2.3.8-1.4-1.6 1-2.2-.4-1.9L2.5 13l.1-2.1 2.4-.6.9-1.7-.8-2.3 1.6-1.4 2.2 1 1.9-.4z" fill="#d9b48c" stroke="#5a3214" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="#fff7ea" stroke="#5a3214" stroke-width="1.4"/></svg>';
const SHARE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="18" cy="5.5" r="2.5" fill="currentColor"/><circle cx="6" cy="12" r="2.5" fill="currentColor"/><circle cx="18" cy="18.5" r="2.5" fill="currentColor"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" stroke="currentColor" stroke-width="2"/></svg>';
const PAW = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><g fill="#c4561f"><ellipse cx="12" cy="15.5" rx="5" ry="4.2"/><circle cx="5.8" cy="9.5" r="2.1"/><circle cx="9.6" cy="6.2" r="2.1"/><circle cx="14.4" cy="6.2" r="2.1"/><circle cx="18.2" cy="9.5" r="2.1"/></g></svg>';
const LOCK = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="#fff7ea" stroke="#3e2210" stroke-width="1.6"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#3e2210" stroke-width="2.4"/></svg>';
const REPLAY = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="#f7c548" stroke="#4a3428" stroke-width="2.4"/><path d="M13 20a7 7 0 1 0 2.4-5.3" fill="none" stroke="#4a3428" stroke-width="2.6" stroke-linecap="round"/><path d="M12 11v5h5" fill="none" stroke="#4a3428" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ROOMS_ICON = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 19 20 7l14 12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" fill="#f4d9b0" stroke="#4a3428" stroke-width="2.4" stroke-linejoin="round"/><rect x="11" y="21" width="7" height="6" rx="1" fill="#9fd0e8" stroke="#4a3428" stroke-width="2"/><rect x="22" y="21" width="7" height="6" rx="1" fill="#9fd0e8" stroke="#4a3428" stroke-width="2"/><path d="M17 35v-5h6v5" fill="#c4561f" stroke="#4a3428" stroke-width="2"/></svg>';
