import { getTowerDef } from '../const/towers';
import type { Enemy } from '../models/enemy';
import type { GameState } from '../models/game-state';
import { appendEventLog } from '../rendering/event-log';

const distanceSquared = (a: [number, number], b: [number, number]): number => {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];

  return dx * dx + dy * dy;
};

const getNearestEnemyInRange = (
  enemies: Enemy[],
  towerPos: [number, number],
  range: number
): Enemy | undefined => {
  const rangeSquared = range * range;

  return enemies
    .filter((enemy) => !enemy.dead)
    .map((enemy) => ({ enemy, distance: distanceSquared(enemy.pos, towerPos) }))
    .filter((entry) => entry.distance <= rangeSquared)
    .sort((a, b) => a.distance - b.distance || a.enemy.id.localeCompare(b.enemy.id))[0]?.enemy;
};

export const resolveCombat = (state: GameState): GameState => {
  const enemiesById = new Map(state.enemies.map((enemy) => [enemy.id, { ...enemy }]));
  const hitMessages: string[] = [];

  const towers = state.towers.map((tower) => {
    if (tower.cooldownRemaining > 0) {
      return {
        ...tower,
        cooldownRemaining: tower.cooldownRemaining - 1
      };
    }

    const towerDef = getTowerDef(tower.archetype);
    const currentEnemies = Array.from(enemiesById.values());
    const target = getNearestEnemyInRange(currentEnemies, tower.pos, towerDef.range);

    if (target === undefined) {
      return tower;
    }

    const updatedTarget = enemiesById.get(target.id);

    if (updatedTarget !== undefined) {
      const hpBefore = updatedTarget.hp;
      updatedTarget.hp -= towerDef.damage;

      if (updatedTarget.hp <= 0) {
        updatedTarget.dead = true;
      } else {
        const pctBefore = hpBefore / updatedTarget.maxHp;
        const pctAfter = updatedTarget.hp / updatedTarget.maxHp;
        const crossedThreshold =
          (pctBefore > 0.5 && pctAfter <= 0.5) ||
          (pctBefore > 0.25 && pctAfter <= 0.25);

        if (crossedThreshold) {
          const filled = Math.max(0, Math.min(5, Math.round(pctAfter * 5)));
          const bar = '█'.repeat(filled) + '░'.repeat(5 - filled);
          hitMessages.push(
            `~ ${updatedTarget.archetype} hit  [${bar}] ${updatedTarget.hp}/${updatedTarget.maxHp}`
          );
        }
      }

      enemiesById.set(updatedTarget.id, updatedTarget);
    }

    return {
      ...tower,
      cooldownRemaining: towerDef.cooldownTicks
    };
  });

  const nextEventLog = hitMessages.reduce((log, message) => {
    return appendEventLog(log, message);
  }, state.eventLog);

  return {
    ...state,
    towers,
    enemies: Array.from(enemiesById.values()),
    eventLog: nextEventLog
  };
};
