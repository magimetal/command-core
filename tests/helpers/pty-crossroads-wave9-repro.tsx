import React, { useEffect, useState } from 'react';
import { render, useApp } from 'ink';
import { EnemyArchetype, ENEMY_DEFS } from '../../src/const/enemies';
import { OPERATIONS_MAP_DEFS, createOperationsRunConfig } from '../../src/const/operations-maps';
import { GameplayFrame } from '../../src/components/GameplayFrame';
import type { Enemy } from '../../src/models/enemy';
import type { GameState } from '../../src/models/game-state';
import { createInitialState } from '../../src/simulation/create-initial-state';

const FRAME_COUNT = 8;
const WAVE_NUMBER = 9;

const crossroads = OPERATIONS_MAP_DEFS.find((mapDef) => mapDef.label === 'Crossroads');

if (crossroads === undefined) {
  throw new Error('Crossroads map definition not found');
}

const runConfig = createOperationsRunConfig(crossroads);
const initialState = createInitialState(runConfig);

const buildDenseEnemies = (frame: number): Enemy[] => {
  const path = runConfig.enemyPath;
  const pathCap = Math.max(1, path.length - 2);
  const archetypeOrder = [
    EnemyArchetype.STANDARD,
    EnemyArchetype.FAST,
    EnemyArchetype.TANK,
    EnemyArchetype.BRUTE,
    EnemyArchetype.COLOSSUS
  ];

  const cluster: Enemy[] = Array.from({ length: 16 }, (_, index) => {
    const archetype = archetypeOrder[index % archetypeOrder.length];
    const maxHp = ENEMY_DEFS[archetype].maxHp;
    const hpStep = Math.max(1, Math.floor(maxHp / 5));
    const hp = Math.max(1, maxHp - ((index + frame) % 4) * hpStep);
    const basePathIndex = Math.min(pathCap, 8 + index * 3 + (frame % 2));
    const [col, row] = path[basePathIndex];

    return {
      id: `dense-${frame}-${index}`,
      archetype,
      pos: [col, row],
      pathIndex: basePathIndex,
      hp,
      maxHp,
      moveCooldown: ENEMY_DEFS[archetype].speed,
      dead: false
    };
  });

  const priorityArchetype = frame % 2 === 0 ? EnemyArchetype.BRUTE : EnemyArchetype.COLOSSUS;
  const priorityMaxHp = ENEMY_DEFS[priorityArchetype].maxHp;
  const priorityPathIndex = Math.min(pathCap, path.length - 3);
  const [priorityCol, priorityRow] = path[priorityPathIndex];

  const priorityEnemy: Enemy = {
    id: `priority-${frame}`,
    archetype: priorityArchetype,
    pos: [priorityCol, priorityRow],
    pathIndex: priorityPathIndex,
    hp: Math.max(1, priorityMaxHp - (frame % 3) * Math.floor(priorityMaxHp / 3)),
    maxHp: priorityMaxHp,
    moveCooldown: ENEMY_DEFS[priorityArchetype].speed,
    dead: false
  };

  return [...cluster, priorityEnemy];
};

const createWaveNineDenseState = (frame: number): GameState => {
  const waveDef = runConfig.waves[WAVE_NUMBER - 1];
  const spawnQueue = waveDef.enemies.flatMap((group) => {
    return Array.from({ length: group.count }, () => ({
      archetype: group.archetype,
      spawnIntervalTicks: group.spawnIntervalTicks
    }));
  });

  return {
    ...initialState,
    phase: 'WAVE_ACTIVE',
    wave: WAVE_NUMBER,
    frame,
    baseHp: 11,
    currency: 420,
    enemiesKilled: 96,
    spawnQueue,
    enemies: buildDenseEnemies(frame),
    eventLog: [
      '>> Wave 9 started — 56 enemies incoming',
      '~ Brute reached 66% HP',
      '~ Colossus reached 66% HP',
      '✕ Rapid tower eliminated Fast',
      '✕ Sniper tower eliminated Tank',
      '! Leak for 1 HP',
      '~ Threat spike near base'
    ]
  };
};

const ReproHarness = () => {
  const { exit } = useApp();
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (frameIndex >= FRAME_COUNT - 1) {
      const timeout = setTimeout(() => exit(), 40);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setFrameIndex((previous) => previous + 1);
    }, 45);

    return () => clearTimeout(timeout);
  }, [frameIndex, exit]);

  return (
    <GameplayFrame
      state={createWaveNineDenseState(frameIndex)}
      terminalColumnsOverride={process.stdout.columns ?? 78}
    />
  );
};

render(<ReproHarness />, {
  exitOnCtrlC: false,
  patchConsole: false
});
