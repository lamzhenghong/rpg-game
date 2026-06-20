/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayableCharacter } from '../types';

export const PLAYABLE_CHARACTERS: PlayableCharacter[] = [
  {
    id: 'aurelia',
    name: 'Aurelia Sunflare',
    title: 'Sun Warden of Solaris',
    rarity: 5,
    element: 'Pyro',
    weaponType: 'Sword',
    personality: 'Proud, fierce, fiercely loyal, and protective. She has an unwavering belief in justice but can be stubborn and unyielding under pressure.',
    backstory: 'Born to the prestigious Sunflare Arch-Barons of Solaris, Aurelia trained from the age of five with the Dawn Blade. She took her oaths before the Eternal Crucible, pledging her life to protect the Sun Spindle, the sacred source of solar warmth for the empire, preventing the encroaching freeze of the ice peaks.',
    avatarPlaceholder: 'bg-gradient-to-tr from-amber-600 to-amber-400 border-amber-300',
    themeColor: '#f59e0b',
    baseStats: { hp: 1080, atk: 95, def: 72, critRate: 0.15, critDmg: 0.60 },
    skills: {
      basic: {
        name: 'Crucible Strike',
        desc: 'Performs up to 5 consecutive strikes infused with brilliant light, dealing physical damage. When infused, deals Pyro damage.',
        cooldown: 0,
        damageMultiplier: 0.8,
        element: 'Pyro'
      },
      skill: {
        name: 'Searing Dawnburst',
        desc: 'Unleashes a sweeping ring of fire that deals massive Pyro damage to nearby enemies and infuses Aurelia\'s weapon with the Pyro element for 8 seconds, increasing all attack speeds.',
        cooldown: 12,
        damageMultiplier: 2.2,
        element: 'Pyro'
      },
      ultimate: {
        name: 'Daybreak Solstice',
        desc: 'Summons a colossal fire-branding celestial sword from the sky, detonating in a massive shockwave that deals AoE Pyro damage and sets enemies ablaze, dealing continuous damage.',
        cooldown: 20,
        damageMultiplier: 5.5,
        element: 'Pyro'
      }
    },
    relations: [
      { targetName: 'Ignis Hearthward', type: 'Allies / Client', desc: 'Trusts Ignis to forge her heavy ceremonial weapons. She respects his work ethic but despises his messy workspace.' },
      { targetName: 'Valerie Crimson', type: 'Rivals / Tension', desc: 'Valerie\'s bloodthirsty inquisitorial methods clashing with Aurelia\'s noble code of honor creates constant friction.' }
    ]
  },
  {
    id: 'ignis',
    name: 'Ignis Hearthward',
    title: 'Grand Flameforger',
    rarity: 4,
    element: 'Pyro',
    weaponType: 'Claymore',
    personality: 'Warm-hearted, booming voice, extremely passionate about metalworking. He behaves like a jolly older brother, always eager to share a pint or a story.',
    backstory: 'Ignis grew up in the subterranean forge-streets of Polaris district in Solaris. He lost his left hand to an unstable magma eruption but forged a mechanical element-harnessed gauntlet in its place. He became the Chief Smith to the Royal Army.',
    avatarPlaceholder: 'bg-gradient-to-tr from-red-700 to-red-400 border-red-400',
    themeColor: '#dc2626',
    baseStats: { hp: 1210, atk: 78, def: 88, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: {
        name: 'Anvil Smasher',
        desc: 'Swings his massive molten hammer in heavy overhead arcs, breaking shield barriers and knocking back lightweight foes.',
        cooldown: 0,
        damageMultiplier: 1.1,
        element: 'Pyro'
      },
      skill: {
        name: 'Forge Heart Ignition',
        desc: 'Creates a magma shield that absorbs damage. While active, the shield periodically emits Pyro pulses, damaging nearby enemies.',
        cooldown: 15,
        damageMultiplier: 1.2,
        element: 'Pyro'
      },
      ultimate: {
        name: 'Tectonic Forging',
        desc: 'Slams his claymore into the ground, raising jagged molten stalagmites that erupt in chains, dealing heavy Pyro damage and launching enemies.',
        cooldown: 18,
        damageMultiplier: 3.8,
        element: 'Pyro'
      }
    },
    relations: [
      { targetName: 'Aurelia Sunflare', type: 'Allies', desc: 'Aurelia is his favorite patron. He specially tempered her Dawn Blade using celestial star shards.' },
      { targetName: 'Tessa Shardweaver', type: 'Collaborator', desc: 'Often trades unique geode materials with Tessa to integrate into his alloy experiments.' }
    ]
  },
  {
    id: 'kaelen',
    name: 'Kaelen Tidebound',
    title: 'Pearl Fleet High Admiral',
    rarity: 5,
    element: 'Hydro',
    weaponType: 'Catalyst',
    personality: 'Cool, precise, meticulous, and soft-spoken. He is a genius naval tactician who uses poetic phrases to describe the flow of battle.',
    backstory: 'Born to a lineage of island navigators in Nautila, Kaelen rose through the ranks of the Navy. He successfully defended the harbor from the giant Sea-Beast Leviathan using tactical elemental arrays, cementing his spot as the youngest High Admiral in Nautila history.',
    avatarPlaceholder: 'bg-gradient-to-tr from-cyan-600 to-blue-500 border-cyan-400',
    themeColor: '#0ea5e9',
    baseStats: { hp: 980, atk: 92, def: 60, critRate: 0.10, critDmg: 0.75 },
    skills: {
      basic: {
        name: 'Tidal Crests',
        desc: 'Fires high-pressure water droplets that chain between up to 3 targets, dealing Hydro damage.',
        cooldown: 0,
        damageMultiplier: 0.6,
        element: 'Hydro'
      },
      skill: {
        name: 'Admiralty Vortex',
        desc: 'Summons a swirling whirlpool that pulls enemies toward its center, constantly dealing Hydro damage and applying the Wet status.',
        cooldown: 10,
        damageMultiplier: 1.6,
        element: 'Hydro'
      },
      ultimate: {
        name: 'Pearl Fleet Salvo',
        desc: 'Calls down a bombardment of hydro-spectral cannon fire from the sea-mist, obliterating the targeted area with multiple waves of heavy Hydro damage.',
        cooldown: 22,
        damageMultiplier: 5.2,
        element: 'Hydro'
      }
    },
    relations: [
      { targetName: 'Marina Dewdrop', type: 'Commander / Mentor', desc: 'Acts as Marina\'s strict but caring superior. He frequently has to bail her out when she gets lost on charting missions.' },
      { targetName: 'Nero Leviathan', type: 'Tense Cooperation', desc: 'Employs Nero\'s privateer fleet as auxiliary forces. He actively watches Nero, suspecting past piratical ties.' }
    ]
  },
  {
    id: 'marina',
    name: 'Marina Dewdrop',
    title: 'Oceanic Cartographer',
    rarity: 4,
    element: 'Hydro',
    weaponType: 'Bow',
    personality: 'Bubbly, energetic, easily distracted, and highly enthusiastic. She has a deep love for travel logs and exotic marine creatures.',
    backstory: 'Marina was raised on a remote lighthouse island. Her hyperactive nature led her to explore every nook of the coral reefs. She has mapping skills that are second to none, though her coordinate sheets occasionally contain drawings of cute sea squirts.',
    avatarPlaceholder: 'bg-gradient-to-tr from-sky-400 to-emerald-400 border-sky-300',
    themeColor: '#38bdf8',
    baseStats: { hp: 920, atk: 72, def: 55, critRate: 0.08, critDmg: 0.55 },
    skills: {
      basic: {
        name: 'Stream Arrow',
        desc: 'Fires arrows made of compressed water. Fully charged shots deal Hydro damage and apply the Wet debuff.',
        cooldown: 0,
        damageMultiplier: 0.5,
        element: 'Hydro'
      },
      skill: {
        name: 'Anchor Sprinkler',
        desc: 'Throws a mechanical sea-anchor device that spins, spraying water in a circle, healing nearby active party members while wetting enemies.',
        cooldown: 16,
        damageMultiplier: 0.9,
        element: 'Hydro'
      },
      ultimate: {
        name: 'Abyssal Bubble-burst',
        desc: 'Fires an absolute behemoth of a bubble arrow that traps normal enemies inside a giant water sphere for 3 seconds, dealing continuous Hydro damage.',
        cooldown: 18,
        damageMultiplier: 3.4,
        element: 'Hydro'
      }
    },
    relations: [
      { targetName: 'Kaelen Tidebound', type: 'Superior Officer', desc: 'Extremely admire\'s Kaelen\'s wisdom, though she constantly runs late to his formal naval briefings.' },
      { targetName: 'Luna Spark', type: 'Tech Buddies', desc: 'Loves testing Luna\'s questionable "waterproof battery cells" inside her charting gear.' }
    ]
  },
  {
    id: 'lyra',
    name: 'Lyra Frostbloom',
    title: 'Rime Princess of Glacia',
    rarity: 5,
    element: 'Cryo',
    weaponType: 'Polearm',
    personality: 'Melancholic, elegant, reserved, and articulate. She struggles to express affection due to her cold upbringing but possesses infinite empathy.',
    backstory: 'The sole descendant of the pre-Tsarist Glacian royal crown. Her ancestors were overthrown, leaving her as a captive hostage under the Iron Tsar\'s "care." She plays her frost-enchanted rime-flute to comfort the serfs suffering in the coal mines.',
    avatarPlaceholder: 'bg-gradient-to-tr from-blue-300 to-indigo-500 border-blue-200',
    themeColor: '#3b82f6',
    baseStats: { hp: 1040, atk: 88, def: 78, critRate: 0.12, critDmg: 0.70 },
    skills: {
      basic: {
        name: 'Stalactite Spear',
        desc: 'Performs up to 6 rapid thrusts, with the final hit summoning tiny ice spikes to impale surrounding foes.',
        cooldown: 0,
        damageMultiplier: 0.65,
        element: 'Cryo'
      },
      skill: {
        name: 'Rime Blossom Waltz',
        desc: 'Lashes backward while spinning her spear, creating a blooming lotus of ice that freezes wet targets and buffs Cryo damage for the party.',
        cooldown: 9,
        damageMultiplier: 1.8,
        element: 'Cryo'
      },
      ultimate: {
        name: 'Avalanche Nocturne',
        desc: ' Lyra begins to play her flute, freezing the entire terrain. Causes massive Cryo damage, dropping giant icicles from the sky and applying Cryo to all active battle participants.',
        cooldown: 20,
        damageMultiplier: 4.8,
        element: 'Cryo'
      }
    },
    relations: [
      { targetName: 'Varek Ironfist', type: 'Watcher / Secret Ally', desc: 'Varek is officially her warden, but she knows he secretly helps her smuggle bread to prison camps.' },
      { targetName: 'Cynthia Shadowfrost', type: 'Complicated Link', desc: 'Learned acrobatics from Cynthia, though Cynthia\'s direct allegiance is to the High Tsar who killed Lyra\'s dynastic elders.' }
    ]
  },
  {
    id: 'varek',
    name: 'Varek Ironfist',
    title: 'Obsidian Prison Warden',
    rarity: 4,
    element: 'Cryo',
    weaponType: 'Claymore',
    personality: 'Gruff, battle-hardened, soft-hearted beneath his iron armor. Dislikes authority, highly practical, and values honest sweat.',
    backstory: 'A former Glacian rebel soldier captured and spared by the Tsar on the condition that he run the high-security penitentiary. He transformed the prison from an execution yard into a rehabilitation forge, guiding down-on-their-luck miners and rebels.',
    avatarPlaceholder: 'bg-gradient-to-tr from-slate-700 to-cyan-800 border-slate-500',
    themeColor: '#475569',
    baseStats: { hp: 1320, atk: 70, def: 95, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: {
        name: 'Shivering Cleave',
        desc: 'A heavy 3-hit swinging pattern. Every hit has a high stagger rate, breaking posture easily.',
        cooldown: 0,
        damageMultiplier: 1.25,
        element: 'Cryo'
      },
      skill: {
        name: 'Frostbite Chain-bind',
        desc: 'Launches a frozen chains weapon forward, grappling enemies towards him and dealing Cryo damage while reducing their defense.',
        cooldown: 14,
        damageMultiplier: 1.5,
        element: 'Cryo'
      },
      ultimate: {
        name: 'Glacial Guillotine',
        desc: 'Leaps high in the air and slams his claymore down with immense force, shattering the glacial ground and executing extra damage on frozen enemies.',
        cooldown: 18,
        damageMultiplier: 3.9,
        element: 'Cryo'
      }
    },
    relations: [
      { targetName: 'Lyra Frostbloom', type: 'Protector', desc: 'Feels immense guilt for the loss of her nation. Sworn to guard her secret escapes while pretending to keep her in containment.' },
      { targetName: 'Cynthia Shadowfrost', type: 'Uneasy Colleagues', desc: 'Dislikes Cynthia\'s stealthy assassination contracts, preferring open, raw combat.' }
    ]
  },
  {
    id: 'zephyr',
    name: 'Zephyr Gale',
    title: 'Skyward Windrider',
    rarity: 5,
    element: 'Anemo',
    weaponType: 'Bow',
    personality: 'Carefree, wanderlust-driven, mischievous, and highly unpredictable. He operates on his own code of absolute freedom, avoiding administrative desks.',
    backstory: 'Once a prodigy of the Zephyrian Sky Knights, he deserted when they ordered him to suppress air-shipping cartels. Now a mercenary scout, he glides through floating spires catching elements. He is rumored to possess a spiritual pact with the ancient Storm Wyrm.',
    avatarPlaceholder: 'bg-gradient-to-tr from-teal-400 to-cyan-300 border-teal-200',
    themeColor: '#2dd4bf',
    baseStats: { hp: 950, atk: 90, def: 62, critRate: 0.18, critDmg: 0.65 },
    skills: {
      basic: {
        name: 'Zephyr Flurry',
        desc: 'Fires up to 6 rapid-fire wind arrows. Fully charged shoots create wind gusts that pull small objects.',
        cooldown: 0,
        damageMultiplier: 0.55,
        element: 'Anemo'
      },
      skill: {
        name: 'Vortex Ricochet',
        desc: 'Fires a high-velocity cyclone arrow that bounces between 4 targets, swirling active elements (Pyro, Hydro, Cryo, Electro) and dealing Anemo damage.',
        cooldown: 8,
        damageMultiplier: 1.4,
        element: 'Anemo'
      },
      ultimate: {
        name: 'Gale Typhoon Eclipse',
        desc: 'Unleashes a monumental tornado on the field that sweeps up regular enemies, applying continuous Swirl effects and dealing major Anemo damage.',
        cooldown: 18,
        damageMultiplier: 4.5,
        element: 'Anemo'
      }
    },
    relations: [
      { targetName: 'Seraphina Skyward', type: 'Opposites', desc: 'Seraphina repeatedly lectures him on respecting temple traditions. He usually responds by stealing her research scrolls to make paper gliders.' },
      { targetName: 'Aero Storm', type: 'Competitors', desc: 'Constantly races Aero through the cloud rings. Zephyr usually wins by exploiting air resistance tricks.' }
    ]
  },
  {
    id: 'seraphina',
    name: 'Seraphina Skyward',
    title: 'Sky Temple Librarian',
    rarity: 4,
    element: 'Anemo',
    weaponType: 'Catalyst',
    personality: 'Studious, rigid but sweet, soft-spoken but speaks fast when excited. Highly organized, hates when books are out of order.',
    backstory: 'Seraphina lived her entire life in the Grand Archive of the Sky Temple in Zephyria. She decoded ancient storm tablets that predicted the awakening of dark energy, compelling her to assist wandering heroes despite her severe motion sickness.',
    avatarPlaceholder: 'bg-gradient-to-tr from-emerald-300 to-teal-500 border-emerald-300',
    themeColor: '#10b981',
    baseStats: { hp: 960, atk: 74, def: 58, critRate: 0.08, critDmg: 0.55 },
    skills: {
      basic: {
        name: 'Gale Pages',
        desc: 'Fires slicing pages made of sharp wind blades, dealing Anemo damage and shredding enemy wind resistance.',
        cooldown: 0,
        damageMultiplier: 0.6,
        element: 'Anemo'
      },
      skill: {
        name: 'Draft Sanctuary',
        desc: 'Creates a dome of wind that repels projectile attacks and increases the jump height of characters standing inside it, along with continuous stamina healing.',
        cooldown: 12,
        damageMultiplier: 0.8,
        element: 'Anemo'
      },
      ultimate: {
        name: 'Scripture Hurricane',
        desc: 'Unfolds a massive glowing vortex of runes that deals massive Anemo damage and instantly clears any debuffs (like Frozen or Burn) from the party.',
        cooldown: 20,
        damageMultiplier: 3.2,
        element: 'Anemo'
      }
    },
    relations: [
      { targetName: 'Zephyr Gale', type: 'Frustrated Guard', desc: 'Considers him a nuisance. Secretly admires his complete lack of fear toward the High Oracle’s decree.' },
      { targetName: 'Sylvia Rootbound', type: 'Exchange Scholars', desc: 'Often trades sky letters with Sylvia regarding ancient species of clouds and roots.' }
    ]
  },
  {
    id: 'goliath',
    name: 'Goliath Stoneguard',
    title: 'Iron Peak Behemoth',
    rarity: 5,
    element: 'Geo',
    weaponType: 'Claymore',
    personality: 'Stoic, patient, ancient, of few words but profound wisdom. Slow to anger, but absolute and terrifying once fully committed.',
    backstory: 'An ancient obsidian-golem hybrid created centuries ago in Avaris to guard the royal vaults. After his creators passed, he gained sentience, adopting the name Goliath. He vowed to stand watch over the poor workers of the crystal chambers.',
    avatarPlaceholder: 'bg-gradient-to-tr from-amber-800 to-stone-700 border-amber-600',
    themeColor: '#78350f',
    baseStats: { hp: 1450, atk: 80, def: 110, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: {
        name: 'Sledgehammer Swings',
        desc: 'Devastating heavy swings that split the earth. Generates continuous shield energy and deals Geo damage.',
        cooldown: 0,
        damageMultiplier: 1.4,
        element: 'Geo'
      },
      skill: {
        name: 'Aegis of Obsidian',
        desc: 'Creates an impenetrable crystal barrier around the active character scaling with Goliath\'s DEF. When the shield breaks, it detonates dealing AoE Geo damage.',
        cooldown: 18,
        damageMultiplier: 1.0,
        element: 'Geo'
      },
      ultimate: {
        name: 'Epitaph of Stone',
        desc: 'Slams his gigantic claymore into the ground, raising a massive stone monolith. The monolith pulses with Geo shockwaves, crystallizing elemental elements on enemies.',
        cooldown: 22,
        damageMultiplier: 4.2,
        element: 'Geo'
      }
    },
    relations: [
      { targetName: 'Tessa Shardweaver', type: 'Guardian', desc: 'Often guards Tessa when she ventures deep into unstable monster caverns. Treats her like a precious grand-niece.' },
      { targetName: 'Aurelia Sunflare', type: 'Diplomatic allies', desc: 'Represents the deep mines of Avaris in diplomacy with Solaris royal guards.' }
    ]
  },
  {
    id: 'tessa',
    name: 'Tessa Shardweaver',
    title: 'Geode Archaeologist',
    rarity: 4,
    element: 'Geo',
    weaponType: 'Sword',
    personality: 'Highly hyperactive, speaks in rapid-fire bursts, deeply obsessed with ancient fossils. She loses absolute focus when near shiny gemstones.',
    backstory: 'Raised by coal miners in Avaris, Tessa rejected mining to study archaeology. She invented a method of injecting Geo mana into ancient crystal fragments, temporarily reviving their properties to synthesize raw explosive power during adventures.',
    avatarPlaceholder: 'bg-gradient-to-tr from-yellow-500 to-stone-500 border-yellow-300',
    themeColor: '#eab308',
    baseStats: { hp: 990, atk: 75, def: 74, critRate: 0.10, critDmg: 0.55 },
    skills: {
      basic: {
        name: 'Chisel & Dagger',
        desc: 'Rapid stabbing attacks with her archaeologist chisel, breaking solid armor defenses and inflicting extra stagger value.',
        cooldown: 0,
        damageMultiplier: 0.7,
        element: 'Geo'
      },
      skill: {
        name: 'Resonating Spire',
        desc: 'Spawns a small geode pillar on the field. The pillar resonates with other Geo constructs (like Goliath\'s Monolith), pulsing Geo damage.',
        cooldown: 9,
        damageMultiplier: 1.3,
        element: 'Geo'
      },
      ultimate: {
        name: 'Geode Detonation',
        desc: 'Implodes all active Geo structures on the field, converting them into giant crystal shards that shred enemies within range and generate extensive crystal shields.',
        cooldown: 16,
        damageMultiplier: 3.5,
        element: 'Geo'
      }
    },
    relations: [
      { targetName: 'Goliath Stoneguard', type: 'Adventure companion', desc: 'Relies on his heavy stature for shelter. Frequently climbs on Goliath\'s shoulder to reach high cavern geodes.' },
      { targetName: 'Kira Goldwise', type: 'Debtor', desc: 'Kira finances her archaeological digs, though Tessa constantly fails to return "economically viable" minerals.' }
    ]
  },
  {
    id: 'raijin',
    name: 'Raijin Volt',
    title: 'Crimson Lightning Ronin',
    rarity: 5,
    element: 'Electro',
    weaponType: 'Polearm',
    personality: 'Arrogant, thrill-seeking, operates with intense flashiness. Extremely competitive, believes speed defines everything in this world.',
    backstory: 'Exiled from the sky peaks of Thunder Ridge for fighting the Elder Lord inside the sacred shrine. Raijin seeks to face the strongest entities across the five nations, proving that lightning strikes can peel apart even divinity.',
    avatarPlaceholder: 'bg-gradient-to-tr from-purple-600 to-fuchsia-500 border-purple-400',
    themeColor: '#a855f7',
    baseStats: { hp: 1010, atk: 96, def: 64, critRate: 0.20, critDmg: 0.65 },
    skills: {
      basic: {
        name: 'Spitfire Lightning Spear',
        desc: 'Lightning-fast spear thrusts. Every third hit launches a sparks discharge that hits surrounding foes.',
        cooldown: 0,
        damageMultiplier: 0.7,
        element: 'Electro'
      },
      skill: {
        name: 'Volt Flash Dash',
        desc: 'Dashes forward at light speed, transforming into electro-current. Strikes all enemies in his path with heavy Electro damage and marks them with Lightning sigils.',
        cooldown: 8,
        damageMultiplier: 1.8,
        element: 'Electro'
      },
      ultimate: {
        name: 'Raiju Storm-Slayer',
        desc: 'Raijin charges his spear with pure high-voltage energy, performing a grand overhead strike which triggers thunderous lightning strikes around him for 10 seconds, dealing persistent Electro damage.',
        cooldown: 18,
        damageMultiplier: 4.9,
        element: 'Electro'
      }
    },
    relations: [
      { targetName: 'Luna Spark', type: 'Testing Partner', desc: 'Often acts as a guinea pig for her high-voltage capacitor rigs. He enjoys the rush of raw electrical feedback.' },
      { targetName: 'Aero Storm', type: 'Speed Rivals', desc: 'Frequently fights Aero to settle who is faster: wind or electricity.' }
    ]
  },
  {
    id: 'luna',
    name: 'Luna Spark',
    title: 'Electric Sparkbox Inventor',
    rarity: 4,
    element: 'Electro',
    weaponType: 'Catalyst',
    personality: 'Slightly mad scientist, speaks in energetic technobabble, prone to forgetting meals or sleep when deep in blueprints.',
    backstory: 'Luna was rejected by the traditional magic guilds for her wild mechanical inventions. She designed the Sparkbox—a device that stabilizes electro-magnetic pulses—creating a new field of steam-electro gear that scares both monsters and guards.',
    avatarPlaceholder: 'bg-gradient-to-tr from-purple-400 to-pink-500 border-purple-300',
    themeColor: '#c084fc',
    baseStats: { hp: 910, atk: 78, def: 52, critRate: 0.12, critDmg: 0.50 },
    skills: {
      basic: {
        name: 'Discharge Spark',
        desc: 'Throws glowing electric lightbulbs that explode in a spray of sparks. Deals Electro damage.',
        cooldown: 0,
        damageMultiplier: 0.5,
        element: 'Electro'
      },
      skill: {
        name: 'Magnetic Coil Sentry',
        desc: 'Deploys a mechanical puppy turret that barks and fires electro-balls at enemies, drawing aggro and applying Electro.',
        cooldown: 13,
        damageMultiplier: 0.9,
        element: 'Electro'
      },
      ultimate: {
        name: 'Overcharged Tesla Matrix',
        desc: 'Deploys a giant static generator grid, creating electric arcs that connect all wet or burned enemies inside the area. Deals massive Electro damage periodically.',
        cooldown: 19,
        damageMultiplier: 3.6,
        element: 'Electro'
      }
    },
    relations: [
      { targetName: 'Raijin Volt', type: 'Power Source', desc: 'Considers Raijin the ultimate battery cell for her super-tesla inventions. Always tries to trick him into touching her generators.' },
      { targetName: 'Marina Dewdrop', type: 'Suppliers', desc: 'Trades marine metals with Marina to craft specialized waterproof conductive layers.' }
    ]
  },
  {
    id: 'verdant',
    name: 'Verdant Thorn',
    title: 'Flora Sage of Canopy Wilderness',
    rarity: 4,
    element: 'Dendro',
    weaponType: 'Bow',
    personality: 'Serene, extremely analytical, highly intellectual, but slightly detached. He sees human actions through the lens of botany and growth cycles.',
    backstory: 'The guardian of the ancient Canopy Spires in the deep wilderness. He spent decades researching the interaction between element flows and forest spores. He has mastered the art of manifesting solid wooden arrows with simple energy projections.',
    avatarPlaceholder: 'bg-gradient-to-tr from-emerald-600 to-green-400 border-emerald-400',
    themeColor: '#10b981',
    baseStats: { hp: 1020, atk: 86, def: 68, critRate: 0.14, critDmg: 0.70 },
    skills: {
      basic: {
        name: 'Brier Shots',
        desc: 'Fires poison-tipped ivy needles that have a chance to inflict Dendro core effects on target hits.',
        cooldown: 0,
        damageMultiplier: 0.6,
        element: 'Dendro'
      },
      skill: {
        name: 'Vinelash Snare',
        desc: 'Summons thorny roots that bind enemies in place for 2 seconds and apply Dendro. Targets bounded take increased reaction damage.',
        cooldown: 11,
        damageMultiplier: 1.5,
        element: 'Dendro'
      },
      ultimate: {
        name: 'Sylvan Genesis Orbit',
        desc: 'Manifests a legendary botanical tree on the field that spreads Dendro spores over a grand radius, healing allies and causing major explosions when touched by Pyro or Electro.',
        cooldown: 20,
        damageMultiplier: 4.4,
        element: 'Dendro'
      }
    },
    relations: [
      { targetName: 'Flora Bloom', type: 'Teacher / Protege', desc: 'Flora is his quietest student. He patiently teaches her to overcome her fears of dangerous carnivorous plants.' },
      { targetName: 'Sylvia Rootbound', type: 'Colleagues', desc: 'Often peer-reviews Sylvia\'s extensive herbal encyclopedia sheets.' }
    ]
  },
  {
    id: 'flora',
    name: 'Flora Bloom',
    title: 'Myconid Cultivator',
    rarity: 4,
    element: 'Dendro',
    weaponType: 'Polearm',
    personality: 'Shy, timid, startles easily. However, when she talks about wild mushrooms, she displays surprising knowledge and confidence.',
    backstory: 'Flora was raised in a remote village where children are taught to talk to flora. She grew up cultivating therapeutic spores and medicinal mushrooms. She uses a hollow bamboo cane to release cloud spores to confuse beasts.',
    avatarPlaceholder: 'bg-gradient-to-tr from-green-500 to-lime-400 border-green-300',
    themeColor: '#22c55e',
    baseStats: { hp: 940, atk: 70, def: 62, critRate: 0.08, critDmg: 0.50 },
    skills: {
      basic: {
        name: 'Bamboo Sweeps',
        desc: 'Slings a series of wooden swipes that release pollen clouds, dealing Dendro damage.',
        cooldown: 0,
        damageMultiplier: 0.52,
        element: 'Dendro'
      },
      skill: {
        name: 'Spore Dispersion',
        desc: 'Throws a glowing bundle of explosive spores. Deals Dendro damage and infuses the player party with continuous healing relative to character HP.',
        cooldown: 14,
        damageMultiplier: 1.1,
        element: 'Dendro'
      },
      ultimate: {
        name: 'Myconid Paradise',
        desc: 'Spawns a massive ring of cute glowing mushrooms that explode in contact with other active elements, applying Dendro and granting active buffs.',
        cooldown: 18,
        damageMultiplier: 3.0,
        element: 'Dendro'
      }
    },
    relations: [
      { targetName: 'Verdant Thorn', type: 'Apprentice', desc: 'Deeply respects her teacher, though she wishes his tests didn\'t involve wrestling with giant Venus flytraps.' },
      { targetName: 'Kira Goldwise', type: 'Suppliers', desc: 'Supplies high-end truffle ingredients to Kira\'s luxury hotels for massive profits.' }
    ]
  },
  {
    id: 'valerie',
    name: 'Valerie Crimson',
    title: 'Solaris Inquisitor',
    rarity: 4,
    element: 'Pyro',
    weaponType: 'Polearm',
    personality: 'Sarcastic, clinical, fiercely intelligent, with a sadistic combat streak. Extremely dedicated to ferreting out dark cults.',
    backstory: 'Valerie grew up in the orphanages of Solaris. She witnessed the infiltration of shadow cultists who tried to extinguish the Sun Spindle. Now she leads the Royal Inquisition, using her black-flame pyro polearm to purge shadows with zero mercy.',
    avatarPlaceholder: 'bg-gradient-to-tr from-rose-900 to-red-600 border-rose-300',
    themeColor: '#f43f5e',
    baseStats: { hp: 1030, atk: 94, def: 66, critRate: 0.16, critDmg: 0.70 },
    skills: {
      basic: {
        name: 'Purging Thrusts',
        desc: 'Performs consecutive swift lunges, applying the Pyro element on critical strikes.',
        cooldown: 0,
        damageMultiplier: 0.75,
        element: 'Pyro'
      },
      skill: {
        name: 'Black Flame Inquest',
        desc: 'Sacrifices 10% of her current HP to coat her spear in blazing black flames, boosting her ATK by 40% and converting physical damage to Pyro.',
        cooldown: 10,
        damageMultiplier: 2.0,
        element: 'Pyro'
      },
      ultimate: {
        name: 'Inquisition Tribulation',
        desc: 'Creates a blazing ring of burning iron spears which slam into the earth, locking enemies in place and dealing continuous Pyro damage over 12 seconds.',
        cooldown: 20,
        damageMultiplier: 5.0,
        element: 'Pyro'
      }
    },
    relations: [
      { targetName: 'Aurelia Sunflare', type: 'Rival/Ideological clash', desc: 'Believes Aurelia\'s "noble baronial regulations" hinder actual investigator results. She loves teasing her.' },
      { targetName: 'Cynthia Shadowfrost', type: 'Confidential trade', desc: 'Occasionally buys security intelligence sheets from Cynthia regarding under-the-table Glacian spies.' }
    ]
  },
  {
    id: 'nero',
    name: 'Nero Leviathan',
    title: 'Gale-Sea Privateer Captain',
    rarity: 4,
    element: 'Electro',
    weaponType: 'Claymore',
    personality: 'Boisterous, greedy, ruthless, but has a strict honor code for sailors. Enjoys heavy drinking and loves fighting giant sea beasts.',
    backstory: 'A legendary former pirate who negotiated a royal charter from Nautila to operate as an official privateer fleet defender. Equipped with a sword that channels static storm gales, his ship—The Gale Leviathan—patrols the dangerous ocean borders.',
    avatarPlaceholder: 'bg-gradient-to-tr from-violet-900 to-indigo-700 border-indigo-400',
    themeColor: '#6366f1',
    baseStats: { hp: 1180, atk: 92, def: 78, critRate: 0.12, critDmg: 0.60 },
    skills: {
      basic: {
        name: 'Tsunami Swings',
        desc: 'Heavy swinging blows with his oversized blade. Waves of static energy deals Electro damage around the blade arcs.',
        cooldown: 0,
        damageMultiplier: 1.15,
        element: 'Electro'
      },
      skill: {
        name: 'Storm surge Counter',
        desc: 'Holds his claymore up to parry. If hit within 1.5 seconds, performs a massive lightning counter-sweep dealing heavy damage and knocking enemies back.',
        cooldown: 12,
        damageMultiplier: 2.8,
        element: 'Electro'
      },
      ultimate: {
        name: 'Wrath of the Maelstrom',
        desc: 'Summons a roaring storm vortex that follows him. The storm constantly electrocutes surrounding foes, dealing massive Electro damage and chain-infecting elements.',
        cooldown: 22,
        damageMultiplier: 4.6,
        element: 'Electro'
      }
    },
    relations: [
      { targetName: 'Kaelen Tidebound', type: 'Employer / Rival', desc: 'Resents Kaelen\'s clean-cut military files but respects his tactical genius enough to honor contracts.' },
      { targetName: 'Marina Dewdrop', type: 'Drinking Buddies', desc: 'Marina is one of the few who can navigate his ship through the violent maelstrom reefs without sinking.' }
    ]
  },
  {
    id: 'cynthia',
    name: 'Cynthia Shadowfrost',
    title: 'Glacian Shadow-Blade',
    rarity: 4,
    element: 'Cryo',
    weaponType: 'Sword',
    personality: 'Silent, professional, completely detached, precise. She rarely displays emotion, executing her assignments with freezing efficiency.',
    backstory: 'Trained from birth in the secret Rime-Shade Guild, Cynthia acts as the direct secret assassin for the Iron Tsar. She can conceal her physical presence inside a snow flurry, striking vital nodes before her targets feel the cold.',
    avatarPlaceholder: 'bg-gradient-to-tr from-slate-900 to-sky-800 border-sky-400',
    themeColor: '#0284c7',
    baseStats: { hp: 960, atk: 98, def: 58, critRate: 0.22, critDmg: 0.70 },
    skills: {
      basic: {
        name: 'Flicker Striking',
        desc: 'Performs up to 6 rapid thrusts with high backstab bonus critical chance, dealing physical damage.',
        cooldown: 0,
        damageMultiplier: 0.7,
        element: 'Cryo'
      },
      skill: {
        name: 'Frostbite Teleport',
        desc: 'Leaves a frost clone decoy on the spot and teleports behind the nearest enemy, striking them with ice damage and freezing wet enemies.',
        cooldown: 11,
        damageMultiplier: 1.9,
        element: 'Cryo'
      },
      ultimate: {
        name: 'Glacial Guillotine Strike',
        desc: 'Disappears into a rapid sequence of freezing slashes that cut across all enemies in a broad line, dealing colossal Cryo damage and applying extreme slowdown.',
        cooldown: 18,
        damageMultiplier: 5.4,
        element: 'Cryo'
      }
    },
    relations: [
      { targetName: 'Lyra Frostbloom', type: 'Secret Bond', desc: 'She has orders to assassinate Lyra if she incites a rebellion, but she continually reports "no suspicious activity" to the Tsar, defying her guild.' },
      { targetName: 'Varek Ironfist', type: 'Cooperators', desc: 'Checks the security of Varek\'s prison, occasionally tipping him off regarding targeted spy infiltration.' }
    ]
  },
  {
    id: 'aero',
    name: 'Aero Storm',
    title: 'High Spires Gale Runner',
    rarity: 4,
    element: 'Anemo',
    weaponType: 'Sword',
    personality: 'Hyper-competitive, impatient, energetic. He treats everything in life like a high-speed dash race and panics when forced to stand still.',
    backstory: 'The fastest courier in the Skyward Archipelagos of Zephyria. He once carried a scroll through a raging Category-5 high sky tornado on foot using wind boots, cementing his status as a legendary gale runner.',
    avatarPlaceholder: 'bg-gradient-to-tr from-teal-500 to-emerald-400 border-teal-300',
    themeColor: '#14b8a6',
    baseStats: { hp: 940, atk: 76, def: 60, critRate: 0.15, critDmg: 0.50 },
    skills: {
      basic: {
        name: 'Gale Slashers',
        desc: 'Quick horizontal sweep strikes that send slicing wind currents forward, dealing Anemo damage.',
        cooldown: 0,
        damageMultiplier: 0.62,
        element: 'Anemo'
      },
      skill: {
        name: 'Cloudburst Dash',
        desc: 'Dashes forward with high momentum, knocking back enemies and reducing his own ultimate cooldown on critical hits.',
        cooldown: 7,
        damageMultiplier: 1.25,
        element: 'Anemo'
      },
      ultimate: {
        name: 'Cyclone Jet-Stream',
        desc: 'Creates a rapid jet stream on the field. All party members gain +30% movement and ATK speeds while standing inside, while enemies suffer Anemo chip damage.',
        cooldown: 18,
        damageMultiplier: 2.8,
        element: 'Anemo'
      }
    },
    relations: [
      { targetName: 'Zephyr Gale', type: 'Rivalry', desc: 'Zephyr is the only person who has ever beaten him in a high sky race. He is determined to win a rematch.' },
      { targetName: 'Raijin Volt', type: 'Speed Buddies', desc: 'The two often match elements together to try and create the fastest propulsion reactions.' }
    ]
  },
  {
    id: 'kira',
    name: 'Kira Goldwise',
    title: 'Imperial Golden Scale CEO',
    rarity: 4,
    element: 'Geo',
    weaponType: 'Catalyst',
    personality: 'Sophisticated, calculating, elegant, extremely wealth-oriented. She values investment risk metrics but takes great pride in community charity.',
    backstory: 'Kira bought out the Golden Scale Bank of Nautila after consolidating ancient crystalline deposits in the deep caverns of Avaris. She operates multiple merchant routes connecting the five nations, maintaining global economic flows singlehandedly.',
    avatarPlaceholder: 'bg-gradient-to-tr from-amber-500 to-amber-700 border-amber-300',
    themeColor: '#f59e0b',
    baseStats: { hp: 970, atk: 90, def: 64, critRate: 0.12, critDmg: 0.70 },
    skills: {
      basic: {
        name: 'Golden Barricade',
        desc: 'Fires crystalline golden coins that shatter on impact, dealing Geo damage and creating tiny jade shards on the ground.',
        cooldown: 0,
        damageMultiplier: 0.65,
        element: 'Geo'
      },
      skill: {
        name: 'Golden Vault Barrier',
        desc: 'Summons a decorative solid gold panel screen on the field. The panel blocks pathing and enemy spell-fires, while doubling the damage of projectile attacks that pass through it.',
        cooldown: 14,
        damageMultiplier: 1.4,
        element: 'Geo'
      },
      ultimate: {
        name: 'Emerald Abundance Shower',
        desc: 'Calls down an astronomical rain of gold luxury crystals that smash enemies inside the zone. Deals immense Geo damage, instantly collects all crystallized element shards, and heals the party.',
        cooldown: 20,
        damageMultiplier: 4.8,
        element: 'Geo'
      }
    },
    relations: [
      { targetName: 'Tessa Shardweaver', type: 'Investor', desc: 'Finances Tessa\'s excavations because she knows Tessa\'s luck in finding rare gold geodes is highly profitable.' },
      { targetName: 'Kaelen Tidebound', type: 'Business partners', desc: 'Coordinates harbor tariffs and pearl trades with the Grand Fleet.' }
    ]
  },
  {
    id: 'sylvia',
    name: 'Sylvia Rootbound',
    title: 'Botanical Archivist',
    rarity: 4,
    element: 'Dendro',
    weaponType: 'Catalyst',
    personality: 'Always sleepy, speaks in slow drowsy tones, deeply attached to quiet gardens. She loves treating monsters like overgrown puppies.',
    backstory: 'Sylvia was assigned to archivism duties in the deepest layers of the Canopy Wilderness. Because of her lethargic nature, she synthesized a sedative tea using magical roots, which she now uses as a defense mechanism to put aggressive forest creatures to sleep.',
    avatarPlaceholder: 'bg-gradient-to-tr from-lime-600 to-green-700 border-lime-300',
    themeColor: '#84cc16',
    baseStats: { hp: 1050, atk: 68, def: 72, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: {
        name: 'Sleeping Root Sprays',
        desc: 'Releases a stream of green pollens, dealing Dendro damage.',
        cooldown: 0,
        damageMultiplier: 0.45,
        element: 'Dendro'
      },
      skill: {
        name: 'Botanical Sleep-Pod',
        desc: 'Spawns a massive sleeping bulb that releases relaxing gas, dealing Dendro damage and reducing the attack power of all enemies in the area by 40%.',
        cooldown: 15,
        damageMultiplier: 1.0,
        element: 'Dendro'
      },
      ultimate: {
        name: 'Blooming Dream-Forest',
        desc: 'Creates an emerald barrier that stays active for 15 seconds. Active characters inside get continuous healing, 30% stagger proof shielding, and deal extra Dendro element application.',
        cooldown: 22,
        damageMultiplier: 2.6,
        element: 'Dendro'
      }
    },
    relations: [
      { targetName: 'Verdant Thorn', type: 'Supervisor', desc: 'Verdant of course understands her sleepiness is a side effect of her medicinal tea tests, though he wishes she wouldn\'t sleep inside the sacred cabinets.' },
      { targetName: 'Seraphina Skyward', type: 'Library Buddies', desc: 'Often sends sleep-inducing aromatherapy packets to Seraphina helper librarians in the Sky Temple.' }
    ]
  },
  {
    id: 'arthur',
    name: 'Arthur Novice',
    title: 'Aspiring Adventurer',
    rarity: 3,
    element: 'Pyro',
    weaponType: 'Sword',
    personality: 'Hyper-energetic, reckless, incredibly optimistic, always tries to prove his courage.',
    backstory: 'A normal villager who found a rusty iron sword and vowed to become the greatest hero of Aetheria. He joins the quest to see the world beyond his hometown.',
    avatarPlaceholder: 'bg-gradient-to-tr from-orange-400 to-red-500 border-orange-350',
    themeColor: '#fb923c',
    baseStats: { hp: 850, atk: 55, def: 50, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: { name: 'Novice Strike', desc: 'Performs simple swings dealing physical damage.', cooldown: 0, damageMultiplier: 0.7, element: 'Pyro' },
      skill: { name: 'Ignite Blade', desc: 'Slashes forward with minor fire spark infusing Pyro status.', cooldown: 10, damageMultiplier: 1.3, element: 'Pyro' },
      ultimate: { name: 'Brave Fire Charge', desc: 'Dashes forward with high spirits dealing AoE Pyro explosions.', cooldown: 18, damageMultiplier: 3.0, element: 'Pyro' }
    },
    relations: [{ targetName: 'Ignis Hearthward', type: 'Idol', desc: 'Wants Ignis to forge him a legendary claymore, although he can barely handle a normal dagger.' }]
  },
  {
    id: 'chloe',
    name: 'Chloe Carrier',
    title: 'Water Well Attendant',
    rarity: 3,
    element: 'Hydro',
    weaponType: 'Catalyst',
    personality: 'Pragmatic, gentle, but highly efficient when carrying loaded water barrels.',
    backstory: 'Worked as an municipal aqueduct manager in Nautila harbor, ensuring drinking water supplies stay free from slimes.',
    avatarPlaceholder: 'bg-gradient-to-tr from-blue-400 to-sky-300 border-blue-250',
    themeColor: '#38bdf8',
    baseStats: { hp: 800, atk: 52, def: 48, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: { name: 'Splash Toss', desc: 'Launches small splashes of pure spring water.', cooldown: 0, damageMultiplier: 0.65, element: 'Hydro' },
      skill: { name: 'Water Barrier', desc: 'Fling water droplets that applies Wet and heals active players.', cooldown: 14, damageMultiplier: 0.8, element: 'Hydro' },
      ultimate: { name: 'Aqua Torrential', desc: 'Erupts a large geyser dealing water splash strikes.', cooldown: 20, damageMultiplier: 2.8, element: 'Hydro' }
    },
    relations: [{ targetName: 'Marina Dewdrop', type: 'Schoolmate', desc: 'Frequently lends water tanks to Marina for sea surveys.' }]
  },
  {
    id: 'hans',
    name: 'Hans Frostminer',
    title: 'Glacian Coal Worker',
    rarity: 3,
    element: 'Cryo',
    weaponType: 'Claymore',
    personality: 'Quiet, weary but sturdy, speaks in deep monotone whispers.',
    backstory: 'Worked in the freezing coal mines of Glacia for fifteen years. He wields his mining pickaxe like a claymore to clear boulders.',
    avatarPlaceholder: 'bg-gradient-to-tr from-slate-500 to-cyan-700 border-slate-350',
    themeColor: '#64748b',
    baseStats: { hp: 950, atk: 58, def: 60, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: { name: 'Mine Swing', desc: 'Slow high density swings with a mining shovel.', cooldown: 0, damageMultiplier: 1.1, element: 'Cryo' },
      skill: { name: 'Ice Pickaxe', desc: 'Strikes the ground creating Cryo spikes.', cooldown: 12, damageMultiplier: 1.4, element: 'Cryo' },
      ultimate: { name: 'Obsidian Avalanche', desc: 'Shockwave that freezes wet targets and breaks ice blocks.', cooldown: 20, damageMultiplier: 3.2, element: 'Cryo' }
    },
    relations: [{ targetName: 'Varek Ironfist', type: 'Warden', desc: 'Respects Varek for improving rations inside prison yards.' }]
  },
  {
    id: 'stella',
    name: 'Stella Gust',
    title: 'Zephyrian Courier',
    rarity: 3,
    element: 'Anemo',
    weaponType: 'Bow',
    personality: 'Punctual, nervous, always checking her clock pouch.',
    backstory: 'A standard sky post office helper. Wields a lightweight survival bow to scare predatory clouds harpies.',
    avatarPlaceholder: 'bg-gradient-to-tr from-teal-300 to-emerald-300 border-teal-200',
    themeColor: '#2dd4bf',
    baseStats: { hp: 780, atk: 54, def: 45, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: { name: 'Wind Dart', desc: 'Fires fast lightweight wind needles.', cooldown: 0, damageMultiplier: 0.6, element: 'Anemo' },
      skill: { name: 'Vortex Decoy', desc: 'Drops a small cyclone pulling lightweight slimes.', cooldown: 11, damageMultiplier: 1.1, element: 'Anemo' },
      ultimate: { name: 'Hurricane Gusts', desc: 'Releases a wide sonic breeze dealing swirling damage.', cooldown: 19, damageMultiplier: 2.7, element: 'Anemo' }
    },
    relations: [{ targetName: 'Aero Storm', type: 'Supervisor', desc: 'Prays Aero doesn\'t deliver her fragile mail parcels with high-speed sound-barrier blasts.' }]
  },
  {
    id: 'brock',
    name: 'Brock Quarryguard',
    title: 'Iron Peak Quarry Sentry',
    rarity: 3,
    element: 'Geo',
    weaponType: 'Polearm',
    personality: 'Boring, loyal, loves routine, speaks about rock layers often.',
    backstory: 'A simple border guard hired to watch over rock crystal quarries in Avaris foothills.',
    avatarPlaceholder: 'bg-gradient-to-tr from-stone-500 to-amber-700 border-stone-350',
    themeColor: '#78716c',
    baseStats: { hp: 1000, atk: 50, def: 65, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: { name: 'Sentry Pole', desc: 'Standard defensive spear thrusts.', cooldown: 0, damageMultiplier: 0.62, element: 'Geo' },
      skill: { name: 'Heavy Quartz Block', desc: 'Creates solid quartz barriers offering minor geo shield.', cooldown: 15, damageMultiplier: 0.9, element: 'Geo' },
      ultimate: { name: 'Tectonic Strike', desc: 'Shatters his spear dealing physical landslide damage.', cooldown: 21, damageMultiplier: 2.9, element: 'Geo' }
    },
    relations: [{ targetName: 'Goliath Stoneguard', type: 'Inspiration', desc: 'Dreams of standing completely stone-still for days like Goliath.' }]
  },
  {
    id: 'tesla',
    name: 'Tesla Apprentice',
    title: 'Steam Workshop Helper',
    rarity: 3,
    element: 'Electro',
    weaponType: 'Catalyst',
    personality: 'Prone to accidents, easily excited, smells like smoke and copper.',
    backstory: 'A junior technician sweep assistant under Luna Spark\'s messy workshop.',
    avatarPlaceholder: 'bg-gradient-to-tr from-fuchsia-400 to-indigo-500 border-fuchsia-300',
    themeColor: '#c084fc',
    baseStats: { hp: 820, atk: 56, def: 42, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: { name: 'Shock Bolt', desc: 'Shoots small electrical discharges.', cooldown: 0, damageMultiplier: 0.6, element: 'Electro' },
      skill: { name: 'Tesla Zap Coil', desc: 'Deploys tiny static coils giving Electro pulses.', cooldown: 13, damageMultiplier: 1.0, element: 'Electro' },
      ultimate: { name: 'Full Circuit Eruption', desc: 'Short-circuits all batteries dealing AoE Electro bursts.', cooldown: 18, damageMultiplier: 2.6, element: 'Electro' }
    },
    relations: [{ targetName: 'Luna Spark', type: 'Apprentice', desc: 'Tired of scrubbing burnt soot off the workshop ceilings.' }]
  },
  {
    id: 'ivy',
    name: 'Ivy Bower',
    title: 'Canopy Gatherer',
    rarity: 3,
    element: 'Dendro',
    weaponType: 'Bow',
    personality: 'Gentle, observant, loves insects, moves silently through vines.',
    backstory: 'A young forest gatherer who climbs ancient roots of the canopy wilderness to pick magical herbs.',
    avatarPlaceholder: 'bg-gradient-to-tr from-lime-500 to-green-600 border-lime-300',
    themeColor: '#84cc16',
    baseStats: { hp: 840, atk: 53, def: 46, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: { name: 'Reed Arrow', desc: 'Fires arrows wrapped in poison vine weed.', cooldown: 0, damageMultiplier: 0.55, element: 'Dendro' },
      skill: { name: 'Pollen Seedbag', desc: 'Drops seedpacks that burst releasing Dendro gas.', cooldown: 12, damageMultiplier: 1.2, element: 'Dendro' },
      ultimate: { name: 'Root Vine Tangler', desc: 'Spawns thorn circles slowing down slimes.', cooldown: 20, damageMultiplier: 2.5, element: 'Dendro' }
    },
    relations: [{ targetName: 'Flora Bloom', type: 'Herbal supplier', desc: 'Trades rare forest lichen with Flora in exchange for mushroom recipes.' }]
  },
  {
    id: 'skip',
    name: 'Skip Boltwood',
    title: 'Electro Lumberjack',
    rarity: 3,
    element: 'Electro',
    weaponType: 'Sword',
    personality: 'Loud, hyper, loves chewing woodchips.',
    backstory: 'A forester who uses static-infused iron axes to cut down thunder-charged logs.',
    avatarPlaceholder: 'bg-gradient-to-tr from-violet-500 to-purple-600 border-violet-400',
    themeColor: '#7c3aed',
    baseStats: { hp: 830, atk: 57, def: 44, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: { name: 'Axecut', desc: 'Fierce downward sword slashes.', cooldown: 0, damageMultiplier: 0.75, element: 'Electro' },
      skill: { name: 'Volt Axe Sweep', desc: 'Sweeping slash applying Electro debuffs.', cooldown: 11, damageMultiplier: 1.4, element: 'Electro' },
      ultimate: { name: 'Thunder Chop', desc: 'Slams weapon inducing bolt charges.', cooldown: 18, damageMultiplier: 2.9, element: 'Electro' }
    },
    relations: [{ targetName: 'Raijin Volt', type: 'Rivalry', desc: 'Fought Raijin once over who could split a boulder faster. Skip lost but got a cool scar.' }]
  },
  {
    id: 'dusty',
    name: 'Dusty Nomad',
    title: 'Peak Sand-Rider',
    rarity: 3,
    element: 'Geo',
    weaponType: 'Sword',
    personality: 'Laid-back, rugged, sleeps on sand dunes, speaks with drawl.',
    backstory: 'Strolls along peak-high solar deserts, sliding down volcanic sand dunes on custom panels.',
    avatarPlaceholder: 'bg-gradient-to-tr from-yellow-600 to-amber-700 border-yellow-450',
    themeColor: '#ca8a04',
    baseStats: { hp: 880, atk: 55, def: 55, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: { name: 'Dune Slash', desc: 'Flicks grains of sand into slime eyes.', cooldown: 0, damageMultiplier: 0.68, element: 'Geo' },
      skill: { name: 'Dust Cloud', desc: 'Releases dust screen hiding character.', cooldown: 10, damageMultiplier: 1.0, element: 'Geo' },
      ultimate: { name: 'Desert Stormward', desc: 'Creates sand vortexes that deals Geo blocks.', cooldown: 19, damageMultiplier: 2.8, element: 'Geo' }
    },
    relations: [{ targetName: 'Tessa Shardweaver', type: 'Guide', desc: 'Helps guide Tessa through active quicksand beds.' }]
  },
  {
    id: 'river',
    name: 'River Torrent',
    title: 'Fisherman Speargaurd',
    rarity: 3,
    element: 'Hydro',
    weaponType: 'Polearm',
    personality: 'Jolly, patient, loves reciting sailing sea shanties.',
    backstory: 'A fisher from the Grand Lagoon who protects merchant sailing vessels using heavy fish harpoons.',
    avatarPlaceholder: 'bg-gradient-to-tr from-cyan-500 to-blue-600 border-cyan-300',
    themeColor: '#0ea5e9',
    baseStats: { hp: 900, atk: 54, def: 52, critRate: 0.05, critDmg: 0.50 },
    skills: {
      basic: { name: 'Fisher Spear', desc: 'Spear stabs that apply water splashes.', cooldown: 0, damageMultiplier: 0.64, element: 'Hydro' },
      skill: { name: 'Tidal Catch', desc: 'Throws water ropes capturing normal targets.', cooldown: 12, damageMultiplier: 1.2, element: 'Hydro' },
      ultimate: { name: 'Harpoon Floodgate', desc: 'Launches element waves dealing Hydro torrent sweeps.', cooldown: 18, damageMultiplier: 3.1, element: 'Hydro' }
    },
    relations: [{ targetName: 'Nero Leviathan', type: 'Admires', desc: 'Dreams of sailing on Nero\'s famous pirate flagship Gale Leviathan.' }]
  }
];
