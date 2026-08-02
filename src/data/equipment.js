/* =============================================================
 * data/equipment.js — 8 conjuntos x 8 espaços = 64 itens base,
 * pool de atributos secundários, bônus de conjunto e materiais.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});

  /* ---------------- Espaços ---------------- */
  G.slots = [
    { id: 'weapon', name: 'Arma', nameEn: 'Weapon', icon: 'sword' },
    { id: 'helmet', name: 'Elmo', nameEn: 'Helmet', icon: 'helm' },
    { id: 'armor', name: 'Armadura', nameEn: 'Armor', icon: 'chest' },
    { id: 'gloves', name: 'Luvas', nameEn: 'Gloves', icon: 'glove' },
    { id: 'boots', name: 'Botas', nameEn: 'Boots', icon: 'boot' },
    { id: 'amulet', name: 'Amuleto', nameEn: 'Amulet', icon: 'amulet' },
    { id: 'ring', name: 'Anel', nameEn: 'Ring', icon: 'ring' },
    { id: 'relic', name: 'Relíquia', nameEn: 'Relic', icon: 'relic' }
  ];
  G.slotById = {};
  G.slots.forEach((s, i) => { s.index = i; G.slotById[s.id] = s; });

  /* --------- Distribuição de atributos base por espaço --------- */
  /* Valores são "pontos" multiplicados pelo nível do item.        */
  const SLOT_BASE = {
    weapon: { atk: 6.0, mag: 3.0 },
    helmet: { hp: 34, res: 2.2 },
    armor: { hp: 52, def: 3.4 },
    gloves: { atk: 3.0, crit: 0.35 },
    boots: { hp: 18, spd: 0.012, dodge: 0.22 },
    amulet: { mag: 5.0, res: 2.0 },
    ring: { critDmg: 1.1, atk: 2.0 },
    relic: { hp: 22, mag: 2.4, cdr: 0.006 }
  };

  /* --------- Conjuntos --------- */
  /* focus reforça certos atributos do item base (multiplicador).  */
  G.equipSets = [
    { id: 'floresta', name: 'Guardião da Floresta', nameEn: 'Forest Warden', element: 'mata', color: '#5fd08a',
      focus: { hp: 1.35, def: 1.35, res: 1.15, atk: 0.85 },
      bonuses: [
        { pieces: 2, desc: '+12% de vida máxima', descEn: '+12% max HP', mods: { hp: 0.12 } },
        { pieces: 4, desc: '+18% de defesa e +8% de resistência', descEn: '+18% defense and +8% resistance', mods: { def: 0.18, res: 0.08 } },
        { pieces: 6, desc: '+25% de vida e regenera 1% da vida por segundo', descEn: '+25% HP and regenerates 1% HP per second', mods: { hp: 0.25 }, special: 'regen1' }
      ],
      names: ['Lança de Cipó Vivo', 'Elmo de Folhas Densas', 'Peitoral de Casca Antiga', 'Manoplas de Raiz', 'Botas de Musgo Firme', 'Amuleto de Semente Dourada', 'Anel de Orvalho', 'Relíquia da Mata Serena'],
      namesEn: ['Living Vine Spear', 'Dense Leaf Helm', 'Ancient Bark Cuirass', 'Root Gauntlets', 'Firm Moss Boots', 'Golden Seed Amulet', 'Dew Ring', 'Relic of the Serene Wood'] },

    { id: 'boitata', name: 'Chamas do Boitatá', nameEn: 'Flames of the Serpent', element: 'fogo', color: '#ff8a3a',
      focus: { atk: 1.35, crit: 1.3, critDmg: 1.25, hp: 0.8 },
      bonuses: [
        { pieces: 2, desc: '+10% de ataque', descEn: '+10% attack', mods: { atk: 0.1 } },
        { pieces: 4, desc: '+15% de dano crítico e ataques aplicam queimadura', descEn: '+15% crit damage; attacks apply burn', mods: { critDmg: 0.15 }, special: 'burnOnHit' },
        { pieces: 6, desc: '+25% de ataque e queimaduras causam o dobro de dano', descEn: '+25% attack; burns deal double damage', mods: { atk: 0.25 }, special: 'burnAmp' }
      ],
      names: ['Arco das Brasas', 'Capuz de Cinzas', 'Peitoral de Escamas Quentes', 'Luvas Chamuscadas', 'Botas de Trilha Ardente', 'Amuleto de Carvão Vivo', 'Anel de Faísca', 'Relíquia da Serpente Ígnea'],
      namesEn: ['Ember Bow', 'Ash Hood', 'Hot Scale Cuirass', 'Scorched Gloves', 'Burning Trail Boots', 'Live Coal Amulet', 'Spark Ring', 'Relic of the Fiery Serpent'] },

    { id: 'rio', name: 'Encantos do Rio', nameEn: 'River Enchantments', element: 'agua', color: '#5aa9ff',
      focus: { mag: 1.35, healPow: 1.5, res: 1.25, cdr: 1.3, atk: 0.7 },
      bonuses: [
        { pieces: 2, desc: '+12% de poder de cura', descEn: '+12% healing power', mods: { healPow: 0.12 } },
        { pieces: 4, desc: '+15% de poder mágico e +8% de redução de recarga', descEn: '+15% magic power and +8% cooldown reduction', mods: { mag: 0.15, cdr: 0.08 } },
        { pieces: 6, desc: '+25% de cura e curas aplicam regeneração breve', descEn: '+25% healing; heals apply brief regeneration', mods: { healPow: 0.25 }, special: 'healRegen' }
      ],
      names: ['Cajado de Correnteza', 'Tiara de Espuma', 'Vestes de Seda Fluvial', 'Luvas de Maré', 'Sandálias de Pedra Lisa', 'Amuleto de Concha Cantante', 'Anel de Nascente', 'Relíquia das Encantarias'],
      namesEn: ['Current Staff', 'Foam Circlet', 'River Silk Robes', 'Tide Gloves', 'Smooth Stone Sandals', 'Singing Shell Amulet', 'Spring Ring', 'Relic of the Enchanted Waters'] },

    { id: 'sertao', name: 'Couro do Sertão', nameEn: 'Backland Leather', element: 'terra', color: '#c79a5a',
      focus: { atk: 1.15, hp: 1.2, def: 1.15, lifesteal: 1.6 },
      bonuses: [
        { pieces: 2, desc: '+8% de roubo de vida', descEn: '+8% life steal', mods: { lifesteal: 0.08 } },
        { pieces: 4, desc: '+12% de ataque e +12% de vida', descEn: '+12% attack and +12% HP', mods: { atk: 0.12, hp: 0.12 } },
        { pieces: 6, desc: '+20% de ataque e o roubo de vida também cura o grupo em 25%', descEn: '+20% attack; life steal also heals the party for 25%', mods: { atk: 0.2 }, special: 'sharedLeech' }
      ],
      names: ['Lâmina Larga Curtida', 'Chapéu de Couro Cru', 'Gibão Reforçado', 'Braçadeiras de Rédea', 'Botas de Travessia', 'Amuleto de Osso Polido', 'Anel de Ferro Velho', 'Relíquia do Caminho Seco'],
      namesEn: ['Tanned Broadblade', 'Rawhide Hat', 'Reinforced Jerkin', 'Rein Bracers', 'Crossing Boots', 'Polished Bone Amulet', 'Old Iron Ring', 'Relic of the Dry Road'] },

    { id: 'lua', name: 'Lua da Feiticeira', nameEn: 'Sorceress Moon', element: 'sombra', color: '#c07bff',
      focus: { mag: 1.45, cdr: 1.3, crit: 1.2, hp: 0.75, def: 0.8 },
      bonuses: [
        { pieces: 2, desc: '+12% de poder mágico', descEn: '+12% magic power', mods: { mag: 0.12 } },
        { pieces: 4, desc: '+10% de recarga reduzida e +10% de crítico mágico', descEn: '+10% cooldown reduction and +10% crit', mods: { cdr: 0.1, crit: 0.1 } },
        { pieces: 6, desc: '+28% de poder mágico e magias reduzem a resistência do alvo', descEn: '+28% magic power; spells shred target resistance', mods: { mag: 0.28 }, special: 'spellShred' }
      ],
      names: ['Orbe de Luar', 'Chapéu de Noite Longa', 'Manto de Estrelas Baixas', 'Luvas de Névoa', 'Botas de Passo Silencioso', 'Amuleto de Quarto Crescente', 'Anel de Eclipse Menor', 'Relíquia do Sonho Lúcido'],
      namesEn: ['Moonlight Orb', 'Long Night Hat', 'Low Star Mantle', 'Mist Gloves', 'Silent Step Boots', 'Crescent Amulet', 'Lesser Eclipse Ring', 'Relic of the Lucid Dream'] },

    { id: 'saci', name: 'Ventos do Saci', nameEn: 'Whirlwind Garb', element: 'vento', color: '#9fe8ff',
      focus: { spd: 1.5, dodge: 1.6, crit: 1.3, hp: 0.8 },
      bonuses: [
        { pieces: 2, desc: '+10% de velocidade de ataque', descEn: '+10% attack speed', mods: { spd: 0.1 } },
        { pieces: 4, desc: '+10% de esquiva e +10% de chance crítica', descEn: '+10% dodge and +10% crit chance', mods: { dodge: 0.1, crit: 0.1 } },
        { pieces: 6, desc: '+18% de velocidade; ao esquivar, o próximo golpe é crítico', descEn: '+18% speed; after a dodge the next hit is a crit', mods: { spd: 0.18 }, special: 'dodgeCrit' }
      ],
      names: ['Adagas Rodopiantes', 'Carapuça Vermelha', 'Colete de Brisa', 'Luvas de Piparote', 'Botas Sem Rastro', 'Amuleto de Ventania', 'Anel do Rodamoinho', 'Relíquia do Assobio Curto'],
      namesEn: ['Whirling Daggers', 'Red Cap', 'Breeze Vest', 'Flick Gloves', 'Traceless Boots', 'Gale Amulet', 'Whirl Ring', 'Relic of the Short Whistle'] },

    { id: 'serra', name: 'Cristais da Serra', nameEn: 'Highland Crystals', element: 'terra', color: '#8fd8ff',
      focus: { res: 1.5, mag: 1.2, def: 1.25, hp: 1.1 },
      bonuses: [
        { pieces: 2, desc: '+12% de resistência mágica', descEn: '+12% magic resistance', mods: { res: 0.12 } },
        { pieces: 4, desc: '+12% de poder mágico e +10% de defesa', descEn: '+12% magic power and +10% defense', mods: { mag: 0.12, def: 0.1 } },
        { pieces: 6, desc: '+20% de resistência e reflete 15% do dano mágico recebido', descEn: '+20% resistance; reflects 15% of magic damage taken', mods: { res: 0.2 }, special: 'reflect' }
      ],
      names: ['Martelo de Quartzo', 'Coroa de Geodo', 'Couraça Cristalina', 'Manoplas de Prisma', 'Grevas de Rocha Clara', 'Amuleto de Veio Profundo', 'Anel de Faceta', 'Relíquia do Coração de Pedra'],
      namesEn: ['Quartz Hammer', 'Geode Crown', 'Crystalline Cuirass', 'Prism Gauntlets', 'Pale Rock Greaves', 'Deep Vein Amulet', 'Facet Ring', 'Relic of the Stone Heart'] },

    { id: 'eclipse', name: 'Sombras do Eclipse', nameEn: 'Eclipse Shadows', element: 'sombra', color: '#ff5f7e',
      focus: { atk: 1.3, mag: 1.3, crit: 1.35, critDmg: 1.3, hp: 0.9 },
      bonuses: [
        { pieces: 2, desc: '+10% de ataque e poder mágico', descEn: '+10% attack and magic power', mods: { atk: 0.1, mag: 0.1 } },
        { pieces: 4, desc: '+20% de dano crítico e +8% de crítico', descEn: '+20% crit damage and +8% crit chance', mods: { critDmg: 0.2, crit: 0.08 } },
        { pieces: 6, desc: '+22% de todo o dano causado', descEn: '+22% to all damage dealt', mods: {}, special: 'eclipseDamage' }
      ],
      names: ['Foice do Fim de Tarde', 'Elmo do Vazio Calmo', 'Manto do Último Raio', 'Garras da Penumbra', 'Botas do Passo Findo', 'Amuleto do Anel Negro', 'Anel do Eclipse Maior', 'Relíquia do Coração Partido'],
      namesEn: ['Dusk Scythe', 'Calm Void Helm', 'Last Ray Mantle', 'Penumbra Claws', 'Final Step Boots', 'Black Ring Amulet', 'Greater Eclipse Ring', 'Relic of the Broken Heart'] }
  ];
  G.setById = {};
  G.equipSets.forEach((s) => { G.setById[s.id] = s; });

  /* --------- Gera as 64 definições base --------- */
  G.equipment = [];
  G.equipSets.forEach((set, si) => {
    G.slots.forEach((slot, li) => {
      const base = {};
      const sb = SLOT_BASE[slot.id];
      for (const k in sb) base[k] = sb[k] * (set.focus[k] || 1);
      G.equipment.push({
        id: set.id + '_' + slot.id,
        name: set.names[li], nameEn: set.namesEn[li],
        slot: slot.id, set: set.id, element: set.element,
        base: base,
        tier: si,                       // define o nível mínimo sugerido
        minLevel: 1 + si * 12
      });
    });
  });
  G.equipById = {};
  G.equipment.forEach((e) => { G.equipById[e.id] = e; });

  /* --------- Atributos secundários aleatórios --------- */
  /* value é por "ponto de nível" do item; flat=true significa valor absoluto */
  G.affixes = [
    { id: 'a_hp', stat: 'hp', name: 'Vida', nameEn: 'Health', v: 26, w: 100 },
    { id: 'a_atk', stat: 'atk', name: 'Ataque', nameEn: 'Attack', v: 2.6, w: 100 },
    { id: 'a_def', stat: 'def', name: 'Defesa', nameEn: 'Defense', v: 2.0, w: 90 },
    { id: 'a_mag', stat: 'mag', name: 'Poder Mágico', nameEn: 'Magic Power', v: 2.6, w: 100 },
    { id: 'a_res', stat: 'res', name: 'Resistência Mágica', nameEn: 'Magic Resist', v: 2.0, w: 90 },
    { id: 'a_crit', stat: 'crit', name: 'Chance Crítica', nameEn: 'Crit Chance', v: 0.22, w: 60, pctStat: true },
    { id: 'a_cdmg', stat: 'critDmg', name: 'Dano Crítico', nameEn: 'Crit Damage', v: 0.9, w: 55, pctStat: true },
    { id: 'a_spd', stat: 'spd', name: 'Velocidade de Ataque', nameEn: 'Attack Speed', v: 0.009, w: 45 },
    { id: 'a_dodge', stat: 'dodge', name: 'Esquiva', nameEn: 'Dodge', v: 0.18, w: 50, pctStat: true },
    { id: 'a_acc', stat: 'acc', name: 'Precisão', nameEn: 'Accuracy', v: 0.3, w: 45, pctStat: true },
    { id: 'a_ls', stat: 'lifesteal', name: 'Roubo de Vida', nameEn: 'Life Steal', v: 0.0022, w: 35 },
    { id: 'a_heal', stat: 'healPow', name: 'Poder de Cura', nameEn: 'Healing Power', v: 0.0035, w: 35 },
    { id: 'a_cdr', stat: 'cdr', name: 'Redução de Recarga', nameEn: 'Cooldown Reduction', v: 0.0025, w: 30 },
    { id: 'a_elem', stat: 'elemRes', name: 'Resistência Elemental', nameEn: 'Elemental Resist', v: 0.0035, w: 30 }
  ];

  /* --------- Materiais de criação --------- */
  G.materials = [
    { id: 'fibra_verde', name: 'Fibra Verde', nameEn: 'Green Fiber', tier: 1, color: '#5fd08a', region: 'mata' },
    { id: 'resina_dourada', name: 'Resina Dourada', nameEn: 'Golden Resin', tier: 2, color: '#ffd94a', region: 'mata' },
    { id: 'essencia_agua', name: 'Essência de Água', nameEn: 'Water Essence', tier: 1, color: '#5aa9ff', region: 'rio' },
    { id: 'escama_fluvial', name: 'Escama Fluvial', nameEn: 'River Scale', tier: 2, color: '#8fdcff', region: 'rio' },
    { id: 'cinza_quente', name: 'Cinza Quente', nameEn: 'Warm Ash', tier: 1, color: '#ff8a3a', region: 'sertao' },
    { id: 'brasa_eterna', name: 'Brasa Eterna', nameEn: 'Eternal Ember', tier: 3, color: '#ff5f3a', region: 'sertao' },
    { id: 'couro_curtido', name: 'Couro Curtido', nameEn: 'Tanned Leather', tier: 1, color: '#c79a5a', region: 'sertao' },
    { id: 'limo_negro', name: 'Limo Negro', nameEn: 'Black Slime', tier: 1, color: '#5c5230', region: 'pantano' },
    { id: 'sonho_petrificado', name: 'Sonho Petrificado', nameEn: 'Petrified Dream', tier: 3, color: '#c07bff', region: 'pantano' },
    { id: 'pena_veloz', name: 'Pena Veloz', nameEn: 'Swift Feather', tier: 1, color: '#9fe8ff', region: 'cerrado' },
    { id: 'nucleo_tempestade', name: 'Núcleo de Tempestade', nameEn: 'Storm Core', tier: 2, color: '#d6f4ff', region: 'cerrado' },
    { id: 'raiz_salgada', name: 'Raiz Salgada', nameEn: 'Salted Root', tier: 2, color: '#6f9a5a', region: 'mangue' },
    { id: 'seiva_amarga', name: 'Seiva Amarga', nameEn: 'Bitter Sap', tier: 3, color: '#a8ff5a', region: 'mangue' },
    { id: 'cristal_bruto', name: 'Cristal Bruto', nameEn: 'Rough Crystal', tier: 2, color: '#bfe4ff', region: 'serra' },
    { id: 'poeira_de_geodo', name: 'Poeira de Geodo', nameEn: 'Geode Dust', tier: 1, color: '#8fd8ff', region: 'serra' },
    { id: 'linha_de_festa', name: 'Linha de Festa', nameEn: 'Festival Thread', tier: 2, color: '#ffb6e6', region: 'mascaras' },
    { id: 'tinta_mascara', name: 'Tinta de Máscara', nameEn: 'Mask Paint', tier: 2, color: '#c74fa0', region: 'mascaras' },
    { id: 'fragmento_sombrio', name: 'Fragmento Sombrio', nameEn: 'Shadow Shard', tier: 3, color: '#b06ce0', region: 'eclipse' },
    { id: 'pelo_ancestral', name: 'Pelo Ancestral', nameEn: 'Ancestral Fur', tier: 3, color: '#c99a5a', region: 'mata' },
    { id: 'perola_do_rio', name: 'Pérola do Rio', nameEn: 'River Pearl', tier: 3, color: '#e8f9ff', region: 'rio' },
    { id: 'chifre_espectral', name: 'Chifre Espectral', nameEn: 'Spectral Antler', tier: 4, color: '#ffffff', region: 'eclipse' },
    { id: 'nucleo_lendario', name: 'Núcleo Lendário', nameEn: 'Legendary Core', tier: 4, color: '#ffb445', region: 'todas' },
    { id: 'po_estelar', name: 'Pó Estelar', nameEn: 'Stardust', tier: 4, color: '#ff5f7e', region: 'eclipse' },
    { id: 'pedra_aprimoramento', name: 'Pedra de Aprimoramento', nameEn: 'Upgrade Stone', tier: 2, color: '#b8c0cc', region: 'todas' }
  ];
  G.materialById = {};
  G.materials.forEach((m) => { G.materialById[m.id] = m; });
})();
