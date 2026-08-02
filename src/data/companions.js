/* =============================================================
 * data/companions.js — 8 companheiros míticos.
 * Sobem de nível com fragmentos e evoluem em 3 estágios.
 * Apenas um pode ficar ativo por vez.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});

  G.companions = [
    { id: 'capivara', name: 'Mini Capivara Guardiã', nameEn: 'Little Guardian Capybara',
      desc: 'Calma absoluta em forma de bicho. Nada a abala, nem o chefe final.',
      descEn: 'Absolute calm in animal form. Nothing rattles her, not even the final boss.',
      art: { arch: 'beast', pal: { main: '#a87a4a', dark: '#4a3218', light: '#d9b07a', accent: '#8ed57f', skin: '#8a6238', eye: '#3a2a18' }, fat: true },
      bonus: { hp: 0.05 }, perLevel: { hp: 0.006 },
      evolutions: ['Mini Capivara Guardiã', 'Capivara Sentinela', 'Capivara Ancestral'],
      evolutionsEn: ['Little Guardian Capybara', 'Sentinel Capybara', 'Ancestral Capybara'],
      unlock: { type: 'start' } },

    { id: 'curupira_j', name: 'Curupira Jovem', nameEn: 'Young Curupira',
      desc: 'Ainda aprendendo a confundir caçadores. Já é irritantemente bom nisso.',
      descEn: 'Still learning to confuse hunters. Already annoyingly good at it.',
      art: { arch: 'humanoid', pal: { main: '#c9452a', dark: '#4a1408', light: '#ff8a5a', accent: '#5fd08a', skin: '#a86a3a', eye: '#8aff5a' }, build: 'slim', hat: 'hair', small: true },
      bonus: { spd: 0.04, dodge: 0.03 }, perLevel: { spd: 0.005 },
      evolutions: ['Curupira Jovem', 'Curupira Vigilante', 'Curupira Senhor da Trilha'],
      evolutionsEn: ['Young Curupira', 'Watchful Curupira', 'Curupira Lord of the Trail'],
      unlock: { type: 'stage', value: 18 } },

    { id: 'luz_iara', name: 'Luz de Iara', nameEn: 'Light of Iara',
      desc: 'Uma luzinha que flutua acima da água e mostra o caminho de volta.',
      descEn: 'A small light floating above the water, showing the way back.',
      art: { arch: 'spirit', pal: { main: '#5aa9ff', dark: '#123c58', light: '#e8f9ff', accent: '#8aff9c', skin: '#3f93bd', eye: '#ffffff' }, small: true, glow: true },
      bonus: { healPow: 0.12, res: 0.05 }, perLevel: { healPow: 0.012 },
      evolutions: ['Luz de Iara', 'Chama d\'Água', 'Farol das Encantarias'],
      evolutionsEn: ['Light of Iara', 'Water Flame', 'Beacon of the Enchanted'],
      unlock: { type: 'boss', value: 'maedagua' } },

    { id: 'coruja', name: 'Coruja Encantada', nameEn: 'Enchanted Owl',
      desc: 'Vê tudo, comenta pouco, julga bastante.',
      descEn: 'Sees everything, comments little, judges plenty.',
      art: { arch: 'bird', pal: { main: '#7a6a5a', dark: '#2e2820', light: '#d9c8a8', accent: '#ffd94a', skin: '#5a4e42', eye: '#ffd94a' }, small: true },
      bonus: { crit: 0.05, acc: 0.05 }, perLevel: { crit: 0.004 },
      evolutions: ['Coruja Encantada', 'Coruja Vigia', 'Coruja das Nove Noites'],
      evolutionsEn: ['Enchanted Owl', 'Watcher Owl', 'Owl of the Nine Nights'],
      unlock: { type: 'stage', value: 30 } },

    { id: 'mico', name: 'Mico Dourado Místico', nameEn: 'Mystic Golden Marmoset',
      desc: 'Rouba brilhos e devolve com juros — em ouro.',
      descEn: 'Steals shiny things and returns them with interest — in gold.',
      art: { arch: 'beast', pal: { main: '#e8a83a', dark: '#5a3e0e', light: '#ffe08a', accent: '#8a5a2a', skin: '#c98a2a', eye: '#3a2a10' }, small: true, tail: true },
      bonus: { goldMult: 0.15 }, perLevel: { goldMult: 0.015 },
      evolutions: ['Mico Dourado Místico', 'Mico do Tesouro', 'Mico da Fortuna Antiga'],
      evolutionsEn: ['Mystic Golden Marmoset', 'Treasure Marmoset', 'Marmoset of Old Fortune'],
      unlock: { type: 'stage', value: 42 } },

    { id: 'tatu', name: 'Tatu de Pedra', nameEn: 'Stone Armadillo',
      desc: 'Se enrola e vira escudo. Depois volta a andar como se nada fosse.',
      descEn: 'Curls into a shield, then walks on as if nothing happened.',
      art: { arch: 'beast', pal: { main: '#8a8a96', dark: '#32323c', light: '#c2c2ce', accent: '#c79a5a', skin: '#6a6a76', eye: '#ffd88a' }, shell: true, small: true },
      bonus: { def: 0.12, res: 0.08 }, perLevel: { def: 0.012 },
      evolutions: ['Tatu de Pedra', 'Tatu de Granito', 'Tatu Monólito'],
      evolutionsEn: ['Stone Armadillo', 'Granite Armadillo', 'Monolith Armadillo'],
      unlock: { type: 'stage', value: 54 } },

    { id: 'beija_flor', name: 'Beija-flor Solar', nameEn: 'Solar Hummingbird',
      desc: 'Bate as asas rápido demais para ser desenhado direito.',
      descEn: 'Beats its wings too fast to be drawn properly.',
      art: { arch: 'bird', pal: { main: '#3ac9a8', dark: '#0e4a3a', light: '#8affd8', accent: '#ffd94a', skin: '#2a9a80', eye: '#ffffff' }, small: true, fast: true },
      bonus: { spd: 0.08, cdr: 0.06 }, perLevel: { spd: 0.007 },
      evolutions: ['Beija-flor Solar', 'Beija-flor de Aurora', 'Beija-flor do Meio-Dia'],
      evolutionsEn: ['Solar Hummingbird', 'Dawn Hummingbird', 'Noon Hummingbird'],
      unlock: { type: 'boss', value: 'boitata' } },

    { id: 'cobrinha', name: 'Cobra de Fogo Pequena', nameEn: 'Small Fire Snake',
      desc: 'Filhote de algo bem maior. Já sabe o que fazer.',
      descEn: 'The hatchling of something much larger. It already knows what to do.',
      art: { arch: 'serpent', pal: { main: '#d9451f', dark: '#4e1206', light: '#ffc24a', accent: '#fff3b0', skin: '#8a2f14', eye: '#fff3b0' }, small: true },
      bonus: { atk: 0.1, critDmg: 0.15 }, perLevel: { atk: 0.01 },
      evolutions: ['Cobra de Fogo Pequena', 'Serpente de Brasa', 'Herdeira do Boitatá'],
      evolutionsEn: ['Small Fire Snake', 'Ember Serpent', 'Heir of the Flame Serpent'],
      unlock: { type: 'stage', value: 66 } }
  ];

  G.companionById = {};
  G.companions.forEach((c) => { G.companionById[c.id] = c; });

  G.companionBalance = {
    maxLevel: 30,
    xpPerLevel: (lvl) => Math.floor(80 * Math.pow(lvl, 1.5) + 60),
    evolveAt: [10, 20],           // níveis de evolução
    evolveBonus: 0.35,            // +35% nos bônus por evolução
    feedXp: 25                    // xp por Pedra de Aprimoramento usada
  };
})();
