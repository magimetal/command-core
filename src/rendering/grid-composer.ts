import { ENEMY_DEFS, EnemyArchetype } from '../const/enemies';
import { getTowerDef, TowerArchetype } from '../const/towers';
import { CellType } from '../models/cell';
import { isPlacementPhase, type GameState } from '../models/game-state';
import { colorizeGridSymbol, type GridEntityClass } from './color-map';

const CELL_SYMBOLS: Record<CellType, string> = {
  [CellType.PATH]: '─',
  [CellType.BUILDABLE]: '░',
  [CellType.BLOCKED]: '╠',
  [CellType.SPAWN]: '⟹',
  [CellType.BASE]: '⬡'
};

const ENEMY_CLASS_MAP: Record<EnemyArchetype, GridEntityClass> = {
  [EnemyArchetype.STANDARD]: 'STANDARD_ENEMY',
  [EnemyArchetype.TANK]: 'TANK_ENEMY',
  [EnemyArchetype.FAST]: 'FAST_ENEMY'
};

const TOWER_CLASS_MAP: Record<TowerArchetype, GridEntityClass> = {
  [TowerArchetype.RAPID]: 'RAPID_TOWER',
  [TowerArchetype.CANNON]: 'CANNON_TOWER',
  [TowerArchetype.SNIPER]: 'SNIPER_TOWER',
  [TowerArchetype.SLOW]: 'SLOW_TOWER'
};

const PROJECTILE_CLASS_MAP: Record<TowerArchetype, GridEntityClass> = {
  [TowerArchetype.RAPID]: 'RAPID_PROJ',
  [TowerArchetype.CANNON]: 'CANNON_PROJ',
  [TowerArchetype.SNIPER]: 'SNIPER_PROJ',
  [TowerArchetype.SLOW]: 'SLOW_PROJ'
};

const isPathLikeCell = (cellType: CellType): boolean => {
  return cellType === CellType.PATH || cellType === CellType.SPAWN || cellType === CellType.BASE;
};

const getPathSymbol = (state: GameState, rowIndex: number, colIndex: number): string => {
  const hasNorth = rowIndex > 0 && isPathLikeCell(state.grid[rowIndex - 1][colIndex].type);
  const hasSouth =
    rowIndex < state.grid.length - 1 && isPathLikeCell(state.grid[rowIndex + 1][colIndex].type);
  const hasWest = colIndex > 0 && isPathLikeCell(state.grid[rowIndex][colIndex - 1].type);
  const hasEast =
    colIndex < state.grid[rowIndex].length - 1 &&
    isPathLikeCell(state.grid[rowIndex][colIndex + 1].type);

  if (hasNorth && hasSouth && hasEast && hasWest) return '┼';
  if (hasNorth && hasSouth && hasEast) return '├';
  if (hasNorth && hasSouth && hasWest) return '┤';
  if (hasNorth && hasEast && hasWest) return '┴';
  if (hasSouth && hasEast && hasWest) return '┬';
  if (hasNorth && hasSouth) return '│';
  if (hasEast && hasWest) return '─';
  if (hasSouth && hasEast) return '┌';
  if (hasSouth && hasWest) return '┐';
  if (hasNorth && hasEast) return '└';
  if (hasNorth && hasWest) return '┘';

  return '─';
};

const getTowerLookup = (state: GameState): Map<string, TowerArchetype> => {
  return new Map(state.towers.map((tower) => [`${tower.pos[0]},${tower.pos[1]}`, tower.archetype]));
};

const getEnemyLookup = (
  state: GameState
): Map<string, { archetype: EnemyArchetype; hp: number; maxHp: number }> => {
  return new Map(
    state.enemies
      .filter((enemy) => !enemy.dead)
      .map((enemy) => [
        `${enemy.pos[0]},${enemy.pos[1]}`,
        { archetype: enemy.archetype, hp: enemy.hp, maxHp: enemy.maxHp }
      ])
  );
};

const getCellClass = (cellType: CellType): GridEntityClass => {
  if (cellType === CellType.PATH) return 'PATH';
  if (cellType === CellType.BUILDABLE) return 'BUILDABLE';
  if (cellType === CellType.BLOCKED) return 'BLOCKED';
  if (cellType === CellType.SPAWN) return 'SPAWN';
  return 'BASE';
};

const buildRangePreviewKeys = (state: GameState): Set<string> => {
  if (!isPlacementPhase(state.phase)) {
    return new Set();
  }

  const [cursorCol, cursorRow] = state.cursor;
  const cursorCell = state.grid[cursorRow]?.[cursorCol];
  if (!cursorCell || cursorCell.type !== CellType.BUILDABLE || cursorCell.tower !== undefined) {
    return new Set();
  }

  const towerDef = getTowerDef(state.selectedTowerArchetype);
  const rangeSquared = towerDef.range * towerDef.range;
  const keys = new Set<string>();

  for (let row = 0; row < state.grid.length; row += 1) {
    for (let col = 0; col < state.grid[row].length; col += 1) {
      const gridCell = state.grid[row][col];
      const previewableCell =
        gridCell.type === CellType.PATH ||
        (gridCell.type === CellType.BUILDABLE && gridCell.tower === undefined);
      if (!previewableCell) {
        continue;
      }

      const dx = col - cursorCol;
      const dy = row - cursorRow;
      if (dx * dx + dy * dy <= rangeSquared) {
        keys.add(`${col},${row}`);
      }
    }
  }

  return keys;
};

export const composeGrid = (state: GameState): string[] => {
  const enemyLookup = getEnemyLookup(state);
  const towerLookup = getTowerLookup(state);
  const projectileLookup = new Map(
    state.projectiles.map((projectile) => [`${projectile.pos[0]},${projectile.pos[1]}`, projectile])
  );
  const cursorKey = `${state.cursor[0]},${state.cursor[1]}`;
  const rangePreviewKeys = buildRangePreviewKeys(state);
  const placementPhase = isPlacementPhase(state.phase);

  return state.grid.map((row, rowIndex) =>
    row
      .map((cell, colIndex) => {
        const key = `${colIndex},${rowIndex}`;

        const enemy = enemyLookup.get(key);
        if (enemy !== undefined) {
          const enemySymbol = ENEMY_DEFS[enemy.archetype].symbol;
          if (key === cursorKey) {
            return colorizeGridSymbol(enemySymbol, 'CURSOR');
          }

          const hpRatio = enemy.hp / enemy.maxHp;

          return colorizeGridSymbol(enemySymbol, ENEMY_CLASS_MAP[enemy.archetype], hpRatio);
        }

        const towerArchetype = towerLookup.get(key);
        const projectile = projectileLookup.get(key);

        if (towerArchetype !== undefined) {
          const towerSymbol = getTowerDef(towerArchetype).symbol;
          if (key === cursorKey) {
            return colorizeGridSymbol(towerSymbol, 'CURSOR');
          }

          return colorizeGridSymbol(towerSymbol, TOWER_CLASS_MAP[towerArchetype]);
        }

        if (projectile !== undefined) {
          if (key === cursorKey) {
            return colorizeGridSymbol(projectile.symbol, 'CURSOR');
          }

          return colorizeGridSymbol(projectile.symbol, PROJECTILE_CLASS_MAP[projectile.archetype]);
        }

        if (rangePreviewKeys.has(key) && key !== cursorKey) {
          if (cell.type === CellType.PATH) {
            return colorizeGridSymbol('•', 'PATH');
          }

          if (cell.type === CellType.BUILDABLE && cell.tower === undefined) {
            return colorizeGridSymbol('◌', 'BUILDABLE');
          }
        }

        const cellSymbol =
          cell.type === CellType.PATH
            ? getPathSymbol(state, rowIndex, colIndex)
            : cell.type === CellType.BASE
              ? state.frame % 4 < 2
                ? '⬡'
                : '⊡'
              : CELL_SYMBOLS[cell.type];

        if (key === cursorKey) {
          if (placementPhase && cell.type === CellType.BUILDABLE) {
            const ghostSymbol = getTowerDef(state.selectedTowerArchetype).symbol;
            return colorizeGridSymbol(ghostSymbol, 'CURSOR');
          }

          return colorizeGridSymbol(cellSymbol, 'CURSOR');
        }

        return colorizeGridSymbol(cellSymbol, getCellClass(cell.type));
      })
      .join(' ')
  );
};
