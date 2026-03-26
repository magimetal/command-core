import type { GameState } from '../models/game-state';

export const calculateScore = (state: GameState): number => {
  const wavesCompleted = state.phase === 'VICTORY' ? state.runConfig.waves.length : state.wave - 1;
  const baseScore = Math.max(
    0,
      state.enemiesKilled * 12 +
      wavesCompleted * 100 +
      state.currency -
      (state.runConfig.startingBaseHp - state.baseHp) * 25
  );

  return Math.floor(baseScore * state.runConfig.modeMultiplier);
};
