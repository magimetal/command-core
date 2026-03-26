import type { GameState } from '../models/game-state';
import { composeBorder, SECTION_BREAK } from './border';
import { getDisplayWidth } from './color-map';
import { composeEndStateFrame } from './end-state-composer';
import { composeGrid } from './grid-composer';
import { composeEventLog, composeHud, composeTitleBar } from './hud-composer';
import { composeMapSelectFrame } from './map-select-composer';
import { composeModeSelectFrame } from './mode-select-composer';
import { composeTitleFrame } from './title-composer';

const FRAME_INNER_WIDTH_BUDGET = 76;

interface ComposeFrameOptions {
  terminalColumns?: number;
}

const getMaxInnerWidth = (terminalColumns?: number): number => {
  if (terminalColumns === undefined) {
    return FRAME_INNER_WIDTH_BUDGET;
  }

  return Math.max(20, Math.min(FRAME_INNER_WIDTH_BUDGET, terminalColumns - 2));
};

export const composeFrame = (state: GameState, options: ComposeFrameOptions = {}): string => {
  const maxInnerWidth = getMaxInnerWidth(options.terminalColumns);

  if (state.phase === 'TITLE') {
    return composeTitleFrame(state, maxInnerWidth);
  }

  if (state.phase === 'MODE_SELECT') {
    return composeModeSelectFrame(state, maxInnerWidth);
  }

  if (state.phase === 'MAP_SELECT') {
    return composeMapSelectFrame(state, maxInnerWidth);
  }

  if (state.phase === 'GAME_OVER' || state.phase === 'VICTORY') {
    return composeEndStateFrame(state, maxInnerWidth);
  }

  const gridLines = composeGrid(state);
  const hudLines = composeHud(state).split('\n');
  const eventLogLines = composeEventLog(state);
  const titleBar = composeTitleBar(state);
  const legendLine =
    `[1-${state.runConfig.availableTowers.length}] Tower  [↑↓←→] Move  [Enter] Place  [S] Sell  [Space] Start  [Q] Quit`;

  const gridVisibleWidth = Math.max(...gridLines.map((line) => getDisplayWidth(line)));

  if (maxInnerWidth < gridVisibleWidth) {
    return composeBorder(
      [
        'Terminal pane too narrow for battlefield view.',
        `Need at least ${gridVisibleWidth + 2} columns; current pane is ${maxInnerWidth + 2}.`,
        'Widen pane or reduce terminal font size, then continue.'
      ],
      { maxInnerWidth }
    );
  }

  const nonGridVisibleWidth = Math.max(
    getDisplayWidth(titleBar),
    ...hudLines.map((line) => getDisplayWidth(line)),
    getDisplayWidth(legendLine),
    ...eventLogLines.map((line) => getDisplayWidth(line))
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
  ], { maxInnerWidth });
};
