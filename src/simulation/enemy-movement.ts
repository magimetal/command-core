import { ENEMY_DEFS } from '../const/enemies';
import { ENEMY_PATH } from '../const/map';
import type { Enemy } from '../models/enemy';
import type { GameState } from '../models/game-state';
import { appendEventLog } from '../rendering/event-log';

const moveEnemy = (enemy: Enemy): Enemy => {
  const { speed } = ENEMY_DEFS[enemy.archetype];

  if (enemy.moveCooldown > 1) {
    return {
      ...enemy,
      moveCooldown: enemy.moveCooldown - 1
    };
  }

  const nextPathIndex = Math.min(enemy.pathIndex + 1, ENEMY_PATH.length - 1);

  return {
    ...enemy,
    pathIndex: nextPathIndex,
    pos: ENEMY_PATH[nextPathIndex],
    moveCooldown: speed
  };
};

export const advanceEnemies = (state: GameState): GameState => {
  let leakedDamage = 0;
  const leakMessages: string[] = [];

  const survivingEnemies = state.enemies.reduce<Enemy[]>((accumulator, enemy) => {
    if (enemy.dead) {
      accumulator.push(enemy);
      return accumulator;
    }

    const movedEnemy = moveEnemy(enemy);
    const reachedBase = movedEnemy.pathIndex >= ENEMY_PATH.length - 1;

    if (reachedBase) {
      const leakDamage = ENEMY_DEFS[movedEnemy.archetype].leakDamage;
      leakedDamage += leakDamage;
      leakMessages.push(`! ${movedEnemy.archetype} leaked  (-${leakDamage} HP)`);
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
