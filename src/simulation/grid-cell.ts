import type { Cell } from '../models/cell';

export const isInBounds = (grid: Cell[][], pos: [number, number]): boolean => {
  const [col, row] = pos;
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
};

export const getCellAt = (grid: Cell[][], pos: [number, number]): Cell | undefined => {
  if (!isInBounds(grid, pos)) {
    return undefined;
  }

  const [col, row] = pos;
  return grid[row][col];
};

export const updateCellAt = (
  grid: Cell[][],
  pos: [number, number],
  update: (cell: Cell) => Cell
): Cell[][] => {
  const [targetCol, targetRow] = pos;

  return grid.map((row, rowIndex) => {
    if (rowIndex !== targetRow) {
      return row;
    }

    return row.map((cell, colIndex) => {
      if (colIndex !== targetCol) {
        return cell;
      }

      return update(cell);
    });
  });
};
