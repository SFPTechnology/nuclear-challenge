import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AnalisePanel, statsForDay } from '@/components/AnalisePanel';

const day = (key: string, total: number, hits: number, table: string) => {
  const [year, month, d] = key.split('-').map(Number);
  return {
    key, year, month, day: d, weekday: 0, total, hits, misses: total - hits,
    types: { multiplication: { hits, misses: total - hits }, division: { hits: 0, misses: 0 }, direct: { hits, misses: total - hits }, inverse: { hits: 0, misses: 0 } },
    tables: { [table]: { hits, misses: total - hits } }, updatedAt: 0,
  };
};

const players = {
  Ana: {
    ops: 30,
    stats: { tabs: { 3: { h: 5, m: 5 }, 8: { h: 10, m: 10 } }, ops: {}, forms: {}, mistakes: {} },
    studyLog: { '2026-09-10': day('2026-09-10', 10, 5, '3'), '2026-09-14': day('2026-09-14', 20, 10, '8') },
  },
};

const renderPanel = () => render(
  <AnalisePanel player="Ana" players={players} calendarCursor={new Date(2026, 8, 1)} setCalendarCursor={() => {}}
    bg={{}} css={null} shellClass="" shellStyle={{}} setMode={() => {}} storeErr={false} />,
);

describe('Análise — filtro por dia do calendário', () => {
  it('renders every day of the month as a button', () => {
    renderPanel();
    expect(screen.getAllByTestId('calendar-day')).toHaveLength(30);
  });

  it('filters the analysis to the selected day and clears on second click', () => {
    renderPanel();
    expect(screen.getByText('30 operações analisadas')).toBeTruthy();

    const day10 = screen.getByRole('button', { name: /Filtrar dia 10:/ });
    fireEvent.click(day10);
    expect(day10.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('10 operações analisadas')).toBeTruthy();
    expect(screen.getByText(/Filtrando: 10\/09\/2026/)).toBeTruthy();

    fireEvent.click(day10);
    expect(screen.queryByTestId('day-filter')).toBeNull();
    expect(screen.getByText('30 operações analisadas')).toBeTruthy();
  });

  it('lists a table in study priority when its errors are spread across days', () => {
    const spread = {
      Bia: {
        ops: 40,
        stats: { tabs: {}, ops: {}, forms: {}, mistakes: {} },
        studyLog: {
          '2026-09-11': { ...day('2026-09-11', 10, 5, '3'), tables: { 3: { hits: 5, misses: 5 }, 8: { hits: 0, misses: 1 } } },
          '2026-09-12': { ...day('2026-09-12', 10, 5, '4'), tables: { 4: { hits: 5, misses: 5 }, 8: { hits: 0, misses: 1 } } },
        },
      },
    };
    render(<AnalisePanel player="Bia" players={spread} calendarCursor={new Date(2026, 8, 1)} setCalendarCursor={() => {}}
      bg={{}} css={null} shellClass="" shellStyle={{}} setMode={() => {}} storeErr={false} />);
    expect(screen.getByText('Tabuada do 8')).toBeTruthy();
  });

  it('statsForDay maps only the day counters', () => {
    const stats = statsForDay(day('2026-09-14', 20, 10, '8'), {}, '2026-09-14');
    expect(stats.tabs).toEqual({ 8: { h: 10, m: 10 } });
    expect(stats.ops).toEqual({ '×': { h: 10, m: 10 } });
  });
});
