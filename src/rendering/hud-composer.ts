import { getTowerDef, TowerArchetype } from '../const/towers';
import { WAVES } from '../const/waves';
import type { GameState } from '../models/game-state';
import { colorizeGridSymbol, colorizeHudValue, colorizePhaseLabel } from './color-map';

export const composeHud = (state: GameState): string => {
  const hpValue = colorizeHudValue(`${state.baseHp}`, 'HP', state.baseHp);
  const goldValue = colorizeHudValue(`${state.currency}`, 'GOLD', state.baseHp);
  const waveValue = colorizeHudValue(
    `${state.wave}/${WAVES.length}`,
    'WAVE',
    state.baseHp
  );
  const phaseValue = colorizePhaseLabel(state.phase);
  const prepHint = state.phase === 'PREP' ? ` ${colorizeHudValue('(press Space)', 'WAVE', state.baseHp)}` : '';

  const selectedTower = getTowerDef(state.selectedTowerArchetype);
  const selectedTowerClass =
    state.selectedTowerArchetype === TowerArchetype.RAPID
      ? 'RAPID_TOWER'
      : 'CANNON_TOWER';
  const selectedTowerSymbol = colorizeGridSymbol(
    selectedTower.symbol,
    selectedTowerClass
  );

  const statsLine =
    `HP: ${hpValue} | Gold: ${goldValue} | ` +
    `Wave: ${waveValue} | ${phaseValue}${prepHint}`;
  const selectedLine =
    `Selected: ${selectedTowerSymbol} ` +
    `${state.selectedTowerArchetype} ($${selectedTower.cost})  ` +
    `Cursor: (${state.cursor[0]},${state.cursor[1]})`;

  return `${statsLine}\n${selectedLine}`;
};
