import { useState, useCallback, useRef } from 'react';

export function useAudio() {
  const [snd, setSnd] = useState(true);
  const ctx = useRef<AudioContext | null>(null);
  const alm = useRef<ReturnType<typeof setInterval> | null>(null);
  const gei = useRef<ReturnType<typeof setInterval> | null>(null);

  const initA = useCallback(() => {
    if (!ctx.current) {
      ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctx.current.state === 'suspended') {
      ctx.current.resume();
    }
  }, []);

  const tone = useCallback((f: number, dur: number, t: string = 'sine', vol: number = 0.25) => {
    if (!ctx.current || !snd) return;
    const c = ctx.current;
    if (c.state === 'suspended') c.resume();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = t as OscillatorType;
    o.frequency.value = f;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  }, [snd]);

  const okSnd = useCallback(() => {
    tone(523, 0.1);
    setTimeout(() => tone(659, 0.1), 80);
    setTimeout(() => tone(784, 0.12), 160);
  }, [tone]);

  const errSnd = useCallback(() => {
    tone(180, 0.18, 'sawtooth', 0.3);
    setTimeout(() => tone(120, 0.22, 'sawtooth', 0.3), 120);
  }, [tone]);

  const scrmSnd = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => tone(800 - i * 100, 0.08, 'square', 0.22), i * 70);
    }
  }, [tone]);

  const boomSnd = useCallback(() => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => tone(30 + Math.random() * 40, 0.4, 'sawtooth', 0.45), i * 70);
    }
  }, [tone]);

  const startAlm = useCallback((h: number) => {
    if (alm.current) clearInterval(alm.current);
    if (h < 55 || !snd) return;
    const f = h > 80 ? 880 : 660;
    const sp = h > 80 ? 180 : 340;
    alm.current = setInterval(
      () => tone(f, 0.08, h > 80 ? 'sawtooth' : 'sine', 0.1),
      sp
    );
  }, [tone, snd]);

  const stopAlm = useCallback(() => {
    if (alm.current) {
      clearInterval(alm.current);
      alm.current = null;
    }
  }, []);

  const startGei = useCallback((h: number) => {
    if (gei.current) clearInterval(gei.current);
    if (h < 40 || !snd) return;
    gei.current = setInterval(() => {
      if (Math.random() < 0.5) {
        tone(1400 + Math.random() * 700, 0.012, 'square', 0.04);
      }
    }, Math.max(60, 500 - h * 4));
  }, [tone, snd]);

  const stopGei = useCallback(() => {
    if (gei.current) {
      clearInterval(gei.current);
      gei.current = null;
    }
  }, []);

  return {
    snd, setSnd,
    initA, tone, okSnd, errSnd, scrmSnd, boomSnd,
    startAlm, stopAlm, startGei, stopGei
  };
}
