import React from 'react';
import { Text } from 'ink';
import { useTerminalWidth } from './use-terminal-width';

interface LegendLineProps {
  availableTowerCount: number;
  terminalColumnsOverride?: number;
}

export const composeLegendLine = (availableTowerCount: number, maxInnerWidth: number): string => {
  if (maxInnerWidth < 70) {
    return `[1-${availableTowerCount}]Tower [↑↓←→]Move [↵]Place [S]Sell [Spc]Start [Q]Quit`;
  }

  return `[1-${availableTowerCount}] Tower  [↑↓←→] Move  [Enter] Place  [S] Sell  [Space] Start  [Q] Quit`;
};

export const LegendLine = ({
  availableTowerCount,
  terminalColumnsOverride
}: LegendLineProps): React.ReactElement => {
  const maxInnerWidth = useTerminalWidth({ min: 20, override: terminalColumnsOverride });

  return <Text>{composeLegendLine(availableTowerCount, maxInnerWidth)}</Text>;
};
