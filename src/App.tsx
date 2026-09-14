import React, { useState, useEffect, useCallback, useRef } from 'react';
import '@styles/responsive.css';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { AuthGate } from '@components/AuthGate';
import { usePhysics } from '@hooks/usePhysics';
import { useScore } from '@hooks/useScore';
import { useTurmaRegistry, type PlayerData } from '@hooks/useTurmaRegistry';
import { useUIState, type AppMode } from '@hooks/useUIState';
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
import { emptyStudyDay } from '@utils/studyLog';
import { GameRepository } from '@domain/supabase/GameRepository';
import { buildSavedPlayer, type SessionStats } from '@domain/core/Performance';
import { buildQuestionCandidates, LEVEL_GOAL_POINTS, LEVEL_QUESTION_RANGES, loadSeenFacts, pickQuestion, questionFactKey, ROUTINE_REINFORCEMENT_INTERVAL, saveSeenFacts } from '@domain/core/QuestionPolicy';
import { MIN_VISIBLE_FEEDBACK_MS } from '@constants/timing';
export { buildSavedPlayer } from '@domain/core/Performance';

type Question = {
  profile: 'routine' | 'priority';
  surge: boolean;
  prompt: string;
  key: string;
  answer: number;
  full: string;
  sym: '×' | '÷';
  hidden: 'result' | 'left' | 'right';
  factors: number[];
};
type Feedback = { t: 'ok' | 'err'; m: string };
const DIFF: Record<number, { name: string; sub: string; ops: ('*' | '/')[]; range: [number, number]; time: number; init: number; err: number; ok: number; passive: number; interval: number; scram: number; events?: boolean }> = {
  1: { name: 'TRAINEE', sub: 'Primeiro dia', ops: ['*'], range: LEVEL_QUESTION_RANGES[1].routine, time: 35, init: 10, err: 0, ok: -25, passive: 2, interval: 9000, scram: 5 },
  2: { name: 'JÚNIOR', sub: 'Aprendendo', ops: ['*','/'], range: LEVEL_QUESTION_RANGES[2].routine, time: 30, init: 20, err: 15, ok: -20, passive: 3, interval: 8000, scram: 4 },
  3: { name: 'PLENO', sub: 'Turno normal', ops: ['*','/'], range: LEVEL_QUESTION_RANGES[3].routine, time: 25, init: 30, err: 20, ok: -18, passive: 4, interval: 7000, scram: 3 },
  4: { name: 'SÊNIOR', sub: 'Crise nacional', ops: ['*','/'], range: LEVEL_QUESTION_RANGES[4].routine, time: 20, init: 40, err: 25, ok: -15, passive: 5, interval: 6000, scram: 2 },
  5: { name: 'CHERNOBYL', sub: 'Boa sorte...', ops: ['*','/'], range: LEVEL_QUESTION_RANGES[5].routine, time: 12, init: 50, err: 30, ok: -12, passive: 6, interval: 5000, scram: 1, events: true }
};

const TITLES = ['👷 Estagiário', '📋 Téc. Competente', '🔧 Op. Exemplar', '⭐ Eng. Nuclear', '🎖️ Dir. Segurança', '🏅 Herói Nacional'];
const VENT_CD = 12, BORON_CD = 30, FREEZE_MS = 14000;

function App() {
  const device = useDeviceClass();

  // Extract UI state into custom hook
  const { mode, setMode, analysisReturnMode, openAnalysis, boom, setBoom, diff, setDiff, selectedOperatorToExclude, setSelectedOperatorToExclude, calendarCursor, setCalendarCursor, nameInput, setNameInput, triggerButtonRef } = useUIState();
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const routeMode = (nextMode: AppMode) => {
    if (nextMode === 'analise') {
      if (mode === 'pause') setResumeAvailable(true);
      openAnalysis(mode === 'pause' ? 'pause' : 'menu');
      return;
    }
    if (nextMode === 'ranking' && mode === 'pause') setResumeAvailable(true);
    setMode(nextMode);
  };

  // Extract audio management into custom hook
  const { snd, setSnd, initA, tone, okSnd, errSnd, scrmSnd, boomSnd, startAlm, stopAlm, startGei, stopGei } = useAudio();

  // Core state management
  const {
    players, setPlayers, player, setPlayer, loading, setLoading, storeErr, setStoreErr
  } = useTurmaRegistry();
  const [matches, setMatches] = useState<Array<{ n: string; d: number; pts: number; acc: number; streak: number; secs: number; out: 'win' | 'lose' | 'quit'; ts: number }>>([]);
  const [tab, setTab] = useState('geral');
  const {
    heat, setHeat, integrity, setIntegrity, coolant, setCoolant, shownTemp, setShownTemp, delta, setDelta
  } = usePhysics(30);
  const {
    pts, setPts, goal, setGoal, strk, setStrk, bestStrk, setBestStrk
  } = useScore();

  // Game state - will be extracted to hook later
  const [rankIdx, setRankIdx] = useState(0);
  const [pair, setPair] = useState<[Question | null, Question | null]>([null, null]);
  const [picked, setPicked] = useState<number | null>(null);
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
  const [fb, setFb] = useState<Feedback | null>(null);
  const [evt, setEvt] = useState<string | null>(null);
  const [melt, setMelt] = useState(0);
  const [showLegend, setShowLegend] = useState(false);

  // Refs
  const hotRef = useRef(0), vel = useRef(0), frz = useRef<ReturnType<typeof setTimeout> | null>(null), recent = useRef<string[]>([]), saved = useRef(false);
  const repository = useRef<GameRepository | null>(null);
  const gameSessionId = useRef<string | null>(null);
  const answerSequence = useRef(0);
  const sess = useRef<SessionStats>({ tabs: {}, ops: {}, forms: {}, mistakes: {}, daily: {} });
  const okStore = useRef(true); // TD-DAT-02: Track storage read health to prevent overwrites on corruption

  const bump = (q: Question, hit: boolean) => {
    const s = sess.current, k = hit ? 'h' : 'm';
    if (!hit) {
      reinforceFacts.current.add(questionFactKey(q));
      saveSeenFacts(player ? players[player]?.operatorId : undefined, reinforceFacts.current, 'reinforce');
    }
    q.factors.forEach(f => { const key = String(f); s.tabs[key] = s.tabs[key] || { h: 0, m: 0 }; s.tabs[key][k]++; });
    s.ops[q.sym] = s.ops[q.sym] || { h: 0, m: 0 }; s.ops[q.sym][k]++;
    s.forms[q.hidden] = s.forms[q.hidden] || { h: 0, m: 0 }; s.forms[q.hidden][k]++;
    const today = localDay();
    const day = s.daily[today.key] || emptyStudyDay(today);
    const operation = q.sym === '×' ? 'multiplication' : 'division';
    const form = q.hidden === 'result' ? 'direct' : 'inverse';
    day.total++;
    day[k === 'h' ? 'hits' : 'misses']++;
    day.types[operation][k === 'h' ? 'hits' : 'misses']++;
    day.types[form][k === 'h' ? 'hits' : 'misses']++;
    q.factors.forEach(f => {
      const table = String(f);
      day.tables[table] = day.tables[table] || { hits: 0, misses: 0 };
      day.tables[table][k === 'h' ? 'hits' : 'misses']++;
    });
    const mistakes = sess.current.mistakes || (sess.current.mistakes = {});
    const mistake = mistakes[q.full] || { expression: q.full, errors: 0, correct: 0, lastSeen: 0 };
    if (hit) mistake.correct++;
    else mistake.errors++;
    mistake.lastSeen = Date.now();
    mistakes[q.full] = mistake;
    day.updatedAt = Date.now();
    s.daily[today.key] = day;
  };
  const snapshot = () => ({ version: 1, diff, heat, integrity, coolant, pts, goal, strk, bestStrk, scrm, elapsed, tot, corr, pair, picked, ans, tmr, grace, rankIdx, sessionStats: sess.current });
  const recordAnswer = (question: Question, correct: boolean) => {
    const operatorId = player ? players[player]?.operatorId : undefined;
    if (!gameSessionId.current || !operatorId || !repository.current) { setStoreErr(true); return; }
    const questionData = { key: question.key, prompt: question.prompt, expression: question.full, operation: question.sym, hidden: question.hidden, factors: question.factors };
    const sequence = answerSequence.current++;
    void repository.current.answer(gameSessionId.current, operatorId, sequence, questionData, correct, snapshot()).catch(() => setStoreErr(true));
  };
  // ---- persistência de operadores ----
  const loadAll = useCallback(async () => {
    try {
      repository.current ??= new GameRepository();
      const loaded = await repository.current.load();
      setPlayers(Object.fromEntries(loaded.operators.map(operator => [operator.label, operator.data])));
      setMatches(loaded.matches);
      setResumeAvailable(loaded.hasPausedSession);
      okStore.current = true;
      setStoreErr(false);
    } catch {
      okStore.current = false;
      setStoreErr(true);
    }

    // Garantir que sempre há um operador padrão se a lista estiver vazia
    setLoading(false);
    return okStore.current;
  }, []);

  useEffect(() => {
    void loadAll();
  }, []);
  useEffect(() => { if (mode === 'login') loadAll(); }, [mode, loadAll]);


  const persist = async (next: Record<string, PlayerData>) => {
    // Aggregate writes are intentionally rejected: use the session RPCs below.
    void next;
    setStoreErr(true);
    return false;
  };

  const persistMatches = async (next: typeof matches) => {
    void next;
    setStoreErr(true);
    return false;
  };

  const createPlayer = async () => {
    const n = nameInput.trim().slice(0, 14);
    if (!n) return;
    if (!okStore.current) { setStoreErr(true); return; }
    if (!players[n]) {
      try {
        repository.current ??= new GameRepository();
        const created = await repository.current.createOperator(n);
        setPlayers(current => ({ ...current, [created.label]: created.data }));
      } catch { setStoreErr(true); return; }
    }
    setPlayer(n); setNameInput(''); setMode('menu');
  };

  const handleExcludeOperator = async (operatorId: string) => {
    try {
      // Filter out the operator from the list
      const filtered = Object.entries(players)
        .filter(([name]) => name !== operatorId)
        .reduce<Record<string, PlayerData>>((acc, [name, data]) => ({ ...acc, [name]: data }), {});

      // Write filtered list back to storage
      await persist(filtered);
      setSelectedOperatorToExclude(null);
    } catch (error) {
      console.error(`Error excluding operator: ${error}`);
    }
  };

  const saveResult = async (outcome: 'win' | 'lose' | 'quit') => {
    if (!player || saved.current) return;
    saved.current = true;
    if (!gameSessionId.current) { setStoreErr(true); return; }
    try {
      await repository.current!.finish(gameSessionId.current, outcome, pts, tot ? Math.round((corr / tot) * 100) : 0, bestStrk, elapsed, snapshot(), { operations: tot, hits: corr, rankIndex: rankIdx, mistakes: sess.current.mistakes ?? {} });
      gameSessionId.current = null;
      await loadAll();
    } catch { setStoreErr(true); }
  };

  const rank = TITLES[rankIdx];
  const targetTemp = 280 + heat * 4.2;
  const power = Math.round(300 + heat * 9);
  const prob = picked === null ? null : pair[picked];
  const locked = !!(fb && fb.t === 'err');
  const promote = (i: number) => setRankIdx(p => Math.max(p, Math.min(5, i)));


  // PROPOSTA A — perfis com faixas sobrepostas, garantindo combinações suficientes
  // A single per-operator cycle of accounts, shared by every profile/range and
  // persisted across sessions: an account only returns after all were shown.
  const build = (d: number, profile: Question['profile'], avoid: string[] = [], surge = false): Question => {
    const ownerId = player ? players[player]?.operatorId : undefined;
    const candidates = buildQuestionCandidates(d, DIFF[d].ops, profile, surge) as Question[];
    const question = pickQuestion(candidates, seenFacts.current, avoid, Math.random, reinforceFacts.current);
    saveSeenFacts(ownerId, seenFacts.current);
    saveSeenFacts(ownerId, reinforceFacts.current, 'reinforce');
    recent.current = [...recent.current, question.key].slice(-14);
    return question;
  };

  const roundNo = useRef(0);
  const seenFacts = useRef<Set<string>>(new Set());
  const reinforceFacts = useRef<Set<string>>(new Set());

  const newPair = (d: number) => {
    roundNo.current += 1;
    const surge = roundNo.current % ROUTINE_REINFORCEMENT_INTERVAL === 0;
    const a = build(d, 'routine', [], surge);
    const b = build(d, 'priority', [questionFactKey(a)]);
    setPair([a, b]); setPicked(null); setAns(''); setTmr(DIFF[d].time); setGrace(3);
  };

  const start = async () => {
    const profileId = player ? players[player]?.operatorId : undefined;
    if (!profileId) { setStoreErr(true); return; }
    repository.current ??= new GameRepository();
    try { gameSessionId.current = await repository.current.start(profileId, diff, { version: 1 }); answerSequence.current = 0; }
    catch { setStoreErr(true); return; }
    initA(); const s = DIFF[diff];
    setHeat(s.init); setIntegrity(100); setCoolant(100); setShownTemp(280 + s.init * 4.2); setDelta(0);
    setPts(0); setGoal(LEVEL_GOAL_POINTS); setStrk(0); setBestStrk(0); setRankIdx(0); setScrm(s.scram);
    setVentCd(0); setBoronCd(0); setFrozen(false);
    setTot(0); setCorr(0); setElapsed(0); setFb(null); setEvt(null); setBoom(false); setMelt(0);
    hotRef.current = 0; vel.current = 0; recent.current = []; saved.current = false; roundNo.current = 0;
    seenFacts.current = loadSeenFacts(profileId);
    reinforceFacts.current = loadSeenFacts(profileId, 'reinforce');
    sess.current = { tabs: {}, ops: {}, forms: {}, mistakes: {}, daily: {} };
    newPair(diff); setMode('play');
  };

  const continueGame = () => {
    const nd = Math.min(5, diff + 1), s = DIFF[nd];
    setDiff(nd); setHeat(Math.max(s.init - 10, 5)); setCoolant(c => Math.min(100, c + 25));
    promote(nd - 1); setGoal(g => g + LEVEL_GOAL_POINTS); setScrm(p => p + s.scram);
    setVentCd(0); setBoronCd(0); setFb(null); setMelt(0); vel.current = 0; recent.current = [];
    setEvt(`PROMOÇÃO — ${s.name} | ${TITLES[Math.min(5, nd - 1)]}`); setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
    newPair(nd); setMode('play');
  };

  const addHeat = (v: number) => setHeat(h => frozen && v > 0 ? h : Math.min(100, Math.max(0, h + v)));

  const pick = (i: number) => {
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
    recordAnswer(prob, ok);
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
        scrmSnd(); setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
      }
      newPair(diff);
      setTimeout(() => setFb(null), MIN_VISIBLE_FEEDBACK_MS);
    } else {
      addHeat(prio ? Math.round(DIFF[diff].err * 1.5) : DIFF[diff].err); setStrk(0);
      setFb({ t: 'err', m: `PERGUNTA: ${prob.prompt} · RESPOSTA DADA: ${ans} · CORRETA: ${prob.answer}` }); errSnd(); setAns('');
      setTimeout(() => { setFb(null); newPair(diff); }, MIN_VISIBLE_FEEDBACK_MS);
    }
  };

  const press = (k: string) => {
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
    setEvt('ALÍVIO DE PRESSÃO · −18 CALOR · −12 REFRIGERANTE'); setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
  };
  const doBoron = () => {
    if (boronCd > 0 || integrity <= 5) return;
    setHeat(h => Math.max(0, h - 15));
    setIntegrity(i => Math.max(0, i - 5)); setBoronCd(BORON_CD); setFrozen(true);
    tone(180, .8, 'sine', .25); setTimeout(() => tone(240, .6, 'sine', .2), 300);
    setEvt('INJEÇÃO DE BORO · CALOR CONGELADO POR 8s · −8 INTEGRIDADE'); setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
    if (frz.current) clearTimeout(frz.current);
    frz.current = setTimeout(() => setFrozen(false), FREEZE_MS);
  };
  const doScram = () => {
    if (scrm === 0) return;
    setScrm(s => s - 1); setHeat(h => Math.max(0, h - 70)); setIntegrity(i => Math.max(0, i - 3));
    setCoolant(c => Math.min(100, c + 10));
    setEvt('SCRAM - BARRAS INSERIDAS - -70 CALOR - -3 INTEGRIDADE'); scrmSnd(); setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
    return;
    // Mantido apenas como referência da implementação anterior; o retorno acima
    // garante que o comportamento usado seja o mesmo do bundle original.
    setEvt('SCRAM · BARRAS INSERIDAS · −5 INTEGRIDADE'); scrmSnd(); setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
  };
  const pauseGame = () => {
    stopAlm(); stopGei(); setResumeAvailable(true); setMode('pause');
    if (gameSessionId.current) void repository.current?.pause(gameSessionId.current, snapshot()).catch(() => setStoreErr(true));
  };
  const resumeGame = async () => {
    const operatorId = player ? players[player]?.operatorId : undefined;
    if (!operatorId || !repository.current) { setStoreErr(true); return; }
    try {
      const paused = await repository.current.resume(operatorId);
      if (!paused?.snapshot) { setStoreErr(true); return; }
      const state = paused.snapshot as any;
      gameSessionId.current = paused.id; answerSequence.current = Number(state.tot ?? 0);
      setDiff(Number(state.diff ?? paused.difficulty)); setHeat(Number(state.heat ?? 0)); setIntegrity(Number(state.integrity ?? 100)); setCoolant(Number(state.coolant ?? 100));
      setPts(Number(state.pts ?? 0)); setGoal(Number(state.goal ?? LEVEL_GOAL_POINTS)); setStrk(Number(state.strk ?? 0)); setBestStrk(Number(state.bestStrk ?? 0));
      setScrm(Number(state.scrm ?? DIFF[paused.difficulty].scram)); setElapsed(Number(state.elapsed ?? 0)); setTot(Number(state.tot ?? 0)); setCorr(Number(state.corr ?? 0));
      setPair(Array.isArray(state.pair) ? state.pair : [null, null]); setPicked(state.picked ?? null); setAns(String(state.ans ?? '')); setTmr(Number(state.tmr ?? DIFF[paused.difficulty].time)); setGrace(Number(state.grace ?? 0)); setRankIdx(Number(state.rankIdx ?? 0));
      sess.current = state.sessionStats ?? { tabs: {}, ops: {}, forms: {}, mistakes: {}, daily: {} };
      setResumeAvailable(false); setMode('play');
    } catch { setStoreErr(true); }
  };
  const quit = () => { stopAlm(); stopGei(); setMode('quit'); };

  useEffect(() => {
    if (mode !== 'play') return;
    const onKey = (e: KeyboardEvent) => {
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
    if (heat < 84 && melt > 0) { setMelt(0); setEvt('REATOR RECUPERADO'); setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS); }
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
          if (miss) { bump(miss, false); recordAnswer(miss, false); }
          setFb({ t: 'err', m: miss ? `PERGUNTA: ${miss.prompt} · RESPOSTA DADA: sem resposta · CORRETA: ${miss.answer}` : 'SEM RESPOSTA' });
          tone(250, .25, 'sawtooth', .25);
          setTimeout(() => { setFb(null); newPair(diff); }, MIN_VISIBLE_FEEDBACK_MS);
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
    const iv = setInterval(() => { addHeat(10); setEvt('ANOMALIA NO CIRCUITO PRIMÁRIO'); errSnd(); setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS); }, 25000);
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
        resumeAvailable={resumeAvailable}
        resumeGame={resumeGame}
        storeErr={storeErr}
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
        returnMode={analysisReturnMode}
        resumeAvailable={resumeAvailable}
        resumeGame={resumeGame}
        storeErr={storeErr}
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
        setMode={routeMode}
        resumeAvailable={resumeAvailable}
        resumeGame={resumeGame}
        start={start}
        storeErr={storeErr}
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
        setMode={routeMode}
        resumeAvailable={resumeAvailable}
        resumeGame={resumeGame}
        setPlayer={setPlayer}
        initA={initA}
        bg={bg}
        css={css}
        shellClass={shellClass}
        shellStyle={shellStyle}
        storeErr={storeErr}
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
          setMode={routeMode}
          start={start}
          resumeGame={resumeGame}
          continueGame={continueGame}
          bg={bg}
          css={css}
          shellClass={shellClass}
          shellStyle={shellStyle}
          storeErr={storeErr}
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
        storeErr={storeErr}
      />
      <KeyboardLegendModal visible={showLegend} onClose={() => setShowLegend(false)} context="gameplay" />
    </>
  );
}

// Wrap App with ErrorBoundary to catch runtime errors and prevent white screen
export default function WrappedApp() {
  return (
    <ErrorBoundary>
      <AuthGate>{() => <App />}</AuthGate>
    </ErrorBoundary>
  );
}
