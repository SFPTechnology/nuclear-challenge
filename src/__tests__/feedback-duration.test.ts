import { describe, expect, it } from 'vitest';
import { MIN_VISIBLE_FEEDBACK_MS } from '@constants/timing';

describe('visible feedback timing', () => {
  it('keeps user-visible feedback for at least seven seconds', () => {
    expect(MIN_VISIBLE_FEEDBACK_MS).toBeGreaterThanOrEqual(7000);
  });
});
