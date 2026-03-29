import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { startWave } from '../../src/simulation/start-wave';
import { tick } from '../../src/simulation/tick';
import { advanceWave } from '../../src/simulation/wave-controller';
import { createEnemy, createState } from '../helpers/builders';

describe('wave controller', () => {
  test('in PREP phase, advanceWave returns unchanged state', () => {
    const initial = {
      ...createInitialState(),
      phase: 'PREP' as const
    };
    const result = advanceWave(initial);

    expect(result).toEqual(initial);
  });

  test('in WAVE_ACTIVE with spawn timer > 0, timer decrements', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      spawnQueue: [{ archetype: EnemyArchetype.STANDARD, spawnIntervalTicks: 15 }],
      spawnTimerTicks: 2
    };

    const result = advanceWave(state);

    expect(result.spawnTimerTicks).toBe(1);
    expect(result.enemies).toHaveLength(0);
  });

  test('spawn timer reaching 0 spawns next enemy', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      spawnQueue: [{ archetype: EnemyArchetype.STANDARD, spawnIntervalTicks: 15 }],
      spawnTimerTicks: 0
    };

    const result = advanceWave(state);

    expect(result.enemies).toHaveLength(1);
    expect(result.enemies[0].archetype).toBe(EnemyArchetype.STANDARD);
    expect(result.spawnQueue).toHaveLength(0);
    expect(result.spawnTimerTicks).toBe(15);
  });

  test('empty spawn queue + no live enemies transitions to WAVE_CLEAR', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      spawnQueue: [],
      enemies: []
    };

    const result = tick(state);

    expect(result.phase).toBe('WAVE_CLEAR');
  });

  test('WAVE_CLEAR on final wave transitions to VICTORY', () => {
    const stateBase = createInitialState();
    const state = {
      ...stateBase,
      wave: stateBase.runConfig.waves.length,
      phase: 'WAVE_CLEAR' as const
    };

    const result = advanceWave(state);

    expect(result.phase).toBe('VICTORY');
  });

  test('Space-triggered startWave loads queue and enters WAVE_ACTIVE', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const
    };
    const result = startWave(state);
    const expectedQueueSize = state.runConfig.waves[0].enemies.reduce(
      (sum, group) => sum + group.count,
      0
    );

    expect(result.phase).toBe('WAVE_ACTIVE');
    expect(result.spawnQueue.length).toBe(expectedQueueSize);
  });

  test('startWave interleaves archetypes from multi-group wave', () => {
    const baseState = createInitialState();
    const state = createState({
      phase: 'PREP',
      wave: 1,
      runConfig: {
        ...baseState.runConfig,
        waves: [
          {
            enemies: [
              { archetype: EnemyArchetype.STANDARD, count: 3, spawnIntervalTicks: 10 },
              { archetype: EnemyArchetype.FAST, count: 3, spawnIntervalTicks: 5 }
            ]
          }
        ]
      }
    });

    const result = startWave(state);

    expect(result.spawnQueue).toHaveLength(6);
    expect(result.spawnQueue.map((entry) => entry.archetype)).toEqual([
      EnemyArchetype.STANDARD,
      EnemyArchetype.FAST,
      EnemyArchetype.STANDARD,
      EnemyArchetype.FAST,
      EnemyArchetype.STANDARD,
      EnemyArchetype.FAST
    ]);
    expect(result.spawnQueue.map((entry) => entry.spawnIntervalTicks)).toEqual([10, 5, 10, 5, 10, 5]);
  });

  test('startWave total queue count is unchanged after interleaving', () => {
    const baseState = createInitialState();

    for (const waveIndex of [0, 4]) {
      const state = {
        ...baseState,
        phase: 'PREP' as const,
        wave: waveIndex + 1
      };
      const result = startWave(state);
      const expectedQueueSize = baseState.runConfig.waves[waveIndex].enemies.reduce(
        (sum, group) => sum + group.count,
        0
      );

      expect(result.spawnQueue.length).toBe(expectedQueueSize);
    }
  });

  test('multiple leaks in one tick reduce base HP cumulatively', () => {
    const enemyPath = createInitialState().runConfig.enemyPath;
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      spawnQueue: [],
      enemies: [
        createEnemy({
          id: 'enemy-standard',
          archetype: EnemyArchetype.STANDARD,
          pathIndex: enemyPath.length - 2,
          pos: enemyPath[enemyPath.length - 2],
          moveCooldown: 1
        }),
        createEnemy({
          id: 'enemy-tank',
          archetype: EnemyArchetype.TANK,
          pathIndex: enemyPath.length - 2,
          pos: enemyPath[enemyPath.length - 2],
          moveCooldown: 1
        })
      ]
    };

    const result = tick(state);

    expect(result.baseHp).toBe(state.baseHp - 4);
    expect(result.enemies).toHaveLength(0);
  });
});
