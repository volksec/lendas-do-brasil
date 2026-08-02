/* =============================================================
 * util.js — helpers compartilhados (formatação, RNG, DOM, math)
 * Não depende de nenhum outro módulo. Deve carregar primeiro.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const U = (G.util = {});

  /* ---------- Números ---------- */
  const SUFFIX = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd'];

  /** Formata números grandes: 1234 -> "1.23K", 5.4e9 -> "5.40B" */
  U.fmt = function (n, decimals) {
    if (n === null || n === undefined || isNaN(n)) return '0';
    const neg = n < 0;
    n = Math.abs(n);
    if (n < 1000) {
      const d = decimals === undefined ? (n < 10 && n % 1 !== 0 ? 1 : 0) : decimals;
      return (neg ? '-' : '') + n.toFixed(d).replace(/\.0+$/, '');
    }
    let tier = Math.floor(Math.log10(n) / 3);
    if (tier >= SUFFIX.length) tier = SUFFIX.length - 1;
    const scaled = n / Math.pow(10, tier * 3);
    const d = decimals === undefined ? (scaled < 10 ? 2 : scaled < 100 ? 1 : 0) : decimals;
    return (neg ? '-' : '') + scaled.toFixed(d) + SUFFIX[tier];
  };

  /** Percentual legível */
  U.pct = function (v, d) { return (v * 100).toFixed(d === undefined ? 1 : d).replace(/\.0$/, '') + '%'; };

  /** Tempo em segundos -> "1h 23m 45s" */
  U.time = function (sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h > 0) return h + 'h ' + m + 'm';
    if (m > 0) return m + 'm ' + s + 's';
    return s + 's';
  };

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.round = (v, d) => { const p = Math.pow(10, d || 0); return Math.round(v * p) / p; };

  /* ---------- Aleatoriedade ---------- */
  /** PRNG determinístico (mulberry32) — usado para gerar itens reproduzíveis */
  U.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  U.chance = (p) => Math.random() < p;
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  /** Escolha ponderada: items = [{w:peso, ...}] */
  U.weighted = function (items, key) {
    key = key || 'w';
    let total = 0;
    for (const it of items) total += it[key] || 0;
    let r = Math.random() * total;
    for (const it of items) { r -= it[key] || 0; if (r <= 0) return it; }
    return items[items.length - 1];
  };

  U.uid = (() => { let n = 1; return (p) => (p || 'id') + '_' + (n++).toString(36) + Math.floor(Math.random() * 1296).toString(36); })();

  U.clone = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- DOM ---------- */
  U.el = function (tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'text') e.textContent = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v);
      }
    }
    if (children) {
      const list = Array.isArray(children) ? children : [children];
      for (const c of list) { if (c === null || c === undefined || c === false) continue; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); }
    }
    return e;
  };
  U.qs = (sel, root) => (root || document).querySelector(sel);
  U.qsa = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  U.clear = (node) => { while (node && node.firstChild) node.removeChild(node.firstChild); return node; };
  U.esc = function (s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* ---------- Cores ---------- */
  /** Clareia/escurece uma cor hex. amt: -1..1 */
  U.shade = function (hex, amt) {
    const c = U.hex2rgb(hex);
    const f = amt < 0 ? 0 : 255, p = Math.abs(amt);
    return U.rgb2hex(
      Math.round((f - c[0]) * p) + c[0],
      Math.round((f - c[1]) * p) + c[1],
      Math.round((f - c[2]) * p) + c[2]
    );
  };
  U.hex2rgb = function (hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  U.rgb2hex = function (r, g, b) {
    const h = (v) => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return '#' + h(r) + h(g) + h(b);
  };
  U.mix = function (a, b, t) {
    const x = U.hex2rgb(a), y = U.hex2rgb(b);
    return U.rgb2hex(U.lerp(x[0], y[0], t), U.lerp(x[1], y[1], t), U.lerp(x[2], y[2], t));
  };

  /* ---------- Eventos ---------- */
  U.emitter = function () {
    const map = {};
    return {
      on(ev, fn) { (map[ev] = map[ev] || []).push(fn); return fn; },
      off(ev, fn) { if (map[ev]) map[ev] = map[ev].filter((f) => f !== fn); },
      emit(ev, data) { const l = map[ev]; if (!l) return; for (let i = 0; i < l.length; i++) { try { l[i](data); } catch (e) { console.warn('[LDB] handler', ev, e); } } }
    };
  };

  /** Pool de objetos reutilizáveis (números de dano, partículas) */
  U.Pool = function (factory, reset) {
    const free = [];
    return {
      get() { const o = free.pop() || factory(); return o; },
      put(o) { if (reset) reset(o); if (free.length < 512) free.push(o); },
      size() { return free.length; }
    };
  };

  U.now = () => Date.now();
})();
