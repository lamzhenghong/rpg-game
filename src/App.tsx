/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import GDDViewer from './components/GDDViewer';
import GachaSimulator from './components/GachaSimulator';
import CombatArena from './components/CombatArena';
import InventoryManager from './components/InventoryManager';
import RogueDungeon from './components/RogueDungeon';
import { SaveState, Weapon, InventoryItem, Quest, ElementType } from './types';
import { PLAYABLE_CHARACTERS } from './data/characters';
import { GDD_DATA } from './data/world';
import { INITIAL_50_QUESTS } from './data/quests';
import { WEAPONS_DATABASE } from './data/weapons';
import LoginRewardModal from './components/LoginRewardModal';
import ElementalReactionsModal from './components/ElementalReactionsModal';
import SquadronQuestLedger from './components/SquadronQuestLedger';
import { 
  Shield, Sparkles, Coins, HelpCircle, History, RefreshCw, Star, 
  BookOpen, Compass, Sword, Landmark, Hammer, Trophy, DollarSign, 
  Info, Skull, LayoutGrid, CheckCircle2, Circle, Volume2, VolumeX, X, Play, LogOut, Award, Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AetheriaAudioEngine } from './utils/audio';
import mainMenuBg from '../assets/main_menu_bg.png';
import gameLogoImg from '../assets/game_logo.png';

const INITIAL_SAVE_STATE: SaveState = {
  mora: 30000, 
  aetherGems: 1600, 
  playerLevel: 1,
  playerExp: 0,
  playerExpMax: 100,
  inventoryWeapons: [
    { id: 'start_w_1', name: 'Dull Blade (Sword)', rarity: 3, weaponType: 'Sword', baseAtk: 18, statBonus: 'ATK +3%', level: 1 },
    { id: 'start_w_2', name: 'Iron Point (Claymore)', rarity: 3, weaponType: 'Claymore', baseAtk: 24, statBonus: 'Physical DMG +4%', level: 1 },
    { id: 'start_w_3', name: 'Hunter Bow (Bow)', rarity: 3, weaponType: 'Bow', baseAtk: 15, statBonus: 'Crit Rate +2%', level: 1 },
    { id: 'start_w_4', name: 'Apprentice Scroll (Catalyst)', rarity: 3, weaponType: 'Catalyst', baseAtk: 16, statBonus: 'Energy Recharge +3%', level: 1 },
    { id: 'start_w_5', name: 'Beginner Pole (Polearm)', rarity: 3, weaponType: 'Polearm', baseAtk: 20, statBonus: 'Physical DMG +2%', level: 1 }
  ],
  inventoryItems: [
    { id: 'wit_exp', name: "Hero's Wit (Character XP Boost)", count: 35, type: 'char_xp', rarity: 4, desc: 'Grants raw energy to attune character levels.' },
    { id: 'ore_exp', name: "Myconid Spore Catalyst", count: 20, type: 'ascension', rarity: 3, desc: 'Dropped by slimes in the Combat Arena.' }
  ],
  characterLevels: {
    'marina': 1
  },
  characterPortraits: {
    'marina': 0
  },
  characterHp: {
    'marina': 975
  },
  characterEquippedWeapon: {
    'marina': 'start_w_3'
  },
  partyIds: ['marina'],
  unlockedCharacterIds: ['marina'],
  activeQuests: INITIAL_50_QUESTS,
  completedQuestIds: [],
  loginRewardClaimedDays: [],
  gachaPity5Star: 0,
  gachaPity4Star: 0,
  bannerPity5Star: {
    char_banner_1: 0,
    char_banner_2: 0,
    weapon_banner_1: 0,
    weapon_banner_2: 0
  },
  bannerPity4Star: {
    char_banner_1: 0,
    char_banner_2: 0,
    weapon_banner_1: 0,
    weapon_banner_2: 0
  },
  stats: {
    totalPulls: 0,
    totalEnemiesDefeated: 0,
    totalBossesDefeated: 0,
    perfectDodges: 0,
    successfulParries: 0,
    reactionsTriggered: 0,
    highScoreWave: 1,
    highScorePoints: 0,
    playTime: 0,
    totalMoraEarned: 30000,
    totalGemsEarned: 1600,
    highScoreRogueRoom: 0
  }
};

const getInitialSaveState = (): SaveState => JSON.parse(JSON.stringify(INITIAL_SAVE_STATE));

const formatPlayTime = (seconds: number = 0) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

export default function App() {
  const [saveState, setSaveState] = useState<SaveState>(getInitialSaveState());
  // Default to Main Menu as requested: 'menu'
  const [activeScreen, setActiveScreen] = useState<'menu' | 'wiki' | 'arena' | 'wish' | 'inventory' | 'quest' | 'dungeon'>('menu');
  const [pullHistory, setPullHistory] = useState<{ name: string; rarity: number; time: string }[]>([]);
  
  const [bgmVolume, setBgmVolume] = useState<number>(100);
  const [sfxVolume, setSfxVolume] = useState<number>(100);

  const [devCheatsEnabled, setDevCheatsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('aetheria_pref_dev_cheats');
    return saved !== null ? saved === 'true' : true;
  });
  const [screenShakeEnabled, setScreenShakeEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('aetheria_pref_screen_shake');
    return saved !== null ? saved === 'true' : true;
  });
  const [combatSpeed, setCombatSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('aetheria_pref_combat_speed');
    return saved !== null ? parseFloat(saved) : 1.0;
  });

  useEffect(() => {
    localStorage.setItem('aetheria_pref_dev_cheats', devCheatsEnabled.toString());
  }, [devCheatsEnabled]);

  useEffect(() => {
    localStorage.setItem('aetheria_pref_screen_shake', screenShakeEnabled.toString());
  }, [screenShakeEnabled]);

  useEffect(() => {
    localStorage.setItem('aetheria_pref_combat_speed', combatSpeed.toString());
  }, [combatSpeed]);

  // Sync settings to disk
  useEffect(() => {
    localStorage.setItem('aetheria_bgm_volume', bgmVolume.toString());
  }, [bgmVolume]);

  useEffect(() => {
    localStorage.setItem('aetheria_sfx_volume', sfxVolume.toString());
  }, [sfxVolume]);

  // Synchronize dynamic BGM loops on screen transitions
  useEffect(() => {
    AetheriaAudioEngine.changeBgmForScreen(activeScreen);
  }, [activeScreen]);

  // Custom HUD modals and shut downs
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showLoginRewardsModal, setShowLoginRewardsModal] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [activeQuestTab, setActiveQuestTab] = useState<'daily' | 'weekly' | 'normal'>('daily');
  const [isTerminated, setIsTerminated] = useState(false);
  const [muteSfx, setMuteSfx] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keep fullscreen state in sync with browser Esc key
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // FPS and latency fluctuator arrays
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(24);

  // Modular In Game Alert System
  const [customNotification, setCustomNotification] = useState<{
    message: string;
    actionSolution?: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showInGameAlert = (message: string, actionSolution?: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCustomNotification({ message, actionSolution, type });
    // Auto clear after 4 seconds
    setTimeout(() => {
      setCustomNotification(null);
    }, 5000);
  };

  // FPS meter & Latency ticker
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const tick = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    // Fluctuate simulated latency
    const msInterval = setInterval(() => {
      setLatency(prev => {
        const diff = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const next = prev + diff;
        return Math.max(14, Math.min(38, next));
      });
    }, 1800);

    // Track play time every second
    const playTimeInterval = setInterval(() => {
      setSaveState(prev => {
        const statsCopy = { ...prev.stats };
        statsCopy.playTime = (statsCopy.playTime || 0) + 1;
        return {
          ...prev,
          stats: statsCopy
        };
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(msInterval);
      clearInterval(playTimeInterval);
    };
  }, []);

  // Sync mute settings to audio core
  useEffect(() => {
    AetheriaAudioEngine.setMute(muteSfx);
  }, [muteSfx]);

  // Auto-start BGM on the very first user interaction (click or touch anywhere)
  // Browsers require a user gesture before audio can play — this hooks that gesture.
  useEffect(() => {
    const startOnFirstInteraction = () => {
      AetheriaAudioEngine.startMusic();
      document.removeEventListener('click', startOnFirstInteraction);
      document.removeEventListener('touchstart', startOnFirstInteraction);
    };
    document.addEventListener('click', startOnFirstInteraction);
    document.addEventListener('touchstart', startOnFirstInteraction);
    return () => {
      document.removeEventListener('click', startOnFirstInteraction);
      document.removeEventListener('touchstart', startOnFirstInteraction);
    };
  }, []);

  // Load state from local storage on bootstrap
  useEffect(() => {
    try {
      // Initialize audio volume scales from disk if they exist
      const savedBgm = localStorage.getItem('aetheria_bgm_volume');
      const savedSfx = localStorage.getItem('aetheria_sfx_volume');
      if (savedBgm !== null) {
        const val = parseInt(savedBgm);
        setBgmVolume(val);
        AetheriaAudioEngine.setBgmVolume(val / 100);
      } else {
        AetheriaAudioEngine.setBgmVolume(1.0);
      }
      if (savedSfx !== null) {
        const val = parseInt(savedSfx);
        setSfxVolume(val);
        AetheriaAudioEngine.setSfxVolume(val / 100);
      } else {
        AetheriaAudioEngine.setSfxVolume(1.0);
      }

      const stored = localStorage.getItem('aetheria_rpg_save_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        const defaultState = getInitialSaveState();
        
        // Deep merge top-level and nested objects to prevent missing properties from crashing
        const merged: SaveState = {
          ...defaultState,
          ...parsed,
          bannerPity5Star: {
            ...defaultState.bannerPity5Star,
            ...(parsed.bannerPity5Star || {})
          },
          bannerPity4Star: {
            ...defaultState.bannerPity4Star,
            ...(parsed.bannerPity4Star || {})
          },
          stats: {
            ...defaultState.stats,
            ...(parsed.stats || {})
          },
          characterLevels: {
            ...defaultState.characterLevels,
            ...(parsed.characterLevels || {})
          },
          characterPortraits: {
            ...defaultState.characterPortraits,
            ...(parsed.characterPortraits || {})
          },
          characterHp: {
            ...defaultState.characterHp,
            ...(parsed.characterHp || {})
          },
          characterEquippedWeapon: {
            ...defaultState.characterEquippedWeapon,
            ...(parsed.characterEquippedWeapon || {})
          }
        };

        // Fallback for banner pity counters if they were not correctly populated
        if (!merged.bannerPity5Star.char_banner_1) {
          merged.bannerPity5Star = {
            char_banner_1: merged.gachaPity5Star || 0,
            char_banner_2: merged.gachaPity5Star || 0,
            weapon_banner_1: 0,
            weapon_banner_2: 0
          };
          merged.bannerPity4Star = {
            char_banner_1: merged.gachaPity4Star || 0,
            char_banner_2: merged.gachaPity4Star || 0,
            weapon_banner_1: 0,
            weapon_banner_2: 0
          };
        }

        // Upgrade loading save to guarantee 50 quests configuration
        if (!merged.activeQuests || merged.activeQuests.length < 30) {
          const completedIds = merged.completedQuestIds || [];
          merged.activeQuests = INITIAL_50_QUESTS.filter(q => !completedIds.includes(q.id));
        }

        // Initialize newbie logins array
        if (!merged.loginRewardClaimedDays) {
          merged.loginRewardClaimedDays = [];
        }

        setSaveState(merged);
      }

      const storedHistory = localStorage.getItem('aetheria_pull_history');
      if (storedHistory) {
        setPullHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.warn("Could not load save state on local drive, initializing default.", e);
    }
  }, []);

  // Update save states dynamically
  const triggerSaveUpdate = (updater: (prev: SaveState) => SaveState) => {
    setSaveState(prev => {
      const updated = updater(prev);
      try {
        localStorage.setItem('aetheria_rpg_save_v3', JSON.stringify(updated));
      } catch (err) {
        console.error("Local save persistence error", err);
      }
      return updated;
    });
  };

  const handleDevAddTenLevels = () => {
    AetheriaAudioEngine.playLevelUp();
    triggerSaveUpdate(prev => {
      let currentLevel = prev.playerLevel !== undefined ? prev.playerLevel : 1;
      if (currentLevel >= 80) {
        setTimeout(() => {
          showInGameAlert("DEV CHEAT CONTROLS", "Eldric Thorne is already at maximum level 80!", "info");
        }, 100);
        return prev;
      }
      let nextLevel = Math.min(80, currentLevel + 10);
      let nextExpMax = nextLevel * 100;
      let nextExp = nextLevel === 80 ? 0 : (prev.playerExp !== undefined ? prev.playerExp : 0);
      
      let lvlUpGems = 0;
      let lvlUpMora = 0;
      for (let lvl = currentLevel + 1; lvl <= nextLevel; lvl++) {
        lvlUpGems += lvl * 200;
        lvlUpMora += lvl * 2500;
      }

      setTimeout(() => {
        showInGameAlert(
          `✨ DEV CHEAT: +10 LEVELS! Reached LV.${nextLevel}!`,
          `Gained Level Milestone Rewards: +${lvlUpGems} Gems / +${lvlUpMora.toLocaleString()} Mora gold!`,
          "success"
        );
      }, 100);

      const statsCopy = { ...prev.stats };
      statsCopy.totalGemsEarned = (statsCopy.totalGemsEarned || 0) + lvlUpGems;
      statsCopy.totalMoraEarned = (statsCopy.totalMoraEarned || 0) + lvlUpMora;

      return {
        ...prev,
        playerLevel: nextLevel,
        playerExp: nextExp,
        playerExpMax: nextExpMax,
        aetherGems: prev.aetherGems + lvlUpGems,
        mora: prev.mora + lvlUpMora,
        stats: statsCopy
      };
    });
  };

  const handleModifyCurrencies = (gemsDiff: number, moraDiff: number, expDiff: number = 0) => {
    triggerSaveUpdate(prev => {
      let currentLevel = prev.playerLevel !== undefined ? prev.playerLevel : 1;
      let currentExp = prev.playerExp !== undefined ? prev.playerExp : 0;
      let currentExpMax = prev.playerExpMax !== undefined ? prev.playerExpMax : 100;

      let nextExp = currentExp + expDiff;
      let nextLevel = currentLevel;
      let nextExpMax = currentExpMax;
      
      let lvlUpGems = 0;
      let lvlUpMora = 0;
      let hasLeveledUp = false;

      while (nextExp >= nextExpMax && nextLevel < 80) {
        nextExp -= nextExpMax;
        nextLevel += 1;
        nextExpMax = nextLevel * 100;
        
        // Custom milestone rewards for leveling up
        lvlUpGems += nextLevel * 200;
        lvlUpMora += nextLevel * 2500;
        hasLeveledUp = true;
      }

      if (nextLevel >= 80) {
        nextLevel = 80;
        nextExp = 0;
      }

      if (hasLeveledUp) {
        setTimeout(() => {
          showInGameAlert(
            `✨ ELDRIC THORNE LEVEL UP! Reached LV.${nextLevel}!`,
            `Gained Level Milestone Rewards: +${lvlUpGems} Gems / +${lvlUpMora.toLocaleString()} Mora gold!`,
            "success"
          );
          AetheriaAudioEngine.playLevelUp();
        }, 100);
      }

      const statsCopy = { ...prev.stats };
      if (gemsDiff > 0) {
        statsCopy.totalGemsEarned = (statsCopy.totalGemsEarned || 0) + gemsDiff + lvlUpGems;
      } else if (lvlUpGems > 0) {
        statsCopy.totalGemsEarned = (statsCopy.totalGemsEarned || 0) + lvlUpGems;
      }
      
      if (moraDiff > 0) {
        statsCopy.totalMoraEarned = (statsCopy.totalMoraEarned || 0) + moraDiff + lvlUpMora;
      } else if (lvlUpMora > 0) {
        statsCopy.totalMoraEarned = (statsCopy.totalMoraEarned || 0) + lvlUpMora;
      }

      const newState = {
        ...prev,
        aetherGems: Math.max(0, prev.aetherGems + gemsDiff + lvlUpGems),
        mora: Math.max(0, prev.mora + moraDiff + lvlUpMora),
        playerLevel: nextLevel,
        playerExp: nextExp,
        playerExpMax: nextExpMax,
        stats: statsCopy
      };

      // Sync Mora quest targets
      let withMoraQuest = checkQuestProgress(newState, 'mora_hoard', newState.mora);

      // Check pull quests
      if (gemsDiff < 0) {
        // Reduced average cost is 144 Gems on multi, or 160 on single. Check approximate counts.
        const pullsCount = Math.abs(gemsDiff) >= 1440 ? 10 : 1;
        return checkQuestProgress(withMoraQuest, 'gacha_pull', pullsCount);
      }
      return withMoraQuest;
    });
  };

  const handleUnlockCharacter = (id: string) => {
    triggerSaveUpdate(prev => {
      const currentPortraits = prev.characterPortraits || {};
      if (prev.unlockedCharacterIds.includes(id)) {
        const nextLvl = Math.min(6, (currentPortraits[id] || 0) + 1);
        const charTemplate = PLAYABLE_CHARACTERS.find(c => c.id === id);
        const charName = charTemplate?.name || "Hero";

        setTimeout(() => {
          showInGameAlert(
            `✨ DUPLICATE SUMMON: ${charName.toUpperCase()} PORTRAIT UPGRADED!`,
            `${charName}'s Portrait Level is now P${nextLvl}! (Stats boosted in combat)`,
            "success"
          );
        }, 100);

        return {
          ...prev,
          characterPortraits: {
            ...currentPortraits,
            [id]: nextLvl
          },
          inventoryItems: prev.inventoryItems.map(i => {
            if (i.type === 'char_xp') {
              return { ...i, count: i.count + 5 };
            }
            return i;
          }),
          mora: prev.mora + 2000
        };
      }

      const charTemplate = PLAYABLE_CHARACTERS.find(c => c.id === id);
      const defaultWeaponId = (() => {
        if (!charTemplate) return 'start_w_1';
        if (charTemplate.weaponType === 'Claymore') return 'start_w_2';
        if (charTemplate.weaponType === 'Bow') return 'start_w_3';
        if (charTemplate.weaponType === 'Catalyst') return 'start_w_4';
        if (charTemplate.weaponType === 'Polearm') return 'start_w_5';
        return 'start_w_1';
      })();

      const updated = {
        ...prev,
        unlockedCharacterIds: [...prev.unlockedCharacterIds, id],
        characterLevels: { ...prev.characterLevels, [id]: 1 },
        characterPortraits: { ...currentPortraits, [id]: 0 },
        characterHp: { ...prev.characterHp, [id]: charTemplate?.baseStats.hp || 1000 },
        characterEquippedWeapon: { ...prev.characterEquippedWeapon, [id]: defaultWeaponId },
        partyIds: prev.partyIds.length < 4 ? [...prev.partyIds, id] : prev.partyIds
      };

      // Sync character owned count progress quest
      return checkQuestProgress(updated, 'own_chars', updated.unlockedCharacterIds.length);
    });
  };

  const handleLevelUpCharacter = (id: string, costMora: number, costItems: number) => {
    triggerSaveUpdate(prev => {
      const currentLevel = prev.characterLevels[id] || 1;
      const nextLevel = currentLevel + 1;

      // Character max level cap strictly 80
      if (nextLevel > 80) {
        showInGameAlert(
          "Character has reached the absolute level cap of 80!",
          "Upgrade weapons to match combat force, try deploying other event characters, or form powerful element reactions in the Combat Arena!",
          "error"
        );
        return prev;
      }

      const newLevels = { ...prev.characterLevels, [id]: nextLevel };
      const newMora = Math.max(0, prev.mora - costMora);
      const newItems = prev.inventoryItems.map(item => {
        if (item.type === 'char_xp') {
          return { ...item, count: Math.max(0, item.count - costItems) };
        }
        return item;
      });

      let updatedState = {
        ...prev,
        characterLevels: newLevels,
        mora: newMora,
        inventoryItems: newItems
      };

      // Check quest progress
      updatedState = checkQuestProgress(updatedState, 'level_up', nextLevel);

      return updatedState;
    });
  };

  const handleEquipWeapon = (charId: string, weaponUid: string) => {
    triggerSaveUpdate(prev => ({
      ...prev,
      characterEquippedWeapon: {
        ...prev.characterEquippedWeapon,
        [charId]: weaponUid
      }
    }));
  };

  const handleAddWeapon = (weapon: Weapon) => {
    triggerSaveUpdate(prev => ({
      ...prev,
      inventoryWeapons: [...prev.inventoryWeapons, weapon]
    }));
  };

  const handleUpgradeWeapon = (weaponId: string) => {
    triggerSaveUpdate(prev => {
      const weapon = prev.inventoryWeapons.find(w => w.id === weaponId);
      if (!weapon) return prev;
      
      const upgradeCost = weapon.level * 200;
      if (prev.mora < upgradeCost) {
        showInGameAlert(
          "Gold deficient! Mora is required to complete Forge activities.",
          "Jump into the 'Combat Arena' tab to defeat ordinary slimes / world bosses, claim finished achievements in the 'Quest Log', or use the developer panel +100k cheats.",
          "error"
        );
        return prev;
      }

      // Weapon max level cap strictly 50
      if (weapon.level >= 50) {
        showInGameAlert(
          "Weapon has reached the absolute level cap of 50.",
          "Spend Mora to reinforce other party weapons and match element attributes to double character damage outputs!",
          "error"
        );
        return prev;
      }

      const updatedWeapons = prev.inventoryWeapons.map(w => {
        if (w.id === weaponId) {
          return {
            ...w,
            level: w.level + 1,
            baseAtk: w.baseAtk + 2
          };
        }
        return w;
      });

      const maxLevel = Math.max(...updatedWeapons.map(w => w.level));

      let updatedState = {
        ...prev,
        mora: prev.mora - upgradeCost,
        inventoryWeapons: updatedWeapons
      };

      // Check weapon high level progress
      updatedState = checkQuestProgress(updatedState, 'level_weapon_high', maxLevel);

      showInGameAlert(
        "Ascension upgrade successful!",
        `Weapon upgraded to Level ${weapon.level + 1}. Base ATK has increased by +2!`,
        "success"
      );
      AetheriaAudioEngine.playSlash();

      return updatedState;
    });
  };

  // Stat Incrementor for Achievements
  const handleIncrementStat = (pk: string, val?: number) => {
    triggerSaveUpdate(prev => {
      const statsCopy = { ...prev.stats };
      let qType: any = '';
      let qIncrement = 1;

      if (pk === 'enemiesDefeated') {
        statsCopy.totalEnemiesDefeated++;
        qType = 'kill_enemy';
      } else if (pk === 'bossesBeaten') {
        statsCopy.totalBossesDefeated++;
        qType = 'kill_boss';
      } else if (pk === 'perfectDodges') {
        statsCopy.perfectDodges++;
        qType = 'parry';
      } else if (pk === 'successfulParries') {
        statsCopy.successfulParries++;
        qType = 'parry';
      } else if (pk === 'reactions') {
        statsCopy.reactionsTriggered++;
        qType = 'reaction';
      } else if (pk === 'rogueRoom' && val !== undefined) {
        if (val > (statsCopy.highScoreRogueRoom || 0)) {
          statsCopy.highScoreRogueRoom = val;
        }
      }

      const updated = {
        ...prev,
        stats: statsCopy
      };

      if (qType) {
        return checkQuestProgress(updated, qType, qIncrement);
      }
      return updated;
    });
  };

  // Check and increment quest progress states
  const checkQuestProgress = (state: SaveState, type: string, amount: number) => {
    const updatedQuests = state.activeQuests.map(q => {
      if (q.type === type && !q.completed) {
        let nextVal = q.currentValue;
        if (type === 'level_up' || type === 'level_weapon_high' || type === 'mora_hoard' || type === 'own_chars') {
          nextVal = Math.max(nextVal, amount); // check highest level/item threshold
        } else {
          nextVal += amount;
        }

        const isNowCompleted = nextVal >= q.targetValue;
        return {
          ...q,
          currentValue: nextVal,
          completed: isNowCompleted
        };
      }
      return q;
    });

    return {
      ...state,
      activeQuests: updatedQuests
    };
  };

  // Claim specific finished Quest rewards
  const claimQuestReward = (questId: string) => {
    const quest = saveState.activeQuests.find(q => q.id === questId);
    if (!quest || !quest.completed) return;

    triggerSaveUpdate(prev => ({
      ...prev,
      aetherGems: prev.aetherGems + quest.rewardTokens,
      mora: prev.mora + quest.rewardMora,
      activeQuests: prev.activeQuests.filter(q => q.id !== questId),
      completedQuestIds: [...prev.completedQuestIds, questId]
    }));

    showInGameAlert(
      "Claimed Quest Reward Successfully!",
      `Received +${quest.rewardTokens} Aether Gems and +${quest.rewardMora.toLocaleString()} Mora. Spend them right away in wishes loop!`,
      "success"
    );
    AetheriaAudioEngine.playWaveClear();
  };

  // Claim all completed quests at once
  const claimAllQuestRewards = () => {
    const completedQuests = saveState.activeQuests.filter(q => q.completed);
    if (completedQuests.length === 0) {
      showInGameAlert("No Completed Quests", "Resolve active objectives in Combat Arena or Summon tabs first!", "info");
      return;
    }

    const totalTokens = completedQuests.reduce((sum, q) => sum + q.rewardTokens, 0);
    const totalMora = completedQuests.reduce((sum, q) => sum + q.rewardMora, 0);
    const completedIds = completedQuests.map(q => q.id);

    triggerSaveUpdate(prev => ({
      ...prev,
      aetherGems: prev.aetherGems + totalTokens,
      mora: prev.mora + totalMora,
      activeQuests: prev.activeQuests.filter(q => !completedIds.includes(q.id)),
      completedQuestIds: [...prev.completedQuestIds, ...completedIds]
    }));

    showInGameAlert(
      "Claimed All Quest Rewards!",
      `Received +${totalTokens} Aether Gems and +${totalMora.toLocaleString()} Mora. All completed quests successfully cataloged!`,
      "success"
    );
    AetheriaAudioEngine.playUltimate();
  };

  const handleClaimLoginReward = (day: number) => {
    // Prevent double claiming
    if ((saveState.loginRewardClaimedDays || []).includes(day)) {
      showInGameAlert("Reward already claimed!", "Keep checking in or claim subsequent days sequential rewards.", "error");
      return;
    }
    
    // Day can only be sequential (claimedDays.length + 1)
    if (day !== (saveState.loginRewardClaimedDays || []).length + 1) {
      showInGameAlert("Incorrect day sequence!", "You must claim rewards in order.", "error");
      return;
    }

    triggerSaveUpdate(prev => {
      const currentClaimed = prev.loginRewardClaimedDays || [];
      if (currentClaimed.includes(day)) return prev;

      let gemsReward = 0;
      let moraReward = 0;
      let rewardMsg = "";

      if (day === 1) {
        // Day 1: 4-star hero
        const fourStarHeroes = PLAYABLE_CHARACTERS.filter(c => c.rarity === 4);
        const unowned = fourStarHeroes.filter(c => !prev.unlockedCharacterIds.includes(c.id));
        const chosen = unowned.length > 0 
          ? unowned[Math.floor(Math.random() * unowned.length)] 
          : fourStarHeroes[Math.floor(Math.random() * fourStarHeroes.length)];
        
        rewardMsg = `Unlocked 4-Star Character: ${chosen.name}!`;
        
        const defaultWeaponId = (() => {
          if (chosen.weaponType === 'Claymore') return 'start_w_2';
          if (chosen.weaponType === 'Bow') return 'start_w_3';
          if (chosen.weaponType === 'Catalyst') return 'start_w_4';
          if (chosen.weaponType === 'Polearm') return 'start_w_5';
          return 'start_w_1';
        })();

        const isOwned = prev.unlockedCharacterIds.includes(chosen.id);
        const currentPortraits = prev.characterPortraits || {};
        const currentLvl = currentPortraits[chosen.id] || 0;
        const nextLvl = isOwned ? Math.min(6, currentLvl + 1) : 0;

        if (isOwned) {
          setTimeout(() => {
            showInGameAlert(
              `✨ LOGIN REWARD DUPLICATE: ${chosen.name.toUpperCase()} PORTRAIT UPGRADED!`,
              `${chosen.name}'s Portrait Level is now P${nextLvl}! (Stats boosted in combat)`,
              "success"
            );
          }, 100);
        }

        const newUnlockedIds = isOwned 
          ? prev.unlockedCharacterIds 
          : [...prev.unlockedCharacterIds, chosen.id];

        const updated = {
          ...prev,
          unlockedCharacterIds: newUnlockedIds,
          characterLevels: { ...prev.characterLevels, [chosen.id]: prev.characterLevels[chosen.id] || 1 },
          characterPortraits: { ...currentPortraits, [chosen.id]: nextLvl },
          characterHp: { ...prev.characterHp, [chosen.id]: prev.characterHp[chosen.id] || chosen.baseStats.hp },
          characterEquippedWeapon: { ...prev.characterEquippedWeapon, [chosen.id]: prev.characterEquippedWeapon[chosen.id] || defaultWeaponId },
          partyIds: prev.partyIds.includes(chosen.id) ? prev.partyIds : (prev.partyIds.length < 4 ? [...prev.partyIds, chosen.id] : prev.partyIds),
          loginRewardClaimedDays: [...currentClaimed, day]
        };

        const withProg = checkQuestProgress(updated, 'own_chars', updated.unlockedCharacterIds.length);
        setTimeout(() => {
          showInGameAlert(rewardMsg, "View your newly unlocked character in the Character Roster!", "success");
        }, 300);
        return withProg;

      } else if (day === 2) {
        // Day 2: 4-star weapon
        const fourStarWeapons = WEAPONS_DATABASE.filter(w => w.rarity === 4);
        const chosen = fourStarWeapons[Math.floor(Math.random() * fourStarWeapons.length)];
        
        const newWeapon = {
          id: 'w_login_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
          name: chosen.name,
          rarity: chosen.rarity as 3 | 4 | 5,
          weaponType: chosen.weaponType,
          baseAtk: chosen.baseAtk,
          statBonus: chosen.statBonus,
          level: 1
        };

        rewardMsg = `Acquired 4-Star Weapon: ${chosen.name}!`;

        const updated = {
          ...prev,
          inventoryWeapons: [...prev.inventoryWeapons, newWeapon],
          loginRewardClaimedDays: [...currentClaimed, day]
        };

        setTimeout(() => {
          showInGameAlert(rewardMsg, "Equip it in your Hero Forge menu!", "success");
        }, 300);
        return updated;

      } else if (day === 3) {
        gemsReward = 3000;
        rewardMsg = `Claimed +3,000 Aether Gems!`;
      } else if (day === 4) {
        moraReward = 20000;
        rewardMsg = `Claimed +20,000 Mora Gold!`;
      } else if (day === 5) {
        moraReward = 50000;
        rewardMsg = `Claimed +50,000 Mora Gold!`;
      } else if (day === 6) {
        gemsReward = 5000;
        rewardMsg = `Claimed +5,000 Aether Gems!`;
      } else if (day === 7) {
        // Day 7: random non-limited 5-star hero
        const fiveStarHeroes = PLAYABLE_CHARACTERS.filter(c => c.rarity === 5);
        const unowned = fiveStarHeroes.filter(c => !prev.unlockedCharacterIds.includes(c.id));
        const chosen = unowned.length > 0 
          ? unowned[Math.floor(Math.random() * unowned.length)] 
          : fiveStarHeroes[Math.floor(Math.random() * fiveStarHeroes.length)];

        rewardMsg = `Unlocked LEGENDARY 5-Star Character: ${chosen.name}!`;

        const defaultWeaponId = (() => {
          if (chosen.weaponType === 'Claymore') return 'start_w_2';
          if (chosen.weaponType === 'Bow') return 'start_w_3';
          if (chosen.weaponType === 'Catalyst') return 'start_w_4';
          if (chosen.weaponType === 'Polearm') return 'start_w_5';
          return 'start_w_1';
        })();

        const isOwned = prev.unlockedCharacterIds.includes(chosen.id);
        const currentPortraits = prev.characterPortraits || {};
        const currentLvl = currentPortraits[chosen.id] || 0;
        const nextLvl = isOwned ? Math.min(6, currentLvl + 1) : 0;

        if (isOwned) {
          setTimeout(() => {
            showInGameAlert(
              `✨ LOGIN REWARD DUPLICATE: ${chosen.name.toUpperCase()} PORTRAIT UPGRADED!`,
              `${chosen.name}'s Portrait Level is now P${nextLvl}! (Stats boosted in combat)`,
              "success"
            );
          }, 100);
        }

        const newUnlockedIds = isOwned 
          ? prev.unlockedCharacterIds 
          : [...prev.unlockedCharacterIds, chosen.id];

        const updated = {
          ...prev,
          unlockedCharacterIds: newUnlockedIds,
          characterLevels: { ...prev.characterLevels, [chosen.id]: prev.characterLevels[chosen.id] || 1 },
          characterPortraits: { ...currentPortraits, [chosen.id]: nextLvl },
          characterHp: { ...prev.characterHp, [chosen.id]: prev.characterHp[chosen.id] || chosen.baseStats.hp },
          characterEquippedWeapon: { ...prev.characterEquippedWeapon, [chosen.id]: prev.characterEquippedWeapon[chosen.id] || defaultWeaponId },
          partyIds: prev.partyIds.includes(chosen.id) ? prev.partyIds : (prev.partyIds.length < 4 ? [...prev.partyIds, chosen.id] : prev.partyIds),
          loginRewardClaimedDays: [...currentClaimed, day]
        };

        const withProg = checkQuestProgress(updated, 'own_chars', updated.unlockedCharacterIds.length);
        setTimeout(() => {
          showInGameAlert(rewardMsg, "A god has descended to empower your line-up! Check your character screen.", "success");
        }, 300);
        return withProg;
      }

      const updated = {
        ...prev,
        aetherGems: prev.aetherGems + gemsReward,
        mora: prev.mora + moraReward,
        loginRewardClaimedDays: [...currentClaimed, day]
      };

      setTimeout(() => {
        showInGameAlert(rewardMsg, "Your currencies have been updated successfully.", "success");
      }, 300);

      if (moraReward > 0) {
        return checkQuestProgress(updated, 'mora_hoard', updated.mora);
      }
      return updated;
    });
  };

  // Pity Counters updates per banner
  const handleUpdatePity = (bannerId: string, pity5: number, pity4: number) => {
    triggerSaveUpdate(prev => ({
      ...prev,
      gachaPity5Star: pity5,
      gachaPity4Star: pity4,
      bannerPity5Star: {
        ...(prev.bannerPity5Star || {}),
        [bannerId]: pity5
      },
      bannerPity4Star: {
        ...(prev.bannerPity4Star || {}),
        [bannerId]: pity4
      }
    }));
  };

  // Log gacha pulls to list
  const handleLogPulls = (items: { name: string; rarity: number }[]) => {
    const timeStr = new Date().toLocaleTimeString();
    const logItems = items.map(item => ({
      name: item.name,
      rarity: item.rarity,
      time: timeStr
    }));
    setPullHistory(prev => {
      const newHistory = [...logItems, ...prev].slice(0, 100); // Max 100 logs saved
      try {
        localStorage.setItem('aetheria_pull_history', JSON.stringify(newHistory));
      } catch (e) {
        console.warn("Could not preserve pull logs on disk.", e);
      }
      return newHistory;
    });
  };

  // Reset Engine inside settings
  const executeEngineWipe = () => {
    localStorage.removeItem('aetheria_rpg_save_v3');
    localStorage.removeItem('aetheria_pull_history');
    setSaveState(getInitialSaveState());
    setPullHistory([]);
    setActiveScreen('menu'); // back to menu
    setShowSettingsModal(false);
    
    showInGameAlert(
      "Local save files completely wiped!",
      "Restarted campaign configurations from factory level 1. Launch a new simulation from the main menu!",
      "info"
    );
  };

  // Save progress toast feedback
  const handleSaveProgress = () => {
    try {
      localStorage.setItem('aetheria_rpg_save_v3', JSON.stringify(saveState));
      showInGameAlert(
        "State synchronization completed!",
        "Successfully saved character status, gems, mora level, unlocked weapons, and quest logs to cache.",
        "success"
      );
      AetheriaAudioEngine.playSkill();
    } catch (e) {
      showInGameAlert(
        "Could not synchronize state to disk.",
        "Check browser local storage permissions in settings.",
        "error"
      );
    }
  };

  // Custom simulation closing shutdown state (Immersive terminal leave replacement)
  if (isTerminated) {
    return (
      <div className="min-h-screen bg-[#020306] text-[#22c55e] flex items-center justify-center font-mono p-6 relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#10b981]/25 animate-pulse" />
        <div className="max-w-md w-full space-y-6">
          <div className="border border-[#10b981]/30 bg-[#060b10] p-6 rounded-lg shadow-[0_0_40px_rgba(16,185,129,0.15)] space-y-4">
            <h1 className="text-sm font-black text-[#10b981] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              CORE CONNECTION TERMINATED
            </h1>
            <div className="text-xs space-y-2 leading-relaxed opacity-85">
              <p className="border-b border-[#10b981]/20 pb-2">&gt; Disconnecting remote server gateway...</p>
              <p>&gt; Releasing canvas contexts and shaders...</p>
              <p>&gt; Saving database caches (aetheria_save_v3)... Done.</p>
              <p>&gt; purging volatile hardware registers...</p>
              <p className="text-[#e11d48] font-bold mt-4">&gt; CORE TERMINATION SUCCESSFUL. ACCESS CEASED.</p>
            </div>
            
            <div className="p-3 bg-red-950/20 text-[#fda4af] rounded text-[11px] leading-relaxed font-sans uppercase">
              ⚠️ Simulated website shutdown finalized. Under framework sandbox rules, you may now safely close this browser window tab.
            </div>
          </div>

          <button
            onClick={() => {
              setIsTerminated(false);
              AetheriaAudioEngine.resume();
            }}
            className="w-full py-3 bg-[#10b981] hover:bg-[#10b981]/80 text-[#04060b] font-black text-xs uppercase tracking-widest rounded-lg transition-transform active:scale-95 cursor-pointer text-center block"
          >
            🔌 RECONNECT TO CORE ENGINE
          </button>
        </div>
      </div>
    );
  }

  // ENHANCED IMMERSIVE MAIN MENU UI
  if (activeScreen === 'menu') {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans relative antialiased leading-normal overflow-x-hidden justify-between">
        {/* Full-bleed generated background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${mainMenuBg})` }}
        />
        {/* Dark vignette overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none" />
        {/* Subtle animated radial glow pulses on top */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top brand header */}
        <header className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <img 
              src={gameLogoImg}
              alt="Elemental Battleground"
              className="w-10 h-10 rounded-xl object-cover shadow-[0_0_16px_rgba(251,191,36,0.5)] ring-1 ring-amber-400/30"
            />
            <span className="font-mono text-xs uppercase tracking-widest text-white drop-shadow font-bold">Elemental Battleground</span>
          </div>
          <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-3 py-1 rounded font-mono uppercase">V1.2.0 COMPATIBLE</span>
        </header>

        {/* Dynamic global error toast overlay */}
        <AnimatePresence>
          {customNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="fixed top-6 inset-x-6 z-55 max-w-md mx-auto pointer-events-auto"
            >
              <div className={`p-4 rounded-xl border flex flex-col gap-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-md ${
                customNotification.type === 'error' 
                  ? 'bg-red-950/90 border-red-500/40 text-red-100' 
                  : customNotification.type === 'success' 
                    ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100' 
                    : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-100'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${customNotification.type === 'error' ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
                    <span className="text-[10.5px] font-black uppercase tracking-widest font-sans">{customNotification.message}</span>
                  </div>
                </div>
                {customNotification.actionSolution && (
                  <p className="text-[10px] opacity-90 leading-relaxed bg-black/40 p-2 rounded-lg border border-white/5 font-mono uppercase mt-1">
                    💡 <span className="text-amber-400 font-bold">ACHIEVE INSTRUCTION:</span> {customNotification.actionSolution}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center menu stack */}
        <main className="max-w-md w-full mx-auto px-6 py-12 text-center space-y-12 z-10">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-block p-1 bg-gradient-to-tr from-[#6366f1] to-amber-400 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.25)]"
            >
              <div className="bg-slate-900 border border-white/5 p-4 py-6 rounded-xl">
                <span className="text-[9px] font-mono tracking-[0.3em] text-[#818cf8] uppercase block mb-1">Dawning Core Client</span>
                <h1 className="text-3xl font-black uppercase tracking-[0.1em] text-white font-display leading-none">
                  Elemental Battleground
                </h1>
                <p className="text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-wide">
                  Realtime Elemental RPG Simulator
                </p>
              </div>
            </motion.div>
          </div>

          {/* Action links list */}
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button
              onClick={() => {
                setActiveScreen('wiki');
                AetheriaAudioEngine.resume();
                AetheriaAudioEngine.playClick();
                if ((saveState.loginRewardClaimedDays || []).length < 7) {
                  setShowLoginRewardsModal(true);
                }
              }}
              className="py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-95" />
              <span>START SIMULATION</span>
            </button>

            <button
              onClick={() => {
                setShowCreditsModal(true);
                AetheriaAudioEngine.playClick();
              }}
              className="py-3 bg-slate-900 hover:bg-slate-800 text-slate-205 border border-white/10 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 hover:border-slate-700"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>PROJECT CREDITS</span>
            </button>

            <button
              onClick={() => {
                setIsTerminated(true);
              }}
              className="py-3 bg-red-950/80 hover:bg-red-900 text-rose-200 border border-red-500/60 hover:border-red-400 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>LEAVE WEBPAGE</span>
            </button>
          </div>
        </main>

        <footer className="p-6 text-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          © 2026 Aetheria AAA Game Development Studio. All modules loaded correctly.
        </footer>

        {/* Dynamic Credits Modal popup */}
        <AnimatePresence>
          {showCreditsModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 backdrop-blur-md"
              onClick={() => setShowCreditsModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -20 }}
                className="bg-[#0b101e] max-w-sm w-full border border-white/10 rounded-2xl p-6 shadow-2xl relative space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest font-display flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    SIMULATOR DESIGN LAB
                  </h3>
                  <button 
                    onClick={() => setShowCreditsModal(false)} 
                    className="p-1 text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="p-2.5 bg-black/40 rounded border border-white/5">
                    <span className="text-[8.5px] uppercase text-indigo-400 block font-semibold">Game Producer & Lead Architect</span>
                    <span className="font-extrabold text-amber-400 text-sm">LAM ZHENG HONG</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded border border-white/5">
                    <span className="text-[8.5px] uppercase text-emerald-400 block font-semibold">Lead System Designer</span>
                    <span className="font-extrabold text-slate-100 text-sm">LAM ZHENG HONG</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded border border-white/5">
                    <span className="text-[8.5px] uppercase text-rose-400 block font-semibold">Creative Director & Composer</span>
                    <span className="font-extrabold text-slate-100 text-sm">LAM ZHENG HONG</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal font-sans text-center border-t border-white/5 pt-4">
                  Constructed strictly using client-side React 18, Vite, and high contrast Tailwind CSS styles. All components are responsive.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative antialiased leading-normal overflow-x-hidden">
      {/* Immersive Game World Backdrop Simulation gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#101426] via-[#090b11] to-[#04060a] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* FLOATING TOP-LEVEL SYSTEM HUD ALERT STATUS */}
      <AnimatePresence>
        {customNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-18 inset-x-6 z-55 max-w-md mx-auto pointer-events-auto"
          >
            <div className={`p-4 rounded-xl border flex flex-col gap-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-md ${
              customNotification.type === 'error' 
                ? 'bg-red-950/90 border-red-500/40 text-red-100' 
                : customNotification.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100' 
                  : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-100'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${customNotification.type === 'error' ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <span className="text-[10.5px] font-black uppercase tracking-widest font-sans">{customNotification.message}</span>
                </div>
              </div>
              {customNotification.actionSolution && (
                <p className="text-[10px] opacity-90 leading-relaxed bg-black/40 p-2 rounded-lg border border-white/5 font-mono uppercase mt-1">
                  💡 <span className="text-amber-400 font-bold">ACHIEVE INSTRUCTION:</span> {customNotification.actionSolution}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Main Navigation Header with Glass HUD styling */}
      <header className="bg-slate-950/85 border-b border-white/10 sticky top-0 z-40 backdrop-blur-md px-6 py-3 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-xl">
        {/* Logo and Game System Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setActiveScreen('menu');
              AetheriaAudioEngine.playClick();
            }}
            className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_16px_rgba(251,191,36,0.5)] ring-1 ring-amber-400/30 hover:scale-105 active:scale-95 transition-all"
          >
            <img src={gameLogoImg} alt="E" className="w-full h-full object-cover" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-widest text-[#f8fafc] font-display uppercase">
                Elemental Battleground
              </h1>
              <span className="text-[8px] bg-amber-400/10 text-amber-300 border border-amber-300/20 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                v1.2.0 LIVE
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">Dawning Elements • RTS Action Core Engine</p>
          </div>
        </div>

        {/* Global HUD Stats: Client Data, Active FPS, Live Latency */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          
          {/* Functional Dynamic FPS Display */}
          <div className="bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-[10px] font-mono font-black tracking-wider text-indigo-300 uppercase">
              FPS: {fps}
            </span>
          </div>

          {/* Connection Latency Pill */}
          <div className="bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              {latency}ms Stable
            </span>
          </div>

          {/* Player profile quick status */}
          <div className="hidden sm:flex bg-slate-900/60 border border-white/10 px-3 py-1.5 rounded-lg flex-col items-start justify-center min-w-[145px]">
            <div className="flex items-center gap-1.5 w-full justify-between">
              <span className="text-[10px] font-bold tracking-tighter text-slate-300 uppercase">Eldric Thorne</span>
              <div className="flex items-center gap-1">
                <span className="bg-amber-400 text-slate-950 text-[8px] px-1 font-black rounded-sm leading-none h-3 flex items-center">LV.{saveState.playerLevel || 1}</span>
                {devCheatsEnabled && (
                  <button
                    id="dev-lvl-plus-ten"
                    onClick={(e) => { e.stopPropagation(); handleDevAddTenLevels(); }}
                    className="bg-red-600 hover:bg-red-500 active:scale-95 text-[7px] text-white px-1 py-0.5 rounded font-bold cursor-pointer transition-all uppercase tracking-tighter leading-none h-3 select-none"
                    title="Dev Cheat: +10 Player Levels"
                  >
                    +10 Dev
                  </button>
                )}
              </div>
            </div>
            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-0.5 relative">
              <span 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-350"
                style={{ width: `${Math.min(100, Math.max(0, ((saveState.playerExp || 0) / (saveState.playerExpMax || 100)) * 100))}%` }}
              />
            </div>
            <span className="text-[7px] font-mono text-slate-400 text-left mt-0.5">XP {saveState.playerExp || 0}/{saveState.playerExpMax || 100}</span>
          </div>

          {/* Mora Currency */}
          <div className="flex items-center gap-1.5 p-1 px-3 rounded-lg bg-black/40 border border-white/15">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-mono text-[10px] uppercase">Mora:</span>
            <span className="font-black text-amber-305 font-mono text-[11px] text-amber-400">{saveState.mora.toLocaleString()}</span>
          </div>

          {/* Aether Gems */}
          <div className="flex items-center gap-1.5 p-1 px-3 rounded-lg bg-black/40 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-sky-450 text-sky-400" />
            <span className="text-slate-400 font-mono text-[10px] uppercase">Gems:</span>
            <span className="font-black text-sky-450 font-mono text-[11px] text-sky-400">{saveState.aetherGems.toLocaleString()}</span>
          </div>

          {/* Global Quick Quest Claim Button */}
          {saveState.activeQuests.filter(q => q.completed).length > 0 && (
            <button
              onClick={() => {
                claimAllQuestRewards();
              }}
              className="p-1.5 px-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.2)] text-emerald-350 font-sans"
              title="Quick Claim All Completed Quests"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              Claim Quests ({saveState.activeQuests.filter(q => q.completed).length})
            </button>
          )}

          {/* ENHANCED SETTINGS TRIGGER */}
          <button 
            type="button"
            onClick={() => {
              setShowSettingsModal(true);
              AetheriaAudioEngine.playClick();
            }}
            className="p-1.5 px-3 bg-slate-900 border border-white/10 hover:border-[#6366f1]/40 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-md hover:shadow-indigo-500/10 text-white font-sans"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" /> Settings Panel
          </button>

          {/* FULLSCREEN TOGGLE */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
            className="p-1.5 px-2.5 bg-slate-900 border border-white/10 hover:border-amber-500/40 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-md hover:shadow-amber-500/10 text-white font-sans"
          >
            {isFullscreen
              ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Primary Dashboard layout */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Main screens container (takes 3 grid cells) */}
        <div className="xl:col-span-3 space-y-6 flex flex-col h-full">
          
          {/* Main Action tab selectors */}
          <div className="flex bg-[#0b0f19]/80 backdrop-blur-md border border-white/10 p-1.5 rounded-xl w-full md:w-fit gap-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => {
                setActiveScreen('wiki');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2.5 px-5 text-xs font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-1 md:flex-initial cursor-pointer ${
                activeScreen === 'wiki'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                  : 'text-slate-405 text-slate-400 hover:text-slate-202 hover:bg-white/5'
              }`}
              id="dash_screen_wiki"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-955 text-slate-950" />
              <span>GDD & Lore Wiki</span>
            </button>

            <button
              onClick={() => {
                setActiveScreen('arena');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2.5 px-5 text-xs font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-1 md:flex-initial cursor-pointer ${
                activeScreen === 'arena'
                  ? 'bg-red-500 text-slate-950 shadow-[0_0_15px_rgba(239,68,68,0.35)] font-black'
                  : 'text-slate-405 text-slate-400 hover:text-slate-202 hover:bg-white/5 font-black'
              }`}
              id="dash_screen_arena"
            >
              <Sword className="w-3.5 h-3.5 animate-pulse text-slate-955 text-slate-950" />
              <span>Combat Arena</span>
            </button>

            <button
              onClick={() => {
                setActiveScreen('dungeon');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2.5 px-5 text-xs font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-1 md:flex-initial cursor-pointer ${
                activeScreen === 'dungeon'
                  ? 'bg-violet-600 text-slate-950 shadow-[0_0_15px_rgba(124,58,237,0.35)] font-black'
                  : 'text-slate-405 text-slate-400 hover:text-slate-202 hover:bg-white/5 font-black'
              }`}
              id="dash_screen_dungeon"
            >
              <Landmark className={`w-3.5 h-3.5 ${activeScreen === 'dungeon' ? 'text-slate-955' : 'text-violet-400 animate-pulse'}`} />
              <span>Rogue Ruins</span>
            </button>

            <button
              onClick={() => {
                setActiveScreen('wish');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2.5 px-5 text-xs font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-1 md:flex-initial cursor-pointer ${
                activeScreen === 'wish'
                  ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.35)] font-black'
                  : 'text-slate-405 text-slate-400 hover:text-slate-202 hover:bg-white/5 font-black'
              }`}
              id="dash_screen_wish"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-955 text-slate-950" />
              <span>Wish Summons</span>
            </button>

            <button
              onClick={() => {
                setActiveScreen('inventory');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2.5 px-5 text-xs font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-1 md:flex-initial cursor-pointer ${
                activeScreen === 'inventory'
                  ? 'bg-indigo-500 text-slate-950 shadow-[0_0_15px_rgba(99,102,241,0.35)] font-black'
                  : 'text-slate-405 text-slate-400 hover:text-slate-202 hover:bg-white/5'
              }`}
              id="dash_screen_inventory"
            >
              <Hammer className="w-3.5 h-3.5 text-slate-955 text-slate-950" />
              <span>Hero Forge</span>
            </button>

            <button
              onClick={() => {
                setActiveScreen('quest');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2.5 px-5 text-xs font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-1 md:flex-initial cursor-pointer ${
                activeScreen === 'quest'
                  ? 'bg-amber-400 text-slate-955 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] font-black'
                  : 'text-slate-405 text-slate-400 hover:text-slate-202 hover:bg-white/5 font-black'
              }`}
              id="dash_screen_quest"
            >
              <Trophy className="w-3.5 h-3.5 text-slate-955 text-slate-950" />
              <span>Quest</span>
            </button>
          </div>

          {/* Actual screens swap frame */}
          <div className="flex-1 justify-between flex flex-col">
            <AnimatePresence mode="wait">
              {activeScreen === 'wiki' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  key="wiki_scr"
                >
                  <GDDViewer 
                    ownedCharacterIds={saveState.unlockedCharacterIds || []}
                    characterPortraits={saveState.characterPortraits || {}}
                  />
                </motion.div>
              )}

              {activeScreen === 'arena' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  key="arena_scr"
                >
                  <CombatArena 
                    partyIds={saveState.partyIds}
                    onChangeParty={(partyIds) => triggerSaveUpdate(p => ({ ...p, partyIds }))}
                    onEarnRewards={(gems, mora, exp) => handleModifyCurrencies(gems, mora, exp)}
                    onIncrementStat={(pk) => handleIncrementStat(pk)}
                    ownedCharacterIds={saveState.unlockedCharacterIds || []}
                    characterLevels={saveState.characterLevels}
                    characterEquippedWeapon={saveState.characterEquippedWeapon}
                    inventoryWeapons={saveState.inventoryWeapons}
                    characterPortraits={saveState.characterPortraits || {}}
                    highScoreWave={saveState.stats.highScoreWave || 1}
                    onUpdateHighScore={(wave, points) => {
                      triggerSaveUpdate(prev => {
                        const statsCopy = { ...prev.stats };
                        let mutated = false;
                        if (wave > (statsCopy.highScoreWave || 0)) {
                          statsCopy.highScoreWave = wave;
                          mutated = true;
                        }
                        if (points > (statsCopy.highScorePoints || 0)) {
                          statsCopy.highScorePoints = points;
                          mutated = true;
                        }
                        if (mutated) {
                          return { ...prev, stats: statsCopy };
                        }
                        return prev;
                      });
                    }}
                    onBackToMenu={() => setActiveScreen('menu')}
                    devCheatsEnabled={devCheatsEnabled}
                    screenShakeEnabled={screenShakeEnabled}
                    combatSpeed={combatSpeed}
                  />
                </motion.div>
              )}

              {activeScreen === 'dungeon' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  key="dungeon_scr"
                  className="w-full shrink-0"
                >
                  <RogueDungeon
                    partyIds={saveState.partyIds}
                    ownedCharacterIds={saveState.unlockedCharacterIds || []}
                    characterLevels={saveState.characterLevels}
                    characterEquippedWeapon={saveState.characterEquippedWeapon}
                    inventoryWeapons={saveState.inventoryWeapons}
                    characterPortraits={saveState.characterPortraits || {}}
                    onEarnRewards={(gems, mora, exp) => handleModifyCurrencies(gems, mora, exp)}
                    onIncrementStat={(pk) => handleIncrementStat(pk)}
                    onBackToMenu={() => setActiveScreen('menu')}
                    devCheatsEnabled={devCheatsEnabled}
                    screenShakeEnabled={screenShakeEnabled}
                    combatSpeed={combatSpeed}
                  />
                </motion.div>
              )}

              {activeScreen === 'wish' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  key="wish_scr"
                >
                  <GachaSimulator 
                    aetherGems={saveState.aetherGems}
                    mora={saveState.mora}
                    onModifyCurrencies={(g, m) => handleModifyCurrencies(g, m)}
                    ownedCharacterIds={saveState.unlockedCharacterIds || []}
                    onUnlockCharacter={(id) => handleUnlockCharacter(id)}
                    onAddWeapon={(w) => handleAddWeapon(w)}
                    bannerPity5Star={saveState.bannerPity5Star || {}}
                    bannerPity4Star={saveState.bannerPity4Star || {}}
                    onUpdatePity={(bid, p5, p4) => handleUpdatePity(bid, p5, p4)}
                    onLogPulls={(items) => handleLogPulls(items)}
                    pullHistoryList={pullHistory}
                    onShowAlert={(msg, sol, typ) => showInGameAlert(msg, sol, typ)}
                    devCheatsEnabled={devCheatsEnabled}
                  />
                </motion.div>
              )}

              {activeScreen === 'inventory' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  key="inventory_scr"
                >
                  <InventoryManager 
                    mora={saveState.mora}
                    inventoryWeapons={saveState.inventoryWeapons}
                    inventoryItems={saveState.inventoryItems}
                    characterLevels={saveState.characterLevels}
                    characterEquippedWeapon={saveState.characterEquippedWeapon}
                    ownedCharacterIds={saveState.unlockedCharacterIds || []}
                    onLevelUpCharacter={(id, mCost, iCost) => handleLevelUpCharacter(id, mCost, iCost)}
                    onEquipWeapon={(cid, wuid) => handleEquipWeapon(cid, wuid)}
                    onModifyCurrencies={(g, m) => handleModifyCurrencies(g, m)}
                    onUpgradeWeapon={(wuid) => handleUpgradeWeapon(wuid)}
                    onShowAlert={(msg, sol, typ) => showInGameAlert(msg, sol, typ)}
                    activeQuests={saveState.activeQuests}
                    onClaimQuestReward={claimQuestReward}
                    characterPortraits={saveState.characterPortraits || {}}
                    devCheatsEnabled={devCheatsEnabled}
                  />
                </motion.div>
              )}

              {activeScreen === 'quest' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  key="quest_scr"
                >
                  <SquadronQuestLedger
                    activeQuests={saveState.activeQuests}
                    onClaimQuestReward={claimQuestReward}
                    onClaimAllQuestRewards={claimAllQuestRewards}
                    layout="full"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side Column: Quest Tracker and stats summary (takes 1 cell) */}
        <div className="space-y-6">
          
          {/* Squadron Quest Ledger Sidebar Layout */}
          <SquadronQuestLedger
            activeQuests={saveState.activeQuests}
            onClaimQuestReward={claimQuestReward}
            onClaimAllQuestRewards={claimAllQuestRewards}
            layout="sidebar"
          />

          {/* Quick Character Inventory Party Panel  (HUD style with custom frames) */}
          <div className="bg-[#0b0f19]/70 border border-white/10 p-5 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md space-y-4">
            <div className="border-b border-white/5 pb-2">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5 font-display">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                Combat Party setup ({saveState.partyIds.length}/4)
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {PLAYABLE_CHARACTERS.map(c => {
                const isChecked = saveState.partyIds.includes(c.id);
                const isOwned = (saveState.unlockedCharacterIds || []).includes(c.id);

                if (!isOwned) return null;

                const charLvl = saveState.characterLevels[c.id] || 1;
                const equippedWeaponId = saveState.characterEquippedWeapon[c.id];
                const weaponObj = saveState.inventoryWeapons?.find(w => w.id === equippedWeaponId);

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (isChecked) {
                        if (saveState.partyIds.length <= 1) return; // Must have at least 1
                        triggerSaveUpdate(prev => ({
                          ...prev,
                          partyIds: prev.partyIds.filter(pid => pid !== c.id)
                        }));
                      } else {
                        if (saveState.partyIds.length >= 4) return; // max 4
                        triggerSaveUpdate(prev => ({
                          ...prev,
                          partyIds: [...prev.partyIds, c.id]
                        }));
                      }
                      AetheriaAudioEngine.playClick();
                    }}
                    className={`p-3 rounded-lg text-xs border text-left flex flex-col justify-between min-h-[82px] h-auto transition-all relative overflow-hidden cursor-pointer ${
                      isChecked
                        ? 'bg-[#0f172a] border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                        : 'bg-black/30 border-white/5 text-slate-500 hover:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-1 w-full justify-between pr-8">
                        <span className="font-black text-[11px] truncate uppercase tracking-tighter text-slate-100">{c.name}</span>
                        <span className="bg-slate-800 border border-slate-700 text-amber-500 font-mono text-[8px] px-1 rounded-sm leading-none h-3.5 flex items-center shrink-0">LV.{charLvl}</span>
                      </div>
                      <div className="flex shrink-0 gap-0.5 mt-1 select-none">
                        {Array.from({ length: c.rarity }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                        ))}
                      </div>
                    </div>

                    <div className="mt-2.5 border-t border-white/5 pt-1.5 flex flex-col gap-0.5">
                      <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-400 uppercase tracking-tight">
                        <span className="font-bold text-indigo-400">{c.element}</span>
                        <span>{c.weaponType} class</span>
                      </div>
                      {weaponObj ? (
                        <div className="text-[8px] font-medium text-slate-300 truncate font-mono uppercase bg-black/45 px-1 py-0.5 rounded border border-white/5 mt-0.5 tracking-tighter">
                          ⚙️ {weaponObj.name} (LV.{weaponObj.level})
                        </div>
                      ) : (
                        <div className="text-[7.5px] text-slate-600 truncate font-mono italic mt-0.5">
                          No Armament Equipped
                        </div>
                      )}
                    </div>
                    
                    {isChecked && (
                      <span className="absolute top-1.5 right-1.5 font-mono text-[7px] bg-amber-400 text-slate-950 font-black px-1 py-0.5 rounded-sm uppercase tracking-tight leading-none">
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[9.5px] text-slate-500 leading-normal">
              *Deploy up to 4 heroes to sync elemental reaction triggers inside the active arena.
            </p>
          </div>

          {/* Combat Statistics Card (HUD Diagnostics format) */}
          <div className="bg-[#0b0f19]/70 border border-white/10 p-5 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md space-y-4 text-xs col-span-1">
            <h4 className="font-extrabold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-2 font-display flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
              Player Telemetry & Stats
            </h4>
            <div className="space-y-2 text-slate-400 font-medium">
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Purged Sentinels</span>
                <span className="font-black text-red-400 font-mono text-xs">{saveState.stats.totalEnemiesDefeated}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Dodge-Dash Triggers</span>
                <span className="font-black text-amber-500 font-mono text-xs">{saveState.stats.perfectDodges}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Shield Parries</span>
                <span className="font-black text-emerald-400 font-mono text-xs">{saveState.stats.successfulParries}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Elemental Overloads</span>
                <span className="font-black text-sky-400 font-mono text-xs">{saveState.stats.reactionsTriggered}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Play Time</span>
                <span className="font-black text-slate-300 font-mono text-xs">{formatPlayTime(saveState.stats.playTime)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Adventure Level</span>
                <span className="font-black text-indigo-400 font-mono text-xs">LV.{saveState.playerLevel || 1}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Total Mora Earned</span>
                <span className="font-black text-yellow-500 font-mono text-xs">🪙 {(saveState.stats.totalMoraEarned || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Total Gems Earned</span>
                <span className="font-black text-cyan-400 font-mono text-xs">💎 {(saveState.stats.totalGemsEarned || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Highest Wave Beaten</span>
                <span className="font-black text-amber-500 font-mono text-xs">{saveState.stats.highScoreWave || 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Highest Room Cleared</span>
                <span className="font-black text-purple-400 font-mono text-xs">Room {saveState.stats.highScoreRogueRoom || 0}</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-[11px] text-slate-600 mt-12">
        <p>© 2026 Aetheria AAA Game Development Studio. All specs, modules, and engine variables fully configured.</p>
        <p className="mt-1 leading-relaxed max-w-xl mx-auto px-4 opacity-50 font-mono uppercase tracking-wide text-[9px]">
          Actively simulating Unity Dots & UNREAL 5 elements on custom canvas buffers. Designed relative to high frame matrices and core response loops.
        </p>
      </footer>

      {/* ENHANCED SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="bg-[#0b101e] max-w-md w-full border border-indigo-500/20 rounded-2xl shadow-2xl relative flex flex-col"
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky header */}
              <div className="flex justify-between items-center border-b border-white/10 px-6 py-4 shrink-0">
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-display flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-400" />
                  Aetheria Settings Control
                </h3>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 px-2 text-slate-400 hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors text-xs font-black cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5 font-sans">

                {/* GAME AUDIO CONTROLS */}
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4">
                  <span className="text-[9px] font-mono tracking-wider text-indigo-350 uppercase font-black block">SYSTEM HARDWARE CONTROLS</span>
                  
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[11px] text-slate-350 uppercase font-bold">Simulator sound effects</span>
                    <button
                      onClick={() => {
                        setMuteSfx(!muteSfx);
                        AetheriaAudioEngine.playClick();
                      }}
                      className={`p-1.5 px-3 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        !muteSfx ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-500 border border-white/5'
                      }`}
                    >
                      {!muteSfx ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{!muteSfx ? 'SFX ENABLED' : 'SFX MUTED'}</span>
                    </button>
                  </div>

                  {/* BGM Volume Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-350 uppercase font-bold">
                      <span>BGM Volume</span>
                      <span className="font-mono text-indigo-400 font-bold">{bgmVolume}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={bgmVolume} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBgmVolume(val);
                        AetheriaAudioEngine.setBgmVolume(val / 100);
                      }}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* SFX Volume Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-350 uppercase font-bold">
                      <span>SFX Volume</span>
                      <span className="font-mono text-indigo-400 font-bold">{sfxVolume}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={sfxVolume} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSfxVolume(val);
                        AetheriaAudioEngine.setSfxVolume(val / 100);
                      }}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                {/* GENERAL PREFERENCES */}
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                  <span className="text-[9px] font-mono tracking-wider text-indigo-300 uppercase font-black block">GENERAL PREFERENCES</span>
                  
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[11px] text-slate-300 uppercase font-bold">Developer Cheats</span>
                    <button
                      onClick={() => {
                        setDevCheatsEnabled(!devCheatsEnabled);
                        AetheriaAudioEngine.playClick();
                      }}
                      className={`p-1.5 px-3 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        devCheatsEnabled ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-500 border border-white/5'
                      }`}
                    >
                      {devCheatsEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[11px] text-slate-300 uppercase font-bold">Screen Shake</span>
                    <button
                      onClick={() => {
                        setScreenShakeEnabled(!screenShakeEnabled);
                        AetheriaAudioEngine.playClick();
                      }}
                      className={`p-1.5 px-3 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        screenShakeEnabled ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-500 border border-white/5'
                      }`}
                    >
                      {screenShakeEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-300 uppercase font-bold block">Combat Speed Multiplier</span>
                    <div className="flex gap-1.5">
                      {[1.0, 1.5, 2.0].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setCombatSpeed(s);
                            AetheriaAudioEngine.playClick();
                          }}
                          className={`flex-1 text-center py-2 text-xs font-black rounded uppercase tracking-wider cursor-pointer transition-all ${
                            combatSpeed === s
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-white/5'
                          }`}
                        >
                          {s === 1.0 ? '1x (Normal)' : s === 1.5 ? '1.5x' : '2x (Fast)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto-Save Frequency */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[11px] text-slate-300 uppercase font-bold block">Auto-Save</span>
                      <span className="text-[9px] text-slate-500">Automatically syncs progress every 30s</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 px-2 py-1 rounded uppercase tracking-wider">ACTIVE</span>
                  </div>

                  {/* Performance Mode */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[11px] text-slate-300 uppercase font-bold block">Performance Mode</span>
                      <span className="text-[9px] text-slate-500">Reduces particle count for smoother FPS</span>
                    </div>
                    <span className="text-[10px] font-black text-amber-400 bg-amber-900/20 border border-amber-500/20 px-2 py-1 rounded uppercase tracking-wider">60 FPS</span>
                  </div>

                  {/* Language Selector */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[11px] text-slate-300 uppercase font-bold">Language</span>
                    <select className="bg-slate-800 text-slate-200 text-[10px] font-black border border-white/10 rounded px-2 py-1.5 cursor-pointer uppercase tracking-wider focus:outline-none focus:border-indigo-500">
                      <option value="en">🇺🇸 English</option>
                      <option value="jp">🇯🇵 Japanese</option>
                      <option value="zh">🇨🇳 Chinese</option>
                      <option value="ko">🇰🇷 Korean</option>
                    </select>
                  </div>

                  {/* Display Mode */}
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-300 uppercase font-bold">Display Mode</span>
                    <span className="text-[10px] font-black text-sky-400 bg-sky-900/20 border border-sky-500/20 px-2 py-1 rounded uppercase tracking-wider">DARK</span>
                  </div>
                </div>
 
                {/* CORE ENGINE OPTIONS */}
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[9px] font-mono tracking-wider text-indigo-350 uppercase font-bold block">SAVESTATE ARCHIVE MANAGER</span>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={handleSaveProgress}
                      className="py-2.5 bg-[#0e1628] hover:bg-slate-900 text-slate-300 border border-white/10 hover:border-indigo-550 rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer text-center block"
                    >
                      💾 Synchronize Save State
                    </button>

                    <button
                      onClick={() => {
                        setShowSettingsModal(false);
                        setShowLoginRewardsModal(true);
                        AetheriaAudioEngine.playClick();
                      }}
                      className="py-2.5 bg-[#0e1628] hover:bg-slate-900 text-amber-350 border border-amber-500/20 hover:border-amber-500 rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer text-center block"
                    >
                      🎁 LOGIN REWARD
                    </button>

                    <button
                      onClick={() => {
                        setActiveScreen('menu');
                        setShowSettingsModal(false);
                        AetheriaAudioEngine.playClick();
                      }}
                      className="py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer text-center block shadow-md"
                    >
                      🔌 Return to Main Menu
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <button
                    onClick={executeEngineWipe}
                    className="w-full py-3 bg-red-950/20 hover:bg-red-950/45 text-rose-300 border border-red-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                  >
                    ⚠️ ERASE ALL CACHED SAVE PROGRESS
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7-DAY LOGIN REWARD MODAL */}
      <AnimatePresence>
        {showLoginRewardsModal && (
          <LoginRewardModal
            isOpen={showLoginRewardsModal}
            onClose={() => setShowLoginRewardsModal(false)}
            claimedDays={saveState.loginRewardClaimedDays || []}
            onClaimDay={handleClaimLoginReward}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
