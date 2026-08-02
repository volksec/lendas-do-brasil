/* =============================================================
 * idle.js — progresso ocioso e recompensas offline.
 * O "banco ocioso" acumula enquanto o jogo está aberto (expedição
 * paralela) e é coletado com um botão. Ao voltar de um período
 * fechado, o mesmo cálculo roda com o tempo real decorrido.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const U = G.util;
  const I = (G.idle = {});
  const B = G.balance;

  const AVG_BATTLE_SECONDS = 9;    // duração média estimada de um combate

  /** Ritmo por segundo no estágio atual, já com multiplicadores. */
  I.rate = function () {
    const s = G.game.state;
    const stageIdx = Math.max(0, s.maxStage - 1);
    const stage = G.getStage(stageIdx);
    const rw = G.game.stageRewards(stageIdx, stage.type === 'boss' ? 'normal' : stage.type);
    const gm = G.game.globalMods();
    return {
      gold: (rw.gold / AVG_BATTLE_SECONDS) * gm.offlineEff,
      xp: (rw.xp / AVG_BATTLE_SECONDS) * gm.offlineEff,
      matChance: (B.rewards.matDropChance / AVG_BATTLE_SECONDS) * gm.matMult * gm.offlineEff,
      itemChance: (B.loot.dropChance.normal / AVG_BATTLE_SECONDS) * gm.dropMult * gm.offlineEff,
      region: stage.region
    };
  };

  /** Acumula no banco ocioso enquanto o jogo roda. */
  I.update = function (dt) {
    const s = G.game.state;
    if (!s) return;
    const bank = s.idleBank;
    const r = I.rate();
    bank.time += dt;
    bank.gold += r.gold * dt;
    bank.xp += r.xp * dt;
    // materiais e itens são sorteados em blocos para não pesar
    bank.matAcc = (bank.matAcc || 0) + r.matChance * dt;
    while (bank.matAcc >= 1) {
      bank.matAcc -= 1;
      const region = G.regionById[r.region];
      const mid = U.pick(region ? region.materials : ['fibra_verde']);
      bank.mats[mid] = (bank.mats[mid] || 0) + 1;
    }
    bank.itemAcc = (bank.itemAcc || 0) + r.itemChance * dt;
    while (bank.itemAcc >= 1) { bank.itemAcc -= 1; bank.items = (bank.items || 0) + 1; }
    // teto: 4 horas de acúmulo com o jogo aberto
    const cap = 4 * 3600;
    if (bank.time > cap) bank.time = cap;
  };

  I.bankPreview = function () {
    const bank = G.game.state.idleBank;
    return {
      gold: Math.floor(bank.gold), xp: Math.floor(bank.xp),
      mats: bank.mats, items: bank.items || 0, time: bank.time
    };
  };

  I.claimBank = function () {
    const s = G.game.state;
    const bank = s.idleBank;
    const gold = Math.floor(bank.gold), xp = Math.floor(bank.xp);
    if (gold <= 0 && xp <= 0 && !(bank.items > 0)) return null;
    s.gold += gold;
    s.stats.goldEarned += gold;
    s.stats.dailyGold = (s.stats.dailyGold || 0) + gold;
    s.stats.weeklyGold = (s.stats.weeklyGold || 0) + gold;
    G.game.trackQuest('gold', null, gold);
    s.party.forEach((h) => G.game.addHeroXp(h, xp));
    for (const m in bank.mats) G.game.addMat(m, bank.mats[m]);
    const items = [];
    for (let i = 0; i < (bank.items || 0) && i < 20; i++) {
      const it = G.game.makeItem({ stage: Math.max(0, s.maxStage - 1) });
      if (G.game.addItem(it)) items.push(it);
    }
    const out = { gold: gold, xp: xp, mats: Object.assign({}, bank.mats), items: items, time: bank.time };
    s.idleBank = { gold: 0, xp: 0, mats: {}, items: 0, time: 0, matAcc: 0, itemAcc: 0 };
    G.audio.play('coin');
    G.game.events.emit('resources'); G.game.events.emit('inventory'); G.game.events.emit('idle');
    return out;
  };

  /**
   * Calcula as recompensas do período fechado.
   * Retorna null se o tempo for insignificante (< 60s).
   */
  I.computeOffline = function (elapsedMs) {
    const s = G.game.state;
    const gm = G.game.globalMods();
    const capHours = Math.min(gm.offlineHours, G.game.settings.maxOfflineHours || gm.offlineHours);
    const elapsed = Math.max(0, elapsedMs / 1000);
    const capped = Math.min(elapsed, capHours * 3600);
    if (capped < 60) return null;
    const r = I.rate();
    const region = G.regionById[r.region];
    const mats = {};
    let matRolls = r.matChance * capped;
    const matPool = region ? region.materials : ['fibra_verde'];
    while (matRolls >= 1) { matRolls -= 1; const m = U.pick(matPool); mats[m] = (mats[m] || 0) + 1; }
    if (Math.random() < matRolls) { const m = U.pick(matPool); mats[m] = (mats[m] || 0) + 1; }
    const itemCount = Math.min(25, Math.floor(r.itemChance * capped));
    return {
      elapsed: elapsed, counted: capped, capped: elapsed > capped, capHours: capHours,
      gold: Math.floor(r.gold * capped), xp: Math.floor(r.xp * capped),
      mats: mats, itemCount: itemCount
    };
  };

  I.claimOffline = function (result) {
    if (!result) return null;
    const s = G.game.state;
    s.gold += result.gold;
    s.stats.goldEarned += result.gold;
    s.stats.dailyGold = (s.stats.dailyGold || 0) + result.gold;
    s.stats.weeklyGold = (s.stats.weeklyGold || 0) + result.gold;
    G.game.trackQuest('gold', null, result.gold);
    s.party.forEach((h) => G.game.addHeroXp(h, result.xp));
    for (const m in result.mats) G.game.addMat(m, result.mats[m]);
    const items = [];
    for (let i = 0; i < result.itemCount; i++) {
      const it = G.game.makeItem({ stage: Math.max(0, s.maxStage - 1) });
      if (G.game.addItem(it)) items.push(it);
    }
    result.items = items;
    s.stats.offlineClaims = (s.stats.offlineClaims || 0) + 1;
    G.game.checkAchievements();
    G.audio.play('coin');
    G.game.events.emit('resources'); G.game.events.emit('inventory');
    return result;
  };
})();
