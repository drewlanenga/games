import Phaser from 'phaser';

export class TouchControlsScene extends Phaser.Scene {
  public dpadState = { left: false, right: false, up: false, down: false };

  // D-pad geometry (in 1024x768 logical space)
  private readonly DPAD_CX = 120;
  private readonly DPAD_CY = 640;
  private readonly DPAD_RADIUS = 70;
  private readonly DEAD_ZONE = 15;

  // MAP button geometry
  private readonly MAP_BTN_X = 950;
  private readonly MAP_BTN_Y = 700;
  private readonly MAP_BTN_R = 30;

  // FIRE button geometry
  private readonly FIRE_BTN_X = 870;
  private readonly FIRE_BTN_Y = 700;
  private readonly FIRE_BTN_R = 30;

  constructor() {
    super({ key: 'TouchControlsScene' });
  }

  create(): void {
    this.drawDpad();
    this.drawMapButton();
    this.drawFireButton();

    this.input.on('pointerdown', this.updateDpad, this);
    this.input.on('pointermove', this.updateDpad, this);
    this.input.on('pointerup', this.updateDpad, this);
  }

  private drawDpad(): void {
    const g = this.add.graphics();
    const cx = this.DPAD_CX;
    const cy = this.DPAD_CY;
    const r = this.DPAD_RADIUS;

    // Background circle
    g.fillStyle(0x000000, 0.35);
    g.fillCircle(cx, cy, r + 10);
    g.lineStyle(2, 0xffffff, 0.3);
    g.strokeCircle(cx, cy, r + 10);

    // Arrow triangles
    const arrowSize = 14;
    const offset = 42;
    g.fillStyle(0xffffff, 0.6);

    // Up arrow
    g.fillTriangle(
      cx, cy - offset - arrowSize,
      cx - arrowSize, cy - offset + arrowSize,
      cx + arrowSize, cy - offset + arrowSize,
    );
    // Down arrow
    g.fillTriangle(
      cx, cy + offset + arrowSize,
      cx - arrowSize, cy + offset - arrowSize,
      cx + arrowSize, cy + offset - arrowSize,
    );
    // Left arrow
    g.fillTriangle(
      cx - offset - arrowSize, cy,
      cx - offset + arrowSize, cy - arrowSize,
      cx - offset + arrowSize, cy + arrowSize,
    );
    // Right arrow
    g.fillTriangle(
      cx + offset + arrowSize, cy,
      cx + offset - arrowSize, cy - arrowSize,
      cx + offset - arrowSize, cy + arrowSize,
    );

    g.setScrollFactor(0);
    g.setDepth(100);
  }

  private drawMapButton(): void {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.4);
    g.fillCircle(this.MAP_BTN_X, this.MAP_BTN_Y, this.MAP_BTN_R);
    g.lineStyle(2, 0xffffff, 0.5);
    g.strokeCircle(this.MAP_BTN_X, this.MAP_BTN_Y, this.MAP_BTN_R);
    g.setScrollFactor(0);
    g.setDepth(100);

    const label = this.add.text(this.MAP_BTN_X, this.MAP_BTN_Y, 'MAP', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    label.setAlpha(0.7);
  }

  private drawFireButton(): void {
    const g = this.add.graphics();
    g.fillStyle(0x880000, 0.5);
    g.fillCircle(this.FIRE_BTN_X, this.FIRE_BTN_Y, this.FIRE_BTN_R);
    g.lineStyle(2, 0xff4444, 0.6);
    g.strokeCircle(this.FIRE_BTN_X, this.FIRE_BTN_Y, this.FIRE_BTN_R);
    g.setScrollFactor(0);
    g.setDepth(100);

    const label = this.add.text(this.FIRE_BTN_X, this.FIRE_BTN_Y, 'FIRE', {
      fontSize: '11px',
      color: '#ff6666',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    label.setAlpha(0.8);
  }

  private updateDpad(): void {
    // Reset state
    this.dpadState.left = false;
    this.dpadState.right = false;
    this.dpadState.up = false;
    this.dpadState.down = false;

    const pointers = this.input.manager.pointers;
    for (const ptr of pointers) {
      if (!ptr.isDown) continue;

      // Check MAP button hit (only on initial press)
      if (ptr.justDown) {
        const mapDist = Phaser.Math.Distance.Between(
          ptr.x, ptr.y, this.MAP_BTN_X, this.MAP_BTN_Y,
        );
        if (mapDist <= this.MAP_BTN_R) {
          this.events.emit('toggle-minimap');
          continue;
        }

        // Check FIRE button hit
        const fireDist = Phaser.Math.Distance.Between(
          ptr.x, ptr.y, this.FIRE_BTN_X, this.FIRE_BTN_Y,
        );
        if (fireDist <= this.FIRE_BTN_R) {
          this.events.emit('fire');
          continue;
        }
      }

      // Check d-pad zone
      const dx = ptr.x - this.DPAD_CX;
      const dy = ptr.y - this.DPAD_CY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only process pointers within d-pad radius
      if (dist > this.DPAD_RADIUS + 20 || dist < this.DEAD_ZONE) continue;

      // Use angle to determine direction — allows diagonals
      const angle = Math.atan2(dy, dx);
      // Right: -45° to 45°, Down: 45° to 135°, Left: 135° to -135°, Up: -135° to -45°
      if (angle > -Math.PI * 0.75 && angle < -Math.PI * 0.25) {
        this.dpadState.up = true;
      }
      if (angle > Math.PI * 0.25 && angle < Math.PI * 0.75) {
        this.dpadState.down = true;
      }
      if (angle > Math.PI * 0.75 || angle < -Math.PI * 0.75) {
        this.dpadState.left = true;
      }
      if (angle > -Math.PI * 0.25 && angle < Math.PI * 0.25) {
        this.dpadState.right = true;
      }
    }
  }

  shutdown(): void {
    this.input.off('pointerdown', this.updateDpad, this);
    this.input.off('pointermove', this.updateDpad, this);
    this.input.off('pointerup', this.updateDpad, this);
  }
}
