export const AUDIO_EFFECTS = [
  {
    key: 'player-jump',
    label: 'Player jump / double-jump',
    files: {
      ogg: 'audio/player-jump.ogg',
      mp3: 'audio/player-jump.mp3',
    },
    config: { volume: 0.35 },
  },
  {
    key: 'pad-boost',
    label: 'Rocket pad boost',
    files: {
      ogg: 'audio/pad-boost.ogg',
      mp3: 'audio/pad-boost.mp3',
    },
    config: { volume: 0.45 },
  },
  {
    key: 'coin',
    label: 'Coin pickup',
    files: {
      ogg: 'audio/coin.ogg',
      mp3: 'audio/coin.mp3',
    },
    config: { volume: 0.4 },
  },
  {
    key: 'ring',
    label: 'Ring multiplier pickup',
    files: {
      ogg: 'audio/ring.ogg',
      mp3: 'audio/ring.mp3',
    },
    config: { volume: 0.5 },
  },
  {
    key: 'player-death',
    label: 'Player death / respawn warning',
    files: {
      ogg: 'audio/player-death.ogg',
      mp3: 'audio/player-death.mp3',
    },
    config: { volume: 0.45 },
  },
  {
    key: 'enemy-hit',
    label: 'Enemy collision',
    files: {
      ogg: 'audio/enemy-hit.ogg',
      mp3: 'audio/enemy-hit.mp3',
    },
    config: { volume: 0.45 },
  },
];

export const AUDIO_MAP = AUDIO_EFFECTS.reduce((acc, def) => {
  acc[def.key] = def;
  return acc;
}, {});
