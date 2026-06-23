import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCharacterStoryScript, getStageSpec } from './data/storyStages';

const testDir = dirname(fileURLToPath(import.meta.url));
const storyModeSource = readFileSync(join(testDir, 'components', 'StoryMode.tsx'), 'utf8');
const appSource = readFileSync(join(testDir, 'App.tsx'), 'utf8');

assert.equal(getStageSpec('char-marina-1').enemies[0].type, 'Normal');
assert.equal(getStageSpec('char-marina-2').enemies[0].type, 'Elite');
assert.equal(getStageSpec('char-marina-3').enemies[0].type, 'Boss');

for (const act of [1, 2, 3]) {
  const rewards = getStageSpec(`char-marina-${act}`).firstClearRewards;
  assert.ok(rewards.gems > 0);
  assert.ok(rewards.mora > 0);
  assert.equal(rewards.charXp, 0);
  assert.equal(rewards.ascensionMaterialCount, undefined);
  assert.equal(rewards.specialItem, undefined);
}

const actTwoCardStart = storyModeSource.indexOf("Act II:");
const actThreeCardStart = storyModeSource.indexOf("Act III:");
assert.ok(storyModeSource.includes('completedCount >= act.index - 1'));
assert.doesNotMatch(storyModeSource.slice(actTwoCardStart, actThreeCardStart), /portrait|stat|power|boost|gear/i);
assert.doesNotMatch(storyModeSource.slice(actThreeCardStart), /portrait|stat|power|boost|gear/i);

for (const act of [1, 2, 3]) {
  const scriptText = JSON.stringify(getCharacterStoryScript('unknown-char', act));
  assert.doesNotMatch(scriptText, /portrait|stat|power|boost|upgrade/i);
}

const charStoryBranch = appSource.slice(
  appSource.indexOf('if (isCharStory)'),
  appSource.indexOf('} else {', appSource.indexOf('if (isCharStory)')),
);
assert.doesNotMatch(charStoryBranch, /nextCharacterPortraits|inventoryItems|char_xp|ascension/i);
assert.match(charStoryBranch, /nextGems\s*\+=/);
assert.match(charStoryBranch, /nextMora\s*\+=/);

console.log('character story rules ok');
