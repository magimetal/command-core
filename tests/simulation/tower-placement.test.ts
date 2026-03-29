import { describe, expect, test } from 'vitest';
import { TowerArchetype, TOWER_DEFS } from '../../src/const/towers';
import { CellType } from '../../src/models/cell';
import { placeTower, PlacementErrorCode } from '../../src/simulation/tower-placement';
import { createState } from '../helpers/builders';

describe('placeTower', () => {
  test('places on BUILDABLE with sufficient currency and deducts cost', () => {
    const initial = createState();
    const result = placeTower(initial, [1, 1], TowerArchetype.RAPID);

    expect('error' in result).toBe(false);

    if ('error' in result) {
      return;
    }

    expect(result.towers).toHaveLength(1);
    expect(result.currency).toBe(initial.currency - TOWER_DEFS[TowerArchetype.RAPID].cost);
    expect(result.grid[1][1].tower).toBeDefined();
  });

  test('rejects placement on PATH', () => {
    const initial = createState();
    const result = placeTower(initial, [1, 2], TowerArchetype.RAPID);

    expect(result).toEqual({ error: PlacementErrorCode.NOT_BUILDABLE });
  });

  test('rejects placement on BLOCKED (obstacle) cell with OBSTACLE error code', () => {
    const initial = createState();
    const stateWithObstacle = {
      ...initial,
      grid: initial.grid.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === 3 && colIndex === 3 ? { ...cell, type: CellType.BLOCKED } : cell
        )
      )
    };

    const result = placeTower(stateWithObstacle, [3, 3], TowerArchetype.RAPID);

    expect(result).toEqual({ error: PlacementErrorCode.OBSTACLE });
  });

  test('rejects placement with insufficient currency', () => {
    const initial = createState();
    const state = {
      ...initial,
      currency: 0
    };
    const result = placeTower(state, [1, 1], TowerArchetype.CANNON);

    expect(result).toEqual({ error: PlacementErrorCode.INSUFFICIENT_CURRENCY });
  });

  test('rejects placement on occupied cell', () => {
    const initial = createState();
    const firstPlacement = placeTower(initial, [1, 1], TowerArchetype.RAPID);

    expect('error' in firstPlacement).toBe(false);

    if ('error' in firstPlacement) {
      return;
    }

    const secondPlacement = placeTower(firstPlacement, [1, 1], TowerArchetype.RAPID);

    expect(secondPlacement).toEqual({ error: PlacementErrorCode.OCCUPIED });
  });
});
