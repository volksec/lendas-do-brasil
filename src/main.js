/* =============================================================
 * main.js — inicialização, laço principal, teclado, tela cheia,
 * salvamento automático e verificação de progresso offline.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const U = G.util;
  const M = (G.main = {});

  let running = false, paused = false, last = 0, saveTimer = 0, hidden = false;
  let startedFresh = false;

  M.boot = function () {
    const rootEl = document.getElementById('app');
    if (!rootEl) { console.error('[LDB] #app não encontrado'); return; }

    const loaded = G.save.read();
    G.game.init(loaded);
    M.applySettings();

    // áudio só pode iniciar após um gesto do usuário
    const unlock = function () {
      if (G.audio.init()) {
        G.audio.setVolume('music', G.game.settings.music);
        G.audio.setVolume('sfx', G.game.settings.sfx);
        G.audio.setVolume('ui', G.game.settings.ui);
        G.audio.setMuted(!!G.game.settings.muted);
        playRegionMusic();
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    G.ui.build(rootEl);
    G.ui.showMenu(function (isNew) {
      if (isNew) {
        G.save.wipe();
        G.game.init(null);
        startedFresh = true;
      }
      G.ui.show('battle');
      G.game.startBattle(G.game.state.stage);
      // recompensas offline
      if (!isNew && loaded && loaded.__savedAt) {
        const res = G.idle.computeOffline(Date.now() - loaded.__savedAt);
        if (res) setTimeout(() => G.ui.showOffline(res), 500);
      }
      // recompensa diária
      if (G.game.canClaimDaily()) setTimeout(() => G.ui.showDaily(), res_delay());
      start();
    });

    bindKeys();
    bindWindow();
    checkScreenSize();
  };
  function res_delay() { return 1200; }

  function playRegionMusic() {
    const s = G.game.state;
    if (!s) return;
    const stage = G.getStage(s.stage);
    const region = G.regionById[stage.region];
    if (region) G.audio.playMusic(region.music);
  }
  M.playRegionMusic = playRegionMusic;
  let lastMusicRegion = null;

  /* ---------------- laço ---------------- */
  function start() {
    if (running) return;
    running = true; last = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    if (!running) return;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.25) dt = 0.25;          // evita saltos após alt-tab
    if (!paused && !hidden) {
      G.game.update(dt);
      G.render.consume(G.game.battle);
      if (G.ui.current === 'battle') {
        G.render.draw(G.game.battle, dt);
        G.ui.updateHud();
      }
      // troca de trilha ao mudar de região
      const stage = G.getStage(G.game.state.stage);
      if (stage.region !== lastMusicRegion) { lastMusicRegion = stage.region; playRegionMusic(); }
      // salvamento periódico
      saveTimer += dt;
      if (saveTimer > 20 && G.game.settings.autoSave) { saveTimer = 0; G.game.saveNow(); }
    }
    requestAnimationFrame(frame);
  }

  M.togglePause = function () {
    paused = !paused;
    G.audio.play('click');
    const b = document.querySelector('.bt-ctrl .sbtn[title="Esc"]');
    if (b) b.textContent = paused ? '▶' : '⏸';
    if (paused) G.audio.stopMusic(); else playRegionMusic();
  };
  M.isPaused = function () { return paused; };

  /* ---------------- teclado ---------------- */
  function bindKeys() {
    window.addEventListener('keydown', function (e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const b = G.game.battle;
      switch (e.key) {
        case ' ': {
          e.preventDefault();
          if (!b) break;
          const u = b.party.find((x) => x.alive && x.energy >= 100 && x.ultimate && x.ultimate.cd <= 0);
          if (u) G.combat.castUltimate(b, u); else G.audio.play('error');
          break;
        }
        case '1': case '2': case '3': case '4': {
          if (!b) break;
          const u = b.party[+e.key - 1];
          if (u) { if (!G.combat.castUltimate(b, u)) G.audio.play('error'); }
          break;
        }
        case 'Escape': M.togglePause(); break;
        case 'm': case 'M': {
          const mm = !G.audio.isMuted();
          G.audio.setMuted(mm); G.game.settings.muted = mm; G.save.saveSettings(G.game.settings);
          const btn = document.getElementById('btn-mute'); if (btn) btn.textContent = mm ? '🔇' : '🔊';
          break;
        }
        case 'f': case 'F': M.toggleFullscreen(); break;
        case 'Tab': e.preventDefault(); G.ui.show('heroes'); break;
        case 'i': case 'I': G.ui.show('bag'); break;
        case 'q': case 'Q': G.ui.show('quests'); break;
        case 'b': case 'B': G.ui.show('bestiary'); break;
        case 'c': case 'C': G.ui.show('craft'); break;
        default: break;
      }
    });
  }

  /* ---------------- janela ---------------- */
  function bindWindow() {
    window.addEventListener('resize', function () {
      G.render.resize();
      checkScreenSize();
    });
    window.addEventListener('orientationchange', function () {
      setTimeout(() => { G.render.resize(); checkScreenSize(); }, 300);
    });
    document.addEventListener('visibilitychange', function () {
      hidden = document.hidden;
      if (hidden) {
        G.game.saveNow();
        G.audio.stopMusic();
      } else {
        last = performance.now();
        playRegionMusic();
      }
    });
    window.addEventListener('beforeunload', function () { G.game.saveNow(); });
    // impede rolagem indesejada durante o jogo
    document.body.addEventListener('touchmove', function (e) {
      if (e.target.closest && e.target.closest('.scrollable, .screen, .modal-body')) return;
      e.preventDefault();
    }, { passive: false });
  }

  M.toggleFullscreen = function () {
    const d = document.documentElement;
    if (!document.fullscreenElement) {
      (d.requestFullscreen || d.webkitRequestFullscreen || function () {}).call(d);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    }
  };

  M.applySettings = function () {
    const st = G.game.settings;
    document.documentElement.style.fontSize = (16 * (st.textScale || 1)) + 'px';
    document.body.classList.toggle('high-contrast', !!st.highContrast);
    document.body.classList.toggle('reduced-motion', !!st.reducedMotion);
    if (G.render && G.render.resize) G.render.resize();
  };

  /* ---------------- aviso de tela pequena ---------------- */
  function checkScreenSize() {
    let warn = document.getElementById('size-warn');
    const small = window.innerWidth < 380 || window.innerHeight < 320;
    const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 760;
    if (!warn) {
      warn = document.createElement('div');
      warn.id = 'size-warn';
      warn.innerHTML = '<div class="sw-box"><div class="sw-icon">📱↻</div><div class="sw-text"></div></div>';
      document.body.appendChild(warn);
    }
    const txt = warn.querySelector('.sw-text');
    if (small) { txt.textContent = G.t('screenTooSmall'); warn.classList.add('on'); warn.classList.remove('hint'); }
    else if (portrait) { txt.textContent = G.t('landscapeHint'); warn.classList.add('on', 'hint'); }
    else { txt.textContent = ''; warn.classList.remove('on', 'hint'); }
  }

  /* ---------------- start ---------------- */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', M.boot);
  else M.boot();
})();
