import type { TowerArchetype } from '../const/towers';
import type { WaveDefinition } from '../const/waves';
import type { Cell } from './cell';

export type GameMode = 'OPERATIONS' | 'ANOMALY';

export interface RunConfig {
  mode: GameMode;
  modeMultiplier: number;
  startingCurrency: number;
  startingBaseHp: number;
  mapId: string;
  mapLabel: string;
  grid: Cell[][];
  enemyPath: [number, number][];
  waves: WaveDefinition[];
  availableTowers: TowerArchetype[];
}
