import { EnemyArchetype } from '../const/enemies';
import { createOperationsRunConfig, OPERATIONS_MAP_DEFS } from '../const/operations-maps';
import { TowerArchetype } from '../const/towers';
import type { WaveDefinition } from '../const/waves';
import type { GridPos } from '../models';
import type { RunConfig } from '../models/run-config';
import { createGridFromPath, generatePathAttempt } from './anomaly-path';
import { mulberry32, shuffle } from '../utils/prng';

const MIN_PATH_LENGTH = 56;
const MAX_PATH_RETRIES = 20;
const ANOMALY_STARTING_CURRENCY = 165;
const ANOMALY_STARTING_BASE_HP = 24;

const generateTowerPool = (seed: number): TowerArchetype[] => {
  const random = mulberry32(seed ^ 0xa5a5);
  return shuffle([TowerArchetype.RAPID, TowerArchetype.CANNON, TowerArchetype.SNIPER, TowerArchetype.SLOW], random).slice(0, 3);
};

const generateWaves = (seed: number): WaveDefinition[] => {
  const random = mulberry32(seed ^ 0x5a5a);
  const waveCount = 4 + Math.floor(random() * 2);
  const baseCount = 3 + Math.floor(random() * 2);
  const scaleStep = 1 + Math.floor(random() * 2);
  const activeArchetypes = [EnemyArchetype.STANDARD, EnemyArchetype.FAST];
  const includeTank = random() < 0.35;
  return Array.from({ length: waveCount }, (_, index) => {
    const targetCount = baseCount + index * scaleStep + Math.floor(random() * 2);
    const enemies = activeArchetypes.map((archetype, archetypeIndex) => {
      const remaining = targetCount - archetypeIndex;
      const count = archetypeIndex === activeArchetypes.length - 1 ? Math.max(1, remaining) : Math.max(1, Math.floor(remaining / (activeArchetypes.length - archetypeIndex)));
      return { archetype, count, spawnIntervalTicks: Math.max(7, 16 - index * 2 - archetypeIndex) };
    });
    if (includeTank && index >= 2) enemies.push({ archetype: EnemyArchetype.TANK, count: 1 + Math.floor((index - 1) / 2), spawnIntervalTicks: Math.max(11, 18 - index) });
    return { enemies };
  });
};

interface AnomalyOverrides {
  pathBuilder?: (seed: number, attempt: number) => GridPos[] | null;
}

export const generateAnomalyRunConfig = (seed: number, overrides?: AnomalyOverrides): RunConfig => {
  const pathBuilder = overrides?.pathBuilder ?? generatePathAttempt;
  let enemyPath: GridPos[] | null = null;
  for (let attempt = 0; attempt < MAX_PATH_RETRIES; attempt += 1) {
    const nextPath = pathBuilder(seed, attempt);
    if (nextPath !== null && nextPath.length >= MIN_PATH_LENGTH) {
      enemyPath = nextPath;
      break;
    }
  }
  if (enemyPath === null) {
    const fallback = createOperationsRunConfig(OPERATIONS_MAP_DEFS[0]);
    return { ...fallback, mode: 'ANOMALY', modeMultiplier: 1.5, startingCurrency: ANOMALY_STARTING_CURRENCY, startingBaseHp: ANOMALY_STARTING_BASE_HP, mapId: `anomaly-run-${seed}`, mapLabel: `Anomaly #${seed}`, availableTowers: generateTowerPool(seed), waves: generateWaves(seed) };
  }
  return {
    mode: 'ANOMALY', modeMultiplier: 1.5, startingCurrency: ANOMALY_STARTING_CURRENCY, startingBaseHp: ANOMALY_STARTING_BASE_HP,
    mapId: `anomaly-run-${seed}`, mapLabel: `Anomaly #${seed}`, grid: createGridFromPath(enemyPath), enemyPath,
    waves: generateWaves(seed), availableTowers: generateTowerPool(seed)
  };
};
