/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ElementType = 'Pyro' | 'Hydro' | 'Cryo' | 'Electro' | 'Anemo' | 'Geo' | 'Dendro';
export type WeaponType = 'Sword' | 'Claymore' | 'Bow' | 'Catalyst' | 'Polearm';
export type UiThemeId = 'Blue' | 'Crimson' | 'Emerald' | 'Gold' | 'Void';

export interface SkillDetails {
  name: string;
  desc: string;
  cooldown: number; // in seconds
  damageMultiplier: number; // multiplier of character ATK
  element: ElementType;
}

export interface CharacterRelation {
  targetName: string;
  type: string;
  desc: string;
}

export interface PlayableCharacter {
  id: string;
  name: string;
  title: string;
  rarity: 3 | 4 | 5;
  element: ElementType;
  weaponType: WeaponType;
  personality: string;
  backstory: string;
  avatarPlaceholder: string; // Hex color / styles
  themeColor: string; // Tailwind class color or Hex code
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    critRate: number; // 0-1
    critDmg: number; // 0-1
  };
  skills: {
    basic: SkillDetails;
    skill: SkillDetails;
    ultimate: SkillDetails;
  };
  relations: CharacterRelation[];
}

export interface Weapon {
  id: string;
  name: string;
  rarity: 3 | 4 | 5;
  weaponType: WeaponType;
  baseAtk: number;
  statBonus: string; // e.g., "Crit Rate +8%"
  level: number;
  equippedTo?: string; // Character ID
}

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

export interface CombatCharacter {
  id: string; // Template ID
  name: string;
  element: ElementType;
  weaponType: WeaponType;
  level: number;
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  critRate: number;
  critDmg: number;
  skillCooldownRemaining: number;
  ultimateEnergy: number; // 0 - 100
  ultimateMaxEnergy: number; // 80 or similar
  skills: {
    basic: SkillDetails;
    skill: SkillDetails;
    ultimate: SkillDetails;
  };
  equippedWeaponName?: string;
  royalStacks?: number;
  widsithBuffTimer?: number;
  widsithCooldown?: number;
  widsithBuffAtk?: number;
  widsithBuffEle?: number;
  sacrificialCooldown?: number;
  swapBuffTimer?: number;
  swapBuffAtk?: number;
  crescentPikeTimer?: number;
  debateClubTimer?: number;
  debateClubCd?: number;
  scepterBubbleCd?: number;
  spearDoubleCd?: number;
  cooldownReduction?: number;
}

export interface Quest {
  id: string;
  name: string;
  desc: string;
  type: 'kill_enemy' | 'kill_boss' | 'gacha_pull' | 'level_up' | 'parry' | 'reaction' | 'mora_hoard' | 'level_weapon_high' | 'own_chars' | 'story_clear_chapter' | 'story_earn_stars' | 'story_defeat_boss';
  targetValue: number;
  currentValue: number;
  rewardTokens: number; // AetherGems
  rewardMora: number;
  completed: boolean;
  group?: 'daily' | 'weekly' | 'normal';
  rewardWeaponName?: string;
  rewardCharacterId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
  type: 'weapon_xp' | 'char_xp' | 'ascension';
  rarity: 3 | 4 | 5;
  desc: string;
}

export interface StoryProgress {
  currentChapter: number;
  currentStage: string;
  completedStages: string[];
  starRatings: Record<string, number>; // stageId -> stars count (1-3)
  unlockedLoreEntries: string[]; // unlocked lore entry IDs
  completedCharacterStoryActs: Record<string, number>; // characterId -> completed acts (1, 2, or 3)
  hardModeUnlockedChapters: number[]; // chapters with hard mode unlocked
  hardModeCompletedStages: string[]; // completed hard stages
}

export interface SaveState {
  mora: number;
  aetherGems: number;
  playerLevel?: number;
  playerExp?: number;
  playerExpMax?: number;
  specialUltimateUnlockNotified?: boolean;
  inventoryWeapons: Weapon[];
  inventoryArtifacts?: Artifact[];
  inventoryItems: InventoryItem[];
  unlockedCharacterIds: string[];
  characterLevels: Record<string, number>; // id -> level
  characterPortraits?: Record<string, number>; // id -> portrait level (0-6)
  characterHp: Record<string, number>; // id -> hp
  characterEquippedWeapon: Record<string, string>; // characterId -> weaponInstanceId
  characterEquippedArtifacts?: Record<string, Record<string, string>>; // characterId -> { slot -> artifactInstanceId }
  partyIds: string[]; // Length up to 4
  activeQuests: Quest[];
  completedQuestIds: string[];
  loginRewardClaimedDays?: number[];
  gachaPity5Star: number;
  gachaPity4Star: number;
  bannerPity5Star?: Record<string, number>; // bannerId -> pity
  bannerPity4Star?: Record<string, number>; // bannerId -> pity
  bannerGuaranteed5Star?: Record<string, boolean>; // bannerId -> guaranteed next is featured
  storyProgress?: StoryProgress;
  unlockedDamageSkins?: string[];
  activeDamageSkin?: string;
  activeUiTheme?: UiThemeId;
  lastShopRefreshHour?: number;
  purchasedShopItemIds?: string[];
  unlockedDaysCount?: number;
  nextRewardUnlockTime?: number;
  lastLoginDateStr?: string;
  stats: {
    totalPulls: number;
    totalEnemiesDefeated: number;
    totalBossesDefeated: number;
    perfectDodges: number;
    successfulParries: number;
    reactionsTriggered: number;
    highScoreWave?: number;
    highScorePoints?: number;
    playTime?: number;
    totalMoraEarned?: number;
    totalGemsEarned?: number;
    highScoreRogueRoom?: number;
    longestLoginStreak?: number;
    currentLoginStreak?: number;
  };
}
