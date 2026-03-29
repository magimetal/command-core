import type { Cell } from '../models/cell';
import { CellType } from '../models/cell';
import type { RunConfig } from '../models/run-config';
import { TowerArchetype } from './towers';
import {
  BLITZ_WAVES,
  COIL_WAVES,
  CROSSROADS_WAVES,
  CRUCIBLE_WAVES,
  GAUNTLET_WAVES,
  LABYRINTH_WAVES,
  OUROBOROS_WAVES,
  PERIMETER_WAVES,
  REVERSE_RUN_WAVES,
  type WaveDefinition,
  ZIGZAG_WAVES
} from './waves';

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

    const existingType = grid[row][col].type;
    const isAlreadyTerminal =
      existingType === CellType.SPAWN || existingType === CellType.BASE;

    if (!isAlreadyTerminal) {
      grid[row][col] = {
        type: isSpawn ? CellType.SPAWN : isBase ? CellType.BASE : CellType.PATH
      };
    }
  });

  return grid;
};

const stampObstacles = (grid: Cell[][], obstacles: [number, number][]): Cell[][] => {
  const next = cloneGrid(grid);

  obstacles.forEach(([col, row]) => {
    const existing = next[row][col].type;
    if (existing === CellType.BUILDABLE) {
      next[row][col] = { type: CellType.BLOCKED };
    }
  });

  return next;
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
  buildHorizontal(5, 4, 18);
  buildVertical(18, 5, 10);
  buildHorizontal(10, 18, 8);
  buildVertical(8, 10, 2);
  buildHorizontal(2, 8, 30);
  buildVertical(30, 2, 10);
  buildHorizontal(10, 30, MAP_COLS - 1);

  return path;
};

const CROSSROADS_OBSTACLES: [number, number][] = [
  [12, 0],
  [20, 1],
  [3, 7],
  [6, 8],
  [15, 7],
  [22, 8],
  [9, 6],
  [2, 11],
  [5, 14],
  [27, 15]
];

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
  buildHorizontal(2, 4, 22);
  buildVertical(22, 2, 12);
  buildHorizontal(12, 22, 10);
  buildVertical(10, 12, 14);
  buildHorizontal(14, 10, MAP_COLS - 1);

  return path;
};

const GAUNTLET_OBSTACLES: [number, number][] = [
  [7, 5],
  [12, 4],
  [14, 5],
  [16, 9],
  [18, 7],
  [20, 10],
  [26, 9],
  [27, 6]
];

const createPerimeterPath = (): [number, number][] => {
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

  buildHorizontal(0, 0, 33);
  buildVertical(33, 0, 15);
  buildHorizontal(15, 33, 0);
  buildVertical(0, 15, 6);
  buildHorizontal(6, 0, 24);
  buildVertical(24, 6, 2);
  buildHorizontal(2, 24, 8);
  buildVertical(8, 2, 10);
  buildHorizontal(10, 8, 26);
  buildVertical(26, 10, 6);
  buildHorizontal(6, 26, 0);
  buildVertical(0, 6, 9);

  return path;
};

const PERIMETER_OBSTACLES: [number, number][] = [
  [9, 4],
  [14, 4],
  [19, 4],
  [12, 8],
  [15, 9],
  [18, 7],
  [22, 11],
  [20, 11],
  [11, 4],
  [30, 12]
];

const createZigzagPath = (): [number, number][] => {
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

  buildHorizontal(2, 0, 14);
  buildVertical(14, 2, 10);
  buildHorizontal(10, 14, 1);
  buildVertical(1, 10, 15);
  buildHorizontal(15, 1, 20);
  buildVertical(20, 15, 3);
  buildHorizontal(3, 20, 30);
  buildVertical(30, 3, 12);
  buildHorizontal(12, 30, 33);

  return path;
};

const ZIGZAG_OBSTACLES: [number, number][] = [
  [4, 0],
  [9, 1],
  [14, 7],
  [10, 10],
  [18, 6],
  [22, 11],
  [24, 8],
  [27, 14]
];

const createCoilPath = (): [number, number][] => {
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

  buildHorizontal(1, 0, 20);
  buildVertical(20, 1, 11);
  buildHorizontal(11, 20, 6);
  buildVertical(6, 11, 4);
  buildHorizontal(4, 6, 26);
  buildVertical(26, 4, 14);
  buildHorizontal(14, 26, 10);
  buildVertical(10, 14, 1);
  buildHorizontal(1, 10, 33);

  return path;
};

const COIL_OBSTACLES: [number, number][] = [
  [2, 0],
  [30, 0],
  [4, 13],
  [14, 8],
  [16, 9],
  [12, 7],
  [15, 8],
  [31, 15]
];

const createReverseRunPath = (): [number, number][] => {
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

  buildHorizontal(3, 33, 10);
  buildVertical(10, 3, 9);
  buildHorizontal(9, 10, 24);
  buildVertical(24, 9, 14);
  buildHorizontal(14, 24, 6);
  buildVertical(6, 14, 5);
  buildHorizontal(5, 6, 18);
  buildVertical(18, 5, 3);
  buildHorizontal(3, 18, 0);

  return path;
};

const REVERSE_RUN_OBSTACLES: [number, number][] = [
  [30, 1],
  [3, 8],
  [2, 11],
  [5, 6],
  [28, 6],
  [26, 11],
  [12, 12],
  [4, 15]
];

const createLabyrinthPath = (): [number, number][] => {
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

  buildHorizontal(1, 0, 33);
  buildVertical(33, 1, 3);
  buildHorizontal(3, 33, 4);
  buildVertical(4, 3, 5);
  buildHorizontal(5, 4, 30);
  buildVertical(30, 5, 7);
  buildHorizontal(7, 30, 6);
  buildVertical(6, 7, 9);
  buildHorizontal(9, 6, 28);
  buildVertical(28, 9, 11);
  buildHorizontal(11, 28, 8);
  buildVertical(8, 11, 13);
  buildHorizontal(13, 8, 33);
  buildVertical(33, 13, 15);

  return path;
};

const LABYRINTH_OBSTACLES: [number, number][] = [
  [2, 0],
  [12, 0],
  [20, 0],
  [26, 2],
  [3, 4],
  [11, 8],
  [18, 8],
  [23, 13],
  [5, 10],
  [27, 9],
  [15, 14],
  [24, 14]
];

const createCruciblePath = (): [number, number][] => {
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

  buildHorizontal(8, 0, 10);
  buildVertical(10, 8, 3);
  buildHorizontal(3, 10, 25);
  buildVertical(25, 3, 11);
  buildHorizontal(11, 25, 14);
  buildVertical(14, 11, 6);
  buildHorizontal(6, 14, 13);
  buildVertical(13, 6, 12);
  buildHorizontal(12, 13, 33);

  return path;
};

const CRUCIBLE_OBSTACLES: [number, number][] = [
  [4, 1],
  [8, 2],
  [17, 1],
  [29, 4],
  [6, 10],
  [17, 8],
  [19, 9],
  [21, 7],
  [23, 8],
  [18, 10],
  [20, 14],
  [31, 15]
];

const createBlitzPath = (): [number, number][] => {
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

  buildHorizontal(7, 0, 33);

  return path;
};

const BLITZ_OBSTACLES: [number, number][] = [
  [2, 1],
  [4, 5],
  [6, 13],
  [8, 9],
  [10, 2],
  [12, 4],
  [14, 12],
  [16, 10],
  [20, 6],
  [22, 1],
  [24, 9],
  [28, 5],
  [30, 11],
  [32, 14]
];

const createOuroborosPath = (): [number, number][] => {
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

  buildHorizontal(2, 0, 16);
  buildVertical(16, 2, 7);
  buildHorizontal(7, 16, 6);
  buildVertical(6, 7, 12);
  buildHorizontal(12, 6, 16);
  buildVertical(16, 12, 7);
  buildHorizontal(7, 16, 28);
  buildVertical(28, 7, 3);
  buildHorizontal(3, 28, 18);
  buildVertical(18, 3, 10);
  buildHorizontal(10, 18, 33);

  return path;
};

const OUROBOROS_OBSTACLES: [number, number][] = [
  [4, 0],
  [22, 1],
  [12, 5],
  [14, 6],
  [24, 6],
  [18, 6],
  [14, 8],
  [18, 8],
  [8, 14],
  [30, 14]
];

export const OPERATIONS_MAP_DEFS: OperationsMapDef[] = [
  {
    id: 'map-01',
    label: 'Crossroads',
    description: 'Triple crossing lanes split upper and mid firing angles.',
    createGrid: () => stampObstacles(createGridFromPath(createCrossroadsPath()), CROSSROADS_OBSTACLES),
    createEnemyPath: createCrossroadsPath,
    waves: CROSSROADS_WAVES
  },
  {
    id: 'map-02',
    label: 'The Gauntlet',
    description: 'Extended Z-lane with alternating flank windows.',
    createGrid: () => stampObstacles(createGridFromPath(createGauntletPath()), GAUNTLET_OBSTACLES),
    createEnemyPath: createGauntletPath,
    waves: GAUNTLET_WAVES
  },
  {
    id: 'map-03',
    label: 'Perimeter',
    description: 'Perimeter sweep with an inward crossing spike.',
    createGrid: () => stampObstacles(createGridFromPath(createPerimeterPath()), PERIMETER_OBSTACLES),
    createEnemyPath: createPerimeterPath,
    waves: PERIMETER_WAVES
  },
  {
    id: 'map-04',
    label: 'Zigzag',
    description: 'Long W-chain with extra teeth and pivot pressure.',
    createGrid: () => stampObstacles(createGridFromPath(createZigzagPath()), ZIGZAG_OBSTACLES),
    createEnemyPath: createZigzagPath,
    waves: ZIGZAG_WAVES
  },
  {
    id: 'map-05',
    label: 'The Coil',
    description: 'Double-loop coil crossing through a narrow center.',
    createGrid: () => stampObstacles(createGridFromPath(createCoilPath()), COIL_OBSTACLES),
    createEnemyPath: createCoilPath,
    waves: COIL_WAVES
  },
  {
    id: 'map-06',
    label: 'Reverse Run',
    description: 'Reverse entry detour that crosses its opening lane.',
    createGrid: () => stampObstacles(createGridFromPath(createReverseRunPath()), REVERSE_RUN_OBSTACLES),
    createEnemyPath: createReverseRunPath,
    waves: REVERSE_RUN_WAVES
  },
  {
    id: 'map-07',
    label: 'Labyrinth',
    description: 'High-turn labyrinth with limited build pockets.',
    createGrid: () => stampObstacles(createGridFromPath(createLabyrinthPath()), LABYRINTH_OBSTACLES),
    createEnemyPath: createLabyrinthPath,
    waves: LABYRINTH_WAVES
  },
  {
    id: 'map-08',
    label: 'The Crucible',
    description: 'Open-center hairpin route with obstacle choke islands.',
    createGrid: () => stampObstacles(createGridFromPath(createCruciblePath()), CRUCIBLE_OBSTACLES),
    createEnemyPath: createCruciblePath,
    waves: CRUCIBLE_WAVES
  },
  {
    id: 'map-09',
    label: 'Blitz',
    description: 'Straight sprint lane split by dense obstacle fields.',
    createGrid: () => stampObstacles(createGridFromPath(createBlitzPath()), BLITZ_OBSTACLES),
    createEnemyPath: createBlitzPath,
    waves: BLITZ_WAVES
  },
  {
    id: 'map-10',
    label: 'Ouroboros',
    description: 'Figure-eight loop with a contested center crossing.',
    createGrid: () => stampObstacles(createGridFromPath(createOuroborosPath()), OUROBOROS_OBSTACLES),
    createEnemyPath: createOuroborosPath,
    waves: OUROBOROS_WAVES
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
