import { describe, expect, test, vi } from 'vitest';
import { TowerArchetype } from '../../src/const/towers';
import type { GamePhase } from '../../src/models/game-state';
type CapturedHandler = (
  input: string,
  key: { [key: string]: boolean | undefined }
) => void;

let capturedInputHandler: CapturedHandler | null = null;

vi.mock('ink', () => {
  return {
    useInput: (
      handler: CapturedHandler
    ) => {
      capturedInputHandler = handler;
    }
  };
});

import { InputHandler, type InputHandlerProps } from '../../src/input/input-handler';

const defaultInputProps = (overrides: Partial<InputHandlerProps> = {}): InputHandlerProps => {
  return {
    onAnyKey: vi.fn(() => false),
    phase: 'PREP' as GamePhase,
    availableTowers: [
      TowerArchetype.RAPID,
      TowerArchetype.CANNON,
      TowerArchetype.SNIPER,
      TowerArchetype.SLOW
    ],
    onMoveCursor: vi.fn(),
    onPlaceTower: vi.fn(),
    onSellTower: vi.fn(),
    onSelectTower: vi.fn(),
    onMenuNavigate: vi.fn(),
    onMenuConfirm: vi.fn(),
    onMenuBack: vi.fn(),
    onMenuDirectSelect: vi.fn(),
    onQuit: vi.fn(),
    onSpace: vi.fn(),
    onNewRun: vi.fn(),
    ...overrides
  };
};

const renderAndGetHandler = (props: InputHandlerProps): CapturedHandler => {
  capturedInputHandler = null;
  InputHandler(props);

  if (capturedInputHandler === null) {
    throw new Error('Input handler callback was not registered');
  }

  return capturedInputHandler;
};

describe('InputHandler title gating', () => {
  test('Q quits before any-key title interception', () => {
    const onQuit = vi.fn();
    const onAnyKey = vi.fn(() => true);
    const handler = renderAndGetHandler(defaultInputProps({
      onAnyKey,
      onQuit,
    }));

    handler('q', {});

    expect(onQuit).toHaveBeenCalledTimes(1);
    expect(onAnyKey).not.toHaveBeenCalled();
  });

  test('non-Q key still advances via any-key title interception', () => {
    const onQuit = vi.fn();
    const onAnyKey = vi.fn(() => true);
    const onSelectTower = vi.fn();
    const handler = renderAndGetHandler(defaultInputProps({
      onAnyKey,
      onQuit,
      onSelectTower,
    }));

    handler('1', {});

    expect(onAnyKey).toHaveBeenCalledTimes(1);
    expect(onQuit).not.toHaveBeenCalled();
    expect(onSelectTower).not.toHaveBeenCalled();
  });

  test('selects SNIPER on key 3 when not title-gated', () => {
    const onSelectTower = vi.fn();
    const handler = renderAndGetHandler(defaultInputProps({
      onSelectTower,
    }));

    handler('3', {});

    expect(onSelectTower).toHaveBeenCalledWith(TowerArchetype.SNIPER);
  });

  test('selects SLOW on key 4 when not title-gated', () => {
    const onSelectTower = vi.fn();
    const handler = renderAndGetHandler(defaultInputProps({
      onSelectTower,
    }));

    handler('4', {});

    expect(onSelectTower).toHaveBeenCalledWith(TowerArchetype.SLOW);
  });

  test('s key triggers sell callback when not title-gated', () => {
    const onSellTower = vi.fn();
    const handler = renderAndGetHandler(defaultInputProps({
      onSellTower,
    }));

    handler('s', {});

    expect(onSellTower).toHaveBeenCalledTimes(1);
  });

  test('in menu phase, numeric key routes to menu cursor selection', () => {
    const onMenuDirectSelect = vi.fn();
    const onSelectTower = vi.fn();
    const handler = renderAndGetHandler(
      defaultInputProps({
        phase: 'MODE_SELECT',
        onMenuDirectSelect,
        onSelectTower
      })
    );

    handler('2', {});

    expect(onMenuDirectSelect).toHaveBeenCalledWith(1);
    expect(onSelectTower).not.toHaveBeenCalled();
  });

  test('in menu phase, key 0 routes to map index 9', () => {
    const onMenuDirectSelect = vi.fn();
    const onSelectTower = vi.fn();
    const handler = renderAndGetHandler(
      defaultInputProps({
        phase: 'MAP_SELECT',
        onMenuDirectSelect,
        onSelectTower
      })
    );

    handler('0', {});

    expect(onMenuDirectSelect).toHaveBeenCalledWith(9);
    expect(onSelectTower).not.toHaveBeenCalled();
  });

  test('ignores unavailable numeric tower key when only three towers are available', () => {
    const onSelectTower = vi.fn();
    const handler = renderAndGetHandler(
      defaultInputProps({
        availableTowers: [TowerArchetype.RAPID, TowerArchetype.CANNON, TowerArchetype.SNIPER],
        onSelectTower
      })
    );

    handler('4', {});

    expect(onSelectTower).not.toHaveBeenCalled();
  });

  test('R key triggers new run in GAME_OVER phase', () => {
    const onNewRun = vi.fn();
    const handler = renderAndGetHandler(defaultInputProps({
      phase: 'GAME_OVER',
      onNewRun
    }));

    handler('r', {});

    expect(onNewRun).toHaveBeenCalledTimes(1);
  });

  test('R key triggers new run in VICTORY phase', () => {
    const onNewRun = vi.fn();
    const handler = renderAndGetHandler(defaultInputProps({
      phase: 'VICTORY',
      onNewRun
    }));

    handler('R', {});

    expect(onNewRun).toHaveBeenCalledTimes(1);
  });

  test('R key does not trigger new run in PREP phase', () => {
    const onNewRun = vi.fn();
    const handler = renderAndGetHandler(defaultInputProps({
      phase: 'PREP',
      onNewRun
    }));

    handler('r', {});

    expect(onNewRun).not.toHaveBeenCalled();
  });
});
