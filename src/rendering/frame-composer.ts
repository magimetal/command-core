import type { GameState } from '../models/game-state';
import { composeBorder, SECTION_BREAK } from './border';
import { getDisplayWidth } from './color-map';
import { composeEndStateFrame } from './end-state-composer';
import { composeGrid } from './grid-composer';
import { composeEventLog, composeHud, composeTitleBar } from './hud-composer';
import { composeMapSelectFrame } from './map-select-composer';
import { composeModeSelectFrame } from './mode-select-composer';
import { composeTitleFrame } from './title-composer';
import { GLYPH } from '../const/glyphs';

export const FRAME_INNER_WIDTH_BUDGET = 76;

interface ComposeFrameOptions {
  terminalColumns?: number;
  terminalRows?: number;
}

const GAMEPLAY_VISIBLE_EVENT_LOG = 2;

const getMaxInnerWidth = (terminalColumns?: number): number => {
  if (terminalColumns === undefined) {
    return FRAME_INNER_WIDTH_BUDGET;
  }

  return Math.max(20, Math.min(FRAME_INNER_WIDTH_BUDGET, terminalColumns - 2));
};

const composeLegendLine = (availableTowerCount: number, maxInnerWidth: number): string => {
  if (maxInnerWidth < 70) {
    return `[1-${availableTowerCount}]Tower [↑↓←→]Move [↵]Place [S]Sell [Spc]Start [Q]Quit`;
  }

  return `[1-${availableTowerCount}] Tower  [↑↓←→] Move  [Enter] Place  [S] Sell  [Space] Start  [Q] Quit`;
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
  // Event log display is fixed at 2 entries; terminal row count no longer affects visibility.
  const eventLogLines = composeEventLog(state, GAMEPLAY_VISIBLE_EVENT_LOG);
  const titleBar = composeTitleBar(state);
  const legendLine = composeLegendLine(state.runConfig.availableTowers.length, maxInnerWidth);

  const gridVisibleWidth = Math.max(...gridLines.map((line) => getDisplayWidth(line)));

  if (maxInnerWidth < gridVisibleWidth) {
    const narrowPaneMessageOne = `${GLYPH.WARNING}  Battlefield is wider than this pane: need ${gridVisibleWidth + 2} cols, have ${maxInnerWidth + 2}.`;
    const narrowPaneMessageTwo = 'Widen pane (tmux drag or C-b + ←→), or reduce font.';

    return composeBorder(
      [narrowPaneMessageOne, narrowPaneMessageTwo],
      {
        maxInnerWidth,
        contentWidth: Math.max(
          getDisplayWidth(narrowPaneMessageOne),
          getDisplayWidth(narrowPaneMessageTwo)
        )
      }
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
  ], {
    maxInnerWidth,
    contentWidth: Math.max(gridVisibleWidth, nonGridVisibleWidth)
  });
};
