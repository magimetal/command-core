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
