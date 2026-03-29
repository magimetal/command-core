import { getTowerDef } from '../const/towers';
import { isPlacementPhase, type GameState } from '../models/game-state';
import type { OperationError } from '../models/operation-error';
import { getCellAt, updateCellAt } from './grid-cell';

export const sellTower = (
  state: GameState,
  pos: [number, number]
): GameState | OperationError => {
  if (!isPlacementPhase(state.phase)) {
    return { error: 'You can only sell towers between waves' };
  }

  const cell = getCellAt(state.grid, pos);
  if (!cell || cell.tower === undefined) {
    return { error: 'No tower at cursor to sell' };
  }

  const tower = state.towers.find((entry) => entry.id === cell.tower);
  if (!tower) {
    return { error: 'No tower at cursor to sell' };
  }

  const refund = Math.floor(getTowerDef(tower.archetype).cost / 2);

  const nextGrid = updateCellAt(state.grid, pos, (gridCell) => {
    const { tower: _removedTower, ...rest } = gridCell;
    return { ...rest };
  });

  return {
    ...state,
    grid: nextGrid,
    currency: state.currency + refund,
    towers: state.towers.filter((entry) => entry.id !== tower.id)
  };
};
