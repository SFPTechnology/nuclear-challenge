interface OperatorExclusionDialogProps {
  operatorName: string;
  operatorId: string;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}

export function OperatorExclusionDialog({
  operatorName,
  operatorId,
  onConfirm,
  onCancel,
}: OperatorExclusionDialogProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-labelledby="exclusion-title"
        aria-describedby="exclusion-description"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: '400px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 id="exclusion-title" style={{ marginTop: 0, color: '#dc2626' }}>
          🗑️ Remover Operador
        </h2>

        <p id="exclusion-description" style={{ color: '#6b7280' }}>
          Tem certeza que deseja remover <strong>{operatorName}</strong> da turma?
        </p>

        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
          ⚠️ <strong>Aviso:</strong> Os dados do operador serão removidos permanentemente e não poderão ser recuperados.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={onCancel}
            aria-label="Cancelar remoção de operador"
            style={{
              flex: 1,
              padding: '0.625rem 1.25rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Cancelar
          </button>

          <button
            onClick={() => onConfirm(operatorId)}
            aria-label="Confirmar remoção de operador"
            style={{
              flex: 1,
              padding: '0.625rem 1.25rem',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Remover
          </button>
        </div>
      </div>
    </>
  );
}
