import type { Enemy } from '../models/enemy';
import type { GameState } from '../models/game-state';
import { isReducedMotionEnabled } from '../rendering/accessibility';
import { HP_BAR_SEGMENTS } from '../rendering/hp-bar';

const SURGE_THRESHOLD = 6;
const WAVE_DRAIN_SEGMENTS = HP_BAR_SEGMENTS * 2;

export const getPriorityTarget = (state: GameState): Enemy | undefined => {
  const livingEnemies = state.enemies.filter((enemy) => !enemy.dead);

  if (livingEnemies.length === 0) {
    return undefined;
  }

  return livingEnemies.sort((left, right) => {
    if (left.pathIndex !== right.pathIndex) {
      return right.pathIndex - left.pathIndex;
    }

    if (left.hp !== right.hp) {
      return left.hp - right.hp;
    }

    return left.id.localeCompare(right.id);
  })[0];
};

export const getSurgeState = (state: GameState): { active: boolean; pulse: boolean } => {
  const active = state.enemies.filter((enemy) => !enemy.dead).length >= SURGE_THRESHOLD;
  const pulse = isReducedMotionEnabled() ? true : state.frame % 4 < 2;

  return { active, pulse };
};

export const composeWaveDrainBar = (state: GameState): string => {
  const waveDef = state.runConfig.waves[state.wave - 1];
  const waveTotal = waveDef?.enemies.reduce((sum, group) => sum + group.count, 0) ?? 0;

  if (waveTotal === 0) {
    return '─'.repeat(WAVE_DRAIN_SEGMENTS);
  }

  const spawned = Math.max(0, Math.min(waveTotal, waveTotal - state.spawnQueue.length));
  const filled = Math.round((spawned / waveTotal) * WAVE_DRAIN_SEGMENTS);
  const bar = '█'.repeat(filled) + '░'.repeat(WAVE_DRAIN_SEGMENTS - filled);

  return `${bar} ${spawned}/${waveTotal}`;
};
