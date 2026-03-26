import {
  createOperationsRunConfig,
  OPERATIONS_MAP_DEFS
} from '../const/operations-maps';
import { isMenuPhase, type GameState } from '../models/game-state';
import { generateAnomalyRunConfig } from './anomaly-gen';
import { createInitialState } from './create-initial-state';

interface ConfirmMenuStateOptions {
  anomalySeed?: number;
}

const toPrepState = (state: GameState, runConfig: GameState['runConfig']): GameState => {
  const initial = createInitialState(runConfig);

  return {
    ...initial,
    phase: 'PREP',
    frame: state.frame
  };
};

const getMenuItemCount = (state: GameState): number => {
  if (state.phase === 'MODE_SELECT') {
    return 2;
  }

  if (state.phase === 'MAP_SELECT') {
    return OPERATIONS_MAP_DEFS.length;
  }

  return 0;
};

export const advanceFromTitleState = (state: GameState): GameState => {
  if (state.phase !== 'TITLE') {
    return state;
  }

  return {
    ...state,
    phase: 'MODE_SELECT',
    menuCursor: 0
  };
};

export const navigateMenuState = (state: GameState, delta: number): GameState => {
  if (!isMenuPhase(state.phase)) {
    return state;
  }

  const menuCount = getMenuItemCount(state);
  const nextCursor = Math.max(0, Math.min(menuCount - 1, state.menuCursor + delta));

  return {
    ...state,
    menuCursor: nextCursor
  };
};

export const setMenuCursorState = (state: GameState, index: number): GameState => {
  if (!isMenuPhase(state.phase)) {
    return state;
  }

  const menuCount = getMenuItemCount(state);
  if (index < 0 || index >= menuCount) {
    return state;
  }

  return {
    ...state,
    menuCursor: index
  };
};

export const confirmMenuState = (state: GameState, options?: ConfirmMenuStateOptions): GameState => {
  if (state.phase === 'MODE_SELECT') {
    if (state.menuCursor === 0) {
      return {
        ...state,
        phase: 'MAP_SELECT',
        menuCursor: 0
      };
    }

    const anomalySeed = options?.anomalySeed ?? 0;
    return toPrepState(state, generateAnomalyRunConfig(anomalySeed));
  }

  if (state.phase === 'MAP_SELECT') {
    const mapDef = OPERATIONS_MAP_DEFS[state.menuCursor] ?? OPERATIONS_MAP_DEFS[0];
    return toPrepState(state, createOperationsRunConfig(mapDef));
  }

  return state;
};

export const backFromMenuState = (state: GameState): GameState => {
  if (state.phase !== 'MAP_SELECT') {
    return state;
  }

  return {
    ...state,
    phase: 'MODE_SELECT',
    menuCursor: 0
  };
};
