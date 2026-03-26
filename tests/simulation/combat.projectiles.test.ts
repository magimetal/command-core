import { describe, expect, test } from 'vitest';
import { TowerArchetype } from '../../src/const/towers';
import { resolveCombat } from '../../src/simulation/combat';
import { tick } from '../../src/simulation/tick';
import { createEnemy, createState, createTower, pos } from '../helpers/builders';

describe('combat projectiles', () => {
  test('firing tower emits one projectile at tower position', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-1', archetype: TowerArchetype.RAPID, pos: pos(2, 6) })],
      enemies: [createEnemy({ pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.projectiles).toHaveLength(1);
    expect(result.projectiles[0].pos).toEqual([2, 6]);
    expect(result.projectiles[0].ttl).toBe(2);
  });

  test('projectile advances one step toward target on next call', () => {
    const state = createState({
      projectiles: [
        {
          id: 'proj-t1-0',
          pos: pos(2, 6),
          targetPos: pos(5, 6),
          archetype: TowerArchetype.RAPID,
          symbol: '·',
          ttl: 2
        }
      ],
      towers: [],
      enemies: []
    });

    const result = resolveCombat(state);

    expect(result.projectiles[0].pos).toEqual([3, 6]);
    expect(result.projectiles[0].ttl).toBe(1);
  });

  test('projectile advance runs once regardless of tower count', () => {
    const state = createState({
      projectiles: [
        {
          id: 'proj-t1-0',
          pos: pos(2, 6),
          targetPos: pos(5, 6),
          archetype: TowerArchetype.RAPID,
          symbol: '·',
          ttl: 2
        }
      ],
      towers: [
        createTower({ id: 'tower-1', archetype: TowerArchetype.RAPID, pos: pos(2, 4), cooldownRemaining: 1 }),
        createTower({
          id: 'tower-2',
          archetype: TowerArchetype.CANNON,
          pos: pos(2, 3),
          cooldownRemaining: 1
        })
      ],
      enemies: []
    });

    const result = resolveCombat(state);

    expect(result.projectiles[0].pos).toEqual([3, 6]);
  });

  test('cleanup removes projectiles with ttl <= 0', () => {
    const state = createState({
      phase: 'WAVE_ACTIVE',
      projectiles: [
        {
          id: 'proj-dying',
          pos: pos(2, 6),
          targetPos: pos(3, 6),
          archetype: TowerArchetype.RAPID,
          symbol: '·',
          ttl: 1
        }
      ],
      towers: [],
      enemies: []
    });

    const result = tick(state);

    expect(result.projectiles.filter((projectile) => projectile.id === 'proj-dying')).toHaveLength(0);
  });

  test('projectiles do not affect enemy hp', () => {
    const state = createState({
      projectiles: [
        {
          id: 'proj-t1-0',
          pos: pos(2, 7),
          targetPos: pos(2, 7),
          archetype: TowerArchetype.RAPID,
          symbol: '·',
          ttl: 1
        }
      ],
      towers: [],
      enemies: [createEnemy({ pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBe(10);
  });
});
