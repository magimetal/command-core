import { describe, expect, test } from 'vitest';
import { CellType } from '../../src/models/cell';
import {
  createOperationsRunConfig,
  OPERATIONS_MAP_DEFS
} from '../../src/const/operations-maps';
import type { GameState } from '../../src/models/game-state';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { startWave } from '../../src/simulation/start-wave';
import { tick } from '../../src/simulation/tick';

const isAdjacent = (a: [number, number], b: [number, number]): boolean => {
  const deltaCol = Math.abs(a[0] - b[0]);
  const deltaRow = Math.abs(a[1] - b[1]);
  return deltaCol + deltaRow === 1;
};

describe('operations maps', () => {
  test('Operations mode exposes 10 playable maps', () => {
    expect(OPERATIONS_MAP_DEFS).toHaveLength(10);
  });

  test('Map 02 path is contiguous, bounded, and marked spawn/base correctly', () => {
    const map02 = OPERATIONS_MAP_DEFS.find((mapDef) => mapDef.id === 'map-02');
    expect(map02).toBeDefined();

    const enemyPath = map02!.createEnemyPath();
    const grid = map02!.createGrid();

    for (let index = 1; index < enemyPath.length; index += 1) {
      expect(isAdjacent(enemyPath[index - 1], enemyPath[index])).toBe(true);
    }

    enemyPath.forEach(([col, row]) => {
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThanOrEqual(15);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThanOrEqual(33);
    });

    const [spawnCol, spawnRow] = enemyPath[0];
    const [baseCol, baseRow] = enemyPath[enemyPath.length - 1];

    expect([spawnCol, spawnRow]).toEqual([0, 8]);
    expect([baseCol, baseRow]).toEqual([33, 14]);

    expect(grid[spawnRow][spawnCol].type).toBe(CellType.SPAWN);
    expect(grid[baseRow][baseCol].type).toBe(CellType.BASE);

    const pathSet = new Set(enemyPath.map(([col, row]) => `${col},${row}`));
    for (let row = 0; row < 16; row += 1) {
      for (let col = 0; col < 34; col += 1) {
        if (grid[row][col].type === CellType.BLOCKED) {
          expect(pathSet.has(`${col},${row}`)).toBe(false);
        }
      }
    }

    expect(enemyPath.length).toBeGreaterThanOrEqual(45);
  });

  test('Map 02 run can progress to VICTORY through full wave cycle routing', () => {
    const map02 = OPERATIONS_MAP_DEFS.find((mapDef) => mapDef.id === 'map-02');
    const runConfig = createOperationsRunConfig(map02!);
    let state: GameState = {
      ...createInitialState(runConfig),
      phase: 'PREP'
    };

    while (state.phase !== 'VICTORY') {
      if (state.phase === 'PREP') {
        state = startWave(state);
        continue;
      }

      if (state.phase === 'WAVE_ACTIVE') {
        state = {
          ...state,
          spawnQueue: [],
          enemies: []
        };
      }

      state = tick(state);
    }

    expect(state.phase).toBe('VICTORY');
  });

  const newMapSpecs: Array<{
    id: string;
    spawn: [number, number];
    base: [number, number];
    minLength: number;
  }> = [
    { id: 'map-01', spawn: [0, 2], base: [33, 10], minLength: 120 },
    { id: 'map-03', spawn: [0, 0], base: [0, 9], minLength: 180 },
    { id: 'map-04', spawn: [0, 2], base: [33, 12], minLength: 94 },
    { id: 'map-05', spawn: [0, 1], base: [33, 1], minLength: 120 },
    { id: 'map-06', spawn: [33, 3], base: [0, 3], minLength: 100 },
    { id: 'map-07', spawn: [0, 1], base: [33, 15], minLength: 130 },
    { id: 'map-08', spawn: [0, 8], base: [33, 12], minLength: 70 },
    { id: 'map-09', spawn: [0, 7], base: [33, 7], minLength: 34 },
    { id: 'map-10', spawn: [0, 2], base: [33, 10], minLength: 90 }
  ];

  const crossingMapIds = new Set(['map-01', 'map-03', 'map-05', 'map-06', 'map-10']);

  const getMapDef = (id: string) => {
    const mapDef = OPERATIONS_MAP_DEFS.find((entry) => entry.id === id);
    expect(mapDef).toBeDefined();

    if (mapDef === undefined) {
      throw new Error(`Missing map definition: ${id}`);
    }

    return mapDef;
  };

  newMapSpecs.forEach(({ id, spawn, base, minLength }) => {
    test(`${id} path is contiguous, bounded, and marks spawn/base`, () => {
      const mapDef = getMapDef(id);
      const enemyPath = mapDef.createEnemyPath();
      const grid = mapDef.createGrid();

      for (let index = 1; index < enemyPath.length; index += 1) {
        expect(isAdjacent(enemyPath[index - 1], enemyPath[index])).toBe(true);
      }

      enemyPath.forEach(([col, row]) => {
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThanOrEqual(33);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThanOrEqual(15);
      });

      const cellKeys = enemyPath.map(([col, row]) => `${col},${row}`);
      const uniqueKeys = new Set(cellKeys);
      if (crossingMapIds.has(id)) {
        expect(uniqueKeys.size).toBeLessThan(enemyPath.length);
        expect(enemyPath.length - uniqueKeys.size).toBeGreaterThanOrEqual(1);
      } else {
        expect(uniqueKeys.size).toBe(enemyPath.length);
      }

      const pathSet = new Set(enemyPath.map(([col, row]) => `${col},${row}`));
      for (let row = 0; row < 16; row += 1) {
        for (let col = 0; col < 34; col += 1) {
          if (grid[row][col].type === CellType.BLOCKED) {
            expect(pathSet.has(`${col},${row}`)).toBe(false);
          }
        }
      }

      const [spawnCol, spawnRow] = enemyPath[0];
      const [baseCol, baseRow] = enemyPath[enemyPath.length - 1];

      expect([spawnCol, spawnRow]).toEqual(spawn);
      expect([baseCol, baseRow]).toEqual(base);
      expect(grid[spawnRow][spawnCol].type).toBe(CellType.SPAWN);
      expect(grid[baseRow][baseCol].type).toBe(CellType.BASE);
      expect(enemyPath.length).toBeGreaterThanOrEqual(minLength);
    });

    test(`${id} run can progress to VICTORY through full wave cycle routing`, () => {
      const mapDef = getMapDef(id);
      const runConfig = createOperationsRunConfig(mapDef);
      let state: GameState = {
        ...createInitialState(runConfig),
        phase: 'PREP'
      };

      while (state.phase !== 'VICTORY') {
        if (state.phase === 'PREP') {
          state = startWave(state);
          continue;
        }

        if (state.phase === 'WAVE_ACTIVE') {
          state = {
            ...state,
            spawnQueue: [],
            enemies: []
          };
        }

        state = tick(state);
      }

      expect(state.phase).toBe('VICTORY');
    });
  });
});
