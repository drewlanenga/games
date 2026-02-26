import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { won: boolean }): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const isTouch = this.sys.game.device.input.touch;

    const title = data.won ? 'YOU WIN!' : 'GAME OVER';
    const color = data.won ? '#00ff00' : '#ff0000';

    this.add.text(cx, cy - 40, title, {
      fontSize: '48px',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const promptText = isTouch ? 'Tap to Restart' : 'Press SPACE to Restart';
    const prompt = this.add.text(cx, cy + 40, promptText, {
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

    const restart = () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    };

    // Keyboard: Space
    this.input.keyboard!.once('keydown-SPACE', restart);

    // Touch: tap anywhere
    this.input.once('pointerup', restart);
  }
}
