import type { Cell, GridPos } from './cell';
import type { EnemyArchetype } from '../const/enemies';
import type { TowerArchetype } from '../const/towers';
import type { Enemy } from './enemy';
import type { Projectile } from './projectile';
import type { RunConfig } from './run-config';
import type { Tower } from './tower';

export type GamePhase =
  | 'TITLE'
  | 'MODE_SELECT'
  | 'MAP_SELECT'
  | 'PREP'
  | 'WAVE_ACTIVE'
  | 'WAVE_CLEAR'
  | 'VICTORY'
  | 'GAME_OVER';

export const isMenuPhase = (phase: GamePhase): boolean => {
  return phase === 'MODE_SELECT' || phase === 'MAP_SELECT';
};

export const isPlacementPhase = (phase: GamePhase): boolean => {
  return phase === 'PREP' || phase === 'WAVE_CLEAR';
};

export interface GameState {
  runConfig: RunConfig;
  grid: Cell[][];
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  currency: number;
  baseHp: number;
  wave: number;
  phase: GamePhase;
  frame: number;
  menuCursor: number;
  cursor: GridPos;
  selectedTowerArchetype: TowerArchetype;
  spawnQueue: Array<{
    archetype: EnemyArchetype;
    spawnIntervalTicks: number;
  }>;
  spawnTimerTicks: number;
  enemiesKilled: number;
  eventLog: string[];
}
