export enum EnemyArchetype {
  STANDARD = 'STANDARD',
  TANK = 'TANK',
  FAST = 'FAST',
  BRUTE = 'BRUTE',
  COLOSSUS = 'COLOSSUS'
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
    symbol: 'S',
    maxHp: 10,
    speed: 2,
    reward: 10,
    leakDamage: 1
  },
  [EnemyArchetype.TANK]: {
    displayName: 'Tank',
    symbol: 'T',
    maxHp: 40,
    speed: 4,
    reward: 25,
    leakDamage: 3
  },
  [EnemyArchetype.FAST]: {
    displayName: 'Fast',
    symbol: 'F',
    maxHp: 5,
    speed: 1,
    reward: 4,
    leakDamage: 2
  },
  [EnemyArchetype.BRUTE]: {
    displayName: 'Brute',
    symbol: 'B',
    maxHp: 80,
    speed: 5,
    reward: 28,
    leakDamage: 5
  },
  [EnemyArchetype.COLOSSUS]: {
    displayName: 'Colossus',
    symbol: 'C',
    maxHp: 150,
    speed: 7,
    reward: 40,
    leakDamage: 8
  }
};

export const getEnemyDisplayName = (archetype: EnemyArchetype): string => {
  return ENEMY_DEFS[archetype].displayName;
};
