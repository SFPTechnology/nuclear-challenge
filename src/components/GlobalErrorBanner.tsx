import { tokens } from '@design/tokens';

export interface GlobalErrorBannerProps {
  visible?: boolean;
  message?: string;
}

export function GlobalErrorBanner({ visible, message }: GlobalErrorBannerProps = {}) {
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'linear-gradient(to bottom, rgba(239,68,68,.15), transparent)', borderBottom: '1px solid rgba(239,68,68,.5)', padding: '8px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: tokens.typography.fontSize['0.5xs'], color: '#fecaca', fontWeight: 'bold' }}>{message ?? '⚠ FALHA DE ARMAZENAMENTO: Dados podem não ser salvos'}</div>
      <div style={{ fontSize: tokens.typography.fontSize.micro, color: '#fed7aa', marginTop: 2 }}>Recarregue a página para tentar reconectar ao armazenamento</div>
    </div>
  );
}
