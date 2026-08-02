/* =============================================================
 * art.js — gerador procedural de pixel art (16 bits).
 * Tudo é desenhado em canvas de baixa resolução (1 unidade = 1 pixel)
 * e ampliado com suavização desligada, o que dá o visual retrô.
 *
 * API:
 *   art.sprite(spec, pose)   -> canvas 48x48 (ou 64x64 para grandes)
 *   art.portrait(spec)       -> canvas 40x40 com moldura
 *   art.icon(kind, color)    -> canvas 16x16
 *   art.background(pal, w,h) -> canvas de cenário
 *   art.logo(w, h)           -> canvas do logotipo
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const U = G.util;
  const art = (G.art = {});
  const cache = {};

  function mk(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return c;
  }
  art.mk = mk;

  /* ---------- primitivas de pixel ---------- */
  function P(ctx, x, y, col) { ctx.fillStyle = col; ctx.fillRect(x | 0, y | 0, 1, 1); }
  function R(ctx, x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0)); }
  function ell(ctx, cx, cy, rx, ry, col) {
    ctx.fillStyle = col;
    for (let y = -ry; y <= ry; y++) {
      const t = 1 - (y * y) / (ry * ry);
      if (t <= 0) continue;
      const w = Math.round(rx * Math.sqrt(t));
      ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
    }
  }
  /** massa com sombreamento em 3 tons */
  function mass(ctx, cx, cy, rx, ry, pal, lightDir) {
    ell(ctx, cx, cy, rx, ry, pal.dark);
    ell(ctx, cx, cy, rx - 1, ry - 1, pal.main);
    const d = lightDir === undefined ? -1 : lightDir;
    ell(ctx, cx + d * Math.max(1, rx * 0.28), cy - Math.max(1, ry * 0.3), Math.max(1, rx * 0.45), Math.max(1, ry * 0.42), pal.light);
  }
  function box(ctx, x, y, w, h, pal) {
    R(ctx, x, y, w, h, pal.dark);
    R(ctx, x + 1, y + 1, w - 2, h - 2, pal.main);
    R(ctx, x + 1, y + 1, Math.max(1, (w - 2) * 0.5), Math.max(1, (h - 2) * 0.35), pal.light);
  }
  function lineTo(ctx, x0, y0, x1, y1, col, thick) {
    const dx = x1 - x0, dy = y1 - y0;
    const n = Math.max(Math.abs(dx), Math.abs(dy));
    for (let i = 0; i <= n; i++) {
      const x = x0 + (dx * i) / n, y = y0 + (dy * i) / n;
      R(ctx, Math.round(x), Math.round(y), thick || 1, thick || 1, col);
    }
  }

  const DEF_PAL = { main: '#7a7a86', dark: '#2e2e36', light: '#c2c2ce', accent: '#ffd94a', skin: '#c9a07a', eye: '#ffffff' };

  /* =========================================================
   * ARMAS
   * ======================================================= */
  function drawWeapon(ctx, kind, x, y, pal, raised) {
    const a = pal.accent || '#d0d0d0';
    const d = pal.dark;
    switch (kind) {
      case 'spear':
        lineTo(ctx, x, y + (raised ? -8 : 6), x + (raised ? 6 : 2), y - 14, '#8a6238', 1);
        R(ctx, x + (raised ? 6 : 2), y - 17, 2, 4, a); P(ctx, x + (raised ? 6 : 2), y - 18, '#ffffff');
        break;
      case 'greatsword':
        lineTo(ctx, x, y + 4, x + (raised ? 7 : 3), y - 13, a, 2);
        R(ctx, x - 1, y + 3, 4, 2, d);
        break;
      case 'bow':
        for (let i = -7; i <= 7; i++) {
          const bx = x + Math.round(3 * Math.cos(i / 9)) + (raised ? 2 : 0);
          P(ctx, bx, y - 3 + i, '#8a6238');
        }
        lineTo(ctx, x - 1 + (raised ? 2 : 0), y - 10, x - 1 + (raised ? 2 : 0), y + 4, '#e8e8e8', 1);
        break;
      case 'crossbow':
        R(ctx, x - 1, y - 3, 8, 2, '#6a4a2a');
        R(ctx, x + 1, y - 6, 2, 8, d);
        R(ctx, x + 5, y - 4, 2, 4, a);
        break;
      case 'staff':
        lineTo(ctx, x, y + 6, x + (raised ? 4 : 1), y - 14, '#8a6238', 1);
        ell(ctx, x + (raised ? 4 : 1), y - 16, 2, 2, a);
        P(ctx, x + (raised ? 4 : 1), y - 17, '#ffffff');
        break;
      case 'orb':
        ell(ctx, x + (raised ? 5 : 3), y - (raised ? 10 : 4), 3, 3, a);
        ell(ctx, x + (raised ? 4 : 2), y - (raised ? 11 : 5), 1, 1, '#ffffff');
        break;
      case 'daggers':
        lineTo(ctx, x, y + 2, x + (raised ? 5 : 3), y - (raised ? 8 : 4), a, 1);
        lineTo(ctx, x - 6, y + 2, x - 8, y - (raised ? 6 : 3), a, 1);
        break;
      case 'lute':
        ell(ctx, x + 2, y + 1, 4, 5, '#a86a3a');
        ell(ctx, x + 2, y + 1, 1, 1, d);
        lineTo(ctx, x + 4, y - 3, x + 7, y - 10, '#6a4a2a', 1);
        break;
      case 'scythe':
        lineTo(ctx, x, y + 6, x + 2, y - 14, '#4a4a52', 1);
        for (let i = 0; i < 8; i++) P(ctx, x + 2 + i, y - 14 + Math.round(i * i * 0.14), a);
        break;
      default: break;
    }
  }

  /* =========================================================
   * ARQUÉTIPOS
   * ======================================================= */
  function drawHumanoid(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const raised = pose === 'action';
    const slim = s.build === 'slim', heavy = s.build === 'heavy';
    const bw = slim ? 4 : heavy ? 7 : 5;         // meia-largura do torso
    const cx = 24, feet = 45;
    const legH = 9, torsoH = slim ? 12 : 13;
    const torsoY = feet - legH - torsoH;
    const headR = slim ? 4 : 5;
    const headY = torsoY - headR - 1;

    // sombra no chão
    ell(ctx, cx, feet + 1, bw + 3, 2, 'rgba(0,0,0,0.28)');

    // capa atrás
    if (s.cape) {
      ctx.fillStyle = U.shade(pal.main, -0.35);
      for (let y = 0; y < torsoH + 6; y++) {
        const w = bw + 1 + Math.round(y * 0.28);
        ctx.fillRect(cx - w, torsoY + y, w * 2, 1);
      }
    }

    // pernas
    const legCol = U.shade(pal.dark, 0.12);
    R(ctx, cx - bw + 1, feet - legH, 2, legH, legCol);
    R(ctx, cx + bw - 3, feet - legH, 2, legH, legCol);
    R(ctx, cx - bw + 1, feet - 1, 3, 2, pal.dark);
    R(ctx, cx + bw - 4, feet - 1, 3, 2, pal.dark);

    // torso
    R(ctx, cx - bw, torsoY, bw * 2, torsoH, pal.dark);
    R(ctx, cx - bw + 1, torsoY + 1, bw * 2 - 2, torsoH - 2, pal.main);
    R(ctx, cx - bw + 1, torsoY + 1, bw - 1, Math.round(torsoH * 0.5), pal.light);
    if (s.skeletal) {
      for (let i = 0; i < 3; i++) R(ctx, cx - bw + 2, torsoY + 3 + i * 3, bw * 2 - 4, 1, pal.dark);
    }

    // braços
    const armY = torsoY + 2;
    const rArmY = raised ? armY - 5 : armY;
    R(ctx, cx - bw - 2, armY, 2, torsoH - 3, U.shade(pal.main, -0.2));
    R(ctx, cx + bw, rArmY, 2, torsoH - 3, U.shade(pal.main, -0.1));

    // cabeça
    ell(ctx, cx, headY, headR, headR, pal.dark);
    ell(ctx, cx, headY, headR - 1, headR - 1, pal.skin || pal.main);
    // olhos
    const eyeC = pal.eye || '#fff';
    P(ctx, cx - 2, headY - 1, eyeC); P(ctx, cx + 2, headY - 1, eyeC);
    if (s.mask) { R(ctx, cx - headR + 1, headY - 2, headR * 2 - 2, 3, pal.accent); P(ctx, cx - 2, headY - 1, '#000'); P(ctx, cx + 2, headY - 1, '#000'); }

    // chapéu / cabelo
    switch (s.hat) {
      case 'leaf':
        for (let i = -1; i <= 1; i++) ell(ctx, cx + i * 4, headY - headR - 1, 3, 2, pal.light);
        break;
      case 'hood':
        ell(ctx, cx, headY - 1, headR + 1, headR + 1, U.shade(pal.main, -0.25));
        ell(ctx, cx, headY + 1, headR - 1, headR - 1, '#00000000');
        ell(ctx, cx, headY + 1, headR - 1, headR - 2, pal.skin || pal.main);
        P(ctx, cx - 2, headY, eyeC); P(ctx, cx + 2, headY, eyeC);
        break;
      case 'pointed':
        for (let i = 0; i < 9; i++) R(ctx, cx - 5 + Math.round(i * 0.55), headY - headR - i, Math.max(1, 10 - i), 1, U.shade(pal.main, -0.15));
        R(ctx, cx - 6, headY - headR, 12, 2, pal.accent);
        break;
      case 'wide':
        R(ctx, cx - 8, headY - headR, 16, 2, U.shade(pal.main, -0.3));
        R(ctx, cx - 4, headY - headR - 3, 8, 3, U.shade(pal.main, -0.15));
        break;
      case 'cap':
        R(ctx, cx - headR, headY - headR, headR * 2, 3, pal.accent);
        R(ctx, cx + headR - 1, headY - headR + 1, 3, 1, U.shade(pal.accent, -0.3));
        break;
      case 'flower':
        for (let i = 0; i < 5; i++) {
          const a2 = (i / 5) * Math.PI * 2;
          ell(ctx, cx + Math.cos(a2) * 4, headY - headR - 1 + Math.sin(a2) * 2, 1, 1, pal.accent);
        }
        break;
      case 'hair':
        ell(ctx, cx, headY - headR + 1, headR, 3, pal.accent);
        for (let i = -3; i <= 3; i += 2) lineTo(ctx, cx + i, headY - headR, cx + i * 1.6, headY - headR - 4, pal.accent, 1);
        break;
      case 'mask':
        R(ctx, cx - headR, headY - 2, headR * 2, 4, pal.accent);
        P(ctx, cx - 2, headY, '#1a1a1a'); P(ctx, cx + 2, headY, '#1a1a1a');
        break;
      default: break;
    }

    // arma
    if (s.weapon && s.weapon !== 'none') drawWeapon(ctx, s.weapon, cx + bw + 2, torsoY + 8, pal, raised);
    if (s.backwards) { // pés invertidos (referência lúdica)
      R(ctx, cx - bw - 1, feet - 1, 3, 2, pal.accent);
      R(ctx, cx + bw - 2, feet - 1, 3, 2, pal.accent);
    }
  }

  function drawBeast(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const big = s.big || s.boss;
    const cx = 24, feet = 45;
    const bodyRx = big ? 13 : 10, bodyRy = big ? 8 : 6;
    const bodyY = feet - (big ? 14 : 11);
    ell(ctx, cx, feet + 1, bodyRx + 2, 2, 'rgba(0,0,0,0.28)');

    if (s.biped) {
      // postura ereta: pernas grossas, pés e ombros marcados
      const legW = big ? 6 : 5;
      R(ctx, cx - legW - 1, feet - 11, legW, 11, U.shade(pal.dark, 0.12));
      R(ctx, cx + 1, feet - 11, legW, 11, U.shade(pal.dark, 0.12));
      R(ctx, cx - legW - 2, feet - 2, legW + 2, 2, pal.dark);
      R(ctx, cx + 1, feet - 2, legW + 2, 2, pal.dark);
      mass(ctx, cx, feet - 19, bodyRx - 1, bodyRy + 4, pal);
      mass(ctx, cx, feet - 29, bodyRy + 1, bodyRy, pal);
      // orelhas
      if (!s.oneEye) {
        ell(ctx, cx - bodyRy, feet - 33, 2, 3, pal.dark);
        ell(ctx, cx + bodyRy, feet - 33, 2, 3, pal.dark);
      }
      if (s.oneEye) { ell(ctx, cx, feet - 29, 2, 2, pal.eye); P(ctx, cx, feet - 29, '#1a0000'); }
      else { P(ctx, cx - 3, feet - 29, pal.eye); P(ctx, cx + 3, feet - 29, pal.eye); }
      // braços
      R(ctx, cx - bodyRx, feet - 24, 3, 10, U.shade(pal.main, -0.2));
      R(ctx, cx + bodyRx - 3, feet - 24 - (pose === 'action' ? 5 : 0), 3, 10, U.shade(pal.main, -0.1));
      if (s.horns) { lineTo(ctx, cx - 4, feet - 33, cx - 7, feet - 39, pal.light, 1); lineTo(ctx, cx + 4, feet - 33, cx + 7, feet - 39, pal.light, 1); }
      return;
    }

    // quadrúpede
    const legY = bodyY + bodyRy - 1;
    for (const lx of [-bodyRx + 3, -bodyRx + 6, bodyRx - 6, bodyRx - 3]) {
      R(ctx, cx + lx, legY, 2, feet - legY, U.shade(pal.dark, 0.1));
    }
    mass(ctx, cx, bodyY, bodyRx, bodyRy, pal);
    if (s.shell) { for (let i = -bodyRx + 2; i < bodyRx - 1; i += 3) R(ctx, cx + i, bodyY - bodyRy, 2, bodyRy, U.shade(pal.light, -0.1)); }
    if (s.fat) ell(ctx, cx, bodyY + 2, bodyRx - 1, bodyRy - 1, U.shade(pal.main, 0.08));

    // pescoço e cabeça (frente = esquerda), erguidos para destacar a silhueta
    const hr = big ? 7 : 6;
    const hx = cx - bodyRx - 1, hy = bodyY - bodyRy - (big ? 4 : 3) - (pose === 'action' ? 3 : 0);
    lineTo(ctx, cx - bodyRx + 2, bodyY - bodyRy + 1, hx + 2, hy + 2, pal.main, 4);
    mass(ctx, hx, hy, hr, hr - 1, pal);
    // orelhas
    ell(ctx, hx + 2, hy - hr, 2, 3, pal.dark);
    ell(ctx, hx - 3, hy - hr + 1, 2, 3, pal.dark);
    P(ctx, hx - 2, hy - 1, pal.eye); P(ctx, hx + 2, hy - 1, pal.eye);
    // focinho
    R(ctx, hx - hr - 1, hy + 1, 4, 3, U.shade(pal.dark, 0.18));
    P(ctx, hx - hr - 1, hy + 1, pal.dark);
    if (s.horns) { lineTo(ctx, hx - 2, hy - hr + 1, hx - 5, hy - hr - 6, pal.light, 1); lineTo(ctx, hx + 3, hy - hr + 1, hx + 6, hy - hr - 6, pal.light, 1); }
    if (s.mane) for (let i = 0; i < 7; i++) lineTo(ctx, hx + 3, hy - 3 + i, hx + 8, hy - 6 + i, pal.accent, 1);
    if (s.tail) {
      let tx = cx + bodyRx, ty = bodyY - 1;
      for (let i = 0; i < 8; i++) { P(ctx, tx + i, ty - Math.round(Math.sin(i / 2.2) * 4), pal.main); P(ctx, tx + i, ty + 1 - Math.round(Math.sin(i / 2.2) * 4), pal.dark); }
    }
    if (s.spectral) { ctx.globalAlpha = 0.75; ell(ctx, cx, bodyY, bodyRx + 2, bodyRy + 2, pal.light); ctx.globalAlpha = 1; }
  }

  function drawSerpent(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const big = s.boss || s.big;
    const cx = 24, base = 44;
    const seg = big ? 14 : 10, r = big ? 5 : 3;
    ell(ctx, cx, base + 2, 12, 2, 'rgba(0,0,0,0.25)');
    for (let i = seg - 1; i >= 0; i--) {
      const t = i / seg;
      const x = cx + Math.sin(t * Math.PI * 2.2 + (pose === 'action' ? 0.6 : 0)) * (big ? 13 : 9);
      const y = base - t * (big ? 34 : 24);
      const rr = r * (1 - t * 0.45);
      ell(ctx, x, y, rr + 1, rr + 1, pal.dark);
      ell(ctx, x, y, rr, rr, i % 2 ? pal.main : pal.light);
    }
    // cabeça no topo
    const hx = cx + Math.sin(Math.PI * 2.2 + (pose === 'action' ? 0.6 : 0)) * (big ? 13 : 9);
    const hy = base - (big ? 34 : 24);
    mass(ctx, hx, hy, r + 2, r + 1, pal);
    P(ctx, hx - 1, hy - 1, pal.eye); P(ctx, hx + 2, hy - 1, pal.eye);
    lineTo(ctx, hx + 3, hy + 1, hx + 6, hy + 2, pal.accent, 1);
  }

  function drawSpirit(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const cx = 24, cy = s.small ? 30 : 26;
    const rx = s.small ? 5 : (s.big ? 11 : 8);
    ctx.globalAlpha = 0.9;
    // cauda esfumaçada
    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      const w = rx * (1 - t) + 1;
      ell(ctx, cx + Math.sin(t * 5 + (pose === 'action' ? 1 : 0)) * 3, cy + rx + i, w, 1, i % 2 ? pal.main : pal.dark);
    }
    mass(ctx, cx, cy, rx, rx, pal);
    ctx.globalAlpha = 1;
    P(ctx, cx - 2, cy - 1, pal.eye); P(ctx, cx + 2, cy - 1, pal.eye);
    if (s.hair) for (let i = -rx; i <= rx; i += 2) lineTo(ctx, cx + i, cy - rx + 1, cx + i * 1.5, cy - rx - 5, pal.light, 1);
    if (s.mask) { R(ctx, cx - rx + 1, cy - 2, rx * 2 - 2, 4, pal.accent); P(ctx, cx - 2, cy, '#1a1a1a'); P(ctx, cx + 2, cy, '#1a1a1a'); }
    if (s.swirl) for (let i = 0; i < 22; i++) { const a2 = i * 0.55, rr = 3 + i * 0.6; P(ctx, cx + Math.cos(a2) * rr, cy + Math.sin(a2) * rr * 0.6, pal.light); }
    if (s.glow) { ctx.globalAlpha = 0.35; ell(ctx, cx, cy, rx + 4, rx + 4, pal.light); ctx.globalAlpha = 1; }
  }

  function drawPlant(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const cx = 24, feet = 45;
    ell(ctx, cx, feet + 1, 9, 2, 'rgba(0,0,0,0.25)');
    // raízes
    for (let i = -3; i <= 3; i += 2) lineTo(ctx, cx, feet - 4, cx + i * 3, feet, pal.dark, 1);
    // caule
    const h = s.boss ? 30 : 22;
    for (let y = 0; y < h; y++) {
      const x = cx + Math.round(Math.sin(y / 6 + (pose === 'action' ? 0.8 : 0)) * 2);
      R(ctx, x - 2, feet - 4 - y, 4, 1, y % 3 ? pal.main : pal.dark);
    }
    const topY = feet - 4 - h;
    if (s.humanoidTree) {
      mass(ctx, cx, topY + 4, 6, 7, pal);
      P(ctx, cx - 2, topY + 2, pal.eye); P(ctx, cx + 2, topY + 2, pal.eye);
      for (let i = 0; i < 4; i++) lineTo(ctx, cx, topY - 1, cx + (i - 1.5) * 6, topY - 8, pal.dark, 1);
    } else {
      mass(ctx, cx, topY, 6, 5, pal);
      P(ctx, cx - 2, topY - 1, pal.eye); P(ctx, cx + 2, topY - 1, pal.eye);
      // pétalas / folhas
      for (let i = 0; i < 6; i++) {
        const a2 = (i / 6) * Math.PI * 2;
        ell(ctx, cx + Math.cos(a2) * 7, topY + Math.sin(a2) * 5, 2, 2, pal.accent);
      }
    }
    if (s.vines) for (let i = 0; i < 3; i++) {
      const sx = cx + (i - 1) * 7;
      for (let y = 0; y < 12; y++) P(ctx, sx + Math.round(Math.sin(y / 3) * 2), feet - 8 - y, pal.light);
    }
    if (s.crystal) for (let i = 0; i < 5; i++) ell(ctx, cx + (i - 2) * 4, feet - 10 - (i % 3) * 4, 1, 2, pal.accent);
  }

  function drawGolem(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const big = s.big || s.boss;
    const cx = 24, feet = 45;
    const w = big ? 9 : 7;
    ell(ctx, cx, feet + 1, w + 3, 2, 'rgba(0,0,0,0.3)');
    box(ctx, cx - w + 1, feet - 8, 5, 8, pal);
    box(ctx, cx + w - 6, feet - 8, 5, 8, pal);
    box(ctx, cx - w, feet - 22, w * 2, 15, pal);
    box(ctx, cx - 5, feet - 31, 10, 9, pal);
    P(ctx, cx - 2, feet - 27, pal.eye); P(ctx, cx + 2, feet - 27, pal.eye);
    const armUp = pose === 'action' ? 5 : 0;
    box(ctx, cx - w - 4, feet - 21 - armUp, 4, 12, pal);
    box(ctx, cx + w, feet - 21 - armUp, 4, 12, pal);
    if (s.crystal) for (let i = 0; i < 5; i++) { const a2 = i * 1.3; ell(ctx, cx + Math.cos(a2) * 6, feet - 18 + Math.sin(a2) * 5, 1, 2, pal.accent); }
    if (s.forge) { ell(ctx, cx + w + 4, feet - 14, 2, 2, '#ff8a3a'); R(ctx, cx + w + 2, feet - 12, 5, 2, '#4a3226'); }
  }

  function drawInsect(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const cx = 24, cy = 34, legs = s.legs || 6;
    ell(ctx, cx, 45, 9, 2, 'rgba(0,0,0,0.25)');
    for (let i = 0; i < legs; i++) {
      const side = i % 2 ? 1 : -1;
      const k = Math.floor(i / 2);
      lineTo(ctx, cx + side * 4, cy + 1 + k, cx + side * 11, 44 - k * 2, pal.dark, 1);
    }
    mass(ctx, cx + 3, cy, 7, 5, pal);
    mass(ctx, cx - 5, cy - 1, 4, 4, pal);
    P(ctx, cx - 7, cy - 2, pal.eye); P(ctx, cx - 4, cy - 2, pal.eye);
    lineTo(ctx, cx - 6, cy - 4, cx - 9, cy - 9, pal.dark, 1);
    lineTo(ctx, cx - 3, cy - 4, cx - 1, cy - 10, pal.dark, 1);
    if (s.glow) { ctx.globalAlpha = 0.45; ell(ctx, cx + 6, cy + 2, 5, 4, pal.light); ctx.globalAlpha = 1; }
  }

  function drawBird(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const big = s.big;
    const cx = 24, cy = s.small ? 30 : 28;
    const r = s.small ? 4 : (big ? 8 : 6);
    ell(ctx, cx, 45, r + 2, 2, 'rgba(0,0,0,0.22)');
    const flap = pose === 'action' ? -4 : 0;
    // asas
    for (const side of [-1, 1]) {
      ctx.fillStyle = U.shade(pal.main, -0.2);
      for (let i = 0; i < (big ? 12 : 9); i++) {
        const y = cy - i * 0.5 + flap * (i / 9);
        ctx.fillRect(cx + side * (r + i), Math.round(y), 1, Math.max(1, 5 - i * 0.35));
      }
    }
    mass(ctx, cx, cy, r, r - 1, pal);
    mass(ctx, cx, cy - r - 1, r - 2, r - 2, pal);
    P(ctx, cx - 2, cy - r - 2, pal.eye); P(ctx, cx + 2, cy - r - 2, pal.eye);
    lineTo(ctx, cx, cy - r, cx - 3, cy - r + 2, pal.accent, 1);
    R(ctx, cx - 2, cy + r - 1, 1, 4, pal.dark); R(ctx, cx + 1, cy + r - 1, 1, 4, pal.dark);
  }

  function drawFish(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const cx = 24, cy = 30, rx = s.big ? 12 : 9, ry = s.big ? 7 : 5;
    mass(ctx, cx, cy, rx, ry, pal);
    // cauda
    for (let i = 0; i < 6; i++) {
      const h = 1 + i;
      R(ctx, cx + rx + i, cy - h, 1, h * 2, i % 2 ? pal.main : pal.dark);
    }
    // barbatana
    for (let i = 0; i < 5; i++) R(ctx, cx - 2 + i, cy - ry - (5 - i) + 2, 1, 5 - i, pal.accent);
    P(ctx, cx - rx + 3, cy - 1, pal.eye);
    lineTo(ctx, cx - rx, cy + 1, cx - rx + 3, cy + 2, pal.dark, 1);
    if (s.glow) { ctx.globalAlpha = 0.4; ell(ctx, cx - rx - 2, cy - 4, 2, 2, pal.accent); ctx.globalAlpha = 1; }
  }

  function drawCrab(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const cx = 24, cy = 36;
    ell(ctx, cx, 45, 10, 2, 'rgba(0,0,0,0.25)');
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) lineTo(ctx, cx + side * 6, cy + 1 + i * 2, cx + side * 12, 44, pal.dark, 1);
    mass(ctx, cx, cy, 10, 6, pal);
    P(ctx, cx - 3, cy - 4, pal.eye); P(ctx, cx + 3, cy - 4, pal.eye);
    const up = pose === 'action' ? -4 : 0;
    for (const side of [-1, 1]) {
      lineTo(ctx, cx + side * 8, cy, cx + side * 13, cy - 4 + up, pal.main, 2);
      ell(ctx, cx + side * 14, cy - 6 + up, 3, 3, pal.light);
      R(ctx, cx + side * 14 - 1, cy - 6 + up, 3, 1, pal.dark);
    }
  }

  function drawBat(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const cx = 24, cy = 26;
    const flap = pose === 'action' ? 5 : 0;
    for (const side of [-1, 1]) {
      ctx.fillStyle = pal.main;
      for (let i = 0; i < 12; i++) {
        const y = cy - 3 + Math.round(Math.sin(i / 4) * 3) + Math.round((i / 12) * flap);
        ctx.fillRect(cx + side * (4 + i), y, 1, Math.max(1, 7 - Math.abs(i - 5)));
      }
      lineTo(ctx, cx + side * 4, cy - 3, cx + side * 15, cy - 6 + flap, pal.dark, 1);
    }
    mass(ctx, cx, cy, 4, 5, pal);
    P(ctx, cx - 2, cy - 2, pal.eye); P(ctx, cx + 2, cy - 2, pal.eye);
    lineTo(ctx, cx - 3, cy - 5, cx - 4, cy - 8, pal.dark, 1);
    lineTo(ctx, cx + 3, cy - 5, cx + 4, cy - 8, pal.dark, 1);
  }

  function drawBlob(ctx, s, pose, rnd) {
    const pal = s.pal || DEF_PAL;
    const cx = 24, feet = 45;
    ell(ctx, cx, feet + 1, 12, 2, 'rgba(0,0,0,0.28)');
    const squash = pose === 'action' ? 2 : 0;
    mass(ctx, cx, feet - 8 + squash, 11, 8 - squash, pal);
    for (let i = 0; i < 5; i++) P(ctx, cx - 8 + i * 4, feet - 15 + (i % 2) * 2, pal.light);
    P(ctx, cx - 3, feet - 10, pal.eye); P(ctx, cx + 3, feet - 10, pal.eye);
  }

  const ARCH = {
    humanoid: drawHumanoid, beast: drawBeast, serpent: drawSerpent, spirit: drawSpirit,
    plant: drawPlant, golem: drawGolem, insect: drawInsect, bird: drawBird,
    fish: drawFish, crab: drawCrab, bat: drawBat, blob: drawBlob
  };

  /* =========================================================
   * SPRITE
   * ======================================================= */
  art.sprite = function (spec, pose) {
    pose = pose || 'idle';
    const key = 'sp_' + JSON.stringify(spec) + '_' + pose;
    if (cache[key]) return cache[key];
    const size = spec.boss || spec.big ? 64 : 48;
    const c = mk(size, size);
    const ctx = c.getContext('2d');
    ctx.save();
    if (size === 64) ctx.translate(8, 12);   // centraliza o desenho de 48px
    const fn = ARCH[spec.arch] || drawHumanoid;
    const rnd = U.rng(hashStr(spec.arch + (spec.pal && spec.pal.main)));
    if (spec.boss || spec.big) { ctx.translate(24, 45); ctx.scale(1.35, 1.35); ctx.translate(-24, -45); }
    fn(ctx, spec, pose, rnd);
    ctx.restore();
    cache[key] = c;
    return c;
  };

  function hashStr(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* =========================================================
   * RETRATO
   * ======================================================= */
  /** Caixa envolvente do conteúdo não transparente de um canvas. */
  function bbox(cnv) {
    const x = cnv.getContext('2d');
    const d = x.getImageData(0, 0, cnv.width, cnv.height).data;
    let minX = cnv.width, minY = cnv.height, maxX = -1, maxY = -1;
    for (let i = 3; i < d.length; i += 4) {
      if (d[i] < 20) continue;
      const p = (i - 3) / 4, px = p % cnv.width, py = (p / cnv.width) | 0;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    if (maxX < 0) return { x: 0, y: 0, w: cnv.width, h: cnv.height };
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }
  art.bbox = bbox;

  art.portrait = function (spec, rarityColor) {
    const key = 'pt_' + JSON.stringify(spec) + (rarityColor || '');
    if (cache[key]) return cache[key];
    const c = mk(40, 40);
    const ctx = c.getContext('2d');
    // fundo
    const pal = spec.pal || DEF_PAL;
    const g = ctx.createLinearGradient(0, 0, 0, 40);
    g.addColorStop(0, U.shade(pal.dark, 0.25));
    g.addColorStop(1, U.shade(pal.dark, -0.4));
    ctx.fillStyle = g; ctx.fillRect(0, 0, 40, 40);
    // Recorte do busto: calculado a partir da caixa real do sprite, para
    // funcionar com qualquer arquétipo (humanoide, fera, serpente, planta…).
    const sp = art.sprite(spec, 'idle');
    const b = bbox(sp);
    const side = U.clamp(Math.max(b.w, b.h * 0.58), 16, Math.min(sp.width, sp.height));
    const cx = b.x + b.w / 2;
    const sx = U.clamp(Math.round(cx - side / 2), 0, sp.width - side);
    const sy = U.clamp(Math.round(b.y - 1), 0, sp.height - side);
    ctx.save();
    ctx.beginPath(); ctx.rect(2, 2, 36, 36); ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sp, sx, sy, side, side, 2, 2, 36, 36);
    ctx.restore();
    // moldura
    ctx.strokeStyle = rarityColor || '#c9a227';
    ctx.lineWidth = 2; ctx.strokeRect(1, 1, 38, 38);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, 39, 39);
    cache[key] = c;
    return c;
  };

  /* =========================================================
   * ÍCONES (equipamento, materiais, moedas)
   * ======================================================= */
  art.icon = function (kind, color) {
    const key = 'ic_' + kind + '_' + color;
    if (cache[key]) return cache[key];
    const c = mk(16, 16);
    const ctx = c.getContext('2d');
    const col = color || '#c9c9d2';
    const d = U.shade(col, -0.45), l = U.shade(col, 0.4);
    switch (kind) {
      case 'sword': lineTo(ctx, 4, 12, 11, 4, col, 2); R(ctx, 3, 11, 4, 2, d); lineTo(ctx, 5, 12, 10, 5, l, 1); break;
      case 'helm': ell(ctx, 8, 8, 5, 5, d); ell(ctx, 8, 8, 4, 4, col); R(ctx, 6, 7, 4, 4, d); R(ctx, 5, 4, 6, 2, l); break;
      case 'chest': R(ctx, 4, 4, 8, 9, d); R(ctx, 5, 5, 6, 7, col); R(ctx, 5, 5, 3, 4, l); R(ctx, 3, 4, 2, 3, d); R(ctx, 11, 4, 2, 3, d); break;
      case 'glove': R(ctx, 5, 6, 6, 7, d); R(ctx, 6, 7, 4, 5, col); R(ctx, 4, 5, 2, 3, col); R(ctx, 10, 5, 2, 3, col); break;
      case 'boot': R(ctx, 5, 3, 4, 8, d); R(ctx, 6, 4, 2, 6, col); R(ctx, 4, 10, 8, 3, d); R(ctx, 5, 11, 6, 1, l); break;
      case 'amulet': for (let i = 0; i < 10; i++) { const a2 = Math.PI + (i / 9) * Math.PI; P(ctx, 8 + Math.cos(a2) * 5, 7 + Math.sin(a2) * 4, d); } ell(ctx, 8, 11, 3, 3, col); ell(ctx, 7, 10, 1, 1, l); break;
      case 'ring': ell(ctx, 8, 9, 4, 4, d); ell(ctx, 8, 9, 2, 2, '#00000000'); ctx.fillStyle = 'rgba(0,0,0,0)'; ell(ctx, 8, 9, 3, 3, col); ell(ctx, 8, 9, 2, 2, '#0000'); R(ctx, 6, 8, 5, 3, col); ell(ctx, 8, 4, 2, 2, l); break;
      case 'relic': for (let i = 0; i < 6; i++) { const a2 = (i / 6) * Math.PI * 2; lineTo(ctx, 8, 8, 8 + Math.cos(a2) * 6, 8 + Math.sin(a2) * 6, d, 1); } ell(ctx, 8, 8, 3, 3, col); ell(ctx, 7, 7, 1, 1, l); break;
      case 'gold': ell(ctx, 8, 8, 5, 5, U.shade('#ffd94a', -0.35)); ell(ctx, 8, 8, 4, 4, '#ffd94a'); ell(ctx, 6, 6, 1, 1, '#fff8c0'); break;
      case 'gem': for (let y = 0; y < 6; y++) R(ctx, 8 - (5 - y), 4 + y, (5 - y) * 2 + 1, 1, '#7fe8ff'); for (let y = 0; y < 5; y++) R(ctx, 8 - y, 10 + y, y * 2 + 1, 1, '#3fa8d8'); break;
      case 'essence': ell(ctx, 8, 8, 5, 6, '#5a2a7a'); ell(ctx, 8, 8, 3, 4, '#c07bff'); ell(ctx, 7, 6, 1, 1, '#fff'); break;
      case 'token': ell(ctx, 8, 8, 6, 6, '#8a5a2a'); ell(ctx, 8, 8, 4, 4, '#d99a4a'); R(ctx, 6, 7, 5, 3, '#5a3a18'); break;
      case 'mat': ell(ctx, 8, 9, 5, 4, d); ell(ctx, 7, 8, 3, 3, col); ell(ctx, 10, 10, 2, 2, l); break;
      case 'potion': R(ctx, 7, 2, 3, 3, d); ell(ctx, 8, 10, 4, 5, d); ell(ctx, 8, 10, 3, 4, col); ell(ctx, 7, 9, 1, 1, l); break;
      case 'star': for (let i = 0; i < 5; i++) { const a2 = -Math.PI / 2 + (i / 5) * Math.PI * 2; lineTo(ctx, 8, 8, 8 + Math.cos(a2) * 6, 8 + Math.sin(a2) * 6, col, 2); } ell(ctx, 8, 8, 2, 2, l); break;
      case 'lock': R(ctx, 4, 8, 8, 6, col); R(ctx, 6, 4, 4, 4, d); R(ctx, 7, 10, 2, 2, d); break;
      default: ell(ctx, 8, 8, 5, 5, col); break;
    }
    cache[key] = c;
    return c;
  };

  /* =========================================================
   * CENÁRIO
   * ======================================================= */
  /* --------------------------------------------------------------
   * Silhuetas de primeiro plano. Cada região escolhe um tipo em
   * `pal.prop`, para que dez regiões não pareçam a mesma paisagem
   * repintada.
   * ------------------------------------------------------------ */
  function drawProp(ctx, kind, x, baseY, rnd, pal) {
    const col = pal.near, dark = U.shade(pal.near, -0.3), lit = U.shade(pal.near, 0.18);
    switch (kind) {
      case 'tree': {                    // copa arredondada
        const th = 14 + rnd() * 20;
        ctx.fillStyle = dark; ctx.fillRect(x, baseY - th, 2, th);
        ell(ctx, x + 1, baseY - th, 5 + rnd() * 3, 4 + rnd() * 3, col);
        break;
      }
      case 'palm': {                    // tronco curvo + folhas
        const th = 18 + rnd() * 16;
        for (let y = 0; y < th; y++) ctx.fillRect(x + Math.round(Math.sin(y / th * 1.2) * 3), baseY - y, 2, 1);
        const tx = x + Math.round(Math.sin(1.2) * 3);
        for (let f = 0; f < 5; f++) {
          const a = -Math.PI + f * (Math.PI / 4);
          lineTo(ctx, tx + 1, baseY - th, tx + 1 + Math.cos(a) * 9, baseY - th + Math.sin(a) * 5 + 2, col, 2);
        }
        break;
      }
      case 'cactus': {                  // mandacaru: coluna com braços
        const th = 12 + rnd() * 16;
        ctx.fillStyle = col; ctx.fillRect(x, baseY - th, 3, th);
        ctx.fillStyle = lit; ctx.fillRect(x, baseY - th, 1, th);
        if (rnd() > 0.35) { ctx.fillStyle = col; ctx.fillRect(x - 3, baseY - th * 0.7, 3, 2); ctx.fillRect(x - 3, baseY - th * 0.7 - 5, 2, 6); }
        if (rnd() > 0.45) { ctx.fillStyle = col; ctx.fillRect(x + 3, baseY - th * 0.55, 3, 2); ctx.fillRect(x + 4, baseY - th * 0.55 - 6, 2, 7); }
        break;
      }
      case 'thin': {                    // árvore retorcida do cerrado
        const th = 12 + rnd() * 14;
        let cx = x;
        for (let y = 0; y < th; y++) { cx += (rnd() - 0.5) * 0.9; ctx.fillStyle = dark; ctx.fillRect(Math.round(cx), baseY - y, 2, 1); }
        for (let b = 0; b < 3; b++) lineTo(ctx, cx, baseY - th, cx + (b - 1) * 6, baseY - th - 3 - rnd() * 4, dark, 1);
        ell(ctx, cx, baseY - th - 2, 4 + rnd() * 2, 2, col);
        break;
      }
      case 'deadtree': {                // galhos secos do pântano
        const th = 14 + rnd() * 18;
        ctx.fillStyle = dark; ctx.fillRect(x, baseY - th, 2, th);
        for (let b = 0; b < 4; b++) {
          const by = baseY - th * (0.5 + b * 0.14), dir = b % 2 ? 1 : -1;
          lineTo(ctx, x + 1, by, x + 1 + dir * (4 + rnd() * 5), by - 4 - rnd() * 4, dark, 1);
        }
        break;
      }
      case 'root': {                    // raízes de mangue em arco
        const th = 8 + rnd() * 10;
        ctx.fillStyle = dark; ctx.fillRect(x, baseY - th - 6, 2, th);
        for (let r = -2; r <= 2; r++) {
          if (!r) continue;
          for (let s = 0; s <= 8; s++) {
            const t = s / 8;
            ctx.fillRect(Math.round(x + r * 4 * t), Math.round(baseY - th * (1 - t * t)), 1, 1);
          }
        }
        ell(ctx, x + 1, baseY - th - 6, 5 + rnd() * 3, 3, col);
        break;
      }
      case 'crystal': {                 // agulhas de cristal
        const th = 8 + rnd() * 20;
        for (let s = 0; s < th; s++) {
          const wdt = Math.max(1, Math.round((1 - s / th) * 4));
          ctx.fillStyle = s % 3 ? col : lit;
          ctx.fillRect(x - (wdt >> 1), baseY - s, wdt, 1);
        }
        break;
      }
      case 'house': {                    // casinhas do vilarejo
        const bw = 12 + rnd() * 8, bh = 9 + rnd() * 6;
        ctx.fillStyle = col; ctx.fillRect(x, baseY - bh, bw, bh);
        ctx.fillStyle = dark;
        for (let s = 0; s <= bw / 2; s++) ctx.fillRect(x + s, baseY - bh - Math.round(s * 0.7), bw - s * 2, 1);
        ctx.fillStyle = U.shade(pal.accent, -0.2);
        ctx.fillRect(x + Math.round(bw / 2) - 1, baseY - 4, 3, 4);
        break;
      }
      case 'flag': {                     // mastros e bandeirinhas da festa
        const th = 16 + rnd() * 14;
        ctx.fillStyle = dark; ctx.fillRect(x, baseY - th, 1, th);
        for (let f = 0; f < 4; f++) {
          ctx.fillStyle = f % 2 ? pal.accent : col;
          const fy = baseY - th + 2 + f * 4;
          for (let s = 0; s < 4; s++) ctx.fillRect(x + 1 + s, fy + s, 1, 4 - s);
        }
        break;
      }
      case 'ruin': {                     // colunas partidas
        const th = 12 + rnd() * 20, bw = 4 + Math.round(rnd() * 2);
        ctx.fillStyle = col; ctx.fillRect(x, baseY - th, bw, th);
        ctx.fillStyle = lit; ctx.fillRect(x, baseY - th, 1, th);
        ctx.fillStyle = dark;
        for (let s = 0; s < th; s += 5) ctx.fillRect(x, baseY - s, bw, 1);
        ctx.fillRect(x - 1, baseY - th - 2, bw + 2, 2);
        break;
      }
      default: {
        const th = 14 + rnd() * 18;
        ctx.fillStyle = dark; ctx.fillRect(x, baseY - th, 2, th);
        ell(ctx, x + 1, baseY - th, 5, 4, col);
      }
    }
  }

  art.background = function (pal, w, h, weather) {
    const key = 'bg_' + pal.skyTop + pal.ground + pal.near + (pal.prop || '') + w + 'x' + h + weather;
    if (cache[key]) return cache[key];
    const c = mk(w, h);
    const ctx = c.getContext('2d');
    const rnd = U.rng(hashStr(pal.skyTop + pal.ground));

    // céu
    const g = ctx.createLinearGradient(0, 0, 0, h * 0.75);
    g.addColorStop(0, pal.skyTop); g.addColorStop(1, pal.skyBot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // astro
    const sunX = w * (0.18 + rnd() * 0.6), sunY = h * 0.16;
    ctx.globalAlpha = 0.35; ell(ctx, sunX, sunY, 16, 16, pal.sun); ctx.globalAlpha = 1;
    ell(ctx, sunX, sunY, 8, 8, pal.sun);
    if (weather === 'eclipse') { ell(ctx, sunX - 3, sunY - 2, 8, 8, U.shade(pal.skyTop, -0.4)); }

    // camadas distantes
    function ridge(baseY, amp, col, step, jag) {
      ctx.fillStyle = col;
      let prev = baseY;
      for (let x = 0; x < w; x += step) {
        const n = Math.sin(x * 0.021 + rnd() * 0.4) * amp + Math.sin(x * 0.061) * amp * 0.4;
        const y = Math.round(baseY + n - (jag ? rnd() * amp * 0.5 : 0));
        ctx.fillRect(x, y, step, h - y);
        prev = y;
      }
    }
    ridge(h * 0.55, 10, U.shade(pal.far, 0.05), 3, false);
    ridge(h * 0.66, 8, pal.mid, 2, true);

    // vegetação/estruturas próprias da região
    const groundY = h * 0.72;
    const prop = pal.prop || 'tree';
    const count = prop === 'house' || prop === 'ruin' ? 7 : 14;
    for (let i = 0; i < count; i++) {
      const x = Math.round(rnd() * w);
      drawProp(ctx, prop, x, groundY, rnd, pal);
    }

    // chão
    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, Math.round(h * 0.72), w, h);
    ctx.fillStyle = pal.groundDark;
    for (let i = 0; i < w * 1.2; i++) {
      const x = rnd() * w, y = h * 0.72 + rnd() * (h * 0.28);
      ctx.fillRect(x | 0, y | 0, 1 + (rnd() > 0.8 ? 1 : 0), 1);
    }
    // linha do horizonte
    ctx.fillStyle = U.shade(pal.ground, -0.3);
    ctx.fillRect(0, Math.round(h * 0.72), w, 1);

    // névoa
    ctx.globalAlpha = 0.16; ctx.fillStyle = pal.fog;
    ctx.fillRect(0, Math.round(h * 0.6), w, Math.round(h * 0.18));
    ctx.globalAlpha = 1;

    cache[key] = c;
    return c;
  };

  /* =========================================================
   * LOGOTIPO
   * ======================================================= */
  art.logo = function (w, h) {
    w = w || 320; h = h || 128;
    const key = 'logo' + w + 'x' + h;
    if (cache[key]) return cache[key];
    const S = 2;                     // fator de pixelização
    const c = mk(w, h);
    const ctx = c.getContext('2d');
    const lc = mk(Math.round(w / S), Math.round(h / S));
    const x = lc.getContext('2d');
    const W = lc.width, H = lc.height;

    // fundo: ruínas
    x.fillStyle = 'rgba(0,0,0,0)'; x.clearRect(0, 0, W, H);
    x.globalAlpha = 0.5;
    for (let i = 0; i < 6; i++) {
      const cx = 10 + i * (W - 20) / 5, ch = 16 + (i % 3) * 6;
      x.fillStyle = '#3a2f52'; x.fillRect(cx - 2, H * 0.5 - ch, 5, ch);
      x.fillStyle = '#4a3f66'; x.fillRect(cx - 4, H * 0.5 - ch - 2, 9, 3);
    }
    x.globalAlpha = 1;

    // floresta à esquerda
    for (let i = 0; i < 7; i++) {
      const tx = 4 + i * 5, th = 12 + (i % 3) * 5;
      x.fillStyle = '#14331f'; x.fillRect(tx, H * 0.52 - th, 2, th);
      ell(x, tx + 1, H * 0.52 - th, 4, 4, '#1e5c34');
    }
    // rio e cachoeira à direita
    x.fillStyle = '#1e4a7a';
    for (let y = 0; y < 20; y++) x.fillRect(W - 22 + Math.round(Math.sin(y / 4) * 2), H * 0.33 + y, 10, 1);
    x.fillStyle = '#7fd8ff';
    for (let y = 0; y < 18; y++) x.fillRect(W - 20 + Math.round(Math.sin(y / 4) * 2), H * 0.33 + y, 4, 1);
    ell(x, W - 16, H * 0.53, 8, 3, '#a8e8ff');

    // cristal central (silhueta livre inspirada em um mapa)
    const gx = W / 2, gy = H * 0.42;
    const shape = [
      [0, -20], [7, -17], [11, -9], [14, -1], [11, 8], [5, 15], [-3, 17], [-10, 11], [-13, 2], [-11, -8], [-5, -16]
    ];
    x.beginPath();
    shape.forEach((p, i) => { const px = gx + p[0] * 1.15, py = gy + p[1] * 1.15; i ? x.lineTo(px, py) : x.moveTo(px, py); });
    x.closePath();
    const cg = x.createLinearGradient(gx - 14, gy - 20, gx + 14, gy + 18);
    cg.addColorStop(0, '#8affd8'); cg.addColorStop(0.45, '#2ec98f'); cg.addColorStop(1, '#0f6b4a');
    x.fillStyle = cg; x.fill();
    x.strokeStyle = '#eaffe0'; x.lineWidth = 1; x.stroke();
    // facetas
    x.strokeStyle = 'rgba(255,255,255,0.4)';
    x.beginPath(); x.moveTo(gx - 6, gy - 18); x.lineTo(gx + 2, gy + 4); x.lineTo(gx + 12, gy - 4); x.stroke();

    // serpente de fogo em volta
    for (let i = 0; i < 90; i++) {
      const t = i / 90, a2 = t * Math.PI * 2.6 - 0.6;
      const rr = 20 + Math.sin(t * 6) * 3;
      const px = gx + Math.cos(a2) * rr * 1.25, py = gy + Math.sin(a2) * rr * 0.85;
      const col = i % 7 < 3 ? '#ff8a2a' : (i % 7 < 5 ? '#ffd24a' : '#c4351a');
      x.fillStyle = col; x.fillRect(px | 0, py | 0, 2, 2);
    }
    // cabeça da serpente
    ell(x, gx + Math.cos(-0.6) * 25, gy + Math.sin(-0.6) * 17, 3, 3, '#ffd24a');
    // redemoinho
    for (let i = 0; i < 26; i++) {
      const a2 = i * 0.55, rr = 1.5 + i * 0.42;
      x.fillStyle = i % 2 ? '#cfeaff' : '#8fc8ff';
      x.fillRect((gx - 32 + Math.cos(a2) * rr) | 0, (gy + 16 + Math.sin(a2) * rr * 0.6) | 0, 1, 1);
    }

    // amplia (nearest neighbour) para o canvas final
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(lc, 0, 0, W, H, 0, 0, w, h);

    cache[key] = c;
    return c;
  };

  /** Texto em estilo pixel: desenha pequeno e amplia. */
  art.pixelText = function (text, px, color, outline) {
    const key = 'tx_' + text + px + color + outline;
    if (cache[key]) return cache[key];
    const S = 3;
    const small = mk(4, 4);
    const sx = small.getContext('2d');
    sx.font = 'bold ' + Math.round(px / S) + 'px "Courier New", monospace';
    const wsm = Math.ceil(sx.measureText(text).width) + 4;
    const hsm = Math.round(px / S) + 6;
    const c2 = mk(wsm, hsm);
    const x2 = c2.getContext('2d');
    x2.font = 'bold ' + Math.round(px / S) + 'px "Courier New", monospace';
    x2.textBaseline = 'middle';
    if (outline) {
      x2.strokeStyle = outline; x2.lineWidth = 2;
      x2.strokeText(text, 2, hsm / 2);
    }
    x2.fillStyle = color; x2.fillText(text, 2, hsm / 2);
    const out = mk(wsm * S, hsm * S);
    const o = out.getContext('2d');
    o.imageSmoothingEnabled = false;
    o.drawImage(c2, 0, 0, wsm, hsm, 0, 0, wsm * S, hsm * S);
    cache[key] = out;
    return out;
  };

  art.clearCache = function () { for (const k in cache) delete cache[k]; };
})();
