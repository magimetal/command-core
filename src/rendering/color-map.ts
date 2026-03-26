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
const COMBINING_MARK_REGEX = /\p{Mark}/u;
const EMOJI_PRESENTATION_REGEX = /\p{Emoji_Presentation}/u;
const VARIATION_SELECTOR_START = 0xfe00;
const VARIATION_SELECTOR_END = 0xfe0f;
const EMOJI_VARIATION_SELECTOR = 0xfe0f;
const ZERO_WIDTH_JOINER = 0x200d;

const graphemeSegmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : undefined;

const toGraphemes = (value: string): string[] => {
  if (graphemeSegmenter !== undefined) {
    return Array.from(graphemeSegmenter.segment(value), (part) => part.segment);
  }

  return Array.from(value);
};

const isFullwidthCodePoint = (codePoint: number): boolean => {
  if (codePoint >= 0x1100 && codePoint <= 0x115f) return true;
  if (codePoint >= 0x2329 && codePoint <= 0x232a) return true;
  if (codePoint >= 0x2e80 && codePoint <= 0xa4cf) return true;
  if (codePoint >= 0xac00 && codePoint <= 0xd7a3) return true;
  if (codePoint >= 0xf900 && codePoint <= 0xfaff) return true;
  if (codePoint >= 0xfe10 && codePoint <= 0xfe19) return true;
  if (codePoint >= 0xfe30 && codePoint <= 0xfe6f) return true;
  if (codePoint >= 0xff00 && codePoint <= 0xff60) return true;
  if (codePoint >= 0xffe0 && codePoint <= 0xffe6) return true;
  if (codePoint >= 0x1f300 && codePoint <= 0x1f64f) return true;
  if (codePoint >= 0x1f900 && codePoint <= 0x1f9ff) return true;

  return false;
};

const graphemeWidth = (grapheme: string): number => {
  if (grapheme.length === 0) {
    return 0;
  }

  if (EMOJI_PRESENTATION_REGEX.test(grapheme)) {
    return 2;
  }

  if (grapheme.includes('\uFE0F') || grapheme.includes('\u200D')) {
    return 2;
  }

  for (const symbol of grapheme) {
    const codePoint = symbol.codePointAt(0);
    if (codePoint === undefined) {
      continue;
    }

    if (codePoint >= VARIATION_SELECTOR_START && codePoint <= VARIATION_SELECTOR_END) {
      continue;
    }

    if (COMBINING_MARK_REGEX.test(symbol)) {
      continue;
    }

    if (codePoint === ZERO_WIDTH_JOINER || codePoint === EMOJI_VARIATION_SELECTOR) {
      continue;
    }

    return isFullwidthCodePoint(codePoint) ? 2 : 1;
  }

  return 0;
};

export const stripAnsi = (value: string): string => {
  return value.replace(ANSI_REGEX, '');
};

export const getDisplayWidth = (value: string): number => {
  const plain = stripAnsi(value);

  return toGraphemes(plain).reduce((sum, grapheme) => sum + graphemeWidth(grapheme), 0);
};

export const truncateDisplay = (value: string, maxWidth: number): string => {
  if (maxWidth <= 0) {
    return '';
  }

  const plain = stripAnsi(value);
  const plainWidth = getDisplayWidth(plain);
  if (plainWidth <= maxWidth) {
    return plain;
  }

  if (maxWidth === 1) {
    return '…';
  }

  const targetWidth = maxWidth - 1;
  const graphemes = toGraphemes(plain);
  let width = 0;
  let result = '';

  for (const grapheme of graphemes) {
    const nextWidth = graphemeWidth(grapheme);
    if (width + nextWidth > targetWidth) {
      break;
    }

    result += grapheme;
    width += nextWidth;
  }

  return `${result}…`;
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
