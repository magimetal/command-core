import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { TowerArchetype } from '../../src/const/towers';
import { stripAnsi } from '../../src/rendering/color-map';
import { composeFrame } from '../../src/rendering/frame-composer';
import { createInitialState } from '../../src/simulation/create-initial-state';

const getGridLines = (frame: string): string[] => {
  return frame
    .split('\n')
    .slice(3, 19)
    .map((line) => line.slice(1, -1));
};

const getCellSymbol = (gridLine: string, col: number): string => {
  const trimmedGridLine = gridLine.trimStart();
  return trimmedGridLine[col * 2];
};

describe('composeFrame', () => {
  test('keeps title, gameplay, and end-state frames in terminal guardrails', () => {
    const titleState = createInitialState();
    const prepState = { ...createInitialState(), phase: 'PREP' as const };
    const gameOverState = { ...createInitialState(), phase: 'GAME_OVER' as const };

    for (const state of [titleState, prepState, gameOverState]) {
      const frame = stripAnsi(composeFrame(state));
      const lines = frame.split('\n');
      const width = Math.max(...lines.map((line) => line.length));
      const height = lines.length;

      expect(width).toBeLessThanOrEqual(78);
      expect(height).toBeLessThanOrEqual(33);
    }
  });

  test('renders title screen on launch', () => {
    const state = createInitialState();
    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('TERMINAL TOWER DEFENSE');
    expect(frame).toContain('Any key: deploy to PREP   |   Q: quit');
    expect(frame).toContain('████████╗████████╗██████╗');
  });

  test('renders framed dashboard sections', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const
    };
    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('┌');
    expect(frame).toContain('TERMINAL TOWER DEFENSE');
    expect(frame).toContain('TERMINAL TOWER DEFENSE  ║  Wave 1/3  [PREP]');
    expect(frame).toContain('HP: 20 | Gold: 150 | Wave: 1/3 | [PREP] (press Space)');
    expect(frame).toContain('Selected: △ RAPID ($50)  Cursor: (1,1)');
    expect(frame).toContain('CONTROLS');
    expect(frame).toContain('EVENT LOG');
    expect(frame).toContain('[1/2] Tower  [↑↓←→] Move  [Enter] Place  [Space] Start  [Q] Quit');
    expect(frame).toContain('! No recent events');
  });

  test('renders non-linear S-curve path in grid', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const
    };
    const frame = stripAnsi(composeFrame(state));
    const gridLines = getGridLines(frame);

    expect(getCellSymbol(gridLines[2], 0)).toBe('⟶');
    expect(getCellSymbol(gridLines[2], 18)).toBe('·');
    expect(getCellSymbol(gridLines[8], 18)).toBe('·');
    expect(getCellSymbol(gridLines[8], 3)).toBe('·');
    expect(getCellSymbol(gridLines[14], 21)).toBe('⬡');
    expect(getCellSymbol(gridLines[7], 1)).toBe('▪');
  });

  test('renders event log entries latest-first and capped to five', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      eventLog: [
        '✓ Tower placed at (4,3)',
        '✕ STANDARD destroyed  (+$10)',
        '✗ Cannot place tower: not buildable',
        '✗ Cannot place tower: occupied',
        '~ TANK hit  [███░░] 24/40',
        'older event that should be hidden'
      ]
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('✓ Tower placed at (4,3)');
    expect(frame).toContain('✕ STANDARD destroyed  (+$10)');
    expect(frame).toContain('✗ Cannot place tower: not buildable');
    expect(frame).toContain('✗ Cannot place tower: occupied');
    expect(frame).toContain('~ TANK hit  [███░░] 24/40');
    expect(frame).not.toContain('older event that should be hidden');
  });

  test('renders GAME OVER ceremony screen', () => {
    const state = {
      ...createInitialState(),
      phase: 'GAME_OVER' as const,
      enemiesKilled: 7,
      currency: 220
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('╔═╗╔═╗╔╦╗╔═╗   ╔═╗╦  ╦╔═╗╦═╗');
    expect(frame).toContain('The base has fallen. The run ends here.');
    expect(frame).toContain('Enemies killed: 7');
    expect(frame).toContain('Gold remaining: 220');
    expect(frame).toContain('Press Q to quit');
    expect(frame).toContain('┌');
  });

  test('renders VICTORY ceremony screen', () => {
    const state = {
      ...createInitialState(),
      phase: 'VICTORY' as const,
      enemiesKilled: 18,
      currency: 305
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('╦  ╦╦╔═╗╔╦╗╔═╗╦═╗╦ ╦');
    expect(frame).toContain('All waves survived. The base stands.');
    expect(frame).toContain('Enemies killed: 18');
    expect(frame).toContain('Gold remaining: 305');
    expect(frame).toContain('Press Q to quit');
    expect(frame).toContain('┌');
  });

  test('renders distinct symbols for enemy and tower archetypes', () => {
    const base = createInitialState();
    const state = {
      ...base,
      phase: 'PREP' as const,
      towers: [
        {
          id: 'tower-rapid',
          archetype: TowerArchetype.RAPID,
          pos: [1, 1] as [number, number],
          cooldownRemaining: 0
        },
        {
          id: 'tower-cannon',
          archetype: TowerArchetype.CANNON,
          pos: [3, 1] as [number, number],
          cooldownRemaining: 0
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

    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('△');
    expect(frame).toContain('◉');
    expect(frame).toContain('▸');
    expect(frame).toContain('◈');
  });
});
