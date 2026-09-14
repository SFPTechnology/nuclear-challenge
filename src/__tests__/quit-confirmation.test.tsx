import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { GamePlayPanel } from '@components/GamePlayPanel';

afterEach(cleanup);

const renderPanel = (quit = vi.fn()) => {
  const props: any = {
    heat: 20, integrity: 90, coolant: 90, melt: 0, evt: null, shownTemp: 300, delta: 0, frozen: false,
    rank: 'TRAINEE', snd: false, initA: () => {}, setSnd: () => {}, st: { t: 'NORMAL', c: '#22c55e' }, power: 600,
    ventCd: 0, VENT_CD: 10, boronCd: 0, BORON_CD: 10, scrm: 3, doVent: () => {}, doBoron: () => {}, doScram: () => {},
    picked: 0, locked: false, grace: 0, pair: [], pick: () => {}, prob: { prompt: '2 × 3', profile: 'routine' }, fb: null,
    ringPct: 100, ringCol: '#0e7490', ans: '', check: () => {}, press: () => {},
    pts: 0, goal: 1500, strk: 0, elapsed: 4, pauseGame: () => {}, quit, shakeCls: '', bg: {}, css: null,
    shellClass: '', shellStyle: {}, storeErr: false,
  };
  render(<GamePlayPanel {...props} />);
  return quit;
};

describe('SAIR confirmation', () => {
  it('asks before quitting and only quits on confirm', () => {
    const quit = renderPanel();
    fireEvent.click(screen.getByTestId('game-quit-button'));
    expect(quit).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeTruthy();

    fireEvent.click(screen.getByTestId('quit-confirm'));
    expect(quit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('keeps playing when the player cancels or presses Escape', () => {
    const quit = renderPanel();
    fireEvent.click(screen.getByTestId('game-quit-button'));
    fireEvent.click(screen.getByTestId('quit-cancel'));
    expect(screen.queryByRole('alertdialog')).toBeNull();

    fireEvent.click(screen.getByTestId('game-quit-button'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(quit).not.toHaveBeenCalled();
  });
});
