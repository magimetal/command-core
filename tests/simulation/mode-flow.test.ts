import { describe, expect, test } from 'vitest';
import {
  advanceFromTitleState,
  backFromMenuState,
  confirmMenuState
} from '../../src/simulation/menu-flow';
import { createInitialState } from '../../src/simulation/create-initial-state';

describe('mode flow state machine', () => {
  test('advanceFromTitle transitions TITLE -> MODE_SELECT', () => {
    const next = advanceFromTitleState(createInitialState());
    expect(next.phase).toBe('MODE_SELECT');
  });

  test('confirm in MODE_SELECT at cursor 0 transitions to MAP_SELECT', () => {
    const next = confirmMenuState({
      ...createInitialState(),
      phase: 'MODE_SELECT',
      menuCursor: 0
    });

    expect(next.phase).toBe('MAP_SELECT');
  });

  test('confirm in MODE_SELECT at cursor 1 enters PREP with ANOMALY runConfig', () => {
    const next = confirmMenuState({
      ...createInitialState(),
      phase: 'MODE_SELECT',
      menuCursor: 1
    });

    expect(next.phase).toBe('PREP');
    expect(next.runConfig.mode).toBe('ANOMALY');
    expect(next.runConfig.mapLabel).toBe('Anomaly #0');
  });

  test('back in MAP_SELECT returns to MODE_SELECT', () => {
    const next = backFromMenuState({
      ...createInitialState(),
      phase: 'MAP_SELECT',
      menuCursor: 0
    });

    expect(next.phase).toBe('MODE_SELECT');
  });

  test('confirm in MAP_SELECT enters PREP with selected map runConfig', () => {
    const next = confirmMenuState({
      ...createInitialState(),
      phase: 'MAP_SELECT',
      menuCursor: 0
    });

    expect(next.phase).toBe('PREP');
    expect(next.runConfig.mapId).toBe('map-01');
  });
});
