import chalk from 'chalk';
import type { GamePhase } from '../models/game-state';

export type GridEntityClass =
  | 'PATH'
  | 'BUILDABLE'
  | 'BLOCKED'
  | 'SPAWN'
  | 'BASE'
  | 'RAPID_TOWER'
  | 'CANNON_TOWER'
  | 'SNIPER_TOWER'
  | 'SLOW_TOWER'
  | 'RAPID_PROJ'
  | 'CANNON_PROJ'
  | 'SNIPER_PROJ'
  | 'SLOW_PROJ'
  | 'STANDARD_ENEMY'
  | 'TANK_ENEMY'
  | 'FAST_ENEMY'
  | 'CURSOR';

type HudValueClass = 'HP' | 'GOLD' | 'WAVE' | 'PHASE';

export type EventMessageClass = 'KILL' | 'LEAK' | 'WAVE' | 'INFO' | 'ERROR';

const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

export const stripAnsi = (value: string): string => {
  return value.replace(ANSI_REGEX, '');
};

export const colorizeGridSymbol = (
  symbol: string,
  entityClass: GridEntityClass,
  hpRatio?: number
): string => {
  if (entityClass === 'PATH') {
    return chalk.dim.white(symbol);
  }

  if (entityClass === 'BUILDABLE') {
    return chalk.dim.green(symbol);
  }

  if (entityClass === 'BLOCKED') {
    return chalk.dim.cyan(symbol);
  }

  if (entityClass === 'SPAWN') {
    return chalk.bold.yellowBright(symbol);
  }

  if (entityClass === 'BASE') {
    return chalk.bold.cyanBright(symbol);
  }

  if (entityClass === 'RAPID_TOWER') {
    return chalk.bold.greenBright(symbol);
  }

  if (entityClass === 'CANNON_TOWER') {
    return chalk.bold.red(symbol);
  }

  if (entityClass === 'SNIPER_TOWER') {
    return chalk.bold.whiteBright(symbol);
  }

  if (entityClass === 'SLOW_TOWER') {
    return chalk.bold.magentaBright(symbol);
  }

  if (entityClass === 'RAPID_PROJ') {
    return chalk.bold.greenBright(symbol);
  }

  if (entityClass === 'CANNON_PROJ') {
    return chalk.bold.redBright(symbol);
  }

  if (entityClass === 'SNIPER_PROJ') {
    return chalk.bold.white(symbol);
  }

  if (entityClass === 'SLOW_PROJ') {
    return chalk.bold.magenta(symbol);
  }

  if (entityClass === 'STANDARD_ENEMY') {
    if (hpRatio !== undefined) {
      if (hpRatio < 0.33) {
        return chalk.bold.red(symbol);
      }

      if (hpRatio <= 0.66) {
        return chalk.dim(chalk.yellow(symbol));
      }
    }

    return chalk.bold.yellow(symbol);
  }

  if (entityClass === 'TANK_ENEMY') {
    if (hpRatio !== undefined) {
      if (hpRatio < 0.33) {
        return chalk.bold.red(symbol);
      }

      if (hpRatio <= 0.66) {
        return chalk.dim(chalk.magentaBright(symbol));
      }
    }

    return chalk.bold.magenta(symbol);
  }

  if (entityClass === 'FAST_ENEMY') {
    if (hpRatio !== undefined && hpRatio < 0.33) {
      return chalk.bold.red(symbol);
    }

    return chalk.bold.yellowBright(symbol);
  }

  return chalk.bgYellow.black.bold(symbol);
};

export const colorizeHudValue = (
  value: string,
  valueClass: HudValueClass,
  baseHp: number
): string => {
  if (valueClass === 'HP') {
    return baseHp < 5 ? chalk.redBright(value) : chalk.greenBright(value);
  }

  if (valueClass === 'GOLD') {
    return chalk.yellow(value);
  }

  if (valueClass === 'WAVE') {
    return chalk.cyan(value);
  }

  return chalk.bold.white(value);
};

export const colorizeEventLogMessage = (message: string): string => {
  return chalk.dim.white(message);
};

export const colorizeEventMessage = (
  message: string,
  messageClass: EventMessageClass
): string => {
  if (messageClass === 'KILL') {
    return chalk.greenBright(message);
  }

  if (messageClass === 'LEAK') {
    return chalk.redBright(message);
  }

  if (messageClass === 'WAVE') {
    return chalk.cyanBright.bold(message);
  }

  if (messageClass === 'ERROR') {
    return chalk.yellow(message);
  }

  return chalk.dim.white(message);
};

export const colorizePhaseLabel = (phase: GamePhase): string => {
  if (phase === 'PREP') {
    return chalk.cyan('[PREP]');
  }

  if (phase === 'WAVE_ACTIVE') {
    return chalk.yellowBright.bold('[WAVE ACTIVE]');
  }

  if (phase === 'WAVE_CLEAR') {
    return chalk.greenBright('[WAVE CLEAR]');
  }

  if (phase === 'VICTORY') {
    return chalk.greenBright.bold('[VICTORY]');
  }

  if (phase === 'GAME_OVER') {
    return chalk.redBright.bold('[GAME OVER]');
  }

  return chalk.white('[TITLE]');
};
