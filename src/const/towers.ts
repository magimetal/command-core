export enum TowerArchetype {
  RAPID = 'RAPID',
  CANNON = 'CANNON',
  SNIPER = 'SNIPER',
  SLOW = 'SLOW'
}

export interface TowerDef {
  symbol: string;
  projectileSymbol: string;
  damage: number;
  range: number;
  cooldownTicks: number;
  cost: number;
  slowDurationTicks: number;
}

export const TOWER_DEFS: Record<TowerArchetype, TowerDef> = {
  [TowerArchetype.RAPID]: {
    symbol: '⟁',
    projectileSymbol: '·',
    damage: 1,
    range: 3,
    cooldownTicks: 2,
    cost: 50,
    slowDurationTicks: 0
  },
  [TowerArchetype.CANNON]: {
    symbol: '⊛',
    projectileSymbol: '●',
    damage: 5,
    range: 6,
    cooldownTicks: 10,
    cost: 100,
    slowDurationTicks: 0
  },
  [TowerArchetype.SNIPER]: {
    symbol: '⟇',
    projectileSymbol: '◦',
    damage: 8,
    range: 8,
    cooldownTicks: 15,
    cost: 150,
    slowDurationTicks: 0
  },
  [TowerArchetype.SLOW]: {
    symbol: '⊗',
    projectileSymbol: '~',
    damage: 2,
    range: 4,
    cooldownTicks: 6,
    cost: 75,
    slowDurationTicks: 3
  }
};

export const getTowerDef = (archetype: TowerArchetype): TowerDef => {
  if (archetype === TowerArchetype.RAPID) {
    return TOWER_DEFS[TowerArchetype.RAPID];
  }

  if (archetype === TowerArchetype.SNIPER) {
    return TOWER_DEFS[TowerArchetype.SNIPER];
  }

  if (archetype === TowerArchetype.SLOW) {
    return TOWER_DEFS[TowerArchetype.SLOW];
  }

  return TOWER_DEFS[TowerArchetype.CANNON];
};
