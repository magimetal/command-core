import { EnemyArchetype } from '../../src/const/enemies';
import { TowerArchetype } from '../../src/const/towers';
import type { Enemy } from '../../src/models/enemy';
import type { GameState } from '../../src/models/game-state';
import type { Tower } from '../../src/models/tower';
import { createInitialState } from '../../src/simulation/create-initial-state';

export const pos = (col: number, row: number): [number, number] => {
  return [col, row];
};

export const createEnemy = (overrides: Partial<Enemy> = {}): Enemy => {
  return {
    id: 'enemy-test',
    archetype: EnemyArchetype.STANDARD,
    pos: pos(0, 0),
    pathIndex: 0,
    hp: 10,
    maxHp: 10,
    moveCooldown: 1,
    dead: false,
    ...overrides
  };
};

export const createTower = (overrides: Partial<Tower> = {}): Tower => {
  return {
    id: 'tower-test',
    archetype: TowerArchetype.RAPID,
    pos: pos(0, 0),
    cooldownRemaining: 0,
    kills: 0,
    ...overrides
  };
};

export const createState = (overrides: Partial<GameState> = {}): GameState => {
  return {
    ...createInitialState(),
    ...overrides
  };
};
