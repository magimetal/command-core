import { ENEMY_DEFS } from '../const/enemies';
import { ENEMY_PATH } from '../const/map';
import { WAVES } from '../const/waves';
import type { Enemy } from '../models/enemy';
import type { GameState } from '../models/game-state';

const spawnEnemy = (state: GameState): GameState => {
  const [nextSpawn, ...restQueue] = state.spawnQueue;

  if (nextSpawn === undefined) {
    return state;
  }

  const enemyDef = ENEMY_DEFS[nextSpawn.archetype];
  const enemy: Enemy = {
    id: `enemy-${state.frame}-${state.enemies.length + 1}-${nextSpawn.archetype}`,
    archetype: nextSpawn.archetype,
    pos: ENEMY_PATH[0],
    pathIndex: 0,
    hp: enemyDef.maxHp,
    maxHp: enemyDef.maxHp,
    moveCooldown: enemyDef.speed,
    dead: false
  };

  return {
    ...state,
    enemies: [...state.enemies, enemy],
    spawnQueue: restQueue,
    spawnTimerTicks: nextSpawn.spawnIntervalTicks
  };
};

export const advanceWave = (state: GameState): GameState => {
  if (state.phase === 'WAVE_CLEAR') {
    if (state.wave >= WAVES.length) {
      return {
        ...state,
        phase: 'VICTORY'
      };
    }

    return {
      ...state,
      phase: 'PREP',
      wave: state.wave + 1,
      spawnQueue: [],
      spawnTimerTicks: 0
    };
  }

  if (state.phase !== 'WAVE_ACTIVE') {
    return state;
  }

  if (state.spawnQueue.length === 0) {
    return state;
  }

  if (state.spawnTimerTicks > 0) {
    return {
      ...state,
      spawnTimerTicks: state.spawnTimerTicks - 1
    };
  }

  return spawnEnemy(state);
};
