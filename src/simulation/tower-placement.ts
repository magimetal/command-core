import { getTowerDef, type TowerArchetype } from '../const/towers';
import { CellType } from '../models/cell';
import type { GameState } from '../models/game-state';
import type { Tower } from '../models/tower';

interface PlacementError {
  error: string;
}

const isInBounds = (state: GameState, pos: [number, number]): boolean => {
  const [col, row] = pos;

  return row >= 0 && row < state.grid.length && col >= 0 && col < state.grid[0].length;
};

export const placeTower = (
  state: GameState,
  pos: [number, number],
  archetype: TowerArchetype
): GameState | PlacementError => {
  if (!isInBounds(state, pos)) {
    return { error: 'Out of bounds' };
  }

  const [col, row] = pos;
  const cell = state.grid[row][col];

  if (cell.type !== CellType.BUILDABLE) {
    return { error: 'Cell is not buildable' };
  }

  if (cell.tower !== undefined) {
    return { error: 'Cell already occupied' };
  }

  const towerDef = getTowerDef(archetype);

  if (state.currency < towerDef.cost) {
    return { error: 'Insufficient currency' };
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
