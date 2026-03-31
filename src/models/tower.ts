import type { TowerArchetype } from '../const/towers';
import type { GridPos } from './cell';
import type { TowerId } from './tower-id';

export interface Tower {
  id: TowerId;
  archetype: TowerArchetype;
  pos: GridPos;
  cooldownRemaining: number;
  kills: number;
}
