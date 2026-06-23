import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ELEMENTAL_REACTIONS, getElementalReactionGuideLines } from './data/elementalReactions';

const testDir = dirname(fileURLToPath(import.meta.url));
const modalSource = readFileSync(join(testDir, 'components', 'ElementalReactionsModal.tsx'), 'utf8');
const guideSource = readFileSync(join(testDir, 'components', 'GDDViewer.tsx'), 'utf8');
const worldSource = readFileSync(join(testDir, 'data', 'world.ts'), 'utf8');

assert.ok(ELEMENTAL_REACTIONS.length >= 10);
assert.equal(new Set(ELEMENTAL_REACTIONS.map((reaction) => reaction.id)).size, ELEMENTAL_REACTIONS.length);
assert.ok(getElementalReactionGuideLines().every((line) => line.includes(':')));

assert.match(modalSource, /from '..\/data\/elementalReactions'/);
assert.doesNotMatch(modalSource, /const REACTIONS_LIST/);
assert.match(guideSource, /from '..\/data\/elementalReactions'/);
assert.match(guideSource, /ELEMENTAL_REACTIONS\.map/);
assert.match(worldSource, /getElementalReactionGuideLines/);

console.log('elemental reaction consistency ok');
