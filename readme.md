# JumpMan

JumpMan is a fast-paced Phaser 3 prototype built with Vite. The player auto-runs through a layered platforming course, chaining multi-jumps, rocket pads, and score multipliers to reach the goal.

## Tech Stack
- [Phaser 3](https://phaser.io/phaser3) with Arcade Physics
- [Vite](https://vitejs.dev/) for bundling and hot-module reloading
- Modern ES module source structure in `src/`

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the development server**
   ```bash
   npm run dev
   ```
   The game runs on `http://localhost:5173` by default. Vite provides hot reload during development.
3. **Build for production**
   ```bash
   npm run build
   ```
   Compiled assets land in `dist/`. Preview them locally with `npm run preview`.

> **Note:** This environment blocks access to the public npm registry, so `npm install` will fail here. The commands above work in a normal networked environment.

## Gameplay Overview
- **Player:** Auto-runs to the right, can jump up to three times before landing. Landing on the ground or touching a rocket pad resets jumps.
- **Pads:** Rocket pads boost vertical velocity and reset jumps to encourage high-path routing.
- **Collectibles:** Coins award points scaled by the active multiplier. Rings raise the multiplier up to `x5`.
- **Hazards:** Spikes, smashers, crawlers, and flyers kill the player on contact. Dying respawns the player at the starting point.
- **HUD:** Displays coins, multiplier, and progress percentage. Floating text feedback appears on pickups.

## Key Files
- `src/main.js` – Entry point that boots Phaser with the shared config.
- `src/config/gameConfig.js` – Phaser game configuration (scenes, physics, renderer, etc.).
- `src/config/constants.js` – Central location for gameplay constants like gravity, player speed, jump force, multiplier values, etc. Tweak numbers here to rebalance movement or scoring.
- `src/scenes/*Scene.js` – Boot, preload, menu, and primary gameplay scenes.
- `src/objects/Player.js` – Player prefab handling multi-jump logic and respawn behavior.
- `src/ui/HUD.js` – Heads-up display for coins, multiplier, and progress.
- `src/config/audioMap.js` – Declarative map of every sound effect (keys, file paths, and default volume settings).
- `src/audio/AudioController.js` – Lazy loader that instantiates Phaser sounds on demand and exposes a simple `play(key)` API to scenes and prefabs.

## Audio Map & Mock Assets
- All sound metadata lives in [`src/config/audioMap.js`](src/config/audioMap.js). Each entry exposes:
  - `key`: the identifier used in code (e.g. `player-jump`).
  - `files`: ogg + mp3 URLs served from `public/audio/`.
  - `config`: default Phaser sound options (volume, detune, etc.).
- Update or add rows to that file to rewire effects—no scene code changes are required as long as the keys remain consistent.
- Drop your mock `.ogg` + `.mp3` pairs into `public/audio/` (the folder is ignored by git except for its README). Keep filenames consistent with the entries in `audioMap` or update the map when you add new cues.
- `PreloadScene` automatically loads both the ogg source and the mp3 fallback for each entry.
- `AudioController` caches sounds per key so repeated effects (coins, jumps) do not create new Phaser sound objects each time.

## Level Authoring
- Level layouts now live under [`src/levels/maps/`](src/levels/maps/). Each file exports a plain object with `bounds`, `goalX`, and the content arrays (platforms, pads, coins, rings, spikes, smashers, crawlers, flyers).
- [`src/levels/LevelFactory.js`](src/levels/LevelFactory.js) registers those maps and clones them on demand so scenes never mutate the source definitions. `DEFAULT_LEVEL_KEY` in [`src/config/constants.js`](src/config/constants.js) picks which map loads by default.
- Start the `GameScene` with `this.scene.start('GameScene', { levelKey: 'your-map-key' });` to swap layouts at runtime.
- To add a new map:
  1. Create `src/levels/maps/<name>.js` that exports `{ key: '<name>', ... }` using the structure shown in `defaultLevel.js`.
  2. Register it in `LevelFactory` (import the file and add it to the registry object).
  3. Update menus or flow to pass the new `levelKey` when launching `GameScene`.

## Frame Pacing & Movement Tuning
- `TARGET_FPS` / `BASE_FRAME_TIME` ensure Arcade Physics steps and manual animations stay stable if the render FPS drifts.
- `PLAYER_RUN_ACCELERATION` smooths the auto-run velocity lerp so the player accelerates identically on both 30 fps and 144 fps devices.
- `CAMERA_FOLLOW_LERP` defines the ideal smoothing amount when following the player; the scene normalizes it each frame so the feel stays consistent across refresh rates.

## Future Ideas
- Externalize level data into JSON
- Add checkpoints and longer levels
- Replace mock audio clips with bespoke effects and layer in music
- Expand hazard behaviors and add boss encounters
