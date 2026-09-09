import React, { useState, useEffect, useCallback, useRef } from 'react';
import '@styles/responsive.css';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { usePhysics } from '@hooks/usePhysics';
import { useScore } from '@hooks/useScore';
import { useTurmaRegistry } from '@hooks/useTurmaRegistry';
import { useUIState } from '@hooks/useUIState';
import { useAudio } from '@hooks/useAudio';
import { useDeviceClass } from '@hooks/useDeviceClass';
import { LoginPanel } from '@components/LoginPanel';
import { MenuPanel } from '@components/MenuPanel';
import { EndGamePanel } from '@components/EndGamePanel';
import { Boom } from '@components/Boom';
import { RankingPanel } from '@components/RankingPanel';
import { AnalisePanel } from '@components/AnalisePanel';
import { NC003Panel } from '@components/NC003Panel';
import { GamePlayPanel } from '@components/GamePlayPanel';
import { KeyboardLegendModal } from '@components/KeyboardLegendModal';
import { localDay } from '@utils/viewport';
import { emptyStudyDay, mergeStudyLog } from '@utils/studyLog';
const DIFF = {
  1: { name: 'TRAINEE', sub: 'Primeiro dia', ops: ['*'], range: [2,5], time: 35, init: 10, err: 0, ok: -25, passive: 2, interval: 9000, scram: 5 },
  2: { name: 'JÚNIOR', sub: 'Aprendendo', ops: ['*','/'], range: [2,7], time: 30, init: 20, err: 15, ok: -20, passive: 3, interval: 8000, scram: 4 },
  3: { name: 'PLENO', sub: 'Turno normal', ops: ['*','/'], range: [2,10], time: 25, init: 30, err: 20, ok: -18, passive: 4, interval: 7000, scram: 3 },
  4: { name: 'SÊNIOR', sub: 'Crise nacional', ops: ['*','/'], range: [2,12], time: 20, init: 40, err: 25, ok: -15, passive: 5, interval: 6000, scram: 2 },
  5: { name: 'CHERNOBYL', sub: 'Boa sorte...', ops: ['*','/'], range: [3,15], time: 12, init: 50, err: 30, ok: -12, passive: 6, interval: 5000, scram: 1, events: true }
};

const TITLES = ['👷 Estagiário', '📋 Téc. Competente', '🔧 Op. Exemplar', '⭐ Eng. Nuclear', '🎖️ Dir. Segurança', '🏅 Herói Nacional'];
const VENT_CD = 12, BORON_CD = 30, FREEZE_MS = 14000;

function App() {
  const device = useDeviceClass();

  // Extract UI state into custom hook
  const { mode, setMode, boom, setBoom, diff, setDiff, selectedOperatorToExclude, setSelectedOperatorToExclude, calendarCursor, setCalendarCursor, nameInput, setNameInput, triggerButtonRef } = useUIState();

  // Extract audio management into custom hook
  const { snd, setSnd, initA, tone, okSnd, errSnd, scrmSnd, boomSnd, startAlm, stopAlm, startGei, stopGei } = useAudio();

  // Core state management
  const {
    players, setPlayers, player, setPlayer, loading, setLoading, storeErr, setStoreErr
  } = useTurmaRegistry();
  const [matches, setMatches] = useState([]);
  const [tab, setTab] = useState('geral');
  const {
    heat, setHeat, integrity, setIntegrity, coolant, setCoolant, shownTemp, setShownTemp, delta, setDelta
  } = usePhysics(30);
  const {
    pts, setPts, goal, setGoal, strk, setStrk, bestStrk, setBestStrk
  } = useScore();

  // Game state - will be extracted to hook later
  const [rankIdx, setRankIdx] = useState(0);
  const [pair, setPair] = useState([null, null]);
  const [picked, setPicked] = useState(null);
  const [grace, setGrace] = useState(0);
  const [ans, setAns] = useState('');
  const [tmr, setTmr] = useState(25);
  const [scrm, setScrm] = useState(3);
  const [ventCd, setVentCd] = useState(0);
  const [boronCd, setBoronCd] = useState(0);
  const [frozen, setFrozen] = useState(false);
  const [tot, setTot] = useState(0);
  const [corr, setCorr] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [fb, setFb] = useState(null);
  const [evt, setEvt] = useState(null);
  const [melt, setMelt] = useState(0);
  const [showLegend, setShowLegend] = useState(false);

  // Refs
  const hotRef = useRef(0), vel = useRef(0), frz = useRef(null), recent = useRef([]), saved = useRef(false);
  const sess = useRef({ tabs: {}, ops: {}, forms: {}, daily: {} });
  const okStore = useRef(true); // TD-DAT-02: Track storage read health to prevent overwrites on corruption

  const bump = (q, hit) => {
    const s = sess.current, k = hit ? 'h' : 'm';
    q.factors.forEach(f => { s.tabs[f] = s.tabs[f] || { h: 0, m: 0 }; s.tabs[f][k]++; });
    s.ops[q.sym] = s.ops[q.sym] || { h: 0, m: 0 }; s.ops[q.sym][k]++;
    s.forms[q.hidden] = s.forms[q.hidden] || { h: 0, m: 0 }; s.forms[q.hidden][k]++;
    const today = localDay();
    const day = s.daily[today.key] || emptyStudyDay(today);
    const operation = q.sym === 'Ã—' ? 'multiplication' : 'division';
    const form = q.hidden === 'result' ? 'direct' : 'inverse';
    day.total++;
    day[k === 'h' ? 'hits' : 'misses']++;
    day.types[operation][k === 'h' ? 'hits' : 'misses']++;
    day.types[form][k === 'h' ? 'hits' : 'misses']++;
    q.factors.forEach(f => {
      day.tables[f] = day.tables[f] || { hits: 0, misses: 0 };
      day.tables[f][k === 'h' ? 'hits' : 'misses']++;
    });
    day.updatedAt = Date.now();
    s.daily[today.key] = day;
  };
  const mergeStats = (old = {}, add) => {
    const out = { tabs: { ...(old.tabs || {}) }, ops: { ...(old.ops || {}) }, forms: { ...(old.forms || {}) } };
    ['tabs', 'ops', 'forms'].forEach(g => Object.entries(add[g]).forEach(([k, v]) => {
      const p = out[g][k] || { h: 0, m: 0 };
      out[g][k] = { h: p.h + v.h, m: p.m + v.m };
    }));
    return out;
  };

  // ---- persistência de operadores ----
  const loadAll = useCallback(async () => {
    let storeHealth = true;
    let loadedPlayers = {};
    try {
      const r = await window.storage.get('operadores', true);
      if (r && r.value) loadedPlayers = JSON.parse(r.value);
    } catch {
      storeHealth = false;
      setStoreErr(true); // TD-DAT-05: Show error immediately on read failure
    }

    // Garantir que sempre há um operador padrão se a lista estiver vazia
    if (Object.keys(loadedPlayers).length === 0) {
      loadedPlayers = {
        'LOCAL': { best: {}, games: 0, ops: 0, hits: 0, streak: 0, rank: 0, wins: 0, studyLog: {} }
      };
    }
    setPlayers(loadedPlayers);

    try {
      const m = await window.storage.get('partidas', true);
      if (m && m.value) setMatches(JSON.parse(m.value));
    } catch { /* sem partidas ainda */ }
    okStore.current = storeHealth; // TD-DAT-02: Store read health for guards
    setLoading(false);
    return storeHealth;
  }, []);

  useEffect(() => {
    loadAll().then(() => {
      // Auto-select LOCAL operator if none selected and app loads
      if (!player && Object.keys(players).length > 0) {
        const operatorName = Object.keys(players)[0];
        setPlayer(operatorName);
        setMode('menu');
      }
    });
  }, []);
  useEffect(() => { if (mode === 'login') loadAll(); }, [mode, loadAll]);


  const persist = async next => {
    setPlayers(next);
    // TD-DAT-02: Guard against writing if previous read failed (corrupted storage)
    if (!okStore.current) {
      setStoreErr(true);
      return false;
    }
    try {
      const r = await window.storage.set('operadores', JSON.stringify(next), true);
      if (!r) {
        setStoreErr(true); // TD-DAT-05: Make write errors visible
      } else {
        setStoreErr(false);
      }
      return !!r;
    } catch {
      setStoreErr(true); // TD-DAT-05: Capture write errors
      return false;
    }
  };

  const persistMatches = async next => {
    setMatches(next);
    // TD-DAT-02: Guard against writing if previous read failed (corrupted storage)
    if (!okStore.current) {
      setStoreErr(true);
      return false;
    }
    try {
      const r = await window.storage.set('partidas', JSON.stringify(next), true);
      if (!r) {
        setStoreErr(true); // TD-DAT-05: Make write errors visible
      } else {
        setStoreErr(false);
      }
      return !!r;
    } catch {
      setStoreErr(true); // TD-DAT-05: Capture write errors
      return false;
    }
  };

  const createPlayer = async () => {
    const n = nameInput.trim().slice(0, 14);
    if (!n) return;
    if (!players[n]) await persist({ ...players, [n]: { best: {}, games: 0, ops: 0, hits: 0, streak: 0, rank: 0, wins: 0, studyLog: {} } });
    setPlayer(n); setNameInput(''); setMode('menu');
  };

  const handleExcludeOperator = async (operatorId: string) => {
    try {
      // Filter out the operator from the list
      const filtered = Object.entries(players)
        .filter(([name]) => name !== operatorId)
        .reduce((acc, [name, data]) => ({ ...acc, [name]: data }), {});

      // Write filtered list back to storage
      await persist(filtered);
      setSelectedOperatorToExclude(null);
    } catch (error) {
      console.error(`Error excluding operator: ${error}`);
    }
  };

  const saveResult = async outcome => {
    if (!player || saved.current) return;
    saved.current = true;
    const p = players[player] || { best: {}, games: 0, ops: 0, hits: 0, streak: 0, rank: 0, wins: 0 };
    // TD-DAT-01: Preserve unknown fields via spread operator, don't whitelist
    const up = {
      ...p, // First, preserve ALL existing fields including future extensions
      best: { ...p.best, [diff]: Math.max(p.best[diff] || 0, pts) },
      games: p.games + 1,
      ops: p.ops + tot,
      hits: p.hits + corr,
      streak: Math.max(p.streak, bestStrk),
      rank: Math.max(p.rank, rankIdx),
      wins: p.wins + (outcome === 'win' ? 1 : 0),
      stats: mergeStats(p.stats, sess.current),
      studyLog: mergeStudyLog(p.studyLog, sess.current.daily)
    };
    await persist({ ...players, [player]: up });
    const rec = { n: player, d: diff, pts, acc: tot ? Math.round((corr / tot) * 100) : 0, streak: bestStrk, secs: elapsed, out: outcome, ts: Date.now() };
    await persistMatches([...matches, rec].sort((a, b) => b.pts - a.pts).slice(0, 40));
  };

  const rank = TITLES[rankIdx];
  const targetTemp = 280 + heat * 4.2;
  const power = Math.round(300 + heat * 9);
  const prob = picked === null ? null : pair[picked];
  const locked = !!(fb && fb.t === 'err');
  const promote = i => setRankIdx(p => Math.max(p, Math.min(5, i)));


  // PROPOSTA A — perfis com faixas sobrepostas, garantindo combinações suficientes
  const makeOne = (d, profile, surge = false) => {
    const s = DIFF[d], op = s.ops[Math.floor(Math.random() * s.ops.length)];
    const [lo, hi] = s.range, span = hi - lo;
    // rotina cobre ~65% inferior, prioritária ~65% superior — há sobreposição no meio
    // em "surge", a rotina toma emprestada a faixa alta da prioritária
    const useHigh = profile === 'priority' || surge;
    const [mn, mx] = d === 1
      ? (useHigh ? [6, 10] : [2, 7])   // fase 1: prioritária cobre exatamente 6–10
      : useHigh
        ? [Math.min(hi - 1, Math.round(lo + span * .35)), hi]
        : [lo, Math.max(lo + 1, Math.round(lo + span * .65))];
    let a, b, r, sym;
    if (op === '*') { a = Math.floor(Math.random() * (mx - mn + 1)) + mn; b = Math.floor(Math.random() * (mx - mn + 1)) + mn; r = a * b; sym = '×'; }
    else { b = Math.floor(Math.random() * (mx - mn + 1)) + mn; r = Math.floor(Math.random() * (mx - mn + 1)) + mn; a = b * r; sym = '÷'; }
    const slots = d <= 2 ? ['result'] : profile === 'routine' ? ['result', 'result', 'right'] : ['result', 'left', 'right'];
    const hidden = slots[Math.floor(Math.random() * slots.length)];
    const prompt = hidden === 'result' ? `${a} ${sym} ${b} = ?` : hidden === 'left' ? `? ${sym} ${b} = ${r}` : `${a} ${sym} ? = ${r}`;
    return { profile, surge, prompt, key: `${a}${sym}${b}${hidden}`, answer: hidden === 'result' ? r : hidden === 'left' ? a : b, full: `${a} ${sym} ${b} = ${r}`,
      sym, hidden, factors: sym === '×' ? [a, b] : [b, r] };
  };

  // evita repetir operações vistas há pouco
  const build = (d, profile, avoid = [], surge = false) => {
    let q = null;
    for (let i = 0; i < 25; i++) {
      q = makeOne(d, profile, surge);
      if (!recent.current.includes(q.key) && !avoid.includes(q.key)) break;
    }
    recent.current = [...recent.current, q.key].slice(-14);
    return q;
  };

  const roundNo = useRef(0);

  const newPair = d => {
    roundNo.current += 1;
    // fases 1 e 2: em intervalos regulares a rotina puxa uma conta da faixa alta,
    // garantindo que as tabuadas de 8 a 10 apareçam sem depender da escolha do jogador
    const surge = (d === 1 && roundNo.current % 3 === 0) || (d === 2 && roundNo.current % 4 === 0);
    const a = build(d, 'routine', [], surge);
    const b = build(d, 'priority', [a.key]);
    setPair([a, b]); setPicked(null); setAns(''); setTmr(DIFF[d].time); setGrace(3);
  };

  const start = () => {
    initA(); const s = DIFF[diff];
    setHeat(s.init); setIntegrity(100); setCoolant(100); setShownTemp(280 + s.init * 4.2); setDelta(0);
    setPts(0); setGoal(1000); setStrk(0); setBestStrk(0); setRankIdx(0); setScrm(s.scram);
    setVentCd(0); setBoronCd(0); setFrozen(false);
    setTot(0); setCorr(0); setElapsed(0); setFb(null); setEvt(null); setBoom(false); setMelt(0);
    hotRef.current = 0; vel.current = 0; recent.current = []; saved.current = false; roundNo.current = 0;
    sess.current = { tabs: {}, ops: {}, forms: {}, daily: {} };
    newPair(diff); setMode('play');
  };

  const continueGame = () => {
    const nd = Math.min(5, diff + 1), s = DIFF[nd];
    setDiff(nd); setHeat(Math.max(s.init - 10, 5)); setCoolant(c => Math.min(100, c + 25));
    promote(nd - 1); setGoal(g => g + 1000); setScrm(p => p + s.scram);
    setVentCd(0); setBoronCd(0); setFb(null); setMelt(0); vel.current = 0; recent.current = [];
    setEvt(`PROMOÇÃO — ${s.name} | ${TITLES[Math.min(5, nd - 1)]}`); setTimeout(() => setEvt(null), 3000);
    newPair(nd); setMode('play');
  };

  const addHeat = v => setHeat(h => frozen && v > 0 ? h : Math.min(100, Math.max(0, h + v)));

  const pick = i => {
    if (picked !== null || locked) return;
    setPicked(i); setGrace(0);
    if (i === 1) setTmr(_t => Math.max(4, Math.round(DIFF[diff].time * .6)));
    tone(880, .05, 'square', .16);
  };

  const check = () => {
    if (!ans || !prob) return;
    const ok = parseInt(ans) === prob.answer;
    const prio = prob.profile === 'priority';
    bump(prob, ok);
    setTot(t => t + 1);
    if (ok) {
      const eff = coolant < 40 ? .5 : 1, bonus = Math.min(10, Math.floor(strk / 2) * 2);
      const cool = (prio ? -28 : -12) - bonus;
      setHeat(h => Math.max(0, h + cool * eff));
      const b = Math.floor(strk / 3) * 5, gain = (prio ? 18 : 10) + b, ns = strk + 1;
      setPts(p => p + gain); setStrk(ns); setBestStrk(x => Math.max(x, ns)); setCorr(c => c + 1);
      setFb({ t: 'ok', m: `+${gain}` }); okSnd();
      if (ns % 10 === 0) {
        setHeat(h => Math.max(0, h - 30)); setCoolant(c => Math.min(100, c + 20));
        setScrm(x => x + 1); setPts(p => p + 50); promote(Math.floor(ns / 10));
        setEvt(`SEQUÊNCIA DE ${ns} — REFRIGERANTE REPOSTO · +1 SCRAM · +50 PTS`);
        scrmSnd(); setTimeout(() => setEvt(null), 3000);
      }
      newPair(diff);
      setTimeout(() => setFb(null), 900);
    } else {
      addHeat(prio ? Math.round(DIFF[diff].err * 1.5) : DIFF[diff].err); setStrk(0);
      setFb({ t: 'err', m: prob.full }); errSnd(); setAns('');
      setTimeout(() => { setFb(null); newPair(diff); }, 1400);
    }
  };

  const press = k => {
    if (locked || picked === null) return;
    if (k === 'C') { setAns(''); tone(700, .04, 'square', .12); return; }
    if (k === '⌫') { setAns(a => a.slice(0, -1)); tone(600, .04, 'square', .12); return; }
    if (ans.length >= 4) return;
    setAns(a => a + k); tone(1000, .03, 'square', .1);
  };

  // PROPOSTA B — válvulas
  const doVent = () => {
    if (ventCd > 0 || coolant < 8) return;
    setHeat(h => Math.max(0, h - 32)); setCoolant(c => Math.max(0, c - 8)); setVentCd(VENT_CD);
    tone(320, .5, 'sawtooth', .2); setTimeout(() => tone(260, .4, 'sawtooth', .15), 200);
    setEvt('ALÍVIO DE PRESSÃO · −18 CALOR · −12 REFRIGERANTE'); setTimeout(() => setEvt(null), 1800);
  };
  const doBoron = () => {
    if (boronCd > 0 || integrity <= 5) return;
    setHeat(h => Math.max(0, h - 15));
    setIntegrity(i => Math.max(0, i - 5)); setBoronCd(BORON_CD); setFrozen(true);
    tone(180, .8, 'sine', .25); setTimeout(() => tone(240, .6, 'sine', .2), 300);
    setEvt('INJEÇÃO DE BORO · CALOR CONGELADO POR 8s · −8 INTEGRIDADE'); setTimeout(() => setEvt(null), 2200);
    if (frz.current) clearTimeout(frz.current);
    frz.current = setTimeout(() => setFrozen(false), FREEZE_MS);
  };
  const doScram = () => {
    if (scrm === 0) return;
    setScrm(s => s - 1); setHeat(h => Math.max(0, h - 70)); setIntegrity(i => Math.max(0, i - 3));
    setCoolant(c => Math.min(100, c + 10));
    setEvt('SCRAM - BARRAS INSERIDAS - -70 CALOR - -3 INTEGRIDADE'); scrmSnd(); setTimeout(() => setEvt(null), 2000);
    return;
    // Mantido apenas como referência da implementação anterior; o retorno acima
    // garante que o comportamento usado seja o mesmo do bundle original.
    setEvt('SCRAM · BARRAS INSERIDAS · −5 INTEGRIDADE'); scrmSnd(); setTimeout(() => setEvt(null), 2000);
  };
  const pauseGame = () => { stopAlm(); stopGei(); setMode('pause'); };
  const resumeGame = () => { setMode('play'); };
  const quit = () => { stopAlm(); stopGei(); setMode('quit'); };

  useEffect(() => {
    if (mode !== 'play') return;
    const onKey = e => {
      // Keyboard legend (global, UX-D25)
      if (e.key === '?') { e.preventDefault(); setShowLegend(true); return; }
      if (e.key === 'Escape') {
        if (showLegend) { setShowLegend(false); return; }
        if (mode === 'play') press('C');
      }

      // Gameplay keys
      if (mode !== 'play') return;
      if (picked === null) { if (e.key === '1') pick(0); else if (e.key === '2') pick(1); return; }
      if (e.key >= '0' && e.key <= '9') press(e.key);
      else if (e.key === 'Backspace') press('⌫');
      else if (e.key === 'Enter') check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (mode !== 'play') return;
    const iv = setInterval(() => setShownTemp(p => { vel.current = (vel.current + (targetTemp - p) * .075) * .78; setDelta(vel.current * 10); return p + vel.current; }), 60);
    return () => clearInterval(iv);
  }, [mode, targetTemp]);

  useEffect(() => {
    if (mode !== 'play') return;
    const iv = setInterval(() => {
      setVentCd(c => Math.max(0, c - 1)); setBoronCd(c => Math.max(0, c - 1));
      if (heat > 70) { hotRef.current += 1; if (hotRef.current >= 5) { setIntegrity(i => Math.max(0, i - 2)); hotRef.current = 0; } } else hotRef.current = 0;
      if (heat > 85 && !frozen) setCoolant(c => Math.max(0, c - 3)); else if (heat < 40) setCoolant(c => Math.min(100, c + 1));
    }, 1000);
    return () => clearInterval(iv);
  }, [mode, heat, frozen]);

  useEffect(() => {
    if (mode !== 'play') { if (melt !== 0) setMelt(0); return; }
    if (heat >= 90 && melt === 0) { setMelt(3); tone(160, .5, 'square', .4); }
    if (heat < 84 && melt > 0) { setMelt(0); setEvt('REATOR RECUPERADO'); setTimeout(() => setEvt(null), 1600); }
  }, [heat, mode, melt, tone]);

  useEffect(() => {
    if (melt <= 0 || mode !== 'play') return;
    const to = setTimeout(() => { if (heat < 84) return; if (melt === 1) { setHeat(100); return; } setMelt(m => m - 1); tone(160, .4, 'square', .4); }, 1000);
    return () => clearTimeout(to);
  }, [melt, heat, mode, tone]);

  useEffect(() => {
    if (mode !== 'play' || locked) return;
    const iv = setInterval(() => {
      setElapsed(e => e + 1);
      if (grace > 0) { setGrace(g => g - 1); return; }
      setTmr(t => {
        if (t <= 1) {
          const miss = picked !== null ? pair[picked] : pair[0];
          const prio = miss && miss.profile === 'priority';
          addHeat(prio ? Math.round(DIFF[diff].err * 1.5) : DIFF[diff].err);
          setStrk(0); setTot(x => x + 1);
          if (miss) bump(miss, false);
          setFb({ t: 'err', m: miss ? `SEM RESPOSTA · ${miss.full}` : 'SEM RESPOSTA' });
          tone(250, .25, 'sawtooth', .25);
          setTimeout(() => { setFb(null); newPair(diff); }, 1400);
          return DIFF[diff].time;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [mode, diff, locked, grace, picked, pair, tone, frozen]);

  useEffect(() => {
    if (mode !== 'play') return;
    const iv = setInterval(() => { if (!frozen) setHeat(h => Math.min(100, h + DIFF[diff].passive)); }, DIFF[diff].interval);
    return () => clearInterval(iv);
  }, [mode, diff, frozen]);

  useEffect(() => {
    if (mode !== 'play' || !DIFF[diff].events) return;
    const iv = setInterval(() => { addHeat(10); setEvt('ANOMALIA NO CIRCUITO PRIMÁRIO'); errSnd(); setTimeout(() => setEvt(null), 1500); }, 25000);
    return () => clearInterval(iv);
  }, [mode, diff, errSnd, frozen]);

  useEffect(() => {
    if (mode === 'play' && snd) { startAlm(heat); startGei(heat); if (heat < 55) stopAlm(); if (heat < 40) stopGei(); }
    else { stopAlm(); stopGei(); }
  }, [heat, mode, snd, startAlm, stopAlm, startGei, stopGei]);

  useEffect(() => { if (mode === 'play' && (heat >= 100 || integrity <= 0)) { stopAlm(); stopGei(); boomSnd(); setBoom(true); } }, [heat, integrity, mode, stopAlm, stopGei, boomSnd]);
  useEffect(() => { if (pts >= goal && heat < 50 && mode === 'play') { stopAlm(); stopGei(); okSnd(); if (diff === 5) promote(5); setMode('win'); } }, [pts, goal, heat, mode, diff, stopAlm, stopGei, okSnd]);
  useEffect(() => { if (mode === 'win' || mode === 'lose' || mode === 'quit') saveResult(mode); }, [mode]);
  useEffect(() => () => { stopAlm(); stopGei(); if (frz.current) clearTimeout(frz.current); }, [stopAlm, stopGei]);

  const css = (
    <style>{`
      @keyframes lampPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.35)}}
      @keyframes rumble{0%,100%{transform:translate(0,0)}25%{transform:translate(-1px,1px)}50%{transform:translate(1px,-1px)}75%{transform:translate(-1px,-1px)}}
      @keyframes rumbleHard{0%,100%{transform:translate(0,0) rotate(0)}20%{transform:translate(-3px,2px) rotate(-.25deg)}40%{transform:translate(3px,-2px) rotate(.25deg)}60%{transform:translate(-2px,-3px) rotate(-.15deg)}80%{transform:translate(2px,3px) rotate(.15deg)}}
      @keyframes vigPulse{0%,100%{opacity:.75}50%{opacity:1}}
      @keyframes grainShift{0%{transform:translate(0,0)}50%{transform:translate(1px,-1px)}100%{transform:translate(-1px,1px)}}
      @keyframes glitch{0%{opacity:.35}50%{opacity:.9}100%{opacity:.35}}
      @keyframes warnPulse{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.06)}}
      .rumble{animation:rumble .34s infinite}.rumbleHard{animation:rumbleHard .34s infinite}
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}</style>
  );

  if (boom) return <Boom onDone={() => { setBoom(false); setMelt(0); setMode('lose'); }} />;

  // TD-DAT-05: the global storage-error banner lives in @components/GlobalErrorBanner
  // and is rendered by each panel; App no longer defines a local copy.

  const st = heat <= 30 ? { t: 'ESTÁVEL', c: '#22c55e' } : heat <= 55 ? { t: 'ATENÇÃO', c: '#f59e0b' } : heat <= 80 ? { t: 'CRÍTICO', c: '#f97316' } : { t: 'MELTDOWN', c: '#dc2626' };
  const shakeCls = mode === 'play' && heat >= 90 ? 'rumbleHard' : mode === 'play' && heat > 72 ? 'rumble' : '';
  const bg = { background: 'radial-gradient(ellipse at 50% 0%,#171b1f,#0a0c0e 75%)' };
  const shellClass = `nc-shell nc-${device}`;
  const shellStyle = {};

  if (mode === 'login') return (
    <>
      <LoginPanel
        nameInput={nameInput}
        setNameInput={setNameInput}
        players={players}
        loading={loading}
        player={player}
        setPlayer={setPlayer}
        setMode={setMode}
        createPlayer={createPlayer}
        storeErr={storeErr}
        selectedOperatorToExclude={selectedOperatorToExclude}
        setSelectedOperatorToExclude={setSelectedOperatorToExclude}
        handleExcludeOperator={handleExcludeOperator}
        bg={bg}
        css={css}
        shellClass={shellClass}
        shellStyle={shellStyle}
      />
      <KeyboardLegendModal visible={showLegend} onClose={() => setShowLegend(false)} context="login" />
    </>
  );

  if (mode === 'ranking') return (
    <>
      <RankingPanel
        players={players}
        matches={matches}
        player={player}
        tab={tab}
        setTab={setTab}
        DIFF={DIFF}
        TITLES={TITLES}
        bg={bg}
        css={css}
        shellClass={shellClass}
        shellStyle={shellStyle}
        triggerButtonRef={triggerButtonRef}
        setMode={setMode}
      />
      <KeyboardLegendModal visible={showLegend} onClose={() => setShowLegend(false)} />
    </>
  );

  if (mode === 'analise') return (
    <>
      <AnalisePanel
        player={player}
        players={players}
        calendarCursor={calendarCursor}
        setCalendarCursor={setCalendarCursor}
        bg={bg}
        css={css}
        shellClass={shellClass}
        shellStyle={shellStyle}
        setMode={setMode}
      />
      <KeyboardLegendModal visible={showLegend} onClose={() => setShowLegend(false)} />
    </>
  );

  if (mode === 'nc003') return (
    <>
      <NC003Panel
        player={player}
        players={players}
        heat={heat}
        integrity={integrity}
        coolant={coolant}
        bg={bg}
        css={css}
        shellClass={shellClass}
        shellStyle={shellStyle}
        setMode={setMode}
        start={start}
      />
      <KeyboardLegendModal visible={showLegend} onClose={() => setShowLegend(false)} />
    </>
  );

  if (mode === 'menu') return (
    <>
      <MenuPanel
        player={player}
        players={players}
        diff={diff}
        setDiff={setDiff}
        snd={snd}
        setSnd={setSnd}
        setMode={setMode}
        setPlayer={setPlayer}
        initA={initA}
        bg={bg}
        css={css}
        shellClass={shellClass}
        shellStyle={shellStyle}
      />
      <KeyboardLegendModal visible={showLegend} onClose={() => setShowLegend(false)} />
    </>
  );

  if (mode === 'win' || mode === 'lose' || mode === 'quit' || mode === 'pause')
    return (
      <>
        <EndGamePanel
          mode={mode as 'win' | 'lose' | 'quit' | 'pause'}
          diff={diff}
          player={player || ''}
          rank={rank}
          elapsed={elapsed}
          pts={pts}
          tot={tot}
          corr={corr}
          bestStrk={bestStrk}
          integrity={integrity}
          players={players}
          setMode={setMode}
          start={start}
          resumeGame={resumeGame}
          continueGame={continueGame}
          bg={bg}
          css={css}
          shellClass={shellClass}
          shellStyle={shellStyle}
        />
        <KeyboardLegendModal visible={showLegend} onClose={() => setShowLegend(false)} />
      </>
    );

  return (
    <>
      <GamePlayPanel
        heat={heat}
        integrity={integrity}
        coolant={coolant}
        melt={melt}
        evt={evt}
        shownTemp={shownTemp}
        delta={delta}
        frozen={frozen}
        rank={rank}
        snd={snd}
        initA={initA}
        setSnd={setSnd}
        st={st}
        power={power}
        ventCd={ventCd}
        VENT_CD={VENT_CD}
        boronCd={boronCd}
        BORON_CD={BORON_CD}
        scrm={scrm}
        doVent={doVent}
        doBoron={doBoron}
        doScram={doScram}
        picked={picked}
        locked={locked}
        grace={grace}
        pair={pair}
        pick={pick}
        prob={prob}
        fb={fb}
        ringPct={(tmr / DIFF[diff].time) * 100}
        ringCol={(tmr / DIFF[diff].time) * 100 < 25 ? '#dc2626' : (tmr / DIFF[diff].time) * 100 < 55 ? '#f59e0b' : '#06b6d4'}
        ans={ans}
        check={check}
        press={press}
        pts={pts}
        goal={goal}
        strk={strk}
        elapsed={elapsed}
        pauseGame={pauseGame}
        quit={quit}
        shakeCls={shakeCls}
        bg={bg}
        css={css}
        shellClass={shellClass}
        shellStyle={shellStyle}
      />
      <KeyboardLegendModal visible={showLegend} onClose={() => setShowLegend(false)} context="gameplay" />
    </>
  );
}

// Wrap App with ErrorBoundary to catch runtime errors and prevent white screen
export default function WrappedApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
