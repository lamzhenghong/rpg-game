/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ElementType = 'Pyro' | 'Hydro' | 'Cryo' | 'Electro' | 'Anemo' | 'Geo' | 'Dendro';
export type WeaponType = 'Sword' | 'Claymore' | 'Bow' | 'Catalyst' | 'Polearm';

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
}

export interface Quest {
  id: string;
  name: string;
  desc: string;
  type: 'kill_enemy' | 'kill_boss' | 'gacha_pull' | 'level_up' | 'parry' | 'reaction' | 'mora_hoard' | 'level_weapon_high' | 'own_chars';
  targetValue: number;
  currentValue: number;
  rewardTokens: number; // AetherGems
  rewardMora: number;
  completed: boolean;
  group?: 'daily' | 'weekly' | 'normal';
}

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
  type: 'weapon_xp' | 'char_xp' | 'ascension';
  rarity: 3 | 4 | 5;
  desc: string;
}

export interface SaveState {
  mora: number;
  aetherGems: number;
  playerLevel?: number;
  playerExp?: number;
  playerExpMax?: number;
  inventoryWeapons: Weapon[];
  inventoryItems: InventoryItem[];
  unlockedCharacterIds: string[];
  characterLevels: Record<string, number>; // id -> level
  characterPortraits?: Record<string, number>; // id -> portrait level (0-6)
  characterHp: Record<string, number>; // id -> hp
  characterEquippedWeapon: Record<string, string>; // characterId -> weaponInstanceId
  partyIds: string[]; // Length up to 4
  activeQuests: Quest[];
  completedQuestIds: string[];
  loginRewardClaimedDays?: number[];
  gachaPity5Star: number;
  gachaPity4Star: number;
  bannerPity5Star?: Record<string, number>; // bannerId -> pity
  bannerPity4Star?: Record<string, number>; // bannerId -> pity
  bannerGuaranteed5Star?: Record<string, boolean>; // bannerId -> guaranteed next is featured
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
  };
}
