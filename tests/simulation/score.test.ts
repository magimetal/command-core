import { describe, expect, test } from 'vitest';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { calculateScore } from '../../src/simulation/score';

describe('calculateScore', () => {
  test('calculateScore returns 0 for a GAME_OVER state with no progress', () => {
    const score = calculateScore({
      ...createInitialState(),
      phase: 'GAME_OVER' as const,
      currency: 0,
      enemiesKilled: 0,
      baseHp: 0,
      wave: 1
    });

    expect(score).toBe(0);
  });

  test('calculateScore applies leak penalty: hp loss reduces score by 25 per HP', () => {
    const base = {
      ...createInitialState(),
      phase: 'GAME_OVER' as const,
      enemiesKilled: 10,
      currency: 200,
      wave: 3
    };

    const fullHp = calculateScore({ ...base, baseHp: base.runConfig.startingBaseHp });
    const lostThreeHp = calculateScore({ ...base, baseHp: base.runConfig.startingBaseHp - 3 });

    expect(fullHp - lostThreeHp).toBe(75);
  });

  test('calculateScore uses WAVES.length for wavesCompleted on VICTORY', () => {
    const state = createInitialState();
    const score = calculateScore({
      ...state,
      phase: 'VICTORY' as const,
      enemiesKilled: 18,
      currency: 305,
      baseHp: state.runConfig.startingBaseHp,
      wave: 1
    });

    expect(score).toBe(18 * 12 + state.runConfig.waves.length * 100 + 305);
  });

  test('calculateScore uses wave-1 for wavesCompleted on GAME_OVER mid-game', () => {
    const state = createInitialState();
    const score = calculateScore({
      ...state,
      phase: 'GAME_OVER' as const,
      enemiesKilled: 7,
      currency: 220,
      baseHp: state.runConfig.startingBaseHp,
      wave: 4
    });

    expect(score).toBe(7 * 12 + 3 * 100 + 220);
  });

  test('wave 0 state does not produce NaN score', () => {
    const score = calculateScore({
      ...createInitialState(),
      phase: 'GAME_OVER',
      wave: 0
    });

    expect(Number.isNaN(score)).toBe(false);
  });
});
