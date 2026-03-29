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

  const groupSlots = waveDefinition.enemies.map((group) =>
    Array.from({ length: group.count }, () => ({
      archetype: group.archetype,
      spawnIntervalTicks: group.spawnIntervalTicks
    }))
  );

  const spawnQueue: GameState['spawnQueue'] = [];
  let groupIndex = 0;

  while (groupSlots.some((slots) => slots.length > 0)) {
    const slots = groupSlots[groupIndex % groupSlots.length];

    if (slots.length > 0) {
      const [entry, ...rest] = slots;

      if (entry !== undefined) {
        spawnQueue.push(entry);
      }

      groupSlots[groupIndex % groupSlots.length] = rest;
    }

    groupIndex += 1;
  }

  return {
    ...state,
    phase: 'WAVE_ACTIVE',
    spawnQueue,
    spawnTimerTicks: 0
  };
};
