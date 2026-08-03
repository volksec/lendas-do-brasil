/* =============================================================
 * main.js — inicialização, laço principal, teclado, tela cheia,
 * salvamento automático e verificação de progresso offline.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const U = G.util;
  const M = (G.main = {});

  let running = false, paused = false, saveTimer = 0, hidden = false;
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

    // Armazenamento bloqueado (aba anônima estrita): avisa de forma visível,
    // porque nesse caso o jogador perde tudo ao fechar sem saber.
    if (!G.save.available) {
      setTimeout(function () { G.ui.toast(G.t('storageWarning'), 'warn'); }, 1800);
    }
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

  /* ---------------- laço ----------------
   * O tempo vem do relógio de parede, não do requestAnimationFrame.
   * Navegadores congelam o rAF em abas ocultas ou janelas minimizadas, então
   * um laço guiado por quadros simplesmente pararia o jogo — inaceitável num
   * idle. Aqui o tempo decorrido vira uma dívida de simulação que é paga em
   * passos fixos assim que a aba volta, e ausências longas caem no cálculo de
   * recompensa offline.
   * -------------------------------------------------------------------- */
  const MAX_STEP = 0.1;             // passo fixo de simulação (s)
  const MAX_STEPS_PER_FRAME = 600;  // teto de ~60 s de jogo por quadro
  const LONG_ABSENCE = 180;         // acima disso, vira recompensa offline
  let acc = 0;                      // segundos de simulação devidos
  let lastWall = Date.now();

  let heartbeat = null;

  function start() {
    if (running) return;
    running = true;
    lastWall = Date.now();
    acc = 0;
    requestAnimationFrame(frame);
    // Batimento independente do rAF. Em aba oculta o navegador limita este
    // intervalo (tipicamente a 1x por segundo, ou menos), mas mesmo assim o
    // jogo continua andando de verdade em vez de congelar até a volta.
    if (!heartbeat) heartbeat = setInterval(function () { tick(false); }, 1000);
  }

  /** Quadro visível: simula e desenha. */
  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    tick(true);
  }

  /**
   * Avança o jogo pelo tempo real decorrido. Chamado tanto pelo rAF quanto
   * pelo batimento; como tudo vem do relógio de parede, chamar duas vezes no
   * mesmo instante não conta o tempo em dobro.
   */
  function tick(canRender) {
    const wall = Date.now();
    let elapsed = (wall - lastWall) / 1000;
    lastWall = wall;
    if (elapsed < 0) elapsed = 0;      // relógio do sistema mexeu para trás

    // Pausa explícita (Esc) não acumula tempo: é escolha do jogador.
    if (paused) { acc = 0; return; }

    if (elapsed > LONG_ABSENCE) { longAbsence(elapsed); return; }

    acc += elapsed;
    const catchingUp = acc > 2;
    let steps = 0;
    while (acc > 0.0005 && steps < MAX_STEPS_PER_FRAME) {
      const dt = Math.min(acc, MAX_STEP);
      G.game.update(dt);
      acc -= dt;
      steps++;
    }
    // Numa recuperação longa, descarta os efeitos acumulados: senão o jogador
    // voltaria para uma avalanche de números de dano de coisas que já passaram.
    if (catchingUp && G.game.battle) G.game.battle.fx.length = 0;

    // Desenhar só faz sentido no quadro visível e na tela de batalha; o
    // batimento apenas simula. Fora disso, descarta os efeitos pendentes.
    if (canRender && !hidden && G.ui.current === 'battle') {
      G.render.consume(G.game.battle);
      G.render.draw(G.game.battle, Math.min(elapsed, 0.05));
      G.ui.updateHud();
    } else if (G.game.battle) {
      G.game.battle.fx.length = 0;
    }
    // troca de trilha ao mudar de região
    const stage = G.getStage(G.game.state.stage);
    if (stage.region !== lastMusicRegion) { lastMusicRegion = stage.region; if (!hidden) playRegionMusic(); }
    // salvamento periódico
    saveTimer += elapsed;
    if (saveTimer > 20 && G.game.settings.autoSave) { saveTimer = 0; G.game.saveNow(); }
  }

  /** Ausência longa: credita como progresso offline, sem simular tudo. */
  function longAbsence(seconds) {
    acc = 0;
    const res = G.idle.computeOffline(seconds * 1000);
    if (res) G.ui.showOffline(res);
    G.game.saveNow();
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
        // O jogo NÃO para: o tempo continua contando pelo relógio de parede e
        // é recuperado no primeiro quadro após a volta. Só o som descansa.
        G.game.saveNow();
        G.audio.stopMusic();
      } else {
        playRegionMusic();
      }
    });
    // Três redes de segurança, porque nenhuma sozinha cobre todos os casos:
    //  - beforeunload: desktop, ao fechar a aba ou navegar para fora
    //  - pagehide: o único confiável no iOS/Safari e no bfcache do celular
    //  - freeze: quando o navegador congela a aba para poupar bateria
    window.addEventListener('beforeunload', function () { G.game.saveNow(); });
    window.addEventListener('pagehide', function () { G.game.saveNow(); });
    document.addEventListener('freeze', function () { G.game.saveNow(); });
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

  /* ---------------- dica de tela (opcional e dispensável) ----------------
   * O jogo é totalmente jogável em retrato e em telas pequenas. Isto é só
   * uma sugestão: aparece uma vez, não bloqueia nada e pode ser fechada
   * para sempre.
   * -------------------------------------------------------------------- */
  let hintTimer = null, hintShown = false;

  function dismissHint(permanent) {
    const pop = document.getElementById('hint-pop');
    if (pop) { pop.classList.remove('on'); setTimeout(function () { pop.remove(); }, 300); }
    if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
    if (permanent) {
      G.game.settings.hintDismissed = true;
      G.save.saveSettings(G.game.settings);
    }
  }
  M.dismissHint = dismissHint;
  M.showHint = showHint;

  function showHint(text, force) {
    if ((hintShown && !force) || G.game.settings.hintDismissed) return;
    if (document.getElementById('hint-pop')) return;
    hintShown = true;
    const pop = document.createElement('div');
    pop.id = 'hint-pop';
    const ic = document.createElement('span');
    ic.className = 'hp-ic'; ic.textContent = '📱';
    const tx = document.createElement('span');
    tx.className = 'hp-text'; tx.textContent = text;
    const close = document.createElement('button');
    close.className = 'hp-close'; close.textContent = '✕';
    close.title = G.t('close');
    close.setAttribute('aria-label', G.t('close'));
    close.addEventListener('click', function () { G.audio.play('back'); dismissHint(true); });
    pop.appendChild(ic); pop.appendChild(tx); pop.appendChild(close);
    document.body.appendChild(pop);
    requestAnimationFrame(function () { pop.classList.add('on'); });
    hintTimer = setTimeout(function () { dismissHint(false); }, 9000);
  }

  function checkScreenSize() {
    // Nada aqui bloqueia o jogo — só sugere, uma única vez por sessão.
    const tiny = window.innerWidth < 380 || window.innerHeight < 320;
    const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 760;
    if (tiny) showHint(G.t('screenTooSmall'));
    else if (portrait) showHint(G.t('landscapeHint'));
  }

  /* ---------------- start ---------------- */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', M.boot);
  else M.boot();
})();
