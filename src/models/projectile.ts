import type { TowerArchetype } from '../const/towers';

export interface Projectile {
  id: string;
  pos: [number, number];
  targetPos: [number, number];
  archetype: TowerArchetype;
  symbol: string;
  ttl: number;
}
