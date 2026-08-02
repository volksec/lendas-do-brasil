/* =============================================================
 * render.js — desenho da cena de batalha em Canvas 2D.
 * Resolução lógica fixa (480x270) escalada para o tamanho real,
 * mantendo o visual pixelado. Números de dano e partículas usam
 * pools de objetos para evitar alocação por quadro.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const U = G.util;
  const R = (G.render = {});

  const VW = 480, VH = 270;              // resolução lógica da cena
  let canvas = null, ctx = null, scale = 1, dpr = 1;
  let shake = 0, shakeT = 0;
  let time = 0;

  const numbers = [];      // números flutuantes ativos
  const parts = [];        // partículas ativas
  const numPool = U.Pool(() => ({}), (o) => { o.dead = true; });
  const partPool = U.Pool(() => ({}), (o) => { o.dead = true; });

  R.attach = function (cnv) {
    canvas = cnv;
    ctx = canvas.getContext('2d', { alpha: false });
    R.resize();
  };

  R.resize = function () {
    if (!canvas) return;
    const q = G.game.settings.graphics;
    const maxDpr = q === 'low' ? 1 : q === 'medium' ? 1.5 : 2;
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(320, Math.round(rect.width));
    const h = Math.max(180, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    scale = Math.min(canvas.width / VW, canvas.height / VH);
    ctx.imageSmoothingEnabled = false;
  };

  /* ---------------- posições ---------------- */
  function slotPos(unit, total) {
    const isParty = unit.side === 'party';
    const i = unit.slotIndex;
    const baseX = isParty ? 116 : 366;
    const dir = isParty ? -1 : 1;
    const col = i % 2, row = Math.floor(i / 2);
    return {
      x: baseX + dir * col * 46 + dir * row * 8,
      y: 202 + row * 24 + (i % 2) * 9
    };
  }

  /* ---------------- efeitos ---------------- */
  function spawnNumber(x, y, text, color, big) {
    if (!G.game.settings.damageNumbers) return;
    if (numbers.length > 40) return;
    const n = numPool.get();
    n.x = x; n.y = y; n.text = text; n.color = color;
    n.vy = -26 - Math.random() * 10; n.vx = (Math.random() - 0.5) * 16;
    n.life = 1.0; n.big = !!big; n.dead = false;
    numbers.push(n);
  }

  function spawnPart(x, y, color, opt) {
    const q = G.game.settings.graphics;
    const cap = q === 'low' ? 60 : q === 'medium' ? 140 : 260;
    if (parts.length > cap) return;
    const p = partPool.get();
    opt = opt || {};
    p.x = x; p.y = y; p.color = color;
    p.vx = opt.vx !== undefined ? opt.vx : (Math.random() - 0.5) * 60;
    p.vy = opt.vy !== undefined ? opt.vy : -Math.random() * 50;
    p.g = opt.g === undefined ? 90 : opt.g;
    p.life = opt.life || 0.6; p.max = p.life;
    p.size = opt.size || 2; p.dead = false;
    parts.push(p);
  }

  function burst(x, y, color, n, opt) {
    const q = G.game.settings.graphics;
    const mult = q === 'low' ? 0.35 : q === 'medium' ? 0.65 : 1;
    n = Math.max(2, Math.round(n * mult));
    for (let i = 0; i < n; i++) spawnPart(x, y, color, opt);
  }

  R.shake = function (amount) {
    if (!G.game.settings.screenShake || G.game.settings.reducedMotion) return;
    shake = Math.max(shake, amount); shakeT = 0.25;
  };

  /* ---------------- consumo de eventos do combate ---------------- */
  R.consume = function (battle) {
    if (!battle) return;
    const fx = battle.fx;
    while (fx.length) {
      const e = fx.shift();
      const u = e.unit;
      const p = u ? slotPos(u) : { x: VW / 2, y: VH / 2 };
      switch (e.type) {
        case 'dmg':
          spawnNumber(p.x, p.y - 34, '-' + U.fmt(e.value), e.dmgType === 'mag' ? '#c79bff' : '#ffd9a0');
          burst(p.x, p.y - 22, e.dmgType === 'mag' ? '#c79bff' : '#ffb37a', 5, { life: 0.35 });
          break;
        case 'crit':
          spawnNumber(p.x, p.y - 38, U.fmt(e.value) + '!', '#ffef7a', true);
          burst(p.x, p.y - 22, '#fff0a0', 12, { life: 0.5, size: 3 });
          R.shake(3);
          break;
        case 'dot':
          spawnNumber(p.x + 10, p.y - 30, '-' + U.fmt(e.value), e.st === 'burn' ? '#ff9a4a' : '#9cd94a');
          break;
        case 'heal':
          spawnNumber(p.x, p.y - 36, '+' + U.fmt(e.value), '#7fe89a');
          burst(p.x, p.y - 18, '#8fffb0', 6, { vy: -40, g: -10, life: 0.7 });
          break;
        case 'shield':
          spawnNumber(p.x, p.y - 40, '+' + U.fmt(e.value), '#9fd8ff');
          burst(p.x, p.y - 20, '#bfe8ff', 8, { g: 0, life: 0.6 });
          break;
        case 'miss':
          spawnNumber(p.x, p.y - 34, G.locale === 'en' ? 'MISS' : 'ERROU', '#cfd6e0');
          break;
        case 'buffFx': burst(p.x, p.y - 10, '#ffe066', 6, { vy: -50, g: -20, life: 0.7 }); break;
        case 'debuffFx': burst(p.x, p.y - 10, '#b06ce0', 6, { vy: 20, g: 30, life: 0.6 }); break;
        case 'cleanseFx': burst(p.x, p.y - 16, '#ffffff', 10, { g: -30, life: 0.8 }); break;
        case 'statusFx': {
          const col = e.st === 'burn' ? '#ff7a34' : e.st === 'poison' ? '#8ed57f' : e.st === 'stun' ? '#ffe066' : '#9fe8ff';
          burst(p.x, p.y - 18, col, 8, { life: 0.6 });
          break;
        }
        case 'attackFx': {
          const t = e.target ? slotPos(e.target) : p;
          if (e.kind === 'mag') {
            for (let i = 0; i < 6; i++) {
              const k = i / 6;
              spawnPart(U.lerp(p.x, t.x, k), U.lerp(p.y - 18, t.y - 18, k), '#c79bff', { vx: 0, vy: 0, g: 0, life: 0.25, size: 2 });
            }
          }
          break;
        }
        case 'ability':
          if (e.ult) {
            R.shake(6);
            burst(p.x, p.y - 20, '#ffe066', 26, { life: 0.9, size: 3, g: 20 });
            battle.flashScreen = 0.35;
          } else burst(p.x, p.y - 20, '#ffffff', 8, { life: 0.4 });
          break;
        case 'die':
          burst(p.x, p.y - 16, '#ffffff', 14, { life: 0.7 });
          G.audio.play('die');
          break;
        case 'phase':
          R.shake(8); battle.flashScreen = 0.5;
          break;
        case 'tell':
          burst(p.x, p.y - 24, '#ff5f7e', 10, { g: -40, life: 0.8 });
          break;
        case 'summon':
          burst(p.x, p.y - 16, '#b06ce0', 14, { life: 0.8 });
          break;
        case 'victory': case 'defeat': break;
        default: break;
      }
    }
  };

  /* ---------------- desenho ---------------- */
  function drawBar(x, y, w, h, ratio, colFill, colBack, border) {
    ctx.fillStyle = colBack || 'rgba(0,0,0,0.62)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = colFill;
    ctx.fillRect(x + 1, y + 1, Math.max(0, (w - 2) * U.clamp(ratio, 0, 1)), h - 2);
    if (border !== false) {
      ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }
  }

  function drawUnit(u) {
    const p = slotPos(u);
    const spec = u.art || { arch: 'humanoid' };
    const anim = u.anim;
    const bob = G.game.settings.reducedMotion ? 0 : Math.sin(time * 2.4 + u.slotIndex) * 1.2;
    let ox = 0, oy = bob, sx = 1, sy = 1, rot = 0, alpha = 1;
    let pose = 'idle';

    switch (anim.state) {
      case 'attack':
        pose = 'action';
        ox = (u.side === 'party' ? 1 : -1) * (1 - anim.t / 0.35) * 10;
        break;
      case 'skill': pose = 'action'; oy -= 3; sy = 1.06; break;
      case 'ultimate': pose = 'action'; oy -= 6 + Math.sin(time * 18) * 2; sx = sy = 1.12; break;
      case 'hit': ox = (u.side === 'party' ? -1 : 1) * 4; sx = 1.08; sy = 0.92; break;
      case 'defeat': alpha = Math.max(0, 0.9 - (0.9 - anim.t)); rot = (u.side === 'party' ? -1 : 1) * 1.1; oy += 6; break;
      default: break;
    }
    if (!u.alive) { alpha = 0.28; rot = (u.side === 'party' ? -1 : 1) * 1.2; oy += 8; pose = 'idle'; }

    const sprite = G.art.sprite(spec, pose);
    const sizeMult = (spec.boss || spec.big) ? 1.5 : 1.35;
    const w = sprite.width * sizeMult, h = sprite.height * sizeMult;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x + ox, p.y + oy);
    if (u.side === 'enemy') ctx.scale(-1, 1);   // inimigos olham para a esquerda
    ctx.rotate(rot);
    ctx.scale(sx, sy);
    if (u.flash > 0 && ctx.filter !== undefined) {
      ctx.filter = 'brightness(' + (1 + u.flash * 6).toFixed(2) + ') saturate(0.4)';
    }
    ctx.drawImage(sprite, -w / 2, -h + 4, w, h);
    if (ctx.filter !== undefined) ctx.filter = 'none';
    ctx.restore();

    if (!u.alive) return;

    // aura de escudo
    if (u.shield > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin(time * 5) * 0.1;
      ctx.strokeStyle = '#9fd8ff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 16, 18, 22, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // barras
    const bw = u.kind === 'boss' ? 46 : 34;
    const bx = p.x - bw / 2, by = p.y - h * 0.78;
    const hpCol = u.side === 'party' ? '#4fd07a' : (u.kind === 'boss' ? '#ff5f7e' : '#e05a4a');
    drawBar(bx, by, bw, 5, u.hp / u.max.hp, hpCol);
    if (u.shield > 0) drawBar(bx, by, bw, 5, Math.min(1, u.shield / u.max.hp), 'rgba(159,216,255,0.75)', 'rgba(0,0,0,0)', false);
    if (u.side === 'party') drawBar(bx, by + 6, bw, 3, u.energy / 100, '#ffd94a');

    // ícones de status
    const icons = [];
    for (const s of u.status) {
      if (s.st === 'burn') icons.push(['#ff7a34', 'F']);
      else if (s.st === 'poison') icons.push(['#8ed57f', 'V']);
      else if (s.st === 'stun') icons.push(['#ffe066', '!']);
      else if (s.st === 'silence') icons.push(['#b06ce0', 'S']);
      else if (s.st === 'slow') icons.push(['#9fe8ff', 'L']);
      else if (s.st === 'regen') icons.push(['#7fe89a', '+']);
      else if (s.type === 'buff') icons.push(['#ffd94a', '^']);
      else if (s.type === 'debuff') icons.push(['#ff8a8a', 'v']);
    }
    ctx.font = '6px monospace'; ctx.textAlign = 'center';
    for (let i = 0; i < Math.min(6, icons.length); i++) {
      const ix = bx + 3 + i * 6, iy = by - 6;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(ix - 2, iy - 5, 5, 6);
      ctx.fillStyle = icons[i][0]; ctx.fillText(icons[i][1], ix, iy);
    }

    // telégrafo de chefe
    if (u.tell > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(time * 16) * 0.3;
      ctx.strokeStyle = '#ff5f7e'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y - 18, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  /* ---------------- partículas ambientais ---------------- */
  const ambient = [];
  let ambientRegion = null;
  function updateAmbient(regionId, dt) {
    const q = G.game.settings.graphics;
    const target = q === 'low' ? 0 : q === 'medium' ? 18 : 34;
    if (ambientRegion !== regionId) { ambient.length = 0; ambientRegion = regionId; }
    while (ambient.length < target) {
      ambient.push({ x: Math.random() * VW, y: Math.random() * VH * 0.85, s: 0.4 + Math.random(), p: Math.random() * 6.28 });
    }
    while (ambient.length > target) ambient.pop();
    const region = G.regionById[regionId];
    const kind = region ? region.particles : 'pollen';
    for (const a of ambient) {
      a.p += dt;
      switch (kind) {
        case 'rain': a.y += 160 * dt * a.s; a.x -= 30 * dt; break;
        case 'ember': a.y -= 22 * dt * a.s; a.x += Math.sin(a.p) * 12 * dt; break;
        case 'firefly': a.x += Math.cos(a.p * 1.4) * 14 * dt; a.y += Math.sin(a.p) * 12 * dt; break;
        case 'leaf': a.x -= 34 * dt * a.s; a.y += Math.sin(a.p) * 16 * dt; break;
        case 'confetti': a.y += 40 * dt * a.s; a.x += Math.sin(a.p * 2) * 20 * dt; break;
        case 'bubble': a.y -= 18 * dt * a.s; break;
        case 'shadow': a.y -= 10 * dt * a.s; a.x += Math.sin(a.p) * 8 * dt; break;
        case 'crystal': a.y += 14 * dt * a.s; break;
        case 'spore': a.y -= 8 * dt * a.s; a.x += Math.sin(a.p * 0.7) * 10 * dt; break;
        default: a.y -= 6 * dt * a.s; a.x += Math.sin(a.p) * 8 * dt; break;
      }
      if (a.y < -4) a.y = VH * 0.85;
      if (a.y > VH * 0.9) a.y = 0;
      if (a.x < -4) a.x = VW;
      if (a.x > VW + 4) a.x = 0;
    }
  }
  function drawAmbient(regionId) {
    const region = G.regionById[regionId];
    if (!region) return;
    const kind = region.particles;
    const col = region.pal.accent;
    for (const a of ambient) {
      ctx.globalAlpha = kind === 'firefly' ? 0.5 + Math.sin(a.p * 3) * 0.45 : 0.55;
      ctx.fillStyle = col;
      const s = kind === 'rain' ? 1 : Math.max(1, Math.round(a.s * 2));
      ctx.fillRect(a.x | 0, a.y | 0, s, kind === 'rain' ? 4 : s);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------------- laço de desenho ---------------- */
  R.draw = function (battle, dt) {
    if (!ctx) return;
    time += dt;
    const s = G.game.state;
    const stage = battle && battle.stage ? battle.stage : G.getStage(s ? s.stage : 0);
    const region = G.regionById[stage.region] || G.regions[0];

    // atualiza partículas
    updateAmbient(region.id, dt);
    for (let i = numbers.length - 1; i >= 0; i--) {
      const n = numbers[i];
      n.life -= dt * 1.4; n.y += n.vy * dt; n.x += n.vx * dt; n.vy += 40 * dt;
      if (n.life <= 0) { numbers.splice(i, 1); numPool.put(n); }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt;
      if (p.life <= 0) { parts.splice(i, 1); partPool.put(p); }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // tremor
    let shx = 0, shy = 0;
    if (shakeT > 0) {
      shakeT -= dt;
      shx = (Math.random() - 0.5) * shake; shy = (Math.random() - 0.5) * shake;
      if (shakeT <= 0) shake = 0;
    }

    const offX = (canvas.width - VW * scale) / 2, offY = (canvas.height - VH * scale) / 2;
    ctx.setTransform(scale, 0, 0, scale, offX + shx, offY + shy);

    // cenário
    const bg = G.art.background(region.pal, VW, VH, region.weather);
    ctx.drawImage(bg, 0, 0);
    drawAmbient(region.id);

    if (battle) {
      // ordena por profundidade
      const units = battle.all.slice().sort((a, b) => slotPos(a).y - slotPos(b).y);
      for (const u of units) drawUnit(u);

      // barra do chefe
      if (battle.isBoss) {
        const boss = battle.enemies.find((e) => e.kind === 'boss');
        if (boss) {
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.fillRect(VW / 2 - 130, 10, 260, 18);
          drawBar(VW / 2 - 126, 18, 252, 8, boss.hp / boss.max.hp, '#ff5f7e');
          ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
          ctx.fillStyle = '#ffd0d8';
          ctx.fillText(boss.name.toUpperCase(), VW / 2, 16);
          // marcas de fase
          if (boss.phases) {
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            boss.phases.forEach((ph, i) => { if (i === 0) return; ctx.fillRect(VW / 2 - 126 + 252 * ph.at, 18, 1, 8); });
          }
        }
      }

      // anúncio de fase / entrada
      if (battle.bossAnnounce && battle.bossAnnounce.text) {
        ctx.globalAlpha = U.clamp(battle.bossAnnounce.t, 0, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(30, VH / 2 - 22, VW - 60, 30);
        ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe9a8';
        wrapText(battle.bossAnnounce.text, VW / 2, VH / 2 - 8, VW - 76, 11);
        ctx.globalAlpha = 1;
      }

      // clarão de suprema
      if (battle.flashScreen > 0) {
        battle.flashScreen -= dt * 2;
        ctx.fillStyle = 'rgba(255,255,255,' + U.clamp(battle.flashScreen, 0, 0.5) + ')';
        ctx.fillRect(0, 0, VW, VH);
      }
    }

    // partículas de efeito
    for (const p of parts) {
      ctx.globalAlpha = U.clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x | 0, p.y | 0, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // números
    ctx.textAlign = 'center';
    for (const n of numbers) {
      ctx.globalAlpha = U.clamp(n.life, 0, 1);
      ctx.font = 'bold ' + (n.big ? 13 : 10) + 'px monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillText(n.text, n.x + 1, n.y + 1);
      ctx.fillStyle = n.color;
      ctx.fillText(n.text, n.x, n.y);
    }
    ctx.globalAlpha = 1;
  };

  function wrapText(text, cx, y, maxW, lh) {
    const words = String(text).split(' ');
    let line = '', lines = [];
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    lines = lines.slice(0, 2);
    lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lh));
  }

  R.clear = function () { numbers.length = 0; parts.length = 0; ambient.length = 0; ambientRegion = null; };
})();
