/* =============================================================
 * audio.js — som 100% procedural (Web Audio API).
 * Nenhum arquivo externo: efeitos e trilha são sintetizados.
 * Três barramentos de volume: música, efeitos e interface.
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const A = (G.audio = {});

  let ctx = null, master = null, busMusic = null, busSfx = null, busUi = null;
  let started = false, muted = false;
  let musicTimer = null, musicState = null;

  A.volumes = { music: 0.45, sfx: 0.6, ui: 0.5 };

  /** Inicializa no primeiro gesto do usuário (política de autoplay). */
  A.init = function () {
    if (started) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
      busMusic = ctx.createGain(); busMusic.gain.value = A.volumes.music; busMusic.connect(master);
      busSfx = ctx.createGain(); busSfx.gain.value = A.volumes.sfx; busSfx.connect(master);
      busUi = ctx.createGain(); busUi.gain.value = A.volumes.ui; busUi.connect(master);
      started = true;
      return true;
    } catch (e) { console.warn('[LDB] áudio indisponível', e); return false; }
  };

  A.resume = function () { if (ctx && ctx.state === 'suspended') ctx.resume(); };
  A.setVolume = function (bus, v) {
    A.volumes[bus] = v;
    if (!started) return;
    const g = bus === 'music' ? busMusic : bus === 'sfx' ? busSfx : busUi;
    g.gain.setTargetAtTime(v, ctx.currentTime, 0.02);
  };
  A.setMuted = function (m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.02); };
  A.isMuted = function () { return muted; };

  /* ---------------- síntese básica ---------------- */
  function tone(bus, opt) {
    if (!started || muted) return;
    const t0 = ctx.currentTime + (opt.delay || 0);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = opt.type || 'square';
    o.frequency.setValueAtTime(opt.f0, t0);
    if (opt.f1 !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(20, opt.f1), t0 + opt.dur);
    const vol = (opt.vol === undefined ? 0.25 : opt.vol);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + (opt.attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opt.dur);
    o.connect(g);
    if (opt.filter) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = opt.filter;
      g.connect(f); f.connect(bus);
    } else g.connect(bus);
    o.start(t0); o.stop(t0 + opt.dur + 0.05);
  }

  function noise(bus, dur, vol, freq, delay) {
    if (!started || muted) return;
    const t0 = ctx.currentTime + (delay || 0);
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1200; f.Q.value = 0.9;
    const g = ctx.createGain(); g.gain.value = vol === undefined ? 0.22 : vol;
    src.connect(f); f.connect(g); g.connect(bus);
    src.start(t0); src.stop(t0 + dur);
  }

  /* ---------------- efeitos do jogo ---------------- */
  const SFX = {
    hit: () => { noise(busSfx, 0.09, 0.22, 900); tone(busSfx, { f0: 220, f1: 90, dur: 0.1, type: 'square', vol: 0.16 }); },
    hitHeavy: () => { noise(busSfx, 0.16, 0.3, 500); tone(busSfx, { f0: 150, f1: 55, dur: 0.18, type: 'sawtooth', vol: 0.2 }); },
    crit: () => { tone(busSfx, { f0: 900, f1: 1800, dur: 0.09, type: 'square', vol: 0.22 }); tone(busSfx, { f0: 1400, f1: 300, dur: 0.16, type: 'square', vol: 0.16, delay: 0.05 }); noise(busSfx, 0.12, 0.2, 2200); },
    arrow: () => { noise(busSfx, 0.07, 0.16, 2600); tone(busSfx, { f0: 1200, f1: 500, dur: 0.09, type: 'triangle', vol: 0.12 }); },
    magic: () => { tone(busSfx, { f0: 420, f1: 1200, dur: 0.24, type: 'triangle', vol: 0.18 }); tone(busSfx, { f0: 640, f1: 1600, dur: 0.2, type: 'sine', vol: 0.12, delay: 0.04 }); },
    fire: () => { noise(busSfx, 0.3, 0.2, 700); tone(busSfx, { f0: 180, f1: 60, dur: 0.3, type: 'sawtooth', vol: 0.14 }); },
    heal: () => { [523, 659, 784].forEach((f, i) => tone(busSfx, { f0: f, dur: 0.22, type: 'sine', vol: 0.16, delay: i * 0.06 })); },
    shield: () => { tone(busSfx, { f0: 300, f1: 700, dur: 0.25, type: 'triangle', vol: 0.16 }); noise(busSfx, 0.12, 0.1, 400); },
    buff: () => { [392, 523, 659].forEach((f, i) => tone(busSfx, { f0: f, dur: 0.16, type: 'square', vol: 0.1, delay: i * 0.05 })); },
    debuff: () => { tone(busSfx, { f0: 400, f1: 120, dur: 0.28, type: 'sawtooth', vol: 0.14 }); },
    stun: () => { tone(busSfx, { f0: 1200, f1: 200, dur: 0.2, type: 'square', vol: 0.16 }); noise(busSfx, 0.2, 0.16, 1600); },
    die: () => { tone(busSfx, { f0: 320, f1: 60, dur: 0.4, type: 'sawtooth', vol: 0.2 }); noise(busSfx, 0.25, 0.14, 300); },
    ultimate: () => {
      [220, 330, 440, 660].forEach((f, i) => tone(busSfx, { f0: f, f1: f * 2, dur: 0.4, type: 'sawtooth', vol: 0.14, delay: i * 0.05 }));
      noise(busSfx, 0.5, 0.2, 900, 0.1);
    },
    boss: () => {
      [110, 87, 110, 65].forEach((f, i) => tone(busSfx, { f0: f, dur: 0.5, type: 'sawtooth', vol: 0.24, delay: i * 0.22, filter: 900 }));
      noise(busSfx, 0.9, 0.16, 200, 0.1);
    },
    victory: () => { [523, 659, 784, 1047].forEach((f, i) => tone(busSfx, { f0: f, dur: 0.32, type: 'square', vol: 0.18, delay: i * 0.13 })); },
    defeat: () => { [392, 349, 294, 220].forEach((f, i) => tone(busSfx, { f0: f, dur: 0.4, type: 'triangle', vol: 0.18, delay: i * 0.18 })); },
    levelup: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(busSfx, { f0: f, dur: 0.2, type: 'square', vol: 0.16, delay: i * 0.07 })); },
    loot: () => { [880, 1174].forEach((f, i) => tone(busSfx, { f0: f, dur: 0.16, type: 'square', vol: 0.14, delay: i * 0.07 })); },
    click: () => tone(busUi, { f0: 640, f1: 880, dur: 0.05, type: 'square', vol: 0.16 }),
    back: () => tone(busUi, { f0: 500, f1: 300, dur: 0.07, type: 'square', vol: 0.14 }),
    error: () => tone(busUi, { f0: 200, f1: 120, dur: 0.16, type: 'square', vol: 0.16 }),
    tab: () => tone(busUi, { f0: 760, dur: 0.05, type: 'triangle', vol: 0.14 }),
    coin: () => { [1046, 1568].forEach((f, i) => tone(busUi, { f0: f, dur: 0.1, type: 'square', vol: 0.12, delay: i * 0.05 })); },
    craft: () => { noise(busSfx, 0.12, 0.2, 1400); tone(busSfx, { f0: 300, f1: 900, dur: 0.2, type: 'triangle', vol: 0.14, delay: 0.06 }); },
    secret: () => { [659, 784, 1047, 1319, 1568].forEach((f, i) => tone(busSfx, { f0: f, dur: 0.24, type: 'sine', vol: 0.16, delay: i * 0.09 })); }
  };

  A.play = function (name) {
    if (!started || muted) return;
    const fn = SFX[name];
    if (fn) { try { fn(); } catch (e) { /* silencioso */ } }
  };

  /* ---------------- trilha procedural por região ---------------- */
  const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10]
  };
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  /** Toca a trilha de uma região. cfg = {scale, root, tempo, mood} */
  A.playMusic = function (cfg) {
    if (!started) return;
    A.stopMusic();
    if (!cfg) return;
    const scale = SCALES[cfg.scale] || SCALES.major;
    const beat = 60 / (cfg.tempo || 100) / 2;
    let step = 0;
    musicState = cfg;
    const arp = [0, 2, 4, 6, 4, 2];
    musicTimer = setInterval(function () {
      if (muted || !started) return;
      const bar = Math.floor(step / 8);
      // baixo
      if (step % 4 === 0) {
        const root = cfg.root - 12 + scale[(bar * 2) % scale.length];
        tone(busMusic, { f0: midi(root), dur: beat * 3.2, type: 'triangle', vol: 0.15, filter: 600 });
      }
      // arpejo
      const deg = scale[arp[step % arp.length] % scale.length] + (step % 12 === 11 ? 12 : 0);
      tone(busMusic, { f0: midi(cfg.root + deg), dur: beat * 1.4, type: 'square', vol: 0.055, filter: 2200 });
      // contracanto a cada 2 compassos
      if (step % 16 === 8) tone(busMusic, { f0: midi(cfg.root + 12 + scale[(bar) % scale.length]), dur: beat * 3, type: 'sine', vol: 0.06 });
      // percussão leve
      if (step % 8 === 0) noise(busMusic, 0.06, 0.05, 180);
      if (step % 8 === 4) noise(busMusic, 0.04, 0.035, 3000);
      step++;
    }, beat * 1000);
  };

  A.stopMusic = function () { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } };
  A.currentMusic = function () { return musicState; };
  A.pauseAll = function () { if (ctx && ctx.state === 'running') ctx.suspend(); };
  A.resumeAll = function () { if (ctx && ctx.state === 'suspended') ctx.resume(); };
})();
