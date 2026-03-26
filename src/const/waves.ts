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
  }
];
