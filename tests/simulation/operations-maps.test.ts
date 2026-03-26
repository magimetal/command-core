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
    expect([baseCol, baseRow]).toEqual([33, 8]);

    expect(grid[spawnRow][spawnCol].type).toBe(CellType.SPAWN);
    expect(grid[baseRow][baseCol].type).toBe(CellType.BASE);
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
});
