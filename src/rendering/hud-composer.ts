import { getTowerDef, TowerArchetype } from '../const/towers';
import { ENEMY_DEFS } from '../const/enemies';
import { WAVES } from '../const/waves';
import type { GameState } from '../models/game-state';
import chalk from 'chalk';
import { colorizeGridSymbol, colorizeHudValue, colorizePhaseLabel } from './color-map';

export const composeHud = (state: GameState): string => {
  const hpIcon = state.baseHp < 5 ? '♡' : '❤';
  const hpValue = colorizeHudValue(`${state.baseHp}`, 'HP', state.baseHp);
  const goldValue = colorizeHudValue(`$${state.currency}`, 'GOLD', state.baseHp);
  const waveValue = colorizeHudValue(
    `${state.wave}/${WAVES.length}`,
    'WAVE',
    state.baseHp
  );
  const phaseValue = colorizePhaseLabel(state.phase);
  const prepHint = state.phase === 'PREP' ? ` ${colorizeHudValue('(press Space)', 'WAVE', state.baseHp)}` : '';

  const rapidTower = getTowerDef(TowerArchetype.RAPID);
  const cannonTower = getTowerDef(TowerArchetype.CANNON);
  const sniperTower = getTowerDef(TowerArchetype.SNIPER);
  const slowTower = getTowerDef(TowerArchetype.SLOW);
  const rapidFull = `${colorizeGridSymbol(rapidTower.symbol, 'RAPID_TOWER')}  RAPID $${rapidTower.cost}`;
  const cannonFull = `${colorizeGridSymbol(cannonTower.symbol, 'CANNON_TOWER')} CANNON $${cannonTower.cost}`;
  const sniperFull = `${colorizeGridSymbol(sniperTower.symbol, 'SNIPER_TOWER')} SNIPER $${sniperTower.cost}`;
  const slowFull = `${colorizeGridSymbol(slowTower.symbol, 'SLOW_TOWER')}  SLOW $${slowTower.cost}`;
  const rapidAbb = chalk.dim(`R $${rapidTower.cost}`);
  const cannonAbb = chalk.dim(`C $${cannonTower.cost}`);
  const sniperAbb = chalk.dim(`Sn $${sniperTower.cost}`);
  const slowAbb = chalk.dim(`Sl $${slowTower.cost}`);
  const selectedRapid =
    state.selectedTowerArchetype === TowerArchetype.RAPID
      ? chalk.bold(`[${rapidFull}]`)
      : rapidAbb;
  const selectedCannon =
    state.selectedTowerArchetype === TowerArchetype.CANNON
      ? chalk.bold(`[${cannonFull}]`)
      : cannonAbb;
  const selectedSniper =
    state.selectedTowerArchetype === TowerArchetype.SNIPER
      ? chalk.bold(`[${sniperFull}]`)
      : sniperAbb;
  const selectedSlow =
    state.selectedTowerArchetype === TowerArchetype.SLOW
      ? chalk.bold(`[${slowFull}]`)
      : slowAbb;

  const wavePreviewFragment = (() => {
    if (state.phase === 'PREP' || state.phase === 'WAVE_CLEAR') {
      const waveDef = WAVES[state.wave - 1];
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

  const selectedLine =
    `${selectedRapid}  ${selectedCannon}  ${selectedSniper}  ${selectedSlow}  |  Cursor: (${cursorCol},${cursorRow})${cursorDetail}`;

  return `${statsLine}\n${selectedLine}`;
};
