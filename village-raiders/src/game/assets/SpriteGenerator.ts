import Phaser from 'phaser';
import { TILE_SIZE } from '../constants';

const T = TILE_SIZE;

function gfx(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.make.graphics({ x: 0, y: 0, add: false } as any);
}

export class SpriteGenerator {
  // ─── Tile Textures (16x16) ───

  static generateTileGrass(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0x4a8c3f);
    g.fillRect(0, 0, T, T);
    // variation dots
    g.fillStyle(0x3d7a33);
    g.fillRect(3, 5, 2, 2);
    g.fillRect(10, 2, 2, 2);
    g.fillRect(7, 12, 2, 2);
    g.fillStyle(0x5a9c4f);
    g.fillRect(12, 9, 2, 2);
    g.fillRect(1, 11, 2, 2);
    g.generateTexture('tile-grass', T, T);
    g.destroy();
  }

  static generateTilePath(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0xc4a86b);
    g.fillRect(0, 0, T, T);
    // stone pattern
    g.fillStyle(0xd4b87b);
    g.fillRect(2, 2, 5, 3);
    g.fillRect(9, 7, 5, 3);
    g.fillRect(1, 11, 6, 3);
    g.fillStyle(0xb49858);
    g.fillRect(8, 1, 6, 3);
    g.fillRect(3, 6, 4, 3);
    g.generateTexture('tile-path', T, T);
    g.destroy();
  }

  static generateTileWall(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0x8b7355);
    g.fillRect(0, 0, T, T);
    // brick lines
    g.lineStyle(1, 0x6b5335);
    g.strokeRect(0, 0, 8, 5);
    g.strokeRect(8, 0, 8, 5);
    g.strokeRect(4, 5, 8, 6);
    g.strokeRect(-4, 5, 8, 6);
    g.strokeRect(12, 5, 8, 6);
    g.strokeRect(0, 11, 8, 5);
    g.strokeRect(8, 11, 8, 5);
    g.generateTexture('tile-wall', T, T);
    g.destroy();
  }

  static generateTileRoof(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0xb5453a);
    g.fillRect(0, 0, T, T);
    // shingle lines
    g.lineStyle(1, 0x943528);
    for (let y = 3; y < T; y += 5) {
      g.lineBetween(0, y, T, y);
    }
    g.generateTexture('tile-roof', T, T);
    g.destroy();
  }

  static generateTileDoor(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0x6b4226);
    g.fillRect(0, 0, T, T);
    // door frame
    g.fillStyle(0x8b5a2b);
    g.fillRect(2, 0, 12, T);
    // doorknob
    g.fillStyle(0xffd700);
    g.fillRect(10, 8, 2, 2);
    g.generateTexture('tile-door', T, T);
    g.destroy();
  }

  static generateTileFloor(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0xd4c4a0);
    g.fillRect(0, 0, T, T);
    g.fillStyle(0xc4b490);
    g.fillRect(0, 0, 8, 8);
    g.fillRect(8, 8, 8, 8);
    g.generateTexture('tile-floor', T, T);
    g.destroy();
  }

  static generateTileFence(scene: Phaser.Scene): void {
    const g = gfx(scene);
    // transparent bg
    g.fillStyle(0x4a8c3f);
    g.fillRect(0, 0, T, T);
    // vertical posts
    g.fillStyle(0x8b6914);
    g.fillRect(1, 2, 3, 12);
    g.fillRect(12, 2, 3, 12);
    // horizontal rails
    g.fillRect(0, 4, T, 2);
    g.fillRect(0, 10, T, 2);
    g.generateTexture('tile-fence', T, T);
    g.destroy();
  }

  static generateTileTreeTrunk(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0x4a8c3f);
    g.fillRect(0, 0, T, T);
    g.fillStyle(0x6b4226);
    g.fillRect(5, 2, 6, 12);
    g.fillStyle(0x5a3520);
    g.fillRect(7, 4, 2, 8);
    g.generateTexture('tile-tree-trunk', T, T);
    g.destroy();
  }

  static generateTileTreeCanopy(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0x2d6b1e);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0x3d8b2e);
    g.fillCircle(6, 6, 4);
    g.generateTexture('tile-tree-canopy', T, T);
    g.destroy();
  }

  static generateTileWater(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0x3a7bbf);
    g.fillRect(0, 0, T, T);
    g.lineStyle(1, 0x5a9bdf);
    g.lineBetween(2, 4, 10, 4);
    g.lineBetween(6, 9, 14, 9);
    g.lineBetween(1, 13, 8, 13);
    g.generateTexture('tile-water', T, T);
    g.destroy();
  }

  static generateTileJailWall(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0x555555);
    g.fillRect(0, 0, T, T);
    // vertical bars
    g.fillStyle(0x333333);
    for (let x = 2; x < T; x += 4) {
      g.fillRect(x, 0, 2, T);
    }
    g.generateTexture('tile-jail-wall', T, T);
    g.destroy();
  }

  static generateTileJailDoor(scene: Phaser.Scene): void {
    const g = gfx(scene);
    g.fillStyle(0x555555);
    g.fillRect(0, 0, T, T);
    // vertical bars
    g.fillStyle(0x333333);
    for (let x = 2; x < T; x += 4) {
      g.fillRect(x, 0, 2, T);
    }
    // gold lock
    g.fillStyle(0xffd700);
    g.fillRect(6, 6, 4, 4);
    g.generateTexture('tile-jail-door', T, T);
    g.destroy();
  }

  // ─── Player Spritesheet (16x24, 12 frames: 4 dirs x 3 frames) ───
  // Frame order: [down0, down1, down2, right0, right1, right2, up0, up1, up2, left0, left1, left2]

  static generatePlayerSheet(scene: Phaser.Scene): void {
    const fw = 16;
    const fh = 24;
    const totalW = fw * 12;
    const g = gfx(scene);

    for (let i = 0; i < 12; i++) {
      const ox = i * fw;
      const dir = Math.floor(i / 3); // 0=down, 1=right, 2=up, 3=left
      const frame = i % 3; // 0=stand, 1=step-left, 2=step-right

      // Body (orange gi)
      g.fillStyle(0xff6a00);
      g.fillRect(ox + 3, 8, 10, 10);

      // Belt (dark blue)
      g.fillStyle(0x1a237e);
      g.fillRect(ox + 3, 14, 10, 2);

      // Legs
      g.fillStyle(0xff6a00);
      const legOffset = frame === 1 ? -1 : frame === 2 ? 1 : 0;
      g.fillRect(ox + 4 + legOffset, 18, 3, 4);
      g.fillRect(ox + 9 - legOffset, 18, 3, 4);

      // Boots (dark)
      g.fillStyle(0x333366);
      g.fillRect(ox + 4 + legOffset, 21, 3, 3);
      g.fillRect(ox + 9 - legOffset, 21, 3, 3);

      // Head (skin)
      g.fillStyle(0xffcc99);
      g.fillRect(ox + 4, 1, 8, 8);

      // Spiky hair (DBZ style - 3 spikes)
      g.fillStyle(0x111111);
      // base hair
      g.fillRect(ox + 3, 0, 10, 4);
      // center spike
      g.fillTriangle(ox + 8, -4, ox + 6, 2, ox + 10, 2);
      // left spike
      g.fillTriangle(ox + 4, -2, ox + 3, 3, ox + 7, 2);
      // right spike
      g.fillTriangle(ox + 12, -2, ox + 9, 2, ox + 13, 3);

      // Eyes
      if (dir === 0) {
        // facing down - show eyes
        g.fillStyle(0x000000);
        g.fillRect(ox + 5, 5, 2, 2);
        g.fillRect(ox + 9, 5, 2, 2);
      } else if (dir === 2) {
        // facing up - show hair back
        g.fillStyle(0x111111);
        g.fillRect(ox + 4, 4, 8, 4);
      } else if (dir === 1) {
        // facing right
        g.fillStyle(0x000000);
        g.fillRect(ox + 9, 5, 2, 2);
      } else {
        // facing left
        g.fillStyle(0x000000);
        g.fillRect(ox + 5, 5, 2, 2);
      }

      // Arms
      g.fillStyle(0xffcc99);
      if (dir === 1) {
        // right-facing: one arm visible
        g.fillRect(ox + 12, 9, 2, 6);
      } else if (dir === 3) {
        // left-facing: one arm visible
        g.fillRect(ox + 2, 9, 2, 6);
      } else {
        // front/back: both arms
        g.fillRect(ox + 1, 9, 2, 6);
        g.fillRect(ox + 13, 9, 2, 6);
      }
    }

    g.generateTexture('player-sheet', totalW, fh);
    g.destroy();

    // Register frames
    const tex = scene.textures.get('player-sheet');
    for (let i = 0; i < 12; i++) {
      tex.add(i, 0, i * fw, 0, fw, fh);
    }
  }

  // ─── Zombie Spritesheet (16x24, 8 frames: 4 dirs x 2 frames) ───

  static generateZombieSheet(scene: Phaser.Scene): void {
    const fw = 16;
    const fh = 24;
    const totalW = fw * 8;
    const g = gfx(scene);

    for (let i = 0; i < 8; i++) {
      const ox = i * fw;
      const dir = Math.floor(i / 2);
      const frame = i % 2;

      // Body (torn dark clothes)
      g.fillStyle(0x4a4a3a);
      g.fillRect(ox + 3, 8, 10, 10);

      // Torn details
      g.fillStyle(0x3a3a2a);
      g.fillRect(ox + 4, 12, 2, 3);
      g.fillRect(ox + 10, 10, 2, 4);

      // Legs (shambling offset)
      const legOffset = frame === 0 ? -2 : 2;
      g.fillStyle(0x4a4a3a);
      g.fillRect(ox + 4 + legOffset, 18, 3, 4);
      g.fillRect(ox + 9 - legOffset, 18, 3, 4);

      // Head (green skin)
      g.fillStyle(0x7a9a5a);
      g.fillRect(ox + 4, 1, 8, 8);

      // Messy hair
      g.fillStyle(0x3a3a2a);
      g.fillRect(ox + 3, 0, 10, 3);
      g.fillRect(ox + 3, 1, 2, 4);

      // Eyes (red)
      if (dir === 0) {
        g.fillStyle(0xff0000);
        g.fillRect(ox + 5, 5, 2, 2);
        g.fillRect(ox + 9, 5, 2, 2);
      } else if (dir === 1) {
        g.fillStyle(0xff0000);
        g.fillRect(ox + 9, 5, 2, 2);
      } else if (dir === 3) {
        g.fillStyle(0xff0000);
        g.fillRect(ox + 5, 5, 2, 2);
      }

      // Mouth (zombie gash)
      if (dir === 0) {
        g.fillStyle(0x440000);
        g.fillRect(ox + 6, 7, 4, 1);
      }

      // Extended arms (zombie pose)
      g.fillStyle(0x7a9a5a);
      if (dir === 0) {
        g.fillRect(ox + 1, 8, 2, 7);
        g.fillRect(ox + 13, 8, 2, 7);
      } else if (dir === 1) {
        g.fillRect(ox + 13, 8, 3, 2);
      } else if (dir === 3) {
        g.fillRect(ox + 0, 8, 3, 2);
      } else {
        g.fillRect(ox + 1, 8, 2, 6);
        g.fillRect(ox + 13, 8, 2, 6);
      }
    }

    g.generateTexture('zombie-sheet', totalW, fh);
    g.destroy();

    const tex = scene.textures.get('zombie-sheet');
    for (let i = 0; i < 8; i++) {
      tex.add(i, 0, i * fw, 0, fw, fh);
    }
  }

  // ─── Searchable Objects (16x16) ───

  static generateObjects(scene: Phaser.Scene): void {
    // Crate
    let g = gfx(scene);
    g.fillStyle(0x8b6914);
    g.fillRect(1, 1, 14, 14);
    g.lineStyle(1, 0x6b4914);
    g.strokeRect(1, 1, 14, 14);
    g.lineBetween(1, 8, 15, 8);
    g.lineBetween(8, 1, 8, 15);
    g.generateTexture('obj-crate', T, T);
    g.destroy();

    // Crate open
    g = gfx(scene);
    g.fillStyle(0x8b6914);
    g.fillRect(1, 3, 14, 12);
    g.fillStyle(0xa87d24);
    g.fillRect(2, 0, 12, 4);
    g.lineStyle(1, 0x6b4914);
    g.strokeRect(1, 3, 14, 12);
    g.generateTexture('obj-crate-open', T, T);
    g.destroy();

    // Barrel
    g = gfx(scene);
    g.fillStyle(0x8b5a2b);
    g.fillRect(3, 1, 10, 14);
    g.fillStyle(0x6b4226);
    g.fillRect(2, 3, 12, 2);
    g.fillRect(2, 10, 12, 2);
    g.generateTexture('obj-barrel', T, T);
    g.destroy();

    // Barrel open
    g = gfx(scene);
    g.fillStyle(0x8b5a2b);
    g.fillRect(3, 3, 10, 12);
    g.fillStyle(0x6b4226);
    g.fillRect(2, 5, 12, 2);
    g.fillRect(2, 11, 12, 2);
    g.fillStyle(0x333333);
    g.fillRect(5, 3, 6, 3);
    g.generateTexture('obj-barrel-open', T, T);
    g.destroy();

    // Bush
    g = gfx(scene);
    g.fillStyle(0x3d8b2e);
    g.fillCircle(8, 9, 7);
    g.fillStyle(0x2d6b1e);
    g.fillCircle(5, 7, 4);
    g.fillCircle(11, 8, 3);
    g.generateTexture('obj-bush', T, T);
    g.destroy();

    // Bush searched
    g = gfx(scene);
    g.fillStyle(0x4a8c3f);
    g.fillRect(0, 0, T, T);
    g.fillStyle(0x3d8b2e);
    g.fillRect(2, 10, 4, 3);
    g.fillRect(8, 11, 5, 2);
    g.fillRect(5, 9, 3, 2);
    g.generateTexture('obj-bush-searched', T, T);
    g.destroy();
  }

  // ─── UI Icons ───

  static generateUIIcons(scene: Phaser.Scene): void {
    // Heart full
    let g = gfx(scene);
    g.fillStyle(0xff2222);
    g.fillRect(1, 2, 3, 3);
    g.fillRect(5, 2, 3, 3);
    g.fillRect(0, 3, 9, 3);
    g.fillRect(1, 5, 7, 2);
    g.fillRect(2, 7, 5, 1);
    g.fillRect(3, 8, 3, 1);
    g.fillRect(4, 9, 1, 1);
    g.generateTexture('icon-heart-full', 10, 10);
    g.destroy();

    // Heart empty
    g = gfx(scene);
    g.fillStyle(0x555555);
    g.fillRect(1, 2, 3, 3);
    g.fillRect(5, 2, 3, 3);
    g.fillRect(0, 3, 9, 3);
    g.fillRect(1, 5, 7, 2);
    g.fillRect(2, 7, 5, 1);
    g.fillRect(3, 8, 3, 1);
    g.fillRect(4, 9, 1, 1);
    g.generateTexture('icon-heart-empty', 10, 10);
    g.destroy();

    // Key icon
    g = gfx(scene);
    g.fillStyle(0xffd700);
    g.fillCircle(3, 3, 3);
    g.fillStyle(0x000000);
    g.fillCircle(3, 3, 1);
    g.fillStyle(0xffd700);
    g.fillRect(5, 2, 6, 2);
    g.fillRect(9, 4, 2, 2);
    g.fillRect(7, 4, 2, 2);
    g.generateTexture('icon-key', 12, 8);
    g.destroy();

    // Key gray
    g = gfx(scene);
    g.fillStyle(0x888888);
    g.fillCircle(3, 3, 3);
    g.fillStyle(0x555555);
    g.fillCircle(3, 3, 1);
    g.fillStyle(0x888888);
    g.fillRect(5, 2, 6, 2);
    g.fillRect(9, 4, 2, 2);
    g.fillRect(7, 4, 2, 2);
    g.generateTexture('icon-key-gray', 12, 8);
    g.destroy();
  }

  // ─── Loot Icons ───

  static generateLootIcons(scene: Phaser.Scene): void {
    // Speed boost (blue lightning)
    let g = gfx(scene);
    g.fillStyle(0x44aaff);
    g.fillTriangle(6, 0, 2, 6, 7, 5);
    g.fillTriangle(5, 5, 0, 11, 6, 11);
    g.generateTexture('loot-speed', 10, 12);
    g.destroy();

    // Shield (yellow star)
    g = gfx(scene);
    g.fillStyle(0xffdd00);
    g.fillCircle(5, 5, 5);
    g.fillStyle(0xffaa00);
    g.fillCircle(5, 5, 3);
    g.generateTexture('loot-shield', 10, 10);
    g.destroy();
  }

  // ─── Generate All ───

  static generateAll(scene: Phaser.Scene): void {
    this.generateTileGrass(scene);
    this.generateTilePath(scene);
    this.generateTileWall(scene);
    this.generateTileRoof(scene);
    this.generateTileDoor(scene);
    this.generateTileFloor(scene);
    this.generateTileFence(scene);
    this.generateTileTreeTrunk(scene);
    this.generateTileTreeCanopy(scene);
    this.generateTileWater(scene);
    this.generateTileJailWall(scene);
    this.generateTileJailDoor(scene);
    this.generatePlayerSheet(scene);
    this.generateZombieSheet(scene);
    this.generateObjects(scene);
    this.generateUIIcons(scene);
    this.generateLootIcons(scene);
  }
}
