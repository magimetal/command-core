import { describe, expect, test } from 'vitest';
import { createOperationsRunConfig, OPERATIONS_MAP_DEFS } from '../../src/const/operations-maps';
import type { GameState } from '../../src/models/game-state';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { generateAnomalyRunConfig } from '../../src/simulation/anomaly-gen';
import { calculateScore } from '../../src/simulation/score';
import { startWave } from '../../src/simulation/start-wave';
import { tick } from '../../src/simulation/tick';

const simulateToVictory = (initialState: GameState): GameState => {
  let state = initialState;

  while (state.phase !== 'VICTORY') {
    if (state.phase === 'PREP') {
      state = startWave(state);
      continue;
    }

    if (state.phase === 'WAVE_ACTIVE') {
      state = {
        ...state,
        spawnQueue: [],
        enemies: []
      };
    }

    state = tick(state);
  }

  return state;
};

describe('run config routing', () => {
  test('Map 01 operations run reaches VICTORY via tick routing', () => {
    const operations = createOperationsRunConfig(OPERATIONS_MAP_DEFS[0]);
    const final = simulateToVictory({ ...createInitialState(operations), phase: 'PREP' });

    expect(final.phase).toBe('VICTORY');
  });

  test('fixed-seed anomaly run reaches VICTORY via tick routing', () => {
    const anomaly = generateAnomalyRunConfig(42);
    const final = simulateToVictory({ ...createInitialState(anomaly), phase: 'PREP' });

    expect(final.phase).toBe('VICTORY');
  });

  test('calculateScore uses 1.0x multiplier for operations and 1.5x for anomaly', () => {
    const operations = createOperationsRunConfig(OPERATIONS_MAP_DEFS[0]);
    const anomaly = generateAnomalyRunConfig(7);
    const baseState = {
      phase: 'VICTORY' as const,
      enemiesKilled: 20,
      currency: 300,
      baseHp: operations.startingBaseHp,
      wave: 1
    };

    const operationsScore = calculateScore({
      ...createInitialState(operations),
      ...baseState
    });
    const anomalyScore = calculateScore({
      ...createInitialState(anomaly),
      ...baseState,
      runConfig: {
        ...anomaly,
        startingBaseHp: operations.startingBaseHp,
        waves: operations.waves
      }
    });

    const expectedBase = 20 * 12 + operations.waves.length * 100 + 300;
    expect(operationsScore).toBe(expectedBase);
    expect(anomalyScore).toBe(Math.floor(operationsScore * 1.5));
  });
});
