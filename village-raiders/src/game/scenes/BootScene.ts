import Phaser from 'phaser';
import { SpriteGenerator } from '../assets/SpriteGenerator';
import { buildCompositeTileset } from '../map/TileRegistry';
import { AudioManager } from '../systems/AudioManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'Loading...', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Generate all programmatic textures
    SpriteGenerator.generateAll(this);

    // Build composite tileset from individual tile textures
    buildCompositeTileset(this);

    // Create player animations
    this.anims.create({
      key: 'player-walk-down',
      frames: [{ key: 'player-sheet', frame: 0 }, { key: 'player-sheet', frame: 1 }, { key: 'player-sheet', frame: 0 }, { key: 'player-sheet', frame: 2 }],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-walk-right',
      frames: [{ key: 'player-sheet', frame: 3 }, { key: 'player-sheet', frame: 4 }, { key: 'player-sheet', frame: 3 }, { key: 'player-sheet', frame: 5 }],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-walk-up',
      frames: [{ key: 'player-sheet', frame: 6 }, { key: 'player-sheet', frame: 7 }, { key: 'player-sheet', frame: 6 }, { key: 'player-sheet', frame: 8 }],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-walk-left',
      frames: [{ key: 'player-sheet', frame: 9 }, { key: 'player-sheet', frame: 10 }, { key: 'player-sheet', frame: 9 }, { key: 'player-sheet', frame: 11 }],
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'player-idle-down',
      frames: [{ key: 'player-sheet', frame: 0 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'player-idle-right',
      frames: [{ key: 'player-sheet', frame: 3 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'player-idle-up',
      frames: [{ key: 'player-sheet', frame: 6 }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'player-idle-left',
      frames: [{ key: 'player-sheet', frame: 9 }],
      frameRate: 1,
    });

    // Create zombie animations
    this.anims.create({
      key: 'zombie-walk-down',
      frames: [{ key: 'zombie-sheet', frame: 0 }, { key: 'zombie-sheet', frame: 1 }],
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'zombie-walk-right',
      frames: [{ key: 'zombie-sheet', frame: 2 }, { key: 'zombie-sheet', frame: 3 }],
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'zombie-walk-up',
      frames: [{ key: 'zombie-sheet', frame: 4 }, { key: 'zombie-sheet', frame: 5 }],
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'zombie-walk-left',
      frames: [{ key: 'zombie-sheet', frame: 6 }, { key: 'zombie-sheet', frame: 7 }],
      frameRate: 4,
      repeat: -1,
    });

    // Generate audio
    AudioManager.generateAll(this);

    this.scene.start('MenuScene');
  }
}
