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
  colorizePhaseLabel,
  getDisplayWidth,
  truncateDisplay,
  type EventMessageClass
} from './color-map';
import { getVisibleEventLog } from '../utils/event-log';
import { composeWaveDrainBar, getPriorityTarget, getSurgeState } from '../utils/threat-radar';
import { renderHpBar, renderWideHpBar } from './hp-bar';
import { styleAnomaly, styleEmphasis, stylePrimary, styleSubtle, styleSurge, styleThreat } from './text-styles';

const HUD_WIDTH = 76;

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

const fitHudLine = (left: string, right: string = '', width: number = HUD_WIDTH): string => {
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
  const waveDef = state.runConfig.waves[state.wave - 1];
  if (waveDef === undefined) {
    return 'none';
  }

  return waveDef.enemies
    .map((group) => `${group.count}× ${ENEMY_DEFS[group.archetype].symbol} ${ENEMY_DEFS[group.archetype].displayName}`)
    .join('  ');
};

const composeHpGoldLine = (state: GameState): string => {
  const hpTone = state.baseHp < 5 ? chalk.redBright : chalk.greenBright;
  const hpPrefix = hpTone('❤ HP ');
  const hpValue = hpTone(`  ${state.baseHp}/${state.runConfig.startingBaseHp}`);
  const goldSection = chalk.yellow(`✦ GOLD $${state.currency}`);
  const barWidth = Math.max(
    20,
    HUD_WIDTH - getDisplayWidth(hpPrefix) - getDisplayWidth(hpValue) - getDisplayWidth(goldSection) - 2
  );
  const hpBar = hpTone(renderWideHpBar(state.baseHp, state.runConfig.startingBaseHp, barWidth));
  const left = `${hpPrefix}${hpBar}${hpValue}`;

  return fitHudLine(left, goldSection);
};

const composeWaveActiveTelemetry = (state: GameState): string[] => {
  const leakedCount = Math.max(0, state.runConfig.startingBaseHp - state.baseHp);
  const waveLine = fitHudLine(
    `${chalk.cyan(`≋ WAVE ${state.wave}/${state.runConfig.waves.length}`)}  ${stylePrimary(composeWaveDrainBar(state))} deployed`,
    `${chalk.greenBright(`✕ ${state.enemiesKilled} KILLED`)}  ${chalk.redBright(`! ${leakedCount} LEAKED`)}`
  );

  const target = getPriorityTarget(state);
  const threatLine = (() => {
    if (target === undefined) {
      return styleSubtle(`── No threats ──  Incoming: ${composeIncomingPreview(state)}`);
    }

    const def = ENEMY_DEFS[target.archetype];
    const hpBar = renderHpBar(target.hp, target.maxHp);
    const pathLength = Math.max(1, state.runConfig.enemyPath.length - 1);
    const progress = Math.max(0, Math.min(1, target.pathIndex / pathLength));
    const pctToBase = Math.round(progress * 100);
    const progressWidth = 8;
    const progressFilled = Math.max(0, Math.min(progressWidth, Math.round(progress * progressWidth)));
    const progressBar = `${'━'.repeat(progressFilled)}${' '.repeat(progressWidth - progressFilled)}▸`;
    const surgeState = getSurgeState(state);
    const surgeBadge = surgeState.active && surgeState.pulse ? styleSurge('◆ SURGE') : '';
    const threatPrefix = styleThreat('⚠ THREAT');
    const threatBody = styleThreat(
      `${def.symbol} ${def.displayName} [${hpBar}] ${target.hp}/${target.maxHp}  ${progressBar} ${pctToBase}% to base`
    );

    return fitHudLine(`${threatPrefix} ${threatBody}`, surgeBadge);
  })();

  return [composeHpGoldLine(state), waveLine, threatLine];
};

const composePrepTelemetry = (state: GameState): string[] => {
  const waveLine = fitHudLine(
    `${chalk.cyan(`≋ WAVE ${state.wave}/${state.runConfig.waves.length}`)}  ${styleSubtle(`Incoming: ${composeIncomingPreview(state)}`)}`,
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

  const clearLine = fitHudLine(
    `${chalk.cyan(`≋ WAVE ${state.wave}/${state.runConfig.waves.length}`)}  ${chalk.greenBright(`✓ Wave ${clearedWave} cleared!`)}`,
    `${chalk.greenBright(`✕ ${state.enemiesKilled} KILLED`)}  ${chalk.redBright(`! ${leakedCount} LEAKED`)}`
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
    cursorDetail = ` [✕${towerAtCursor.kills}]`;
  } else if (enemyAtCursor !== undefined) {
    cursorDetail = ` [${renderHpBar(enemyAtCursor.hp, enemyAtCursor.maxHp)} ${enemyAtCursor.hp}/${enemyAtCursor.maxHp}]`;
  }

  const lineFiveTokens = state.runConfig.availableTowers
    .map((archetype, index) => {
      const towerDef = getTowerDef(archetype);
      const keyLabel = `${index + 1}`;
      const symbol = colorizeGridSymbol(towerDef.symbol, towerClassByArchetype[archetype]);

      if (state.selectedTowerArchetype === archetype) {
        return chalk.bold(
          `[${keyLabel}]${symbol} ${towerNameByArchetype[archetype]} $${towerDef.cost} Dmg ${towerDef.damage} Rng ${towerDef.range}`
        );
      }

      return chalk.dim(`[${keyLabel}]${symbol} ${towerNameByArchetype[archetype]} $${towerDef.cost}`);
    })
    .join('  ');

  const lineFive = truncateDisplay(`▸ ${lineFiveTokens}`, HUD_WIDTH);
  const selectedDef = getTowerDef(state.selectedTowerArchetype);
  const selectedSymbol = colorizeGridSymbol(
    selectedDef.symbol,
    towerClassByArchetype[state.selectedTowerArchetype]
  );
  const detailLeft = chalk.white(
    `▸ ${selectedSymbol} ${state.selectedTowerArchetype}  Dmg ${selectedDef.damage}  Rng ${selectedDef.range}  Cd ${selectedDef.cooldownTicks}`
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
  const detailRight = `${chalk.white(`◎ (${cursorCol},${cursorRow})${cursorDetail}`)}  ${styleSubtle(`· ${contextualHint}`)}`;
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
  const divider = chalk.dim('╌'.repeat(HUD_WIDTH));

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

    const renderedLine = colorizeEventMessage(eventLine, messageClass);

    return renderedLine;
  });

  return [chalk.dim('─── Events ───────────────────────────────────────────'), ...renderedEvents];
};
