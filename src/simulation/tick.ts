import { EVENT_PREFIX } from '../const/event-prefixes';
import { ENEMY_DEFS, getEnemyDisplayName } from '../const/enemies';
import type { Enemy } from '../models/enemy';
import type { GameState } from '../models/game-state';
import { appendEventLog } from '../utils/event-log';
import { resolveCombat } from './combat';
import { advanceEnemies } from './enemy-movement';
import { advanceWave } from './wave-controller';

const cleanup = (state: GameState): GameState => {
  const STREAK_MILESTONES = [5, 10, 20] as const;
  const STREAK_MESSAGES: Record<(typeof STREAK_MILESTONES)[number], string> = {
    5: `${EVENT_PREFIX.STREAK} STREAK  5 kills — defense holding`,
    10: `${EVENT_PREFIX.STREAK.repeat(2)} STREAK 10 kills — excellent coverage`,
    20: `${EVENT_PREFIX.STREAK.repeat(3)} STREAK 20 kills — DOMINATION`
  };

  let reward = 0;
  let kills = 0;
  const killMessages: string[] = [];
  const enemies: Enemy[] = [];

  for (const enemy of state.enemies) {
    if (enemy.dead) {
      const enemyReward = ENEMY_DEFS[enemy.archetype].reward;
      reward += enemyReward;
      kills += 1;
      killMessages.push(`${EVENT_PREFIX.KILL} ${getEnemyDisplayName(enemy.archetype)} destroyed  (+$${enemyReward})`);
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

  const previousTotal = state.enemiesKilled;
  const newTotal = state.enemiesKilled + kills;
  const streakMilestone = STREAK_MILESTONES.find(
    (milestone) => previousTotal < milestone && newTotal >= milestone
  );
  if (kills > 0 && streakMilestone !== undefined) {
    killMessages.push(STREAK_MESSAGES[streakMilestone]);
  }

  const nextEventLog = killMessages.reduce(
    (eventLog, message) => appendEventLog(eventLog, message),
    state.eventLog
  );

  return {
    ...state,
    enemies,
    projectiles: state.projectiles.filter((projectile) => projectile.ttl > 0),
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
