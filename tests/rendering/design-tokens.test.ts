import { afterEach, describe, expect, test } from 'vitest';
import chalk from 'chalk';
import { tokenGridSymbol, type GridEntityClass } from '../../src/rendering/design-tokens';

const GRID_ENTITY_CLASSES: GridEntityClass[] = [
  'PATH',
  'BUILDABLE',
  'BLOCKED',
  'SPAWN',
  'BASE',
  'RAPID_TOWER',
  'CANNON_TOWER',
  'SNIPER_TOWER',
  'SLOW_TOWER',
  'RAPID_PROJ',
  'CANNON_PROJ',
  'SNIPER_PROJ',
  'SLOW_PROJ',
  'STANDARD_ENEMY',
  'TANK_ENEMY',
  'FAST_ENEMY',
  'BRUTE_ENEMY',
  'COLOSSUS_ENEMY',
  'CURSOR'
];

const previousForceColor = process.env.FORCE_COLOR;
const previousChalkLevel = chalk.level;

afterEach(() => {
  if (previousForceColor === undefined) {
    delete process.env.FORCE_COLOR;
  } else {
    process.env.FORCE_COLOR = previousForceColor;
  }
  chalk.level = previousChalkLevel;
});

describe('design token snapshots (FORCE_COLOR=3)', () => {
  test('locks tokenGridSymbol color chains across classes and hp buckets', () => {
    process.env.FORCE_COLOR = '3';
    chalk.level = 3;

    const snapshotData = GRID_ENTITY_CLASSES.map((entityClass) => {
      return {
        entityClass,
        hp0: tokenGridSymbol('▸', entityClass, 0),
        hp50: tokenGridSymbol('▸', entityClass, 0.5),
        hp100: tokenGridSymbol('▸', entityClass, 1)
      };
    });

    expect(snapshotData).toMatchSnapshot();
  });
});
