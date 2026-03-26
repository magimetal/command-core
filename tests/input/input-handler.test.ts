import { describe, expect, test, vi } from 'vitest';
import { TowerArchetype } from '../../src/const/towers';
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
    const handler = renderAndGetHandler({
      onAnyKey,
      onQuit,
      onMoveCursor: vi.fn(),
      onPlaceTower: vi.fn(),
      onSellTower: vi.fn(),
      onSelectTower: vi.fn(),
      onSpace: vi.fn()
    });

    handler('q', {});

    expect(onQuit).toHaveBeenCalledTimes(1);
    expect(onAnyKey).not.toHaveBeenCalled();
  });

  test('non-Q key still advances via any-key title interception', () => {
    const onQuit = vi.fn();
    const onAnyKey = vi.fn(() => true);
    const onSelectTower = vi.fn();
    const handler = renderAndGetHandler({
      onAnyKey,
      onQuit,
      onMoveCursor: vi.fn(),
      onPlaceTower: vi.fn(),
      onSellTower: vi.fn(),
      onSelectTower,
      onSpace: vi.fn()
    });

    handler('1', {});

    expect(onAnyKey).toHaveBeenCalledTimes(1);
    expect(onQuit).not.toHaveBeenCalled();
    expect(onSelectTower).not.toHaveBeenCalled();
  });

  test('selects SNIPER on key 3 when not title-gated', () => {
    const onSelectTower = vi.fn();
    const handler = renderAndGetHandler({
      onAnyKey: vi.fn(() => false),
      onQuit: vi.fn(),
      onMoveCursor: vi.fn(),
      onPlaceTower: vi.fn(),
      onSellTower: vi.fn(),
      onSelectTower,
      onSpace: vi.fn()
    });

    handler('3', {});

    expect(onSelectTower).toHaveBeenCalledWith(TowerArchetype.SNIPER);
  });

  test('selects SLOW on key 4 when not title-gated', () => {
    const onSelectTower = vi.fn();
    const handler = renderAndGetHandler({
      onAnyKey: vi.fn(() => false),
      onQuit: vi.fn(),
      onMoveCursor: vi.fn(),
      onPlaceTower: vi.fn(),
      onSellTower: vi.fn(),
      onSelectTower,
      onSpace: vi.fn()
    });

    handler('4', {});

    expect(onSelectTower).toHaveBeenCalledWith(TowerArchetype.SLOW);
  });

  test('s key triggers sell callback when not title-gated', () => {
    const onSellTower = vi.fn();
    const handler = renderAndGetHandler({
      onAnyKey: vi.fn(() => false),
      onQuit: vi.fn(),
      onMoveCursor: vi.fn(),
      onPlaceTower: vi.fn(),
      onSellTower,
      onSelectTower: vi.fn(),
      onSpace: vi.fn()
    });

    handler('s', {});

    expect(onSellTower).toHaveBeenCalledTimes(1);
  });
});
