import { useInput } from 'ink';
import { TowerArchetype } from '../const/towers';

export interface InputHandlerProps {
  onAnyKey: () => boolean;
  onMoveCursor: (dx: number, dy: number) => void;
  onPlaceTower: () => void;
  onSellTower: () => void;
  onSelectTower: (archetype: TowerArchetype) => void;
  onQuit: () => void;
  onSpace: () => void;
}

export const InputHandler = ({
  onAnyKey,
  onMoveCursor,
  onPlaceTower,
  onSellTower,
  onSelectTower,
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

    if (input === '1') {
      onSelectTower(TowerArchetype.RAPID);
      return;
    }

    if (input === '2') {
      onSelectTower(TowerArchetype.CANNON);
      return;
    }

    if (input === '3') {
      onSelectTower(TowerArchetype.SNIPER);
      return;
    }

    if (input === '4') {
      onSelectTower(TowerArchetype.SLOW);
      return;
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
