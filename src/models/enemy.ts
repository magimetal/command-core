import type { EnemyArchetype } from '../const/enemies';
import type { GridPos } from './cell';

export interface Enemy {
  id: string;
  archetype: EnemyArchetype;
  pos: GridPos;
  pathIndex: number;
  hp: number;
  maxHp: number;
  moveCooldown: number;
  /** @deprecated Use enemy.hp <= 0 as liveness check. Set only by combat resolver. */
  dead: boolean;
}
