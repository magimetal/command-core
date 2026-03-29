import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { TowerArchetype } from '../../src/const/towers';
import { CellType, type Cell } from '../../src/models/cell';
import { resolveCombat } from '../../src/simulation/combat';
import { createEnemy, createState, createTower, pos } from '../helpers/builders';

const createBuildableGrid = (): Cell[][] => {
  return Array.from({ length: 16 }, () =>
    Array.from({ length: 34 }, () => ({ type: CellType.BUILDABLE }))
  );
};

describe('combat line of sight', () => {
  test('obstacle blocks line of sight', () => {
    const grid = createBuildableGrid();
    grid[2][4] = { type: CellType.BLOCKED };

    const state = createState({
      grid,
      towers: [createTower({ id: 'tower-los-1', archetype: TowerArchetype.SNIPER, pos: pos(2, 2) })],
      enemies: [
        createEnemy({
          id: 'enemy-los-1',
          archetype: EnemyArchetype.STANDARD,
          pos: pos(6, 2),
          hp: 10,
          maxHp: 10
        })
      ]
    });

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBe(10);
  });

  test('clear line of sight fires normally', () => {
    const state = createState({
      grid: createBuildableGrid(),
      towers: [createTower({ id: 'tower-los-2', archetype: TowerArchetype.SNIPER, pos: pos(2, 2) })],
      enemies: [createEnemy({ id: 'enemy-los-2', archetype: EnemyArchetype.STANDARD, pos: pos(6, 2) })]
    });

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBeLessThan(10);
  });

  test('PATH cell does not block line of sight', () => {
    const grid = createBuildableGrid();
    grid[2][4] = { type: CellType.PATH };

    const state = createState({
      grid,
      towers: [createTower({ id: 'tower-los-3', archetype: TowerArchetype.SNIPER, pos: pos(2, 2) })],
      enemies: [createEnemy({ id: 'enemy-los-3', archetype: EnemyArchetype.STANDARD, pos: pos(6, 2) })]
    });

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBeLessThan(10);
  });

  test('row/col swap canary: vertical obstacle blocks correctly', () => {
    const grid = createBuildableGrid();
    grid[6][2] = { type: CellType.BLOCKED };

    const state = createState({
      grid,
      towers: [createTower({ id: 'tower-los-4', archetype: TowerArchetype.SNIPER, pos: pos(2, 4) })],
      enemies: [createEnemy({ id: 'enemy-los-4', archetype: EnemyArchetype.STANDARD, pos: pos(2, 8) })]
    });

    const result = resolveCombat(state);

    expect(result.enemies[0].hp).toBe(10);
  });
});
