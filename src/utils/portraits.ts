/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PortraitInfo {
  name: string;
  desc: string;
}

export interface PortraitBuffValues {
  hp?: number;
  def?: number;
  atk?: number;
  critRate?: number;
  critDmg?: number;
}

export const CHARACTER_PORTRAIT_BUFFS: Record<string, PortraitBuffValues[]> = {
  aurelia: [
    { atk: 0.15 },
    { critRate: 0.08 },
    { atk: 0.2 },
    { critDmg: 0.15 },
    { critRate: 0.12 },
    { atk: 0.25, critDmg: 0.25 },
  ],
  ignis: [
    { hp: 0.2 },
    { def: 0.25 },
    { hp: 0.15, def: 0.15 },
    { atk: 0.12 },
    { def: 0.2 },
    { hp: 0.25, def: 0.3 },
  ],
  kaelen: [
    { atk: 0.12 },
    { critRate: 0.1 },
    { critDmg: 0.18 },
    { atk: 0.18 },
    { critRate: 0.08, critDmg: 0.15 },
    { atk: 0.22, critRate: 0.12 },
  ],
  marina: [
    { hp: 0.15 },
    { critRate: 0.1 },
    { def: 0.15 },
    { atk: 0.15 },
    { critDmg: 0.22 },
    { hp: 0.2, critRate: 0.15 },
  ],
  lyra: [
    { atk: 0.14 },
    { critRate: 0.08 },
    { critDmg: 0.2 },
    { atk: 0.16 },
    { critDmg: 0.25 },
    { atk: 0.24, critDmg: 0.3 },
  ],
  varek: [
    { hp: 0.22 },
    { def: 0.22 },
    { atk: 0.15 },
    { def: 0.25 },
    { hp: 0.18 },
    { hp: 0.25, def: 0.25, atk: 0.15 },
  ],
  zephyr: [
    { critRate: 0.1 },
    { atk: 0.15 },
    { critDmg: 0.15 },
    { critRate: 0.12 },
    { atk: 0.2 },
    { critRate: 0.15, critDmg: 0.25 },
  ],
  seraphina: [
    { hp: 0.18 },
    { def: 0.18 },
    { atk: 0.12 },
    { hp: 0.12, def: 0.12 },
    { atk: 0.18 },
    { hp: 0.22, def: 0.22, atk: 0.2 },
  ],
  goliath: [
    { hp: 0.25 },
    { def: 0.3 },
    { hp: 0.2 },
    { def: 0.25 },
    { atk: 0.15 },
    { hp: 0.3, def: 0.35 },
  ],
  tessa: [
    { hp: 0.12 },
    { def: 0.15 },
    { atk: 0.15 },
    { critRate: 0.08 },
    { critDmg: 0.18 },
    { hp: 0.18, def: 0.18, atk: 0.18 },
  ],
  raijin: [
    { critRate: 0.12 },
    { critDmg: 0.24 },
    { atk: 0.15 },
    { critRate: 0.1 },
    { critDmg: 0.2 },
    { atk: 0.2, critRate: 0.15, critDmg: 0.25 },
  ],
  luna: [
    { hp: 0.15 },
    { atk: 0.18 },
    { def: 0.18 },
    { critRate: 0.1 },
    { critDmg: 0.2 },
    { atk: 0.25, hp: 0.2 },
  ],
  verdant: [
    { atk: 0.14 },
    { critRate: 0.1 },
    { critDmg: 0.2 },
    { atk: 0.18 },
    { critRate: 0.12 },
    { atk: 0.22, critDmg: 0.24 },
  ],
  flora: [
    { hp: 0.18 },
    { def: 0.18 },
    { hp: 0.12, def: 0.12 },
    { atk: 0.12 },
    { critRate: 0.08 },
    { hp: 0.25, def: 0.25 },
  ],
  valerie: [
    { atk: 0.16 },
    { critDmg: 0.22 },
    { atk: 0.18 },
    { critRate: 0.1 },
    { critDmg: 0.25 },
    { atk: 0.25, critDmg: 0.3 },
  ],
  nero: [
    { hp: 0.16 },
    { atk: 0.16 },
    { def: 0.18 },
    { critRate: 0.1 },
    { critDmg: 0.2 },
    { hp: 0.2, atk: 0.2, def: 0.2 },
  ],
  cynthia: [
    { critRate: 0.12 },
    { critDmg: 0.25 },
    { atk: 0.15 },
    { critRate: 0.1 },
    { critDmg: 0.22 },
    { atk: 0.24, critRate: 0.14, critDmg: 0.28 },
  ],
  aero: [
    { atk: 0.12 },
    { critRate: 0.1 },
    { hp: 0.15 },
    { atk: 0.15 },
    { critDmg: 0.2 },
    { atk: 0.25, critRate: 0.12 },
  ],
  kira: [
    { hp: 0.15 },
    { def: 0.2 },
    { atk: 0.15 },
    { critRate: 0.08 },
    { critDmg: 0.18 },
    { hp: 0.22, def: 0.25, atk: 0.18 },
  ],
  sylvia: [
    { hp: 0.16 },
    { def: 0.16 },
    { hp: 0.14, def: 0.14 },
    { atk: 0.12 },
    { critRate: 0.08 },
    { hp: 0.24, def: 0.24 },
  ],
  arthur: [
    { hp: 0.1 },
    { def: 0.12 },
    { atk: 0.1 },
    { critRate: 0.06 },
    { critDmg: 0.12 },
    { hp: 0.15, def: 0.15, atk: 0.15 },
  ],
  chloe: [
    { hp: 0.12 },
    { def: 0.12 },
    { hp: 0.1, def: 0.1 },
    { atk: 0.1 },
    { critRate: 0.06 },
    { hp: 0.18, def: 0.18 },
  ],
  hans: [
    { hp: 0.14 },
    { def: 0.14 },
    { atk: 0.1 },
    { def: 0.15 },
    { critRate: 0.06 },
    { hp: 0.2, def: 0.2 },
  ],
  stella: [
    { critRate: 0.08 },
    { atk: 0.12 },
    { critDmg: 0.12 },
    { critRate: 0.08 },
    { atk: 0.15 },
    { critRate: 0.1, critDmg: 0.18 },
  ],
  brock: [
    { hp: 0.12 },
    { def: 0.15 },
    { hp: 0.1, def: 0.1 },
    { atk: 0.1 },
    { critRate: 0.06 },
    { hp: 0.18, def: 0.2 },
  ],
  tesla: [
    { atk: 0.12 },
    { critRate: 0.08 },
    { critDmg: 0.12 },
    { atk: 0.14 },
    { critRate: 0.08 },
    { atk: 0.18, critRate: 0.1 },
  ],
  ivy: [
    { atk: 0.1 },
    { critRate: 0.08 },
    { critDmg: 0.14 },
    { atk: 0.12 },
    { critRate: 0.08 },
    { atk: 0.16, critDmg: 0.16 },
  ],
  skip: [
    { hp: 0.12 },
    { atk: 0.12 },
    { def: 0.12 },
    { critRate: 0.06 },
    { critDmg: 0.12 },
    { hp: 0.16, atk: 0.16 },
  ],
  dusty: [
    { hp: 0.12 },
    { def: 0.12 },
    { atk: 0.1 },
    { critRate: 0.06 },
    { critDmg: 0.12 },
    { hp: 0.16, def: 0.16 },
  ],
  river: [
    { hp: 0.12 },
    { atk: 0.12 },
    { def: 0.1 },
    { critRate: 0.06 },
    { critDmg: 0.12 },
    { hp: 0.16, atk: 0.16 },
  ],
};

export function getAccumulatedPortraitBuffs(charId: string, level: number): Required<PortraitBuffValues> {
  const accum = { hp: 0, def: 0, atk: 0, critRate: 0, critDmg: 0 };
  const buffs = CHARACTER_PORTRAIT_BUFFS[charId];
  if (!buffs) return accum;
  
  for (let i = 0; i < Math.min(level, 6); i++) {
    const buff = buffs[i];
    if (buff.hp !== undefined) accum.hp += buff.hp;
    if (buff.def !== undefined) accum.def += buff.def;
    if (buff.atk !== undefined) accum.atk += buff.atk;
    if (buff.critRate !== undefined) accum.critRate += buff.critRate;
    if (buff.critDmg !== undefined) accum.critDmg += buff.critDmg;
  }
  return accum;
}

export function getPortraitInfoList(element: string, charId: string): PortraitInfo[] {
  switch (charId) {
    case 'aurelia':
      return [
        { name: 'Solar Crucible', desc: 'Increases Attack Force (ATK) by +15%. Sun Warden training boosts base cell vitality.' },
        { name: 'Dawn Blade Aegis', desc: 'Increases Critical Rate by +8% (flat). Unlocks ancient potential.' },
        { name: 'Searing Solstice', desc: 'Increases Attack Force (ATK) by +20%. Searing Dawnburst attacks burn hotter.' },
        { name: 'Sunflare Focus', desc: 'Increases Critical Damage by +15% (flat). Unlocks ancient potential.' },
        { name: 'Daybreak Combustion', desc: 'Increases Critical Rate by +12% (flat). Daybreak Solstice eruptions melt defenses.' },
        { name: 'Eternal Warden Dominion', desc: 'Increases Attack Force (ATK) by +25% and Critical Damage by +25% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'ignis':
      return [
        { name: 'Forgeheart Resilience', desc: 'Increases Max HP by +20%. Exposure to molten slag strengthens physical structure.' },
        { name: 'Molten Gauntlet Guard', desc: 'Increases Defense (DEF) by +25%. Mechanical gauntlet absorbs heavy stagger blows.' },
        { name: 'Tectonic Sparks', desc: 'Increases Max HP by +15% and Defense (DEF) by +15%. Tectonic Forging shockwaves hit harder.' },
        { name: 'Grand Smith Accuracy', desc: 'Increases Attack Force (ATK) by +12%. Unlocks ancient potential.' },
        { name: 'Magma Ignition Burst', desc: 'Increases Defense (DEF) by +20%. Forge Heart shield explosions deal extreme damage.' },
        { name: 'Chief Smith Sovereignty', desc: 'Increases Max HP by +25% and Defense (DEF) by +30%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'kaelen':
      return [
        { name: 'Admiral Tidebound', desc: 'Increases Attack Force (ATK) by +12%. Hydro-spectral Navy training increases marine vitality.' },
        { name: 'Pearl Fleet Shielding', desc: 'Increases Critical Rate by +10% (flat). Swirling mist shields redirect incoming attacks.' },
        { name: 'Abyssal Vortex Force', desc: 'Increases Critical Damage by +18% (flat). Admiralty Vortex pull forces deal increased damage.' },
        { name: 'Naval Tactical Focus', desc: 'Increases Attack Force (ATK) by +18%. Unlocks ancient potential.' },
        { name: 'Pearl Salvo Detonation', desc: 'Increases Critical Rate by +8% (flat) and Critical Damage by +15% (flat). Pearl Fleet Salvo strikes deal heavy damage.' },
        { name: 'Grand Admiral Sovereignty', desc: 'Increases Attack Force (ATK) by +22% and Critical Rate by +12% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'marina':
      return [
        { name: 'Reefcarto Attunement', desc: 'Increases Max HP by +15%. Cartographer expeditions boost sea navigation survival.' },
        { name: 'Anchor Sprinkler Ward', desc: 'Increases Critical Rate by +10% (flat). Sprinkler healing coils redirect kinetic impacts.' },
        { name: 'Stream Arrow Force', desc: 'Increases Defense (DEF) by +15%. Pressurized water arrows pierce armor easily.' },
        { name: 'Mapping Precision Alignment', desc: 'Increases Attack Force (ATK) by +15%. Unlocks ancient potential.' },
        { name: 'Abyssal Bubble Rupture', desc: 'Increases Critical Damage by +22% (flat). Bubble-burst explosions deal extreme damage.' },
        { name: 'Oceanic Cartographer Dominion', desc: 'Increases Max HP by +20% and Critical Rate by +15% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'lyra':
      return [
        { name: 'Rime Princess Grace', desc: 'Increases Attack Force (ATK) by +14%. Royal Glacian lineage increases base cellular resilience.' },
        { name: 'Waltz Frost Shield', desc: 'Increases Critical Rate by +8% (flat). Spinning spear sweeps create defensive ice blooms.' },
        { name: 'Stalactite Pierce', desc: 'Increases Critical Damage by +20% (flat). Spear thrust final hits summon jagged frost spikes.' },
        { name: 'Nocturne Flute Focus', desc: 'Increases Attack Force (ATK) by +16%. Unlocks ancient potential.' },
        { name: 'Avalanche Cryo Detonation', desc: 'Increases Critical Damage by +25% (flat). Avalanche icicles deal heavy critical damage.' },
        { name: 'Tundra Royal Sovereignty', desc: 'Increases Attack Force (ATK) by +24% and Critical Damage by +30% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'varek':
      return [
        { name: 'Obsidian Prison Guard', desc: 'Increases Max HP by +22%. Warden survival training strengthens muscle tissue.' },
        { name: 'Glacial Chain Deflect', desc: 'Increases Defense (DEF) by +22%. Frozen chains parry heavy physical blows.' },
        { name: 'Frostbite executioner', desc: 'Increases Attack Force (ATK) by +15%. Glacial Guillotine strikes shatter shield bars.' },
        { name: 'Shivering Cleave Focus', desc: 'Increases Defense (DEF) by +25%. Unlocks ancient potential.' },
        { name: 'Obsidian Shard Strike', desc: 'Increases Max HP by +18%. Frozen targets suffer increased critical damage.' },
        { name: 'Obsidian Warden Sovereignty', desc: 'Increases Max HP by +25%, Defense (DEF) by +25%, and Attack Force (ATK) by +15%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'zephyr':
      return [
        { name: 'Skyward Windrider', desc: 'Increases Critical Rate by +10% (flat). High altitude courier training increases lung capacity.' },
        { name: 'Gale Armor Slipstream', desc: 'Increases Attack Force (ATK) by +15%. Air resistance deflection layers shield against missiles.' },
        { name: 'Vortex Ricochet Force', desc: 'Increases Critical Damage by +15% (flat). Wind-guided arrows carry heavy kinetic impact.' },
        { name: 'Sky Knight Accuracy', desc: 'Increases Critical Rate by +12% (flat). Unlocks ancient potential.' },
        { name: 'Typhoon Eclipse Rupture', desc: 'Increases Attack Force (ATK) by +20%. Gale Typhoon tornadoes deal severe damage.' },
        { name: 'Storm Wyrm Sovereignty', desc: 'Increases Critical Rate by +15% (flat) and Critical Damage by +25% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'seraphina':
      return [
        { name: 'Temple Archivist Study', desc: 'Increases Max HP by +18%. Reading temple storm tablets boosts base vital energy.' },
        { name: 'Sanctuary Draft Ward', desc: 'Increases Defense (DEF) by +18%. Sanctuary dome reflects projectile spell-fires.' },
        { name: 'Scripture Hurricane Blast', desc: 'Increases Attack Force (ATK) by +12%. Cyclone wind blades shred air resistance.' },
        { name: 'Gale Pages Alignment', desc: 'Increases Max HP by +12% and Defense (DEF) by +12%. Unlocks ancient potential.' },
        { name: 'Runic Vortex Amplification', desc: 'Increases Attack Force (ATK) by +18%. Rune explosions deal heavy critical damage.' },
        { name: 'Sky Temple Librarian Dominion', desc: 'Increases Max HP by +22%, Defense (DEF) by +22%, and Attack Force (ATK) by +20%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'goliath':
      return [
        { name: 'Golem Core Attunement', desc: 'Increases Max HP by +25%. Obsidian-golem core structure stabilizes life force.' },
        { name: 'Obsidian Aegis Barrier', desc: 'Increases Defense (DEF) by +30%. Crystal barrier defense scales with golem plates.' },
        { name: 'Tectonic Monolith Force', desc: 'Increases Max HP by +20%. Epitaph monolith shockwaves split the earth.' },
        { name: 'Stoneguard Heavy Cleave', desc: 'Increases Defense (DEF) by +25%. Unlocks ancient potential.' },
        { name: 'Epitaph Geo Shatter', desc: 'Increases Attack Force (ATK) by +15%. Geo constructs detonate with extreme critical force.' },
        { name: 'Iron Peak Behemoth Dominion', desc: 'Increases Max HP by +30% and Defense (DEF) by +35%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'tessa':
      return [
        { name: 'Archaeologist Endurance', desc: 'Increases Max HP by +12%. Cave exploration increases geological stamina.' },
        { name: 'Resonating Geode Ward', desc: 'Increases Defense (DEF) by +15%. Quartz constructs deflect incoming spell bolts.' },
        { name: 'Geode Detonation Force', desc: 'Increases Attack Force (ATK) by +15%. REVIVED crystal fragments explode with higher force.' },
        { name: 'Chisel Posture Break', desc: 'Increases Critical Rate by +8% (flat). Unlocks ancient potential.' },
        { name: 'Tectonic Spire Resonance', desc: 'Increases Critical Damage by +18% (flat). Geode pillar pulses deal increased critical damage.' },
        { name: 'Geode Shardweaver Sovereignty', desc: 'Increases Max HP by +18%, Defense (DEF) by +18%, and Attack Force (ATK) by +18%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'raijin':
      return [
        { name: 'Lightning Ronin Stamina', desc: 'Increases Critical Rate by +12% (flat). Survival in thunder peaks builds electrical body stamina.' },
        { name: 'Volt Flash Deflection', desc: 'Increases Critical Damage by +24% (flat). Light-speed currents deflect physical strikes.' },
        { name: 'Raiju Storm Eruption', desc: 'Increases Attack Force (ATK) by +15%. High-voltage strikes discharge massive shocks.' },
        { name: 'Spitfire Discharge Focus', desc: 'Increases Critical Rate by +10% (flat). Unlocks ancient potential.' },
        { name: 'High-Voltage Purge', desc: 'Increases Critical Damage by +20% (flat). Sigil detonations deal heavy critical damage.' },
        { name: 'Thunder Ronin Sovereignty', desc: 'Increases Attack Force (ATK) by +20%, Critical Rate by +15% (flat), and Critical Damage by +25% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'luna':
      return [
        { name: 'Mad Scientist Spark', desc: 'Increases Max HP by +15%. Accidental workshop explosions build blast immunity.' },
        { name: 'Magnetic Coil Puppyshield', desc: 'Increases Attack Force (ATK) by +18%. Puppy turret decoy draws enemy aggro.' },
        { name: 'Tesla Matrix Eruption', desc: 'Increases Defense (DEF) by +18%. Electro-magnetic static pulses deal heavy damage.' },
        { name: 'Static Discharge Focus', desc: 'Increases Critical Rate by +10% (flat). Unlocks ancient potential.' },
        { name: 'Overcharged Capacitor Burst', desc: 'Increases Critical Damage by +20% (flat). Tesla matrix arcs deal heavy critical damage.' },
        { name: 'Sparkbox Inventor Sovereignty', desc: 'Increases Max HP by +20% and Attack Force (ATK) by +25%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'verdant':
      return [
        { name: 'Flora Sage Spore Attunement', desc: 'Increases Attack Force (ATK) by +14%. Forest spore research builds vital cell resistance.' },
        { name: 'Vinelash Snare Deflect', desc: 'Increases Critical Rate by +10% (flat). Thorny vines bind targets and absorb blows.' },
        { name: 'Sylvan genesis Bloom', desc: 'Increases Critical Damage by +20% (flat). Spore orbits explode with increased elemental force.' },
        { name: 'Brier Needle Accuracy', desc: 'Increases Attack Force (ATK) by +18%. Unlocks ancient potential.' },
        { name: 'Ivy Spore Combust', desc: 'Increases Critical Rate by +12% (flat). Spore explosions deal heavy critical damage.' },
        { name: 'Canopy Wilderness Sovereignty', desc: 'Increases Attack Force (ATK) by +22% and Critical Damage by +24% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'flora':
      return [
        { name: 'Myconid Spore Cultivator', desc: 'Increases Max HP by +18%. Therapeutic spores increase cellular rejuvenation.' },
        { name: 'Bamboo Sweep Deflect', desc: 'Increases Defense (DEF) by +18%. Pollen clouds confuse incoming strikes.' },
        { name: 'Mushroom Paradise Eruption', desc: 'Increases Max HP by +12% and Defense (DEF) by +12%. Mushroom explosions release toxic Dendro damage.' },
        { name: 'Spore Dispersion Focus', desc: 'Increases Attack Force (ATK) by +12%. Unlocks ancient potential.' },
        { name: 'Therapeutic Rejuvenation', desc: 'Increases Critical Rate by +8% (flat). Critical spore triggers double team healing.' },
        { name: 'Myconid Cultivator Sovereignty', desc: 'Increases Max HP by +25% and Defense (DEF) by +25%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'valerie':
      return [
        { name: 'Solaris Royal Inquest', desc: 'Increases Attack Force (ATK) by +16%. Purging shadow cults builds physical endurance.' },
        { name: 'Black Flame Coating', desc: 'Increases Critical Damage by +22% (flat). Sacrificing HP generates high defense fire shields.' },
        { name: 'Purging Tribulation', desc: 'Increases Attack Force (ATK) by +18%. Burning iron spears deal increased continuous damage.' },
        { name: 'Sadistic Inquisitor Focus', desc: 'Increases Critical Rate by +10% (flat). Unlocks ancient potential.' },
        { name: 'Purging Flame Detonation', desc: 'Increases Critical Damage by +25% (flat). Black flame strikes deal extreme critical spikes.' },
        { name: 'Royal Inquisitor Sovereignty', desc: 'Increases Attack Force (ATK) by +25% and Critical Damage by +30% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'nero':
      return [
        { name: 'Privateer Flagship Captain', desc: 'Increases Max HP by +16%. Sailing through storm maelstroms builds sea vitality.' },
        { name: 'Storm surge Deflection', desc: 'Increases Attack Force (ATK) by +16%. Counter parry shields absorb heavy physical hits.' },
        { name: 'Wrath of Maelstrom Force', desc: 'Increases Defense (DEF) by +18%. Static storm sweeps deal heavy chain damage.' },
        { name: 'Tsunami Swing Posture', desc: 'Increases Critical Rate by +10% (flat). Unlocks ancient potential.' },
        { name: 'Static Gale Discharge', desc: 'Increases Critical Damage by +20% (flat). Counter-sweeps trigger heavy electrical spikes.' },
        { name: 'Gale-Sea Privateer Sovereignty', desc: 'Increases Max HP by +20%, Defense (DEF) by +20%, and Attack Force (ATK) by +20%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'cynthia':
      return [
        { name: 'Rime-Shade Guild Training', desc: 'Increases Critical Rate by +12% (flat). Guild survival training boosts vital cell endurance.' },
        { name: 'Frost Decoy Teleport', desc: 'Increases Critical Damage by +25% (flat). Decoy clones redirect projectile spell-fires.' },
        { name: 'Glacial Guillotine Force', desc: 'Increases Attack Force (ATK) by +15%. Freezing slashes cut through air resistance.' },
        { name: 'Flicker Backstab Focus', desc: 'Increases Critical Rate by +10% (flat). Unlocks ancient potential.' },
        { name: 'Absolute Zero Shatter', desc: 'Increases Critical Damage by +22% (flat). Frozen targets suffer extreme critical slices.' },
        { name: 'Glacian Shadow-Blade Sovereignty', desc: 'Increases Attack Force (ATK) by +24%, Critical Rate by +14% (flat), and Critical Damage by +28% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'aero':
      return [
        { name: 'Gale Runner Stamina', desc: 'Increases Attack Force (ATK) by +12%. High-speed courier sprints build cardio-vitality.' },
        { name: 'Wind Boot Slipstream', desc: 'Increases Critical Rate by +10% (flat). High velocity wind currents deflect missiles.' },
        { name: 'Jet-Stream Gale Force', desc: 'Increases Max HP by +15%. All active party members gain ATK speed boosts.' },
        { name: 'Cloudburst Dash Focus', desc: 'Increases Attack Force (ATK) by +15%. Unlocks ancient potential.' },
        { name: 'Sound-Barrier Rupture', desc: 'Increases Critical Damage by +20% (flat). Sonic breeze sweeps deal increased critical damage.' },
        { name: 'High Spires Runner Sovereignty', desc: 'Increases Attack Force (ATK) by +25% and Critical Rate by +12% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'kira':
      return [
        { name: 'Golden Scale CEO Status', desc: 'Increases Max HP by +15%. Bank vault security guards protect CEO life.' },
        { name: 'Golden Screen Barrier', desc: 'Increases Defense (DEF) by +20%. Crystalline gold screens block projectile paths.' },
        { name: 'Emerald Abundance Shower', desc: 'Increases Attack Force (ATK) by +15%. Crystalline gold rain sifts through defenses.' },
        { name: 'Gold Coin Projectile Focus', desc: 'Increases Critical Rate by +8% (flat). Unlocks ancient potential.' },
        { name: 'Jade Shard Geo Shatter', desc: 'Increases Critical Damage by +18% (flat). Vault screens double projectile damage.' },
        { name: 'Golden Scale CEO Sovereignty', desc: 'Increases Max HP by +22%, Defense (DEF) by +25%, and Attack Force (ATK) by +18%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'sylvia':
      return [
        { name: 'Archivist Sedative Tea', desc: 'Increases Max HP by +16%. Spore tea tests build immunity to sleep gas.' },
        { name: 'Sleeping Sleep-Pod Ward', desc: 'Increases Defense (DEF) by +16%. Sleep gas reduces enemy strike force.' },
        { name: 'Blooming Dream-Forest', desc: 'Increases Max HP by +14% and Defense (DEF) by +14%. Spore forest pulses apply Dendro cores.' },
        { name: 'Dream Spore Precision', desc: 'Increases Attack Force (ATK) by +12%. Unlocks ancient potential.' },
        { name: 'Genesis Healing Burst', desc: 'Increases Critical Rate by +8% (flat). Spore pulses deal heavy critical damage.' },
        { name: 'Botanical Archivist Sovereignty', desc: 'Increases Max HP by +24% and Defense (DEF) by +24%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'arthur':
      return [
        { name: 'Novice Adventurer Will', desc: 'Increases Max HP by +10%. Optimistic drive boosts basic health index.' },
        { name: 'Brave Shield Deflection', desc: 'Increases Defense (DEF) by +12%. Simple iron bucklers block minor strikes.' },
        { name: 'Brave Fire Charge Force', desc: 'Increases Attack Force (ATK) by +10%. Spark-infused blades slice cleaner.' },
        { name: 'Ignite Blade Spark Focus', desc: 'Increases Critical Rate by +6% (flat). Unlocks ancient potential.' },
        { name: 'Adventurer Critical Spark', desc: 'Increases Critical Damage by +12% (flat). Fire charges deal extra critical heat.' },
        { name: 'Great Hero Aetheria Aspiration', desc: 'Increases Max HP by +15%, Defense (DEF) by +15%, and Attack Force (ATK) by +15%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'chloe':
      return [
        { name: 'Well Attendant Cleanse', desc: 'Increases Max HP by +12%. Drinking clean aqueduct water boosts vitality.' },
        { name: 'Water Well Aqueduct Ward', desc: 'Increases Defense (DEF) by +12%. Droplet barriers redirect minor projectiles.' },
        { name: 'Aqua Torrential Force', desc: 'Increases Max HP by +10% and Defense (DEF) by +10%. Pressure water barrels launch heavy torrents.' },
        { name: 'Splash Toss Alignment', desc: 'Increases Attack Force (ATK) by +10%. Unlocks ancient potential.' },
        { name: 'Spring Water Regeneration', desc: 'Increases Critical Rate by +6% (flat). Torrential geysers deal heavy critical damage.' },
        { name: 'Municipal Well Attendant Sovereignty', desc: 'Increases Max HP by +18% and Defense (DEF) by +18%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'hans':
      return [
        { name: 'Glacian Coalminer Grit', desc: 'Increases Max HP by +14%. Heavy mine labor strengthens physical body.' },
        { name: 'Mining Shovel Deflection', desc: 'Increases Defense (DEF) by +14%. Steel pickaxes block incoming slashes.' },
        { name: 'Glacial Pickaxe Strike', desc: 'Increases Attack Force (ATK) by +10%. Shovel swings deal heavy crushing damage.' },
        { name: 'Obsidian Avalanche Posture', desc: 'Increases Defense (DEF) by +15%. Unlocks ancient potential.' },
        { name: 'Glacial Shatter Burst', desc: 'Increases Critical Rate by +6% (flat). Ice spikes deal heavy critical damage.' },
        { name: 'Glacian Coal Worker Sovereignty', desc: 'Increases Max HP by +20% and Defense (DEF) by +20%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'stella':
      return [
        { name: 'Sky Post Office Courier', desc: 'Increases Critical Rate by +8% (flat). Sky navigation builds high altitude lungs.' },
        { name: 'Vortex Decoy Deflection', desc: 'Increases Attack Force (ATK) by +12%. Wind decoys redirect minor slimes.' },
        { name: 'Hurricane Gusts Blast', desc: 'Increases Critical Damage by +12% (flat). Sonic breezes deal wide sweep damage.' },
        { name: 'Wind Dart Focus Accuracy', desc: 'Increases Critical Rate by +8% (flat). Unlocks ancient potential.' },
        { name: 'Mail Courier Gale Surge', desc: 'Increases Attack Force (ATK) by +15%. Wind gusts deal increased critical damage.' },
        { name: 'Zephyrian Courier Sovereignty', desc: 'Increases Critical Rate by +10% (flat) and Critical Damage by +18% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'brock':
      return [
        { name: 'Quarryguard Routines', desc: 'Increases Max HP by +12%. Quarry patrols build leg vitality.' },
        { name: 'Quartz Block Shielding', desc: 'Increases Defense (DEF) by +15%. Quartz barriers deflect physical spell-fires.' },
        { name: 'Tectonic Harpoon Sweep', desc: 'Increases Max HP by +10% and Defense (DEF) by +10%. Polearm thrusts deal heavy quartz damage.' },
        { name: 'Quartz Posture Break', desc: 'Increases Attack Force (ATK) by +10%. Unlocks ancient potential.' },
        { name: 'Landslide Tectonic Burst', desc: 'Increases Critical Rate by +6% (flat). Landslide strikes deal extra critical damage.' },
        { name: 'Quarry Guard Obsidian Sovereignty', desc: 'Increases Max HP by +18% and Defense (DEF) by +20%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'tesla':
      return [
        { name: 'Workshop Sweeper Spark', desc: 'Increases Attack Force (ATK) by +12%. Accidentally touching copper lines builds shock resistance.' },
        { name: 'Static Coil deflections', desc: 'Increases Critical Rate by +8% (flat). Magnetic coils deflect minor steel bolts.' },
        { name: 'Full Circuit Eruption', desc: 'Increases Critical Damage by +12% (flat). Overcharging coils release Electro bursts.' },
        { name: 'Apprentice Technology Alignment', desc: 'Increases Attack Force (ATK) by +14%. Unlocks ancient potential.' },
        { name: 'High-Voltage Capacitor Spike', desc: 'Increases Critical Rate by +8% (flat). Coil discharges deal heavy critical damage.' },
        { name: 'Steam Helper Sovereignty', desc: 'Increases Attack Force (ATK) by +18% and Critical Rate by +10% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'ivy':
      return [
        { name: 'Canopy Root Gatherer', desc: 'Increases Attack Force (ATK) by +10%. Herb climbing builds muscle endurance.' },
        { name: 'Pollen Seedbag Deflection', desc: 'Increases Critical Rate by +8% (flat). Spore bags block projectile spell-fires.' },
        { name: 'Root Vine Tangler Blast', desc: 'Increases Critical Damage by +14% (flat). Thorn vine traps deal increased poison damage.' },
        { name: 'Ivy Needle Focus Accuracy', desc: 'Increases Attack Force (ATK) by +12%. Unlocks ancient potential.' },
        { name: 'Genesis Pollen Combust', desc: 'Increases Critical Rate by +8% (flat). Seedpack bursts deal heavy critical damage.' },
        { name: 'Canopy Gatherer Sovereignty', desc: 'Increases Attack Force (ATK) by +16% and Critical Damage by +16% (flat). Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'skip':
      return [
        { name: 'Lumberjack Core Vitality', desc: 'Increases Max HP by +12%. Cutting static-charged logs builds muscle vitality.' },
        { name: 'Molten Axe deflection', desc: 'Increases Attack Force (ATK) by +12%. Steel axes block incoming slash lines.' },
        { name: 'Thunder Axe Chop Force', desc: 'Increases Defense (DEF) by +12%. Electro chops deal high posture damage.' },
        { name: 'Volt Axe Sweep Alignment', desc: 'Increases Critical Rate by +6% (flat). Unlocks ancient potential.' },
        { name: 'Static Woodchip Burst', desc: 'Increases Critical Damage by +12% (flat). Thunder chops release critical static sparks.' },
        { name: 'Static Lumberjack Sovereignty', desc: 'Increases Max HP by +16% and Attack Force (ATK) by +16%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'dusty':
      return [
        { name: 'Peak Sand-Rider Cardio', desc: 'Increases Max HP by +12%. Sand-boarding in deserts builds core endurance.' },
        { name: 'Sand Dune deflections', desc: 'Increases Defense (DEF) by +12%. Dust screens shield against physical spell-fires.' },
        { name: 'Desert Stormward Force', desc: 'Increases Attack Force (ATK) by +10%. Sand vortexes deal persistent Geo damage.' },
        { name: 'Quicksand Posture Break', desc: 'Increases Critical Rate by +6% (flat). Unlocks ancient potential.' },
        { name: 'Obsidian Sand-Burst', desc: 'Increases Critical Damage by +12% (flat). Dune slashes deal increased critical damage.' },
        { name: 'Peak Sand Rider Sovereignty', desc: 'Increases Max HP by +16% and Defense (DEF) by +16%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    case 'river':
      return [
        { name: 'Lagoon Spearguard Cardio', desc: 'Increases Max HP by +12%. Harpoon fishing builds shoulder endurance.' },
        { name: 'Tidal Harpoon deflection', desc: 'Increases Attack Force (ATK) by +12%. Heavy fish harpoons block physical sweeps.' },
        { name: 'Harpoon Floodgate Wave', desc: 'Increases Defense (DEF) by +10%. Torrent sweeps deal heavy Hydro damage.' },
        { name: 'Fisher Shanty Focus Alignment', desc: 'Increases Critical Rate by +6% (flat). Unlocks ancient potential.' },
        { name: 'Lagoon Tidal Spill', desc: 'Increases Critical Damage by +12% (flat). Harpoon stabs deal heavy critical water damage.' },
        { name: 'Fisher Harpooner Sovereignty', desc: 'Increases Max HP by +16% and Attack Force (ATK) by +16%. Max HP, DEF, and ATK receive an additional +20% boost.' },
      ];

    default:
      switch (element) {
        case 'Pyro':
          return [
            { name: 'Ignis Vitality', desc: 'Increases Max HP by +15%. to withstand active burning hazards.' },
            { name: 'Molten Bulwark', desc: 'Increases Defense (DEF) by +20% using hardened slag layers.' },
            { name: 'Searing Force', desc: 'Increases Attack Force (ATK) by +15% with heat-harnessed blows.' },
            { name: 'Blazing Precision', desc: 'Increases Critical Rate by +10% (flat) for explosive hits.' },
            { name: 'Combustion Surge', desc: 'Increases Critical Damage by +20% (flat) for massive melt spikes.' },
            { name: 'Eternal Crucible Sovereign', desc: 'Ascends character: HP, DEF, and ATK receive +20% boost.' }
          ];
        case 'Hydro':
          return [
            { name: 'Tidal Vitality', desc: 'Increases Max HP by +15% through ocean fluid pressure attunement.' },
            { name: 'Torrential Shield', desc: 'Increases Defense (DEF) by +20% with defensive water coils.' },
            { name: 'Abyssal Force', desc: 'Increases Attack Force (ATK) by +15% with high pressure liquid blasts.' },
            { name: 'Flowing Precision', desc: 'Increases Critical Rate by +10% (flat) through fluid alignment.' },
            { name: 'Maelstrom Surge', desc: 'Increases Critical Damage by +20% (flat) to amplify wave impacts.' },
            { name: 'Oceanic Deity Sovereignty', desc: 'Ascends character: HP, DEF, and ATK receive +20% boost.' }
          ];
        case 'Cryo':
          return [
            { name: 'Rime Vitality', desc: 'Increases Max HP by +15% using frost-hardened cellular resilience.' },
            { name: 'Glacial Aegis', desc: 'Increases Defense (DEF) by +20% with ice-plated armor layers.' },
            { name: 'Frostbite Force', desc: 'Increases Attack Force (ATK) by +15% with freezing piercing strikes.' },
            { name: 'Shivering Precision', desc: 'Increases Critical Rate by +10% (flat) on frozen vulnerabilities.' },
            { name: 'Absolute Zero Surge', desc: 'Increases Critical Damage by +20% (flat) to devastate targets.' },
            { name: 'Tundra Empress Sovereignty', desc: 'Ascends character: HP, DEF, and ATK receive +20% boost.' }
          ];
        case 'Anemo':
          return [
            { name: 'Gale Vitality', desc: 'Increases Max HP by +15% using swift air circulation flows.' },
            { name: 'Sanctuary Shield', desc: 'Increases Defense (DEF) by +20% with repelling wind barriers.' },
            { name: 'Vortex Force', desc: 'Increases Attack Force (ATK) by +15% with vacuum-infused slashes.' },
            { name: 'Aero Precision', desc: 'Increases Critical Rate by +10% (flat) through slipstream accuracy.' },
            { name: 'Typhoon Surge', desc: 'Increases Critical Damage by +20% (flat) for hurricane strikes.' },
            { name: 'Skyward Archon Sovereignty', desc: 'Ascends character: HP, DEF, and ATK receive +20% boost.' }
          ];
        case 'Geo':
          return [
            { name: 'Obsidian Vitality', desc: 'Increases Max HP by +15% using ancient mineral-rich crystallization.' },
            { name: 'Crystalline Bulwark', desc: 'Increases Defense (DEF) by +20% with solid geode reinforcement.' },
            { name: 'Tectonic Force', desc: 'Increases Attack Force (ATK) by +15% with earth-splitting impacts.' },
            { name: 'Amber Precision', desc: 'Increases Critical Rate by +10% (flat) through geological focus.' },
            { name: 'Geode Surge', desc: 'Increases Critical Damage by +20% (flat) for crushing shatter combos.' },
            { name: 'Iron Peak Behemoth Sovereignty', desc: 'Ascends character: HP, DEF, and ATK receive +20% boost.' }
          ];
        case 'Dendro':
          return [
            { name: 'Sylvan Vitality', desc: 'Increases Max HP by +15% using deep botanical spore attunement.' },
            { name: 'Brier Snare Shield', desc: 'Increases Defense (DEF) by +20% with thorn-wrapped wood shields.' },
            { name: 'Canopy Force', desc: 'Increases Attack Force (ATK) by +15% with root-infused strikes.' },
            { name: 'Spore Precision', desc: 'Increases Critical Rate by +10% (flat) on element vulnerabilities.' },
            { name: 'Genesis Surge', desc: 'Increases Critical Damage by +20% (flat) for organic bloom strikes.' },
            { name: 'Forest Deity Sovereignty', desc: 'Ascends character: HP, DEF, and ATK receive +20% boost.' }
          ];
        case 'Electro':
        default:
          return [
            { name: 'Volt Vitality', desc: 'Increases Max HP by +15% through high-frequency molecular attunement.' },
            { name: 'Static Aegis', desc: 'Increases Defense (DEF) by +20% with magnetic polarity shields.' },
            { name: 'High-Voltage Force', desc: 'Increases Attack Force (ATK) by +15% with charged kinetic sweeps.' },
            { name: 'Spark Precision', desc: 'Increases Critical Rate by +10% (flat) using lightning arc tracking.' },
            { name: 'Overcharge Surge', desc: 'Increases Critical Damage by +20% (flat) to amplify voltage spikes.' },
            { name: 'Thunder Deity Sovereignty', desc: 'Ascends character: HP, DEF, and ATK receive +20% boost.' }
          ];
      }
  }
}
