import { OPERATIONS_MAP_DEFS } from '../const/operations-maps';
import { GLYPH } from '../const/glyphs';
import type { GameState } from '../models/game-state';
import { composeBorder, SECTION_BREAK } from './border';
import { stylePrimary, styleSubtle } from './text-styles';
import { getDisplayWidth, truncateDisplay } from './text-utils';

export const composeMapSelectFrame = (state: GameState, maxInnerWidth?: number): string => {
  const difficultyTags: Record<string, string> = {
    'map-01': '[★ Beginner]',
    'map-02': '[★★ Intermediate]'
  };

  const mapLines = OPERATIONS_MAP_DEFS.map((mapDef, index) => {
    const selected = state.menuCursor === index;
    const difficultyTag = difficultyTags[mapDef.id] ?? '';
    const linePrefix = `[${index + 1}] ${mapDef.label}  `;
    const lineSuffix = difficultyTag.length > 0 ? `  ${styleSubtle(difficultyTag)}` : '';
    const descriptionWidthBudget = Math.max(
      0,
      74 - getDisplayWidth(linePrefix) - getDisplayWidth(difficultyTag.length > 0 ? `  ${difficultyTag}` : '')
    );
    const description = truncateDisplay(mapDef.description, descriptionWidthBudget);
    const line = `${linePrefix}${description}${lineSuffix}`;

    return selected ? stylePrimary(`${GLYPH.MENU_ARROW} ${line}`) : `  ${line}`;
  });

  return composeBorder(
    [
      stylePrimary('OPERATIONS MAP SELECT'),
      styleSubtle('Choose a battlefield'),
      SECTION_BREAK,
      ...mapLines,
      SECTION_BREAK,
      styleSubtle('↑↓ Select   Enter: Confirm   Esc/B: Back')
    ],
    {
      minInnerWidth: Math.min(76, maxInnerWidth ?? 76),
      maxInnerWidth: Math.min(76, maxInnerWidth ?? 76),
      align: 'center'
    }
  );
};
