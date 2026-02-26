import Phaser from 'phaser';
import { MAX_HP, MAX_KEYS, STARTING_AMMO } from '../constants';

export class UIScene extends Phaser.Scene {
  private hearts: Phaser.GameObjects.Image[] = [];
  private keyText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private hp = MAX_HP;
  private keys = 0;
  private ammo = STARTING_AMMO;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(data: { hp: number; maxHp: number; keys: number; maxKeys: number; ammo?: number }): void {
    this.hp = data.hp ?? MAX_HP;
    this.keys = data.keys ?? 0;
    this.ammo = data.ammo ?? STARTING_AMMO;

    // Draw hearts
    for (let i = 0; i < MAX_HP; i++) {
      const heart = this.add.image(16 + i * 18, 16, 'icon-heart-full');
      heart.setScale(1.5);
      heart.setScrollFactor(0);
      this.hearts.push(heart);
    }

    // Key counter
    this.add.image(this.scale.width - 100, 16, 'icon-key').setScale(1.5).setScrollFactor(0);
    this.keyText = this.add.text(this.scale.width - 80, 10, `${this.keys}/${MAX_KEYS}`, {
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setScrollFactor(0);

    // Ammo counter (below key counter)
    this.add.image(this.scale.width - 100, 40, 'loot-meatball').setScale(1.5).setScrollFactor(0);
    this.ammoText = this.add.text(this.scale.width - 80, 34, `${this.ammo}`, {
      fontSize: '16px',
      color: '#b5651d',
      fontStyle: 'bold',
    }).setScrollFactor(0);

    // Listen for events from GameScene
    this.events.on('hp-changed', (newHp: number) => {
      this.hp = newHp;
      this.updateHearts();
    });

    this.events.on('key-collected', (newKeys: number) => {
      this.keys = newKeys;
      this.keyText.setText(`${this.keys}/${MAX_KEYS}`);
    });

    this.events.on('ammo-changed', (newAmmo: number) => {
      this.ammo = newAmmo;
      this.ammoText.setText(`${this.ammo}`);
    });
  }

  private updateHearts(): void {
    for (let i = 0; i < MAX_HP; i++) {
      this.hearts[i].setTexture(i < this.hp ? 'icon-heart-full' : 'icon-heart-empty');
    }
  }

  shutdown(): void {
    this.events.off('hp-changed');
    this.events.off('key-collected');
    this.events.off('ammo-changed');
    this.hearts = [];
  }
}
