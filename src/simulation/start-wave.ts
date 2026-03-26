import type { GameState } from '../models/game-state';

export const startWave = (state: GameState): GameState => {
  if (state.phase !== 'PREP') {
    return state;
  }

  const waveDefinition = state.runConfig.waves[state.wave - 1];

  if (waveDefinition === undefined) {
    return {
      ...state,
      phase: 'VICTORY'
    };
  }

  const spawnQueue = waveDefinition.enemies.flatMap((group) =>
    Array.from({ length: group.count }, () => ({
      archetype: group.archetype,
      spawnIntervalTicks: group.spawnIntervalTicks
    }))
  );

  return {
    ...state,
    phase: 'WAVE_ACTIVE',
    spawnQueue,
    spawnTimerTicks: 0
  };
};
