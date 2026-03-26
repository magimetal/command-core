import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { tick } from '../../src/simulation/tick';

describe('end-state handling', () => {
  test('transitions to GAME_OVER when base HP drops to 0 or below', () => {
    const enemyPath = createInitialState().runConfig.enemyPath;
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      baseHp: 1,
      spawnQueue: [],
      enemies: [
        {
          id: 'enemy-leak',
          archetype: EnemyArchetype.STANDARD,
          pos: enemyPath[enemyPath.length - 2],
          pathIndex: enemyPath.length - 2,
          hp: 10,
          maxHp: 10,
          moveCooldown: 1,
          dead: false
        }
      ]
    };

    const result = tick(state);

    expect(result.baseHp).toBe(0);
    expect(result.phase).toBe('GAME_OVER');
  });

  test('tick is a no-op in terminal states', () => {
    const gameOverState = {
      ...createInitialState(),
      phase: 'GAME_OVER' as const,
      frame: 10
    };

    const victoryState = {
      ...createInitialState(),
      phase: 'VICTORY' as const,
      frame: 15
    };

    expect(tick(gameOverState)).toEqual(gameOverState);
    expect(tick(victoryState)).toEqual(victoryState);
  });
});
