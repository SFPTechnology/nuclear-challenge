import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, Volume2, VolumeX, Droplets, Zap, HeartPulse, Wind, FlaskConical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, LineChart, Line, Cell } from 'recharts';
import { EmptyState } from '@components/EmptyState';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { MetricBadge } from '@components/MetricBadge';
import { OperatorExclusionDialog } from '@components/OperatorExclusionDialog';
import { Ambient } from '@components/Ambient';
import { CoreGauge } from '@components/CoreGauge';
import { Label } from '@components/Label';
import { Lamp } from '@components/Lamp';
import { Lcd } from '@components/Lcd';
import { Plate } from '@components/Plate';
import { PauseButton } from '@components/PauseButton';
import { PreMelt } from '@components/PreMelt';
import { Support } from '@components/Support';
import { Valve } from '@components/Valve';
import { usePhysics } from '@hooks/usePhysics';
import { useScore } from '@hooks/useScore';
import { useTurmaRegistry } from '@hooks/useTurmaRegistry';
import { useGameState } from '@hooks/useGameState';
import { useUIState } from '@hooks/useUIState';
import { useAudio } from '@hooks/useAudio';
import { useDeviceClass } from '@hooks/useDeviceClass';
import { useViewportScale } from '@hooks/useViewportScale';
import { LoginPanel } from '@components/LoginPanel';
import { MenuPanel } from '@components/MenuPanel';
import { EndGamePanel } from '@components/EndGamePanel';
import { Boom } from '@components/Boom';
import { RankingPanel } from '@components/RankingPanel';
import { localDay, getDeviceClass } from '@utils/viewport';
import { emptyStudyDay, mergeStudyLog } from '@utils/studyLog';
const CHART_COLORS = ['#06b6d4', '#f59e0b', '#a3e635', '#f472b6', '#818cf8', '#fb923c', '#2dd4bf', '#e879f9'];
const axisStyle = { fontSize: 8, fill: '#c5cdd8' };
const tipStyle = { background: '#0a1418', border: '1px solid #0891b2', borderRadius: 4, fontSize: 10, color: '#cbd5e1' };

const DIFF = {
  1: { name: 'TRAINEE', sub: 'Primeiro dia', ops: ['*'], range: [2,5], time: 35, init: 10, err: 0, ok: -25, passive: 2, interval: 9000, scram: 5 },
  2: { name: 'JÚNIOR', sub: 'Aprendendo', ops: ['*','/'], range: [2,7], time: 30, init: 20, err: 15, ok: -20, passive: 3, interval: 8000, scram: 4 },
  3: { name: 'PLENO', sub: 'Turno normal', ops: ['*','/'], range: [2,10], time: 25, init: 30, err: 20, ok: -18, passive: 4, interval: 7000, scram: 3 },
  4: { name: 'SÊNIOR', sub: 'Crise nacional', ops: ['*','/'], range: [2,12], time: 20, init: 40, err: 25, ok: -15, passive: 5, interval: 6000, scram: 2 },
  5: { name: 'CHERNOBYL', sub: 'Boa sorte...', ops: ['*','/'], range: [3,15], time: 12, init: 50, err: 30, ok: -12, passive: 6, interval: 5000, scram: 1, events: true }
};

const TITLES = ['👷 Estagiário', '📋 Téc. Competente', '🔧 Op. Exemplar', '⭐ Eng. Nuclear', '🎖️ Dir. Segurança', '🏅 Herói Nacional'];
const VENT_CD = 12, BORON_CD = 30, FREEZE_MS = 14000;

const DS = {
  metal: 'linear-gradient(160deg,#3a4149 0%,#2b3138 40%,#22272d 70%,#2e343b 100%)',
  bezel: 'linear-gradient(145deg,#4a525b 0%,#2a2f35 45%,#1c2126 100%)',
  recess: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
  raised: '0 1px 0 rgba(255,255,255,.09), 0 3px 6px rgba(0,0,0,.6)',
  glass: 'linear-gradient(160deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,.03) 34%,transparent 55%)',
  brush: 'repeating-linear-gradient(94deg,rgba(255,255,255,.022) 0px,rgba(255,255,255,.022) 1px,transparent 1px,transparent 3px)'
};

function App() {
  const device = useDeviceClass();
  const viewportScale = useViewportScale();

  // Extract UI state into custom hook
  const { mode, setMode, boom, setBoom, diff, setDiff, selectedOperatorToExclude, setSelectedOperatorToExclude, calendarCursor, setCalendarCursor, nameInput, setNameInput, triggerButtonRef } = useUIState();

  // Extract audio management into custom hook
  const { snd, initA, tone, okSnd, errSnd, scrmSnd, boomSnd, startAlm, stopAlm, startGei, stopGei } = useAudio();

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

  // Refs
  const hotRef = useRef(0), vel = useRef(0), frz = useRef(null), recent = useRef([]), saved = useRef(false);
  const sess = useRef({ tabs: {}, ops: {}, forms: {}, daily: {} });
  const okStore = useRef(true); // TD-DAT-02: Track storage read health to prevent overwrites on corruption
  const ctx = useRef(null), alm = useRef(null), gei = useRef(null);

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
      if (picked === null) { if (e.key === '1') pick(0); else if (e.key === '2') pick(1); return; }
      if (e.key >= '0' && e.key <= '9') press(e.key);
      else if (e.key === 'Backspace') press('⌫');
      else if (e.key === 'Escape') press('C');
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
      .nc-viewport{min-height:100dvh;height:100dvh;overflow-y:auto;overflow-x:hidden;padding-bottom:max(12px,env(safe-area-inset-bottom))}
      .nc-shell{--nc-scale:1;width:calc(100% / var(--nc-scale));max-width:calc(100% / var(--nc-scale));min-height:calc(100dvh / var(--nc-scale));margin-inline:auto;zoom:var(--nc-scale);box-sizing:border-box}
      .nc-mobile{padding-inline:0;}
      @media (min-width:640px){.nc-shell{max-width:calc(720px / var(--nc-scale))}.nc-tablet{padding-inline:8px}}
      @media (min-width:1024px){.nc-shell{max-width:calc(1120px / var(--nc-scale))}.nc-desktop{padding-inline:16px}}
      @media (min-width:1440px){.nc-shell{max-width:calc(1280px / var(--nc-scale))}}
      @media (max-width:639px){.nc-shell{padding-inline:0}.nc-shell > *{max-width:100%}}
    `}</style>
  );

  if (boom) return <Boom onDone={() => { setBoom(false); setMelt(0); setMode('lose'); }} />;

  // TD-DAT-05: Global error banner visible on all screens
  const GlobalErrorBanner = () => storeErr ? (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'linear-gradient(to bottom, rgba(239,68,68,.15), transparent)', borderBottom: '1px solid rgba(239,68,68,.5)', padding: '8px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: '#fecaca', fontWeight: 'bold' }}>⚠ FALHA DE ARMAZENAMENTO: Dados podem não ser salvos</div>
      <div style={{ fontSize: 8, color: '#fed7aa', marginTop: 2 }}>Recarregue a página para tentar reconectar ao armazenamento</div>
    </div>
  ) : null;

  const st = heat <= 30 ? { t: 'ESTÁVEL', c: '#22c55e' } : heat <= 55 ? { t: 'ATENÇÃO', c: '#f59e0b' } : heat <= 80 ? { t: 'CRÍTICO', c: '#f97316' } : { t: 'MELTDOWN', c: '#dc2626' };
  const shakeCls = mode === 'play' && heat >= 90 ? 'rumbleHard' : mode === 'play' && heat > 72 ? 'rumble' : '';
  const bg = { background: 'radial-gradient(ellipse at 50% 0%,#171b1f,#0a0c0e 75%)' };
  const shellClass = `nc-shell nc-${device}`;
  const shellStyle = { '--nc-scale': viewportScale };

  if (mode === 'login') return (
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
  );

  if (mode === 'ranking') return (
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
  );

  if (mode === 'analise') {
    const S = (players[player] && players[player].stats) || { tabs: {}, ops: {}, forms: {} };
    const pctOf = v => v && (v.h + v.m) > 0 ? Math.round((v.h / (v.h + v.m)) * 100) : null;
    const colOf = p => p === null ? '#2a2f35' : p >= 90 ? '#16a34a' : p >= 75 ? '#65a30d' : p >= 60 ? '#ca8a04' : p >= 40 ? '#ea580c' : '#dc2626';
    const tabRows = Object.entries(S.tabs).map(([k, v]) => ({ k: +k, n: v.h + v.m, p: pctOf(v), h: v.h, m: v.m })).filter(r => r.n >= 3);
    const fracos = [...tabRows].sort((a, b) => a.p - b.p).slice(0, 3);
    const fortes = [...tabRows].sort((a, b) => b.p - a.p).slice(0, 3);
    const totalOps = Object.values(S.ops).reduce((a, v) => a + v.h + v.m, 0);
    const studyLog = (players[player] && players[player].studyLog) || {};
    const cursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
    const monthStart = cursor.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const calendarCells = [...Array(monthStart + daysInMonth)].map((_, i) => i < monthStart ? null : localDay(new Date(cursor.getFullYear(), cursor.getMonth(), i - monthStart + 1)));
    const monthDays = calendarCells.filter(Boolean).map(d => ({ ...d, record: studyLog[d.key] })).filter(d => d.record);
    const monthTotal = monthDays.reduce((sum, d) => sum + d.record.total, 0);
    const monthHits = monthDays.reduce((sum, d) => sum + d.record.hits, 0);
    const priority = Object.entries(studyLog).reduce((rows, [, day]) => {
      Object.entries(day.tables || {}).forEach(([table, value]) => {
        const total = value.hits + value.misses;
        if (total < 2) return;
        const current = rows.find(r => r.key === `tab-${table}`) || { key: `tab-${table}`, label: `Tabuada do ${table}`, hits: 0, misses: 0 };
        current.hits += value.hits; current.misses += value.misses;
        if (!rows.includes(current)) rows.push(current);
      });
      Object.entries(day.types || {}).forEach(([type, value]) => {
        const total = value.hits + value.misses;
        if (total < 2) return;
        const labels = { multiplication: 'Multiplicacao', division: 'Divisao', direct: 'Conta direta', inverse: 'Conta inversa' };
        const current = rows.find(r => r.key === `type-${type}`) || { key: `type-${type}`, label: labels[type], hits: 0, misses: 0 };
        current.hits += value.hits; current.misses += value.misses;
        if (!rows.includes(current)) rows.push(current);
      });
      return rows;
    }, []).map(row => ({ ...row, total: row.hits + row.misses, accuracy: Math.round((row.hits / Math.max(1, row.hits + row.misses)) * 100) }))
      .sort((a, b) => (b.misses - a.misses) || (a.accuracy - b.accuracy) || (b.total - a.total)).slice(0, 6);
    const monthLabel = cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const FORM = { result: 'Resultado oculto · 7 × 8 = ?', left: 'Fator esquerdo · ? × 8 = 56', right: 'Fator direito · 7 × ? = 56' };

    return (
      <div className="nc-viewport min-h-screen p-3" style={bg}>{css}
        <GlobalErrorBanner />
        <div className={`${shellClass} mx-auto`} style={shellStyle}>
          <Plate className="p-3 mb-2 text-center">
            <Label>Análise de Desempenho</Label>
            <div className="font-mono font-bold mt-1" style={{ fontSize: 13, color: '#7dd3fc' }}>{player}</div>
            <div style={{ fontSize: 9, color: '#a1aab8' }}>{totalOps} operações analisadas</div>
          </Plate>

          <Plate className="p-2 mb-1.5">
            <div className="flex justify-between items-center mb-1.5">
              <button onClick={() => setCalendarCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Mês anterior" className="rounded" style={{ padding: '3px 8px', color: '#7dd3fc', background: '#0a1418' }}>‹</button>
              <div className="text-center"><Label>Registro de treino</Label><div className="font-mono font-bold" style={{ fontSize: 11, color: '#cbd5e1', textTransform: 'capitalize' }}>{monthLabel}</div></div>
              <button onClick={() => setCalendarCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Próximo mês" className="rounded" style={{ padding: '3px 8px', color: '#7dd3fc', background: '#0a1418' }}>›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((name, i) => <Label key={`${name}-${i}`} size={6}>{name}</Label>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, i) => {
                const record = day && studyLog[day.key];
                const accuracy = record ? Math.round((record.hits / Math.max(1, record.total)) * 100) : null;
                return <div key={i} style={{ minHeight: 35, borderRadius: 4, padding: '3px 2px', background: record ? colOf(accuracy) : '#0a1418', opacity: day ? 1 : .35, border: record ? '1px solid rgba(255,255,255,.12)' : '1px solid #171b1f' }}>
                  {day && <><div className="font-mono font-bold" style={{ fontSize: 9, color: '#fff' }}>{day.day}</div>{record && <div className="font-mono" style={{ fontSize: 6.5, color: '#fff' }}>{record.hits}/{record.total}</div>}</>}
                </div>;
              })}
            </div>
            <div className="flex justify-between mt-1.5"><Label size={6}>{monthTotal} contas registradas</Label><Label size={6}>{monthTotal ? Math.round((monthHits / monthTotal) * 100) : 0}% de acerto no mes</Label></div>
          </Plate>

          {priority.length > 0 && <Plate className="p-2 mb-1.5" glow="rgba(245,158,11,.25)">
            <Label className="mb-1.5">Prioridade de estudo</Label>
            {priority.map((item, index) => <div key={item.key} className="flex items-center gap-1.5 mb-1">
              <div className="font-mono font-bold" style={{ width: 18, textAlign: 'center', color: index < 2 ? '#f87171' : '#fbbf24' }}>{index + 1}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 8.5, color: '#cbd5e1' }}>{item.label}</div><div style={{ height: 4, marginTop: 2, borderRadius: 3, background: '#0a0e11', overflow: 'hidden' }}><div style={{ height: '100%', width: `${100 - item.accuracy}%`, background: item.accuracy < 60 ? 'repeating-linear-gradient(45deg, #dc2626, #dc2626 2px, #991b1b 2px, #991b1b 4px)' : 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 2px, #b45309 2px, #b45309 4px)' }} /></div></div>
              <span className="font-mono" style={{ width: 76, textAlign: 'right', fontSize: 8, color: item.accuracy < 60 ? '#f87171' : '#fbbf24' }}>{item.accuracy}% · {item.misses} erros</span>
            </div>)}
            <div style={{ fontSize: 8, color: '#c5cdd8', marginTop: 5 }}>A ordem combina erros acumulados, taxa de acerto e volume praticado.</div>
          </Plate>}

          {totalOps < 10 ? (
            <Plate className="p-4 text-center">
              <Label>Dados insuficientes</Label>
              <div style={{ fontSize: 11, color: '#c5cdd8', marginTop: 6 }}>Jogue algumas partidas para que a análise identifique seus pontos fortes e fracos.</div>
            </Plate>
          ) : (
            <>
              <Plate className="p-2 mb-1.5">
                <Label className="mb-1.5">Mapa das Tabuadas</Label>
                <div className="flex flex-wrap gap-1">
                  {[2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => {
                    const v = S.tabs[n], p = pctOf(v), tries = v ? v.h + v.m : 0;
                    return (
                      <div key={n} style={{ width: 'calc(14.28% - 4px)', textAlign: 'center', borderRadius: 4, padding: '4px 0', background: colOf(p), opacity: tries === 0 ? .25 : 1, boxShadow: 'inset 0 -2px 4px rgba(0,0,0,.4)' }}>
                        <div className="font-mono font-bold" style={{ fontSize: 11, color: '#fff' }}>{n}</div>
                        <div className="font-mono" style={{ fontSize: 7, color: '#ffffffcc' }}>{p === null ? '—' : `${p}%`}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1.5 px-1">
                  <Label size={6}>◼ Menos de 40%</Label><Label size={6}>◼ Acima de 90%</Label>
                </div>
              </Plate>

              <Plate className="p-2 mb-1.5">
                <Label className="mb-1">Acerto por tabuada</Label>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={tabRows.sort((a, b) => a.k - b.k)} margin={{ top: 6, right: 6, bottom: 0, left: -24 }}>
                    <XAxis dataKey="k" tick={axisStyle} axisLine={{ stroke: '#2a3138' }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tipStyle} labelFormatter={v => `Tabuada do ${v}`} formatter={(v, n, p) => [`${v}% · ${p.payload.h} acertos, ${p.payload.m} erros`, 'Desempenho']} cursor={{ fill: 'rgba(6,182,212,.08)' }} />
                    <Bar dataKey="p" radius={[3, 3, 0, 0]}>
                      {tabRows.map((r, i) => <Cell key={i} fill={colOf(r.p)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Plate>

              {fracos.length > 0 && (
                <Plate className="p-2 mb-1.5" glow="rgba(220,38,38,.25)">
                  <Label className="mb-1.5">Reforçar com prioridade</Label>
                  {fracos.map(r => (
                    <div key={r.k} className="flex items-center gap-2 mb-1">
                      <div className="font-mono font-bold" style={{ width: 26, textAlign: 'center', fontSize: 12, color: '#fff', background: colOf(r.p), borderRadius: 3, padding: '2px 0' }}>{r.k}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 5, borderRadius: 3, background: '#0a0e11', boxShadow: DS.recess, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${r.p}%`, background: colOf(r.p) }} />
                        </div>
                      </div>
                      <span className="font-mono" style={{ fontSize: 9, color: '#c5cdd8', width: 62, textAlign: 'right' }}>{r.p}% · {r.m} erro{r.m === 1 ? '' : 's'}</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 9, color: '#c5cdd8', marginTop: 4, lineHeight: 1.4 }}>
                    Treine a tabuada do <b style={{ color: '#f87171' }}>{fracos[0].k}</b> antes da próxima partida — é onde você mais perde calor do reator.
                  </div>
                </Plate>
              )}

              {fortes.length > 0 && (
                <Plate className="p-2 mb-1.5" glow="rgba(22,163,74,.2)">
                  <Label className="mb-1.5">Domínio consolidado</Label>
                  <div className="flex gap-1">
                    {fortes.map(r => (
                      <div key={r.k} style={{ flex: 1, textAlign: 'center', background: '#0a1418', boxShadow: DS.recess, borderRadius: 4, padding: '4px 0' }}>
                        <div className="font-mono font-bold" style={{ fontSize: 13, color: '#4ade80' }}>{r.k}</div>
                        <div className="font-mono" style={{ fontSize: 8, color: '#c5cdd8' }}>{r.p}% · {r.n}x</div>
                      </div>
                    ))}
                  </div>
                </Plate>
              )}

              <Plate className="p-2 mb-1.5">
                <Label className="mb-1.5">Multiplicação vs Divisão</Label>
                {['×', '÷'].map(s => {
                  const v = S.ops[s], p = pctOf(v);
                  if (!v) return null;
                  return (
                    <div key={s} className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold" style={{ width: 16, fontSize: 14, color: '#cbd5e1' }}>{s}</span>
                      <div style={{ flex: 1, height: 7, borderRadius: 3, background: '#0a0e11', boxShadow: DS.recess, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p}%`, background: colOf(p), transition: 'width .4s' }} />
                      </div>
                      <span className="font-mono" style={{ fontSize: 9, color: '#c5cdd8', width: 66, textAlign: 'right' }}>{p}% · {v.h + v.m} ops</span>
                    </div>
                  );
                })}
              </Plate>

              <Plate className="p-2 mb-1.5">
                <Label className="mb-1.5">Formato da Pergunta</Label>
                {Object.entries(FORM).map(([k, l]) => {
                  const v = S.forms[k], p = pctOf(v);
                  if (!v) return null;
                  return (
                    <div key={k} className="mb-1.5">
                      <div className="flex justify-between mb-0.5">
                        <span style={{ fontSize: 8.5, color: '#c5cdd8' }}>{l}</span>
                        <span className="font-mono" style={{ fontSize: 9, color: colOf(p) }}>{p}%</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: '#0a0e11', boxShadow: DS.recess, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p}%`, background: colOf(p) }} />
                      </div>
                    </div>
                  );
                })}
                {(() => {
                  const r = pctOf(S.forms.result), inv = pctOf(S.forms.left) !== null || pctOf(S.forms.right) !== null
                    ? Math.round((((S.forms.left || { h: 0, m: 0 }).h + (S.forms.right || { h: 0, m: 0 }).h) / Math.max(1, (S.forms.left || { h: 0, m: 0 }).h + (S.forms.left || { h: 0, m: 0 }).m + (S.forms.right || { h: 0, m: 0 }).h + (S.forms.right || { h: 0, m: 0 }).m)) * 100) : null;
                  if (r === null || inv === null) return null;
                  const gap = r - inv;
                  return <div style={{ fontSize: 9, color: '#c5cdd8', lineHeight: 1.4, marginTop: 2 }}>
                    {gap > 15
                      ? <>Você acerta {gap} pontos a mais quando o resultado está oculto. Isso indica que a <b style={{ color: '#fbbf24' }}>operação inversa</b> ainda não está automática — vale treinar “qual número vezes 8 dá 56?”.</>
                      : gap < -15
                        ? <>Curiosamente você vai melhor nas formas invertidas. Reforce o cálculo direto para equilibrar.</>
                        : <>Seu desempenho é equilibrado entre cálculo direto e inverso — bom sinal de compreensão da operação.</>}
                  </div>;
                })()}
              </Plate>
            </>
          )}

          <button onClick={() => setMode('menu')} className="w-full mt-1" aria-label="Voltar para menu principal">
            <Plate className="py-2 text-center"><Label>Voltar</Label></Plate>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'nc003') {
    return (
      <div className="nc-viewport min-h-screen p-3" style={bg}>{css}
        <GlobalErrorBanner />
        <div className={`${shellClass} mx-auto`} style={shellStyle}>
          <Plate className="p-3 mb-2 text-center">
            <Label>NC-003: Taxa de Sucesso</Label>
            <div className="font-mono font-bold mt-1" style={{ fontSize: 13, color: '#7dd3fc' }}>{player}</div>
          </Plate>

          <Plate className="p-3 mb-2">
            <Label className="mb-2">📊 Métricas Atuais</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <MetricBadge
                label="Heat"
                value={heat}
                status={heat > 70 ? 'alert' : heat > 50 ? 'warning' : 'ok'}
              />
              <MetricBadge
                label="Integrity"
                value={integrity}
                status={integrity < 30 ? 'alert' : integrity < 60 ? 'warning' : 'ok'}
              />
              <MetricBadge
                label="Coolant"
                value={coolant}
                status={coolant < 30 ? 'alert' : coolant < 60 ? 'warning' : 'ok'}
              />
            </div>
          </Plate>

          <Plate className="p-3 mb-3" glow="rgba(6,182,212,.2)">
            <Label className="mb-1.5">Informações da Turma</Label>
            {[['Turma', `5B (${Object.keys(players).length} operadores)`], ['Total de Partidas', Object.keys(players).reduce((sum, name) => sum + ((players[name] && players[name].games) || 0), 0)], ['Taxa Média de Sucesso', `${Object.keys(players).length > 0 ? Math.round(Object.values(players).reduce((sum, p) => sum + ((p.ops > 0 ? (p.hits / p.ops) * 100 : 0)), 0) / Object.keys(players).length) : 0}%`]].map(([label, value], i) => (
              <div key={i} className="flex justify-between items-center py-1" style={{ borderBottom: i < 2 ? '1px solid #171b1f' : 'none' }}>
                <Label size={7}>{label}</Label>
                <span className="font-mono font-bold" style={{ fontSize: 11, color: '#7dd3fc' }}>{value}</span>
              </div>
            ))}
          </Plate>

          <div className="flex gap-1.5">
            <button onClick={() => setMode('menu')} style={{ flex: 1 }} aria-label="Voltar para menu">
              <Plate className="py-2 text-center"><Label>← Voltar</Label></Plate>
            </button>
            <button onClick={() => setMode('analise')} style={{ flex: 1 }} aria-label="Ver análise de desempenho">
              <Plate className="py-2 text-center"><Label>Análise</Label></Plate>
            </button>
            <button onClick={start} style={{ flex: 1 }} aria-label="Continuar para jogo">
              <div className="rounded-md text-center font-bold" style={{ padding: '10px 0', fontSize: 11, letterSpacing: '.1em', background: 'linear-gradient(180deg,#0e7490,#155e75 55%,#0c4a5e)', boxShadow: '0 1px 0 rgba(255,255,255,.2) inset,0 4px 8px #000,0 0 16px rgba(6,182,212,.35)', border: '1px solid #083344', color: '#e0f2fe' }}>Continuar</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'menu') return (
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
  );

  if (mode === 'win' || mode === 'lose' || mode === 'quit' || mode === 'pause')
    return (
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
    );

  const ringPct = (tmr / DIFF[diff].time) * 100;
  const ringCol = ringPct < 25 ? '#dc2626' : ringPct < 55 ? '#f59e0b' : '#06b6d4';

  return (
    <div className={`nc-viewport min-h-screen p-2 ${shakeCls}`} style={bg}>{css}
      <GlobalErrorBanner />
      <Ambient heat={heat} />
      {melt > 0 && <PreMelt secs={melt} />}
      {evt && <div className="fixed top-1 left-1/2 rounded font-bold" role="alert" aria-live="assertive" style={{ transform: 'translateX(-50%)', zIndex: 50, padding: '5px 10px', fontSize: 9, letterSpacing: '.06em', background: 'linear-gradient(180deg,#1e2530,#12171d)', border: '1px solid #0891b2', color: '#7dd3fc', boxShadow: '0 0 16px rgba(6,182,212,.4)' }}>{evt}</div>}

      <div className={`${shellClass} mx-auto`} style={shellStyle}>
        <Plate className="px-2 py-1 mb-1.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 12 }}>☢️</span>
              <span className="font-bold" style={{ fontSize: 11, letterSpacing: '.15em', color: '#cbd5e1' }}>UN-01</span>
              <span className="rounded" style={{ padding: '1px 5px', fontSize: 8, background: '#0a1418', boxShadow: DS.recess, color: '#7dd3fc' }}>{rank}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { initA(); setSnd(!snd); }} aria-label={snd ? 'Desativar som' : 'Ativar som'} aria-pressed={snd}>{snd ? <Volume2 size={11} color="#c5cdd8" /> : <VolumeX size={11} color="#c5cdd8" />}</button>
              <div className="rounded font-bold" style={{ padding: '1px 7px', fontSize: 8, background: `linear-gradient(180deg,${st.c}dd,${st.c}77)`, color: '#0a0c0e', boxShadow: `0 0 10px ${st.c}88` }}>{st.t}</div>
            </div>
          </div>
        </Plate>

        <div className="mb-1.5"><CoreGauge temp={shownTemp} delta={delta} danger={heat > 80} frozen={frozen} /></div>

        <div className="grid grid-cols-3 gap-1 mb-1.5">
          <Support label="Integr" value={integrity} unit="%" pct={integrity} I={HeartPulse} inv warn={integrity < 50} />
          <Support label="Refrig" value={Math.round(coolant)} unit="%" pct={coolant} I={Droplets} inv warn={coolant < 40} />
          <Support label="Potência" value={power} unit="MW" pct={(power - 300) / 9} I={Zap} />
        </div>

        <Plate className="px-2 py-1 mb-1.5">
          <div className="flex justify-around">
            <Lamp on={heat > 80} hue="red" label="NÚCLEO" />
            <Lamp on={integrity < 40} hue="red" label="INTEGR" />
            <Lamp on={coolant < 40} hue="amber" label="REFRIG" />
            <Lamp on={heat > 55} hue="amber" label="TEMP" />
            <Lamp on={frozen} hue="green" label="BORO" />
            <Lamp on={heat <= 30 && integrity > 60} hue="green" label="NORMAL" />
          </div>
        </Plate>

        <Plate className="p-1.5 mb-1.5">
          <div className="flex gap-1.5">
            <Valve label="ALÍVIO" sub="−32 calor" I={Wind} cd={ventCd} maxCd={VENT_CD} disabled={coolant < 8} color={{ a: '#0e7490', b: '#155e75', c: '#0c4a5e', glow: 'rgba(6,182,212,.3)', txt: '#a5f3fc' }} onClick={doVent} />
            <Valve label="BORO" sub="−15 · freia 14s" I={FlaskConical} cd={boronCd} maxCd={BORON_CD} disabled={integrity <= 5} color={{ a: '#4d7c0f', b: '#3f6212', c: '#365314', glow: 'rgba(132,204,22,.3)', txt: '#d9f99d' }} onClick={doBoron} />
            <Valve label={`SCRAM ${scrm}`} sub="−70 calor" I={Shield} cd={0} maxCd={1} disabled={scrm === 0} color={{ a: '#991b1b', b: '#7f1d1d', c: '#450a0a', glow: 'rgba(239,68,68,.35)', txt: '#fecaca' }} onClick={doScram} />
          </div>
        </Plate>

        {picked === null && !locked ? (
          <Plate className="p-2 mb-1.5" role="region" aria-label="Seleção de operação">
            <div className="text-center mb-1.5" role="alert"><Label>Selecione a operação {grace > 0 ? `· ${grace}s` : ''}</Label></div>
            <div className="flex gap-1.5">
              {pair.map((p, i) => p && (
                <button key={i} onClick={() => pick(i)} aria-label={`Selecionar operação ${p.profile === 'routine' ? 'rotina' : 'prioritária'}: ${p.prompt}`} style={{ flex: 1, borderRadius: 6, padding: '8px 4px',
                  background: 'linear-gradient(180deg,#0a1418,#050b0e)',
                  border: `1.5px solid ${i === 0 ? (p.surge ? '#a16207' : '#0e7490') : '#b45309'}`,
                  boxShadow: `${DS.recess}, 0 0 10px ${i === 0 ? (p.surge ? 'rgba(161,98,7,.3)' : 'rgba(6,182,212,.25)') : 'rgba(245,158,11,.25)'}` }}>
                  <div style={{ fontSize: 7.5, letterSpacing: '.12em', color: i === 0 ? (p.surge ? '#fcd34d' : '#67e8f9') : '#fbbf24', fontWeight: 'bold' }}>
                    {i === 0 ? (p.surge ? 'ROTINA ⚡ REFORÇADA' : 'ROTINA') : 'PRIORITÁRIA'}
                  </div>
                  <div className="font-mono font-bold my-1" style={{ fontSize: 19, color: '#e0f2fe' }}>{p.prompt}</div>
                  <div style={{ fontSize: 7.5, color: i === 0 ? '#155e75' : '#92400e' }}>
                    <span style={{ color: i === 0 ? '#67e8f9' : '#fbbf24' }}>{i === 0 ? '−12 calor' : '−28 calor'}</span>
                    <span style={{ color: '#a1aab8' }}> · {i === 0 ? 'tempo cheio' : '60% tempo'}</span>
                  </div>
                </button>
              ))}
            </div>
          </Plate>
        ) : (
          <Plate className="p-2 mb-1.5" role="region" aria-label="Problema matemático atual">
            <svg viewBox="0 0 250 66" className="w-full" role="img" aria-label={`Problema: ${prob ? prob.prompt : 'carregando'}`}>
              <rect x="6" y="6" width="238" height="54" rx="9" fill="#0a1014" stroke="#2a3138" strokeWidth="3" />
              <rect x="6" y="6" width="238" height="54" rx="9" fill="none" stroke={ringCol} strokeWidth="3" strokeDasharray="570" strokeDashoffset={570 - (570 * ringPct) / 100} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
              {locked
                ? <text x="125" y="39" textAnchor="middle" fill="#f87171" fontSize="17" fontFamily="monospace" fontWeight="bold">❌ {fb.m}</text>
                : <text x="125" y="40" textAnchor="middle" fill="#e0f2fe" fontSize="23" fontFamily="monospace" fontWeight="bold">{prob ? prob.prompt : ''}</text>}
            </svg>
            {prob && !locked && <div className="text-center" style={{ fontSize: 7.5, letterSpacing: '.1em', color: prob.profile === 'routine' ? '#67e8f9' : '#fbbf24', marginTop: -2 }}>{prob.profile === 'routine' ? 'ROTINA · −12' : 'PRIORITÁRIA · −28'}</div>}
            <div className="flex gap-1.5 mt-1.5">
              <div className="flex-1 rounded text-center font-mono font-bold flex items-center justify-center" style={{ minHeight: 36, fontSize: 20, background: 'linear-gradient(180deg,#0a1418,#050b0e)', boxShadow: DS.recess, color: ans ? '#7dd3fc' : '#1e3a45', border: '1px solid #1c2126', letterSpacing: '.1em' }} aria-live="polite" aria-label={`Resposta atual: ${ans || 'vazio'}`}>{ans || '—'}</div>
              <button onClick={check} disabled={locked || !ans} className="rounded font-bold" aria-label={`Confirmar resposta ${ans || 'vazia'}`} style={{ padding: '0 18px', fontSize: 12, background: locked || !ans ? 'linear-gradient(180deg,#2a2f35,#1a1e23)' : 'linear-gradient(180deg,#0e7490,#0c4a5e)', boxShadow: locked || !ans ? 'inset 0 2px 5px #000' : '0 1px 0 rgba(255,255,255,.18) inset,0 3px 5px #000', color: locked || !ans ? '#4b5563' : '#e0f2fe', border: '1px solid #083344' }}>OK</button>
            </div>
            {fb && fb.t === 'ok' && <div className="text-center font-bold mt-1" role="alert" aria-live="polite" style={{ fontSize: 11, color: '#4ade80' }}>✅ {fb.m}</div>}
          </Plate>
        )}

        <Plate className="p-1.5 mb-1.5">
          <div className="grid grid-cols-3 gap-1">
            {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(k => {
              const off = locked || picked === null;
              return (
                <button key={k} onClick={() => press(k)} disabled={off} aria-label={k === 'C' ? 'Limpar entrada' : k === '⌫' ? 'Remover último dígito' : `Dígito ${k}`} style={{ padding: '8px 0', borderRadius: 5, fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace',
                  background: off ? 'linear-gradient(180deg,#22272d,#171b1f)' : k === 'C' ? 'linear-gradient(180deg,#7f1d1d,#450a0a)' : k === '⌫' ? 'linear-gradient(180deg,#3f464e,#23282e)' : 'linear-gradient(180deg,#454d56,#2a3037 55%,#1f242a)',
                  boxShadow: off ? 'inset 0 2px 4px #000' : '0 1px 0 rgba(255,255,255,.16) inset,0 3px 5px rgba(0,0,0,.7)',
                  border: '1px solid #14181c', color: off ? '#3f464e' : k === 'C' ? '#fecaca' : '#e2e8f0' }}>{k}</button>
              );
            })}
          </div>
        </Plate>

        <div className="flex gap-1">
          <PauseButton onClick={pauseGame} />
          <button onClick={quit} aria-label="Sair da partida"><Plate className="px-2.5 py-1.5 h-full flex items-center"><Label size={8}>Sair</Label></Plate></button>
          {[['META', `${pts}/${goal}`, '#7dd3fc'], ['SEQ', strk, '#fbbf24'], ['TEMPO', `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`, '#cbd5e1']].map(([l, v, c], i) => (
            <div key={i} style={{ flex: 1 }}><Plate className="py-1 text-center"><Label size={6.5}>{l}</Label><div className="font-mono font-bold" style={{ fontSize: 10, color: c }}>{v}</div></Plate></div>
          ))}
        </div>
      </div>
    </div>
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
