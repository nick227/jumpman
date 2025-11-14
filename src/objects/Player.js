import Phaser from 'phaser';
import {
  PLAYER_SPEED,
  PLAYER_JUMP_VELOCITY,
  PLAYER_MAX_FALL_SPEED,
  MAX_JUMPS,
  BOOST_HAIR_DURATION,
  PLAYER_RUN_ACCELERATION,
} from '../config/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, audioController) {
    super(scene, x, y, 'player-run-1');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.setDragX(0);
    this.setMaxVelocity(PLAYER_SPEED * 1.2, PLAYER_MAX_FALL_SPEED);
    this.setOrigin(0.5, 0.5);
    this.setDepth(5);

    this.remainingJumps = MAX_JUMPS;
    this.jumpReleased = true;
    this.respawnPoint = new Phaser.Math.Vector2(x, y);
    this.boostHairTimer = 0;
    this.audio = audioController;

    this.initAnimations(scene);
    this.play('player-run');
  }

  resetJumps() {
    this.remainingJumps = MAX_JUMPS;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.boostHairTimer > 0) {
      this.boostHairTimer = Math.max(this.boostHairTimer - delta, 0);
    }
    this.updateAnimationState();
  }

  setRespawnPoint(x, y) {
    this.respawnPoint.set(x, y);
  }

  respawn() {
    this.body.stop();
    this.setPosition(this.respawnPoint.x, this.respawnPoint.y);
    this.resetJumps();
    this.clearTint();
    this.boostHairTimer = 0;
    this.play('player-run');
  }

  tryJump() {
    if (this.remainingJumps <= 0) {
      return false;
    }

    this.setVelocityY(PLAYER_JUMP_VELOCITY);
    this.remainingJumps -= 1;
    this.audio?.play('player-jump');
    return true;
  }

  triggerBoostHair(duration = BOOST_HAIR_DURATION) {
    this.boostHairTimer = duration;
  }

  updateMovement(inputActive, deltaFactor = 1) {
    if (!this.body) {
      return;
    }

    const lerpStrength = Phaser.Math.Clamp(deltaFactor * PLAYER_RUN_ACCELERATION, 0, 1);
    const blendedVelocity = Phaser.Math.Linear(this.body.velocity.x, PLAYER_SPEED, lerpStrength);
    this.setVelocityX(blendedVelocity);

    if (!inputActive) {
      this.jumpReleased = true;
      return;
    }

    if (inputActive && this.jumpReleased) {
      this.tryJump();
      this.jumpReleased = false;
    }
  }

  handleJumpRelease() {
    this.jumpReleased = true;
  }

  updateAnimationState() {
    const body = this.body;
    if (!body) {
      return;
    }

    const onGround = body.blocked.down || body.touching.down;
    if (onGround) {
      if (this.anims.currentAnim?.key !== 'player-run') {
        this.play('player-run', true);
      }
      return;
    }

    const airborneKey = this.boostHairTimer > 0 ? 'player-air-boost' : 'player-air';
    if (this.anims?.isPlaying) {
      this.anims.stop();
    }
    if (this.texture.key !== airborneKey) {
      this.setTexture(airborneKey);
    }
  }

  initAnimations(scene) {
    if (scene.anims.exists('player-run')) {
      return;
    }

    scene.anims.create({
      key: 'player-run',
      frames: [
        { key: 'player-run-1' },
        { key: 'player-run-2' },
      ],
      frameRate: 10,
      repeat: -1,
    });
  }
}
