import { describe, expect, test } from 'vitest';
import { createOperationsRunConfig, OPERATIONS_MAP_DEFS } from '../../src/const/operations-maps';
import { generateAnomalyRunConfig } from '../../src/simulation/anomaly-gen';

const isAdjacent = (a: [number, number], b: [number, number]): boolean => {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
};

describe('generateAnomalyRunConfig', () => {
  test('generates structurally valid anomaly runs for seeds 0-49', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const config = generateAnomalyRunConfig(seed);
      const path = config.enemyPath;

      expect(path.length).toBeGreaterThanOrEqual(56);
      expect(config.availableTowers.length).toBe(3);
      expect(config.waves.length).toBeGreaterThanOrEqual(4);
      expect(config.waves.length).toBeLessThanOrEqual(6);

      const [spawnCol, spawnRow] = path[0];
      const [baseCol, baseRow] = path[path.length - 1];
      expect([spawnCol, spawnRow]).not.toEqual([baseCol, baseRow]);

      for (let index = 1; index < path.length; index += 1) {
        expect(isAdjacent(path[index - 1], path[index])).toBe(true);
      }

      path.forEach(([col, row]) => {
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThanOrEqual(15);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThanOrEqual(33);
      });

      const rowsVisited = new Set(path.map(([, row]) => row));
      expect(rowsVisited.size).toBeGreaterThanOrEqual(8);
    }
  });

  test('produces at least three distinct path shapes across seeds 0-49', () => {
    const signatures = new Set<string>();

    for (let seed = 0; seed < 50; seed += 1) {
      const config = generateAnomalyRunConfig(seed);
      const signature = config.enemyPath
        .slice(0, 10)
        .map(([col, row]) => `${col}:${row}`)
        .join('|');
      signatures.add(signature);
    }

    expect(signatures.size).toBeGreaterThanOrEqual(3);
  });

  test('falls back to operations map 01 path when path retries fail', () => {
    const fallbackPath = createOperationsRunConfig(OPERATIONS_MAP_DEFS[0]).enemyPath;
    const config = generateAnomalyRunConfig(1234, {
      pathBuilder: () => null
    });

    expect(config.enemyPath).toEqual(fallbackPath);
    expect(config.mode).toBe('ANOMALY');
  });
});
