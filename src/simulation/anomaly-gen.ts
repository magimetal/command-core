import { EnemyArchetype } from '../const/enemies';
import { createOperationsRunConfig, OPERATIONS_MAP_DEFS } from '../const/operations-maps';
import { TowerArchetype } from '../const/towers';
import type { WaveDefinition } from '../const/waves';
import { CellType, type Cell } from '../models/cell';
import type { RunConfig } from '../models/run-config';

const MAP_ROWS = 16;
const MAP_COLS = 34;
const MIN_PATH_LENGTH = 56;
const MIN_ROW_COVERAGE = 8;
const MIN_VERTICAL_MOVES = 16;
const MAX_PATH_RETRIES = 20;
const ANOMALY_STARTING_CURRENCY = 165;
const ANOMALY_STARTING_BASE_HP = 24;

type Direction = [number, number];

const EAST: Direction = [1, 0];
const NORTH: Direction = [0, -1];
const SOUTH: Direction = [0, 1];
const WEST: Direction = [-1, 0];

const mulberry32 = (seed: number) => {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T>(values: T[], random: () => number): T[] => {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
};

const toCellKey = (col: number, row: number): string => `${col},${row}`;

const inBounds = (col: number, row: number): boolean => {
  return col >= 0 && col < MAP_COLS && row >= 0 && row < MAP_ROWS;
};

const chooseDirectionOrder = (
  col: number,
  row: number,
  pathLength: number,
  lastDirection: Direction | null,
  targetRow: number,
  random: () => number
): Direction[] => {
  const randomized = shuffle([EAST, NORTH, SOUTH, WEST], random);
  const rowDelta = targetRow - row;

  return randomized
    .map((direction) => {
      const [dc, dr] = direction;
      let score = random();

      if (dc === 1) {
        score += 2.8;
        if (pathLength < MIN_PATH_LENGTH && col >= MAP_COLS - 5) {
          score -= 2;
        }
      }

      if (dc === -1) {
        score += 0.7;
        if (col < 4) {
          score -= 1.5;
        }
      }

      if (dr !== 0) {
        score += 1.1;

        if (rowDelta !== 0 && dr === Math.sign(rowDelta)) {
          score += 2.4;
        }

        if (Math.abs(rowDelta) <= 1) {
          score -= 0.8;
        }
      }

      if (lastDirection !== null && dc === -lastDirection[0] && dr === -lastDirection[1]) {
        score -= 0.9;
      }

      return { direction, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ direction }) => direction);
};

const hasVariedShape = (path: [number, number][]): boolean => {
  const rowsVisited = new Set(path.map(([, row]) => row));
  let verticalMoves = 0;

  for (let index = 1; index < path.length; index += 1) {
    if (path[index][1] !== path[index - 1][1]) {
      verticalMoves += 1;
    }
  }

  return rowsVisited.size >= MIN_ROW_COVERAGE && verticalMoves >= MIN_VERTICAL_MOVES;
};

const createGridFromPath = (enemyPath: [number, number][]): Cell[][] => {
  const grid = Array.from({ length: MAP_ROWS }, () =>
    Array.from({ length: MAP_COLS }, () => ({ type: CellType.BUILDABLE }))
  );

  enemyPath.forEach(([col, row], index) => {
    grid[row][col] = {
      type:
        index === 0
          ? CellType.SPAWN
          : index === enemyPath.length - 1
            ? CellType.BASE
            : CellType.PATH
    };
  });

  return grid;
};

const generatePathAttempt = (seed: number, attempt: number): [number, number][] | null => {
  const random = mulberry32(seed + attempt * 1009);
  const startRow = 1 + Math.floor(random() * (MAP_ROWS - 2));
  const targetRows = shuffle([1, 3, 5, 7, 9, 11, 13, 14, 2, 4, 6, 8, 10, 12], random).slice(0, 6);
  const path: [number, number][] = [[0, startRow]];
  const visited = new Set<string>([toCellKey(0, startRow)]);
  const maxSteps = 320;
  let lastDirection: Direction | null = null;

  while (path.length < maxSteps) {
    const [col, row] = path[path.length - 1];
    if (col === MAP_COLS - 1 && path.length >= MIN_PATH_LENGTH) {
      return hasVariedShape(path) ? path : null;
    }

    const progressTargetIndex = Math.min(targetRows.length - 1, Math.floor((col / (MAP_COLS - 1)) * targetRows.length));
    const targetRow = targetRows[progressTargetIndex];

    const directions = chooseDirectionOrder(col, row, path.length, lastDirection, targetRow, random);
    const nextDirection = directions.find(([dc, dr]) => {
      const nextCol = col + dc;
      const nextRow = row + dr;

      if (!inBounds(nextCol, nextRow)) {
        return false;
      }

      if (visited.has(toCellKey(nextCol, nextRow))) {
        return false;
      }

      if (dc === -1 && col < 2) {
        return false;
      }

      return true;
    });

    if (nextDirection === undefined) {
      return null;
    }

    const [dc, dr] = nextDirection;
    const nextCol = col + dc;
    const nextRow = row + dr;

    path.push([nextCol, nextRow]);
    visited.add(toCellKey(nextCol, nextRow));
    lastDirection = nextDirection;
  }

  return null;
};

const generateTowerPool = (seed: number): TowerArchetype[] => {
  const random = mulberry32(seed ^ 0xa5a5);
  return shuffle(
    [TowerArchetype.RAPID, TowerArchetype.CANNON, TowerArchetype.SNIPER, TowerArchetype.SLOW],
    random
  ).slice(0, 3);
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
      const count =
        archetypeIndex === activeArchetypes.length - 1
          ? Math.max(1, remaining)
          : Math.max(1, Math.floor(remaining / (activeArchetypes.length - archetypeIndex)));

      return {
        archetype,
        count,
        spawnIntervalTicks: Math.max(7, 16 - index * 2 - archetypeIndex)
      };
    });

    if (includeTank && index >= 2) {
      enemies.push({
        archetype: EnemyArchetype.TANK,
        count: 1 + Math.floor((index - 1) / 2),
        spawnIntervalTicks: Math.max(11, 18 - index)
      });
    }

    return { enemies };
  });
};

interface AnomalyOverrides {
  pathBuilder?: (seed: number, attempt: number) => [number, number][] | null;
}

export const generateAnomalyRunConfig = (seed: number, overrides?: AnomalyOverrides): RunConfig => {
  const pathBuilder = overrides?.pathBuilder ?? generatePathAttempt;
  let enemyPath: [number, number][] | null = null;

  for (let attempt = 0; attempt < MAX_PATH_RETRIES; attempt += 1) {
    const nextPath = pathBuilder(seed, attempt);
    if (nextPath !== null && nextPath.length >= MIN_PATH_LENGTH) {
      enemyPath = nextPath;
      break;
    }
  }

  if (enemyPath === null) {
    const fallback = createOperationsRunConfig(OPERATIONS_MAP_DEFS[0]);
    return {
      ...fallback,
      mode: 'ANOMALY',
      modeMultiplier: 1.5,
      startingCurrency: ANOMALY_STARTING_CURRENCY,
      startingBaseHp: ANOMALY_STARTING_BASE_HP,
      mapId: `anomaly-run-${seed}`,
      mapLabel: `Anomaly #${seed}`,
      availableTowers: generateTowerPool(seed),
      waves: generateWaves(seed)
    };
  }

  return {
    mode: 'ANOMALY',
    modeMultiplier: 1.5,
    startingCurrency: ANOMALY_STARTING_CURRENCY,
    startingBaseHp: ANOMALY_STARTING_BASE_HP,
    mapId: `anomaly-run-${seed}`,
    mapLabel: `Anomaly #${seed}`,
    grid: createGridFromPath(enemyPath),
    enemyPath,
    waves: generateWaves(seed),
    availableTowers: generateTowerPool(seed)
  };
};
