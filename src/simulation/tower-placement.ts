import { getTowerDef, type TowerArchetype } from '../const/towers';
import { CellType } from '../models/cell';
import type { GameState } from '../models/game-state';
import type { OperationError } from '../models/operation-error';
import type { Tower } from '../models/tower';

export enum PlacementErrorCode {
  OUT_OF_BOUNDS = 'OUT_OF_BOUNDS',
  OBSTACLE = 'OBSTACLE',
  NOT_BUILDABLE = 'NOT_BUILDABLE',
  OCCUPIED = 'OCCUPIED',
  INSUFFICIENT_CURRENCY = 'INSUFFICIENT_CURRENCY'
}

const isInBounds = (state: GameState, pos: [number, number]): boolean => {
  const [col, row] = pos;

  return row >= 0 && row < state.grid.length && col >= 0 && col < state.grid[0].length;
};

export const placeTower = (
  state: GameState,
  pos: [number, number],
  archetype: TowerArchetype
): GameState | OperationError<PlacementErrorCode> => {
  if (!isInBounds(state, pos)) {
    return { error: PlacementErrorCode.OUT_OF_BOUNDS };
  }

  const [col, row] = pos;
  const cell = state.grid[row][col];

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

  const nextGrid = state.grid.map((gridRow, rowIndex) => {
    if (rowIndex !== row) {
      return gridRow;
    }

    return gridRow.map((gridCell, colIndex) => {
      if (colIndex !== col) {
        return gridCell;
      }

      return {
        ...gridCell,
        tower: `tower-${state.towers.length + 1}`
      };
    });
  });

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
