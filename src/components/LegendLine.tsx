import React from 'react';
import { Text, useStdout } from 'ink';

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
  const { stdout } = useStdout();
  const terminalColumns = terminalColumnsOverride ?? stdout?.columns ?? process.stdout.columns ?? 78;
  const maxInnerWidth = Math.max(20, Math.min(76, terminalColumns - 2));

  return <Text>{composeLegendLine(availableTowerCount, maxInnerWidth)}</Text>;
};
