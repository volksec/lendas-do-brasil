/* =============================================================
 * data/regions.js — 10 regiões x 12 estágios = 120 estágios.
 * Cada região traz paleta própria, trilha procedural, inimigos,
 * materiais, capítulo da história e um segredo colecionável.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});

  G.regions = [
    {
      id: 'vilarejo', name: 'Vilarejo do Sol', nameEn: 'Village of the Sun',
      desc: 'Casinhas caiadas, um poço no centro e gente que conhece o nome de todo mundo.',
      descEn: 'Whitewashed houses, a well in the middle, and people who know everyone by name.',
      pal: { skyTop: '#7fc9ff', skyBot: '#ffe6a8', sun: '#fff3b0', far: '#8fb87a', mid: '#5f9152', near: '#3c6b3a', ground: '#c9a86a', groundDark: '#8a6f42', fog: '#fff2cc', accent: '#ffd94a', prop: 'house' },
      weather: 'sun', particles: 'pollen', music: { scale: 'major', root: 60, tempo: 108, mood: 'calm' },
      enemies: ['capanga', 'boneco', 'aranha_cipo', 'formiga'],
      elites: ['el_cacador'], boss: 'mapinguari',
      materials: ['fibra_verde', 'couro_curtido', 'pedra_aprimoramento'],
      secret: { id: 'sec_poco', name: 'Moeda do Poço', nameEn: 'Well Coin', stage: 5, desc: 'Uma moeda antiga no fundo do poço. Alguém pediu um desejo e não voltou para buscar.' },
      story: {
        title: 'Prólogo — A Rachadura no Céu', titleEn: 'Prologue — The Crack in the Sky',
        text: 'A festa do Vilarejo do Sol parou no meio de uma música. O céu rachou de leste a oeste, e o Coração do Brasil — a pedra que os anciãos guardavam sem nunca explicar direito por quê — se partiu em nove pedaços que saíram voando para todos os cantos.\n\nO poço secou naquela noite. As galinhas ficaram quietas. E um bicho grande demais para caber na memória de alguém começou a rondar a mata do lado de fora.\n\nVocê e os poucos que aceitaram ir com você têm um mapa mal desenhado, uma carroça emprestada e a certeza incômoda de que ninguém mais vai fazer isso.',
        textEn: 'The festival at the Village of the Sun stopped in the middle of a song. The sky cracked from east to west, and the Heart of Brazil — the stone the elders guarded without ever quite explaining why — broke into nine pieces that flew off in every direction.\n\nThe well ran dry that night. The hens went quiet. And something too large to fit in anyone\'s memory began to circle the woods outside.\n\nYou and the few who agreed to come along have a badly drawn map, a borrowed cart, and the uncomfortable certainty that nobody else is going to do this.'
      }
    },
    {
      id: 'mata', name: 'Mata dos Sussurros', nameEn: 'Whispering Woods',
      desc: 'Cipós que se mexem sem vento e um cheiro doce que ninguém sabe de onde vem.',
      descEn: 'Vines that move without wind and a sweet smell nobody can place.',
      pal: { skyTop: '#2e6b4a', skyBot: '#8fd97a', sun: '#d9ff9c', far: '#2a5c3c', mid: '#1e4630', near: '#123322', ground: '#3f5a2a', groundDark: '#22331a', fog: '#a8e6a0', accent: '#8ed57f', prop: 'tree' },
      weather: 'leaves', particles: 'firefly', music: { scale: 'dorian', root: 57, tempo: 96, mood: 'mystic' },
      enemies: ['raiz', 'aranha_cipo', 'jaguatirica', 'vagalume', 'formiga', 'cipo_negro'],
      elites: ['el_curupira'], boss: 'mapinguari',
      materials: ['fibra_verde', 'resina_dourada', 'pelo_ancestral'],
      secret: { id: 'sec_arvore', name: 'Semente Cantante', nameEn: 'Singing Seed', stage: 7, desc: 'Uma semente que assobia baixinho quando você a segura contra o ouvido.' },
      story: {
        title: 'Capítulo I — O que a Mata Guardou', titleEn: 'Chapter I — What the Forest Kept',
        text: 'A mata reconhece o fragmento antes de vocês. As árvores se inclinam para o mesmo lado, como quem aponta com o queixo.\n\nO Guardião da Mata aparece no terceiro dia, sem barulho nenhum, e diz só: "Vocês estão indo devagar demais." Ele passa na frente e não olha para trás — o que, vindo dele, é praticamente um convite.\n\nNo fundo da mata, algo enorme dorme mal. Cada volta que ele dá no sono derruba mais um pedaço da trilha.',
        textEn: 'The forest recognizes the fragment before you do. The trees lean the same way, like someone pointing with their chin.\n\nThe Warden of the Deepwood appears on the third day, without a sound, and says only: "You are going too slowly." He walks ahead and does not look back — which, coming from him, is practically an invitation.\n\nDeep in the woods, something enormous is sleeping badly. Each turn it takes brings down another stretch of trail.'
      }
    },
    {
      id: 'pantano', name: 'Pântano da Cuca', nameEn: 'Swamp of the Hag',
      desc: 'Névoa baixa, árvores tortas e um som de cantiga que vem sempre de trás.',
      descEn: 'Low mist, twisted trees, and a lullaby that always comes from behind you.',
      pal: { skyTop: '#26203a', skyBot: '#4a5a3a', sun: '#a8d05a', far: '#2e3a2a', mid: '#1e2a1c', near: '#141d14', ground: '#3a3a22', groundDark: '#1e1e12', fog: '#7a9a6a', accent: '#c07bff', prop: 'deadtree' },
      weather: 'fog', particles: 'spore', music: { scale: 'phrygian', root: 53, tempo: 82, mood: 'dark' },
      enemies: ['sapo', 'mangue', 'cuca_ap', 'lama_viva', 'cipo_negro', 'nevoa'],
      elites: ['el_matinta'], boss: 'cuca',
      materials: ['limo_negro', 'fibra_verde', 'sonho_petrificado'],
      secret: { id: 'sec_boneca', name: 'Boneca de Pano Velha', nameEn: 'Old Rag Doll', stage: 6, desc: 'Costurada com capricho e abandonada com pressa. Ainda está morna.' },
      story: {
        title: 'Capítulo II — A Cantiga Errada', titleEn: 'Chapter II — The Wrong Lullaby',
        text: 'No pântano, todo mundo dorme mais do que devia e acorda mais cansado. A Feiticeira da Lua chega antes de vocês e já está de mau humor: "Alguém está usando um fragmento como travesseiro."\n\nA cantiga que atravessa a névoa é bonita. Esse é o problema. Quem para para ouvir esquece por que veio.',
        textEn: 'In the swamp everyone sleeps more than they should and wakes up more tired. The Sorceress of the Moon arrives before you, already in a bad mood: "Somebody is using a fragment as a pillow."\n\nThe lullaby crossing the mist is beautiful. That is the problem. Whoever stops to listen forgets why they came.'
      }
    },
    {
      id: 'rio', name: 'Rio das Encantarias', nameEn: 'River of Enchantments',
      desc: 'Água clara demais para ser rasa e correntes que mudam de ideia.',
      descEn: 'Water too clear to be shallow and currents that change their minds.',
      pal: { skyTop: '#2f6fa8', skyBot: '#a8e8ff', sun: '#e8f9ff', far: '#3f7f9a', mid: '#2a5f7a', near: '#1a4055', ground: '#4a7a8a', groundDark: '#254550', fog: '#cdf3ff', accent: '#5aa9ff', prop: 'palm' },
      weather: 'rain', particles: 'bubble', music: { scale: 'lydian', root: 62, tempo: 100, mood: 'flowing' },
      enemies: ['caranguejo', 'peixe', 'jacare', 'peixe_boi', 'mangue', 'morcego'],
      elites: ['el_iara'], boss: 'maedagua',
      materials: ['essencia_agua', 'escama_fluvial', 'perola_do_rio'],
      secret: { id: 'sec_remo', name: 'Remo Sem Barco', nameEn: 'Oar Without a Boat', stage: 4, desc: 'Encostado numa pedra no meio do rio, seco. Não há barco em lugar nenhum.' },
      story: {
        title: 'Capítulo III — Onde o Rio Vira Ao Contrário', titleEn: 'Chapter III — Where the River Runs Backward',
        text: 'A correnteza subiu contra o próprio caminho e ninguém no porto quis explicar. O Bardo do Boto explicou, dançando: "O rio está com raiva, e rio com raiva não afoga — ele leva."\n\nA Curandeira das Águas se junta ao grupo sem pedir licença, com a expressão de quem já viu esse filme antes e não gostou do final.',
        textEn: 'The current climbed against its own path and nobody at the dock would explain. The Bard of the River Dolphin explained, dancing: "The river is angry, and an angry river does not drown you — it carries you off."\n\nThe Healer of the Waters joins the group without asking, wearing the face of someone who has seen this before and disliked the ending.'
      }
    },
    {
      id: 'sertao', name: 'Sertão das Pedras', nameEn: 'Backlands of Stone',
      desc: 'Chão rachado, sombra curta e um horizonte que nunca chega mais perto.',
      descEn: 'Cracked ground, short shadows and a horizon that never gets closer.',
      pal: { skyTop: '#e8a04a', skyBot: '#ffe0a0', sun: '#fff3b0', far: '#a87a4a', mid: '#8a5a34', near: '#5f3a20', ground: '#c9955a', groundDark: '#8a6238', fog: '#ffd9a0', accent: '#ff8a3a', prop: 'cactus' },
      weather: 'heat', particles: 'ember', music: { scale: 'mixolydian', root: 55, tempo: 112, mood: 'brave' },
      enemies: ['cobra_brasa', 'mula_fogo', 'guardiao_pedra', 'urubu', 'ossada', 'capanga'],
      elites: ['el_ferreiro'], boss: 'boitata',
      materials: ['cinza_quente', 'couro_curtido', 'brasa_eterna'],
      secret: { id: 'sec_cantil', name: 'Cantil Cheio', nameEn: 'Full Canteen', stage: 8, desc: 'No meio do nada, cheio de água fresca. Estava esperando alguém.' },
      story: {
        title: 'Capítulo IV — O Cerco de Pedra', titleEn: 'Chapter IV — The Siege of Stone',
        text: 'O Cavaleiro do Sertão os encontra defendendo um povoado de três casas contra coisas que saem do chão à noite. Ele não pergunta quem vocês são; entrega uma pá para cada um.\n\nQuando o fogo aparece no horizonte e continua aparecendo pelas três noites seguintes, a Arqueira do Boitatá surge da poeira e diz que o rastro é o mesmo desde criança — só que agora ele não vai embora de manhã.',
        textEn: 'The Knight of the Backlands finds you defending a three-house settlement against things that come out of the ground at night. He does not ask who you are; he hands each of you a shovel.\n\nWhen fire appears on the horizon and keeps appearing for three nights running, the Archer of the Flame Serpent steps out of the dust and says the trail has looked the same since she was a child — except now it does not leave at dawn.'
      }
    },
    {
      id: 'cerrado', name: 'Cerrado dos Ventos', nameEn: 'Windswept Savanna',
      desc: 'Campo aberto, árvores tortas e o vento passando por cima como quem tem pressa.',
      descEn: 'Open fields, twisted trees and wind passing overhead in a hurry.',
      pal: { skyTop: '#4a6f9a', skyBot: '#d9e8a0', sun: '#fff3c0', far: '#7a8f5a', mid: '#5a6f3a', near: '#3a4a24', ground: '#a89a5a', groundDark: '#6a5f34', fog: '#e8f0c0', accent: '#9fe8ff', prop: 'thin' },
      weather: 'wind', particles: 'leaf', music: { scale: 'major', root: 59, tempo: 124, mood: 'brisk' },
      enemies: ['saci_falso', 'urubu', 'vento_uivante', 'lobisomem', 'formiga', 'boneco'],
      elites: ['el_boi'], boss: 'boitata',
      materials: ['pena_veloz', 'nucleo_tempestade', 'couro_curtido'],
      secret: { id: 'sec_carapuca', name: 'Carapuça Perdida', nameEn: 'Lost Red Cap', stage: 9, desc: 'Vermelha, pequena e claramente muito importante para alguém.' },
      story: {
        title: 'Capítulo V — A Tempestade que Ri', titleEn: 'Chapter V — The Storm That Laughs',
        text: 'A tempestade no cerrado tem hora marcada e senso de humor. Some com as barracas, devolve as botas trocadas, arranca o chapéu de quem está falando alto.\n\nO Mensageiro do Saci entrega um recado sem dizer de quem: "O fragmento não caiu aqui. Alguém trouxe." Depois soma, levando junto a colher de pau da Curandeira.',
        textEn: 'The storm in the savanna keeps a schedule and a sense of humor. It steals tents, returns boots on the wrong feet, and knocks the hat off whoever is talking loudest.\n\nThe Messenger of the Whirlwind delivers a note without saying from whom: "The fragment did not fall here. Someone brought it." Then he vanishes, taking the Healer\'s wooden spoon with him.'
      }
    },
    {
      id: 'mangue', name: 'Manguezal Sombrio', nameEn: 'Shadowed Mangrove',
      desc: 'Raízes acima da água, lama até o joelho e caranguejos que param para observar.',
      descEn: 'Roots above the water, knee-deep mud, and crabs that stop to watch.',
      pal: { skyTop: '#2a3a3a', skyBot: '#5a6a4a', sun: '#a8c08a', far: '#2e4038', mid: '#1e2c26', near: '#131f1a', ground: '#3a3a2a', groundDark: '#1c1c14', fog: '#8aa08a', accent: '#a8ff5a', prop: 'root' },
      weather: 'fog', particles: 'spore', music: { scale: 'aeolian', root: 50, tempo: 86, mood: 'heavy' },
      enemies: ['caranguejo', 'lama_viva', 'mangue', 'sapo', 'nevoa', 'jacare'],
      elites: ['el_matinta'], boss: 'corposeco',
      materials: ['raiz_salgada', 'limo_negro', 'seiva_amarga'],
      secret: { id: 'sec_rede', name: 'Rede de Pesca Vazia', nameEn: 'Empty Fishing Net', stage: 3, desc: 'Consertada mil vezes. Alguém confiava muito nela.' },
      story: {
        title: 'Capítulo VI — A Corrupção que Anda', titleEn: 'Chapter VI — The Corruption That Walks',
        text: 'No mangue, a maré leva e traz coisas que não deviam boiar. O que está apodrecendo não é a água — é o que caminha por dentro dela.\n\nO Caçador do Mapinguari aparece com o caderno encharcado, apontando pegadas que ele jura serem de gente. Elas são. Só que muito antigas, e ainda molhadas.',
        textEn: 'In the mangrove the tide brings and takes things that should not float. What is rotting is not the water — it is what walks inside it.\n\nThe Hunter arrives with a soaked notebook, pointing at footprints he swears are human. They are. Only very old, and still wet.'
      }
    },
    {
      id: 'serra', name: 'Serra dos Cristais', nameEn: 'Crystal Highlands',
      desc: 'Paredões de rocha clara, galerias antigas e um zumbido constante que vem de baixo.',
      descEn: 'Pale rock walls, ancient galleries and a constant hum from below.',
      pal: { skyTop: '#3a4a7a', skyBot: '#9fbcd9', sun: '#e8f4ff', far: '#5a6a8a', mid: '#3f4a66', near: '#262e44', ground: '#7a8296', groundDark: '#3f4655', fog: '#cfe4ff', accent: '#bfe4ff', prop: 'crystal' },
      weather: 'snowdust', particles: 'crystal', music: { scale: 'lydian', root: 64, tempo: 92, mood: 'grand' },
      enemies: ['cristal_v', 'morcego', 'tatu_ferro', 'raiz_cristal', 'guardiao_pedra', 'ossada'],
      elites: ['el_cristal'], boss: 'anhanga',
      materials: ['cristal_bruto', 'poeira_de_geodo', 'pedra_aprimoramento'],
      secret: { id: 'sec_lampiao', name: 'Lampião Aceso', nameEn: 'Lit Lantern', stage: 10, desc: 'Aceso no fundo da galeria. Sem óleo dentro.' },
      story: {
        title: 'Capítulo VII — O Segredo Debaixo da Pedra', titleEn: 'Chapter VII — The Secret Under the Stone',
        text: 'As galerias da serra guardam o mais desconfortável dos achados: gravuras antigas mostrando o Coração inteiro sendo partido de propósito, por mãos que ninguém desenhou o rosto.\n\nO zumbido não vem dos cristais. Vem do que está atrás deles, batendo.',
        textEn: 'The highland galleries keep the most uncomfortable of finds: old carvings showing the Heart being broken on purpose, by hands whose faces nobody drew.\n\nThe hum does not come from the crystals. It comes from what is behind them, knocking.'
      }
    },
    {
      id: 'mascaras', name: 'Cidade das Máscaras', nameEn: 'City of Masks',
      desc: 'Uma cidade inteira em festa, todos de rosto coberto, ninguém dizendo o próprio nome.',
      descEn: 'An entire city in festival, faces covered, nobody giving their real name.',
      pal: { skyTop: '#4a1c4a', skyBot: '#c74fa0', sun: '#ffd94a', far: '#6a2a5a', mid: '#4a1a3e', near: '#2e1026', ground: '#7a3a5a', groundDark: '#3f1a30', fog: '#ffb6e6', accent: '#ffd94a', prop: 'flag' },
      weather: 'confetti', particles: 'confetti', music: { scale: 'mixolydian', root: 61, tempo: 132, mood: 'festive' },
      enemies: ['mascara', 'palhaco', 'capanga', 'sombra_ruina', 'boneco', 'saci_falso'],
      elites: ['el_sombra'], boss: 'cuca',
      materials: ['linha_de_festa', 'tinta_mascara', 'resina_dourada'],
      secret: { id: 'sec_mascara', name: 'Máscara Sem Dono', nameEn: 'Ownerless Mask', stage: 11, desc: 'Ninguém a reclamou no fim da festa. Ela é do seu tamanho exato.' },
      story: {
        title: 'Capítulo VIII — Todo Mundo Está Mentindo', titleEn: 'Chapter VIII — Everyone Is Lying',
        text: 'Na Cidade das Máscaras a festa não para nunca, e é por isso que ninguém percebeu que ela dura três anos.\n\nUm mascarado vende um fragmento na feira, aberto, ao lado dos doces. O preço é justo. Isso é o mais assustador.',
        textEn: 'In the City of Masks the festival never stops, which is why nobody noticed it has been going for three years.\n\nA masked vendor sells a fragment at the market, in the open, next to the sweets. The price is fair. That is the frightening part.'
      }
    },
    {
      id: 'eclipse', name: 'Vale do Eclipse', nameEn: 'Vale of the Eclipse',
      desc: 'Ruínas sob um sol coberto. Portais respirando devagar. O fim do mapa.',
      descEn: 'Ruins beneath a covered sun. Portals breathing slowly. The edge of the map.',
      pal: { skyTop: '#1a0f2a', skyBot: '#5a2a6a', sun: '#ff5f7e', far: '#2e1a44', mid: '#1e1030', near: '#120a1e', ground: '#3a2a4a', groundDark: '#1a1024', fog: '#b06ce0', accent: '#ff5f7e', prop: 'ruin' },
      weather: 'eclipse', particles: 'shadow', music: { scale: 'phrygian', root: 48, tempo: 76, mood: 'final' },
      enemies: ['sombra_ruina', 'nevoa', 'ossada', 'guardiao_pedra', 'onca', 'mascara'],
      elites: ['el_sombra', 'el_cristal'], boss: 'anhanga',
      materials: ['fragmento_sombrio', 'po_estelar', 'chifre_espectral'],
      secret: { id: 'sec_coracao', name: 'Estilhaço Morno', nameEn: 'Warm Splinter', stage: 12, desc: 'Um caco do Coração, ainda quente. Ele bate quando você segura.' },
      story: {
        title: 'Capítulo IX — A Última Viagem', titleEn: 'Chapter IX — The Final Journey',
        text: 'O vale fica exatamente onde o mapa acaba, e o mapa acaba porque quem o desenhou parou de voltar.\n\nCom oito fragmentos na bolsa, a resposta finalmente aparece — e é decepcionantemente simples. O Coração não foi roubado. Foi partido por quem o guardava, de propósito, porque inteiro ele estava começando a decidir sozinho o que devia viver e o que não devia.\n\nAgora vocês seguram os nove pedaços e a mesma escolha. Ninguém vai fazer isso por vocês.',
        textEn: 'The vale sits exactly where the map ends, and the map ends because whoever drew it stopped coming back.\n\nWith eight fragments in the bag, the answer finally arrives — and it is disappointingly simple. The Heart was not stolen. It was broken on purpose by its own keepers, because whole, it had begun deciding on its own what deserved to live and what did not.\n\nNow you hold the nine pieces and the same choice. Nobody is going to make it for you.'
      }
    }
  ];

  G.regionById = {};
  G.regions.forEach((r, i) => { r.index = i; G.regionById[r.id] = r; });

  /* --------------------------------------------------------------
   * Geração dos estágios: 12 por região.
   * Elite nos estágios 4 e 8; chefe no 12. Demais são normais.
   * ------------------------------------------------------------ */
  const STAGE_NAMES = {
    vilarejo: ['Praça do Poço', 'Curral Velho', 'Estrada de Terra', 'Depósito Abandonado', 'Beira do Milharal', 'Cerca Quebrada', 'Casa do Ferreiro', 'Trilha do Riacho', 'Roça Alta', 'Capela Antiga', 'Portão do Vilarejo', 'A Fera na Mata'],
    mata: ['Entrada da Mata', 'Trilha dos Cipós', 'Clareira Torta', 'Guardião da Trilha', 'Raízes Fundas', 'Alagado Verde', 'Árvore Cantante', 'Ninho de Aranhas', 'Vale Umbroso', 'Coração da Mata', 'Ruína Coberta', 'O Sono Interrompido'],
    pantano: ['Margem Lodosa', 'Passarela Podre', 'Névoa Baixa', 'O Assobio', 'Poço de Limo', 'Casa de Palafita', 'Roda de Sonhos', 'Charco Fundo', 'Trilha Alagada', 'Fogueira Apagada', 'Caldeirão Frio', 'A Cantiga Final'],
    rio: ['Porto Pequeno', 'Correnteza Rasa', 'Ilha de Pedra', 'A Voz na Água', 'Cachoeira Baixa', 'Igarapé Escuro', 'Banco de Areia', 'Poço Fundo', 'Ilha das Garças', 'Meandro Torto', 'Foz Encantada', 'O Rio ao Contrário'],
    sertao: ['Estrada Rachada', 'Pedra Furada', 'Curral de Ossos', 'A Forja Perdida', 'Vale Seco', 'Caverna Rasa', 'Serrote Baixo', 'Poço Salgado', 'Vila Abandonada', 'Mirante do Sol', 'Campo Queimado', 'A Serpente de Fogo'],
    cerrado: ['Campo Aberto', 'Árvore Torta', 'Vereda Seca', 'O Touro Enfeitado', 'Chapada Baixa', 'Curral do Vento', 'Buritizal', 'Morro do Assobio', 'Cume Ventoso', 'Trilha Poeirenta', 'Encruzilhada', 'A Tempestade Rindo'],
    mangue: ['Boca do Mangue', 'Raízes Altas', 'Canal Estreito', 'A Rede Vazia', 'Lamaçal', 'Ilha de Ostras', 'Passagem Escura', 'Poço de Maré', 'Manguezal Fundo', 'Ossada na Lama', 'Antiga Salina', 'O Errante'],
    serra: ['Sopé da Serra', 'Galeria Um', 'Veio de Quartzo', 'O Colosso', 'Câmara de Geodos', 'Poço de Mina', 'Salão de Espelhos', 'Gravuras Antigas', 'Galeria Profunda', 'Lampião Aceso', 'Porta de Pedra', 'O Espírito Branco'],
    mascaras: ['Portão da Festa', 'Praça dos Tambores', 'Beco das Fitas', 'O Arauto', 'Palco Alto', 'Feira Coberta', 'Salão de Baile', 'Rua dos Espelhos', 'Coreto Vazio', 'Camarim Fechado', 'Desfile Final', 'A Máscara Sem Rosto'],
    eclipse: ['Limiar do Vale', 'Ruína Quebrada', 'Portal Fraco', 'O Arauto do Fim', 'Campo de Sombras', 'Escadaria Longa', 'Círculo de Pedras', 'Fenda Aberta', 'Altar Rachado', 'Coração Partido', 'Última Ponte', 'O Guardião Branco']
  };
  const STAGE_NAMES_EN = {
    vilarejo: ['Well Square', 'Old Corral', 'Dirt Road', 'Abandoned Shed', 'Cornfield Edge', 'Broken Fence', 'Smith\'s House', 'Creek Trail', 'High Field', 'Old Chapel', 'Village Gate', 'The Beast in the Woods'],
    mata: ['Forest Entrance', 'Vine Trail', 'Crooked Clearing', 'Trail Guardian', 'Deep Roots', 'Green Marsh', 'Singing Tree', 'Spider Nest', 'Shadowed Vale', 'Heart of the Wood', 'Overgrown Ruin', 'The Interrupted Sleep'],
    pantano: ['Muddy Bank', 'Rotten Walkway', 'Low Mist', 'The Whistle', 'Slime Pit', 'Stilt House', 'Circle of Dreams', 'Deep Marsh', 'Flooded Trail', 'Cold Bonfire', 'Cold Cauldron', 'The Final Lullaby'],
    rio: ['Small Dock', 'Shallow Current', 'Stone Island', 'The Voice in the Water', 'Low Falls', 'Dark Creek', 'Sandbar', 'Deep Pool', 'Heron Island', 'Crooked Bend', 'Enchanted Mouth', 'The River Reversed'],
    sertao: ['Cracked Road', 'Pierced Rock', 'Bone Corral', 'The Lost Forge', 'Dry Valley', 'Shallow Cave', 'Low Ridge', 'Salt Well', 'Abandoned Village', 'Sun Overlook', 'Burnt Field', 'The Flame Serpent'],
    cerrado: ['Open Field', 'Crooked Tree', 'Dry Path', 'The Adorned Bull', 'Low Plateau', 'Wind Corral', 'Palm Grove', 'Whistling Hill', 'Windy Summit', 'Dusty Trail', 'Crossroads', 'The Laughing Storm'],
    mangue: ['Mangrove Mouth', 'High Roots', 'Narrow Channel', 'The Empty Net', 'Mudflat', 'Oyster Island', 'Dark Passage', 'Tide Pool', 'Deep Mangrove', 'Bones in the Mud', 'Old Saltworks', 'The Wanderer'],
    serra: ['Highland Foot', 'Gallery One', 'Quartz Vein', 'The Colossus', 'Geode Chamber', 'Mine Shaft', 'Hall of Mirrors', 'Ancient Carvings', 'Deep Gallery', 'Lit Lantern', 'Stone Door', 'The White Spirit'],
    mascaras: ['Festival Gate', 'Drum Square', 'Ribbon Alley', 'The Herald', 'High Stage', 'Covered Market', 'Ballroom', 'Mirror Street', 'Empty Bandstand', 'Locked Dressing Room', 'Final Parade', 'The Faceless Mask'],
    eclipse: ['Vale Threshold', 'Broken Ruin', 'Weak Portal', 'Herald of the End', 'Field of Shadows', 'Long Stairway', 'Stone Circle', 'Open Rift', 'Cracked Altar', 'Broken Heart', 'Last Bridge', 'The White Guardian']
  };

  G.stages = [];
  G.regions.forEach((region, ri) => {
    for (let i = 0; i < 12; i++) {
      const n = i + 1;
      const type = n === 12 ? 'boss' : (n === 4 || n === 8 ? 'elite' : 'normal');
      const abs = G.stages.length;
      G.stages.push({
        index: abs,
        region: region.id,
        regionIndex: ri,
        num: n,
        type: type,
        name: STAGE_NAMES[region.id][i],
        nameEn: STAGE_NAMES_EN[region.id][i],
        enemyPool: type === 'boss' ? [region.boss] : (type === 'elite' ? region.elites : region.enemies),
        // Poder recomendado: derivado da mesma curva dos inimigos, só como orientação.
        power: Math.floor(1400 * G.balance.curve(abs, 2.2) * (type === 'boss' ? 1.5 : type === 'elite' ? 1.2 : 1)),
        secret: region.secret && region.secret.stage === n ? region.secret.id : null
      });
    }
  });

  G.STAGE_COUNT = G.stages.length;

  /** Estágio infinito após o conteúdo principal (progresso idle contínuo) */
  G.endlessStage = function (abs) {
    const over = abs - G.STAGE_COUNT;
    const region = G.regionById.eclipse;
    return {
      index: abs, region: 'eclipse', regionIndex: 9,
      num: 12 + over + 1, type: over % 10 === 9 ? 'boss' : (over % 5 === 4 ? 'elite' : 'normal'),
      name: 'Profundezas do Eclipse ' + (over + 1),
      nameEn: 'Eclipse Depths ' + (over + 1),
      enemyPool: over % 10 === 9 ? [region.boss] : (over % 5 === 4 ? region.elites : region.enemies),
      power: Math.floor(220 * Math.pow(1.135, G.STAGE_COUNT) * Math.pow(1.16, over + 1)),
      secret: null, endless: true
    };
  };

  G.getStage = function (abs) {
    return abs < G.STAGE_COUNT ? G.stages[abs] : G.endlessStage(abs);
  };
})();
