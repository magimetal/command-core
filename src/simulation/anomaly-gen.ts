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

// ============================================================================
// Archetype Unlock Thresholds and Distribution Weights
// ============================================================================

const ARCHETYPE_UNLOCK_WAVES: Record<EnemyArchetype, number | undefined> = {
	[EnemyArchetype.STANDARD]: undefined,
	[EnemyArchetype.FAST]: undefined,
	[EnemyArchetype.TANK]: 2,
	[EnemyArchetype.BRUTE]: 7,
	[EnemyArchetype.COLOSSUS]: 8
};

const BASE_DISTRIBUTION_WEIGHTS: Record<EnemyArchetype, number> = {
	[EnemyArchetype.STANDARD]: 0.45,
	[EnemyArchetype.FAST]: 0.35,
	[EnemyArchetype.TANK]: 0.15,
	[EnemyArchetype.BRUTE]: 0.04,
	[EnemyArchetype.COLOSSUS]: 0.01
};

const generateTowerPool = (seed: number): TowerArchetype[] => {
  const random = mulberry32(seed ^ 0xa5a5);
  return shuffle([TowerArchetype.RAPID, TowerArchetype.CANNON, TowerArchetype.SNIPER, TowerArchetype.SLOW], random).slice(0, 3);
};

// ============================================================================
// Wave System: Archetype Progression Tiers
// ============================================================================

const getAvailableArchetypes = (waveIndex: number): EnemyArchetype[] => {
	const archetypes = [EnemyArchetype.STANDARD, EnemyArchetype.FAST];
	if (waveIndex >= (ARCHETYPE_UNLOCK_WAVES[EnemyArchetype.TANK] ?? Infinity)) archetypes.push(EnemyArchetype.TANK);
	if (waveIndex >= (ARCHETYPE_UNLOCK_WAVES[EnemyArchetype.BRUTE] ?? Infinity)) archetypes.push(EnemyArchetype.BRUTE);
	if (waveIndex >= (ARCHETYPE_UNLOCK_WAVES[EnemyArchetype.COLOSSUS] ?? Infinity)) archetypes.push(EnemyArchetype.COLOSSUS);
	return archetypes;
};

// ============================================================================
// Wave System: Exponential Scaling Formulas
// ============================================================================

const generateWaveCounts = (waveIndex: number, random: () => number): number => {
  const baseCount = 7 + Math.floor(random() * 4); // 7-10 base for wave 0
  const exponentialFactor = 1.15 + (random() * 0.05); // 1.15-1.20 growth rate
  const waveMultiplier = Math.pow(exponentialFactor, waveIndex);
  const randomVariance = Math.floor(random() * 3); // 0-2 variance

  return Math.floor(baseCount * waveMultiplier) + randomVariance;
};

// ============================================================================
// Wave System: Archetype Distribution
// ============================================================================

const distributeArchetypes = (
  totalCount: number,
  availableArchetypes: EnemyArchetype[],
  random: () => number
): { archetype: EnemyArchetype; count: number }[] => {
	// Filter and normalize for available archetypes
	const availableWeights = availableArchetypes.map(a => BASE_DISTRIBUTION_WEIGHTS[a]);
	const totalWeight = availableWeights.reduce((a, b) => a + b, 0);

	// Calculate initial counts
	const result = availableArchetypes.map((archetype) => {
		const normalizedWeight = BASE_DISTRIBUTION_WEIGHTS[archetype] / totalWeight;
		const count = Math.max(1, Math.floor(totalCount * normalizedWeight));
		return { archetype, count };
	});

  // Adjust to ensure we hit totalCount exactly (add to last archetype)
  const currentTotal = result.reduce((sum, r) => sum + r.count, 0);
  if (currentTotal < totalCount && result.length > 0) {
    result[result.length - 1].count += (totalCount - currentTotal);
  } else if (currentTotal > totalCount && result.length > 0) {
    // Subtract from the most numerous archetype (usually STANDARD)
    const maxCount = Math.max(...result.map(r => r.count));
    const maxIdx = result.findIndex(r => r.count === maxCount);
    result[maxIdx].count = Math.max(1, result[maxIdx].count - (currentTotal - totalCount));
  }

  return result;
};

// ============================================================================
// Wave System: Per-Archetype Spawn Intervals
// ============================================================================

const getSpawnInterval = (archetype: EnemyArchetype, waveIndex: number, waveCount: number): number => {
  const intervals: Record<EnemyArchetype, [number, number]> = {
    [EnemyArchetype.FAST]: [7, 3],
    [EnemyArchetype.STANDARD]: [12, 3],
    [EnemyArchetype.TANK]: [17, 9],
    [EnemyArchetype.BRUTE]: [18, 10],
    [EnemyArchetype.COLOSSUS]: [28, 20]
  };

  const [start, end] = intervals[archetype];
  const progress = waveCount > 1 ? waveIndex / (waveCount - 1) : 0; // 0 to 1 across actual wave count
  return Math.max(end, Math.floor(start - (start - end) * progress));
};

// ============================================================================
// Wave Generation
// ============================================================================

const generateWaves = (seed: number): WaveDefinition[] => {
  const random = mulberry32(seed ^ 0x5a5a);
  const waveCount = 15 + Math.floor(random() * 6); // 15-20 waves

  return Array.from({ length: waveCount }, (_, waveIndex) => {
    const availableArchetypes = getAvailableArchetypes(waveIndex);
    const totalCount = generateWaveCounts(waveIndex, random);

    // Distribute archetypes
    const distribution = distributeArchetypes(totalCount, availableArchetypes, random);

    // Build wave definition
    const enemies = distribution.map(({ archetype, count }) => ({
      archetype,
      count,
      spawnIntervalTicks: getSpawnInterval(archetype, waveIndex, waveCount)
    }));

    return { enemies };
  });
};

// ============================================================================
// Main Export
// ============================================================================

interface AnomalyOverrides {
  pathBuilder?: (seed: number, attempt: number) => GridPos[] | null;
}

export const generateAnomalyRunConfig = (seed: number, overrides?: AnomalyOverrides): RunConfig => {
  const pathBuilder = overrides?.pathBuilder ?? generatePathAttempt;
  const waves = generateWaves(seed);
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
    return { ...fallback, mode: 'ANOMALY', modeMultiplier: 1.5, startingCurrency: ANOMALY_STARTING_CURRENCY, startingBaseHp: ANOMALY_STARTING_BASE_HP, mapId: `anomaly-run-${seed}`, mapLabel: `Anomaly #${seed}`, availableTowers: generateTowerPool(seed), waves };
  }
  return {
    mode: 'ANOMALY', modeMultiplier: 1.5, startingCurrency: ANOMALY_STARTING_CURRENCY, startingBaseHp: ANOMALY_STARTING_BASE_HP,
    mapId: `anomaly-run-${seed}`, mapLabel: `Anomaly #${seed}`, grid: createGridFromPath(enemyPath), enemyPath,
    waves, availableTowers: generateTowerPool(seed)
  };
};
