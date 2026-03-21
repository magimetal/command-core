import { ENEMY_DEFS } from '../const/enemies';
import type { Enemy } from '../models/enemy';
import type { GameState } from '../models/game-state';
import { appendEventLog } from '../rendering/event-log';
import { resolveCombat } from './combat';
import { advanceEnemies } from './enemy-movement';
import { advanceWave } from './wave-controller';

const cleanup = (state: GameState): GameState => {
  let reward = 0;
  let kills = 0;
  const killMessages: string[] = [];
  const enemies: Enemy[] = [];

  for (const enemy of state.enemies) {
    if (enemy.dead) {
      const enemyReward = ENEMY_DEFS[enemy.archetype].reward;
      reward += enemyReward;
      kills += 1;
      killMessages.push(`✕ ${enemy.archetype} destroyed  (+$${enemyReward})`);
      continue;
    }

    enemies.push(enemy);
  }

  let nextPhase = state.phase;
  if (nextPhase === 'WAVE_ACTIVE' && enemies.length === 0 && state.spawnQueue.length === 0) {
    nextPhase = 'WAVE_CLEAR';
  }

  if (state.baseHp <= 0) {
    nextPhase = 'GAME_OVER';
  }

  const nextEventLog = killMessages.reduce(
    (eventLog, message) => appendEventLog(eventLog, message),
    state.eventLog
  );

  return {
    ...state,
    enemies,
    currency: state.currency + reward,
    phase: nextPhase,
    enemiesKilled: state.enemiesKilled + kills,
    eventLog: nextEventLog
  };
};

export const tick = (state: GameState): GameState => {
  if (state.phase === 'GAME_OVER' || state.phase === 'VICTORY') {
    return state;
  }

  // Locked order from plan: advanceWave -> advanceEnemies -> resolveCombat -> cleanup.
  const afterWave = advanceWave(state);
  const afterEnemyMovement = advanceEnemies(afterWave);
  const afterCombat = resolveCombat(afterEnemyMovement);

  return cleanup(afterCombat);
};
