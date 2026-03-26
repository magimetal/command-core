import { describe, expect, test } from 'vitest';
import { stripAnsi } from '../../src/rendering/color-map';
import { composeModeSelectFrame } from '../../src/rendering/mode-select-composer';
import { createInitialState } from '../../src/simulation/create-initial-state';

describe('composeModeSelectFrame', () => {
  test('renders both mode cards and respects frame guardrails', () => {
    const frame = stripAnsi(
      composeModeSelectFrame({
        ...createInitialState(),
        phase: 'MODE_SELECT',
        menuCursor: 0
      })
    );

    expect(frame).toContain('[1] OPERATIONS');
    expect(frame).toContain('[2] ANOMALY');
    expect(frame).toContain('↑↓ Navigate   Enter: Confirm   Q: Quit');

    const lines = frame.split('\n');
    const width = Math.max(...lines.map((line) => line.length));

    expect(width).toBeLessThanOrEqual(78);
    expect(lines.length).toBeLessThanOrEqual(33);
  });
});
