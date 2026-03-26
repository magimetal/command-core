import { useInput } from 'ink';
import { TowerArchetype } from '../const/towers';
import { isMenuPhase, type GamePhase } from '../models/game-state';

export interface InputHandlerProps {
  onAnyKey: () => boolean;
  phase: GamePhase;
  availableTowers: TowerArchetype[];
  onMoveCursor: (dx: number, dy: number) => void;
  onPlaceTower: () => void;
  onSellTower: () => void;
  onSelectTower: (archetype: TowerArchetype) => void;
  onMenuNavigate: (delta: number) => void;
  onMenuConfirm: () => void;
  onMenuBack: () => void;
  onMenuDirectSelect: (index: number) => void;
  onQuit: () => void;
  onSpace: () => void;
}

export const InputHandler = ({
  onAnyKey,
  phase,
  availableTowers,
  onMoveCursor,
  onPlaceTower,
  onSellTower,
  onSelectTower,
  onMenuNavigate,
  onMenuConfirm,
  onMenuBack,
  onMenuDirectSelect,
  onQuit,
  onSpace
}: InputHandlerProps): null => {
  useInput((input, key) => {
    if (input.toLowerCase() === 'q') {
      onQuit();
      return;
    }

    if (onAnyKey()) {
      return;
    }

    if (isMenuPhase(phase)) {
      if (input === '1' || input === '2' || input === '3' || input === '4') {
        onMenuDirectSelect(Number(input) - 1);
        return;
      }

      if (key.upArrow) {
        onMenuNavigate(-1);
        return;
      }

      if (key.downArrow) {
        onMenuNavigate(1);
        return;
      }

      if (key.return) {
        onMenuConfirm();
        return;
      }

      if (key.escape || input.toLowerCase() === 'b') {
        onMenuBack();
      }

      return;
    }

    for (let index = 0; index < availableTowers.length; index += 1) {
      if (input === `${index + 1}`) {
        onSelectTower(availableTowers[index]);
        return;
      }
    }

    if (input.toLowerCase() === 's') {
      onSellTower();
      return;
    }

    if (input === ' ') {
      onSpace();
      return;
    }

    if (key.leftArrow) {
      onMoveCursor(-1, 0);
      return;
    }

    if (key.rightArrow) {
      onMoveCursor(1, 0);
      return;
    }

    if (key.upArrow) {
      onMoveCursor(0, -1);
      return;
    }

    if (key.downArrow) {
      onMoveCursor(0, 1);
      return;
    }

    if (key.return) {
      onPlaceTower();
    }
  });

  return null;
};
