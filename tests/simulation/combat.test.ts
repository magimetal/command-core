import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { TowerArchetype } from '../../src/const/towers';
import type { Enemy } from '../../src/models/enemy';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { resolveCombat } from '../../src/simulation/combat';
import { tick } from '../../src/simulation/tick';

const createEnemy = (overrides: Partial<Enemy> = {}): Enemy => {
  return {
    id: 'enemy-test',
    archetype: EnemyArchetype.STANDARD,
    pos: [2, 7],
    pathIndex: 2,
    hp: 10,
    maxHp: 10,
    moveCooldown: 1,
    dead: false,
    ...overrides
  };
};

describe('resolveCombat', () => {
  test('tower with cooldownRemaining=0 damages enemy in range', () => {
    const initial = createInitialState();
    const state = {
      ...initial,
      towers: [
        {
          id: 'tower-1',
          archetype: TowerArchetype.RAPID,
          pos: [2, 6] as [number, number],
          cooldownRemaining: 0
        }
      ],
      enemies: [createEnemy()]
    };

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBe(9);
    expect(result.towers[0].cooldownRemaining).toBe(2);
  });

  test('tower with cooldownRemaining>0 does not deal damage', () => {
    const initial = createInitialState();
    const state = {
      ...initial,
      towers: [
        {
          id: 'tower-1',
          archetype: TowerArchetype.RAPID,
          pos: [2, 6] as [number, number],
          cooldownRemaining: 1
        }
      ],
      enemies: [createEnemy()]
    };

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBe(10);
    expect(result.towers[0].cooldownRemaining).toBe(0);
  });

  test('enemy reduced to zero hp is flagged dead but not removed', () => {
    const initial = createInitialState();
    const state = {
      ...initial,
      towers: [
        {
          id: 'tower-1',
          archetype: TowerArchetype.CANNON,
          pos: [2, 6] as [number, number],
          cooldownRemaining: 0
        }
      ],
      enemies: [createEnemy({ hp: 5, maxHp: 5 })]
    };

    const result = resolveCombat(state);

    expect(result.enemies).toHaveLength(1);
    expect(result.enemies[0].dead).toBe(true);
    expect(result.enemies[0].hp).toBeLessThanOrEqual(0);
  });

  test('out-of-range enemy does not take damage', () => {
    const initial = createInitialState();
    const state = {
      ...initial,
      towers: [
        {
          id: 'tower-1',
          archetype: TowerArchetype.RAPID,
          pos: [15, 1] as [number, number],
          cooldownRemaining: 0
        }
      ],
      enemies: [createEnemy({ pos: [2, 7], pathIndex: 2 })]
    };

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBe(10);
    expect(result.towers[0].cooldownRemaining).toBe(0);
  });

  test('RAPID and CANNON are observably distinct in damage and cooldown', () => {
    const initial = createInitialState();
    const rapidState = {
      ...initial,
      towers: [
        {
          id: 'tower-r',
          archetype: TowerArchetype.RAPID,
          pos: [2, 6] as [number, number],
          cooldownRemaining: 0
        }
      ],
      enemies: [createEnemy({ id: 'enemy-r' })]
    };
    const cannonState = {
      ...initial,
      towers: [
        {
          id: 'tower-c',
          archetype: TowerArchetype.CANNON,
          pos: [2, 6] as [number, number],
          cooldownRemaining: 0
        }
      ],
      enemies: [createEnemy({ id: 'enemy-c' })]
    };

    const rapidResult = resolveCombat(rapidState);
    const cannonResult = resolveCombat(cannonState);

    expect(rapidResult.enemies[0].hp).toBe(9);
    expect(cannonResult.enemies[0].hp).toBe(5);
    expect(rapidResult.towers[0].cooldownRemaining).toBe(2);
    expect(cannonResult.towers[0].cooldownRemaining).toBe(10);
  });

  test('emits hit event only when HP threshold is crossed', () => {
    const initial = createInitialState();
    const state = {
      ...initial,
      towers: [
        {
          id: 'tower-1',
          archetype: TowerArchetype.CANNON,
          pos: [2, 6] as [number, number],
          cooldownRemaining: 0
        }
      ],
      enemies: [createEnemy({ archetype: EnemyArchetype.TANK, hp: 21, maxHp: 40 })]
    };

    const result = resolveCombat(state);

    expect(result.eventLog[0]).toBe('~ TANK hit  [██░░░] 16/40');
  });

  test('does not emit hit event when no HP threshold is crossed', () => {
    const initial = createInitialState();
    const state = {
      ...initial,
      towers: [
        {
          id: 'tower-1',
          archetype: TowerArchetype.CANNON,
          pos: [2, 6] as [number, number],
          cooldownRemaining: 0
        }
      ],
      enemies: [createEnemy({ archetype: EnemyArchetype.TANK, hp: 40, maxHp: 40 })]
    };

    const result = resolveCombat(state);

    expect(result.eventLog).toHaveLength(0);
  });
});

describe('tick order', () => {
  test('moves enemies before combat resolution', () => {
    const initial = createInitialState();
    const state = {
      ...initial,
      enemies: [
        createEnemy({
          id: 'enemy-order',
          pos: [0, 2],
          pathIndex: 0,
          hp: 10,
          maxHp: 10
        })
      ],
      towers: [
        {
          id: 'tower-order',
          archetype: TowerArchetype.RAPID,
          pos: [4, 2] as [number, number],
          cooldownRemaining: 0
        }
      ]
    };

    const result = tick(state);

    expect(result.enemies[0].pathIndex).toBe(1);
    expect(result.enemies[0].hp).toBe(9);
  });
});
