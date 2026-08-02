/* =============================================================
 * data/balance.js — TODOS os números de balanceamento ficam aqui.
 * Nenhuma lógica de renderização. Edite livremente para rebalancear.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});

  G.balance = {
    version: 3,

    /* ---- Progressão de herói ---- */
    hero: {
      maxLevel: 300,
      // XP necessário para ir do nível n para n+1
      xpCurve: (lvl) => Math.floor(48 * Math.pow(lvl, 1.45) + 30 * lvl + 40),
      // multiplicador de stats por estrela (1..6)
      starMult: [1, 1.18, 1.4, 1.68, 2.05, 2.5],
      starCost: [0, 1, 2, 4, 8, 16],        // fragmentos do herói por estrela
      ascendCost: (a) => Math.floor(400 * Math.pow(1.55, a)),  // custo em ouro
      ascendMult: 0.07,                      // +7% em todos os stats por ascensão
      maxAscend: 60,
      skillCostBase: 120,                    // ouro para subir nível de habilidade
      skillCostGrowth: 1.55,
      skillMaxLevel: 15,
      skillPowerPerLevel: 0.08,              // +8% de poder por nível
      bondXpPerStage: 3,
      bondLevels: [0, 100, 300, 700, 1500, 3000, 6000, 12000, 24000, 50000],
      bondStatBonus: 0.03                    // +3% stats por nível de vínculo
    },

    /* ---- Combate ---- */
    combat: {
      baseAttackInterval: 1.5,   // segundos a 1.0 de spd
      defenseK: 120,             // mitigação: 100/(100 + def*100/K)
      resistK: 120,
      dodgeFloor: 0.35,          // chance mínima de acerto
      dodgeCap: 0.6,             // esquiva máxima efetiva
      critCap: 0.85,
      cdrCap: 0.5,
      energyMax: 100,
      energyOnAttack: 9,
      energyOnHitTaken: 6,
      energyRegen: 2.4,          // por segundo
      ultAutoThreshold: 100,
      elementBonus: 0.25,        // vantagem elemental
      elementPenalty: 0.18,      // desvantagem
      statusTick: 1.0,           // segundos entre ticks de DoT/regen
      maxRoundTime: 60,          // derrota por tempo esgotado
      reviveDelay: 0,            // heróis não revivem no meio da batalha
      speedOptions: [1, 2, 3],
      enemyCountByType: { normal: [2, 3], elite: [1, 2], boss: [1, 1] }
    },

    /* ---- Escala de inimigos ----
     * IMPORTANTE: a curva é POLINOMIAL, não exponencial.
     * O poder do herói cresce de forma polinomial (nível + equipamento
     * linear no estágio, multiplicadores limitados). Uma curva exponencial
     * de inimigos sempre acabaria ultrapassando o herói e criando um muro
     * intransponível. Usando o mesmo tipo de curva dos dois lados, a
     * dificuldade se mantém estável do estágio 1 ao 120 e além.
     *
     *   escala(e) = ((1 + (estágio + offset) * k) / (1 + offset * k)) ^ e
     *
     * O `offset` suaviza o início: sem ele a primeira região cresceria
     * rápido demais para um grupo de dois heróis sem equipamento.
     */
    enemy: {
      k: 0.12,
      offset: 9,
      expAtk: 2.35,       // ataque / defesa / magia
      expHp: 2.85,        // vida (maior: as lutas ficam substanciais)
      base: { hp: 215, atk: 24, def: 14, mag: 20, res: 12 },
      eliteMult: { hp: 2.6, atk: 1.45, def: 1.35, mag: 1.45, res: 1.35 },
      bossMult: { hp: 6.5, atk: 1.75, def: 1.5, mag: 1.75, res: 1.5 },
      endlessGrowth: 1.045,      // aí sim exponencial, para o modo infinito
      recommendedPowerK: 1.0
    },

    /* ---- Recompensas (mesma curva dos inimigos) ---- */
    rewards: {
      goldBase: 40,
      goldExp: 2.85,
      xpBase: 45,
      xpExp: 2.35,
      eliteMult: 3.0,
      bossMult: 8.0,
      matDropChance: 0.55,
      matDropChanceElite: 0.9,
      matDropChanceBoss: 1.0,
      gemPerBossFirstClear: 15,
      tokenPerBoss: 1
    },

    /* ---- Loot e raridade ---- */
    loot: {
      dropChance: { normal: 0.24, elite: 0.5, boss: 1.0 },
      // pesos base por raridade (ajustados pela profundidade do estágio)
      weights: { common: 620, uncommon: 260, rare: 90, epic: 24, legendary: 5, mythical: 1 },
      depthBonus: 0.0055,        // desloca peso para raridades altas por estágio
      pity: { rare: 12, epic: 45, legendary: 160 }, // drops sem X garante X
      affixCount: { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythical: 5 },
      rarityMult: { common: 1, uncommon: 1.28, rare: 1.65, epic: 2.15, legendary: 2.9, mythical: 3.9 },
      sellValue: { common: 20, uncommon: 55, rare: 160, epic: 520, legendary: 1800, mythical: 6000 },
      upgradeMaxLevel: 20,
      upgradeGain: 0.09,         // +9% dos stats base por nível de aprimoramento
      upgradeCost: (lvl, rar) => Math.floor(90 * Math.pow(1.42, lvl) * (1 + ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'].indexOf(rar) * 0.35)),
      maxInventory: 220
    },

    /* ---- Sistema idle ---- */
    idle: {
      maxOfflineHours: 12,
      offlineEfficiency: 0.55,   // recompensas offline valem 55% do combate ativo
      autoStageDelay: 1.0,       // segundos entre estágios no auto
      upgrades: [
        { id: 'idl_gold', name: 'Bolsa do Tropeiro', nameEn: 'Drover\'s Pouch', stat: 'goldMult', per: 0.05, max: 50, base: 500, growth: 1.28, desc: '+5% de ouro em todas as fontes.' },
        { id: 'idl_xp', name: 'Diário de Viagem', nameEn: 'Travel Journal', stat: 'xpMult', per: 0.05, max: 50, base: 500, growth: 1.28, desc: '+5% de experiência.' },
        { id: 'idl_off', name: 'Rede de Descanso', nameEn: 'Resting Hammock', stat: 'offlineHours', per: 1, max: 12, base: 1500, growth: 1.6, desc: '+1 hora de progresso offline.' },
        { id: 'idl_eff', name: 'Mapa das Trilhas', nameEn: 'Trail Map', stat: 'offlineEff', per: 0.03, max: 15, base: 2000, growth: 1.45, desc: '+3% de eficiência offline.' },
        { id: 'idl_mat', name: 'Sacola de Coleta', nameEn: 'Gathering Sack', stat: 'matMult', per: 0.06, max: 30, base: 900, growth: 1.3, desc: '+6% de materiais coletados.' },
        { id: 'idl_luck', name: 'Amuleto da Sorte', nameEn: 'Lucky Charm', stat: 'dropMult', per: 0.04, max: 30, base: 1400, growth: 1.35, desc: '+4% de chance de itens.' },
        { id: 'idl_spd', name: 'Botas Gastas', nameEn: 'Worn Boots', stat: 'battleSpeed', per: 0.02, max: 25, base: 1200, growth: 1.33, desc: '+2% de velocidade de combate.' }
      ]
    },

    /* ---- Prestígio (Renascimento da Lenda) ---- */
    prestige: {
      unlockStage: 36,           // índice absoluto mínimo para renascer
      // Essência ganha = floor( (maxStage - 30)^1.35 / 6 ) * (1 + bônus)
      essenceFormula: (maxStage) => Math.max(0, Math.floor(Math.pow(Math.max(0, maxStage - 30), 1.35) / 6)),
      upgrades: [
        { id: 'pr_atk', name: 'Fúria Ancestral', nameEn: 'Ancestral Fury', per: 0.06, max: 40, base: 2, growth: 1.22, desc: '+6% de ataque e poder mágico de todos os heróis.' },
        { id: 'pr_hp', name: 'Raízes Profundas', nameEn: 'Deep Roots', per: 0.06, max: 40, base: 2, growth: 1.22, desc: '+6% de vida máxima de todos os heróis.' },
        { id: 'pr_gold', name: 'Herança das Lendas', nameEn: 'Legacy of Legends', per: 0.10, max: 30, base: 3, growth: 1.25, desc: '+10% de ouro.' },
        { id: 'pr_xp', name: 'Memória Viva', nameEn: 'Living Memory', per: 0.10, max: 30, base: 3, growth: 1.25, desc: '+10% de experiência.' },
        { id: 'pr_start', name: 'Caminho Trilhado', nameEn: 'Trodden Path', per: 1, max: 40, base: 4, growth: 1.3, desc: 'Começa 1 estágio adiante após renascer.' },
        { id: 'pr_drop', name: 'Olhar do Curupira', nameEn: 'Curupira\'s Gaze', per: 0.05, max: 25, base: 5, growth: 1.3, desc: '+5% de chance de equipamento.' },
        { id: 'pr_crit', name: 'Golpe da Lenda', nameEn: 'Legend\'s Strike', per: 0.01, max: 25, base: 4, growth: 1.28, desc: '+1% de chance crítica.' },
        { id: 'pr_speed', name: 'Vento Constante', nameEn: 'Steady Wind', per: 0.02, max: 25, base: 5, growth: 1.3, desc: '+2% de velocidade de ataque.' },
        { id: 'pr_idle', name: 'Sono das Eras', nameEn: 'Slumber of Ages', per: 2, max: 12, base: 6, growth: 1.35, desc: '+2 horas de progresso offline.' },
        { id: 'pr_ess', name: 'Chama Interior', nameEn: 'Inner Flame', per: 0.08, max: 20, base: 8, growth: 1.4, desc: '+8% de Essência Lendária ganha.' }
      ]
    },

    /* ---- Recrutamento ---- */
    recruit: {
      costGold: [0, 0, 2500, 6000, 14000, 32000, 70000, 150000],
      costGems: [0, 0, 0, 0, 20, 40, 80, 150],
      fragmentPerDuplicate: 5
    },

    /* ---- Recompensas diárias (7 dias, cíclico) ---- */
    daily: [
      { gold: 1200, gems: 5, label: 'Dia 1' },
      { gold: 2200, mats: { fibra_verde: 8 }, label: 'Dia 2' },
      { gold: 3400, gems: 10, label: 'Dia 3' },
      { gold: 5000, mats: { essencia_agua: 6 }, label: 'Dia 4' },
      { gold: 7200, gems: 15, label: 'Dia 5' },
      { gold: 10000, mats: { cristal_bruto: 5 }, label: 'Dia 6' },
      { gold: 18000, gems: 40, mats: { nucleo_lendario: 1 }, label: 'Dia 7' }
    ],

    /* ---- Elementos ---- */
    elements: {
      order: ['fogo', 'mata', 'terra', 'vento', 'agua'],
      neutral: 'sombra',
      names: { fogo: 'Fogo', mata: 'Mata', terra: 'Terra', vento: 'Vento', agua: 'Água', sombra: 'Sombra' },
      namesEn: { fogo: 'Fire', mata: 'Forest', terra: 'Earth', vento: 'Wind', agua: 'Water', sombra: 'Shadow' },
      colors: { fogo: '#ff7a34', mata: '#5fd08a', terra: '#c79a5a', vento: '#9fe8ff', agua: '#5aa9ff', sombra: '#b06ce0' },
      icons: { fogo: '🔥', mata: '🌿', terra: '⛰', vento: '🌀', agua: '💧', sombra: '🌑' }
    },

    /* ---- Raridades ---- */
    rarities: [
      { id: 'common', name: 'Comum', nameEn: 'Common', color: '#b8c0cc', short: 'C' },
      { id: 'uncommon', name: 'Incomum', nameEn: 'Uncommon', color: '#4fd07a', short: 'I' },
      { id: 'rare', name: 'Raro', nameEn: 'Rare', color: '#4fa8ff', short: 'R' },
      { id: 'epic', name: 'Épico', nameEn: 'Epic', color: '#c07bff', short: 'E' },
      { id: 'legendary', name: 'Lendário', nameEn: 'Legendary', color: '#ffb445', short: 'L' },
      { id: 'mythical', name: 'Mítico', nameEn: 'Mythical', color: '#ff5f7e', short: 'M' }
    ]
  };

  G.balance.rarityById = {};
  G.balance.rarities.forEach((r, i) => { r.index = i; G.balance.rarityById[r.id] = r; });

  /** Curva de escala compartilhada por inimigos e recompensas. */
  G.balance.curve = function (stage, exp) {
    const e = G.balance.enemy;
    return Math.pow((1 + (stage + e.offset) * e.k) / (1 + e.offset * e.k), exp);
  };

  /** Multiplicador elemental de atacante contra defensor */
  G.balance.elementMult = function (atk, def) {
    const B = G.balance, o = B.elements.order;
    if (!atk || !def || atk === B.elements.neutral || def === B.elements.neutral) return 1;
    const ia = o.indexOf(atk), id = o.indexOf(def);
    if (ia < 0 || id < 0) return 1;
    if ((ia + 1) % o.length === id) return 1 + B.combat.elementBonus;
    if ((id + 1) % o.length === ia) return 1 - B.combat.elementPenalty;
    return 1;
  };
})();
