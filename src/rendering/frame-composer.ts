import { ENEMY_DEFS, EnemyArchetype } from '../const/enemies';
import { WAVES } from '../const/waves';
import { getTowerDef, TowerArchetype } from '../const/towers';
import { CellType } from '../models/cell';
import type { GameState } from '../models/game-state';
import chalk from 'chalk';
import {
  colorizePhaseLabel,
  colorizeEventMessage,
  colorizeEventLogMessage,
  colorizeGridSymbol,
  colorizeHudValue,
  stripAnsi,
  type EventMessageClass,
  type GridEntityClass
} from './color-map';
import { getVisibleEventLog } from './event-log';
import { composeHud } from './hud-composer';
import { calculateScore } from '../simulation/score';

const SECTION_BREAK = '__DIVIDER__';

const CELL_SYMBOLS: Record<CellType, string> = {
  [CellType.PATH]: '─',
  [CellType.BUILDABLE]: '░',
  [CellType.BLOCKED]: '╠',
  [CellType.SPAWN]: '⟹',
  [CellType.BASE]: '⬡'
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

  if (hasNorth && hasSouth && hasEast && hasWest) {
    return '┼';
  }

  if (hasNorth && hasSouth && hasEast) {
    return '├';
  }

  if (hasNorth && hasSouth && hasWest) {
    return '┤';
  }

  if (hasNorth && hasEast && hasWest) {
    return '┴';
  }

  if (hasSouth && hasEast && hasWest) {
    return '┬';
  }

  if (hasNorth && hasSouth) {
    return '│';
  }

  if (hasEast && hasWest) {
    return '─';
  }

  if (hasSouth && hasEast) {
    return '┌';
  }

  if (hasSouth && hasWest) {
    return '┐';
  }

  if (hasNorth && hasEast) {
    return '└';
  }

  if (hasNorth && hasWest) {
    return '┘';
  }

  return '─';
};

const getTowerLookup = (state: GameState): Map<string, TowerArchetype> => {
  return new Map(
    state.towers.map((tower) => {
      return [`${tower.pos[0]},${tower.pos[1]}`, tower.archetype];
    })
  );
};

const getEnemyLookup = (
  state: GameState
): Map<string, { archetype: EnemyArchetype; hp: number; maxHp: number }> => {
  return new Map(
    state.enemies
      .filter((enemy) => !enemy.dead)
      .map((enemy) => [
        `${enemy.pos[0]},${enemy.pos[1]}`,
        {
          archetype: enemy.archetype,
          hp: enemy.hp,
          maxHp: enemy.maxHp
        }
      ])
  );
};

const getCellClass = (cellType: CellType): GridEntityClass => {
  if (cellType === CellType.PATH) {
    return 'PATH';
  }

  if (cellType === CellType.BUILDABLE) {
    return 'BUILDABLE';
  }

  if (cellType === CellType.BLOCKED) {
    return 'BLOCKED';
  }

  if (cellType === CellType.SPAWN) {
    return 'SPAWN';
  }

  return 'BASE';
};

const buildRangePreviewKeys = (state: GameState): Set<string> => {
  const placementPhase = state.phase === 'PREP' || state.phase === 'WAVE_CLEAR';
  if (!placementPhase) {
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
      if (gridCell.type !== CellType.BUILDABLE || gridCell.tower !== undefined) {
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

const composeGrid = (state: GameState): string[] => {
  const enemyLookup = getEnemyLookup(state);
  const towerLookup = getTowerLookup(state);
  const projectileLookup = new Map(
    state.projectiles.map((projectile) => [`${projectile.pos[0]},${projectile.pos[1]}`, projectile])
  );
  const cursorKey = `${state.cursor[0]},${state.cursor[1]}`;
  const rangePreviewKeys = buildRangePreviewKeys(state);
  const placementPhase = state.phase === 'PREP' || state.phase === 'WAVE_CLEAR';

  return state.grid.map((row, rowIndex) => {
    return row
      .map((cell, colIndex) => {
        const key = `${colIndex},${rowIndex}`;

        const enemy = enemyLookup.get(key);
        if (enemy !== undefined) {
          const enemySymbol = ENEMY_DEFS[enemy.archetype].symbol;
          if (key === cursorKey) {
            return colorizeGridSymbol(enemySymbol, 'CURSOR');
          }

          const hpRatio = enemy.hp / enemy.maxHp;
          const enemyClass =
            enemy.archetype === EnemyArchetype.FAST
              ? 'FAST_ENEMY'
              : enemy.archetype === EnemyArchetype.STANDARD
              ? 'STANDARD_ENEMY'
              : 'TANK_ENEMY';

          return colorizeGridSymbol(enemySymbol, enemyClass, hpRatio);
        }

        const towerArchetype = towerLookup.get(key);
        const projectile = projectileLookup.get(key);

        if (towerArchetype !== undefined) {
          const towerSymbol = getTowerDef(towerArchetype).symbol;
          if (key === cursorKey) {
            return colorizeGridSymbol(towerSymbol, 'CURSOR');
          }

          const towerClass =
            towerArchetype === TowerArchetype.RAPID
              ? 'RAPID_TOWER'
              : towerArchetype === TowerArchetype.SNIPER
                ? 'SNIPER_TOWER'
              : towerArchetype === TowerArchetype.SLOW
                ? 'SLOW_TOWER'
              : 'CANNON_TOWER';

          return colorizeGridSymbol(towerSymbol, towerClass);
        }

        if (projectile !== undefined) {
          if (key === cursorKey) {
            return colorizeGridSymbol(projectile.symbol, 'CURSOR');
          }

          const projectileClass =
            projectile.archetype === TowerArchetype.RAPID
              ? 'RAPID_PROJ'
              : projectile.archetype === TowerArchetype.SNIPER
                ? 'SNIPER_PROJ'
              : projectile.archetype === TowerArchetype.SLOW
                ? 'SLOW_PROJ'
              : 'CANNON_PROJ';

          return colorizeGridSymbol(projectile.symbol, projectileClass);
        }

        if (
          cell.type === CellType.BUILDABLE &&
          rangePreviewKeys.has(key) &&
          key !== cursorKey
        ) {
          return colorizeGridSymbol('◌', 'BUILDABLE');
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
      .join(' ');
  });
};

const composeEndStateFrame = (state: GameState): string => {
  const isVictory = state.phase === 'VICTORY';

  const banner = isVictory
    ? [
        '╦  ╦╦╔═╗╔╦╗╔═╗╦═╗╦ ╦',
        '╚╗╔╝║║   ║ ║ ║╠╦╝╚╦╝',
        ' ╚╝ ╩╚═╝ ╩ ╚═╝╩╚═ ╩ '
      ]
    : [
        '╔═╗╔═╗╔╦╗╔═╗   ╔═╗╦  ╦╔═╗╦═╗',
        '║ ╦╠═╣║║║║╣    ║ ║╚╗╔╝║╣ ╠╦╝',
        '╚═╝╩ ╩╩ ╩╚═╝   ╚═╝ ╚╝ ╚═╝╩╚═'
      ];

  const colorizedBanner = banner.map((line, index) => {
    if (isVictory) {
      const victoryPalette = [chalk.cyanBright, chalk.greenBright, chalk.bold.white];
      return victoryPalette[index % victoryPalette.length](line);
    }

    const gameOverPalette = [chalk.red, chalk.dim.red, chalk.redBright];
    return gameOverPalette[index % gameOverPalette.length](line);
  });

  const titleLine = isVictory
    ? colorizeHudValue('All waves survived. The base stands.', 'PHASE', state.baseHp)
    : colorizeHudValue('The base has fallen. The run ends here.', 'PHASE', 0);
  const statLine =
    `Enemies killed: ${colorizeHudValue(`${state.enemiesKilled}`, 'GOLD', state.baseHp)}  ` +
    `Gold remaining: ${colorizeHudValue(`${state.currency}`, 'GOLD', state.baseHp)}`;
  const score = calculateScore(state);
  const scoreLine = `Score: ${colorizeHudValue(`${score}`, 'GOLD', state.baseHp)}`;
  const blinkPrompt = `${chalk.bold.white('Press Q to quit')} \u001b[5m▌\u001b[0m`;

  return composeBorder([
    ...colorizedBanner,
    SECTION_BREAK,
    titleLine,
    statLine,
    scoreLine,
    SECTION_BREAK,
    blinkPrompt
  ]);
};

const composeTitleFrame = (state: GameState): string => {
  const titleArt = [
    '████████╗████████╗██████╗ ',
    '╚══██╔══╝╚══██╔══╝██╔══██╗',
    '   ██║      ██║   ██║  ██║',
    '   ╚═╝      ╚═╝   ╚═╝  ╚═╝'
  ];

  const subtitleArt = [
    '╔╦╗╔═╗╦ ╦╔═╗╦═╗   ╔╦╗╔═╗╔═╗╔═╗╔╗╔╔═╗╔═╗',
    ' ║ ║ ║║║║║╣ ╠╦╝    ║║║╣ ╠╣ ║╣ ║║║╚═╗║╣ ',
    ' ╩ ╚═╝╚╩╝╚═╝╩╚═   ═╩╝╚═╝╚  ╚═╝╝╚╝╚═╝╚═╝'
  ];
  const scanRow = Math.floor(state.frame / 2) % titleArt.length;

  const lineOne = colorizeHudValue('TERMINAL TOWER DEFENSE', 'PHASE', state.baseHp);
  const lineTwo = colorizeHudValue('Defend the base across all waves.', 'WAVE', state.baseHp);
  const lineThree = colorizeEventLogMessage('Any key: deploy to PREP   |   Q: quit');

  return composeBorder(
    [
      ...titleArt.map((line, index) => {
        const colorized = colorizeHudValue(line, 'GOLD', state.baseHp);
        return index === scanRow ? chalk.dim(colorized) : colorized;
      }),
      ...subtitleArt.map((line) => colorizeHudValue(line, 'WAVE', state.baseHp)),
      SECTION_BREAK,
      lineOne,
      lineTwo,
      SECTION_BREAK,
      lineThree
    ],
    { minInnerWidth: 76, align: 'center' }
  );
};

const composeTitleBar = (state: GameState): string => {
  const title = chalk.bold.white('TERMINAL TOWER DEFENSE');
  const divider = chalk.dim('  ║  ');
  const wave = chalk.cyan(`Wave ${state.wave}/${WAVES.length}`);
  const phase = colorizePhaseLabel(state.phase);

  return `${title}${divider}${wave}  ${phase}`;
};

const composeEventLog = (state: GameState): string[] => {
  const eventLines = getVisibleEventLog(state.eventLog);

  return eventLines.map((eventLine, index) => {
    if (eventLine.length === 0) {
      return index === 0 ? colorizeEventLogMessage('! No recent events') : chalk.dim('  ─');
    }

    let messageClass: EventMessageClass = 'INFO';
    if (eventLine.startsWith('✕')) {
      messageClass = 'KILL';
    } else if (eventLine.startsWith('!')) {
      messageClass = 'LEAK';
    } else if (eventLine.startsWith('>>')) {
      messageClass = 'WAVE';
    } else if (eventLine.startsWith('✗')) {
      messageClass = 'ERROR';
    }

    return colorizeEventMessage(eventLine, messageClass);
  });
};

const padVisibleLine = (line: string, width: number): string => {
  const visibleLength = stripAnsi(line).length;
  if (visibleLength >= width) {
    return line;
  }

  return `${line}${' '.repeat(width - visibleLength)}`;
};

const padCenteredVisibleLine = (line: string, width: number): string => {
  const visibleLength = stripAnsi(line).length;
  if (visibleLength >= width) {
    return line;
  }

  const totalPadding = width - visibleLength;
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;

  return `${' '.repeat(leftPadding)}${line}${' '.repeat(rightPadding)}`;
};

const composeBorder = (
  lines: string[],
  options: { minInnerWidth?: number; align?: 'left' | 'center' } = {}
): string => {
  const { minInnerWidth = 0, align = 'left' } = options;
  const contentWidth = Math.max(...lines.map((line) => stripAnsi(line).length));
  const innerWidth = Math.max(contentWidth, minInnerWidth);
  const horizontal = '─'.repeat(innerWidth);
  return [
    `┌${horizontal}┐`,
    ...lines.map((line) => {
      if (line === SECTION_BREAK) {
        return `├${horizontal}┤`;
      }

      const paddedLine =
        align === 'center' ? padCenteredVisibleLine(line, innerWidth) : padVisibleLine(line, innerWidth);
      return `│${paddedLine}│`;
    }),
    `└${horizontal}┘`
  ].join('\n');
};

export const composeFrame = (state: GameState): string => {
  if (state.phase === 'TITLE') {
    return composeTitleFrame(state);
  }

  if (state.phase === 'GAME_OVER' || state.phase === 'VICTORY') {
    return composeEndStateFrame(state);
  }

  const gridLines = composeGrid(state);
  const hudLines = composeHud(state).split('\n');
  const eventLogLines = composeEventLog(state);
  const legendLine =
    '[1-4] Tower  [↑↓←→] Move  [Enter] Place  [S] Sell  [Space] Start  [Q] Quit';

  const gridVisibleWidth = Math.max(...gridLines.map((line) => stripAnsi(line).length));
  const nonGridVisibleWidth = Math.max(
    stripAnsi(composeTitleBar(state)).length,
    ...hudLines.map((line) => stripAnsi(line).length),
    stripAnsi(legendLine).length,
    ...eventLogLines.map((line) => stripAnsi(line).length)
  );
  const leftPad = Math.max(0, Math.floor((nonGridVisibleWidth - gridVisibleWidth) / 2));
  const centeredGridLines = gridLines.map((line) => `${' '.repeat(leftPad)}${line}`);

  return composeBorder([
    composeTitleBar(state),
    SECTION_BREAK,
    ...centeredGridLines,
    SECTION_BREAK,
    ...hudLines,
    SECTION_BREAK,
    legendLine,
    SECTION_BREAK,
    ...eventLogLines
  ]);
};
