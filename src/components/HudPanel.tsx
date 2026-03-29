import React from 'react';
import { Text, useStdout } from 'ink';
import type { GameState } from '../models/game-state';
import { composeHud } from '../rendering/hud-composer';
import { truncateDisplay } from '../rendering/text-utils';

interface HudPanelProps {
  state: GameState;
  terminalColumnsOverride?: number;
}

export const HudPanel = ({ state, terminalColumnsOverride }: HudPanelProps): React.ReactElement => {
  const { stdout } = useStdout();
  const terminalColumns = terminalColumnsOverride ?? stdout?.columns ?? process.stdout.columns ?? 78;
  const maxInnerWidth = Math.max(20, Math.min(76, terminalColumns - 2));
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
