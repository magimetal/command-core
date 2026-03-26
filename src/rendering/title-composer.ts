import chalk from 'chalk';
import type { GameState } from '../models/game-state';
import { isReducedMotionEnabled } from './accessibility';
import { colorizeEventLogMessage, getDisplayWidth } from './color-map';
import { composeBorder, SECTION_BREAK } from './border';
import { FRAME_INNER_WIDTH_BUDGET } from './frame-composer';
import { stylePrimary, styleSubtle } from './text-styles';

export const composeTitleFrame = (state: GameState, maxInnerWidth?: number): string => {
  const logoArt = [
    '╔══════════════════════════════════════════╗',
    '║    ▄▄▄█████▓▓█████  ██▀███   ███▄ ▄███▓  ║',
    '║    ▓  ██▒ ▓▒▓█   ▀ ▓██ ▒ ██▒▓██▒▀█▀ ██▒  ║',
    '║    ▒ ▓██░ ▒░▒███   ▓██ ░▄█ ▒▓██    ▓██░  ║',
    '║    ░ ▓██▓ ░ ▒▓█  ▄ ▒██▀▀█▄  ▒██    ▒██   ║',
    '║      ▒██▒ ░ ░▒████▒░██▓ ▒██▒▒██▒   ░██▒  ║',
    '║      ▒ ░░   ░░ ▒░ ░░ ▒▓ ░▒▓░░ ▒░   ░  ░  ║',
    '║        ░     ░ ░  ░  ░▒ ░ ▒░░  ░      ░  ║',
    '║      ░         ░     ░░   ░ ░      ░     ║',
    '╚══════════════ COMMAND CORE ═══════════════╝'
  ];
  const logoArtNaturalWidth = Math.max(...logoArt.map((line) => getDisplayWidth(line)));

  const reducedMotion = isReducedMotionEnabled();
  const scanRow = reducedMotion ? -1 : Math.floor(state.frame / 2) % logoArt.length;

  const lineOne = stylePrimary(':: COMMAND CORE ONLINE ::');
  const lineTwo = styleSubtle('Defend the base through escalating waves');
  const lineThree = chalk.white('Any key: Choose mode');
  const lineFour = colorizeEventLogMessage('Q: Quit');

  return composeBorder(
    [
      ...logoArt.map((line, index) => {
        const colorized = chalk.yellow(line);
        return index === scanRow ? chalk.dim(colorized) : colorized;
      }),
      SECTION_BREAK,
      lineOne,
      lineTwo,
      lineThree,
      SECTION_BREAK,
      lineFour
    ],
    {
      minInnerWidth: Math.max(
        logoArtNaturalWidth,
        Math.min(FRAME_INNER_WIDTH_BUDGET, maxInnerWidth ?? FRAME_INNER_WIDTH_BUDGET)
      ),
      maxInnerWidth,
      align: 'center'
    }
  );
};
