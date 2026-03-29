import { ENEMY_GLYPH_REGISTRY } from './glyphs';

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
  symbolFallback: string;
  maxHp: number;
  speed: number;
  reward: number;
  leakDamage: number;
}

export const ENEMY_DEFS: Record<EnemyArchetype, EnemyDef> = {
  [EnemyArchetype.STANDARD]: {
    displayName: 'Standard',
    symbol: ENEMY_GLYPH_REGISTRY.STANDARD.primary,
    symbolFallback: ENEMY_GLYPH_REGISTRY.STANDARD.fallback,
    maxHp: 10,
    speed: 2,
    reward: 10,
    leakDamage: 1
  },
  [EnemyArchetype.TANK]: {
    displayName: 'Tank',
    symbol: ENEMY_GLYPH_REGISTRY.TANK.primary,
    symbolFallback: ENEMY_GLYPH_REGISTRY.TANK.fallback,
    maxHp: 40,
    speed: 4,
    reward: 25,
    leakDamage: 3
  },
  [EnemyArchetype.FAST]: {
    displayName: 'Fast',
    symbol: ENEMY_GLYPH_REGISTRY.FAST.primary,
    symbolFallback: ENEMY_GLYPH_REGISTRY.FAST.fallback,
    maxHp: 5,
    speed: 1,
    reward: 4,
    leakDamage: 2
  },
  [EnemyArchetype.BRUTE]: {
    displayName: 'Brute',
    symbol: ENEMY_GLYPH_REGISTRY.BRUTE.primary,
    symbolFallback: ENEMY_GLYPH_REGISTRY.BRUTE.fallback,
    maxHp: 80,
    speed: 5,
    reward: 28,
    leakDamage: 5
  },
  [EnemyArchetype.COLOSSUS]: {
    displayName: 'Colossus',
    symbol: ENEMY_GLYPH_REGISTRY.COLOSSUS.primary,
    symbolFallback: ENEMY_GLYPH_REGISTRY.COLOSSUS.fallback,
    maxHp: 150,
    speed: 7,
    reward: 40,
    leakDamage: 8
  }
};

export const getEnemyDisplayName = (archetype: EnemyArchetype): string => {
  return ENEMY_DEFS[archetype].displayName;
};

export const getEnemySymbol = (
  archetype: EnemyArchetype,
  options: { reducedGlyph?: boolean } = {}
): string => {
  const def = ENEMY_DEFS[archetype];
  return options.reducedGlyph ? def.symbolFallback : def.symbol;
};
