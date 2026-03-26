import { getTowerDef } from '../const/towers';
import type { Enemy } from '../models/enemy';
import type { GameState } from '../models/game-state';
import type { Projectile } from '../models/projectile';
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
  const enemiesById = new Map(state.enemies.map((enemy) => [enemy.id, { ...enemy }]));
  const hitMessages: string[] = [];
  const advancedProjectiles = state.projectiles
    .map((projectile) => advanceProjectile(projectile))
    .filter((projectile) => projectile.ttl > 0);
  const newProjectiles: Projectile[] = [];

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

    if (updatedTarget === undefined) {
      return tower;
    }

    const hpBefore = updatedTarget.hp;
    updatedTarget.hp -= towerDef.damage;

    if (towerDef.slowDurationTicks > 0) {
      updatedTarget.moveCooldown = Math.max(updatedTarget.moveCooldown, towerDef.slowDurationTicks);
    }

    newProjectiles.push({
      id: `proj-${tower.id}-${state.frame}`,
      pos: tower.pos,
      targetPos: target.pos,
      archetype: tower.archetype,
      symbol: towerDef.projectileSymbol,
      ttl: 2
    });

    if (updatedTarget.hp <= 0) {
      updatedTarget.dead = true;
      enemiesById.set(updatedTarget.id, updatedTarget);

      return {
        ...tower,
        cooldownRemaining: towerDef.cooldownTicks,
        kills: tower.kills + 1
      };
    }

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

    enemiesById.set(updatedTarget.id, updatedTarget);

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
    projectiles: [...advancedProjectiles, ...newProjectiles],
    enemies: Array.from(enemiesById.values()),
    eventLog: nextEventLog
  };
};
