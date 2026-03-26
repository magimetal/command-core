import { getTowerDef } from '../const/towers';
import { isPlacementPhase, type GameState } from '../models/game-state';
import type { OperationError } from '../models/operation-error';

export const sellTower = (
  state: GameState,
  pos: [number, number]
): GameState | OperationError => {
  if (!isPlacementPhase(state.phase)) {
    return { error: 'Cannot sell outside of placement phase' };
  }

  const [col, row] = pos;
  const cell = state.grid[row]?.[col];
  if (!cell || cell.tower === undefined) {
    return { error: 'No tower to sell' };
  }

  const tower = state.towers.find((entry) => entry.id === cell.tower);
  if (!tower) {
    return { error: 'No tower to sell' };
  }

  const refund = Math.floor(getTowerDef(tower.archetype).cost / 2);

  const nextGrid = state.grid.map((gridRow, rowIndex) => {
    if (rowIndex !== row) {
      return gridRow;
    }

    return gridRow.map((gridCell, colIndex) => {
      if (colIndex !== col) {
        return gridCell;
      }

      const { tower: _removedTower, ...rest } = gridCell;
      return { ...rest };
    });
  });

  return {
    ...state,
    grid: nextGrid,
    currency: state.currency + refund,
    towers: state.towers.filter((entry) => entry.id !== tower.id)
  };
};
