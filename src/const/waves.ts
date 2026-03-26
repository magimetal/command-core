import { EnemyArchetype } from './enemies';

interface WaveEnemyGroup {
  archetype: EnemyArchetype;
  count: number;
  spawnIntervalTicks: number;
}

interface WaveDefinition {
  enemies: WaveEnemyGroup[];
}

export const WAVES: WaveDefinition[] = [
  {
    enemies: [{ archetype: EnemyArchetype.STANDARD, count: 5, spawnIntervalTicks: 15 }]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 8, spawnIntervalTicks: 12 },
      { archetype: EnemyArchetype.FAST, count: 3, spawnIntervalTicks: 10 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 6, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.TANK, count: 2, spawnIntervalTicks: 20 },
      { archetype: EnemyArchetype.FAST, count: 5, spawnIntervalTicks: 8 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 8 },
      { archetype: EnemyArchetype.TANK, count: 4, spawnIntervalTicks: 18 },
      { archetype: EnemyArchetype.FAST, count: 6, spawnIntervalTicks: 7 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 8, spawnIntervalTicks: 6 },
      { archetype: EnemyArchetype.TANK, count: 6, spawnIntervalTicks: 15 },
      { archetype: EnemyArchetype.FAST, count: 10, spawnIntervalTicks: 5 }
    ]
  }
];
