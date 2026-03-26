import chalk from 'chalk';
import type { GameState } from '../models/game-state';
import { colorizeEventLogMessage, colorizeHudValue } from './color-map';
import { composeBorder, SECTION_BREAK } from './border';

export const composeTitleFrame = (state: GameState): string => {
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
