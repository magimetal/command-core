import { describe, expect, test } from 'vitest';
import { TowerArchetype } from '../../src/const/towers';
import type { GridPos } from '../../src/models/cell';
import { generateAnomalyRunConfig } from '../../src/simulation/anomaly-gen';

interface GoldenSummary {
  firstWaypoints: GridPos[];
  towerPool: TowerArchetype[];
  waveCount: number;
  totalEnemyCountPerWave: number[];
}

const summarizeSeed = (seed: number): GoldenSummary => {
  const config = generateAnomalyRunConfig(seed);

  return {
    firstWaypoints: config.enemyPath.slice(0, 10),
    towerPool: config.availableTowers,
    waveCount: config.waves.length,
    totalEnemyCountPerWave: config.waves.map((wave) => wave.enemies.reduce((sum, group) => sum + group.count, 0))
  };
};

describe('anomaly-gen golden output', () => {
  test('seed 0 produces expected output', () => {
    expect(summarizeSeed(0)).toEqual({
      firstWaypoints: [
        [0, 4],
        [0, 5],
        [0, 6],
        [0, 7],
        [0, 8],
        [1, 8],
        [2, 8],
        [3, 8],
        [4, 8],
        [4, 9]
      ],
      towerPool: [TowerArchetype.RAPID, TowerArchetype.SNIPER, TowerArchetype.CANNON],
      waveCount: 16,
      totalEnemyCountPerWave: [9, 11, 11, 12, 12, 21, 29, 28, 33, 42, 39, 54, 82, 49, 76, 107]
    });
  });

  test('seed 7 produces expected output', () => {
    expect(summarizeSeed(7)).toEqual({
      firstWaypoints: [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
        [0, 7],
        [0, 8],
        [0, 9],
        [0, 10]
      ],
      towerPool: [TowerArchetype.SLOW, TowerArchetype.RAPID, TowerArchetype.CANNON],
      waveCount: 17,
      totalEnemyCountPerWave: [10, 10, 12, 13, 15, 24, 18, 24, 39, 32, 32, 62, 69, 55, 64, 94, 115]
    });
  });

  test('seed 42 produces expected output', () => {
    expect(summarizeSeed(42)).toEqual({
      firstWaypoints: [
        [0, 9],
        [1, 9],
        [2, 9],
        [3, 9],
        [4, 9],
        [5, 9],
        [6, 9],
        [7, 9],
        [8, 9],
        [9, 9]
      ],
      towerPool: [TowerArchetype.SLOW, TowerArchetype.SNIPER, TowerArchetype.RAPID],
      waveCount: 16,
      totalEnemyCountPerWave: [10, 11, 14, 15, 17, 20, 20, 24, 38, 45, 30, 43, 49, 101, 63, 75]
    });
  });
});
