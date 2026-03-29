import { EnemyArchetype } from './enemies';

interface WaveEnemyGroup {
  archetype: EnemyArchetype;
  count: number;
  spawnIntervalTicks: number;
}

export interface WaveDefinition {
  enemies: WaveEnemyGroup[];
}

export const CROSSROADS_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 7, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.FAST, count: 1, spawnIntervalTicks: 12 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 9, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 5, spawnIntervalTicks: 9 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 7, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.TANK, count: 3, spawnIntervalTicks: 17 },
      { archetype: EnemyArchetype.FAST, count: 6, spawnIntervalTicks: 7 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 11, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.TANK, count: 5, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.FAST, count: 7, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 7, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.FAST, count: 11, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 12, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 8, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 13, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 14, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 9, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 15, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 16, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 11, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 18, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 19, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 13, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 21, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 2, spawnIntervalTicks: 18 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 28 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 21, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 15, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 25, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 3, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 26 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 24, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 18, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 29, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 4, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 24 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 26, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 21, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 34, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 29, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 24, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 39, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 6, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 32, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 28, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 45, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 7, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 36, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 33, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 52, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 20 }
    ]
  }
];

export const GAUNTLET_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 8, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.FAST, count: 2, spawnIntervalTicks: 11 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 6, spawnIntervalTicks: 8 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 8, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.TANK, count: 4, spawnIntervalTicks: 17 },
      { archetype: EnemyArchetype.FAST, count: 7, spawnIntervalTicks: 7 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 13, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.TANK, count: 6, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.FAST, count: 8, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 11, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 8, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.FAST, count: 12, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 13, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 9, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 14, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 15, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 10, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 16, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 17, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 12, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 19, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 20, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 14, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 22, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 2, spawnIntervalTicks: 18 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 28 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 22, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 16, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 26, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 3, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 26 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 25, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 19, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 30, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 4, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 24 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 27, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 22, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 35, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 30, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 25, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 40, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 6, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 33, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 29, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 46, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 7, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 37, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 34, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 53, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 20 }
    ]
  }
];

export const PERIMETER_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 6, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.FAST, count: 1, spawnIntervalTicks: 12 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 8, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 3, spawnIntervalTicks: 9 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 8, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.TANK, count: 2, spawnIntervalTicks: 17 },
      { archetype: EnemyArchetype.FAST, count: 4, spawnIntervalTicks: 8 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.TANK, count: 4, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.FAST, count: 6, spawnIntervalTicks: 7 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 11, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.TANK, count: 5, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.FAST, count: 8, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 13, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 6, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 10, spawnIntervalTicks: 5 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 15, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 7, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 12, spawnIntervalTicks: 5 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 17, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 9, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 15, spawnIntervalTicks: 5 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 20, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 11, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 18, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.BRUTE, count: 2, spawnIntervalTicks: 18 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 28 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 22, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 13, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 22, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.BRUTE, count: 2, spawnIntervalTicks: 17 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 27 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 25, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 16, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 26, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.BRUTE, count: 3, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 25 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 27, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 19, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 31, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.BRUTE, count: 4, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 24 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 30, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 22, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 36, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 33, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 26, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 42, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.BRUTE, count: 6, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 21 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 37, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 31, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 49, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.BRUTE, count: 7, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 20 }
    ]
  }
];

export const ZIGZAG_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 7, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.FAST, count: 2, spawnIntervalTicks: 11 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 9, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 4, spawnIntervalTicks: 8 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 8, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.TANK, count: 3, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.FAST, count: 6, spawnIntervalTicks: 7 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 11, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.TANK, count: 5, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.FAST, count: 7, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 12, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.TANK, count: 6, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 9, spawnIntervalTicks: 5 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 14, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 7, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 11, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 16, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 8, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 13, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 18, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 10, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 16, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 21, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 12, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 19, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.BRUTE, count: 2, spawnIntervalTicks: 18 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 28 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 23, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 14, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 23, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 3, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 26 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 26, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 17, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 27, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 4, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 24 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 28, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 20, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 32, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 31, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 23, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 37, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 6, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 34, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 27, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 43, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 7, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 38, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 32, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 50, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 20 }
    ]
  }
];

export const COIL_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 3, spawnIntervalTicks: 10 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.TANK, count: 3, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.FAST, count: 5, spawnIntervalTicks: 8 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 11, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.TANK, count: 4, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.FAST, count: 10, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 12, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.TANK, count: 6, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 14, spawnIntervalTicks: 5 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 12, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 8, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 17, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 14, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 9, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 19, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 16, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 10, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 21, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 18, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 12, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 24, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 21, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 14, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 27, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 3, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 26 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 23, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 16, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 31, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 4, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 24 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 26, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 19, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 35, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 23 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 28, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 22, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 40, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 31, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 25, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 45, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 6, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 21 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 34, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 29, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 51, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 7, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 38, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 34, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 58, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 20 }
    ]
  }
];

export const REVERSE_RUN_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 8, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 4, spawnIntervalTicks: 10 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.TANK, count: 2, spawnIntervalTicks: 17 },
      { archetype: EnemyArchetype.FAST, count: 5, spawnIntervalTicks: 8 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 12, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.TANK, count: 4, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.FAST, count: 6, spawnIntervalTicks: 7 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 14, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.TANK, count: 6, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.FAST, count: 8, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 15, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.TANK, count: 8, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.FAST, count: 10, spawnIntervalTicks: 5 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 17, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 9, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 12, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 19, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 10, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 14, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 21, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 12, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 17, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 24, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 14, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 20, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.BRUTE, count: 3, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 26 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 26, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 16, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 24, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 4, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 24 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 29, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 19, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 28, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 23 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 31, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 22, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 33, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 34, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 25, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 38, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 6, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 21 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 37, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 29, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 44, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 7, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 41, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 34, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 51, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 20 }
    ]
  }
];

export const LABYRINTH_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 5, spawnIntervalTicks: 10 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 12, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.TANK, count: 3, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.FAST, count: 7, spawnIntervalTicks: 8 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 12, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.TANK, count: 5, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.FAST, count: 11, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 13, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.TANK, count: 8, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 14, spawnIntervalTicks: 5 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 14, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 10, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 16, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 16, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 11, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 18, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 18, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 12, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 20, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 20, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 14, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 23, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 23, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 16, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 26, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 3, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 26 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 25, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 18, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 30, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 4, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 24 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 28, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 21, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 34, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 23 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 30, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 24, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 39, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 33, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 27, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 44, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 6, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 21 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 36, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 31, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 50, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 7, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 40, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 36, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 57, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 20 }
    ]
  }
];

export const CRUCIBLE_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.TANK, count: 2, spawnIntervalTicks: 18 },
      { archetype: EnemyArchetype.FAST, count: 6, spawnIntervalTicks: 9 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 12, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.TANK, count: 4, spawnIntervalTicks: 16 },
      { archetype: EnemyArchetype.FAST, count: 8, spawnIntervalTicks: 7 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 13, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.TANK, count: 6, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.FAST, count: 11, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 14, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.TANK, count: 9, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 14, spawnIntervalTicks: 5 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 15, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 11, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 16, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 17, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 12, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 18, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 19, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 13, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 20, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 21, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 15, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 23, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 24, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 17, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 26, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 3, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 25 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 26, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 19, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 30, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 4, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 23 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 29, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 22, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 34, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 31, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 25, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 39, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 6, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 21 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 34, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 28, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 44, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 7, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 37, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 32, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 50, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 41, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 37, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 57, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 18 }
    ]
  }
];

export const BLITZ_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 12, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.TANK, count: 2, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.FAST, count: 6, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 14, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.TANK, count: 4, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 10, spawnIntervalTicks: 5 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 16, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.TANK, count: 7, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 13, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 18, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 10, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 16, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 20, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 12, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 20, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 22, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 13, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 22, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 24, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 14, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 24, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 26, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 16, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 27, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 29, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 18, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 30, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 3, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 25 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 31, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 20, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 34, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 4, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 23 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 34, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 23, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 38, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 36, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 26, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 43, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 6, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 21 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 39, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 29, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 48, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 7, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 42, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 33, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 54, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 46, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 38, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 61, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 18 }
    ]
  }
];

export const OUROBOROS_WAVES: WaveDefinition[] = [
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 11, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.TANK, count: 2, spawnIntervalTicks: 14 },
      { archetype: EnemyArchetype.FAST, count: 5, spawnIntervalTicks: 7 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 13, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.TANK, count: 4, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 10, spawnIntervalTicks: 6 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 14, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.TANK, count: 7, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.FAST, count: 14, spawnIntervalTicks: 5 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 16, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.TANK, count: 10, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.FAST, count: 17, spawnIntervalTicks: 4 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 17, spawnIntervalTicks: 4 },
      { archetype: EnemyArchetype.TANK, count: 12, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.FAST, count: 22, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 19, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 13, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 24, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 21, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 14, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 26, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 23, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 16, spawnIntervalTicks: 7 },
      { archetype: EnemyArchetype.FAST, count: 29, spawnIntervalTicks: 3 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 26, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 18, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 32, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 3, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.COLOSSUS, count: 1, spawnIntervalTicks: 25 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 28, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 20, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 36, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 4, spawnIntervalTicks: 13 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 23 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 31, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 23, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.FAST, count: 40, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 5, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.COLOSSUS, count: 2, spawnIntervalTicks: 22 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 33, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 26, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 45, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 6, spawnIntervalTicks: 11 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 21 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 36, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 29, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 50, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 7, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 3, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 39, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 33, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 56, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 43, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.TANK, count: 38, spawnIntervalTicks: 5 },
      { archetype: EnemyArchetype.FAST, count: 63, spawnIntervalTicks: 3 },
      { archetype: EnemyArchetype.BRUTE, count: 8, spawnIntervalTicks: 9 },
      { archetype: EnemyArchetype.COLOSSUS, count: 4, spawnIntervalTicks: 18 }
    ]
  }
];
