import { describe, expect, test } from 'vitest';
import { stripAnsi } from '../../src/rendering/color-map';
import { composeMapSelectFrame } from '../../src/rendering/map-select-composer';
import { createInitialState } from '../../src/simulation/create-initial-state';

describe('composeMapSelectFrame', () => {
  test('renders operations map cards and guardrails', () => {
    const frame = stripAnsi(
      composeMapSelectFrame({
        ...createInitialState(),
        phase: 'MAP_SELECT',
        menuCursor: 0
      })
    );

    expect(frame).toContain('[1] Crossroads');
    expect(frame).toContain('[2] The Gauntlet');
    expect(frame).toContain('[★ Beginner]');
    expect(frame).toContain('[★★ Intermediate]');
    expect(frame).toContain('↑↓ Select   Enter: Confirm   Esc/B: Back');

    const lines = frame.split('\n');
    const width = Math.max(...lines.map((line) => line.length));

    expect(width).toBeLessThanOrEqual(78);
    expect(lines.length).toBeLessThanOrEqual(33);
  });
});
