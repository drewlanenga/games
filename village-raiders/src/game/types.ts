export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum LootType {
  KEY = 'key',
  HEART = 'heart',
  SPEED = 'speed',
  SHIELD = 'shield',
  EMPTY = 'empty',
}

export enum ObjectType {
  CRATE = 'crate',
  BARREL = 'barrel',
  BUSH = 'bush',
}

export interface ObjectPlacement {
  x: number;
  y: number;
  type: ObjectType;
  contents: LootType;
}

export interface MapData {
  ground: number[][];
  structures: number[][];
  decoration: number[][];
  objectPlacements: ObjectPlacement[];
  playerSpawn: { x: number; y: number };
  jailDoor: { x: number; y: number };
  buildingZones: { x: number; y: number; w: number; h: number }[];
}
