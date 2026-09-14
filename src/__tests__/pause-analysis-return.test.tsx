import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useUIState } from '@hooks/useUIState';

afterEach(cleanup);

function NavigationProbe() {
  const { mode, setMode, openAnalysis, analysisReturnMode } = useUIState();

  return (
    <div>
      <output role="status" aria-label="modo atual">{mode}</output>
      <button onClick={() => setMode('pause')}>Pausar</button>
      <button onClick={() => openAnalysis(mode === 'pause' ? 'pause' : 'menu')}>Abrir análise</button>
      <button onClick={() => setMode(analysisReturnMode)}>Voltar</button>
    </div>
  );
}

describe('pause to analysis navigation', () => {
  it('returns to the paused turn instead of losing the game context', () => {
    render(<NavigationProbe />);

    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir análise' }));
    expect(screen.getByRole('status', { name: 'modo atual' }).textContent).toBe('analise');

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getByRole('status', { name: 'modo atual' }).textContent).toBe('pause');
  });
});
