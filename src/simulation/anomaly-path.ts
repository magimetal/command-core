import { CellType, type Cell, type GridPos } from '../models/cell';
import { mulberry32, shuffle } from '../utils/prng';

const MAP_ROWS = 16;
const MAP_COLS = 34;
const MIN_PATH_LENGTH = 56;
const MIN_ROW_COVERAGE = 8;
const MIN_VERTICAL_MOVES = 16;

type Direction = [number, number];

const EAST: Direction = [1, 0];
const NORTH: Direction = [0, -1];
const SOUTH: Direction = [0, 1];
const WEST: Direction = [-1, 0];

const toCellKey = (col: number, row: number): string => `${col},${row}`;

export const inBounds = (col: number, row: number): boolean => {
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
        if (pathLength < MIN_PATH_LENGTH && col >= MAP_COLS - 5) score -= 2;
      }
      if (dc === -1) {
        score += 0.7;
        if (col < 4) score -= 1.5;
      }
      if (dr !== 0) {
        score += 1.1;
        if (rowDelta !== 0 && dr === Math.sign(rowDelta)) score += 2.4;
        if (Math.abs(rowDelta) <= 1) score -= 0.8;
      }
      if (lastDirection !== null && dc === -lastDirection[0] && dr === -lastDirection[1]) score -= 0.9;

      return { direction, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ direction }) => direction);
};

export const hasVariedShape = (path: GridPos[]): boolean => {
  const rowsVisited = new Set(path.map(([, row]) => row));
  let verticalMoves = 0;

  for (let index = 1; index < path.length; index += 1) {
    if (path[index][1] !== path[index - 1][1]) verticalMoves += 1;
  }

  return rowsVisited.size >= MIN_ROW_COVERAGE && verticalMoves >= MIN_VERTICAL_MOVES;
};

export const createGridFromPath = (enemyPath: GridPos[]): Cell[][] => {
  const grid = Array.from({ length: MAP_ROWS }, () => Array.from({ length: MAP_COLS }, () => ({ type: CellType.BUILDABLE })));

  enemyPath.forEach(([col, row], index) => {
    grid[row][col] = { type: index === 0 ? CellType.SPAWN : index === enemyPath.length - 1 ? CellType.BASE : CellType.PATH };
  });

  return grid;
};

export const generatePathAttempt = (seed: number, attempt: number, rng?: () => number): GridPos[] | null => {
  const random = rng ?? mulberry32(seed + attempt * 1009);
  const startRow = 1 + Math.floor(random() * (MAP_ROWS - 2));
  const targetRows = shuffle([1, 3, 5, 7, 9, 11, 13, 14, 2, 4, 6, 8, 10, 12], random).slice(0, 6);
  const path: GridPos[] = [[0, startRow]];
  const visited = new Set<string>([toCellKey(0, startRow)]);
  const maxSteps = 320;
  let lastDirection: Direction | null = null;

  while (path.length < maxSteps) {
    const [col, row] = path[path.length - 1];
    if (col === MAP_COLS - 1 && path.length >= MIN_PATH_LENGTH) return hasVariedShape(path) ? path : null;

    const progressTargetIndex = Math.min(targetRows.length - 1, Math.floor((col / (MAP_COLS - 1)) * targetRows.length));
    const targetRow = targetRows[progressTargetIndex];
    const directions = chooseDirectionOrder(col, row, path.length, lastDirection, targetRow, random);
    const nextDirection = directions.find(([dc, dr]) => {
      const nextCol = col + dc;
      const nextRow = row + dr;
      if (!inBounds(nextCol, nextRow)) return false;
      if (visited.has(toCellKey(nextCol, nextRow))) return false;
      if (dc === -1 && col < 2) return false;
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
