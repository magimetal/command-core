import chalk from 'chalk';
import { OPERATIONS_MAP_DEFS } from '../const/operations-maps';
import type { GameState } from '../models/game-state';
import { composeBorder, SECTION_BREAK } from './border';

export const composeMapSelectFrame = (state: GameState): string => {
  const mapLines = OPERATIONS_MAP_DEFS.map((mapDef, index) => {
    const selected = state.menuCursor === index;
    const line = `[${index + 1}] ${mapDef.label}  ${mapDef.description}`;

    return selected ? chalk.bold.cyanBright(`▶ ${line}`) : `  ${line}`;
  });

  return composeBorder(
    [
      chalk.bold.white('OPERATIONS MAP SELECT'),
      chalk.dim('Choose your theater'),
      SECTION_BREAK,
      ...mapLines,
      SECTION_BREAK,
      chalk.dim('↑↓ Select   Enter: Confirm   Esc/B: Back')
    ],
    { minInnerWidth: 76, align: 'center' }
  );
};
