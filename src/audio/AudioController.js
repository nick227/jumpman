import Phaser from 'phaser';
import { AUDIO_EFFECTS } from '../config/audioMap.js';

export default class AudioController {
  constructor(scene) {
    this.scene = scene;
    this.soundManager = scene.sound;
    this.effects = new Map();
    this.sounds = new Map();

    for (let i = 0; i < AUDIO_EFFECTS.length; i += 1) {
      const effect = AUDIO_EFFECTS[i];
      this.effects.set(effect.key, effect);
    }

    scene.events.on(Phaser.Scenes.Events.SHUTDOWN, this.dispose, this);
    scene.events.on(Phaser.Scenes.Events.DESTROY, this.dispose, this);
  }

  play(key, overrides = {}) {
    if (!this.soundManager) {
      return;
    }

    const effect = this.effects.get(key);
    if (!effect) {
      return;
    }

    let sound = this.sounds.get(key);
    if (!sound) {
      sound = this.soundManager.add(key, effect.config || undefined);
      if (!sound) {
        return;
      }
      this.sounds.set(key, sound);
    }

    if (sound.isPlaying) {
      sound.stop();
    }

    sound.play({ seek: 0, ...overrides });
  }

  dispose() {
    this.scene?.events?.off(Phaser.Scenes.Events.SHUTDOWN, this.dispose, this);
    this.scene?.events?.off(Phaser.Scenes.Events.DESTROY, this.dispose, this);
    this.sounds.forEach((sound) => {
      if (sound) {
        sound.destroy();
      }
    });
    this.sounds.clear();
  }
}
