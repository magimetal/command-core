import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { TowerArchetype } from '../../src/const/towers';
import type { Enemy } from '../../src/models/enemy';
import { stripAnsi } from '../../src/rendering/color-map';
import { composeHud } from '../../src/rendering/hud-composer';
import { getDisplayWidth } from '../../src/rendering/text-utils';
import { createInitialState } from '../../src/simulation/create-initial-state';
import { composeWaveDrainBar, getPriorityTarget, getSurgeState } from '../../src/utils/threat-radar';

const createEnemy = (overrides: Partial<Enemy> = {}): Enemy => {
  return {
    id: overrides.id ?? 'enemy-1',
    archetype: overrides.archetype ?? EnemyArchetype.STANDARD,
    pos: overrides.pos ?? [1, 2],
    pathIndex: overrides.pathIndex ?? 0,
    hp: overrides.hp ?? 10,
    maxHp: overrides.maxHp ?? 10,
    moveCooldown: overrides.moveCooldown ?? 2,
    dead: overrides.dead ?? false
  };
};

describe('threat radar hud', () => {
  test('composeWaveDrainBar shows correct filled/empty segments and count', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      wave: 1,
      spawnQueue: [
        { archetype: EnemyArchetype.STANDARD, spawnIntervalTicks: 1 },
        { archetype: EnemyArchetype.STANDARD, spawnIntervalTicks: 1 },
        { archetype: EnemyArchetype.STANDARD, spawnIntervalTicks: 1 },
        { archetype: EnemyArchetype.STANDARD, spawnIntervalTicks: 1 }
      ]
    };

    expect(composeWaveDrainBar(state)).toBe('█████░░░░░ 4/8');
  });

  test('getPriorityTarget returns enemy with highest pathIndex', () => {
    const state = {
      ...createInitialState(),
      enemies: [
        createEnemy({ id: 'enemy-a', pathIndex: 3 }),
        createEnemy({ id: 'enemy-b', pathIndex: 7 })
      ]
    };

    expect(getPriorityTarget(state)?.id).toBe('enemy-b');
  });

  test('getPriorityTarget tiebreaks by lowest hp', () => {
    const state = {
      ...createInitialState(),
      enemies: [
        createEnemy({ id: 'enemy-a', pathIndex: 5, hp: 8, maxHp: 10 }),
        createEnemy({ id: 'enemy-b', pathIndex: 5, hp: 4, maxHp: 10 })
      ]
    };

    expect(getPriorityTarget(state)?.id).toBe('enemy-b');
  });

  test('getSurgeState returns active=true when enemy count >= 6', () => {
    const state = {
      ...createInitialState(),
      enemies: Array.from({ length: 6 }, (_, index) => createEnemy({ id: `enemy-${index}` })),
      frame: 0
    };

    expect(getSurgeState(state).active).toBe(true);
  });

  test('getSurgeState returns active=false when enemy count < 6', () => {
    const state = {
      ...createInitialState(),
      enemies: Array.from({ length: 5 }, (_, index) => createEnemy({ id: `enemy-${index}` })),
      frame: 0
    };

    expect(getSurgeState(state).active).toBe(false);
  });

  test('composeHud always returns exactly 6 lines across PREP/WAVE_ACTIVE/WAVE_CLEAR', () => {
    const prep = { ...createInitialState(), phase: 'PREP' as const };
    const active = { ...createInitialState(), phase: 'WAVE_ACTIVE' as const };
    const clear = { ...createInitialState(), phase: 'WAVE_CLEAR' as const };

    expect(composeHud(prep).split('\n')).toHaveLength(6);
    expect(composeHud(active).split('\n')).toHaveLength(6);
    expect(composeHud(clear).split('\n')).toHaveLength(6);
  });

  test('line 4 is the thin ╌ divider', () => {
    const lines = stripAnsi(composeHud(createInitialState())).split('\n');

    expect(lines[3].startsWith('╌')).toBe(true);
  });

  test('WAVE_ACTIVE line 1 contains wide HP bar and gold section', () => {
    const state = { ...createInitialState(), phase: 'WAVE_ACTIVE' as const };
    const line = stripAnsi(composeHud(state)).split('\n')[0];

    expect(line).toContain('❤ HP');
    expect(line).toContain('✦ GOLD');
  });

  test('WAVE_ACTIVE line 2 shows wave drain bar, kill count, and leaked count', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      enemiesKilled: 5,
      baseHp: 14,
      spawnQueue: [
        { archetype: EnemyArchetype.STANDARD, spawnIntervalTicks: 1 },
        { archetype: EnemyArchetype.STANDARD, spawnIntervalTicks: 1 }
      ]
    };
    const line = stripAnsi(composeHud(state)).split('\n')[1];

    expect(line).toContain('≋ WAVE 1/15');
    expect(line).toContain('████████░░ 6/8');
    expect(line).toContain('✕ 5 KILLED');
    expect(line).toContain('! 2 LEAKED');
  });

  test('WAVE_ACTIVE line 3 with enemies shows threat details', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      enemies: [createEnemy({ id: 'enemy-priority', archetype: EnemyArchetype.TANK, pathIndex: 10, hp: 35, maxHp: 40 })]
    };
    const line = stripAnsi(composeHud(state)).split('\n')[2];

    expect(line).toContain('⚠ THREAT');
    expect(line).toContain('⬟ Tank');
    expect(line).toContain('35/40');
  });

  test('WAVE_ACTIVE line 3 with no enemies shows no-threat fallback and incoming preview', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      enemies: [createEnemy({ dead: true })]
    };
    const line = stripAnsi(composeHud(state)).split('\n')[2];

    expect(line).toContain('No threats');
    expect(line).toContain('Incoming:');
  });

  test('surge badge uses ◆ SURGE when pulsing', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      frame: 0,
      enemies: Array.from({ length: 6 }, (_, index) => createEnemy({ id: `enemy-${index}` }))
    };
    const line = stripAnsi(composeHud(state)).split('\n')[2];

    expect(line).toContain('◆ SURGE');
  });

  test('surge badge is absent on off-pulse frame', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      frame: 2,
      enemies: Array.from({ length: 6 }, (_, index) => createEnemy({ id: `enemy-${index}` }))
    };
    const line = stripAnsi(composeHud(state)).split('\n')[2];

    expect(line).not.toContain('◆ SURGE');
  });

  test('PREP line 2 contains wave and incoming preview', () => {
    const state = { ...createInitialState(), phase: 'PREP' as const };
    const line = stripAnsi(composeHud(state)).split('\n')[1];

    expect(line).toContain('≋ WAVE 1/15');
    expect(line).toContain('Incoming:');
    expect(line).toContain('◀ Standard');
  });

  test('PREP line 3 with no towers shows build-zone hint', () => {
    const state = { ...createInitialState(), phase: 'PREP' as const, towers: [] };
    const line = stripAnsi(composeHud(state)).split('\n')[2];

    expect(line).toContain('░ = build zone');
  });

  test('PREP line 3 with towers shows ready hint', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      towers: [
        {
          id: 'tower-rapid',
          archetype: TowerArchetype.RAPID,
          pos: [1, 1] as [number, number],
          cooldownRemaining: 0,
          kills: 0
        }
      ]
    };
    const line = stripAnsi(composeHud(state)).split('\n')[2];

    expect(line).toContain('Ready');
    expect(line).toContain('tower(s) placed');
  });

  test('WAVE_CLEAR line 2 shows cleared status with kill and leaked totals', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_CLEAR' as const,
      wave: 2,
      enemiesKilled: 8,
      baseHp: 14
    };
    const line = stripAnsi(composeHud(state)).split('\n')[1];

    expect(line).toContain('✓ Wave 1 cleared!');
    expect(line).toContain('✕ 8 KILLED');
    expect(line).toContain('! 2 LEAKED');
  });

  test('WAVE_CLEAR line 3 shows pre-next-wave guidance', () => {
    const state = { ...createInitialState(), phase: 'WAVE_CLEAR' as const };
    const line = stripAnsi(composeHud(state)).split('\n')[2];

    expect(line).toContain('Place or sell towers before next wave');
    expect(line).toContain('(Space: start wave)');
  });

  test('line 5 arsenal shows selected tower full stats and non-selected compact entries', () => {
    const state = { ...createInitialState(), phase: 'PREP' as const, selectedTowerArchetype: TowerArchetype.RAPID };
    const line = stripAnsi(composeHud(state)).split('\n')[4];

    expect(line).toContain('Rapid $60 Dmg 1 Rng 3');
    expect(line).toContain('Cannon $100');
    expect(line).not.toContain('Cannon $100 Dmg');
  });

  test('line 6 detail shows cursor and sell hint when cursor is on tower', () => {
    const state = {
      ...createInitialState(),
      phase: 'WAVE_ACTIVE' as const,
      cursor: [1, 1] as [number, number],
      towers: [
        {
          id: 'tower-rapid',
          archetype: TowerArchetype.RAPID,
          pos: [1, 1] as [number, number],
          cooldownRemaining: 0,
          kills: 12
        }
      ]
    };
    const line = stripAnsi(composeHud(state)).split('\n')[5];

    expect(line).toContain('◎ (1,1) [✕12]');
    expect(line).toContain('[S] Sell');
  });

  test('line 6 detail shows place hint in PREP on non-tower cell', () => {
    const state = {
      ...createInitialState(),
      phase: 'PREP' as const,
      cursor: [3, 3] as [number, number],
      towers: []
    };
    const line = stripAnsi(composeHud(state)).split('\n')[5];

    expect(line).toContain('◎ (3,3)');
    expect(line).toContain('[Enter] Place');
  });

  test('all HUD lines stay within 76 visible chars across gameplay phases', () => {
    const states = [
      {
        ...createInitialState(),
        phase: 'PREP' as const,
        cursor: [33, 15] as [number, number]
      },
      {
        ...createInitialState(),
        phase: 'WAVE_ACTIVE' as const,
        frame: 0,
        baseHp: 1,
        enemies: [
          ...Array.from({ length: 5 }, (_, index) => createEnemy({ id: `enemy-${index}`, pathIndex: index + 1 })),
          createEnemy({ id: 'enemy-priority', archetype: EnemyArchetype.TANK, pathIndex: 18, hp: 39, maxHp: 40 })
        ],
        spawnQueue: [{ archetype: EnemyArchetype.STANDARD, spawnIntervalTicks: 1 }]
      },
      {
        ...createInitialState(),
        phase: 'WAVE_CLEAR' as const,
        wave: 2,
        enemiesKilled: 99,
        baseHp: 3,
        cursor: [33, 15] as [number, number]
      }
    ];

    for (const state of states) {
      for (const line of composeHud(state).split('\n')) {
        expect(getDisplayWidth(line)).toBeLessThanOrEqual(76);
      }
    }
  });

  test('wide HP bar line uses at least 20 bar segments', () => {
    const state = { ...createInitialState(), phase: 'WAVE_ACTIVE' as const };
    const line = stripAnsi(composeHud(state)).split('\n')[0];
    const hpBarMatch = line.match(/[█░]+/);

    expect(hpBarMatch).toBeDefined();
    expect(hpBarMatch![0].length).toBeGreaterThanOrEqual(20);
  });
});
