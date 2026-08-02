/* =============================================================
 * data/achievements.js — 24 conquistas com recompensas.
 * Usam os mesmos contadores das missões (game.stats).
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});

  G.achievements = [
    { id: 'ach_first', name: 'Primeiro Passo', nameEn: 'First Step', desc: 'Vença o primeiro combate.', descEn: 'Win your first battle.', stat: 'clears', need: 1, rw: { gold: 200 } },
    { id: 'ach_stage10', name: 'Fora do Vilarejo', nameEn: 'Out of the Village', desc: 'Alcance o estágio 10.', descEn: 'Reach stage 10.', stat: 'maxStage', need: 10, rw: { gold: 800, gems: 5 } },
    { id: 'ach_stage30', name: 'Andarilho', nameEn: 'Wanderer', desc: 'Alcance o estágio 30.', descEn: 'Reach stage 30.', stat: 'maxStage', need: 30, rw: { gold: 4000, gems: 10 } },
    { id: 'ach_stage60', name: 'Viajante Calejado', nameEn: 'Seasoned Traveler', desc: 'Alcance o estágio 60.', descEn: 'Reach stage 60.', stat: 'maxStage', need: 60, rw: { gold: 20000, gems: 20 } },
    { id: 'ach_stage100', name: 'Quase o Fim do Mapa', nameEn: 'Almost Off the Map', desc: 'Alcance o estágio 100.', descEn: 'Reach stage 100.', stat: 'maxStage', need: 100, rw: { gold: 100000, gems: 40 } },
    { id: 'ach_stage120', name: 'Lenda Completa', nameEn: 'Complete Legend', desc: 'Conclua os 120 estágios da campanha.', descEn: 'Complete all 120 campaign stages.', stat: 'maxStage', need: 120, rw: { gold: 500000, gems: 150 } },
    { id: 'ach_kill100', name: 'Batedor', nameEn: 'Scout', desc: 'Derrote 100 inimigos.', descEn: 'Defeat 100 enemies.', stat: 'kills', need: 100, rw: { gold: 1000 } },
    { id: 'ach_kill1000', name: 'Veterano', nameEn: 'Veteran', desc: 'Derrote 1.000 inimigos.', descEn: 'Defeat 1,000 enemies.', stat: 'kills', need: 1000, rw: { gold: 15000, gems: 15 } },
    { id: 'ach_kill10000', name: 'Nome Conhecido', nameEn: 'Known Name', desc: 'Derrote 10.000 inimigos.', descEn: 'Defeat 10,000 enemies.', stat: 'kills', need: 10000, rw: { gold: 200000, gems: 60 } },
    { id: 'ach_boss1', name: 'Caçador de Chefes', nameEn: 'Boss Hunter', desc: 'Derrote o primeiro chefe.', descEn: 'Defeat your first boss.', stat: 'bossKills', need: 1, rw: { gold: 2000, gems: 10 } },
    { id: 'ach_boss10', name: 'Colecionador de Chifres', nameEn: 'Horn Collector', desc: 'Derrote 10 chefes.', descEn: 'Defeat 10 bosses.', stat: 'bossKills', need: 10, rw: { gold: 30000, gems: 25 } },
    { id: 'ach_boss50', name: 'Terror das Lendas', nameEn: 'Terror of Legends', desc: 'Derrote 50 chefes.', descEn: 'Defeat 50 bosses.', stat: 'bossKills', need: 50, rw: { gold: 250000, gems: 80 } },
    { id: 'ach_elite25', name: 'Sem Medo de Elite', nameEn: 'Elite Unafraid', desc: 'Derrote 25 elites.', descEn: 'Defeat 25 elites.', stat: 'eliteKills', need: 25, rw: { gold: 12000, gems: 15 } },
    { id: 'ach_craft10', name: 'Aprendiz de Oficina', nameEn: 'Workshop Apprentice', desc: 'Crie 10 itens.', descEn: 'Craft 10 items.', stat: 'crafts', need: 10, rw: { gold: 4000, mats: { pedra_aprimoramento: 10 } } },
    { id: 'ach_craft50', name: 'Mestre Artesão', nameEn: 'Master Artisan', desc: 'Crie 50 itens.', descEn: 'Craft 50 items.', stat: 'crafts', need: 50, rw: { gold: 60000, gems: 30 } },
    { id: 'ach_up50', name: 'Martelo Constante', nameEn: 'Steady Hammer', desc: 'Aprimore equipamentos 50 vezes.', descEn: 'Upgrade equipment 50 times.', stat: 'upgrades', need: 50, rw: { gold: 40000, gems: 20 } },
    { id: 'ach_leg1', name: 'Achado Lendário', nameEn: 'Legendary Find', desc: 'Obtenha o primeiro item Lendário.', descEn: 'Obtain your first Legendary item.', stat: 'legendaries', need: 1, rw: { gold: 20000, gems: 25 } },
    { id: 'ach_myth1', name: 'Mito Encontrado', nameEn: 'Myth Found', desc: 'Obtenha o primeiro item Mítico.', descEn: 'Obtain your first Mythical item.', stat: 'mythicals', need: 1, rw: { gold: 100000, gems: 60 } },
    { id: 'ach_ult50', name: 'Golpe de Mestre', nameEn: 'Master Stroke', desc: 'Use 50 habilidades supremas.', descEn: 'Use 50 ultimate abilities.', stat: 'ultimates', need: 50, rw: { gold: 18000, gems: 15 } },
    { id: 'ach_bestiary20', name: 'Caderno Cheio', nameEn: 'Full Notebook', desc: 'Registre 20 criaturas no bestiário.', descEn: 'Record 20 creatures in the bestiary.', stat: 'bestiary', need: 20, rw: { gold: 10000, gems: 15 } },
    { id: 'ach_bestiary46', name: 'Bestiário Completo', nameEn: 'Complete Bestiary', desc: 'Registre todas as criaturas.', descEn: 'Record every creature.', stat: 'bestiary', need: 46, rw: { gold: 300000, gems: 100 } },
    { id: 'ach_secret5', name: 'Curioso', nameEn: 'Curious', desc: 'Encontre 5 segredos.', descEn: 'Find 5 secrets.', stat: 'secrets', need: 5, rw: { gold: 25000, gems: 25 } },
    { id: 'ach_prestige1', name: 'Renascido', nameEn: 'Reborn', desc: 'Renasça pela primeira vez.', descEn: 'Rebirth for the first time.', stat: 'prestiges', need: 1, rw: { gold: 60000, gems: 40 } },
    { id: 'ach_offline', name: 'Descanso Merecido', nameEn: 'Well-Earned Rest', desc: 'Colete recompensas offline 10 vezes.', descEn: 'Claim offline rewards 10 times.', stat: 'offlineClaims', need: 10, rw: { gold: 20000, gems: 20 } }
  ];

  G.achievementById = {};
  G.achievements.forEach((a) => { G.achievementById[a.id] = a; });
})();
