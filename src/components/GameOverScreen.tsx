import React from 'react';
import { Box, Text, useStdout } from 'ink';
import type { GameState } from '../models/game-state';
import { calculateScore } from '../simulation/score';
import { isReducedMotionEnabled } from '../rendering/accessibility';

interface GameOverScreenProps {
  state: GameState;
  terminalColumnsOverride?: number;
}

export const GameOverScreen = ({ state, terminalColumnsOverride }: GameOverScreenProps): React.ReactElement => {
  const { stdout } = useStdout();
  const terminalColumns = terminalColumnsOverride ?? stdout?.columns ?? process.stdout.columns ?? 78;
  const width = Math.max(56, Math.min(76, terminalColumns - 2));
  const score = calculateScore(state);
  const modeLine =
    state.runConfig.mode === 'ANOMALY'
      ? `Anomaly ${state.runConfig.mapLabel.match(/#\d+/)?.[0] ?? state.runConfig.mapLabel}`
      : `Operations · ${state.runConfig.mapLabel}`;
  const promptSuffix = isReducedMotionEnabled() ? '' : state.frame % 2 === 0 ? ' ▌' : '';
  const framesSinceEntry = Math.max(0, state.frame);
  const statLines = [
    modeLine,
    `Enemies killed: ${state.enemiesKilled}  Gold remaining: ${state.currency}`,
    `Score: ${score}`
  ];
  const visibleStatLines = isReducedMotionEnabled()
    ? statLines
    : statLines.slice(Math.max(0, statLines.length - Math.min(statLines.length, Math.floor(framesSinceEntry / 2) + 1)));

  return (
    <Box borderStyle="round" width={width} flexDirection="column" paddingX={1}>
      <Text color="red">╔═╗╔═╗╔╦╗╔═╗   ╔═╗╦  ╦╔═╗╦═╗</Text>
      <Text color="red">║ ╦╠═╣║║║║╣    ║ ║╚╗╔╝║╣ ╠╦╝</Text>
      <Text color="redBright">╚═╝╩ ╩╩ ╩╚═╝   ╚═╝ ╚╝ ╚═╝╩╚═</Text>
      <Text>────────────────────────────────────────────────────</Text>
      <Text color="white">Base destroyed. Mission failed.</Text>
      {visibleStatLines.map((line, index) => (
        <Text key={`gameover-stat-${index}`}>{line}</Text>
      ))}
      <Text>────────────────────────────────────────────────────</Text>
      <Text color="white">R: New Run   Q: Quit{promptSuffix}</Text>
    </Box>
  );
};
