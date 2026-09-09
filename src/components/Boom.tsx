import React, { useState, useEffect } from 'react';
import { tokens } from '@design/tokens';

interface BoomProps {
  onDone: () => void;
}

export function Boom({ onDone }: BoomProps) {
  const [dots, setDots] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      setTimeout(() => {
        setStep(3);
        setTimeout(onDone, 1500);
      }, 500);
      return;
    }

    const d = [];
    for (let i = 0; i < 50; i++) {
      const a = (Math.PI * 2 * i) / 50;
      d.push({
        id: i,
        x: 50,
        y: 50,
        vx: Math.cos(a) * (80 + Math.random() * 150),
        vy: Math.sin(a) * (80 + Math.random() * 150),
        s: 4 + Math.random() * 12,
        c: ['#f50', '#f80', '#fa0', '#ff0', '#f00'][i % 5],
        l: 1,
      });
    }
    setDots(d);
    setTimeout(() => setStep(1), 80);
    setTimeout(() => setStep(2), 400);
    setTimeout(() => setStep(3), 1200);
    setTimeout(onDone, 4000);
  }, [onDone, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const iv = setInterval(
      () =>
        setDots((p) =>
          p
            .map((d) => ({
              ...d,
              x: d.x + d.vx * 0.018,
              y: d.y + d.vy * 0.018 + 0.8,
              l: d.l - 0.012,
            }))
            .filter((d) => d.l > 0)
        ),
      18
    );
    return () => clearInterval(iv);
  }, [prefersReducedMotion]);

  const baseBg = prefersReducedMotion
    ? '#333'
    : step < 1
      ? '#fff'
      : 'radial-gradient(circle at 50% 50%,#f50 0%,#800 30%,#000 70%)';

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ zIndex: 60 }}>
      {!prefersReducedMotion && step < 1 && <div className="absolute inset-0 bg-white" />}
      <div className="absolute inset-0" style={{ background: baseBg }}>
        {!prefersReducedMotion &&
          dots.map((d) => (
            <div
              key={d.id}
              className="absolute rounded-full"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: d.s * d.l,
                height: d.s * d.l,
                background: d.c,
                opacity: d.l,
                boxShadow: `0 0 ${d.s}px ${d.c}`,
                transform: 'translate(-50%,-50%)',
              }}
            />
          ))}
      </div>
      {!prefersReducedMotion && step >= 2 && (
        <div
          className="absolute left-1/2 top-1/2"
          style={{ transform: 'translate(-50%,-50%)' }}
        >
          <div
            style={{
              width: 96,
              height: 144,
              borderRadius: '50% 50% 0 0',
              background: 'linear-gradient(to top,#420,#f60,#fc0)',
              boxShadow: '0 0 80px 40px rgba(255,100,0,.5)',
            }}
          />
        </div>
      )}
      {step >= 3 && (
        <div
          className="absolute inset-x-0 text-center"
          style={{ bottom: 64 }}
        >
          <h1
            className="font-bold text-red-500"
            style={{ fontSize: tokens.typography.fontSize['3xl'], textShadow: '0 0 15px #f00' }}
          >
            ☢️ MELTDOWN ☢️
          </h1>
          <p
            className="text-orange-400 mt-1"
            style={{ fontSize: tokens.typography.fontSize.xs, letterSpacing: '.15em' }}
          >
            FALHA CATASTRÓFICA
          </p>
        </div>
      )}
    </div>
  );
}
