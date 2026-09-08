import React from 'react';
import { Volume2, VolumeX, Droplets, Zap, HeartPulse, Wind, FlaskConical, Shield } from 'lucide-react';
import { Ambient } from './Ambient';
import { CoreGauge } from './CoreGauge';
import { GlobalErrorBanner } from './GlobalErrorBanner';
import { Label } from './Label';
import { Lamp } from './Lamp';
import { Plate } from './Plate';
import { PauseButton } from './PauseButton';
import { PreMelt } from './PreMelt';
import { Support } from './Support';
import { Valve } from './Valve';

const DS = {
  recess: 'inset 0 3px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06)',
};

interface GamePlayPanelProps {
  heat: number;
  integrity: number;
  coolant: number;
  melt: number;
  evt: string | null;
  shownTemp: number;
  delta: number;
  frozen: boolean;
  rank: string;
  snd: boolean;
  initA: () => void;
  setSnd: (val: boolean) => void;
  st: { t: string; c: string };
  power: number;
  ventCd: number;
  VENT_CD: number;
  boronCd: number;
  BORON_CD: number;
  scrm: number;
  doVent: () => void;
  doBoron: () => void;
  doScram: () => void;
  picked: number | null;
  locked: boolean;
  grace: number;
  pair: any[];
  pick: (i: number) => void;
  prob: any;
  fb: any;
  ringPct: number;
  ringCol: string;
  ans: string;
  check: () => void;
  press: (k: string) => void;
  pts: number;
  goal: number;
  strk: number;
  elapsed: number;
  pauseGame: () => void;
  quit: () => void;
  shakeCls: string;
  bg: React.CSSProperties;
  css: React.ReactNode;
  shellClass: string;
  shellStyle: React.CSSProperties;
}

export function GamePlayPanel({
  heat, integrity, coolant, melt, evt, shownTemp, delta, frozen,
  rank, snd, initA, setSnd, st, power,
  ventCd, VENT_CD, boronCd, BORON_CD, scrm, doVent, doBoron, doScram,
  picked, locked, grace, pair, pick, prob, fb, ringPct, ringCol, ans, check, press,
  pts, goal, strk, elapsed, pauseGame, quit, shakeCls, bg, css, shellClass, shellStyle
}: GamePlayPanelProps) {
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
