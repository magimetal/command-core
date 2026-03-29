import React from 'react';
import { Text } from 'ink';
import type { GameState } from '../models/game-state';
import { composeEventLog } from '../rendering/hud-composer';

interface EventLogPanelProps {
  state: GameState;
}

export const EventLogPanel = ({ state }: EventLogPanelProps): React.ReactElement => {
  const lines = composeEventLog(state, 2);

  return (
    <>
      {lines.map((line, index) => (
        <Text key={`event-${index}`}>{line}</Text>
      ))}
    </>
  );
};
