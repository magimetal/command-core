import type { TowerArchetype } from '../const/towers';
import type { TowerId } from './tower-id';

export interface Tower {
  id: TowerId;
  archetype: TowerArchetype;
  pos: [number, number];
  cooldownRemaining: number;
  kills: number;
}
