import type { Cell } from './cell';
import type { EnemyArchetype } from '../const/enemies';
import type { TowerArchetype } from '../const/towers';
import type { Enemy } from './enemy';
import type { Tower } from './tower';

export type GamePhase =
  | 'TITLE'
  | 'PREP'
  | 'WAVE_ACTIVE'
  | 'WAVE_CLEAR'
  | 'VICTORY'
  | 'GAME_OVER';

export interface GameState {
  grid: Cell[][];
  enemies: Enemy[];
  towers: Tower[];
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
  lastEventMessage?: string;
}
