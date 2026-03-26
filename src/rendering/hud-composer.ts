import { getTowerDef, TowerArchetype } from '../const/towers';
import { ENEMY_DEFS } from '../const/enemies';
import { isPlacementPhase, type GameState } from '../models/game-state';
import chalk from 'chalk';
import {
  colorizeEventLogMessage,
  colorizeEventMessage,
  colorizeGridSymbol,
  colorizeHudValue,
  colorizePhaseLabel,
  truncateDisplay,
  type EventMessageClass
} from './color-map';
import { getVisibleEventLog } from '../utils/event-log';

export const composeHud = (state: GameState): string => {
  const hpIcon = state.baseHp < 5 ? '♡' : '❤';
  const hpValue = colorizeHudValue(`${state.baseHp}`, 'HP', state.baseHp);
  const goldValue = colorizeHudValue(`$${state.currency}`, 'GOLD', state.baseHp);
  const waveValue = colorizeHudValue(
    `${state.wave}/${state.runConfig.waves.length}`,
    'WAVE',
    state.baseHp
  );
  const phaseValue = colorizePhaseLabel(state.phase);
  const prepHint = state.phase === 'PREP' ? ` ${colorizeHudValue('(press Space)', 'WAVE', state.baseHp)}` : '';

  const towerAbbreviation: Record<TowerArchetype, string> = {
    [TowerArchetype.RAPID]: 'R',
    [TowerArchetype.CANNON]: 'C',
    [TowerArchetype.SNIPER]: 'Sn',
    [TowerArchetype.SLOW]: 'Sl'
  };
  const towerClassByArchetype: Record<TowerArchetype, 'RAPID_TOWER' | 'CANNON_TOWER' | 'SNIPER_TOWER' | 'SLOW_TOWER'> = {
    [TowerArchetype.RAPID]: 'RAPID_TOWER',
    [TowerArchetype.CANNON]: 'CANNON_TOWER',
    [TowerArchetype.SNIPER]: 'SNIPER_TOWER',
    [TowerArchetype.SLOW]: 'SLOW_TOWER'
  };
  const selectedTowerLine = state.runConfig.availableTowers
    .map((archetype, index) => {
      const towerDef = getTowerDef(archetype);
      const keyLabel = `${index + 1}`;
      const full = `[${keyLabel}]${colorizeGridSymbol(towerDef.symbol, towerClassByArchetype[archetype])} ${towerAbbreviation[archetype]}$${towerDef.cost}`;
      const compact = chalk.dim(`[${keyLabel}] ${towerAbbreviation[archetype]}$${towerDef.cost}`);

      if (state.selectedTowerArchetype === archetype) {
        return chalk.bold(full);
      }

      return compact;
    })
    .join('  ');

  const wavePreviewFragment = (() => {
    if (isPlacementPhase(state.phase)) {
      const waveDef = state.runConfig.waves[state.wave - 1];
      if (waveDef) {
        const parts = waveDef.enemies.map((group) => `${group.count}× ${ENEMY_DEFS[group.archetype].symbol}`);
        return `  · Next: ${parts.join(' ')}`;
      }
    }

    if (state.phase === 'WAVE_ACTIVE') {
      return `  · ✕ ${state.enemiesKilled}`;
    }

    return '';
  })();

  const statsLine =
    `${hpIcon} ${hpValue}  ✦ ${goldValue}  ` +
    `≋ ${waveValue} waves  ${phaseValue}${prepHint}${wavePreviewFragment}`;

  const [cursorCol, cursorRow] = state.cursor;
  const towerAtCursor = state.towers.find((tower) => {
    return tower.pos[0] === cursorCol && tower.pos[1] === cursorRow;
  });
  const enemyAtCursor = state.enemies.find((enemy) => {
    return !enemy.dead && enemy.pos[0] === cursorCol && enemy.pos[1] === cursorRow;
  });

  let cursorDetail = '';
  if (towerAtCursor !== undefined && towerAtCursor.kills > 0) {
    cursorDetail = ` [✕${towerAtCursor.kills}]`;
  } else if (enemyAtCursor !== undefined) {
    const hpRatio = enemyAtCursor.hp / enemyAtCursor.maxHp;
    const filled = Math.max(0, Math.min(5, Math.round(hpRatio * 5)));
    const bar = '█'.repeat(filled) + '░'.repeat(5 - filled);
    cursorDetail = ` [${bar} ${enemyAtCursor.hp}/${enemyAtCursor.maxHp}]`;
  }

  const selectedLine = `${selectedTowerLine}  |  Cursor: (${cursorCol},${cursorRow})${cursorDetail}`;

  return `${statsLine}\n${selectedLine}`;
};

export const composeTitleBar = (state: GameState): string => {
  const MAX_MAP_LABEL_WIDTH = 20;
  const mapLabel =
    state.runConfig.mode === 'ANOMALY'
      ? (state.runConfig.mapLabel.match(/#\d+/)?.[0] ?? state.runConfig.mapLabel)
      : state.runConfig.mapLabel;
  const modeBadge =
    state.runConfig.mode === 'ANOMALY'
      ? chalk.bold.magentaBright('[ANOMALY]')
      : chalk.bold.cyanBright('[OPERATIONS]');
  const mapIdentity = chalk.bold.white(truncateDisplay(mapLabel, MAX_MAP_LABEL_WIDTH));
  const wave = chalk.cyan(`Wave ${state.wave}/${state.runConfig.waves.length}`);
  const phase = colorizePhaseLabel(state.phase);

  return `◈ ${modeBadge} ${mapIdentity}  ⟫  ${wave}  ${phase}`;
};

export const composeEventLog = (state: GameState): string[] => {
  const eventLines = getVisibleEventLog(state.eventLog);

  const renderedEvents = eventLines.map((eventLine, index) => {
    if (eventLine.length === 0) {
      return index === 0 ? colorizeEventLogMessage('! No recent events') : chalk.dim('  ─');
    }

    let messageClass: EventMessageClass = 'INFO';
    if (eventLine.startsWith('✕')) {
      messageClass = 'KILL';
    } else if (eventLine.startsWith('!')) {
      messageClass = 'LEAK';
    } else if (eventLine.startsWith('>>')) {
      messageClass = 'WAVE';
    } else if (eventLine.startsWith('✗')) {
      messageClass = 'ERROR';
    }

    return colorizeEventMessage(eventLine, messageClass);
  });

  return [chalk.dim('─── Events ───────────────────────────────────────────'), ...renderedEvents];
};
