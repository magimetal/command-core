import { EVENT_PREFIX } from '../const/event-prefixes';
import { getEnemyDisplayName } from '../const/enemies';
import { getTowerDef } from '../const/towers';
import type { Enemy } from '../models/enemy';
import type { GameState } from '../models/game-state';
import type { Projectile } from '../models/projectile';
import { renderHpBar } from '../rendering/hp-bar';
import { appendEventLog } from '../utils/event-log';

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

const advanceProjectile = (projectile: Projectile): Projectile => {
  const dx = projectile.targetPos[0] - projectile.pos[0];
  const dy = projectile.targetPos[1] - projectile.pos[1];

  return {
    ...projectile,
    pos: [projectile.pos[0] + Math.sign(dx), projectile.pos[1] + Math.sign(dy)],
    ttl: projectile.ttl - 1
  };
};

export const resolveCombat = (state: GameState): GameState => {
  const initialEnemiesById = new Map(state.enemies.map((enemy) => [enemy.id, enemy]));
  const advancedProjectiles = state.projectiles
    .map((projectile) => advanceProjectile(projectile))
    .filter((projectile) => projectile.ttl > 0);
  const resolved = state.towers.reduce<{
    towers: typeof state.towers;
    enemiesById: Map<string, Enemy>;
    newProjectiles: Projectile[];
    hitMessages: string[];
  }>(
    (accumulator, tower) => {
      if (tower.cooldownRemaining > 0) {
        return {
          ...accumulator,
          towers: [...accumulator.towers, { ...tower, cooldownRemaining: tower.cooldownRemaining - 1 }]
        };
      }

      const towerDef = getTowerDef(tower.archetype);
      const target = getNearestEnemyInRange(
        Array.from(accumulator.enemiesById.values()),
        tower.pos,
        towerDef.range
      );

      if (target === undefined) {
        return {
          ...accumulator,
          towers: [...accumulator.towers, tower]
        };
      }

      const hpBefore = target.hp;
      const hpAfter = target.hp - towerDef.damage;
      const nextMoveCooldown =
        towerDef.slowDurationTicks > 0
          ? Math.max(target.moveCooldown, towerDef.slowDurationTicks)
          : target.moveCooldown;
      const updatedTarget: Enemy = {
        ...target,
        hp: hpAfter,
        moveCooldown: nextMoveCooldown,
        dead: hpAfter <= 0 ? true : target.dead
      };

      const nextEnemiesById = new Map(accumulator.enemiesById);
      nextEnemiesById.set(updatedTarget.id, updatedTarget);

      const nextProjectiles = [
        ...accumulator.newProjectiles,
        {
          id: `proj-${tower.id}-${state.frame}`,
          pos: tower.pos,
          targetPos: target.pos,
          archetype: tower.archetype,
          symbol: towerDef.projectileSymbol,
          ttl: 2
        }
      ];

      if (updatedTarget.dead) {
        return {
          towers: [
            ...accumulator.towers,
            { ...tower, cooldownRemaining: towerDef.cooldownTicks, kills: tower.kills + 1 }
          ],
          enemiesById: nextEnemiesById,
          newProjectiles: nextProjectiles,
          hitMessages: accumulator.hitMessages
        };
      }

      const pctBefore = hpBefore / updatedTarget.maxHp;
      const pctAfter = updatedTarget.hp / updatedTarget.maxHp;
      const crossedThreshold =
        (pctBefore > 0.5 && pctAfter <= 0.5) || (pctBefore > 0.25 && pctAfter <= 0.25);
      const nextHitMessages = crossedThreshold
        ? [
            ...accumulator.hitMessages,
            `${EVENT_PREFIX.HIT} ${getEnemyDisplayName(updatedTarget.archetype)} damaged  [${renderHpBar(updatedTarget.hp, updatedTarget.maxHp)}] ${updatedTarget.hp}/${updatedTarget.maxHp}`
          ]
        : accumulator.hitMessages;

      return {
        towers: [...accumulator.towers, { ...tower, cooldownRemaining: towerDef.cooldownTicks }],
        enemiesById: nextEnemiesById,
        newProjectiles: nextProjectiles,
        hitMessages: nextHitMessages
      };
    },
    {
      towers: [],
      enemiesById: initialEnemiesById,
      newProjectiles: [],
      hitMessages: []
    }
  );

  const nextEventLog = resolved.hitMessages.reduce((log, message) => {
    return appendEventLog(log, message);
  }, state.eventLog);

  return {
    ...state,
    towers: resolved.towers,
    projectiles: [...advancedProjectiles, ...resolved.newProjectiles],
    enemies: Array.from(resolved.enemiesById.values()),
    eventLog: nextEventLog
  };
};
