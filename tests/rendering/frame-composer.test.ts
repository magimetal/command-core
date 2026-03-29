import { describe, expect, test } from 'vitest';
import { createOperationsRunConfig, OPERATIONS_MAP_DEFS } from '../../src/const/operations-maps';
import { EnemyArchetype } from '../../src/const/enemies';
import { TowerArchetype } from '../../src/const/towers';
import { colorizeGridSymbol, stripAnsi } from '../../src/rendering/color-map';
import { composeFrame } from '../../src/rendering/frame-composer';
import { getDisplayWidth } from '../../src/rendering/text-utils';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { generateAnomalyRunConfig } from '../../src/simulation/anomaly-gen';
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
    const modeSelectState = { ...createInitialState(), phase: 'MODE_SELECT' as const };
    const mapSelectState = { ...createInitialState(), phase: 'MAP_SELECT' as const };
    const prepState = { ...createInitialState(), phase: 'PREP' as const };
    const waveActiveState = { ...createInitialState(), phase: 'WAVE_ACTIVE' as const };
    const gameOverState = { ...createInitialState(), phase: 'GAME_OVER' as const };
    const victoryState = { ...createInitialState(), phase: 'VICTORY' as const };

    for (const state of [titleState, modeSelectState, mapSelectState, prepState, waveActiveState, gameOverState, victoryState]) {
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

    expect(frame).toContain('COMMAND CORE');
    expect(frame).toContain('Any key: Choose mode');
    expect(frame).toContain('Q: Quit');
    expect(frame).toContain('██████  ██████  ██████  ███████');
  });

  test('title scanline animation changes output between frame 0 and frame 3', () => {
    const previousLevel = chalk.level;
    chalk.level = 3;

    const base = createInitialState();
    const frameZero = composeFrame({ ...base, frame: 0 });
    const frameThree = composeFrame({ ...base, frame: 3 });

    chalk.level = previousLevel;

    expect(frameZero).not.toBe(frameThree);
  });

  test('reduced motion mode disables animated title scanline variation', () => {
    const previousReducedMotion = process.env.REDUCED_MOTION;
    const previousLevel = chalk.level;
    process.env.REDUCED_MOTION = '1';
    chalk.level = 3;

    const base = createInitialState();
    const frameZero = composeFrame({ ...base, frame: 0 });
    const frameThree = composeFrame({ ...base, frame: 3 });

    chalk.level = previousLevel;
    if (previousReducedMotion === undefined) {
      delete process.env.REDUCED_MOTION;
    } else {
      process.env.REDUCED_MOTION = previousReducedMotion;
    }

    expect(frameZero).toBe(frameThree);
  });

  test('renders cohesive title logo block with framed top and bottom rows', () => {
    const frame = stripAnsi(composeFrame(createInitialState()));

    expect(frame).toContain('╔══════════════════════════════════════════╗');
    expect(frame).toContain('██████  ██████  ██████  ███████');
    expect(frame).toContain('╚══════════════ COMMAND CORE ══════════════╝');
  });

  test('title logo left border stays vertically aligned from top to bottom', () => {
    const frame = stripAnsi(composeFrame(createInitialState()));
    const lines = frame.split('\n');
    const innerLines = lines.slice(1, -1).map((line) => line.slice(1, -1));
    const logoLines = innerLines.filter((line) => {
      return line.includes('╔') || line.includes('║') || line.includes('╚');
    });

    const firstBorderColumns = logoLines.map((line) => {
      const top = line.indexOf('╔');
      const middle = line.indexOf('║');
      const bottom = line.indexOf('╚');

      return Math.max(top, middle, bottom);
    });

    expect(new Set(firstBorderColumns).size).toBe(1);
  });

  test('title screen uses full frame width budget and keeps title art visible', () => {
    const frame = stripAnsi(composeFrame(createInitialState()));
    const lines = frame.split('\n');
    const width = Math.max(...lines.map((line) => line.length));
    const innerLines = lines.slice(1, -1).map((line) => line.slice(1, -1));
    const titleArtLine = innerLines.find((line) => line.includes('╚') && line.includes('COMMAND CORE'));

    expect(width).toBe(78);
    expect(titleArtLine).toBeDefined();
    expect(titleArtLine!.startsWith(' ')).toBe(true);
    expect(titleArtLine!.trimEnd().endsWith('╝')).toBe(true);
  });

  test('renders framed dashboard sections', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const
    };
    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('┌');
    expect(frame).toContain('[OPERATIONS]');
    expect(frame).toContain('Crossroads');
    expect(frame).toContain('Wave 1/15  [PREP]');
    expect(frame).toContain('❤ HP');
    expect(frame).toContain('✦ GOLD $120');
    expect(frame).toContain('≋ WAVE 1/15');
    expect(frame).toContain('Incoming: 7× ▸ Standard');
    expect(frame).toContain('Rapid $60');
    expect(frame).toContain('Cannon $100');
    expect(frame).toContain('Sniper $150');
    expect(frame).toContain('[4]⊗');
    expect(frame).toContain('░ = build zone');
    expect(frame).toContain(
      '[1-4] Tower  [↑↓←→] Move  [Enter] Place  [S] Sell  [Space] Start  [Q] Quit'
    );
    expect(frame).toContain('╌╌ Events');
    expect(frame).toContain('· No events yet');
  });

  test('renders crossroads path with multi-crossing lane geometry', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const
    };
    const frame = stripAnsi(composeFrame(state));
    const gridLines = getGridLines(frame);

    expect(getCellSymbol(gridLines[2], 0)).toBe('⟹');
    expect(getCellSymbol(gridLines[2], 24)).toBe('┬');
    expect(getCellSymbol(gridLines[13], 24)).toBe('┘');
    expect(getCellSymbol(gridLines[13], 4)).toBe('└');
    expect(getCellSymbol(gridLines[5], 4)).toBe('┌');
    expect(getCellSymbol(gridLines[5], 18)).toBe('┐');
    expect(getCellSymbol(gridLines[10], 18)).toBe('┘');
    expect(getCellSymbol(gridLines[10], 8)).toBe('└');
    expect(getCellSymbol(gridLines[2], 8)).toBe('┬');
    expect(getCellSymbol(gridLines[2], 30)).toBe('┐');
    expect(getCellSymbol(gridLines[10], 30)).toBe('└');
    expect(getCellSymbol(gridLines[13], 24)).toBe('┘');
    expect(getCellSymbol(gridLines[10], 33)).toBe('⬡');
    expect(getCellSymbol(gridLines[0], 1)).toBe('░');
    expect(getCellSymbol(gridLines[7], 1)).toBe('░');
  });

  test('renders BLOCKED obstacle glyph on grid for map with obstacles', () => {
    const map09 = OPERATIONS_MAP_DEFS.find((mapDef) => mapDef.id === 'map-09');
    expect(map09).toBeDefined();

    const runConfig = createOperationsRunConfig(map09!);
    const state = {
      ...createInitialState(runConfig),
      phase: 'PREP' as const
    };
    const frame = stripAnsi(composeFrame(state));
    const gridLines = getGridLines(frame);
    const gridContent = gridLines.join('');

    expect(gridContent).toContain('▪');
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

  test('renders PATH range preview marker in PREP when cursor is buildable', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      cursor: [1, 0] as [number, number],
      selectedTowerArchetype: TowerArchetype.RAPID
    };
    const frame = stripAnsi(composeFrame(state));
    const gridLines = getGridLines(frame);

    expect(getCellSymbol(gridLines[2], 1)).toBe('•');
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
    expect(frame).not.toContain('•');
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

  test('event log display shows only 2 most recent entries', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      towers: [
        {
          id: 'tower-rapid',
          archetype: TowerArchetype.RAPID,
          pos: [1, 1] as [number, number],
          cooldownRemaining: 0,
          kills: 0
        }
      ],
      eventLog: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'older event that should be hidden']
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('e1');
    expect(frame).toContain('e2');
    expect(frame).not.toContain('e3');
    expect(frame).not.toContain('e7');
    expect(frame).not.toContain('older event that should be hidden');
  });

  test('does not render PREP placement hint when towers are present', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      towers: [
        {
          id: 'tower-rapid',
          archetype: TowerArchetype.RAPID,
          pos: [1, 1] as [number, number],
          cooldownRemaining: 0,
          kills: 0
        }
      ]
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).not.toContain('░ = build zone');
  });

  test('renders selected tower stat tokens in PREP', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      selectedTowerArchetype: TowerArchetype.RAPID
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('Dmg 1  Rng 3');
  });

  test('non-selected tower does not show stats in PREP', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      selectedTowerArchetype: TowerArchetype.RAPID
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).not.toContain('Dmg 5  Rng 6');
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
    expect(frame).toContain('Base destroyed. Mission failed.');
    expect(frame).toContain('Enemies killed: 7');
    expect(frame).toContain('Gold remaining: 220');
    expect(frame).toContain('Score: 304');
    expect(frame).toContain('R: New Run');
    expect(frame).toContain('Q: Quit');
    expect(frame).toContain('┌');
  });

  test('reduced motion mode removes blinking quit cursor from end-state prompt', () => {
    const previousReducedMotion = process.env.REDUCED_MOTION;
    process.env.REDUCED_MOTION = '1';

    const state = {
      ...createInitialState(),
      phase: 'GAME_OVER' as const
    };

    const frame = composeFrame(state);

    if (previousReducedMotion === undefined) {
      delete process.env.REDUCED_MOTION;
    } else {
      process.env.REDUCED_MOTION = previousReducedMotion;
    }

    expect(frame).not.toContain('\u001b[5m');
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
    expect(frame).toContain('All waves cleared. Base secured.');
    expect(frame).toContain('Enemies killed: 18');
    expect(frame).toContain('Gold remaining: 305');
    expect(frame).toContain('Score: 2021');
    expect(frame).toContain('R: New Run');
    expect(frame).toContain('Q: Quit');
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
    const gridLines = getGridLines(frame);

    expect(frame).toContain('⟁');
    expect(frame).toContain('⊛');
    expect(getCellSymbol(gridLines[7], 1)).toBe('▸');
    expect(getCellSymbol(gridLines[7], 3)).toBe('■');
  });

  test('REDUCED_GLYPH=1 falls back to ASCII enemy symbols', () => {
    const previousReducedGlyph = process.env.REDUCED_GLYPH;
    process.env.REDUCED_GLYPH = '1';

    const base = createInitialState();
    const state = {
      ...base,
      phase: 'PREP' as const,
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
    const gridLines = getGridLines(frame);

    if (previousReducedGlyph === undefined) {
      delete process.env.REDUCED_GLYPH;
    } else {
      process.env.REDUCED_GLYPH = previousReducedGlyph;
    }

    expect(frame).toContain('Incoming: 7× S Standard');
    expect(getCellSymbol(gridLines[7], 1)).toBe('S');
    expect(getCellSymbol(gridLines[7], 3)).toBe('T');
  });

  test('event log display shows 2 most recent entries', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      towers: [
        {
          id: 'tower-rapid',
          archetype: TowerArchetype.RAPID,
          pos: [1, 1] as [number, number],
          cooldownRemaining: 0,
          kills: 0
        }
      ],
      eventLog: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'older event that should be hidden']
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('e1');
    expect(frame).toContain('e2');
    expect(frame).not.toContain('e3');
    expect(frame).not.toContain('e7');
    expect(frame).not.toContain('older event that should be hidden');
  });

  test('event log always renders exactly 2 entries in gameplay frame', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      eventLog: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7']
    };

    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('e1');
    expect(frame).toContain('e2');
    expect(frame).not.toContain('e3');
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

  test('gameplay frame height stays at ≤ 33 with WAVE_ACTIVE Threat Radar HUD', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      frame: 0,
      enemies: [
        {
          id: 'enemy-standard-1',
          archetype: EnemyArchetype.STANDARD,
          pos: [6, 2] as [number, number],
          pathIndex: 6,
          hp: 10,
          maxHp: 10,
          moveCooldown: 2,
          dead: false
        },
        {
          id: 'enemy-standard-2',
          archetype: EnemyArchetype.STANDARD,
          pos: [7, 2] as [number, number],
          pathIndex: 7,
          hp: 10,
          maxHp: 10,
          moveCooldown: 2,
          dead: false
        },
        {
          id: 'enemy-fast-1',
          archetype: EnemyArchetype.FAST,
          pos: [8, 2] as [number, number],
          pathIndex: 8,
          hp: 5,
          maxHp: 5,
          moveCooldown: 1,
          dead: false
        },
        {
          id: 'enemy-fast-2',
          archetype: EnemyArchetype.FAST,
          pos: [9, 2] as [number, number],
          pathIndex: 9,
          hp: 5,
          maxHp: 5,
          moveCooldown: 1,
          dead: false
        },
        {
          id: 'enemy-tank-1',
          archetype: EnemyArchetype.TANK,
          pos: [10, 2] as [number, number],
          pathIndex: 10,
          hp: 40,
          maxHp: 40,
          moveCooldown: 4,
          dead: false
        },
        {
          id: 'enemy-priority',
          archetype: EnemyArchetype.TANK,
          pos: [11, 2] as [number, number],
          pathIndex: 18,
          hp: 39,
          maxHp: 40,
          moveCooldown: 4,
          dead: false
        }
      ],
      eventLog: ['entry 1', 'entry 2', 'entry 3', 'entry 4', 'entry 5', 'entry 6', 'entry 7']
    };
    const frame = composeFrame(state);
    const lines = stripAnsi(frame).split('\n');

    expect(lines.length).toBeLessThanOrEqual(33);
  });

  test('WAVE_ACTIVE frame inner lines all within 76 chars', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      frame: 0,
      enemies: [
        {
          id: 'enemy-standard-1',
          archetype: EnemyArchetype.STANDARD,
          pos: [6, 2] as [number, number],
          pathIndex: 6,
          hp: 10,
          maxHp: 10,
          moveCooldown: 2,
          dead: false
        },
        {
          id: 'enemy-standard-2',
          archetype: EnemyArchetype.STANDARD,
          pos: [7, 2] as [number, number],
          pathIndex: 7,
          hp: 10,
          maxHp: 10,
          moveCooldown: 2,
          dead: false
        },
        {
          id: 'enemy-fast-1',
          archetype: EnemyArchetype.FAST,
          pos: [8, 2] as [number, number],
          pathIndex: 8,
          hp: 5,
          maxHp: 5,
          moveCooldown: 1,
          dead: false
        },
        {
          id: 'enemy-fast-2',
          archetype: EnemyArchetype.FAST,
          pos: [9, 2] as [number, number],
          pathIndex: 9,
          hp: 5,
          maxHp: 5,
          moveCooldown: 1,
          dead: false
        },
        {
          id: 'enemy-tank-1',
          archetype: EnemyArchetype.TANK,
          pos: [10, 2] as [number, number],
          pathIndex: 10,
          hp: 40,
          maxHp: 40,
          moveCooldown: 4,
          dead: false
        },
        {
          id: 'enemy-priority',
          archetype: EnemyArchetype.TANK,
          pos: [11, 2] as [number, number],
          pathIndex: 18,
          hp: 39,
          maxHp: 40,
          moveCooldown: 4,
          dead: false
        }
      ],
      eventLog: ['entry 1', 'entry 2', 'entry 3', 'entry 4', 'entry 5', 'entry 6', 'entry 7']
    };
    const frame = stripAnsi(composeFrame(state));
    const lines = frame.split('\n');
    const innerLines = lines.slice(1, -1).map((line) => line.slice(1, -1).trimEnd());

    for (const line of innerLines) {
      expect(getDisplayWidth(line)).toBeLessThanOrEqual(76);
    }
  });

  test('PREP frame height stays at ≤ 33 with placement hint and full 7-entry event log', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      towers: [],
      eventLog: ['entry 1', 'entry 2', 'entry 3', 'entry 4', 'entry 5', 'entry 6', 'entry 7']
    };
    const frame = composeFrame(state);
    const lines = stripAnsi(frame).split('\n');

    expect(lines.length).toBeLessThanOrEqual(33);
  });

  test('renders compact legend at terminalColumns: 70', () => {
    const state = { ...createInitialState(), phase: 'PREP' as const };
    const frame = stripAnsi(composeFrame(state, { terminalColumns: 70 }));
    const lines = frame.split('\n');
    const width = Math.max(...lines.map((line) => line.length));

    expect(frame).toContain('[↵]Place');
    expect(frame).toContain('[Spc]Start');
    expect(width).toBeLessThanOrEqual(72);
  });

  test('wide legend remains unchanged at terminalColumns: 78', () => {
    const state = { ...createInitialState(), phase: 'PREP' as const };
    const frame = stripAnsi(composeFrame(state, { terminalColumns: 78 }));

    expect(frame).toContain('[Enter] Place');
    expect(frame).toContain('[Space] Start');
    expect(frame).not.toContain('[↵]Place');
    expect(frame).not.toContain('[Spc]Start');
  });

  test('title screen renders at terminalColumns: 64', () => {
    const frame = stripAnsi(composeFrame(createInitialState(), { terminalColumns: 64 }));
    const lines = frame.split('\n');
    const width = Math.max(...lines.map((line) => line.length));

    expect(width).toBeLessThanOrEqual(66);
    expect(frame).toContain('COMMAND CORE');
    expect(frame).toContain('Any key: Choose mode');
  });

  test('mode-select renders at terminalColumns: 64', () => {
    const state = { ...createInitialState(), phase: 'MODE_SELECT' as const };
    const frame = stripAnsi(composeFrame(state, { terminalColumns: 64 }));
    const lines = frame.split('\n');
    const width = Math.max(...lines.map((line) => line.length));

    expect(width).toBeLessThanOrEqual(66);
    expect(frame).toContain('OPERATIONS');
    expect(frame).toContain('ANOMALY');
  });

  test('legendLine and selectedLine stay within 76-char inner budget', () => {
    const state = { ...createInitialState(), phase: 'PREP' as const };
    const frame = stripAnsi(composeFrame(state));
    const lines = frame.split('\n');
    const innerLines = lines.slice(1, -1).map((line) => line.slice(1, -1));
    const legendLine = innerLines.find((line) => line.includes('[1-4] Tower'));
    const selectedLine = innerLines.find((line) => line.includes('◎ ('));

    expect(legendLine).toBeDefined();
    expect(selectedLine).toBeDefined();
    expect(legendLine!.trimEnd().length).toBeLessThanOrEqual(76);
    expect(selectedLine!.trimEnd().length).toBeLessThanOrEqual(76);
  });

  test('selectedLine with stat tokens stays within 76-char inner budget', () => {
    const base = createInitialState();
    const state = {
      ...base,
      phase: 'PREP' as const,
      selectedTowerArchetype: TowerArchetype.RAPID,
      cursor: [33, 15] as [number, number],
      towers: [
        {
          id: 'tower-rapid',
          archetype: TowerArchetype.RAPID,
          pos: [1, 1] as [number, number],
          cooldownRemaining: 0,
          kills: 0
        }
      ]
    };
    const frame = stripAnsi(composeFrame(state));
    const lines = frame.split('\n');
    const innerLines = lines.slice(1, -1).map((line) => line.slice(1, -1));
    const selectedLine = innerLines.find((line) => line.includes('◎ ('));

    expect(selectedLine).toBeDefined();
    expect(getDisplayWidth(selectedLine!.trimEnd())).toBeLessThanOrEqual(76);
  });

  test('anomaly HUD legend uses dynamic 3-tower key range', () => {
    const anomalyConfig = generateAnomalyRunConfig(12);
    const state = {
      ...createInitialState(anomalyConfig),
      phase: 'PREP' as const
    };
    const frame = stripAnsi(composeFrame(state));

    expect(frame).toContain('[1-3] Tower');
    expect(frame).not.toContain('[1-4] Tower');
  });

  test('truncates excessively long map labels to preserve frame width budget', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      runConfig: {
        ...createInitialState().runConfig,
        mapLabel:
          'Anomaly #999999999999999999999999999999999999999999999999999999999999999999'
      }
    };

    const frame = stripAnsi(composeFrame(state));
    const lines = frame.split('\n');
    const width = Math.max(...lines.map((line) => line.length));

    expect(width).toBeLessThanOrEqual(78);
    expect(frame).toContain('Anomaly #');
    expect(frame).toContain('…');
  });

  test('shows narrow-pane guidance when terminal width cannot fit battlefield grid', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const
    };

    const frame = stripAnsi(composeFrame(state, { terminalColumns: 48 }));

    expect(frame).toContain('⚠  Battlefield is wider than this pane: need');
    expect(frame).toContain('Widen pane (tmux drag or C-b + ←→), or reduce');
  });

  test('keeps right border aligned when enemies occupy a single row', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      enemies: [
        {
          id: 'enemy-standard',
          archetype: EnemyArchetype.STANDARD,
          pos: [6, 2] as [number, number],
          pathIndex: 6,
          hp: 10,
          maxHp: 10,
          moveCooldown: 2,
          dead: false
        },
        {
          id: 'enemy-fast',
          archetype: EnemyArchetype.FAST,
          pos: [8, 2] as [number, number],
          pathIndex: 8,
          hp: 5,
          maxHp: 5,
          moveCooldown: 1,
          dead: false
        },
        {
          id: 'enemy-tank',
          archetype: EnemyArchetype.TANK,
          pos: [10, 2] as [number, number],
          pathIndex: 10,
          hp: 40,
          maxHp: 40,
          moveCooldown: 4,
          dead: false
        }
      ]
    };

    const frame = stripAnsi(composeFrame(state));
    const lineLengths = frame.split('\n').map((line) => line.length);
    const uniqueLengths = new Set(lineLengths);

    expect(uniqueLengths.size).toBe(1);
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
