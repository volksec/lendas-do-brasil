/* =============================================================
 * data/crafting.js — 24 receitas de criação.
 * out.kind: equip (gera equipamento) | mat | potion | stone | relic
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});

  G.recipes = [
    /* ---- Pedras e materiais base ---- */
    { id: 'r_stone', cat: 'material', name: 'Pedra de Aprimoramento', nameEn: 'Upgrade Stone',
      desc: 'Base de qualquer melhoria. Nunca se tem o bastante.',
      descEn: 'The base of every improvement. You never have enough.',
      cost: { gold: 400, mats: { fibra_verde: 3, poeira_de_geodo: 2 } },
      out: { kind: 'mat', id: 'pedra_aprimoramento', qty: 3 }, unlock: 0 },
    { id: 'r_resina', cat: 'material', name: 'Refino de Resina', nameEn: 'Resin Refining',
      desc: 'Aquece a fibra verde até virar resina dourada.',
      descEn: 'Heats green fiber until it becomes golden resin.',
      cost: { gold: 700, mats: { fibra_verde: 8 } },
      out: { kind: 'mat', id: 'resina_dourada', qty: 2 }, unlock: 12 },
    { id: 'r_escama', cat: 'material', name: 'Cura de Escamas', nameEn: 'Scale Curing',
      desc: 'Escamas fluviais tratadas com essência de água.',
      descEn: 'River scales cured with water essence.',
      cost: { gold: 900, mats: { essencia_agua: 6 } },
      out: { kind: 'mat', id: 'escama_fluvial', qty: 2 }, unlock: 24 },
    { id: 'r_brasa', cat: 'material', name: 'Brasa Eterna', nameEn: 'Eternal Ember',
      desc: 'Cinza quente comprimida até parar de apagar.',
      descEn: 'Warm ash compressed until it stops going out.',
      cost: { gold: 2600, mats: { cinza_quente: 12, resina_dourada: 3 } },
      out: { kind: 'mat', id: 'brasa_eterna', qty: 1 }, unlock: 48 },
    { id: 'r_cristal', cat: 'material', name: 'Lapidação de Cristal', nameEn: 'Crystal Cutting',
      desc: 'Poeira de geodo prensada em cristal bruto.',
      descEn: 'Geode dust pressed into rough crystal.',
      cost: { gold: 3200, mats: { poeira_de_geodo: 10 } },
      out: { kind: 'mat', id: 'cristal_bruto', qty: 2 }, unlock: 84 },
    { id: 'r_nucleo', cat: 'material', name: 'Núcleo Lendário', nameEn: 'Legendary Core',
      desc: 'Junta o que sobrou de várias lendas num só ponto.',
      descEn: 'Gathers what is left of several legends into one point.',
      cost: { gold: 25000, mats: { brasa_eterna: 2, perola_do_rio: 1, cristal_bruto: 4, sonho_petrificado: 1 } },
      out: { kind: 'mat', id: 'nucleo_lendario', qty: 1 }, unlock: 60 },
    { id: 'r_poeira', cat: 'material', name: 'Pó Estelar', nameEn: 'Stardust',
      desc: 'Fragmentos sombrios moídos até brilhar.',
      descEn: 'Shadow shards ground until they shine.',
      cost: { gold: 60000, mats: { fragmento_sombrio: 6, nucleo_lendario: 1 } },
      out: { kind: 'mat', id: 'po_estelar', qty: 2 }, unlock: 110 },

    /* ---- Poções (consumíveis de batalha) ---- */
    { id: 'r_pot_hp', cat: 'potion', name: 'Garrafada Restauradora', nameEn: 'Restorative Draught',
      desc: 'Cura 35% da vida de todo o grupo no início do combate.',
      descEn: 'Heals 35% HP for the whole party at battle start.',
      cost: { gold: 600, mats: { fibra_verde: 4, essencia_agua: 2 } },
      out: { kind: 'potion', id: 'pot_hp', qty: 3 }, unlock: 6 },
    { id: 'r_pot_atk', cat: 'potion', name: 'Elixir de Ímpeto', nameEn: 'Elixir of Impetus',
      desc: '+25% de ataque e poder mágico durante 3 estágios.',
      descEn: '+25% attack and magic power for 3 stages.',
      cost: { gold: 1400, mats: { cinza_quente: 5, resina_dourada: 2 } },
      out: { kind: 'potion', id: 'pot_atk', qty: 2 }, unlock: 30 },
    { id: 'r_pot_gold', cat: 'potion', name: 'Chá do Tropeiro', nameEn: 'Drover\'s Tea',
      desc: '+60% de ouro durante 10 minutos.',
      descEn: '+60% gold for 10 minutes.',
      cost: { gold: 2500, mats: { couro_curtido: 6, pena_veloz: 3 } },
      out: { kind: 'potion', id: 'pot_gold', qty: 2 }, unlock: 40 },
    { id: 'r_pot_xp', cat: 'potion', name: 'Infusão de Memória', nameEn: 'Memory Infusion',
      desc: '+60% de experiência durante 10 minutos.',
      descEn: '+60% experience for 10 minutes.',
      cost: { gold: 2500, mats: { limo_negro: 6, poeira_de_geodo: 4 } },
      out: { kind: 'potion', id: 'pot_xp', qty: 2 }, unlock: 40 },

    /* ---- Equipamentos por conjunto ---- */
    { id: 'r_eq_floresta', cat: 'equip', name: 'Forjar: Guardião da Floresta', nameEn: 'Forge: Forest Warden',
      desc: 'Cria uma peça aleatória do conjunto Guardião da Floresta (Raro ou melhor).',
      descEn: 'Creates a random Forest Warden piece (Rare or better).',
      cost: { gold: 3000, mats: { fibra_verde: 10, resina_dourada: 3 } },
      out: { kind: 'equip', set: 'floresta', minRarity: 'rare' }, unlock: 12 },
    { id: 'r_eq_boitata', cat: 'equip', name: 'Forjar: Chamas do Boitatá', nameEn: 'Forge: Flames of the Serpent',
      desc: 'Cria uma peça aleatória do conjunto Chamas do Boitatá (Raro ou melhor).',
      descEn: 'Creates a random Flames of the Serpent piece (Rare or better).',
      cost: { gold: 5000, mats: { cinza_quente: 10, brasa_eterna: 1 } },
      out: { kind: 'equip', set: 'boitata', minRarity: 'rare' }, unlock: 36 },
    { id: 'r_eq_rio', cat: 'equip', name: 'Forjar: Encantos do Rio', nameEn: 'Forge: River Enchantments',
      desc: 'Cria uma peça aleatória do conjunto Encantos do Rio (Raro ou melhor).',
      descEn: 'Creates a random River Enchantments piece (Rare or better).',
      cost: { gold: 5000, mats: { essencia_agua: 10, escama_fluvial: 4 } },
      out: { kind: 'equip', set: 'rio', minRarity: 'rare' }, unlock: 36 },
    { id: 'r_eq_sertao', cat: 'equip', name: 'Forjar: Couro do Sertão', nameEn: 'Forge: Backland Leather',
      desc: 'Cria uma peça aleatória do conjunto Couro do Sertão (Raro ou melhor).',
      descEn: 'Creates a random Backland Leather piece (Rare or better).',
      cost: { gold: 5000, mats: { couro_curtido: 10, cinza_quente: 4 } },
      out: { kind: 'equip', set: 'sertao', minRarity: 'rare' }, unlock: 48 },
    { id: 'r_eq_lua', cat: 'equip', name: 'Forjar: Lua da Feiticeira', nameEn: 'Forge: Sorceress Moon',
      desc: 'Cria uma peça aleatória do conjunto Lua da Feiticeira (Épico ou melhor).',
      descEn: 'Creates a random Sorceress Moon piece (Epic or better).',
      cost: { gold: 14000, mats: { limo_negro: 12, sonho_petrificado: 2 } },
      out: { kind: 'equip', set: 'lua', minRarity: 'epic' }, unlock: 60 },
    { id: 'r_eq_saci', cat: 'equip', name: 'Forjar: Ventos do Saci', nameEn: 'Forge: Whirlwind Garb',
      desc: 'Cria uma peça aleatória do conjunto Ventos do Saci (Épico ou melhor).',
      descEn: 'Creates a random Whirlwind Garb piece (Epic or better).',
      cost: { gold: 14000, mats: { pena_veloz: 12, nucleo_tempestade: 4 } },
      out: { kind: 'equip', set: 'saci', minRarity: 'epic' }, unlock: 72 },
    { id: 'r_eq_serra', cat: 'equip', name: 'Forjar: Cristais da Serra', nameEn: 'Forge: Highland Crystals',
      desc: 'Cria uma peça aleatória do conjunto Cristais da Serra (Épico ou melhor).',
      descEn: 'Creates a random Highland Crystals piece (Epic or better).',
      cost: { gold: 26000, mats: { cristal_bruto: 8, poeira_de_geodo: 12 } },
      out: { kind: 'equip', set: 'serra', minRarity: 'epic' }, unlock: 84 },
    { id: 'r_eq_eclipse', cat: 'equip', name: 'Forjar: Sombras do Eclipse', nameEn: 'Forge: Eclipse Shadows',
      desc: 'Cria uma peça aleatória do conjunto Sombras do Eclipse (Lendário garantido).',
      descEn: 'Creates a random Eclipse Shadows piece (guaranteed Legendary).',
      cost: { gold: 90000, mats: { fragmento_sombrio: 10, nucleo_lendario: 2, po_estelar: 1 } },
      out: { kind: 'equip', set: 'eclipse', minRarity: 'legendary' }, unlock: 108 },

    /* ---- Relíquias e serviços ---- */
    { id: 'r_relic_mata', cat: 'relic', name: 'Relíquia da Mata Serena', nameEn: 'Relic of the Serene Wood',
      desc: 'Relíquia Épica garantida do conjunto da floresta.',
      descEn: 'Guaranteed Epic relic from the forest set.',
      cost: { gold: 12000, mats: { resina_dourada: 6, pelo_ancestral: 1 } },
      out: { kind: 'equipExact', id: 'floresta_relic', minRarity: 'epic' }, unlock: 30 },
    { id: 'r_relic_eclipse', cat: 'relic', name: 'Relíquia do Coração Partido', nameEn: 'Relic of the Broken Heart',
      desc: 'Relíquia Mítica garantida. Cara, e vale.',
      descEn: 'Guaranteed Mythical relic. Expensive, and worth it.',
      cost: { gold: 250000, mats: { po_estelar: 4, chifre_espectral: 2, nucleo_lendario: 4 } },
      out: { kind: 'equipExact', id: 'eclipse_relic', minRarity: 'mythical' }, unlock: 115 },
    { id: 'r_reroll', cat: 'service', name: 'Reforjar Atributos', nameEn: 'Reforge Attributes',
      desc: 'Sorteia novamente os atributos secundários do item selecionado.',
      descEn: 'Rerolls the secondary attributes of the selected item.',
      cost: { gold: 4000, mats: { pedra_aprimoramento: 6 } },
      out: { kind: 'reroll' }, unlock: 20, needsItem: true },
    { id: 'r_rarity', cat: 'service', name: 'Elevar Raridade', nameEn: 'Raise Rarity',
      desc: 'Sobe o item selecionado uma raridade (até Mítico) e adiciona um atributo.',
      descEn: 'Raises the selected item one rarity (up to Mythical) and adds an attribute.',
      cost: { gold: 20000, mats: { nucleo_lendario: 1, pedra_aprimoramento: 15 } },
      out: { kind: 'rarityUp' }, unlock: 55, needsItem: true },
    { id: 'r_fragment', cat: 'service', name: 'Selo de Recrutamento', nameEn: 'Recruitment Seal',
      desc: 'Gera 3 fragmentos de herói do herói selecionado.',
      descEn: 'Generates 3 hero fragments for the selected hero.',
      cost: { gold: 30000, mats: { nucleo_lendario: 1, linha_de_festa: 8 } },
      out: { kind: 'fragment', qty: 3 }, unlock: 66, needsHero: true }
  ];

  G.recipeById = {};
  G.recipes.forEach((r) => { G.recipeById[r.id] = r; });

  /* Consumíveis usáveis */
  G.potions = {
    pot_hp: { name: 'Garrafada Restauradora', nameEn: 'Restorative Draught', effect: 'healParty', value: 0.35, color: '#4fd07a' },
    pot_atk: { name: 'Elixir de Ímpeto', nameEn: 'Elixir of Impetus', effect: 'buffAtk', value: 0.25, stages: 3, color: '#ff8a3a' },
    pot_gold: { name: 'Chá do Tropeiro', nameEn: 'Drover\'s Tea', effect: 'goldBoost', value: 0.6, seconds: 600, color: '#ffd94a' },
    pot_xp: { name: 'Infusão de Memória', nameEn: 'Memory Infusion', effect: 'xpBoost', value: 0.6, seconds: 600, color: '#c07bff' }
  };

  /* Materiais devolvidos ao desmontar, por raridade */
  G.dismantleYield = {
    common: { pedra_aprimoramento: 1 },
    uncommon: { pedra_aprimoramento: 2 },
    rare: { pedra_aprimoramento: 4 },
    epic: { pedra_aprimoramento: 8, nucleo_lendario: 0 },
    legendary: { pedra_aprimoramento: 16, nucleo_lendario: 1 },
    mythical: { pedra_aprimoramento: 30, nucleo_lendario: 2, po_estelar: 1 }
  };
})();
