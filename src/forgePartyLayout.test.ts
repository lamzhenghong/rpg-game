import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = dirname(fileURLToPath(import.meta.url));
const inventorySource = readFileSync(join(testDir, 'components', 'InventoryManager.tsx'), 'utf8');
const appSource = readFileSync(join(testDir, 'App.tsx'), 'utf8');

assert.doesNotMatch(
  inventorySource,
  /Elemental Reaction Matrix Cheat Sheet|Reaction Cheat Sheet|ElementalReactionsModal/,
  'Forge tab should not render reaction cheat sheet UI',
);
assert.doesNotMatch(
  inventorySource,
  /Squadron Quest ledger|activeQuestTab|setActiveQuestTab/,
  'Forge tab should not render the embedded quest ledger',
);

const partyStart = appSource.indexOf("{activeScreen === 'party'");
const partyEnd = appSource.indexOf("{activeScreen === 'story'", partyStart);
assert.notEqual(partyStart, -1, 'party setup block should exist');
assert.notEqual(partyEnd, -1, 'party setup block should have a stable end marker');

const partyBlock = appSource.slice(partyStart, partyEnd);
const filterStart = partyBlock.indexOf('Element, Weapon Class & Rarity Filter Panel');
const damageSkinIndex = partyBlock.indexOf('Equipped Damage Skin');
const searchIndex = partyBlock.indexOf("placeholder={t('search_placeholder', language)}");
const unequipIndex = partyBlock.indexOf('Unequip All Heroes From Party');

assert.notEqual(filterStart, -1, 'party setup filters should still render');
assert.notEqual(damageSkinIndex, -1, 'damage skin selector should still render');
assert.notEqual(searchIndex, -1, 'party setup search should still render');
assert.notEqual(unequipIndex, -1, 'unequip-all button should still render');
assert.ok(
  searchIndex > damageSkinIndex,
  'party setup search should be below the damage skin selector',
);
assert.ok(
  searchIndex < unequipIndex,
  'party setup search should be above the unequip-all button',
);
assert.doesNotMatch(
  partyBlock.slice(0, filterStart),
  /placeholder=\{t\('search_placeholder', language\)\}/,
  'party setup search should no longer live in the top header area',
);

console.log('forge cleanup and party search layout ok');
