import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { GlobalErrorBanner } from '@components/GlobalErrorBanner';

afterEach(cleanup);

describe('GlobalErrorBanner', () => {
  it('exposes an accessible retry action without hiding the error', () => {
    const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => undefined);
    render(<GlobalErrorBanner visible />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/FALHA DE ARMAZENAMENTO/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar reconectar ao armazenamento' }));
    expect(reload).toHaveBeenCalledTimes(1);
    reload.mockRestore();
  });
});
