import React from 'react';
import { Box, Text } from 'ink';
import type { GameState } from '../models/game-state';
import { GLYPH } from '../const/glyphs';
import { useTerminalWidth } from './use-terminal-width';

interface ModeSelectScreenProps {
  state: GameState;
  terminalColumnsOverride?: number;
}

const renderModeLine = (label: string, description: string, selected: boolean): React.ReactElement => {
  const text = `${label}  ${description}`;

  if (selected) {
    return (
      <Text color="cyanBright">
        {GLYPH.MENU_ARROW} {text}
      </Text>
    );
  }

  return <Text>  {text}</Text>;
};

export const ModeSelectScreen = ({ state, terminalColumnsOverride }: ModeSelectScreenProps): React.ReactElement => {
  const width = useTerminalWidth({ override: terminalColumnsOverride });

  return (
    <Box borderStyle="round" width={width} flexDirection="column" paddingX={1}>
      <Text color="cyanBright">COMMAND CORE</Text>
      <Text dimColor>Choose a run type</Text>
      <Text dimColor>Newcomer? Start with OPERATIONS · Veteran? Try ANOMALY for chaos</Text>
      <Text>────────────────────────────────────────────────────</Text>
      {renderModeLine('[1] OPERATIONS', 'Hand-crafted maps with fixed waves', state.menuCursor === 0)}
      {renderModeLine('[2] ANOMALY', 'Procedural map and randomized waves', state.menuCursor === 1)}
      <Text>────────────────────────────────────────────────────</Text>
      <Text dimColor>↑↓ Navigate   Enter: Confirm   Q: Quit</Text>
    </Box>
  );
};
