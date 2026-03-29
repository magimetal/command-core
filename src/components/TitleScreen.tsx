import React from 'react';
import { Box, Text, useStdout } from 'ink';
import type { GameState } from '../models/game-state';
import { isReducedMotionEnabled } from '../rendering/accessibility';

interface TitleScreenProps {
  state: GameState;
  terminalColumnsOverride?: number;
}

const LOGO_ART = [
  '╔══════════════════════════════════════════╗',
  '║                                          ║',
  '║   ██████  ██████  ██████  ███████        ║',
  '║  ██      ██    ██ ██   ██ ██             ║',
  '║  ██      ██    ██ ██████  █████          ║',
  '║  ██      ██    ██ ██  ██  ██             ║',
  '║   ██████  ██████  ██   ██ ███████        ║',
  '║                                          ║',
  '║                                          ║',
  '╚══════════════ COMMAND CORE ══════════════╝'
];

const TITLE_FADE_FRAMES = 10;

export const TitleScreen = ({ state, terminalColumnsOverride }: TitleScreenProps): React.ReactElement => {
  const { stdout } = useStdout();
  const terminalColumns = terminalColumnsOverride ?? stdout?.columns ?? process.stdout.columns ?? 78;
  const width = Math.max(50, Math.min(76, terminalColumns - 2));
  const reducedMotion = isReducedMotionEnabled();
  const fadeProgress = reducedMotion ? TITLE_FADE_FRAMES : Math.min(TITLE_FADE_FRAMES, Math.max(0, state.frame));
  const revealedRows = Math.floor((fadeProgress / TITLE_FADE_FRAMES) * LOGO_ART.length);
  const scanRow = reducedMotion ? -1 : Math.floor(state.frame / 2) % LOGO_ART.length;

  return (
    <Box borderStyle="round" width={width} flexDirection="column" paddingX={1}>
      {LOGO_ART.map((line, index) => (
        (() => {
          const isPreReveal = !reducedMotion && fadeProgress < TITLE_FADE_FRAMES && index > revealedRows;
          const renderedLine = isPreReveal ? ' '.repeat(line.length) : line;

          return (
        <Text
          key={`logo-${index}`}
          color="yellow"
          dimColor={
            (!reducedMotion && fadeProgress >= TITLE_FADE_FRAMES && index === scanRow)
          }
        >
          {renderedLine}
        </Text>
          );
        })()
      ))}
      <Text>────────────────────────────────────────────────────</Text>
      <Text color="cyanBright">:: COMMAND CORE ONLINE ::</Text>
      <Text dimColor>Defend the base through escalating waves</Text>
      <Text color="white">Any key: Choose mode</Text>
      <Text>────────────────────────────────────────────────────</Text>
      <Text dimColor>Q: Quit</Text>
    </Box>
  );
};
