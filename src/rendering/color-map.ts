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
  | 'STANDARD_ENEMY'
  | 'TANK_ENEMY'
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
    return chalk.gray(symbol);
  }

  if (entityClass === 'BUILDABLE') {
    return chalk.greenBright.dim(symbol);
  }

  if (entityClass === 'BLOCKED') {
    return chalk.red(symbol);
  }

  if (entityClass === 'SPAWN') {
    return chalk.yellowBright(symbol);
  }

  if (entityClass === 'BASE') {
    return chalk.cyanBright(symbol);
  }

  if (entityClass === 'RAPID_TOWER') {
    return chalk.green(symbol);
  }

  if (entityClass === 'CANNON_TOWER') {
    return chalk.redBright(symbol);
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

    return chalk.yellow(symbol);
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

    return chalk.magentaBright(symbol);
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
