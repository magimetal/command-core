import { CellType, type Cell, type GridPos } from '../models/cell';
import { mulberry32, shuffle } from '../utils/prng';

const MAP_ROWS = 16;
const MAP_COLS = 34;
const MIN_PATH_LENGTH = 56;
const MIN_ROW_COVERAGE = 8;
const MIN_VERTICAL_MOVES = 16;

type Direction = [number, number];

/**
 * Check if a direction is a reversal of the last direction (180-degree turn).
 * Used to penalize backtracking during path generation.
 */
const isReversal = (direction: Direction, lastDirection: Direction | null): boolean => {
  if (!lastDirection) return false;
  return direction[0] === -lastDirection[0] && direction[1] === -lastDirection[1];
};

const EAST: Direction = [1, 0];
const NORTH: Direction = [0, -1];
const SOUTH: Direction = [0, 1];
const WEST: Direction = [-1, 0];

const toCellKey = (col: number, row: number): string => `${col},${row}`;

// ============================================================================
// Path Generation Constants
// ============================================================================

/** Prime multiplier for seed-based attempt variation. Reduces correlation between attempts. */
const SEED_ATTEMPT_MULTIPLIER = 1009;

/** Maximum steps allowed before abandoning path generation. Prevents infinite loops. */
const MAX_PATH_STEPS = 320;

/** Minimum steps required before considering a backtrack move valid. */
const BACKTRACK_COOLDOWN = 8;

// ============================================================================
// Direction Scoring Weights (CLASSIC personality)
// ============================================================================

/** Base score bonus for EAST direction (progress toward goal). */
const SCORE_EAST_BASE = 2.8;

/** Penalty for EAST when near end but path too short (forces more winding). */
const SCORE_EAST_NEAR_END_PENALTY = 2.0;

/** Base score for WEST direction (backtracking). */
const SCORE_WEST_BASE = 0.7;

/** Penalty for WEST when too close to left edge. */
const SCORE_WEST_EDGE_PENALTY = 1.5;

/** Base score for vertical movement (NORTH/SOUTH). */
const SCORE_VERTICAL_BASE = 1.1;

/** Bonus for vertical movement toward target row. */
const SCORE_VERTICAL_TARGET_BONUS = 2.4;

/** Penalty for vertical movement when already near target row. */
const SCORE_VERTICAL_NEAR_TARGET_PENALTY = 0.8;

/** Penalty for immediate direction reversal (prevents ping-pong). */
const SCORE_REVERSAL_PENALTY = 0.9;

// ============================================================================
// Direction Scoring Weights (BACKTRACK personality)
// ============================================================================

/** Base score bonus for EAST in backtrack mode. */
const SCORE_BACKTRACK_EAST = 2.5;

/** Bonus for WEST when backtrack cooldown satisfied (encourages doubling back). */
const SCORE_BACKTRACK_WEST_BONUS = 3.5;

/** Base score for vertical movement in backtrack mode. */
const SCORE_BACKTRACK_VERTICAL = 1.2;

/** Penalty for reversal in backtrack mode (stronger than classic). */
const SCORE_BACKTRACK_REVERSAL_PENALTY = 1.0;

// ============================================================================
// Boundary Thresholds
// ============================================================================

/** Column distance from right edge to trigger short-path penalty. */
const NEAR_END_THRESHOLD = 5;

/** Column distance from left edge where WEST is discouraged. */
const NEAR_START_THRESHOLD = 4;

/** Minimum column before allowing WEST moves (hard constraint). */
const MIN_COL_FOR_WEST = 2;

/** Minimum column for backtrack WEST moves (more permissive personality). */
const MIN_COL_FOR_BACKTRACK = 5;

export const inBounds = (col: number, row: number): boolean => {
  return col >= 0 && col < MAP_COLS && row >= 0 && row < MAP_ROWS;
};

// ============================================================================
// Path Personality System
// ============================================================================

export enum PathPersonality {
  CLASSIC = 'CLASSIC',           // Current behavior: East-dominant
  SPIRAL = 'SPIRAL',             // Circular winding pattern
  BACKTRACK = 'BACKTRACK',       // Frequent West movement
  ZIGZAG_INTENSE = 'ZIGZAG_INTENSE', // Aggressive vertical oscillation
  MULTI_PASS = 'MULTI_PASS'      // Revisits similar rows at different columns
}

const selectPathPersonality = (seed: number): PathPersonality => {
  const random = mulberry32(seed ^ 0xbead);
  const personalities = Object.values(PathPersonality);
  const rawWeights = [0.40, 0.15, 0.15, 0.15, 0.15]; // CLASSIC weighted higher for stability

  // Validate and normalize weights to prevent floating-point accumulation issues
  const totalWeight = rawWeights.reduce((a, b) => a + b, 0);
  if (Math.abs(totalWeight - 1.0) > 0.001) {
    throw new Error(`Personality weights must sum to 1.0, got ${totalWeight}`);
  }
  const weights = rawWeights.map(w => w / totalWeight);

  const roll = random();
  let cumulative = 0;
  for (let i = 0; i < personalities.length; i++) {
    cumulative += weights[i];
    if (roll < cumulative) return personalities[i];  // Using < for correct probability distribution
  }
  return PathPersonality.CLASSIC;
};

// ============================================================================
// Shape Validation Helpers
// ============================================================================

interface ShapeRequirements {
  minRowCoverage?: number;
  minVerticalMoves?: number;
}

export const hasVariedShape = (
  path: GridPos[],
  requirements: ShapeRequirements = {}
): boolean => {
  const { minRowCoverage = MIN_ROW_COVERAGE, minVerticalMoves = MIN_VERTICAL_MOVES } = requirements;

  const rowsVisited = new Set(path.map(([, row]) => row));
  let verticalMoves = 0;

  for (let index = 1; index < path.length; index += 1) {
    if (path[index][1] !== path[index - 1][1]) verticalMoves += 1;
  }

  return rowsVisited.size >= minRowCoverage && verticalMoves >= minVerticalMoves;
};

export const hasBacktrackMoves = (path: GridPos[], minBacktracks: number = BACKTRACK_COOLDOWN): boolean => {
  let backtracks = 0;
  for (let i = 1; i < path.length; i++) {
    if (path[i][0] < path[i - 1][0]) backtracks++;
  }
  return backtracks >= minBacktracks;
};

export const hasPhaseTransitions = (path: GridPos[], minTransitions: number = 4): boolean => {
  let transitions = 0;
  let lastDirection: Direction | null = null;

  for (let i = 1; i < path.length; i++) {
    const dc = path[i][0] - path[i - 1][0];
    const dr = path[i][1] - path[i - 1][1];

    if (lastDirection && (dc !== lastDirection[0] || dr !== lastDirection[1])) {
      transitions++;
    }
    lastDirection = [dc, dr];
  }

  return transitions >= minTransitions;
};

// ============================================================================
// Path Generation: CLASSIC (East-dominant random walker)
// ============================================================================

const chooseDirectionOrderClassic = (
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
        score += SCORE_EAST_BASE;
        if (pathLength < MIN_PATH_LENGTH && col >= MAP_COLS - NEAR_END_THRESHOLD) score -= SCORE_EAST_NEAR_END_PENALTY;
      }
      if (dc === -1) {
        score += SCORE_WEST_BASE;
        if (col < NEAR_START_THRESHOLD) score -= SCORE_WEST_EDGE_PENALTY;
      }
      if (dr !== 0) {
        score += SCORE_VERTICAL_BASE;
        if (rowDelta !== 0 && dr === Math.sign(rowDelta)) score += SCORE_VERTICAL_TARGET_BONUS;
        if (Math.abs(rowDelta) <= 1) score -= SCORE_VERTICAL_NEAR_TARGET_PENALTY;
      }
      if (lastDirection !== null && isReversal([dc, dr], lastDirection)) score -= SCORE_REVERSAL_PENALTY;

      return { direction, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ direction }) => direction);
};

const generateClassicPath = (seed: number, attempt: number, rng?: () => number): GridPos[] | null => {
  const random = rng ?? mulberry32(seed + attempt * SEED_ATTEMPT_MULTIPLIER);
  const startRow = 1 + Math.floor(random() * (MAP_ROWS - 2));
  const targetRows = shuffle([1, 3, 5, 7, 9, 11, 13, 14, 2, 4, 6, 8, 10, 12], random).slice(0, 6);
  const path: GridPos[] = [[0, startRow]];
  const visited = new Set<string>([toCellKey(0, startRow)]);
  const maxSteps = MAX_PATH_STEPS;
  let lastDirection: Direction | null = null;

  while (path.length < maxSteps) {
    const [col, row] = path[path.length - 1];
    if (col === MAP_COLS - 1 && path.length >= MIN_PATH_LENGTH) {
      return hasVariedShape(path) ? path : null;
    }

    const progressTargetIndex = Math.min(targetRows.length - 1, Math.floor((col / (MAP_COLS - 1)) * targetRows.length));
    const targetRow = targetRows[progressTargetIndex];
    const directions = chooseDirectionOrderClassic(col, row, path.length, lastDirection, targetRow, random);
    const nextDirection = directions.find(([dc, dr]) => {
      const nextCol = col + dc;
      const nextRow = row + dr;
      if (!inBounds(nextCol, nextRow)) return false;
      if (visited.has(toCellKey(nextCol, nextRow))) return false;
      if (dc === -1 && col < MIN_COL_FOR_WEST) return false;
      return true;
    });
    if (nextDirection === undefined) return null;

    const [dc, dr] = nextDirection;
    const nextCol = col + dc;
    const nextRow = row + dr;
    path.push([nextCol, nextRow]);
    visited.add(toCellKey(nextCol, nextRow));
    lastDirection = nextDirection;
  }

  return null;
};

// ============================================================================
// Path Generation: SPIRAL (Circular winding pattern)
// ============================================================================

const generateSpiralPath = (seed: number, attempt: number, rng?: () => number): GridPos[] | null => {
  const random = rng ?? mulberry32(seed + attempt * SEED_ATTEMPT_MULTIPLIER);
  const startRow = 1 + Math.floor(random() * (MAP_ROWS - 2));
  let spiralDirection: 1 | -1 = random() < 0.5 ? 1 : -1;

  const path: GridPos[] = [[0, startRow]];
  const visited = new Set<string>([toCellKey(0, startRow)]);

  let phase = 0; // 0=across, 1=vertical
  let verticalRun = 0;
  const targetVerticalRun = 2 + Math.floor(random() * 2); // 2-3

  while (path.length < MAX_PATH_STEPS) {
    const [col, row] = path[path.length - 1];
    if (col === MAP_COLS - 1 && path.length >= MIN_PATH_LENGTH) {
      return hasVariedShape(path) ? path : null;
    }

    // Build preferred directions based on phase
    let preferredDirs: Direction[] = [];
    if (phase === 0) {
      preferredDirs = [EAST, [0, spiralDirection], [0, -spiralDirection], WEST];
    } else {
      preferredDirs = [[0, spiralDirection], EAST, [0, -spiralDirection], WEST];
    }

    // Find next direction, trying preferred first then any available
    let nextDir = preferredDirs.find(([dc, dr]) => {
      const nc = col + dc, nr = row + dr;
      return inBounds(nc, nr) && !visited.has(toCellKey(nc, nr));
    });

    // If stuck, try any direction
    if (!nextDir) {
      const fallbackDirs = shuffle([EAST, NORTH, SOUTH, WEST], random);
      nextDir = fallbackDirs.find(([dc, dr]) => {
        const nc = col + dc, nr = row + dr;
        return inBounds(nc, nr) && !visited.has(toCellKey(nc, nr));
      });
      if (!nextDir) return null;
    }

    const [dc, dr] = nextDir;
    path.push([col + dc, row + dr]);
    visited.add(toCellKey(col + dc, row + dr));

    // Update phase
    verticalRun++;
    if (verticalRun >= targetVerticalRun) {
      phase = phase === 0 ? 1 : 0;
      if (phase === 0) spiralDirection *= -1; // Reverse spiral when going back to horizontal
      verticalRun = 0;
    }
  }

  return null;
};

// ============================================================================
// Path Generation: BACKTRACK (Frequent West movement)
// ============================================================================

const generateBacktrackPath = (seed: number, attempt: number, rng?: () => number): GridPos[] | null => {
  const random = rng ?? mulberry32(seed + attempt * SEED_ATTEMPT_MULTIPLIER);
  const startRow = 1 + Math.floor(random() * (MAP_ROWS - 2));

  const path: GridPos[] = [[0, startRow]];
  const visited = new Set<string>([toCellKey(0, startRow)]);
  let lastDirection: Direction | null = null;
  let stepsSinceBacktrack = 0;

  while (path.length < MAX_PATH_STEPS) {
    const [col, row] = path[path.length - 1];
    if (col === MAP_COLS - 1 && path.length >= MIN_PATH_LENGTH) {
      return hasVariedShape(path) ? path : null;
    }

    // Build direction scores
    const directions = shuffle([EAST, NORTH, SOUTH, WEST], random);
    const scored = directions.map(dir => {
      const [dc, dr] = dir;
      let score = random();

      // Strong progress incentive
      if (dc === 1) score += SCORE_BACKTRACK_EAST;

      // Backtrack incentive: allow WEST more often if we haven't backtracked recently
      if (dc === -1 && col > MIN_COL_FOR_BACKTRACK && stepsSinceBacktrack > BACKTRACK_COOLDOWN) {
        score += SCORE_BACKTRACK_WEST_BONUS;
      }

      // Vertical variety
      if (dr !== 0) score += SCORE_BACKTRACK_VERTICAL;

      // Penalty for immediate reversal
      if (isReversal(dir, lastDirection)) {
        score -= SCORE_BACKTRACK_REVERSAL_PENALTY;
      }

      return { dir, score };
    }).sort((a, b) => b.score - a.score);

    // Find next direction
    let nextDir = scored.find(({ dir: [dc, dr] }) => {
      const nc = col + dc, nr = row + dr;
      return inBounds(nc, nr) && !visited.has(toCellKey(nc, nr));
    });

    // If stuck, try any direction
    if (!nextDir) {
      const fallbackDirs = shuffle([EAST, NORTH, SOUTH, WEST], random);
      const fallback = fallbackDirs.find(([dc, dr]) => {
        const nc = col + dc, nr = row + dr;
        return inBounds(nc, nr) && !visited.has(toCellKey(nc, nr));
      });
      if (!fallback) return null;
      nextDir = { dir: fallback, score: 0 };
    }

    const [dc, dr] = nextDir.dir;
    path.push([col + dc, row + dr]);
    visited.add(toCellKey(col + dc, row + dr));

    // Track backtrack steps
    if (dc === -1) {
      stepsSinceBacktrack = 0;
    } else {
      stepsSinceBacktrack++;
    }

    lastDirection = nextDir.dir;
  }

  return null;
};

// ============================================================================
// Path Generation: ZIGZAG_INTENSE (Aggressive vertical oscillation)
// ============================================================================

const generateZigzagPath = (seed: number, attempt: number, rng?: () => number): GridPos[] | null => {
  const random = rng ?? mulberry32(seed + attempt * SEED_ATTEMPT_MULTIPLIER);
  const startRow = 1 + Math.floor(random() * (MAP_ROWS - 2));

  const path: GridPos[] = [[0, startRow]];
  const visited = new Set<string>([toCellKey(0, startRow)]);
  let verticalDirection: 1 | -1 = 1;
  let consecutiveVertical = 0;
  const maxConsecutiveVertical = 2 + Math.floor(random() * 2); // 2-3

  while (path.length < MAX_PATH_STEPS) {
    const [col, row] = path[path.length - 1];
    if (col === MAP_COLS - 1 && path.length >= MIN_PATH_LENGTH) {
      return hasVariedShape(path) ? path : null;
    }

    // Build preferred directions based on current state
    let preferredDirs: Direction[] = [];
    if (consecutiveVertical < maxConsecutiveVertical) {
      // Prefer continuing vertical
      preferredDirs = [[0, verticalDirection], EAST, [0, -verticalDirection], WEST];
    } else {
      // Switch to horizontal progression, then flip vertical
      preferredDirs = [EAST, [0, verticalDirection], [0, -verticalDirection], WEST];
      consecutiveVertical = 0;
      verticalDirection = -verticalDirection as 1 | -1;
    }

    // Find next direction
    let nextDir = preferredDirs.find(([dc, dr]) => {
      const nc = col + dc, nr = row + dr;
      return inBounds(nc, nr) && !visited.has(toCellKey(nc, nr));
    });

    // If stuck, try any direction
    if (!nextDir) {
      const fallbackDirs = shuffle([EAST, NORTH, SOUTH, WEST], random);
      nextDir = fallbackDirs.find(([dc, dr]) => {
        const nc = col + dc, nr = row + dr;
        return inBounds(nc, nr) && !visited.has(toCellKey(nc, nr));
      });
      if (!nextDir) return null;
    }

    const [dc, dr] = nextDir;
    path.push([col + dc, row + dr]);
    visited.add(toCellKey(col + dc, row + dr));

    if (dr !== 0) {
      consecutiveVertical++;
    } else {
      consecutiveVertical = 0;
    }
  }

  return null;
};

// ============================================================================
// Path Generation: MULTI_PASS (Revisits similar rows at different columns)
// ============================================================================

const generateMultiPassPath = (seed: number, attempt: number, rng?: () => number): GridPos[] | null => {
  const random = rng ?? mulberry32(seed + attempt * SEED_ATTEMPT_MULTIPLIER);
  const startRow = 1 + Math.floor(random() * (MAP_ROWS - 2));

  // Define rough zones with overlapping ranges for flexibility
  const zones = [
    { colMax: 12 },
    { colMax: 23 },
    { colMax: 33 }
  ];

  const path: GridPos[] = [[0, startRow]];
  const visited = new Set<string>([toCellKey(0, startRow)]);
  let currentZone = 0;
  let lastDirection: Direction | null = null;

  while (path.length < MAX_PATH_STEPS) {
    const [col, row] = path[path.length - 1];
    if (col === MAP_COLS - 1 && path.length >= MIN_PATH_LENGTH) {
      return hasVariedShape(path) ? path : null;
    }

    // Update zone
    if (col > zones[currentZone].colMax && currentZone < 2) {
      currentZone++;
    }

    // Build direction scores
    const directions = shuffle([EAST, NORTH, SOUTH, WEST], random);
    const scored = directions.map(dir => {
      const [dc, dr] = dir;
      let score = random();

      // Progress to next zone or toward end
      if (dc === 1) {
        if (currentZone < 2 && col < zones[currentZone].colMax) {
          score += 2.5;
        } else if (currentZone === 2) {
          score += 2.0;
        }
      }

      // Vertical variety
      if (dr !== 0) score += 1.3;

      // Avoid going back too much
      if (dc === -1) score -= 0.5;

      // Avoid immediate reversal
      if (isReversal(dir, lastDirection)) {
        score -= 1.0;
      }

      return { dir, score };
    }).sort((a, b) => b.score - a.score);

    // Find next direction
    let nextDir = scored.find(({ dir: [dc, dr] }) => {
      const nc = col + dc, nr = row + dr;
      return inBounds(nc, nr) && !visited.has(toCellKey(nc, nr));
    });

    // If stuck, try any direction
    if (!nextDir) {
      const fallbackDirs = shuffle([EAST, NORTH, SOUTH, WEST], random);
      const fallback = fallbackDirs.find(([dc, dr]) => {
        const nc = col + dc, nr = row + dr;
        return inBounds(nc, nr) && !visited.has(toCellKey(nc, nr));
      });
      if (!fallback) return null;
      nextDir = { dir: fallback, score: 0 };
    }

    const [dc, dr] = nextDir.dir;
    path.push([col + dc, row + dr]);
    visited.add(toCellKey(col + dc, row + dr));
    lastDirection = nextDir.dir;
  }

  return null;
};

// ============================================================================
// Unified Path Generation Entry Point
// ============================================================================

export const generatePathAttempt = (
  seed: number,
  attempt: number,
  rng?: () => number
): GridPos[] | null => {
  const personality = selectPathPersonality(seed);

  switch (personality) {
    case PathPersonality.CLASSIC:
      return generateClassicPath(seed, attempt, rng);
    case PathPersonality.SPIRAL:
      return generateSpiralPath(seed, attempt, rng);
    case PathPersonality.BACKTRACK:
      return generateBacktrackPath(seed, attempt, rng);
    case PathPersonality.ZIGZAG_INTENSE:
      return generateZigzagPath(seed, attempt, rng);
    case PathPersonality.MULTI_PASS:
      return generateMultiPassPath(seed, attempt, rng);
    default:
      return generateClassicPath(seed, attempt, rng);
  }
};

// ============================================================================
// Grid Creation
// ============================================================================

export const createGridFromPath = (enemyPath: GridPos[]): Cell[][] => {
  const grid = Array.from({ length: MAP_ROWS }, () => Array.from({ length: MAP_COLS }, () => ({ type: CellType.BUILDABLE })));

  enemyPath.forEach(([col, row], index) => {
    grid[row][col] = { type: index === 0 ? CellType.SPAWN : index === enemyPath.length - 1 ? CellType.BASE : CellType.PATH };
  });

  return grid;
};
