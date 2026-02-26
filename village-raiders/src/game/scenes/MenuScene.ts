import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const isTouch = this.sys.game.device.input.touch;

    this.add.text(cx, cy - 80, 'VILLAGE RAIDERS', {
      fontSize: '48px',
      color: '#ff6600',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const promptText = isTouch ? 'Tap to Start' : 'Press SPACE to Start';
    const prompt = this.add.text(cx, cy + 20, promptText, {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    const controlsHint = isTouch
      ? 'D-Pad: Move  |  Swipe: Move  |  FIRE: Shoot  |  MAP: Map'
      : 'Arrow Keys: Move  |  Space: Shoot  |  M: Map';
    this.add.text(cx, cy + 80, controlsHint, {
      fontSize: '14px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Keyboard: Space
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });

    // Touch: tap anywhere
    this.input.once('pointerup', () => {
      this.scene.start('GameScene');
    });
  }
}
