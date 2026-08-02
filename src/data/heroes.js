/* =============================================================
 * data/heroes.js — 8 heróis jogáveis originais.
 * Cada herói: classe, papel, arte procedural, stats base, curva de
 * crescimento, ataque básico, 2 ativas, 1 passiva e 1 suprema.
 *
 * DSL de habilidade:
 *   target: enemyLow | enemyHigh | enemyRandom | enemyFront | allEnemies
 *           self | allyLow | allyRandom | allAllies
 *   acts:  [{k:'dmg', dmg:'phys'|'mag', pow, hits}]
 *          [{k:'heal', pow}] [{k:'shield', pow, dur}]
 *          [{k:'buff'|'debuff', stat, amt, dur}]
 *          [{k:'status', st:'burn'|'poison'|'stun'|'silence'|'slow'|'regen', dur, pot}]
 *          [{k:'cleanse'}] [{k:'taunt', dur}] [{k:'energy', amt}]
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});

  G.heroes = [
    /* ---------------------------------------------------------- */
    {
      id: 'guardiao',
      name: 'Guardião da Mata', nameEn: 'Warden of the Deepwood',
      cls: 'Guardião', clsEn: 'Warden', role: 'tank',
      rarity: 'epic', element: 'mata', region: 'mata',
      inspiration: 'Protetores das florestas do imaginário popular brasileiro.',
      inspirationEn: 'Forest-protector figures of Brazilian popular imagination.',
      bio: 'Cresceu ouvindo o mato respirar. Carrega uma lança de jequitibá e uma armadura tecida de cipó vivo que se refaz sozinha. Fala pouco, planta muito.',
      bioEn: 'He grew up listening to the forest breathe. He carries a jequitiba-wood spear and living vine armor that mends itself. Speaks little, plants much.',
      strengths: 'Absorve dano pesado, protege aliados fracos, regenera sozinho.',
      strengthsEn: 'Soaks heavy damage, protects fragile allies, self-regenerates.',
      weaknesses: 'Dano baixo, vulnerável a Fogo, depende de aliados para vencer rápido.',
      weaknessesEn: 'Low damage, weak to Fire, needs allies to close fights.',
      art: { arch: 'humanoid', weapon: 'spear', hat: 'leaf', cape: true, build: 'heavy',
             pal: { main: '#2f7d4f', dark: '#153c28', light: '#6fd894', accent: '#c9a227', skin: '#a4703f', eye: '#eaff9b' } },
      base: { hp: 1150, atk: 44, def: 62, mag: 26, res: 46, spd: 0.82, crit: 4, critDmg: 145, acc: 100, dodge: 3, lifesteal: 0.03, healPow: 0.1, cdr: 0 },
      growth: { hp: 128, atk: 3.6, def: 6.4, mag: 2.0, res: 4.6 },
      basic: { name: 'Estocada de Jequitibá', nameEn: 'Jequitiba Thrust', pow: 1.0, dmg: 'phys' },
      abilities: [
        { id: 'gu_a1', type: 'active', name: 'Muralha de Cipó', nameEn: 'Vine Bulwark', cd: 9, target: 'allAllies',
          desc: 'Ergue raízes protetoras: escudo para todo o grupo e provocação nos inimigos.',
          descEn: 'Raises protective roots: a shield for the whole party and taunts enemies.',
          acts: [{ k: 'shield', pow: 1.6, dur: 8 }, { k: 'taunt', dur: 5, selfOnly: true }] },
        { id: 'gu_a2', type: 'active', name: 'Golpe Enraizado', nameEn: 'Rooted Strike', cd: 7, target: 'enemyHigh',
          desc: 'Crava a lança no chão e prende o alvo com raízes, causando dano e lentidão.',
          descEn: 'Drives the spear down, snaring the target for damage and slow.',
          acts: [{ k: 'dmg', dmg: 'phys', pow: 1.7 }, { k: 'status', st: 'slow', dur: 6, pot: 0.3 }] },
        { id: 'gu_p', type: 'passive', name: 'Casca Viva', nameEn: 'Living Bark',
          desc: 'Regenera 1.5% da vida máxima por segundo e reduz em 12% o dano recebido por aliados vivos.',
          descEn: 'Regenerates 1.5% max HP per second and reduces damage taken by living allies by 12%.',
          mods: { def: 0.08 } },
        { id: 'gu_u', type: 'ultimate', name: 'Coração da Floresta', nameEn: 'Heart of the Forest', cd: 24, target: 'allAllies',
          desc: 'Invoca a mata: cura poderosa, escudo e regeneração para o grupo inteiro.',
          descEn: 'Summons the woodland: strong heal, shield and regeneration for the whole party.',
          acts: [{ k: 'heal', pow: 2.4 }, { k: 'shield', pow: 2.2, dur: 10 }, { k: 'status', st: 'regen', dur: 10, pot: 0.05 }, { k: 'cleanse' }] }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: 'arqueira',
      name: 'Arqueira do Boitatá', nameEn: 'Archer of the Flame Serpent',
      cls: 'Arqueira', clsEn: 'Archer', role: 'dps',
      rarity: 'epic', element: 'fogo', region: 'sertao',
      inspiration: 'A lenda da serpente de fogo que percorre os campos à noite.',
      inspirationEn: 'The legend of the fire serpent that crosses the fields at night.',
      bio: 'Diz que aprendeu a mirar acompanhando o rastro luminoso da serpente pelo campo aberto. Suas flechas acendem sozinhas quando ela prende a respiração.',
      bioEn: 'She learned to aim by tracing a glowing serpent trail across open fields. Her arrows ignite on their own when she holds her breath.',
      strengths: 'Dano contínuo altíssimo, queima múltiplos alvos, excelente contra Mata.',
      strengthsEn: 'Very high sustained damage, burns multiple targets, strong vs Forest.',
      weaknesses: 'Vida frágil, sofre com silêncio, fraca contra Água.',
      weaknessesEn: 'Fragile, punished by silence, weak to Water.',
      art: { arch: 'humanoid', weapon: 'bow', hat: 'hood', cape: false, build: 'slim',
             pal: { main: '#c33a1e', dark: '#5e1608', light: '#ffb03a', accent: '#ffe08a', skin: '#c58a5c', eye: '#fff2a8' } },
      base: { hp: 620, atk: 78, def: 24, mag: 44, res: 22, spd: 1.18, crit: 18, critDmg: 165, acc: 105, dodge: 8, lifesteal: 0, healPow: 0, cdr: 0.05 },
      growth: { hp: 62, atk: 7.4, def: 2.2, mag: 3.6, res: 2.0 },
      basic: { name: 'Flecha Incandescente', nameEn: 'Searing Arrow', pow: 1.0, dmg: 'phys', status: { st: 'burn', dur: 4, pot: 0.12, chance: 0.35 } },
      abilities: [
        { id: 'ar_a1', type: 'active', name: 'Salva de Brasas', nameEn: 'Ember Volley', cd: 8, target: 'allEnemies',
          desc: 'Dispara um arco de flechas em chamas contra todos os inimigos, aplicando queimadura.',
          descEn: 'Fires a burning arc at all enemies, applying burn.',
          acts: [{ k: 'dmg', dmg: 'phys', pow: 1.05 }, { k: 'status', st: 'burn', dur: 6, pot: 0.2 }] },
        { id: 'ar_a2', type: 'active', name: 'Flecha Perfurante', nameEn: 'Piercing Shot', cd: 6, target: 'enemyLow',
          desc: 'Tiro certeiro que ignora parte da armadura e sempre acerta.',
          descEn: 'A precise shot that ignores part of the armor and never misses.',
          acts: [{ k: 'dmg', dmg: 'phys', pow: 2.3, pierce: 0.4, trueHit: true }] },
        { id: 'ar_p', type: 'passive', name: 'Rastro de Fogo', nameEn: 'Trail of Fire',
          desc: 'Críticos renovam a queimadura do alvo e concedem +8% de velocidade de ataque por 4s (acumula até 3x).',
          descEn: 'Crits refresh the target burn and grant +8% attack speed for 4s (stacks 3x).',
          mods: { crit: 0.05 } },
        { id: 'ar_u', type: 'ultimate', name: 'Trilha do Boitatá', nameEn: 'Path of the Flame Serpent', cd: 26, target: 'allEnemies',
          desc: 'Uma serpente de fogo atravessa o campo: dano massivo e queimadura intensa em todos.',
          descEn: 'A fire serpent crosses the field: massive damage and heavy burn on all foes.',
          acts: [{ k: 'dmg', dmg: 'mag', pow: 2.9 }, { k: 'status', st: 'burn', dur: 10, pot: 0.35 }, { k: 'debuff', stat: 'res', amt: -0.25, dur: 8 }] }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: 'curandeira',
      name: 'Curandeira das Águas', nameEn: 'Healer of the Waters',
      cls: 'Curandeira', clsEn: 'Healer', role: 'healer',
      rarity: 'legendary', element: 'agua', region: 'rio',
      inspiration: 'Nascentes, cachoeiras e as histórias de cura contadas à beira do rio.',
      inspirationEn: 'Springs, waterfalls and the healing tales told by the riverside.',
      bio: 'Aprendeu que toda água boa tem memória. Canta baixinho enquanto trata feridas — e a canção parece limpar mais do que o remédio.',
      bioEn: 'She learned that good water remembers. She hums while tending wounds, and the song seems to cleanse more than the medicine.',
      strengths: 'Cura em área, remove efeitos negativos, mantém o grupo vivo em batalhas longas.',
      strengthsEn: 'Area healing, cleanses debuffs, keeps the party alive in long fights.',
      weaknesses: 'Dano muito baixo, alvo prioritário dos inimigos, sofre com silêncio.',
      weaknessesEn: 'Very low damage, a priority target, badly hurt by silence.',
      art: { arch: 'humanoid', weapon: 'staff', hat: 'flower', cape: true, build: 'slim',
             pal: { main: '#2f8fbf', dark: '#123c58', light: '#9fe6ff', accent: '#e8f9ff', skin: '#c98f66', eye: '#bff4ff' } },
      base: { hp: 700, atk: 26, def: 30, mag: 66, res: 52, spd: 0.9, crit: 6, critDmg: 140, acc: 100, dodge: 5, lifesteal: 0, healPow: 0.45, cdr: 0.1 },
      growth: { hp: 74, atk: 2.0, def: 3.0, mag: 6.2, res: 5.0 },
      basic: { name: 'Gota Cortante', nameEn: 'Cutting Droplet', pow: 0.9, dmg: 'mag' },
      abilities: [
        { id: 'cu_a1', type: 'active', name: 'Canto da Nascente', nameEn: 'Song of the Spring', cd: 7, target: 'allyLow',
          desc: 'Cura profunda em um aliado ferido e aplica regeneração.',
          descEn: 'Deeply heals a wounded ally and applies regeneration.',
          acts: [{ k: 'heal', pow: 2.2 }, { k: 'status', st: 'regen', dur: 8, pot: 0.04 }] },
        { id: 'cu_a2', type: 'active', name: 'Água que Lava', nameEn: 'Cleansing Water', cd: 12, target: 'allAllies',
          desc: 'Onda purificadora: cura moderada, remove efeitos negativos e aumenta a resistência mágica.',
          descEn: 'Purifying wave: moderate heal, removes debuffs, raises magic resistance.',
          acts: [{ k: 'heal', pow: 1.1 }, { k: 'cleanse' }, { k: 'buff', stat: 'res', amt: 0.3, dur: 10 }] },
        { id: 'cu_p', type: 'passive', name: 'Memória da Água', nameEn: 'Memory of Water',
          desc: 'Curas excedentes viram escudo (60% do excesso). Aliados abaixo de 30% recebem +25% de cura.',
          descEn: 'Overhealing becomes a shield (60% of the excess). Allies under 30% HP receive +25% healing.',
          mods: { healPow: 0.1 } },
        { id: 'cu_u', type: 'ultimate', name: 'Enchente Serena', nameEn: 'Serene Flood', cd: 28, target: 'allAllies',
          desc: 'O rio sobe e envolve o grupo: cura enorme, limpeza total e imunidade breve a controle.',
          descEn: 'The river rises around the party: huge heal, full cleanse and brief control immunity.',
          acts: [{ k: 'heal', pow: 3.4 }, { k: 'cleanse' }, { k: 'buff', stat: 'res', amt: 0.4, dur: 10 }, { k: 'immune', dur: 5 }] }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: 'cavaleiro',
      name: 'Cavaleiro do Sertão', nameEn: 'Knight of the Backlands',
      cls: 'Cavaleiro', clsEn: 'Knight', role: 'bruiser',
      rarity: 'rare', element: 'terra', region: 'sertao',
      inspiration: 'A resiliência das paisagens secas e das longas travessias.',
      inspirationEn: 'The resilience of dry landscapes and long crossings.',
      bio: 'Couro rachado pelo sol, lâmina larga e um cantil que nunca fica vazio de todo. Já atravessou três invernos sem chuva e voltou rindo.',
      bioEn: 'Sun-cracked leather, a broad blade and a canteen that is never quite empty. He crossed three rainless winters and came back laughing.',
      strengths: 'Equilíbrio entre dano e resistência, roubo de vida, forte contra Vento.',
      strengthsEn: 'Balanced damage and toughness, life steal, strong vs Wind.',
      weaknesses: 'Sem cura em área, lento contra grupos, fraco contra Mata.',
      weaknessesEn: 'No area healing, slow against groups, weak to Forest.',
      art: { arch: 'humanoid', weapon: 'greatsword', hat: 'wide', cape: true, build: 'heavy',
             pal: { main: '#8a5a2b', dark: '#3d2312', light: '#d9a463', accent: '#b8c0cc', skin: '#b07747', eye: '#ffd88a' } },
      base: { hp: 920, atk: 62, def: 44, mag: 20, res: 30, spd: 0.95, crit: 10, critDmg: 160, acc: 100, dodge: 5, lifesteal: 0.12, healPow: 0, cdr: 0 },
      growth: { hp: 98, atk: 5.8, def: 4.6, mag: 1.6, res: 3.0 },
      basic: { name: 'Corte Seco', nameEn: 'Dry Cleave', pow: 1.05, dmg: 'phys' },
      abilities: [
        { id: 'ca_a1', type: 'active', name: 'Investida de Couro', nameEn: 'Leather Charge', cd: 8, target: 'enemyHigh',
          desc: 'Avança e ataca com o ombro, causando dano e atordoando brevemente.',
          descEn: 'Charges shoulder-first, dealing damage and briefly stunning.',
          acts: [{ k: 'dmg', dmg: 'phys', pow: 1.8 }, { k: 'status', st: 'stun', dur: 1.6, pot: 1, chance: 0.7 }] },
        { id: 'ca_a2', type: 'active', name: 'Fôlego do Sertão', nameEn: 'Backland Breath', cd: 14, target: 'self',
          desc: 'Recupera vida com base no dano causado recentemente e aumenta a defesa.',
          descEn: 'Recovers HP based on recent damage dealt and raises defense.',
          acts: [{ k: 'heal', pow: 1.3, scale: 'atk' }, { k: 'buff', stat: 'def', amt: 0.45, dur: 10 }, { k: 'buff', stat: 'lifesteal', amt: 0.12, dur: 10, flat: true }] },
        { id: 'ca_p', type: 'passive', name: 'Couro Curtido', nameEn: 'Tanned Hide',
          desc: 'Abaixo de 40% de vida, recebe +30% de defesa e +20% de roubo de vida.',
          descEn: 'Below 40% HP, gains +30% defense and +20% life steal.',
          mods: { hp: 0.06 } },
        { id: 'ca_u', type: 'ultimate', name: 'Travessia da Lâmina', nameEn: 'Blade Crossing', cd: 25, target: 'allEnemies',
          desc: 'Um corte largo atravessa a linha inimiga, curando o cavaleiro por parte do dano.',
          descEn: 'A wide cut sweeps the enemy line, healing the knight for part of the damage.',
          acts: [{ k: 'dmg', dmg: 'phys', pow: 2.2, lifesteal: 0.4 }, { k: 'debuff', stat: 'atk', amt: -0.2, dur: 8 }] }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: 'feiticeira',
      name: 'Feiticeira da Lua', nameEn: 'Sorceress of the Moon',
      cls: 'Feiticeira', clsEn: 'Sorceress', role: 'mage',
      rarity: 'epic', element: 'sombra', region: 'pantano',
      inspiration: 'Noites de lua cheia, sonhos e histórias contadas para assustar.',
      inspirationEn: 'Full-moon nights, dreams and stories told to frighten.',
      bio: 'Dorme de dia e estuda de noite. Diz que a lua empresta ideias, mas cobra juros — e que ainda está pagando.',
      bioEn: 'She sleeps by day and studies by night. She says the moon lends ideas but charges interest, and she is still paying.',
      strengths: 'Dano mágico em área, silencia inimigos perigosos, controla o ritmo da luta.',
      strengthsEn: 'Area magic damage, silences dangerous foes, controls the pace of the fight.',
      weaknesses: 'Muito frágil, depende de recarga, sofre com atordoamento.',
      weaknessesEn: 'Very fragile, cooldown dependent, punished by stuns.',
      art: { arch: 'humanoid', weapon: 'orb', hat: 'pointed', cape: true, build: 'slim',
             pal: { main: '#6b3fa0', dark: '#2a1246', light: '#c79bff', accent: '#ffe9a8', skin: '#d0a07a', eye: '#f4e0ff' } },
      base: { hp: 590, atk: 22, def: 22, mag: 82, res: 40, spd: 0.88, crit: 12, critDmg: 175, acc: 100, dodge: 7, lifesteal: 0, healPow: 0, cdr: 0.12 },
      growth: { hp: 58, atk: 1.6, def: 2.0, mag: 7.8, res: 3.6 },
      basic: { name: 'Faísca Lunar', nameEn: 'Moon Spark', pow: 1.0, dmg: 'mag' },
      abilities: [
        { id: 'fe_a1', type: 'active', name: 'Véu de Ilusões', nameEn: 'Veil of Illusions', cd: 10, target: 'allEnemies',
          desc: 'Confunde os inimigos: reduz precisão e chance de acerto crítico.',
          descEn: 'Confuses enemies: reduces accuracy and critical chance.',
          acts: [{ k: 'dmg', dmg: 'mag', pow: 1.2 }, { k: 'debuff', stat: 'acc', amt: -0.25, dur: 8 }, { k: 'debuff', stat: 'crit', amt: -0.5, dur: 8 }] },
        { id: 'fe_a2', type: 'active', name: 'Palavra Muda', nameEn: 'Silent Word', cd: 13, target: 'enemyHigh',
          desc: 'Sela a magia do alvo, impedindo o uso de habilidades por alguns segundos.',
          descEn: 'Seals the target\'s magic, blocking abilities for a few seconds.',
          acts: [{ k: 'dmg', dmg: 'mag', pow: 1.6 }, { k: 'status', st: 'silence', dur: 5, pot: 1, chance: 0.85 }] },
        { id: 'fe_p', type: 'passive', name: 'Fases da Lua', nameEn: 'Phases of the Moon',
          desc: 'A cada 3 magias lançadas, a próxima causa +60% de dano e não pode errar.',
          descEn: 'Every 3rd spell deals +60% damage and cannot miss.',
          mods: { mag: 0.06 } },
        { id: 'fe_u', type: 'ultimate', name: 'Eclipse Sussurrado', nameEn: 'Whispered Eclipse', cd: 27, target: 'allEnemies',
          desc: 'Apaga a luz do campo: dano sombrio massivo, silêncio e redução de resistência.',
          descEn: 'Snuffs out the light: massive shadow damage, silence and resistance shred.',
          acts: [{ k: 'dmg', dmg: 'mag', pow: 3.1 }, { k: 'status', st: 'silence', dur: 4, pot: 1, chance: 0.6 }, { k: 'debuff', stat: 'res', amt: -0.3, dur: 10 }] }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: 'cacador',
      name: 'Caçador do Mapinguari', nameEn: 'Hunter of the Great Beast',
      cls: 'Caçador', clsEn: 'Hunter', role: 'dps',
      rarity: 'rare', element: 'mata', region: 'serra',
      inspiration: 'Relatos de rastreadores sobre criaturas enormes da mata fechada.',
      inspirationEn: 'Trackers\' accounts of huge creatures in the deep forest.',
      bio: 'Tem um caderno cheio de pegadas desenhadas e nenhuma delas ele conseguiu explicar. Prefere armadilhas a brigas justas.',
      bioEn: 'His notebook is full of drawn footprints, none of which he can explain. He prefers traps to fair fights.',
      strengths: 'Dano brutal em alvo único, ótimo contra chefes, marca alvos.',
      strengthsEn: 'Brutal single-target damage, great against bosses, marks targets.',
      weaknesses: 'Fraco contra grupos, precisa de tempo para acumular dano.',
      weaknessesEn: 'Weak against groups, needs ramp-up time.',
      art: { arch: 'humanoid', weapon: 'crossbow', hat: 'cap', cape: false, build: 'normal',
             pal: { main: '#4d6b34', dark: '#22301a', light: '#9dc86a', accent: '#c0763a', skin: '#a86f45', eye: '#ffe08a' } },
      base: { hp: 700, atk: 84, def: 28, mag: 24, res: 24, spd: 1.0, crit: 22, critDmg: 185, acc: 108, dodge: 9, lifesteal: 0.04, healPow: 0, cdr: 0 },
      growth: { hp: 70, atk: 8.0, def: 2.6, mag: 1.8, res: 2.2 },
      basic: { name: 'Virote Certeiro', nameEn: 'True Bolt', pow: 1.15, dmg: 'phys' },
      abilities: [
        { id: 'cc_a1', type: 'active', name: 'Marca do Rastreador', nameEn: 'Tracker\'s Mark', cd: 11, target: 'enemyHigh',
          desc: 'Marca o alvo: ele recebe +30% de dano de todo o grupo.',
          descEn: 'Marks the target: it takes +30% damage from the whole party.',
          acts: [{ k: 'dmg', dmg: 'phys', pow: 1.3 }, { k: 'debuff', stat: 'dmgTaken', amt: 0.3, dur: 12 }] },
        { id: 'cc_a2', type: 'active', name: 'Armadilha de Cipó', nameEn: 'Vine Snare', cd: 9, target: 'enemyRandom',
          desc: 'Prende o alvo no chão, causando dano ao longo do tempo e impedindo a fuga.',
          descEn: 'Pins the target down, dealing damage over time and slowing it heavily.',
          acts: [{ k: 'dmg', dmg: 'phys', pow: 1.2 }, { k: 'status', st: 'poison', dur: 8, pot: 0.18 }, { k: 'status', st: 'slow', dur: 8, pot: 0.4 }] },
        { id: 'cc_p', type: 'passive', name: 'Presa Grande', nameEn: 'Big Game',
          desc: 'Causa +25% de dano contra Elites e Chefes. Cada ataque em um alvo marcado acumula +4% de dano crítico.',
          descEn: '+25% damage to Elites and Bosses. Each hit on a marked target stacks +4% crit damage.',
          mods: { critDmg: 0.1 } },
        { id: 'cc_u', type: 'ultimate', name: 'Abate Lendário', nameEn: 'Legendary Takedown', cd: 24, target: 'enemyHigh',
          desc: 'Uma sequência devastadora de disparos concentrados em um único alvo.',
          descEn: 'A devastating burst of shots focused on a single target.',
          acts: [{ k: 'dmg', dmg: 'phys', pow: 1.35, hits: 4, pierce: 0.25 }] }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: 'mensageiro',
      name: 'Mensageiro do Saci', nameEn: 'Messenger of the Whirlwind',
      cls: 'Mensageiro', clsEn: 'Messenger', role: 'assassin',
      rarity: 'epic', element: 'vento', region: 'cerrado',
      inspiration: 'Redemoinhos repentinos, travessuras e recados que chegam antes da pessoa.',
      inspirationEn: 'Sudden whirlwinds, pranks and messages that arrive before the messenger.',
      bio: 'Nunca ninguém o viu chegar, só sair. Entrega recados, some com chaves e devolve tudo — quase sempre.',
      bioEn: 'No one ever sees him arrive, only leave. He delivers messages, misplaces keys and returns everything — nearly always.',
      strengths: 'Velocidade extrema, esquiva altíssima, reduz defesa dos inimigos.',
      strengthsEn: 'Extreme speed, very high dodge, shreds enemy defense.',
      weaknesses: 'Vida baixa, dano por golpe modesto, sofre contra ataques em área.',
      weaknessesEn: 'Low HP, modest damage per hit, suffers from area attacks.',
      art: { arch: 'humanoid', weapon: 'daggers', hat: 'cap', cape: true, build: 'slim',
             pal: { main: '#d94f4f', dark: '#4a1717', light: '#ffb0a0', accent: '#f2f2f2', skin: '#7a4a2a', eye: '#fff6c9' } },
      base: { hp: 610, atk: 66, def: 24, mag: 30, res: 26, spd: 1.42, crit: 24, critDmg: 170, acc: 110, dodge: 22, lifesteal: 0.06, healPow: 0, cdr: 0.08 },
      growth: { hp: 62, atk: 6.2, def: 2.2, mag: 2.4, res: 2.2 },
      basic: { name: 'Corte de Vento', nameEn: 'Wind Cut', pow: 0.82, dmg: 'phys' },
      abilities: [
        { id: 'me_a1', type: 'active', name: 'Redemoinho Curto', nameEn: 'Short Whirlwind', cd: 7, target: 'allEnemies',
          desc: 'Gira pelo campo cortando todos os inimigos e reduzindo a defesa deles.',
          descEn: 'Spins across the field, cutting all enemies and shredding their defense.',
          acts: [{ k: 'dmg', dmg: 'phys', pow: 0.95 }, { k: 'debuff', stat: 'def', amt: -0.28, dur: 8 }] },
        { id: 'me_a2', type: 'active', name: 'Some e Aparece', nameEn: 'Here and Gone', cd: 12, target: 'self',
          desc: 'Desaparece por instantes: esquiva quase garantida e velocidade aumentada.',
          descEn: 'Vanishes for a moment: near-guaranteed dodge and boosted speed.',
          acts: [{ k: 'buff', stat: 'dodge', amt: 0.45, dur: 6, flat: true }, { k: 'buff', stat: 'spd', amt: 0.35, dur: 8 }] },
        { id: 'me_p', type: 'passive', name: 'Pé no Vento', nameEn: 'Foot on the Wind',
          desc: 'Ao esquivar, ganha 20 de energia e o próximo ataque causa dano crítico garantido.',
          descEn: 'On dodge, gains 20 energy and the next attack is a guaranteed crit.',
          mods: { spd: 0.05 } },
        { id: 'me_u', type: 'ultimate', name: 'Rodamoinho Travesso', nameEn: 'Mischievous Cyclone', cd: 22, target: 'allEnemies',
          desc: 'Levanta um redemoinho que atinge todos várias vezes e atordoa os mais lentos.',
          descEn: 'Raises a cyclone that strikes everyone repeatedly and stuns the slowest.',
          acts: [{ k: 'dmg', dmg: 'phys', pow: 0.85, hits: 3 }, { k: 'status', st: 'stun', dur: 2, pot: 1, chance: 0.5 }, { k: 'status', st: 'slow', dur: 8, pot: 0.3 }] }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: 'bardo',
      name: 'Bardo do Boto', nameEn: 'Bard of the River Dolphin',
      cls: 'Bardo', clsEn: 'Bard', role: 'support',
      rarity: 'legendary', element: 'agua', region: 'rio',
      inspiration: 'Festas ribeirinhas, música e encantamentos das águas doces.',
      inspirationEn: 'Riverside festivities, music and freshwater enchantments.',
      bio: 'Chega de branco, dança com todo mundo e some antes do amanhecer. Ninguém sabe onde mora; todo mundo sabe suas músicas.',
      bioEn: 'He arrives in white, dances with everyone and slips away before dawn. Nobody knows where he lives; everybody knows his songs.',
      strengths: 'Fortalece o grupo inteiro, reduz recarga dos aliados, controla inimigos.',
      strengthsEn: 'Empowers the whole party, cuts ally cooldowns, controls enemies.',
      weaknesses: 'Depende do grupo, dano direto fraco, alvo de silêncio.',
      weaknessesEn: 'Team dependent, weak direct damage, silence target.',
      art: { arch: 'humanoid', weapon: 'lute', hat: 'wide', cape: true, build: 'normal',
             pal: { main: '#e8e6f0', dark: '#5a5570', light: '#ffffff', accent: '#4fa8ff', skin: '#8a5a37', eye: '#bfe9ff' } },
      base: { hp: 720, atk: 34, def: 30, mag: 58, res: 44, spd: 0.96, crit: 8, critDmg: 150, acc: 102, dodge: 8, lifesteal: 0, healPow: 0.25, cdr: 0.15 },
      growth: { hp: 76, atk: 3.0, def: 3.0, mag: 5.4, res: 4.2 },
      basic: { name: 'Acorde Cortante', nameEn: 'Cutting Chord', pow: 0.95, dmg: 'mag' },
      abilities: [
        { id: 'ba_a1', type: 'active', name: 'Marcha das Águas', nameEn: 'March of the Waters', cd: 10, target: 'allAllies',
          desc: 'Uma toada animada: aumenta ataque, poder mágico e velocidade do grupo.',
          descEn: 'A lively tune: raises the party\'s attack, magic and speed.',
          acts: [{ k: 'buff', stat: 'atk', amt: 0.28, dur: 12 }, { k: 'buff', stat: 'mag', amt: 0.28, dur: 12 }, { k: 'buff', stat: 'spd', amt: 0.18, dur: 12 }] },
        { id: 'ba_a2', type: 'active', name: 'Encanto do Boto', nameEn: 'Dolphin\'s Charm', cd: 13, target: 'enemyHigh',
          desc: 'Encanta o inimigo mais forte, deixando-o lento, desatento e sem forças.',
          descEn: 'Charms the strongest enemy, leaving it slow, distracted and weakened.',
          acts: [{ k: 'dmg', dmg: 'mag', pow: 1.4 }, { k: 'debuff', stat: 'atk', amt: -0.35, dur: 10 }, { k: 'status', st: 'slow', dur: 8, pot: 0.35 }] },
        { id: 'ba_p', type: 'passive', name: 'Toada Constante', nameEn: 'Steady Refrain',
          desc: 'Todos os aliados ganham +12% de redução de recarga e +6 de energia a cada 5 segundos.',
          descEn: 'All allies gain +12% cooldown reduction and +6 energy every 5 seconds.',
          mods: { cdr: 0.05 } },
        { id: 'ba_u', type: 'ultimate', name: 'Festa das Encantarias', nameEn: 'Revel of the Enchanted', cd: 26, target: 'allAllies',
          desc: 'A festa começa: cura, energia máxima e um grande aumento de todos os atributos ofensivos.',
          descEn: 'The revel begins: healing, full energy and a large offensive boost.',
          acts: [{ k: 'heal', pow: 1.4 }, { k: 'energy', amt: 60 }, { k: 'buff', stat: 'atk', amt: 0.45, dur: 12 }, { k: 'buff', stat: 'mag', amt: 0.45, dur: 12 }, { k: 'buff', stat: 'crit', amt: 0.15, dur: 12, flat: true }] }
      ]
    }
  ];

  G.heroById = {};
  G.heroes.forEach((h) => { G.heroById[h.id] = h; });

  /* --------------------------------------------------------------
   * Gatilhos de passivas. O combate chama estes hooks pelo id.
   * Manter aqui evita espalhar regras especiais pelo motor.
   * ------------------------------------------------------------ */
  G.passiveHooks = {
    gu_p: {
      onTick(ctx, self, dt) {
        if (!self.alive) return;
        ctx.heal(self, self, self.max.hp * 0.015 * dt, { silent: true });
      },
      damageTakenMult(ctx, self, unit) {
        return unit !== self && unit.side === 'party' ? 0.88 : 1;
      }
    },
    ar_p: {
      onCrit(ctx, self, target) {
        const b = target.status.find((s) => s.st === 'burn');
        if (b) b.t = b.dur;
        ctx.addBuff(self, { stat: 'spd', amt: 0.08, dur: 4, stackId: 'ar_p', maxStacks: 3 });
      }
    },
    cu_p: {
      overhealToShield: 0.6,
      healBonusLowHp: 0.25
    },
    ca_p: {
      statMods(ctx, self) {
        if (self.hp / self.max.hp < 0.4) return { def: 0.3, lifesteal: 0.2 };
        return null;
      }
    },
    fe_p: {
      onSpell(ctx, self) {
        self.mem.spellCount = (self.mem.spellCount || 0) + 1;
        if (self.mem.spellCount % 3 === 0) { self.mem.empowered = true; }
      },
      damageDealtMult(ctx, self) {
        if (self.mem.empowered) { self.mem.empowered = false; return 1.6; }
        return 1;
      }
    },
    cc_p: {
      damageDealtMult(ctx, self, target) {
        return target && (target.kind === 'elite' || target.kind === 'boss') ? 1.25 : 1;
      },
      onHit(ctx, self, target) {
        if (target.status.some((s) => s.stat === 'dmgTaken')) {
          ctx.addBuff(self, { stat: 'critDmg', amt: 0.04, dur: 999, stackId: 'cc_p', maxStacks: 15 });
        }
      }
    },
    me_p: {
      onDodge(ctx, self) {
        self.energy = Math.min(100, self.energy + 20);
        self.mem.guaranteedCrit = true;
      }
    },
    ba_p: {
      onStart(ctx, self) {
        for (const a of ctx.party) if (a.alive) ctx.addBuff(a, { stat: 'cdr', amt: 0.12, dur: 9999, flat: true, stackId: 'ba_p' });
      },
      onTick(ctx, self, dt) {
        self.mem.pulse = (self.mem.pulse || 0) + dt;
        if (self.mem.pulse >= 5) {
          self.mem.pulse = 0;
          for (const a of ctx.party) if (a.alive) a.energy = Math.min(100, a.energy + 6);
        }
      }
    }
  };
})();
