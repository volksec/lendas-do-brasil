/* =============================================================
 * combat.js — motor de combate automático em tempo real.
 * Puro cálculo: não toca no DOM nem no canvas. Publica eventos
 * visuais em battle.fx para o renderizador consumir.
 *
 * Convenções internas de atributo:
 *   crit, dodge, acc, lifesteal, healPow, cdr, elemRes -> frações (0.18 = 18%)
 *   critDmg -> multiplicador (1.65 = 165%)
 *   spd -> ataques por segundo relativos (1.0 = 1 ataque a cada 1,5s)
 * ============================================================= */
(function () {
  'use strict';
  const G = (window.LDB = window.LDB || {});
  const U = G.util;
  const C = (G.combat = {});

  const CONTROL = { stun: 1, silence: 1, slow: 1 };

  /* ---------------------------------------------------------- */
  /* Construção de unidades                                     */
  /* ---------------------------------------------------------- */
  let uidCounter = 0;

  function makeUnit(cfg) {
    const st = cfg.stats;
    const u = {
      uid: 'u' + (++uidCounter),
      id: cfg.id,
      side: cfg.side,
      kind: cfg.kind || 'normal',
      name: cfg.name,
      art: cfg.art,
      element: cfg.element || 'sombra',
      base: st,
      max: { hp: st.hp },
      hp: st.hp,
      energy: cfg.side === 'party' ? (cfg.startEnergy || 0) : 0,
      shield: 0,
      alive: true,
      atkTimer: Math.random() * 0.6,
      status: [],
      abilities: (cfg.abilities || []).map((a) => ({ def: a, cd: a.cd * (0.15 + Math.random() * 0.35), lvl: (cfg.skillLevels && cfg.skillLevels[a.id]) || 1 })),
      basic: cfg.basic || { name: 'Ataque', pow: 1, dmg: 'phys' },
      passive: cfg.passive || null,
      ultimate: null,
      mem: {},
      anim: { state: 'idle', t: 0 },
      flash: 0,
      slotIndex: cfg.slotIndex || 0,
      phases: cfg.phases || null,
      phaseIdx: 0,
      tell: 0, tellAbility: null,
      heroId: cfg.heroId || null,
      defId: cfg.defId || null,
      entrance: cfg.entrance || null
    };
    // separa a suprema
    for (let i = u.abilities.length - 1; i >= 0; i--) {
      if (u.abilities[i].def.type === 'ultimate') { u.ultimate = u.abilities[i]; u.abilities.splice(i, 1); }
    }
    if (u.ultimate) u.ultimate.cd = 0;
    return u;
  }
  C.makeUnit = makeUnit;

  /* ---------------------------------------------------------- */
  /* Atributos efetivos                                          */
  /* ---------------------------------------------------------- */
  function eff(u, stat) {
    let base = u.base[stat] || 0;
    let pct = 0, flat = 0;
    for (let i = 0; i < u.status.length; i++) {
      const s = u.status[i];
      if (s.stat !== stat) continue;
      const amt = s.amt * (s.stacks || 1);
      if (s.flat) flat += amt; else pct += amt;
    }
    // passiva condicional (ex.: Couro Curtido)
    const hook = u.passive && G.passiveHooks[u.passive];
    if (hook && hook.statMods) {
      const m = hook.statMods(null, u);
      if (m && m[stat] !== undefined) pct += m[stat];
    }
    let v = base * (1 + pct) + flat;
    if (stat === 'spd') {
      const slow = u.status.find((s) => s.st === 'slow');
      if (slow) v *= (1 - slow.pot);
    }
    if (stat === 'cdr') v = Math.min(G.balance.combat.cdrCap, v);
    if (stat === 'dodge') v = Math.min(G.balance.combat.dodgeCap, v);
    if (stat === 'crit') v = Math.min(G.balance.combat.critCap, v);
    return Math.max(0, v);
  }
  C.eff = eff;

  function hasStatus(u, st) { for (const s of u.status) if (s.st === st) return true; return false; }
  function isStunned(u) { return hasStatus(u, 'stun'); }
  function isSilenced(u) { return hasStatus(u, 'silence'); }

  /* ---------------------------------------------------------- */
  /* Contexto da batalha                                         */
  /* ---------------------------------------------------------- */
  C.start = function (opts) {
    uidCounter = 0;
    const battle = {
      party: [], enemies: [], fx: [],
      time: 0, over: false, result: null,
      speed: 1, stage: opts.stage || null,
      isBoss: !!opts.isBoss, kind: opts.kind || 'normal',
      limit: (opts.isBoss ? 3 : 1) * G.balance.combat.maxRoundTime,
      log: [],
      totalDamage: 0, totalHealing: 0,
      bossAnnounce: null
    };
    (opts.party || []).forEach((p, i) => {
      const u = makeUnit(Object.assign({ side: 'party', kind: 'hero', slotIndex: i }, p));
      battle.party.push(u);
    });
    (opts.enemies || []).forEach((e, i) => {
      const u = makeUnit(Object.assign({ side: 'enemy', slotIndex: i }, e));
      battle.enemies.push(u);
    });
    battle.all = battle.party.concat(battle.enemies);

    // gatilhos de início (passivas)
    const ctx = makeCtx(battle);
    for (const u of battle.party) {
      const h = u.passive && G.passiveHooks[u.passive];
      if (h && h.onStart) h.onStart(ctx, u);
    }
    if (battle.isBoss) {
      const b = battle.enemies[0];
      if (b && b.entrance) battle.bossAnnounce = { text: b.entrance, t: 3.2 };
      fx(battle, { type: 'bossIntro' });
    }
    return battle;
  };

  function fx(b, o) { if (b.fx.length < 220) b.fx.push(o); }

  function makeCtx(b) {
    return {
      battle: b,
      party: b.party,
      enemies: b.enemies,
      heal: (src, tgt, amount, opt) => doHeal(b, src, tgt, amount, opt),
      addBuff: (u, o) => addStatus(u, Object.assign({ type: 'buff' }, o)),
      damage: (src, tgt, amount, opt) => applyDamage(b, src, tgt, amount, opt || {})
    };
  }

  /* ---------------------------------------------------------- */
  /* Status                                                      */
  /* ---------------------------------------------------------- */
  function addStatus(u, s) {
    if (!u.alive) return;
    if (s.st && CONTROL[s.st] && hasStatus(u, 'immune')) return;
    if (s.stackId) {
      const ex = u.status.find((x) => x.stackId === s.stackId);
      if (ex) {
        ex.t = 0; ex.dur = s.dur;
        ex.stacks = Math.min(s.maxStacks || 1, (ex.stacks || 1) + 1);
        return;
      }
      s.stacks = 1;
    } else if (s.st) {
      const ex = u.status.find((x) => x.st === s.st);
      if (ex) { ex.t = 0; ex.dur = Math.max(ex.dur, s.dur); if (s.dmg) ex.dmg = Math.max(ex.dmg || 0, s.dmg); return; }
    }
    s.t = 0;
    u.status.push(s);
  }
  C.addStatus = addStatus;

  function cleanse(u) {
    u.status = u.status.filter((s) => !(s.type === 'debuff' || (s.st && s.st !== 'regen' && s.st !== 'immune' && s.st !== 'taunt')));
  }

  /* ---------------------------------------------------------- */
  /* Alvos                                                       */
  /* ---------------------------------------------------------- */
  function livingOf(b, side) { return (side === 'party' ? b.party : b.enemies).filter((u) => u.alive); }

  function pickTargets(b, src, target) {
    const foesSide = src.side === 'party' ? 'enemy' : 'party';
    const foes = livingOf(b, foesSide);
    const allies = livingOf(b, src.side);
    if (!foes.length && (target || '').indexOf('enemy') === 0) return [];
    switch (target) {
      case 'allEnemies': return foes;
      case 'allAllies': return allies;
      case 'self': return [src];
      case 'allyLow': {
        let best = allies[0];
        for (const a of allies) if (a.hp / a.max.hp < best.hp / best.max.hp) best = a;
        return best ? [best] : [];
      }
      case 'allyRandom': return allies.length ? [U.pick(allies)] : [];
      case 'enemyLow': {
        // taunt tem prioridade
        const taunt = foes.find((f) => hasStatus(f, 'taunt'));
        if (taunt) return [taunt];
        let best = foes[0];
        for (const f of foes) if (f.hp < best.hp) best = f;
        return best ? [best] : [];
      }
      case 'enemyHigh': {
        const taunt = foes.find((f) => hasStatus(f, 'taunt'));
        if (taunt) return [taunt];
        let best = foes[0];
        for (const f of foes) if (f.hp > best.hp) best = f;
        return best ? [best] : [];
      }
      case 'enemyRandom':
      default: {
        const taunt = foes.find((f) => hasStatus(f, 'taunt'));
        if (taunt) return [taunt];
        return foes.length ? [U.pick(foes)] : [];
      }
    }
  }

  /* ---------------------------------------------------------- */
  /* Dano e cura                                                 */
  /* ---------------------------------------------------------- */
  function mitigate(raw, defStat, k) {
    return raw * (100 / (100 + defStat * 100 / k));
  }

  function applyDamage(b, src, tgt, raw, opt) {
    if (!tgt.alive) return 0;
    opt = opt || {};
    const B = G.balance;
    let dmg = raw;

    // multiplicadores do atacante (passivas)
    if (src) {
      const h = src.passive && G.passiveHooks[src.passive];
      if (h && h.damageDealtMult) dmg *= h.damageDealtMult(makeCtx(b), src, tgt);
      if (src.dmgMult) dmg *= src.dmgMult;
    }
    // redução por passivas do alvo e aliados
    if (tgt.side === 'party') {
      for (const a of b.party) {
        const h = a.alive && a.passive && G.passiveHooks[a.passive];
        if (h && h.damageTakenMult) dmg *= h.damageTakenMult(makeCtx(b), a, tgt);
      }
    }
    // vulnerabilidade (debuff dmgTaken)
    for (const s of tgt.status) if (s.stat === 'dmgTaken') dmg *= (1 + s.amt);

    // mitigação
    const pierce = opt.pierce || 0;
    if (opt.type === 'mag') dmg = mitigate(dmg, eff(tgt, 'res') * (1 - pierce), B.combat.resistK);
    else if (opt.type === 'phys') dmg = mitigate(dmg, eff(tgt, 'def') * (1 - pierce), B.combat.defenseK);

    // elemento
    if (src && opt.type) {
      dmg *= B.elementMult(src.element, tgt.element);
      dmg *= (1 - Math.min(0.7, eff(tgt, 'elemRes')));
    }

    dmg = Math.max(1, Math.round(dmg));

    // escudo absorve primeiro
    let absorbed = 0;
    if (tgt.shield > 0) {
      absorbed = Math.min(tgt.shield, dmg);
      tgt.shield -= absorbed;
      dmg -= absorbed;
    }
    tgt.hp -= dmg;
    tgt.flash = 0.18;
    tgt.anim.state = 'hit'; tgt.anim.t = 0.22;
    b.totalDamage += dmg + absorbed;

    if (tgt.side === 'party' || src) {
      tgt.energy = Math.min(100, tgt.energy + B.combat.energyOnHitTaken);
    }

    fx(b, { type: opt.crit ? 'crit' : 'dmg', unit: tgt, value: dmg + absorbed, absorbed: absorbed, dmgType: opt.type, element: src ? src.element : null });

    // roubo de vida
    if (src && src.alive) {
      const ls = (opt.lifesteal || 0) + eff(src, 'lifesteal');
      if (ls > 0) doHeal(b, src, src, (dmg + absorbed) * ls, { silent: true, lifesteal: true });
      const h = src.passive && G.passiveHooks[src.passive];
      if (h && h.onHit) h.onHit(makeCtx(b), src, tgt);
      if (opt.crit && h && h.onCrit) h.onCrit(makeCtx(b), src, tgt);
    }

    if (tgt.hp <= 0) kill(b, tgt, src);
    return dmg + absorbed;
  }

  function kill(b, u, src) {
    u.hp = 0; u.alive = false; u.shield = 0;
    u.anim.state = 'defeat'; u.anim.t = 0;
    u.status.length = 0;
    fx(b, { type: 'die', unit: u });
    if (b.onKill) b.onKill(u, src);
  }

  function doHeal(b, src, tgt, amount, opt) {
    opt = opt || {};
    if (!tgt.alive) return 0;
    let amt = amount;
    if (src && !opt.raw) amt *= (1 + eff(src, 'healPow'));
    // cura reduzida por debuff
    for (const s of tgt.status) if (s.stat === 'healTaken') amt *= (1 + s.amt);
    // bônus da passiva da Curandeira em alvos muito feridos
    if (src && src.passive === 'cu_p' && tgt.hp / tgt.max.hp < 0.3) amt *= 1.25;

    amt = Math.round(amt);
    const missing = tgt.max.hp - tgt.hp;
    const healed = Math.min(missing, amt);
    tgt.hp += healed;
    const over = amt - healed;
    if (over > 0 && src && src.passive === 'cu_p') {
      tgt.shield += Math.round(over * 0.6);
    }
    b.totalHealing += healed;
    if (!opt.silent && healed > 0) fx(b, { type: 'heal', unit: tgt, value: healed });
    return healed;
  }

  /* ---------------------------------------------------------- */
  /* Execução de habilidades                                     */
  /* ---------------------------------------------------------- */
  function skillMult(slot) {
    return 1 + (slot.lvl - 1) * G.balance.hero.skillPowerPerLevel;
  }

  function castAbility(b, u, slot, isUlt) {
    const def = slot.def;
    const targets = pickTargets(b, u, def.target);
    if (!targets.length) return false;
    const mult = skillMult(slot);

    u.anim.state = isUlt ? 'ultimate' : 'skill';
    u.anim.t = isUlt ? 0.9 : 0.5;
    fx(b, { type: 'ability', unit: u, name: G.tn(def), ult: !!isUlt, target: targets[0] });

    const hook = u.passive && G.passiveHooks[u.passive];
    const usesMagic = (def.acts || []).some((a) => a.dmg === 'mag' || a.k === 'heal');
    if (hook && hook.onSpell && usesMagic) hook.onSpell(makeCtx(b), u);

    for (const act of def.acts || []) {
      for (const t of targets) applyAct(b, u, t, act, mult);
    }

    if (isUlt) {
      u.energy = 0;
      slot.cd = def.cd * (1 - eff(u, 'cdr'));
      G.audio && G.audio.play('ultimate');
    } else {
      slot.cd = def.cd * (1 - eff(u, 'cdr'));
      G.audio && G.audio.play(usesMagic ? 'magic' : 'hit');
    }
    return true;
  }

  function applyAct(b, src, tgt, act, mult) {
    switch (act.k) {
      case 'dmg': {
        const hits = act.hits || 1;
        for (let i = 0; i < hits; i++) {
          const stat = act.dmg === 'mag' ? 'mag' : 'atk';
          const raw = eff(src, stat) * act.pow * mult;
          strike(b, src, tgt, raw, { type: act.dmg === 'mag' ? 'mag' : 'phys', pierce: act.pierce, trueHit: act.trueHit, lifesteal: act.lifesteal });
        }
        break;
      }
      case 'heal': {
        let amount;
        if (act.scale === 'maxhp') amount = tgt.max.hp * act.pow;
        else if (act.scale === 'atk') amount = eff(src, 'atk') * act.pow * mult;
        else amount = eff(src, 'mag') * act.pow * mult;
        doHeal(b, src, tgt, amount);
        G.audio && G.audio.play('heal');
        break;
      }
      case 'shield': {
        const amt = Math.round(eff(src, 'mag') * act.pow * mult + src.max.hp * 0.03);
        tgt.shield += amt;
        addStatus(tgt, { type: 'status', st: 'shielded', dur: act.dur || 8 });
        fx(b, { type: 'shield', unit: tgt, value: amt });
        break;
      }
      case 'buff':
        addStatus(tgt, { type: 'buff', stat: act.stat, amt: act.amt * (act.flat ? 1 : mult), dur: act.dur, flat: !!act.flat });
        fx(b, { type: 'buffFx', unit: tgt });
        break;
      case 'debuff':
        addStatus(tgt, { type: 'debuff', stat: act.stat, amt: act.amt, dur: act.dur, flat: !!act.flat });
        fx(b, { type: 'debuffFx', unit: tgt });
        break;
      case 'status': {
        if (act.chance !== undefined && Math.random() > act.chance) break;
        const s = { type: 'status', st: act.st, dur: act.dur, pot: act.pot || 0 };
        if (act.st === 'burn') s.dmg = eff(src, 'mag') * act.pot * mult * 0.55;
        else if (act.st === 'poison') s.dmg = eff(src, 'atk') * act.pot * mult * 0.5;
        else if (act.st === 'regen') s.heal = tgt.max.hp * act.pot;
        addStatus(tgt, s);
        fx(b, { type: 'statusFx', unit: tgt, st: act.st });
        break;
      }
      case 'cleanse': cleanse(tgt); fx(b, { type: 'cleanseFx', unit: tgt }); break;
      case 'taunt':
        if (act.selfOnly) addStatus(src, { type: 'status', st: 'taunt', dur: act.dur });
        else addStatus(tgt, { type: 'status', st: 'taunt', dur: act.dur });
        break;
      case 'immune': addStatus(tgt, { type: 'status', st: 'immune', dur: act.dur }); break;
      case 'energy': tgt.energy = Math.min(100, tgt.energy + act.amt); break;
      case 'drain': {
        const raw = eff(src, 'mag') * act.pow * mult;
        const dealt = strike(b, src, tgt, raw, { type: 'mag' });
        doHeal(b, src, src, dealt * 0.8, { silent: false });
        break;
      }
      default: break;
    }
  }

  /** Ataque com verificação de acerto e crítico */
  function strike(b, src, tgt, raw, opt) {
    opt = opt || {};
    if (!tgt.alive) return 0;
    // esquiva
    if (!opt.trueHit && !(src.mem && src.mem.forceHit)) {
      const dodge = eff(tgt, 'dodge') - (eff(src, 'acc') - 1);
      if (Math.random() < U.clamp(dodge, 0, 1 - G.balance.combat.dodgeFloor)) {
        fx(b, { type: 'miss', unit: tgt });
        const h = tgt.passive && G.passiveHooks[tgt.passive];
        if (h && h.onDodge) h.onDodge(makeCtx(b), tgt);
        return 0;
      }
    }
    // crítico
    let crit = false;
    if (src.mem && src.mem.guaranteedCrit) { crit = true; src.mem.guaranteedCrit = false; }
    else crit = Math.random() < eff(src, 'crit');
    let dmg = raw;
    if (crit) dmg *= eff(src, 'critDmg');
    opt.crit = crit;
    if (crit) G.audio && G.audio.play('crit');
    return applyDamage(b, src, tgt, dmg, opt);
  }

  /* ---------------------------------------------------------- */
  /* Ataque básico                                               */
  /* ---------------------------------------------------------- */
  function basicAttack(b, u) {
    const targets = pickTargets(b, u, 'enemyRandom');
    if (!targets.length) return;
    const t = targets[0];
    u.anim.state = 'attack'; u.anim.t = 0.35;
    const stat = u.basic.dmg === 'mag' ? 'mag' : 'atk';
    const raw = eff(u, stat) * (u.basic.pow || 1);
    fx(b, { type: 'attackFx', unit: u, target: t, kind: u.basic.dmg });
    strike(b, u, t, raw, { type: u.basic.dmg === 'mag' ? 'mag' : 'phys' });
    if (u.basic.status && (u.basic.status.chance === undefined || Math.random() < u.basic.status.chance)) {
      const s = u.basic.status;
      const ent = { type: 'status', st: s.st, dur: s.dur, pot: s.pot };
      if (s.st === 'burn') ent.dmg = eff(u, 'mag') * s.pot * 0.55;
      if (s.st === 'poison') ent.dmg = eff(u, 'atk') * s.pot * 0.5;
      addStatus(t, ent);
    }
    u.energy = Math.min(100, u.energy + G.balance.combat.energyOnAttack);
  }

  /* ---------------------------------------------------------- */
  /* Fases de chefe                                              */
  /* ---------------------------------------------------------- */
  function checkPhase(b, u) {
    if (!u.phases) return;
    const ratio = u.hp / u.max.hp;
    while (u.phaseIdx + 1 < u.phases.length && ratio <= u.phases[u.phaseIdx + 1].at) {
      u.phaseIdx++;
      const ph = u.phases[u.phaseIdx];
      if (ph.mods) for (const k in ph.mods) addStatus(u, { type: 'buff', stat: k, amt: ph.mods[k], dur: 9999 });
      if (ph.abilities) {
        u.abilities = ph.abilities.map((a) => ({ def: a, cd: 1.2, lvl: 1 }));
      }
      if (ph.summon && b.onSummon) b.onSummon(ph.summon);
      b.bossAnnounce = { text: G.td(ph, 'announce') || G.t('phaseChange'), t: 2.6 };
      fx(b, { type: 'phase', unit: u, name: G.tn(ph) });
      G.audio && G.audio.play('boss');
    }
  }

  /* ---------------------------------------------------------- */
  /* Loop principal                                              */
  /* ---------------------------------------------------------- */
  C.update = function (b, dt) {
    if (b.over) return;
    b.time += dt;
    const ctx = makeCtx(b);
    const B = G.balance;

    for (let i = 0; i < b.all.length; i++) {
      const u = b.all[i];
      // animação
      if (u.anim.t > 0) { u.anim.t -= dt; if (u.anim.t <= 0 && u.alive) u.anim.state = 'idle'; }
      if (u.flash > 0) u.flash -= dt;
      if (!u.alive) continue;

      // status
      for (let j = u.status.length - 1; j >= 0; j--) {
        const s = u.status[j];
        if (!s) continue;                    // a lista pode ter sido limpa por uma morte
        s.t += dt;
        if (s.st === 'burn' || s.st === 'poison') {
          s.tick = (s.tick || 0) + dt;
          while (s.tick >= B.combat.statusTick) {
            s.tick -= B.combat.statusTick;
            const dmg = Math.max(1, Math.round(s.dmg || u.max.hp * 0.01));
            u.hp -= dmg;
            b.totalDamage += dmg;
            fx(b, { type: 'dot', unit: u, value: dmg, st: s.st });
            if (u.hp <= 0) { kill(b, u, null); break; }
          }
          if (!u.alive) break;               // kill() esvazia u.status
        } else if (s.st === 'regen') {
          s.tick = (s.tick || 0) + dt;
          while (s.tick >= B.combat.statusTick) {
            s.tick -= B.combat.statusTick;
            doHeal(b, null, u, s.heal || u.max.hp * 0.03, { raw: true });
          }
        }
        if (s.t >= s.dur) {
          if (s.st === 'shielded') u.shield = 0;
          u.status.splice(j, 1);
        }
      }
      if (!u.alive) continue;

      // passiva contínua
      const hook = u.passive && G.passiveHooks[u.passive];
      if (hook && hook.onTick) hook.onTick(ctx, u, dt);

      // energia
      u.energy = Math.min(100, u.energy + B.combat.energyRegen * dt);

      // recargas
      for (const slot of u.abilities) if (slot.cd > 0) slot.cd -= dt;
      if (u.ultimate && u.ultimate.cd > 0) u.ultimate.cd -= dt;

      // chefes: fases
      if (u.phases) checkPhase(b, u);

      if (isStunned(u)) { u.atkTimer = Math.min(u.atkTimer, 0.2); continue; }

      // telégrafo de chefe (aviso antes do golpe)
      if (u.tell > 0) {
        u.tell -= dt;
        if (u.tell <= 0 && u.tellAbility) {
          castAbility(b, u, u.tellAbility, false);
          u.tellAbility = null;
        }
        continue;
      }

      // habilidades ativas
      if (!isSilenced(u)) {
        let used = false;
        for (const slot of u.abilities) {
          if (slot.cd <= 0) {
            if (u.kind === 'boss' && slot.def.tell) {
              u.tell = slot.def.tell;
              u.tellAbility = slot;
              slot.cd = slot.def.cd * (1 - eff(u, 'cdr'));
              fx(b, { type: 'tell', unit: u, name: G.tn(slot.def) });
              used = true; break;
            }
            used = castAbility(b, u, slot, false);
            if (used) break;
          }
        }
        if (used) continue;
        // suprema automática
        if (u.ultimate && u.energy >= 100 && u.ultimate.cd <= 0) {
          if (u.side === 'enemy' || b.autoUltimate !== false) {
            castAbility(b, u, u.ultimate, true);
            if (b.onUltimate) b.onUltimate(u);
            continue;
          }
        }
      }

      // ataque básico
      u.atkTimer += dt;
      const interval = B.combat.baseAttackInterval / Math.max(0.15, eff(u, 'spd'));
      if (u.atkTimer >= interval) {
        u.atkTimer = 0;
        basicAttack(b, u);
      }
    }

    // anúncio de fase
    if (b.bossAnnounce) { b.bossAnnounce.t -= dt; if (b.bossAnnounce.t <= 0) b.bossAnnounce = null; }

    // fim de batalha
    if (!livingOf(b, 'enemy').length) finish(b, 'victory');
    else if (!livingOf(b, 'party').length) finish(b, 'defeat');
    else if (b.time > b.limit) finish(b, 'defeat');
  };

  function finish(b, result) {
    b.over = true;
    b.result = result;
    fx(b, { type: result });
    G.audio && G.audio.play(result === 'victory' ? 'victory' : 'defeat');
  }

  /** Disparo manual da suprema (tecla ou botão). */
  C.castUltimate = function (b, unit) {
    if (b.over || !unit || !unit.alive || !unit.ultimate) return false;
    if (unit.energy < 100 || unit.ultimate.cd > 0) return false;
    if (isStunned(unit) || isSilenced(unit)) return false;
    castAbility(b, unit, unit.ultimate, true);
    if (b.onUltimate) b.onUltimate(unit);
    return true;
  };

  /** Adiciona inimigos no meio da batalha (invocações de chefe). */
  C.addEnemy = function (b, cfg) {
    const u = makeUnit(Object.assign({ side: 'enemy', slotIndex: b.enemies.length }, cfg));
    b.enemies.push(u);
    b.all = b.party.concat(b.enemies);
    fx(b, { type: 'summon', unit: u });
    return u;
  };

  C.living = livingOf;
  C.hasStatus = hasStatus;
})();
