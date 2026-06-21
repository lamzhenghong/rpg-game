import assert from 'node:assert/strict';
import {
  ARTIFACT_FUSION_RULES,
  createFusedArtifact,
  getEligibleFusionArtifacts,
  getArtifactFusionRule
} from './artifactFusion';
import { Artifact } from '../types';

const artifact = (
  id: string,
  rarity: 3 | 4 | 5,
  overrides: Partial<Artifact> = {}
): Artifact => ({
  id,
  name: "Guardian's Bulwark Greaves",
  set: 'Guardian',
  slot: 'shoe',
  rarity,
  isLocked: false,
  ...overrides
});

assert.deepEqual(ARTIFACT_FUSION_RULES[3], {
  inputRarity: 3,
  resultRarity: 4,
  moraCost: 10000,
  gemCost: 1000,
  inputLabel: '3 Blue',
  outputLabel: '1 Purple'
});

assert.deepEqual(ARTIFACT_FUSION_RULES[4], {
  inputRarity: 4,
  resultRarity: 5,
  moraCost: 25000,
  gemCost: 2500,
  inputLabel: '3 Purple',
  outputLabel: '1 Gold'
});

assert.equal(getArtifactFusionRule(5), null);

const candidates = getEligibleFusionArtifacts([
  artifact('blue-1', 3),
  artifact('blue-2', 3),
  artifact('blue-3', 3),
  artifact('wrong-slot', 3, { slot: 'helmet', name: "Guardian's Crested Crown" }),
  artifact('locked', 3, { isLocked: true }),
  artifact('equipped', 3, { equippedTo: 'aurelia' }),
  artifact('purple', 4)
], artifact('selected', 3));

assert.deepEqual(candidates.map(a => a.id), ['blue-1', 'blue-2', 'blue-3']);

const fused = createFusedArtifact(artifact('purple-source', 4), 'fused-gold');
assert.equal(fused.id, 'fused-gold');
assert.equal(fused.name, "Guardian's Bulwark Greaves");
assert.equal(fused.set, 'Guardian');
assert.equal(fused.slot, 'shoe');
assert.equal(fused.rarity, 5);
assert.equal(fused.isLocked, false);
assert.equal(fused.equippedTo, undefined);

console.log('artifact fusion rules ok');
