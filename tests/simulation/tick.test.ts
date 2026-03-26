import { describe, expect, test } from 'vitest';
import { EnemyArchetype } from '../../src/const/enemies';
import { tick } from '../../src/simulation/tick';
import { createEnemy, createState, pos } from '../helpers/builders';

const createDeadStandard = (id: string) =>
  createEnemy({
    id,
    archetype: EnemyArchetype.STANDARD,
    pos: pos(2, 7),
    pathIndex: 2,
    hp: 0,
    maxHp: 10,
    moveCooldown: 1,
    dead: true
  });

describe('tick streak milestones', () => {
  test('streak message fires at 5, 10, 20 kill thresholds and not at 7', () => {
    const atFive = tick({
      ...createState(),
      phase: 'WAVE_ACTIVE' as const,
      enemiesKilled: 4,
      spawnQueue: [],
      enemies: [createDeadStandard('enemy-five')]
    });

    expect(atFive.eventLog[0]).toBe('★ STREAK  5 kills — defense holding');

    const atSeven = tick({
      ...createState(),
      phase: 'WAVE_ACTIVE' as const,
      enemiesKilled: 6,
      spawnQueue: [],
      enemies: [createDeadStandard('enemy-seven')]
    });

    expect(atSeven.eventLog).not.toContain('★ STREAK  5 kills — defense holding');
    expect(atSeven.eventLog).not.toContain('★★ STREAK 10 kills — excellent coverage');
    expect(atSeven.eventLog).not.toContain('★★★ STREAK 20 kills — DOMINATION');

    const atTen = tick({
      ...createState(),
      phase: 'WAVE_ACTIVE' as const,
      enemiesKilled: 9,
      spawnQueue: [],
      enemies: [createDeadStandard('enemy-ten')]
    });

    expect(atTen.eventLog[0]).toBe('★★ STREAK 10 kills — excellent coverage');

    const atTwenty = tick({
      ...createState(),
      phase: 'WAVE_ACTIVE' as const,
      enemiesKilled: 19,
      spawnQueue: [],
      enemies: [createDeadStandard('enemy-twenty')]
    });

    expect(atTwenty.eventLog[0]).toBe('★★★ STREAK 20 kills — DOMINATION');
  });
});
