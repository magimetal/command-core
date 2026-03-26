import chalk from 'chalk';
import type { GameState } from '../models/game-state';
import { colorizeEventLogMessage, colorizeHudValue } from './color-map';
import { composeBorder, SECTION_BREAK } from './border';

export const composeTitleFrame = (state: GameState): string => {
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

  const scanRow = Math.floor(state.frame / 2) % logoArt.length;

  const lineOne = colorizeHudValue(':: COMMAND CORE ONLINE ::', 'PHASE', state.baseHp);
  const lineTwo = colorizeHudValue('TACTICAL GRID AUTHORITY ACTIVE', 'WAVE', state.baseHp);
  const lineThree = colorizeHudValue('Press any key to enter mode select', 'GOLD', state.baseHp);
  const lineFour = colorizeEventLogMessage('Any key → MODE SELECT   |   Q: Quit');

  return composeBorder(
    [
      ...logoArt.map((line, index) => {
        const colorized = colorizeHudValue(line, 'GOLD', state.baseHp);
        return index === scanRow ? chalk.dim(colorized) : colorized;
      }),
      SECTION_BREAK,
      lineOne,
      lineTwo,
      lineThree,
      SECTION_BREAK,
      lineFour
    ],
    { minInnerWidth: 76, align: 'center' }
  );
};
