import chalk from 'chalk';
import type { GamePhase } from '../models/game-state';

export { stylePrimary, styleSubtle, styleEmphasis, styleAnomaly, styleSurge, styleThreat } from './text-styles';

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
  | 'BRUTE_ENEMY'
  | 'COLOSSUS_ENEMY'
  | 'CURSOR';

type ChalkStyle = (value: string) => string;

type EntityColorConfig = {
  full: ChalkStyle;
  mid?: ChalkStyle;
  low?: ChalkStyle;
  render: (symbol: string, style: ChalkStyle) => string;
};

const renderWithStyle = (symbol: string, style: ChalkStyle): string => style(symbol);

const GRID_ENTITY_COLOR_MAP: Record<GridEntityClass, EntityColorConfig> = {
  PATH: {
    full: chalk.dim.white,
    render: renderWithStyle
  },
  BUILDABLE: {
    full: chalk.dim.green,
    render: renderWithStyle
  },
  BLOCKED: {
    full: chalk.dim.cyan,
    render: renderWithStyle
  },
  SPAWN: {
    full: chalk.bold.yellowBright,
    render: renderWithStyle
  },
  BASE: {
    full: chalk.bold.cyanBright,
    render: renderWithStyle
  },
  RAPID_TOWER: {
    full: chalk.bold.greenBright,
    render: renderWithStyle
  },
  CANNON_TOWER: {
    full: chalk.bold.red,
    render: renderWithStyle
  },
  SNIPER_TOWER: {
    full: chalk.bold.whiteBright,
    render: renderWithStyle
  },
  SLOW_TOWER: {
    full: chalk.bold.magentaBright,
    render: renderWithStyle
  },
  RAPID_PROJ: {
    full: chalk.bold.greenBright,
    render: renderWithStyle
  },
  CANNON_PROJ: {
    full: chalk.bold.redBright,
    render: renderWithStyle
  },
  SNIPER_PROJ: {
    full: chalk.bold.white,
    render: renderWithStyle
  },
  SLOW_PROJ: {
    full: chalk.bold.magenta,
    render: renderWithStyle
  },
  STANDARD_ENEMY: {
    full: chalk.bold.yellow,
    mid: (value) => chalk.dim(chalk.yellow(value)),
    low: chalk.bold.red,
    render: renderWithStyle
  },
  TANK_ENEMY: {
    full: chalk.bold.magenta,
    mid: (value) => chalk.dim(chalk.magentaBright(value)),
    low: chalk.bold.red,
    render: renderWithStyle
  },
  FAST_ENEMY: {
    full: chalk.bold.yellowBright,
    low: chalk.bold.red,
    render: renderWithStyle
  },
  BRUTE_ENEMY: {
    full: chalk.bold.red,
    mid: chalk.dim.red,
    low: chalk.bold.redBright,
    render: renderWithStyle
  },
  COLOSSUS_ENEMY: {
    full: chalk.bold.white,
    mid: chalk.dim.white,
    low: chalk.bold.red,
    render: renderWithStyle
  },
  CURSOR: {
    full: chalk.bgYellow.black.bold,
    render: renderWithStyle
  }
};

const DEFAULT_GRID_ENTITY_COLOR_CONFIG: EntityColorConfig = {
  full: chalk.dim.white,
  render: renderWithStyle
};

type HudValueClass = 'HP' | 'GOLD' | 'WAVE' | 'PHASE';

export type EventMessageClass = 'KILL' | 'LEAK' | 'WAVE' | 'INFO' | 'ERROR' | 'THREAT' | 'SURGE';

export const tokenGridSymbol = (
  symbol: string,
  entityClass: GridEntityClass,
  hpRatio?: number
): string => {
  const config = GRID_ENTITY_COLOR_MAP[entityClass] ?? DEFAULT_GRID_ENTITY_COLOR_CONFIG;
  const style =
    hpRatio === undefined
      ? config.full
      : hpRatio <= 0.33 && config.low !== undefined
        ? config.low
        : hpRatio <= 0.66 && config.mid !== undefined
          ? config.mid
          : config.full;

  return config.render(symbol, style);
};

export const tokenHudValue = (
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

export const tokenEventLogMessage = (message: string): string => {
  return chalk.dim.white(message);
};

export const tokenEventMessage = (
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

  if (messageClass === 'THREAT') {
    return chalk.bold.redBright(message);
  }

  if (messageClass === 'SURGE') {
    return chalk.bold.yellowBright(message);
  }

  return chalk.dim.white(message);
};

export const tokenPhaseLabel = (phase: GamePhase): string => {
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

export const tokenStrong = (s: string): string => chalk.bold(s);
export const tokenDim = (s: string): string => chalk.dim(s);
export const tokenNeutral = (s: string): string => chalk.white(s);
