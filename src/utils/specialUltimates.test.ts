import assert from 'node:assert/strict';
import {
  SPECIAL_ULTIMATE_COOLDOWN_MS,
  SPECIAL_ULTIMATE_UNLOCK_LEVEL,
  getAvailableSpecialUltimate,
  getSpecialUltimateCooldownRemaining,
  isSpecialUltimateUnlocked
} from './specialUltimates';

const makeCombatCharacter = (id: string, ultimateEnergy = 80) => ({
  id,
  name: id,
  currentHp: 1000,
  ultimateEnergy,
  ultimateMaxEnergy: 80
});

assert.equal(SPECIAL_ULTIMATE_UNLOCK_LEVEL, 40);
assert.equal(SPECIAL_ULTIMATE_COOLDOWN_MS, 60_000);
assert.equal(isSpecialUltimateUnlocked(39, false), false);
assert.equal(isSpecialUltimateUnlocked(40, false), true);
assert.equal(isSpecialUltimateUnlocked(1, true), true);

const eternalVapor = getAvailableSpecialUltimate({
  partyIds: ['aurelia', 'kaelen', 'marina'],
  combatParty: [
    makeCombatCharacter('aurelia'),
    makeCombatCharacter('kaelen'),
    makeCombatCharacter('marina')
  ],
  activeCharacterId: 'aurelia',
  playerLevel: 40,
  devCheatsEnabled: false,
  cooldownReadyAt: 0,
  now: 1000
});
assert.equal(eternalVapor?.combo.id, 'eternal_vapor');
assert.equal(eternalVapor?.combo.name, 'Eternal Vapor');

const worldstormGenesis = getAvailableSpecialUltimate({
  partyIds: ['maelis', 'veyra'],
  combatParty: [makeCombatCharacter('maelis'), makeCombatCharacter('veyra')],
  activeCharacterId: 'veyra',
  playerLevel: 1,
  devCheatsEnabled: true,
  cooldownReadyAt: 0,
  now: 1000
});
assert.equal(worldstormGenesis?.combo.id, 'worldstorm_genesis');
assert.equal(worldstormGenesis?.combo.name, 'Worldstorm Genesis');

assert.equal(getAvailableSpecialUltimate({
  partyIds: ['aurelia', 'maelis'],
  combatParty: [makeCombatCharacter('aurelia'), makeCombatCharacter('maelis')],
  activeCharacterId: 'aurelia',
  playerLevel: 40,
  devCheatsEnabled: false,
  cooldownReadyAt: 0,
  now: 1000
}), null);

assert.equal(getAvailableSpecialUltimate({
  partyIds: ['aurelia', 'kaelen', 'marina'],
  combatParty: [
    makeCombatCharacter('aurelia'),
    makeCombatCharacter('kaelen'),
    makeCombatCharacter('marina')
  ],
  activeCharacterId: 'marina',
  playerLevel: 40,
  devCheatsEnabled: false,
  cooldownReadyAt: 0,
  now: 1000
}), null);

assert.equal(getAvailableSpecialUltimate({
  partyIds: ['aurelia', 'kaelen'],
  combatParty: [makeCombatCharacter('aurelia', 0), makeCombatCharacter('kaelen')],
  activeCharacterId: 'kaelen',
  playerLevel: 40,
  devCheatsEnabled: false,
  cooldownReadyAt: 0,
  now: 1000
}), null);

assert.equal(getAvailableSpecialUltimate({
  partyIds: ['maelis', 'veyra'],
  combatParty: [makeCombatCharacter('maelis'), makeCombatCharacter('veyra')],
  activeCharacterId: 'maelis',
  playerLevel: 40,
  devCheatsEnabled: false,
  cooldownReadyAt: 61_000,
  now: 1000
}), null);

assert.equal(getSpecialUltimateCooldownRemaining(61_000, 1000), 60_000);
assert.equal(getSpecialUltimateCooldownRemaining(61_000, 61_001), 0);

console.log('special ultimate rules ok');
