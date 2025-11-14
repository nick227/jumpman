import defaultLevel from './maps/defaultLevel.js';

class LevelFactory {
  constructor(registry = {}) {
    this.registry = { ...registry };
  }

  register(key, definition) {
    this.registry[key] = definition;
  }

  create(key) {
    const template = this.registry[key];
    if (!template) {
      throw new Error(`Level '${key}' is not registered.`);
    }
    return JSON.parse(JSON.stringify(template));
  }

  listKeys() {
    return Object.keys(this.registry);
  }
}

const levelFactory = new LevelFactory({
  [defaultLevel.key]: defaultLevel,
});

export default levelFactory;
