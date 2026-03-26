import chalk from 'chalk';
import type { GameState } from '../models/game-state';
import { composeBorder, SECTION_BREAK } from './border';

const composeModeCard = (label: string, description: string, selected: boolean): string => {
  const base = `${label}  ${description}`;
  return selected ? chalk.bold.cyanBright(`▶ ${base}`) : `  ${base}`;
};

export const composeModeSelectFrame = (state: GameState, maxInnerWidth?: number): string => {
  const operationsSelected = state.menuCursor === 0;
  const anomalySelected = state.menuCursor === 1;

  return composeBorder(
    [
      chalk.bold.white('COMMAND CORE'),
      chalk.dim('Select operation mode'),
      SECTION_BREAK,
      composeModeCard('[1] OPERATIONS', 'Authored maps, curated challenge', operationsSelected),
      composeModeCard('[2] ANOMALY', 'Procedural run, rogue-like pressure (ANOMALY #seed)', anomalySelected),
      SECTION_BREAK,
      chalk.dim('↑↓ Navigate   Enter: Confirm   Q: Quit')
    ],
    { minInnerWidth: 76, maxInnerWidth, align: 'center' }
  );
};
