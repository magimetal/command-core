export enum EnemyArchetype {
  STANDARD = 'STANDARD',
  TANK = 'TANK',
  FAST = 'FAST'
}

export interface EnemyDef {
  symbol: string;
  maxHp: number;
  speed: number;
  reward: number;
  leakDamage: number;
}

export const ENEMY_DEFS: Record<EnemyArchetype, EnemyDef> = {
  [EnemyArchetype.STANDARD]: {
    symbol: '◀',
    maxHp: 10,
    speed: 2,
    reward: 10,
    leakDamage: 1
  },
  [EnemyArchetype.TANK]: {
    symbol: '⬟',
    maxHp: 40,
    speed: 4,
    reward: 25,
    leakDamage: 3
  },
  [EnemyArchetype.FAST]: {
    symbol: '▷',
    maxHp: 5,
    speed: 1,
    reward: 15,
    leakDamage: 2
  }
};
