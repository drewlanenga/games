import Phaser from 'phaser';
import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  MAX_HP,
  PLAYER_SPEED,
  PLAYER_BOOSTED_SPEED,
  INVINCIBILITY_DURATION,
  SPEED_BOOST_DURATION,
  SHIELD_DURATION,
  SEARCH_RANGE,
  MAX_KEYS,
} from '../constants';
import { generateVillage } from '../map/VillageGenerator';
import { COLLIDABLE_TILES, FLOOR_TILES } from '../map/TileRegistry';
import { MapData, LootType } from '../types';
import { Player } from '../entities/Player';
import { SearchableObject } from '../entities/SearchableObject';
import { ZombieSpawner } from '../systems/ZombieSpawner';
import { Zombie } from '../entities/Zombie';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private mapKey!: Phaser.Input.Keyboard.Key;
  private mapData!: MapData;
  private structureLayer!: Phaser.Tilemaps.TilemapLayer;
  private searchableObjects!: Phaser.Physics.Arcade.StaticGroup;
  private zombies!: Phaser.Physics.Arcade.Group;
  private zombieSpawner!: ZombieSpawner;
  private hp = MAX_HP;
  private keysCollected = 0;
  private isInvincible = false;
  private invincibilityTimer = 0;
  private hasSpeedBoost = false;
  private speedBoostTimer = 0;
  private hasShield = false;
  private shieldTimer = 0;
  private minimapCam!: Phaser.Cameras.Scene2D.Camera;
  private minimapVisible = false;
  private playerDot!: Phaser.GameObjects.Rectangle;
  private foundKeyDots: Phaser.GameObjects.Rectangle[] = [];
  private jailDot!: Phaser.GameObjects.Rectangle;
  private walkabilityGrid!: number[][];
  private floorTilePositions!: Set<string>;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Reset state
    this.hp = MAX_HP;
    this.keysCollected = 0;
    this.isInvincible = false;
    this.invincibilityTimer = 0;
    this.hasSpeedBoost = false;
    this.speedBoostTimer = 0;
    this.hasShield = false;
    this.shieldTimer = 0;
    this.minimapVisible = false;
    this.foundKeyDots = [];

    // Generate village
    this.mapData = generateVillage();

    // Create tilemap
    const map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
    });

    const tileset = map.addTilesetImage('village-tileset', 'village-tileset', TILE_SIZE, TILE_SIZE)!;

    // Ground layer
    const groundLayer = map.createBlankLayer('ground', tileset)!;
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        groundLayer.putTileAt(this.mapData.ground[y][x], x, y);
      }
    }

    // Structure layer
    this.structureLayer = map.createBlankLayer('structures', tileset)!;
    this.floorTilePositions = new Set();
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.mapData.structures[y][x];
        if (tile !== -1) {
          this.structureLayer.putTileAt(tile, x, y);
          if (FLOOR_TILES.includes(tile)) {
            this.floorTilePositions.add(`${x},${y}`);
          }
        }
      }
    }

    // Set collision on collidable tiles
    this.structureLayer.setCollision(COLLIDABLE_TILES);

    // Decoration layer (rendered above player)
    const decorLayer = map.createBlankLayer('decoration', tileset)!;
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.mapData.decoration[y][x];
        if (tile !== -1) {
          decorLayer.putTileAt(tile, x, y);
        }
      }
    }
    decorLayer.setDepth(10);

    // Build walkability grid for pathfinding
    this.walkabilityGrid = [];
    const blocked = new Set(COLLIDABLE_TILES);
    for (let y = 0; y < MAP_HEIGHT; y++) {
      this.walkabilityGrid[y] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        const structTile = this.mapData.structures[y][x];
        this.walkabilityGrid[y][x] = (structTile !== -1 && blocked.has(structTile)) ? 1 : 0;
      }
    }

    // Create player
    const spawnPx = this.mapData.playerSpawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnPy = this.mapData.playerSpawn.y * TILE_SIZE + TILE_SIZE / 2;
    this.player = new Player(this, spawnPx, spawnPy);
    this.physics.add.collider(this.player, this.structureLayer);

    // Create searchable objects
    this.searchableObjects = this.physics.add.staticGroup({ classType: SearchableObject });
    for (const placement of this.mapData.objectPlacements) {
      const obj = new SearchableObject(
        this,
        placement.x * TILE_SIZE + TILE_SIZE / 2,
        placement.y * TILE_SIZE + TILE_SIZE / 2,
        placement.type,
        placement.contents,
      );
      this.searchableObjects.add(obj, false); // false = don't re-add to scene/physics
    }

    // Create zombie group
    this.zombies = this.physics.add.group({ classType: Zombie });
    this.zombieSpawner = new ZombieSpawner(this, this.zombies, this.walkabilityGrid);

    // Zombie collision with walls
    this.physics.add.collider(this.zombies, this.structureLayer);

    // Zombie-player overlap
    this.physics.add.overlap(this.player, this.zombies, () => {
      this.onZombieContact();
    });

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.mapKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    // World and camera setup
    const worldW = MAP_WIDTH * TILE_SIZE;
    const worldH = MAP_HEIGHT * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Minimap camera
    const mmW = 200;
    const mmH = 150;
    this.minimapCam = this.cameras.add(
      this.scale.width - mmW - 10,
      10,
      mmW,
      mmH,
    );
    this.minimapCam.setZoom(mmW / worldW);
    this.minimapCam.setBounds(0, 0, worldW, worldH);
    this.minimapCam.setScroll(0, 0);
    this.minimapCam.setBackgroundColor(0x002200);
    this.minimapCam.setAlpha(0);
    this.minimapCam.setName('minimap');

    // Minimap dots
    this.playerDot = this.add.rectangle(spawnPx, spawnPy, 40, 40, 0x00ff00);
    this.playerDot.setDepth(20);
    this.cameras.main.ignore(this.playerDot);

    // Jail dot (always visible on minimap)
    const jailPx = this.mapData.jailDoor.x * TILE_SIZE + TILE_SIZE / 2;
    const jailPy = this.mapData.jailDoor.y * TILE_SIZE + TILE_SIZE / 2;
    this.jailDot = this.add.rectangle(jailPx, jailPy, 50, 50, 0xff0000);
    this.jailDot.setDepth(20);
    this.cameras.main.ignore(this.jailDot);

    // Map toggle
    this.mapKey.on('down', () => {
      this.minimapVisible = !this.minimapVisible;
      this.minimapCam.setAlpha(this.minimapVisible ? 0.85 : 0);
    });

    // Launch UI scene
    this.scene.launch('UIScene', {
      hp: this.hp,
      maxHp: MAX_HP,
      keys: this.keysCollected,
      maxKeys: MAX_KEYS,
    });
  }

  update(time: number, delta: number): void {
    // Player movement
    let vx = 0;
    let vy = 0;
    const speed = this.hasSpeedBoost ? PLAYER_BOOSTED_SPEED : PLAYER_SPEED;

    if (this.cursors.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown) vx = speed;
    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.player.setVelocity(vx, vy);

    // Animations
    if (vx < 0) this.player.play('player-walk-left', true);
    else if (vx > 0) this.player.play('player-walk-right', true);
    else if (vy < 0) this.player.play('player-walk-up', true);
    else if (vy > 0) this.player.play('player-walk-down', true);
    else {
      const anim = this.player.anims.currentAnim;
      if (anim) {
        const dir = anim.key.replace('player-walk-', '').replace('player-idle-', '');
        this.player.play(`player-idle-${dir}`, true);
      }
    }

    // Search interaction
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.trySearch();
    }

    // Invincibility timer
    if (this.isInvincible) {
      this.invincibilityTimer -= delta;
      this.player.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.3);
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
        this.player.setAlpha(1);
      }
    }

    // Speed boost timer
    if (this.hasSpeedBoost) {
      this.speedBoostTimer -= delta;
      if (this.speedBoostTimer <= 0) {
        this.hasSpeedBoost = false;
      }
    }

    // Shield timer
    if (this.hasShield) {
      this.shieldTimer -= delta;
      this.player.setTint(0x44aaff);
      if (this.shieldTimer <= 0) {
        this.hasShield = false;
        this.player.clearTint();
      }
    }

    // Update zombies
    this.zombieSpawner.update(time, delta);

    const zombieArr = this.zombies.getChildren() as Zombie[];
    for (const zombie of zombieArr) {
      zombie.moveToward(this.player.x, this.player.y, this.floorTilePositions);
    }

    // Update minimap player dot
    this.playerDot.setPosition(this.player.x, this.player.y);
  }

  private trySearch(): void {
    // Check if at jail door with all keys
    if (this.keysCollected >= MAX_KEYS) {
      const jailPx = this.mapData.jailDoor.x * TILE_SIZE + TILE_SIZE / 2;
      const jailPy = this.mapData.jailDoor.y * TILE_SIZE + TILE_SIZE / 2;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, jailPx, jailPy);
      if (dist < SEARCH_RANGE * 2) {
        this.gameWin();
        return;
      }
    }

    const objects = this.searchableObjects.getChildren() as SearchableObject[];
    let closest: SearchableObject | null = null;
    let closestDist = Infinity;

    for (const obj of objects) {
      if (obj.isSearched) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (dist < SEARCH_RANGE && dist < closestDist) {
        closest = obj;
        closestDist = dist;
      }
    }

    if (closest) {
      const loot = closest.search();
      this.playSfx('sfx-object-break');
      this.applyLoot(loot, closest.x, closest.y);
    }
  }

  private applyLoot(loot: LootType, x: number, y: number): void {
    switch (loot) {
      case LootType.KEY:
        this.keysCollected++;
        this.scene.get('UIScene').events.emit('key-collected', this.keysCollected);
        this.playSfx('sfx-key-pickup');
        this.showFloatingText(x, y, '+1 KEY!', '#ffd700');
        // Add key dot on minimap
        const dot = this.add.rectangle(x, y, 30, 30, 0xffd700);
        dot.setDepth(20);
        this.cameras.main.ignore(dot);
        this.foundKeyDots.push(dot);
        break;
      case LootType.HEART:
        if (this.hp < MAX_HP) {
          this.hp++;
          this.scene.get('UIScene').events.emit('hp-changed', this.hp);
          this.showFloatingText(x, y, '+1 HP', '#ff2222');
        }
        break;
      case LootType.SPEED:
        this.hasSpeedBoost = true;
        this.speedBoostTimer = SPEED_BOOST_DURATION;
        this.showFloatingText(x, y, 'SPEED!', '#44aaff');
        break;
      case LootType.SHIELD:
        this.hasShield = true;
        this.shieldTimer = SHIELD_DURATION;
        this.showFloatingText(x, y, 'SHIELD!', '#ffdd00');
        break;
      case LootType.EMPTY:
        this.showFloatingText(x, y, 'Empty...', '#888888');
        break;
    }
  }

  private showFloatingText(x: number, y: number, text: string, color: string): void {
    const txt = this.add.text(x, y - 10, text, {
      fontSize: '10px',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => txt.destroy(),
    });
  }

  private onZombieContact(): void {
    if (this.isInvincible || this.hasShield) return;

    this.hp--;
    this.isInvincible = true;
    this.invincibilityTimer = INVINCIBILITY_DURATION;

    this.scene.get('UIScene').events.emit('hp-changed', this.hp);

    this.playSfx('sfx-heart-loss');
    this.cameras.main.flash(200, 255, 0, 0, true);

    if (this.hp <= 0) {
      this.gameLose();
    }
  }

  private gameWin(): void {
    this.playSfx('sfx-win');
    this.scene.stop('UIScene');
    this.scene.start('GameOverScene', { won: true });
  }

  private gameLose(): void {
    this.playSfx('sfx-lose');
    this.scene.stop('UIScene');
    this.scene.start('GameOverScene', { won: false });
  }

  private playSfx(key: string): void {
    try {
      if (this.sound.get(key) || this.cache.audio.has(key)) {
        this.sound.play(key, { volume: 0.5 });
      }
    } catch {
      // Audio may not be ready yet
    }
  }

  shutdown(): void {
    this.mapKey.off('down');
    if (this.minimapCam) {
      this.cameras.remove(this.minimapCam);
    }
  }
}
