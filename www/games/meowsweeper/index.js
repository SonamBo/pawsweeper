/**
 * Meowsweeper: Minesweeper with sleeping cats under cushions.
 *
 * Uncover every cushion that hides no cat. A number counts the sleeping cats
 * touching it. Waking a cat costs a heart, not the level. Boards come from
 * generator.js (always solvable without a guess) and levels.js (500 levels).
 */

import { levelSpec, levelReward, baseReward, heartPrice, UNLOCK, CHAPTER_SIZE } from './levels.js';
import { generate } from './generator.js';
import { t, chapterName, LANGS, getLang, setLang } from './strings.js';

const PRICE = { sniff: 60, scan: 90, catnip: 150 };
const MAX_EXTRA_HEARTS = 2;

const PAW = '<svg viewBox="0 0 24 24" class="ms-ico" aria-hidden="true"><ellipse cx="12" cy="16" rx="5.2" ry="4.3"/><ellipse cx="5.4" cy="10.4" rx="2.1" ry="2.7"/><ellipse cx="9.6" cy="6.4" rx="2.1" ry="2.8"/><ellipse cx="14.4" cy="6.4" rx="2.1" ry="2.8"/><ellipse cx="18.6" cy="10.4" rx="2.1" ry="2.7"/></svg>';
const CAT = '<svg viewBox="0 0 24 24" class="ms-cat" aria-hidden="true"><path class="f" d="M4 5l4 3.4a8 8 0 0 1 8 0L20 5v8.5a8 8 0 0 1-16 0z"/><path class="e" d="M7.6 13.2q1.5 1.4 3 0M13.4 13.2q1.5 1.4 3 0" fill="none" stroke-width="1.3" stroke-linecap="round"/><path class="n" d="M11 15.6h2l-1 1.2z"/></svg>';
const CAT_AWAKE = '<svg viewBox="0 0 24 24" class="ms-cat awake" aria-hidden="true"><path class="f" d="M4 5l4 3.4a8 8 0 0 1 8 0L20 5v8.5a8 8 0 0 1-16 0z"/><circle class="p" cx="9" cy="13" r="1.5"/><circle class="p" cx="15" cy="13" r="1.5"/><path class="n" d="M11 15.8h2l-1 1.2z"/></svg>';
const YARN = '<svg viewBox="0 0 24 24" class="ms-yarn" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M5.5 9.5q6.5 1 12 6M7 16.5q4-6 10-9.5M12 4q3 8-1 16" fill="none" stroke-width="1.3" stroke-linecap="round"/></svg>';
const HEART = '<svg viewBox="0 0 24 24" class="ms-heart" aria-hidden="true"><path d="M12 20.5S3.5 15 3.5 9.2A4.6 4.6 0 0 1 12 6.8a4.6 4.6 0 0 1 8.5 2.4C20.500 15 12 20.500 12 20.500z"/></svg>';

const bits = (arr) => arr.map((v) => (v ? '1' : '0')).join('');
const unbits = (s, n) => Array.from({ length: n }, (_, i) => s?.[i] === '1');

// Task wording, worked out here so the manifest below stays plain (the pre-flight reads it as text).
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

  perks: {
    mittens: { text: t('perkMittens'), config: { sniffPrice: 40 } },
    soot: { text: t('perkSoot'), config: { guard: true } },
    marmalade: { text: t('perkMarmalade'), config: { hearts: 4 } },
    pepper: { text: t('perkPepper'), config: { coinBonus: 0.25 } },
    biscuit: { text: t('perkBiscuit'), config: { scanWide: true } },
  },

  cosmetics: [
    { id: 'gingham', name: t('fabGingham'), price: 0, note: t('fabNote') },
    { id: 'knit', name: t('fabKnit'), price: 800, note: t('fabNote') },
    { id: 'velvet', name: t('fabVelvet'), price: 1500, note: t('fabNote') },
    { id: 'patchwork', name: t('fabPatchwork'), price: 2500, note: t('fabNote') },
    { id: 'starry', name: t('fabStarry'), price: 4000, note: t('fabNote') },
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

  sounds: {
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
    root.classList.add('ms-root');
    root.dataset.fabric = 'gingham';

    // What lasts between levels.
    let level = 1;
    let stars = {};                     // level -> best stars
    let perfects = 0;
    let free = { sniff: 2, scan: 1, catnip: 1 };
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

    root.innerHTML = `
      <div class="ms-hud">
        <div class="ms-hearts" data-hearts></div>
        <div class="ms-mid"><b class="ms-badge" data-badge hidden></b></div>
        <div class="ms-left" data-left></div>
        <button class="ms-lang" data-lang aria-label="Language"></button>
      </div>
      <div class="ms-langs" data-langs hidden></div>
      <p class="ms-tip" data-tip></p>
      <div class="ms-wrap" data-wrap><div class="ms-board" data-board></div></div>
      <div class="ms-tools" data-tools></div>`;
    const $ = (s) => root.querySelector(s);
    const elBoard = $('[data-board]');
    const elWrap = $('[data-wrap]');
    let cells = [];

    /* ---------------- drawing ---------------- */

    const safeTotal = () => board.cat.reduce((s, c, i) => s + (!c && !board.wall[i] ? 1 : 0), 0);
    const openCount = () => open.reduce((s, v) => s + (v ? 1 : 0), 0);
    const catsLeft = () => board.cats - flag.reduce((s, v) => s + (v ? 1 : 0), 0) - woke.reduce((s, v) => s + (v ? 1 : 0), 0);
    const maxHearts = () => perk.hearts || 3;
    const sniffPrice = () => perk.sniffPrice || PRICE.sniff;
    const price = (b) => (b === 'sniff' ? sniffPrice() : PRICE[b]);
    const boosterName = (b) => t(b);

    function fit() {
      if (!board) return;
      const w = elWrap.clientWidth - 8, h = elWrap.clientHeight - 8;
      if (w <= 0 || h <= 0) return;
      const size = Math.max(18, Math.min(52, Math.floor(Math.min(w / board.cols, h / board.rows))));
      elBoard.style.setProperty('--cell', `${size}px`);
      elBoard.style.gridTemplateColumns = `repeat(${board.cols}, ${size}px)`;
    }

    function build() {
      elBoard.innerHTML = board.cat.map((_, i) => `<button class="ms-cell" data-i="${i}"></button>`).join('');
      cells = [...elBoard.children];
      fit();
    }

    function drawCell(i) {
      const el = cells[i];
      let cls = 'ms-cell', html = '';
      if (board.wall[i]) cls += ' wall';
      else if (woke[i]) { cls += ' woke'; html = CAT_AWAKE; }
      else if (open[i]) { cls += ' open'; if (board.num[i] > 0) { cls += ` n${board.num[i]}`; html = String(board.num[i]); } }
      else {
        cls += ' cover';
        if (flag[i]) { cls += ' flag'; html = PAW; }
        else if (knot[i]) { cls += ' knot'; html = YARN; }
        else if (over && board.cat[i]) { cls += ' reveal'; html = CAT; }
      }
      if (scanMarks?.cells.includes(i)) cls += scanMarks.hit ? ' scan-yes' : ' scan-no';
      if (el.className !== cls) el.className = cls;
      if (el.innerHTML !== html) el.innerHTML = html;
    }

    function tipText() {
      if (note) return note;
      if (target) return t('target', { what: boosterName(target) });
      const key = { 1: 'tip1', 2: 'tip1', 3: 'tip3', 4: 'tip3', 5: 'tip5', 6: 'tip6', 12: 'tip12', 15: 'tip15', 20: 'tip20', 40: 'tip40', 45: 'tip45' }[level];
      return key ? t(key) : '';
    }

    function drawHud() {
      $('[data-hearts]').innerHTML = Array.from({ length: Math.max(maxHearts(), hearts) }, (_, i) =>
        `<i class="${i < hearts ? 'on' : 'off'}">${HEART}</i>`).join('');
      const badge = $('[data-badge]');
      badge.hidden = !spec.hard;
      badge.textContent = spec.boss ? t('boss') : t('hard');
      $('[data-left]').innerHTML = `${CAT}<b>${Math.max(0, catsLeft())}</b>`;
      $('[data-left]').setAttribute('aria-label', t('catsLeft'));
      $('[data-lang]').textContent = getLang().toUpperCase();
      const langs = $('[data-langs]');
      langs.hidden = !langOpen;
      langs.innerHTML = LANGS.map((l) => `<button data-set="${l.id}" class="${l.id === getLang() ? 'on' : ''}">${l.name}</button>`).join('');
      const tip = $('[data-tip]');
      tip.textContent = tipText();
      tip.classList.toggle('alert', !!note);

      const tool = (id, label, body, on, extraCls = '') =>
        `<button class="ms-tool ${extraCls} ${on ? 'on' : ''}" data-tool="${id}"><span class="ms-tool-name">${label}</span>${body}</button>`;
      const cost = (b) => (free[b] > 0
        ? `<span class="ms-cost free">${t('free')} ×${free[b]}</span>`
        : `<span class="ms-cost">${host.art.coin(13)}${price(b)}</span>`);
      let html = '';
      if (level >= UNLOCK.paw) html += tool('paw', t('paw'), PAW, pawMode, 'paw');
      if (level >= UNLOCK.sniff) html += tool('sniff', t('sniff'), cost('sniff'), false);
      if (level >= UNLOCK.scan) html += tool('scan', t('scan'), cost('scan'), target === 'scan');
      if (level >= UNLOCK.catnip) html += tool('catnip', t('catnip'), cost('catnip'), target === 'catnip');
      $('[data-tools]').innerHTML = html;
      root.classList.toggle('hard', !!spec.hard);
    }

    function report() {
      host.progress({
        title: t('level', { n: level }),
        fraction: board ? openCount() / Math.max(1, safeTotal()) : 0,
        figure: board ? `${openCount()} / ${safeTotal()}` : '',
        sub: `${chapterName(spec.chapter)}${spec.hard ? ` · ${t('hard')}` : ''}`,
        level,
        summary: t('summary', { n: level, ch: chapterName(spec.chapter) }),
      });
    }

    function draw() {
      for (let i = 0; i < cells.length; i += 1) drawCell(i);
      drawHud();
      report();
    }

    function say(text, ms = 2200) {
      note = text;
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => { note = ''; drawHud(); }, ms);
      drawHud();
    }

    /* ---------------- a level ---------------- */

    function newBoard(saved) {
      spec = levelSpec(level);
      board = generate(spec);
      const n = board.cat.length;
      over = false; busy = false; target = null; scanMarks = null; note = '';
      if (saved && saved.level === level && saved.open?.length === n) {
        open = unbits(saved.open, n); flag = unbits(saved.flag, n); woke = unbits(saved.woke, n); knot = unbits(saved.knot, n);
        hearts = saved.hearts ?? maxHearts(); lost = saved.lost || 0; extra = saved.extra || 0; guardUsed = !!saved.guardUsed;
      } else {
        open = new Array(n).fill(false); flag = new Array(n).fill(false); woke = new Array(n).fill(false);
        knot = board.knot.slice();
        hearts = maxHearts(); lost = 0; extra = 0; guardUsed = false;
        flood(board.start);                       // the opened patch every level starts from
        host.track('board_start', { level, cols: spec.cols, rows: spec.rows, cats: board.cats, hard: spec.hard ? 1 : 0 });
      }
      build();
      draw();
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
        if (board.num[k] === 0) for (const j of board.nb[k]) if (!open[j]) stack.push(j);
      }
      return count;
    }

    /** Uncover one cushion. Returns false when it cost the last heart. */
    function uncover(i) {
      if (open[i] || flag[i] || woke[i] || board.wall[i]) return true;
      if (knot[i]) { knot[i] = false; host.sound('lift'); host.haptic(6); return true; }
      if (board.cat[i]) {
        if (perk.guard && !guardUsed) {
          guardUsed = true; flag[i] = true;
          host.sound('error'); host.haptic(20);
          say(t('guard'));
          return true;
        }
        woke[i] = true; hearts -= 1; lost += 1;
        host.sound('mrrp'); host.haptic([0, 40, 30, 40]);
        host.track('heart_lost', { level, hearts });
        cells[i]?.classList.add('shake');
        say(t('woke'));
        return hearts > 0;
      }
      const count = flood(i);
      host.stat('cushions', count);
      host.sound(count > 3 ? 'purr' : 'tap');
      host.haptic(count > 3 ? 12 : 5);
      return true;
    }

    function toggleFlag(i) {
      if (open[i] || woke[i] || board.wall[i]) return;
      flag[i] = !flag[i];
      if (flag[i]) host.stat('paws');
      host.sound(flag[i] ? 'drop' : 'undo');
      host.haptic(8);
    }

    async function after() {
      draw();
      if (hearts <= 0) { await outOfHearts(); return; }
      if (openCount() >= safeTotal()) { await win(); return; }
      host.save();
    }

    async function tap(i) {
      if (over || busy || board.wall[i]) return;
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

    async function win() {
      over = true; busy = true; host.busy(true);
      draw();
      const won = level;
      const got = lost === 0 ? 3 : lost === 1 ? 2 : 1;
      stars[won] = Math.max(stars[won] || 0, got);
      const coins = Math.round(levelReward(won) * (1 + (perk.coinBonus || 0)));
      const gains = [t('coins', { n: coins })];
      let total = coins;
      if (lost === 0) { total += 10; perfects += 1; host.stat('perfect'); gains.push(t('perfect', { n: 10 })); }
      if (won % CHAPTER_SIZE === 0) { const chest = 5 * baseReward(won); total += chest; gains.push(t('chest', { n: chest })); }
      host.wallet.earn(total, 'level');
      host.stat('wins');
      if (spec.hard) host.stat('hardWins');
      level = won + 1;
      host.levelWon({ level, kind: spec.hard ? 'hard' : 'normal', stars: got });
      host.save();
      await new Promise((r) => setTimeout(r, 450));
      host.busy(false);
      await host.celebrate({
        juicy: true, share: true,
        headline: lost === 0 ? t('winHead') : t('winHeadOk'),
        ribbon: '★'.repeat(got) + '☆'.repeat(3 - got),
        kicker: t('winKicker'), title: t('winTitle', { n: won }),
        reward: gains, go: t('next'),
      });
      await host.levelBreak();
      newBoard();
      host.save();
    }

    async function outOfHearts() {
      busy = true;
      const cost = heartPrice(level);
      while (extra < MAX_EXTRA_HEARTS) {
        let granted = false;
        if (host.wallet.canAfford(cost)) {
          granted = await host.confirm({ kicker: t('heartKicker'), title: t('heartTitle'), line: t('heartLine', { n: cost }), ok: t('heartOk'), cancel: t('retry') })
            && host.wallet.spend(cost, 'extra_heart');
        } else if (host.shortHelps('extra_heart')) {
          const how = await host.shortOf({ price: cost, what: t('heartWhat'), ad: 'extra_heart', adLabel: t('heartAd') });
          granted = how === 'ad' || (how === 'coins' && host.wallet.spend(cost, 'extra_heart'));
        }
        if (granted) {
          extra += 1; hearts = 1; busy = false;
          host.track('extra_heart', { level, n: extra });
          draw(); host.save();
          return;
        }
        if (await host.confirmLevelLoss()) break;
      }
      over = true;
      draw();
      host.levelLost({ level, kind: spec.hard ? 'hard' : 'normal' });
      await host.setback({ kicker: t('lostKicker'), title: t('lostTitle', { n: level }), line: t('lostLine'), go: t('retry') });
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

    async function sniff() {
      const safe = (i) => !open[i] && !board.cat[i] && !board.wall[i];
      let pool = board.cat.map((_, i) => i).filter((i) => safe(i) && board.nb[i].some((j) => open[j]));
      if (!pool.length) pool = board.cat.map((_, i) => i).filter(safe);
      if (!pool.length || !(await pay('sniff'))) return;
      const i = pool[Math.floor(Math.random() * pool.length)];
      flag[i] = false; knot[i] = false;
      host.track('booster_used', { level, booster: 'sniff' });
      uncover(i);
      await after();
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

    async function tool(id) {
      if (over || busy) return;
      if (id === 'paw') { pawMode = !pawMode; target = null; host.sound('tap'); drawHud(); return; }
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
      clearTimeout(pressTimer);
      toggleFlag(Number(el.dataset.i));
      after();
    });
    $('[data-tools]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tool]');
      if (b) tool(b.dataset.tool);
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

    const totalStars = () => Object.values(stars).reduce((s, v) => s + v, 0);

    return {
      start(saved) {
        if (saved) {
          level = saved.level || 1;
          stars = saved.stars || {};
          perfects = saved.perfects || 0;
          free = { ...free, ...(saved.free || {}) };
        }
        root.lang = getLang();
        newBoard(saved?.cur);
      },
      serialize: () => ({
        level, stars, perfects, free,
        cur: over ? null : {
          level, open: bits(open), flag: bits(flag), woke: bits(woke), knot: bits(knot),
          hearts, lost, extra, guardUsed,
        },
      }),
      show() { fit(); },
      relayout() { fit(); },
      setPerk(config) {
        const before = maxHearts();
        perk = config || {};
        if (board && !over && maxHearts() > before && lost === 0) hearts = maxHearts();
        if (board) draw();
      },
      setCosmetic(id) { root.dataset.fabric = id || 'gingham'; },
      canOffer: (task) => !task.from || level >= task.from,
      rewardValue: () => heartPrice(level),
      progressRows: () => ({
        blurb: t('blurb'),
        tiles: [
          { value: level, label: t('tileLevel') },
          { value: totalStars(), label: t('tileStars') },
          { value: perfects, label: t('tilePerfect') },
        ],
      }),
      dev: {
        buttons: [
          { id: 'win', label: 'Win level', run: () => { board.cat.forEach((c, i) => { if (!c && !board.wall[i]) open[i] = true; }); after(); } },
          { id: 'skip10', label: '+10 levels', run: () => { level += 10; newBoard(); host.save(); } },
          { id: 'skip100', label: '+100 levels', run: () => { level += 100; newBoard(); host.save(); } },
          { id: 'peek', label: 'Mark all cats', run: () => { board.cat.forEach((c, i) => { if (c && !woke[i]) flag[i] = true; }); draw(); } },
        ],
        readout: () => `<dl><dt>level</dt><dd>${level}</dd><dt>board</dt><dd>${spec.cols}×${spec.rows}</dd><dt>cats</dt><dd>${board.cats}</dd><dt>walls</dt><dd>${spec.walls}</dd><dt>knots</dt><dd>${spec.knots}</dd></dl>`,
      },
    };
  },
};
