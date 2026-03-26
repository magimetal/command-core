export enum EnemyArchetype {
  STANDARD = 'STANDARD',
  TANK = 'TANK',
  FAST = 'FAST'
}

export interface EnemyDef {
  displayName: string;
  symbol: string;
  maxHp: number;
  speed: number;
  reward: number;
  leakDamage: number;
}

export const ENEMY_DEFS: Record<EnemyArchetype, EnemyDef> = {
  [EnemyArchetype.STANDARD]: {
    displayName: 'Standard',
    symbol: '◀',
    maxHp: 10,
    speed: 2,
    reward: 10,
    leakDamage: 1
  },
  [EnemyArchetype.TANK]: {
    displayName: 'Tank',
    symbol: '⬟',
    maxHp: 40,
    speed: 4,
    reward: 25,
    leakDamage: 3
  },
  [EnemyArchetype.FAST]: {
    displayName: 'Fast',
    symbol: '▷',
    maxHp: 5,
    speed: 1,
    reward: 15,
    leakDamage: 2
  }
};

export const getEnemyDisplayName = (archetype: EnemyArchetype): string => {
  return ENEMY_DEFS[archetype].displayName;
};
