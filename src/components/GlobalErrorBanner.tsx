import { tokens } from '@design/tokens';

export interface GlobalErrorBannerProps {
  visible?: boolean;
  message?: string;
}

export function GlobalErrorBanner({ visible, message }: GlobalErrorBannerProps = {}) {
  if (!visible) return null;
  return (
    <div role="alert" aria-live="assertive" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'linear-gradient(to bottom, rgba(239,68,68,.15), transparent)', borderBottom: '1px solid rgba(239,68,68,.5)', padding: '10px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: tokens.typography.fontSize['0.5xs'], lineHeight: tokens.typography.lineHeight.snug, color: '#fecaca', fontWeight: 'bold', overflowWrap: 'anywhere' }}>
        {message ?? '⚠ FALHA DE ARMAZENAMENTO: Dados podem não ser salvos'}
      </div>
      <div style={{ fontSize: tokens.typography.fontSize.micro, lineHeight: tokens.typography.lineHeight.snug, color: '#fed7aa', marginTop: 4, overflowWrap: 'anywhere' }}>
        Recarregue a página para tentar reconectar ao armazenamento
      </div>
      <button type="button" onClick={() => window.location.reload()} aria-label="Tentar reconectar ao armazenamento" style={{ marginTop: 7, minHeight: 40, padding: '7px 14px', borderRadius: 4, border: '1px solid rgba(254,202,202,.65)', background: '#450a0a', color: '#fee2e2', fontSize: tokens.typography.fontSize.micro, fontWeight: 'bold', letterSpacing: tokens.typography.letterSpacing.label, cursor: 'pointer' }}>
        TENTAR NOVAMENTE
      </button>
    </div>
  );
}
