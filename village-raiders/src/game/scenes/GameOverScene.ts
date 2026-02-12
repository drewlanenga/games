import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { won: boolean }): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const title = data.won ? 'YOU WIN!' : 'GAME OVER';
    const color = data.won ? '#00ff00' : '#ff0000';

    this.add.text(cx, cy - 40, title, {
      fontSize: '48px',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const prompt = this.add.text(cx, cy + 40, 'Press SPACE to Restart', {
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

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }
}
