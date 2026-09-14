/**
 * Empty States — UX-D10 (Phase 4)
 *
 * Covers the EmptyState primitive plus the three-way rendering contract
 * (empty / loading / with-data) on the screens that consume it.
 *
 * Note: the story's File List names this file `empty-states.test.ts`. It must
 * be `.tsx` because it renders JSX.
 */

import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import axe from 'axe-core';

import { EmptyState } from '@components/EmptyState';
import { LoginPanel } from '@components/LoginPanel';
import { RankingPanel } from '@components/RankingPanel';
import { MenuPanel } from '@components/MenuPanel';
import { NC003Panel } from '@components/NC003Panel';
import { EndGamePanel } from '@components/EndGamePanel';

afterEach(cleanup);

/** Runs axe against a container and returns violations at serious/critical impact. */
async function seriousViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      // Panels are rendered in isolation, so page-level landmark/region rules
      // are not meaningful here.
      region: { enabled: false },
      'page-has-heading-one': { enabled: false },
    },
  });
  return results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
}

const DIFF = {
  1: { name: 'TRAINEE' },
  2: { name: 'JÚNIOR' },
  3: { name: 'PLENO' },
  4: { name: 'SÊNIOR' },
  5: { name: 'CHERNOBYL' },
};
const TITLES = ['Estagiário', 'Téc', 'Op', 'Eng', 'Dir', 'Herói'];

const panelChrome = {
  bg: {},
  css: null,
  shellClass: 'nc-shell',
  shellStyle: {},
};

// ---------------------------------------------------------------------------
// EmptyState primitive
// ---------------------------------------------------------------------------

describe('EmptyState component', () => {
  it('renders the title as the accessible name via role="status"', () => {
    render(<EmptyState title="Nenhum registro ainda" />);

    const status = screen.getByRole('status');
    expect(status).toBeTruthy();
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('Nenhum registro ainda');
  });

  it('wires description through aria-describedby', () => {
    const { container } = render(
      <EmptyState title="Vazio" description="Tente outra coisa" />
    );

    const status = screen.getByRole('status');
    const descId = status.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();
    expect(container.querySelector(`#${descId}`)?.textContent).toBe(
      'Tente outra coisa'
    );
  });

  it('omits aria-describedby when there is no description', () => {
    render(<EmptyState title="Vazio" />);
    expect(screen.getByRole('status').getAttribute('aria-describedby')).toBeNull();
  });

  it('hides the icon from assistive tech so meaning never rests on it alone', () => {
    render(<EmptyState title="Vazio" icon="📊" />);
    const icon = screen.getByTestId('empty-state-icon');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    // Title text still carries the meaning.
    expect(screen.getByRole('status').textContent).toContain('Vazio');
  });

  it('renders the CTA only when both label and handler are supplied', () => {
    const { rerender } = render(<EmptyState title="Vazio" actionLabel="Criar" />);
    expect(screen.queryByRole('button')).toBeNull();

    const onAction = vi.fn();
    rerender(<EmptyState title="Vazio" actionLabel="Criar" onAction={onAction} />);

    const button = screen.getByRole('button', { name: 'Criar' });
    expect(button.getAttribute('type')).toBe('button');

    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('generates unique ids so multiple instances do not collide', () => {
    render(
      <>
        <EmptyState title="A" description="a" testId="es-a" />
        <EmptyState title="B" description="b" testId="es-b" />
      </>
    );

    const a = screen.getByTestId('es-a').getAttribute('aria-labelledby');
    const b = screen.getByTestId('es-b').getAttribute('aria-labelledby');
    expect(a).toBeTruthy();
    expect(a).not.toBe(b);
  });

  it.each(['sm', 'md', 'lg'] as const)('renders at size %s', (size) => {
    render(<EmptyState title="Vazio" size={size} />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('has no serious axe violations', async () => {
    const { container } = render(
      <EmptyState
        title="Nenhum registro"
        description="Jogue uma partida"
        icon="📊"
        actionLabel="Jogar"
        onAction={() => {}}
      />
    );
    expect(await seriousViolations(container)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Screen-level: empty / loading / with-data
// ---------------------------------------------------------------------------

describe('LoginPanel empty states', () => {
  const baseProps = {
    nameInput: '',
    setNameInput: () => {},
    player: null,
    setPlayer: () => {},
    setMode: () => {},
    createPlayer: () => {},
    storeErr: false,
    selectedOperatorToExclude: null,
    setSelectedOperatorToExclude: () => {},
    handleExcludeOperator: () => {},
    ...panelChrome,
  };

  it('shows the empty state when there are no operators', () => {
    render(<LoginPanel {...(baseProps as any)} players={{}} loading={false} />);
    expect(screen.getByText('Nenhum operador cadastrado')).toBeTruthy();
  });

  it('shows the loading indicator instead of the empty state while loading', () => {
    render(<LoginPanel {...(baseProps as any)} players={{}} loading />);
    expect(screen.queryByText('Nenhum operador cadastrado')).toBeNull();
    expect(screen.getByText(/Consultando registros/)).toBeTruthy();
  });

  it('shows no empty state when operators exist', () => {
    render(
      <LoginPanel
        {...(baseProps as any)}
        players={{ ANA: { best: {}, games: 1, rank: 0 } }}
        loading={false}
      />
    );
    expect(screen.queryByText('Nenhum operador cadastrado')).toBeNull();
  });
});

describe('RankingPanel empty states', () => {
  const baseProps = {
    player: null,
    DIFF,
    TITLES,
    triggerButtonRef: null,
    setMode: () => {},
    ...panelChrome,
  };

  it('shows an empty state on the "geral" tab with no players', () => {
    render(
      <RankingPanel
        {...(baseProps as any)}
        players={{}}
        matches={[]}
        tab="geral"
        setTab={() => {}}
      />
    );
    expect(screen.getByText('Nenhum registro ainda')).toBeTruthy();
  });

  it('shows an empty state on the "partidas" tab with no matches', () => {
    render(
      <RankingPanel
        {...(baseProps as any)}
        players={{}}
        matches={[]}
        tab="partidas"
        setTab={() => {}}
      />
    );
    expect(screen.getByText('Nenhuma partida registrada')).toBeTruthy();
  });

  it('renders rows instead of an empty state when players exist', () => {
    render(
      <RankingPanel
        {...(baseProps as any)}
        players={{ ANA: { best: { 1: 100 }, games: 2, ops: 10, hits: 8, streak: 3, rank: 1, wins: 1 } }}
        matches={[]}
        tab="geral"
        setTab={() => {}}
      />
    );
    expect(screen.queryByText('Nenhum registro ainda')).toBeNull();
    expect(screen.getByText('ANA')).toBeTruthy();
  });

  it('has no serious axe violations while empty', async () => {
    const { container } = render(
      <RankingPanel
        {...(baseProps as any)}
        players={{}}
        matches={[]}
        tab="geral"
        setTab={() => {}}
      />
    );
    expect(await seriousViolations(container)).toEqual([]);
  });

  it('renders return and back actions with the elevated control treatment', () => {
    render(
      <RankingPanel
        {...(baseProps as any)}
        player="ANA"
        players={{ ANA: { best: {}, games: 1, ops: 2, hits: 1, streak: 1, rank: 0, wins: 0 } }}
        matches={[]}
        tab="geral"
        setTab={() => {}}
        resumeAvailable
        resumeGame={() => {}}
      />
    );

    ['Retornar ao jogo', 'Voltar para menu anterior'].forEach((name) => {
      const action = screen.getByRole('button', { name });
      expect(action.style.background).toContain('linear-gradient');
      expect(action.style.boxShadow).toContain('inset');
      expect(action.style.minHeight).toBe('44px');
    });
  });
});

describe('MenuPanel empty states', () => {
  const baseProps = {
    diff: 1,
    setDiff: () => {},
    snd: false,
    setSnd: () => {},
    setMode: () => {},
    setPlayer: () => {},
    initA: () => {},
    ...panelChrome,
  };

  it('shows "Nenhuma partida salva" for an operator with no games', () => {
    render(
      <MenuPanel
        {...(baseProps as any)}
        player="ANA"
        players={{ ANA: { best: {}, games: 0, rank: 0 } }}
      />
    );
    expect(screen.getByText('Nenhuma partida salva')).toBeTruthy();
  });

  it('hides the empty state once the operator has played', () => {
    render(
      <MenuPanel
        {...(baseProps as any)}
        player="ANA"
        players={{ ANA: { best: { 1: 500 }, games: 3, rank: 1 } }}
      />
    );
    expect(screen.queryByText('Nenhuma partida salva')).toBeNull();
  });

  it('renders menu actions as elevated, high-contrast controls', () => {
    render(
      <MenuPanel
        {...(baseProps as any)}
        player="ANA"
        players={{ ANA: { best: {}, games: 1, rank: 0 } }}
        resumeAvailable
        resumeGame={() => {}}
      />
    );

    ['Ir para análise de desempenho', 'Ir para ranking de operadores', 'Trocar operador', 'Retornar ao jogo', 'Ativar som'].forEach((name) => {
      const action = screen.getByRole('button', { name });
      expect(action.style.background).toContain('linear-gradient');
      expect(action.style.boxShadow).toContain('inset');
      expect(action.style.minHeight).toBe('44px');
    });
  });
});

describe('NC003Panel empty states', () => {
  const baseProps = {
    player: 'ANA',
    heat: 10,
    integrity: 100,
    coolant: 100,
    setMode: () => {},
    start: () => {},
    ...panelChrome,
  };

  it('shows the weighted-rate empty state when no games were played', () => {
    render(<NC003Panel {...(baseProps as any)} players={{ ANA: { games: 0 } }} />);
    expect(screen.getByText('Sem dados de taxa ponderada')).toBeTruthy();
  });

  it('shows the turma table once games exist', () => {
    render(<NC003Panel {...(baseProps as any)} players={{ ANA: { games: 4, ops: 20, hits: 15 } }} />);
    expect(screen.queryByText('Sem dados de taxa ponderada')).toBeNull();
    expect(screen.getByText(/Informações da Turma/)).toBeTruthy();
  });

  it('uses the elevated action treatment for return to the paused game', () => {
    render(
      <NC003Panel
        {...(baseProps as any)}
        players={{ ANA: { games: 4, ops: 20, hits: 15 } }}
        resumeAvailable
        resumeGame={() => {}}
      />
    );
    const action = screen.getByRole('button', { name: 'Retornar ao jogo' });
    expect(action.style.background).toContain('linear-gradient');
    expect(action.style.boxShadow).toContain('inset');
    expect(action.style.minHeight).toBe('44px');
  });

  it('CTA on the empty state starts a match', () => {
    const start = vi.fn();
    render(
      <NC003Panel {...(baseProps as any)} players={{ ANA: { games: 0 } }} start={start} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar partida' }));
    expect(start).toHaveBeenCalledTimes(1);
  });
});

describe('EndGamePanel empty states', () => {
  const baseProps = {
    mode: 'quit' as const,
    diff: 1,
    player: 'ANA',
    rank: 'Estagiário',
    elapsed: 0,
    pts: 0,
    bestStrk: 0,
    integrity: 100,
    players: { ANA: { best: {} } },
    setMode: () => {},
    start: () => {},
    resumeGame: () => {},
    continueGame: () => {},
    ...panelChrome,
  };

  it('shows the empty state when no operations were answered', () => {
    render(<EndGamePanel {...(baseProps as any)} tot={0} corr={0} />);
    expect(screen.getByText('Nenhuma estatística registrada')).toBeTruthy();
  });

  it('shows the performance report when operations exist', () => {
    render(<EndGamePanel {...(baseProps as any)} tot={10} corr={7} />);
    expect(screen.queryByText('Nenhuma estatística registrada')).toBeNull();
    expect(screen.getByText('Relatório de Desempenho')).toBeTruthy();
  });

  it('highlights every end-of-turn action using the restart button pattern', () => {
    render(<EndGamePanel {...(baseProps as any)} tot={10} corr={7} />);

    [
      'Ver análise de desempenho',
      'Ver ranking de operadores',
      'Voltar para menu principal',
      'Solicitar reinício da partida no mesmo nível',
    ].forEach((name) => {
      const button = screen.getByRole('button', { name });
      expect(button.className).toContain('active:translate-y-px');
      expect(button.style.background).toContain('linear-gradient');
      expect(button.style.boxShadow).toContain('inset');
      expect(button.style.minHeight).toBe('40px');
    });
  });

  it('requires an explicit confirmation before abandoning the current turn', () => {
    const start = vi.fn();
    render(<EndGamePanel {...(baseProps as any)} start={start} tot={10} corr={7} />);

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar reinício da partida no mesmo nível' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Reiniciar turno?' });
    expect(dialog.textContent).toContain('O progresso do turno atual será abandonado');
    const confirmationCard = screen.getByTestId('restart-confirmation-card');
    expect(confirmationCard.style.width).toBe('24rem');
    expect(confirmationCard.style.maxWidth).toBe('100%');
    expect(start).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cancelar reinício e manter turno atual' })).toBe(document.activeElement);

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(start).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar reinício da partida no mesmo nível' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar reinício e manter turno atual' }));
    expect(start).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar reinício da partida no mesmo nível' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reinício e abandonar turno atual' }));
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('uses the elevated continuing-button treatment for every navigation action', () => {
    render(<NC003Panel {...(baseProps as any)} players={{ ANA: { games: 4, ops: 20, hits: 15 } }} />);

    ['Voltar para menu', 'Ver análise de desempenho', 'Continuar para jogo'].forEach((name) => {
      const action = screen.getByRole('button', { name });
      expect(action.style.background).toContain('linear-gradient');
      expect(action.style.boxShadow).toContain('inset');
      expect(action.style.minHeight).toBe('44px');
    });
  });
});
