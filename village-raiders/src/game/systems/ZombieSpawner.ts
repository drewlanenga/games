import Phaser from 'phaser';
import { Zombie } from '../entities/Zombie';
import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  INITIAL_SPAWN_INTERVAL,
  MIN_SPAWN_INTERVAL,
  SPAWN_INTERVAL_DECAY,
  MAX_ZOMBIES,
} from '../constants';

export class ZombieSpawner {
  private scene: Phaser.Scene;
  private zombies: Phaser.Physics.Arcade.Group;
  private walkabilityGrid: number[][];
  private spawnTimer: number;
  private spawnInterval: number;

  constructor(
    scene: Phaser.Scene,
    zombies: Phaser.Physics.Arcade.Group,
    walkabilityGrid: number[][],
  ) {
    this.scene = scene;
    this.zombies = zombies;
    this.walkabilityGrid = walkabilityGrid;
    this.spawnTimer = INITIAL_SPAWN_INTERVAL;
    this.spawnInterval = INITIAL_SPAWN_INTERVAL;
  }

  update(_time: number, delta: number): void {
    this.spawnTimer -= delta;

    if (this.spawnTimer <= 0) {
      if (this.zombies.getLength() < MAX_ZOMBIES) {
        this.spawnZombie();
      }
      this.spawnInterval = Math.max(
        MIN_SPAWN_INTERVAL,
        this.spawnInterval * SPAWN_INTERVAL_DECAY,
      );
      this.spawnTimer = this.spawnInterval;
    }
  }

  private spawnZombie(): void {
    const pos = this.getSpawnPosition();
    if (!pos) return;

    const zombie = new Zombie(this.scene, pos.x, pos.y);
    this.zombies.add(zombie);
  }

  private getSpawnPosition(): { x: number; y: number } | null {
    for (let attempt = 0; attempt < 20; attempt++) {
      const edge = Math.floor(Math.random() * 4);
      let tx: number;
      let ty: number;

      switch (edge) {
        case 0: // top
          tx = Math.floor(Math.random() * MAP_WIDTH);
          ty = 2;
          break;
        case 1: // bottom
          tx = Math.floor(Math.random() * MAP_WIDTH);
          ty = MAP_HEIGHT - 3;
          break;
        case 2: // left
          tx = 2;
          ty = Math.floor(Math.random() * MAP_HEIGHT);
          break;
        default: // right
          tx = MAP_WIDTH - 3;
          ty = Math.floor(Math.random() * MAP_HEIGHT);
          break;
      }

      if (
        ty >= 0 && ty < MAP_HEIGHT &&
        tx >= 0 && tx < MAP_WIDTH &&
        this.walkabilityGrid[ty][tx] === 0
      ) {
        return {
          x: tx * TILE_SIZE + TILE_SIZE / 2,
          y: ty * TILE_SIZE + TILE_SIZE / 2,
        };
      }
    }
    return null;
  }
}
