import { TILES } from './TileRegistry';

const W = TILES.WALL;
const D = TILES.DOOR;
const F = TILES.FLOOR;
const R = TILES.ROOF;
const _ = -1; // empty (no tile on this layer)

export interface BuildingTemplate {
  name: string;
  width: number;
  height: number;
  // Structure layer (walls, doors, floors)
  structure: number[][];
  // Decoration layer (roofs)
  decoration: number[][];
  // Which side the door faces: 0=bottom, 1=right, 2=top, 3=left
  doorSide: number;
}

export const BUILDING_TEMPLATES: BuildingTemplate[] = [
  {
    name: 'small-house',
    width: 5,
    height: 5,
    structure: [
      [W, W, W, W, W],
      [W, F, F, F, W],
      [W, F, F, F, W],
      [W, F, F, F, W],
      [W, W, D, W, W],
    ],
    decoration: [
      [R, R, R, R, R],
      [_, _, _, _, _],
      [_, _, _, _, _],
      [_, _, _, _, _],
      [_, _, _, _, _],
    ],
    doorSide: 0,
  },
  {
    name: 'shop',
    width: 6,
    height: 4,
    structure: [
      [W, W, W, W, W, W],
      [W, F, F, F, F, W],
      [W, F, F, F, F, W],
      [W, W, D, D, W, W],
    ],
    decoration: [
      [R, R, R, R, R, R],
      [_, _, _, _, _, _],
      [_, _, _, _, _, _],
      [_, _, _, _, _, _],
    ],
    doorSide: 0,
  },
  {
    name: 'large-house',
    width: 7,
    height: 6,
    structure: [
      [W, W, W, W, W, W, W],
      [W, F, F, F, F, F, W],
      [W, F, F, F, F, F, W],
      [W, F, F, F, F, F, W],
      [W, F, F, F, F, F, W],
      [W, W, W, D, W, W, W],
    ],
    decoration: [
      [R, R, R, R, R, R, R],
      [_, _, _, _, _, _, _],
      [_, _, _, _, _, _, _],
      [_, _, _, _, _, _, _],
      [_, _, _, _, _, _, _],
      [_, _, _, _, _, _, _],
    ],
    doorSide: 0,
  },
];

const JW = TILES.JAIL_WALL;
const JD = TILES.JAIL_DOOR;

export const JAIL_TEMPLATE: BuildingTemplate = {
  name: 'jail',
  width: 7,
  height: 5,
  structure: [
    [JW, JW, JW, JW, JW, JW, JW],
    [JW, F,  F,  F,  F,  F,  JW],
    [JW, F,  F,  F,  F,  F,  JW],
    [JW, F,  F,  F,  F,  F,  JW],
    [JW, JW, JW, JD, JW, JW, JW],
  ],
  decoration: [
    [R, R, R, R, R, R, R],
    [_, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
  ],
  doorSide: 0,
};
