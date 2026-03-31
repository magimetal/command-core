import React from 'react';
import { Text } from 'ink';
import type { GameState } from '../models/game-state';
import { composeHud } from '../rendering/hud-composer';
import { truncateDisplay } from '../rendering/text-utils';
import { useTerminalWidth } from './use-terminal-width';

interface HudPanelProps {
  state: GameState;
  terminalColumnsOverride?: number;
}

export const HudPanel = ({ state, terminalColumnsOverride }: HudPanelProps): React.ReactElement => {
  const maxInnerWidth = useTerminalWidth({ min: 20, override: terminalColumnsOverride });
  const lines = composeHud(state)
    .split('\n')
    .map((line) => truncateDisplay(line, maxInnerWidth));

  return (
    <>
      {lines.map((line, index) => (
        <Text key={`hud-${index}`}>{line}</Text>
      ))}
    </>
  );
};
