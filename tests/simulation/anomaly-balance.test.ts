import { describe, expect, test } from 'vitest';
import { ENEMY_DEFS } from '../../src/const/enemies';
import { createOperationsRunConfig, OPERATIONS_MAP_DEFS } from '../../src/const/operations-maps';
import { getTowerDef } from '../../src/const/towers';
import { generateAnomalyRunConfig } from '../../src/simulation/anomaly-gen';

describe('anomaly balance guardrails', () => {
  test('seeded pools are deterministic per seed', () => {
    for (let seed = 0; seed < 10; seed += 1) {
      const first = generateAnomalyRunConfig(seed);
      const second = generateAnomalyRunConfig(seed);

      expect(first.availableTowers).toEqual(second.availableTowers);
    }
  });

  test('starting currency can buy at least one tower from anomaly pool', () => {
    for (let seed = 0; seed < 10; seed += 1) {
      const config = generateAnomalyRunConfig(seed);
      const cheapestCost = Math.min(...config.availableTowers.map((archetype) => getTowerDef(archetype).cost));

      expect(cheapestCost).toBeLessThanOrEqual(config.startingCurrency);
    }
  });

  test('anomaly starts with more forgiveness than operations baseline', () => {
    const operations = createOperationsRunConfig(OPERATIONS_MAP_DEFS[0]);
    const anomaly = generateAnomalyRunConfig(7);

    expect(anomaly.startingCurrency).toBeGreaterThan(operations.startingCurrency);
    expect(anomaly.startingBaseHp).toBeGreaterThan(operations.startingBaseHp);
  });

  test('anomaly wave HP pressure stays below operations baseline for first 6 waves', () => {
    const operations = createOperationsRunConfig(OPERATIONS_MAP_DEFS[0]);
    const anomaly = generateAnomalyRunConfig(7);

    const totalWaveHp = (waves: typeof operations.waves, maxWaves: number): number => {
      return waves.slice(0, maxWaves).reduce((waveSum, wave) => {
        const waveHp = wave.enemies.reduce((groupSum, group) => {
          return groupSum + ENEMY_DEFS[group.archetype].maxHp * group.count;
        }, 0);
        return waveSum + waveHp;
      }, 0);
    };

    // Compare first 6 waves only since Anomaly now has 15-20
    expect(totalWaveHp(anomaly.waves, 6)).toBeLessThan(totalWaveHp(operations.waves, 6));
  });

  test('late-game waves have appropriate challenge scaling', () => {
    const config = generateAnomalyRunConfig(7);

    if (config.waves.length >= 15) {
      const wave1Count = config.waves[0].enemies.reduce((sum, g) => sum + g.count, 0);
      const wave15Count = config.waves[14].enemies.reduce((sum, g) => sum + g.count, 0);

      // Wave 15 should have 5-15x more enemies than wave 1
      expect(wave15Count).toBeGreaterThan(wave1Count * 5);
      expect(wave15Count).toBeLessThan(wave1Count * 15);
    }
  });
});
