/* =============================================================
 * data/enemies.js — bestiário: 32 comuns, 8 elites, 6 chefes.
 * statMod multiplica a base escalada do estágio (ver balance.enemy).
 * Todas as criaturas são interpretações ficcionais livres.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});

  const P = {
    mata: { main: '#3f7a3f', dark: '#1b3a1e', light: '#8ed57f', accent: '#d8b24a', skin: '#6b8f4a', eye: '#ffe66a' },
    sombra: { main: '#4a3a63', dark: '#1a1226', light: '#a98ad8', accent: '#ff6ba8', skin: '#3b2f4d', eye: '#ff5f7e' },
    agua: { main: '#2f7fb0', dark: '#0f3350', light: '#8fdcff', accent: '#cdf3ff', skin: '#3f93bd', eye: '#dff8ff' },
    fogo: { main: '#c4451f', dark: '#4e1206', light: '#ffb03a', accent: '#ffe08a', skin: '#8a2f14', eye: '#fff3b0' },
    terra: { main: '#8a6a3a', dark: '#3a2a16', light: '#d3b076', accent: '#a8a8a8', skin: '#6f5730', eye: '#ffd88a' },
    vento: { main: '#79a8b8', dark: '#2c4a55', light: '#d6f4ff', accent: '#ffffff', skin: '#5e8896', eye: '#eaffff' },
    osso: { main: '#d8d2bd', dark: '#5c5545', light: '#fdf8e6', accent: '#8a7d5a', skin: '#c9c2aa', eye: '#7fffbf' },
    lama: { main: '#5c5230', dark: '#241f10', light: '#9a8c56', accent: '#6f9a5a', skin: '#463d22', eye: '#c8ff8a' },
    cristal: { main: '#5f8fd6', dark: '#22355e', light: '#bfe4ff', accent: '#ff9ce0', skin: '#4a6fa8', eye: '#ffffff' },
    festa: { main: '#c74fa0', dark: '#4a163a', light: '#ffb6e6', accent: '#ffd94a', skin: '#8a3a6a', eye: '#fff3b0' }
  };

  /* helpers de habilidade curtos */
  const dmg = (pow, type) => ({ k: 'dmg', dmg: type || 'phys', pow: pow });
  const st = (s, dur, pot, chance) => ({ k: 'status', st: s, dur: dur, pot: pot, chance: chance === undefined ? 1 : chance });
  const deb = (stat, amt, dur) => ({ k: 'debuff', stat: stat, amt: amt, dur: dur });
  const buf = (stat, amt, dur) => ({ k: 'buff', stat: stat, amt: amt, dur: dur });

  /* ============================ COMUNS ============================ */
  G.enemiesNormal = [
    { id: 'jaguatirica', name: 'Jaguatirica Sombria', nameEn: 'Shadow Ocelot', cat: 'corrompidos', element: 'sombra',
      art: { arch: 'beast', pal: P.sombra, horns: false, tail: true }, mod: { hp: 0.85, atk: 1.2, spd: 1.25 },
      lore: 'Gato do mato que atravessou névoa demais e voltou com os olhos apagados.',
      loreEn: 'A wildcat that walked through too much mist and returned with dimmed eyes.',
      abilities: [{ id: 'e_pounce', name: 'Bote Silencioso', nameEn: 'Silent Pounce', cd: 7, target: 'allyLowEnemy', acts: [dmg(1.6), st('slow', 4, 0.2)] }] },
    { id: 'raiz', name: 'Raiz Devoradora', nameEn: 'Devouring Root', cat: 'plantas', element: 'mata',
      art: { arch: 'plant', pal: P.mata, vines: true }, mod: { hp: 1.5, atk: 0.85, spd: 0.7 },
      lore: 'Cresce onde alguém enterrou algo que não devia.',
      loreEn: 'It grows where somebody buried what they should not have.',
      abilities: [{ id: 'e_grab', name: 'Agarrão', nameEn: 'Grasp', cd: 8, target: 'enemyRandom', acts: [dmg(1.2), st('slow', 6, 0.3)] }] },
    { id: 'caranguejo', name: 'Caranguejo Encantado', nameEn: 'Enchanted Crab', cat: 'rio', element: 'agua',
      art: { arch: 'crab', pal: P.agua }, mod: { hp: 1.3, def: 1.5, atk: 0.9, spd: 0.85 },
      lore: 'Anda de lado até em linha reta. Ninguém entende, ele também não.',
      loreEn: 'It walks sideways even in a straight line. Nobody understands it; neither does it.',
      abilities: [{ id: 'e_shell', name: 'Casca Dura', nameEn: 'Hard Shell', cd: 12, target: 'self', acts: [buf('def', 0.5, 8)] }] },
    { id: 'morcego', name: 'Morcego de Cristal', nameEn: 'Crystal Bat', cat: 'cavernas', element: 'vento',
      art: { arch: 'bat', pal: P.cristal }, mod: { hp: 0.7, atk: 1.0, spd: 1.4, dodge: 2 },
      lore: 'As asas tilintam. É bonito até ele chegar perto.',
      loreEn: 'Its wings chime. Lovely, until it gets close.',
      abilities: [{ id: 'e_screech', name: 'Guincho', nameEn: 'Screech', cd: 9, target: 'allEnemies', acts: [dmg(0.7, 'mag'), deb('acc', -0.15, 6)] }] },
    { id: 'lobisomem', name: 'Lobisomem do Cerrado', nameEn: 'Cerrado Werebeast', cat: 'corrompidos', element: 'vento',
      art: { arch: 'beast', pal: { main: '#6b5340', dark: '#2b1f16', light: '#c2a488', accent: '#ff8a5a', skin: '#4a3828', eye: '#ffe066' }, horns: false, tail: true, biped: true },
      mod: { hp: 1.2, atk: 1.35, spd: 1.1 },
      lore: 'Sete voltas no cruzeiro e ninguém contou direito. Agora corre nas noites secas.',
      loreEn: 'Seven turns at the crossing and nobody counted right. Now it runs on dry nights.',
      abilities: [{ id: 'e_rend', name: 'Dilacerar', nameEn: 'Rend', cd: 7, target: 'enemyLow', acts: [dmg(1.5), st('poison', 6, 0.15)] }] },
    { id: 'cuca_ap', name: 'Cuca Aprendiz', nameEn: 'Apprentice Hag', cat: 'espiritos', element: 'sombra',
      art: { arch: 'humanoid', pal: P.sombra, weapon: 'orb', hat: 'pointed', build: 'slim' }, mod: { hp: 0.9, mag: 1.4, atk: 0.6 },
      lore: 'Ainda erra os feitiços, mas erra com muita confiança.',
      loreEn: 'Still botches the spells, but botches them very confidently.',
      abilities: [{ id: 'e_hex', name: 'Praga Pequena', nameEn: 'Small Hex', cd: 8, target: 'enemyRandom', acts: [dmg(1.3, 'mag'), deb('def', -0.2, 6)] }] },
    { id: 'cobra_brasa', name: 'Cobra de Brasa', nameEn: 'Ember Snake', cat: 'fogo', element: 'fogo',
      art: { arch: 'serpent', pal: P.fogo }, mod: { hp: 0.9, atk: 1.25, spd: 1.15 },
      lore: 'Deixa um rastro morno na terra que dura até o orvalho.',
      loreEn: 'It leaves a warm trail in the soil that lasts until the dew.',
      abilities: [{ id: 'e_bite', name: 'Mordida Quente', nameEn: 'Hot Bite', cd: 6, target: 'enemyLow', acts: [dmg(1.3), st('burn', 6, 0.18)] }] },
    { id: 'mangue', name: 'Espírito do Mangue', nameEn: 'Mangrove Spirit', cat: 'pantano', element: 'agua',
      art: { arch: 'spirit', pal: P.lama }, mod: { hp: 1.0, mag: 1.3, res: 1.3, dodge: 3 },
      lore: 'Cheira a maré baixa e a segredo guardado.',
      loreEn: 'It smells of low tide and kept secrets.',
      abilities: [{ id: 'e_mire', name: 'Atolar', nameEn: 'Mire', cd: 9, target: 'allEnemies', acts: [st('slow', 6, 0.25), dmg(0.6, 'mag')] }] },
    { id: 'golem_barro', name: 'Golem de Barro', nameEn: 'Clay Golem', cat: 'ruinas', element: 'terra',
      art: { arch: 'golem', pal: P.lama }, mod: { hp: 2.0, def: 1.6, atk: 1.0, spd: 0.65 },
      lore: 'Feito às pressas por alguém com pressa e pouca prática.',
      loreEn: 'Made in a hurry by someone in a hurry with little practice.',
      abilities: [{ id: 'e_slam', name: 'Pancada', nameEn: 'Slam', cd: 9, target: 'enemyHigh', acts: [dmg(1.7), st('stun', 1.2, 1, 0.35)] }] },
    { id: 'capanga', name: 'Capanga do Nevoeiro', nameEn: 'Fog Ruffian', cat: 'bandidos', element: 'sombra',
      art: { arch: 'humanoid', pal: { main: '#4a4a5a', dark: '#1d1d26', light: '#8f8fa8', accent: '#c0a060', skin: '#8a6242', eye: '#ffdd99' }, weapon: 'daggers', hat: 'hood', build: 'normal' },
      mod: { hp: 0.95, atk: 1.15, spd: 1.1, crit: 3 },
      lore: 'Cobra pedágio numa estrada que ninguém construiu.',
      loreEn: 'Charges a toll on a road nobody ever built.',
      abilities: [{ id: 'e_ambush', name: 'Emboscada', nameEn: 'Ambush', cd: 8, target: 'enemyLow', acts: [dmg(1.7), deb('def', -0.2, 6)] }] },
    { id: 'aranha_cipo', name: 'Aranha de Cipó', nameEn: 'Vine Spider', cat: 'floresta', element: 'mata',
      art: { arch: 'insect', pal: P.mata, legs: 8 }, mod: { hp: 0.8, atk: 1.1, spd: 1.2 },
      lore: 'Tece com fibra vegetal. A teia dá nó em quem pensa demais.',
      loreEn: 'Weaves with plant fiber. The web knots anyone who overthinks.',
      abilities: [{ id: 'e_web', name: 'Teia', nameEn: 'Web', cd: 7, target: 'enemyRandom', acts: [dmg(0.9), st('slow', 6, 0.35), st('poison', 5, 0.12)] }] },
    { id: 'onca', name: 'Onça Corrompida', nameEn: 'Corrupted Jaguar', cat: 'corrompidos', element: 'sombra',
      art: { arch: 'beast', pal: { main: '#c9a13a', dark: '#3a2a10', light: '#ffe08a', accent: '#5a2a6a', skin: '#8a6a20', eye: '#c07bff' }, tail: true },
      mod: { hp: 1.15, atk: 1.4, spd: 1.2, crit: 5 },
      lore: 'A pintagem virou sombra e a sombra virou fome.',
      loreEn: 'The spots became shadow and the shadow became hunger.',
      abilities: [{ id: 'e_maul', name: 'Dilaceração', nameEn: 'Maul', cd: 6, target: 'enemyLow', acts: [dmg(1.8)] }] },
    { id: 'boneco', name: 'Boneco de Palha Assombrado', nameEn: 'Haunted Straw Doll', cat: 'espiritos', element: 'fogo',
      art: { arch: 'humanoid', pal: { main: '#c9a860', dark: '#4a3a18', light: '#f2dc9a', accent: '#b03a3a', skin: '#c9a860', eye: '#ff5f3a' }, weapon: 'none', hat: 'none', build: 'slim' },
      mod: { hp: 0.75, atk: 1.1, spd: 1.05 },
      lore: 'Alguém o fez para espantar passarinho. Funcionou demais.',
      loreEn: 'Someone made it to scare birds. It worked far too well.',
      abilities: [{ id: 'e_flare', name: 'Estopim', nameEn: 'Fuse', cd: 10, target: 'allEnemies', acts: [dmg(0.9, 'mag'), st('burn', 5, 0.15)] }] },
    { id: 'guardiao_pedra', name: 'Guardião de Pedra', nameEn: 'Stone Guardian', cat: 'ruinas', element: 'terra',
      art: { arch: 'golem', pal: { main: '#7a7a86', dark: '#2e2e36', light: '#c2c2ce', accent: '#4fd0c0', skin: '#5a5a66', eye: '#4fd0c0' } },
      mod: { hp: 2.2, def: 1.8, atk: 1.05, spd: 0.6 },
      lore: 'Guarda uma porta que não existe mais há duzentos anos.',
      loreEn: 'It guards a door that stopped existing two hundred years ago.',
      abilities: [{ id: 'e_quake', name: 'Tremor', nameEn: 'Quake', cd: 11, target: 'allEnemies', acts: [dmg(1.0), st('stun', 1.0, 1, 0.25)] }] },
    { id: 'peixe', name: 'Peixe Abissal do Rio', nameEn: 'Abyssal River Fish', cat: 'rio', element: 'agua',
      art: { arch: 'fish', pal: { main: '#2a4a6a', dark: '#0d1c2c', light: '#7fd8ff', accent: '#a0ff9c', skin: '#1e3a52', eye: '#c6ff6a' } },
      mod: { hp: 1.1, mag: 1.3, spd: 0.95 },
      lore: 'Vive onde a luz desiste. Tem dentes por precaução.',
      loreEn: 'Lives where light gives up. It has teeth just in case.',
      abilities: [{ id: 'e_gulp', name: 'Sorvedouro', nameEn: 'Gulp', cd: 9, target: 'enemyLow', acts: [dmg(1.5, 'mag'), { k: 'drain', pow: 0.4 }] }] },
    { id: 'sapo', name: 'Sapo do Charco Inchado', nameEn: 'Bloated Marsh Toad', cat: 'pantano', element: 'mata',
      art: { arch: 'beast', pal: { main: '#5a7a2a', dark: '#22300f', light: '#a8d05a', accent: '#d0e05a', skin: '#3f5a1a', eye: '#ffe066' }, fat: true },
      mod: { hp: 1.6, atk: 0.9, spd: 0.75 },
      lore: 'Engole vaga-lume e acende por dentro.',
      loreEn: 'Swallows fireflies and glows from the inside.',
      abilities: [{ id: 'e_spit', name: 'Cusparada', nameEn: 'Spit', cd: 8, target: 'enemyRandom', acts: [dmg(1.1, 'mag'), st('poison', 8, 0.16)] }] },
    { id: 'urubu', name: 'Urubu-Sentinela', nameEn: 'Sentinel Vulture', cat: 'cerrado', element: 'vento',
      art: { arch: 'bird', pal: { main: '#3a3a42', dark: '#16161c', light: '#7a7a86', accent: '#d05a2a', skin: '#2a2a30', eye: '#ffb445' } },
      mod: { hp: 0.85, atk: 1.15, spd: 1.3, dodge: 4 },
      lore: 'Chega antes da má notícia e fica olhando.',
      loreEn: 'Arrives before the bad news and just watches.',
      abilities: [{ id: 'e_dive', name: 'Rasante', nameEn: 'Dive', cd: 7, target: 'enemyLow', acts: [dmg(1.5), deb('spd', -0.2, 6)] }] },
    { id: 'formiga', name: 'Formiga-Soldado Gigante', nameEn: 'Giant Soldier Ant', cat: 'floresta', element: 'terra',
      art: { arch: 'insect', pal: { main: '#8a3a1a', dark: '#3a1408', light: '#d97a4a', accent: '#2a2a2a', skin: '#6a2a12', eye: '#ffcc66' }, legs: 6 },
      mod: { hp: 1.1, atk: 1.2, def: 1.2, spd: 1.0 },
      lore: 'Nunca vem sozinha. Nunca.',
      loreEn: 'It never comes alone. Never.',
      abilities: [{ id: 'e_mand', name: 'Mandíbula', nameEn: 'Mandible', cd: 6, target: 'enemyHigh', acts: [dmg(1.4), deb('def', -0.15, 5)] }] },
    { id: 'vagalume', name: 'Vaga-Lume Colossal', nameEn: 'Colossal Firefly', cat: 'floresta', element: 'fogo',
      art: { arch: 'insect', pal: { main: '#3a3a1a', dark: '#161608', light: '#ffe066', accent: '#a8ff5a', skin: '#2a2a12', eye: '#ffff9c' }, legs: 6, glow: true },
      mod: { hp: 0.8, mag: 1.35, spd: 1.15 },
      lore: 'Ilumina a trilha e cobra por isso.',
      loreEn: 'Lights the trail and charges for it.',
      abilities: [{ id: 'e_flash', name: 'Clarão', nameEn: 'Flash', cd: 9, target: 'allEnemies', acts: [dmg(0.8, 'mag'), deb('acc', -0.2, 6)] }] },
    { id: 'saci_falso', name: 'Redemoinho Travesso', nameEn: 'Mischief Whirl', cat: 'tempestade', element: 'vento',
      art: { arch: 'spirit', pal: P.vento, swirl: true }, mod: { hp: 0.7, atk: 1.0, spd: 1.5, dodge: 8 },
      lore: 'Não é ninguém, é só o vento fazendo piada.',
      loreEn: 'It is nobody, just the wind cracking a joke.',
      abilities: [{ id: 'e_spin', name: 'Rodopio', nameEn: 'Spin', cd: 6, target: 'allEnemies', acts: [dmg(0.75), deb('acc', -0.15, 5)] }] },
    { id: 'cipo_negro', name: 'Cipó Negro', nameEn: 'Black Creeper', cat: 'plantas', element: 'sombra',
      art: { arch: 'plant', pal: P.sombra, vines: true }, mod: { hp: 1.4, mag: 1.2, spd: 0.8 },
      lore: 'Aperta devagar para você não notar.',
      loreEn: 'It tightens slowly so you will not notice.',
      abilities: [{ id: 'e_choke', name: 'Sufocar', nameEn: 'Choke', cd: 9, target: 'enemyRandom', acts: [dmg(1.1, 'mag'), st('silence', 3, 1, 0.4)] }] },
    { id: 'lama_viva', name: 'Lama Viva', nameEn: 'Living Mud', cat: 'pantano', element: 'terra',
      art: { arch: 'blob', pal: P.lama }, mod: { hp: 1.8, def: 1.3, atk: 0.85, spd: 0.7 },
      lore: 'Já foi caminho. Cansou de ser pisada.',
      loreEn: 'It used to be a path. It got tired of being stepped on.',
      abilities: [{ id: 'e_engulf', name: 'Engolir', nameEn: 'Engulf', cd: 10, target: 'enemyHigh', acts: [dmg(1.2), st('slow', 8, 0.4)] }] },
    { id: 'cristal_v', name: 'Cristalino Vivo', nameEn: 'Living Crystal', cat: 'cavernas', element: 'agua',
      art: { arch: 'golem', pal: P.cristal, crystal: true }, mod: { hp: 1.4, res: 1.8, mag: 1.3, spd: 0.8 },
      lore: 'Repete o que você diz, três minutos depois.',
      loreEn: 'It repeats what you say, three minutes later.',
      abilities: [{ id: 'e_refract', name: 'Refração', nameEn: 'Refraction', cd: 10, target: 'allEnemies', acts: [dmg(1.0, 'mag'), deb('res', -0.2, 8)] }] },
    { id: 'mula_fogo', name: 'Corcel de Brasa', nameEn: 'Ember Steed', cat: 'fogo', element: 'fogo',
      art: { arch: 'beast', pal: P.fogo, mane: true }, mod: { hp: 1.25, atk: 1.35, spd: 1.2 },
      lore: 'Galopa sem tocar o chão e deixa cheiro de fumaça.',
      loreEn: 'It gallops without touching the ground and leaves a smell of smoke.',
      abilities: [{ id: 'e_trample', name: 'Atropelo', nameEn: 'Trample', cd: 8, target: 'allEnemies', acts: [dmg(1.0), st('burn', 5, 0.15)] }] },
    { id: 'ossada', name: 'Ossada Andante', nameEn: 'Walking Bones', cat: 'espiritos', element: 'sombra',
      art: { arch: 'humanoid', pal: P.osso, weapon: 'greatsword', hat: 'none', build: 'slim', skeletal: true },
      mod: { hp: 0.9, atk: 1.25, def: 0.8, spd: 1.05 },
      lore: 'Esqueceu de deitar quando acabou.',
      loreEn: 'It forgot to lie down when it was over.',
      abilities: [{ id: 'e_reap', name: 'Ceifar', nameEn: 'Reap', cd: 7, target: 'enemyLow', acts: [dmg(1.6), { k: 'drain', pow: 0.3 }] }] },
    { id: 'mascara', name: 'Máscara Dançante', nameEn: 'Dancing Mask', cat: 'espiritos', element: 'vento',
      art: { arch: 'spirit', pal: P.festa, mask: true }, mod: { hp: 0.95, mag: 1.3, spd: 1.25, dodge: 6 },
      lore: 'Ninguém lembra quem a estava usando.',
      loreEn: 'Nobody remembers who was wearing it.',
      abilities: [{ id: 'e_confuse', name: 'Baile Confuso', nameEn: 'Confusing Dance', cd: 9, target: 'allEnemies', acts: [dmg(0.85, 'mag'), deb('crit', -0.4, 8)] }] },
    { id: 'jacare', name: 'Jacaré das Sombras', nameEn: 'Shadow Caiman', cat: 'rio', element: 'agua',
      art: { arch: 'beast', pal: { main: '#3a5a3a', dark: '#152415', light: '#7fa86a', accent: '#d9d9c0', skin: '#2a4028', eye: '#ffcc44' }, tail: true, long: true },
      mod: { hp: 1.5, atk: 1.3, def: 1.2, spd: 0.85 },
      lore: 'Fica parado tanto tempo que vira paisagem.',
      loreEn: 'It stays still so long it becomes scenery.',
      abilities: [{ id: 'e_roll', name: 'Rodopio d\'Água', nameEn: 'Death Roll', cd: 9, target: 'enemyHigh', acts: [dmg(1.9), st('stun', 1.2, 1, 0.3)] }] },
    { id: 'nevoa', name: 'Névoa Faminta', nameEn: 'Hungry Mist', cat: 'espiritos', element: 'sombra',
      art: { arch: 'spirit', pal: { main: '#6a6a86', dark: '#26262e', light: '#c6c6e0', accent: '#ff6ba8', skin: '#4a4a60', eye: '#ff6ba8' } },
      mod: { hp: 1.0, mag: 1.4, res: 1.4, dodge: 5 },
      lore: 'Entra pelas frestas e sai pelas lembranças.',
      loreEn: 'It comes in through the cracks and leaves through your memories.',
      abilities: [{ id: 'e_drain', name: 'Sorver', nameEn: 'Siphon', cd: 8, target: 'enemyRandom', acts: [dmg(1.3, 'mag'), { k: 'drain', pow: 0.5 }] }] },
    { id: 'tatu_ferro', name: 'Tatu-de-Ferro', nameEn: 'Iron Armadillo', cat: 'cavernas', element: 'terra',
      art: { arch: 'beast', pal: { main: '#7a6a5a', dark: '#2e2820', light: '#c2b09a', accent: '#8fa8b8', skin: '#5a4e42', eye: '#ffd88a' }, shell: true },
      mod: { hp: 1.9, def: 2.0, atk: 0.95, spd: 0.7 },
      lore: 'Cava mais rápido do que você corre.',
      loreEn: 'It digs faster than you run.',
      abilities: [{ id: 'e_curl', name: 'Rolagem', nameEn: 'Roll', cd: 10, target: 'allEnemies', acts: [dmg(1.1), buf('def', 0.4, 8)] }] },
    { id: 'vento_uivante', name: 'Uivo de Ventania', nameEn: 'Howling Gale', cat: 'tempestade', element: 'vento',
      art: { arch: 'spirit', pal: { main: '#8fb8d0', dark: '#2c4658', light: '#e8fbff', accent: '#ffe066', skin: '#6a94ac', eye: '#ffffff' }, swirl: true },
      mod: { hp: 0.9, mag: 1.35, spd: 1.35 },
      lore: 'Grita o nome de quem não devia ter ido embora.',
      loreEn: 'It howls the name of whoever should not have left.',
      abilities: [{ id: 'e_gust', name: 'Rajada', nameEn: 'Gust', cd: 7, target: 'allEnemies', acts: [dmg(0.95, 'mag'), deb('spd', -0.18, 6)] }] },
    { id: 'raiz_cristal', name: 'Raiz Cristalizada', nameEn: 'Crystallized Root', cat: 'plantas', element: 'terra',
      art: { arch: 'plant', pal: P.cristal, crystal: true }, mod: { hp: 1.6, def: 1.4, mag: 1.2, spd: 0.75 },
      lore: 'Cresceu perto demais da veia de cristal e virou outra coisa.',
      loreEn: 'It grew too close to the crystal vein and became something else.',
      abilities: [{ id: 'e_spike', name: 'Espinho de Cristal', nameEn: 'Crystal Spike', cd: 9, target: 'enemyHigh', acts: [dmg(1.5, 'mag'), deb('res', -0.2, 8)] }] },
    { id: 'sombra_ruina', name: 'Sombra das Ruínas', nameEn: 'Ruin Shade', cat: 'sombras', element: 'sombra',
      art: { arch: 'spirit', pal: { main: '#2e2440', dark: '#100a1a', light: '#7a5ea8', accent: '#ff5f7e', skin: '#241c33', eye: '#ff5f7e' } },
      mod: { hp: 1.15, atk: 1.25, mag: 1.25, dodge: 6 },
      lore: 'Copia o gesto de quem passa, com um segundo de atraso.',
      loreEn: 'It copies the gestures of passersby, one second late.',
      abilities: [{ id: 'e_mimic', name: 'Cópia Sombria', nameEn: 'Shadow Mimic', cd: 9, target: 'enemyHigh', acts: [dmg(1.6, 'mag'), deb('atk', -0.2, 8)] }] },
    { id: 'peixe_boi', name: 'Guardião das Correntezas', nameEn: 'Warden of the Currents', cat: 'rio', element: 'agua',
      art: { arch: 'fish', pal: { main: '#4a6a7a', dark: '#1a2a34', light: '#a8d8e8', accent: '#8aff9c', skin: '#3a5460', eye: '#d8ffe8' }, big: true },
      mod: { hp: 1.7, def: 1.3, mag: 1.2, spd: 0.75 },
      lore: 'Empurra os barcos para longe do perigo — e às vezes para dentro dele.',
      loreEn: 'It pushes boats away from danger, and sometimes right into it.',
      abilities: [{ id: 'e_wave', name: 'Onda', nameEn: 'Wave', cd: 10, target: 'allEnemies', acts: [dmg(1.0, 'mag'), st('slow', 6, 0.25)] }] },
    { id: 'palhaco', name: 'Folião Mascarado', nameEn: 'Masked Reveler', cat: 'bandidos', element: 'vento',
      art: { arch: 'humanoid', pal: P.festa, weapon: 'daggers', hat: 'mask', build: 'normal' },
      mod: { hp: 1.0, atk: 1.2, spd: 1.25, crit: 6 },
      lore: 'Rouba carteiras enquanto todos batem palma.',
      loreEn: 'Lifts wallets while everyone claps.',
      abilities: [{ id: 'e_trick', name: 'Truque Sujo', nameEn: 'Dirty Trick', cd: 8, target: 'enemyLow', acts: [dmg(1.5), deb('acc', -0.2, 6)] }] }
  ];

  /* ============================ ELITES ============================ */
  G.enemiesElite = [
    { id: 'el_curupira', name: 'Curupira Zeloso', nameEn: 'Zealous Curupira', cat: 'floresta', element: 'mata',
      art: { arch: 'humanoid', pal: { main: '#c9452a', dark: '#4a1408', light: '#ff8a5a', accent: '#5fd08a', skin: '#a86a3a', eye: '#8aff5a' }, weapon: 'spear', hat: 'hair', build: 'slim', backwards: true },
      mod: { hp: 1.0, atk: 1.2, spd: 1.3, dodge: 8 },
      lore: 'Protege a mata com rigor e sarcasmo. Confunde caçadores por esporte.',
      loreEn: 'Guards the woods with rigor and sarcasm. Confuses hunters for sport.',
      abilities: [
        { id: 'ele_c1', name: 'Trilha Falsa', nameEn: 'False Trail', cd: 8, target: 'allEnemies', acts: [deb('acc', -0.3, 8), dmg(1.0)] },
        { id: 'ele_c2', name: 'Lança de Cerne', nameEn: 'Heartwood Spear', cd: 6, target: 'enemyLow', acts: [dmg(2.0), st('poison', 6, 0.2)] }] },
    { id: 'el_iara', name: 'Eco de Iara', nameEn: 'Echo of the River Maid', cat: 'rio', element: 'agua',
      art: { arch: 'spirit', pal: { main: '#2f8fbf', dark: '#0f3350', light: '#bff0ff', accent: '#8aff9c', skin: '#3f93bd', eye: '#ffffff' }, hair: true },
      mod: { hp: 1.1, mag: 1.5, res: 1.4 },
      lore: 'Um canto que sobrou na água depois que a canção terminou.',
      loreEn: 'A song left in the water after the singing stopped.',
      abilities: [
        { id: 'ele_i1', name: 'Canto Sedutor', nameEn: 'Luring Song', cd: 10, target: 'enemyHigh', acts: [dmg(1.6, 'mag'), st('silence', 4, 1, 0.7)] },
        { id: 'ele_i2', name: 'Maré Alta', nameEn: 'High Tide', cd: 12, target: 'allEnemies', acts: [dmg(1.3, 'mag'), st('slow', 8, 0.3)] }] },
    { id: 'el_boi', name: 'Touro Encantado', nameEn: 'Enchanted Bull', cat: 'cerrado', element: 'terra',
      art: { arch: 'beast', pal: { main: '#3a2a2a', dark: '#150e0e', light: '#8a6a5a', accent: '#ffd94a', skin: '#2a1e1e', eye: '#ff5f3a' }, horns: true, big: true },
      mod: { hp: 1.4, atk: 1.35, def: 1.3, spd: 0.9 },
      lore: 'Enfeitado para a festa e nunca devolvido ao pasto.',
      loreEn: 'Decorated for the festival and never returned to the pasture.',
      abilities: [
        { id: 'ele_b1', name: 'Investida', nameEn: 'Charge', cd: 7, target: 'enemyHigh', acts: [dmg(2.1), st('stun', 1.5, 1, 0.5)] },
        { id: 'ele_b2', name: 'Bufo Furioso', nameEn: 'Furious Snort', cd: 12, target: 'self', acts: [buf('atk', 0.4, 10), buf('spd', 0.2, 10)] }] },
    { id: 'el_matinta', name: 'Assobio da Meia-Noite', nameEn: 'Midnight Whistle', cat: 'espiritos', element: 'sombra',
      art: { arch: 'bird', pal: { main: '#3a2a4a', dark: '#150e1e', light: '#a98ad8', accent: '#ffe066', skin: '#2a1e36', eye: '#ffe066' }, big: true },
      mod: { hp: 1.05, mag: 1.5, spd: 1.2, dodge: 10 },
      lore: 'Assobia três vezes. Na terceira, alguém sempre atende.',
      loreEn: 'It whistles three times. On the third, someone always answers.',
      abilities: [
        { id: 'ele_m1', name: 'Assobio Agudo', nameEn: 'Shrill Whistle', cd: 8, target: 'allEnemies', acts: [dmg(1.2, 'mag'), st('silence', 3, 1, 0.4)] },
        { id: 'ele_m2', name: 'Voo Rasante', nameEn: 'Swoop', cd: 7, target: 'enemyLow', acts: [dmg(1.9, 'mag'), { k: 'drain', pow: 0.4 }] }] },
    { id: 'el_ferreiro', name: 'Ferreiro das Ruínas', nameEn: 'Ruin Smith', cat: 'ruinas', element: 'fogo',
      art: { arch: 'golem', pal: { main: '#6a4a3a', dark: '#281a12', light: '#c98a5a', accent: '#ff8a3a', skin: '#4a3226', eye: '#ff8a3a' }, forge: true },
      mod: { hp: 1.6, def: 1.5, atk: 1.25, spd: 0.8 },
      lore: 'Continua martelando uma espada que nunca fica pronta.',
      loreEn: 'Still hammering a sword that never gets finished.',
      abilities: [
        { id: 'ele_f1', name: 'Martelada Ardente', nameEn: 'Burning Hammer', cd: 8, target: 'enemyHigh', acts: [dmg(2.0), st('burn', 8, 0.22)] },
        { id: 'ele_f2', name: 'Faíscas', nameEn: 'Sparks', cd: 11, target: 'allEnemies', acts: [dmg(1.1, 'mag'), st('burn', 6, 0.16)] }] },
    { id: 'el_cacador', name: 'Caçador Perdido', nameEn: 'Lost Hunter', cat: 'bandidos', element: 'vento',
      art: { arch: 'humanoid', pal: { main: '#5a5a3a', dark: '#22220f', light: '#a8a86a', accent: '#d05a2a', skin: '#8a6242', eye: '#ffdd99' }, weapon: 'crossbow', hat: 'wide', build: 'normal' },
      mod: { hp: 1.2, atk: 1.45, spd: 1.15, crit: 8 },
      lore: 'Entrou na mata atrás de fama. Saiu com outra coisa.',
      loreEn: 'He entered the woods chasing fame. He came out with something else.',
      abilities: [
        { id: 'ele_h1', name: 'Tiro Preciso', nameEn: 'Precise Shot', cd: 6, target: 'enemyLow', acts: [dmg(2.3)] },
        { id: 'ele_h2', name: 'Armadilha', nameEn: 'Trap', cd: 10, target: 'enemyRandom', acts: [dmg(1.2), st('stun', 2, 1, 0.6), st('poison', 8, 0.2)] }] },
    { id: 'el_cristal', name: 'Colosso de Cristal', nameEn: 'Crystal Colossus', cat: 'cavernas', element: 'agua',
      art: { arch: 'golem', pal: P.cristal, crystal: true, big: true },
      mod: { hp: 2.2, def: 1.7, res: 1.9, mag: 1.35, spd: 0.65 },
      lore: 'Reflete quem olha por tempo demais. O reflexo às vezes acena.',
      loreEn: 'It reflects whoever stares too long. Sometimes the reflection waves.',
      abilities: [
        { id: 'ele_x1', name: 'Prisma', nameEn: 'Prism', cd: 9, target: 'allEnemies', acts: [dmg(1.3, 'mag'), deb('res', -0.3, 10)] },
        { id: 'ele_x2', name: 'Casca Espelhada', nameEn: 'Mirrored Shell', cd: 14, target: 'self', acts: [buf('res', 0.6, 10), buf('def', 0.4, 10)] }] },
    { id: 'el_sombra', name: 'Arauto do Eclipse', nameEn: 'Eclipse Herald', cat: 'sombras', element: 'sombra',
      art: { arch: 'humanoid', pal: { main: '#2a1c3a', dark: '#0d0715', light: '#7a5ea8', accent: '#ff5f7e', skin: '#1a1226', eye: '#ff5f7e' }, weapon: 'scythe', hat: 'hood', cape: true, build: 'slim' },
      mod: { hp: 1.5, atk: 1.4, mag: 1.5, spd: 1.05 },
      lore: 'Anuncia o que vem depois. Nunca explica o quê.',
      loreEn: 'It announces what comes next. It never explains what.',
      abilities: [
        { id: 'ele_s1', name: 'Foice Sombria', nameEn: 'Shadow Scythe', cd: 7, target: 'enemyLow', acts: [dmg(2.1), { k: 'drain', pow: 0.35 }] },
        { id: 'ele_s2', name: 'Manto do Eclipse', nameEn: 'Eclipse Mantle', cd: 12, target: 'allEnemies', acts: [dmg(1.3, 'mag'), deb('atk', -0.25, 10), deb('mag', -0.25, 10)] }] }
  ];

  /* ============================ CHEFES ============================ */
  /* Cada chefe tem 2+ fases. `at` = fração de vida em que a fase começa. */
  G.bosses = [
    {
      id: 'boitata', name: 'Boitatá, a Serpente de Fogo', nameEn: 'Boitata, the Flame Serpent',
      cat: 'chefe', element: 'fogo', region: 'sertao',
      art: { arch: 'serpent', pal: { main: '#d9451f', dark: '#4e1206', light: '#ffc martian' }, boss: true },
      mod: { hp: 1.0, atk: 1.0 },
      lore: 'Dizem que ela guarda o campo dos que ateiam fogo à toa. O fragmento a deixou faminta demais para distinguir quem é quem.',
      loreEn: 'They say it guards the fields from those who set careless fires. The fragment left it too hungry to tell who is who.',
      entrance: 'O chão esquenta. Uma linha de fogo desenha um círculo ao redor do grupo.',
      entranceEn: 'The ground warms. A line of fire draws a circle around the party.',
      drops: ['nucleo_lendario', 'brasa_eterna'],
      phases: [
        { at: 1.0, name: 'Rastro de Fogo', nameEn: 'Trail of Fire',
          abilities: [
            { id: 'bo_1', name: 'Chicote Flamejante', nameEn: 'Flame Lash', cd: 6, tell: 1.0, target: 'enemyHigh', acts: [dmg(1.9), st('burn', 6, 0.2)] },
            { id: 'bo_2', name: 'Anel de Brasas', nameEn: 'Ember Ring', cd: 11, tell: 1.4, target: 'allEnemies', acts: [dmg(1.3, 'mag'), st('burn', 8, 0.25)] }] },
        { at: 0.5, name: 'Muralha de Chamas', nameEn: 'Wall of Flames', mods: { atk: 0.35, spd: 0.25 },
          announce: 'A serpente ergue uma muralha de chamas! O calor queima quem hesita.',
          announceEn: 'The serpent raises a wall of flames! The heat burns the hesitant.',
          abilities: [
            { id: 'bo_3', name: 'Muralha de Chamas', nameEn: 'Wall of Flames', cd: 9, tell: 1.6, target: 'allEnemies', acts: [dmg(1.7, 'mag'), st('burn', 10, 0.3), deb('res', -0.25, 10)] },
            { id: 'bo_4', name: 'Bote Incandescente', nameEn: 'Searing Lunge', cd: 5, tell: 0.8, target: 'enemyLow', acts: [dmg(2.4)] }] }
      ]
    },
    {
      id: 'mapinguari', name: 'Mapinguari, a Fera Ancestral', nameEn: 'Mapinguari, the Ancient Beast',
      cat: 'chefe', element: 'mata', region: 'mata',
      art: { arch: 'beast', pal: { main: '#6a4a2a', dark: '#281a0e', light: '#c99a5a', accent: '#8a3a2a', skin: '#4a3218', eye: '#ff5f3a' }, boss: true, big: true, biped: true, oneEye: true },
      mod: { hp: 1.05, def: 1.2 },
      lore: 'Uma fera antiga que dormia sob as raízes. O fragmento cravado em seu peito não a deixa mais dormir.',
      loreEn: 'An ancient beast that slept beneath the roots. The fragment in its chest no longer lets it sleep.',
      entrance: 'Um cheiro pesado desce entre as árvores. Os pássaros calam todos de uma vez.',
      entranceEn: 'A heavy smell drifts between the trees. Every bird falls silent at once.',
      drops: ['nucleo_lendario', 'pelo_ancestral'],
      phases: [
        { at: 1.0, name: 'Passo Pesado', nameEn: 'Heavy Step',
          abilities: [
            { id: 'ma_1', name: 'Manotaço', nameEn: 'Great Swipe', cd: 6, tell: 1.1, target: 'enemyHigh', acts: [dmg(2.0), deb('def', -0.2, 8)] },
            { id: 'ma_2', name: 'Rugido', nameEn: 'Roar', cd: 12, tell: 1.5, target: 'allEnemies', acts: [dmg(1.0), st('stun', 1.8, 1, 0.5)] }] },
        { at: 0.55, name: 'Couro de Pedra', nameEn: 'Stone Hide', mods: { def: 0.6, res: 0.6 },
          announce: 'A fera se encolhe e o couro endurece como casca de árvore velha.',
          announceEn: 'The beast hunches and its hide hardens like old bark.',
          abilities: [
            { id: 'ma_3', name: 'Casca Endurecida', nameEn: 'Hardened Bark', cd: 14, tell: 1.2, target: 'self', acts: [buf('def', 0.5, 10), { k: 'heal', pow: 0.35, scale: 'maxhp' }] },
            { id: 'ma_4', name: 'Pisão', nameEn: 'Stomp', cd: 7, tell: 1.3, target: 'allEnemies', acts: [dmg(1.5), st('slow', 6, 0.3)] }] },
        { at: 0.25, name: 'Fúria Antiga', nameEn: 'Ancient Fury', mods: { atk: 0.6, spd: 0.4 },
          announce: 'O fragmento brilha e a fera esquece a dor. Agora ela só avança.',
          announceEn: 'The fragment glows and the beast forgets its pain. Now it only advances.',
          abilities: [
            { id: 'ma_5', name: 'Avalanche de Golpes', nameEn: 'Avalanche of Blows', cd: 6, tell: 1.0, target: 'enemyRandom', acts: [{ k: 'dmg', dmg: 'phys', pow: 1.2, hits: 3 }] }] }
      ]
    },
    {
      id: 'cuca', name: 'Cuca, Senhora dos Pesadelos', nameEn: 'Cuca, Mistress of Nightmares',
      cat: 'chefe', element: 'sombra', region: 'pantano',
      art: { arch: 'humanoid', pal: { main: '#4a7a3a', dark: '#182a10', light: '#a8d05a', accent: '#c07bff', skin: '#5a8a42', eye: '#ffe066' }, weapon: 'orb', hat: 'pointed', cape: true, boss: true, reptile: true },
      mod: { hp: 0.95, mag: 1.3 },
      lore: 'Colecionadora de sonos roubados. Guarda o fragmento debaixo do travesseiro, e ele sonha junto.',
      loreEn: 'A collector of stolen sleep. She keeps the fragment under her pillow, and it dreams along.',
      entrance: 'O pântano escurece. Alguém canta uma cantiga de ninar, devagar demais.',
      entranceEn: 'The swamp darkens. Someone hums a lullaby, far too slowly.',
      drops: ['nucleo_lendario', 'sonho_petrificado'],
      phases: [
        { at: 1.0, name: 'Cantiga Lenta', nameEn: 'Slow Lullaby',
          abilities: [
            { id: 'cu_1', name: 'Maldição do Sono', nameEn: 'Sleep Curse', cd: 9, tell: 1.3, target: 'enemyHigh', acts: [dmg(1.6, 'mag'), st('stun', 2.2, 1, 0.7)] },
            { id: 'cu_2', name: 'Praga Verde', nameEn: 'Green Blight', cd: 8, tell: 1.0, target: 'allEnemies', acts: [dmg(1.1, 'mag'), st('poison', 10, 0.22)] }] },
        { at: 0.6, name: 'Ilusões', nameEn: 'Illusions', summon: { id: 'cuca_ap', count: 2 },
          announce: 'Ela se multiplica em sombras que repetem seus gestos.',
          announceEn: 'She multiplies into shadows that mirror her gestures.',
          abilities: [
            { id: 'cu_3', name: 'Espelho de Pesadelos', nameEn: 'Nightmare Mirror', cd: 10, tell: 1.4, target: 'allEnemies', acts: [dmg(1.4, 'mag'), st('silence', 4, 1, 0.5), deb('acc', -0.25, 10)] }] },
        { at: 0.25, name: 'Despertar', nameEn: 'Awakening', mods: { mag: 0.7, spd: 0.3 },
          announce: 'A cantiga para. É muito pior quando ela para.',
          announceEn: 'The lullaby stops. It is much worse when it stops.',
          abilities: [
            { id: 'cu_4', name: 'Pesadelo Absoluto', nameEn: 'Absolute Nightmare', cd: 8, tell: 2.0, target: 'allEnemies', acts: [dmg(2.4, 'mag'), st('poison', 12, 0.3)] }] }
      ]
    },
    {
      id: 'maedagua', name: 'Mãe d\'Água, Guardiã do Rio', nameEn: 'Mother of Waters, River Guardian',
      cat: 'chefe', element: 'agua', region: 'rio',
      art: { arch: 'spirit', pal: { main: '#2f8fbf', dark: '#0f3350', light: '#bff0ff', accent: '#8aff9c', skin: '#3f93bd', eye: '#ffffff' }, boss: true, hair: true, big: true },
      mod: { hp: 1.1, res: 1.3 },
      lore: 'Cuidava das cheias e das secas com mão firme. Desde o fragmento, o rio obedece a outra vontade.',
      loreEn: 'She managed floods and droughts with a firm hand. Since the fragment, the river obeys another will.',
      entrance: 'A correnteza inverte. A água sobe sem pressa, como quem já decidiu.',
      entranceEn: 'The current reverses. The water rises unhurried, like something already decided.',
      drops: ['nucleo_lendario', 'perola_do_rio'],
      phases: [
        { at: 1.0, name: 'Correnteza', nameEn: 'Current',
          abilities: [
            { id: 'md_1', name: 'Vagalhão', nameEn: 'Breaker Wave', cd: 8, tell: 1.4, target: 'allEnemies', acts: [dmg(1.4, 'mag'), st('slow', 8, 0.3)] },
            { id: 'md_2', name: 'Águas Curativas', nameEn: 'Healing Waters', cd: 13, tell: 1.6, target: 'self', acts: [{ k: 'heal', pow: 0.16, scale: 'maxhp' }, buf('res', 0.3, 8)] }] },
        { at: 0.55, name: 'Chamado do Rio', nameEn: 'Call of the River', summon: { id: 'peixe', count: 2 },
          announce: 'Ela chama e o rio responde: formas nadam onde não há fundo.',
          announceEn: 'She calls and the river answers: shapes swim where there is no bottom.',
          abilities: [
            { id: 'md_3', name: 'Redemoinho', nameEn: 'Whirlpool', cd: 9, tell: 1.5, target: 'allEnemies', acts: [dmg(1.6, 'mag'), st('silence', 3, 1, 0.4)] }] },
        { at: 0.25, name: 'Enchente', nameEn: 'Flood', mods: { mag: 0.5, spd: 0.35 },
          announce: 'A enchente não pergunta. Ela chega.',
          announceEn: 'The flood does not ask. It arrives.',
          abilities: [
            { id: 'md_4', name: 'Cheia Total', nameEn: 'Total Flood', cd: 7, tell: 1.8, target: 'allEnemies', acts: [dmg(2.2, 'mag'), deb('spd', -0.3, 10)] }] }
      ]
    },
    {
      id: 'corposeco', name: 'Corpo-Seco, o Errante Amaldiçoado', nameEn: 'Corpo-Seco, the Cursed Wanderer',
      cat: 'chefe', element: 'terra', region: 'mangue',
      art: { arch: 'plant', pal: { main: '#6a5a3a', dark: '#241e12', light: '#a89a6a', accent: '#8aff5a', skin: '#4a3e26', eye: '#a8ff5a' }, boss: true, humanoidTree: true },
      mod: { hp: 1.0, atk: 1.15 },
      lore: 'Nem a terra quis. Virou tronco seco que anda e espalha o que sente por onde pisa.',
      loreEn: 'Not even the earth would take him. He became a dry trunk that walks and spreads what he feels.',
      entrance: 'As raízes rangem. O chão em volta perde a cor num círculo perfeito.',
      entranceEn: 'The roots creak. The ground around loses color in a perfect circle.',
      drops: ['nucleo_lendario', 'seiva_amarga'],
      phases: [
        { at: 1.0, name: 'Terra Morta', nameEn: 'Dead Soil',
          abilities: [
            { id: 'cs_1', name: 'Toque Ressecante', nameEn: 'Withering Touch', cd: 7, tell: 1.1, target: 'enemyLow', acts: [dmg(1.9), { k: 'drain', pow: 0.6 }] },
            { id: 'cs_2', name: 'Corrupção Rastejante', nameEn: 'Creeping Corruption', cd: 10, tell: 1.3, target: 'allEnemies', acts: [st('poison', 12, 0.24), deb('healTaken', -0.4, 10)] }] },
        { at: 0.5, name: 'Raízes Famintas', nameEn: 'Hungry Roots', mods: { atk: 0.4, lifesteal: 0.3 },
          announce: 'As raízes saem do chão e procuram sozinhas.',
          announceEn: 'The roots leave the soil and search on their own.',
          abilities: [
            { id: 'cs_3', name: 'Raízes Famintas', nameEn: 'Hungry Roots', cd: 8, tell: 1.5, target: 'allEnemies', acts: [dmg(1.6), { k: 'drain', pow: 0.5 }, st('slow', 8, 0.3)] }] },
        { at: 0.2, name: 'Último Suspiro', nameEn: 'Last Breath', mods: { atk: 0.7 },
          announce: 'Ele para. Depois recomeça, e não parece mais cansado.',
          announceEn: 'He stops. Then he starts again, and no longer seems tired.',
          abilities: [
            { id: 'cs_4', name: 'Praga Final', nameEn: 'Final Blight', cd: 6, tell: 1.9, target: 'allEnemies', acts: [dmg(2.3), st('poison', 15, 0.35)] }] }
      ]
    },
    {
      id: 'anhanga', name: 'Anhangá, o Espírito Branco', nameEn: 'Anhanga, the White Spirit',
      cat: 'chefe', element: 'sombra', region: 'eclipse',
      art: { arch: 'beast', pal: { main: '#e8e8f2', dark: '#5a5a70', light: '#ffffff', accent: '#ff5f3a', skin: '#d0d0e0', eye: '#ff3a3a' }, boss: true, horns: true, big: true, spectral: true },
      mod: { hp: 1.0, dodge: 12 },
      lore: 'Guarda os bichos da mata e cobra caro de quem caça por vaidade. Foi o primeiro a tocar o Coração — e o primeiro a se arrepender.',
      loreEn: 'It guards the forest animals and charges dearly those who hunt out of vanity. It touched the Heart first, and regretted it first.',
      entrance: 'Um cervo branco aparece entre as ruínas. Os olhos não são de cervo.',
      entranceEn: 'A white deer appears among the ruins. The eyes are not a deer\'s.',
      drops: ['nucleo_lendario', 'chifre_espectral'],
      phases: [
        { at: 1.0, name: 'Névoa Branca', nameEn: 'White Mist',
          abilities: [
            { id: 'an_1', name: 'Investida Espectral', nameEn: 'Spectral Charge', cd: 6, tell: 1.0, target: 'enemyHigh', acts: [dmg(2.0, 'mag')] },
            { id: 'an_2', name: 'Névoa Cega', nameEn: 'Blinding Mist', cd: 10, tell: 1.3, target: 'allEnemies', acts: [deb('acc', -0.35, 10), dmg(1.1, 'mag')] }] },
        { at: 0.6, name: 'Clones do Espírito', nameEn: 'Spirit Clones', summon: { id: 'nevoa', count: 2 },
          announce: 'Dois vultos brancos surgem dos lados. Todos se movem juntos.',
          announceEn: 'Two white shapes rise on either side. All of them move as one.',
          abilities: [
            { id: 'an_3', name: 'Chifres da Mata', nameEn: 'Antlers of the Wood', cd: 7, tell: 1.2, target: 'enemyRandom', acts: [{ k: 'dmg', dmg: 'mag', pow: 1.3, hits: 2 }, st('slow', 6, 0.25)] }] },
        { at: 0.3, name: 'Julgamento', nameEn: 'Judgment', mods: { atk: 0.5, mag: 0.5, dodge: 15 },
          announce: 'A névoa se dissipa. Ele te olha nos olhos pela primeira vez.',
          announceEn: 'The mist clears. It looks you in the eye for the first time.',
          abilities: [
            { id: 'an_4', name: 'Sentença da Mata', nameEn: 'Sentence of the Wood', cd: 7, tell: 2.0, target: 'allEnemies', acts: [dmg(2.5, 'mag'), st('silence', 4, 1, 0.5)] }] }
      ]
    }
  ];

  // corrige paleta do Boitatá (definida acima de forma abreviada)
  G.bosses[0].art.pal = { main: '#d9451f', dark: '#4e1206', light: '#ffc24a', accent: '#fff3b0', skin: '#8a2f14', eye: '#fff3b0' };

  G.enemyById = {};
  [].concat(G.enemiesNormal, G.enemiesElite, G.bosses).forEach((e) => {
    e.kind = G.bosses.indexOf(e) >= 0 ? 'boss' : (G.enemiesElite.indexOf(e) >= 0 ? 'elite' : 'normal');
    G.enemyById[e.id] = e;
  });
  G.allEnemies = [].concat(G.enemiesNormal, G.enemiesElite, G.bosses);
})();
