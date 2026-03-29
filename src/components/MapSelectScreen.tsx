import React from 'react';
import { Box, Text, useStdout } from 'ink';
import { GLYPH } from '../const/glyphs';
import { OPERATIONS_MAP_DEFS } from '../const/operations-maps';
import type { GameState } from '../models/game-state';
import { getDisplayWidth, truncateDisplay } from '../rendering/text-utils';

interface MapSelectScreenProps {
  state: GameState;
  terminalColumnsOverride?: number;
}

const DIFFICULTY_TAGS: Record<string, string> = {
  'map-01': '[★★ Intermediate]',
  'map-02': '[★★ Intermediate]',
  'map-03': '[★★ Intermediate]',
  'map-04': '[★★ Intermediate]',
  'map-05': '[★★★ Advanced]',
  'map-06': '[★★★ Advanced]',
  'map-07': '[★★★ Advanced]',
  'map-08': '[★★★ Advanced]',
  'map-09': '[★★★★ Expert]',
  'map-10': '[★★★★ Expert]'
};

export const MapSelectScreen = ({ state, terminalColumnsOverride }: MapSelectScreenProps): React.ReactElement => {
  const { stdout } = useStdout();
  const terminalColumns = terminalColumnsOverride ?? stdout?.columns ?? process.stdout.columns ?? 78;
  const width = Math.max(64, Math.min(76, terminalColumns - 2));
  const lineBudget = width - 6;

  return (
    <Box borderStyle="round" width={width} flexDirection="column" paddingX={1}>
      <Text color="cyanBright">OPERATIONS MAP SELECT</Text>
      <Text dimColor>Choose a battlefield</Text>
      <Text>────────────────────────────────────────────────────</Text>
      {OPERATIONS_MAP_DEFS.map((mapDef, index) => {
        const selected = state.menuCursor === index;
        const difficultyTag = DIFFICULTY_TAGS[mapDef.id] ?? '';
        const linePrefix = `[${index + 1}] ${mapDef.label}  `;
        const difficultySuffix = difficultyTag.length > 0 ? `  ${difficultyTag}` : '';
        const descriptionBudget = Math.max(
          0,
          lineBudget - getDisplayWidth(linePrefix) - getDisplayWidth(difficultySuffix)
        );
        const description = truncateDisplay(mapDef.description, descriptionBudget);
        const row = `${linePrefix}${description}${difficultyTag.length > 0 ? `  ${difficultyTag}` : ''}`;

        if (selected) {
          return (
            <Text key={mapDef.id} color="cyanBright">
              {GLYPH.MENU_ARROW} {row}
            </Text>
          );
        }

        return <Text key={mapDef.id}>  {row}</Text>;
      })}
      <Text>────────────────────────────────────────────────────</Text>
      <Text dimColor>↑↓ Select   Enter: Confirm   Esc/B: Back</Text>
    </Box>
  );
};
