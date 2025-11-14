import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.rectangle(480, 270, 960, 540, 0x020617, 0.9);
    this.add.text(480, 180, 'JumpMan', {
      fontSize: 64,
      fontFamily: 'Arial Black',
      color: '#f8fafc',
    }).setOrigin(0.5);

    const playButton = this.add.text(480, 320, 'Play', {
      fontSize: 40,
      fontFamily: 'Arial',
      color: '#0ea5e9',
      backgroundColor: '#082f49',
      padding: { x: 32, y: 16 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerup', () => {
      this.scene.start('GameScene');
    });
  }
}
