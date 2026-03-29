import React from 'react';
import type { GameState } from '../models/game-state';
import { composeTitleBar } from '../rendering/hud-composer';
import { Text } from 'ink';

interface TitleBarProps {
  state: GameState;
}

export const TitleBar = ({ state }: TitleBarProps): React.ReactElement => {
  return <Text>{composeTitleBar(state)}</Text>;
};
