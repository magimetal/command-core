import { describe, expect, test } from 'vitest';
import { TowerArchetype, TOWER_DEFS } from '../../src/const/towers';
import { placeTower } from '../../src/simulation/tower-placement';
import { createInitialState } from '../../src/simulation/create-initial-state';

describe('placeTower', () => {
  test('places on BUILDABLE with sufficient currency and deducts cost', () => {
    const initial = createInitialState();
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
    const initial = createInitialState();
    const result = placeTower(initial, [1, 2], TowerArchetype.RAPID);

    expect(result).toEqual({ error: 'Cell is not buildable' });
  });

  test('rejects placement with insufficient currency', () => {
    const initial = createInitialState();
    const state = {
      ...initial,
      currency: 0
    };
    const result = placeTower(state, [1, 1], TowerArchetype.CANNON);

    expect(result).toEqual({ error: 'Insufficient currency' });
  });

  test('rejects placement on occupied cell', () => {
    const initial = createInitialState();
    const firstPlacement = placeTower(initial, [1, 1], TowerArchetype.RAPID);

    expect('error' in firstPlacement).toBe(false);

    if ('error' in firstPlacement) {
      return;
    }

    const secondPlacement = placeTower(firstPlacement, [1, 1], TowerArchetype.RAPID);

    expect(secondPlacement).toEqual({ error: 'Cell already occupied' });
  });
});
