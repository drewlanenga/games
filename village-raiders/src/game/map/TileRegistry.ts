import Phaser from 'phaser';
import { TILE_SIZE } from '../constants';

export const TILES = {
  GRASS: 0,
  PATH: 1,
  WALL: 2,
  ROOF: 3,
  DOOR: 4,
  FLOOR: 5,
  FENCE: 6,
  TREE_TRUNK: 7,
  TREE_CANOPY: 8,
  WATER: 9,
  JAIL_WALL: 10,
  JAIL_DOOR: 11,
} as const;

export const COLLIDABLE_TILES: number[] = [
  TILES.WALL,
  TILES.FENCE,
  TILES.TREE_TRUNK,
  TILES.WATER,
  TILES.JAIL_WALL,
];

export const FLOOR_TILES: number[] = [TILES.FLOOR];

const TILE_TEXTURE_KEYS = [
  'tile-grass',
  'tile-path',
  'tile-wall',
  'tile-roof',
  'tile-door',
  'tile-floor',
  'tile-fence',
  'tile-tree-trunk',
  'tile-tree-canopy',
  'tile-water',
  'tile-jail-wall',
  'tile-jail-door',
];

export function buildCompositeTileset(scene: Phaser.Scene): void {
  const count = TILE_TEXTURE_KEYS.length;
  const rt = scene.make.renderTexture(
    { width: TILE_SIZE * count, height: TILE_SIZE, add: false } as any,
  );

  for (let i = 0; i < count; i++) {
    rt.drawFrame(TILE_TEXTURE_KEYS[i], undefined, i * TILE_SIZE, 0);
  }

  rt.saveTexture('village-tileset');
  rt.destroy();
}
