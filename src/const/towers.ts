export enum TowerArchetype {
  RAPID = 'RAPID',
  CANNON = 'CANNON'
}

export interface TowerDef {
  symbol: string;
  damage: number;
  range: number;
  cooldownTicks: number;
  cost: number;
}

export const TOWER_DEFS: Record<TowerArchetype, TowerDef> = {
  [TowerArchetype.RAPID]: {
    symbol: '△',
    damage: 1,
    range: 3,
    cooldownTicks: 2,
    cost: 50
  },
  [TowerArchetype.CANNON]: {
    symbol: '◉',
    damage: 5,
    range: 6,
    cooldownTicks: 10,
    cost: 100
  }
};

export const getTowerDef = (archetype: TowerArchetype): TowerDef => {
  if (archetype === TowerArchetype.RAPID) {
    return TOWER_DEFS[TowerArchetype.RAPID];
  }

  return TOWER_DEFS[TowerArchetype.CANNON];
};
