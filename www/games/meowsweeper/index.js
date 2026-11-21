/**
 * Meowsweeper: Minesweeper with sleeping cats under cushions.
 *
 * Uncover every cushion that hides no cat. A number counts the sleeping cats
 * touching it. Waking a cat costs a heart, not the level. Boards come from
 * generator.js (always solvable without a guess) and levels.js (500 levels).
 */

import { levelSpec, dailySpec, setSpecialEvery, setEconomy, levelReward, baseReward, heartPrice, UNLOCK, CHAPTER_SIZE } from './levels.js';
import { generate } from './generator.js';
import { t, LANGS, getLang, setLang } from './strings.js';
import { createManor, roomName, hostOf, winLine, today, roomPicture, symSrc, keepSrc } from './manor.js';
import { UI, ROOM_THEMES, SPECIAL_TEXT, CAT_NAMES } from './manor-data.js';
import { SOUNDS, catPop, flyTo, stamp, wait } from './fx.js';

const PRICE = { hint: 40, sniff: 60, scan: 90, catnip: 150 };
const MAX_EXTRA_HEARTS = 2;
/** The symbol for each special board. */
const SYM_OF = { heart: 'heart', teacup: 'teacup', cat: 'catcushion', lantern: 'lantern', catnap: 'catnap' };
/** Guard never acts before this level, so new players learn what waking a cat costs. */
const GUARD_FROM = 7;

const CAT = '<svg viewBox="0 0 24 24" class="ms-cat" aria-hidden="true"><path class="f" d="M4 5l4 3.4a8 8 0 0 1 8 0L20 5v8.5a8 8 0 0 1-16 0z"/><path class="e" d="M7.6 13.2q1.5 1.4 3 0M13.4 13.2q1.5 1.4 3 0" fill="none" stroke-width="1.3" stroke-linecap="round"/><path class="n" d="M11 15.6h2l-1 1.2z"/></svg>';
const CAT_AWAKE = '<svg viewBox="0 0 24 24" class="ms-cat awake" aria-hidden="true"><path class="f" d="M4 5l4 3.4a8 8 0 0 1 8 0L20 5v8.5a8 8 0 0 1-16 0z"/><circle class="p" cx="9" cy="13" r="1.5"/><circle class="p" cx="15" cy="13" r="1.5"/><path class="n" d="M11 15.8h2l-1 1.2z"/></svg>';

const bits = (arr) => arr.map((v) => (v ? '1' : '0')).join('');
const unbits = (s, n) => Array.from({ length: n }, (_, i) => s?.[i] === '1');

// Task wording, worked out here so the manifest below stays plain (the pre-flight reads it as text).
/** The running game, for the Cats and Progress tabs. */
let live = null;
const withFriend = (id, text) => {
  const f = live?.manor.friendOf(id);
  if (!f) return text;
  const hearts = [1, 2, 3, 4, 5].map((i) => `<img class="${i <= f.level ? 'on' : ''}" src="${live.host.asset('img/friendship-heart.png')}" alt="">`).join('');
  return `${text}<span class="ms-fhearts" aria-label="${f.level} / 5">${hearts}</span>${f.line ? `<i class="ms-fline">“${f.line}”</i>` : ''}`;
};

const TASK = {
  taskCush150: t('taskCush', { n: 150 }), taskPaws15: t('taskPaws', { n: 15 }),
  taskWins2: t('taskWins', { n: 2 }), taskWins5: t('taskWins', { n: 5 }), taskWins10: t('taskWins', { n: 10 }),
  taskChords20: t('taskChords', { n: 20 }), taskPerfect2: t('taskPerfect', { n: 2 }), taskPerfect5: t('taskPerfect', { n: 5 }),
  taskHard: t('taskHard'),
};

export default {
  id: 'meowsweeper',
  name: 'Meowsweeper',
  saveVersion: 1,
  styles: ['style.css'],
  analytics: { batch: ['level'] },

  // The Cats tab: the five cats of the story, each shown by name before it is won (Soot has no art).
  catRoster: { hide: ['soot'], showLocked: true },

  // Each cat's perk; the Cats tab shows it with the cat's friendship from the manor.
  perks: {
    patch: { get text() { return withFriend('patch', t('perkPatch')); }, config: {} },
    mittens: { get text() { return withFriend('mittens', t('perkMittens')); }, config: { sniffPrice: 40 } },
    soot: { text: t('perkSoot'), config: { guard: true } },
    marmalade: { get text() { return withFriend('marmalade', t('perkMarmalade')); }, config: { hearts: 4 } },
    pepper: { get text() { return withFriend('pepper', t('perkPepper')); }, config: { coinBonus: 0.25 } },
    biscuit: { get text() { return withFriend('biscuit', t('perkBiscuit')); }, config: { scanWide: true } },
  },

  cosmetics: [
    { id: 'gingham', preview: 'img/cushion-gingham.png', name: t('fabGingham'), price: 0, note: t('fabNote') },
    { id: 'knit', preview: 'img/cushion-knit.png', name: t('fabKnit'), price: 800, note: t('fabNote') },
    { id: 'velvet', preview: 'img/cushion-velvet.png', name: t('fabVelvet'), price: 1500, note: t('fabNote') },
    { id: 'patchwork', preview: 'img/cushion-patchwork.png', name: t('fabPatchwork'), price: 2500, note: t('fabNote') },
    { id: 'starry', preview: 'img/cushion-starry.png', name: t('fabStarry'), price: 4000, note: t('fabNote') },
  ],

  // Never reward spending: no booster tasks.
  tasks: [
    { id: 'cush-150', tier: 'easy', text: TASK.taskCush150, stat: 'cushions', target: 150 },
    { id: 'paws-15', tier: 'easy', text: TASK.taskPaws15, stat: 'paws', target: 15 },
    { id: 'wins-2', tier: 'easy', text: TASK.taskWins2, stat: 'wins', target: 2 },
    { id: 'wins-5', tier: 'medium', text: TASK.taskWins5, stat: 'wins', target: 5 },
    { id: 'chords-20', tier: 'medium', text: TASK.taskChords20, stat: 'chords', target: 20, from: UNLOCK.chord },
    { id: 'perfect-2', tier: 'medium', text: TASK.taskPerfect2, stat: 'perfect', target: 2 },
    { id: 'hard-1', tier: 'hard', text: TASK.taskHard, stat: 'hardWins', target: 1, from: UNLOCK.hard },
    { id: 'perfect-5', tier: 'hard', text: TASK.taskPerfect5, stat: 'perfect', target: 5 },
    { id: 'wins-10', tier: 'hard', text: TASK.taskWins10, stat: 'wins', target: 10 },
  ],

  quest: { unlockLevel: 12, steps: 7 },

  // Tuning that Firebase Remote Config can change without an update (defaults here).
  remote: {
    star_cost_scale: { default: 1, type: 'num', min: 0.5, max: 2, about: 'Multiplies every restoration task cost.' },
    free_hints: { default: 3, type: 'int', min: 0, max: 20, about: 'Free hints a new player starts with.' },
    special_every: { default: 7, type: 'int', min: 3, max: 30, about: 'A special board every N levels.' },
    daily_coins: { default: 40, type: 'int', min: 0, max: 1000, about: 'Coins for solving the daily puzzle.' },
    coins_level_base: { default: 10, type: 'int', min: 1, max: 200, about: 'Coins for winning level 1 (more is added every 10 levels).' },
    coins_per_10_levels: { default: 1, type: 'num', min: 0, max: 20, about: 'Extra coins per level win for every 10 levels reached.' },
    coins_perfect_bonus: { default: 5, type: 'int', min: 0, max: 200, about: 'Bonus coins for a level won without waking a cat.' },
    heart_price_x: { default: 4, type: 'num', min: 0.5, max: 50, about: 'First extra heart costs this many level rewards.' },
    heart2_price_x: { default: 2.5, type: 'num', min: 1, max: 10, about: 'Second extra heart costs this many times the first.' },
    ad_hearts_per_level: { default: 1, type: 'int', min: 0, max: 2, about: 'Extra hearts a player may get from ads on one level.' },
    protected_levels: { default: 3, type: 'int', min: 0, max: 20, about: 'On these first levels a woken cat costs no heart.' },
  },

  sounds: {
    ...SOUNDS,
    purr: (at, { ctx, bus }) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(190, at); o.frequency.linearRampToValueAtTime(250, at + 0.16);
      g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(0.22, at + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
      o.connect(g); g.connect(bus); o.start(at); o.stop(at + 0.24);
    },
    mrrp: (at, { ctx, bus }) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(520, at); o.frequency.exponentialRampToValueAtTime(880, at + 0.09); o.frequency.exponentialRampToValueAtTime(420, at + 0.3);
      g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(0.16, at + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
      o.connect(g); g.connect(bus); o.start(at); o.stop(at + 0.34);
    },
  },

  create(host, root) {
    const PERKS = this.perks || {};
    root.classList.add('ms-root');
    root.dataset.fabric = 'gingham';

    // What lasts between levels.
    let level = 1;
    let stars = {};                     // level -> best stars
    let perfects = 0;
    let free = { hint: host.remote('free_hints') ?? 3, sniff: 2, scan: 1, catnip: 1 };
    setSpecialEvery(host.remote('special_every'));
    setEconomy({ base: host.remote('coins_level_base'), per10: host.remote('coins_per_10_levels'), heart1: host.remote('heart_price_x'), heart2: host.remote('heart2_price_x') });
    const PERFECT = () => host.remote('coins_perfect_bonus') ?? 5;
    const PROTECTED = () => host.remote('protected_levels') ?? 3;
    let perk = {};

    // The board in play.
    let spec = null;
    let board = null;
    let open = [], flag = [], woke = [], knot = [];
    let hearts = 3, lost = 0, extra = 0, guardUsed = false;
    let over = false, busy = false;
    let pawMode = false;
    let target = null;                  // a booster waiting for a cushion: 'scan' | 'catnip'
    let note = '';                      // a passing line over the tip
    let noteTimer = null;
    let scanMarks = null;
    let langOpen = false;
    let hintCell = -1;                  // a cushion the Hint showed as safe
    let proofCell = -1;                 // the number that proves it
    let sniffed = new Set();            // cats Sniff found (their paws are certain)
    let zoom = null;                    // null: automatic; true/false: the player's choice
    let zoomed = false;
    let roomShown = '';
    let lastRoomUrl = '';
    let mode = 'level';                 // 'level' or 'daily'
    let levelCur = null;                // the level board in progress while the daily puzzle is open
    let dailyStart = 0;
    let combo = 0;                      // safe taps in a row, for the rising notes
    let popping = new Set();            // cells mid-flip
    let wornId = 'patch';
    let ambTimer = null, ambType = '';
    let coachStep = 0;
    let lastTap = -1;
    let realLevel = 0;                  // the level in progress while an old one is replayed
    let adHearts = 0;                   // hearts from ads on this board
    const haptic = (pattern) => { if (manor?.settings().vib !== false) host.haptic(pattern); };
    // A shell that has languages (host.locale) owns the choice: the game follows it and
    // its own picker goes away, since Settings has one. An older shell leaves it to the game.
    const shellOwnsLang = typeof host.locale === 'function';
    if (shellOwnsLang) setLang(host.locale(), { remember: false });

    root.innerHTML = `
      <div class="ms-hud">
        <div class="ms-hearts" data-hearts></div>
        <div class="ms-prog">
          <div class="ms-pbar"><i data-pfill></i></div>
          <span class="ms-ptext"><b class="ms-badge" data-badge hidden></b><span data-ptext></span></span>
        </div>
        <div class="ms-left" data-left></div>
        <button class="ms-lang" data-lang aria-label="Language"></button>
      </div>
      <div class="ms-langs" data-langs hidden></div>
      <div class="ms-sayrow"><div class="ms-say" data-say><span class="ms-saycat" data-saycat></span><p class="ms-tip" data-tip></p></div>
        <button class="ms-diarybtn" data-diary aria-label="Diary"><img src="" alt="" data-diaryimg><i class="ms-badge-n" data-diaryn hidden></i></button></div>
      <div class="ms-stage" data-stage>
        <div class="ms-wrap" data-wrap><div class="ms-board" data-board></div></div>
        <div class="ms-modes" data-modes hidden>
        <button data-mode="open"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 11V5a1.8 1.8 0 0 1 3.6 0v5l4.6.9a2.2 2.2 0 0 1 1.7 2.5l-.8 4.6A3.5 3.5 0 0 1 14.6 21H11a3.5 3.5 0 0 1-2.8-1.4L5 15.4a1.6 1.6 0 0 1 2.4-2.1L9 15" fill="#fff7ea" stroke="#3e2210" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/></svg><span data-l-open></span></button>
        <button data-mode="mark"><img class="ms-paw" src="" alt="" data-pawimg><span data-l-mark></span></button>
      </div>
        <button class="ms-zoom" data-zoom hidden></button>
      </div>
      <div class="ms-tools" data-tools></div>`;
    const $ = (s) => root.querySelector(s);
    const elBoard = $('[data-board]');
    const PAW_IMG = `<img class="ms-paw" src="${host.asset('img/paw.png')}" alt="" draggable="false">`;
    const HEART = `<img class="ms-heart" src="${host.asset('img/heart.png')}" alt="" draggable="false">`;
    const ICON = {
      hint: `<img class="ms-tool-ico" src="${symSrc(host, 'hint')}" alt="" draggable="false">`,
      sniff: `<img class="ms-tool-ico" src="${host.asset('img/icon-sniff.png')}" alt="" draggable="false">`,
      scan: `<img class="ms-tool-ico" src="${host.asset('img/icon-scan.png')}" alt="" draggable="false">`,
      catnip: `<img class="ms-tool-ico" src="${host.asset('img/icon-catnip.png')}" alt="" draggable="false">`,
    };
    const YARN_IMG = `<img class="ms-yarn" src="${host.asset('img/yarn.png')}" alt="" draggable="false">`;
    const WOKE_IMG = `<img class="ms-woke" src="${host.asset('img/board-cat-woken.png')}" alt="" draggable="false">`;
    const SLEEP_IMG = `<img class="ms-sleepcat" src="${host.asset('img/board-cat-sleep.png')}" alt="" draggable="false">`;
    const zoomBtn = $('[data-zoom]');
    const elWrap = $('[data-wrap]');
    let cells = [];
    let drawn = [];                     // what each cushion last showed, so art is not reloaded on every draw

    /* ---------------- drawing ---------------- */

    const safeTotal = () => board.cat.reduce((s, c, i) => s + (!c && !board.wall[i] ? 1 : 0), 0);
    const openCount = () => open.reduce((s, v) => s + (v ? 1 : 0), 0);
    const catsLeft = () => board.cats - flag.reduce((s, v) => s + (v ? 1 : 0), 0) - woke.reduce((s, v) => s + (v ? 1 : 0), 0);
    const boost = () => manor?.perkBoost(wornId) || {};
    const maxHearts = () => Math.max(boost().hearts || perk.hearts || 3, spec?.special?.type === 'catnap' ? 5 : 0);
    const sniffPrice = () => boost().sniffPrice || perk.sniffPrice || PRICE.sniff;
    const price = (b) => (b === 'sniff' ? sniffPrice() : b === 'scan' ? (boost().scanPrice || PRICE.scan) : PRICE[b]);
    const boosterName = (b) => (b === 'hint' ? t('hint') : t(b));
    const totalStars = () => Object.values(stars).reduce((s, v) => s + v, 0);
    const manor = createManor(host, {
      level: () => (mode === 'replay' ? realLevel || level : level),
      stars: totalStars,
      fabric: () => root.dataset.fabric || 'gingham',
      onPlay: () => { ambience(true); clearTimeout(nudgeTimer); nudgeTimer = setTimeout(nudge, 500); },
      onDaily: () => startDaily(),
      onReplay: (n) => startReplay(n),
      starsOf: (n) => stars[n] || 0,
      onRoomChanged: () => { roomShown = ''; if (spec && board) { setRoom(); report(); drawStarPill(); } },
      onSettings: (st) => applySettings(st),
      save: () => host.save(),
      root: () => root,
      costScale: () => host.remote('star_cost_scale') ?? 1,
      dailyCoins: () => host.remote('daily_coins') ?? 60,
      onStars: () => { shownStars = manor.balance(); drawStarPill(); },
    });
    live = { manor, host };

    function fit() {
      if (!board) return;
      const stage = $('[data-stage]'), modesEl = $('[data-modes]');
      const mh = modesEl.hidden ? 0 : modesEl.offsetHeight + 10;
      const w = stage.clientWidth - 30, h = stage.clientHeight - mh - 36;   // the board's frame and its drop shadow
      if (w <= 0 || h <= 0) return;
      const fitSize = Math.max(18, Math.min(52, Math.floor(Math.min(w / board.cols, h / board.rows))));
      // Cushions under about 40 px are hard to tap: offer a zoomed board you scroll around.
      const zoomable = fitSize < 40;
      // Not on a very short window (a landscape browser): a zoomed board there would show a sliver.
      zoomed = zoomable && (zoom ?? (fitSize < 28 && h >= 260));
      const size = zoomed ? 46 : fitSize;
      elWrap.classList.toggle('zoomed', zoomed);
      elWrap.style.height = zoomed ? `${stage.clientHeight - mh}px` : '';
      elBoard.style.setProperty('--cell', `${size}px`);
      elBoard.style.gridTemplateColumns = `repeat(${board.cols}, ${size}px)`;
      zoomBtn.hidden = !zoomable;
      zoomBtn.classList.toggle('on', zoomed);
      zoomBtn.setAttribute('aria-label', zoomed ? UI.zoomFit : UI.zoomIn);
      zoomBtn.innerHTML = zoomed
        ? '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 15l5 5M10.5 8v5M8 10.5h5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    }

    /** In a zoomed board, bring a cushion into the middle of the view. */
    function centerOn(i) {
      if (!zoomed || !cells[i]) return;
      const c = cells[i];
      elWrap.scrollTo({
        left: c.offsetLeft - elWrap.clientWidth / 2 + c.offsetWidth / 2,
        top: c.offsetTop - elWrap.clientHeight / 2 + c.offsetHeight / 2,
        behavior: 'smooth',
      });
    }

    function setRoom() {
      const n = manor.room();
      const th = ROOM_THEMES[n - 1];
      root.style.setProperty('--mat', th.mat);
      root.style.setProperty('--mat-edge', th.edge);
      root.classList.toggle('night', !!th.night);
      ambType = th.amb;
      const look = manor.look(n);
      const key = `${n}:${look.join('')}`;
      if (key === roomShown) return;
      roomShown = key;
      const scr = root.closest('.screen');
      if (!scr) return;
      scr.style.backgroundSize = 'cover';
      scr.style.backgroundPosition = 'center';
      // The room exactly as the player has decorated it so far.
      roomPicture(host, n, look).then((url) => {
        lastRoomUrl = url;
        if (roomShown !== key) return;
        scr.style.backgroundImage = `linear-gradient(rgba(255, 244, 228, .12), rgba(255, 244, 228, .12)), url("${url}")`;
      });
    }

    /** The star counter beside the coins: what there is to spend; a tap opens the room. */
    let starPill = null;
    let shownStars = 0;
    let flying = false;
    function drawStarPill() {
      const scr = root.closest('.screen');
      const top = scr?.querySelector('.hdr-top');
      if (!top) return;
      if (!starPill || !top.contains(starPill)) {
        starPill = document.createElement('button');
        starPill.className = 'ms-starpill';
        starPill.setAttribute('aria-label', UI.stars);
        starPill.innerHTML = `<img src="${host.asset('img/star-seal.png')}" alt=""><b></b><i class="ms-starpill-dot" hidden></i>`;
        const coins = top.querySelector('.coins');
        if (coins?.nextSibling) top.insertBefore(starPill, coins.nextSibling); else top.appendChild(starPill);
        starPill.addEventListener('click', () => {
          if (busy || over || manor.isOpen()) return;
          host.sound('tap');
          if (coachStep === 4) host.setFlag('coachStars');
          if (coachStep >= 3) { host.coach?.clear(); coachStep = 0; }
          ambience(false);
          manor.openManor();
        });
      }
      starPill.querySelector('b').textContent = shownStars;
      starPill.querySelector('.ms-starpill-dot').hidden = !manor.canRestore() || shownStars < manor.balance();
    }
    function build() {
      elBoard.innerHTML = board.cat.map((_, i) => `<button class="ms-cell" data-i="${i}"></button>`).join('');
      cells = [...elBoard.children];
      const dark = document.createElement('div'); dark.className = 'ms-dark'; elBoard.appendChild(dark);
      drawn = [];
      fit();
    }

    function drawCell(i) {
      const el = cells[i];
      let cls = 'ms-cell', html = '';
      if (board.wall[i]) cls += ' wall';
      else if (woke[i]) { cls += ' woke'; html = WOKE_IMG; }
      else if (open[i]) { cls += ' open'; if (board.num[i] > 0) { cls += ` n${board.num[i]}`; html = String(board.num[i]); } if (i === proofCell) cls += ' proof'; }
      else {
        cls += ' cover';
        if (flag[i]) { cls += sniffed.has(i) ? ' flag sniffed' : ' flag'; html = PAW_IMG; }
        else if (knot[i]) { cls += ' knot'; html = YARN_IMG; }
        else if (over && board.cat[i]) { cls += ' reveal'; html = SLEEP_IMG; }
        if (i === hintCell) cls += ' hint';
      }
      if (scanMarks?.cells.includes(i)) cls += scanMarks.hit ? ' scan-yes' : ' scan-no';
      if (popping.has(i) && open[i]) {
        cls += ' pop';
        const c = board.cols, d = lastTap < 0 ? 0 : Math.max(Math.abs((i % c) - (lastTap % c)), Math.abs(Math.floor(i / c) - Math.floor(lastTap / c)));
        el.style.setProperty('--d', `${Math.min(d, 14) * 22}ms`);
      }
      if (el.className !== cls) el.className = cls;
      if (drawn[i] !== html) { drawn[i] = html; el.innerHTML = html; }
    }

    function tipText() {
      if (note) return note;
      if (target) return t('target', { what: boosterName(target) });
      if (mode === 'daily') return UI.dailyTip;
      if (spec?.special) return SPECIAL_TEXT[spec.special.shape || spec.special.type];
      const key = { 1: 'tip1', 2: 'tip3', 3: 'tipHint', 5: 'tip5', 7: 'tip6', 10: 'tip15', 12: 'tip12', 21: 'tip20', 26: 'tip40', 45: 'tip45' }[level];
      if (key) return t(key);
      const left = mode === 'level' ? manor.objectsToOpen() : 0;
      return left ? UI.placeRest.replace('{n}', left) : '';
    }

    function drawHud() {
      $('[data-hearts]').innerHTML = Array.from({ length: Math.max(maxHearts(), hearts) }, (_, i) =>
        `<i class="${i < hearts ? 'on' : 'off'}">${HEART}</i>`).join('');
      const badge = $('[data-badge]');
      const fin = isFin();
      badge.hidden = !spec.hard && !spec.special && !fin && mode !== 'daily';
      const bsym = mode === 'daily' ? 'img/icon-daily.png' : fin ? 'trophy' : spec.special ? SYM_OF[spec.special.shape || spec.special.type] : '';
      const btext = mode === 'daily' ? UI.dailyShort : fin ? UI.finale : spec.hard ? t('hard') : UI.special;
      const bkey = `${bsym}|${btext}`;
      if (badge.dataset.k !== bkey) { badge.dataset.k = bkey; badge.innerHTML = `${bsym ? `<img src="${bsym.startsWith('img/') ? host.asset(bsym) : symSrc(host, bsym)}" alt="">` : ''}${btext}`; }
      badge.classList.toggle('sp', !!spec.special || mode === 'daily');
      badge.classList.toggle('fin', fin);
      const frac = board ? openCount() / Math.max(1, safeTotal()) : 0;
      $('[data-pfill]').style.width = `${(frac * 100).toFixed(1)}%`;
      $('[data-ptext]').textContent = badge.hidden ? t('cushionsN', { a: openCount(), b: safeTotal() }) : `${openCount()} / ${safeTotal()}`;
      $('[data-left]').innerHTML = `${SLEEP_IMG}<b>${Math.max(0, catsLeft())}</b>`;
      $('[data-left]').setAttribute('aria-label', t('catsLeft'));
      $('[data-lang]').hidden = shellOwnsLang;
      $('[data-lang]').textContent = getLang().toUpperCase();
      const langs = $('[data-langs]');
      langs.hidden = !langOpen;
      langs.innerHTML = LANGS.map((l) => `<button data-set="${l.id}" class="${l.id === getLang() ? 'on' : ''}">${l.name}</button>`).join('');
      const tip = $('[data-tip]');
      const text = tipText();
      tip.textContent = text;
      tip.classList.toggle('alert', !!note);
      const dimg = $('[data-diaryimg]');
      if (!dimg.getAttribute('src')) dimg.src = host.asset('img/icon-diary.png');
      const un = manor.unread(), dn = $('[data-diaryn]');
      dn.hidden = !un; dn.textContent = un;
      const say = $('[data-say]');
      say.classList.toggle('empty', !text);
      const saycat = $('[data-saycat]');
      if (!saycat.firstChild) saycat.innerHTML = host.art.cat('peek', 66, 'ms-peekcat');

      const tool = (id, label, body, on, extraCls = '') =>
        `<button class="ms-tool ${extraCls} ${on ? 'on' : ''}" data-tool="${id}">${ICON[id] || ''}<span class="ms-tool-name">${label}</span>${body}</button>`;
      const cost = (b) => (free[b] > 0
        ? `<span class="ms-cost free">${t('free')} ×${free[b]}</span>`
        : `<span class="ms-cost">${host.art.coin(13)}${price(b)}</span>`);
      let html = '';
      // All four cards from level 1; the ones not open yet are locked and say when they open.
      const LOCK = '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>';
      const card = (id, extra, on = false) => (level >= UNLOCK[id]
        ? tool(id, boosterName(id), cost(id), on, extra)
        : `<button class="ms-tool locked ${extra}" data-tool="${id}" data-lock="${UNLOCK[id]}" aria-label="${boosterName(id)}: ${UI.opensAt.replace('{n}', UNLOCK[id])}">${ICON[id] || ''}<span class="ms-tool-name">${boosterName(id)}</span><span class="ms-cost lock">${LOCK} ${UI.lvl.replace('{n}', UNLOCK[id])}</span></button>`);
      html += card('hint', 'hint') + card('sniff', '') + card('scan', '', target === 'scan') + card('catnip', '', target === 'catnip');
      $('[data-tools]').innerHTML = html;
      const modes = $('[data-modes]');
      const hideModes = false;
      if (modes.hidden !== hideModes) { modes.hidden = hideModes; requestAnimationFrame(fit); }
      modes.querySelector('[data-mode="open"]').classList.toggle('on', !pawMode);
      modes.querySelector('[data-mode="mark"]').classList.toggle('on', pawMode);
      $('[data-l-open]').textContent = UI.open;
      $('[data-l-mark]').textContent = UI.mark;
      const pawImg = $('[data-pawimg]');
      if (!pawImg.getAttribute('src')) pawImg.src = host.asset('img/paw.png');
      if (lastTap >= 0 && cells[lastTap]) {
        elBoard.style.setProperty('--lx', `${cells[lastTap].offsetLeft + cells[lastTap].offsetWidth / 2}px`);
        elBoard.style.setProperty('--ly', `${cells[lastTap].offsetTop + cells[lastTap].offsetHeight / 2}px`);
      }
      root.classList.toggle('hard', !!spec.hard);
      root.classList.toggle('tall', spec.rows >= 13);
      setRoom();
      if (!flying) shownStars = manor.balance();
      drawStarPill();
    }

    function report() {
      host.progress({
        title: mode === 'daily' ? UI.dailyShort : t('level', { n: level }),
        fraction: board ? openCount() / Math.max(1, safeTotal()) : 0,
        figure: board ? `${openCount()} / ${safeTotal()}` : '',
        sub: mode === 'daily' ? niceDate() : roomName(manor.room()),
        level,
        summary: t('summary', { n: level, ch: roomName(manor.room()) }),
      });
    }

    function draw() {
      for (let i = 0; i < cells.length; i += 1) drawCell(i);
      drawHud();
      report();
      if (popping.size) {
        const batch = [...popping];
        setTimeout(() => { batch.forEach((k) => popping.delete(k)); if (board) batch.forEach((k) => cells[k] && drawCell(k)); }, 1100);
      }
    }

    function say(text, ms = 2200) {
      note = text;
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => { note = ''; drawHud(); }, ms);
      drawHud();
    }

    /* ---------------- a level ---------------- */

    function newBoard(saved) {
      spec = mode === 'daily' ? { ...dailySpec(today()), chapter: levelSpec(level).chapter } : levelSpec(level);
      board = generate(spec);
      const n = board.cat.length;
      over = false; busy = false; target = null; scanMarks = null; note = ''; hintCell = -1; proofCell = -1; sniffed = new Set(); combo = 0; popping = new Set(); lastTap = -1; adHearts = 0;
      pawMode = false;                    // every board starts in Open mode
      dailyStart = 0;
      root.classList.toggle('lantern', spec.special?.type === 'lantern');
      root.classList.toggle('daily', mode === 'daily');
      if (spec.special) host.track('special_start', { level, type: spec.special.shape || spec.special.type });
      if (mode !== 'daily' && saved && saved.level === level && saved.open?.length === n) {
        open = unbits(saved.open, n); flag = unbits(saved.flag, n); woke = unbits(saved.woke, n); knot = unbits(saved.knot, n);
        hearts = saved.hearts ?? maxHearts(); lost = saved.lost || 0; extra = saved.extra || 0; guardUsed = !!saved.guardUsed;
      } else {
        open = new Array(n).fill(false); flag = new Array(n).fill(false); woke = new Array(n).fill(false);
        knot = board.knot.slice();
        hearts = maxHearts(); lost = 0; extra = 0; guardUsed = false;
        flood(board.start);                       // the opened patch every level starts from
        host.track('board_start', { level, cols: spec.cols, rows: spec.rows, cats: board.cats, hard: spec.hard ? 1 : 0 });
        const sym = mode === 'daily' ? '' : isFin() ? 'trophy' : spec.special ? SYM_OF[spec.special.shape || spec.special.type] : '';
        if (sym) setTimeout(() => { if (!manor.isOpen()) { stamp($('[data-stage]'), symSrc(host, sym), isFin() ? UI.finale : ''); host.sound('sparkle'); } }, 450);
      }
      build();
      lastTap = board.start;
      draw();
      if (zoomed) requestAnimationFrame(() => centerOn(board.start));
      if (level === 1 && mode === 'level' && !host.flag('coached')) requestAnimationFrame(() => { if (!manor.isOpen()) coach(1); });
      else nudgeTimer = setTimeout(nudge, 900);
    }

    /* ---------------- first-time coaching ---------------- */

    /** The room's 10th level: its finale (chest, keepsake). Only in normal play. */
    const isFin = () => mode === 'level' && manor.isFinale(level);

    /**
     * Two one-time pointers after the first board's coaching: the star counter
     * (once there are stars) and the diary (until the Duchess's letter is read).
     */
    let nudgeTimer = null;
    function nudge() {
      clearTimeout(nudgeTimer);
      if (!onScreen || !host.coach || !board || over || busy || manor.isOpen() || (coachStep && coachStep !== 3) || mode !== 'level') return;
      if (!root.offsetParent || document.querySelector('.overlays .ovl, .ms-pagecard, .ms-keepcard, .ms-sheet, .panel-sheet.in')) { nudgeTimer = setTimeout(nudge, 1200); return; }
      if (!host.flag('coached')) return;
      if (level >= 2 && !host.flag('coachStars') && starPill) {
        coachStep = 4;
        host.coach.tip({ at: starPill, text: UI.coachStars, hand: starPill });
        host.track('coach_step', { step: 'stars' });
        // Seen in full (or tapped) counts; covered halfway, it comes back later.
        nudgeTimer = setTimeout(() => { if (coachStep === 4) { host.setFlag('coachStars'); host.coach.clear(); coachStep = 0; nudge(); } }, 6000);
      } else if (!manor.letterRead()) {
        const d = $('[data-diary]');
        coachStep = 3;
        host.coach.tip({ at: d, text: UI.coachDiary, hand: d });
        host.track('coach_step', { step: 'diary' });
      }
    }

    /** Pointers belong to the board: away when anything covers it, back when it is clear again. */
    let pointerWas = 0;
    let onScreen = false;              // the board is the screen in front
    function clearPointers() {
      clearTimeout(nudgeTimer);
      if (coachStep) pointerWas = coachStep;
      host.coach?.clear();
      coachStep = 0;
    }
    function restorePointers() {
      setTimeout(() => {
        if (!onScreen || mode !== 'level' || !board || over || busy || manor.isOpen() || !root.offsetParent || document.querySelector('.overlays .ovl, .ms-pagecard, .ms-keepcard, .panel-sheet.in')) return;
        const was = pointerWas; pointerWas = 0;
        if (was === 1 && level === 1 && !host.flag('coached')) coach(1);
        else nudge();
      }, 450);
    }

    /** Anything that opens over the board (a shell card or tab, a keepsake, the decorate offer) takes the pointer away. */
    let watching = false;
    function watchCovers() {
      if (watching) return;
      const scr = root.closest('.screen'), ovl = document.querySelector('.overlays');
      if (!scr) return;
      watching = true;
      const covered = () => !!document.querySelector('.overlays .ovl, .ms-pagecard, .ms-keepcard, .ms-sheet, .panel-sheet.in') || manor.isOpen();
      const mo = new MutationObserver(() => {
        if (covered() || !onScreen) { if (coachStep) clearPointers(); }
        else if (pointerWas) restorePointers();
      });
      mo.observe(scr, { childList: true });
      const ps = document.querySelector('.panel-sheet');
      if (ps) mo.observe(ps, { attributes: true, attributeFilter: ['class'] });
      if (ovl) mo.observe(ovl, { childList: true });
    }

    function coach(step) {
      if (!onScreen) { pointerWas = step; return; }
      coachStep = step;
      if (!host.coach) return;
      if (step === 1) {
        const i = findHint();
        if (i < 0 || !cells[i]) return;
        host.coach.tip({ at: cells[i], text: UI.coach1, hand: cells[i] });
        host.track('coach_step', { step: 1 });
      } else if (step === 2) {
        const i = board.num.findIndex((v, k) => v === 1 && open[k]);
        host.coach.clear();
        if (i >= 0) host.coach.tip({ at: cells[i], text: UI.coach2 });
        host.track('coach_step', { step: 2 });
        setTimeout(() => { if (coachStep === 2) { host.coach.clear(); coachStep = 0; host.setFlag('coached'); setTimeout(nudge, 600); } }, 4500);
      }
    }

    /** Open a cushion and spread through blanks. Knots and paw prints stop the spread. */
    function flood(start) {
      let count = 0;
      const stack = [start];
      while (stack.length) {
        const k = stack.pop();
        if (open[k] || board.wall[k] || board.cat[k] || flag[k]) continue;
        if (knot[k] && k !== start) continue;
        knot[k] = false;
        open[k] = true; count += 1;
        popping.add(k);
        if (board.num[k] === 0) for (const j of board.nb[k]) if (!open[j]) stack.push(j);
      }
      return count;
    }

    /** Uncover one cushion. Returns false when it cost the last heart. */
    function uncover(i) {
      if (open[i] || flag[i] || woke[i] || board.wall[i]) return true;
      if (i === hintCell) { hintCell = -1; proofCell = -1; }
      if (knot[i]) { knot[i] = false; host.sound('lift'); haptic(6); return true; }
      if (board.cat[i]) {
        // Guard (Soot's perk, or a friendship reward) catches a cat before it wakes, from level 7.
        const guards = level >= GUARD_FROM ? (boost().guards || (perk.guard ? 1 : 0)) : 0;
        if (guards > (guardUsed | 0)) {
          guardUsed = (guardUsed | 0) + 1; flag[i] = true;
          host.sound('error'); haptic(20);
          catPop($('[data-stage]'), cells[i], host.asset('img/board-cat-woken.png'));
          say(UI.guardSave.replace('{cat}', CAT_NAMES[wornId] || UI.yourCat), 4000);
          return true;
        }
        const safe = mode === 'level' && level <= PROTECTED();
        woke[i] = true; lost += 1;
        if (!safe) hearts -= 1;
        host.sound('mrrp'); haptic([0, 40, 30, 40]);
        host.track('heart_lost', { level, hearts });
        cells[i]?.classList.add('shake');
        catPop($('[data-stage]'), cells[i], host.asset('img/board-cat-woken.png'));
        combo = 0;
        say(safe ? UI.protect : t('woke'), safe ? 3500 : undefined);
        return hearts > 0;
      }
      const count = flood(i);
      host.stat('cushions', count);
      host.sound(`note${Math.min(7, combo)}`);
      combo += 1;
      if (count > 3) host.sound('purr');
      haptic(count > 3 ? 12 : 5);
      return true;
    }

    function toggleFlag(i) {
      if (open[i] || woke[i] || board.wall[i]) return;
      flag[i] = !flag[i];
      if (!flag[i]) sniffed.delete(i);
      if (flag[i]) host.stat('paws');
      host.sound(flag[i] ? 'drop' : 'undo');
      haptic(8);
    }

    async function after() {
      draw();
      if (hearts <= 0) { await outOfHearts(); return; }
      if (openCount() >= safeTotal()) { await win(); return; }
      host.save();
    }

    async function tap(i) {
      if (over || busy || board.wall[i]) return;
      if (mode === 'daily' && !dailyStart) dailyStart = Date.now();
      if (!open[i]) lastTap = i;
      if (coachStep === 1 && !pawMode && !flag[i] && !open[i]) setTimeout(() => coach(2), 450);
      if (langOpen) { langOpen = false; drawHud(); }
      if (target) { await useOn(target, i); return; }
      if (open[i]) {
        if (board.num[i] <= 0 || level < UNLOCK.chord) return;
        const marked = board.nb[i].reduce((s, j) => s + (flag[j] || woke[j] ? 1 : 0), 0);
        const rest = board.nb[i].filter((j) => !open[j] && !flag[j] && !woke[j] && !board.wall[j]);
        if (marked !== board.num[i] || !rest.length) return;
        host.stat('chords');
        for (const j of rest) if (!uncover(j)) break;
        await after();
        return;
      }
      if (woke[i]) return;
      if (pawMode) { toggleFlag(i); await after(); return; }
      if (flag[i]) return;
      uncover(i);
      await after();
    }

    /** The cushions still on the board fly off in a wave. */
    async function wave() {
      const c = board.cols;
      let any = false;
      cells.forEach((el, i) => {
        if (!el.classList.contains('cover')) return;
        any = true;
        el.style.setProperty('--d', `${(Math.floor(i / c) + (i % c)) * 18}ms`);
        el.classList.add('fly');
      });
      if (any) await wait(420);
    }

    /** Stars fly from the board into the counter beside the coins, ticking it up as they land. */
    async function flyStars(n) {
      if (n <= 0) { shownStars = manor.balance(); drawStarPill(); return; }
      flying = true;
      drawStarPill();
      const scr = root.closest('.screen') || root;
      await flyTo(scr, elBoard, starPill, host.asset('img/star-seal.png'), n, {
        size: 34, gap: 160, ms: 760,
        onLand: () => {
          shownStars = Math.min(manor.balance(), shownStars + 1);
          drawStarPill();
          host.sound('star');
          starPill?.classList.remove('bump'); void starPill?.offsetWidth; starPill?.classList.add('bump');
        },
      });
      flying = false;
      shownStars = manor.balance();
      drawStarPill();
    }

    /**
     * A keepsake rises from the last cushion opened, the cat reacts, its card
     * shows the handwritten line, then it flies into the album button.
     */
    async function revealKeepsake({ r, i }) {
      manor.collect(r, i);
      const stage = $('[data-stage]');
      const from = cells[lastTap] || cells[Math.floor(cells.length / 2)];
      const box = stage.getBoundingClientRect(), c = from.getBoundingClientRect();
      const el = document.createElement('div');
      el.className = 'ms-keeprise';
      el.style.left = `${c.left - box.left + c.width / 2}px`;
      el.style.top = `${c.top - box.top + c.height / 2}px`;
      el.innerHTML = `<span class="ms-keepring"></span><img src="${keepSrc(host, r, i)}" alt="">`;
      stage.appendChild(el);
      host.sound('keepsake'); haptic([0, 30, 40, 30]);
      const sc = $('[data-saycat]');
      sc?.classList.remove('react'); void sc?.offsetWidth; sc?.classList.add('react');
      await wait(1500);
      el.remove();
      await manor.showKeepsake(r, i, { fresh: true });
      const scr = root.closest('.screen') || root;
      const dBtn = $('[data-diary]');
      await flyTo(scr, stage, dBtn, keepSrc(host, r, i), 1, { size: 74, ms: 820 });
      dBtn.classList.remove('bump'); void dBtn.offsetWidth; dBtn.classList.add('bump');
      host.sound('drop');
      const un = manor.unread(), dn = $('[data-diaryn]');
      dn.hidden = !un; dn.textContent = un;
    }

    async function win() {
      over = true; busy = true; host.busy(true);
      draw();
      host.coach?.clear(); coachStep = 0;
      if (mode === 'daily') { await winDaily(); return; }
      if (mode === 'replay') { await winReplay(); return; }
      const won = level;
      if (!host.flag('coached')) host.setFlag('coached');   // level 1's pointers are done once it is won
      const got = lost === 0 ? 3 : lost === 1 ? 2 : 1;
      const before = stars[won] || 0;
      const couldBefore = manor.canRestore();
      shownStars = manor.balance();
      stars[won] = Math.max(before, got);
      const special = !!spec.special;
      const coins = Math.round(levelReward(won) * (1 + (boost().coinBonus || perk.coinBonus || 0)) * (special ? 1.5 : 1));
      const gains = [t('coins', { n: coins })];
      if (stars[won] > before) gains.push(UI.starsGain.replace('{n}', stars[won] - before));
      let total = coins, chest = 0;
      if (lost === 0 && PERFECT()) { total += PERFECT(); perfects += 1; host.stat('perfect'); gains.push(t('perfect', { n: PERFECT() })); }
      const finaleWon = isFin();
      if (finaleWon) { chest = 2 * baseReward(won); total += chest; }
      host.wallet.earn(total, 'level');
      host.stat('wins');
      if (spec.hard) host.stat('hardWins');
      const room = manor.room();
      gains.push(...manor.onLevelWon({ level: won, special }));
      const ks = manor.keepsakeFor(won);
      level = won + 1;
      host.levelWon({ level, kind: spec.hard ? 'hard' : 'normal', stars: got });
      host.save();
      const fly = flyStars(stars[won] - before);
      await wave();
      await fly;
      if (ks) await revealKeepsake(ks);
      host.busy(false);
      await host.celebrate({
        juicy: true, share: true,
        headline: lost === 0 ? t('winHead') : t('winHeadOk'),
        ribbon: '★'.repeat(got) + '☆'.repeat(3 - got),
        kicker: winLine(room), title: t('winTitle', { n: won }),
        reward: gains, go: t('next'),
      });
      await host.levelBreak();
      manor.sync();
      newBoard();
      host.save();
      manor.refreshLobby();
      if (finaleWon) await manor.finaleChest(chest);
      // The next room opens once this room has its 10 levels won and all six objects placed.
      if (manor.canAdvance()) { manor.advance(); manor.refreshLobby(); await manor.openNewRoom(); }
      else if (finaleWon) await manor.roomToFinish();
      // Offer to decorate only when this win made the next object affordable; the star counter's dot says the rest.
      else if (!couldBefore && manor.canRestore()) await manor.offerRestore();
      drawHud();
      nudge();
    }

    /* ---------------- replaying an old level for its stars ---------------- */

    function startReplay(n) {
      if (mode === 'level') { levelCur = over ? null : snapshot(); realLevel = level; }
      mode = 'replay';
      level = n;
      pawMode = false;
      host.track('replay_start', { level: n });
      newBoard();
      host.toScreen?.('game');
    }

    async function winReplay() {
      const won = level;
      const got = lost === 0 ? 3 : lost === 1 ? 2 : 1;
      const before = stars[won] || 0;
      stars[won] = Math.max(before, got);
      const coins = Math.round(levelReward(won) / 2);
      host.wallet.earn(coins, 'replay');
      host.track('replay_win', { level: won, stars: got, gained: stars[won] - before });
      shownStars = Math.max(0, manor.balance() - (stars[won] - before));
      const fly = flyStars(stars[won] - before);
      await wave();
      await fly;
      host.busy(false);
      const gains = [t('coins', { n: coins })];
      if (stars[won] > before) gains.push(UI.starsGain.replace('{n}', stars[won] - before));
      await host.celebrate({
        juicy: true, headline: lost === 0 ? t('winHead') : t('winHeadOk'),
        ribbon: '★'.repeat(got) + '☆'.repeat(3 - got),
        kicker: UI.replayOf.replace('{n}', won), title: t('winTitle', { n: won }),
        reward: gains, go: UI.replayDone.replace('{n}', realLevel),
      });
      backFromReplay();
      if (stars[won] > before && manor.canRestore()) await manor.offerRestore();
    }

    function backFromReplay() {
      mode = 'level';
      level = realLevel || level;
      newBoard(levelCur);
      levelCur = null;
      host.save();
      manor.refreshLobby();
    }

    function snapshot() {
      return { level, open: bits(open), flag: bits(flag), woke: bits(woke), knot: bits(knot), hearts, lost, extra, guardUsed };
    }

    function applySettings(st) {
      root.classList.toggle('cb', !!st.cb);
      root.classList.toggle('lefty', !!st.left);
    }

    /* Each room's ambience, a few seconds at a time, while the board is on screen. */
    function ambience(on) {
      clearInterval(ambTimer); ambTimer = null;
      if (!on) return;
      const play = () => { if (document.visibilityState === 'visible' && ambType && !manor.isOpen()) host.sound(`amb_${ambType}`); };
      play();
      ambTimer = setInterval(play, 4000);
    }

    /* ---------------- the daily puzzle ---------------- */

    function startDaily() {
      if (manor.dailySolved()) { manor.openDaily(); return; }
      if (mode === 'replay') backFromReplay();
      if (mode === 'level') levelCur = over ? null : snapshot();
      mode = 'daily';
      pawMode = false;
      host.track('daily_start', {});
      newBoard();
    }

    function backToLevels() {
      mode = 'level';
      newBoard(levelCur);
      levelCur = null;
      host.save();
    }

    async function winDaily() {
      const ms = Date.now() - (dailyStart || Date.now());
      await wave();
      host.busy(false);
      await manor.onDailyWon({ ms, hearts });
      backToLevels();
      manor.openDaily();
    }

    /**
     * Out of hearts: one card with the heart's coin price, Get coins (which
     * opens the coin packs right there), an ad for the first extra heart, and
     * Give up. The second heart costs more and has no ad.
     */
    function heartCard(k, price) {
      return new Promise((resolve) => {
        const have = host.wallet.coins, short = Math.max(0, price - have);
        const canAd = k === 1 && adHearts < (host.remote('ad_hearts_per_level') ?? 1) && !!host.rewarded?.available?.('extra_heart');
        const canBuy = host.coinsForSale();
        const el = document.createElement('div');
        el.className = 'ms-pagecard ms-heartcard';
        el.innerHTML = `
          <div class="ms-paper ms-heartbox">
            <span class="ms-bigheart"><img src="${host.asset('img/heart.png')}" alt=""><b>+1</b></span>
            <h3>${UI.heartTitle1}</h3>
            <p class="ms-heartline">${k === 1 ? UI.heartLine1 : UI.heartLine2}</p>
            <button class="ms-mbtn wide primary ms-paybtn" data-pay ${short ? 'disabled' : ''}>
              ${host.art.coin(22)}${UI.heartUse.replace('{n}', price)}</button>
            ${short ? `<p class="ms-heartneed">${UI.heartNeed.replace('{n}', short)} <span>(${have} / ${price})</span></p>` : ''}
            ${canBuy && short ? `<button class="ms-mbtn wide ms-buybtn" data-buy>${UI.heartBuy}</button>` : ''}
            ${canAd ? `<button class="ms-mbtn wide ms-adbtn" data-ad>▶ ${UI.heartAd}</button>` : ''}
            <button class="ms-mbtn wide ghost" data-give>${UI.heartGive}</button>
          </div>`;
        (root.closest('.screen') || root).appendChild(el);
        host.track('heart_offer', { level, k, price, coins: have, buy: canBuy ? 1 : 0, ad: canAd ? 1 : 0 });
        el.addEventListener('click', async (e) => {
          const b = e.target.closest('button');
          if (!b || b.disabled) return;
          if (b.matches('[data-pay]')) { el.remove(); resolve(host.wallet.spend(price, 'extra_heart') ? 'coins' : null); }
          else if (b.matches('[data-buy]')) {
            host.track('heart_buy_coins', { level, k, short });
            el.remove();
            await host.openCoins('heart');
            resolve(await heartCard(k, price));
          } else if (b.matches('[data-ad]')) {
            el.remove();
            resolve((await host.rewarded.show('extra_heart')) ? 'ad' : await heartCard(k, price));
          } else if (b.matches('[data-give]')) { el.remove(); resolve(null); }
        });
      });
    }

    async function outOfHearts() {
      busy = true;
      host.coach?.clear(); coachStep = 0;
      while (extra < MAX_EXTRA_HEARTS) {
        const k = extra + 1, price = heartPrice(level, k);
        const how = await heartCard(k, price);
        if (how) {
          extra += 1; hearts = 1; busy = false;
          if (how === 'ad') adHearts += 1;
          host.track('extra_heart', { level, n: extra, how, price });
          draw(); host.save();
          return;
        }
        break;
      }
      over = true;
      draw();
      if (mode === 'level') host.levelLost({ level, kind: spec.hard ? 'hard' : 'normal' });
      await host.setback({ kicker: t('lostKicker'), title: mode === 'daily' ? UI.daily : t('lostTitle', { n: level }), line: t('lostLine'), go: t('retry') });
      newBoard();
      host.save();
    }

    /* ---------------- boosters ---------------- */

    /** Pay for a booster: a free use first, then coins, then the short-of-coins card. */
    async function pay(b) {
      if (free[b] > 0) { free[b] -= 1; return true; }
      if (host.wallet.spend(price(b), `booster_${b}`)) return true;
      if (!host.shortHelps('booster')) { host.sound('error'); return false; }
      const how = await host.shortOf({ price: price(b), what: boosterName(b), ad: 'booster', adLabel: t('boosterAd') });
      return how === 'ad' || (how === 'coins' && host.wallet.spend(price(b), `booster_${b}`));
    }

    /**
     * Sniff finds one sleeping cat and paw-marks it, for sure. It goes for a
     * cat the player hasn't marked, next to the open floor if it can. Only
     * when every cat is marked does it look at the player's paws, and take
     * one off a cushion with no cat under it. Nothing to find costs nothing.
     */
    async function sniff() {
      const live = (i) => board.cat[i] && !woke[i] && !open[i];
      const near = (i) => board.nb[i].some((j) => open[j]);
      let pool = board.cat.map((_, i) => i).filter((i) => live(i) && !flag[i] && near(i));
      if (!pool.length) pool = board.cat.map((_, i) => i).filter((i) => live(i) && !flag[i]);
      const wrong = board.cat.map((_, i) => i).filter((i) => flag[i] && !board.cat[i] && !open[i]);
      if (!pool.length && !wrong.length) { say(UI.sniffNone, 3000); host.sound('tap'); return; }
      if (!(await pay('sniff'))) { drawHud(); return; }
      host.track('booster_used', { level, booster: 'sniff' });
      const fix = !pool.length;
      const i = fix ? wrong[0] : pool[Math.floor(Math.random() * pool.length)];
      busy = true;
      centerOn(i);
      const scr = root.closest('.screen') || root;
      const btn = $('.ms-tool[data-tool="sniff"]');
      await flyTo(scr, btn, cells[i], host.asset('img/icon-sniff.png'), 1, { size: 46, ms: 700 });
      busy = false;
      if (fix) { flag[i] = false; sniffed.delete(i); host.sound('undo'); say(UI.sniffWrong, 3000); }
      else { flag[i] = true; knot[i] = false; sniffed.add(i); host.stat('paws'); host.sound('drop'); haptic([0, 12, 30, 12]); say(UI.sniffFound, 2600); }
      cells[i].classList.remove('sniffpop'); void cells[i].offsetWidth;
      await after();
      cells[i]?.classList.add('sniffpop');
    }

    function area(i, lo, hi) {
      const c = i % board.cols, r = Math.floor(i / board.cols), out = [];
      for (let dr = lo; dr <= hi; dr += 1) for (let dc = lo; dc <= hi; dc += 1) {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < board.rows && cc >= 0 && cc < board.cols) out.push(rr * board.cols + cc);
      }
      return out;
    }

    async function useOn(b, i) {
      target = null;
      if (!(await pay(b))) { drawHud(); return; }
      host.track('booster_used', { level, booster: b });
      if (b === 'scan') {
        const list = area(i, -1, perk.scanWide ? 2 : 1).filter((k) => !board.wall[k]);
        const hit = list.some((k) => board.cat[k] && !woke[k]);
        scanMarks = { cells: list, hit };
        host.sound(hit ? 'error' : 'unlock');
        say(hit ? t('scanYes') : t('scanNo'), 3000);
        setTimeout(() => { scanMarks = null; draw(); }, 3000);
      } else {
        for (const k of area(i, -2, 2)) {
          if (open[k] || woke[k] || board.wall[k]) continue;
          flag[k] = !!board.cat[k];
        }
        host.sound('sort');
      }
      await after();
    }

    /**
     * A cushion the numbers on screen prove is safe, worked out with the same
     * kinds of logic the board was built for (one number, a pair of numbers).
     * Falls back to any safe cushion next to the open floor.
     */
    function findHint(any = false) {
      const n = board.cat.length, nb = board.nb;
      const isCat = new Uint8Array(n), safe = new Uint8Array(n), proof = new Int32Array(n).fill(-1);
      for (let i = 0; i < n; i += 1) if (woke[i]) isCat[i] = 1;
      for (let round = 0; round < 60; round += 1) {
        let moved = false;
        const cons = [];
        for (let i = 0; i < n; i += 1) {
          if (!open[i] || board.num[i] <= 0) continue;
          let m = board.num[i];
          const u = [];
          for (const j of nb[i]) {
            if (board.wall[j] || open[j] || safe[j]) continue;
            if (isCat[j]) m -= 1; else u.push(j);
          }
          if (!u.length) continue;
          if (m === 0) { u.forEach((j) => { safe[j] = 1; if (proof[j] < 0) proof[j] = i; }); moved = true; }
          else if (m === u.length) { u.forEach((j) => { isCat[j] = 1; }); moved = true; }
          else cons.push({ u, m, i });
        }
        if (!moved) {
          for (let a = 0; a < cons.length && !moved; a += 1) for (let b = 0; b < cons.length && !moved; b += 1) {
            const A = cons[a], B = cons[b];
            if (a === b || A.u.length >= B.u.length || !A.u.every((x) => B.u.includes(x))) continue;
            const rest = B.u.filter((x) => !A.u.includes(x)), m = B.m - A.m;
            if (m === 0) { rest.forEach((j) => { safe[j] = 1; if (proof[j] < 0) proof[j] = B.i; }); moved = true; }
            else if (m === rest.length) { rest.forEach((j) => { isCat[j] = 1; }); moved = true; }
          }
        }
        if (!moved) break;
      }
      const covered = (i) => !open[i] && !woke[i] && !board.wall[i] && !board.cat[i];
      // Prefer a proven cushion the player hasn't marked; the numbers say why.
      for (const skipFlags of [true, false]) {
        for (let i = 0; i < n; i += 1) if (safe[i] && covered(i) && !(skipFlags && flag[i])) { lastProof = proof[i]; return i; }
      }
      lastProof = -1;
      if (!any) return -1;
      for (let i = 0; i < n; i += 1) if (covered(i) && nb[i].some((j) => open[j])) return i;
      for (let i = 0; i < n; i += 1) if (covered(i)) return i;
      return -1;
    }
    let lastProof = -1;
    const niceDate = () => {
      try { return new Date().toLocaleDateString(document.documentElement.lang || 'en', { weekday: 'short', day: 'numeric', month: 'short' }); } catch { return today(); }
    };

    async function hint() {
      const i = findHint();
      if (i < 0) { say(level >= UNLOCK.sniff ? UI.hintNoneSniff : UI.hintNone, 3200); host.sound('error'); return; }
      const proof = lastProof;
      if (!(await pay('hint'))) { drawHud(); return; }
      host.track('booster_used', { level, booster: 'hint' });
      flag[i] = false; sniffed.delete(i);
      hintCell = i; proofCell = proof;
      host.sound('unlock');
      draw();
      say(proof >= 0 ? UI.hintTip : UI.hintTipAny, 3800);
      centerOn(i);
      host.save();
    }

    async function tool(id) {
      if (over || busy) return;
      if (id === 'paw') { pawMode = !pawMode; target = null; host.sound('tap'); drawHud(); return; }
      if (id === 'hint') { target = null; await hint(); return; }
      if (id === 'sniff') { target = null; await sniff(); return; }
      target = target === id ? null : id;
      pawMode = false;
      host.sound('tap');
      drawHud();
    }

    /* ---------------- input ---------------- */

    let pressTimer = null;
    let pressed = -1;                   // a long press already acted on this cushion
    elBoard.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.ms-cell');
      if (!el || e.button === 2) return;
      const i = Number(el.dataset.i);
      pressed = -1;
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        if (over || busy || target || level < UNLOCK.paw || open[i]) return;
        pressed = i;
        toggleFlag(i);
        after();
      }, 380);
    });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) elBoard.addEventListener(ev, () => clearTimeout(pressTimer));
    elWrap.addEventListener('scroll', () => clearTimeout(pressTimer), { passive: true });
    zoomBtn.addEventListener('click', () => {
      zoom = !zoomed;
      host.sound('tap');
      fit();
      if (zoomed) requestAnimationFrame(() => centerOn(hintCell >= 0 ? hintCell : board.start));
    });
    elBoard.addEventListener('click', (e) => {
      const el = e.target.closest('.ms-cell');
      if (!el) return;
      const i = Number(el.dataset.i);
      if (pressed === i) { pressed = -1; return; }
      tap(i);
    });
    elBoard.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const el = e.target.closest('.ms-cell');
      if (!el || over || busy || level < UNLOCK.paw) return;
      const i = Number(el.dataset.i);
      clearTimeout(pressTimer);
      // On a phone a long press also fires this event: the timer already marked it.
      if (pressed === i) return;
      pressed = e.pointerType === 'mouse' || !e.pointerType ? -1 : i;
      toggleFlag(i);
      after();
    });
    $('[data-diary]').addEventListener('click', () => {
      if (busy) return;
      host.sound('tap');
      host.coach?.clear(); if (coachStep === 3) coachStep = 0;
      ambience(false);
      manor.openAlbum(() => { ambience(true); drawHud(); nudge(); });
    });
    $('[data-modes]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-mode]');
      if (!b || over || busy) return;
      pawMode = b.dataset.mode === 'mark'; target = null;
      host.sound('tap'); drawHud();
    });
    $('[data-tools]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tool]');
      if (!b) return;
      if (b.dataset.lock) { host.sound('tap'); say(`${boosterName(b.dataset.tool)}: ${UI.opensAt.replace('{n}', b.dataset.lock)}`); return; }
      tool(b.dataset.tool);
    });
    $('[data-lang]').addEventListener('click', () => { langOpen = !langOpen; drawHud(); });
    $('[data-langs]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-set]');
      if (!b) return;
      setLang(b.dataset.set);
      langOpen = false;
      root.lang = getLang();
      draw();
      host.save();
    });
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(elWrap);

    /* ---------------- the contract ---------------- */

    return {
      start(saved) {
        if (saved) {
          level = saved.level || 1;
          stars = saved.stars || {};
          perfects = saved.perfects || 0;
          free = { ...free, ...(saved.free || {}) };
          if (free.hint === undefined) free.hint = 3;
        }
        manor.load(saved?.manor);
        applySettings(manor.settings());
        root.lang = getLang();
        newBoard(saved?.cur);
        manor.refreshLobby();
        if (!saved && !host.flag('intro')) {
          manor.intro().then(() => { host.setFlag('intro'); if (level === 1 && !host.flag('coached')) setTimeout(() => { if (root.offsetParent) coach(1); }, 300); });
        }
      },
      serialize: () => ({
        level: mode === 'replay' ? realLevel : level, stars, perfects, free, manor: manor.serialize(),
        cur: mode !== 'level' ? levelCur : over ? null : snapshot(),
      }),
      show() {
        onScreen = true;
        fit();
        watchCovers();
        restorePointers();
        roomShown = '';
        if (board) { setRoom(); drawStarPill(); }
        const scr = root.closest('.screen');
        scr?.classList.remove('ms-enter'); void scr?.offsetWidth; scr?.classList.add('ms-enter');
        ambience(true);
      },
      hide() { onScreen = false; ambience(false); clearPointers(); if (coachStep) coachStep = 0; if (mode === 'daily' && !over) backToLevels(); if (mode === 'replay') backFromReplay(); },
      pause() { ambience(false); clearPointers(); },
      resume() { ambience(true); restorePointers(); },
      relayout() { fit(); },
      setPerk(config) {
        const before = maxHearts();
        perk = config || {};
        const key = JSON.stringify(perk);
        wornId = ['patch', ...Object.keys(PERKS)].find((id) => PERKS[id] && JSON.stringify(PERKS[id].config) === key) || 'patch';
        if (board && !over && maxHearts() > before && lost === 0) hearts = maxHearts();
        if (board) draw();
        const sc = root.querySelector('[data-saycat]');
        if (sc) sc.innerHTML = '';
        if (board) { drawHud(); manor.refreshLobby(); }
      },
      setCosmetic(id) { root.dataset.fabric = id || 'gingham'; manor.refreshLobby(); },
      openFromLobby(id) {
        if (id === 'manor') manor.openManor();
        else if (id === 'diary') manor.openAlbum();
        else if (id === 'daily') manor.openDaily();
      },
      onBack() {
        if (manor.skipIntro()) return false;     // the intro counts as seen; back still leaves the game
        if (manor.isOpen()) { manor.close(); return true; }
        return false;
      },
      onLobbyBack: () => manor.lobbyBack(),
      canOffer: (task) => !task.from || level >= task.from,
      rewardValue: () => heartPrice(level),
      dailyCard: () => manor.dailyCard(),
      progressRows: () => {
        const st = manor.stats();
        const r = st.room;
        const pct = Math.round((st.objects / 120) * 100);
        const ic = (src) => `<img class="ms-tic" src="${src}" alt="">`;
        const img = (p) => host.asset(p);
        const banner = `<span class="ms-pbanner">
            <img class="ms-pb-room" src="${lastRoomUrl || img(`img/room-${r}.jpg`)}" alt="">
            <span class="ms-pb-shade"></span>
            <span class="ms-pb-cat">${host.art.cat('cheer', 92, 'ms-pb-catimg', hostOf(r))}</span>
            <span class="ms-pb-text"><small>${UI.pRoom.replace('{n}', r)}</small><b>${roomName(r)}</b></span>
          </span>
          <span class="ms-pmanor"><span class="ms-pm-l">${UI.pManor}</span><span class="ms-pm-bar"><i style="width:${Math.max(2, pct)}%"></i></span><b>${pct}%</b></span>`;
        return {
          blurb: banner,
          tiles: [
            { value: `${ic(img('img/cushion-gingham.png'))}${level}`, label: UI.pLevel },
            { value: `${ic(img('img/star-seal.png'))}${st.earned}`, label: UI.pStars },
            { value: `${ic(symSrc(host, 'trophy'))}${st.rooms}<small>/20</small>`, label: UI.pRooms },
            { value: `${ic(img('img/deco/r1-0-0.webp'))}${st.objects}<small>/120</small>`, label: UI.pObjects },
            { value: `${ic(img('img/icon-diary.png'))}${st.keepsakes}<small>/40</small>`, label: UI.pKeeps },
            { value: `${ic(img('img/icon-daily.png'))}${st.streak}`, label: UI.pStreak },
            { value: `${ic(img('img/friendship-heart.png'))}${st.friends}<small>/5</small>`, label: UI.pFriends },
            { value: `${ic(symSrc(host, 'heart'))}${perfects}`, label: UI.pPerfect },
            { value: `${ic(img('img/star-seal.png'))}${manor.balance()}`, label: UI.pSpend },
          ],
        };
      },
      dev: {
        buttons: [
          { id: 'win', label: 'Win level', run: () => { board.cat.forEach((c, i) => { if (!c && !board.wall[i]) open[i] = true; }); after(); } },
          { id: 'skip10', label: '+10 levels', run: () => { level += 10; newBoard(); host.save(); } },
          { id: 'skip100', label: '+100 levels', run: () => { level += 100; newBoard(); host.save(); } },
          { id: 'stars', label: '+30 stars', run: () => { manor.devStars(30); drawHud(); manor.refreshLobby(); } },
          { id: 'peek', label: 'Mark all cats', run: () => { board.cat.forEach((c, i) => { if (c && !woke[i]) flag[i] = true; }); draw(); } },
        ],
        readout: () => `<dl><dt>level</dt><dd>${level}</dd><dt>board</dt><dd>${spec.cols}×${spec.rows}</dd><dt>cats</dt><dd>${board.cats}</dd><dt>walls</dt><dd>${spec.walls}</dd><dt>knots</dt><dd>${spec.knots}</dd></dl>`,
      },
    };
  },
};
