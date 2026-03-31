import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, render } from 'ink-testing-library';
import { EnemyArchetype } from '../../src/const/enemies';
import { TowerArchetype } from '../../src/const/towers';
import { GameplayFrame } from '../../src/components/GameplayFrame';
import { composeGrid } from '../../src/rendering/grid-composer';
import { composeEventLog, composeHud } from '../../src/rendering/hud-composer';
import { getDisplayWidth, stripAnsi } from '../../src/rendering/text-utils';
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

  test('renders gameplay entities from component output', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      towers: [
        {
          id: 'tower-rapid',
          archetype: TowerArchetype.RAPID,
          pos: [1, 1] as [number, number],
          cooldownRemaining: 0,
          kills: 0
        }
      ],
      enemies: [
        {
          id: 'enemy-standard',
          archetype: EnemyArchetype.STANDARD,
          pos: [1, 7] as [number, number],
          pathIndex: 1,
          hp: 10,
          maxHp: 10,
          moveCooldown: 2,
          dead: false
        }
      ],
      projectiles: [
        {
          id: 'proj-tower-1',
          archetype: TowerArchetype.RAPID,
          pos: [3, 4] as [number, number],
          targetPos: [5, 4] as [number, number],
          symbol: '·',
          ttl: 1
        }
      ]
    };

    const view = render(<GameplayFrame state={state} terminalColumnsOverride={78} />);
    const output = stripAnsi(view.lastFrame() ?? '');

    expect(output).toContain('⟁');
    expect(output).toContain('▸');
    expect(output).toContain('·');
  });

  test('renders only 2 most recent event-log entries', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      eventLog: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7']
    };

    const view = render(<GameplayFrame state={state} terminalColumnsOverride={78} />);
    const output = stripAnsi(view.lastFrame() ?? '');

    expect(output).toContain('e1');
    expect(output).toContain('e2');
    expect(output).not.toContain('e3');
  });

  test('uses compact legend at narrow width and wide legend at full width', () => {
    const state = { ...createInitialState(), phase: 'PREP' as const };

    const compact = stripAnsi(render(<GameplayFrame state={state} terminalColumnsOverride={70} />).lastFrame() ?? '');
    const wide = stripAnsi(render(<GameplayFrame state={state} terminalColumnsOverride={78} />).lastFrame() ?? '');

    expect(compact).toContain('[↵]Place');
    expect(compact).toContain('[Spc]Start');
    expect(wide).toContain('[Enter] Place');
    expect(wide).toContain('[Space] Start');
  });

  test('shows narrow-pane guidance when battlefield cannot fit', () => {
    const state = { ...createInitialState(), phase: 'PREP' as const };
    const output = stripAnsi(render(<GameplayFrame state={state} terminalColumnsOverride={48} />).lastFrame() ?? '');

    expect(output).toContain('⚠  Battlefield is wider than this pane: need');
    expect(output).toContain('Widen pane (tmux drag or C-b + ←→), or reduce');
  });

  test('REDUCED_MOTION keeps base glyph static', () => {
    const previousReducedMotion = process.env.REDUCED_MOTION;
    const baseState = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      frame: 2
    };

    process.env.REDUCED_MOTION = '1';
    const reducedMotionOutput = stripAnsi(render(<GameplayFrame state={baseState} terminalColumnsOverride={78} />).lastFrame() ?? '');

    if (previousReducedMotion === undefined) {
      delete process.env.REDUCED_MOTION;
    } else {
      process.env.REDUCED_MOTION = previousReducedMotion;
    }

    const animatedOutput = stripAnsi(render(<GameplayFrame state={baseState} terminalColumnsOverride={78} />).lastFrame() ?? '');

    expect(reducedMotionOutput).toContain('⬡');
    expect(animatedOutput).toContain('⊡');
  });

  test('REDUCED_GLYPH=1 falls back to ASCII enemy symbols', () => {
    const previousReducedGlyph = process.env.REDUCED_GLYPH;
    process.env.REDUCED_GLYPH = '1';

    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      enemies: [
        {
          id: 'enemy-standard',
          archetype: EnemyArchetype.STANDARD,
          pos: [1, 7] as [number, number],
          pathIndex: 1,
          hp: 10,
          maxHp: 10,
          moveCooldown: 2,
          dead: false
        },
        {
          id: 'enemy-tank',
          archetype: EnemyArchetype.TANK,
          pos: [3, 7] as [number, number],
          pathIndex: 3,
          hp: 40,
          maxHp: 40,
          moveCooldown: 4,
          dead: false
        }
      ]
    };

    const view = render(<GameplayFrame state={state} terminalColumnsOverride={78} />);
    const output = stripAnsi(view.lastFrame() ?? '');

    if (previousReducedGlyph === undefined) {
      delete process.env.REDUCED_GLYPH;
    } else {
      process.env.REDUCED_GLYPH = previousReducedGlyph;
    }

    expect(output).toContain('⚠ THREAT');
    expect(output).toContain('T Tank');
    expect(output).not.toContain('■ Tank');
  });
});
