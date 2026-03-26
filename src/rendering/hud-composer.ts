import { getTowerDef, TowerArchetype } from '../const/towers';
import { ENEMY_DEFS } from '../const/enemies';
import { EVENT_PREFIX } from '../const/event-prefixes';
import { GLYPH } from '../const/glyphs';
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
import { renderHpBar } from './hp-bar';
import { styleAnomaly, styleEmphasis, stylePrimary, styleSubtle } from './text-styles';

export const composeHud = (state: GameState): string => {
  const hpIcon = state.baseHp < 5 ? GLYPH.HP_LOW : GLYPH.HP_FULL;
  const hpValue = colorizeHudValue(`${state.baseHp}`, 'HP', state.baseHp);
  const goldValue = colorizeHudValue(`$${state.currency}`, 'GOLD', state.baseHp);
  const waveValue = colorizeHudValue(
    `${state.wave}/${state.runConfig.waves.length}`,
    'WAVE',
    state.baseHp
  );
  const phaseValue = colorizePhaseLabel(state.phase);
  const waveStartHint =
    state.phase === 'PREP' ? ` ${colorizeHudValue('(Space: start wave)', 'WAVE', state.baseHp)}` : '';
  const placementHint =
    state.phase === 'PREP' && state.towers.length === 0
      ? styleSubtle('  ░ = build zone  · Move cursor to ░, press Enter to place your first tower')
      : '';

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
      const full = `[${keyLabel}]${colorizeGridSymbol(towerDef.symbol, towerClassByArchetype[archetype])} ${towerAbbreviation[archetype]}$${towerDef.cost} Dmg${towerDef.damage} Rng${towerDef.range}`;
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
        return `  · Next wave: ${parts.join(' ')}`;
      }
    }

    if (state.phase === 'WAVE_ACTIVE') {
      return `  · Kills: ${state.enemiesKilled}`;
    }

    return '';
  })();

  const statsLine =
    `${hpIcon} ${hpValue}  ${GLYPH.GOLD} ${goldValue}  ` +
    `${GLYPH.WAVE} ${waveValue}  ${phaseValue}${waveStartHint}${wavePreviewFragment}`;

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
    cursorDetail = ` [${renderHpBar(enemyAtCursor.hp, enemyAtCursor.maxHp)} ${enemyAtCursor.hp}/${enemyAtCursor.maxHp}]`;
  }

  const selectedLine = `${selectedTowerLine}  |  Cursor: (${cursorCol},${cursorRow})${cursorDetail}`;

  return placementHint.length > 0 ? `${statsLine}\n${selectedLine}\n${placementHint}` : `${statsLine}\n${selectedLine}`;
};

export const composeTitleBar = (state: GameState): string => {
  const MAX_MAP_LABEL_WIDTH = 20;
  const mapLabel =
    state.runConfig.mode === 'ANOMALY'
      ? (state.runConfig.mapLabel.match(/#\d+/)?.[0] ?? state.runConfig.mapLabel)
      : state.runConfig.mapLabel;
  const modeBadge =
    state.runConfig.mode === 'ANOMALY'
      ? styleAnomaly('[ANOMALY]')
      : stylePrimary('[OPERATIONS]');
  const mapIdentity = styleEmphasis(truncateDisplay(mapLabel, MAX_MAP_LABEL_WIDTH));
  const wave = chalk.cyan(`Wave ${state.wave}/${state.runConfig.waves.length}`);
  const phase = colorizePhaseLabel(state.phase);

  return `${GLYPH.RUN_PREFIX} ${modeBadge} ${mapIdentity}  ${GLYPH.SEPARATOR}  ${wave}  ${phase}`;
};

export const composeEventLog = (state: GameState, visibleCount: number = 7): string[] => {
  const eventLines = getVisibleEventLog(state.eventLog, visibleCount);

  const renderedEvents = eventLines.map((eventLine, index) => {
    if (eventLine.length === 0) {
      return index === 0 ? colorizeEventLogMessage('· No events yet') : colorizeEventLogMessage('  ─');
    }

    let messageClass: EventMessageClass = 'INFO';
    if (eventLine.startsWith(EVENT_PREFIX.KILL)) {
      messageClass = 'KILL';
    } else if (eventLine.startsWith(EVENT_PREFIX.LEAK)) {
      messageClass = 'LEAK';
    } else if (eventLine.startsWith(EVENT_PREFIX.WAVE)) {
      messageClass = 'WAVE';
    } else if (eventLine.startsWith(EVENT_PREFIX.ERROR)) {
      messageClass = 'ERROR';
    }

    return colorizeEventMessage(eventLine, messageClass);
  });

  return [chalk.dim('─── Events ───────────────────────────────────────────'), ...renderedEvents];
};
