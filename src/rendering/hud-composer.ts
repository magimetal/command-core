import { getTowerDef, TowerArchetype } from '../const/towers';
import { ENEMY_DEFS, getEnemySymbol } from '../const/enemies';
import { EVENT_PREFIX } from '../const/event-prefixes';
import { GLYPH } from '../const/glyphs';
import { isPlacementPhase, type GameState } from '../models/game-state';
import {
  tokenDim,
  tokenEventLogMessage,
  tokenEventMessage,
  tokenGridSymbol,
  tokenHudValue,
  tokenNeutral,
  tokenPhaseLabel,
  tokenStrong,
  styleAnomaly,
  styleEmphasis,
  stylePrimary,
  styleSubtle,
  styleSurge,
  styleThreat,
  type EventMessageClass
} from './design-tokens';
import { FRAME_INNER_WIDTH_BUDGET } from './frame-composer';
import { getDisplayWidth, truncateDisplay } from './text-utils';
import { getVisibleEventLog } from '../utils/event-log';
import { composeWaveDrainBar, getPriorityTarget, getSurgeState } from '../utils/threat-radar';
import { renderHpBar, renderProgressBar, renderWideHpBar } from './hp-bar';
import { isReducedGlyphEnabled, isReducedMotionEnabled } from './accessibility';

const towerNameByArchetype: Record<TowerArchetype, string> = {
  [TowerArchetype.RAPID]: 'Rapid',
  [TowerArchetype.CANNON]: 'Cannon',
  [TowerArchetype.SNIPER]: 'Sniper',
  [TowerArchetype.SLOW]: 'Slow'
};

const towerClassByArchetype: Record<TowerArchetype, 'RAPID_TOWER' | 'CANNON_TOWER' | 'SNIPER_TOWER' | 'SLOW_TOWER'> = {
  [TowerArchetype.RAPID]: 'RAPID_TOWER',
  [TowerArchetype.CANNON]: 'CANNON_TOWER',
  [TowerArchetype.SNIPER]: 'SNIPER_TOWER',
  [TowerArchetype.SLOW]: 'SLOW_TOWER'
};

const fitHudLine = (left: string, right: string = '', width: number = FRAME_INNER_WIDTH_BUDGET): string => {
  if (right.length === 0) {
    return truncateDisplay(left, width);
  }

  const leftWidth = getDisplayWidth(left);
  const rightWidth = getDisplayWidth(right);
  const gap = width - leftWidth - rightWidth;

  if (gap >= 2) {
    return `${left}${' '.repeat(gap)}${right}`;
  }

  return truncateDisplay(`${left}  ${right}`, width);
};

const composeIncomingPreview = (state: GameState): string => {
  const reducedGlyph = isReducedGlyphEnabled();
  const waveDef = state.runConfig.waves[state.wave - 1];
  if (waveDef === undefined) {
    return 'none';
  }

  return waveDef.enemies
    .map(
      (group) =>
        `${group.count}× ${getEnemySymbol(group.archetype, { reducedGlyph })} ${ENEMY_DEFS[group.archetype].displayName}`
    )
    .join('  ');
};

const composeHpGoldLine = (state: GameState): string => {
  const hpGlyph =
    state.baseHp < 3
      ? GLYPH.HP_CRITICAL
      : state.baseHp < Math.ceil(state.runConfig.startingBaseHp / 2)
        ? GLYPH.HP_LOW
        : GLYPH.HP_FULL;
  const hpPrefix = tokenHudValue(`${hpGlyph} HP `, 'HP', state.baseHp);
  const hpValue = tokenHudValue(`  ${state.baseHp}/${state.runConfig.startingBaseHp}`, 'HP', state.baseHp);
  const goldSection = tokenHudValue(`${GLYPH.GOLD} GOLD $${state.currency}`, 'GOLD', state.baseHp);
  const hpRatio = state.runConfig.startingBaseHp > 0 ? (state.baseHp / state.runConfig.startingBaseHp) * 100 : 0;
  const criticalIndicator =
    state.baseHp < 5 ? tokenHudValue(` ${renderProgressBar(hpRatio, 4)}`, 'HP', state.baseHp) : '';
  const barWidth = Math.max(
    20,
    FRAME_INNER_WIDTH_BUDGET -
      getDisplayWidth(hpPrefix) -
      getDisplayWidth(hpValue) -
      getDisplayWidth(goldSection) -
      getDisplayWidth(criticalIndicator) -
      2
  );
  const hpBar = tokenHudValue(
    renderWideHpBar(state.baseHp, state.runConfig.startingBaseHp, barWidth),
    'HP',
    state.baseHp
  );
  const left = `${hpPrefix}${hpBar}${hpValue}${criticalIndicator}`;

  return fitHudLine(left, goldSection);
};

const composeWaveActiveTelemetry = (state: GameState): string[] => {
  const leakedCount = Math.max(0, state.runConfig.startingBaseHp - state.baseHp);
  const waveHeader = stylePrimary(`${GLYPH.WAVE} WAVE ${state.wave}/${state.runConfig.waves.length}`);
  const waveLine = fitHudLine(
    `${waveHeader}  ${stylePrimary(composeWaveDrainBar(state))} deployed`,
    `${tokenEventMessage(`${EVENT_PREFIX.KILL} ${state.enemiesKilled} KILLED`, 'KILL')}  ${tokenEventMessage(`${EVENT_PREFIX.LEAK} ${leakedCount} LEAKED`, 'LEAK')}`
  );

  const target = getPriorityTarget(state);
  const threatLine = (() => {
    if (target === undefined) {
      return styleSubtle(`── No threats ──  Incoming: ${composeIncomingPreview(state)}`);
    }

    const def = ENEMY_DEFS[target.archetype];
    const threatSymbol = getEnemySymbol(target.archetype, { reducedGlyph: isReducedGlyphEnabled() });
    const hpBar = renderHpBar(target.hp, target.maxHp);
    const pathLength = Math.max(1, state.runConfig.enemyPath.length - 1);
    const progress = Math.max(0, Math.min(1, target.pathIndex / pathLength));
    const pctToBase = Math.round(progress * 100);
    const progressBar = renderProgressBar(pctToBase, 8);
    const surgeState = getSurgeState(state);
    const surgeBadge = surgeState.active && surgeState.pulse ? styleSurge(`${GLYPH.SEPARATOR} ${GLYPH.SURGE_BADGE}`) : '';
    const threatPrefix = styleThreat(GLYPH.THREAT_LABEL);
    const threatBody = styleThreat(
      `${threatSymbol} ${def.displayName} [${hpBar}] ${target.hp}/${target.maxHp}  ${progressBar} ${pctToBase}% to base`
    );

    return fitHudLine(`${threatPrefix} ${threatBody}`, surgeBadge);
  })();

  return [composeHpGoldLine(state), waveLine, threatLine];
};

const composePrepTelemetry = (state: GameState): string[] => {
  const waveHeader = stylePrimary(`${GLYPH.WAVE} WAVE ${state.wave}/${state.runConfig.waves.length}`);
  const waveLine = fitHudLine(
    `${waveHeader}  ${styleSubtle(`Incoming: ${composeIncomingPreview(state)}`)}`,
    styleSubtle('(Space: start wave)')
  );

  const prepHint =
    state.towers.length === 0
      ? styleSubtle('░ = build zone  · Move to ░ and press Enter to place')
      : styleSubtle(`· Ready · ${state.towers.length} tower(s) placed`);

  return [composeHpGoldLine(state), waveLine, prepHint];
};

const composeWaveClearTelemetry = (state: GameState): string[] => {
  const leakedCount = Math.max(0, state.runConfig.startingBaseHp - state.baseHp);
  const clearedWave = Math.max(1, state.wave - 1);
  const waveHeader = stylePrimary(`${GLYPH.WAVE} WAVE ${state.wave}/${state.runConfig.waves.length}`);

  const clearLine = fitHudLine(
    `${waveHeader}  ${tokenEventMessage(`${EVENT_PREFIX.WAVE} Wave ${clearedWave} cleared!`, 'WAVE')}`,
    `${tokenEventMessage(`${EVENT_PREFIX.KILL} ${state.enemiesKilled} KILLED`, 'KILL')}  ${tokenEventMessage(`${EVENT_PREFIX.LEAK} ${leakedCount} LEAKED`, 'LEAK')}`
  );

  const guidanceLine = fitHudLine(
    styleSubtle('· Place or sell towers before next wave'),
    styleSubtle('(Space: start wave)')
  );

  return [composeHpGoldLine(state), clearLine, guidanceLine];
};

const composeArsenalLines = (state: GameState): [string, string] => {
  const [cursorCol, cursorRow] = state.cursor;
  const towerAtCursor = state.towers.find((tower) => {
    return tower.pos[0] === cursorCol && tower.pos[1] === cursorRow;
  });
  const enemyAtCursor = state.enemies.find((enemy) => {
    return !enemy.dead && enemy.pos[0] === cursorCol && enemy.pos[1] === cursorRow;
  });

  let cursorDetail = '';
  if (towerAtCursor !== undefined && towerAtCursor.kills > 0) {
    cursorDetail = ` [${EVENT_PREFIX.KILL}${towerAtCursor.kills}]`;
  } else if (enemyAtCursor !== undefined) {
    cursorDetail = ` [${renderHpBar(enemyAtCursor.hp, enemyAtCursor.maxHp)} ${enemyAtCursor.hp}/${enemyAtCursor.maxHp}]`;
  }

  const lineFiveTokens = state.runConfig.availableTowers
    .map((archetype, index) => {
      const towerDef = getTowerDef(archetype);
      const keyLabel = `${index + 1}`;
      const symbol = tokenGridSymbol(towerDef.symbol, towerClassByArchetype[archetype]);
      const marker = state.selectedTowerArchetype === archetype ? GLYPH.MENU_ARROW : '-';

      if (state.selectedTowerArchetype === archetype) {
        return tokenStrong(
          `${marker}[${keyLabel}]${symbol} ${towerNameByArchetype[archetype]} $${towerDef.cost} Dmg ${towerDef.damage} Rng ${towerDef.range}`
        );
      }

      return tokenDim(`${marker}[${keyLabel}]${symbol} ${towerNameByArchetype[archetype]} $${towerDef.cost}`);
    })
    .join('  ');

  const lineFive = truncateDisplay(lineFiveTokens, FRAME_INNER_WIDTH_BUDGET);
  const selectedDef = getTowerDef(state.selectedTowerArchetype);
  const selectedSymbol = tokenGridSymbol(
    selectedDef.symbol,
    towerClassByArchetype[state.selectedTowerArchetype]
  );
  const detailLeft = tokenNeutral(
    `${GLYPH.MENU_ARROW} ${selectedSymbol} ${state.selectedTowerArchetype}  Dmg ${selectedDef.damage}  Rng ${selectedDef.range}  Cd ${selectedDef.cooldownTicks}`
  );
  const contextualHint = (() => {
    if (towerAtCursor !== undefined) {
      return '[S] Sell';
    }

    if (isPlacementPhase(state.phase)) {
      return '[Enter] Place';
    }

    return '[S] Sell  [Q] Quit';
  })();
  const detailRight = `${tokenNeutral(`${GLYPH.CURSOR_RETICLE} (${cursorCol},${cursorRow})${cursorDetail}`)}  ${tokenDim(GLYPH.SEPARATOR)}  ${styleSubtle(contextualHint)}`;
  const lineSix = fitHudLine(detailLeft, detailRight);

  return [lineFive, lineSix];
};

export const composeHud = (state: GameState): string => {
  const telemetry = (() => {
    if (state.phase === 'WAVE_ACTIVE') {
      return composeWaveActiveTelemetry(state);
    }

    if (state.phase === 'WAVE_CLEAR') {
      return composeWaveClearTelemetry(state);
    }

    return composePrepTelemetry(state);
  })();

  const arsenal = composeArsenalLines(state);
  const divider = tokenDim(GLYPH.EVENT_DIVIDER.repeat(FRAME_INNER_WIDTH_BUDGET));

  return [telemetry[0], telemetry[1], telemetry[2], divider, arsenal[0], arsenal[1]].join('\n');
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
  const wave = tokenHudValue(`Wave ${state.wave}/${state.runConfig.waves.length}`, 'WAVE', state.baseHp);
  const phase =
    state.phase === 'WAVE_ACTIVE' && !isReducedMotionEnabled() && state.frame % 4 >= 2
      ? tokenDim('[WAVE ACTIVE]')
      : tokenPhaseLabel(state.phase);

  return `${GLYPH.RUN_PREFIX} ${modeBadge} ${mapIdentity}  ${GLYPH.SEPARATOR}  ${wave}  ${phase}`;
};

export const composeEventLog = (state: GameState, visibleCount: number = 7): string[] => {
  const eventLines = getVisibleEventLog(state.eventLog, visibleCount);
  const hiddenCount = Math.max(0, state.eventLog.length - visibleCount);
  const eventHeader = composeEventHeader(hiddenCount);

  const renderedEvents = eventLines.map((eventLine, index) => {
    if (eventLine.length === 0) {
      return index === 0 ? tokenEventLogMessage('  · No events yet') : tokenEventLogMessage('    ─');
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

    const renderedLine = tokenEventMessage(eventLine, messageClass);

    return `  ${renderedLine}`;
  });

  return [eventHeader, ...renderedEvents];
};
const composeEventHeader = (hiddenCount: number): string => {
  const hint = hiddenCount > 0 ? ` ${GLYPH.SCROLL_UP} ${hiddenCount} more` : '';
  const label = `${GLYPH.EVENTS_LABEL}${hint}`;
  const prefix = `${GLYPH.EVENT_DIVIDER.repeat(2)} `;
  const suffixPad = Math.max(0, FRAME_INNER_WIDTH_BUDGET - getDisplayWidth(prefix) - getDisplayWidth(label) - 1);

  return tokenEventLogMessage(`${prefix}${label} ${GLYPH.EVENT_DIVIDER.repeat(suffixPad)}`);
};
