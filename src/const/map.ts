import { CellType, type Cell } from '../models/cell';

const MAP_ROWS = 16;
const MAP_COLS = 28;

const buildEmptyGrid = (): Cell[][] => {
  return Array.from({ length: MAP_ROWS }, () =>
    Array.from({ length: MAP_COLS }, () => ({ type: CellType.BUILDABLE }))
  );
};

const buildEnemyPath = (): [number, number][] => {
  const path: [number, number][] = [];

  const pushWaypoint = (col: number, row: number) => {
    const previous = path[path.length - 1];
    if (previous !== undefined && previous[0] === col && previous[1] === row) {
      return;
    }

    path.push([col, row]);
  };

  const pushHorizontal = (row: number, startCol: number, endCol: number) => {
    const step = startCol <= endCol ? 1 : -1;

    for (
      let col = startCol;
      step > 0 ? col <= endCol : col >= endCol;
      col += step
    ) {
      pushWaypoint(col, row);
    }
  };

  const pushVertical = (col: number, startRow: number, endRow: number) => {
    const step = startRow <= endRow ? 1 : -1;

    for (
      let row = startRow;
      step > 0 ? row <= endRow : row >= endRow;
      row += step
    ) {
      pushWaypoint(col, row);
    }
  };

  pushHorizontal(2, 0, 24);
  pushVertical(24, 2, 13);
  pushHorizontal(13, 24, 4);
  pushVertical(4, 13, 5);
  pushHorizontal(5, 4, 13);
  pushVertical(13, 5, 10);
  pushHorizontal(10, 13, MAP_COLS - 1);

  return path;
};

const createMapGrid = (): Cell[][] => {
  const grid = buildEmptyGrid();
  const enemyPath = buildEnemyPath();

  enemyPath.forEach(([col, row], index) => {
    const isSpawn = index === 0;
    const isBase = index === enemyPath.length - 1;

    grid[row][col] = {
      type: isSpawn ? CellType.SPAWN : isBase ? CellType.BASE : CellType.PATH
    };
  });

  return grid;
};

export const ENEMY_PATH: [number, number][] = buildEnemyPath();

export const MAP_GRID: Cell[][] = createMapGrid();
