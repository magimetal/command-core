import type { TowerArchetype } from '../const/towers';
import type { WaveDefinition } from '../const/waves';
import type { Cell, GridPos } from './cell';

export type GameMode = 'OPERATIONS' | 'ANOMALY';

export interface RunConfig {
  mode: GameMode;
  modeMultiplier: number;
  startingCurrency: number;
  startingBaseHp: number;
  mapId: string;
  mapLabel: string;
  grid: Cell[][];
  enemyPath: GridPos[];
  waves: WaveDefinition[];
  availableTowers: TowerArchetype[];
}
