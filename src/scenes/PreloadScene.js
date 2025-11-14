import Phaser from 'phaser';
import { AUDIO_EFFECTS } from '../config/audioMap.js';

const RECT_TEXTURES = [
  { key: 'platform', color: 0x1d4ed8, w: 256, h: 32 },
  { key: 'pad', color: 0xf97316, w: 64, h: 16 },
  { key: 'coin', color: 0xfacc15, w: 20, h: 20 },
  { key: 'ring', color: 0xfda4af, w: 36, h: 36 },
  { key: 'spike', color: 0xf43f5e, w: 32, h: 32 },
  { key: 'smasher', color: 0x64748b, w: 80, h: 40 },
  { key: 'enemy-crawler', color: 0x22c55e, w: 48, h: 32 },
  { key: 'enemy-flyer', color: 0xa855f7, w: 32, h: 24 },
];

const PLAYER_FRAME_SIZE = { width: 64, height: 80 };

const PLAYER_FRAMES = [
  { key: 'player-run-1', drawer: (gfx) => drawRunningPose(gfx, PLAYER_FRAME_SIZE, 1) },
  { key: 'player-run-2', drawer: (gfx) => drawRunningPose(gfx, PLAYER_FRAME_SIZE, -1) },
  { key: 'player-air', drawer: (gfx) => drawAirPose(gfx, PLAYER_FRAME_SIZE, false) },
  { key: 'player-air-boost', drawer: (gfx) => drawAirPose(gfx, PLAYER_FRAME_SIZE, true) },
];

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    RECT_TEXTURES.forEach(({ key, color, w, h }) => {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, 0, w, h);
      gfx.generateTexture(key, w, h);
      gfx.destroy();
    });

    PLAYER_FRAMES.forEach(({ key, drawer }) => {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.clear();
      gfx.lineStyle(4, 0xffffff, 1);
      drawer(gfx);
      gfx.generateTexture(key, PLAYER_FRAME_SIZE.width, PLAYER_FRAME_SIZE.height);
      gfx.destroy();
    });

    for (let i = 0; i < AUDIO_EFFECTS.length; i += 1) {
      const { key, files } = AUDIO_EFFECTS[i];
      const sources = [];
      if (files.ogg) {
        sources.push(files.ogg);
      }
      if (files.mp3) {
        sources.push(files.mp3);
      }
      if (sources.length > 0) {
        this.load.audio(key, sources);
      }
    }
  }

  create() {
    this.scene.start('MenuScene');
  }
}

function drawRunningPose(gfx, size, direction = 1) {
  const core = drawStickFigureCore(gfx, size);
  const stride = 16 * direction;
  const hipY = core.torsoBottom;
  const groundY = size.height - 6;

  // Pumping arms
  gfx.lineBetween(core.centerX, core.torsoTop + 8, core.centerX - stride, core.torsoTop + 12);
  gfx.lineBetween(core.centerX, core.torsoTop + 8, core.centerX + stride * 0.6, core.torsoTop - 2);

  // Long stride legs
  gfx.lineBetween(core.centerX - 4, hipY, core.centerX - stride, groundY);
  gfx.lineBetween(core.centerX + 4, hipY, core.centerX + stride * 0.6, groundY - 10);

  drawHair(gfx, core.centerX, core.headTop, -direction * 2, 10);
}

function drawAirPose(gfx, size, boost) {
  const core = drawStickFigureCore(gfx, size);
  const hipY = core.torsoBottom;
  const groundY = size.height - 10;

  // Arms stretched for stability
  gfx.lineBetween(core.centerX, core.torsoTop + 4, core.centerX - 18, core.torsoTop + 2);
  gfx.lineBetween(core.centerX, core.torsoTop + 4, core.centerX + 18, core.torsoTop + 2);

  // Bent knees to sell airtime
  drawBentLeg(gfx, core.centerX - 4, hipY, core.centerX - 14, hipY + 6, core.centerX - 8, groundY - 6);
  drawBentLeg(gfx, core.centerX + 4, hipY, core.centerX + 16, hipY + 4, core.centerX + 22, groundY - 4);

  const hairLean = boost ? -8 : -3;
  const hairLength = boost ? 18 : 12;
  drawHair(gfx, core.centerX, core.headTop, hairLean, hairLength);
}

function drawStickFigureCore(gfx, size) {
  const { width, height } = size;
  const centerX = width / 2;
  const headRadius = 10;
  const headY = 18;
  const torsoTop = headY + headRadius - 2;
  const torsoBottom = torsoTop + 26;

  gfx.strokeCircle(centerX, headY, headRadius);
  gfx.lineBetween(centerX, torsoTop, centerX, torsoBottom);

  return {
    centerX,
    torsoTop,
    torsoBottom,
    headTop: headY - headRadius,
  };
}

function drawBentLeg(gfx, hipX, hipY, kneeX, kneeY, footX, footY) {
  gfx.lineBetween(hipX, hipY, kneeX, kneeY);
  gfx.lineBetween(kneeX, kneeY, footX, footY);
}

function drawHair(gfx, centerX, startY, lean, length) {
  const offsets = [-4, 0, 4];
  for (let i = 0; i < offsets.length; i += 1) {
    const baseX = centerX + offsets[i];
    gfx.lineBetween(baseX, startY, baseX + lean, startY - length);
  }
}
