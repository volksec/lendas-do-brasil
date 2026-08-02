/* =============================================================
 * game.js — estado do jogo, progressão, itens, missões, prestígio.
 * Fala com combat.js (batalhas), save.js (persistência) e emite
 * eventos que a UI escuta. Não desenha nada.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const U = G.util;
  const Game = (G.game = {});
  const B = G.balance;

  Game.events = U.emitter();
  Game.state = null;
  Game.battle = null;
  Game.settings = null;
  Game.session = { lastResult: null, resultTimer: 0, pendingStage: null, offline: null };

  const PCT_STATS = { crit: 1, dodge: 1, acc: 1, critDmg: 1 };
  const STAT_KEYS = ['hp', 'atk', 'def', 'mag', 'res', 'spd', 'crit', 'critDmg', 'acc', 'dodge', 'lifesteal', 'healPow', 'cdr', 'elemRes'];

  /* ==========================================================
   * NOVO JOGO
   * ======================================================== */
  Game.newState = function () {
    const s = {
      version: G.save.VERSION,
      created: Date.now(), lastSeen: Date.now(), playTime: 0,
      gold: 300, gems: 0, essence: 0, tokens: 0,
      mats: { fibra_verde: 6, pedra_aprimoramento: 3 },
      potions: {}, fragments: {},
      stage: 0, maxStage: 0,
      heroes: {}, party: [],
      inventory: [],
      companions: {}, activeCompanion: null,
      quests: {}, achievements: {}, bestiary: {}, secrets: {},
      stats: {
        kills: 0, bossKills: 0, eliteKills: 0, clears: 0, crafts: 0, upgrades: 0,
        dismantles: 0, legendaries: 0, mythicals: 0, ultimates: 0, prestiges: 0,
        offlineClaims: 0, goldEarned: 0, maxStage: 0, bestiary: 0, secrets: 0,
        recruit: 0, companion: 0, dailyGold: 0, weeklyGold: 0
      },
      idleUpgrades: {}, prestigeUpgrades: {},
      daily: { lastClaim: 0, streak: 0 },
      dailyResetAt: nextMidnight(), weeklyResetAt: nextWeek(),
      pity: { rare: 0, epic: 0, legendary: 0 },
      idleBank: { gold: 0, xp: 0, mats: {}, items: 0, time: 0 },
      boosts: { gold: 0, xp: 0, atkStages: 0 },
      seenStory: {}, chapter: 0
    };
    // heróis iniciais: os dois primeiros já vêm recrutados
    G.heroes.forEach((h, i) => {
      s.heroes[h.id] = {
        unlocked: i < 2, lvl: 1, xp: 0, stars: 1, ascend: 0, bond: 0,
        skills: {}, equip: {}
      };
      h.abilities.forEach((a) => { if (a.type !== 'passive') s.heroes[h.id].skills[a.id] = 1; });
    });
    s.party = G.heroes.slice(0, 2).map((h) => h.id);
    // primeiro companheiro
    s.companions.capivara = { unlocked: true, lvl: 1, xp: 0, evo: 0 };
    s.activeCompanion = 'capivara';
    // missões
    G.quests.forEach((q) => { s.quests[q.id] = { prog: 0, claimed: false }; });
    return s;
  };

  function nextMidnight() { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); }
  function nextWeek() { const d = new Date(); d.setHours(24, 0, 0, 0); d.setDate(d.getDate() + (7 - d.getDay())); return d.getTime(); }

  Game.init = function (loaded) {
    Game.settings = G.save.loadSettings();
    G.setLocale(Game.settings.locale);
    Game.state = loaded || Game.newState();
    ensureIntegrity(Game.state);
    Game.events.emit('state');
  };

  /** Preenche campos que possam faltar em saves antigos. */
  function ensureIntegrity(s) {
    G.heroes.forEach((h) => {
      if (!s.heroes[h.id]) s.heroes[h.id] = { unlocked: false, lvl: 1, xp: 0, stars: 1, ascend: 0, bond: 0, skills: {}, equip: {} };
      const hs = s.heroes[h.id];
      hs.skills = hs.skills || {}; hs.equip = hs.equip || {};
      h.abilities.forEach((a) => { if (a.type !== 'passive' && !hs.skills[a.id]) hs.skills[a.id] = 1; });
    });
    G.quests.forEach((q) => { if (!s.quests[q.id]) s.quests[q.id] = { prog: 0, claimed: false }; });
    s.party = (s.party || []).filter((id) => s.heroes[id] && s.heroes[id].unlocked).slice(0, 4);
    if (!s.party.length) {
      const first = G.heroes.find((h) => s.heroes[h.id].unlocked);
      if (first) s.party = [first.id];
    }
    s.boosts = s.boosts || { gold: 0, xp: 0, atkStages: 0 };
    s.idleBank = s.idleBank || { gold: 0, xp: 0, mats: {}, items: 0, time: 0 };
    s.pity = s.pity || { rare: 0, epic: 0, legendary: 0 };
    s.daily = s.daily || { lastClaim: 0, streak: 0 };
    if (!s.dailyResetAt) s.dailyResetAt = nextMidnight();
    if (!s.weeklyResetAt) s.weeklyResetAt = nextWeek();
    s.seenStory = s.seenStory || {};
  }

  /* ==========================================================
   * MELHORIAS GLOBAIS (idle, prestígio, companheiro)
   * ======================================================== */
  Game.idleLevel = (id) => (Game.state.idleUpgrades[id] || 0);
  Game.prestigeLevel = (id) => (Game.state.prestigeUpgrades[id] || 0);

  Game.globalMods = function () {
    const s = Game.state;
    const m = { goldMult: 1, xpMult: 1, matMult: 1, dropMult: 1, battleSpeed: 1, offlineHours: B.idle.maxOfflineHours, offlineEff: B.idle.offlineEfficiency, atk: 0, hp: 0, crit: 0, spd: 0, essence: 0, startStage: 0 };
    // ociosidade
    B.idle.upgrades.forEach((u) => {
      const lv = Game.idleLevel(u.id);
      if (!lv) return;
      if (u.stat === 'goldMult') m.goldMult += u.per * lv;
      else if (u.stat === 'xpMult') m.xpMult += u.per * lv;
      else if (u.stat === 'matMult') m.matMult += u.per * lv;
      else if (u.stat === 'dropMult') m.dropMult += u.per * lv;
      else if (u.stat === 'battleSpeed') m.battleSpeed += u.per * lv;
      else if (u.stat === 'offlineHours') m.offlineHours += u.per * lv;
      else if (u.stat === 'offlineEff') m.offlineEff += u.per * lv;
    });
    // prestígio
    B.prestige.upgrades.forEach((u) => {
      const lv = Game.prestigeLevel(u.id);
      if (!lv) return;
      switch (u.id) {
        case 'pr_atk': m.atk += u.per * lv; break;
        case 'pr_hp': m.hp += u.per * lv; break;
        case 'pr_gold': m.goldMult += u.per * lv; break;
        case 'pr_xp': m.xpMult += u.per * lv; break;
        case 'pr_start': m.startStage += u.per * lv; break;
        case 'pr_drop': m.dropMult += u.per * lv; break;
        case 'pr_crit': m.crit += u.per * lv; break;
        case 'pr_speed': m.spd += u.per * lv; break;
        case 'pr_idle': m.offlineHours += u.per * lv; break;
        case 'pr_ess': m.essence += u.per * lv; break;
      }
    });
    // companheiro ativo
    const comp = Game.activeCompanionBonus();
    for (const k in comp) {
      if (k === 'goldMult') m.goldMult += comp[k];
      else if (m[k] !== undefined) m[k] += comp[k];
    }
    // poções temporárias
    if (s.boosts.gold > Date.now()) m.goldMult += 0.6;
    if (s.boosts.xp > Date.now()) m.xpMult += 0.6;
    m.offlineHours = Math.min(48, Math.round(m.offlineHours));
    return m;
  };

  Game.activeCompanionBonus = function () {
    const s = Game.state;
    const id = s.activeCompanion;
    if (!id || !s.companions[id] || !s.companions[id].unlocked) return {};
    const def = G.companionById[id];
    const cs = s.companions[id];
    const evoMult = 1 + cs.evo * G.companionBalance.evolveBonus;
    const out = {};
    for (const k in def.bonus) out[k] = def.bonus[k] * evoMult;
    for (const k in def.perLevel) out[k] = (out[k] || 0) + def.perLevel[k] * (cs.lvl - 1) * evoMult;
    return out;
  };

  /* ==========================================================
   * ITENS
   * ======================================================== */
  Game.rollRarity = function (stageIdx, minRarity) {
    const w = Object.assign({}, B.loot.weights);
    const shift = 1 + stageIdx * B.loot.depthBonus;
    w.rare *= shift; w.epic *= shift * shift;
    w.legendary *= Math.pow(shift, 2.6); w.mythical *= Math.pow(shift, 3.2);
    const p = Game.state.pity;
    if (p.legendary >= B.loot.pity.legendary) return 'legendary';
    if (p.epic >= B.loot.pity.epic) return 'epic';
    if (p.rare >= B.loot.pity.rare) return 'rare';
    const minIdx = minRarity ? B.rarityById[minRarity].index : 0;
    const list = B.rarities.filter((r) => r.index >= minIdx).map((r) => ({ id: r.id, w: w[r.id] }));
    return U.weighted(list).id;
  };

  Game.makeItem = function (opts) {
    opts = opts || {};
    const stageIdx = opts.stage !== undefined ? opts.stage : Game.state.maxStage;
    let base;
    if (opts.baseId) base = G.equipById[opts.baseId];
    else {
      let pool = G.equipment;
      if (opts.set) pool = pool.filter((e) => e.set === opts.set);
      else {
        // conjuntos disponíveis crescem com o progresso
        const maxTier = U.clamp(Math.floor(stageIdx / 14), 0, 7);
        pool = pool.filter((e) => e.tier <= maxTier);
      }
      if (opts.slot) pool = pool.filter((e) => e.slot === opts.slot);
      base = U.pick(pool.length ? pool : G.equipment);
    }
    const rarity = opts.rarity || Game.rollRarity(stageIdx, opts.minRarity);
    const ilvl = Math.max(1, opts.ilvl || Math.floor(3 + stageIdx * 1.15));
    const item = {
      uid: U.uid('it'), base: base.id, rarity: rarity, ilvl: ilvl,
      up: 0, locked: false, affixes: []
    };
    const n = B.loot.affixCount[rarity];
    const pool = U.shuffle(G.affixes);
    for (let i = 0; i < n && i < pool.length; i++) {
      const a = pool[i];
      item.affixes.push({ id: a.id, roll: 0.75 + Math.random() * 0.5 });
    }
    // contadores de pity
    const p = Game.state.pity;
    const idx = B.rarityById[rarity].index;
    p.rare = idx >= 2 ? 0 : p.rare + 1;
    p.epic = idx >= 3 ? 0 : p.epic + 1;
    p.legendary = idx >= 4 ? 0 : p.legendary + 1;
    if (rarity === 'legendary') Game.state.stats.legendaries++;
    if (rarity === 'mythical') Game.state.stats.mythicals++;
    return item;
  };

  Game.itemBase = (item) => G.equipById[item.base];

  Game.itemStats = function (item) {
    const base = G.equipById[item.base];
    if (!base) return {};
    const rar = B.loot.rarityMult[item.rarity] || 1;
    const upMult = 1 + item.up * B.loot.upgradeGain;
    const lvl = item.ilvl;
    const out = {};
    for (const k in base.base) {
      let v = base.base[k] * lvl * rar * upMult;
      if (PCT_STATS[k]) v /= 100;
      out[k] = (out[k] || 0) + v;
    }
    for (const af of item.affixes) {
      const d = G.affixes.find((a) => a.id === af.id);
      if (!d) continue;
      let v = d.v * lvl * af.roll * rar;
      if (d.pctStat) v /= 100;
      out[d.stat] = (out[d.stat] || 0) + v;
    }
    return out;
  };

  Game.itemPower = function (item) {
    const st = Game.itemStats(item);
    return Math.round((st.hp || 0) * 0.12 + (st.atk || 0) * 2.2 + (st.mag || 0) * 2.2 + (st.def || 0) * 1.6 +
      (st.res || 0) * 1.6 + (st.crit || 0) * 260 + (st.critDmg || 0) * 120 + (st.spd || 0) * 900 +
      (st.dodge || 0) * 200 + (st.lifesteal || 0) * 400 + (st.healPow || 0) * 200 + (st.cdr || 0) * 500);
  };

  Game.itemName = function (item) {
    const base = G.equipById[item.base];
    return base ? G.tn(base) : '???';
  };

  Game.sellValue = function (item) {
    return Math.round(B.loot.sellValue[item.rarity] * (1 + item.ilvl * 0.06) * (1 + item.up * 0.2));
  };

  Game.upgradeCost = (item) => B.loot.upgradeCost(item.up, item.rarity);

  Game.addItem = function (item) {
    const s = Game.state;
    if (s.inventory.length >= B.loot.maxInventory) {
      // vende automaticamente o pior item comum não travado, se houver
      const junk = s.inventory.filter((i) => !i.locked && !isEquipped(i) && B.rarityById[i.rarity].index <= 1)
        .sort((a, b) => Game.itemPower(a) - Game.itemPower(b))[0];
      if (junk) { s.gold += Game.sellValue(junk); removeItem(junk.uid); }
      else { Game.events.emit('toast', { text: G.t('inventoryFull'), kind: 'warn' }); return false; }
    }
    s.inventory.push(item);
    Game.events.emit('inventory');
    return true;
  };

  function isEquipped(item) {
    const s = Game.state;
    for (const hid in s.heroes) {
      const eq = s.heroes[hid].equip;
      for (const sl in eq) if (eq[sl] === item.uid) return hid;
    }
    return null;
  }
  Game.isEquipped = isEquipped;

  function removeItem(uid) {
    const s = Game.state;
    const i = s.inventory.findIndex((x) => x.uid === uid);
    if (i >= 0) s.inventory.splice(i, 1);
  }
  Game.getItem = (uid) => Game.state.inventory.find((x) => x.uid === uid);

  Game.equipItem = function (heroId, uid) {
    const s = Game.state, item = Game.getItem(uid);
    if (!item || !s.heroes[heroId]) return false;
    const base = G.equipById[item.base];
    const prevOwner = isEquipped(item);
    if (prevOwner) s.heroes[prevOwner].equip[base.slot] = null;
    s.heroes[heroId].equip[base.slot] = uid;
    G.audio.play('click');
    Game.events.emit('heroes'); Game.events.emit('inventory');
    return true;
  };

  Game.unequipItem = function (heroId, slot) {
    const s = Game.state;
    if (!s.heroes[heroId]) return;
    s.heroes[heroId].equip[slot] = null;
    Game.events.emit('heroes'); Game.events.emit('inventory');
  };

  Game.sellItem = function (uid) {
    const item = Game.getItem(uid);
    if (!item) return false;
    if (item.locked) { Game.events.emit('toast', { text: G.t('itemLockedWarn'), kind: 'warn' }); return false; }
    const owner = isEquipped(item);
    if (owner) Game.unequipItem(owner, G.equipById[item.base].slot);
    Game.state.gold += Game.sellValue(item);
    removeItem(uid);
    G.audio.play('coin');
    Game.events.emit('inventory'); Game.events.emit('resources');
    return true;
  };

  Game.dismantleItem = function (uid) {
    const item = Game.getItem(uid);
    if (!item) return false;
    if (item.locked) { Game.events.emit('toast', { text: G.t('itemLockedWarn'), kind: 'warn' }); return false; }
    const owner = isEquipped(item);
    if (owner) Game.unequipItem(owner, G.equipById[item.base].slot);
    const yield_ = G.dismantleYield[item.rarity] || {};
    const mult = 1 + Math.floor(item.ilvl / 25);
    for (const m in yield_) if (yield_[m] > 0) Game.addMat(m, yield_[m] * mult);
    removeItem(uid);
    Game.state.stats.dismantles++;
    trackQuest('dismantle', null, 1);
    G.audio.play('craft');
    Game.events.emit('inventory'); Game.events.emit('resources');
    return true;
  };

  Game.upgradeItem = function (uid) {
    const s = Game.state, item = Game.getItem(uid);
    if (!item) return false;
    if (item.up >= B.loot.upgradeMaxLevel) return false;
    const cost = Game.upgradeCost(item);
    const stones = Math.max(1, Math.floor(1 + item.up / 3));
    if (s.gold < cost) { Game.events.emit('toast', { text: G.t('missingMats'), kind: 'warn' }); G.audio.play('error'); return false; }
    if ((s.mats.pedra_aprimoramento || 0) < stones) { Game.events.emit('toast', { text: G.t('missingMats'), kind: 'warn' }); G.audio.play('error'); return false; }
    s.gold -= cost;
    s.mats.pedra_aprimoramento -= stones;
    item.up++;
    s.stats.upgrades++;
    trackQuest('upgrade', null, 1);
    trackQuest('craftOrUpgrade', null, 1);
    G.audio.play('craft');
    Game.events.emit('inventory'); Game.events.emit('resources');
    return true;
  };

  Game.toggleLock = function (uid) {
    const item = Game.getItem(uid);
    if (!item) return;
    item.locked = !item.locked;
    Game.events.emit('inventory');
  };

  Game.bulkAction = function (action) {
    const s = Game.state;
    const list = s.inventory.filter((i) => !i.locked && !isEquipped(i) && B.rarityById[i.rarity].index <= 1);
    let n = 0;
    list.forEach((i) => { if (action === 'sell' ? Game.sellItem(i.uid) : Game.dismantleItem(i.uid)) n++; });
    Game.events.emit('toast', { text: n + ' ' + (action === 'sell' ? G.t('sell') : G.t('dismantle')), kind: 'ok' });
  };

  Game.addMat = function (id, qty) {
    const s = Game.state;
    s.mats[id] = (s.mats[id] || 0) + qty;
    trackQuest('mat', id, qty);
  };

  /* ==========================================================
   * HERÓIS — atributos calculados
   * ======================================================== */
  Game.heroStats = function (heroId) {
    const s = Game.state;
    const def = G.heroById[heroId];
    const hs = s.heroes[heroId];
    if (!def || !hs) return null;
    const lvl = hs.lvl;
    const starMult = B.hero.starMult[U.clamp(hs.stars - 1, 0, 5)];
    const ascMult = 1 + hs.ascend * B.hero.ascendMult;
    const bondLvl = Game.bondLevel(heroId);
    const bondMult = 1 + bondLvl * B.hero.bondStatBonus;
    const gm = Game.globalMods();

    const st = {};
    STAT_KEYS.forEach((k) => { st[k] = def.base[k] !== undefined ? def.base[k] : 0; });
    // crescimento por nível
    for (const k in def.growth) st[k] = (st[k] || 0) + def.growth[k] * (lvl - 1);
    // percentuais -> frações
    st.crit /= 100; st.dodge /= 100; st.acc /= 100; st.critDmg /= 100;
    st.elemRes = st.elemRes || 0;

    // multiplicadores de progressão
    ['hp', 'atk', 'def', 'mag', 'res'].forEach((k) => { st[k] *= starMult * ascMult * bondMult; });

    // equipamento
    const setCount = {};
    for (const slot in hs.equip) {
      const uid = hs.equip[slot];
      if (!uid) continue;
      const item = Game.getItem(uid);
      if (!item) { hs.equip[slot] = null; continue; }
      const base = G.equipById[item.base];
      setCount[base.set] = (setCount[base.set] || 0) + 1;
      const is = Game.itemStats(item);
      for (const k in is) st[k] = (st[k] || 0) + is[k];
    }
    // bônus de conjunto
    const setSpecials = [];
    for (const sid in setCount) {
      const set = G.setById[sid];
      if (!set) continue;
      set.bonuses.forEach((bo) => {
        if (setCount[sid] >= bo.pieces) {
          for (const k in bo.mods) st[k] = (st[k] || 0) * (1 + bo.mods[k]);
          if (bo.special) setSpecials.push(bo.special);
        }
      });
    }
    // passiva do herói (mods estáticos)
    const passive = def.abilities.find((a) => a.type === 'passive');
    if (passive && passive.mods) for (const k in passive.mods) st[k] = (st[k] || 0) * (1 + passive.mods[k]);

    // bônus globais (prestígio + companheiro + poções)
    st.hp *= (1 + gm.hp);
    st.atk *= (1 + gm.atk);
    st.mag *= (1 + gm.atk);
    st.crit += gm.crit;
    st.spd *= (1 + gm.spd);
    if (s.boosts.atkStages > 0) { st.atk *= 1.25; st.mag *= 1.25; }
    const comp = Game.activeCompanionBonus();
    ['hp', 'atk', 'def', 'res', 'spd', 'mag'].forEach((k) => { if (comp[k]) st[k] *= (1 + comp[k]); });
    if (comp.crit) st.crit += comp.crit;
    if (comp.dodge) st.dodge += comp.dodge;
    if (comp.healPow) st.healPow += comp.healPow;
    if (comp.cdr) st.cdr += comp.cdr;
    if (comp.critDmg) st.critDmg += comp.critDmg;

    STAT_KEYS.forEach((k) => { st[k] = st[k] || 0; });
    st.hp = Math.round(st.hp);
    st.setSpecials = setSpecials;
    return st;
  };

  Game.heroPower = function (heroId) {
    const st = Game.heroStats(heroId);
    if (!st) return 0;
    return Math.round(st.hp * 0.12 + st.atk * 2.4 + st.mag * 2.4 + st.def * 1.8 + st.res * 1.8 +
      st.crit * 100 * 2.6 + st.critDmg * 100 * 1.2 + st.spd * 900 + st.dodge * 100 * 2 +
      st.lifesteal * 400 + st.healPow * 200 + st.cdr * 500);
  };

  Game.partyPower = function () {
    return Game.state.party.reduce((a, id) => a + Game.heroPower(id), 0);
  };

  Game.bondLevel = function (heroId) {
    const bond = Game.state.heroes[heroId].bond || 0;
    let lv = 0;
    for (let i = 1; i < B.hero.bondLevels.length; i++) if (bond >= B.hero.bondLevels[i]) lv = i;
    return lv;
  };

  Game.addHeroXp = function (heroId, xp) {
    const s = Game.state, hs = s.heroes[heroId];
    if (!hs || !hs.unlocked) return;
    hs.xp += xp;
    let leveled = false;
    while (hs.lvl < B.hero.maxLevel) {
      const need = B.hero.xpCurve(hs.lvl);
      if (hs.xp < need) break;
      hs.xp -= need; hs.lvl++; leveled = true;
      trackQuest('level', heroId, hs.lvl, true);
    }
    if (leveled) { G.audio.play('levelup'); Game.events.emit('heroes'); }
  };

  Game.upgradeSkill = function (heroId, abilityId) {
    const s = Game.state, hs = s.heroes[heroId];
    const lvl = hs.skills[abilityId] || 1;
    if (lvl >= B.hero.skillMaxLevel) return false;
    const cost = Math.floor(B.hero.skillCostBase * Math.pow(B.hero.skillCostGrowth, lvl - 1) * (1 + hs.lvl * 0.05));
    if (s.gold < cost) { G.audio.play('error'); return false; }
    s.gold -= cost; hs.skills[abilityId] = lvl + 1;
    G.audio.play('levelup');
    Game.events.emit('heroes'); Game.events.emit('resources');
    return true;
  };

  Game.skillCost = function (heroId, abilityId) {
    const hs = Game.state.heroes[heroId];
    const lvl = hs.skills[abilityId] || 1;
    return Math.floor(B.hero.skillCostBase * Math.pow(B.hero.skillCostGrowth, lvl - 1) * (1 + hs.lvl * 0.05));
  };

  Game.ascendHero = function (heroId) {
    const s = Game.state, hs = s.heroes[heroId];
    if (hs.ascend >= B.hero.maxAscend) return false;
    const cost = B.hero.ascendCost(hs.ascend);
    if (s.gold < cost) { G.audio.play('error'); return false; }
    s.gold -= cost; hs.ascend++;
    G.audio.play('levelup');
    Game.events.emit('heroes'); Game.events.emit('resources');
    return true;
  };

  Game.starUpHero = function (heroId) {
    const s = Game.state, hs = s.heroes[heroId];
    if (hs.stars >= 6) return false;
    const need = B.hero.starCost[hs.stars] * 5;
    const have = s.fragments[heroId] || 0;
    if (have < need) { G.audio.play('error'); return false; }
    s.fragments[heroId] = have - need;
    hs.stars++;
    G.audio.play('levelup');
    Game.events.emit('heroes');
    return true;
  };

  Game.recruitHero = function (heroId) {
    const s = Game.state, hs = s.heroes[heroId];
    if (hs.unlocked) return false;
    const idx = G.heroes.findIndex((h) => h.id === heroId);
    const unlockedCount = G.heroes.filter((h) => s.heroes[h.id].unlocked).length;
    const gold = B.recruit.costGold[Math.min(unlockedCount, 7)];
    const gems = B.recruit.costGems[Math.min(unlockedCount, 7)];
    if (s.gold < gold || s.gems < gems) { G.audio.play('error'); Game.events.emit('toast', { text: G.t('missingMats'), kind: 'warn' }); return false; }
    s.gold -= gold; s.gems -= gems;
    hs.unlocked = true;
    s.stats.recruit = (s.stats.recruit || 0) + 1;
    trackQuest('recruit', null, 1);
    if (s.party.length < 4) s.party.push(heroId);
    G.audio.play('levelup');
    Game.events.emit('heroes'); Game.events.emit('resources');
    Game.events.emit('toast', { text: G.t('newHero') + ' ' + G.tn(G.heroById[heroId]), kind: 'ok' });
    return true;
  };

  Game.recruitCost = function () {
    const s = Game.state;
    const n = G.heroes.filter((h) => s.heroes[h.id].unlocked).length;
    return { gold: B.recruit.costGold[Math.min(n, 7)], gems: B.recruit.costGems[Math.min(n, 7)] };
  };

  Game.toggleParty = function (heroId) {
    const s = Game.state;
    const i = s.party.indexOf(heroId);
    if (i >= 0) {
      if (s.party.length <= 1) return false;
      s.party.splice(i, 1);
    } else {
      if (!s.heroes[heroId].unlocked) return false;
      if (s.party.length >= 4) { Game.events.emit('toast', { text: G.t('partyFull'), kind: 'warn' }); return false; }
      s.party.push(heroId);
    }
    G.audio.play('click');
    Game.events.emit('party');
    return true;
  };

  /* ==========================================================
   * BATALHA
   * ======================================================== */
  Game.buildPartyUnits = function () {
    return Game.state.party.map((hid) => {
      const def = G.heroById[hid];
      const hs = Game.state.heroes[hid];
      const st = Game.heroStats(hid);
      return {
        id: hid, heroId: hid, name: G.tn(def), art: def.art, element: def.element,
        stats: st, basic: def.basic, skillLevels: hs.skills,
        abilities: def.abilities.filter((a) => a.type !== 'passive'),
        passive: (def.abilities.find((a) => a.type === 'passive') || {}).id
      };
    });
  };

  Game.enemyStats = function (defn, stageIdx, kind) {
    let scale = B.curve(stageIdx, B.enemy.expAtk);
    let hpScale = B.curve(stageIdx, B.enemy.expHp);
    if (stageIdx >= G.STAGE_COUNT) {
      const over = stageIdx - G.STAGE_COUNT;
      scale *= Math.pow(B.enemy.endlessGrowth, over);
      hpScale *= Math.pow(B.enemy.endlessGrowth, over);
    }
    const km = kind === 'boss' ? B.enemy.bossMult : kind === 'elite' ? B.enemy.eliteMult : { hp: 1, atk: 1, def: 1, mag: 1, res: 1 };
    const mod = defn.mod || {};
    const st = {
      hp: Math.round(B.enemy.base.hp * hpScale * (mod.hp || 1) * (km.hp || 1)),
      atk: B.enemy.base.atk * scale * (mod.atk || 1) * (km.atk || 1),
      def: B.enemy.base.def * scale * 0.35 * (mod.def || 1) * (km.def || 1),
      mag: B.enemy.base.mag * scale * (mod.mag || 1) * (km.mag || 1),
      res: B.enemy.base.res * scale * 0.35 * (mod.res || 1) * (km.res || 1),
      spd: 0.85 * (mod.spd || 1),
      crit: 0.05 + (mod.crit || 0) / 100,
      critDmg: 1.5, acc: 1, dodge: (mod.dodge || 0) / 100,
      lifesteal: mod.lifesteal || 0, healPow: 0, cdr: 0, elemRes: 0
    };
    return st;
  };

  function enemyUnitCfg(defn, stageIdx, kind) {
    const abilities = kind === 'boss' && defn.phases ? defn.phases[0].abilities : (defn.abilities || []);
    return {
      id: defn.id, defId: defn.id, name: G.tn(defn), art: defn.art, element: defn.element,
      kind: kind, stats: Game.enemyStats(defn, stageIdx, kind),
      abilities: abilities, basic: { name: 'Ataque', pow: 1, dmg: kind === 'boss' ? 'phys' : 'phys' },
      phases: kind === 'boss' ? defn.phases : null,
      entrance: G.td(defn, 'entrance')
    };
  }

  Game.startBattle = function (stageIdx) {
    const s = Game.state;
    if (!s.party.length) return;
    const stage = G.getStage(stageIdx);
    const kind = stage.type;
    const range = B.combat.enemyCountByType[kind] || [1, 2];
    const count = U.randInt(range[0], range[1]);
    const enemies = [];
    for (let i = 0; i < count; i++) {
      const eid = stage.enemyPool[i % stage.enemyPool.length];
      const defn = G.enemyById[eid] || G.enemiesNormal[0];
      enemies.push(enemyUnitCfg(defn, stageIdx, kind === 'boss' ? 'boss' : (kind === 'elite' ? 'elite' : 'normal')));
    }
    const battle = G.combat.start({
      party: Game.buildPartyUnits(), enemies: enemies,
      stage: stage, isBoss: kind === 'boss', kind: kind
    });
    battle.autoUltimate = Game.settings.autoUltimate !== false;
    battle.onKill = onUnitKilled;
    battle.onUltimate = () => { s.stats.ultimates++; trackQuest('ultimate', null, 1); };
    battle.onSummon = (sum) => {
      const defn = G.enemyById[sum.id];
      if (!defn) return;
      for (let i = 0; i < sum.count; i++) G.combat.addEnemy(battle, enemyUnitCfg(defn, stageIdx, 'normal'));
    };
    // poção de vida pré-aplicada
    Game.battle = battle;
    Game.session.lastResult = null;
    if (kind === 'boss') G.audio.play('boss');
    Game.events.emit('battleStart', battle);
    return battle;
  };

  function onUnitKilled(unit) {
    if (unit.side !== 'enemy') return;
    const s = Game.state;
    s.stats.kills++;
    if (unit.kind === 'boss') s.stats.bossKills++;
    if (unit.kind === 'elite') s.stats.eliteKills++;
    // bestiário
    if (unit.defId) {
      const first = !s.bestiary[unit.defId];
      s.bestiary[unit.defId] = (s.bestiary[unit.defId] || 0) + 1;
      if (first) {
        s.stats.bestiary = Object.keys(s.bestiary).length;
        trackQuest('bestiary', null, s.stats.bestiary, true);
      }
    }
    trackQuest('kill', null, 1);
    trackQuest('killKind', unit.kind, 1);
    if (unit.kind === 'boss' && unit.defId) trackQuest('boss', unit.defId, 1);
  }

  /* ---- Recompensas ---- */
  Game.stageRewards = function (stageIdx, kind) {
    const gm = Game.globalMods();
    const mult = kind === 'boss' ? B.rewards.bossMult : kind === 'elite' ? B.rewards.eliteMult : 1;
    const endless = stageIdx >= G.STAGE_COUNT ? Math.pow(B.enemy.endlessGrowth, stageIdx - G.STAGE_COUNT) : 1;
    const gold = Math.round(B.rewards.goldBase * B.curve(stageIdx, B.rewards.goldExp) * endless * mult * gm.goldMult);
    const xp = Math.round(B.rewards.xpBase * B.curve(stageIdx, B.rewards.xpExp) * endless * mult * gm.xpMult);
    return { gold: gold, xp: xp };
  };

  Game.grantVictory = function (stageIdx) {
    const s = Game.state;
    const stage = G.getStage(stageIdx);
    const gm = Game.globalMods();
    const rw = Game.stageRewards(stageIdx, stage.type);
    const gained = { gold: rw.gold, xp: rw.xp, mats: {}, items: [], gems: 0, tokens: 0 };

    s.gold += rw.gold;
    s.stats.goldEarned += rw.gold;
    s.stats.dailyGold = (s.stats.dailyGold || 0) + rw.gold;
    s.stats.weeklyGold = (s.stats.weeklyGold || 0) + rw.gold;
    trackQuest('gold', null, rw.gold);
    s.party.forEach((hid) => {
      Game.addHeroXp(hid, rw.xp);
      s.heroes[hid].bond = (s.heroes[hid].bond || 0) + B.hero.bondXpPerStage;
    });

    // materiais
    const region = G.regionById[stage.region];
    const chance = stage.type === 'boss' ? B.rewards.matDropChanceBoss : stage.type === 'elite' ? B.rewards.matDropChanceElite : B.rewards.matDropChance;
    if (Math.random() < chance) {
      const pool = region ? region.materials : ['fibra_verde'];
      const mid = U.pick(pool);
      const qty = Math.max(1, Math.round((1 + Math.floor(stageIdx / 20)) * gm.matMult * (stage.type === 'boss' ? 3 : 1)));
      Game.addMat(mid, qty);
      gained.mats[mid] = qty;
    }
    // drops de chefe
    if (stage.type === 'boss') {
      const bdef = G.enemyById[stage.enemyPool[0]];
      if (bdef && bdef.drops) bdef.drops.forEach((m) => { Game.addMat(m, 1); gained.mats[m] = (gained.mats[m] || 0) + 1; });
      s.tokens += B.rewards.tokenPerBoss; gained.tokens = B.rewards.tokenPerBoss;
      if (stageIdx >= s.maxStage) { s.gems += B.rewards.gemPerBossFirstClear; gained.gems = B.rewards.gemPerBossFirstClear; }
    }
    // equipamento
    const dropChance = (B.loot.dropChance[stage.type] || 0.15) * gm.dropMult;
    if (Math.random() < dropChance) {
      const item = Game.makeItem({ stage: stageIdx });
      if (Game.addItem(item)) { gained.items.push(item); G.audio.play('loot'); }
    }
    // segredo da região
    if (stage.secret && !s.secrets[stage.secret]) {
      s.secrets[stage.secret] = true;
      s.stats.secrets = Object.keys(s.secrets).length;
      trackQuest('secret', null, s.stats.secrets, true);
      s.gems += 10; gained.gems += 10;
      G.audio.play('secret');
      Game.events.emit('toast', { text: G.t('secretFound') + ' ' + (region && region.secret ? region.secret.name : ''), kind: 'ok' });
    }
    // progresso
    s.stats.clears++;
    trackQuest('clear', null, 1);
    if (stageIdx >= s.maxStage) {
      s.maxStage = stageIdx + 1;
      s.stats.maxStage = s.maxStage;
      trackQuest('stage', null, s.maxStage, true);
      Game.checkUnlocks();
    }
    if (s.boosts.atkStages > 0) s.boosts.atkStages--;

    Game.checkAchievements();
    Game.events.emit('resources');
    Game.events.emit('inventory');
    return gained;
  };

  Game.checkUnlocks = function () {
    const s = Game.state;
    G.companions.forEach((c) => {
      if (s.companions[c.id] && s.companions[c.id].unlocked) return;
      let ok = false;
      if (c.unlock.type === 'start') ok = true;
      else if (c.unlock.type === 'stage') ok = s.maxStage >= c.unlock.value;
      else if (c.unlock.type === 'boss') ok = !!s.bestiary[c.unlock.value];
      if (ok) {
        s.companions[c.id] = { unlocked: true, lvl: 1, xp: 0, evo: 0 };
        s.stats.companion = Object.keys(s.companions).length;
        trackQuest('companion', null, s.stats.companion, true);
        Game.events.emit('toast', { text: G.tn(c) + ' — ' + G.t('unlocked'), kind: 'ok' });
      }
    });
    // história por região
    const regionIdx = Math.min(9, Math.floor(s.maxStage / 12));
    if (!s.seenStory[regionIdx] && s.maxStage >= regionIdx * 12) {
      s.seenStory[regionIdx] = true;
      s.chapter = Math.max(s.chapter || 0, regionIdx);
      Game.events.emit('story', G.regions[regionIdx]);
    }
  };

  /* ==========================================================
   * MISSÕES E CONQUISTAS
   * ======================================================== */
  function trackQuest(type, target, value, absolute) {
    const s = Game.state;
    G.quests.forEach((q) => {
      const st = s.quests[q.id];
      if (!st || st.claimed) return;
      if (q.obj.type !== type) return;
      if (q.obj.target && q.obj.target !== target) return;
      st.prog = absolute ? Math.max(st.prog, value) : st.prog + value;
    });
  }
  Game.trackQuest = trackQuest;

  Game.questDone = function (q) {
    const st = Game.state.quests[q.id];
    return st && st.prog >= q.obj.count;
  };

  Game.claimQuest = function (id) {
    const s = Game.state, q = G.questById[id], st = s.quests[id];
    if (!q || !st || st.claimed || st.prog < q.obj.count) return false;
    st.claimed = true;
    const r = q.rewards;
    if (r.gold) s.gold += r.gold;
    if (r.gems) s.gems += r.gems;
    if (r.xp) s.party.forEach((h) => Game.addHeroXp(h, r.xp));
    if (r.mats) for (const m in r.mats) Game.addMat(m, r.mats[m]);
    G.audio.play('coin');
    Game.events.emit('resources'); Game.events.emit('quests');
    return true;
  };

  Game.checkAchievements = function () {
    const s = Game.state;
    G.achievements.forEach((a) => {
      if (s.achievements[a.id]) return;
      const v = s.stats[a.stat] || 0;
      if (v >= a.need) {
        s.achievements[a.id] = true;
        if (a.rw.gold) s.gold += a.rw.gold;
        if (a.rw.gems) s.gems += a.rw.gems;
        if (a.rw.mats) for (const m in a.rw.mats) Game.addMat(m, a.rw.mats[m]);
        G.audio.play('secret');
        Game.events.emit('toast', { text: G.t('achUnlocked') + ' ' + G.tn(a), kind: 'ok' });
      }
    });
  };

  /* ---- Resets diário/semanal ---- */
  Game.checkResets = function () {
    const s = Game.state, now = Date.now();
    if (now >= s.dailyResetAt) {
      G.quests.filter((q) => q.kind === 'daily').forEach((q) => { s.quests[q.id] = { prog: 0, claimed: false }; });
      s.stats.dailyGold = 0;
      s.dailyResetAt = nextMidnight();
      Game.events.emit('quests');
    }
    if (now >= s.weeklyResetAt) {
      G.quests.filter((q) => q.kind === 'weekly').forEach((q) => { s.quests[q.id] = { prog: 0, claimed: false }; });
      s.stats.weeklyGold = 0;
      s.weeklyResetAt = nextWeek();
      Game.events.emit('quests');
    }
  };

  /* ---- Recompensa diária ---- */
  Game.canClaimDaily = function () {
    const d = Game.state.daily;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d.lastClaim < today.getTime();
  };
  Game.claimDaily = function () {
    if (!Game.canClaimDaily()) return false;
    const s = Game.state;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = today.getTime() - 86400000;
    s.daily.streak = s.daily.lastClaim >= yesterday ? (s.daily.streak % 7) + 1 : 1;
    s.daily.lastClaim = Date.now();
    const rw = B.daily[s.daily.streak - 1];
    const mult = 1 + s.maxStage * 0.03;
    if (rw.gold) s.gold += Math.round(rw.gold * mult);
    if (rw.gems) s.gems += rw.gems;
    if (rw.mats) for (const m in rw.mats) Game.addMat(m, rw.mats[m]);
    G.audio.play('coin');
    Game.events.emit('resources');
    return rw;
  };

  /* ==========================================================
   * CRIAÇÃO
   * ======================================================== */
  Game.canCraft = function (recipe) {
    const s = Game.state;
    if (s.gold < (recipe.cost.gold || 0)) return false;
    for (const m in recipe.cost.mats || {}) if ((s.mats[m] || 0) < recipe.cost.mats[m]) return false;
    return true;
  };

  Game.craft = function (recipeId, extra) {
    const s = Game.state, r = G.recipeById[recipeId];
    if (!r || !Game.canCraft(r)) { G.audio.play('error'); Game.events.emit('toast', { text: G.t('missingMats'), kind: 'warn' }); return false; }
    if (r.needsItem && !extra) { Game.events.emit('toast', { text: G.t('selectItem'), kind: 'warn' }); return false; }
    if (r.needsHero && !extra) { Game.events.emit('toast', { text: G.t('selectHero'), kind: 'warn' }); return false; }

    // aplica custo
    s.gold -= (r.cost.gold || 0);
    for (const m in r.cost.mats || {}) s.mats[m] -= r.cost.mats[m];

    const o = r.out;
    if (o.kind === 'mat') Game.addMat(o.id, o.qty);
    else if (o.kind === 'potion') s.potions[o.id] = (s.potions[o.id] || 0) + o.qty;
    else if (o.kind === 'equip') Game.addItem(Game.makeItem({ set: o.set, minRarity: o.minRarity }));
    else if (o.kind === 'equipExact') Game.addItem(Game.makeItem({ baseId: o.id, minRarity: o.minRarity, rarity: o.minRarity }));
    else if (o.kind === 'reroll') {
      const item = Game.getItem(extra);
      if (!item) return false;
      const n = B.loot.affixCount[item.rarity];
      item.affixes = [];
      const pool = U.shuffle(G.affixes);
      for (let i = 0; i < n && i < pool.length; i++) item.affixes.push({ id: pool[i].id, roll: 0.75 + Math.random() * 0.5 });
    } else if (o.kind === 'rarityUp') {
      const item = Game.getItem(extra);
      if (!item) return false;
      const idx = B.rarityById[item.rarity].index;
      if (idx >= 5) { Game.events.emit('toast', { text: G.t('max'), kind: 'warn' }); return false; }
      item.rarity = B.rarities[idx + 1].id;
      const pool = U.shuffle(G.affixes.filter((a) => !item.affixes.some((x) => x.id === a.id)));
      if (pool[0]) item.affixes.push({ id: pool[0].id, roll: 0.75 + Math.random() * 0.5 });
      if (item.rarity === 'legendary') s.stats.legendaries++;
      if (item.rarity === 'mythical') s.stats.mythicals++;
    } else if (o.kind === 'fragment') {
      s.fragments[extra] = (s.fragments[extra] || 0) + o.qty;
    }

    s.stats.crafts++;
    trackQuest('craft', null, 1);
    trackQuest('craftOrUpgrade', null, 1);
    Game.checkAchievements();
    G.audio.play('craft');
    Game.events.emit('resources'); Game.events.emit('inventory');
    Game.events.emit('toast', { text: G.t('crafted'), kind: 'ok' });
    return true;
  };

  Game.usePotion = function (id) {
    const s = Game.state;
    if (!(s.potions[id] > 0)) return false;
    s.potions[id]--;
    const p = G.potions[id];
    if (p.effect === 'healParty' && Game.battle) {
      Game.battle.party.forEach((u) => { if (u.alive) u.hp = Math.min(u.max.hp, u.hp + u.max.hp * p.value); });
    } else if (p.effect === 'buffAtk') s.boosts.atkStages = (s.boosts.atkStages || 0) + p.stages;
    else if (p.effect === 'goldBoost') s.boosts.gold = Date.now() + p.seconds * 1000;
    else if (p.effect === 'xpBoost') s.boosts.xp = Date.now() + p.seconds * 1000;
    G.audio.play('heal');
    Game.events.emit('resources');
    return true;
  };

  /* ==========================================================
   * COMPANHEIROS
   * ======================================================== */
  Game.feedCompanion = function (id, stones) {
    const s = Game.state, cs = s.companions[id];
    if (!cs || !cs.unlocked) return false;
    stones = stones || 1;
    if ((s.mats.pedra_aprimoramento || 0) < stones) { G.audio.play('error'); return false; }
    s.mats.pedra_aprimoramento -= stones;
    cs.xp += G.companionBalance.feedXp * stones;
    while (cs.lvl < G.companionBalance.maxLevel) {
      const need = G.companionBalance.xpPerLevel(cs.lvl);
      if (cs.xp < need) break;
      cs.xp -= need; cs.lvl++;
    }
    G.audio.play('levelup');
    Game.events.emit('companions'); Game.events.emit('resources');
    return true;
  };

  Game.evolveCompanion = function (id) {
    const s = Game.state, cs = s.companions[id];
    if (!cs) return false;
    const at = G.companionBalance.evolveAt[cs.evo];
    if (at === undefined || cs.lvl < at) return false;
    const cost = 20 * (cs.evo + 1);
    if ((s.mats.nucleo_lendario || 0) < (cs.evo + 1)) { G.audio.play('error'); Game.events.emit('toast', { text: G.t('missingMats'), kind: 'warn' }); return false; }
    s.mats.nucleo_lendario -= (cs.evo + 1);
    cs.evo++;
    G.audio.play('secret');
    Game.events.emit('companions');
    return true;
  };

  Game.setCompanion = function (id) {
    const s = Game.state;
    if (id && (!s.companions[id] || !s.companions[id].unlocked)) return false;
    s.activeCompanion = id;
    G.audio.play('click');
    Game.events.emit('companions'); Game.events.emit('heroes');
    return true;
  };

  /* ==========================================================
   * PRESTÍGIO
   * ======================================================== */
  Game.essenceGain = function () {
    const gm = Game.globalMods();
    return Math.floor(B.prestige.essenceFormula(Game.state.maxStage) * (1 + gm.essence));
  };
  Game.canPrestige = function () { return Game.state.maxStage >= B.prestige.unlockStage; };

  Game.doPrestige = function () {
    if (!Game.canPrestige()) return false;
    const s = Game.state;
    const gain = Game.essenceGain();
    s.essence += gain;
    s.stats.prestiges++;
    trackQuest('prestige', null, s.stats.prestiges, true);

    // reseta progressão
    const gm = Game.globalMods();
    s.stage = Math.min(gm.startStage, 100);
    s.maxStage = s.stage;
    s.gold = 300; s.tokens = 0;
    s.mats = {};
    G.heroes.forEach((h) => {
      const hs = s.heroes[h.id];
      hs.lvl = 1; hs.xp = 0; hs.ascend = 0;
      hs.equip = {};
      for (const k in hs.skills) hs.skills[k] = 1;
    });
    // mantém apenas itens travados
    s.inventory = s.inventory.filter((i) => i.locked);
    // missões de história e diárias reiniciam progresso não coletado
    G.quests.forEach((q) => {
      const st = s.quests[q.id];
      if (!st.claimed && (q.obj.type === 'stage' || q.obj.type === 'clear')) st.prog = 0;
    });
    s.boosts = { gold: 0, xp: 0, atkStages: 0 };
    s.idleBank = { gold: 0, xp: 0, mats: {}, items: 0, time: 0 };
    Game.battle = null;
    Game.checkAchievements();
    G.audio.play('secret');
    Game.events.emit('state'); Game.events.emit('resources'); Game.events.emit('heroes');
    return gain;
  };

  Game.prestigeCost = function (up) {
    const lv = Game.prestigeLevel(up.id);
    return Math.floor(up.base * Math.pow(up.growth, lv));
  };
  Game.buyPrestige = function (id) {
    const s = Game.state;
    const up = B.prestige.upgrades.find((u) => u.id === id);
    if (!up) return false;
    const lv = Game.prestigeLevel(id);
    if (lv >= up.max) return false;
    const cost = Game.prestigeCost(up);
    if (s.essence < cost) { G.audio.play('error'); return false; }
    s.essence -= cost;
    s.prestigeUpgrades[id] = lv + 1;
    G.audio.play('levelup');
    Game.events.emit('resources'); Game.events.emit('prestige');
    return true;
  };

  Game.idleCost = function (up) {
    const lv = Game.idleLevel(up.id);
    return Math.floor(up.base * Math.pow(up.growth, lv));
  };
  Game.buyIdle = function (id) {
    const s = Game.state;
    const up = B.idle.upgrades.find((u) => u.id === id);
    if (!up) return false;
    const lv = Game.idleLevel(id);
    if (lv >= up.max) return false;
    const cost = Game.idleCost(up);
    if (s.gold < cost) { G.audio.play('error'); return false; }
    s.gold -= cost;
    s.idleUpgrades[id] = lv + 1;
    G.audio.play('levelup');
    Game.events.emit('resources'); Game.events.emit('idle');
    return true;
  };

  /* ==========================================================
   * LOOP
   * ======================================================== */
  Game.update = function (dt) {
    const s = Game.state;
    if (!s) return;
    s.playTime += dt;
    Game.checkResets();

    if (Game.battle && !Game.battle.over) {
      const speed = Game.settings.battleSpeed * Game.globalMods().battleSpeed;
      G.combat.update(Game.battle, dt * speed);
      if (Game.battle.over) handleBattleEnd();
    } else if (Game.session.resultTimer > 0) {
      Game.session.resultTimer -= dt;
      if (Game.session.resultTimer <= 0) advanceAfterBattle();
    }
    G.idle.update(dt);
  };

  function handleBattleEnd() {
    const b = Game.battle;
    const s = Game.state;
    if (b.result === 'victory') {
      const gained = Game.grantVictory(s.stage);
      Game.session.lastResult = { result: 'victory', gained: gained, stage: s.stage };
    } else {
      Game.session.lastResult = { result: 'defeat', stage: s.stage };
    }
    Game.session.resultTimer = 1.6;
    Game.events.emit('battleEnd', Game.session.lastResult);
  }

  function advanceAfterBattle() {
    const s = Game.state;
    const r = Game.session.lastResult;
    if (!r) return;
    if (r.result === 'victory') {
      Game.session.losses = 0;
      if (!Game.settings.repeatStage && Game.settings.autoProgress) s.stage = Math.min(s.maxStage, s.stage + 1);
      Game.startBattle(s.stage);
    } else {
      // Recuo automático: sem isso o grupo ficaria preso para sempre num
      // estágio que não consegue vencer, já que derrotas não dão recompensa.
      Game.session.losses = (Game.session.losses || 0) + 1;
      if (Game.session.losses >= 3 && s.stage > 0 && !Game.settings.repeatStage) {
        Game.session.losses = 0;
        s.stage = Math.max(0, s.stage - 1);
        Game.events.emit('toast', { text: G.t('autoRetreat', { n: s.stage + 1 }), kind: 'warn' });
      }
      if (Game.settings.autoProgress) Game.startBattle(s.stage);
      else Game.battle = null;
    }
    Game.events.emit('battleReset');
  }

  Game.setStage = function (idx) {
    const s = Game.state;
    s.stage = U.clamp(idx, 0, Math.max(0, s.maxStage));
    Game.startBattle(s.stage);
    Game.events.emit('stage');
  };

  Game.restartBattle = function () { Game.startBattle(Game.state.stage); };

  /* ==========================================================
   * SALVAR
   * ======================================================== */
  Game.serialize = function () {
    const s = Game.state;
    s.lastSeen = Date.now();
    return s;
  };
  Game.saveNow = function () {
    if (!Game.state) return false;
    const ok = G.save.write(Game.serialize());
    G.save.saveSettings(Game.settings);
    if (ok) Game.events.emit('saved');
    return ok;
  };
})();
