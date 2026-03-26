import type { GameState } from '../models/game-state';
import { composeBorder, SECTION_BREAK } from './border';
import { stripAnsi } from './color-map';
import { composeEndStateFrame } from './end-state-composer';
import { composeGrid } from './grid-composer';
import { composeEventLog, composeHud, composeTitleBar } from './hud-composer';
import { composeMapSelectFrame } from './map-select-composer';
import { composeModeSelectFrame } from './mode-select-composer';
import { composeTitleFrame } from './title-composer';

export const composeFrame = (state: GameState): string => {
  if (state.phase === 'TITLE') {
    return composeTitleFrame(state);
  }

  if (state.phase === 'MODE_SELECT') {
    return composeModeSelectFrame(state);
  }

  if (state.phase === 'MAP_SELECT') {
    return composeMapSelectFrame(state);
  }

  if (state.phase === 'GAME_OVER' || state.phase === 'VICTORY') {
    return composeEndStateFrame(state);
  }

  const gridLines = composeGrid(state);
  const hudLines = composeHud(state).split('\n');
  const eventLogLines = composeEventLog(state);
  const titleBar = composeTitleBar(state);
  const legendLine =
    `[1-${state.runConfig.availableTowers.length}] Tower  [↑↓←→] Move  [Enter] Place  [S] Sell  [Space] Start  [Q] Quit`;

  const gridVisibleWidth = Math.max(...gridLines.map((line) => stripAnsi(line).length));
  const nonGridVisibleWidth = Math.max(
    stripAnsi(titleBar).length,
    ...hudLines.map((line) => stripAnsi(line).length),
    stripAnsi(legendLine).length,
    ...eventLogLines.map((line) => stripAnsi(line).length)
  );
  const leftPad = Math.max(0, Math.floor((nonGridVisibleWidth - gridVisibleWidth) / 2));
  const centeredGridLines = gridLines.map((line) => `${' '.repeat(leftPad)}${line}`);

  return composeBorder([
    titleBar,
    SECTION_BREAK,
    ...centeredGridLines,
    SECTION_BREAK,
    ...hudLines,
    legendLine,
    SECTION_BREAK,
    ...eventLogLines
  ]);
};
