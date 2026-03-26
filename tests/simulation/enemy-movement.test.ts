import { describe, expect, test } from 'vitest';
import { ENEMY_DEFS, EnemyArchetype } from '../../src/const/enemies';
import { ENEMY_PATH } from '../../src/const/map';
import type { Enemy } from '../../src/models/enemy';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { advanceEnemies } from '../../src/simulation/enemy-movement';

const createEnemy = (overrides: Partial<Enemy> = {}): Enemy => {
  return {
    id: 'enemy-test',
    archetype: EnemyArchetype.STANDARD,
    pos: ENEMY_PATH[0],
    pathIndex: 0,
    hp: 10,
    maxHp: 10,
    moveCooldown: 2,
    dead: false,
    ...overrides
  };
};

describe('advanceEnemies', () => {
  test('FAST enemy archetype is defined with distinct symbol', () => {
    expect(ENEMY_DEFS[EnemyArchetype.FAST].symbol).toBe('▷');
    expect(ENEMY_DEFS[EnemyArchetype.FAST].symbol).not.toBe(ENEMY_DEFS[EnemyArchetype.STANDARD].symbol);
    expect(ENEMY_DEFS[EnemyArchetype.FAST].symbol).not.toBe(ENEMY_DEFS[EnemyArchetype.TANK].symbol);
  });

  test('moves STANDARD enemy every 2 ticks', () => {
    const initial = {
      ...createInitialState(),
      enemies: [createEnemy()]
    };
    const firstAdvance = advanceEnemies(initial);
    const secondAdvance = advanceEnemies(firstAdvance);

    expect(firstAdvance.enemies[0]?.pathIndex).toBe(0);
    expect(firstAdvance.enemies[0]?.moveCooldown).toBe(1);
    expect(secondAdvance.enemies[0]?.pathIndex).toBe(1);
    expect(secondAdvance.enemies[0]?.pos).toEqual(ENEMY_PATH[1]);
  });

  test('TANK leak applies leakDamage=3 and removes enemy', () => {
    const initial = {
      ...createInitialState(),
      enemies: [
        createEnemy({
          archetype: EnemyArchetype.TANK,
          pathIndex: ENEMY_PATH.length - 2,
          pos: ENEMY_PATH[ENEMY_PATH.length - 2],
          moveCooldown: 1
        })
      ]
    };
    const state = advanceEnemies(initial);

    expect(state.enemies).toHaveLength(0);
    expect(state.baseHp).toBe(initial.baseHp - 3);
  });

  test('STANDARD and TANK are behaviorally distinct in movement speed', () => {
    const initial = {
      ...createInitialState(),
      enemies: [
        createEnemy({ id: 'enemy-standard', archetype: EnemyArchetype.STANDARD, moveCooldown: 2 }),
        createEnemy({ id: 'enemy-tank', archetype: EnemyArchetype.TANK, moveCooldown: 4 })
      ]
    };

    const firstAdvance = advanceEnemies(initial);
    const secondAdvance = advanceEnemies(firstAdvance);

    const standard = secondAdvance.enemies.find((enemy) => enemy.id === 'enemy-standard');
    const tank = secondAdvance.enemies.find((enemy) => enemy.id === 'enemy-tank');

    expect(standard?.pathIndex).toBe(1);
    expect(tank?.pathIndex).toBe(0);
  });

  test('FAST enemy moves every tick (speed = 1)', () => {
    const initial = {
      ...createInitialState(),
      enemies: [
        createEnemy({
          id: 'enemy-fast',
          archetype: EnemyArchetype.FAST,
          moveCooldown: 1
        })
      ]
    };

    const firstAdvance = advanceEnemies(initial);
    const secondAdvance = advanceEnemies(firstAdvance);

    expect(firstAdvance.enemies[0]?.pathIndex).toBe(1);
    expect(secondAdvance.enemies[0]?.pathIndex).toBe(2);
  });

  test('does not remove dead enemies during movement step', () => {
    const initial = createInitialState();
    const state = {
      ...initial,
      enemies: [
        {
          ...createEnemy(),
          dead: true,
          pathIndex: 3,
          pos: ENEMY_PATH[3],
          moveCooldown: 1
        }
      ]
    };

    const advanced = advanceEnemies(state);

    expect(advanced.enemies).toHaveLength(1);
    expect(advanced.enemies[0].dead).toBe(true);
    expect(advanced.enemies[0].pathIndex).toBe(3);
    expect(advanced.enemies[0].pos).toEqual(ENEMY_PATH[3]);
    expect(advanced.baseHp).toBe(state.baseHp);
  });
});
