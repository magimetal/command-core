import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, render } from 'ink-testing-library';
import { EndStateScreen } from '../../src/components/EndStateScreen';
import { MapSelectScreen } from '../../src/components/MapSelectScreen';
import { ModeSelectScreen } from '../../src/components/ModeSelectScreen';
import { TitleScreen } from '../../src/components/TitleScreen';
import { stripAnsi } from '../../src/rendering/text-utils';
import { createInitialState } from '../../src/simulation/create-initial-state';

afterEach(() => {
  cleanup();
});

const expectOutputTokens = (inkOutput: string, tokens: string[]): void => {
  for (const token of tokens) {
    expect(inkOutput).toContain(token);
  }
};

describe('Ink ceremony screens', () => {
  test('TitleScreen snapshots at 78 and 64 columns with content parity', () => {
    const state = createInitialState();

    const wide = render(<TitleScreen state={state} terminalColumnsOverride={78} />);
    const wideOutput = stripAnsi(wide.lastFrame() ?? '');
    expect(wideOutput).toMatchSnapshot('title-78');

    const narrow = render(<TitleScreen state={state} terminalColumnsOverride={64} />);
    const narrowOutput = stripAnsi(narrow.lastFrame() ?? '');
    expect(narrowOutput).toMatchSnapshot('title-64');

    expectOutputTokens(wideOutput, [
      'COMMAND CORE',
      ':: COMMAND CORE ONLINE ::',
      'Any key: Choose mode',
      'Q: Quit'
    ]);
  });

  test('TitleScreen fade-in animation changes output during first 10 frames', () => {
    const state = createInitialState();
    const start = render(<TitleScreen state={{ ...state, frame: 0 }} terminalColumnsOverride={78} />);
    const end = render(<TitleScreen state={{ ...state, frame: 10 }} terminalColumnsOverride={78} />);

    expect(start.lastFrame()).not.toBe(end.lastFrame());
  });

  test('ModeSelectScreen snapshots at 78 and 64 columns with content parity', () => {
    const state = { ...createInitialState(), phase: 'MODE_SELECT' as const, menuCursor: 0 };

    const wide = render(<ModeSelectScreen state={state} terminalColumnsOverride={78} />);
    const wideOutput = stripAnsi(wide.lastFrame() ?? '');
    expect(wideOutput).toMatchSnapshot('mode-select-78');

    const narrow = render(<ModeSelectScreen state={state} terminalColumnsOverride={64} />);
    const narrowOutput = stripAnsi(narrow.lastFrame() ?? '');
    expect(narrowOutput).toMatchSnapshot('mode-select-64');

    expectOutputTokens(wideOutput, [
      'COMMAND CORE',
      '[1] OPERATIONS',
      '[2] ANOMALY',
      'Enter: Confirm',
      'Q: Quit'
    ]);
  });

  test('MapSelectScreen snapshots at 78 and 64 columns with content parity', () => {
    const state = { ...createInitialState(), phase: 'MAP_SELECT' as const, menuCursor: 0 };

    const wide = render(<MapSelectScreen state={state} terminalColumnsOverride={78} />);
    const wideOutput = stripAnsi(wide.lastFrame() ?? '');
    expect(wideOutput).toMatchSnapshot('map-select-78');

    const narrow = render(<MapSelectScreen state={state} terminalColumnsOverride={64} />);
    const narrowOutput = stripAnsi(narrow.lastFrame() ?? '');
    expect(narrowOutput).toMatchSnapshot('map-select-64');

    expectOutputTokens(wideOutput, [
      'OPERATIONS MAP SELECT',
      '[1] Crossroads',
      '[10] Ouroboros',
      '[★★★★ Expert]',
      'Esc/B: Back'
    ]);
  });

  test('VictoryScreen snapshots at 78 and 64 columns with content parity', () => {
    const state = {
      ...createInitialState(),
      phase: 'VICTORY' as const,
      frame: 8,
      enemiesKilled: 18,
      currency: 305
    };
    const wide = render(<EndStateScreen state={state} variant="victory" terminalColumnsOverride={78} />);
    const wideOutput = stripAnsi(wide.lastFrame() ?? '');
    expect(wideOutput).toMatchSnapshot('victory-78');

    const narrow = render(<EndStateScreen state={state} variant="victory" terminalColumnsOverride={64} />);
    const narrowOutput = stripAnsi(narrow.lastFrame() ?? '');
    expect(narrowOutput).toMatchSnapshot('victory-64');

    expectOutputTokens(wideOutput, [
      'All waves cleared. Base secured.',
      'Enemies killed: 18',
      'Gold remaining: 305',
      'Score: 2021',
      'R: New Run',
      'Q: Quit'
    ]);
  });

  test('GameOverScreen snapshots at 78 and 64 columns with content parity', () => {
    const state = {
      ...createInitialState(),
      phase: 'GAME_OVER' as const,
      frame: 8,
      enemiesKilled: 7,
      currency: 220
    };
    const wide = render(<EndStateScreen state={state} variant="game-over" terminalColumnsOverride={78} />);
    const wideOutput = stripAnsi(wide.lastFrame() ?? '');
    expect(wideOutput).toMatchSnapshot('game-over-78');

    const narrow = render(<EndStateScreen state={state} variant="game-over" terminalColumnsOverride={64} />);
    const narrowOutput = stripAnsi(narrow.lastFrame() ?? '');
    expect(narrowOutput).toMatchSnapshot('game-over-64');

    expectOutputTokens(wideOutput, [
      'Base destroyed. Mission failed.',
      'Enemies killed: 7',
      'Gold remaining: 220',
      'Score: 304',
      'R: New Run',
      'Q: Quit'
    ]);
  });
});
