import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.add.text(480, 270, 'JumpMan', {
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#38bdf8',
    }).setOrigin(0.5);

    this.time.delayedCall(500, () => {
      this.scene.start('PreloadScene');
    });
  }
}
