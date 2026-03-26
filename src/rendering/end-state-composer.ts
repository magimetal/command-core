import chalk from 'chalk';
import type { GameState } from '../models/game-state';
import { calculateScore } from '../simulation/score';
import { isReducedMotionEnabled } from './accessibility';
import { colorizeHudValue } from './color-map';
import { composeBorder, SECTION_BREAK } from './border';

export const composeEndStateFrame = (state: GameState, maxInnerWidth?: number): string => {
  const isVictory = state.phase === 'VICTORY';

  const banner = isVictory
    ? [
        '╦  ╦╦╔═╗╔╦╗╔═╗╦═╗╦ ╦',
        '╚╗╔╝║║   ║ ║ ║╠╦╝╚╦╝',
        ' ╚╝ ╩╚═╝ ╩ ╚═╝╩╚═ ╩ '
      ]
    : [
        '╔═╗╔═╗╔╦╗╔═╗   ╔═╗╦  ╦╔═╗╦═╗',
        '║ ╦╠═╣║║║║╣    ║ ║╚╗╔╝║╣ ╠╦╝',
        '╚═╝╩ ╩╩ ╩╚═╝   ╚═╝ ╚╝ ╚═╝╩╚═'
      ];

  const colorizedBanner = banner.map((line, index) => {
    if (isVictory) {
      const victoryPalette = [chalk.cyanBright, chalk.greenBright, chalk.bold.white];
      return victoryPalette[index % victoryPalette.length](line);
    }

    const gameOverPalette = [chalk.red, chalk.dim.red, chalk.redBright];
    return gameOverPalette[index % gameOverPalette.length](line);
  });

  const titleLine = isVictory
    ? colorizeHudValue('All waves survived. The base stands.', 'PHASE', state.baseHp)
    : colorizeHudValue('The base has fallen. The run ends here.', 'PHASE', 0);
  const modeLine =
    state.runConfig.mode === 'ANOMALY'
      ? `Anomaly ${state.runConfig.mapLabel.match(/#\d+/)?.[0] ?? state.runConfig.mapLabel}`
      : `Operations · ${state.runConfig.mapLabel}`;
  const statLine =
    `Enemies killed: ${colorizeHudValue(`${state.enemiesKilled}`, 'GOLD', state.baseHp)}  ` +
    `Gold remaining: ${colorizeHudValue(`${state.currency}`, 'GOLD', state.baseHp)}`;
  const score = calculateScore(state);
  const scoreLine = `Score: ${colorizeHudValue(`${score}`, 'GOLD', state.baseHp)}`;
  const blinkPrompt = isReducedMotionEnabled()
    ? chalk.bold.white('Press Q to quit')
    : `${chalk.bold.white('Press Q to quit')} \u001b[5m▌\u001b[0m`;

  return composeBorder(
    [...colorizedBanner, SECTION_BREAK, titleLine, modeLine, statLine, scoreLine, SECTION_BREAK, blinkPrompt],
    { maxInnerWidth }
  );
};
