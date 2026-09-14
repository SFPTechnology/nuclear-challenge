import { useState, useCallback, useRef } from 'react';
import { useTurmaRegistry } from './useTurmaRegistry';
import { usePhysics } from './usePhysics';
import { useScore } from './useScore';
import { MIN_VISIBLE_FEEDBACK_MS } from '@constants/timing';
import { buildQuestionCandidates, LEVEL_GOAL_POINTS, LEVEL_QUESTION_RANGES, pickQuestion, questionFactKey, ROUTINE_REINFORCEMENT_INTERVAL } from '@domain/core/QuestionPolicy';

// Constants for game flow
const DIFF = {
  1: { name: 'TRAINEE', sub: 'Primeiro dia', ops: ['*'], range: LEVEL_QUESTION_RANGES[1].routine, time: 35, init: 10, err: 0, ok: -25, passive: 2, interval: 9000, scram: 5 },
  2: { name: 'JÚNIOR', sub: 'Aprendendo', ops: ['*','/'], range: LEVEL_QUESTION_RANGES[2].routine, time: 30, init: 20, err: 15, ok: -20, passive: 3, interval: 8000, scram: 4 },
  3: { name: 'PLENO', sub: 'Turno normal', ops: ['*','/'], range: LEVEL_QUESTION_RANGES[3].routine, time: 25, init: 30, err: 20, ok: -18, passive: 4, interval: 7000, scram: 3 },
  4: { name: 'SÊNIOR', sub: 'Crise nacional', ops: ['*','/'], range: LEVEL_QUESTION_RANGES[4].routine, time: 20, init: 40, err: 25, ok: -15, passive: 5, interval: 6000, scram: 2 },
  5: { name: 'CHERNOBYL', sub: 'Boa sorte...', ops: ['*','/'], range: LEVEL_QUESTION_RANGES[5].routine, time: 12, init: 50, err: 30, ok: -12, passive: 6, interval: 5000, scram: 1, events: true }
};

const VENT_CD = 12, BORON_CD = 30, FREEZE_MS = 14000;

interface Question {
  profile: 'routine' | 'priority';
  surge: boolean;
  prompt: string;
  key: string;
  answer: number;
  full: string;
  sym: '×' | '÷';
  hidden: 'result' | 'left' | 'right';
  factors: number[];
}

interface SessionData {
  tabs: Record<string, { h: number; m: number }>;
  ops: Record<string, { h: number; m: number }>;
  forms: Record<string, { h: number; m: number }>;
  mistakes?: Record<string, { expression: string; errors: number; correct: number; lastSeen: number }>;
  daily: Record<string, any>;
}

interface Feedback {
  t: 'ok' | 'err';
  m: string;
}

export function useGameState(diff: number, setMode: (mode: string) => void, tone: (f: number, dur: number, t?: string, vol?: number) => void, scrmSnd: () => void, promote: (rank: number) => void, initA: () => void) {
  // Call retained for hook-order/side-effect parity; no bindings are consumed here.
  useTurmaRegistry();
  const { heat, setHeat, integrity, setIntegrity, coolant, setCoolant, shownTemp, setShownTemp, delta, setDelta } = usePhysics(30);
  const { pts, setPts, goal, setGoal, strk, setStrk, bestStrk, setBestStrk } = useScore();

  // Game question state
  const [pair, setPair] = useState<[Question | null, Question | null]>([null, null]);
  const [picked, setPicked] = useState<number | null>(null);
  const [grace, setGrace] = useState(0);
  const [ans, setAns] = useState('');
  const [tmr, setTmr] = useState(25);
  const [scrm, setScrm] = useState(3);
  const [ventCd, setVentCd] = useState(0);
  const [boronCd, setBoronCd] = useState(0);
  const [frozen, setFrozen] = useState(false);

  // Game progress tracking
  const [tot, setTot] = useState(0);
  const [corr, setCorr] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [evt, setEvt] = useState<string | null>(null);
  const [melt, setMelt] = useState(0);

  // Refs for internal state
  const roundNo = useRef(0);
  const recent = useRef<string[]>([]);
  const saved = useRef(false);
  const sess = useRef<SessionData>({ tabs: {}, ops: {}, forms: {}, daily: {} });
  const hotRef = useRef(0);
  const vel = useRef(0);
  const frz = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenFacts = useRef<Set<string>>(new Set());
  const reinforceFacts = useRef<Set<string>>(new Set());

  // Helper to track question performance
  const bump = (q: Question, hit: boolean) => {
    const s = sess.current, k = hit ? 'h' : 'm';
    if (!hit) reinforceFacts.current.add(questionFactKey(q));
    q.factors.forEach(f => {
      s.tabs[f] = s.tabs[f] || { h: 0, m: 0 };
      s.tabs[f][k]++;
    });
    s.ops[q.sym] = s.ops[q.sym] || { h: 0, m: 0 };
    s.ops[q.sym][k]++;
    s.forms[q.hidden] = s.forms[q.hidden] || { h: 0, m: 0 };
    s.forms[q.hidden][k]++;
    const mistakes = s.mistakes || (s.mistakes = {});
    const mistake = mistakes[q.full] || { expression: q.full, errors: 0, correct: 0, lastSeen: 0 };
    if (hit) mistake.correct++;
    else mistake.errors++;
    mistake.lastSeen = Date.now();
    mistakes[q.full] = mistake;
  };

  // Each profile/range consumes a shuffled deck of every valid question. A
  // deck is only recreated after every one of its possibilities was shown.
  const build = useCallback((d: number, profile: 'routine' | 'priority', avoid: string[] = [], surge: boolean = false): Question => {
    const operations = DIFF[d as keyof typeof DIFF].ops as Array<'*' | '/'>;
    const candidates = buildQuestionCandidates(d, operations, profile, surge) as Question[];
    const question = pickQuestion(candidates, seenFacts.current, avoid, Math.random, reinforceFacts.current);
    recent.current = [...recent.current, question.key].slice(-14);
    return question;
  }, []);

  const newPair = useCallback((d: number) => {
    roundNo.current += 1;
    const surge = roundNo.current % ROUTINE_REINFORCEMENT_INTERVAL === 0;
    const a = build(d, 'routine', [], surge);
    const b = build(d, 'priority', [questionFactKey(a)]);
    setPair([a, b]);
    setPicked(null);
    setAns('');
    setTmr(DIFF[d as keyof typeof DIFF].time);
    setGrace(3);
  }, [build]);

  const start = useCallback((currentDiff: number) => {
    initA();
    const s = DIFF[currentDiff as keyof typeof DIFF];
    setHeat(s.init);
    setIntegrity(100);
    setCoolant(100);
    setShownTemp(280 + s.init * 4.2);
    setDelta(0);
    setPts(0);
    setGoal(LEVEL_GOAL_POINTS);
    setStrk(0);
    setBestStrk(0);
    promote(0);
    setScrm(s.scram);
    setVentCd(0);
    setBoronCd(0);
    setFrozen(false);
    setTot(0);
    setCorr(0);
    setElapsed(0);
    setFb(null);
    setEvt(null);
    setMelt(0);
    hotRef.current = 0;
    vel.current = 0;
    recent.current = [];
    saved.current = false;
    roundNo.current = 0;
    seenFacts.current = new Set();
    reinforceFacts.current = new Set();
    sess.current = { tabs: {}, ops: {}, forms: {}, mistakes: {}, daily: {} };
    newPair(currentDiff);
    setMode('play');
  }, [initA, newPair, setMode, setHeat, setIntegrity, setCoolant, setShownTemp, setDelta, setPts, setGoal, setStrk, setBestStrk, promote, setScrm]);

  const continueGame = useCallback((currentDiff: number, title: string) => {
    const nd = Math.min(5, currentDiff + 1);
    const s = DIFF[nd as keyof typeof DIFF];
    setHeat(Math.max(s.init - 10, 5));
    setCoolant(c => Math.min(100, c + 25));
    promote(nd - 1);
    setGoal(g => g + LEVEL_GOAL_POINTS);
    setScrm(p => p + s.scram);
    setVentCd(0);
    setBoronCd(0);
    setFb(null);
    setMelt(0);
    vel.current = 0;
    recent.current = [];
    setEvt(`PROMOÇÃO — ${s.name} | ${title}`);
    setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
    newPair(nd);
    setMode('play');
  }, [setMode, setHeat, setCoolant, promote, setGoal, setScrm, newPair]);

  const addHeat = useCallback((v: number) => {
    setHeat(h => frozen && v > 0 ? h : Math.min(100, Math.max(0, h + v)));
  }, [frozen, setHeat]);

  const pick = useCallback((i: number) => {
    const locked = !!(fb && fb.t === 'err');
    if (picked !== null || locked) return;
    setPicked(i);
    setGrace(0);
    if (i === 1) setTmr(_t => Math.max(4, Math.round(DIFF[diff as keyof typeof DIFF].time * .6)));
    tone(880, .05, 'square', .16);
  }, [picked, fb, diff, tone]);

  const check = useCallback((okSnd: () => void, errSnd: () => void, _rankIdx: number) => {
    const prob = pair[picked!];
    // Single guard narrows `prob` to Question for the whole callback.
    if (!ans || !prob) return;
    const ok = parseInt(ans) === prob.answer;
    const prio = prob.profile === 'priority';

    bump(prob, ok);
    setTot(t => t + 1);

    if (ok) {
      const eff = coolant < 40 ? .5 : 1;
      const bonus = Math.min(10, Math.floor(strk / 2) * 2);
      const cool = (prio ? -28 : -12) - bonus;
      setHeat(h => Math.max(0, h + cool * eff));

      const b = Math.floor(strk / 3) * 5;
      const gain = (prio ? 18 : 10) + b;
      const ns = strk + 1;

      setPts(p => p + gain);
      setStrk(ns);
      setBestStrk(x => Math.max(x, ns));
      setCorr(c => c + 1);
      setFb({ t: 'ok', m: `+${gain}` });
      okSnd();

      if (ns % 10 === 0) {
        setHeat(h => Math.max(0, h - 30));
        setCoolant(c => Math.min(100, c + 20));
        setScrm(x => x + 1);
        setPts(p => p + 50);
        promote(Math.floor(ns / 10));
        setEvt(`SEQUÊNCIA DE ${ns} — REFRIGERANTE REPOSTO · +1 SCRAM · +50 PTS`);
        scrmSnd();
        setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
      }

      newPair(diff);
      setTimeout(() => setFb(null), MIN_VISIBLE_FEEDBACK_MS);
    } else {
      addHeat(prio ? Math.round(DIFF[diff as keyof typeof DIFF].err * 1.5) : DIFF[diff as keyof typeof DIFF].err);
      setStrk(0);
      setFb({ t: 'err', m: `PERGUNTA: ${prob.prompt} · RESPOSTA DADA: ${ans} · CORRETA: ${prob.answer}` });
      errSnd();
      setAns('');
      setTimeout(() => {
        setFb(null);
        newPair(diff);
      }, MIN_VISIBLE_FEEDBACK_MS);
    }
  }, [ans, picked, pair, coolant, strk, setHeat, setPts, setStrk, setBestStrk, setCorr, setFb, addHeat, newPair, diff, setCoolant, setScrm, promote, scrmSnd]);

  const press = useCallback((k: string) => {
    const locked = !!(fb && fb.t === 'err');
    if (locked || picked === null) return;
    if (k === 'C') {
      setAns('');
      tone(700, .04, 'square', .12);
      return;
    }
    if (k === '⌫') {
      setAns(a => a.slice(0, -1));
      tone(600, .04, 'square', .12);
      return;
    }
    if (ans.length >= 4) return;
    setAns(a => a + k);
    tone(1000, .03, 'square', .1);
  }, [fb, picked, ans, tone]);

  const doVent = useCallback(() => {
    if (ventCd > 0 || coolant < 8) return;
    setHeat(h => Math.max(0, h - 32));
    setCoolant(c => Math.max(0, c - 8));
    setVentCd(VENT_CD);
    tone(320, .5, 'sawtooth', .2);
    setTimeout(() => tone(260, .4, 'sawtooth', .15), 200);
    setEvt('ALÍVIO DE PRESSÃO · −18 CALOR · −12 REFRIGERANTE');
    setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
  }, [ventCd, coolant, setHeat, setCoolant, tone]);

  const doBoron = useCallback(() => {
    if (boronCd > 0 || integrity <= 5) return;
    setHeat(h => Math.max(0, h - 15));
    setIntegrity(i => Math.max(0, i - 5));
    setBoronCd(BORON_CD);
    setFrozen(true);
    tone(180, .8, 'sine', .25);
    setTimeout(() => tone(240, .6, 'sine', .2), 300);
    setEvt('INJEÇÃO DE BORO · CALOR CONGELADO POR 8s · −8 INTEGRIDADE');
    setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
    if (frz.current) clearTimeout(frz.current);
    frz.current = setTimeout(() => setFrozen(false), FREEZE_MS);
  }, [boronCd, integrity, setHeat, setIntegrity, tone]);

  const doScram = useCallback(() => {
    if (scrm === 0) return;
    setScrm(s => s - 1);
    setHeat(h => Math.max(0, h - 70));
    setIntegrity(i => Math.max(0, i - 3));
    setCoolant(c => Math.min(100, c + 10));
    setEvt('SCRAM - BARRAS INSERIDAS - -70 CALOR - -3 INTEGRIDADE');
    scrmSnd();
    setTimeout(() => setEvt(null), MIN_VISIBLE_FEEDBACK_MS);
  }, [scrm, setHeat, setIntegrity, setCoolant, scrmSnd]);

  const prob = picked === null ? null : pair[picked];

  return {
    // Game state
    pair, setPair, picked, setPicked, grace, setGrace, ans, setAns,
    tmr, setTmr, scrm, setScrm, ventCd, setVentCd, boronCd, setBoronCd,
    frozen, setFrozen, tot, setTot, corr, setCorr, elapsed, setElapsed,
    fb, setFb, evt, setEvt, melt, setMelt,
    // Refs
    sess, recent,
    // From hooks
    heat, setHeat, integrity, setIntegrity, coolant, setCoolant, shownTemp, setShownTemp, delta, setDelta,
    pts, setPts, goal, setGoal, strk, setStrk, bestStrk, setBestStrk,
    // Functions
    newPair, start, continueGame, pick, check, press,
    doVent, doBoron, doScram, addHeat,
    prob
  };
}
