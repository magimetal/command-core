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
      { archetype: EnemyArchetype.TANK, count: 2, spawnIntervalTicks: 20 }
    ]
  },
  {
    enemies: [
      { archetype: EnemyArchetype.STANDARD, count: 10, spawnIntervalTicks: 10 },
      { archetype: EnemyArchetype.TANK, count: 5, spawnIntervalTicks: 18 }
    ]
  }
];
