import { createOperationsRunConfig, OPERATIONS_MAP_DEFS } from '../const/operations-maps';
import type { GameState } from '../models/game-state';
import type { RunConfig } from '../models/run-config';

const cloneGrid = (grid: RunConfig['grid']) => grid.map((row) => row.map((cell) => ({ ...cell })));

const cloneRunConfig = (config: RunConfig): RunConfig => {
  return {
    ...config,
    grid: cloneGrid(config.grid),
    enemyPath: config.enemyPath.map(([col, row]) => [col, row]),
    waves: config.waves.map((wave) => ({ enemies: wave.enemies.map((group) => ({ ...group })) })),
    availableTowers: [...config.availableTowers]
  };
};

export const createInitialState = (config?: RunConfig): GameState => {
  const runConfig = cloneRunConfig(config ?? createOperationsRunConfig(OPERATIONS_MAP_DEFS[0]));

  return {
    runConfig,
    grid: cloneGrid(runConfig.grid),
    enemies: [],
    towers: [],
    projectiles: [],
    currency: runConfig.startingCurrency,
    baseHp: runConfig.startingBaseHp,
    wave: 1,
    phase: 'TITLE',
    frame: 0,
    menuCursor: 0,
    cursor: [1, 1],
    selectedTowerArchetype: runConfig.availableTowers[0],
    spawnQueue: [],
    spawnTimerTicks: 0,
    enemiesKilled: 0,
    eventLog: []
  };
};
