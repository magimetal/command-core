import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, render } from 'ink-testing-library';
import { GameplayFrame } from '../../src/components/GameplayFrame';
import { composeGrid } from '../../src/rendering/grid-composer';
import { composeEventLog, composeHud } from '../../src/rendering/hud-composer';
import { stripAnsi } from '../../src/rendering/color-map';
import { getDisplayWidth } from '../../src/rendering/text-utils';
import { createInitialState } from '../../src/simulation/create-initial-state';

afterEach(() => {
  cleanup();
});

describe('GameplayFrame Ink runtime parity', () => {
  test('keeps gameplay content parity and 78x33 guardrails', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      eventLog: ['>> Wave 1 started — 7 enemies incoming', '✕ Rapid tower eliminated Fast', '! Leak for 1 HP']
    };

    const view = render(<GameplayFrame state={state} terminalColumnsOverride={78} />);
    const output = stripAnsi(view.lastFrame() ?? '');
    const outputLines = output.split('\n');

    const gridLines = composeGrid(state).map((line) => stripAnsi(line));
    for (const gridLine of gridLines) {
      expect(outputLines.some((line) => line.includes(gridLine))).toBe(true);
    }

    const hudLines = stripAnsi(composeHud(state)).split('\n');
    expect(output).toContain(hudLines[0]);
    expect(output).toContain(hudLines[1]);
    expect(output).toContain(hudLines[2]);

    const eventLines = composeEventLog(state, 2).map((line) => stripAnsi(line));
    expect(output).toContain(eventLines[0]);
    expect(output).toContain(eventLines[1]);
    expect(output).toContain(eventLines[2]);

    for (const line of outputLines) {
      expect(getDisplayWidth(line)).toBeLessThanOrEqual(78);
    }

    expect(outputLines.length).toBeLessThanOrEqual(33);
  });
});
