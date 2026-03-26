import { describe, expect, test } from 'vitest';
import { toSellFailureMessage } from '../src/app';

describe('toSellFailureMessage', () => {
  test('maps no-tower sell error to player-facing copy', () => {
    expect(toSellFailureMessage('No tower at cursor to sell')).toBe('✗ No tower here to sell');
  });

  test('passes through other sell errors with error prefix', () => {
    expect(toSellFailureMessage('You can only sell towers between waves')).toBe(
      '✗ You can only sell towers between waves'
    );
  });
});
