import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { TowerArchetype } from '../../src/const/towers';
import type { Enemy } from '../../src/models/enemy';
import { resolveCombat } from '../../src/simulation/combat';
import { createEnemy, createState, createTower, pos } from '../helpers/builders';

describe('combat damage and effects', () => {
  test('enemy reduced to zero hp is flagged dead but not removed', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-1', archetype: TowerArchetype.CANNON, pos: pos(2, 6) })],
      enemies: [createEnemy({ hp: 5, maxHp: 5, pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.enemies).toHaveLength(1);
    expect(result.enemies[0].dead).toBe(true);
    expect(result.enemies[0].hp).toBeLessThanOrEqual(0);
  });

  test('emits hit event only when HP threshold is crossed', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-1', archetype: TowerArchetype.CANNON, pos: pos(2, 6) })],
      enemies: [
        createEnemy({
          archetype: EnemyArchetype.TANK,
          hp: 21,
          maxHp: 40,
          pos: pos(2, 7),
          pathIndex: 2
        })
      ]
    });

    const result = resolveCombat(state);

    expect(result.eventLog[0]).toBe('~ TANK hit  [██░░░] 16/40');
  });

  test('does not emit hit event when no HP threshold is crossed', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-1', archetype: TowerArchetype.CANNON, pos: pos(2, 6) })],
      enemies: [
        createEnemy({
          archetype: EnemyArchetype.TANK,
          hp: 40,
          maxHp: 40,
          pos: pos(2, 7),
          pathIndex: 2
        })
      ]
    });

    const result = resolveCombat(state);

    expect(result.eventLog).toHaveLength(0);
  });

  test('SLOW tower sets moveCooldown on hit enemy', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-slow', archetype: TowerArchetype.SLOW, pos: pos(2, 6) })],
      enemies: [createEnemy({ moveCooldown: 1, pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.enemies[0].moveCooldown).toBeGreaterThanOrEqual(3);
  });

  test('SLOW tower does NOT set moveCooldown when slowDurationTicks is 0', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-cannon', archetype: TowerArchetype.CANNON, pos: pos(2, 6) })],
      enemies: [createEnemy({ moveCooldown: 1, pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.enemies[0].moveCooldown).toBe(1);
  });

  test('tower.kills increments when enemy is killed in a single hit', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-kill', archetype: TowerArchetype.CANNON, pos: pos(2, 6) })],
      enemies: [createEnemy({ hp: 5, maxHp: 5, pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.towers[0].kills).toBe(1);
  });

  test('tower.kills does not increment when enemy survives the hit', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-hit', archetype: TowerArchetype.RAPID, pos: pos(2, 6) })],
      enemies: [createEnemy({ hp: 10, maxHp: 10, pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.towers[0].kills).toBe(0);
  });

  test('tower.kills does not increment when tower is on cooldown', () => {
    const state = createState({
      towers: [
        createTower({
          id: 'tower-cd',
          archetype: TowerArchetype.CANNON,
          pos: pos(2, 6),
          cooldownRemaining: 1
        })
      ],
      enemies: [createEnemy({ hp: 5, maxHp: 5, pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.towers[0].kills).toBe(0);
  });

  test('tower.kills does not increment when no enemy is in range', () => {
    const state = createState({
      towers: [createTower({ id: 'tower-far', archetype: TowerArchetype.CANNON, pos: pos(20, 0) })],
      enemies: [createEnemy({ hp: 5, maxHp: 5, pos: pos(2, 7), pathIndex: 2 })]
    });

    const result = resolveCombat(state);

    expect(result.towers[0].kills).toBe(0);
  });

  test('resolveCombat does not mutate original enemy nested fields', () => {
    const nestedEnemy: Enemy & { statusEffects: string[] } = {
      ...createEnemy({ id: 'enemy-nested', pos: pos(2, 7), pathIndex: 2 }),
      statusEffects: ['marked']
    };
    const state = createState({
      towers: [createTower({ id: 'tower-1', archetype: TowerArchetype.RAPID, pos: pos(2, 6) })],
      enemies: [nestedEnemy]
    });

    const result = resolveCombat(state);
    const updatedEnemy = result.enemies.find(
      (enemy) => enemy.id === 'enemy-nested'
    ) as (Enemy & { statusEffects?: string[] }) | undefined;

    expect(nestedEnemy.hp).toBe(10);
    expect(nestedEnemy.statusEffects).toEqual(['marked']);
    expect(updatedEnemy?.hp).toBe(9);
    expect(updatedEnemy?.statusEffects).toEqual(['marked']);
  });
});
