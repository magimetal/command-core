import { ENEMY_DEFS, EnemyArchetype } from '../const/enemies';
import { getTowerDef, TowerArchetype } from '../const/towers';
import { CellType } from '../models/cell';
import { isPlacementPhase, type GameState } from '../models/game-state';
import { isReducedMotionEnabled } from './accessibility';
import { colorizeGridSymbol, type GridEntityClass } from './color-map';

const CELL_SYMBOLS: Record<CellType, string> = {
  [CellType.PATH]: '─',
  [CellType.BUILDABLE]: '░',
  [CellType.BLOCKED]: '▪',
  [CellType.SPAWN]: '⟹',
  [CellType.BASE]: '⬡'
};

const ENEMY_CLASS_MAP: Record<EnemyArchetype, GridEntityClass> = {
  [EnemyArchetype.STANDARD]: 'STANDARD_ENEMY',
  [EnemyArchetype.TANK]: 'TANK_ENEMY',
  [EnemyArchetype.FAST]: 'FAST_ENEMY',
  [EnemyArchetype.BRUTE]: 'BRUTE_ENEMY',
  [EnemyArchetype.COLOSSUS]: 'COLOSSUS_ENEMY'
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

const pathSymbolCacheByGrid = new WeakMap<GameState['grid'], Map<string, string>>();

const getPathSymbolForGrid = (grid: GameState['grid'], rowIndex: number, colIndex: number): string => {
  const hasNorth = rowIndex > 0 && isPathLikeCell(grid[rowIndex - 1][colIndex].type);
  const hasSouth =
    rowIndex < grid.length - 1 && isPathLikeCell(grid[rowIndex + 1][colIndex].type);
  const hasWest = colIndex > 0 && isPathLikeCell(grid[rowIndex][colIndex - 1].type);
  const hasEast =
    colIndex < grid[rowIndex].length - 1 &&
    isPathLikeCell(grid[rowIndex][colIndex + 1].type);

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

const buildPathSymbolCache = (grid: GameState['grid']): Map<string, string> => {
  const cache = new Map<string, string>();

  for (let rowIndex = 0; rowIndex < grid.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex += 1) {
      if (grid[rowIndex][colIndex].type !== CellType.PATH) {
        continue;
      }

      cache.set(`${colIndex},${rowIndex}`, getPathSymbolForGrid(grid, rowIndex, colIndex));
    }
  }

  return cache;
};

const getPathSymbolCache = (grid: GameState['grid']): Map<string, string> => {
  const cached = pathSymbolCacheByGrid.get(grid);
  if (cached !== undefined) {
    return cached;
  }

  const nextCache = buildPathSymbolCache(grid);
  pathSymbolCacheByGrid.set(grid, nextCache);
  return nextCache;
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

type GridRenderToken = {
  symbol: string;
  entityClass: GridEntityClass;
  hpRatio?: number;
  singleton?: boolean;
};

const getHpBucket = (hpRatio?: number): 'low' | 'mid' | 'high' | 'none' => {
  if (hpRatio === undefined) {
    return 'none';
  }

  if (hpRatio < 0.33) {
    return 'low';
  }

  if (hpRatio <= 0.66) {
    return 'mid';
  }

  return 'high';
};

const buildColorRun = (tokens: GridRenderToken[]): string => {
  const segments: string[] = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];

    if (token.singleton) {
      segments.push(colorizeGridSymbol(token.symbol, token.entityClass, token.hpRatio));
      index += 1;
      continue;
    }

    const runSymbols: string[] = [token.symbol];
    const runClass = token.entityClass;
    const runHpBucket = getHpBucket(token.hpRatio);
    let cursor = index + 1;

    while (cursor < tokens.length) {
      const nextToken = tokens[cursor];
      if (nextToken.singleton) {
        break;
      }

      if (
        nextToken.entityClass !== runClass ||
        getHpBucket(nextToken.hpRatio) !== runHpBucket
      ) {
        break;
      }

      runSymbols.push(nextToken.symbol);
      cursor += 1;
    }

    segments.push(colorizeGridSymbol(runSymbols.join(' '), runClass, token.hpRatio));
    index = cursor;
  }

  return segments.join(' ');
};

export const composeGrid = (state: GameState): string[] => {
  const reducedMotion = isReducedMotionEnabled();
  const enemyLookup = getEnemyLookup(state);
  const towerLookup = getTowerLookup(state);
  const projectileLookup = new Map(
    state.projectiles.map((projectile) => [`${projectile.pos[0]},${projectile.pos[1]}`, projectile])
  );
  const cursorKey = `${state.cursor[0]},${state.cursor[1]}`;
  const rangePreviewKeys = buildRangePreviewKeys(state);
  const placementPhase = isPlacementPhase(state.phase);
  const pathSymbolCache = getPathSymbolCache(state.grid);

  return state.grid.map((row, rowIndex) => {
    const tokens: GridRenderToken[] = row.map((cell, colIndex): GridRenderToken => {
        const key = `${colIndex},${rowIndex}`;

        const enemy = enemyLookup.get(key);
        if (enemy !== undefined) {
          const enemySymbol = ENEMY_DEFS[enemy.archetype].symbol;
          if (key === cursorKey) {
            return { symbol: enemySymbol, entityClass: 'CURSOR', singleton: true };
          }

          const hpRatio = enemy.hp / enemy.maxHp;

          return {
            symbol: enemySymbol,
            entityClass: ENEMY_CLASS_MAP[enemy.archetype],
            hpRatio
          };
        }

        const towerArchetype = towerLookup.get(key);
        const projectile = projectileLookup.get(key);

        if (towerArchetype !== undefined) {
          const towerSymbol = getTowerDef(towerArchetype).symbol;
          if (key === cursorKey) {
            return { symbol: towerSymbol, entityClass: 'CURSOR', singleton: true };
          }

          return { symbol: towerSymbol, entityClass: TOWER_CLASS_MAP[towerArchetype] };
        }

        if (projectile !== undefined) {
          if (key === cursorKey) {
            return { symbol: projectile.symbol, entityClass: 'CURSOR', singleton: true };
          }

          return {
            symbol: projectile.symbol,
            entityClass: PROJECTILE_CLASS_MAP[projectile.archetype]
          };
        }

        if (rangePreviewKeys.has(key) && key !== cursorKey) {
          if (cell.type === CellType.PATH) {
            return { symbol: '•', entityClass: 'PATH' };
          }

          if (cell.type === CellType.BUILDABLE && cell.tower === undefined) {
            return { symbol: '◌', entityClass: 'BUILDABLE' };
          }
        }

        const cellSymbol =
          cell.type === CellType.PATH
            ? (pathSymbolCache.get(key) ?? '─')
            : cell.type === CellType.BASE
              ? reducedMotion || state.frame % 4 < 2
                ? '⬡'
                : '⊡'
              : CELL_SYMBOLS[cell.type];

        if (key === cursorKey) {
          if (placementPhase && cell.type === CellType.BUILDABLE) {
            const ghostSymbol = getTowerDef(state.selectedTowerArchetype).symbol;
            return { symbol: ghostSymbol, entityClass: 'CURSOR', singleton: true };
          }

          return { symbol: cellSymbol, entityClass: 'CURSOR', singleton: true };
        }

        return { symbol: cellSymbol, entityClass: getCellClass(cell.type) };
      });

    return buildColorRun(tokens);
  });
};
