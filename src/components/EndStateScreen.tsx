import React from 'react';
import { Box, Text } from 'ink';
import type { GameState } from '../models/game-state';
import { calculateScore } from '../simulation/score';
import { isReducedMotionEnabled } from '../rendering/accessibility';
import { useTerminalWidth } from './use-terminal-width';

interface EndStateScreenProps {
  state: GameState;
  variant: 'game-over' | 'victory';
  terminalColumnsOverride?: number;
}

const END_STATE_VARIANTS = {
  'game-over': {
    banner: [
      { text: '╔═╗╔═╗╔╦╗╔═╗   ╔═╗╦  ╦╔═╗╦═╗', color: 'red' as const },
      { text: '║ ╦╠═╣║║║║╣    ║ ║╚╗╔╝║╣ ╠╦╝', color: 'red' as const },
      { text: '╚═╝╩ ╩╩ ╩╚═╝   ╚═╝ ╚╝ ╚═╝╩╚═', color: 'redBright' as const }
    ],
    message: 'Base destroyed. Mission failed.'
  },
  victory: {
    banner: [
      { text: '╦  ╦╦╔═╗╔╦╗╔═╗╦═╗╦ ╦', color: 'cyanBright' as const },
      { text: '╚╗╔╝║║   ║ ║ ║╠╦╝╚╦╝', color: 'greenBright' as const },
      { text: ' ╚╝ ╩╚═╝ ╩ ╚═╝╩╚═ ╩ ', color: 'white' as const }
    ],
    message: 'All waves cleared. Base secured.'
  }
} as const;

export const EndStateScreen = ({ state, variant, terminalColumnsOverride }: EndStateScreenProps): React.ReactElement => {
  const width = useTerminalWidth({ override: terminalColumnsOverride });
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
  const content = END_STATE_VARIANTS[variant];

  return (
    <Box borderStyle="round" width={width} flexDirection="column" paddingX={1}>
      {content.banner.map((line) => (
        <Text key={line.text} color={line.color}>
          {line.text}
        </Text>
      ))}
      <Text>────────────────────────────────────────────────────</Text>
      <Text color="white">{content.message}</Text>
      {visibleStatLines.map((line, index) => (
        <Text key={`endstate-stat-${index}`}>{line}</Text>
      ))}
      <Text>────────────────────────────────────────────────────</Text>
      <Text color="white">R: New Run   Q: Quit{promptSuffix}</Text>
    </Box>
  );
};
