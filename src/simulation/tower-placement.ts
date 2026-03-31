import { getTowerDef, type TowerArchetype } from '../const/towers';
import { CellType, type GridPos } from '../models/cell';
import type { GameState } from '../models/game-state';
import type { OperationError } from '../models/operation-error';
import type { Tower } from '../models/tower';
import { getCellAt, isInBounds, updateCellAt } from './grid-cell';

export enum PlacementErrorCode {
  OUT_OF_BOUNDS = 'OUT_OF_BOUNDS',
  OBSTACLE = 'OBSTACLE',
  NOT_BUILDABLE = 'NOT_BUILDABLE',
  OCCUPIED = 'OCCUPIED',
  INSUFFICIENT_CURRENCY = 'INSUFFICIENT_CURRENCY'
}

export const placeTower = (
  state: GameState,
  pos: GridPos,
  archetype: TowerArchetype
): GameState | OperationError<PlacementErrorCode> => {
  if (!isInBounds(state.grid, pos)) {
    return { error: PlacementErrorCode.OUT_OF_BOUNDS };
  }

  const cell = getCellAt(state.grid, pos);
  if (cell === undefined) {
    return { error: PlacementErrorCode.OUT_OF_BOUNDS };
  }

  if (cell.type === CellType.BLOCKED) {
    return { error: PlacementErrorCode.OBSTACLE };
  }

  if (cell.type !== CellType.BUILDABLE) {
    return { error: PlacementErrorCode.NOT_BUILDABLE };
  }

  if (cell.tower !== undefined) {
    return { error: PlacementErrorCode.OCCUPIED };
  }

  const towerDef = getTowerDef(archetype);

  if (state.currency < towerDef.cost) {
    return { error: PlacementErrorCode.INSUFFICIENT_CURRENCY };
  }

  const nextGrid = updateCellAt(state.grid, pos, (gridCell) => ({
    ...gridCell,
    tower: `tower-${state.towers.length + 1}`
  }));

  const tower: Tower = {
    id: `tower-${state.towers.length + 1}`,
    archetype,
    pos,
    cooldownRemaining: 0,
    kills: 0
  };

  return {
    ...state,
    grid: nextGrid,
    currency: state.currency - towerDef.cost,
    towers: [...state.towers, tower]
  };
};
