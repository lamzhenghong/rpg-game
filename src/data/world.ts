/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GuildConflict {
  title: string;
  desc: string;
}

export interface GDDNation {
  name: string;
  element: string;
  god: string;
  capital: string;
  ruler: string;
  desc: string;
  iconColor: string;
  majorFactions: string[];
  history: string;
}

export interface GDDSystem {
  id: string;
  title: string;
  iconName: string;
  summary: string;
  details: string[];
}

export interface GDDData {
  worldName: string;
  introduction: string;
  coreStory: string;
  nations: GDDNation[];
  conflicts: GuildConflict[];
  combatSystems: GDDSystem[];
  gachaSystems: GDDSystem[];
  equipmentSystems: GDDSystem[];
  economySystems: GDDSystem[];
  endgameSystems: GDDSystem[];
  monetizationStrategies: GDDSystem[];
}

export const GDD_DATA: GDDData = {
  worldName: 'Aetheria',
  introduction: 'Aetheria is a sprawling high-fantasy realm of floating islands, deep subterranean crystalline vaults, and vast continental sun expanses. The world is bound together by the flow of Elemental Orbits—celestial rivers of energy that power all life. However, an ancient corruption known as the "Erosion" threatens to collapse these energy currents and freeze the world into absolute stasis.',
  coreStory: 'At the center of Aetheria floats the Sun Spindle, a cosmic reactor designed by the ancient Prime Divines. When the Spindle begins to destabilize, the five nations are pushed to the brink of ideological and military conflict. Some wish to harvest the Spindle\'s remaining energy to fuel their own industry, while others seek to preserve its original function. As the Chosen Catalyst, the player possesses the unique ability to channel and synchronize multiple elements simultaneously, seeking to unite the five nations and activate the Crucible before the world is consumed by the Erosion.',
  nations: [
    {
      name: 'Solaris',
      element: 'Pyro (Fire)',
      god: 'Solara, the Everlasting Crucible',
      capital: 'Dawnspire Royal City',
      ruler: 'High Priestess Eliana & Sun Lord Arch-Barons',
      desc: 'Solaris is a proud and wealthy peak-high desert empire built on ancient volcanic crags. The society is highly stratified and militaristic, prioritizing honor, fire-refined steel, and duty. They worship the Sun Spindle directly, operating massive mirrors and lenses to harvest geothermal heat to avoid the freezing elements.',
      iconColor: 'from-amber-500 to-red-600',
      majorFactions: [
        'The Royal Sun Guard: Highly disciplined protectors of the royal family, armed with Pyro-infused solar broadswords.',
        'The Solar Inquisition: A ruthless secret agency specialized in tracking and purifying shadow cultists and spies.',
        'The Volcanic Alchemists: Guild dedicated to geothermal metalworking and lava forge operations.'
      ],
      history: 'Centuries ago, Solaris was an arid, icy wasteland. The Goddess Solara offered her heart to ignite the Eternal Crucible, heating the soil and giving rise to the great empire. Since then, the royal bloodline has maintained the heat coils, but recent black-spot outages have caused widespread food shortages and social strife.'
    },
    {
      name: 'Nautila',
      element: 'Hydro (Water)',
      god: 'Nautilus, Sovereign of Deep Currents',
      capital: 'Grand Lagoon Archipelago',
      ruler: 'The High Merchant Syndicate & Grand Admiral Kaelen',
      desc: 'Nautila is a floating-bridge trade republic comprising hundreds of tropical islands connected by colossal aqueducts, canals, and shipping channels. It represents the global financial capital where products and materials from all nations are traded. It has a relaxed but highly bureaucratic society.',
      iconColor: 'from-cyan-500 to-blue-600',
      majorFactions: [
        'The Pearl Fleet: The primary naval force guarding shipping channels from pirates and colossal abyssal sea monsters.',
        'The Golden Scale Bank: The massive corporate banking monopoly representing global credit, loans, and gacha funds.',
        'The Navigator Cartographers: Explorers specializing in charting unpredictable ocean currents.'
      ],
      history: 'Nautila was founded by merchant-refugees fleeing the ancient continental wars. By binding their ships together, they created a floating trading hub. They made a pact with Nautilus, the deep sea whale god, who promised calm waters in exchange for periodic elemental offerings.'
    },
    {
      name: 'Glacia',
      element: 'Cryo (Ice)',
      god: 'Boreas, the Frozen Steel Tsar',
      capital: 'Krasnograd Fortress',
      ruler: 'The Iron Tsar Vladislav II',
      desc: 'Glacia is a harsh, beautiful tundra kingdom engulfed in persistent blizzards, bordered by grand steel-reinforced walls. It houses massive iron mines, prison fortress colonies, and legendary elite soldiers. The people are incredibly resilient but govern under a strict totalitarian regime.',
      iconColor: 'from-sky-300 to-slate-500',
      majorFactions: [
        'The Rime-Shade Guild: The elite stealth-blade assassin guild representing the Tsar\'s direct shadow operations.',
        'The Stalwart Guard: Heavy shield-bearing troops trained to withstand both frost elements and thermal siege weaponry.',
        'Imperial Mining League: Guild responsible for harvesting the rare crystalline metals beneath frozen lakes.'
      ],
      history: 'Glacia was once a fertile lush forest valley before an ancient climate experiment detonated, casting the region into an eternal winter. The Tsar Vladislav I seized control of the mines, declaring security through absolute discipline and military fortress living.'
    },
    {
      name: 'Zephyria',
      element: 'Anemo (Wind)',
      god: 'Zephyrus, Lord of the Gale Spires',
      capital: 'Aethelwing Sky Spire',
      ruler: 'The Grand Wind Assembly & Oracle Seraphina',
      desc: 'Zephyria is a skybound nation comprising thousands of mystical floating islands suspended high in the clouds. The islands are held afloat by massive, continuous thermal storm currents. This is a region of poetry, freedom, airship trade, and divine sky-temples.',
      iconColor: 'from-teal-400 to-emerald-500',
      majorFactions: [
        'The Skyward Knights: Glider soldiers who guard the airlanes from flying behemoths, launching wind-arrows from the sky.',
        'The Wind Assembly: A democratic council of air-ship captains and sky scholars representing island affairs.',
        'Acolytes of the Sky Spire: Priests tending the sacred air currents and predicting storm frequencies.'
      ],
      history: 'When the ancient continental lines cracked, Zephyria rose to the heavens using pure wind crystals. The Sky Wardens promised perpetual wind current circulation to keep the islands from falling, but the current depletion is now causing smaller outer sky islets to crash.'
    },
    {
      name: 'Avaris',
      element: 'Geo (Earth & Crystals)',
      god: 'Terrene, the Jade Titan of Caverns',
      capital: 'Subterranea Crystal Hall',
      ruler: 'Grand Council of Obsidian Elders',
      desc: 'Avaris is an absolute architectural marvel: a subterranean civilization built inside vast crystalline caves, geode domes, and deep obsidian labyrinths. It is highly advanced in mechanical architecture, geo-engineering, and crystal resonance technology.',
      iconColor: 'from-yellow-600 to-amber-800',
      majorFactions: [
        'The Stone Shields: Heavily armored obsidian soldiers who protect mining networks from underground horrors.',
        'Crystal Geode Guild: Scholar-inventors who synthesize crystal resonance frequencies for lighting, heat, and weaponry.',
        'Council of Elders: Ancient leaders who govern the distribution of subterranean living spaces and mines.'
      ],
      history: 'Avaris was carved during the sky-fall disaster when massive asteroids struck the crust. Seeking refuge, refugees tunneled deep and found Terrene, a legendary crystal turtle god, who taught them to construct cities inside hollow geodes. They live peacefully below the surface but fear solar expansion.'
    }
  ],
  conflicts: [
    {
      title: 'The Great Energy Tariff Crisis',
      desc: 'Solaris and Nautila are in a tense cold war over fuel distribution. Solaris has threatened to shut down the geothermal heat grids they export, unless the Golden Scale Bank reduces interest rates on sovereign loans. Nautila\'s fleet is positioning around Solaris harbor borders in response.'
    },
    {
      title: 'The Cold Conquest Strategy',
      desc: 'Glacia\'s Iron Tsar has started deploying "exploration divisions" into the border regions of Zephyria. They claim to be building storm research outposts, but Zephyrian Air Knights report that Glacian forces are setting up static heavy anti-air ice cannons, leading to skirmishes in the skies.'
    },
    {
      title: 'Subterranean Cavern Riots',
      desc: 'Avaris is experiencing political unrest as deep-mine labor groups demand a share of crystal export revenues. Many have occupied the inner geode grids, arming themselves with crystal explosives, while the Obsidian Shield Council faces pressure to restore peace.'
    }
  ],
  combatSystems: [
    {
      id: 'realtime_combat',
      title: 'Active Real-Time Action Core',
      iconName: 'ShieldAlert',
      summary: 'A fast-paced, high-intensity action system that features continuous inputs, split-second reflexes, and satisfying visual combos.',
      details: [
        'Attack Chains: Fluidly transition between normal basic attacks and heavy attacks customized by weapon types.',
        'Perfect Dodge: Dodging exactly 0.15 seconds before an enemy attack lands triggers a Slow-motion Matrix, granting invincibility frames and instantly charging active Character Skill energy.',
        'Parry-and-Counter: Holding the block stance with a Claymore or Sword precisely when an elite blow connects opens up an immediate Counter-Strike opportunity that reduces monster shield armor by 50%.'
      ]
    },
    {
      id: 'elemental_reactions',
      title: 'The Seven Elemental Matrix',
      iconName: 'Zap',
      summary: 'The interaction of elements applied on enemies triggers destructive elemental reactions, allowing strategic play and high damage bursts.',
      details: [
        'Vaporize (Pyro + Hydro): Boosts the damage of the triggering element stroke by a multiplier of 2x.',
        'Melt (Pyro + Cryo): Triggers an immediate explosion that deals bonus damage and bypasses 30% of target defense armor.',
        'Frozen (Hydro + Cryo): Completely immobilizes the enemy for 3.5 seconds. Striking a frozen target with a Claymore (Heavy) triggers "Shatter," dealing massive Physical damage.',
        'Overloaded (Pyro + Electro): Creates a concussive fire blast that deals high Pyro damage and knocks back lightweight enemies.',
        'Superconduct (Cryo + Electro): Unleashes a cold crackle that shreds target physical and kinetic defenses by 40%.',
        'Swirl (Anemo + Any except Geo/Dendro): Spreads the active element across all surrounding enemies, causing wide-area reactive damage.',
        'Crystallize (Geo + Pyro/Hydro/Cryo/Electro): Drops an elemental shield shard. Picking up the shard grants the party a custom shield absorbing that specific element.'
      ]
    },
    {
      id: 'char_switch',
      title: 'Four-Character Real-Time Swapping',
      iconName: 'RefreshCw',
      summary: 'The player fields a single active character on the field while keeping 3 backup characters ready, swapping them instantly with dynamic on-switch skills.',
      details: [
        'Insta-Swap: Hit numeric keys (1-4) or click UI frames to swap active characters, instantly transferring active speed buffs.',
        'On-Switch Skill (Resonance): When a character is swapped in while under a fully charged elemental charge, they immediately execute a passive strike on landing.',
        'Combat Synergy Cooldowns: Active skill cooldowns continue tick-down values in the background, allowing players to execute character cycles to stack buffs.'
      ]
    }
  ],
  gachaSystems: [
    {
      id: 'banner_rules',
      title: 'Celestial Wishes (Gacha Wheel)',
      iconName: 'Sparkles',
      summary: 'Players spend AetherGems to perform wishes (summons) to acquire some of the 20 legendary playable characters.',
      details: [
        'Drop Rates: 5-Star Character Base Rate is 0.6% (cumulative 1.6% across pity). 4-Star Character Base Rate is 5.1%.',
        '90-Pull Pity Counter (5-Star Guarantee): If a player fails to pull a 5-Star character after 89 pulls, pull 90 is guaranteed to be a premium 5-Star character.',
        '10-Pull Pity Counter (4-Star Guarantee): Every 10 pulls guarantees a 4-Star character or weapon.',
        '50-50 Featured Rule: When pulling a 5-star, there is a 50% chance it is the featured banner character. If not, the NEXT 5-star pulled is guaranteed to be the featured character.'
      ]
    }
  ],
  equipmentSystems: [
    {
      id: 'weapons_artifacts',
      title: 'Forge Equipment & Chrono Artifacts',
      iconName: 'Sword',
      summary: 'Upgrade paths designed to optimize character offensive and defensive metrics.',
      details: [
        'Weapon Progression: Weapons are upgraded using Hammer Ore or duplicate weapons. Each ascension increases base ATK and unlocks special stats.',
        'Artifact Sety: Equip up to 5 artifact shards. Matching 2-piece or 4-piece sets unlocks powerful buffs like "Searing Crimson Witch: +20% Vaporize Reaction Damage."'
      ]
    }
  ],
  economySystems: [
    {
      id: 'economy_mora',
      title: 'Dual Currency & Materials Index',
      iconName: 'Coins',
      summary: 'Realistically designed in-game progression systems to guide user effort without friction.',
      details: [
        'AetherGems: Premium currency used for buying Gacha pulls (160 gems per pull). Earned via defeating bosses, completing quests, or leveling up.',
        'Mora: Standard gold currency used to pay blacksmith forge costs, character upgrades, and merchant services. Earned in combat arena battles.',
        'Elixirs & Ores: Materials dropped by slimes, elites, and world bosses to awaken weapon and character potentials.'
      ]
    }
  ],
  endgameSystems: [
    {
      id: 'endgame_spindle',
      title: 'The Abyssal Spindle Spire',
      iconName: 'Trophy',
      summary: 'A challenging, progressively scaling dungeon where players must draft party teams to beat timed trials.',
      details: [
        'Spiral Chambers: Twelve chambers that increase in level and difficulty. Levels 9-12 reset bi-weekly, granting thousands of AetherGems for high-performance clears.',
        'Erosion Leyline Disorders: Special arena modifiers, e.g., "Cryo damage is increased by 75%, and enemies periodically trigger frost shield blocks."'
      ]
    }
  ],
  monetizationStrategies: [
    {
      id: 'monetization_core',
      title: 'Commercial Monetization Structure',
      iconName: 'DollarSign',
      summary: 'A fair but highly effective commercial framework prioritizing optional aesthetics and gacha summons.',
      details: [
        'Gacha sumons: Direct sales of AetherGems for banner pulls.',
        'The Ascent Pass (Battle Pass): Free and premium tracks. Complete daily quests to earn Mora, high-level upgrade elixirs, and an exclusive 4-star weapon choice chest.',
        'Wanderer\'s Subscription: Grants 90 AetherGems daily for 30 days upon purchasing a pass, creating strong patient logins.'
      ]
    }
  ]
};
