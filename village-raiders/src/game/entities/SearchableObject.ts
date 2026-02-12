import Phaser from 'phaser';
import { ObjectType, LootType } from '../types';

const TEXTURE_MAP: Record<ObjectType, string> = {
  [ObjectType.CRATE]: 'obj-crate',
  [ObjectType.BARREL]: 'obj-barrel',
  [ObjectType.BUSH]: 'obj-bush',
};

const OPEN_TEXTURE_MAP: Record<ObjectType, string> = {
  [ObjectType.CRATE]: 'obj-crate-open',
  [ObjectType.BARREL]: 'obj-barrel-open',
  [ObjectType.BUSH]: 'obj-bush-searched',
};

export class SearchableObject extends Phaser.Physics.Arcade.Sprite {
  public isSearched = false;
  private objectType: ObjectType;
  private contents: LootType;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    objectType: ObjectType,
    contents: LootType,
  ) {
    super(scene, x, y, TEXTURE_MAP[objectType]);
    this.objectType = objectType;
    this.contents = contents;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    this.setDepth(3);
  }

  search(): LootType {
    if (this.isSearched) return LootType.EMPTY;
    this.isSearched = true;
    this.setTexture(OPEN_TEXTURE_MAP[this.objectType]);
    return this.contents;
  }
}
