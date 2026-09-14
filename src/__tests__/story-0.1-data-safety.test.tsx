import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import App, { buildSavedPlayer } from '../App';
import { MenuPanel } from '@components/MenuPanel';
import { RankingPanel } from '@components/RankingPanel';
import { AnalisePanel } from '@components/AnalisePanel';
import { NC003Panel } from '@components/NC003Panel';
import { EndGamePanel } from '@components/EndGamePanel';
import { GamePlayPanel } from '@components/GamePlayPanel';

const repository = vi.hoisted(() => ({
  load: vi.fn(),
  createOperator: vi.fn(),
}));

vi.mock('@domain/supabase/GameRepository', () => ({
  GameRepository: class {
    load = repository.load;
    createOperator = repository.createOperator;
  },
}));

vi.mock('@components/AuthGate', () => ({
  AuthGate: ({ children }: { children: (user: never) => React.ReactNode }) => <>{children({} as never)}</>,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const shell = { bg: {}, css: null, shellClass: 'nc-shell', shellStyle: {} };
const errorText = /FALHA DE ARMAZENAMENTO/;

describe('Story 0.1 data-safety scenarios', () => {
  it('preserves an unknown player field when saveResult builds its persisted record', () => {
    const updated = buildSavedPlayer(
      {
        best: {}, games: 2, ops: 7, hits: 5, streak: 2, rank: 1, wins: 1,
        studyLog: {}, futureExtension: { source: 'migration-v2' },
      },
      {
        diff: 2, pts: 100, tot: 3, corr: 2, bestStrk: 4, rankIdx: 2, outcome: 'win',
        session: { tabs: {}, ops: {}, forms: {}, daily: {} },
      },
    );

    expect(updated.futureExtension).toEqual({ source: 'migration-v2' });
    expect(updated.games).toBe(3);
    expect(updated.best[2]).toBe(100);
  });

  it('prevents operator writes after the app receives an initial repository read failure', async () => {
    repository.load.mockRejectedValue(new Error('storage unavailable'));

    render(<App />);

    await waitFor(() => expect(screen.getByText(/armazenamento não respondeu/)).toBeTruthy());
    fireEvent.change(screen.getByPlaceholderText('NOME'), { target: { value: 'ANA' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Criar operador: ANA/ }));
    });

    expect(repository.load).toHaveBeenCalled();
    expect(repository.createOperator).not.toHaveBeenCalled();
  });

  it('renders the global storage error on every non-login application screen', () => {
    const panels = [
      <MenuPanel {...shell} player="ANA" players={{ ANA: { best: {}, games: 0, rank: 0 } }} diff={1} setDiff={() => {}} snd={false} setSnd={() => {}} setMode={() => {}} setPlayer={() => {}} initA={() => {}} storeErr />,
      <RankingPanel {...shell} players={{}} matches={[]} player="ANA" tab="geral" setTab={() => {}} DIFF={{ 1: { name: 'TRAINEE' } }} TITLES={['Trainee']} triggerButtonRef={null} setMode={() => {}} storeErr />,
      <AnalisePanel {...shell} player="ANA" players={{ ANA: { stats: { tabs: {}, ops: {}, forms: {} }, studyLog: {} } }} calendarCursor={new Date(2026, 0, 1)} setCalendarCursor={() => {}} setMode={() => {}} storeErr />,
      <NC003Panel {...shell} player="ANA" players={{ ANA: { games: 0 } }} heat={10} integrity={100} coolant={100} setMode={() => {}} start={() => {}} storeErr />,
      <EndGamePanel {...shell} mode="quit" diff={1} player="ANA" rank="Trainee" elapsed={0} pts={0} tot={0} corr={0} bestStrk={0} integrity={100} players={{ ANA: { best: {} } }} setMode={() => {}} start={() => {}} resumeGame={() => {}} continueGame={() => {}} storeErr />,
      <GamePlayPanel {...shell} heat={10} integrity={100} coolant={100} melt={0} evt={null} shownTemp={300} delta={0} frozen={false} rank="Trainee" snd={false} initA={() => {}} setSnd={() => {}} st={{ t: 'ESTÁVEL', c: '#22c55e' }} power={300} ventCd={0} VENT_CD={12} boronCd={0} BORON_CD={30} scrm={3} doVent={() => {}} doBoron={() => {}} doScram={() => {}} picked={null} locked={false} grace={0} pair={[null, null]} pick={() => {}} prob={null} fb={null} ringPct={100} ringCol="#06b6d4" ans="" check={() => {}} press={() => {}} pts={0} goal={1000} strk={0} elapsed={0} pauseGame={() => {}} quit={() => {}} shakeCls="" storeErr />,
    ];

    panels.forEach(panel => {
      const { unmount } = render(panel);
      expect(screen.getByText(errorText)).toBeTruthy();
      unmount();
    });
  });
});
