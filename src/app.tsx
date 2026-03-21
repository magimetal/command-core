import React, { useEffect, useRef, useState } from 'react';
import { Text, useApp } from 'ink';
import { FRAME_INTERVAL_MS } from './const/game';
import { TowerArchetype } from './const/towers';
import { WAVES } from './const/waves';
import { InputHandler } from './input/input-handler';
import { appendEventLog } from './rendering/event-log';
import { composeFrame } from './rendering/frame-composer';
import { createInitialState } from './simulation/create-initial-state';
import { startWave } from './simulation/start-wave';
import { tick } from './simulation/tick';
import { placeTower } from './simulation/tower-placement';

const toPlacementFailureMessage = (error: string): string => {
  if (error === 'Cell is not buildable') {
    return '✗ Cannot place tower: not buildable';
  }

  if (error === 'Cell already occupied') {
    return '✗ Cannot place tower: occupied';
  }

  if (error === 'Insufficient currency') {
    return '✗ Cannot place tower: insufficient gold';
  }

  if (error === 'Out of bounds') {
    return '✗ Cannot place tower: out of bounds';
  }

  return `✗ Cannot place tower: ${error.toLowerCase()}`;
};

export const App = () => {
  const { exit } = useApp();
  const [state, setState] = useState(createInitialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopLoop = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
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
          const message = `>> Wave ${previousState.wave} cleared!`;
          result = {
            ...result,
            eventLog: appendEventLog(result.eventLog, message)
          };
        }

        return result;
      });
    }, FRAME_INTERVAL_MS);

    return () => {
      stopLoop();
    };
  }, []);

  const moveCursor = (dx: number, dy: number) => {
    setState((previousState) => {
      if (previousState.phase === 'TITLE') {
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
      if (previousState.phase === 'TITLE') {
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
      if (previousState.phase === 'TITLE') {
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
          eventLog: appendEventLog(previousState.eventLog, message),
          lastEventMessage: message
        };
      }

      const [col, row] = previousState.cursor;
      const message = `✓ Tower placed at (${col},${row})`;

      return {
        ...nextState,
        eventLog: appendEventLog(previousState.eventLog, message),
        lastEventMessage: message
      };
    });
  };

  const quitGame = () => {
    stopLoop();
    exit();
    process.exit(0);
  };

  const advanceFromTitle = (): boolean => {
    if (state.phase !== 'TITLE') {
      return false;
    }

    setState((previousState) => {
      if (previousState.phase !== 'TITLE') {
        return previousState;
      }

      return {
        ...previousState,
        phase: 'PREP'
      };
    });

    return true;
  };

  const frame = composeFrame(state);

  return (
    <>
      <InputHandler
        onAnyKey={advanceFromTitle}
        onMoveCursor={moveCursor}
        onPlaceTower={tryPlaceTower}
        onSelectTower={selectTower}
        onQuit={quitGame}
        onSpace={() =>
          setState((previousState) => {
            const nextState = startWave(previousState);
            if (nextState === previousState) {
              return previousState;
            }

            const waveDef = WAVES[previousState.wave - 1];
            const totalEnemies = waveDef.enemies.reduce((sum, group) => sum + group.count, 0);
            const message = `>> Wave ${previousState.wave} started — ${totalEnemies} enemies incoming`;

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
