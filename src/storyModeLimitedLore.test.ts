import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = dirname(fileURLToPath(import.meta.url));
const storyStagesSource = readFileSync(join(testDir, 'data', 'storyStages.ts'), 'utf8');
const worldSource = readFileSync(join(testDir, 'data', 'world.ts'), 'utf8');

const limitedStoryNames = [
  'Aurelia',
  'Aurelia Sunflare',
  'Kaelen',
  'Kaelen Tidebound',
  'Maelis',
  'Maelis Verdantveil',
  'Veyra',
  'Veyra Stormglass',
];

for (const limitedName of limitedStoryNames) {
  assert.doesNotMatch(storyStagesSource, new RegExp(limitedName, 'i'));
  assert.doesNotMatch(worldSource, new RegExp(limitedName, 'i'));
}

console.log('story mode limited lore rules ok');
