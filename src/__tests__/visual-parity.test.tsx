import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { tokens } from '@design/tokens';
import { Label } from '@components/Label';
import { Lamp } from '@components/Lamp';
import { Lcd } from '@components/Lcd';
import { Plate } from '@components/Plate';
import { CoreGauge } from '@components/CoreGauge';
import { PauseButton } from '@components/PauseButton';
import { ANALYSIS_MINIMUM_RESPONSES, AnalisePanel, buildTabRows, countAnsweredAccounts, hasEnoughAnswersForAnalysis } from '@components/AnalisePanel';

afterEach(cleanup);

describe('visual parity primitives', () => {
  it('uses the nuclear metal plate token and keeps its texture layer', () => {
    const { container } = render(<Plate>UN-01</Plate>);
    const plate = container.firstElementChild as HTMLElement;

    expect(plate.style.background.replace(/\s/g, '')).toBe(tokens.visual.metalSurface.replace(/\s/g, ''));
    expect(plate.style.border).toBe(tokens.visual.consoleBorder);
    expect(container.textContent).toContain('UN-01');
  });

  it('keeps compact labels and LCD values readable at browser zoom', () => {
    const { container } = render(
      <>
        <Label>Temperatura do nucleo</Label>
        <Lcd value={320} unit="C" />
      </>
    );

    expect(container.querySelector('div')?.style.fontSize).toBe('0.6875rem');
    expect(screen.getByText('320')).toBeTruthy();
    expect(screen.getByText('C')).toBeTruthy();
  });

  it('exposes status through text and role, not color alone', () => {
    render(<Lamp on hue="red" label="NUCLEO" />);
    expect(screen.getByRole('status', { name: 'NUCLEO: ALERTA' })).toBeTruthy();
    expect(screen.getByText('NUCLEO')).toBeTruthy();
  });

  it('renders the reference gauge states with accessible text', () => {
    render(<CoreGauge temp={640} delta={1.2} danger frozen={false} />);
    expect(screen.getByText('Temperatura do Núcleo')).toBeTruthy();
    expect(screen.getByText('640')).toBeTruthy();
    expect(screen.getByText('+1.2 °C/s')).toBeTruthy();
  });
  it('renders pause as a raised, high-contrast control key', () => {
    render(<PauseButton onClick={() => {}} />);
    const pause = screen.getByRole('button', { name: 'Pausar sistema' });

    expect(pause.textContent).toBe('PAUSAR');
    expect(pause.style.background).toContain('linear-gradient');
    expect(pause.style.boxShadow).toContain('inset');
    expect(pause.style.width).toBe('100%');
    expect(pause.style.minWidth).toBe('0');
  });

  it('keeps early table accuracy visible before three attempts exist', () => {
    expect(buildTabRows({ '7': { h: 1, m: 0 }, '8': { h: 0, m: 0 } })).toEqual([
      { k: 7, n: 1, p: 100, h: 1, m: 0 },
    ]);
  });

  it('counts answered accounts even when operation counters are empty', () => {
    expect(countAnsweredAccounts({ ops: {}, forms: {} }, 12, {})).toBe(12);
    expect(countAnsweredAccounts({ ops: {} }, 0, { '2026-09-14': { total: 10 } })).toBe(10);
    expect(countAnsweredAccounts({ ops: { '×': { h: 3, m: 1 } } }, 0, {})).toBe(4);
  });

  it('starts the complete analysis on the tenth answered account', () => {
    expect(ANALYSIS_MINIMUM_RESPONSES).toBe(10);
    expect(hasEnoughAnswersForAnalysis(9)).toBe(false);
    expect(hasEnoughAnswersForAnalysis(10)).toBe(true);

    const props = {
      player: 'ANA',
      calendarCursor: new Date(2026, 8, 1), setCalendarCursor: () => {},
      bg: {}, css: null, shellClass: 'nc-shell', shellStyle: {}, setMode: () => {}, storeErr: false,
    };
    const { rerender } = render(<AnalisePanel {...props} players={{ ANA: { stats: { tabs: {}, ops: { '×': { h: 9, m: 0 } }, forms: {} }, studyLog: {} } }} />);
    expect(screen.getByTestId('empty-state-analise')).toBeTruthy();

    rerender(<AnalisePanel {...props} players={{ ANA: { stats: { tabs: { '7': { h: 8, m: 2 } }, ops: { '×': { h: 8, m: 2 } }, forms: {} }, studyLog: {} } }} />);
    expect(screen.getByText('Mapa das Tabuadas')).toBeTruthy();
  });

  it('lists every incorrect account in the analysis card', () => {
    const mistakes = Object.fromEntries(
      Array.from({ length: 10 }, (_, index) => [
        `${index + 2} × ${index + 3} = ${(index + 2) * (index + 3)}`,
        { expression: `${index + 2} × ${index + 3} = ${(index + 2) * (index + 3)}`, errors: 1, correct: 0, lastSeen: index },
      ]),
    );

    render(
      <AnalisePanel
        player="ANA"
        players={{ ANA: { stats: { tabs: {}, ops: {}, forms: {}, mistakes }, studyLog: {} } }}
        calendarCursor={new Date(2026, 8, 1)}
        setCalendarCursor={() => {}}
        bg={{}}
        css={null}
        shellClass="nc-shell"
        shellStyle={{}}
        setMode={() => {}}
        storeErr={false}
      />,
    );

    expect(screen.getAllByTestId('mistake-record')).toHaveLength(10);
  });

  it('lists the five weakest tables in the priority reinforcement card', () => {
    render(
      <AnalisePanel
        player="ANA"
        players={{ ANA: { stats: {
          tabs: {
            '2': { h: 1, m: 9 },
            '3': { h: 2, m: 8 },
            '4': { h: 3, m: 7 },
            '5': { h: 4, m: 6 },
            '6': { h: 5, m: 5 },
            '7': { h: 10, m: 0 },
          },
          ops: { '×': { h: 5, m: 5 } }, forms: {}, mistakes: {},
        }, studyLog: {} } }}
        calendarCursor={new Date(2026, 8, 1)}
        setCalendarCursor={() => {}}
        bg={{}}
        css={null}
        shellClass="nc-shell"
        shellStyle={{}}
        setMode={() => {}}
        storeErr={false}
      />,
    );

    expect(screen.getAllByTestId('priority-table-row')).toHaveLength(5);
    expect(screen.getByText('10% · 9 erros')).toBeTruthy();
    expect(screen.getByText('50% · 5 erros')).toBeTruthy();
    expect(screen.getAllByTestId('consolidated-table')).toHaveLength(5);
    expect(screen.getByText('100% · 10x')).toBeTruthy();
  });
});
