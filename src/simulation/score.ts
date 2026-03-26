import { STARTING_BASE_HP } from '../const/game';
import { WAVES } from '../const/waves';
import type { GameState } from '../models/game-state';

export const calculateScore = (state: GameState): number => {
  const wavesCompleted = state.phase === 'VICTORY' ? WAVES.length : state.wave - 1;

  return Math.max(
    0,
    state.enemiesKilled * 12 +
      wavesCompleted * 100 +
      state.currency -
      (STARTING_BASE_HP - state.baseHp) * 25
  );
};
