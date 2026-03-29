import React, { useEffect, useRef, useState } from 'react';
import { Text, useApp } from 'ink';
import { EVENT_PREFIX } from './const/event-prefixes';
import { FRAME_INTERVAL_MS } from './const/game';
import { TowerArchetype } from './const/towers';
import { InputHandler } from './input/input-handler';
import { isMenuPhase, type GamePhase } from './models/game-state';
import { appendEventLog } from './utils/event-log';
import { composeFrame } from './rendering/frame-composer';
import { isReducedMotionEnabled } from './rendering/accessibility';
import { createInitialState } from './simulation/create-initial-state';
import {
  advanceFromTitleState,
  backFromMenuState,
  confirmMenuState,
  navigateMenuState,
  setMenuCursorState
} from './simulation/menu-flow';
import { startWave } from './simulation/start-wave';
import { tick } from './simulation/tick';
import { placeTower, PlacementErrorCode } from './simulation/tower-placement';
import { sellTower } from './simulation/tower-sell';

const toPlacementFailureMessage = (code: PlacementErrorCode): string => {
  switch (code) {
    case PlacementErrorCode.OBSTACLE:
      return `${EVENT_PREFIX.ERROR} Cannot place tower: blocked by obstacle`;
    case PlacementErrorCode.NOT_BUILDABLE:
      return `${EVENT_PREFIX.ERROR} Cannot place tower: not buildable`;
    case PlacementErrorCode.OCCUPIED:
      return `${EVENT_PREFIX.ERROR} Cannot place tower: occupied`;
    case PlacementErrorCode.INSUFFICIENT_CURRENCY:
      return `${EVENT_PREFIX.ERROR} Cannot place tower: insufficient gold`;
    case PlacementErrorCode.OUT_OF_BOUNDS:
      return `${EVENT_PREFIX.ERROR} Cannot place tower: out of bounds`;
    default: {
      const _exhaustive: never = code;
      return `${EVENT_PREFIX.ERROR} Cannot place tower: ${_exhaustive}`;
    }
  }
};

export const toSellFailureMessage = (error: string): string => {
  return error === 'No tower at cursor to sell'
    ? `${EVENT_PREFIX.ERROR} No tower here to sell`
    : `${EVENT_PREFIX.ERROR} ${error}`;
};

export const App = () => {
  const { exit } = useApp();
  const [state, setState] = useState(createInitialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef<GamePhase>(state.phase);
  const lastRenderedFrameKeyRef = useRef<string | null>(null);
  const frameStringRef = useRef<string>('');

  useEffect(() => {
    phaseRef.current = state.phase;
  }, [state.phase]);

  const stopLoop = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startLoop = () => {
    intervalRef.current = setInterval(() => {
      setState((previousState) => {
        if (previousState.phase === 'GAME_OVER' || previousState.phase === 'VICTORY') {
          stopLoop();
          return previousState;
        }

        const advancedState = tick(previousState);

        if (advancedState.phase === 'GAME_OVER' || advancedState.phase === 'VICTORY') {
          stopLoop();
        }

        let result = {
          ...advancedState,
          frame: previousState.frame + 1
        };

        if (advancedState.phase === 'WAVE_CLEAR' && previousState.phase !== 'WAVE_CLEAR') {
          const message = `${EVENT_PREFIX.WAVE} Wave ${previousState.wave} cleared!`;
          result = {
            ...result,
            eventLog: appendEventLog(result.eventLog, message)
          };
        }

        return result;
      });
    }, FRAME_INTERVAL_MS);
  };

  useEffect(() => {
    startLoop();

    return () => {
      stopLoop();
    };
  }, []);

  const moveCursor = (dx: number, dy: number) => {
    setState((previousState) => {
      if (previousState.phase === 'TITLE' || isMenuPhase(previousState.phase)) {
        return previousState;
      }

      const [currentCol, currentRow] = previousState.cursor;
      const maxRow = previousState.grid.length - 1;
      const maxCol = previousState.grid[0].length - 1;

      const nextCol = Math.max(0, Math.min(maxCol, currentCol + dx));
      const nextRow = Math.max(0, Math.min(maxRow, currentRow + dy));

      return {
        ...previousState,
        cursor: [nextCol, nextRow]
      };
    });
  };

  const selectTower = (archetype: TowerArchetype) => {
    setState((previousState) => {
      if (previousState.phase === 'TITLE' || isMenuPhase(previousState.phase)) {
        return previousState;
      }

      return {
        ...previousState,
        selectedTowerArchetype: archetype
      };
    });
  };

  const tryPlaceTower = () => {
    setState((previousState) => {
      if (previousState.phase === 'TITLE' || isMenuPhase(previousState.phase)) {
        return previousState;
      }

      const nextState = placeTower(
        previousState,
        previousState.cursor,
        previousState.selectedTowerArchetype
      );

      if ('error' in nextState) {
        const message = toPlacementFailureMessage(nextState.error);

        return {
          ...previousState,
          eventLog: appendEventLog(previousState.eventLog, message)
        };
      }

      const [col, row] = previousState.cursor;
      const message = `${EVENT_PREFIX.PLACED} Tower placed at (${col},${row})`;

      return {
        ...nextState,
        eventLog: appendEventLog(previousState.eventLog, message)
      };
    });
  };

  const trySellTower = () => {
    setState((previousState) => {
      if (previousState.phase === 'TITLE' || isMenuPhase(previousState.phase)) {
        return previousState;
      }

      const nextState = sellTower(previousState, previousState.cursor);
      if ('error' in nextState) {
        const message = toSellFailureMessage(nextState.error);
        return {
          ...previousState,
          eventLog: appendEventLog(previousState.eventLog, message)
        };
      }

      const [col, row] = previousState.cursor;
      const message = `${EVENT_PREFIX.SOLD} Tower sold at (${col},${row})`;
      return {
        ...nextState,
        eventLog: appendEventLog(nextState.eventLog, message)
      };
    });
  };

  const quitGame = () => {
    stopLoop();
    exit();
    process.exit(0);
  };

  const handleNewRun = () => {
    stopLoop();
    setState(() => createInitialState());
    startLoop();
  };

  const advanceFromTitle = (): boolean => {
    if (phaseRef.current !== 'TITLE') {
      return false;
    }

    setState((previousState) => {
      if (previousState.phase !== 'TITLE') {
        return previousState;
      }

      return advanceFromTitleState(previousState);
    });

    return true;
  };

  const titleRenderKey = isReducedMotionEnabled()
    ? 'TITLE-STATIC'
    : // Keep "10" in sync with logoArt.length in src/rendering/title-composer.ts.
      `TITLE-${Math.floor(state.frame / 2) % 10}`;
  const renderKey =
    state.phase === 'TITLE' ? titleRenderKey : `${state.phase}-${state.frame}`;

  if (renderKey !== lastRenderedFrameKeyRef.current) {
    lastRenderedFrameKeyRef.current = renderKey;
    frameStringRef.current = composeFrame(state, {
      terminalColumns: process.stdout.columns,
      terminalRows: process.stdout.rows
    });
  }

  const frame = frameStringRef.current;

  const handleMenuNavigate = (delta: number) => {
    setState((previousState) => navigateMenuState(previousState, delta));
  };

  const handleMenuDirectSelect = (index: number) => {
    setState((previousState) => setMenuCursorState(previousState, index));
  };

  const handleMenuConfirm = () => {
    setState((previousState) => {
      if (previousState.phase === 'MODE_SELECT' && previousState.menuCursor === 1) {
        const envSeed = Number(process.env.ANOMALY_SEED);
        const anomalySeed = Number.isInteger(envSeed) ? envSeed : Date.now() % 65536;

        return confirmMenuState(previousState, { anomalySeed });
      }

      return confirmMenuState(previousState);
    });
  };

  const handleMenuBack = () => {
    setState((previousState) => backFromMenuState(previousState));
  };

  return (
    <>
      <InputHandler
        onAnyKey={advanceFromTitle}
        onMoveCursor={moveCursor}
        onPlaceTower={tryPlaceTower}
        onSellTower={trySellTower}
        onSelectTower={selectTower}
        availableTowers={state.runConfig.availableTowers}
        phase={state.phase}
        onQuit={quitGame}
        onMenuNavigate={handleMenuNavigate}
        onMenuConfirm={handleMenuConfirm}
        onMenuBack={handleMenuBack}
        onMenuDirectSelect={handleMenuDirectSelect}
        onNewRun={handleNewRun}
        onSpace={() =>
          setState((previousState) => {
            const nextState = startWave(previousState);
            if (nextState === previousState) {
              return previousState;
            }

            const waveDef = previousState.runConfig.waves[previousState.wave - 1];
            if (waveDef === undefined) {
              return nextState;
            }

            const totalEnemies = waveDef.enemies.reduce((sum, group) => sum + group.count, 0);
            const message = `${EVENT_PREFIX.WAVE} Wave ${previousState.wave} started — ${totalEnemies} enemies incoming`;

            return {
              ...nextState,
              eventLog: appendEventLog(nextState.eventLog, message)
            };
          })
        }
      />
      <Text>{frame}</Text>
    </>
  );
};
