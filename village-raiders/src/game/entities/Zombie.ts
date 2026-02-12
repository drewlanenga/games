import Phaser from 'phaser';
import { ZOMBIE_SPEED, ZOMBIE_BUILDING_SPEED, TILE_SIZE } from '../constants';

export class Zombie extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'zombie-sheet', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(4);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 12);
    body.setOffset(2, 10);

    this.play('zombie-walk-down');
  }

  moveToward(targetX: number, targetY: number, floorTiles: Set<string>): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      this.setVelocity(0, 0);
      return;
    }

    // Check if zombie is inside a building (on floor tile)
    const tileX = Math.floor(this.x / TILE_SIZE);
    const tileY = Math.floor(this.y / TILE_SIZE);
    const isInBuilding = floorTiles.has(`${tileX},${tileY}`);
    const speed = isInBuilding ? ZOMBIE_BUILDING_SPEED : ZOMBIE_SPEED;

    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;
    this.setVelocity(vx, vy);

    // Animation based on dominant direction
    if (Math.abs(dx) > Math.abs(dy)) {
      this.play(dx > 0 ? 'zombie-walk-right' : 'zombie-walk-left', true);
    } else {
      this.play(dy > 0 ? 'zombie-walk-down' : 'zombie-walk-up', true);
    }
  }
}
