import type { GameState } from '../models/game-state';
import { GLYPH } from '../const/glyphs';
import { composeBorder, SECTION_BREAK } from './border';
import { stylePrimary, styleSubtle } from './text-styles';

const composeModeCard = (label: string, description: string, selected: boolean): string => {
  const base = `${label}  ${description}`;
  return selected ? stylePrimary(`${GLYPH.MENU_ARROW} ${base}`) : `  ${base}`;
};

export const composeModeSelectFrame = (state: GameState, maxInnerWidth?: number): string => {
  const operationsSelected = state.menuCursor === 0;
  const anomalySelected = state.menuCursor === 1;

  return composeBorder(
    [
      stylePrimary('COMMAND CORE'),
      styleSubtle('Choose a run type'),
      styleSubtle('Newcomer? Start with OPERATIONS · Veteran? Try ANOMALY for chaos'),
      SECTION_BREAK,
      composeModeCard('[1] OPERATIONS', 'Hand-crafted maps with fixed waves', operationsSelected),
      composeModeCard('[2] ANOMALY', 'Procedural map and randomized waves', anomalySelected),
      SECTION_BREAK,
      styleSubtle('↑↓ Navigate   Enter: Confirm   Q: Quit')
    ],
    { minInnerWidth: Math.min(76, maxInnerWidth ?? 76), maxInnerWidth, align: 'center' }
  );
};
