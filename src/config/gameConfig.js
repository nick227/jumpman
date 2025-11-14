import Phaser from 'phaser';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MenuScene from '../scenes/MenuScene.js';
import GameScene from '../scenes/GameScene.js';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, TARGET_FPS } from './constants.js';

export default {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'app',
  backgroundColor: '#0f172a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GRAVITY },
      fps: TARGET_FPS,
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene],
  render: {
    pixelArt: true,
  },
};
