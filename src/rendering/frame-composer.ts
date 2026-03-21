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

const SECTION_BREAK = '__DIVIDER__';

const CELL_SYMBOLS: Record<CellType, string> = {
  [CellType.PATH]: '·',
  [CellType.BUILDABLE]: '▪',
  [CellType.BLOCKED]: '▓',
  [CellType.SPAWN]: '⟶',
  [CellType.BASE]: '⬡'
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

const composeGrid = (state: GameState): string[] => {
  const enemyLookup = getEnemyLookup(state);
  const towerLookup = getTowerLookup(state);
  const cursorKey = `${state.cursor[0]},${state.cursor[1]}`;

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
            enemy.archetype === EnemyArchetype.STANDARD
              ? 'STANDARD_ENEMY'
              : 'TANK_ENEMY';

          return colorizeGridSymbol(enemySymbol, enemyClass, hpRatio);
        }

        const towerArchetype = towerLookup.get(key);
        if (towerArchetype !== undefined) {
          const towerSymbol = getTowerDef(towerArchetype).symbol;
          if (key === cursorKey) {
            return colorizeGridSymbol(towerSymbol, 'CURSOR');
          }

          const towerClass =
            towerArchetype === TowerArchetype.RAPID
              ? 'RAPID_TOWER'
              : 'CANNON_TOWER';

          return colorizeGridSymbol(towerSymbol, towerClass);
        }

        const cellSymbol = CELL_SYMBOLS[cell.type];
        if (key === cursorKey) {
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

  const colorizedBanner = banner.map((line) => {
    return isVictory
      ? colorizeHudValue(line, 'WAVE', state.baseHp)
      : colorizeHudValue(line, 'HP', 0);
  });

  const titleLine = isVictory
    ? colorizeHudValue('All waves survived. The base stands.', 'PHASE', state.baseHp)
    : colorizeHudValue('The base has fallen. The run ends here.', 'PHASE', 0);
  const statLine =
    `Enemies killed: ${colorizeHudValue(`${state.enemiesKilled}`, 'GOLD', state.baseHp)}  ` +
    `Gold remaining: ${colorizeHudValue(`${state.currency}`, 'GOLD', state.baseHp)}`;
  const blinkPrompt = `${chalk.bold.white('Press Q to quit')} \u001b[5m▌\u001b[0m`;

  return composeBorder([
    ...colorizedBanner,
    SECTION_BREAK,
    titleLine,
    statLine,
    SECTION_BREAK,
    blinkPrompt
  ]);
};

const composeTitleFrame = (state: GameState): string => {
  const titleArt = [
    '████████╗████████╗██████╗ ',
    '╚══██╔══╝╚══██╔══╝██╔══██╗',
    '   ██║      ██║   ██║  ██║'
  ];

  const subtitleArt = [
    '╔╦╗╔═╗╦ ╦╔═╗╦═╗   ╔╦╗╔═╗╔═╗╔═╗╔╗╔╔═╗╔═╗',
    ' ║ ║ ║║║║║╣ ╠╦╝    ║║║╣ ╠╣ ║╣ ║║║╚═╗║╣ ',
    ' ╩ ╚═╝╚╩╝╚═╝╩╚═   ═╩╝╚═╝╚  ╚═╝╝╚╝╚═╝╚═╝'
  ];

  const lineOne = colorizeHudValue('TERMINAL TOWER DEFENSE', 'PHASE', state.baseHp);
  const lineTwo = colorizeHudValue('Defend the base across all waves.', 'WAVE', state.baseHp);
  const lineThree = colorizeEventLogMessage('Any key: deploy to PREP   |   Q: quit');

  return composeBorder([
    ...titleArt.map((line) => colorizeHudValue(line, 'GOLD', state.baseHp)),
    ...subtitleArt.map((line) => colorizeHudValue(line, 'WAVE', state.baseHp)),
    SECTION_BREAK,
    lineOne,
    lineTwo,
    SECTION_BREAK,
    lineThree
  ]);
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

const composeBorder = (lines: string[]): string => {
  const innerWidth = Math.max(...lines.map((line) => stripAnsi(line).length));
  const horizontal = '─'.repeat(innerWidth);
  return [
    `┌${horizontal}┐`,
    ...lines.map((line) => {
      if (line === SECTION_BREAK) {
        return `├${horizontal}┤`;
      }

      return `│${padVisibleLine(line, innerWidth)}│`;
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
    '[1/2] Tower  [↑↓←→] Move  [Enter] Place  [Space] Start  [Q] Quit';
  const controlsLabel = chalk.dim('CONTROLS');
  const eventLogLabel = chalk.dim('EVENT LOG');

  const gridVisibleWidth = Math.max(...gridLines.map((line) => stripAnsi(line).length));
  const nonGridVisibleWidth = Math.max(
    stripAnsi(composeTitleBar(state)).length,
    ...hudLines.map((line) => stripAnsi(line).length),
    stripAnsi(controlsLabel).length,
    stripAnsi(legendLine).length,
    stripAnsi(eventLogLabel).length,
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
    controlsLabel,
    legendLine,
    SECTION_BREAK,
    eventLogLabel,
    ...eventLogLines
  ]);
};
