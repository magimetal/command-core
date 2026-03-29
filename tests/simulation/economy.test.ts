import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { tick } from '../../src/simulation/tick';

describe('economy', () => {
  test('enemy removed with reward=10 increases currency by 10', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      spawnQueue: [],
      enemies: [
        {
          id: 'enemy-dead',
          archetype: EnemyArchetype.STANDARD,
          pos: [2, 7] as [number, number],
          pathIndex: 2,
          hp: 0,
          maxHp: 10,
          moveCooldown: 1,
          dead: true
        }
      ]
    };

    const result = tick(state);

    expect(result.currency).toBe(state.currency + 10);
    expect(result.enemies).toHaveLength(0);
  });

  test('FAST enemy removed with reward=4 increases currency by 4', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      spawnQueue: [],
      enemies: [
        {
          id: 'enemy-fast-dead',
          archetype: EnemyArchetype.FAST,
          pos: [2, 7] as [number, number],
          pathIndex: 2,
          hp: 0,
          maxHp: 5,
          moveCooldown: 1,
          dead: true
        }
      ]
    };

    const result = tick(state);

    expect(result.currency).toBe(state.currency + 4);
    expect(result.enemies).toHaveLength(0);
  });

  test('TANK leak with leakDamage=3 reduces base HP by 3', () => {
    const enemyPath = createInitialState().runConfig.enemyPath;
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      spawnQueue: [],
      enemies: [
        {
          id: 'enemy-tank',
          archetype: EnemyArchetype.TANK,
          pos: enemyPath[enemyPath.length - 2],
          pathIndex: enemyPath.length - 2,
          hp: 40,
          maxHp: 40,
          moveCooldown: 1,
          dead: false
        }
      ]
    };

    const result = tick(state);

    expect(result.baseHp).toBe(state.baseHp - 3);
    expect(result.enemies).toHaveLength(0);
  });

  test('BRUTE leak with leakDamage=5 reduces base HP by 5', () => {
    const enemyPath = createInitialState().runConfig.enemyPath;
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      spawnQueue: [],
      enemies: [
        {
          id: 'enemy-brute',
          archetype: EnemyArchetype.BRUTE,
          pos: enemyPath[enemyPath.length - 2],
          pathIndex: enemyPath.length - 2,
          hp: 80,
          maxHp: 80,
          moveCooldown: 1,
          dead: false
        }
      ]
    };

    const result = tick(state);

    expect(result.baseHp).toBe(state.baseHp - 5);
    expect(result.enemies).toHaveLength(0);
  });

  test('COLOSSUS leak with leakDamage=8 reduces base HP by 8', () => {
    const enemyPath = createInitialState().runConfig.enemyPath;
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      spawnQueue: [],
      enemies: [
        {
          id: 'enemy-colossus',
          archetype: EnemyArchetype.COLOSSUS,
          pos: enemyPath[enemyPath.length - 2],
          pathIndex: enemyPath.length - 2,
          hp: 150,
          maxHp: 150,
          moveCooldown: 1,
          dead: false
        }
      ]
    };

    const result = tick(state);

    expect(result.baseHp).toBe(state.baseHp - 8);
    expect(result.enemies).toHaveLength(0);
  });

  test('adds updated streak message at 5-kill milestone', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      enemiesKilled: 4,
      spawnQueue: [],
      enemies: [
        {
          id: 'enemy-dead',
          archetype: EnemyArchetype.STANDARD,
          pos: [2, 7] as [number, number],
          pathIndex: 2,
          hp: 0,
          maxHp: 10,
          moveCooldown: 1,
          dead: true
        }
      ]
    };

    const result = tick(state);

    expect(result.enemiesKilled).toBe(5);
    expect(result.eventLog[0]).toBe('★ STREAK  5 kills — defense holding');
  });
});
