export enum EnemyArchetype {
  STANDARD = 'STANDARD',
  TANK = 'TANK'
}

interface EnemyDef {
  symbol: string;
  maxHp: number;
  speed: number;
  reward: number;
  leakDamage: number;
}

export const ENEMY_DEFS: Record<EnemyArchetype, EnemyDef> = {
  [EnemyArchetype.STANDARD]: {
    symbol: '▸',
    maxHp: 10,
    speed: 2,
    reward: 10,
    leakDamage: 1
  },
  [EnemyArchetype.TANK]: {
    symbol: '◈',
    maxHp: 40,
    speed: 4,
    reward: 25,
    leakDamage: 3
  }
};
