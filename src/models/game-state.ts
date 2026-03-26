import type { Cell } from './cell';
import type { EnemyArchetype } from '../const/enemies';
import type { TowerArchetype } from '../const/towers';
import type { Enemy } from './enemy';
import type { Projectile } from './projectile';
import type { Tower } from './tower';

export type GamePhase =
  | 'TITLE'
  | 'PREP'
  | 'WAVE_ACTIVE'
  | 'WAVE_CLEAR'
  | 'VICTORY'
  | 'GAME_OVER';

export const isPlacementPhase = (phase: GamePhase): boolean => {
  return phase === 'PREP' || phase === 'WAVE_CLEAR';
};

export interface GameState {
  grid: Cell[][];
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  currency: number;
  baseHp: number;
  wave: number;
  phase: GamePhase;
  frame: number;
  cursor: [number, number];
  selectedTowerArchetype: TowerArchetype;
  spawnQueue: Array<{
    archetype: EnemyArchetype;
    spawnIntervalTicks: number;
  }>;
  spawnTimerTicks: number;
  enemiesKilled: number;
  eventLog: string[];
}
