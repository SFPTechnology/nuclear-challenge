import React from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, Droplets, Zap, HeartPulse, Wind, FlaskConical, Shield } from 'lucide-react';
import { tokens } from '@design/tokens';
import { Ambient } from './Ambient';
import { CoreGauge } from './CoreGauge';
import { EmptyState } from './EmptyState';
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

const FEEDBACK_FONT_SIZE = 12;

function getFeedbackLines(message: string): string[] {
  const match = /^PERGUNTA: (.+) · RESPOSTA DADA: (.+) · CORRETA: (.+)$/.exec(message);

  return match
    ? [`PERGUNTA: ${match[1]}`, `RESPOSTA DADA: ${match[2]}`, `CORRETA: ${match[3]}`]
    : [message];
}

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
  storeErr: boolean;
}

export function GamePlayPanel({
  heat, integrity, coolant, melt, evt, shownTemp, delta, frozen,
  rank, snd, initA, setSnd, st, power,
  ventCd, VENT_CD, boronCd, BORON_CD, scrm, doVent, doBoron, doScram,
  picked, locked, grace, pair, pick, prob, fb, ringPct, ringCol, ans, check, press,
  pts, goal, strk, elapsed, pauseGame, quit, shakeCls, bg, css, shellClass, shellStyle, storeErr
}: GamePlayPanelProps) {
  // UX-D10: the question pair is generated per round. If generation ever yields
  // nothing (and no problem is already in flight), the player would face an
  // empty console with no explanation — surface an empty state instead.
  const hasQuestions = Boolean(prob) || (Array.isArray(pair) && pair.some(Boolean));
  const feedbackLines = locked && fb?.m ? getFeedbackLines(fb.m) : [];
  // Guards the SAIR button against accidental taps: quitting ends the match.
  const [confirmQuit, setConfirmQuit] = React.useState(false);
  const stayRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (!confirmQuit) return;
    stayRef.current?.focus();
    // Capture phase: keeps gameplay shortcuts (digits, Enter, Esc) from firing behind the dialog.
    const onKey = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      if (e.key === 'Escape') setConfirmQuit(false);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [confirmQuit]);

  return (
    <div className={`nc-viewport min-h-screen p-2 ${shakeCls}`} style={bg}>{css}
      <GlobalErrorBanner visible={storeErr} />
      {confirmQuit && createPortal(
        // Portal + inline positioning: ancestors with transforms (shake) would otherwise offset a fixed overlay.
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 60, background: 'rgba(0,0,0,.72)' }} onClick={() => setConfirmQuit(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="quit-confirm-title"
            aria-describedby="quit-confirm-desc"
            data-testid="quit-confirm-dialog"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 320, padding: 16, borderRadius: tokens.borderRadius.md, background: 'linear-gradient(180deg,#1e2530,#12171d)', border: '1px solid #7f1d1d', boxShadow: '0 0 18px rgba(239,68,68,.35)' }}
          >
            <div id="quit-confirm-title" className="font-bold text-center" style={{ fontSize: tokens.typography.fontSize.base, color: '#fecaca', letterSpacing: tokens.typography.letterSpacing.wide }}>⚠️ SAIR DA PARTIDA?</div>
            <div id="quit-confirm-desc" className="text-center" style={{ marginTop: 8, fontSize: tokens.typography.fontSize.xs0, color: '#cbd5e1', lineHeight: tokens.typography.lineHeight.snug }}>
              A partida será encerrada e o progresso deste turno não poderá ser retomado. Para continuar depois, use PAUSAR.
            </div>
            <div className="flex gap-2" style={{ marginTop: 14 }}>
              <button ref={stayRef} type="button" onClick={() => setConfirmQuit(false)} data-testid="quit-cancel" style={{ flex: 1, minHeight: 44, borderRadius: tokens.borderRadius.md, border: '1px solid #0e7490', background: 'linear-gradient(180deg,#0e7490,#155e75)', color: '#e0f2fe', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold }}>CONTINUAR</button>
              <button type="button" onClick={() => { setConfirmQuit(false); quit(); }} data-testid="quit-confirm" style={{ flex: 1, minHeight: 44, borderRadius: tokens.borderRadius.md, border: '1px solid #7f1d1d', background: 'linear-gradient(180deg,#7f1d1d,#450a0a)', color: '#fecaca', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold }}>SAIR</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
      <Ambient heat={heat} />
      {melt > 0 && <PreMelt secs={melt} />}
      {evt && <div className="fixed top-1 left-1/2 rounded font-bold" role="alert" aria-live="assertive" style={{ transform: 'translateX(-50%)', zIndex: 50, width: 'fit-content', maxWidth: 'calc(100% - 24px)', padding: '7px 12px', fontSize: tokens.typography.fontSize.tinyL, lineHeight: tokens.typography.lineHeight.snug, letterSpacing: tokens.typography.letterSpacing.label, textAlign: 'center', overflowWrap: 'anywhere', background: 'linear-gradient(180deg,#1e2530,#12171d)', border: '1px solid #0891b2', color: tokens.visual.status.info, boxShadow: '0 0 16px rgba(6,182,212,.4)' }}>{evt}</div>}

      <div className={`${shellClass} mx-auto`} style={shellStyle}>
        <Plate className="px-2 py-1 mb-1.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 12 }}>☢️</span>
              <span className="font-bold" style={{ fontSize: tokens.typography.fontSize.xs0, letterSpacing: '.15em', color: '#cbd5e1' }}>UN-01</span>
              <span className="rounded" style={{ padding: '1px 5px', fontSize: tokens.typography.fontSize.micro, background: '#0a1418', boxShadow: DS.recess, color: '#7dd3fc' }}>{rank}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { initA(); setSnd(!snd); }} aria-label={snd ? 'Desativar som' : 'Ativar som'} aria-pressed={snd} style={{ minWidth: 30, minHeight: 30, display: 'grid', placeItems: 'center', borderRadius: tokens.borderRadius.sm, background: '#1a2026', border: '1px solid #303943' }}>{snd ? <Volume2 size={13} color="#c5cdd8" /> : <VolumeX size={13} color="#c5cdd8" />}</button>
              <div className="rounded font-bold" style={{ padding: '3px 8px', fontSize: tokens.typography.fontSize.tiny, letterSpacing: '.08em', background: `linear-gradient(180deg,${st.c}dd,${st.c}77)`, color: '#0a0c0e', boxShadow: `0 0 10px ${st.c}88` }}>{st.t}</div>
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

        {!hasQuestions ? (
          <div className="mb-1.5">
            <EmptyState
              icon="⚛️"
              title="Sessão sem questões"
              description="Nenhuma operação foi gerada para este turno. Saia e inicie a partida novamente."
              actionLabel="Sair da partida"
              onAction={quit}
              size="sm"
              testId="empty-state-gameplay"
            />
          </div>
        ) : picked === null && !locked ? (
          <Plate className="p-2 mb-1.5" role="region" aria-label="Seleção de operação">
            <div className="text-center mb-1.5" role="alert"><Label>Selecione a operação {grace > 0 ? `· ${grace}s` : ''}</Label></div>
            <div className="flex gap-1.5">
              {pair.map((p, i) => p && (
                <button key={i} onClick={() => pick(i)} aria-label={`Selecionar operação ${p.profile === 'routine' ? 'rotina' : 'prioritária'}: ${p.prompt}`} style={{ flex: 1, borderRadius: 6, padding: '8px 4px',
                  background: 'linear-gradient(180deg,#0a1418,#050b0e)',
                  border: `1.5px solid ${i === 0 ? (p.surge ? '#a16207' : '#0e7490') : '#b45309'}`,
                  boxShadow: `${DS.recess}, 0 0 10px ${i === 0 ? (p.surge ? 'rgba(161,98,7,.3)' : 'rgba(6,182,212,.25)') : 'rgba(245,158,11,.25)'}` }}>
                  <div style={{ fontSize: tokens.typography.fontSize.xs1, letterSpacing: '.12em', color: i === 0 ? (p.surge ? '#fcd34d' : '#67e8f9') : '#fbbf24', fontWeight: 'bold' }}>
                    {i === 0 ? (p.surge ? 'ROTINA ⚡ REFORÇADA' : 'ROTINA') : 'PRIORITÁRIA'}
                  </div>
                  <div className="font-mono font-bold my-1" style={{ fontSize: tokens.typography.fontSize.lg_, color: '#e0f2fe' }}>{p.prompt}</div>
                  <div style={{ fontSize: tokens.typography.fontSize.xs1, color: i === 0 ? '#155e75' : '#92400e' }}>
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
                ? <text x="20" fill="#f87171" fontSize={FEEDBACK_FONT_SIZE} fontFamily="monospace" fontWeight="bold">
                    {feedbackLines.map((line, index) => <tspan key={line} x="20" y={21 + index * 14}>{index === 0 ? `✕ ${line}` : line}</tspan>)}
                  </text>
                : <text x="125" y="40" textAnchor="middle" fill="#e0f2fe" fontSize="23" fontFamily="monospace" fontWeight="bold">{prob ? prob.prompt : ''}</text>}
            </svg>
            {prob && !locked && <div className="text-center" style={{ fontSize: tokens.typography.fontSize.xs1, letterSpacing: '.1em', color: prob.profile === 'routine' ? '#67e8f9' : '#fbbf24', marginTop: -2 }}>{prob.profile === 'routine' ? 'ROTINA · −12' : 'PRIORITÁRIA · −28'}</div>}
            <div className="flex gap-1.5 mt-1.5">
              <div className="flex-1 rounded text-center font-mono font-bold flex items-center justify-center" style={{ minHeight: 36, fontSize: tokens.typography.fontSize.xl, background: 'linear-gradient(180deg,#0a1418,#050b0e)', boxShadow: DS.recess, color: ans ? '#7dd3fc' : '#1e3a45', border: '1px solid #1c2126', letterSpacing: '.1em' }} aria-live="polite" aria-label={`Resposta atual: ${ans || 'vazio'}`}>{ans || '—'}</div>
              <button onClick={check} disabled={locked || !ans} className="rounded font-bold" aria-label={`Confirmar resposta ${ans || 'vazia'}`} style={{ padding: '0 18px', fontSize: tokens.typography.fontSize.xs, background: locked || !ans ? 'linear-gradient(180deg,#2a2f35,#1a1e23)' : 'linear-gradient(180deg,#0e7490,#0c4a5e)', boxShadow: locked || !ans ? 'inset 0 2px 5px #000' : '0 1px 0 rgba(255,255,255,.18) inset,0 3px 5px #000', color: locked || !ans ? '#4b5563' : '#e0f2fe', border: '1px solid #083344' }}>OK</button>
            </div>
            {fb && fb.t === 'ok' && <div className="text-center font-bold mt-1" role="alert" aria-live="polite" style={{ fontSize: tokens.typography.fontSize.xs0, color: '#4ade80' }}>✅ {fb.m}</div>}
          </Plate>
        )}

        <Plate className="p-1.5 mb-1.5">
          <div className="grid grid-cols-3 gap-1">
            {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(k => {
              const off = locked || picked === null;
              return (
                <button key={k} onClick={() => press(k)} disabled={off} aria-label={k === 'C' ? 'Limpar entrada' : k === '⌫' ? 'Remover último dígito' : `Dígito ${k}`} style={{ padding: '8px 0', borderRadius: 5, fontSize: tokens.typography.fontSize.base, fontWeight: 'bold', fontFamily: 'monospace',
                  background: off ? 'linear-gradient(180deg,#22272d,#171b1f)' : k === 'C' ? 'linear-gradient(180deg,#7f1d1d,#450a0a)' : k === '⌫' ? 'linear-gradient(180deg,#3f464e,#23282e)' : 'linear-gradient(180deg,#454d56,#2a3037 55%,#1f242a)',
                  boxShadow: off ? 'inset 0 2px 4px #000' : '0 1px 0 rgba(255,255,255,.16) inset,0 3px 5px rgba(0,0,0,.7)',
                  border: '1px solid #14181c', color: off ? '#3f464e' : k === 'C' ? '#fecaca' : '#e2e8f0' }}>{k}</button>
              );
            })}
          </div>
        </Plate>

        <div className="grid grid-cols-5 gap-1 items-stretch" aria-label="Controles e métricas da sessão">
          <PauseButton onClick={pauseGame} />
          <button
            type="button"
            onClick={() => setConfirmQuit(true)}
            aria-label="Sair da partida"
            aria-haspopup="dialog"
            data-testid="game-quit-button"
            className="transition-transform active:translate-y-px"
            style={{
              width: '100%',
              minWidth: 0,
              minHeight: 48,
              padding: '8px 10px',
              borderRadius: tokens.borderRadius.md,
              border: '1px solid #7f1d1d',
              background: 'linear-gradient(180deg,#7f1d1d,#450a0a 55%,#2a0808)',
              boxShadow: '0 1px 0 rgba(255,255,255,.16) inset,0 3px 5px rgba(0,0,0,.7)',
              color: '#fecaca',
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold,
              letterSpacing: tokens.typography.letterSpacing.wide,
            }}
          >
            SAIR
          </button>
          {([['META', `${pts}/${goal}`, '#7dd3fc'], ['SEQ', String(strk), '#fbbf24'], ['TEMPO', `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`, '#cbd5e1']] as Array<[string, string, string]>).map(([l, v, c], i) => (
            <div key={i} style={{ minWidth: 0 }}>
              <Plate className="h-full px-1 py-1.5 text-center">
                <div style={{ fontSize: tokens.typography.fontSize.micro, color: '#a1aab8', fontWeight: tokens.typography.fontWeight.bold, letterSpacing: tokens.typography.letterSpacing.wide }}>{l}</div>
                <div className="font-mono font-bold" style={{ fontSize: tokens.typography.fontSize.xs, color: c, lineHeight: tokens.typography.lineHeight.tight, textShadow: '0 0 8px currentColor' }}>{v}</div>
              </Plate>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
