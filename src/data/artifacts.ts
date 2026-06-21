/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ArtifactSlot = 'helmet' | 'hands' | 'leg' | 'shoe';
export type ArtifactSet = 'Vanguard' | 'Guardian' | 'Celestial' | 'Chrono';

export interface Artifact {
  id: string;
  name: string;
  slot: ArtifactSlot;
  set: ArtifactSet;
  rarity: 3 | 4 | 5; // 3 = Blue (Common), 4 = Purple (Rare), 5 = Gold (Legendary)
  isLocked?: boolean;
  equippedTo?: string; // Character ID
}

export const ARTIFACT_SETS: Record<ArtifactSet, { name: string, desc2pc: string, desc4pc: string }> = {
  Vanguard: {
    name: "Vanguard's Valor",
    desc2pc: "+15% Damage (DMG)",
    desc4pc: "+45% Damage (DMG)"
  },
  Guardian: {
    name: "Guardian's Grace",
    desc2pc: "+20% Maximum HP",
    desc4pc: "+55% Maximum HP"
  },
  Celestial: {
    name: "Celestial Catalyst",
    desc2pc: "+10% Crit Rate & +20% Crit DMG",
    desc4pc: "+25% Crit Rate & +55% Crit DMG"
  },
  Chrono: {
    name: "Chrono Attunement",
    desc2pc: "-10% Skill Cooldown",
    desc4pc: "-30% Skill Cooldown"
  }
};

export const ARTIFACT_NAMES: Record<ArtifactSet, Record<ArtifactSlot, string>> = {
  Vanguard: {
    helmet: "Vanguard's Steel Visor",
    hands: "Vanguard's Plated Gauntlets",
    leg: "Vanguard's Iron Greaves",
    shoe: "Vanguard's Heavy Sabatons"
  },
  Guardian: {
    helmet: "Guardian's Crested Crown",
    hands: "Guardian's Divine Bracers",
    leg: "Guardian's Protection Tassets",
    shoe: "Guardian's Bulwark Greaves"
  },
  Celestial: {
    helmet: "Celestial Crown of Stars",
    hands: "Celestial Stellar Grips",
    leg: "Celestial Nebula Cuffs",
    shoe: "Celestial Stardust Boots"
  },
  Chrono: {
    helmet: "Chrono Dial Goggles",
    hands: "Chrono Hourglass Mitts",
    leg: "Chrono Temporal Cuisses",
    shoe: "Chrono Swiftstride Treads"
  }
};

export const getArtifactMainStat = (slot: ArtifactSlot, rarity: 3 | 4 | 5) => {
  switch (slot) {
    case 'helmet':
      return { name: 'HP%', value: rarity === 5 ? 0.40 : rarity === 4 ? 0.24 : 0.12, display: rarity === 5 ? '+40% HP' : rarity === 4 ? '+24% HP' : '+12% HP' };
    case 'hands':
      return { name: 'DMG%', value: rarity === 5 ? 0.40 : rarity === 4 ? 0.24 : 0.12, display: rarity === 5 ? '+40% DMG' : rarity === 4 ? '+24% DMG' : '+12% DMG' };
    case 'leg':
      return { name: 'Crit Rate', value: rarity === 5 ? 0.22 : rarity === 4 ? 0.14 : 0.08, display: rarity === 5 ? '+22% CRIT Rate' : rarity === 4 ? '+14% CRIT Rate' : '+8% CRIT Rate' };
    case 'shoe':
      return { name: 'Crit DMG', value: rarity === 5 ? 0.44 : rarity === 4 ? 0.28 : 0.16, display: rarity === 5 ? '+44% CRIT DMG' : rarity === 4 ? '+28% CRIT DMG' : '+16% CRIT DMG' };
  }
};

export const generateRandomArtifact = (wave: number): Artifact => {
  const slots: ArtifactSlot[] = ['helmet', 'hands', 'leg', 'shoe'];
  const sets: ArtifactSet[] = ['Vanguard', 'Guardian', 'Celestial', 'Chrono'];
  const randomSlot = slots[Math.floor(Math.random() * slots.length)];
  const randomSet = sets[Math.floor(Math.random() * sets.length)];
  
  let rarity: 3 | 4 | 5 = 3;
  const rand = Math.random();
  if (wave <= 10) {
    rarity = rand < 0.20 ? 4 : 3;
  } else if (wave <= 20) {
    rarity = rand < 0.10 ? 5 : rand < 0.50 ? 4 : 3;
  } else if (wave <= 30) {
    rarity = rand < 0.30 ? 5 : rand < 0.80 ? 4 : 3;
  } else {
    rarity = rand < 0.60 ? 5 : rand < 0.95 ? 4 : 3;
  }

  return {
    id: `art_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    name: ARTIFACT_NAMES[randomSet][randomSlot],
    slot: randomSlot,
    set: randomSet,
    rarity,
    isLocked: false
  };
};
