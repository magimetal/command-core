import { EVENT_PREFIX } from '../const/event-prefixes';
import { ENEMY_DEFS, getEnemyDisplayName } from '../const/enemies';
import type { GridPos } from '../models/cell';
import type { Enemy } from '../models/enemy';
import type { GameState } from '../models/game-state';
import { appendEventLog } from '../utils/event-log';

const moveEnemy = (enemy: Enemy, enemyPath: GridPos[]): Enemy => {
  const { speed } = ENEMY_DEFS[enemy.archetype];

  if (enemy.moveCooldown > 1) {
    return {
      ...enemy,
      moveCooldown: enemy.moveCooldown - 1
    };
  }

  const nextPathIndex = Math.min(enemy.pathIndex + 1, enemyPath.length - 1);

  return {
    ...enemy,
    pathIndex: nextPathIndex,
    pos: enemyPath[nextPathIndex],
    moveCooldown: speed
  };
};

export const advanceEnemies = (state: GameState): GameState => {
  const enemyPath = state.runConfig.enemyPath;
  let leakedDamage = 0;
  const leakMessages: string[] = [];

  const survivingEnemies = state.enemies.reduce<Enemy[]>((accumulator, enemy) => {
    if (enemy.dead) {
      accumulator.push(enemy);
      return accumulator;
    }

    const movedEnemy = moveEnemy(enemy, enemyPath);
    const reachedBase = movedEnemy.pathIndex >= enemyPath.length - 1;

    if (reachedBase) {
      const leakDamage = ENEMY_DEFS[movedEnemy.archetype].leakDamage;
      leakedDamage += leakDamage;
      leakMessages.push(
        `${EVENT_PREFIX.LEAK} ${getEnemyDisplayName(movedEnemy.archetype)} reached the base  (-${leakDamage} HP)`
      );
      return accumulator;
    }

    accumulator.push(movedEnemy);
    return accumulator;
  }, []);

  const nextEventLog = leakMessages.reduce(
    (eventLog, message) => appendEventLog(eventLog, message),
    state.eventLog
  );

  return {
    ...state,
    enemies: survivingEnemies,
    baseHp: state.baseHp - leakedDamage,
    eventLog: nextEventLog
  };
};
