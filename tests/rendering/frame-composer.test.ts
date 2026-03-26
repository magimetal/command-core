import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { TowerArchetype } from '../../src/const/towers';
import { colorizeGridSymbol, stripAnsi } from '../../src/rendering/color-map';
import { composeFrame } from '../../src/rendering/frame-composer';
import { createInitialState } from '../../src/simulation/create-initial-state';
import chalk from 'chalk';

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
    const waveActiveState = { ...createInitialState(), phase: 'WAVE_ACTIVE' as const };
    const gameOverState = { ...createInitialState(), phase: 'GAME_OVER' as const };
    const victoryState = { ...createInitialState(), phase: 'VICTORY' as const };

    for (const state of [titleState, prepState, waveActiveState, gameOverState, victoryState]) {
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

  test('renders full four-row animated TDD title art including bottom row', () => {
    const frame = stripAnsi(composeFrame(createInitialState()));

    expect(frame).toContain('████████╗████████╗██████╗');
    expect(frame).toContain('╚══██╔══╝╚══██╔══╝██╔══██╗');
    expect(frame).toContain('   ██║      ██║   ██║  ██║');
    expect(frame).toContain('   ╚═╝      ╚═╝   ╚═╝  ╚═╝');
  });

  test('title screen uses full frame width budget and keeps title art visible', () => {
    const frame = stripAnsi(composeFrame(createInitialState()));
    const lines = frame.split('\n');
    const width = Math.max(...lines.map((line) => line.length));
    const innerLines = lines.slice(1, -1).map((line) => line.slice(1, -1));
    const titleArtLine = innerLines.find((line) => line.includes('████████╗████████╗██████╗'));

    expect(width).toBe(78);
    expect(titleArtLine).toBeDefined();
    expect(titleArtLine!.startsWith(' ')).toBe(true);
    expect(titleArtLine!.trimEnd().endsWith('██████╗')).toBe(true);
  });

  test('renders framed dashboard sections', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const
    };
    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('┌');
    expect(frame).toContain('TERMINAL TOWER DEFENSE');
    expect(frame).toContain('TERMINAL TOWER DEFENSE  ║  Wave 1/5  [PREP]');
    expect(frame).toContain('❤ 20  ✦ $150  ≋ 1/5 waves');
    expect(frame).toContain('[PREP]');
    expect(frame).toContain('Next: 5×');
    expect(frame).toContain('RAPID $50');
    expect(frame).toContain('C $100');
    expect(frame).toContain('Sn $150');
    expect(frame).toContain('Sl $75');
    expect(frame).toContain(
      '[1-4] Tower  [↑↓←→] Move  [Enter] Place  [S] Sell  [Space] Start  [Q] Quit'
    );
    expect(frame).toContain('! No recent events');
  });

  test('renders new 7-segment path in grid', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const
    };
    const frame = stripAnsi(composeFrame(state));
    const gridLines = getGridLines(frame);

    expect(getCellSymbol(gridLines[2], 0)).toBe('⟹');
    expect(getCellSymbol(gridLines[2], 24)).toBe('┐');
    expect(getCellSymbol(gridLines[3], 24)).toBe('│');
    expect(getCellSymbol(gridLines[13], 24)).toBe('┘');
    expect(getCellSymbol(gridLines[13], 4)).toBe('└');
    expect(getCellSymbol(gridLines[5], 4)).toBe('┌');
    expect(getCellSymbol(gridLines[5], 13)).toBe('┐');
    expect(getCellSymbol(gridLines[10], 13)).toBe('└');
    expect(getCellSymbol(gridLines[10], 27)).toBe('⬡');
    expect(getCellSymbol(gridLines[0], 1)).toBe('░');
    expect(getCellSymbol(gridLines[7], 1)).toBe('░');
  });

  test('renders range ring ◌ on BUILDABLE cells in PREP when cursor on BUILDABLE', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      cursor: [1, 0] as [number, number],
      selectedTowerArchetype: TowerArchetype.RAPID
    };
    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('◌');
  });

  test('renders range ring ◌ in WAVE_CLEAR when cursor on BUILDABLE', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_CLEAR' as const,
      cursor: [1, 0] as [number, number],
      selectedTowerArchetype: TowerArchetype.RAPID
    };
    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('◌');
  });

  test('does not render range ring during WAVE_ACTIVE', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      cursor: [1, 0] as [number, number],
      selectedTowerArchetype: TowerArchetype.RAPID
    };
    const frame = stripAnsi(composeFrame(state));

    expect(frame).not.toContain('◌');
  });

  test('does not render range ring when cursor is on PATH cell', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      cursor: [5, 2] as [number, number],
      selectedTowerArchetype: TowerArchetype.RAPID
    };
    const frame = stripAnsi(composeFrame(state));

    expect(frame).not.toContain('◌');
  });

  test('uses ghost tower cursor symbol on buildable placement cells', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      cursor: [1, 1] as [number, number],
      selectedTowerArchetype: TowerArchetype.SNIPER
    };
    const frame = stripAnsi(composeFrame(state));
    const gridLines = getGridLines(frame);

    expect(getCellSymbol(gridLines[1], 1)).toBe('⟇');
  });

  test('does not override tower cell with range ring', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      cursor: [1, 1] as [number, number],
      selectedTowerArchetype: TowerArchetype.CANNON,
      towers: [
        {
          id: 'tower-rapid',
          archetype: TowerArchetype.RAPID,
          pos: [2, 1] as [number, number],
          cooldownRemaining: 0,
          kills: 0
        }
      ],
      grid: createInitialState().grid.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === 1 && colIndex === 2 ? { ...cell, tower: 'tower-rapid' } : cell
        )
      )
    };
    const frame = stripAnsi(composeFrame(state));
    const gridLines = getGridLines(frame);

    expect(getCellSymbol(gridLines[1], 2)).toBe('⟁');
  });

  test('renders projectile glyph at projectile position in grid', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      projectiles: [
        {
          id: 'proj-tower-1-5',
          pos: [3, 4] as [number, number],
          targetPos: [5, 4] as [number, number],
          archetype: TowerArchetype.RAPID,
          symbol: '·',
          ttl: 1
        }
      ]
    };
    const frame = stripAnsi(composeFrame(state));
    const gridLines = getGridLines(frame);

    expect(getCellSymbol(gridLines[4], 3)).toBe('·');
  });

  test('caps overflow event log to seven entries', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      eventLog: [
        '✓ Tower placed at (4,3)',
        '✕ STANDARD destroyed  (+$10)',
        '✗ Cannot place tower: not buildable',
        '✗ Cannot place tower: occupied',
        '~ TANK hit  [███░░] 24/40',
        '>> Wave 2 started — 11 enemies incoming',
        '$ Tower sold at (4,3)',
        'older event that should be hidden'
      ]
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('✓ Tower placed at (4,3)');
    expect(frame).toContain('✕ STANDARD destroyed  (+$10)');
    expect(frame).toContain('✗ Cannot place tower: not buildable');
    expect(frame).toContain('✗ Cannot place tower: occupied');
    expect(frame).toContain('~ TANK hit  [███░░] 24/40');
    expect(frame).toContain('>> Wave 2 started — 11 enemies incoming');
    expect(frame).toContain('$ Tower sold at (4,3)');
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
    expect(frame).toContain('Score: 304');
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
    expect(frame).toContain('Score: 1021');
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
          cooldownRemaining: 0,
          kills: 0
        },
        {
          id: 'tower-cannon',
          archetype: TowerArchetype.CANNON,
          pos: [3, 1] as [number, number],
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

    expect(frame).toContain('⟁');
    expect(frame).toContain('⊛');
    expect(frame).toContain('◀');
    expect(frame).toContain('⬟');
  });

  test('renders event log entries latest-first and capped to seven', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      eventLog: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'older event that should be hidden']
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('e1');
    expect(frame).toContain('e7');
    expect(frame).not.toContain('older event that should be hidden');
  });

  test('gameplay frame height stays at ≤ 33 with a full 7-entry event log', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      eventLog: ['entry 1', 'entry 2', 'entry 3', 'entry 4', 'entry 5', 'entry 6', 'entry 7']
    };
    const frame = composeFrame(state);
    const lines = stripAnsi(frame).split('\n');

    expect(lines.length).toBeLessThanOrEqual(33);
  });

  test('legendLine and selectedLine stay within 76-char inner budget', () => {
    const state = { ...createInitialState(), phase: 'PREP' as const };
    const frame = stripAnsi(composeFrame(state));
    const lines = frame.split('\n');
    const innerLines = lines.slice(1, -1).map((line) => line.slice(1, -1));
    const legendLine = innerLines.find((line) => line.includes('[1-4] Tower'));
    const selectedLine = innerLines.find((line) => line.includes('|  Cursor:'));

    expect(legendLine).toBeDefined();
    expect(selectedLine).toBeDefined();
    expect(legendLine!.trimEnd().length).toBeLessThanOrEqual(76);
    expect(selectedLine!.trimEnd().length).toBeLessThanOrEqual(76);
  });

  test('SNIPER_TOWER color class is distinct from RAPID_TOWER', () => {
    const previousLevel = chalk.level;
    chalk.level = 3;

    const sniper = colorizeGridSymbol('⟇', 'SNIPER_TOWER');
    const rapid = colorizeGridSymbol('⟇', 'RAPID_TOWER');

    chalk.level = previousLevel;

    expect(sniper).not.toBe(rapid);
  });
});
