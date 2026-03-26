import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { getTowerDef, TowerArchetype } from '../../src/const/towers';
import { resolveCombat } from '../../src/simulation/combat';
import { tick } from '../../src/simulation/tick';
import { createEnemy, createState, createTower, pos } from '../helpers/builders';

describe('combat targeting', () => {
  test('getTowerDef resolves SLOW definition with slowDurationTicks=3', () => {
    const def = getTowerDef(TowerArchetype.SLOW);

    expect(def.slowDurationTicks).toBe(3);
    expect(def.symbol).toBe('⊗');
  });

  test('non-slow towers have slowDurationTicks=0', () => {
    expect(getTowerDef(TowerArchetype.RAPID).slowDurationTicks).toBe(0);
    expect(getTowerDef(TowerArchetype.CANNON).slowDurationTicks).toBe(0);
    expect(getTowerDef(TowerArchetype.SNIPER).slowDurationTicks).toBe(0);
  });

  test('tower with cooldownRemaining=0 damages enemy in range', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-1', archetype: TowerArchetype.RAPID, pos: pos(2, 6) })],
      enemies: [createEnemy({ pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBe(9);
    expect(result.towers[0].cooldownRemaining).toBe(2);
  });

  test('tower with cooldownRemaining>0 does not deal damage', () => {
    const state = createState({
      towers: [
        createTower({
          id: 'tower-1',
          archetype: TowerArchetype.RAPID,
          pos: pos(2, 6),
          cooldownRemaining: 1
        })
      ],
      enemies: [createEnemy({ pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBe(10);
    expect(result.towers[0].cooldownRemaining).toBe(0);
  });

  test('out-of-range enemy does not take damage', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-1', archetype: TowerArchetype.RAPID, pos: pos(15, 1) })],
      enemies: [createEnemy({ pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBe(10);
    expect(result.towers[0].cooldownRemaining).toBe(0);
  });

  test('RAPID and CANNON are observably distinct in damage and cooldown', () => {
    const rapidState = createState({
      towers: [createTower({ id: 'tower-r', archetype: TowerArchetype.RAPID, pos: pos(2, 6) })],
      enemies: [createEnemy({ id: 'enemy-r', pos: pos(2, 7), pathIndex: 2 })]
    });
    const cannonState = createState({
      towers: [createTower({ id: 'tower-c', archetype: TowerArchetype.CANNON, pos: pos(2, 6) })],
      enemies: [createEnemy({ id: 'enemy-c', pos: pos(2, 7), pathIndex: 2 })]
    });

    const rapidResult = resolveCombat(rapidState);
    const cannonResult = resolveCombat(cannonState);

    expect(rapidResult.enemies[0].hp).toBe(9);
    expect(cannonResult.enemies[0].hp).toBe(5);
    expect(rapidResult.towers[0].cooldownRemaining).toBe(2);
    expect(cannonResult.towers[0].cooldownRemaining).toBe(10);
  });

  test('moves enemies before combat resolution', () => {
    const state = createState({
      enemies: [
        createEnemy({
          id: 'enemy-order',
          archetype: EnemyArchetype.STANDARD,
          pos: pos(0, 2),
          pathIndex: 0,
          moveCooldown: 1
        })
      ],
      towers: [createTower({ id: 'tower-order', archetype: TowerArchetype.RAPID, pos: pos(4, 2) })]
    });

    const result = tick(state);

    expect(result.enemies[0].pathIndex).toBe(1);
    expect(result.enemies[0].hp).toBe(9);
  });
});
