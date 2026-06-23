/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import GDDViewer from './components/GDDViewer';
import GachaSimulator from './components/GachaSimulator';
import CombatArena from './components/CombatArena';
import InventoryManager from './components/InventoryManager';
import RogueDungeon from './components/RogueDungeon';
import GemsShop, { DAMAGE_SKINS } from './components/GemsShop';
import { SaveState, Weapon, Artifact, InventoryItem, Quest, ElementType, ArtifactSlot, UiThemeId } from './types';
import { t, LanguageType } from './utils/i18n';
import { PLAYABLE_CHARACTERS } from './data/characters';
import { ARTIFACT_SETS } from './data/artifacts';
import { GDD_DATA } from './data/world';
import { INITIAL_50_QUESTS } from './data/quests';
import { WEAPONS_DATABASE } from './data/weapons';
import LoginRewardModal from './components/LoginRewardModal';
import ElementalReactionsModal from './components/ElementalReactionsModal';
import SquadronQuestLedger from './components/SquadronQuestLedger';
import { 
  Shield, Sparkles, Coins, HelpCircle, History, RefreshCw, Star, 
  BookOpen, Compass, Sword, Landmark, Hammer, Trophy, DollarSign, 
  Info, Skull, LayoutGrid, CheckCircle2, Circle, Volume2, VolumeX, X, Play, LogOut, Award, Maximize2, Minimize2, Users, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AetheriaAudioEngine } from './utils/audio';
import { getArtifactFusionRule, isSameArtifactPart } from './utils/artifactFusion';
import { UI_THEMES, UI_THEME_UNLOCK_LEVEL, getUiTheme, isUiThemeUnlocked, normalizeUiTheme } from './utils/uiThemes';
import { getStandardFiveStarCharacters } from './utils/limitedBanners';
import { SPECIAL_ULTIMATE_UNLOCK_LEVEL } from './utils/specialUltimates';
import { assignUniqueWeaponOwner, normalizeUniqueEquippedWeapons } from './utils/equipmentRules';
import mainMenuBg from '../assets/main_menu_bg.png';
import gameLogoImg from '../assets/game_logo.png';
import StoryMode from './components/StoryMode';
import StoryCutscene from './components/StoryCutscene';
import { getStageSpec, getStageDialogue, getCharacterStoryScript } from './data/storyStages';

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const requestMobileGateFullscreen = async () => {
  if (document.fullscreenElement) {
    return true;
  }

  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
      return true;
    }

    const webkitRequestFullscreen = (document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }).webkitRequestFullscreen;
    if (webkitRequestFullscreen) {
      await webkitRequestFullscreen.call(document.documentElement);
    }

    return true;
  } catch {
    return false;
  }
};

const INITIAL_SAVE_STATE: SaveState = {
  mora: 30000, 
  aetherGems: 1600, 
  playerLevel: 1,
  playerExp: 0,
  playerExpMax: 100,
  specialUltimateUnlockNotified: false,
  inventoryWeapons: [
    { id: 'start_w_1', name: 'Dull Blade (Sword)', rarity: 3, weaponType: 'Sword', baseAtk: 18, statBonus: 'ATK +3%', level: 1 },
    { id: 'start_w_2', name: 'Iron Point (Claymore)', rarity: 3, weaponType: 'Claymore', baseAtk: 24, statBonus: 'Physical DMG +4%', level: 1 },
    { id: 'start_w_3', name: 'Hunter Bow (Bow)', rarity: 3, weaponType: 'Bow', baseAtk: 15, statBonus: 'Crit Rate +2%', level: 1 },
    { id: 'start_w_4', name: 'Apprentice Scroll (Catalyst)', rarity: 3, weaponType: 'Catalyst', baseAtk: 16, statBonus: 'Energy Recharge +3%', level: 1 },
    { id: 'start_w_5', name: 'Beginner Pole (Polearm)', rarity: 3, weaponType: 'Polearm', baseAtk: 20, statBonus: 'Physical DMG +2%', level: 1 }
  ],
  inventoryItems: [
    { id: 'wit_exp', name: "Hero's Wit (Character XP Boost)", count: 35, type: 'char_xp', rarity: 3, desc: 'Earned by clearing waves in Combat Arena, defeating enemies, and completing quests. Used to level up characters from Lv.1 to Lv.50.' },
    { id: 'ore_exp', name: "Myconid Spore Catalyst", count: 20, type: 'ascension', rarity: 4, desc: 'Drops from clearing rooms in Rogue Ruins — higher rooms grant more. Required to advance characters from Lv.50 to Lv.80.' }
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
  inventoryArtifacts: [],
  characterEquippedArtifacts: {},
  partyIds: ['marina'],
  unlockedCharacterIds: ['marina'],
  activeQuests: INITIAL_50_QUESTS,
  completedQuestIds: [],
  loginRewardClaimedDays: [],
  unlockedDamageSkins: ['Default'],
  activeDamageSkin: 'Default',
  activeUiTheme: 'Blue',
  lastShopRefreshHour: 0,
  purchasedShopItemIds: [],
  unlockedDaysCount: 1,
  nextRewardUnlockTime: 0,
  lastLoginDateStr: '',
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
  bannerGuaranteed5Star: {
    char_banner_1: false,
    char_banner_2: false,
    weapon_banner_1: false,
    weapon_banner_2: false
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
    highScoreRogueRoom: 0,
    longestLoginStreak: 1,
    currentLoginStreak: 1
  },
  storyProgress: {
    currentChapter: 1,
    currentStage: '1-1',
    completedStages: [],
    starRatings: {},
    unlockedLoreEntries: [],
    completedCharacterStoryActs: {},
    hardModeUnlockedChapters: [],
    hardModeCompletedStages: []
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

  // PWA installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) {
      return;
    }

    // For iOS Safari (which doesn't support beforeinstallprompt)
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIos) {
      setShowInstallBtn(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    AetheriaAudioEngine.playClick();
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const handleMobileFullscreenGate = async () => {
    setMobileFullscreenGateMessage('');
    await AetheriaAudioEngine.resume();
    AetheriaAudioEngine.playClick();

    const enteredFullscreen = await requestMobileGateFullscreen();
    if (enteredFullscreen) {
      setMobileFullscreenGateOpen(false);
      return;
    }

    setMobileFullscreenGateMessage('Fullscreen was blocked. Tap the button again to continue.');
  };

  // Robust play time tracking using Date.now() and refs
  const sessionStartRef = useRef<number>(Date.now());
  const basePlayTimeRef = useRef<number>(0);
  const [displayPlayTime, setDisplayPlayTime] = useState(0);
  const getCurrentPlayTime = useCallback(() => {
    return basePlayTimeRef.current + Math.floor((Date.now() - sessionStartRef.current) / 1000);
  }, []);
  // Default to Main Menu as requested: 'menu'
  const [activeScreen, setActiveScreen] = useState<'menu' | 'wiki' | 'arena' | 'wish' | 'inventory' | 'quest' | 'dungeon' | 'party' | 'story'>('menu');
  const [mobileFullscreenGateOpen, setMobileFullscreenGateOpen] = useState<boolean>(isMobile);
  const [mobileFullscreenGateMessage, setMobileFullscreenGateMessage] = useState<string>('');
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  useEffect(() => {
    if (isMobile && mobileFullscreenGateOpen) {
      return;
    }

    setIsFirstLoad(true);
    setLoadProgress(0);
    const start = Date.now();
    const duration = 1800;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setLoadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsFirstLoad(false);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [mobileFullscreenGateOpen]);
  const [storyBattleActive, setStoryBattleActive] = useState<boolean>(false);
  const [storyBattleConfig, setStoryBattleConfig] = useState<{
    stageId: string;
    isHardMode: boolean;
    isCharStory: boolean;
    charId?: string;
    act?: number;
  }>({ stageId: '1-1', isHardMode: false, isCharStory: false });
  const [activeCutsceneSlides, setActiveCutsceneSlides] = useState<any[] | null>(null);
  const [pullHistory, setPullHistory] = useState<{ name: string; rarity: number; time: string }[]>([]);
  
  const [bgmVolume, setBgmVolume] = useState<number>(100);
  const [sfxVolume, setSfxVolume] = useState<number>(100);

  const [devCheatsEnabled, setDevCheatsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('aetheria_pref_dev_cheats');
    return saved !== null ? saved === 'true' : true;
  });

  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [wikiInitialTab, setWikiInitialTab] = useState<'lore' | 'nations' | 'characters' | 'weapons' | 'systems' | 'tutorial'>('lore');
  const [wikiInitialCharId, setWikiInitialCharId] = useState<string>('aurelia');
  const [wikiInitialWeaponName, setWikiInitialWeaponName] = useState<string>('');
  const [showResonanceSheet, setShowResonanceSheet] = useState(false);
  const [showArtifactSheet, setShowArtifactSheet] = useState(false);
  const [partyElementFilter, setPartyElementFilter] = useState<'All' | ElementType>('All');
  const [partyWeaponFilter, setPartyWeaponFilter] = useState<'All' | 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst'>('All');
  const [partyRarityFilter, setPartyRarityFilter] = useState<'All' | 3 | 4 | 5>('All');

  const partyResonances = React.useMemo(() => {
    const activeChars = PLAYABLE_CHARACTERS.filter(c => saveState.partyIds.includes(c.id));
    const elementCounts: Record<ElementType, number> = {} as any;
    activeChars.forEach(c => {
      elementCounts[c.element] = (elementCounts[c.element] || 0) + 1;
    });

    const uniqueElements = Object.keys(elementCounts).length;
    const list: { name: string; desc: string; key: string }[] = [];

    if ((elementCounts['Pyro'] || 0) >= 2) {
      list.push({ name: 'Fervent Flames (2 Pyro)', desc: '+15% ATK boost', key: 'pyro' });
    }
    if ((elementCounts['Hydro'] || 0) >= 2) {
      list.push({ name: 'Soothing Waters (2 Hydro)', desc: '+20% Energy Recharge rate boost', key: 'hydro' });
    }
    if ((elementCounts['Cryo'] || 0) >= 2) {
      list.push({ name: 'Shattering Ice (2 Cryo)', desc: '+15% Crit Rate against Frozen/Cryo targets', key: 'cryo' });
    }
    if ((elementCounts['Electro'] || 0) >= 2) {
      list.push({ name: 'High Voltage (2 Electro)', desc: '-20% Skill Cooldown reduction', key: 'electro' });
    }
    if ((elementCounts['Geo'] || 0) >= 2) {
      list.push({ name: 'Enduring Rock (2 Geo)', desc: '+15% Shield Strength and +15% DMG when shielded', key: 'geo' });
    }
    if ((elementCounts['Anemo'] || 0) >= 2) {
      list.push({ name: 'Impetuous Winds (2 Anemo)', desc: '+15% Move Speed and -15% Skill cooldown', key: 'anemo' });
    }
    if ((elementCounts['Dendro'] || 0) >= 2) {
      list.push({ name: 'Sprawling Greenery (2 Dendro)', desc: '+50 Elemental Mastery', key: 'dendro' });
    }
    if (uniqueElements >= 4) {
      list.push({ name: 'Protective Canopy (4 Unique)', desc: '+15% All Elemental/Physical DMG', key: 'unique' });
    }

    return list;
  }, [saveState.partyIds]);

  const activePartyArtifactSets = React.useMemo(() => {
    const activeChars = PLAYABLE_CHARACTERS.filter(c => saveState.partyIds.includes(c.id));
    const results: { charName: string; charId: string; activeSets: { setName: string; pieces: number; desc: string }[] }[] = [];

    activeChars.forEach(c => {
      const equipped = saveState.characterEquippedArtifacts?.[c.id] || {};
      const equippedArts = Object.values(equipped)
        .map(artId => (saveState.inventoryArtifacts || []).find(a => a.id === artId))
        .filter((a): a is Artifact => !!a);

      const setCounts: Record<string, number> = {
        Vanguard: 0,
        Guardian: 0,
        Celestial: 0,
        Chrono: 0
      };

      equippedArts.forEach(art => {
        if (art.set in setCounts) {
          setCounts[art.set]++;
        }
      });

      const activeSets: { setName: string; pieces: number; desc: string }[] = [];
      if (setCounts.Guardian >= 4) {
        activeSets.push({ setName: 'Guardian', pieces: 4, desc: "+55% Max HP" });
      } else if (setCounts.Guardian >= 2) {
        activeSets.push({ setName: 'Guardian', pieces: 2, desc: "+20% Max HP" });
      }

      if (setCounts.Vanguard >= 4) {
        activeSets.push({ setName: 'Vanguard', pieces: 4, desc: "+45% DMG" });
      } else if (setCounts.Vanguard >= 2) {
        activeSets.push({ setName: 'Vanguard', pieces: 2, desc: "+15% DMG" });
      }

      if (setCounts.Celestial >= 4) {
        activeSets.push({ setName: 'Celestial', pieces: 4, desc: "+25% Crit Rate / +55% Crit DMG" });
      } else if (setCounts.Celestial >= 2) {
        activeSets.push({ setName: 'Celestial', pieces: 2, desc: "+10% Crit Rate / +20% Crit DMG" });
      }

      if (setCounts.Chrono >= 4) {
        activeSets.push({ setName: 'Chrono', pieces: 4, desc: "+30% Skill CD Reduction" });
      } else if (setCounts.Chrono >= 2) {
        activeSets.push({ setName: 'Chrono', pieces: 2, desc: "+10% Skill CD Reduction" });
      }

      if (activeSets.length > 0) {
        results.push({ charName: c.name, charId: c.id, activeSets });
      }
    });

    return results;
  }, [saveState.partyIds, saveState.characterEquippedArtifacts, saveState.inventoryArtifacts]);

  const [language, setLanguage] = useState<LanguageType>(() => {
    return (localStorage.getItem('rpg_language') as LanguageType) || 'en';
  });
  const [fpsLimit, setFpsLimit] = useState<'60' | 'none'>(() => {
    return (localStorage.getItem('rpg_fps_limit') as '60' | 'none') || '60';
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

  const isDungeonLocked = !devCheatsEnabled && (saveState.playerLevel || 1) < 10;
  const isWishLocked = !devCheatsEnabled && (saveState.playerLevel || 1) < 5;
  const isShopLocked = !devCheatsEnabled && (saveState.playerLevel || 1) < 5;
  const currentPlayerLevel = saveState.playerLevel || 1;
  const activeUiThemeId = normalizeUiTheme(saveState.activeUiTheme, currentPlayerLevel);
  const activeUiTheme = getUiTheme(activeUiThemeId);

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

    // Track play time every second using Date.now() for reliability
    const playTimeInterval = setInterval(() => {
      setDisplayPlayTime(basePlayTimeRef.current + Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);

    // Auto-save play time to localStorage every 30 seconds
    const playTimeSaveInterval = setInterval(() => {
      try {
        const stored = localStorage.getItem('aetheria_rpg_save_v3');
        if (stored) {
          const parsed = JSON.parse(stored);
          const currentPT = basePlayTimeRef.current + Math.floor((Date.now() - sessionStartRef.current) / 1000);
          parsed.stats = { ...(parsed.stats || {}), playTime: currentPT };
          localStorage.setItem('aetheria_rpg_save_v3', JSON.stringify(parsed));
        }
      } catch (_e) { /* silent */ }
    }, 30000);

    // Save play time when the user leaves/closes the tab
    const handleBeforeUnload = () => {
      try {
        const stored = localStorage.getItem('aetheria_rpg_save_v3');
        if (stored) {
          const parsed = JSON.parse(stored);
          const currentPT = basePlayTimeRef.current + Math.floor((Date.now() - sessionStartRef.current) / 1000);
          parsed.stats = { ...(parsed.stats || {}), playTime: currentPT };
          localStorage.setItem('aetheria_rpg_save_v3', JSON.stringify(parsed));
        }
      } catch (_e) { /* silent */ }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(msInterval);
      clearInterval(playTimeInterval);
      clearInterval(playTimeSaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Sync mute settings to audio core
  useEffect(() => {
    AetheriaAudioEngine.setMute(muteSfx);
  }, [muteSfx]);

  // Auto-start BGM on mount or the very first user interaction (click, touch, keypress, mousemove, etc.)
  // Browsers require a user gesture before audio can play — this hooks all possible gestures.
  useEffect(() => {
    // Attempt autoplay immediately (may succeed if permission was already granted previously)
    AetheriaAudioEngine.resume();
    AetheriaAudioEngine.startMusic();

    const startOnFirstInteraction = () => {
      AetheriaAudioEngine.resume();
      AetheriaAudioEngine.startMusic();
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', startOnFirstInteraction);
      window.removeEventListener('touchstart', startOnFirstInteraction);
      window.removeEventListener('keydown', startOnFirstInteraction);
      window.removeEventListener('mousedown', startOnFirstInteraction);
    };

    window.addEventListener('click', startOnFirstInteraction);
    window.addEventListener('touchstart', startOnFirstInteraction);
    window.addEventListener('keydown', startOnFirstInteraction);
    window.addEventListener('mousedown', startOnFirstInteraction);

    return () => {
      cleanupListeners();
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
          bannerGuaranteed5Star: {
            ...defaultState.bannerGuaranteed5Star,
            ...(parsed.bannerGuaranteed5Star || {})
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
          },
          inventoryArtifacts: parsed.inventoryArtifacts || [],
          characterEquippedArtifacts: parsed.characterEquippedArtifacts || {},
          storyProgress: {
            ...defaultState.storyProgress,
            ...(parsed.storyProgress || {})
          }
        };

        merged.inventoryItems = (merged.inventoryItems || []).map(item => {
          if (item.type === 'char_xp' || item.id === 'wit_exp') {
            return { ...item, rarity: 3 };
          }
          if (item.type === 'ascension' || item.id === 'ore_exp') {
            return { ...item, rarity: 4 };
          }
          return item;
        });

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

        // Upgrade loading save to guarantee 50 quests configuration and fix missing groups/fields
        if (!merged.activeQuests || merged.activeQuests.length < 30) {
          const completedIds = merged.completedQuestIds || [];
          merged.activeQuests = INITIAL_50_QUESTS.filter(q => !completedIds.includes(q.id));
        } else {
          // Repair existing active quests by copying missing template fields (like group)
          merged.activeQuests = merged.activeQuests.map(q => {
            const template = INITIAL_50_QUESTS.find(t => t.id === q.id);
            if (template) {
              return {
                ...template,
                currentValue: q.currentValue !== undefined ? q.currentValue : 0,
                completed: q.completed !== undefined ? q.completed : false
              };
            }
            return q;
          });
        }


        // Initialize newbie logins array
        if (!merged.loginRewardClaimedDays) {
          merged.loginRewardClaimedDays = [];
        }

        // Initialize damage skin variables
        if (!merged.unlockedDamageSkins) {
          merged.unlockedDamageSkins = ['Default'];
        }
        const validSkins = ['Default', 'Ice', 'Void', 'Celestial'];
        const savedSkins = Array.isArray(merged.unlockedDamageSkins) ? merged.unlockedDamageSkins : ['Default'];
        merged.unlockedDamageSkins = Array.from(new Set([
          'Default',
          ...savedSkins.filter((s: string) => validSkins.includes(s))
        ]));
        
        if (!merged.activeDamageSkin || !validSkins.includes(merged.activeDamageSkin)) {
          merged.activeDamageSkin = 'Default';
        }
        const loadedPartyIds = Array.isArray(parsed.partyIds) ? parsed.partyIds : defaultState.partyIds;
        merged.partyIds = loadedPartyIds
          .filter((id: string) => merged.unlockedCharacterIds.includes(id))
          .slice(0, 4);
        merged.characterEquippedWeapon = normalizeUniqueEquippedWeapons(merged.characterEquippedWeapon || {});
        merged.activeUiTheme = normalizeUiTheme(merged.activeUiTheme, merged.playerLevel || 1);
        if (merged.lastShopRefreshHour === undefined) {
          merged.lastShopRefreshHour = 0;
        }
        if (!merged.purchasedShopItemIds) {
          merged.purchasedShopItemIds = [];
        }

        // Initialize daily login rewards variables
        if (merged.unlockedDaysCount === undefined) {
          merged.unlockedDaysCount = 1;
        }
        if (merged.nextRewardUnlockTime === undefined) {
          merged.nextRewardUnlockTime = 0;
        }
        if (merged.lastLoginDateStr === undefined) {
          merged.lastLoginDateStr = '';
        }
        if (merged.stats) {
          if (merged.stats.longestLoginStreak === undefined) {
            merged.stats.longestLoginStreak = 1;
          }
          if (merged.stats.currentLoginStreak === undefined) {
            merged.stats.currentLoginStreak = 1;
          }
        }

        // Initialize play time refs from the loaded save
        basePlayTimeRef.current = merged.stats?.playTime || 0;
        sessionStartRef.current = Date.now();
        setDisplayPlayTime(merged.stats?.playTime || 0);

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

  // Check and refresh shop hourly
  useEffect(() => {
    const checkRefresh = () => {
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
      if (saveState.lastShopRefreshHour !== undefined && saveState.lastShopRefreshHour !== currentHour) {
        setSaveState(prev => {
          if (prev.lastShopRefreshHour === currentHour) return prev;
          const updated = {
            ...prev,
            lastShopRefreshHour: currentHour,
            purchasedShopItemIds: []
          };
          try {
            localStorage.setItem('aetheria_rpg_save_v3', JSON.stringify(updated));
          } catch (err) {
            console.error("Local save persistence error", err);
          }
          return updated;
        });
      }
    };

    checkRefresh();
    const interval = setInterval(checkRefresh, 1000);
    return () => clearInterval(interval);
  }, [saveState.lastShopRefreshHour]);

  // Periodic check to unlock next reward day if timer expires during active gameplay
  useEffect(() => {
    if (activeScreen === 'menu') return;
    const checkTimer = () => {
      const now = Date.now();
      if (
        saveState.nextRewardUnlockTime && 
        now >= saveState.nextRewardUnlockTime && 
        (saveState.unlockedDaysCount || 1) < 7
      ) {
        triggerSaveUpdate(prev => {
          if (prev.nextRewardUnlockTime && now >= prev.nextRewardUnlockTime && (prev.unlockedDaysCount || 1) < 7) {
            return {
              ...prev,
              unlockedDaysCount: (prev.unlockedDaysCount || 1) + 1,
              nextRewardUnlockTime: now + 24 * 60 * 60 * 1000
            };
          }
          return prev;
        });
      }
    };
    checkTimer();
    const interval = setInterval(checkTimer, 5000);
    return () => clearInterval(interval);
  }, [saveState.nextRewardUnlockTime, saveState.unlockedDaysCount, activeScreen]);

  const handleUpdateSaveState = (updater: React.SetStateAction<SaveState>) => {
    triggerSaveUpdate(prev => {
      if (typeof updater === 'function') {
        return (updater as (p: SaveState) => SaveState)(prev);
      }
      return updater;
    });
  };

  const handleSelectUiTheme = (themeId: UiThemeId) => {
    const level = saveState.playerLevel || 1;
    const theme = getUiTheme(themeId);
    AetheriaAudioEngine.playClick();

    if (!isUiThemeUnlocked(themeId, level)) {
      showInGameAlert(
        `${theme.label} UI Theme unlocks at Player Level ${UI_THEME_UNLOCK_LEVEL}.`,
        `Current progress: Level ${level} / ${UI_THEME_UNLOCK_LEVEL}`,
        'error'
      );
      return;
    }

    triggerSaveUpdate(prev => ({
      ...prev,
      activeUiTheme: themeId
    }));
    showInGameAlert(
      `${theme.label} UI Theme Equipped`,
      'Menus and HUD will keep this theme on your next login.',
      'success'
    );
  };

  // Update save states dynamically
  const triggerSaveUpdate = (updater: (prev: SaveState) => SaveState) => {
    const currentPlayTime = getCurrentPlayTime();
    setSaveState(prev => {
      const updated = updater(prev);
      // Always include the latest play time in saves
      const withPlayTime = {
        ...updated,
        characterEquippedWeapon: normalizeUniqueEquippedWeapons(updated.characterEquippedWeapon || {}),
        stats: { ...updated.stats, playTime: currentPlayTime }
      };
      try {
        localStorage.setItem('aetheria_rpg_save_v3', JSON.stringify(withPlayTime));
      } catch (err) {
        console.error("Local save persistence error", err);
      }
      return withPlayTime;
    });
  };

  useEffect(() => {
    if ((saveState.playerLevel || 1) < SPECIAL_ULTIMATE_UNLOCK_LEVEL || saveState.specialUltimateUnlockNotified) return;

    showInGameAlert(
      'SPECIAL ULTIMATE HAS UNLOCKED, HEAD INTO A BATTLE WITH 2 LIMITED 5 STAR HERO TO CHECK IT OUT!',
      'Valid pairs: Aurelia + Kaelen or Maelis + Veyra. Both Ultimate Gauges must be full.',
      'success'
    );
    triggerSaveUpdate(prev => ({
      ...prev,
      specialUltimateUnlockNotified: true
    }));
  }, [saveState.playerLevel, saveState.specialUltimateUnlockNotified]);

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

        // setTimeout(() => {
        //   showInGameAlert(
        //     `✨ DUPLICATE SUMMON: ${charName.toUpperCase()} PORTRAIT UPGRADED!`,
        //     `${charName}'s Portrait Level is now P${nextLvl}! (Stats boosted in combat)`,
        //     "success"
        //   );
        // }, 100);

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
        characterEquippedWeapon: assignUniqueWeaponOwner(prev.characterEquippedWeapon || {}, id, defaultWeaponId),
        partyIds: prev.partyIds
      };

      // Sync character owned count progress quest
      return checkQuestProgress(updated, 'own_chars', updated.unlockedCharacterIds.length);
    });
  };

  // Add inventory items (Hero's Wit / Myconid Spore Catalyst)
  const handleAddItems = (itemType: 'char_xp' | 'ascension', amount: number) => {
    triggerSaveUpdate(prev => ({
      ...prev,
      inventoryItems: prev.inventoryItems.map(item =>
        item.type === itemType ? { ...item, count: item.count + amount } : item
      )
    }));
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
      // Level 1-50: consume Hero's Wit (char_xp); Level 50-80: consume Myconid Spore Catalyst (ascension)
      const consumeType = currentLevel < 50 ? 'char_xp' : 'ascension';
      const newItems = prev.inventoryItems.map(item => {
        if (item.type === consumeType) {
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
      characterEquippedWeapon: assignUniqueWeaponOwner(prev.characterEquippedWeapon || {}, charId, weaponUid)
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
          devCheatsEnabled
            ? "Jump into the 'Combat Arena' tab to defeat ordinary slimes / world bosses, claim finished achievements in the 'Quest Log', or use the developer panel +100k cheats."
            : "Jump into the 'Combat Arena' tab to defeat ordinary slimes / world bosses, or claim finished achievements in the 'Quest Log'.",
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

  const handleEquipArtifact = (charId: string, slot: ArtifactSlot, artifactId: string | null) => {
    triggerSaveUpdate(prev => {
      const currentEquipped = { ...(prev.characterEquippedArtifacts || {}) };
      const currentArtifacts = [...(prev.inventoryArtifacts || [])];

      if (artifactId === null) {
        // Unequip
        const prevArtId = currentEquipped[charId]?.[slot];
        if (prevArtId) {
          const idx = currentArtifacts.findIndex(a => a.id === prevArtId);
          if (idx !== -1) {
            currentArtifacts[idx] = { ...currentArtifacts[idx], equippedTo: undefined };
          }
        }
        if (currentEquipped[charId]) {
          const charRecord = { ...currentEquipped[charId] };
          delete charRecord[slot];
          currentEquipped[charId] = charRecord;
        }
      } else {
        // Equip
        const artIdx = currentArtifacts.findIndex(a => a.id === artifactId);
        if (artIdx !== -1) {
          const artifact = currentArtifacts[artIdx];
          const prevEquippedCharId = artifact.equippedTo;

          // 1. Unequip from previous owner if any
          if (prevEquippedCharId && prevEquippedCharId !== charId) {
            if (currentEquipped[prevEquippedCharId]) {
              const prevCharRecord = { ...currentEquipped[prevEquippedCharId] };
              delete prevCharRecord[slot];
              currentEquipped[prevEquippedCharId] = prevCharRecord;
            }
          }

          // 2. Unequip whatever was currently in this character's slot
          const oldArtId = currentEquipped[charId]?.[slot];
          if (oldArtId) {
            const oldIdx = currentArtifacts.findIndex(a => a.id === oldArtId);
            if (oldIdx !== -1) {
              currentArtifacts[oldIdx] = { ...currentArtifacts[oldIdx], equippedTo: undefined };
            }
          }

          // 3. Mark the new artifact as equipped to charId
          currentArtifacts[artIdx] = { ...artifact, equippedTo: charId };

          // 4. Update the character equipped record
          currentEquipped[charId] = {
            ...(currentEquipped[charId] || {}),
            [slot]: artifactId
          };
        }
      }

      return {
        ...prev,
        inventoryArtifacts: currentArtifacts,
        characterEquippedArtifacts: currentEquipped
      };
    });
  };

  const handleLockArtifact = (artId: string, lockState: boolean) => {
    triggerSaveUpdate(prev => {
      const currentArtifacts = [...(prev.inventoryArtifacts || [])];
      const idx = currentArtifacts.findIndex(a => a.id === artId);
      if (idx !== -1) {
        currentArtifacts[idx] = { ...currentArtifacts[idx], isLocked: lockState };
      }
      return {
        ...prev,
        inventoryArtifacts: currentArtifacts
      };
    });
  };

  const handleDeleteArtifact = (artId: string) => {
    triggerSaveUpdate(prev => {
      const currentArtifacts = (prev.inventoryArtifacts || []).filter(a => a.id !== artId);
      const currentEquipped = { ...(prev.characterEquippedArtifacts || {}) };

      Object.keys(currentEquipped).forEach(charId => {
        const slots = currentEquipped[charId];
        if (slots) {
          const newSlots = { ...slots };
          let modified = false;
          Object.keys(newSlots).forEach(slot => {
            if (newSlots[slot] === artId) {
              delete newSlots[slot];
              modified = true;
            }
          });
          if (modified) {
            currentEquipped[charId] = newSlots;
          }
        }
      });

      return {
        ...prev,
        inventoryArtifacts: currentArtifacts,
        characterEquippedArtifacts: currentEquipped
      };
    });
  };

  const handleAwardArtifact = (newArt: Artifact) => {
    triggerSaveUpdate(prev => ({
      ...prev,
      inventoryArtifacts: [...(prev.inventoryArtifacts || []), newArt]
    }));
  };

  const handleAwardArtifacts = (newArtifacts: Artifact[]) => {
    triggerSaveUpdate(prev => ({
      ...prev,
      inventoryArtifacts: [...(prev.inventoryArtifacts || []), ...newArtifacts]
    }));
  };

  const handleFuseArtifacts = (consumeArtifactIds: string[], upgradedArtifact: Artifact, costMora: number, costGems: number) => {
    triggerSaveUpdate(prev => {
      const artifacts = prev.inventoryArtifacts || [];
      const consumeIdSet = new Set(consumeArtifactIds);
      const consumedArtifacts = artifacts.filter(art => consumeIdSet.has(art.id));
      const baseArtifact = consumedArtifacts[0];
      const fusionRule = baseArtifact ? getArtifactFusionRule(baseArtifact.rarity) : null;

      if (!baseArtifact || consumedArtifacts.length !== 3 || !fusionRule) {
        showInGameAlert(
          "Artifact Fusion Failed!",
          "Select three matching blue or purple artifacts from the same exact set piece before fusing.",
          "error"
        );
        return prev;
      }

      const samePart = consumedArtifacts.every(art => isSameArtifactPart(art, baseArtifact));
      const blockedArtifact = consumedArtifacts.some(art => art.isLocked || art.equippedTo);
      if (!samePart || blockedArtifact) {
        showInGameAlert(
          "Artifact Fusion Blocked!",
          "Only unlocked, unequipped artifacts with the exact same name, set, slot, and tier can be fused.",
          "error"
        );
        return prev;
      }

      if (
        upgradedArtifact.name !== baseArtifact.name ||
        upgradedArtifact.set !== baseArtifact.set ||
        upgradedArtifact.slot !== baseArtifact.slot ||
        upgradedArtifact.rarity !== fusionRule.resultRarity
      ) {
        showInGameAlert(
          "Artifact Fusion Matrix Mismatch!",
          "The fused artifact must keep the same artifact part and upgrade only the rarity tier.",
          "error"
        );
        return prev;
      }

      if (prev.mora < costMora || prev.aetherGems < costGems) {
        showInGameAlert(
          "Insufficient Fusion Currency!",
          `This fusion requires ${costMora.toLocaleString()} Mora and ${costGems.toLocaleString()} Gems.`,
          "error"
        );
        return prev;
      }

      showInGameAlert(
        "Artifact Fusion Complete!",
        `${fusionRule.inputLabel} ${baseArtifact.name} fused into ${fusionRule.outputLabel}.`,
        "success"
      );
      AetheriaAudioEngine.playWaveClear();

      return {
        ...prev,
        mora: prev.mora - costMora,
        aetherGems: prev.aetherGems - costGems,
        inventoryArtifacts: [
          ...artifacts.filter(art => !consumeIdSet.has(art.id)),
          upgradedArtifact
        ]
      };
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

  const handleStartStoryBattle = (config: { stageId: string; isHardMode: boolean; isCharStory: boolean; charId?: string; act?: number }) => {
    setStoryBattleConfig(config);
    setStoryBattleActive(true);
  };

  const handleStoryBattleEnd = (victory: boolean, stats: { stars: number; hp: Record<string, number>; ult: Record<string, number>; duration: number; deaths: number }) => {
    setStoryBattleActive(false);
    if (!victory) {
      showInGameAlert("Story Battle Defeated!", "Adjust your party elements, upgrade character levels, or forge better weapons to try again!", "error");
      return;
    }

    const stageId = storyBattleConfig.stageId;
    const isHardMode = storyBattleConfig.isHardMode;
    const isCharStory = storyBattleConfig.isCharStory;

    triggerSaveUpdate(prev => {
      const progress = prev.storyProgress || {
        currentChapter: 1,
        currentStage: '1-1',
        completedStages: [],
        starRatings: {},
        unlockedLoreEntries: [],
        completedCharacterStoryActs: {},
        hardModeUnlockedChapters: [],
        hardModeCompletedStages: []
      };

      let nextCompletedStages = [...progress.completedStages];
      let nextHardCompletedStages = [...(progress.hardModeCompletedStages || [])];
      let nextUnlockedLoreEntries = [...progress.unlockedLoreEntries];
      let nextCompletedCharacterStoryActs = { ...progress.completedCharacterStoryActs };
      let nextCharacterPortraits = { ...(prev.characterPortraits || {}) };
      
      let nextGems = prev.aetherGems;
      let nextMora = prev.mora;
      let nextInventoryItems = [...prev.inventoryItems];

      const prevStars = progress.starRatings[stageId] || 0;
      const nextStarRatings = {
        ...progress.starRatings,
        [stageId]: Math.max(prevStars, stats.stars)
      };

      if (isCharStory) {
        const charId = storyBattleConfig.charId!;
        const act = storyBattleConfig.act!;
        const actPrev = nextCompletedCharacterStoryActs[charId] || 0;
        if (actPrev < act) {
          const spec = getStageSpec(stageId);
          nextGems += spec.firstClearRewards.gems;
          nextMora += spec.firstClearRewards.mora;
          nextCompletedCharacterStoryActs[charId] = act;
          const loreKey = `${charId}_act_${act}_clear`;
          if (!nextUnlockedLoreEntries.includes(loreKey)) {
            nextUnlockedLoreEntries.push(loreKey);
          }
        }
      } else {
        const [chapStr, stageStr] = stageId.split('-');
        const chapterNum = parseInt(chapStr);
        const stageNum = parseInt(stageStr);

        const spec = getStageSpec(stageId);
        const isFirstClear = !progress.completedStages.includes(stageId);
        const isFirstHardClear = isHardMode && !progress.hardModeCompletedStages?.includes(stageId);

        if (isHardMode) {
          if (!nextHardCompletedStages.includes(stageId)) {
            nextHardCompletedStages.push(stageId);
            if (isFirstHardClear) {
              nextMora += spec.firstClearRewards.mora * 2;
              nextInventoryItems = nextInventoryItems.map(item =>
                item.type === 'char_xp' ? { ...item, count: item.count + spec.firstClearRewards.charXp * 2 } : item
              );
            }
          }
        } else {
          if (!nextCompletedStages.includes(stageId)) {
            nextCompletedStages.push(stageId);
            if (isFirstClear) {
              nextGems += spec.firstClearRewards.gems;
              nextMora += spec.firstClearRewards.mora;
              nextInventoryItems = nextInventoryItems.map(item =>
                item.type === 'char_xp' ? { ...item, count: item.count + spec.firstClearRewards.charXp } : item
              );
              if (spec.firstClearRewards.ascensionMaterialCount) {
                nextInventoryItems = nextInventoryItems.map(item =>
                  item.type === 'ascension' ? { ...item, count: item.count + spec.firstClearRewards.ascensionMaterialCount! } : item
                );
              }
            }
          }

          if (stageNum === 5) {
            const nextChapterNum = Math.min(10, chapterNum + 1);
            progress.currentStage = `${nextChapterNum}-1`;
            progress.currentChapter = nextChapterNum;
            const chapClearKey = `chapter-${chapterNum}-clear`;
            if (!nextUnlockedLoreEntries.includes(chapClearKey)) {
              nextUnlockedLoreEntries.push(chapClearKey);
            }
          } else {
            progress.currentStage = `${chapterNum}-${stageNum + 1}`;
          }
        }
      }

      let updatedState: SaveState = {
        ...prev,
        aetherGems: nextGems,
        mora: nextMora,
        inventoryItems: nextInventoryItems,
        characterPortraits: nextCharacterPortraits,
        storyProgress: {
          ...progress,
          completedStages: nextCompletedStages,
          hardModeCompletedStages: nextHardCompletedStages,
          starRatings: nextStarRatings,
          unlockedLoreEntries: nextUnlockedLoreEntries,
          completedCharacterStoryActs: nextCompletedCharacterStoryActs
        }
      };

      const totalClearedChapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(c => {
        return [1, 2, 3, 4, 5].every(s => nextCompletedStages.includes(`${c}-${s}`));
      }).length;

      const totalStarsCount = (Object.values(nextStarRatings) as number[]).reduce((sum, v) => sum + v, 0);

      updatedState = checkQuestProgress(updatedState, 'story_clear_chapter', totalClearedChapters);
      updatedState = checkQuestProgress(updatedState, 'story_earn_stars', totalStarsCount);
      if (stageId === '3-5') {
        updatedState = checkQuestProgress(updatedState, 'story_defeat_boss', 1);
      }

      return updatedState;
    });

    if (isCharStory) {
      const spec = getStageSpec(stageId);
      if (storyBattleConfig.charId && storyBattleConfig.act) {
        const script = getCharacterStoryScript(storyBattleConfig.charId, storyBattleConfig.act);
        if (script.after.length > 0) {
          setActiveCutsceneSlides(script.after);
        }
      }
      showInGameAlert(
        "Character Story Cleared!",
        `Received +${spec.firstClearRewards.gems} Gems and +${spec.firstClearRewards.mora.toLocaleString()} Mora. Character Stories do not grant stat bonuses or combat power.`,
        "success"
      );
      return;
    }

    const dialogue = getStageDialogue(stageId);
    if (dialogue && dialogue.after && dialogue.after.length > 0) {
      setActiveCutsceneSlides(dialogue.after);
    } else {
      showInGameAlert("Victory!", "Story battle resolved successfully. First-clear drops added where available!", "success");
    }
  };

  // Claim specific finished Quest rewards
  const claimQuestReward = (questId: string) => {
    const quest = saveState.activeQuests.find(q => q.id === questId);
    if (!quest || !quest.completed) return;

    triggerSaveUpdate(prev => {
      let nextGems = prev.aetherGems + quest.rewardTokens;
      let nextMora = prev.mora + quest.rewardMora;
      
      const witBonus = (['kill_enemy','kill_boss','parry','reaction'].includes(quest.type)) ? 3 : 0;
      let nextInventoryItems = prev.inventoryItems.map(item =>
        item.type === 'char_xp' ? { ...item, count: item.count + witBonus } : item
      );

      let nextUnlockedCharacterIds = [...prev.unlockedCharacterIds];
      let nextCharacterLevels = { ...prev.characterLevels };
      let nextCharacterPortraits = { ...(prev.characterPortraits || {}) };
      let nextCharacterHp = { ...prev.characterHp };
      let nextCharacterEquippedWeapon = { ...prev.characterEquippedWeapon };
      let nextPartyIds = [...prev.partyIds];
      let nextInventoryWeapons = [...prev.inventoryWeapons];

      if (quest.rewardWeaponName) {
        const weaponId = 'quest_w_' + Date.now();
        const weaponObj: Weapon = {
          id: weaponId,
          name: quest.rewardWeaponName,
          rarity: 4,
          weaponType: 'Sword',
          baseAtk: 42,
          statBonus: 'ATK +6%',
          level: 1
        };
        if (quest.rewardWeaponName.includes('Claymore')) weaponObj.weaponType = 'Claymore';
        else if (quest.rewardWeaponName.includes('Bow')) weaponObj.weaponType = 'Bow';
        else if (quest.rewardWeaponName.includes('Catalyst')) weaponObj.weaponType = 'Catalyst';
        else if (quest.rewardWeaponName.includes('Polearm')) weaponObj.weaponType = 'Polearm';
        nextInventoryWeapons.push(weaponObj);
      }

      if (quest.rewardCharacterId) {
        const id = quest.rewardCharacterId;
        if (nextUnlockedCharacterIds.includes(id)) {
          nextCharacterPortraits[id] = Math.min(6, (nextCharacterPortraits[id] || 0) + 1);
          nextInventoryItems = nextInventoryItems.map(i => i.type === 'char_xp' ? { ...i, count: i.count + 5 } : i);
          nextMora += 2000;
        } else {
          const charTemplate = PLAYABLE_CHARACTERS.find(c => c.id === id);
          const defaultWeaponId = (() => {
            if (!charTemplate) return 'start_w_1';
            if (charTemplate.weaponType === 'Claymore') return 'start_w_2';
            if (charTemplate.weaponType === 'Bow') return 'start_w_3';
            if (charTemplate.weaponType === 'Catalyst') return 'start_w_4';
            if (charTemplate.weaponType === 'Polearm') return 'start_w_5';
            return 'start_w_1';
          })();
          nextUnlockedCharacterIds.push(id);
          nextCharacterLevels[id] = 1;
          nextCharacterPortraits[id] = 0;
          nextCharacterHp[id] = charTemplate?.baseStats.hp || 1000;
          nextCharacterEquippedWeapon = assignUniqueWeaponOwner(nextCharacterEquippedWeapon, id, defaultWeaponId);
        }
      }

      const filteredQuests = prev.activeQuests.filter(q => q.id !== questId);
      let replenished = filteredQuests;
      
      const replenishQuestsGroup = (questsList: Quest[], grp: 'daily' | 'weekly' | 'normal') => {
        const existingOfGroup = questsList.filter(q => q.group === grp);
        if (existingOfGroup.length === 0) {
          const templates = INITIAL_50_QUESTS.filter(q => q.group === grp);
          const newQuests = templates.map(q => ({ ...q, currentValue: 0, completed: false }));
          return [...questsList.filter(q => q.group !== grp), ...newQuests];
        }
        return questsList;
      };
      
      replenished = replenishQuestsGroup(replenished, 'daily');
      replenished = replenishQuestsGroup(replenished, 'weekly');
      replenished = replenishQuestsGroup(replenished, 'normal');

      let nextState: SaveState = {
        ...prev,
        aetherGems: nextGems,
        mora: nextMora,
        inventoryItems: nextInventoryItems,
        unlockedCharacterIds: nextUnlockedCharacterIds,
        characterLevels: nextCharacterLevels,
        characterPortraits: nextCharacterPortraits,
        characterHp: nextCharacterHp,
        characterEquippedWeapon: nextCharacterEquippedWeapon,
        partyIds: nextPartyIds,
        inventoryWeapons: nextInventoryWeapons,
        activeQuests: replenished,
        completedQuestIds: [...prev.completedQuestIds, questId]
      };

      nextState = checkQuestProgress(nextState, 'own_chars', nextState.unlockedCharacterIds.length);
      return nextState;
    });

    const quest2 = saveState.activeQuests.find(q => q.id === questId);
    const witBonus2 = quest2 && ['kill_enemy','kill_boss','parry','reaction'].includes(quest2.type) ? 3 : 0;
    showInGameAlert(
      "Claimed Quest Reward Successfully!",
      `Received +${quest.rewardTokens} Aether Gems and +${quest.rewardMora.toLocaleString()} Mora${ witBonus2 > 0 ? ` and +${witBonus2} Hero's Wit` : '' }. Spend them right away in wishes loop!`,
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

    triggerSaveUpdate(prev => {
      const filteredQuests = prev.activeQuests.filter(q => !completedIds.includes(q.id));
      let replenished = filteredQuests;
      
      const replenishQuestsGroup = (questsList: Quest[], grp: 'daily' | 'weekly' | 'normal') => {
        const existingOfGroup = questsList.filter(q => q.group === grp);
        if (existingOfGroup.length === 0) {
          const templates = INITIAL_50_QUESTS.filter(q => q.group === grp);
          const newQuests = templates.map(q => ({ ...q, currentValue: 0, completed: false }));
          return [...questsList.filter(q => q.group !== grp), ...newQuests];
        }
        return questsList;
      };
      
      replenished = replenishQuestsGroup(replenished, 'daily');
      replenished = replenishQuestsGroup(replenished, 'weekly');
      replenished = replenishQuestsGroup(replenished, 'normal');

      return {
        ...prev,
        aetherGems: prev.aetherGems + totalTokens,
        mora: prev.mora + totalMora,
        activeQuests: replenished,
        completedQuestIds: [...prev.completedQuestIds, ...completedIds]
      };
    });

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

    // Check if the day is unlocked by the 24h login cooldown
    if (day > (saveState.unlockedDaysCount || 1)) {
      showInGameAlert("Day is locked!", "Wait for the 24-hour timer to expire to unlock this day's reward.", "error");
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
          characterEquippedWeapon: prev.characterEquippedWeapon[chosen.id]
            ? prev.characterEquippedWeapon
            : assignUniqueWeaponOwner(prev.characterEquippedWeapon || {}, chosen.id, defaultWeaponId),
          partyIds: prev.partyIds,
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
        const fiveStarHeroes = getStandardFiveStarCharacters(PLAYABLE_CHARACTERS);
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
          characterEquippedWeapon: prev.characterEquippedWeapon[chosen.id]
            ? prev.characterEquippedWeapon
            : assignUniqueWeaponOwner(prev.characterEquippedWeapon || {}, chosen.id, defaultWeaponId),
          partyIds: prev.partyIds,
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

  const handleStartSimulation = () => {
    AetheriaAudioEngine.resume();
    AetheriaAudioEngine.playClick();
    setActiveScreen('wiki');

    const todayStr = new Date().toDateString();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    triggerSaveUpdate(prev => {
      let currentUnlocked = prev.unlockedDaysCount || 1;
      let currentNextTime = prev.nextRewardUnlockTime || 0;
      let newStreak = prev.stats.currentLoginStreak || 1;
      let longestStreak = prev.stats.longestLoginStreak || 1;
      
      // 1. Check/initialize the 24-hour unlock timer
      if (currentNextTime === 0) {
        currentNextTime = Date.now() + 24 * 60 * 60 * 1000;
        currentUnlocked = 1;
      } else if (Date.now() >= currentNextTime) {
        if (currentUnlocked < 7) {
          currentUnlocked += 1;
          currentNextTime = Date.now() + 24 * 60 * 60 * 1000;
        }
      }

      // 2. Check/update login streak
      if (prev.lastLoginDateStr) {
        const lastDate = new Date(prev.lastLoginDateStr);
        lastDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
          if (newStreak > longestStreak) {
            longestStreak = newStreak;
          }
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
        longestStreak = Math.max(longestStreak, 1);
      }

      // 3. Determine if we should show the modal (only once per calendar day)
      const isNewDay = prev.lastLoginDateStr !== todayStr;
      const claimedCount = (prev.loginRewardClaimedDays || []).length;
      if (isNewDay && claimedCount < 7) {
        setTimeout(() => setShowLoginRewardsModal(true), 150);
      }

      return {
        ...prev,
        unlockedDaysCount: currentUnlocked,
        nextRewardUnlockTime: currentNextTime,
        lastLoginDateStr: todayStr,
        stats: {
          ...prev.stats,
          currentLoginStreak: newStreak,
          longestLoginStreak: longestStreak
        }
      };
    });
  };

  // Pity Counters updates per banner
  const handleUpdatePity = (bannerId: string, pity5: number, pity4: number, guaranteed5?: boolean) => {
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
      },
      bannerGuaranteed5Star: {
        ...(prev.bannerGuaranteed5Star || {}),
        [bannerId]: guaranteed5 !== undefined ? guaranteed5 : (prev.bannerGuaranteed5Star?.[bannerId] ?? false)
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
    // Reset play time tracking
    basePlayTimeRef.current = 0;
    sessionStartRef.current = Date.now();
    setDisplayPlayTime(0);
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
      const currentPlayTime = getCurrentPlayTime();
      const stateToSave = {
        ...saveState,
        stats: { ...saveState.stats, playTime: currentPlayTime }
      };
      localStorage.setItem('aetheria_rpg_save_v3', JSON.stringify(stateToSave));
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

  if (isMobile && mobileFullscreenGateOpen) {
    return (
      <div className="fixed inset-0 z-[99999] flex min-h-[100dvh] items-center justify-center bg-black px-6 text-white font-sans">
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <img
            src={gameLogoImg}
            alt="ELEMENTAL BATTLEGROUND"
            className="h-20 w-20 rounded-2xl object-cover shadow-[0_0_32px_rgba(255,255,255,0.25)] ring-1 ring-white/20"
          />
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Mobile Launch Gate</p>
            <h1 className="text-2xl font-black uppercase tracking-[0.18em] text-white">Elemental Battleground</h1>
          </div>

          <button
            type="button"
            onClick={handleMobileFullscreenGate}
            className="w-full rounded-2xl border border-white/70 bg-black px-6 py-5 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_0_28px_rgba(255,255,255,0.18)] transition-all active:scale-95"
          >
            PLAY IN FULL SCREEN
          </button>

          {mobileFullscreenGateMessage && (
            <p className="rounded-xl border border-red-400/40 bg-red-950/60 px-4 py-3 text-[11px] font-bold uppercase leading-relaxed tracking-wider text-red-100">
              {mobileFullscreenGateMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

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
      <div className="mobile-main-menu-scroll min-h-screen text-slate-100 flex flex-col font-sans relative antialiased leading-normal overflow-x-hidden justify-between">
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
              alt="ELEMENTAL BATTLEGROUND"
              className="w-10 h-10 rounded-xl object-cover shadow-[0_0_16px_rgba(251,191,36,0.5)] ring-1 ring-amber-400/30"
            />
            <span className="font-mono text-xs uppercase tracking-widest text-white drop-shadow font-bold">ELEMENTAL BATTLEGROUND</span>
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
        <main className="max-w-md w-full mx-auto px-6 py-12 text-center space-y-8 z-10">
          <div className="flex flex-col items-center gap-4">
            {/* Pulsing prompt for fullscreen */}
            {!isMobile && !isFullscreen && (
              <div 
                onClick={() => {
                  toggleFullscreen();
                  AetheriaAudioEngine.playClick();
                }}
                className="animate-pop-pulse text-[8px] sm:text-[9.5px] font-black tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1.5 rounded-full uppercase cursor-pointer select-none transition-all flex items-center gap-1.5 hover:bg-amber-400/20 active:scale-95 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
              >
                <span className="inline-block animate-ping w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                PLAY IN FULL SCREEN FOR BEST EXPERIENCE!
              </div>
            )}

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-block p-1 bg-gradient-to-tr from-[#6366f1] to-amber-400 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.25)] w-full"
            >
              <div className="bg-slate-900 border border-white/5 p-4 py-6 rounded-xl">
                <span className="text-[9px] font-mono tracking-[0.3em] text-[#818cf8] uppercase block mb-1">Dawning Core Client</span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-[0.1em] text-white font-display leading-none">
                  ELEMENTAL BATTLEGROUND
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
              onClick={handleStartSimulation}
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

        {showInstallBtn && (
          <button
            onClick={handleInstallClick}
            className="fixed bottom-6 left-6 z-30 p-2.5 px-4 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-100 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center gap-2 active:scale-95 hover:scale-105"
          >
            📥 Install App
          </button>
        )}

        {/* iOS PWA Installation instructions */}
        <AnimatePresence>
          {showIosInstructions && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-slate-950/95 z-55 flex items-center justify-center p-4 backdrop-blur-md"
              onClick={() => setShowIosInstructions(false)}
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
                    📥 Install on iPhone / iPad
                  </h3>
                  <button 
                    onClick={() => setShowIosInstructions(false)} 
                    className="p-1 text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs text-slate-350">
                  <p className="leading-relaxed">
                    To install this game on your iPhone/iPad, please follow these instructions:
                  </p>
                  <ol className="list-decimal list-inside space-y-3 font-medium">
                    <li>
                      Tap the <span className="text-indigo-400 font-bold">Share button</span> (the rectangle with an arrow pointing up) at the bottom of Safari.
                    </li>
                    <li>
                      Scroll down the list of options and tap <span className="text-indigo-400 font-bold">"Add to Home Screen"</span>.
                    </li>
                    <li>
                      Tap <span className="text-amber-400 font-bold">"Add"</span> at the top-right corner of the screen to complete installation.
                    </li>
                  </ol>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => setShowIosInstructions(false)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
        
        {/* First Load Loading Screen Overlay */}
        <AnimatePresence>
          {isFirstLoad && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-2xl animate-fade-in"
            >
              <div className="flex flex-col items-center gap-6 text-center select-none max-w-sm px-6">
                {/* Rotating detailed magic circle */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="absolute w-full h-full text-indigo-500/30 animate-spin-slow" viewBox="0 0 100 100" style={{ animationDuration: '10s' }}>
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                  <svg className="absolute w-full h-full text-indigo-400/60 animate-spin-slow" viewBox="0 0 100 100" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="15 8" />
                  </svg>
                  <svg className="absolute w-full h-full text-pink-400 drop-shadow-[0_0_12px_rgba(244,114,182,0.6)] animate-spin-slow" viewBox="0 0 100 100" style={{ animationDuration: '4s' }}>
                    {/* Inner elemental geometric star (heptagram / double triangle) */}
                    <path d="M 50,18 L 78,74 L 22,74 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
                    <path d="M 50,82 L 78,26 L 22,26 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
                    <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="50 5" opacity="0.5" />
                  </svg>
                  {/* Central glowing core node */}
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 animate-pulse shadow-[0_0_20px_rgba(129,140,248,0.8)] z-10" />
                </div>

                <div className="space-y-4 w-full">
                  {/* Dynamic Status Text */}
                  <div className="h-6 flex items-center justify-center">
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] pl-[0.25em] text-indigo-300 drop-shadow-[0_0_10px_rgba(129,140,248,0.4)] animate-pulse font-mono">
                      {loadProgress < 15 && "🌌 INITIALIZING AETHER CORE..."}
                      {loadProgress >= 15 && loadProgress < 30 && "🔥 SYNCING PYRO REGISTERS..."}
                      {loadProgress >= 30 && loadProgress < 45 && "💧 STABILIZING HYDRO CATALYST..."}
                      {loadProgress >= 45 && loadProgress < 60 && "⚡ CHARGING ELECTRO CHANNELS..."}
                      {loadProgress >= 60 && loadProgress < 75 && "🍃 ALIGNING ANEMO VORTEX..."}
                      {loadProgress >= 75 && loadProgress < 90 && "❄️ CONDENSING CRYO MATRIX..."}
                      {loadProgress >= 90 && "✨ ALIGNING LEYLINES..."}
                    </p>
                  </div>

                  {/* High quality glowing progress bar */}
                  <div className="relative w-64 mx-auto">
                    <div className="w-full h-1.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden p-[1px]">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                        style={{ width: `${loadProgress}%` }}
                      />
                    </div>
                    {/* Glowing end node tip */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#fff,0_0_20px_#a855f7] transition-all duration-150 ease-out pointer-events-none"
                      style={{ left: `calc(${loadProgress}% - 6px)` }}
                    />
                  </div>

                  {/* Percentage counter */}
                  <div className="text-[9px] font-bold tracking-[0.3em] pl-[0.3em] text-slate-400 font-mono">
                    CONNECTING MATRIX {loadProgress}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative antialiased leading-normal overflow-x-hidden">
      {/* Immersive Game World Backdrop Simulation gradients */}
      <div className={`absolute inset-0 bg-gradient-to-b ${activeUiTheme.backdropClass} pointer-events-none`} />
      <div className={`absolute top-0 right-1/4 w-[600px] h-[400px] ${activeUiTheme.orbOneClass} rounded-full blur-[130px] pointer-events-none`} />
      <div className={`absolute bottom-10 left-1/4 w-[500px] h-[300px] ${activeUiTheme.orbTwoClass} rounded-full blur-[120px] pointer-events-none`} />

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
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md px-6 py-3 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-xl transition-colors duration-300 ${activeUiTheme.headerClass}`}>
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
                ELEMENTAL BATTLEGROUND
              </h1>
              <span className="text-[8px] bg-amber-400/10 text-amber-300 border border-amber-300/20 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                v1.2.0 LIVE
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">Dawning Elements • RTS Action Core Engine</p>
          </div>
        </div>

        {/* Global HUD Stats: Client Data, Active FPS, Live Latency */}
        <div className="flex flex-row flex-nowrap overflow-x-auto scrollbar-none items-center justify-center lg:justify-start gap-1.5 md:gap-2.5 w-full lg:w-auto py-1 text-xs select-none">
          
          {/* Functional Dynamic FPS Display */}
          <div className={`backdrop-blur-md px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg border flex items-center gap-1 md:gap-2 shrink-0 ${activeUiTheme.pillClass}`}>
            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-current animate-pulse"></span>
            <span className="text-[9px] md:text-[10px] font-mono font-black tracking-wider uppercase">
              FPS: {fps}
            </span>
          </div>

          {/* Connection Latency Pill */}
          <div className="bg-black/45 backdrop-blur-md px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-white/10 flex items-center gap-1 md:gap-2 shrink-0">
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-400"></div>
            <span className="text-[9px] md:text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              {latency}ms<span className="hidden md:inline"> Stable</span>
            </span>
          </div>

          {/* Player profile quick status */}
          <div className={`hidden md:flex border px-3 py-1.5 rounded-lg flex-col items-start justify-center min-w-[145px] shrink-0 ${activeUiTheme.panelClass}`}>
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
          <div className="flex items-center gap-1 md:gap-1.5 p-1 px-2 md:px-3 rounded-lg bg-black/40 border border-white/15 shrink-0">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline text-slate-400 font-mono text-[10px] uppercase">Mora:</span>
            <span className="font-black text-amber-305 font-mono text-[10px] md:text-[11px] text-amber-400">{saveState.mora.toLocaleString()}</span>
          </div>

          {/* Aether Gems */}
          <div className={`flex items-center gap-1 md:gap-1.5 p-1 px-2 md:px-3 rounded-lg border shrink-0 ${activeUiTheme.pillClass}`}>
            <Sparkles className={`w-3.5 h-3.5 ${activeUiTheme.iconClass}`} />
            <span className="hidden md:inline text-slate-400 font-mono text-[10px] uppercase">Gems:</span>
            <span className="font-black font-mono text-[10px] md:text-[11px]">{saveState.aetherGems.toLocaleString()}</span>
          </div>

          {/* Global Quick Quest Claim Button */}
          {saveState.activeQuests.filter(q => q.completed).length > 0 && (
            <button
              onClick={() => {
                claimAllQuestRewards();
              }}
              className="p-1 md:p-1.5 px-2 md:px-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 rounded-lg text-[9px] md:text-[10px] uppercase font-black tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1 md:gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.2)] text-emerald-350 font-sans shrink-0"
              title="Quick Claim All Completed Quests"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span className="hidden md:inline">Claim Quests </span>
              <span className="md:hidden">Claim </span>
              ({saveState.activeQuests.filter(q => q.completed).length})
            </button>
          )}

          {/* ENHANCED SETTINGS TRIGGER */}
          <button 
            type="button"
            onClick={() => {
              setShowSettingsModal(true);
              AetheriaAudioEngine.playClick();
            }}
            className={`p-1 md:p-1.5 px-2 md:px-3 border rounded-lg text-[9px] md:text-[10px] uppercase font-black tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-md text-white font-sans shrink-0 ${activeUiTheme.panelClass}`}
            title="Settings Panel"
          >
            <LayoutGrid className={`w-3.5 h-3.5 ${activeUiTheme.iconClass}`} />
            <span className="hidden md:inline">Settings Panel</span>
          </button>

          {!isMobile && (
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
              className="p-1 md:p-1.5 px-2 md:px-2.5 bg-slate-900 border border-white/10 hover:border-amber-500/40 rounded-lg text-[9px] md:text-[10px] uppercase font-black tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-md hover:shadow-amber-500/10 text-white font-sans shrink-0"
            >
              {isFullscreen
                ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          )}
        </div>
      </header>

      {/* Primary Dashboard layout */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Main screens container (takes 3 grid cells) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Main Action tab selectors */}
          <div className={`flex md:flex-wrap overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal scrollbar-custom-tabs backdrop-blur-md border p-2 rounded-xl w-full gap-1 ${activeUiTheme.panelClass}`}>
            <button
              onClick={() => {
                setActiveScreen('wiki');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 md:flex-initial cursor-pointer ${
                activeScreen === 'wiki'
                  ? activeUiTheme.activeNavClass
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              id="dash_screen_wiki"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-slate-955 text-slate-950" />
              <span className="hidden md:inline">{t('lore_wiki', language)}</span>
              <span className="md:hidden">Wiki</span>
            </button>

            <button
              onClick={() => {
                setActiveScreen('story');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 md:flex-initial cursor-pointer ${
                activeScreen === 'story'
                  ? `${activeUiTheme.activeNavClass} font-black`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-black'
              }`}
              id="dash_screen_story"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-slate-955 text-slate-950" />
              <span className="hidden md:inline">Story Campaign</span>
              <span className="md:hidden">Story</span>
            </button>

            <button
              onClick={() => {
                setActiveScreen('arena');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 md:flex-initial cursor-pointer ${
                activeScreen === 'arena'
                  ? `${activeUiTheme.activeNavClass} font-black`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-black'
              }`}
              id="dash_screen_arena"
            >
              <Sword className="w-3.5 h-3.5 shrink-0 animate-pulse text-slate-955 text-slate-950" />
              <span className="hidden md:inline">{t('combat_arena', language)}</span>
              <span className="md:hidden">Arena</span>
            </button>

            {isDungeonLocked ? (
              <button
                type="button"
                onClick={() => {
                  AetheriaAudioEngine.playClick();
                  showInGameAlert(
                    "Reach Player Level 10 to unlock Rogue Dungeon.",
                    `Progress: Level ${saveState.playerLevel || 1} / 10`,
                    "error"
                  );
                }}
                className="relative p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer bg-slate-900/30 border border-slate-800/80 text-slate-500 hover:bg-slate-900/40 hover:text-slate-450 flex flex-col md:flex-row items-center justify-center gap-1.5 shrink-0 md:flex-initial"
                title={`Unlocks at Player Level 10 (Current: Level ${saveState.playerLevel || 1}/10)`}
              >
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-red-500/70" />
                  <span className="hidden md:inline">{t('rogue_ruins', language)}</span>
                  <span className="md:hidden">Rogue</span>
                </div>
                {/* Lock icon/overlay text */}
                <span className="absolute -bottom-2 bg-slate-950/95 border border-red-500/20 text-red-400 text-[6px] font-mono px-1.5 py-0.5 rounded uppercase tracking-tighter whitespace-nowrap z-10 scale-90">
                  Unlocks at Player Level 10
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveScreen('dungeon');
                  AetheriaAudioEngine.playClick();
                }}
                className={`p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 md:flex-initial cursor-pointer ${
                  activeScreen === 'dungeon'
                    ? `${activeUiTheme.activeNavClass} font-black`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-black'
                }`}
                id="dash_screen_dungeon"
              >
                <Landmark className={`w-3.5 h-3.5 shrink-0 ${activeScreen === 'dungeon' ? 'text-slate-955' : 'text-violet-400 animate-pulse'}`} />
                <span className="hidden md:inline">{t('rogue_ruins', language)}</span>
                <span className="md:hidden">Rogue</span>
              </button>
            )}

            {isWishLocked ? (
              <button
                type="button"
                onClick={() => {
                  AetheriaAudioEngine.playClick();
                  showInGameAlert(
                    "Reach Player Level 5 to unlock Celestial Summons.",
                    `Progress: Level ${saveState.playerLevel || 1} / 5`,
                    "error"
                  );
                }}
                className="relative p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer bg-slate-900/30 border border-slate-800/80 text-slate-500 hover:bg-slate-900/40 hover:text-slate-450 flex flex-col md:flex-row items-center justify-center gap-1.5 shrink-0 md:flex-initial"
                title={`Unlocks at Player Level 5 (Current: Level ${saveState.playerLevel || 1}/5)`}
              >
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-red-500/70" />
                  <span className="hidden md:inline">{t('celestial_summons', language)}</span>
                  <span className="md:hidden">Wish</span>
                </div>
                {/* Lock icon/overlay text */}
                <span className="absolute -bottom-2 bg-slate-950/95 border border-red-500/20 text-red-400 text-[6px] font-mono px-1.5 py-0.5 rounded uppercase tracking-tighter whitespace-nowrap z-10 scale-90">
                  Unlocks at Player Level 5
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveScreen('wish');
                  AetheriaAudioEngine.playClick();
                }}
                className={`p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 md:flex-initial cursor-pointer ${
                  activeScreen === 'wish'
                    ? `${activeUiTheme.activeNavClass} font-black`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-black'
                }`}
                id="dash_screen_wish"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-slate-955 text-slate-950" />
                <span className="hidden md:inline">{t('celestial_summons', language)}</span>
                <span className="md:hidden">Wish</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveScreen('inventory');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 md:flex-initial cursor-pointer ${
                activeScreen === 'inventory'
                  ? `${activeUiTheme.activeNavClass} font-black`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              id="dash_screen_inventory"
            >
              <Hammer className="w-3.5 h-3.5 shrink-0 text-slate-955 text-slate-950" />
              <span className="hidden md:inline">{t('forge_ascension', language)}</span>
              <span className="md:hidden">Forge</span>
            </button>

            <button
              onClick={() => {
                setActiveScreen('quest');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 md:flex-initial cursor-pointer ${
                activeScreen === 'quest'
                  ? `${activeUiTheme.activeNavClass} font-black`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-black'
              }`}
              id="dash_screen_quest"
            >
              <Trophy className="w-3.5 h-3.5 shrink-0 text-slate-955 text-slate-950" />
              <span className="hidden md:inline">{t('quest_log', language)}</span>
              <span className="md:hidden">Quest</span>
            </button>

            <button
              onClick={() => {
                setActiveScreen('party');
                AetheriaAudioEngine.playClick();
              }}
              className={`p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 md:flex-initial cursor-pointer ${
                activeScreen === 'party'
                  ? `${activeUiTheme.activeNavClass} font-black`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-black'
              }`}
              id="dash_screen_party"
            >
              <Users className="w-3.5 h-3.5 shrink-0 text-slate-955 text-slate-950" />
              <span className="hidden md:inline">{t('party_setup', language)}</span>
              <span className="md:hidden">Party</span>
            </button>

            {isShopLocked ? (
              <button
                type="button"
                onClick={() => {
                  AetheriaAudioEngine.playClick();
                  showInGameAlert(
                    "Reach Player Level 5 to unlock the Gems Shop.",
                    `Progress: Level ${saveState.playerLevel || 1} / 5`,
                    "error"
                  );
                }}
                className="relative p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer bg-slate-900/30 border border-slate-800/80 text-slate-500 hover:bg-slate-900/40 hover:text-slate-455 flex flex-col md:flex-row items-center justify-center gap-1.5 shrink-0 md:flex-initial"
                title={`Unlocks at Player Level 5 (Current: Level ${saveState.playerLevel || 1}/5)`}
              >
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-red-500/70" />
                  <span className="hidden md:inline">Gems Shop</span>
                  <span className="md:hidden">Shop</span>
                </div>
                <span className="absolute -bottom-2 bg-slate-950/95 border border-red-500/20 text-red-400 text-[6px] font-mono px-1.5 py-0.5 rounded uppercase tracking-tighter whitespace-nowrap z-10 scale-90">
                  Unlocks at Player Level 5
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveScreen('shop');
                  AetheriaAudioEngine.playClick();
                }}
                className={`p-2 px-1.5 text-[10.5px] md:text-xs md:p-2.5 md:px-5 font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 md:flex-initial cursor-pointer ${
                  activeScreen === 'shop'
                    ? `${activeUiTheme.activeNavClass} font-black`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-black'
                }`}
                id="dash_screen_shop"
              >
                <Coins className="w-3.5 h-3.5 shrink-0 text-slate-955 text-slate-955 text-slate-950" />
                <span className="hidden md:inline">Gems Shop</span>
                <span className="md:hidden">Shop</span>
              </button>
            )}
          </div>

          {/* Actual screens swap frame */}
          <div className="flex-1 justify-between flex flex-col">
            <AnimatePresence mode="wait">
              {activeScreen === 'shop' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  key="shop_scr"
                  className="w-full"
                >
                  <GemsShop 
                    saveState={saveState}
                    onUpdateSaveState={handleUpdateSaveState}
                    onShowAlert={showInGameAlert}
                  />
                </motion.div>
              )}

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
                    inventoryWeapons={saveState.inventoryWeapons || []}
                    inventoryArtifacts={saveState.inventoryArtifacts || []}
                    language={language}
                    unlockedLoreEntries={saveState.storyProgress?.unlockedLoreEntries || []}
                    completedCharacterStoryActs={saveState.storyProgress?.completedCharacterStoryActs || {}}
                    initialTab={wikiInitialTab}
                    initialCharacterId={wikiInitialCharId}
                    initialWeaponName={wikiInitialWeaponName}
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
                  className={isMobile ? "fixed inset-0 z-50 w-screen h-screen bg-slate-950 overflow-hidden flex flex-col min-h-0" : ""}
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
                    onExitToWiki={() => setActiveScreen('wiki')}
                    onAddItems={handleAddItems}
                    devCheatsEnabled={devCheatsEnabled}
                    playerLevel={saveState.playerLevel || 1}
                    screenShakeEnabled={screenShakeEnabled}
                    combatSpeed={combatSpeed}
                    fpsLimit={fpsLimit}
                    language={language}
                    inventoryArtifacts={saveState.inventoryArtifacts || []}
                    characterEquippedArtifacts={saveState.characterEquippedArtifacts || {}}
                    onAwardArtifact={handleAwardArtifact}
                    activeDamageSkin={saveState.activeDamageSkin || 'Default'}
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
                    onExitToWiki={() => setActiveScreen('wiki')}
                    onAddItems={handleAddItems}
                    devCheatsEnabled={devCheatsEnabled}
                    playerLevel={saveState.playerLevel || 1}
                    screenShakeEnabled={screenShakeEnabled}
                    combatSpeed={combatSpeed}
                    fpsLimit={fpsLimit}
                    language={language}
                    activeDamageSkin={saveState.activeDamageSkin || 'Default'}
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
                    inventoryWeapons={saveState.inventoryWeapons || []}
                    characterPortraits={saveState.characterPortraits || {}}
                    bannerPity5Star={saveState.bannerPity5Star || {}}
                    bannerPity4Star={saveState.bannerPity4Star || {}}
                    bannerGuaranteed5Star={saveState.bannerGuaranteed5Star || {}}
                    onUpdatePity={(bid, p5, p4, g5) => handleUpdatePity(bid, p5, p4, g5)}
                    onLogPulls={(items) => handleLogPulls(items)}
                    pullHistoryList={pullHistory}
                    onShowAlert={(msg, sol, typ) => showInGameAlert(msg, sol, typ)}
                    devCheatsEnabled={devCheatsEnabled}
                    language={language}
                    onNavigateToWikiChar={(charId) => {
                      setWikiInitialTab('characters');
                      setWikiInitialCharId(charId);
                      setActiveScreen('wiki');
                    }}
                    onNavigateToWikiWeapon={(weapName) => {
                      setWikiInitialTab('weapons');
                      setWikiInitialWeaponName(weapName);
                      setActiveScreen('wiki');
                    }}
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
                    ownedCharacterIds={saveState.unlockedCharacterIds || []}
                    characterLevels={saveState.characterLevels}
                    inventoryWeapons={saveState.inventoryWeapons || []}
                    inventoryItems={saveState.inventoryItems || []}
                    characterEquippedWeapon={saveState.characterEquippedWeapon || {}}
                    characterPortraits={saveState.characterPortraits || {}}
                    mora={saveState.mora}
                    aetherGems={saveState.aetherGems}
                    onEquipWeapon={(cid, wid) => handleEquipWeapon(cid, wid)}
                    onLevelUpCharacter={handleLevelUpCharacter}
                    onUpgradeWeapon={(wuid) => handleUpgradeWeapon(wuid)}
                    onAddItems={handleAddItems}
                    onShowAlert={(msg, sol, typ) => showInGameAlert(msg, sol, typ)}
                    onModifyCurrencies={(g, m) => handleModifyCurrencies(g, m)}
                    devCheatsEnabled={devCheatsEnabled}
                    language={language}
                    inventoryArtifacts={saveState.inventoryArtifacts || []}
                    characterEquippedArtifacts={saveState.characterEquippedArtifacts || {}}
                    onEquipArtifact={handleEquipArtifact}
                    onLockArtifact={handleLockArtifact}
                    onDeleteArtifact={handleDeleteArtifact}
                    onAwardArtifacts={handleAwardArtifacts}
                    onFuseArtifacts={handleFuseArtifacts}
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

              {activeScreen === 'party' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  key="party_scr"
                  className="w-full"
                >
                  <div className="bg-[#0b0f19]/70 border border-white/10 p-6 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-2 font-display">
                          <Users className="w-4 h-4 text-[#10b981]" />
                          {t('party_setup', language)} ({saveState.partyIds.length}/4)
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Deploy up to 4 heroes to sync elemental reaction triggers inside the active arena.
                        </p>
                      </div>


                    </div>

                    {/* Element, Weapon Class & Rarity Filter Panel */}
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-slate-950/40 border border-white/10 p-4 rounded-xl shadow-inner">
                      {/* Element Filters */}
                      <div className="space-y-2 w-full xl:w-auto">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">Filter by Element:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {['All', 'Pyro', 'Hydro', 'Cryo', 'Electro', 'Anemo', 'Geo', 'Dendro'].map((el) => {
                            let colorClass = 'bg-slate-900/50 border-white/5 text-slate-450 hover:bg-slate-800 hover:text-slate-200';
                            if (partyElementFilter === el) {
                              if (el === 'All') colorClass = 'bg-indigo-500/80 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.35)]';
                              else if (el === 'Pyro') colorClass = 'bg-red-950/80 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.35)]';
                              else if (el === 'Hydro') colorClass = 'bg-blue-950/80 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.35)]';
                              else if (el === 'Cryo') colorClass = 'bg-sky-950/80 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)]';
                              else if (el === 'Electro') colorClass = 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)]';
                              else if (el === 'Anemo') colorClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.35)]';
                              else if (el === 'Geo') colorClass = 'bg-amber-950/80 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]';
                              else if (el === 'Dendro') colorClass = 'bg-green-950/80 border-green-500 text-green-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]';
                            }
                            return (
                              <button
                                key={el}
                                onClick={() => {
                                  AetheriaAudioEngine.playClick();
                                  setPartyElementFilter(el as any);
                                }}
                                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer select-none active:scale-95 ${colorClass}`}
                              >
                                {el}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Weapon Type Filters */}
                      <div className="space-y-2 w-full xl:w-auto">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">Filter by Weapon:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {['All', 'Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'].map((wp) => {
                            const isSelected = partyWeaponFilter === wp;
                            return (
                              <button
                                key={wp}
                                onClick={() => {
                                  AetheriaAudioEngine.playClick();
                                  setPartyWeaponFilter(wp as any);
                                }}
                                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer select-none active:scale-95 ${
                                  isSelected 
                                    ? 'bg-amber-400/90 border-amber-300 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.35)]' 
                                    : 'bg-slate-900/50 border-white/5 text-slate-450 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                              >
                                {wp}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Rarity Filters */}
                      <div className="space-y-2 w-full xl:w-auto">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">Filter by Rarity:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { value: 'All', label: 'All' },
                            { value: 5, label: '5★' },
                            { value: 4, label: '4★' },
                            { value: 3, label: '3★' }
                          ].map((item) => {
                            const isSelected = partyRarityFilter === item.value;
                            let colorClass = 'bg-slate-900/50 border-white/5 text-slate-450 hover:bg-slate-800 hover:text-slate-200';
                            if (isSelected) {
                              if (item.value === 'All') colorClass = 'bg-indigo-500/80 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.35)]';
                              else if (item.value === 5) colorClass = 'bg-amber-950/80 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]';
                              else if (item.value === 4) colorClass = 'bg-purple-950/80 border-purple-500 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]';
                              else if (item.value === 3) colorClass = 'bg-blue-950/80 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.35)]';
                            }
                            return (
                              <button
                                key={item.label}
                                onClick={() => {
                                  AetheriaAudioEngine.playClick();
                                  setPartyRarityFilter(item.value as any);
                                }}
                                className={`px-3.5 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer select-none active:scale-95 ${colorClass}`}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Elemental Resonances (Team Bonuses) Section */}
                    <div className="bg-slate-950/40 border border-white/10 p-4.5 rounded-xl space-y-4 shadow-inner">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active Resonance Bonuses
                        </span>
                        {partyResonances.length > 0 ? (
                          <div className="flex gap-2.5 flex-wrap">
                            {partyResonances.map(res => (
                              <div 
                                key={res.key}
                                className="flex flex-col p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/25 text-left font-mono shadow-sm animate-fadeIn"
                              >
                                <span className="text-[10.5px] font-black text-emerald-400 flex items-center gap-1 uppercase">
                                  ✨ {res.name}
                                </span>
                                <span className="text-[9.5px] text-slate-300 mt-1">{res.desc}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-450 italic font-mono uppercase bg-black/20 p-3 rounded-lg border border-white/5 select-none">
                            No active resonances. Deploy 2 heroes of the same element or 4 unique elements to unlock team bonus matrix.
                          </div>
                        )}
                      </div>

                      {/* Active Artifact Set Effects */}
                      <div className="border-t border-white/5 pt-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          Active Artifact Set Effects
                        </span>
                        {activePartyArtifactSets.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {activePartyArtifactSets.map(item => (
                              <div key={item.charId} className="bg-black/25 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
                                <div className="text-[10px] font-black text-amber-400 font-mono uppercase tracking-wide flex items-center gap-1">
                                  👤 {item.charName}
                                </div>
                                <div className="flex flex-col gap-1 pl-3.5 border-l border-white/10">
                                  {item.activeSets.map((set, idx) => (
                                    <div key={idx} className="text-[9.5px] font-mono text-slate-200">
                                      <span className="text-amber-500 font-bold">{set.setName} ({set.pieces}-Pc):</span> {set.desc}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-455 italic font-mono uppercase bg-black/20 p-3 rounded-lg border border-white/5 select-none">
                            No active artifact set effects on deployed heroes. Equip 2 or 4 artifacts of the same set in Roster &rarr; Artifacts to activate.
                          </div>
                        )}
                      </div>

                      {/* Artifact Set Sheet (Reference) */}
                      <div className="border-t border-white/5 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            AetheriaAudioEngine.playClick();
                            setShowArtifactSheet(!showArtifactSheet);
                          }}
                          className="text-[10.5px] font-black uppercase text-amber-400 hover:text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer font-mono select-none"
                        >
                          {showArtifactSheet ? '📖 Hide Artifact Set Sheet' : '📖 View Artifact Set Sheet'}
                        </button>
                        
                        {showArtifactSheet && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3.5 animate-fadeIn">
                            {[
                              { 
                                name: "Vanguard's Valor", 
                                desc2: ARTIFACT_SETS.Vanguard.desc2pc, 
                                desc4: ARTIFACT_SETS.Vanguard.desc4pc, 
                                color: 'border-rose-500/20 text-rose-400 bg-rose-500/5' 
                              },
                              { 
                                name: "Guardian's Grace", 
                                desc2: ARTIFACT_SETS.Guardian.desc2pc, 
                                desc4: ARTIFACT_SETS.Guardian.desc4pc, 
                                color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                              },
                              { 
                                name: "Celestial Catalyst", 
                                desc2: ARTIFACT_SETS.Celestial.desc2pc, 
                                desc4: ARTIFACT_SETS.Celestial.desc4pc, 
                                color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5' 
                              },
                              { 
                                name: "Chrono Attunement", 
                                desc2: ARTIFACT_SETS.Chrono.desc2pc, 
                                desc4: ARTIFACT_SETS.Chrono.desc4pc, 
                                color: 'border-sky-500/20 text-sky-400 bg-sky-500/5' 
                              }
                            ].map(set => (
                              <div key={set.name} className={`p-3 rounded-xl border ${set.color} text-left font-mono flex flex-col justify-between shadow-sm`}>
                                <div className="text-[10px] font-black uppercase tracking-tight">
                                  🛡️ {set.name}
                                </div>
                                <div className="text-[9px] text-slate-300 mt-2 space-y-1 leading-relaxed font-sans font-medium">
                                  <div><span className="font-extrabold text-amber-400 font-mono">2-Pc:</span> {set.desc2}</div>
                                  <div><span className="font-extrabold text-amber-500 font-mono">4-Pc:</span> {set.desc4}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-white/5 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            AetheriaAudioEngine.playClick();
                            setShowResonanceSheet(!showResonanceSheet);
                          }}
                          className="text-[10.5px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1.5 cursor-pointer font-mono select-none"
                        >
                          {showResonanceSheet ? '📖 Hide Elemental Resonance Sheet' : '📖 View Elemental Resonance Sheet'}
                        </button>
                        
                        {showResonanceSheet && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3.5 animate-fadeIn">
                            {[
                              { name: 'Fervent Flames (2 Pyro)', desc: '+15% ATK boost.', element: 'Pyro', color: 'border-red-500/20 text-red-400 bg-red-500/5' },
                              { name: 'Soothing Waters (2 Hydro)', desc: '+20% Energy Recharge rate boost.', element: 'Hydro', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
                              { name: 'Shattering Ice (2 Cryo)', desc: '+15% Crit Rate against Frozen/Cryo targets.', element: 'Cryo', color: 'border-sky-500/20 text-sky-400 bg-sky-500/5' },
                              { name: 'High Voltage (2 Electro)', desc: '-20% Skill Cooldown reduction.', element: 'Electro', color: 'border-purple-500/20 text-purple-400 bg-purple-500/5' },
                              { name: 'Enduring Rock (2 Geo)', desc: '+15% Shield Strength and +15% DMG when shielded.', element: 'Geo', color: 'border-amber-500/20 text-amber-400 bg-amber-500/5' },
                              { name: 'Impetuous Winds (2 Anemo)', desc: '+15% Move Speed and -15% Skill cooldown.', element: 'Anemo', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
                              { name: 'Sprawling Greenery (2 Dendro)', desc: '+50 Elemental Mastery.', element: 'Dendro', color: 'border-green-500/20 text-green-400 bg-green-500/5' },
                              { name: 'Protective Canopy (4 Unique)', desc: '+15% All Elemental/Physical DMG.', element: 'Unique', color: 'border-slate-550/20 text-slate-350 bg-slate-800/10' }
                            ].map(res => (
                              <div key={res.name} className={`p-3 rounded-xl border ${res.color} text-left font-mono flex flex-col justify-between shadow-sm`}>
                                <div className="text-[10px] font-black uppercase tracking-tight">
                                  {res.name}
                                </div>
                                <div className="text-[9.2px] text-slate-300 mt-1.5 leading-relaxed font-sans font-medium">
                                  {res.desc}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-white/5 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            AetheriaAudioEngine.playClick();
                            setShowReactionsModal(true);
                          }}
                          className="text-[10.5px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1.5 cursor-pointer font-mono select-none"
                        >
                          🧪 View Elemental Reaction Cheat Sheet
                        </button>
                      </div>

                      {/* Active Damage Skin Selector */}
                      <div className="border-t border-white/5 pt-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono mb-2.5 flex items-center gap-1.5 select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                          Equipped Damage Skin
                        </span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                          {/* Default Skin */}
                          <button
                            onClick={() => {
                              AetheriaAudioEngine.playClick();
                              triggerSaveUpdate(prev => ({ ...prev, activeDamageSkin: 'Default' }));
                            }}
                            className={`p-2 rounded-lg border text-center font-mono flex flex-col items-center justify-between transition-all select-none ${
                              (saveState.activeDamageSkin || 'Default') === 'Default'
                                ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                                : 'border-white/10 bg-black/40 hover:bg-black/60 cursor-pointer'
                            }`}
                          >
                            <span className="text-[8px] font-bold uppercase tracking-tight text-slate-500">
                              Default
                            </span>
                            <span className="text-xs font-black text-white my-1 drop-shadow">
                              1000
                            </span>
                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">
                              {(saveState.activeDamageSkin || 'Default') === 'Default' ? 'Equipped' : 'Equip'}
                            </span>
                          </button>

                          {DAMAGE_SKINS.map(skin => {
                            const isUnlocked = (saveState.unlockedDamageSkins || ['Default']).includes(skin.id);
                            const isActive = (saveState.activeDamageSkin || 'Default') === skin.id;
                            
                            let rarityColor = 'text-slate-400';
                            let borderGlow = 'border-white/5 bg-black/20';
                            if (skin.rarity === 'Legendary') {
                              rarityColor = 'text-amber-400';
                            } else if (skin.rarity === 'Rare') {
                              rarityColor = 'text-purple-400';
                            } else if (skin.rarity === 'Common') {
                              rarityColor = 'text-blue-400';
                            }

                            if (isActive) {
                              borderGlow = 'border-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.25)]';
                            } else if (isUnlocked) {
                              borderGlow = 'border-white/10 bg-black/40 hover:bg-black/60 cursor-pointer';
                            } else {
                              borderGlow = 'border-white/5 bg-black/10 opacity-40';
                            }

                            return (
                              <button
                                key={skin.id}
                                disabled={!isUnlocked}
                                onClick={() => {
                                  if (isUnlocked) {
                                    AetheriaAudioEngine.playClick();
                                    triggerSaveUpdate(prev => ({
                                      ...prev,
                                      activeDamageSkin: skin.id
                                    }));
                                  }
                                }}
                                className={`p-2 rounded-lg border text-center font-mono flex flex-col items-center justify-between transition-all select-none ${borderGlow}`}
                              >
                                <span className="text-[8px] font-bold uppercase tracking-tight text-slate-500">
                                  {skin.name}
                                </span>
                                <span className="text-xs font-black text-white my-1 drop-shadow">
                                  {skin.display}
                                </span>
                                <span className={`text-[7px] font-black uppercase tracking-widest ${rarityColor}`}>
                                  {isUnlocked ? (isActive ? 'Equipped' : 'Equip') : 'Locked'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div className="border-t border-white/5 pt-4">
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={partySearchQuery}
                            onChange={(e) => setPartySearchQuery(e.target.value)}
                            placeholder={t('search_placeholder', language)}
                            className="w-full bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all uppercase tracking-wide font-mono font-bold"
                          />
                          {partySearchQuery && (
                            <button
                              onClick={() => setPartySearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[10px] font-black cursor-pointer"
                            >
                              x
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            AetheriaAudioEngine.playClick();
                            triggerSaveUpdate(prev => ({ ...prev, partyIds: [] }));
                          }}
                          disabled={saveState.partyIds.length === 0}
                          className={`w-full p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            saveState.partyIds.length === 0
                              ? 'bg-slate-950/30 border-white/5 text-slate-600 cursor-not-allowed'
                              : 'bg-red-500/10 border-red-500/35 text-red-300 hover:bg-red-500/20 hover:border-red-400 cursor-pointer'
                          }`}
                        >
                          Unequip All Heroes From Party
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[50vh] sm:max-h-none overflow-y-auto p-1">
                      {(() => {
                        const ownedCharacters = PLAYABLE_CHARACTERS.filter(c => (saveState.unlockedCharacterIds || []).includes(c.id));
                        const sortedOwnedCharacters = [...ownedCharacters].sort((a, b) => {
                          const levelA = saveState.characterLevels[a.id] || 1;
                          const levelB = saveState.characterLevels[b.id] || 1;
                          if (levelB !== levelA) {
                            return levelB - levelA; // highest level character first
                          }
                          return b.rarity - a.rarity; // then only rarity
                        });

                        const filteredCharacters = sortedOwnedCharacters.filter(c => {
                          const query = partySearchQuery.toLowerCase();
                          const matchesQuery = query === '' || 
                                               c.name.toLowerCase().includes(query) ||
                                               c.element.toLowerCase().includes(query) ||
                                               c.weaponType.toLowerCase().includes(query);
                          const matchesElement = partyElementFilter === 'All' || c.element === partyElementFilter;
                          const matchesWeapon = partyWeaponFilter === 'All' || c.weaponType === partyWeaponFilter;
                          const matchesRarity = partyRarityFilter === 'All' || c.rarity === partyRarityFilter;
                          return matchesQuery && matchesElement && matchesWeapon && matchesRarity;
                        });

                        if (filteredCharacters.length === 0) {
                          return (
                            <div className="col-span-full text-center py-10 text-slate-500 text-xs italic font-mono uppercase">
                              No matching characters found in roster.
                            </div>
                          );
                        }

                        return filteredCharacters.map(c => {
                          const isChecked = saveState.partyIds.includes(c.id);
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
                              className={`p-4 rounded-xl border text-left flex flex-col justify-between min-h-[110px] h-auto transition-all relative overflow-hidden cursor-pointer ${
                                isChecked
                                  ? 'bg-[#0f172a] border-amber-400 text-white shadow-[0_0_18px_rgba(251,191,36,0.2)] ring-1 ring-amber-400/30'
                                  : 'bg-black/35 border-white/5 text-slate-400 hover:border-white/15'
                              }`}
                            >
                              {isChecked && (
                                <span className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-black text-[7.5px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  {t('active_hero', language)}
                                </span>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5 w-full justify-between pr-10">
                                  <span className="font-black text-[12px] truncate uppercase tracking-tight text-slate-100">{c.name}</span>
                                  <span className="bg-slate-800 border border-slate-700 text-amber-500 font-mono text-[8px] px-1.5 py-0.5 rounded leading-none shrink-0">LV.{charLvl}</span>
                                </div>
                                <div className="flex shrink-0 gap-0.5 mt-1 select-none">
                                  {Array.from({ length: c.rarity }).map((_, i) => (
                                    <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                                  ))}
                                </div>
                              </div>

                              <div className="mt-4 border-t border-white/5 pt-2 flex flex-col gap-0.5">
                                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase tracking-tight">
                                  <span className="font-bold text-indigo-400">{t(c.element, language)}</span>
                                  <span className="text-slate-400">{t(c.weaponType, language)} class</span>
                                </div>
                                {weaponObj ? (
                                  <div className="text-[8px] font-medium text-slate-300 truncate font-mono uppercase bg-black/45 px-1.5 py-0.5 rounded border border-white/5 mt-1 tracking-tighter">
                                    ⚙️ {weaponObj.name} (LV.{weaponObj.level})
                                  </div>
                                ) : (
                                  <div className="text-[8px] font-medium text-red-400/70 truncate font-mono uppercase bg-black/45 px-1.5 py-0.5 rounded border border-red-900/20 mt-1 tracking-tighter">
                                    ⚠️ {t('no_weapon', language)}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeScreen === 'story' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  key="story_scr"
                >
                  <StoryMode
                    saveState={saveState}
                    onModifyCurrencies={handleModifyCurrencies}
                    onAddItems={handleAddItems}
                    onUpdateSaveState={triggerSaveUpdate}
                    onStartStoryBattle={handleStartStoryBattle}
                    devCheatsEnabled={devCheatsEnabled}
                    onShowAlert={showInGameAlert}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side Column: Quest Tracker and stats summary (takes 1 cell) */}
        {!isMobile && (
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
                {t('party_setup', language)} ({saveState.partyIds.length}/4)
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
              {(() => {
                const ownedCharacters = PLAYABLE_CHARACTERS.filter(c => (saveState.unlockedCharacterIds || []).includes(c.id));
                const sortedOwnedCharacters = [...ownedCharacters].sort((a, b) => {
                  const levelA = saveState.characterLevels[a.id] || 1;
                  const levelB = saveState.characterLevels[b.id] || 1;
                  if (levelB !== levelA) {
                    return levelB - levelA; // highest level character first
                  }
                  return b.rarity - a.rarity; // then only rarity
                });

                const filtered = sortedOwnedCharacters.filter(c => {
                  const query = partySearchQuery.toLowerCase();
                  return c.name.toLowerCase().includes(query) ||
                         c.element.toLowerCase().includes(query) ||
                         c.weaponType.toLowerCase().includes(query);
                });

                if (filtered.length === 0) {
                  return (
                    <div className="col-span-2 text-center py-6 text-slate-500 text-[10px] italic font-mono uppercase">
                      No matches
                    </div>
                  );
                }

                return filtered.map(c => {
                  const isChecked = saveState.partyIds.includes(c.id);
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
                          <span className="font-bold text-indigo-400">{t(c.element, language)}</span>
                          <span>{t(c.weaponType, language)} class</span>
                        </div>
                        {weaponObj ? (
                          <div className="text-[8px] font-medium text-slate-300 truncate font-mono uppercase bg-black/45 px-1 py-0.5 rounded border border-white/5 mt-0.5 tracking-tighter">
                            ⚙️ {weaponObj.name} (LV.{weaponObj.level})
                          </div>
                        ) : (
                          <div className="text-[7.5px] text-slate-600 truncate font-mono italic mt-0.5">
                            {t('no_weapon', language)}
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
                });
              })()}
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
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Reactions Achieved</span>
                <span className="font-black text-sky-400 font-mono text-xs">{saveState.stats.reactionsTriggered || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Highest Story Unlocked</span>
                <span className="font-black text-indigo-400 font-mono text-xs">Stage {saveState.storyProgress?.currentStage || "1-1"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Summons Performed</span>
                <span className="font-black text-amber-500 font-mono text-xs">{saveState.stats.totalPulls || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Characters Owned</span>
                <span className="font-black text-emerald-400 font-mono text-xs">{(saveState.unlockedCharacterIds || []).length} / {PLAYABLE_CHARACTERS.length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Weapons Owned</span>
                <span className="font-black text-pink-400 font-mono text-xs">{(saveState.inventoryWeapons || []).length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Play Time</span>
                <span className="font-black text-slate-300 font-mono text-xs">{formatPlayTime(displayPlayTime)}</span>
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
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Highest Room Cleared</span>
                <span className="font-black text-purple-400 font-mono text-xs">Room {saveState.stats.highScoreRogueRoom || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="uppercase text-[9px] tracking-wider text-slate-500">Longest Login Streak</span>
                <span className="font-black text-emerald-400 font-mono text-xs">{(saveState.stats.longestLoginStreak || 1)} Days</span>
              </div>
            </div>
          </div>

        </div>
        )}

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
              className={`max-w-md w-full border rounded-2xl shadow-2xl relative flex flex-col ${activeUiTheme.panelClass}`}
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky header */}
              <div className="flex justify-between items-center border-b border-white/10 px-6 py-4 shrink-0">
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-display flex items-center gap-2">
                  <LayoutGrid className={`w-4 h-4 ${activeUiTheme.iconClass}`} />
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
                  <span className={`text-[9px] font-mono tracking-wider uppercase font-black block ${activeUiTheme.textClass}`}>SYSTEM HARDWARE CONTROLS</span>
                  
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
                      <span className={`font-mono font-bold ${activeUiTheme.textClass}`}>{bgmVolume}%</span>
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
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: activeUiTheme.accent }}
                    />
                  </div>

                  {/* SFX Volume Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-350 uppercase font-bold">
                      <span>SFX Volume</span>
                      <span className={`font-mono font-bold ${activeUiTheme.textClass}`}>{sfxVolume}%</span>
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
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: activeUiTheme.accent }}
                    />
                  </div>
                </div>

                {/* GENERAL PREFERENCES */}
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                  <span className={`text-[9px] font-mono tracking-wider uppercase font-black block ${activeUiTheme.textClass}`}>GENERAL PREFERENCES</span>
                  
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[11px] text-slate-300 uppercase font-bold">Developer Cheats</span>
                    <button
                      onClick={() => {
                        setDevCheatsEnabled(!devCheatsEnabled);
                        AetheriaAudioEngine.playClick();
                      }}
                      className={`p-1.5 px-3 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        devCheatsEnabled ? activeUiTheme.settingsButtonClass : 'bg-slate-800 text-slate-500 border border-white/5'
                      }`}
                    >
                      {devCheatsEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="space-y-2 border-b border-white/5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] text-slate-300 uppercase font-bold block">UI Theme</span>
                        <span className="text-[9px] text-slate-500">
                          Crimson, Emerald, Gold, and Void unlock at Player Level {UI_THEME_UNLOCK_LEVEL}.
                        </span>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-1 rounded uppercase border ${activeUiTheme.pillClass}`}>
                        {activeUiTheme.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {UI_THEMES.map(theme => {
                        const isUnlocked = isUiThemeUnlocked(theme.id, currentPlayerLevel);
                        const isActive = activeUiThemeId === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => handleSelectUiTheme(theme.id)}
                            className={`min-h-16 rounded-lg border p-2 text-left transition-all active:scale-95 cursor-pointer relative overflow-hidden ${
                              isActive
                                ? 'bg-white/10 border-white/40 shadow-[0_0_16px_rgba(255,255,255,0.10)]'
                                : isUnlocked
                                  ? 'bg-black/35 border-white/10 hover:border-white/30'
                                  : 'bg-slate-900/50 border-slate-800/80 opacity-70'
                            }`}
                          >
                            <span
                              className="absolute inset-x-0 top-0 h-1"
                              style={{ backgroundColor: theme.accent }}
                            />
                            <span className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-100">
                                {theme.label}
                              </span>
                              {!isUnlocked ? (
                                <Lock className="w-3 h-3 text-slate-500" />
                              ) : isActive ? (
                                <CheckCircle2 className="w-3 h-3" style={{ color: theme.accent }} />
                              ) : (
                                <Circle className="w-3 h-3 text-slate-600" />
                              )}
                            </span>
                            <span className="mt-2 flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: theme.accent }} />
                              <span className="text-[8px] font-mono uppercase text-slate-500">
                                {isUnlocked ? 'Available' : `LV ${theme.unlockLevel}`}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[11px] text-slate-300 uppercase font-bold">Screen Shake</span>
                    <button
                      onClick={() => {
                        setScreenShakeEnabled(!screenShakeEnabled);
                        AetheriaAudioEngine.playClick();
                      }}
                      className={`p-1.5 px-3 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        screenShakeEnabled ? activeUiTheme.settingsButtonClass : 'bg-slate-800 text-slate-500 border border-white/5'
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
                              ? activeUiTheme.settingsButtonClass
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

                  {/* Performance Mode / FPS Limit */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[11px] text-slate-350 uppercase font-bold block">{t('fps_limit_label', language)}</span>
                      <span className="text-[9px] text-slate-500">{t('performance_desc', language)}</span>
                    </div>
                    <select
                      value={fpsLimit}
                      onChange={(e) => {
                        const val = e.target.value as '60' | 'none';
                        setFpsLimit(val);
                        localStorage.setItem('rpg_fps_limit', val);
                      }}
                      className="bg-slate-800 text-slate-200 text-[10px] font-black border border-white/10 rounded px-2 py-1.5 cursor-pointer uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                    >
                      <option value="60">{t('fps_limit_60', language)}</option>
                      <option value="none">{t('fps_limit_none', language)}</option>
                    </select>
                  </div>

                  {/* Language Selector */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[11px] text-slate-300 uppercase font-bold">{t('language_label', language)}</span>
                    <select
                      value={language}
                      onChange={(e) => {
                        const val = e.target.value as LanguageType;
                        setLanguage(val);
                        localStorage.setItem('rpg_language', val);
                      }}
                      className="bg-slate-800 text-slate-200 text-[10px] font-black border border-white/10 rounded px-2 py-1.5 cursor-pointer uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                    >
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
            unlockedDaysCount={saveState.unlockedDaysCount || 1}
            nextRewardUnlockTime={saveState.nextRewardUnlockTime || 0}
            onClaimDay={handleClaimLoginReward}
          />
        )}
      </AnimatePresence>

      {/* ELEMENTAL REACTIONS CHEAT SHEET MODAL */}
      <ElementalReactionsModal
        isOpen={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
      />

      {/* STORY MODE BATTLE ARENA OVERLAY */}
      {storyBattleActive && (
        <motion.div
          className="fixed inset-0 z-50 w-screen h-screen bg-slate-950 overflow-hidden flex flex-col min-h-0"
          key="story_battle_arena"
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
            onBackToMenu={() => setStoryBattleActive(false)}
            onExitToWiki={() => setStoryBattleActive(false)}
            onAddItems={handleAddItems}
            devCheatsEnabled={devCheatsEnabled}
            playerLevel={saveState.playerLevel || 1}
            screenShakeEnabled={screenShakeEnabled}
            combatSpeed={combatSpeed}
            fpsLimit={fpsLimit}
            language={language}
            storyMode={true}
            storyStageId={storyBattleConfig.stageId}
            isHardMode={storyBattleConfig.isHardMode}
            saveState={saveState}
            onStoryBattleEnd={handleStoryBattleEnd}
            inventoryArtifacts={saveState.inventoryArtifacts || []}
            characterEquippedArtifacts={saveState.characterEquippedArtifacts || {}}
            onAwardArtifact={handleAwardArtifact}
            activeDamageSkin={saveState.activeDamageSkin || 'Default'}
          />
        </motion.div>
      )}

      {/* STORY POST-BATTLE DIALOGUE & CUTSCENE OVERLAY */}
      <AnimatePresence>
        {activeCutsceneSlides && (
          <StoryCutscene
            slides={activeCutsceneSlides}
            onComplete={() => {
              setActiveCutsceneSlides(null);
              showInGameAlert("Victory!", "Story battle resolved successfully. Spent drops added to inventory!", "success");
            }}
          />
        )}
      </AnimatePresence>

      {/* Developer Mode Active floating badge */}
      {devCheatsEnabled && (
        <div className="fixed bottom-4 right-4 z-50 bg-orange-500 text-slate-955 font-black font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg border border-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.6)] flex items-center gap-1.5 select-none animate-pulse">
          <span>🛠️</span>
          <span>Developer Mode Active</span>
        </div>
      )}
    </div>
  );
}
