/* =============================================================
 * localization.js — pt-BR (padrão) e en.
 * Uso: G.t('key') ou G.t('key', {n: 3}).
 * Nomes próprios (heróis, itens, regiões) vêm dos arquivos de dados
 * através dos campos `name` / `nameEn`.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});

  const STR = {
    'pt-BR': {
      /* menu */
      gameTitle: 'Lendas do Brasil', gameSub: 'Jornada Encantada',
      continue: 'Continuar', newGame: 'Novo Jogo', settings: 'Configurações', credits: 'Créditos',
      back: 'Voltar', close: 'Fechar', confirm: 'Confirmar', cancel: 'Cancelar', claim: 'Coletar', claimAll: 'Coletar tudo',
      yes: 'Sim', no: 'Não', ok: 'Certo', locked: 'Bloqueado', unlocked: 'Liberado', max: 'Máx',
      newGameWarn: 'Isso apaga o progresso salvo neste navegador. Tem certeza?',

      /* navegação */
      navMap: 'Mapa', navBattle: 'Batalha', navHeroes: 'Heróis', navParty: 'Grupo', navBag: 'Bolsa',
      navCraft: 'Oficina', navQuests: 'Missões', navBestiary: 'Bestiário', navAch: 'Conquistas',
      navPrestige: 'Renascer', navIdle: 'Ociosidade', navSettings: 'Ajustes', navCompanions: 'Companheiros',

      /* recursos */
      gold: 'Ouro', gems: 'Gemas', essence: 'Essência Lendária', tokens: 'Fichas de Chefe',
      materials: 'Materiais', fragments: 'Fragmentos',

      /* batalha */
      stage: 'Estágio', region: 'Região', wave: 'Onda', power: 'Poder', recPower: 'Poder recomendado',
      auto: 'Auto', repeat: 'Repetir', speed: 'Velocidade', pause: 'Pausar', resume: 'Retomar',
      victory: 'Vitória!', defeat: 'Derrota', retry: 'Tentar de novo', nextStage: 'Próximo estágio',
      battleTimer: 'Tempo', ultimate: 'Suprema', ultReady: 'Pronta', boss: 'CHEFE', elite: 'ELITE',
      rewards: 'Recompensas', enemiesLeft: 'Inimigos', autoProgress: 'Avanço automático',
      repeatStage: 'Modo repetição (farm)', defeatHint: 'O grupo caiu. Fortaleça os heróis ou repita um estágio anterior.',
      bossIncoming: 'CHEFE À VISTA', phaseChange: 'Nova fase!',

      /* heróis */
      level: 'Nível', exp: 'Experiência', role: 'Papel', class: 'Classe', rarity: 'Raridade',
      stars: 'Estrelas', ascension: 'Ascensão', bond: 'Vínculo', skills: 'Habilidades',
      biography: 'Biografia', strengths: 'Pontos fortes', weaknesses: 'Pontos fracos', inspiration: 'Inspiração',
      recruit: 'Recrutar', recruited: 'Recrutado', addToParty: 'Adicionar ao grupo', removeParty: 'Remover do grupo',
      partyFull: 'O grupo já tem 4 heróis.', levelUp: 'Subir de nível', upgradeSkill: 'Melhorar habilidade',
      ascend: 'Ascender', starUp: 'Elevar estrela', talent: 'Talentos', specialization: 'Especialização',
      passive: 'Passiva', active: 'Ativa', basicAttack: 'Ataque básico', cooldown: 'Recarga',
      equipment: 'Equipamento', emptySlot: 'Vazio', powerScore: 'Poder de combate',

      /* atributos */
      hp: 'Vida', mp: 'Energia', atk: 'Ataque', def: 'Defesa', mag: 'Poder Mágico', res: 'Resistência Mágica',
      spd: 'Velocidade de Ataque', crit: 'Chance Crítica', critDmg: 'Dano Crítico', acc: 'Precisão',
      dodge: 'Esquiva', lifesteal: 'Roubo de Vida', healPow: 'Poder de Cura', cdr: 'Redução de Recarga',
      elemRes: 'Resistência Elemental', element: 'Elemento',

      /* tooltips de atributo */
      tip_hp: 'Vida total. Ao chegar a zero o herói sai do combate até o fim da batalha.',
      tip_mp: 'Energia. Enche com ataques e dano recebido; a 100 libera a habilidade suprema.',
      tip_atk: 'Base do dano físico dos ataques e habilidades físicas.',
      tip_def: 'Reduz o dano físico recebido. O efeito tem retorno decrescente.',
      tip_mag: 'Base do dano mágico e da maioria das curas.',
      tip_res: 'Reduz o dano mágico recebido.',
      tip_spd: 'Ataques por segundo. 1.0 equivale a um ataque a cada 1,5 s.',
      tip_crit: 'Chance de causar dano crítico.',
      tip_critDmg: 'Multiplicador aplicado nos acertos críticos.',
      tip_acc: 'Reduz a esquiva do alvo. Compare com a Esquiva do inimigo.',
      tip_dodge: 'Chance de evitar totalmente um ataque.',
      tip_lifesteal: 'Parte do dano causado volta como cura.',
      tip_healPow: 'Aumenta todas as curas realizadas por este herói.',
      tip_cdr: 'Reduz o tempo de recarga das habilidades (máx. 50%).',
      tip_elemRes: 'Reduz o dano elemental recebido.',

      /* itens */
      inventory: 'Inventário', equip: 'Equipar', unequip: 'Desequipar', sell: 'Vender', lock: 'Travar',
      unlock2: 'Destravar', compare: 'Comparar', dismantle: 'Desmontar', upgrade: 'Aprimorar',
      setBonus: 'Bônus de conjunto', pieces: 'peças', sellValue: 'Valor de venda', reqLevel: 'Nível mínimo',
      slot: 'Espaço', locked2: 'Travado', sortBy: 'Ordenar', filter: 'Filtrar', all: 'Todos',
      inventoryFull: 'Bolsa cheia! Venda ou desmonte itens.', itemLockedWarn: 'Item travado — destrave antes.',
      equipped: 'Equipado em', bulkSell: 'Vender comuns', bulkDismantle: 'Desmontar comuns',

      /* oficina */
      craft: 'Criar', recipes: 'Receitas', requires: 'Requer', missingMats: 'Materiais insuficientes',
      selectItem: 'Selecione um item', selectHero: 'Selecione um herói', reroll: 'Reforjar', rarityUp: 'Elevar raridade',
      crafted: 'Criado!', potions: 'Poções', usePotion: 'Usar',

      /* missões */
      quests: 'Missões', objective: 'Objetivo', progress: 'Progresso', questRewards: 'Recompensas',
      questType: 'Tipo', completed: 'Concluída', inProgress: 'Em andamento', claimReward: 'Coletar recompensa',
      resetsIn: 'Renova em', noQuests: 'Nenhuma missão nesta categoria.',

      /* bestiário */
      bestiary: 'Bestiário', discovered: 'Descobertos', defeated: 'Derrotados', lore: 'Relato',
      notDiscovered: 'Ainda não encontrado', category: 'Categoria',

      /* conquistas */
      achievements: 'Conquistas', achUnlocked: 'Conquista desbloqueada!',

      /* prestígio */
      prestige: 'Renascimento da Lenda', prestigeDesc: 'Recomece a jornada guardando o que a lenda aprendeu.',
      prestigeGain: 'Essência a receber', prestigeResets: 'Será reiniciado', prestigeKeeps: 'Será mantido',
      prestigeDo: 'Renascer', prestigeLocked: 'Chegue ao estágio {n} para renascer.',
      prestigeConfirm: 'Renascer agora? Você recebe {n} de Essência Lendária.',
      resetList: 'Estágio atual, níveis de herói, equipamentos não travados, ouro e materiais.',
      keepList: 'Essência, melhorias de renascimento, conquistas, bestiário, segredos, companheiros, heróis recrutados e itens travados.',

      /* ociosidade */
      idle: 'Progresso Ocioso', idleUpgrades: 'Melhorias de ociosidade', offlineRewards: 'Recompensas Offline',
      offlineTime: 'Tempo ausente', offlineCapped: 'Limite de {n}h atingido', welcomeBack: 'Bem-vindo de volta!',
      accumulated: 'Acumulado', claimIdle: 'Coletar acumulado', idleRate: 'Por minuto',
      offlineExplain: 'Seu grupo continuou lutando enquanto você esteve fora.',

      /* companheiros */
      companions: 'Companheiros', activeCompanion: 'Companheiro ativo', setActive: 'Ativar', evolve: 'Evoluir',
      feed: 'Alimentar', companionBonus: 'Bônus', evolution: 'Evolução', noCompanion: 'Nenhum',

      /* ajustes */
      language: 'Idioma', volumeMusic: 'Música', volumeSfx: 'Efeitos', volumeUi: 'Interface',
      graphics: 'Qualidade gráfica', low: 'Baixa', medium: 'Média', high: 'Alta',
      reducedMotion: 'Movimento reduzido', screenShake: 'Tremor de tela', damageNumbers: 'Números de dano',
      highContrast: 'Alto contraste', textScale: 'Tamanho do texto', fullscreen: 'Tela cheia',
      exportSave: 'Exportar save', importSave: 'Importar save', copySave: 'Copiar', pasteSave: 'Colar aqui o save',
      saveExported: 'Save copiado para a área de transferência.', saveImported: 'Save importado com sucesso.',
      saveInvalid: 'Save inválido ou corrompido.', deleteSave: 'Apagar progresso',
      autoSave: 'Salvamento automático', maxOfflineHours: 'Máximo de horas offline', saveNow: 'Salvar agora',
      saved: 'Progresso salvo.',
      saveWorking: 'O progresso está sendo salvo neste navegador.',
      lastSave: 'Último salvamento', justNow: 'agora mesmo', ago: 'atrás',
      noSaveYet: 'Nada salvo ainda — jogue um pouco ou toque em Salvar agora.',
      saveErrorQuota: 'Não consegui salvar: o armazenamento do navegador está cheio. Exporte seu save em Configurações antes de fechar.',
      saveErrorBlocked: 'Não consegui salvar: este navegador está bloqueando o armazenamento (aba anônima?). Seu progresso será perdido ao fechar — exporte o save em Configurações.',
      storageWarning: 'Atenção: este navegador não permite salvar. O progresso vai se perder ao fechar a aba. Use uma janela normal ou exporte o save.',

      /* diárias */
      dailyReward: 'Recompensa Diária', day: 'Dia', dailyClaimed: 'Já coletado hoje', comeBack: 'Volte amanhã!',

      /* diversos */
      soon: 'Em breve', none: 'Nenhum', total: 'Total', chapter: 'Capítulo', story: 'História',
      secretFound: 'Segredo encontrado!', newHero: 'Novo herói disponível!', tapToStart: 'Toque para começar',
      landscapeHint: 'Dica: no modo paisagem o combate fica mais confortável — mas dá para jogar assim mesmo.',
      screenTooSmall: 'Dica: a tela está estreita. Girar o aparelho ou ampliar a janela ajuda, se você quiser.',
      controls: 'Controles', loading: 'Carregando…', worldMap: 'Mapa do Mundo', enter: 'Entrar',
      cleared: 'Concluído', current: 'Atual', regionLocked: 'Conclua a região anterior.',
      startBattle: 'Iniciar batalha', bestStage: 'Melhor estágio', stagesCleared: 'Estágios concluídos',
      statistics: 'Estatísticas', playTime: 'Tempo de jogo', kills: 'Abates',
      creditsText: 'Jogo original criado como demonstração de RPG idle. Arte, som e código gerados proceduralmente. Todas as criaturas, lugares e personagens são interpretações ficcionais livremente inspiradas no folclore brasileiro — nenhuma comunidade, religião ou tradição real é representada.'
    },

    en: {
      gameTitle: 'Legends of Brazil', gameSub: 'Enchanted Journey',
      continue: 'Continue', newGame: 'New Game', settings: 'Settings', credits: 'Credits',
      back: 'Back', close: 'Close', confirm: 'Confirm', cancel: 'Cancel', claim: 'Claim', claimAll: 'Claim all',
      yes: 'Yes', no: 'No', ok: 'OK', locked: 'Locked', unlocked: 'Unlocked', max: 'Max',
      newGameWarn: 'This erases the progress saved in this browser. Are you sure?',

      navMap: 'Map', navBattle: 'Battle', navHeroes: 'Heroes', navParty: 'Party', navBag: 'Bag',
      navCraft: 'Workshop', navQuests: 'Quests', navBestiary: 'Bestiary', navAch: 'Achievements',
      navPrestige: 'Rebirth', navIdle: 'Idle', navSettings: 'Settings', navCompanions: 'Companions',

      gold: 'Gold', gems: 'Gems', essence: 'Legendary Essence', tokens: 'Boss Tokens',
      materials: 'Materials', fragments: 'Fragments',

      stage: 'Stage', region: 'Region', wave: 'Wave', power: 'Power', recPower: 'Recommended power',
      auto: 'Auto', repeat: 'Repeat', speed: 'Speed', pause: 'Pause', resume: 'Resume',
      victory: 'Victory!', defeat: 'Defeat', retry: 'Try again', nextStage: 'Next stage',
      battleTimer: 'Time', ultimate: 'Ultimate', ultReady: 'Ready', boss: 'BOSS', elite: 'ELITE',
      rewards: 'Rewards', enemiesLeft: 'Enemies', autoProgress: 'Auto progress',
      repeatStage: 'Repeat mode (farm)', defeatHint: 'The party fell. Strengthen your heroes or farm an earlier stage.',
      bossIncoming: 'BOSS INCOMING', phaseChange: 'New phase!',

      level: 'Level', exp: 'Experience', role: 'Role', class: 'Class', rarity: 'Rarity',
      stars: 'Stars', ascension: 'Ascension', bond: 'Bond', skills: 'Skills',
      biography: 'Biography', strengths: 'Strengths', weaknesses: 'Weaknesses', inspiration: 'Inspiration',
      recruit: 'Recruit', recruited: 'Recruited', addToParty: 'Add to party', removeParty: 'Remove from party',
      partyFull: 'The party already has 4 heroes.', levelUp: 'Level up', upgradeSkill: 'Upgrade skill',
      ascend: 'Ascend', starUp: 'Raise star', talent: 'Talents', specialization: 'Specialization',
      passive: 'Passive', active: 'Active', basicAttack: 'Basic attack', cooldown: 'Cooldown',
      equipment: 'Equipment', emptySlot: 'Empty', powerScore: 'Combat power',

      hp: 'Health', mp: 'Energy', atk: 'Attack', def: 'Defense', mag: 'Magic Power', res: 'Magic Resist',
      spd: 'Attack Speed', crit: 'Crit Chance', critDmg: 'Crit Damage', acc: 'Accuracy',
      dodge: 'Dodge', lifesteal: 'Life Steal', healPow: 'Healing Power', cdr: 'Cooldown Reduction',
      elemRes: 'Elemental Resist', element: 'Element',

      tip_hp: 'Total health. At zero the hero leaves the fight until the battle ends.',
      tip_mp: 'Energy. Fills from attacks and damage taken; at 100 the ultimate is ready.',
      tip_atk: 'Base of physical damage for attacks and physical abilities.',
      tip_def: 'Reduces physical damage taken, with diminishing returns.',
      tip_mag: 'Base of magic damage and most healing.',
      tip_res: 'Reduces magic damage taken.',
      tip_spd: 'Attacks per second. 1.0 equals one attack every 1.5s.',
      tip_crit: 'Chance to deal critical damage.',
      tip_critDmg: 'Multiplier applied on critical hits.',
      tip_acc: 'Reduces the target dodge. Compare against enemy Dodge.',
      tip_dodge: 'Chance to fully avoid an attack.',
      tip_lifesteal: 'Part of the damage dealt returns as healing.',
      tip_healPow: 'Increases all healing done by this hero.',
      tip_cdr: 'Reduces ability cooldowns (max 50%).',
      tip_elemRes: 'Reduces elemental damage taken.',

      inventory: 'Inventory', equip: 'Equip', unequip: 'Unequip', sell: 'Sell', lock: 'Lock',
      unlock2: 'Unlock', compare: 'Compare', dismantle: 'Dismantle', upgrade: 'Upgrade',
      setBonus: 'Set bonus', pieces: 'pieces', sellValue: 'Sell value', reqLevel: 'Required level',
      slot: 'Slot', locked2: 'Locked', sortBy: 'Sort', filter: 'Filter', all: 'All',
      inventoryFull: 'Bag full! Sell or dismantle items.', itemLockedWarn: 'Item locked — unlock it first.',
      equipped: 'Equipped on', bulkSell: 'Sell commons', bulkDismantle: 'Dismantle commons',

      craft: 'Craft', recipes: 'Recipes', requires: 'Requires', missingMats: 'Not enough materials',
      selectItem: 'Select an item', selectHero: 'Select a hero', reroll: 'Reforge', rarityUp: 'Raise rarity',
      crafted: 'Crafted!', potions: 'Potions', usePotion: 'Use',

      quests: 'Quests', objective: 'Objective', progress: 'Progress', questRewards: 'Rewards',
      questType: 'Type', completed: 'Completed', inProgress: 'In progress', claimReward: 'Claim reward',
      resetsIn: 'Resets in', noQuests: 'No quests in this category.',

      bestiary: 'Bestiary', discovered: 'Discovered', defeated: 'Defeated', lore: 'Lore',
      notDiscovered: 'Not found yet', category: 'Category',

      achievements: 'Achievements', achUnlocked: 'Achievement unlocked!',

      prestige: 'Rebirth of the Legend', prestigeDesc: 'Start the journey again, keeping what the legend learned.',
      prestigeGain: 'Essence to gain', prestigeResets: 'Will reset', prestigeKeeps: 'Will be kept',
      prestigeDo: 'Rebirth', prestigeLocked: 'Reach stage {n} to rebirth.',
      prestigeConfirm: 'Rebirth now? You will receive {n} Legendary Essence.',
      resetList: 'Current stage, hero levels, unlocked equipment, gold and materials.',
      keepList: 'Essence, rebirth upgrades, achievements, bestiary, secrets, companions, recruited heroes and locked items.',

      idle: 'Idle Progress', idleUpgrades: 'Idle upgrades', offlineRewards: 'Offline Rewards',
      offlineTime: 'Time away', offlineCapped: '{n}h cap reached', welcomeBack: 'Welcome back!',
      accumulated: 'Accumulated', claimIdle: 'Claim accumulated', idleRate: 'Per minute',
      offlineExplain: 'Your party kept fighting while you were away.',

      companions: 'Companions', activeCompanion: 'Active companion', setActive: 'Activate', evolve: 'Evolve',
      feed: 'Feed', companionBonus: 'Bonus', evolution: 'Evolution', noCompanion: 'None',

      language: 'Language', volumeMusic: 'Music', volumeSfx: 'Effects', volumeUi: 'Interface',
      graphics: 'Graphics quality', low: 'Low', medium: 'Medium', high: 'High',
      reducedMotion: 'Reduced motion', screenShake: 'Screen shake', damageNumbers: 'Damage numbers',
      highContrast: 'High contrast', textScale: 'Text size', fullscreen: 'Fullscreen',
      exportSave: 'Export save', importSave: 'Import save', copySave: 'Copy', pasteSave: 'Paste save here',
      saveExported: 'Save copied to clipboard.', saveImported: 'Save imported successfully.',
      saveInvalid: 'Invalid or corrupted save.', deleteSave: 'Delete progress',
      autoSave: 'Auto save', maxOfflineHours: 'Max offline hours', saveNow: 'Save now',
      saved: 'Progress saved.',
      saveWorking: 'Progress is being saved in this browser.',
      lastSave: 'Last save', justNow: 'just now', ago: 'ago',
      noSaveYet: 'Nothing saved yet — play a bit or tap Save now.',
      saveErrorQuota: 'Could not save: browser storage is full. Export your save in Settings before closing.',
      saveErrorBlocked: 'Could not save: this browser is blocking storage (private window?). Progress will be lost on close — export your save in Settings.',
      storageWarning: 'Heads up: this browser will not let the game save. Progress is lost when you close the tab. Use a normal window or export your save.',

      dailyReward: 'Daily Reward', day: 'Day', dailyClaimed: 'Already claimed today', comeBack: 'Come back tomorrow!',

      soon: 'Soon', none: 'None', total: 'Total', chapter: 'Chapter', story: 'Story',
      secretFound: 'Secret found!', newHero: 'New hero available!', tapToStart: 'Tap to start',
      landscapeHint: 'Tip: landscape mode makes combat more comfortable — but it plays fine either way.',
      screenTooSmall: 'Tip: the screen is quite narrow. Rotating or enlarging the window helps, if you like.',
      controls: 'Controls', loading: 'Loading…', worldMap: 'World Map', enter: 'Enter',
      cleared: 'Cleared', current: 'Current', regionLocked: 'Complete the previous region.',
      startBattle: 'Start battle', bestStage: 'Best stage', stagesCleared: 'Stages cleared',
      statistics: 'Statistics', playTime: 'Play time', kills: 'Kills',
      creditsText: 'Original game built as an idle RPG demonstration. Art, sound and code are procedurally generated. Every creature, place and character is a free fictional interpretation loosely inspired by Brazilian folklore — no real community, religion or tradition is depicted.'
    }
  };

  G.locale = 'pt-BR';
  G.locales = [{ id: 'pt-BR', label: 'Português (BR)' }, { id: 'en', label: 'English' }];

  G.t = function (key, vars) {
    const table = STR[G.locale] || STR['pt-BR'];
    let s = table[key];
    if (s === undefined) s = STR['pt-BR'][key];
    if (s === undefined) return key;
    if (vars) for (const k in vars) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
    return s;
  };

  /** Nome localizado de um objeto de dados que tenha name/nameEn */
  G.tn = function (obj) {
    if (!obj) return '';
    return G.locale === 'en' && obj.nameEn ? obj.nameEn : (obj.name || obj.id || '');
  };
  /** Descrição localizada (desc/descEn, lore/loreEn, bio/bioEn …) */
  G.td = function (obj, field) {
    if (!obj) return '';
    const en = field + 'En';
    return G.locale === 'en' && obj[en] ? obj[en] : (obj[field] || '');
  };

  G.setLocale = function (id) {
    if (STR[id]) { G.locale = id; return true; }
    return false;
  };
})();
