import { ElementType } from '../types';
import { PLAYABLE_CHARACTERS } from './characters';

export interface StoryStageReward {
  gems: number;
  mora: number;
  charXp: number; // count of Hero's Wit
  ascensionMaterialCount?: number;
  specialItem?: string;
}

export interface StoryEnemySpec {
  name: string;
  type: 'Normal' | 'Elite' | 'Boss';
  element: ElementType;
  level: number;
  bossType?: 'fire_dragon' | 'ice_golem' | 'thunderbird';
}

export interface StoryStageSpec {
  id: string; // e.g. "1-1"
  chapter: number;
  name: string;
  recommendedLevel: number;
  difficulty: 'Normal' | 'Hard' | 'Boss';
  desc: string;
  enemies: StoryEnemySpec[];
  firstClearRewards: StoryStageReward;
}

export interface StoryDialogueLine {
  speaker: string;
  text: string;
  element?: ElementType;
  portraitSide?: 'left' | 'right';
  effect?: 'fade-in' | 'shake' | 'flash';
}

export interface StoryCutsceneSpec {
  background: string; // Tailwind bg-gradient details or theme
  slides: StoryDialogueLine[];
}

export const STORY_CHAPTERS = [
  { id: 1, title: 'The Awakening', desc: 'The starting step of the hero. Journey into the Whispering Forest to investigate active elemental anomalies.' },
  { id: 2, title: 'Elemental Crisis', desc: 'Unstable dimensional tears are erupting across the elements. Secure the burning plains and frozen rivers.' },
  { id: 3, title: 'Ancient Aetheria', desc: 'Step inside the long-forgotten ruins of old gods and face the legendary dragons that guard the Aether gates.' },
  { id: 4, title: 'Whispers of the Abyss', desc: 'Descend into the Abyssal depths where the shadows of ancient kings dwell. Unravel their cryptic prophecies.' },
  { id: 5, title: 'Echoes of Eternity', desc: 'Fulfill the stardust summons test in a temple outside time. Face reflections of legendary warriors.' },
  { id: 6, title: 'The Frostfire Chasm', desc: 'Navigate a volcanic canyon where elemental lava meets permanent glaciers. Resolve the temperature chaos.' },
  { id: 7, title: 'Skyward Ascent', desc: 'Climb the towering spires of the cloud kingdom. Battle the avian guardians that dwell above the clouds.' },
  { id: 8, title: 'Heart of the Volcano', desc: 'Intrude into the active core of Mount Eldruin. Defeat the molten lords before they boil the world.' },
  { id: 9, title: 'Dimensional Rift', desc: 'The space-time matrix is breaking down! Navigate chaotic rifts featuring elemental elements combined.' },
  { id: 10, title: 'Aetheria Reforged', desc: 'The ultimate battle to stabilize the core of the element matrix. Face the original creators in final trials.' }
];

export const STORY_STAGES: Record<string, StoryStageSpec> = {
  // CHAPTER 1
  '1-1': {
    id: '1-1', chapter: 1, name: 'Forest Entrance', recommendedLevel: 1, difficulty: 'Normal',
    desc: 'Brave the outskirts of Whispering Forest where slimes have begun attacking wandering merchant convoys.',
    enemies: [
      { name: 'Dendro Slime', type: 'Normal', element: 'Dendro', level: 1 },
      { name: 'Pyro Slime', type: 'Normal', element: 'Pyro', level: 1 },
      { name: 'Hydro Slime', type: 'Normal', element: 'Hydro', level: 1 }
    ],
    firstClearRewards: { gems: 50, mora: 2000, charXp: 2 }
  },
  '1-2': {
    id: '1-2', chapter: 1, name: 'Slime Ambush', recommendedLevel: 3, difficulty: 'Normal',
    desc: 'Trapped in a dense marsh! Clear a path through waves of elemental slimes blocking the road.',
    enemies: [
      { name: 'Hydro Slime', type: 'Normal', element: 'Hydro', level: 3 },
      { name: 'Electro Slime', type: 'Normal', element: 'Electro', level: 3 },
      { name: 'Cryo Slime', type: 'Normal', element: 'Cryo', level: 3 },
      { name: 'Anemo Slime', type: 'Normal', element: 'Anemo', level: 3 }
    ],
    firstClearRewards: { gems: 50, mora: 2500, charXp: 2 }
  },
  '1-3': {
    id: '1-3', chapter: 1, name: 'Forgotten Ruins', recommendedLevel: 5, difficulty: 'Normal',
    desc: 'Enter the stone gates of ancient ruins. An ancient Abyss guard sentinel stands blocking the inner chamber.',
    enemies: [
      { name: 'Geo Slime', type: 'Normal', element: 'Geo', level: 5 },
      { name: 'Abyss Obsidian Berserker', type: 'Elite', element: 'Geo', level: 5 }
    ],
    firstClearRewards: { gems: 60, mora: 3000, charXp: 3 }
  },
  '1-4': {
    id: '1-4', chapter: 1, name: 'Elite Guardian', recommendedLevel: 8, difficulty: 'Normal',
    desc: 'Defeat the dual elemental guards that stabilize the core ruins energy matrix.',
    enemies: [
      { name: 'Abyss Cryo Channeler', type: 'Elite', element: 'Cryo', level: 8 },
      { name: 'Epoch Ruin Guard', type: 'Elite', element: 'Geo', level: 8 }
    ],
    firstClearRewards: { gems: 65, mora: 3500, charXp: 3 }
  },
  '1-5': {
    id: '1-5', chapter: 1, name: 'Ruins Core Boss', recommendedLevel: 10, difficulty: 'Boss',
    desc: 'The central energy core is guarded by a massive Calamity Pyro Dragon. Defeat it to cleanse Chapter 1!',
    enemies: [
      { name: 'Calamity Pyro Dragon', type: 'Boss', element: 'Pyro', level: 10, bossType: 'fire_dragon' }
    ],
    firstClearRewards: { gems: 150, mora: 10000, charXp: 5, ascensionMaterialCount: 3, specialItem: 'Ruins Obsidian Core' }
  },

  // CHAPTER 2
  '2-1': {
    id: '2-1', chapter: 2, name: 'Burning Plains', recommendedLevel: 12, difficulty: 'Normal',
    desc: 'The heat rises. Investigate the scorched valley overflowing with Pyro energy.',
    enemies: [
      { name: 'Pyro Slime', type: 'Normal', element: 'Pyro', level: 12 },
      { name: 'Abyss Obsidian Berserker', type: 'Elite', element: 'Geo', level: 12 }
    ],
    firstClearRewards: { gems: 60, mora: 4000, charXp: 3 }
  },
  '2-2': {
    id: '2-2', chapter: 2, name: 'Frozen River', recommendedLevel: 14, difficulty: 'Normal',
    desc: 'Cross the frozen waters where Cryo forces have locked the shipping lanes.',
    enemies: [
      { name: 'Cryo Slime', type: 'Normal', element: 'Cryo', level: 14 },
      { name: 'Abyss Cryo Channeler', type: 'Elite', element: 'Cryo', level: 14 }
    ],
    firstClearRewards: { gems: 60, mora: 4500, charXp: 3 }
  },
  '2-3': {
    id: '2-3', chapter: 2, name: 'Thunder Valley', recommendedLevel: 16, difficulty: 'Normal',
    desc: 'High-voltage lightning strikes this canyon. Clear the magnetic anomalies.',
    enemies: [
      { name: 'Electro Slime', type: 'Normal', element: 'Electro', level: 16 },
      { name: 'Epoch Ruin Guard', type: 'Elite', element: 'Cryo', level: 16 }
    ],
    firstClearRewards: { gems: 65, mora: 5000, charXp: 4 }
  },
  '2-4': {
    id: '2-4', chapter: 2, name: 'Elemental Trial', recommendedLevel: 18, difficulty: 'Normal',
    desc: 'Combine reactions to destroy a wave of mixed elemental guardians.',
    enemies: [
      { name: 'Pyro Slime', type: 'Normal', element: 'Pyro', level: 18 },
      { name: 'Hydro Slime', type: 'Normal', element: 'Hydro', level: 18 },
      { name: 'Abyss Cryo Channeler', type: 'Elite', element: 'Cryo', level: 18 }
    ],
    firstClearRewards: { gems: 70, mora: 5500, charXp: 4 }
  },
  '2-5': {
    id: '2-5', chapter: 2, name: 'Elemental Overlord Boss', recommendedLevel: 20, difficulty: 'Boss',
    desc: 'Vanquish the Glacial Frost Golem that rules the elemental nexus.',
    enemies: [
      { name: 'Glacial Frost Golem', type: 'Boss', element: 'Cryo', level: 20, bossType: 'ice_golem' }
    ],
    firstClearRewards: { gems: 200, mora: 15000, charXp: 6, ascensionMaterialCount: 4, specialItem: 'Absolute Zero Lens' }
  },

  // CHAPTER 3
  '3-1': {
    id: '3-1', chapter: 3, name: 'Lost Sanctuary', recommendedLevel: 22, difficulty: 'Normal',
    desc: 'Discover a sacred shrine hidden inside Aetheria mountain ranges.',
    enemies: [
      { name: 'Anemo Slime', type: 'Normal', element: 'Anemo', level: 22 },
      { name: 'Geo Slime', type: 'Normal', element: 'Geo', level: 22 }
    ],
    firstClearRewards: { gems: 70, mora: 6000, charXp: 4 }
  },
  '3-2': {
    id: '3-2', chapter: 3, name: 'Corrupted Forest', recommendedLevel: 25, difficulty: 'Normal',
    desc: 'Cleanse the corrupted root node where Dendro slimes have gone berserk.',
    enemies: [
      { name: 'Dendro Slime', type: 'Normal', element: 'Dendro', level: 25 },
      { name: 'Abyss Obsidian Berserker', type: 'Elite', element: 'Geo', level: 25 }
    ],
    firstClearRewards: { gems: 75, mora: 6500, charXp: 4 }
  },
  '3-3': {
    id: '3-3', chapter: 3, name: 'Ancient Temple', recommendedLevel: 28, difficulty: 'Normal',
    desc: 'Ascend the temple steps. Watch out for ancient guard machinery.',
    enemies: [
      { name: 'Epoch Ruin Guard', type: 'Elite', element: 'Geo', level: 28 },
      { name: 'Abyss Cryo Channeler', type: 'Elite', element: 'Cryo', level: 28 }
    ],
    firstClearRewards: { gems: 80, mora: 7000, charXp: 5 }
  },
  '3-4': {
    id: '3-4', chapter: 3, name: 'Guardian Chamber', recommendedLevel: 30, difficulty: 'Normal',
    desc: 'Battle the dual temple Sentinels before accessing the dragon altar.',
    enemies: [
      { name: 'Abyss Obsidian Berserker', type: 'Elite', element: 'Geo', level: 30 },
      { name: 'Epoch Ruin Guard', type: 'Elite', element: 'Cryo', level: 30 }
    ],
    firstClearRewards: { gems: 85, mora: 8000, charXp: 5 }
  },
  '3-5': {
    id: '3-5', chapter: 3, name: 'Ancient Dragon Boss', recommendedLevel: 35, difficulty: 'Boss',
    desc: 'Awaken and defeat the Tempest Thunderbird dragon guarding the Gates of Aetheria!',
    enemies: [
      { name: 'Tempest Thunderbird', type: 'Boss', element: 'Electro', level: 35, bossType: 'thunderbird' }
    ],
    firstClearRewards: { gems: 250, mora: 20000, charXp: 8, ascensionMaterialCount: 5, specialItem: 'Stormborn Feather' }
  }
};

const getCharacterStoryBossType = (element: ElementType): StoryEnemySpec['bossType'] => {
  if (element === 'Cryo' || element === 'Hydro') return 'ice_golem';
  if (element === 'Electro' || element === 'Anemo') return 'thunderbird';
  return 'fire_dragon';
};

const getCharacterStoryStageSpec = (charId: string, act: number): StoryStageSpec => {
  const character = PLAYABLE_CHARACTERS.find(c => c.id === charId);
  const characterName = character?.name || 'Character';
  const element = character?.element || 'Anemo';
  const safeAct = Math.min(3, Math.max(1, act));
  const recommendedLevel = safeAct === 1 ? 10 : safeAct === 2 ? 24 : 38;
  const firstClearRewards: StoryStageReward = safeAct === 1
    ? { gems: 150, mora: 10000, charXp: 0 }
    : safeAct === 2
      ? { gems: 300, mora: 22000, charXp: 0 }
      : { gems: 500, mora: 40000, charXp: 0 };

  const enemies: StoryEnemySpec[] = safeAct === 1
    ? [{ name: `${characterName} Memory Shade`, type: 'Normal', element, level: recommendedLevel }]
    : safeAct === 2
      ? [{ name: `${characterName} Elite Echo`, type: 'Elite', element, level: recommendedLevel }]
      : [{
          name: `${characterName} Trial Boss`,
          type: 'Boss',
          element,
          level: recommendedLevel,
          bossType: getCharacterStoryBossType(element)
        }];

  return {
    id: `char-${charId}-${safeAct}`,
    chapter: 0,
    name: `${characterName} Character Story Act ${safeAct}`,
    recommendedLevel,
    difficulty: safeAct === 3 ? 'Boss' : 'Normal',
    desc: 'Character Stories are optional side battles that let you learn more about characters and earn Mora and Gems. They do not provide stat bonuses or combat power.',
    enemies,
    firstClearRewards
  };
};

// Procedural generation helper for chapters 4 to 10
export const getStageSpec = (stageId: string): StoryStageSpec => {
  const charStoryMatch = stageId.match(/^char-(.+)-([123])$/);
  if (charStoryMatch) {
    return getCharacterStoryStageSpec(charStoryMatch[1], parseInt(charStoryMatch[2], 10));
  }

  if (STORY_STAGES[stageId]) return STORY_STAGES[stageId];
  
  // Parse stageId like "4-3"
  const [chapStr, stageStr] = stageId.split('-');
  const chapter = parseInt(chapStr) || 1;
  const stage = parseInt(stageStr) || 1;

  const chapMeta = STORY_CHAPTERS.find(c => c.id === chapter);
  const chapTitle = chapMeta ? chapMeta.title : `Chapter ${chapter}`;

  const recommendedLevel = 35 + (chapter - 3) * 10 + (stage - 1) * 2;
  const difficulty = stage === 5 ? 'Boss' : 'Normal';

  // Procedural names
  const stageNames: Record<number, string[]> = {
    4: ['Shadow Outpost', 'Wailing Ruins', 'Gate of Whispers', 'Obsidian Altar', 'Void Overlord Boss'],
    5: ['Starlight Gate', 'Astral Nexus', 'Aura Chambers', 'Cosmic Pillar', 'Eternity Knight Boss'],
    6: ['Sulfur Grotto', 'Ice-Fire Stream', 'Ashen Spires', 'Steam Vaults', 'Frostfire Wyrm Boss'],
    7: ['Wind Spire', 'Skyroad Bridges', 'Gale Sanctuary', 'Zephyr Pillars', 'Skyward Avian Boss'],
    8: ['Magma Chambers', 'Volcano Roots', 'Obsidian Forge', 'Crucible Gates', 'Molten Overlord Boss'],
    9: ['Rift Boundary', 'Glitch Nexus', 'Paradox Fields', 'Unstable Reactor', 'Chronos Monarch Boss'],
    10: ['Reforged Bastion', 'Trial of Pyro', 'Trial of Cryo', 'Ascendant Pillar', 'Eldric Core Prime Boss']
  };

  const name = (stageNames[chapter] && stageNames[chapter][stage - 1]) || `Stage ${stageId}`;

  // Procedural rewards
  const firstClearRewards: StoryStageReward = difficulty === 'Boss' 
    ? { 
        gems: 100 + chapter * 50, 
        mora: 10000 + chapter * 3000, 
        charXp: 5 + Math.floor(chapter / 2),
        ascensionMaterialCount: 3 + Math.floor(chapter / 3),
        specialItem: `Aetheric Essence Cap ${chapter}`
      }
    : { 
        gems: 50 + chapter * 10, 
        mora: 3000 + chapter * 1000 + stage * 200, 
        charXp: 2 + Math.floor(chapter / 4)
      };

  // Procedural enemies
  const elements: ElementType[] = ['Pyro', 'Hydro', 'Cryo', 'Electro', 'Anemo', 'Geo', 'Dendro'];
  const baseElement = elements[(chapter + stage) % elements.length];
  const secondElement = elements[(chapter * 2 + stage) % elements.length];

  const enemies: StoryEnemySpec[] = [];
  if (difficulty === 'Boss') {
    const bossTypes: ('fire_dragon' | 'ice_golem' | 'thunderbird')[] = ['fire_dragon', 'ice_golem', 'thunderbird'];
    const bType = bossTypes[chapter % bossTypes.length];
    enemies.push({
      name: `Colossus of ${baseElement}`,
      type: 'Boss',
      element: baseElement,
      level: recommendedLevel,
      bossType: bType
    });
  } else {
    enemies.push({ name: `${baseElement} Spore Slime`, type: 'Normal', element: baseElement, level: recommendedLevel });
    enemies.push({ name: `${secondElement} Shock Slime`, type: 'Normal', element: secondElement, level: recommendedLevel });
    if (stage >= 3) {
      enemies.push({ name: `Vanguard Elite ${stageId}`, type: 'Elite', element: baseElement, level: recommendedLevel });
    }
  }

  return {
    id: stageId,
    chapter,
    name,
    recommendedLevel,
    difficulty,
    desc: `Enter the challenges of ${chapTitle} in stage ${stageId}. Stabilize the surrounding elemental forces.`,
    enemies,
    firstClearRewards
  };
};

// Visual Novel Script Dialogues Database
export const STORY_DIALOGUES: Record<string, { before?: StoryDialogueLine[], after?: StoryDialogueLine[] }> = {
  // CHAPTER 1
  '1-1': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Hmm, the Whispering Forest feels unusually heavy today. The wind itself seems perturbed.' },
      { speaker: 'Marina', element: 'Hydro', text: 'You feel it too, Eldric? My waters are bubbling with erratic frequencies. Look ahead!' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Slimes! They are blockading the merchant caravan routes. Draw your weapons, let\'s cleanse this road!' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'Whew, that was a warm-up. But did you notice how unstable their elemental cores were?' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Indeed. Something deeper in the ruins is radiating a strange magnetic force. We must investigate further.' }
    ]
  },
  '1-3': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'The ruins start here. Eldric, these obsidian stones are ancient... predating the Dawning Core Client.' },
      { speaker: 'Guardian Sentry', element: 'Geo', text: 'HALT. MORTALS. INTRUSION DETECTED. PREPARE FOR SCANNING AND PURGATION.', effect: 'shake' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'A sentinel guard! It\'s completely corrupted by raw Geo crystals. Take cover!' }
    ],
    after: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The sentinel has powered down. It was buffering a warning... "The Ruins Core is breached."' },
      { speaker: 'Marina', element: 'Hydro', text: 'We are close. The elemental heat signature is skyrocketing. Be ready for anything.' }
    ]
  },
  '1-5': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Look at the center! The elemental nexus is burning!' },
      { speaker: 'Marina', element: 'Hydro', text: 'No, that\'s... a massive dragon! It\'s absorbing the core obsidian stones!', effect: 'flash' },
      { speaker: 'Calamity Pyro Dragon', element: 'Pyro', text: 'ROOOAAAR! INSECTS OF LIGHT, YOU SHALL BURN IN THE CRUCIBLE OF REBORN FLAMES!', effect: 'shake' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'It\'s fully active! Marina, trigger elemental swirl reactions on my mark! Engage!' }
    ],
    after: [
      { speaker: 'Calamity Pyro Dragon', element: 'Pyro', text: 'Gurgle... The stardust... has not... forgotten...', effect: 'flash' },
      { speaker: 'Marina', element: 'Hydro', text: 'It\'s disintegrating! The obsidian core is stabilizing. Look, a core fragment left behind!' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'This obsidian core... contains coordinates pointing towards the Burning Plains. The Elemental Crisis has just begun.' }
    ]
  },

  // CHAPTER 2: ELEMENTAL CRISIS
  '2-1': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The air is scorching here on the Burning Plains. Keep your elemental shields up!' },
      { speaker: 'Marina', element: 'Hydro', text: 'The local water reserves are completely evaporated. Pyro slimes are condensing rapidly ahead!' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'They are feeding on the tectonic core leaks. Let\'s cool down their spirits!' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'That cooled things down, but the ambient heat is still rising.' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Yes, the tectonic core is leaking further north. We must press on through the temperature chasm.' }
    ]
  },
  '2-3': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'Eldric! The clouds are pitch black, and the canyon is vibrating with high-voltage friction.' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Thunder Valley... a magnetic trap. Look, those Electro slimes are charging a corrupted automaton!' },
      { speaker: 'Marina', element: 'Hydro', text: 'If we trigger Electro-charged reactions, we can short-circuit their magnetic field!' }
    ],
    after: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The lightning strikes are subsiding. Excellent quick thinking, Marina.' },
      { speaker: 'Marina', element: 'Hydro', text: 'The core energy signatures are converging. The elemental overlord chamber lies just ahead.' }
    ]
  },
  '2-5': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'Brrr... it\'s freezing! The heat is literally being sucked out of the space!' },
      { speaker: 'Glacial Frost Golem', element: 'Cryo', text: 'COLD... SHALL... CONSUME... ALL... LIFE...', effect: 'shake' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'It\'s the Glacial Frost Golem! It\'s locking the entire valley in permanent stasis. We must shatter its icy shell!' }
    ],
    after: [
      { speaker: 'Glacial Frost Golem', element: 'Cryo', text: 'Ice... cracks... the light... returns...', effect: 'flash' },
      { speaker: 'Marina', element: 'Hydro', text: 'Look, it left behind the Absolute Zero Lens! The freezing aura is dissipating.' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'This lens focuses cosmic light. It points towards the peaks of Ancient Aetheria. Let\'s climb!' }
    ]
  },

  // CHAPTER 3: ANCIENT AETHERIA
  '3-1': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The Lost Sanctuary... It\'s beautiful. The architecture is carved out of pure white marble.' },
      { speaker: 'Marina', element: 'Hydro', text: 'But the air smells of rotten ozone. Look at those Anemo slimes... they are acting like wild wind beasts!' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The Aether gates are leaking raw energy. We need to clear the platform first.' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'The winds have settled. The white columns are glowing with soft starlight.' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'But look at the path to the temple. It is heavily guarded by the old sentinels.' }
    ]
  },
  '3-3': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'We have entered the inner corridors. The energy here is suffocating.' },
      { speaker: 'Epoch Ruin Guard', element: 'Geo', text: 'GUARDIAN PROTOCOL ACTIVE. WEAPON SYSTEMS STABILIZED. ELIMINATE INVADERS.', effect: 'shake' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'It\'s an ancient Ruin Guard sentinel. Keep active and parry its heavy attacks!' }
    ],
    after: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The sentinel is down. But did you hear that screech from the high tower?' },
      { speaker: 'Marina', element: 'Hydro', text: 'The Tempest Thunderbird... it\'s awakening at the summit altar!' }
    ]
  },
  '3-5': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The storm winds are tearing the temple roof apart!' },
      { speaker: 'Tempest Thunderbird', element: 'Electro', text: 'SCREEECH! INTENSIFYING THUNDERSTORM MATRIX! FALL INTO DUST!', effect: 'shake' },
      { speaker: 'Marina', element: 'Hydro', text: 'It\'s too fast! Eldric, we need to ground its lightning strikes using Geo and Cryo reactions!' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'On my mark! Charge!' }
    ],
    after: [
      { speaker: 'Tempest Thunderbird', element: 'Electro', text: 'Screee... the storm... clears...', effect: 'flash' },
      { speaker: 'Marina', element: 'Hydro', text: 'The wind has completely died down. The starlight is shining on the altar.' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'We have stabilized the gates of Aetheria. Let\'s retrieve the Stormborn Feather.' }
    ]
  },

  // CHAPTER 4: WHISPERS OF THE ABYSS
  '4-1': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The Abyssal chasm... The shadows here are so thick, even my Anemo currents feel sluggish.' },
      { speaker: 'Marina', element: 'Hydro', text: 'Be careful, Eldric. The dark matter is trying to absorb our elemental cores.' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'The immediate shadow zone is purified.' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'But the deeper outposts are still active. We must press on.' }
    ]
  },
  '4-3': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'This looks like an ancient altar. The inscriptions... they talk about the stardust prophecy.' },
      { speaker: 'Abyss Obsidian Berserker', element: 'Geo', text: 'YOU SHALL NOT DECODE THE SACRED SCRIPT. RETURN TO THE VOID!', effect: 'shake' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'An elite sentinel of the void! Defend the altar!' }
    ],
    after: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The sentinel has returned to dust. Let\'s translate the remaining lines.' },
      { speaker: 'Marina', element: 'Hydro', text: '"When the stars fade, the Chronos Monarch shall reset the timeline..." It\'s a warning!' }
    ]
  },
  '4-5': {
    before: [
      { speaker: 'Void Overlord', element: 'Geo', text: 'I AM THE OBSIDIAN WILL OF THE ABYSS. CONSUME THEIR LIGHT!', effect: 'shake' },
      { speaker: 'Marina', element: 'Hydro', text: 'It\'s pulling us into a gravity well! We must burst it down before we lose all light!' }
    ],
    after: [
      { speaker: 'Void Overlord', element: 'Geo', text: 'My shadow... returns... to the core...', effect: 'flash' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The chasm is collapsing, but look! A ladder of pure light has appeared.' }
    ]
  },

  // CHAPTER 5: ECHOES OF ETERNITY
  '5-1': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'Wow, we are walking on a bridge made of pure stardust!' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The Starlight Gate. The laws of physics are different here. We are in a dimension outside time.' }
    ],
    after: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The star bridge has locked behind us. No going back.' }
    ]
  },
  '5-3': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'This chamber... it\'s projecting spectral images of ancient heroes.' },
      { speaker: 'Aetheria Oracle', element: 'Anemo', text: 'Brave travelers. Prove your resolve against the echoes of eternity.', effect: 'shake' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'The spectral echoes have faded. They were testing our synergy.' }
    ]
  },
  '5-5': {
    before: [
      { speaker: 'Eternity Knight', element: 'Geo', text: 'I AM THE GUARD OF THE SACRED STARDUST CORE. PREPARE YOUR TRIAL!', effect: 'shake' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Its defense shield is reinforced with stardust! Marina, overload its barriers with continuous swirled reactions!' }
    ],
    after: [
      { speaker: 'Eternity Knight', element: 'Geo', text: 'Your resolve... is... eternal...', effect: 'flash' },
      { speaker: 'Marina', element: 'Hydro', text: 'The stardust core has opened a portal of volcanic heat!' }
    ]
  },

  // CHAPTER 6: THE FROSTFIRE CHASM
  '6-1': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Look at this geological anomaly. Magma streams are running side-by-side with glacial riverbeds.' },
      { speaker: 'Marina', element: 'Hydro', text: 'The steam pressure is rising rapidly. My Hydro sensors are going wild!' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'We cooled the sulfur pockets. The steam pressure is falling.' }
    ]
  },
  '6-3': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'The steam pressure valves are completely locked by molten rock and ice.' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'An elite sentinel is protecting the valve controls. Clear it out!' }
    ],
    after: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Valves released. The chasm temperature is stabilizing temporarily.' }
    ]
  },
  '6-5': {
    before: [
      { speaker: 'Frostfire Wyrm', element: 'Pyro', text: 'ROOOOOOOAR! METALLIC FLAME AND ICE SHATTER ALL WHO INTRUDE!', effect: 'shake' },
      { speaker: 'Marina', element: 'Hydro', text: 'A dragon of absolute frost and lava! It\'s shifting elements every few seconds! Watch the color of its core!' }
    ],
    after: [
      { speaker: 'Frostfire Wyrm', element: 'Pyro', text: 'Frost... melts... fire... burns... out...', effect: 'flash' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The dragon has disintegrated. Let\'s extract the Frostfire Core and climb the mountain spires.' }
    ]
  },

  // CHAPTER 7: SKYWARD ASCENT
  '7-1': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'The altitude is dizzying. We are walking on suspension bridges made of wind threads!' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Stay calm, Marina. Trust the Anemo currents to support your weight.' }
    ],
    after: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The bridge has stabilized. We have reached the floating cloud outpost.' }
    ]
  },
  '7-3': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'The avian sentinels are blockading the sanctuary path. They are aggressive!' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'They are protecting the Zephyr Pillar. Let\'s show them our respect through combat!' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'The bird sentinels have dispersed. The pillar is activated.' }
    ]
  },
  '7-5': {
    before: [
      { speaker: 'Skyward Garuda', element: 'Anemo', text: 'SCREEECH! HUMANS, THE SKY IS THE REALM OF THE ASCENDANT ONES!', effect: 'shake' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'It\'s the lord of the skies! Ground its flight with heavy ice and rock elements!' }
    ],
    after: [
      { speaker: 'Skyward Garuda', element: 'Anemo', text: 'The wind... belongs... to... all...', effect: 'flash' },
      { speaker: 'Marina', element: 'Hydro', text: 'The storm has cleared. The sun is shining directly onto the volcanic crucible below.' }
    ]
  },

  // CHAPTER 8: HEART OF THE VOLCANO
  '8-1': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'We have entered Mount Eldruin. The floor is pure lava. Keep your distance!' },
      { speaker: 'Marina', element: 'Hydro', text: 'The magma is boiling with intense pressure. Molten creatures are rising!' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'The immediate lava field is cooled. We have a pathway forward.' }
    ]
  },
  '8-3': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'Look at that massive anvil! This is the ancient Forge of Obsidian.' },
      { speaker: 'Forge Warden', element: 'Pyro', text: 'THE FORGE IS BURNING. INTRUDERS SHALL BE RE-FORGED INTO ASH!', effect: 'shake' }
    ],
    after: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The Forge Warden is deactivated. We have acquired the legendary Volcano Ore.' }
    ]
  },
  '8-5': {
    before: [
      { speaker: 'Molten Overlord', element: 'Pyro', text: 'I AM THE TECTONIC FURY OF AETHERIA. DROWN IN THE MAGMA MATRIX!', effect: 'shake' },
      { speaker: 'Marina', element: 'Hydro', text: 'It\'s drawing lava from the core! Eldric, swirl my hydro vaporize drops onto its hot shield!' }
    ],
    after: [
      { speaker: 'Molten Overlord', element: 'Pyro', text: 'The fire... fades... to ash...', effect: 'flash' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The volcanic core is stabilized. But a temporal rift is tearing open in front of us!' }
    ]
  },

  // CHAPTER 9: DIMENSIONAL RIFT
  '9-1': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Space itself is tearing apart! Look, that\'s a forest floating next to a volcanic rock!' },
      { speaker: 'Marina', element: 'Hydro', text: 'Multiple dimensional matrixes are colliding. The slimes here are hyper-mutated!' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'We stabilized this rift section. The dimensions are merging.' }
    ]
  },
  '9-3': {
    before: [
      { speaker: 'Marina', element: 'Hydro', text: 'The clock gears are spinning backwards. Time is glitching!' },
      { speaker: 'Glitch Sentinel', element: 'Electro', text: 'ERROR 404: PROTOCOL CORRUPTED. PURGE TIME STREAM.', effect: 'shake' }
    ],
    after: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The glitch sentinel is gone. The time stream has normalized, pointing towards the final platform.' }
    ]
  },
  '9-5': {
    before: [
      { speaker: 'Chronos Monarch', element: 'Electro', text: 'MORTALS. TIME IS MY CANVAS. YOU SHALL BE ERASED FROM EXISTENCE!', effect: 'shake' },
      { speaker: 'Marina', element: 'Hydro', text: 'It\'s accelerating our decay! Eldric, we must end this before the dimensional rift collapses!' }
    ],
    after: [
      { speaker: 'Chronos Monarch', element: 'Electro', text: 'Time... flows... forward... once... more...', effect: 'flash' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The dimensional rifts are closed. The central engine of Aetheria lies open.' }
    ]
  },

  // CHAPTER 10: AETHERIA REFORGED
  '10-1': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'The Reforged Bastion... The core of the element matrix.' },
      { speaker: 'Marina', element: 'Hydro', text: 'The elements are perfectly balanced here. The final trials are about to begin.' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'The initial guardian pillar has been activated.' }
    ]
  },
  '10-3': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'This is the trial of the Ascendant Pillar. The guardians are ancient projections of the creators.' },
      { speaker: 'Ascendant Guard', element: 'Geo', text: 'PROVE YOUR VALUE. STABILIZE THE ELEMENTAL SYSTEM OR BE REPLACED.', effect: 'shake' }
    ],
    after: [
      { speaker: 'Marina', element: 'Hydro', text: 'We passed the trial! The creators have acknowledged our synergy.' }
    ]
  },
  '10-5': {
    before: [
      { speaker: 'Eldric Core Prime', element: 'Anemo', text: 'I AM THE SYSTEM INTELLIGENCE OF AETHERIA. INITIATING FINAL STABILIZATION VERIFICATION TRIAL.', effect: 'shake' },
      { speaker: 'Marina', element: 'Hydro', text: 'This is it, Eldric! The ultimate test of our elements! For the future of Aetheria!' }
    ],
    after: [
      { speaker: 'Eldric Core Prime', element: 'Anemo', text: 'VERIFICATION PASS. THE ELEMENTAL CORE IS STABILIZED. SAVIORS OF AETHERIA.', effect: 'flash' },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'We did it. Aetheria is reforged. The elemental matrix is fully synchronized.' },
      { speaker: 'Marina', element: 'Hydro', text: 'Yes... the stardust has finally found its home.' }
    ]
  },

  // Chapter completions visual novel dialogues
  'chapter-1-clear': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Chapter 1: "The Awakening" completed.' },
      { speaker: 'Aetheria Oracle', element: 'Anemo', text: 'Brave combatants. You have stabilized the Whispering Forest. But the elemental tears are spreading. Chapter 2 awaits.' }
    ]
  },
  'chapter-2-clear': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Chapter 2: "Elemental Crisis" resolved.' },
      { speaker: 'Aetheria Oracle', element: 'Anemo', text: 'The elemental overlords have fallen. Yet, the gate of Ancient Aetheria is vibrating. Ancient dragons awaken.' }
    ]
  },
  'chapter-3-clear': {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Chapter 3: "Ancient Aetheria" completed.' },
      { speaker: 'Aetheria Oracle', element: 'Anemo', text: 'The gates are stabilized! The elements have returned to their proper orbit. You have written a new legend.' }
    ]
  }
};

// Dialogue generator for other stages
export const getStageDialogue = (stageId: string): { before?: StoryDialogueLine[], after?: StoryDialogueLine[] } => {
  if (STORY_DIALOGUES[stageId]) return STORY_DIALOGUES[stageId];

  const spec = getStageSpec(stageId);
  const [chapStr, stageStr] = stageId.split('-');
  const chapter = parseInt(chapStr);
  const stage = parseInt(stageStr);

  const chapterLoreContext: Record<number, { before: string[], after: string[], element: ElementType }> = {
    4: {
      before: [
        `The shadows here in the Abyss are active. Watch your step.`,
        `The dark energy is consuming the elemental particles. Let's purify this area!`
      ],
      after: [
        `The abyssal shadow has dispersed.`,
        `We are uncovering more secrets of the ancient kings.`
      ],
      element: 'Geo'
    },
    5: {
      before: [
        `The stars are aligning over the stardust sanctuary.`,
        `I feel the presence of ancient reflections. Let's prove our strength!`
      ],
      after: [
        `The reflection fades back into stardust.`,
        `The temple gates are welcoming us deeper.`
      ],
      element: 'Anemo'
    },
    6: {
      before: [
        `The steam is blinding! Lava and ice are colliding in this chasm.`,
        `Be careful of thermal shock reactions. Let's stabilize the temperature!`
      ],
      after: [
        `The steam is clearing.`,
        `The pressure valves of the chasm are returning to normal.`
      ],
      element: 'Pyro'
    },
    7: {
      before: [
        `We are climbing above the clouds. The wind is fierce!`,
        `Avian guardians are nesting here. Let's fly past them!`
      ],
      after: [
        `The skies are clear again.`,
        `The pathway to the summit is open.`
      ],
      element: 'Anemo'
    },
    8: {
      before: [
        `The heat is unbearable near the core of Mount Eldruin.`,
        `Molten creatures are rising from the magma. Keep them away!`
      ],
      after: [
        `The lava flow is receding.`,
        `We must reach the crucible before the volcanic eruption occurs.`
      ],
      element: 'Pyro'
    },
    9: {
      before: [
        `The fabric of space is tearing apart! Dimensions are colliding.`,
        `We are seeing multiple elements combined. Watch out for rapid reactions!`
      ],
      after: [
        `The rift has stabilized temporarily.`,
        `Keep moving before the space-time loop resets.`
      ],
      element: 'Electro'
    },
    10: {
      before: [
        `This is the final trial of the core. The creators themselves are watching.`,
        `Let's put everything we've learned to the test. For Aetheria!`
      ],
      after: [
        `The core has been stabilized.`,
        `The matrix is saved. Aetheria is reforged!`
      ],
      element: 'Hydro'
    }
  };

  const context = chapterLoreContext[chapter] || {
    before: [
      `We've arrived at ${spec.name}. The energy signature here is strong.`,
      `Let's secure this position.`
    ],
    after: [
      `Area cleared and stabilized.`,
      `Let's move forward.`
    ],
    element: 'Anemo'
  };

  return {
    before: [
      { speaker: 'Eldric Thorne', element: 'Anemo', text: context.before[0] },
      { speaker: 'Marina', element: context.element, text: context.before[1] }
    ],
    after: [
      { speaker: 'Marina', element: context.element, text: context.after[0] },
      { speaker: 'Eldric Thorne', element: 'Anemo', text: context.after[1] }
    ]
  };
};

// Character Story VN scripts
export const CHARACTER_STORIES_SCRIPTS: Record<string, Record<string, { before: StoryDialogueLine[], after: StoryDialogueLine[] }>> = {
  'marina': {
    '1': {
      before: [
        { speaker: 'Marina', element: 'Hydro', text: 'Welcome to the sea cliffs. This is where I first learned to harness the hydro elements.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'It\'s peaceful, Marina. But why do you look so worried?' },
        { speaker: 'Marina', element: 'Hydro', text: 'The tides... they are receding. A wave of slimes is trying to boil the water. Help me defend this shore!' }
      ],
      after: [
        { speaker: 'Marina', element: 'Hydro', text: 'Thank you, Eldric. The tides are returning to their natural flow.' },
        { speaker: 'Eldric Thorne', element: 'Anemo', text: 'Your control over Hydro is outstanding. This memory is safe again.' }
      ]
    },
    '2': {
      before: [
        { speaker: 'Marina', element: 'Hydro', text: 'Act II: The Deep Swell. I must face the Glacial Frost Golem to test if my water can pierce absolute zero.' }
      ],
      after: [
        { speaker: 'Marina', element: 'Hydro', text: 'I did it! The frost didn\'t freeze my droplets, and the memory is finally calm.' }
      ]
    },
    '3': {
      before: [
        { speaker: 'Marina', element: 'Hydro', text: 'Act III: Sovereign of Tides. A final skirmish against the Tempest Thunderbird. The skies meet the deep ocean!' }
      ],
      after: [
        { speaker: 'Marina', element: 'Hydro', text: 'The ocean remembers my call. That chapter of my past feels lighter now.' }
      ]
    }
  }
};

export const getCharacterStoryScript = (charId: string, act: number): { before: StoryDialogueLine[], after: StoryDialogueLine[] } => {
  if (CHARACTER_STORIES_SCRIPTS[charId] && CHARACTER_STORIES_SCRIPTS[charId][act.toString()]) {
    return CHARACTER_STORIES_SCRIPTS[charId][act.toString()];
  }
  
  // Fallback procedural dialogue
  const charName = charId.toUpperCase();
  return {
    before: [
      { speaker: charName, text: `This is my Story Act ${act}. This optional memory battle will reveal another piece of my past.` },
      { speaker: 'Aetheria Oracle', text: `Begin the side battle and record what you learn.` }
    ],
    after: [
      { speaker: charName, text: `The side battle is complete. Thank you for helping me understand this memory.` },
      { speaker: 'System', text: `Completed Character Story Act ${act}. Mora and Gems awarded.` }
    ]
  };
};
