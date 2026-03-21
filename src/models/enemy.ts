import type { EnemyArchetype } from '../const/enemies';

export interface Enemy {
  id: string;
  archetype: EnemyArchetype;
  pos: [number, number];
  pathIndex: number;
  hp: number;
  maxHp: number;
  moveCooldown: number;
  dead: boolean;
}
