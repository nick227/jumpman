import Phaser from 'phaser';
import gameConfig from './config/gameConfig.js';

// Create container for Phaser canvas
const appContainer = document.createElement('div');
appContainer.id = 'app';
document.body.appendChild(appContainer);

document.body.style.margin = '0';
document.body.style.backgroundColor = '#020617';

// eslint-disable-next-line no-new
new Phaser.Game(gameConfig);
