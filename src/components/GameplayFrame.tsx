import React from 'react';
import { Box, Text, useStdout } from 'ink';
import type { GameState } from '../models/game-state';
import { composeGrid } from '../rendering/grid-composer';
import { composeEventLog, composeHud, composeTitleBar } from '../rendering/hud-composer';
import { getDisplayWidth, truncateDisplay } from '../rendering/text-utils';
import { GLYPH } from '../const/glyphs';
import { EventLogPanel } from './EventLogPanel';
import { HudPanel } from './HudPanel';
import { composeLegendLine, LegendLine } from './LegendLine';
import { TitleBar } from './TitleBar';

interface GameplayFrameProps {
  state: GameState;
  terminalColumnsOverride?: number;
}

export const GameplayFrame = ({
  state,
  terminalColumnsOverride
}: GameplayFrameProps): React.ReactElement => {
  const { stdout } = useStdout();
  const terminalColumns = terminalColumnsOverride ?? stdout?.columns ?? process.stdout.columns ?? 78;
  const maxInnerWidth = Math.max(20, Math.min(76, terminalColumns - 2));
  const eventLogLines = composeEventLog(state, 2);
  const gridLines = composeGrid(state);
  const hudLines = composeHud(state).split('\n');
  const titleBar = composeTitleBar(state);

  const gridVisibleWidth = Math.max(...gridLines.map((line) => getDisplayWidth(line)));

  if (maxInnerWidth < gridVisibleWidth) {
    const warningOne = truncateDisplay(
      `${GLYPH.WARNING}  Battlefield is wider than this pane: need ${gridVisibleWidth + 2} cols, have ${maxInnerWidth + 2}.`,
      maxInnerWidth
    );
    const warningTwo = truncateDisplay(
      'Widen pane (tmux drag or C-b + ←→), or reduce font.',
      maxInnerWidth
    );

    return (
      <Box flexDirection="column">
        <Text>{warningOne}</Text>
        <Text>{warningTwo}</Text>
      </Box>
    );
  }

  const legendLine = composeLegendLine(state.runConfig.availableTowers.length, maxInnerWidth);
  const nonGridVisibleWidth = Math.max(
    getDisplayWidth(titleBar),
    ...hudLines.map((line) => getDisplayWidth(line)),
    getDisplayWidth(legendLine),
    ...eventLogLines.map((line) => getDisplayWidth(line))
  );
  const leftPad = Math.max(0, Math.floor((nonGridVisibleWidth - gridVisibleWidth) / 2));
  const centeredGridLines = gridLines.map((line) => `${' '.repeat(leftPad)}${line}`);
  const sectionBreak = '─'.repeat(Math.max(gridVisibleWidth, nonGridVisibleWidth));

  return (
    <Box flexDirection="column">
      <TitleBar state={state} />
      <Text>{sectionBreak}</Text>
      {centeredGridLines.map((line, index) => (
        <Text key={`grid-${index}`}>{line}</Text>
      ))}
      <Text>{sectionBreak}</Text>
      <HudPanel state={state} terminalColumnsOverride={terminalColumnsOverride} />
      <LegendLine
        availableTowerCount={state.runConfig.availableTowers.length}
        terminalColumnsOverride={terminalColumnsOverride}
      />
      <Text>{sectionBreak}</Text>
      <EventLogPanel state={state} />
    </Box>
  );
};
