import Phaser from 'phaser';
import Player from '../objects/Player.js';
import HUD from '../ui/HUD.js';
import AudioController from '../audio/AudioController.js';
import levelFactory from '../levels/LevelFactory.js';
import {
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  ROCKET_JUMP_STRENGTH,
  ROCKET_RESET_DELAY,
  COIN_VALUE,
  MULTIPLIER_STEP,
  MAX_MULTIPLIER,
  SMASHER_PERIOD,
  SMASHER_CLOSED_TIME,
  PLAYER_MAX_FALL_SPEED,
  FLOATING_TEXT_POOL_SIZE,
  BASE_FRAME_TIME,
  CAMERA_FOLLOW_LERP,
  PAD_COOLDOWN_TINT,
  DEFAULT_LEVEL_KEY,
} from '../config/constants.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.levelData = null;
    this.crawlers = [];
    this.flyerUnits = [];
    this.floatingTextPool = [];
    this.currentCameraLerp = CAMERA_FOLLOW_LERP;
  }

  init(data) {
    const providedKey = data?.levelKey ?? DEFAULT_LEVEL_KEY;
    this.levelKey = providedKey;
    this.levelData = levelFactory.create(this.levelKey);
  }

  create() {
    if (!this.levelData) {
      this.levelKey = DEFAULT_LEVEL_KEY;
      this.levelData = levelFactory.create(this.levelKey);
    }
    const boundsWidth = this.levelData?.bounds?.width ?? LEVEL_WIDTH;
    const boundsHeight = this.levelData?.bounds?.height ?? LEVEL_HEIGHT;
    this.physics.world.setBounds(0, 0, boundsWidth, boundsHeight);

    this.audio = new AudioController(this);
    this.platforms = this.physics.add.staticGroup();
    this.pads = this.physics.add.group({ allowGravity: false, immovable: true });
    this.coins = this.physics.add.staticGroup();
    this.rings = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.flyers = this.physics.add.group({ allowGravity: false, immovable: true });
    this.smashers = [];
    this.crawlers.length = 0;
    this.flyerUnits.length = 0;

    this.createLevel();

    this.player = new Player(this, 120, 450, this.audio);
    this.player.setRespawnPoint(120, 450);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keyup-UP', () => this.player.handleJumpRelease());
    this.input.keyboard.on('keyup-SPACE', () => this.player.handleJumpRelease());
    this.input.on('pointerup', () => this.player.handleJumpRelease());

    this.createColliders();

    this.initFloatingTextPool(FLOATING_TEXT_POOL_SIZE);
    this.hud = new HUD(this);
    this.coinsCollected = 0;
    this.multiplier = 1;

    this.cameras.main.setBounds(0, 0, boundsWidth, boundsHeight);
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setLerp(CAMERA_FOLLOW_LERP, CAMERA_FOLLOW_LERP);
  }

  createLevel() {
    const { platforms, pads, coins, rings, spikes, smashers, crawlers, flyers } = this.levelData;

    for (let i = 0; i < platforms.length; i += 1) {
      const { x, y, w } = platforms[i];
      const platform = this.platforms.create(x, y, 'platform');
      platform.setDisplaySize(w, 32);
      platform.refreshBody();
    }

    for (let i = 0; i < pads.length; i += 1) {
      const { x, y } = pads[i];
      const pad = this.pads.create(x, y, 'pad');
      pad.setDisplaySize(80, 18);
      pad.body.setAllowGravity(false);
      pad.body.setImmovable(true);
      pad.body.setSize(80, 18);
      pad.cooldown = false;
    }

    for (let i = 0; i < coins.length; i += 1) {
      const { x, y } = coins[i];
      const coin = this.coins.create(x, y, 'coin');
      const radius = coin.displayWidth / 2;
      const offset = (coin.displayWidth - radius * 2) / 2;
      coin.body.setCircle(radius, offset, offset);
      coin.refreshBody();
    }

    for (let i = 0; i < rings.length; i += 1) {
      const { x, y } = rings[i];
      const ring = this.rings.create(x, y, 'ring');
      const radius = ring.displayWidth / 2;
      const offset = (ring.displayWidth - radius * 2) / 2;
      ring.body.setCircle(radius, offset, offset);
      ring.refreshBody();
    }

    for (let i = 0; i < spikes.length; i += 1) {
      const { x, y } = spikes[i];
      const spike = this.spikes.create(x, y, 'spike');
      spike.setDisplaySize(32, 32);
      const bodyWidth = spike.displayWidth * 0.6;
      const bodyHeight = spike.displayHeight * 0.85;
      const offsetX = (spike.displayWidth - bodyWidth) / 2;
      const offsetY = spike.displayHeight - bodyHeight;
      spike.body.setSize(bodyWidth, bodyHeight);
      spike.body.setOffset(offsetX, offsetY);
      spike.refreshBody();
    }

    for (let i = 0; i < smashers.length; i += 1) {
      this.createSmasher(smashers[i]);
    }

    for (let i = 0; i < crawlers.length; i += 1) {
      this.createCrawler(crawlers[i]);
    }

    for (let i = 0; i < flyers.length; i += 1) {
      this.createFlyer(flyers[i]);
    }
  }

  createSmasher({ x, topY, gap }) {
    const top = this.physics.add.sprite(x, topY, 'smasher');
    const bottom = this.physics.add.sprite(x, topY + gap, 'smasher');
    top.body.setAllowGravity(false);
    bottom.body.setAllowGravity(false);
    top.setImmovable(true);
    bottom.setImmovable(true);
    bottom.body.moves = false;

    const smasher = { top, bottom, isClosed: false };
    this.smashers.push(smasher);
    top.parentSmasher = smasher;
    bottom.parentSmasher = smasher;

    const closedY = bottom.y - top.displayHeight + 4;
    const travelDuration = Math.max(100, (SMASHER_PERIOD - SMASHER_CLOSED_TIME) / 2);
    this.tweens.timeline({
      targets: top,
      loop: -1,
      tweens: [
        {
          y: closedY,
          duration: travelDuration,
          ease: 'Sine.easeIn',
          onStart: () => {
            smasher.isClosed = false;
          },
        },
        {
          duration: SMASHER_CLOSED_TIME,
          onStart: () => {
            smasher.isClosed = true;
          },
        },
        {
          y: topY,
          duration: travelDuration,
          ease: 'Sine.easeOut',
          onStart: () => {
            smasher.isClosed = false;
          },
        },
      ],
    });

    this.physics.add.collider(top, this.platforms);
  }

  createCrawler({ x, y, left, right, speed }) {
    const crawler = this.enemies.create(x, y, 'enemy-crawler');
    crawler.setCollideWorldBounds(false);
    crawler.body.setAllowGravity(true);
    crawler.setImmovable(false);
    crawler.setVelocityX(speed);
    crawler.patrol = { left, right, speed };
    crawler.setBounceX(1);
    this.crawlers.push(crawler);
  }

  createFlyer({ x, y, amplitude, speed }) {
    const flyer = this.flyers.create(x, y, 'enemy-flyer');
    flyer.startY = y;
    flyer.amplitude = amplitude;
    flyer.angularSpeed = speed * 1000; // level data stored as radians per ms for legacy compatibility
    flyer.phase = 0;
    flyer.body.setAllowGravity(false);
    this.flyerUnits.push(flyer);
  }

  createColliders() {
    this.physics.add.collider(this.player, this.platforms, () => this.player.resetJumps());
    this.physics.add.collider(this.player, this.enemies, (player, enemy) => this.handleEnemyHit(player, enemy));
    this.physics.add.collider(this.player, this.flyers, (player, enemy) => this.handleEnemyHit(player, enemy));
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.pads, this.handlePadBoost, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.rings, this.collectRing, null, this);
    this.physics.add.collider(this.player, this.spikes, () => this.handlePlayerDeath());

    for (let i = 0; i < this.smashers.length; i += 1) {
      const smasher = this.smashers[i];
      this.physics.add.collider(
        this.player,
        smasher.top,
        this.handleSmasherCollision,
        undefined,
        this
      );
      this.physics.add.collider(
        this.player,
        smasher.bottom,
        this.handleSmasherCollision,
        undefined,
        this
      );
    }
  }

  handleSmasherCollision(player, smasherPiece) {
    const parent = smasherPiece.parentSmasher;
    if (parent?.isClosed) {
      this.handlePlayerDeath();
    }
  }

  handlePadBoost(player, pad) {
    if (pad.cooldown) return;
    player.setVelocityY(ROCKET_JUMP_STRENGTH);
    player.resetJumps();
    player.triggerBoostHair();
    this.audio?.play('pad-boost');
    pad.cooldown = true;
    pad.setTint(PAD_COOLDOWN_TINT);
    this.time.delayedCall(ROCKET_RESET_DELAY, () => {
      pad.cooldown = false;
      pad.clearTint();
    });
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    const awarded = Math.round(COIN_VALUE * this.multiplier);
    this.coinsCollected += awarded;
    this.hud.updateCoins(this.coinsCollected);
    this.spawnFloatingText(player.x, player.y - 30, `+${awarded}`);
    this.audio?.play('coin');
  }

  collectRing(player, ring) {
    ring.disableBody(true, true);
    const previous = this.multiplier;
    this.multiplier = Phaser.Math.Clamp(previous + MULTIPLIER_STEP, 1, MAX_MULTIPLIER);
    this.hud.updateMultiplier(this.multiplier);

    const delta = this.multiplier - previous;
    const feedbackText = delta > 0 ? `+${delta.toFixed(1)}x` : 'MAX';
    this.spawnFloatingText(player.x, player.y - 40, feedbackText);

    this.audio?.play('ring');
  }

  handleEnemyHit() {
    this.audio?.play('enemy-hit');
    this.handlePlayerDeath();
  }

  initFloatingTextPool(size = 10) {
    this.floatingTextPool.length = 0;
    for (let i = 0; i < size; i += 1) {
      this.floatingTextPool.push(this.createFloatingTextObject());
    }
  }

  createFloatingTextObject() {
    return this.add
      .text(0, 0, '', {
        fontSize: 18,
        fontFamily: 'Arial',
        color: '#f8fafc',
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setActive(false)
      .setVisible(false);
  }

  acquireFloatingText() {
    if (this.floatingTextPool.length > 0) {
      return this.floatingTextPool.pop();
    }
    return this.createFloatingTextObject();
  }

  releaseFloatingText(textObject) {
    textObject.setActive(false).setVisible(false);
    textObject.alpha = 1;
    this.floatingTextPool.push(textObject);
  }

  spawnFloatingText(x, y, text) {
    const floating = this.acquireFloatingText();
    floating.setPosition(x, y);
    floating.setText(text);
    floating.setActive(true);
    floating.setVisible(true);
    floating.alpha = 1;

    this.tweens.add({
      targets: floating,
      y: y - 30,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        floating.y = y;
        this.releaseFloatingText(floating);
      },
    });
  }

  handlePlayerDeath() {
    if (this.player.isDying) return;
    this.player.isDying = true;
    this.player.setTint(0xff0000);
    this.player.body.stop();
    this.audio?.play('player-death');
    this.time.delayedCall(400, () => {
      this.player.respawn();
      this.player.isDying = false;
    });
  }

  update(time, delta) {
    if (!this.player || this.player.isDying) {
      return;
    }

    const deltaSeconds = delta / 1000;
    const deltaFactor = Phaser.Math.Clamp(delta / BASE_FRAME_TIME, 0.25, 4);

    const inputActive = this.cursors.space?.isDown || this.cursors.up?.isDown || this.input.activePointer.isDown;
    this.player.updateMovement(inputActive, deltaFactor);

    for (let i = 0; i < this.crawlers.length; i += 1) {
      const enemy = this.crawlers[i];
      if (!enemy?.body || !enemy.patrol) {
        continue;
      }
      if (enemy.x <= enemy.patrol.left) {
        enemy.setVelocityX(Math.abs(enemy.patrol.speed));
      } else if (enemy.x >= enemy.patrol.right) {
        enemy.setVelocityX(-Math.abs(enemy.patrol.speed));
      }
    }

    for (let i = 0; i < this.flyerUnits.length; i += 1) {
      const flyer = this.flyerUnits[i];
      if (!flyer?.body) {
        continue;
      }
      flyer.phase += flyer.angularSpeed * deltaSeconds;
      flyer.y = flyer.startY + Math.sin(flyer.phase) * flyer.amplitude;
    }

    const lerp = Phaser.Math.Clamp(1 - Math.pow(1 - CAMERA_FOLLOW_LERP, deltaFactor), 0, 1);
    if (Math.abs(lerp - this.currentCameraLerp) > 0.0001) {
      this.currentCameraLerp = lerp;
      this.cameras.main.setLerp(lerp, lerp);
    }

    if (this.player.body.blocked.down) {
      this.player.resetJumps();
    }

    this.player.body.setVelocityY(
      Phaser.Math.Clamp(this.player.body.velocity.y, -PLAYER_MAX_FALL_SPEED, PLAYER_MAX_FALL_SPEED)
    );

    const goalX = this.levelData?.goalX ?? this.levelData?.bounds?.width ?? LEVEL_WIDTH;
    const progress = Phaser.Math.Clamp(this.player.x / goalX, 0, 1);
    this.hud.updateProgress(progress);

    if (this.player.x >= goalX) {
      this.scene.start('MenuScene');
    }
  }
}
