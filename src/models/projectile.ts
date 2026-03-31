import type { TowerArchetype } from '../const/towers';
import type { GridPos } from './cell';

export interface Projectile {
  id: string;
  pos: GridPos;
  targetPos: GridPos;
  archetype: TowerArchetype;
  symbol: string;
  ttl: number;
}
