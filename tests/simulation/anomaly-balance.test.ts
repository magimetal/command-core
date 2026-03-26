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

  test('anomaly wave HP pressure stays below operations map 01 baseline for seed 7', () => {
    const operations = createOperationsRunConfig(OPERATIONS_MAP_DEFS[0]);
    const anomaly = generateAnomalyRunConfig(7);

    const totalWaveHp = (waves: typeof operations.waves): number => {
      return waves.reduce((waveSum, wave) => {
        const waveHp = wave.enemies.reduce((groupSum, group) => {
          return groupSum + ENEMY_DEFS[group.archetype].maxHp * group.count;
        }, 0);
        return waveSum + waveHp;
      }, 0);
    };

    expect(totalWaveHp(anomaly.waves)).toBeLessThan(totalWaveHp(operations.waves));
  });
});
