import type { Cell } from '../models/cell';
import { CellType } from '../models/cell';
import type { RunConfig } from '../models/run-config';
import { EnemyArchetype } from './enemies';
import { TowerArchetype } from './towers';
import { CROSSROADS_WAVES, type WaveDefinition } from './waves';

const MAP_ROWS = 16;
const MAP_COLS = 34;
const OPERATIONS_STARTING_CURRENCY = 120;
const OPERATIONS_STARTING_BASE_HP = 16;

export interface OperationsMapDef {
  id: string;
  label: string;
  description: string;
  createGrid: () => Cell[][];
  createEnemyPath: () => [number, number][];
  waves: WaveDefinition[];
}

const buildEmptyGrid = (): Cell[][] => {
  return Array.from({ length: MAP_ROWS }, () =>
    Array.from({ length: MAP_COLS }, () => ({ type: CellType.BUILDABLE }))
  );
};

const cloneGrid = (grid: Cell[][]): Cell[][] => {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
};

const clonePath = (enemyPath: [number, number][]): [number, number][] => {
  return enemyPath.map(([col, row]) => [col, row]);
};

const cloneWaves = (waves: WaveDefinition[]): WaveDefinition[] => {
  return waves.map((wave) => ({
    enemies: wave.enemies.map((enemyGroup) => ({ ...enemyGroup }))
  }));
};

const createGridFromPath = (enemyPath: [number, number][]): Cell[][] => {
  const grid = buildEmptyGrid();

  enemyPath.forEach(([col, row], index) => {
    const isSpawn = index === 0;
    const isBase = index === enemyPath.length - 1;

    grid[row][col] = {
      type: isSpawn ? CellType.SPAWN : isBase ? CellType.BASE : CellType.PATH
    };
  });

  return grid;
};

const createCrossroadsPath = (): [number, number][] => {
  const path: [number, number][] = [];

  const pushWaypoint = (col: number, row: number) => {
    const previous = path[path.length - 1];
    if (previous !== undefined && previous[0] === col && previous[1] === row) {
      return;
    }

    path.push([col, row]);
  };

  const buildHorizontal = (row: number, startCol: number, endCol: number) => {
    const step = startCol <= endCol ? 1 : -1;
    for (let col = startCol; step > 0 ? col <= endCol : col >= endCol; col += step) {
      pushWaypoint(col, row);
    }
  };

  const buildVertical = (col: number, startRow: number, endRow: number) => {
    const step = startRow <= endRow ? 1 : -1;
    for (let row = startRow; step > 0 ? row <= endRow : row >= endRow; row += step) {
      pushWaypoint(col, row);
    }
  };

  buildHorizontal(2, 0, 24);
  buildVertical(24, 2, 13);
  buildHorizontal(13, 24, 4);
  buildVertical(4, 13, 5);
  buildHorizontal(5, 4, 13);
  buildVertical(13, 5, 10);
  buildHorizontal(10, 13, MAP_COLS - 1);

  return path;
};

const createGauntletPath = (): [number, number][] => {
  const path: [number, number][] = [];

  const pushWaypoint = (col: number, row: number) => {
    const previous = path[path.length - 1];
    if (previous !== undefined && previous[0] === col && previous[1] === row) {
      return;
    }

    path.push([col, row]);
  };

  const buildHorizontal = (row: number, startCol: number, endCol: number) => {
    const step = startCol <= endCol ? 1 : -1;
    for (let col = startCol; step > 0 ? col <= endCol : col >= endCol; col += step) {
      pushWaypoint(col, row);
    }
  };

  const buildVertical = (col: number, startRow: number, endRow: number) => {
    const step = startRow <= endRow ? 1 : -1;
    for (let row = startRow; step > 0 ? row <= endRow : row >= endRow; row += step) {
      pushWaypoint(col, row);
    }
  };

  buildHorizontal(8, 0, 4);
  buildVertical(4, 8, 2);
  buildHorizontal(2, 4, 20);
  buildVertical(20, 2, 13);
  buildHorizontal(13, 20, 8);
  buildVertical(8, 13, 8);
  buildHorizontal(8, 8, MAP_COLS - 1);

  return path;
};

const GAUNTLET_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 8, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.FAST, count: 2, spawnIntervalTicks: 11 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 6, spawnIntervalTicks: 8 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 8, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.TANK, count: 4, spawnIntervalTicks: 17 },
      { archetype: EnemyArchetype.FAST, count: 7, spawnIntervalTicks: 7 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 13, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.TANK, count: 6, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.FAST, count: 8, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 11, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 8, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.FAST, count: 12, spawnIntervalTicks: 4 }
    ]
  }
];

export const OPERATIONS_MAP_DEFS: OperationsMapDef[] = [
  {
    id: 'map-01',
    label: 'Crossroads',
    description: 'Balanced S-curve with safe build pockets.',
    createGrid: () => createGridFromPath(createCrossroadsPath()),
    createEnemyPath: createCrossroadsPath,
    waves: CROSSROADS_WAVES
  },
  {
    id: 'map-02',
    label: 'The Gauntlet',
    description: 'Long pressure lane with tight turn windows.',
    createGrid: () => createGridFromPath(createGauntletPath()),
    createEnemyPath: createGauntletPath,
    waves: GAUNTLET_WAVES
  }
];

export const createOperationsRunConfig = (mapDef: OperationsMapDef): RunConfig => {
  return {
    mode: 'OPERATIONS',
    modeMultiplier: 1,
    startingCurrency: OPERATIONS_STARTING_CURRENCY,
    startingBaseHp: OPERATIONS_STARTING_BASE_HP,
    mapId: mapDef.id,
    mapLabel: mapDef.label,
    grid: cloneGrid(mapDef.createGrid()),
    enemyPath: clonePath(mapDef.createEnemyPath()),
    waves: cloneWaves(mapDef.waves),
    availableTowers: [
      TowerArchetype.RAPID,
      TowerArchetype.CANNON,
      TowerArchetype.SNIPER,
      TowerArchetype.SLOW
    ]
  };
};
