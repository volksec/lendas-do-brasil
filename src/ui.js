/* =============================================================
 * ui.js — todas as telas em DOM. Nenhum cálculo de combate aqui.
 * O HUD de batalha é atualizado por referência a cada quadro para
 * evitar recriar elementos durante o combate.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const U = G.util;
  const UI = (G.ui = {});
  const t = (k, v) => G.t(k, v);
  const el = U.el;
  const fmt = U.fmt;

  let root, topbar, screenEl, navEl, hud = {}, canvas;
  UI.current = 'battle';
  let itemFilter = { rarity: 'all', slot: 'all', sort: 'power' };
  let selectedHero = null;
  let craftSelection = { item: null, hero: null };

  /* ==========================================================
   * utilidades visuais
   * ======================================================== */
  function iconEl(kind, color, size) {
    const c = G.art.icon(kind, color);
    const wrap = el('span', { class: 'ico' });
    const cv = c.cloneNode(true);
    cv.getContext('2d').drawImage(c, 0, 0);
    cv.style.width = (size || 16) + 'px'; cv.style.height = (size || 16) + 'px';
    wrap.appendChild(cv);
    return wrap;
  }
  function canvasEl(cnv, size, cls) {
    const c = cnv.cloneNode(true);
    c.getContext('2d').drawImage(cnv, 0, 0);
    c.style.width = size + 'px'; c.style.height = size + 'px';
    c.className = 'pix ' + (cls || '');
    return c;
  }
  function rarityColor(r) { return (G.balance.rarityById[r] || { color: '#fff' }).color; }
  function rarityName(r) { const x = G.balance.rarityById[r]; return x ? G.tn(x) : r; }

  UI.toast = function (text, kind) {
    const box = U.qs('#toasts');
    if (!box) return;
    const n = el('div', { class: 'toast ' + (kind || ''), text: text });
    box.appendChild(n);
    setTimeout(() => { n.classList.add('out'); setTimeout(() => n.remove(), 400); }, 2600);
  };

  UI.modal = function (title, content, actions, opts) {
    const overlay = el('div', { class: 'modal-overlay' });
    const box = el('div', { class: 'modal' + (opts && opts.wide ? ' wide' : '') });
    box.appendChild(el('div', { class: 'modal-title' }, [
      el('span', { text: title }),
      el('button', { class: 'x', text: '✕', onclick: close, 'aria-label': t('close') })
    ]));
    const body = el('div', { class: 'modal-body' });
    if (typeof content === 'string') body.innerHTML = content; else body.appendChild(content);
    box.appendChild(body);
    if (actions && actions.length) {
      const row = el('div', { class: 'modal-actions' });
      actions.forEach((a) => row.appendChild(el('button', {
        class: 'btn ' + (a.cls || ''), text: a.label,
        onclick: () => { G.audio.play('click'); if (!a.fn || a.fn() !== false) close(); }
      })));
      box.appendChild(row);
    }
    overlay.appendChild(box);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    root.appendChild(overlay);
    function close() { G.audio.play('back'); overlay.remove(); }
    overlay.close = close;
    return overlay;
  };

  function statRow(label, value, tip) {
    const r = el('div', { class: 'stat-row' + (tip ? ' has-tip' : ''), title: tip || '' }, [
      el('span', { class: 'k', text: label }),
      el('span', { class: 'v', text: value })
    ]);
    return r;
  }

  function btn(label, fn, cls, disabled) {
    return el('button', {
      class: 'btn ' + (cls || '') + (disabled ? ' disabled' : ''),
      text: label, disabled: disabled ? 'disabled' : null,
      onclick: () => { if (disabled) { G.audio.play('error'); return; } G.audio.play('click'); fn(); }
    });
  }

  /* ==========================================================
   * ESTRUTURA
   * ======================================================== */
  UI.build = function (rootEl) {
    root = rootEl;
    U.clear(root);

    topbar = el('div', { class: 'topbar' });
    screenEl = el('div', { class: 'screen' });
    navEl = el('div', { class: 'navbar' });
    root.appendChild(topbar);
    root.appendChild(screenEl);
    root.appendChild(navEl);
    root.appendChild(el('div', { id: 'toasts' }));

    buildTopbar();
    buildNav();
    UI.show('battle');

    G.game.events.on('resources', updateTopbar);
    G.game.events.on('toast', (d) => UI.toast(d.text, d.kind));
    G.game.events.on('saveError', (reason) => {
      UI.toast(t(reason === 'quota' ? 'saveErrorQuota' : 'saveErrorBlocked'), 'warn');
    });
    G.game.events.on('inventory', () => { if (UI.current === 'bag') UI.show('bag'); });
    G.game.events.on('heroes', () => { if (UI.current === 'heroes' || UI.current === 'party') UI.show(UI.current); });
    G.game.events.on('quests', () => { if (UI.current === 'quests') UI.show('quests'); });
    G.game.events.on('companions', () => { if (UI.current === 'companions') UI.show('companions'); });
    G.game.events.on('idle', () => { if (UI.current === 'idle') UI.show('idle'); });
    G.game.events.on('prestige', () => { if (UI.current === 'prestige') UI.show('prestige'); });
    G.game.events.on('story', (region) => UI.showStory(region));
    G.game.events.on('battleStart', () => { if (UI.current === 'battle') buildBattleHud(); });
  };

  function buildTopbar() {
    U.clear(topbar);
    const s = G.game.state;
    const logo = el('div', { class: 'brand' }, [
      el('span', { class: 'b1', text: t('gameTitle') }),
      el('span', { class: 'b2', text: t('gameSub') })
    ]);
    topbar.appendChild(logo);

    const res = el('div', { class: 'resources' });
    const mk = (id, icon, color) => {
      const box = el('div', { class: 'res', id: 'res-' + id, title: t(id) });
      box.appendChild(iconEl(icon, color, 14));
      box.appendChild(el('span', { class: 'val', text: '0' }));
      res.appendChild(box);
      return box;
    };
    mk('gold', 'gold', '#ffd94a');
    mk('gems', 'gem', '#7fe8ff');
    mk('essence', 'essence', '#c07bff');
    mk('tokens', 'token', '#d99a4a');
    topbar.appendChild(res);

    const tools = el('div', { class: 'tools' });
    tools.appendChild(el('button', { class: 'tbtn', text: '💾', title: t('saveNow'), onclick: () => { G.game.saveNow(); UI.toast(t('saved'), 'ok'); } }));
    tools.appendChild(el('button', { class: 'tbtn', text: '🔊', id: 'btn-mute', title: 'M', onclick: toggleMute }));
    tools.appendChild(el('button', { class: 'tbtn', text: '⛶', title: 'F', onclick: () => G.main.toggleFullscreen() }));
    tools.appendChild(el('button', { class: 'tbtn', text: '⚙', title: t('settings'), onclick: () => UI.show('settings') }));
    topbar.appendChild(tools);
    updateTopbar();
  }

  function toggleMute() {
    const m = !G.audio.isMuted();
    G.audio.setMuted(m);
    G.game.settings.muted = m;
    const b = U.qs('#btn-mute'); if (b) b.textContent = m ? '🔇' : '🔊';
    G.save.saveSettings(G.game.settings);
  }

  function updateTopbar() {
    const s = G.game.state;
    if (!s) return;
    const set = (id, v) => { const n = U.qs('#res-' + id + ' .val'); if (n) n.textContent = fmt(v); };
    set('gold', s.gold); set('gems', s.gems); set('essence', s.essence); set('tokens', s.tokens);
  }
  UI.updateTopbar = updateTopbar;

  const NAV = [
    { id: 'battle', label: 'navBattle', icon: '⚔' },
    { id: 'map', label: 'navMap', icon: '🗺' },
    { id: 'heroes', label: 'navHeroes', icon: '👤' },
    { id: 'bag', label: 'navBag', icon: '🎒' },
    { id: 'craft', label: 'navCraft', icon: '🔨' },
    { id: 'quests', label: 'navQuests', icon: '📜' },
    { id: 'bestiary', label: 'navBestiary', icon: '📖' },
    { id: 'companions', label: 'navCompanions', icon: '🐾' },
    { id: 'idle', label: 'navIdle', icon: '⏳' },
    { id: 'achievements', label: 'navAch', icon: '🏆' },
    { id: 'prestige', label: 'navPrestige', icon: '✨' }
  ];

  function buildNav() {
    U.clear(navEl);
    NAV.forEach((n) => {
      navEl.appendChild(el('button', {
        class: 'nav', 'data-id': n.id,
        onclick: () => { G.audio.play('tab'); UI.show(n.id); }
      }, [
        el('span', { class: 'nic', text: n.icon }),
        el('span', { class: 'nlb', text: t(n.label) })
      ]));
    });
  }

  UI.show = function (id) {
    UI.current = id;
    U.qsa('.nav', navEl).forEach((b) => b.classList.toggle('on', b.getAttribute('data-id') === id));
    U.clear(screenEl);
    hud = {};
    const fn = SCREENS[id];
    if (fn) fn(screenEl); else screenEl.appendChild(el('div', { class: 'pad', text: t('soon') }));
  };

  /* ==========================================================
   * TELAS
   * ======================================================== */
  const SCREENS = {};

  /* ---------- BATALHA ---------- */
  SCREENS.battle = function (c) {
    const wrap = el('div', { class: 'battle-wrap' });
    canvas = el('canvas', { id: 'battle-canvas' });
    wrap.appendChild(canvas);

    const top = el('div', { class: 'bt-top' });
    top.appendChild(hud.stageLabel = el('div', { class: 'bt-stage' }));
    const ctrl = el('div', { class: 'bt-ctrl' });
    G.balance.combat.speedOptions.forEach((sp) => {
      ctrl.appendChild(el('button', {
        class: 'sbtn', text: sp + 'x', 'data-sp': sp,
        onclick: () => { G.game.settings.battleSpeed = sp; G.save.saveSettings(G.game.settings); refreshSpeed(); G.audio.play('click'); }
      }));
    });
    ctrl.appendChild(hud.pauseBtn = el('button', { class: 'sbtn', text: '⏸', title: 'Esc', onclick: () => G.main.togglePause() }));
    top.appendChild(ctrl);
    wrap.appendChild(top);

    const toggles = el('div', { class: 'bt-toggles' });
    toggles.appendChild(mkToggle('autoProgress', t('autoProgress')));
    toggles.appendChild(mkToggle('repeatStage', t('repeatStage')));
    toggles.appendChild(mkToggle('autoUltimate', t('ultimate') + ' ' + t('auto')));
    wrap.appendChild(toggles);

    hud.result = el('div', { class: 'bt-result hidden' });
    wrap.appendChild(hud.result);

    const bar = el('div', { class: 'party-bar' });
    hud.cards = [];
    wrap.appendChild(bar);
    hud.partyBar = bar;

    c.appendChild(wrap);
    G.render.attach(canvas);
    refreshSpeed();
    buildBattleHud();
    if (!G.game.battle) G.game.startBattle(G.game.state.stage);
  };

  function mkToggle(key, label) {
    const on = G.game.settings[key] !== false;
    const b = el('button', {
      class: 'tgl' + (on ? ' on' : ''), text: label,
      onclick: function () {
        G.game.settings[key] = !(G.game.settings[key] !== false);
        this.classList.toggle('on', G.game.settings[key]);
        if (key === 'autoUltimate' && G.game.battle) G.game.battle.autoUltimate = G.game.settings[key];
        G.save.saveSettings(G.game.settings);
        G.audio.play('click');
      }
    });
    return b;
  }

  function refreshSpeed() {
    U.qsa('.sbtn[data-sp]').forEach((b) => b.classList.toggle('on', +b.getAttribute('data-sp') === G.game.settings.battleSpeed));
  }

  function buildBattleHud() {
    if (!hud.partyBar) return;
    U.clear(hud.partyBar);
    hud.cards = [];
    const b = G.game.battle;
    if (!b) return;
    b.party.forEach((u, i) => {
      const def = G.heroById[u.heroId] || {};
      const card = el('div', { class: 'pcard' });
      card.appendChild(canvasEl(G.art.portrait(def.art || u.art, rarityColor(def.rarity || 'rare')), 40, 'pcard-por'));
      const info = el('div', { class: 'pcard-info' });
      info.appendChild(el('div', { class: 'pcard-name', text: u.name }));
      const hpb = el('div', { class: 'bar hp' }, [el('i')]);
      const enb = el('div', { class: 'bar en' }, [el('i')]);
      info.appendChild(hpb); info.appendChild(enb);
      card.appendChild(info);
      const ult = el('button', {
        class: 'ult-btn', title: (u.ultimate ? G.tn(u.ultimate.def) : ''),
        onclick: () => { if (G.combat.castUltimate(G.game.battle, u)) G.audio.play('ultimate'); else G.audio.play('error'); }
      }, [el('span', { text: (i + 1) })]);
      card.appendChild(ult);
      hud.partyBar.appendChild(card);
      hud.cards.push({ unit: u, hp: hpb.firstChild, en: enb.firstChild, ult: ult, card: card });
    });
  }

  /** Chamado a cada quadro pelo main loop. */
  UI.updateHud = function () {
    if (UI.current !== 'battle') return;
    const b = G.game.battle, s = G.game.state;
    if (hud.stageLabel) {
      const stage = G.getStage(s.stage);
      const region = G.regionById[stage.region];
      const badge = stage.type === 'boss' ? ' ⭐' + t('boss') : stage.type === 'elite' ? ' ◆' + t('elite') : '';
      hud.stageLabel.textContent = t('stage') + ' ' + (s.stage + 1) + ' · ' + G.tn(region) + ' · ' + G.tn(stage) + badge;
    }
    if (!b) return;
    for (const c of hud.cards) {
      const u = c.unit;
      c.hp.style.width = U.clamp(u.hp / u.max.hp, 0, 1) * 100 + '%';
      c.en.style.width = U.clamp(u.energy / 100, 0, 1) * 100 + '%';
      const ready = u.alive && u.energy >= 100 && u.ultimate && u.ultimate.cd <= 0;
      c.ult.classList.toggle('ready', ready);
      c.card.classList.toggle('dead', !u.alive);
    }
    if (hud.result) {
      const r = G.game.session.lastResult;
      if (r && G.game.battle && G.game.battle.over) {
        if (hud.result.dataset.k !== r.result + r.stage) {
          hud.result.dataset.k = r.result + r.stage;
          hud.result.className = 'bt-result ' + r.result;
          U.clear(hud.result);
          hud.result.appendChild(el('div', { class: 'rt', text: r.result === 'victory' ? t('victory') : t('defeat') }));
          if (r.result === 'victory' && r.gained) {
            const g = r.gained;
            const line = el('div', { class: 'rl' });
            line.appendChild(el('span', { text: '+' + fmt(g.gold) + ' ' + t('gold') }));
            line.appendChild(el('span', { text: '+' + fmt(g.xp) + ' ' + t('exp') }));
            for (const m in g.mats) line.appendChild(el('span', { text: '+' + g.mats[m] + ' ' + G.tn(G.materialById[m]) }));
            if (g.items && g.items.length) line.appendChild(el('span', { class: 'drop', text: '★ ' + g.items.map((i) => G.game.itemName(i)).join(', ') }));
            hud.result.appendChild(line);
          } else if (r.result === 'defeat') {
            hud.result.appendChild(el('div', { class: 'rl' }, [el('span', { text: t('defeatHint') })]));
          }
        }
      } else if (hud.result.dataset.k) {
        hud.result.dataset.k = ''; hud.result.className = 'bt-result hidden'; U.clear(hud.result);
      }
    }
  };

  /* ---------- MAPA ---------- */
  SCREENS.map = function (c) {
    const s = G.game.state;
    c.appendChild(el('h2', { class: 'title', text: t('worldMap') }));
    c.appendChild(el('div', { class: 'sub', text: t('bestStage') + ': ' + (s.maxStage + 1) + ' · ' + t('power') + ': ' + fmt(G.game.partyPower()) }));
    const grid = el('div', { class: 'region-grid' });
    G.regions.forEach((r, ri) => {
      const firstStage = ri * 12;
      const unlocked = s.maxStage >= firstStage;
      const card = el('div', { class: 'region' + (unlocked ? '' : ' locked') });
      const strip = el('canvas', { class: 'pix rstrip' });
      strip.width = 120; strip.height = 40;
      const bg = G.art.background(r.pal, 120, 40, r.weather);
      strip.getContext('2d').drawImage(bg, 0, 0);
      card.appendChild(strip);
      card.appendChild(el('div', { class: 'rname', text: G.tn(r) }));
      card.appendChild(el('div', { class: 'rdesc', text: G.td(r, 'desc') }));
      if (!unlocked) card.appendChild(el('div', { class: 'rlock', text: t('regionLocked') }));
      else {
        const stages = el('div', { class: 'stage-list' });
        for (let i = 0; i < 12; i++) {
          const abs = ri * 12 + i;
          const st = G.stages[abs];
          const cleared = s.maxStage > abs;
          const avail = s.maxStage >= abs;
          const cls = 'stg ' + st.type + (cleared ? ' cleared' : '') + (abs === s.stage ? ' current' : '') + (avail ? '' : ' locked');
          stages.appendChild(el('button', {
            class: cls, text: (i + 1),
            title: G.tn(st) + ' · ' + t('recPower') + ' ' + fmt(st.power),
            onclick: () => {
              if (!avail) { G.audio.play('error'); return; }
              G.audio.play('click'); G.game.setStage(abs); UI.show('battle');
            }
          }));
        }
        card.appendChild(stages);
        card.appendChild(el('button', { class: 'btn small', text: t('story'), onclick: () => UI.showStory(r) }));
      }
      grid.appendChild(card);
    });
    c.appendChild(grid);
    if (s.maxStage >= G.STAGE_COUNT) {
      c.appendChild(el('div', { class: 'panel', html: '<b>' + G.t('navMap') + ' — Vale do Eclipse ∞</b><br>' + (G.locale === 'en' ? 'Endless depths keep scaling for idle progress.' : 'As profundezas infinitas continuam escalando para o progresso ocioso.') }));
      c.appendChild(btn(t('nextStage') + ' ∞', () => { G.game.setStage(Math.min(s.maxStage, G.STAGE_COUNT + 40)); UI.show('battle'); }, 'small'));
    }
  };

  UI.showStory = function (region) {
    const box = el('div', { class: 'story' });
    box.appendChild(el('h3', { text: G.td(region.story, 'title') }));
    G.td(region.story, 'text').split('\n\n').forEach((p) => box.appendChild(el('p', { text: p })));
    if (region.secret) box.appendChild(el('div', { class: 'secret-note', text: '🔎 ' + G.tn(region.secret) + ' — ' + region.secret.desc }));
    UI.modal(G.tn(region), box, [{ label: t('ok') }], { wide: true });
  };

  /* ---------- HERÓIS ---------- */
  SCREENS.heroes = function (c) {
    const s = G.game.state;
    c.appendChild(el('h2', { class: 'title', text: t('navHeroes') }));
    const cost = G.game.recruitCost();
    c.appendChild(el('div', { class: 'sub', text: t('recruit') + ': ' + fmt(cost.gold) + ' ' + t('gold') + (cost.gems ? ' + ' + cost.gems + ' ' + t('gems') : '') }));
    const grid = el('div', { class: 'hero-grid' });
    G.heroes.forEach((h) => {
      const hs = s.heroes[h.id];
      const inParty = s.party.indexOf(h.id) >= 0;
      const card = el('div', { class: 'hcard' + (hs.unlocked ? '' : ' locked') + (inParty ? ' in-party' : '') });
      card.appendChild(canvasEl(G.art.portrait(h.art, rarityColor(h.rarity)), 56));
      card.appendChild(el('div', { class: 'hname', text: G.tn(h) }));
      card.appendChild(el('div', { class: 'hmeta', text: (G.locale === 'en' ? h.clsEn : h.cls) + ' · ' + roleName(h.role) }));
      card.appendChild(el('div', { class: 'hrar', text: rarityName(h.rarity), style: { color: rarityColor(h.rarity) } }));
      if (hs.unlocked) {
        card.appendChild(el('div', { class: 'hlvl', text: t('level') + ' ' + hs.lvl + ' · ' + '★'.repeat(hs.stars) }));
        card.appendChild(el('div', { class: 'hpow', text: t('power') + ': ' + fmt(G.game.heroPower(h.id)) }));
        card.appendChild(btn(t('equipment'), () => heroDetail(h.id), 'small'));
        card.appendChild(btn(inParty ? t('removeParty') : t('addToParty'), () => { G.game.toggleParty(h.id); UI.show('heroes'); }, 'small ' + (inParty ? 'warn' : 'ok')));
      } else {
        card.appendChild(btn(t('recruit'), () => { if (G.game.recruitHero(h.id)) UI.show('heroes'); }, 'small ok'));
      }
      card.appendChild(btn('?', () => heroLore(h), 'tiny'));
      grid.appendChild(card);
    });
    c.appendChild(grid);
  };
  SCREENS.party = SCREENS.heroes;

  function roleName(r) {
    const map = {
      tank: ['Tanque', 'Tank'], dps: ['Dano', 'DPS'], healer: ['Suporte/Cura', 'Healer'],
      bruiser: ['Combatente', 'Bruiser'], mage: ['Mago', 'Mage'], assassin: ['Assassino', 'Assassin'], support: ['Suporte', 'Support']
    };
    const m = map[r] || [r, r];
    return G.locale === 'en' ? m[1] : m[0];
  }

  function heroLore(h) {
    const box = el('div', {});
    box.appendChild(canvasEl(G.art.portrait(h.art, rarityColor(h.rarity)), 96));
    box.appendChild(el('p', { text: G.td(h, 'bio') }));
    box.appendChild(el('p', { html: '<b>' + t('strengths') + ':</b> ' + U.esc(G.td(h, 'strengths')) }));
    box.appendChild(el('p', { html: '<b>' + t('weaknesses') + ':</b> ' + U.esc(G.td(h, 'weaknesses')) }));
    box.appendChild(el('p', { html: '<b>' + t('inspiration') + ':</b> ' + U.esc(G.td(h, 'inspiration')) }));
    box.appendChild(el('p', { html: '<b>' + t('element') + ':</b> ' + G.balance.elements.icons[h.element] + ' ' + (G.locale === 'en' ? G.balance.elements.namesEn : G.balance.elements.names)[h.element] }));
    UI.modal(G.tn(h), box, [{ label: t('close') }]);
  }

  function heroDetail(heroId) {
    selectedHero = heroId;
    const s = G.game.state, h = G.heroById[heroId], hs = s.heroes[heroId];
    const box = el('div', { class: 'hero-detail' });

    const head = el('div', { class: 'hd-head' });
    head.appendChild(canvasEl(G.art.portrait(h.art, rarityColor(h.rarity)), 72));
    const hi = el('div', {});
    hi.appendChild(el('div', { class: 'hd-name', text: G.tn(h) }));
    hi.appendChild(el('div', { class: 'hd-sub', text: (G.locale === 'en' ? h.clsEn : h.cls) + ' · ' + roleName(h.role) + ' · ' + '★'.repeat(hs.stars) }));
    const xpNeed = G.balance.hero.xpCurve(hs.lvl);
    hi.appendChild(el('div', { class: 'hd-sub', text: t('level') + ' ' + hs.lvl + ' (' + fmt(hs.xp) + '/' + fmt(xpNeed) + ')' }));
    hi.appendChild(el('div', { class: 'hd-sub', text: t('bond') + ' ' + G.game.bondLevel(heroId) + ' · ' + t('ascension') + ' ' + hs.ascend }));
    hi.appendChild(el('div', { class: 'hd-pow', text: t('powerScore') + ': ' + fmt(G.game.heroPower(heroId)) }));
    head.appendChild(hi);
    box.appendChild(head);

    // ações
    const acts = el('div', { class: 'row wrap' });
    acts.appendChild(btn(t('ascend') + ' (' + fmt(G.balance.hero.ascendCost(hs.ascend)) + ')', () => { if (G.game.ascendHero(heroId)) { close(); heroDetail(heroId); } }, 'small'));
    const fragNeed = G.balance.hero.starCost[hs.stars] * 5;
    acts.appendChild(btn(t('starUp') + ' (' + (s.fragments[heroId] || 0) + '/' + fragNeed + ')', () => { if (G.game.starUpHero(heroId)) { close(); heroDetail(heroId); } }, 'small', hs.stars >= 6));
    box.appendChild(acts);

    // atributos
    const st = G.game.heroStats(heroId);
    const stats = el('div', { class: 'stat-grid' });
    stats.appendChild(statRow(t('hp'), fmt(st.hp), t('tip_hp')));
    stats.appendChild(statRow(t('atk'), fmt(st.atk), t('tip_atk')));
    stats.appendChild(statRow(t('def'), fmt(st.def), t('tip_def')));
    stats.appendChild(statRow(t('mag'), fmt(st.mag), t('tip_mag')));
    stats.appendChild(statRow(t('res'), fmt(st.res), t('tip_res')));
    stats.appendChild(statRow(t('spd'), st.spd.toFixed(2), t('tip_spd')));
    stats.appendChild(statRow(t('crit'), U.pct(st.crit), t('tip_crit')));
    stats.appendChild(statRow(t('critDmg'), U.pct(st.critDmg), t('tip_critDmg')));
    stats.appendChild(statRow(t('dodge'), U.pct(st.dodge), t('tip_dodge')));
    stats.appendChild(statRow(t('acc'), U.pct(st.acc), t('tip_acc')));
    stats.appendChild(statRow(t('lifesteal'), U.pct(st.lifesteal), t('tip_lifesteal')));
    stats.appendChild(statRow(t('healPow'), U.pct(st.healPow), t('tip_healPow')));
    stats.appendChild(statRow(t('cdr'), U.pct(st.cdr), t('tip_cdr')));
    stats.appendChild(statRow(t('element'), G.balance.elements.icons[h.element] + ' ' + (G.locale === 'en' ? G.balance.elements.namesEn : G.balance.elements.names)[h.element], ''));
    box.appendChild(el('h4', { text: t('powerScore') }));
    box.appendChild(stats);

    // equipamento
    box.appendChild(el('h4', { text: t('equipment') }));
    const eq = el('div', { class: 'equip-grid' });
    G.slots.forEach((slot) => {
      const uid = hs.equip[slot.id];
      const item = uid ? G.game.getItem(uid) : null;
      const cell = el('div', { class: 'eq-cell' + (item ? '' : ' empty') });
      cell.appendChild(iconEl(slot.icon, item ? rarityColor(item.rarity) : '#5a5f70', 22));
      cell.appendChild(el('div', { class: 'eq-name', text: item ? G.game.itemName(item) + ' +' + item.up : t('emptySlot') }));
      cell.appendChild(el('div', { class: 'eq-sub', text: G.tn(slot) }));
      cell.addEventListener('click', () => {
        G.audio.play('click');
        if (item) itemModal(item, heroId);
        else pickItemForSlot(heroId, slot.id);
      });
      eq.appendChild(cell);
    });
    box.appendChild(eq);

    // habilidades
    box.appendChild(el('h4', { text: t('skills') }));
    const abs = el('div', { class: 'abil-list' });
    abs.appendChild(abilityRow({ name: G.tn(h.basic), desc: t('basicAttack'), type: 'basic' }, heroId));
    h.abilities.forEach((a) => abs.appendChild(abilityRow(a, heroId)));
    box.appendChild(abs);

    const m = UI.modal(G.tn(h), box, [{ label: t('close') }], { wide: true });
    function close() { m.close(); }
  }

  function abilityRow(a, heroId) {
    const s = G.game.state;
    const lvl = a.id ? (s.heroes[heroId].skills[a.id] || 1) : 1;
    const row = el('div', { class: 'abil' });
    const tag = a.type === 'ultimate' ? 'ULT' : a.type === 'passive' ? t('passive') : a.type === 'basic' ? '•' : t('active');
    row.appendChild(el('div', { class: 'abil-tag ' + (a.type || ''), text: tag }));
    const info = el('div', { class: 'abil-info' });
    info.appendChild(el('div', { class: 'abil-name', text: G.tn(a) + (a.id && a.type !== 'passive' ? ' — Nv.' + lvl : '') }));
    info.appendChild(el('div', { class: 'abil-desc', text: G.td(a, 'desc') }));
    if (a.cd) info.appendChild(el('div', { class: 'abil-cd', text: t('cooldown') + ': ' + a.cd + 's' }));
    row.appendChild(info);
    if (a.id && a.type !== 'passive' && lvl < G.balance.hero.skillMaxLevel) {
      row.appendChild(btn('+ ' + fmt(G.game.skillCost(heroId, a.id)), () => {
        if (G.game.upgradeSkill(heroId, a.id)) { U.qsa('.modal-overlay').forEach((o) => o.remove()); heroDetail(heroId); }
      }, 'tiny'));
    }
    return row;
  }

  function pickItemForSlot(heroId, slotId) {
    const s = G.game.state;
    const list = s.inventory.filter((i) => G.equipById[i.base].slot === slotId);
    if (!list.length) { UI.toast(t('none'), 'warn'); return; }
    list.sort((a, b) => G.game.itemPower(b) - G.game.itemPower(a));
    const box = el('div', { class: 'item-list' });
    list.forEach((i) => box.appendChild(itemRow(i, () => { G.game.equipItem(heroId, i.uid); U.qsa('.modal-overlay').forEach((o) => o.remove()); heroDetail(heroId); })));
    UI.modal(t('equip') + ' — ' + G.tn(G.slotById[slotId]), box, [{ label: t('close') }], { wide: true });
  }

  function itemRow(item, onclick) {
    const base = G.equipById[item.base];
    const owner = G.game.isEquipped(item);
    const row = el('div', { class: 'irow', onclick: onclick });
    row.appendChild(iconEl(G.slotById[base.slot].icon, rarityColor(item.rarity), 24));
    const info = el('div', { class: 'irow-info' });
    info.appendChild(el('div', { class: 'irow-name', style: { color: rarityColor(item.rarity) }, text: G.tn(base) + (item.up ? ' +' + item.up : '') + (item.locked ? ' 🔒' : '') }));
    info.appendChild(el('div', { class: 'irow-sub', text: rarityName(item.rarity) + ' · Nv.' + item.ilvl + ' · ' + t('power') + ' ' + fmt(G.game.itemPower(item)) + (owner ? ' · ' + t('equipped') + ' ' + G.tn(G.heroById[owner]) : '') }));
    row.appendChild(info);
    return row;
  }

  /* ---------- BOLSA ---------- */
  SCREENS.bag = function (c) {
    const s = G.game.state;
    c.appendChild(el('h2', { class: 'title', text: t('inventory') + ' (' + s.inventory.length + '/' + G.balance.loot.maxInventory + ')' }));

    const bar = el('div', { class: 'filter-bar' });
    const rsel = el('select', { onchange: function () { itemFilter.rarity = this.value; UI.show('bag'); } });
    rsel.appendChild(el('option', { value: 'all', text: t('all') }));
    G.balance.rarities.forEach((r) => rsel.appendChild(el('option', { value: r.id, text: G.tn(r), selected: itemFilter.rarity === r.id ? 'selected' : null })));
    rsel.value = itemFilter.rarity;
    bar.appendChild(rsel);
    const ssel = el('select', { onchange: function () { itemFilter.slot = this.value; UI.show('bag'); } });
    ssel.appendChild(el('option', { value: 'all', text: t('all') }));
    G.slots.forEach((sl) => ssel.appendChild(el('option', { value: sl.id, text: G.tn(sl) })));
    ssel.value = itemFilter.slot;
    bar.appendChild(ssel);
    bar.appendChild(btn(t('bulkSell'), () => G.game.bulkAction('sell'), 'small warn'));
    bar.appendChild(btn(t('bulkDismantle'), () => G.game.bulkAction('dismantle'), 'small warn'));
    c.appendChild(bar);

    let list = s.inventory.slice();
    if (itemFilter.rarity !== 'all') list = list.filter((i) => i.rarity === itemFilter.rarity);
    if (itemFilter.slot !== 'all') list = list.filter((i) => G.equipById[i.base].slot === itemFilter.slot);
    list.sort((a, b) => G.game.itemPower(b) - G.game.itemPower(a));

    const grid = el('div', { class: 'item-grid' });
    list.forEach((i) => {
      const base = G.equipById[i.base];
      const cell = el('div', { class: 'icell', style: { borderColor: rarityColor(i.rarity) }, onclick: () => itemModal(i) });
      cell.appendChild(iconEl(G.slotById[base.slot].icon, rarityColor(i.rarity), 28));
      cell.appendChild(el('div', { class: 'icell-name', text: G.tn(base) }));
      cell.appendChild(el('div', { class: 'icell-sub', text: (G.balance.rarityById[i.rarity].short) + ' · +' + i.up + (i.locked ? ' 🔒' : '') }));
      const owner = G.game.isEquipped(i);
      if (owner) cell.appendChild(el('div', { class: 'icell-eq', text: '⚔' }));
      grid.appendChild(cell);
    });
    if (!list.length) grid.appendChild(el('div', { class: 'pad dim', text: t('none') }));
    c.appendChild(grid);

    // materiais
    c.appendChild(el('h3', { class: 'title', text: t('materials') }));
    const mg = el('div', { class: 'mat-grid' });
    G.materials.forEach((m) => {
      const q = s.mats[m.id] || 0;
      if (!q) return;
      const cell = el('div', { class: 'mcell', title: G.tn(m) });
      cell.appendChild(iconEl('mat', m.color, 22));
      cell.appendChild(el('div', { class: 'mname', text: G.tn(m) }));
      cell.appendChild(el('div', { class: 'mqty', text: fmt(q) }));
      mg.appendChild(cell);
    });
    if (!mg.children.length) mg.appendChild(el('div', { class: 'pad dim', text: t('none') }));
    c.appendChild(mg);

    // poções
    const pk = Object.keys(s.potions).filter((k) => s.potions[k] > 0);
    if (pk.length) {
      c.appendChild(el('h3', { class: 'title', text: t('potions') }));
      const pg = el('div', { class: 'mat-grid' });
      pk.forEach((k) => {
        const p = G.potions[k];
        const cell = el('div', { class: 'mcell' });
        cell.appendChild(iconEl('potion', p.color, 22));
        cell.appendChild(el('div', { class: 'mname', text: G.tn(p) }));
        cell.appendChild(el('div', { class: 'mqty', text: 'x' + s.potions[k] }));
        cell.appendChild(btn(t('usePotion'), () => { G.game.usePotion(k); UI.show('bag'); }, 'tiny'));
        pg.appendChild(cell);
      });
      c.appendChild(pg);
    }
  };

  function itemModal(item, fromHero) {
    const base = G.equipById[item.base];
    const set = G.setById[base.set];
    const stats = G.game.itemStats(item);
    const box = el('div', { class: 'item-detail' });
    box.appendChild(el('div', { class: 'id-head' }, [
      iconEl(G.slotById[base.slot].icon, rarityColor(item.rarity), 34),
      el('div', {}, [
        el('div', { class: 'id-name', style: { color: rarityColor(item.rarity) }, text: G.tn(base) + (item.up ? ' +' + item.up : '') }),
        el('div', { class: 'id-sub', text: rarityName(item.rarity) + ' · ' + G.tn(G.slotById[base.slot]) + ' · ' + t('reqLevel') + ' ' + base.minLevel })
      ])
    ]));
    const sg = el('div', { class: 'stat-grid' });
    for (const k in stats) {
      if (k === 'setSpecials') continue;
      const isPct = ['crit', 'dodge', 'acc', 'critDmg', 'lifesteal', 'healPow', 'cdr', 'elemRes'].indexOf(k) >= 0;
      sg.appendChild(statRow(t(k) || k, isPct ? U.pct(stats[k]) : fmt(stats[k]), t('tip_' + k) || ''));
    }
    box.appendChild(sg);
    box.appendChild(el('div', { class: 'id-power', text: t('power') + ': ' + fmt(G.game.itemPower(item)) + ' · ' + t('sellValue') + ': ' + fmt(G.game.sellValue(item)) }));

    if (set) {
      const sb = el('div', { class: 'setbox' });
      sb.appendChild(el('div', { class: 'set-name', style: { color: set.color }, text: t('setBonus') + ': ' + G.tn(set) }));
      set.bonuses.forEach((b) => sb.appendChild(el('div', { class: 'set-line', text: b.pieces + ' ' + t('pieces') + ' — ' + G.td(b, 'desc') })));
      box.appendChild(sb);
    }

    const owner = G.game.isEquipped(item);
    if (owner) box.appendChild(el('div', { class: 'id-owner', text: t('equipped') + ': ' + G.tn(G.heroById[owner]) }));

    const acts = [];
    if (item.up < G.balance.loot.upgradeMaxLevel) {
      acts.push({
        label: t('upgrade') + ' (' + fmt(G.game.upgradeCost(item)) + ')', cls: 'ok',
        fn: () => { if (G.game.upgradeItem(item.uid)) { UI.show(UI.current); } return true; }
      });
    }
    acts.push({ label: item.locked ? t('unlock2') : t('lock'), fn: () => { G.game.toggleLock(item.uid); UI.show(UI.current); } });
    if (!owner) {
      acts.push({
        label: t('equip'), cls: 'ok', fn: () => {
          const s = G.game.state;
          const target = fromHero || s.party[0];
          if (target) { G.game.equipItem(target, item.uid); UI.toast(t('equip') + ' → ' + G.tn(G.heroById[target]), 'ok'); }
        }
      });
      acts.push({ label: t('sell'), cls: 'warn', fn: () => { G.game.sellItem(item.uid); UI.show(UI.current); } });
      acts.push({ label: t('dismantle'), cls: 'warn', fn: () => { G.game.dismantleItem(item.uid); UI.show(UI.current); } });
    } else {
      acts.push({ label: t('unequip'), fn: () => { G.game.unequipItem(owner, base.slot); UI.show(UI.current); } });
    }
    acts.push({ label: t('close') });
    UI.modal(G.game.itemName(item), box, acts, { wide: true });
  }

  /* ---------- OFICINA ---------- */
  SCREENS.craft = function (c) {
    const s = G.game.state;
    c.appendChild(el('h2', { class: 'title', text: t('navCraft') }));
    const cats = [['material', t('materials')], ['potion', t('potions')], ['equip', t('equipment')], ['relic', t('navBag')], ['service', t('upgrade')]];
    const list = el('div', { class: 'recipe-list' });
    G.recipes.forEach((r) => {
      const unlocked = s.maxStage >= r.unlock;
      const can = unlocked && G.game.canCraft(r);
      const card = el('div', { class: 'recipe' + (unlocked ? '' : ' locked') });
      card.appendChild(el('div', { class: 'rc-name', text: G.tn(r) }));
      card.appendChild(el('div', { class: 'rc-desc', text: G.td(r, 'desc') }));
      const cost = el('div', { class: 'rc-cost' });
      if (r.cost.gold) cost.appendChild(el('span', { class: (s.gold >= r.cost.gold ? 'ok' : 'no'), text: fmt(r.cost.gold) + ' ' + t('gold') }));
      for (const m in r.cost.mats || {}) {
        const have = s.mats[m] || 0;
        cost.appendChild(el('span', { class: (have >= r.cost.mats[m] ? 'ok' : 'no'), text: G.tn(G.materialById[m]) + ' ' + have + '/' + r.cost.mats[m] }));
      }
      card.appendChild(cost);
      if (!unlocked) card.appendChild(el('div', { class: 'rc-lock', text: t('locked') + ' — ' + t('stage') + ' ' + r.unlock }));
      else {
        if (r.needsItem) card.appendChild(btn(craftSelection.item ? G.game.itemName(G.game.getItem(craftSelection.item) || {}) : t('selectItem'), () => selectItemForCraft(), 'small'));
        if (r.needsHero) card.appendChild(btn(craftSelection.hero ? G.tn(G.heroById[craftSelection.hero]) : t('selectHero'), () => selectHeroForCraft(), 'small'));
        card.appendChild(btn(t('craft'), () => {
          const extra = r.needsItem ? craftSelection.item : r.needsHero ? craftSelection.hero : null;
          G.game.craft(r.id, extra); UI.show('craft');
        }, 'small ok', !can));
      }
      list.appendChild(card);
    });
    c.appendChild(list);
  };

  function selectItemForCraft() {
    const s = G.game.state;
    const box = el('div', { class: 'item-list' });
    s.inventory.slice().sort((a, b) => G.game.itemPower(b) - G.game.itemPower(a)).forEach((i) => {
      box.appendChild(itemRow(i, () => { craftSelection.item = i.uid; U.qsa('.modal-overlay').forEach((o) => o.remove()); UI.show('craft'); }));
    });
    if (!s.inventory.length) box.appendChild(el('div', { class: 'pad dim', text: t('none') }));
    UI.modal(t('selectItem'), box, [{ label: t('close') }], { wide: true });
  }
  function selectHeroForCraft() {
    const box = el('div', { class: 'item-list' });
    G.heroes.forEach((h) => box.appendChild(el('div', {
      class: 'irow', onclick: () => { craftSelection.hero = h.id; U.qsa('.modal-overlay').forEach((o) => o.remove()); UI.show('craft'); }
    }, [canvasEl(G.art.portrait(h.art, rarityColor(h.rarity)), 32), el('div', { class: 'irow-info' }, [el('div', { class: 'irow-name', text: G.tn(h) })])])));
    UI.modal(t('selectHero'), box, [{ label: t('close') }], { wide: true });
  }

  /* ---------- MISSÕES ---------- */
  let questTab = 'main';
  SCREENS.quests = function (c) {
    const s = G.game.state;
    c.appendChild(el('h2', { class: 'title', text: t('quests') }));
    const tabs = el('div', { class: 'tabs' });
    Object.keys(G.questKinds).forEach((k) => {
      tabs.appendChild(el('button', {
        class: 'tab' + (questTab === k ? ' on' : ''), text: G.tn(G.questKinds[k]),
        onclick: () => { questTab = k; G.audio.play('tab'); UI.show('quests'); }
      }));
    });
    c.appendChild(tabs);

    if (questTab === 'daily') c.appendChild(el('div', { class: 'sub', text: t('resetsIn') + ' ' + U.time((s.dailyResetAt - Date.now()) / 1000) }));
    if (questTab === 'weekly') c.appendChild(el('div', { class: 'sub', text: t('resetsIn') + ' ' + U.time((s.weeklyResetAt - Date.now()) / 1000) }));

    const list = el('div', { class: 'quest-list' });
    const qs = G.quests.filter((q) => q.kind === questTab);
    qs.forEach((q) => {
      const st = s.quests[q.id];
      const done = st.prog >= q.obj.count;
      const card = el('div', { class: 'quest' + (st.claimed ? ' claimed' : done ? ' done' : '') });
      card.appendChild(el('div', { class: 'q-title', text: G.tn(q) }));
      card.appendChild(el('div', { class: 'q-meta', text: G.tn(G.questKinds[q.kind]) + ' · ' + t('recPower') + ' Nv.' + q.lvl + ' · ' + (G.regionById[q.region] ? G.tn(G.regionById[q.region]) : t('all')) }));
      card.appendChild(el('div', { class: 'q-desc', text: G.td(q, 'desc') }));
      const pr = el('div', { class: 'q-prog' }, [el('i', { style: { width: U.clamp(st.prog / q.obj.count, 0, 1) * 100 + '%' } })]);
      card.appendChild(pr);
      card.appendChild(el('div', { class: 'q-progtext', text: t('progress') + ': ' + fmt(Math.min(st.prog, q.obj.count)) + '/' + fmt(q.obj.count) }));
      const rw = el('div', { class: 'q-rw' });
      if (q.rewards.gold) rw.appendChild(el('span', { text: fmt(q.rewards.gold) + ' ' + t('gold') }));
      if (q.rewards.gems) rw.appendChild(el('span', { text: q.rewards.gems + ' ' + t('gems') }));
      if (q.rewards.xp) rw.appendChild(el('span', { text: fmt(q.rewards.xp) + ' ' + t('exp') }));
      for (const m in q.rewards.mats || {}) rw.appendChild(el('span', { text: q.rewards.mats[m] + ' ' + G.tn(G.materialById[m]) }));
      card.appendChild(rw);
      card.appendChild(btn(st.claimed ? t('completed') : t('claimReward'), () => { G.game.claimQuest(q.id); UI.show('quests'); }, 'small ok', st.claimed || !done));
      list.appendChild(card);
    });
    if (!qs.length) list.appendChild(el('div', { class: 'pad dim', text: t('noQuests') }));
    c.appendChild(list);
  };

  /* ---------- BESTIÁRIO ---------- */
  SCREENS.bestiary = function (c) {
    const s = G.game.state;
    const total = G.allEnemies.length;
    const found = Object.keys(s.bestiary).length;
    c.appendChild(el('h2', { class: 'title', text: t('bestiary') + ' ' + found + '/' + total }));
    const grid = el('div', { class: 'bes-grid' });
    G.allEnemies.forEach((e) => {
      const seen = s.bestiary[e.id];
      const cell = el('div', { class: 'bcell' + (seen ? '' : ' unknown'), onclick: () => seen ? bestiaryDetail(e) : G.audio.play('error') });
      cell.appendChild(canvasEl(G.art.portrait(e.art, e.kind === 'boss' ? '#ff5f7e' : e.kind === 'elite' ? '#c07bff' : '#6a7080'), 48));
      cell.appendChild(el('div', { class: 'bname', text: seen ? G.tn(e) : '???' }));
      cell.appendChild(el('div', { class: 'bsub', text: seen ? t('defeated') + ': ' + fmt(seen) : t('notDiscovered') }));
      if (e.kind !== 'normal') cell.appendChild(el('div', { class: 'btag ' + e.kind, text: e.kind === 'boss' ? t('boss') : t('elite') }));
      grid.appendChild(cell);
    });
    c.appendChild(grid);
  };

  function bestiaryDetail(e) {
    const s = G.game.state;
    const box = el('div', {});
    box.appendChild(canvasEl(G.art.sprite(e.art, 'idle'), 128));
    box.appendChild(el('p', { text: G.td(e, 'lore') }));
    box.appendChild(el('p', { html: '<b>' + t('category') + ':</b> ' + U.esc(e.cat) + ' · <b>' + t('element') + ':</b> ' + G.balance.elements.icons[e.element] + ' ' + (G.locale === 'en' ? G.balance.elements.namesEn : G.balance.elements.names)[e.element] }));
    box.appendChild(el('p', { html: '<b>' + t('defeated') + ':</b> ' + fmt(s.bestiary[e.id] || 0) }));
    if (e.abilities || e.phases) {
      const abl = (e.phases ? e.phases.reduce((a, p) => a.concat(p.abilities || []), []) : e.abilities) || [];
      box.appendChild(el('h4', { text: t('skills') }));
      abl.forEach((a) => box.appendChild(el('div', { class: 'abil-desc', text: '• ' + G.tn(a) })));
    }
    if (e.drops) box.appendChild(el('p', { html: '<b>' + t('rewards') + ':</b> ' + e.drops.map((d) => U.esc(G.tn(G.materialById[d] || { name: d }))).join(', ') }));
    UI.modal(G.tn(e), box, [{ label: t('close') }], { wide: true });
  }

  /* ---------- COMPANHEIROS ---------- */
  SCREENS.companions = function (c) {
    const s = G.game.state;
    c.appendChild(el('h2', { class: 'title', text: t('companions') }));
    c.appendChild(el('div', { class: 'sub', text: t('activeCompanion') + ': ' + (s.activeCompanion ? G.tn(G.companionById[s.activeCompanion]) : t('noCompanion')) }));
    const grid = el('div', { class: 'comp-grid' });
    G.companions.forEach((cp) => {
      const cs = s.companions[cp.id];
      const un = cs && cs.unlocked;
      const card = el('div', { class: 'ccard' + (un ? '' : ' locked') + (s.activeCompanion === cp.id ? ' active' : '') });
      card.appendChild(canvasEl(G.art.sprite(cp.art, 'idle'), 64));
      card.appendChild(el('div', { class: 'cname', text: un ? (G.locale === 'en' ? cp.evolutionsEn : cp.evolutions)[cs.evo] : '???' }));
      card.appendChild(el('div', { class: 'cdesc', text: un ? G.td(cp, 'desc') : unlockText(cp) }));
      if (un) {
        card.appendChild(el('div', { class: 'clvl', text: t('level') + ' ' + cs.lvl + '/' + G.companionBalance.maxLevel + ' · ' + t('evolution') + ' ' + (cs.evo + 1) }));
        const bonus = [];
        for (const k in cp.bonus) bonus.push((t(k) || k) + ' +' + U.pct(cp.bonus[k] * (1 + cs.evo * G.companionBalance.evolveBonus)));
        card.appendChild(el('div', { class: 'cbonus', text: t('companionBonus') + ': ' + bonus.join(', ') }));
        card.appendChild(btn(t('setActive'), () => { G.game.setCompanion(cp.id); UI.show('companions'); }, 'small ok', s.activeCompanion === cp.id));
        card.appendChild(btn(t('feed') + ' (1 ' + G.tn(G.materialById.pedra_aprimoramento) + ')', () => { G.game.feedCompanion(cp.id, 1); UI.show('companions'); }, 'small'));
        const at = G.companionBalance.evolveAt[cs.evo];
        if (at !== undefined) card.appendChild(btn(t('evolve') + ' (Nv.' + at + ')', () => { G.game.evolveCompanion(cp.id); UI.show('companions'); }, 'small', cs.lvl < at));
      }
      grid.appendChild(card);
    });
    c.appendChild(grid);
  };
  function unlockText(cp) {
    if (cp.unlock.type === 'stage') return t('locked') + ' — ' + t('stage') + ' ' + cp.unlock.value;
    if (cp.unlock.type === 'boss') return t('locked') + ' — ' + t('boss') + ': ' + G.tn(G.enemyById[cp.unlock.value] || {});
    return t('locked');
  }

  /* ---------- OCIOSIDADE ---------- */
  SCREENS.idle = function (c) {
    const s = G.game.state;
    c.appendChild(el('h2', { class: 'title', text: t('idle') }));
    const r = G.idle.rate();
    const bank = G.idle.bankPreview();
    const panel = el('div', { class: 'panel' });
    panel.appendChild(el('div', { text: t('idleRate') + ': ' + fmt(r.gold * 60) + ' ' + t('gold') + ' · ' + fmt(r.xp * 60) + ' ' + t('exp') }));
    panel.appendChild(el('div', { text: t('accumulated') + ' (' + U.time(bank.time) + '): ' + fmt(bank.gold) + ' ' + t('gold') + ', ' + fmt(bank.xp) + ' ' + t('exp') + ', ' + bank.items + ' ' + t('equipment') }));
    const mats = Object.keys(bank.mats).map((m) => G.tn(G.materialById[m]) + ' x' + bank.mats[m]).join(', ');
    if (mats) panel.appendChild(el('div', { text: t('materials') + ': ' + mats }));
    panel.appendChild(btn(t('claimIdle'), () => { const g = G.idle.claimBank(); if (g) UI.toast('+' + fmt(g.gold) + ' ' + t('gold'), 'ok'); UI.show('idle'); }, 'ok'));
    const gm = G.game.globalMods();
    panel.appendChild(el('div', { class: 'dim', text: t('maxOfflineHours') + ': ' + gm.offlineHours + 'h · ' + t('offlineExplain') }));
    c.appendChild(panel);

    c.appendChild(el('h3', { class: 'title', text: t('idleUpgrades') }));
    const list = el('div', { class: 'up-list' });
    G.balance.idle.upgrades.forEach((u) => {
      const lv = G.game.idleLevel(u.id);
      const cost = G.game.idleCost(u);
      const card = el('div', { class: 'upg' });
      card.appendChild(el('div', { class: 'up-name', text: G.tn(u) + ' — ' + lv + '/' + u.max }));
      card.appendChild(el('div', { class: 'up-desc', text: G.td(u, 'desc') }));
      card.appendChild(btn(lv >= u.max ? t('max') : fmt(cost) + ' ' + t('gold'), () => { G.game.buyIdle(u.id); UI.show('idle'); }, 'small ok', lv >= u.max || s.gold < cost));
      list.appendChild(card);
    });
    c.appendChild(list);
  };

  /* ---------- CONQUISTAS ---------- */
  SCREENS.achievements = function (c) {
    const s = G.game.state;
    const done = Object.keys(s.achievements).length;
    c.appendChild(el('h2', { class: 'title', text: t('achievements') + ' ' + done + '/' + G.achievements.length }));
    const list = el('div', { class: 'ach-list' });
    G.achievements.forEach((a) => {
      const got = !!s.achievements[a.id];
      const v = s.stats[a.stat] || 0;
      const card = el('div', { class: 'ach' + (got ? ' got' : '') });
      card.appendChild(el('div', { class: 'ach-ic', text: got ? '🏆' : '🔒' }));
      const info = el('div', {});
      info.appendChild(el('div', { class: 'ach-name', text: G.tn(a) }));
      info.appendChild(el('div', { class: 'ach-desc', text: G.td(a, 'desc') }));
      info.appendChild(el('div', { class: 'q-prog' }, [el('i', { style: { width: U.clamp(v / a.need, 0, 1) * 100 + '%' } })]));
      info.appendChild(el('div', { class: 'ach-prog', text: fmt(Math.min(v, a.need)) + '/' + fmt(a.need) }));
      card.appendChild(info);
      const rw = el('div', { class: 'ach-rw' });
      if (a.rw.gold) rw.appendChild(el('span', { text: fmt(a.rw.gold) + ' ' + t('gold') }));
      if (a.rw.gems) rw.appendChild(el('span', { text: a.rw.gems + ' ' + t('gems') }));
      card.appendChild(rw);
      list.appendChild(card);
    });
    c.appendChild(list);

    // estatísticas
    c.appendChild(el('h3', { class: 'title', text: t('statistics') }));
    const g = el('div', { class: 'stat-grid' });
    g.appendChild(statRow(t('playTime'), U.time(s.playTime)));
    g.appendChild(statRow(t('bestStage'), (s.maxStage + 1)));
    g.appendChild(statRow(t('kills'), fmt(s.stats.kills)));
    g.appendChild(statRow(t('boss'), fmt(s.stats.bossKills)));
    g.appendChild(statRow(t('elite'), fmt(s.stats.eliteKills)));
    g.appendChild(statRow(t('gold'), fmt(s.stats.goldEarned)));
    g.appendChild(statRow(t('craft'), fmt(s.stats.crafts)));
    g.appendChild(statRow(t('upgrade'), fmt(s.stats.upgrades)));
    g.appendChild(statRow(t('prestige'), fmt(s.stats.prestiges)));
    c.appendChild(g);
  };

  /* ---------- PRESTÍGIO ---------- */
  SCREENS.prestige = function (c) {
    const s = G.game.state;
    c.appendChild(el('h2', { class: 'title', text: t('prestige') }));
    c.appendChild(el('div', { class: 'sub', text: t('prestigeDesc') }));
    const panel = el('div', { class: 'panel' });
    const gain = G.game.essenceGain();
    panel.appendChild(el('div', { text: t('essence') + ': ' + fmt(s.essence) + ' · ' + t('prestigeGain') + ': ' + fmt(gain) }));
    panel.appendChild(el('div', { class: 'dim', text: t('prestigeResets') + ': ' + t('resetList') }));
    panel.appendChild(el('div', { class: 'dim', text: t('prestigeKeeps') + ': ' + t('keepList') }));
    if (G.game.canPrestige()) {
      panel.appendChild(btn(t('prestigeDo'), () => {
        UI.modal(t('prestige'), el('p', { text: t('prestigeConfirm', { n: fmt(gain) }) }), [
          { label: t('confirm'), cls: 'ok', fn: () => { const g = G.game.doPrestige(); UI.toast('+' + fmt(g) + ' ' + t('essence'), 'ok'); UI.show('prestige'); } },
          { label: t('cancel') }
        ]);
      }, 'ok'));
    } else {
      panel.appendChild(el('div', { class: 'warn-text', text: t('prestigeLocked', { n: G.balance.prestige.unlockStage }) }));
    }
    c.appendChild(panel);

    const list = el('div', { class: 'up-list' });
    G.balance.prestige.upgrades.forEach((u) => {
      const lv = G.game.prestigeLevel(u.id);
      const cost = G.game.prestigeCost(u);
      const card = el('div', { class: 'upg' });
      card.appendChild(el('div', { class: 'up-name', text: G.tn(u) + ' — ' + lv + '/' + u.max }));
      card.appendChild(el('div', { class: 'up-desc', text: G.td(u, 'desc') }));
      card.appendChild(btn(lv >= u.max ? t('max') : fmt(cost) + ' ' + t('essence'), () => { G.game.buyPrestige(u.id); UI.show('prestige'); }, 'small ok', lv >= u.max || s.essence < cost));
      list.appendChild(card);
    });
    c.appendChild(list);
  };

  /* ---------- AJUSTES ---------- */
  SCREENS.settings = function (c) {
    const st = G.game.settings;
    c.appendChild(el('h2', { class: 'title', text: t('settings') }));
    const panel = el('div', { class: 'panel' });

    // idioma
    const lsel = el('select', {
      onchange: function () {
        st.locale = this.value; G.setLocale(this.value); G.save.saveSettings(st);
        buildTopbar(); buildNav(); UI.show('settings');
      }
    });
    G.locales.forEach((l) => lsel.appendChild(el('option', { value: l.id, text: l.label, selected: st.locale === l.id ? 'selected' : null })));
    panel.appendChild(row(t('language'), lsel));

    // volumes
    ['music', 'sfx', 'ui'].forEach((busId) => {
      const label = busId === 'music' ? t('volumeMusic') : busId === 'sfx' ? t('volumeSfx') : t('volumeUi');
      const sl = el('input', {
        type: 'range', min: '0', max: '1', step: '0.05', value: st[busId],
        oninput: function () { st[busId] = +this.value; G.audio.setVolume(busId, +this.value); G.save.saveSettings(st); }
      });
      panel.appendChild(row(label, sl));
    });

    // gráficos
    const gsel = el('select', {
      onchange: function () { st.graphics = this.value; G.save.saveSettings(st); G.render.resize(); }
    });
    [['low', t('low')], ['medium', t('medium')], ['high', t('high')]].forEach((o) =>
      gsel.appendChild(el('option', { value: o[0], text: o[1], selected: st.graphics === o[0] ? 'selected' : null })));
    panel.appendChild(row(t('graphics'), gsel));

    // toggles
    [['reducedMotion', t('reducedMotion')], ['screenShake', t('screenShake')],
     ['damageNumbers', t('damageNumbers')], ['highContrast', t('highContrast')],
     ['autoSave', t('autoSave')]].forEach((o) => {
      const b = el('button', {
        class: 'tgl' + (st[o[0]] ? ' on' : ''), text: st[o[0]] ? t('yes') : t('no'),
        onclick: function () {
          st[o[0]] = !st[o[0]]; this.classList.toggle('on', st[o[0]]);
          this.textContent = st[o[0]] ? t('yes') : t('no');
          G.save.saveSettings(st); G.main.applySettings();
        }
      });
      panel.appendChild(row(o[1], b));
    });

    // tamanho do texto
    const tsel = el('input', {
      type: 'range', min: '0.85', max: '1.4', step: '0.05', value: st.textScale,
      oninput: function () { st.textScale = +this.value; G.main.applySettings(); G.save.saveSettings(st); }
    });
    panel.appendChild(row(t('textScale'), tsel));

    // horas offline
    const osel = el('input', {
      type: 'range', min: '1', max: '24', step: '1', value: st.maxOfflineHours,
      oninput: function () { st.maxOfflineHours = +this.value; G.save.saveSettings(st); this.nextSibling && (this.nextSibling.textContent = this.value + 'h'); }
    });
    panel.appendChild(row(t('maxOfflineHours'), osel));

    c.appendChild(panel);

    // save
    const sp = el('div', { class: 'panel' });
    const status = el('div', { class: 'save-status' });
    sp.appendChild(status);
    refreshSaveStatus(status);
    sp.appendChild(btn(t('saveNow'), () => {
      const ok = G.game.saveNow();
      if (ok) UI.toast(t('saved'), 'ok');
      refreshSaveStatus(status);
    }, 'small'));
    sp.appendChild(btn(t('exportSave'), () => {
      const str = G.save.exportString(G.game.serialize());
      const ta = el('textarea', { class: 'save-area', readonly: 'readonly' });
      ta.value = str;
      const box = el('div', {}, [el('p', { text: t('exportSave') }), ta]);
      UI.modal(t('exportSave'), box, [
        { label: t('copySave'), cls: 'ok', fn: () => { ta.select(); try { document.execCommand('copy'); UI.toast(t('saveExported'), 'ok'); } catch (e) { UI.toast(t('saveInvalid'), 'warn'); } return false; } },
        { label: t('close') }
      ], { wide: true });
    }, 'small'));
    sp.appendChild(btn(t('importSave'), () => {
      const ta = el('textarea', { class: 'save-area', placeholder: t('pasteSave') });
      UI.modal(t('importSave'), el('div', {}, [ta]), [
        {
          label: t('confirm'), cls: 'ok', fn: () => {
            const data = G.save.importString(ta.value);
            if (!data) { UI.toast(t('saveInvalid'), 'warn'); return false; }
            G.game.init(data); G.save.write(G.game.serialize());
            UI.toast(t('saveImported'), 'ok');
            G.render.clear(); G.game.startBattle(G.game.state.stage); UI.show('battle');
          }
        },
        { label: t('cancel') }
      ], { wide: true });
    }, 'small'));
    sp.appendChild(btn(t('deleteSave'), () => {
      UI.modal(t('deleteSave'), el('p', { text: t('newGameWarn') }), [
        { label: t('confirm'), cls: 'warn', fn: () => { G.save.wipe(); location.reload(); } },
        { label: t('cancel') }
      ]);
    }, 'small warn'));
    c.appendChild(sp);

    // controles e créditos
    const cp = el('div', { class: 'panel' });
    cp.appendChild(el('h3', { text: t('controls') }));
    cp.appendChild(el('div', {
      class: 'dim', html: [
        'Espaço — ' + t('ultimate'), '1-4 — ' + t('ultimate') + ' (herói)', 'Esc — ' + t('pause'),
        'M — ' + (G.locale === 'en' ? 'mute' : 'mudo'), 'F — ' + t('fullscreen'), 'Tab — ' + t('navParty'),
        'I — ' + t('inventory'), 'Q — ' + t('quests'), 'B — ' + t('bestiary')
      ].join('<br>')
    }));
    cp.appendChild(el('h3', { text: t('credits') }));
    cp.appendChild(el('div', { class: 'dim', text: t('creditsText') }));
    c.appendChild(cp);
  };

  function row(label, node) {
    return el('div', { class: 'srow' }, [el('span', { class: 'slabel', text: label }), node]);
  }

  /** Mostra, de forma verificável, se o progresso está mesmo sendo gravado. */
  function refreshSaveStatus(node) {
    U.clear(node);
    if (!G.save.available) {
      node.className = 'save-status bad';
      node.appendChild(el('div', { text: '⚠ ' + t('storageWarning') }));
      return;
    }
    const info = G.save.lastSaveInfo();
    node.className = 'save-status ' + (info ? 'ok' : 'warn');
    if (info) {
      const secs = Math.max(0, Math.round((Date.now() - info.at) / 1000));
      node.appendChild(el('div', { text: '✔ ' + t('saveWorking') }));
      node.appendChild(el('div', { class: 'dim', text: t('lastSave') + ': ' + (secs < 5 ? t('justNow') : U.time(secs) + ' ' + t('ago')) + ' · ' + (info.size / 1024).toFixed(1) + ' KB' }));
    } else {
      node.appendChild(el('div', { text: t('noSaveYet') }));
    }
  }

  /* ==========================================================
   * MODAIS ESPECIAIS
   * ======================================================== */
  UI.showOffline = function (result) {
    const box = el('div', { class: 'offline' });
    box.appendChild(el('p', { text: t('offlineExplain') }));
    box.appendChild(el('p', { html: '<b>' + t('offlineTime') + ':</b> ' + U.time(result.counted) + (result.capped ? ' — ' + t('offlineCapped', { n: result.capHours }) : '') }));
    const g = el('div', { class: 'stat-grid' });
    g.appendChild(statRow(t('gold'), '+' + fmt(result.gold)));
    g.appendChild(statRow(t('exp'), '+' + fmt(result.xp)));
    g.appendChild(statRow(t('equipment'), '+' + result.itemCount));
    for (const m in result.mats) g.appendChild(statRow(G.tn(G.materialById[m]), '+' + result.mats[m]));
    box.appendChild(g);
    UI.modal(t('welcomeBack'), box, [{ label: t('claim'), cls: 'ok', fn: () => { G.idle.claimOffline(result); updateTopbar(); } }], { wide: true });
  };

  UI.showDaily = function () {
    const s = G.game.state;
    const box = el('div', { class: 'daily' });
    const grid = el('div', { class: 'daily-grid' });
    G.balance.daily.forEach((d, i) => {
      const claimed = s.daily.streak > i && !G.game.canClaimDaily();
      const cell = el('div', { class: 'dcell' + (claimed ? ' got' : '') + (s.daily.streak === i && G.game.canClaimDaily() ? ' next' : '') });
      cell.appendChild(el('div', { class: 'dday', text: t('day') + ' ' + (i + 1) }));
      if (d.gold) cell.appendChild(el('div', { text: fmt(d.gold) + ' ' + t('gold') }));
      if (d.gems) cell.appendChild(el('div', { text: d.gems + ' ' + t('gems') }));
      if (d.mats) for (const m in d.mats) cell.appendChild(el('div', { text: d.mats[m] + ' ' + G.tn(G.materialById[m]) }));
      grid.appendChild(cell);
    });
    box.appendChild(grid);
    const can = G.game.canClaimDaily();
    UI.modal(t('dailyReward'), box, [
      { label: can ? t('claim') : t('dailyClaimed'), cls: 'ok', fn: () => { if (can) { G.game.claimDaily(); updateTopbar(); } } }
    ]);
  };

  /* ---------- MENU PRINCIPAL ---------- */
  UI.showMenu = function (onStart) {
    const overlay = el('div', { class: 'menu-overlay' });
    const logoC = G.art.logo(360, 140);
    const lg = canvasEl(logoC, 360);
    lg.style.height = 'auto';
    overlay.appendChild(lg);
    overlay.appendChild(el('h1', { class: 'menu-title', text: t('gameTitle') }));
    overlay.appendChild(el('h2', { class: 'menu-sub', text: t('gameSub') }));
    const bts = el('div', { class: 'menu-btns' });
    const has = G.save.hasSave();
    if (has) bts.appendChild(btn(t('continue'), () => { overlay.remove(); onStart(false); }, 'big ok'));
    bts.appendChild(btn(t('newGame'), () => {
      if (has) {
        UI.modal(t('newGame'), el('p', { text: t('newGameWarn') }), [
          { label: t('confirm'), cls: 'warn', fn: () => { overlay.remove(); onStart(true); } },
          { label: t('cancel') }
        ]);
      } else { overlay.remove(); onStart(true); }
    }, 'big'));
    bts.appendChild(btn(t('settings'), () => { overlay.remove(); onStart(false); setTimeout(() => UI.show('settings'), 60); }, 'big'));
    bts.appendChild(btn(t('credits'), () => {
      UI.modal(t('credits'), el('p', { text: t('creditsText') }), [{ label: t('close') }]);
    }, 'big'));
    overlay.appendChild(bts);
    // Sem aviso de orientação aqui: a dica aparece uma vez, em popup fechável.
    root.appendChild(overlay);
  };

  UI.canvasEl = canvasEl;
  UI.iconEl = iconEl;
})();
