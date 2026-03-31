import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
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
      expect(config.waves.length).toBeGreaterThanOrEqual(15);
      expect(config.waves.length).toBeLessThanOrEqual(20);

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

  test('enemies follow archetype progression tiers', () => {
    let bruteAppeared = false;
    let colossusAppeared = false;

    for (let seed = 0; seed < 20; seed += 1) {
      const config = generateAnomalyRunConfig(seed);

      // Wave 1-2: Only STANDARD, FAST
      for (let i = 0; i < Math.min(2, config.waves.length); i++) {
        const archetypes = config.waves[i].enemies.map(e => e.archetype);
        expect(archetypes).not.toContain(EnemyArchetype.TANK);
        expect(archetypes).not.toContain(EnemyArchetype.BRUTE);
        expect(archetypes).not.toContain(EnemyArchetype.COLOSSUS);
      }

      // Wave 8+: BRUTE may appear (waveIndex >= 7 means wave 8)
      if (config.waves.length > 7) {
        const lateWaveArchetypes = config.waves.slice(7).flatMap(w => w.enemies.map(e => e.archetype));
        if (lateWaveArchetypes.includes(EnemyArchetype.BRUTE)) {
          bruteAppeared = true;
        }
      }

      // Wave 9+: COLOSSUS may appear (waveIndex >= 8 means wave 9)
      if (config.waves.length > 8) {
        const veryLateWaveArchetypes = config.waves.slice(8).flatMap(w => w.enemies.map(e => e.archetype));
        if (veryLateWaveArchetypes.includes(EnemyArchetype.COLOSSUS)) {
          colossusAppeared = true;
        }
      }
    }

    // BRUTE and COLOSSUS should appear at least once across the 20-seed sample
    expect(bruteAppeared).toBe(true);
    expect(colossusAppeared).toBe(true);
  });

  test('spawn intervals are archetype-appropriate', () => {
    for (let seed = 0; seed < 10; seed += 1) {
      const config = generateAnomalyRunConfig(seed);

      for (const wave of config.waves) {
        for (const group of wave.enemies) {
          switch (group.archetype) {
            case EnemyArchetype.FAST:
              expect(group.spawnIntervalTicks).toBeGreaterThanOrEqual(3);
              expect(group.spawnIntervalTicks).toBeLessThanOrEqual(7);
              break;
            case EnemyArchetype.STANDARD:
              expect(group.spawnIntervalTicks).toBeGreaterThanOrEqual(3);
              expect(group.spawnIntervalTicks).toBeLessThanOrEqual(12);
              break;
            case EnemyArchetype.TANK:
              expect(group.spawnIntervalTicks).toBeGreaterThanOrEqual(9);
              expect(group.spawnIntervalTicks).toBeLessThanOrEqual(17);
              break;
            case EnemyArchetype.BRUTE:
              expect(group.spawnIntervalTicks).toBeGreaterThanOrEqual(10);
              expect(group.spawnIntervalTicks).toBeLessThanOrEqual(18);
              break;
            case EnemyArchetype.COLOSSUS:
              expect(group.spawnIntervalTicks).toBeGreaterThanOrEqual(18);
              expect(group.spawnIntervalTicks).toBeLessThanOrEqual(28);
              break;
          }
        }
      }
    }
  });
});
