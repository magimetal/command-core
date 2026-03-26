import { STARTING_BASE_HP, STARTING_CURRENCY } from '../const/game';
import { MAP_GRID } from '../const/map';
import { TowerArchetype } from '../const/towers';
import type { GameState } from '../models/game-state';

const cloneGrid = () => MAP_GRID.map((row) => row.map((cell) => ({ ...cell })));

export const createInitialState = (): GameState => {
  return {
    grid: cloneGrid(),
    enemies: [],
    towers: [],
    projectiles: [],
    currency: STARTING_CURRENCY,
    baseHp: STARTING_BASE_HP,
    wave: 1,
    phase: 'TITLE',
    frame: 0,
    cursor: [1, 1],
    selectedTowerArchetype: TowerArchetype.RAPID,
    spawnQueue: [],
    spawnTimerTicks: 0,
    enemiesKilled: 0,
    eventLog: []
  };
};
