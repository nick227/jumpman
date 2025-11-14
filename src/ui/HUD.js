import { GAME_WIDTH } from '../config/constants.js';

export default class HUD {
  constructor(scene) {
    this.scene = scene;
    this.coins = 0;
    this.multiplier = 1;
    this.progressPercent = 0;

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(20);

    this.coinIcon = scene.add.circle(32, 32, 14, 0xfacc15).setStrokeStyle(2, 0x78350f);
    this.coinText = scene.add.text(56, 20, '0', {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#f8fafc',
    });

    this.multiplierText = scene.add.text(56, 48, 'x1.0', {
      fontSize: 20,
      fontFamily: 'Arial',
      color: '#f8fafc',
    });

    this.progressText = scene.add.text(GAME_WIDTH - 120, 24, '0%', {
      fontSize: 20,
      fontFamily: 'Arial',
      color: '#f8fafc',
    });

    this.container.add([this.coinIcon, this.coinText, this.multiplierText, this.progressText]);
  }

  updateCoins(coins) {
    this.coins = coins;
    this.coinText.setText(`${coins}`);
  }

  updateMultiplier(multiplier) {
    this.multiplier = multiplier;
    this.multiplierText.setText(`x${multiplier.toFixed(1)}`);
    this.scene.tweens.add({
      targets: this.multiplierText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 120,
    });
  }

  updateProgress(progress) {
    this.progressPercent = progress;
    this.progressText.setText(`${Math.min(100, Math.round(progress * 100))}%`);
  }
}
