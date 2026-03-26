import { describe, expect, test } from 'vitest';
import { TowerArchetype, TOWER_DEFS } from '../../src/const/towers';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { placeTower } from '../../src/simulation/tower-placement';
import { sellTower } from '../../src/simulation/tower-sell';

describe('sellTower', () => {
  test('removes tower and refunds 50% of cost', () => {
    const initial = { ...createInitialState(), phase: 'PREP' as const };
    const placed = placeTower(initial, [1, 1], TowerArchetype.RAPID);
    if ('error' in placed) {
      throw new Error('unexpected placement error');
    }

    const result = sellTower(placed, [1, 1]);
    if ('error' in result) {
      throw new Error('unexpected sell error');
    }

    expect(result.towers).toHaveLength(0);
    expect(result.grid[1][1].tower).toBeUndefined();
    expect(result.currency).toBe(
      initial.currency - TOWER_DEFS[TowerArchetype.RAPID].cost +
        Math.floor(TOWER_DEFS[TowerArchetype.RAPID].cost / 2)
    );
  });

  test('returns error when no tower at cursor', () => {
    const state = { ...createInitialState(), phase: 'PREP' as const };
    const result = sellTower(state, [1, 1]);
    expect(result).toEqual({ error: 'No tower to sell' });
  });

  test('returns error outside placement phase', () => {
    const initial = { ...createInitialState(), phase: 'PREP' as const };
    const placed = placeTower(initial, [1, 1], TowerArchetype.RAPID);
    if ('error' in placed) {
      throw new Error('unexpected placement error');
    }

    const activeState = { ...placed, phase: 'WAVE_ACTIVE' as const };
    const result = sellTower(activeState, [1, 1]);
    expect(result).toEqual({ error: 'Cannot sell outside of placement phase' });
  });

  test('sell then rebuy does not create currency exploit', () => {
    const initial = { ...createInitialState(), phase: 'PREP' as const };
    const placed = placeTower(initial, [1, 1], TowerArchetype.RAPID);
    if ('error' in placed) {
      throw new Error('unexpected placement error');
    }

    const sold = sellTower(placed, [1, 1]);
    if ('error' in sold) {
      throw new Error('unexpected sell error');
    }

    const rebought = placeTower(sold, [1, 1], TowerArchetype.RAPID);
    if ('error' in rebought) {
      throw new Error('unexpected rebuy placement error');
    }

    expect(rebought.currency).toBe(
      initial.currency - TOWER_DEFS[TowerArchetype.RAPID].cost +
        Math.floor(TOWER_DEFS[TowerArchetype.RAPID].cost / 2) -
        TOWER_DEFS[TowerArchetype.RAPID].cost
    );
    expect(rebought.towers).toHaveLength(1);
    expect(rebought.grid[1][1].tower).toBe(rebought.towers[0].id);
  });

  test('allows sell during WAVE_CLEAR phase', () => {
    const initial = { ...createInitialState(), phase: 'PREP' as const };
    const placed = placeTower(initial, [1, 1], TowerArchetype.RAPID);
    if ('error' in placed) {
      throw new Error('unexpected placement error');
    }

    const waveClearState = { ...placed, phase: 'WAVE_CLEAR' as const };
    const result = sellTower(waveClearState, [1, 1]);

    if ('error' in result) {
      throw new Error('unexpected sell error in WAVE_CLEAR');
    }

    expect(result.towers).toHaveLength(0);
    expect(result.grid[1][1].tower).toBeUndefined();
  });
});
