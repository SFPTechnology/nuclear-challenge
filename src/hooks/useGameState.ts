import { useState, useCallback, useRef } from 'react';
import { useTurmaRegistry } from './useTurmaRegistry';
import { usePhysics } from './usePhysics';
import { useScore } from './useScore';

// Constants for game flow
const DIFF = {
  1: { name: 'TRAINEE', sub: 'Primeiro dia', ops: ['*'], range: [2,5], time: 35, init: 10, err: 0, ok: -25, passive: 2, interval: 9000, scram: 5 },
  2: { name: 'JÚNIOR', sub: 'Aprendendo', ops: ['*','/'], range: [2,7], time: 30, init: 20, err: 15, ok: -20, passive: 3, interval: 8000, scram: 4 },
  3: { name: 'PLENO', sub: 'Turno normal', ops: ['*','/'], range: [2,10], time: 25, init: 30, err: 20, ok: -18, passive: 4, interval: 7000, scram: 3 },
  4: { name: 'SÊNIOR', sub: 'Crise nacional', ops: ['*','/'], range: [2,12], time: 20, init: 40, err: 25, ok: -15, passive: 5, interval: 6000, scram: 2 },
  5: { name: 'CHERNOBYL', sub: 'Boa sorte...', ops: ['*','/'], range: [3,15], time: 12, init: 50, err: 30, ok: -12, passive: 6, interval: 5000, scram: 1, events: true }
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
  daily: Record<string, any>;
}

interface Feedback {
  t: 'ok' | 'err';
  m: string;
}

export function useGameState(diff: number, setMode: (mode: string) => void, tone: (f: number, dur: number, t?: string, vol?: number) => void, scrmSnd: () => void, promote: (rank: number) => void, initA: () => void) {
  const { players, player, setPlayers } = useTurmaRegistry();
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

  // Helper to track question performance
  const bump = (q: Question, hit: boolean) => {
    const s = sess.current, k = hit ? 'h' : 'm';
    q.factors.forEach(f => {
      s.tabs[f] = s.tabs[f] || { h: 0, m: 0 };
      s.tabs[f][k]++;
    });
    s.ops[q.sym] = s.ops[q.sym] || { h: 0, m: 0 };
    s.ops[q.sym][k]++;
    s.forms[q.hidden] = s.forms[q.hidden] || { h: 0, m: 0 };
    s.forms[q.hidden][k]++;
  };

  // Question generation
  const makeOne = useCallback((d: number, profile: 'routine' | 'priority', surge: boolean = false): Question => {
    const s = DIFF[d as keyof typeof DIFF];
    const op = s.ops[Math.floor(Math.random() * s.ops.length)];
    const [lo, hi] = s.range, span = hi - lo;
    const useHigh = profile === 'priority' || surge;
    const [mn, mx] = d === 1
      ? (useHigh ? [6, 10] : [2, 7])
      : useHigh
        ? [Math.min(hi - 1, Math.round(lo + span * .35)), hi]
        : [lo, Math.max(lo + 1, Math.round(lo + span * .65))];

    let a, b, r, sym: '×' | '÷';
    if (op === '*') {
      a = Math.floor(Math.random() * (mx - mn + 1)) + mn;
      b = Math.floor(Math.random() * (mx - mn + 1)) + mn;
      r = a * b;
      sym = '×';
    } else {
      b = Math.floor(Math.random() * (mx - mn + 1)) + mn;
      r = Math.floor(Math.random() * (mx - mn + 1)) + mn;
      a = b * r;
      sym = '÷';
    }

    const slots = d <= 2 ? ['result'] : profile === 'routine' ? ['result', 'result', 'right'] : ['result', 'left', 'right'];
    const hidden = slots[Math.floor(Math.random() * slots.length)] as 'result' | 'left' | 'right';
    const prompt = hidden === 'result' ? `${a} ${sym} ${b} = ?` : hidden === 'left' ? `? ${sym} ${b} = ${r}` : `${a} ${sym} ? = ${r}`;

    return {
      profile,
      surge,
      prompt,
      key: `${a}${sym}${b}${hidden}`,
      answer: hidden === 'result' ? r : hidden === 'left' ? a : b,
      full: `${a} ${sym} ${b} = ${r}`,
      sym,
      hidden,
      factors: sym === '×' ? [a, b] : [b, r]
    };
  }, []);

  const build = useCallback((d: number, profile: 'routine' | 'priority', avoid: string[] = [], surge: boolean = false): Question => {
    let q: Question | null = null;
    for (let i = 0; i < 25; i++) {
      q = makeOne(d, profile, surge);
      if (!recent.current.includes(q.key) && !avoid.includes(q.key)) break;
    }
    if (q) {
      recent.current = [...recent.current, q.key].slice(-14);
    }
    return q!;
  }, [makeOne]);

  const newPair = useCallback((d: number) => {
    roundNo.current += 1;
    const surge = (d === 1 && roundNo.current % 3 === 0) || (d === 2 && roundNo.current % 4 === 0);
    const a = build(d, 'routine', [], surge);
    const b = build(d, 'priority', [a.key]);
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
    setGoal(1000);
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
    sess.current = { tabs: {}, ops: {}, forms: {}, daily: {} };
    newPair(currentDiff);
    setMode('play');
  }, [initA, newPair, setMode, setHeat, setIntegrity, setCoolant, setShownTemp, setDelta, setPts, setGoal, setStrk, setBestStrk, promote, setScrm]);

  const continueGame = useCallback((currentDiff: number, title: string) => {
    const nd = Math.min(5, currentDiff + 1);
    const s = DIFF[nd as keyof typeof DIFF];
    setHeat(Math.max(s.init - 10, 5));
    setCoolant(c => Math.min(100, c + 25));
    promote(nd - 1);
    setGoal(g => g + 1000);
    setScrm(p => p + s.scram);
    setVentCd(0);
    setBoronCd(0);
    setFb(null);
    setMelt(0);
    vel.current = 0;
    recent.current = [];
    setEvt(`PROMOÇÃO — ${s.name} | ${title}`);
    setTimeout(() => setEvt(null), 3000);
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

  const check = useCallback((okSnd: () => void, errSnd: () => void, rankIdx: number) => {
    if (!ans || !pair[picked!]) return;
    const prob = pair[picked!];
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
        setTimeout(() => setEvt(null), 3000);
      }

      newPair(diff);
      setTimeout(() => setFb(null), 900);
    } else {
      addHeat(prio ? Math.round(DIFF[diff as keyof typeof DIFF].err * 1.5) : DIFF[diff as keyof typeof DIFF].err);
      setStrk(0);
      setFb({ t: 'err', m: prob.full });
      errSnd();
      setAns('');
      setTimeout(() => {
        setFb(null);
        newPair(diff);
      }, 1400);
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
    setTimeout(() => setEvt(null), 1800);
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
    setTimeout(() => setEvt(null), 2200);
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
    setTimeout(() => setEvt(null), 2000);
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
