export interface WeaponTemplate {
  name: string;
  rarity: 3 | 4 | 5;
  weaponType: 'Sword' | 'Claymore' | 'Bow' | 'Catalyst' | 'Polearm';
  baseAtk: number;
  statBonus: string;
  featureDesc: string;
}

export const WEAPONS_DATABASE: WeaponTemplate[] = [
  // Swords
  {
    name: "Solar Searing Blade",
    rarity: 5,
    weaponType: "Sword",
    baseAtk: 48,
    statBonus: "Crit Rate +10%",
    featureDesc: "Searing Aura: Attacks have an extra fast cooldown (0.8x) and deal 10% more elemental damage."
  },
  {
    name: "Sacrificial Sword",
    rarity: 4,
    weaponType: "Sword",
    baseAtk: 32,
    statBonus: "Energy Recharge +8%",
    featureDesc: "Composed: After dealing damage with an Elemental Skill, the skill has a 40% chance to end its own CD."
  },
  {
    name: "Favonius Sword",
    rarity: 4,
    weaponType: "Sword",
    baseAtk: 30,
    statBonus: "Energy Recharge +10%",
    featureDesc: "Windfall: Crits have a 60% chance to generate a small amount of elemental energy."
  },
  {
    name: "Cool Steel",
    rarity: 3,
    weaponType: "Sword",
    baseAtk: 18,
    statBonus: "ATK +4%",
    featureDesc: "Suppression: Increases DMG against opponents affected by Hydro or Cryo by 12%."
  },
  {
    name: "Harbinger of Dawn",
    rarity: 3,
    weaponType: "Sword",
    baseAtk: 20,
    statBonus: "Crit DMG +8%",
    featureDesc: "Vigorous: When HP is above 90%, increases Crit Rate by 14%."
  },
  {
    name: "Dull Blade",
    rarity: 3,
    weaponType: "Sword",
    baseAtk: 14,
    statBonus: "ATK +2%",
    featureDesc: "Novice Steel: A simple iron sword with a solid grip."
  },

  // Claymores
  {
    name: "Calamity Blaze",
    rarity: 5,
    weaponType: "Claymore",
    baseAtk: 54,
    statBonus: "ATK +12%",
    featureDesc: "Exploding Sweep: Attacks have very wide reach (+50% range) and deal massive staggering damage."
  },
  {
    name: "Favonius Greatsword",
    rarity: 4,
    weaponType: "Claymore",
    baseAtk: 34,
    statBonus: "Energy Recharge +8%",
    featureDesc: "Windfall: Crits have a 60% chance to generate a small amount of elemental energy."
  },
  {
    name: "Royal Claymore",
    rarity: 4,
    weaponType: "Claymore",
    baseAtk: 36,
    statBonus: "ATK +6%",
    featureDesc: "Focus: Upon damaging an opponent, increases Crit Rate by 8%. Max 5 stacks."
  },
  {
    name: "Debate Club",
    rarity: 3,
    weaponType: "Claymore",
    baseAtk: 20,
    statBonus: "ATK +4%",
    featureDesc: "Blunt Conclusion: After using an Elemental Skill, basic attacks deal an additional 60% area DMG."
  },
  {
    name: "Bloodtainted Greatsword",
    rarity: 3,
    weaponType: "Claymore",
    baseAtk: 22,
    statBonus: "Elemental Mastery +12",
    featureDesc: "Bane of Fire & Thunders: Increases DMG against opponents affected by Pyro or Electro by 16%."
  },
  {
    name: "Iron Point Claymore",
    rarity: 3,
    weaponType: "Claymore",
    baseAtk: 17,
    statBonus: "Physical DMG +3%",
    featureDesc: "Heavy Cleave: Solid iron weights that easily crush heavy rock barriers."
  },

  // Bows
  {
    name: "Solar Wind Bow",
    rarity: 5,
    weaponType: "Bow",
    baseAtk: 46,
    statBonus: "Crit DMG +12%",
    featureDesc: "Hurricane Snipe: Basic attacks shoot extremely long distance (+150% range) pierce arrows."
  },
  {
    name: "Rust",
    rarity: 4,
    weaponType: "Bow",
    baseAtk: 34,
    statBonus: "ATK +6%",
    featureDesc: "Rapid Fire: Increases Normal Attack DMG by 40% but decreases Charged Attack DMG by 10%."
  },
  {
    name: "Sacrificial Bow",
    rarity: 4,
    weaponType: "Bow",
    baseAtk: 32,
    statBonus: "Energy Recharge +8%",
    featureDesc: "Composed: After dealing damage with an Elemental Skill, the skill has a 40% chance to end its own CD."
  },
  {
    name: "Slingshot",
    rarity: 3,
    weaponType: "Bow",
    baseAtk: 20,
    statBonus: "Crit Rate +5%",
    featureDesc: "Sureshot: If a basic attack hits a target within 1.2s of firing, increases DMG by 36%."
  },
  {
    name: "Raven Bow",
    rarity: 3,
    weaponType: "Bow",
    baseAtk: 18,
    statBonus: "Elemental Mastery +10",
    featureDesc: "Bane of Flame & Water: Increases DMG against opponents affected by Pyro or Hydro by 12%."
  },
  {
    name: "Hunter's Bow",
    rarity: 3,
    weaponType: "Bow",
    baseAtk: 14,
    statBonus: "ATK +2%",
    featureDesc: "Wilds Tracker: Lightweight flexwood bow used of simple woodland game hunt."
  },

  // Catalysts
  {
    name: "Abyssal Ocean Scepter",
    rarity: 5,
    weaponType: "Catalyst",
    baseAtk: 45,
    statBonus: "Crit Rate +9%",
    featureDesc: "Sea Whirlpool: Basic attacks create a heavy ocean swirling bubble dealing high area splash damage."
  },
  {
    name: "Widsith",
    rarity: 4,
    weaponType: "Catalyst",
    baseAtk: 33,
    statBonus: "Crit DMG +10%",
    featureDesc: "Debut: When a character takes the field, obtain a random theme song, boosting ATK +60% or Elemental DMG +48%."
  },
  {
    name: "Favonius Codex",
    rarity: 4,
    weaponType: "Catalyst",
    baseAtk: 30,
    statBonus: "Energy Recharge +10%",
    featureDesc: "Windfall: Crits have a 60% chance to generate a small amount of elemental energy."
  },
  {
    name: "Thrilling Tales of Dragon Slayers",
    rarity: 3,
    weaponType: "Catalyst",
    baseAtk: 19,
    statBonus: "HP +6%",
    featureDesc: "Heritage: When switching characters, the new character taking the field has active ATK increased by 24% for 10s."
  },
  {
    name: "Magic Guide",
    rarity: 3,
    weaponType: "Catalyst",
    baseAtk: 17,
    statBonus: "Elemental Mastery +8",
    featureDesc: "Bane of Storm & Tide: Increases DMG against opponents affected by Hydro or Electro by 12%."
  },
  {
    name: "Apprentice's Notes",
    rarity: 3,
    weaponType: "Catalyst",
    baseAtk: 13,
    statBonus: "HP +3%",
    featureDesc: "Fresh Insights: Contains standard diagrams on channeling natural mana flows."
  },

  // Polearms
  {
    name: "Primordial Jade Winged-Spear",
    rarity: 5,
    weaponType: "Polearm",
    baseAtk: 47,
    statBonus: "Crit Rate +11%",
    featureDesc: "Jade Stack: Attacks have incredibly high swing speed, striking twice per command click for swift combos."
  },
  {
    name: "Dragon's Bane",
    rarity: 4,
    weaponType: "Polearm",
    baseAtk: 32,
    statBonus: "Elemental Mastery +14",
    featureDesc: "Bane of Burning Sands: Increases DMG against opponents affected by Hydro or Pyro by 20%."
  },
  {
    name: "Crescent Pike",
    rarity: 4,
    weaponType: "Polearm",
    baseAtk: 34,
    statBonus: "Physical DMG +5%",
    featureDesc: "Infusion Needle: After picking up an Elemental Shard, basic attacks deal an extra 20% flat DMG."
  },
  {
    name: "White Tassel",
    rarity: 3,
    weaponType: "Polearm",
    baseAtk: 19,
    statBonus: "Crit Rate +4%",
    featureDesc: "Sharp Spearhead: Increases Normal Attack damage by 24%."
  },
  {
    name: "Black Tassel",
    rarity: 3,
    weaponType: "Polearm",
    baseAtk: 17,
    statBonus: "HP +5%",
    featureDesc: "Bane of Soft Bodies: Increases DMG against slimes by 40%."
  },
  {
    name: "Beginner's Protector",
    rarity: 3,
    weaponType: "Polearm",
    baseAtk: 13,
    statBonus: "ATK +2%",
    featureDesc: "Novice Spike: A standard wooden polearm tipped with a bronze chisel point."
  }
];
