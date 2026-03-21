import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { WAVES } from '../../src/const/waves';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { startWave } from '../../src/simulation/start-wave';
import { tick } from '../../src/simulation/tick';
import { advanceWave } from '../../src/simulation/wave-controller';

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
    const state = {
      ...createInitialState(),
      wave: WAVES.length,
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

    expect(result.phase).toBe('WAVE_ACTIVE');
    expect(result.spawnQueue.length).toBe(5);
  });
});
