import { describe, expect, test } from 'vitest';
import { stripAnsi } from '../../src/rendering/text-utils';
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
    expect(frame).toContain('[3] Perimeter');
    expect(frame).toContain('[4] Zigzag');
    expect(frame).toContain('[5] The Coil');
    expect(frame).toContain('[6] Reverse Run');
    expect(frame).toContain('[7] Labyrinth');
    expect(frame).toContain('[8] The Crucible');
    expect(frame).toContain('[9] Blitz');
    expect(frame).toContain('[10] Ouroboros');
    expect(frame).toContain('[★★ Intermediate]');
    expect(frame).toContain('[★★★ Advanced]');
    expect(frame).toContain('[★★★★ Expert]');
    expect(frame).toContain('↑↓ Select   Enter: Confirm   Esc/B: Back');

    const lines = frame.split('\n');
    const width = Math.max(...lines.map((line) => line.length));

    expect(width).toBeLessThanOrEqual(78);
    expect(lines.length).toBeLessThanOrEqual(33);
  });
});
