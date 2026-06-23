import assert from 'node:assert/strict';
import {
  AetheriaAudioEngine,
  getBgmVolumeMultiplierForDevice,
  SPECIAL_ULTIMATE_BGM_NAME,
  SPECIAL_ULTIMATE_THEME_DURATION_MS,
} from './utils/audio';

assert.equal(SPECIAL_ULTIMATE_BGM_NAME, 'Resonance of Aetheria');
assert.ok(SPECIAL_ULTIMATE_THEME_DURATION_MS >= 8000);
assert.ok(SPECIAL_ULTIMATE_THEME_DURATION_MS <= 12000);

assert.equal(getBgmVolumeMultiplierForDevice(false), 1);
assert.ok(getBgmVolumeMultiplierForDevice(true) > 1);
assert.ok(getBgmVolumeMultiplierForDevice(true) <= 1.75);

assert.equal(typeof AetheriaAudioEngine.playSpecialUltimateTheme, 'function');
assert.equal(typeof AetheriaAudioEngine.stopSpecialUltimateTheme, 'function');
assert.equal(typeof AetheriaAudioEngine.pauseCombatTheme, 'function');
assert.equal(typeof AetheriaAudioEngine.resumeCombatTheme, 'function');

console.log('special ultimate audio rules ok');
