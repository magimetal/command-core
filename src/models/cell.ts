import type { TowerId } from './tower-id';

export enum CellType {
  PATH = 'PATH',
  BUILDABLE = 'BUILDABLE',
  BLOCKED = 'BLOCKED',
  SPAWN = 'SPAWN',
  BASE = 'BASE'
}

export interface Cell {
  type: CellType;
  tower?: TowerId;
}

export type GridPos = [number, number];
