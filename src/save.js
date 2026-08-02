/* =============================================================
 * save.js — persistência em localStorage, versionamento,
 * exportação/importação e tratamento de saves corrompidos.
 * Não conhece renderização nem regras de combate.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const S = (G.save = {});

  const KEY = 'ldb_save';
  const SETTINGS_KEY = 'ldb_settings';
  const BACKUP_KEY = 'ldb_save_backup';
  S.VERSION = 3;

  function safeLS() {
    try {
      const t = '__ldb_test__';
      localStorage.setItem(t, '1'); localStorage.removeItem(t);
      return localStorage;
    } catch (e) {
      console.warn('[LDB] localStorage indisponível — progresso não será salvo.');
      // fallback em memória para não quebrar o jogo
      const mem = {};
      return { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
    }
  }
  const LS = safeLS();

  S.hasSave = function () { return !!LS.getItem(KEY); };

  S.write = function (state) {
    try {
      const payload = { v: S.VERSION, t: Date.now(), d: state };
      const str = JSON.stringify(payload);
      // mantém um backup da versão anterior antes de sobrescrever
      const prev = LS.getItem(KEY);
      if (prev) LS.setItem(BACKUP_KEY, prev);
      LS.setItem(KEY, str);
      return true;
    } catch (e) {
      console.error('[LDB] falha ao salvar', e);
      return false;
    }
  };

  S.read = function () {
    const raw = LS.getItem(KEY);
    if (!raw) return null;
    const parsed = parseAndMigrate(raw);
    if (parsed) return parsed;
    // tenta o backup
    const bkp = LS.getItem(BACKUP_KEY);
    if (bkp) {
      const p2 = parseAndMigrate(bkp);
      if (p2) { console.warn('[LDB] save principal corrompido — backup restaurado.'); return p2; }
    }
    console.error('[LDB] save corrompido e sem backup válido.');
    return null;
  };

  function parseAndMigrate(raw) {
    let obj;
    try { obj = JSON.parse(raw); } catch (e) { return null; }
    if (!obj || typeof obj !== 'object') return null;
    let data = obj.d !== undefined ? obj.d : obj;    // aceita formatos antigos sem envelope
    const v = obj.v || 1;
    if (!data || typeof data !== 'object') return null;
    try { data = S.migrate(data, v); } catch (e) { console.warn('[LDB] migração falhou', e); return null; }
    // validação mínima: precisa ter os campos essenciais
    if (typeof data.stage !== 'number' || !data.heroes) return null;
    data.__savedAt = obj.t || Date.now();
    return data;
  }

  /** Migração entre versões de save. Sempre tolerante a campos ausentes. */
  S.migrate = function (data, from) {
    if (from < 2) {
      data.companions = data.companions || {};
      data.potions = data.potions || {};
    }
    if (from < 3) {
      data.secrets = data.secrets || {};
      data.dailyStreak = data.dailyStreak || 0;
      data.weekly = data.weekly || {};
      data.idleUpgrades = data.idleUpgrades || {};
    }
    // padrões de segurança para qualquer versão
    data.gold = num(data.gold, 0);
    data.gems = num(data.gems, 0);
    data.essence = num(data.essence, 0);
    data.tokens = num(data.tokens, 0);
    data.stage = num(data.stage, 0);
    data.maxStage = num(data.maxStage, data.stage || 0);
    data.mats = data.mats || {};
    data.inventory = Array.isArray(data.inventory) ? data.inventory : [];
    data.party = Array.isArray(data.party) ? data.party : [];
    data.quests = data.quests || {};
    data.achievements = data.achievements || {};
    data.bestiary = data.bestiary || {};
    data.stats = data.stats || {};
    data.prestigeUpgrades = data.prestigeUpgrades || {};
    return data;
  };
  function num(v, d) { return typeof v === 'number' && isFinite(v) ? v : d; }

  S.wipe = function () {
    LS.removeItem(KEY);
    LS.removeItem(BACKUP_KEY);
  };

  /* ---------------- exportação / importação ---------------- */
  S.exportString = function (state) {
    const payload = { v: S.VERSION, t: Date.now(), d: state };
    const json = JSON.stringify(payload);
    try {
      return 'LDB1|' + btoa(unescape(encodeURIComponent(json)));
    } catch (e) {
      return 'LDB0|' + json;
    }
  };

  S.importString = function (str) {
    if (!str || typeof str !== 'string') return null;
    str = str.trim();
    let json = null;
    if (str.indexOf('LDB1|') === 0) {
      try { json = decodeURIComponent(escape(atob(str.slice(5)))); } catch (e) { return null; }
    } else if (str.indexOf('LDB0|') === 0) {
      json = str.slice(5);
    } else if (str.charAt(0) === '{') {
      json = str;
    } else {
      // tenta base64 puro
      try { json = decodeURIComponent(escape(atob(str))); } catch (e) { return null; }
    }
    return parseAndMigrate(json);
  };

  /* ---------------- configurações (persistem sempre) ---------------- */
  S.defaultSettings = function () {
    return {
      locale: 'pt-BR',
      music: 0.45, sfx: 0.6, ui: 0.5, muted: false,
      graphics: 'high',
      reducedMotion: false, screenShake: true, damageNumbers: true,
      highContrast: false, textScale: 1,
      battleSpeed: 1, autoProgress: true, repeatStage: false, autoUltimate: true,
      maxOfflineHours: 12, autoSave: true
    };
  };

  S.loadSettings = function () {
    const def = S.defaultSettings();
    try {
      const raw = LS.getItem(SETTINGS_KEY);
      if (!raw) return def;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object') return def;
      for (const k in def) if (obj[k] !== undefined) def[k] = obj[k];
      return def;
    } catch (e) { return def; }
  };

  S.saveSettings = function (s) {
    try { LS.setItem(SETTINGS_KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
  };
})();
