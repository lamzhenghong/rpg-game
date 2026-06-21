/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { PlayableCharacter, ElementType, CombatCharacter, Weapon } from '../types';
import { 
  Sword, Zap, ShieldAlert, Sparkles, HelpCircle, Trophy, RefreshCw, RefreshCcw, 
  Swords, Plus, Star, Pause, Play, Volume2, VolumeX, Save, Home, BookOpen,
  Sun, CloudRain, CloudLightning, Snowflake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AetheriaAudioEngine } from '../utils/audio';
import { LanguageType, t } from '../utils/i18n';
import { getAccumulatedPortraitBuffs } from '../utils/portraits';
import { WEAPONS_DATABASE } from '../data/weapons';
import MobileJoystick from './MobileJoystick';
import MobileControls from './MobileControls';

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;
const IS_MOBILE_DEVICE = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

interface CombatArenaProps {
  onEarnRewards: (gems: number, mora: number, exp: number) => void;
  ownedCharacterIds: string[];
  onIncrementStat: (pk: any, val?: number) => void;
  partyIds: string[];
  onChangeParty: (partyIds: string[]) => void;
  highScoreWave?: number;
  onUpdateHighScore?: (wave: number, score: number) => void;
  onBackToMenu?: () => void;
  onExitToWiki?: () => void;
  onAddItems?: (itemType: 'char_xp' | 'ascension', amount: number) => void;
  characterLevels?: Record<string, number>;
  characterEquippedWeapon?: Record<string, string>;
  inventoryWeapons?: Weapon[];
  characterPortraits?: Record<string, number>;
  devCheatsEnabled?: boolean;
  screenShakeEnabled?: boolean;
  combatSpeed?: number;
  fpsLimit?: '60' | 'none';
  language?: LanguageType;
  // Rogue-like Dungeon mode props
  dungeonMode?: boolean;
  dungeonBuffs?: string[];
  dungeonPartyHp?: Record<string, number>;
  dungeonPartyUlt?: Record<string, number>;
  dungeonRoomType?: 'battle' | 'elite' | 'boss';
  dungeonRoomIdx?: number;
  onDungeonBattleEnd?: (victory: boolean, remainingHp: Record<string, number>, remainingUlt: Record<string, number>) => void;
}

// Particle class for beautiful graphics
class CombatParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, color: string, radius: number = 3) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.color = color;
    this.radius = radius;
    this.life = 0;
    this.maxLife = 20 + Math.random() * 20;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = 1 - this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    if (!IS_MOBILE_DEVICE) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    }
    ctx.fill();
    ctx.restore();
  }
}

// Floating Text class
class FloatingDamageText {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, text: string, color: string, size: number = 14) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.size = size;
    this.life = 0;
    this.maxLife = 40;
  }

  update() {
    this.y -= 1.2;
    this.life++;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = 1 - this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = `bold ${Math.round(this.size * 1.55)}px "Space Grotesk", "JetBrains Mono", monospace`;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#000000';
    // Stroke outline for maximum visual contrast on busy screens
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// Crystallyze Shield Shard
class CrystalShard {
  x: number;
  y: number;
  element: ElementType;
  color: string;
  radius: number;

  constructor(x: number, y: number, element: ElementType, color: string) {
    this.x = x;
    this.y = y;
    this.element = element;
    this.color = color;
    this.radius = 8;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    // Draw hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const sx = this.x + Math.cos(angle) * this.radius;
      const sy = this.y + Math.sin(angle) * this.radius;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.stroke();
    ctx.restore();
  }
}

const BOSS_TEMPLATES = [
  {
    bossType: 'fire_dragon',
    name: 'Calamity Pyro Dragon',
    element: 'Pyro' as ElementType,
    color: '#dc2626',
    radius: 65,
    maxHp: 25000,
    speed: 0.7
  },
  {
    bossType: 'ice_golem',
    name: 'Glacial Frost Golem',
    element: 'Cryo' as ElementType,
    color: '#06b6d4',
    radius: 68,
    maxHp: 27000,
    speed: 0.6
  },
  {
    bossType: 'thunderbird',
    name: 'Tempest Thunderbird',
    element: 'Electro' as ElementType,
    color: '#a855f7',
    radius: 60,
    maxHp: 23000,
    speed: 0.8
  }
];

export default function CombatArena({
  onEarnRewards,
  ownedCharacterIds,
  onIncrementStat,
  partyIds,
  onChangeParty,
  highScoreWave = 1,
  onUpdateHighScore,
  onBackToMenu,
  characterLevels = {},
  characterEquippedWeapon = {},
  inventoryWeapons = [],
  characterPortraits = {},
  devCheatsEnabled = true,
  screenShakeEnabled = true,
  combatSpeed = 1.0,
  fpsLimit = '60',
  language = 'en',
  dungeonMode = false,
  dungeonBuffs = [],
  dungeonPartyHp = {},
  dungeonPartyUlt = {},
  dungeonRoomType,
  dungeonRoomIdx = 0,
  onDungeonBattleEnd,
  onExitToWiki,
  onAddItems
}: CombatArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active party list mapped to combat instances
  const [combatParty, setCombatParty] = useState<CombatCharacter[]>([]);
  const [activePartyIndex, setActivePartyIndex] = useState<number>(0);
  const activeChar = combatParty[activePartyIndex] || null;

  const activeResonances = useMemo(() => {
    const elementCounts: Record<ElementType, number> = {} as any;
    combatParty.forEach(c => {
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
  }, [combatParty]);

  // Level selector for test items
  const [battleStarted, setBattleStarted] = useState<boolean>(false);
  const [activeUltCutscene, setActiveUltCutscene] = useState<any | null>(null);
  const [isUltCutsceneActive, setIsUltCutsceneActive] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<'restart' | 'home' | 'wiki' | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const startCountdown = (onComplete: () => void) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdownValue(3);
    AetheriaAudioEngine.playClick();
    
    let val = 3;
    countdownIntervalRef.current = setInterval(() => {
      val--;
      if (val <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdownValue(null);
        onComplete();
      } else {
        setCountdownValue(val);
        AetheriaAudioEngine.playClick();
      }
    }, 1000);
  };

  const [showPartySelector, setShowPartySelector] = useState(false);
  const [spawnerPreset, setSpawnerPreset] = useState<'slimes' | 'elites' | 'boss'>('slimes');

  // Combat status indicators
  const [perfectDodgeTriggered, setPerfectDodgeTriggered] = useState(false);
  const [isDashing, setIsDashing] = useState(false);
  const [isParrying, setIsParrying] = useState(false);
  const [dodgeCd, setDodgeCd] = useState(0);
  const [parryCd, setParryCd] = useState(0);
  const dodgeCdRef = useRef(0);
  const parryCdRef = useRef(0);
  const [shieldActive, setShieldActive] = useState<ElementType | null>(null);
  const [shieldWeight, setShieldWeight] = useState(0);

  // Time metrics inside arena
  const [timeDisordered, setTimeDisordered] = useState(0); // perfect dodge bullet time frame left
  const [gameScore, setGameScore] = useState(0);
  const [bossHp, setBossHp] = useState<number | null>(null);
  const [bossMaxHp, setBossMaxHp] = useState<number>(25000);
  const [bossName, setBossName] = useState<string>('');
  const bossProjectilesRef = useRef<any[]>([]);
  const hasRevivedRef = useRef<boolean>(false);

  // Weather, stamina and premium visual states
  const [currentWeather, setCurrentWeather] = useState<'Sunny' | 'Rain' | 'Thunderstorm' | 'Snow'>('Sunny');
  const weatherTimerRef = useRef<number>(1200); // 20 seconds at 60fps
  const weatherRef = useRef<'Sunny' | 'Rain' | 'Thunderstorm' | 'Snow'>('Sunny');
  const [stamina, setStamina] = useState<number>(100);
  const staminaRef = useRef<number>(100);
  const [isUiShaking, setIsUiShaking] = useState<boolean>(false);
  const [domDamageTexts, setDomDamageTexts] = useState<{ id: string; x: number; y: number; text: string; color: string; size: number; isCrit: boolean }[]>([]);
  const lightningWarningRef = useRef<{ x: number; y: number; timer: number } | null>(null);
  const lightningStrikeVisualRef = useRef<{ x: number; y: number; duration: number } | null>(null);
  const lightningTimerRef = useRef<number>(0);
  const rainTickRef = useRef<number>(0);

  // Dungeon Mode status
  const [dungeonVictory, setDungeonVictory] = useState<boolean>(false);

  const spawnFloatingDamageText = (x: number, y: number, text: string, color: string, size: number = 14, isCrit: boolean = false) => {
    const id = Math.random().toString(36).substring(2, 9);
    setDomDamageTexts(prev => [
      ...prev,
      { id, x, y, text, color, size, isCrit }
    ]);
    setTimeout(() => {
      setDomDamageTexts(prev => prev.filter(t => t.id !== id));
    }, 750);
  };
  const spawnTextRef = useRef(spawnFloatingDamageText);
  spawnTextRef.current = spawnFloatingDamageText;

  const getElementUiTheme = (element: ElementType | undefined) => {
    if (!element) return {
      borderClass: 'border-white/10',
      shadowGlow: 'shadow-[0_10px_40px_rgba(0,0,0,0.6)]',
      pulseGlowClass: '',
      bgGradient: 'from-slate-900/20 via-slate-900/40 to-slate-950/40',
      textAccent: 'text-slate-350',
      badgeBg: 'bg-black/40 border-white/10 text-slate-400'
    };
    switch (element) {
      case 'Pyro':
        return {
          borderClass: 'border-red-500/50',
          shadowGlow: 'shadow-[0_0_35px_rgba(239,68,68,0.25)]',
          pulseGlowClass: 'theme-glow-pyro',
          bgGradient: 'from-red-950/20 via-slate-900/40 to-slate-950/40',
          textAccent: 'text-red-400',
          badgeBg: 'bg-red-500/10 border-red-500/30 text-red-400'
        };
      case 'Hydro':
        return {
          borderClass: 'border-cyan-500/50',
          shadowGlow: 'shadow-[0_0_35px_rgba(6,182,212,0.25)]',
          pulseGlowClass: 'theme-glow-hydro',
          bgGradient: 'from-cyan-950/20 via-slate-900/40 to-slate-950/40',
          textAccent: 'text-cyan-400',
          badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
        };
      case 'Cryo':
        return {
          borderClass: 'border-sky-300/50',
          shadowGlow: 'shadow-[0_0_35px_rgba(186,230,253,0.25)]',
          pulseGlowClass: 'theme-glow-cryo',
          bgGradient: 'from-sky-950/20 via-slate-900/40 to-slate-950/40',
          textAccent: 'text-sky-300',
          badgeBg: 'bg-sky-400/10 border-sky-400/30 text-sky-300'
        };
      case 'Electro':
        return {
          borderClass: 'border-purple-500/50',
          shadowGlow: 'shadow-[0_0_35px_rgba(168,85,247,0.25)]',
          pulseGlowClass: 'theme-glow-electro',
          bgGradient: 'from-purple-950/20 via-slate-900/40 to-slate-950/40',
          textAccent: 'text-purple-400',
          badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
        };
      case 'Anemo':
        return {
          borderClass: 'border-teal-400/50',
          shadowGlow: 'shadow-[0_0_35px_rgba(45,212,191,0.25)]',
          pulseGlowClass: 'theme-glow-anemo',
          bgGradient: 'from-teal-950/20 via-slate-900/40 to-slate-950/40',
          textAccent: 'text-teal-350',
          badgeBg: 'bg-teal-400/10 border-teal-400/30 text-teal-350'
        };
      case 'Geo':
        return {
          borderClass: 'border-amber-500/50',
          shadowGlow: 'shadow-[0_0_35px_rgba(245,158,11,0.25)]',
          pulseGlowClass: 'theme-glow-geo',
          bgGradient: 'from-amber-950/20 via-slate-900/40 to-slate-950/40',
          textAccent: 'text-amber-400',
          badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        };
      case 'Dendro':
        return {
          borderClass: 'border-emerald-500/50',
          shadowGlow: 'shadow-[0_0_35px_rgba(16,185,129,0.25)]',
          pulseGlowClass: 'theme-glow-dendro',
          bgGradient: 'from-emerald-950/20 via-slate-900/40 to-slate-950/40',
          textAccent: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        };
      default:
        return {
          borderClass: 'border-white/10',
          shadowGlow: 'shadow-[0_10px_40px_rgba(0,0,0,0.6)]',
          pulseGlowClass: '',
          bgGradient: 'from-slate-900/20 via-slate-900/40 to-slate-950/40',
          textAccent: 'text-slate-350',
          badgeBg: 'bg-black/40 border-white/10 text-slate-400'
        };
    }
  };

  // Canvas size and coordinate track
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Wave Survival, Pauses & Audio states
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [waveClearMessage, setWaveClearMessage] = useState<string | null>(null);

  // Refs for keyboard controls to prevent scope-binding loss in standard fast loops
  const keyboardState = useRef<Record<string, boolean>>({});
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const mobileJoystickState = useRef({ active: false, x: 0, y: 0 });
  const playerRef = useRef({ x: 1000, y: 1000, radius: 26, lastDirX: 1, lastDirY: 0, skillCc: 0 });
  const enemiesRef = useRef<any[]>([]);
  const particlesRef = useRef<CombatParticle[]>([]);
  const textsRef = useRef<FloatingDamageText[]>([]);
  const shardsRef = useRef<CrystalShard[]>([]);

  // Put active combat states in a Ref to prevent stale closures in event listeners and canvas loop
  const loopStateRef = useRef({
    combatParty,
    activePartyIndex,
    isParrying,
    isDashing,
    shieldActive,
    shieldWeight,
    dimensions,
    timeDisordered,
    activeChar,
    isPaused,
    isGameOver,
    battleStarted: false,
    countdownValue: null as number | null,
    fpsLimit,
    dungeonBuffs,
    dungeonMode,
    isUltCutsceneActive: false,
    activeResonances: [] as { name: string; desc: string; key: string }[]
  });

  // Screenshake ref
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });

  // Keep the loopStateRef fully synchronized on every single render
  useEffect(() => {
    loopStateRef.current = {
      combatParty,
      activePartyIndex,
      isParrying,
      isDashing,
      shieldActive,
      shieldWeight,
      dimensions,
      timeDisordered,
      activeChar,
      isPaused,
      isGameOver,
      battleStarted,
      countdownValue,
      fpsLimit,
      dungeonBuffs,
      dungeonMode,
      isUltCutsceneActive,
      activeResonances
    };
  }, [combatParty, activePartyIndex, isParrying, isDashing, shieldActive, shieldWeight, dimensions, timeDisordered, activeChar, isPaused, isGameOver, battleStarted, countdownValue, fpsLimit, dungeonBuffs, dungeonMode, isUltCutsceneActive, activeResonances]);

  // Start music loop once battle starts
  useEffect(() => {
    if (battleStarted) {
      AetheriaAudioEngine.updateWeatherBgm(weatherRef.current);
    }
  }, [battleStarted]);

  // Get color details relative to elements
  const getElementColorHex = (element: ElementType) => {
    switch (element) {
      case 'Pyro': return '#ef4444';
      case 'Hydro': return '#3b82f6';
      case 'Cryo': return '#60a5fa';
      case 'Electro': return '#a855f7';
      case 'Anemo': return '#10b981';
      case 'Geo': return '#f59e0b';
      case 'Dendro': return '#22c55e';
    }
  };

  // Convert templates dynamically
  useEffect(() => {
    // Only re-initialize if the party IDs have actually changed (preventing infinite resets on every re-render)
    const currentIds = combatParty.map(c => c.id);
    const matches = partyIds.length === currentIds.length && partyIds.every((id, idx) => id === currentIds[idx]);
    if (matches && combatParty.length > 0) return;

    const list: CombatCharacter[] = [];
    partyIds.forEach(id => {
      const charTemplate = PLAYABLE_CHARACTERS.find(c => c.id === id);
      if (charTemplate) {
        const charLvl = characterLevels[id] || 1;
        const equippedWeaponUid = characterEquippedWeapon[id] || '';
        const equippedWeapon = inventoryWeapons.find(w => w.id === equippedWeaponUid);
        
        const weaponBaseAtk = equippedWeapon ? equippedWeapon.baseAtk : 10;
        const weaponLevel = equippedWeapon ? equippedWeapon.level : 1;
        
        // Weapon rarity multiplier
        const wpMult = equippedWeapon ? (equippedWeapon.rarity === 5 ? 3.0 : equippedWeapon.rarity === 4 ? 1.5 : 1.0) : 1.0;
        // Weapon ATK grows +2.5 per level, shifted by wpMult
        const weaponAtk = equippedWeapon ? Math.round((weaponBaseAtk + (weaponLevel * 2.5)) * wpMult) : 10;

        // Hero rarity multiplier
        const charMult = charTemplate.rarity === 5 ? 3.0 : charTemplate.rarity === 4 ? 1.5 : 1.0;

        // Calculate dynamic customized stats (Matching InventoryManager exactly)
        const calculatedAtk = (charTemplate.baseStats.atk + (charLvl * 3.8)) * charMult + weaponAtk;
        const calculatedHp = (charTemplate.baseStats.hp + (charLvl * 14)) * charMult;
        const calculatedDef = (charTemplate.baseStats.def + (charLvl * 2.4)) * charMult;

        // Apply weapon statBonus (e.g. Crit Rate +10%, Crit DMG +8%, ATK +12%, etc.)
        let bonusCritRate = 0;
        let bonusCritDmg = 0;
        let bonusAtkPercent = 0;

        if (equippedWeapon) {
          const upgradeSteps = Math.floor(weaponLevel / 5);
          let statBonusStr = equippedWeapon.statBonus || "";
          let baseBonusVal = 0;
          const bonusNumMatch = statBonusStr.match(/(\d+(\.\d+)?)/);
          if (bonusNumMatch) {
            baseBonusVal = parseFloat(bonusNumMatch[1]);
          }

          // Upgraded bonus (+12% per 5-level upgrade step)
          const upgradedBonusVal = baseBonusVal * (1 + upgradeSteps * 0.12);
          const normalizedStr = statBonusStr.toLowerCase();

          if (normalizedStr.includes("crit rate")) {
            bonusCritRate = upgradedBonusVal / 100;
          } else if (normalizedStr.includes("crit dmg") || normalizedStr.includes("crit damage")) {
            bonusCritDmg = upgradedBonusVal / 100;
          } else if (normalizedStr.includes("atk") || normalizedStr.includes("attack")) {
            bonusAtkPercent = upgradedBonusVal / 100;
          }
        }

        const elementCounts: Record<ElementType, number> = {} as any;
        partyIds.forEach(pId => {
          const tpl = PLAYABLE_CHARACTERS.find(c => c.id === pId);
          if (tpl) {
            elementCounts[tpl.element] = (elementCounts[tpl.element] || 0) + 1;
          }
        });
        const has2Pyro = (elementCounts['Pyro'] || 0) >= 2;

        const pLvl = characterPortraits?.[charTemplate.id] || 0;
        const pBuffs = getAccumulatedPortraitBuffs(charTemplate.id, pLvl);

        let baseHp = calculatedHp;
        let baseDef = calculatedDef;
        let baseAtk = calculatedAtk * (1 + bonusAtkPercent);
        if (has2Pyro) {
          baseAtk = Math.round(baseAtk * 1.15);
        }
        let baseCritRate = charTemplate.baseStats.critRate + bonusCritRate;
        let baseCritDmg = charTemplate.baseStats.critDmg + bonusCritDmg;

        // Apply Portrait buffs
        baseHp = Math.round(baseHp * (1 + pBuffs.hp));
        baseDef = Math.round(baseDef * (1 + pBuffs.def));
        baseAtk = Math.round(baseAtk * (1 + pBuffs.atk));
        baseCritRate += pBuffs.critRate;
        baseCritDmg += pBuffs.critDmg;

        // Apply Rogue-like dungeon buffs if active
        if (dungeonMode) {
          if (dungeonBuffs.includes('Aetheric Edge')) {
            baseAtk = Math.round(baseAtk * 1.25);
          }
          if (dungeonBuffs.includes('Crystalline Focus')) {
            baseCritRate += 0.15;
          }
        }

        // Determine starting health (persisted if dungeon mode)
        const startingHp = dungeonMode && dungeonPartyHp[charTemplate.id] !== undefined
          ? dungeonPartyHp[charTemplate.id]
          : baseHp;

        // Determine starting ultimate energy (persisted if dungeon mode)
        const startingUlt = dungeonMode && dungeonPartyUlt[charTemplate.id] !== undefined
          ? dungeonPartyUlt[charTemplate.id]
          : 40;

        const equippedWeaponName = equippedWeapon ? equippedWeapon.name : '';

        list.push({
          id: charTemplate.id,
          name: charTemplate.name,
          element: charTemplate.element,
          weaponType: charTemplate.weaponType,
          level: charLvl,
          maxHp: baseHp,
          currentHp: startingHp,
          atk: baseAtk,
          def: baseDef,
          critRate: baseCritRate,
          critDmg: baseCritDmg,
          skillCooldownRemaining: 0,
          ultimateEnergy: startingUlt,
          ultimateMaxEnergy: 80,
          skills: charTemplate.skills,
          equippedWeaponName: equippedWeaponName,
          royalStacks: 0,
          widsithBuffTimer: 0,
          widsithCooldown: 0,
          widsithBuffAtk: 0,
          widsithBuffEle: 0,
          sacrificialCooldown: 0,
          swapBuffTimer: 0,
          swapBuffAtk: 0,
          crescentPikeTimer: 0,
          debateClubTimer: 0,
          debateClubCd: 0,
          scepterBubbleCd: 0,
          spearDoubleCd: 0
        });
      }
    });

    if (list.length > 0) {
      setCombatParty(list);
      const firstAliveIdx = list.findIndex(c => c.currentHp > 0);
      setActivePartyIndex(firstAliveIdx !== -1 ? firstAliveIdx : 0);
    }
  }, [partyIds, characterLevels, characterEquippedWeapon, inventoryWeapons, dungeonMode, dungeonBuffs, dungeonPartyHp, dungeonPartyUlt, characterPortraits]);

  // Handle resizing observer
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          const w = Math.max(width, 320);
          const h = isMobile ? Math.max(height, 200) : 400;
          setDimensions(prev => {
            if (prev.width === w && prev.height === h) {
              return prev;
            }
            return { width: w, height: h };
          });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [isMobile]);

// Keyboard binding trackers moved below trigger functions to satisfy block scope compilation rules

  // Spawn enemies by progressive Wave — procedurally generated, scales with wave number and dungeon depth
  const triggerSpawnWave = (waveNum: number) => {
    setCurrentWave(waveNum);
    setIsGameOver(false);
    setIsPaused(false);
    
    // Reposition player to the center of the world at wave start
    playerRef.current.x = WORLD_WIDTH / 2;
    playerRef.current.y = WORLD_HEIGHT / 2;
    
    const list: any[] = [];
    const centerX = WORLD_WIDTH / 2;
    const centerY = WORLD_HEIGHT / 2;

    const createRandomSlime = (id: string, scale: number) => {
      const elements: { element: ElementType; color: string; name: string }[] = [
        { element: 'Pyro', color: '#f97316', name: 'Pyro Slime' },
        { element: 'Hydro', color: '#3b82f6', name: 'Hydro Slime' },
        { element: 'Cryo', color: '#60a5fa', name: 'Cryo Slime' },
        { element: 'Electro', color: '#a855f7', name: 'Electro Slime' },
        { element: 'Anemo', color: '#10b981', name: 'Anemo Slime' },
        { element: 'Geo', color: '#fbbf24', name: 'Geo Slime' },
        { element: 'Dendro', color: '#22c55e', name: 'Dendro Slime' }
      ];
      const tpl = elements[Math.floor(Math.random() * elements.length)];
      const baseHp = 500 + Math.random() * 200;
      const hp = Math.round(baseHp * scale);
      const speed = 1.2 + Math.random() * 0.4;
      return {
        id,
        name: tpl.name,
        type: 'Normal' as const,
        element: tpl.element,
        color: tpl.color,
        x: centerX + (Math.random() - 0.5) * 800,
        y: centerY + (Math.random() - 0.5) * 800,
        radius: 23,
        hp,
        maxHp: hp,
        speed,
        activeElements: [] as ElementType[],
        telegraphTimer: 0,
        isFrozen: 0,
        burningTicks: 0
      };
    };

    const createRandomElite = (id: string, scale: number) => {
      const eliteTypes = [
        { name: 'Abyss Obsidian Berserker', element: 'Geo' as ElementType, color: '#78350f', baseHp: 3500, radius: 36, speed: 1.0, telegraphType: 'circle' as const },
        { name: 'Abyss Cryo Channeler', element: 'Cryo' as ElementType, color: '#0284c7', baseHp: 2800, radius: 35, speed: 0.9, telegraphType: 'line' as const },
        { name: 'Epoch Ruin Guard', element: (Math.random() > 0.5 ? 'Geo' : 'Cryo') as ElementType, color: '#4b5563', baseHp: 4500, radius: 40, speed: 1.1, telegraphType: (Math.random() > 0.5 ? 'circle' : 'line') as ('circle' | 'line') }
      ];
      const tpl = eliteTypes[Math.floor(Math.random() * eliteTypes.length)];
      const hp = Math.round(tpl.baseHp * scale);
      return {
        id,
        name: tpl.name,
        type: 'Elite' as const,
        element: tpl.element,
        color: tpl.color,
        x: centerX + (Math.random() - 0.5) * 900,
        y: centerY + (Math.random() - 0.5) * 900,
        radius: tpl.radius,
        hp,
        maxHp: hp,
        speed: tpl.speed,
        activeElements: [] as ElementType[],
        telegraphTimer: 0,
        telegraphType: tpl.telegraphType,
        isFrozen: 0,
        burningTicks: 0
      };
    };

    const spawnRandomBoss = (id: string, scale: number) => {
      const bossTpl = BOSS_TEMPLATES[Math.floor(Math.random() * BOSS_TEMPLATES.length)];
      const hp = Math.round(bossTpl.maxHp * scale);
      return {
        id,
        name: bossTpl.name,
        type: 'Boss' as const,
        bossType: bossTpl.bossType,
        element: bossTpl.element,
        color: bossTpl.color,
        x: centerX,
        y: centerY - 80,
        radius: bossTpl.radius,
        hp,
        maxHp: hp,
        speed: bossTpl.speed,
        activeElements: [] as ElementType[],
        telegraphTimer: 0,
        telegraphType: 'circle' as const,
        isFrozen: 0,
        burningTicks: 0,
        phase: 1,
        attackCooldown: 0
      };
    };

    if (dungeonMode && dungeonRoomType) {
      const scaleMultiplier = 1 + dungeonRoomIdx * 0.15;
      if (dungeonRoomType === 'boss') {
        setSpawnerPreset('boss');
        const boss = spawnRandomBoss('dungeon_boss_' + Date.now(), scaleMultiplier);
        setBossMaxHp(boss.maxHp);
        setBossHp(boss.hp);
        setBossName(boss.name);
        list.push(boss);
        AetheriaAudioEngine.setBossFightActive(true);
      } else if (dungeonRoomType === 'elite') {
        setSpawnerPreset('elites');
        const numElites = 2 + Math.floor(dungeonRoomIdx / 4);
        for (let i = 0; i < numElites; i++) {
          list.push(createRandomElite(`dungeon_elite_${i}_${Date.now()}`, scaleMultiplier));
        }
        const numSlimes = 1 + Math.floor(dungeonRoomIdx / 6);
        for (let i = 0; i < numSlimes; i++) {
          list.push(createRandomSlime(`dungeon_slime_${i}_${Date.now()}`, scaleMultiplier));
        }
        setBossHp(null);
      } else {
        setSpawnerPreset('slimes');
        const numSlimes = 4 + Math.floor(dungeonRoomIdx / 2);
        for (let i = 0; i < numSlimes; i++) {
          list.push(createRandomSlime(`dungeon_slime_${i}_${Date.now()}`, scaleMultiplier));
        }
        if (dungeonRoomIdx >= 4) {
          list.push(createRandomElite(`dungeon_elite_helper_${Date.now()}`, scaleMultiplier));
        }
        setBossHp(null);
      }
    } else {
      if (waveNum % 5 === 0) {
        setSpawnerPreset('boss');
        const scaleMultiplier = Math.max(1, 1 + (waveNum - 5) * 0.25);
        const boss = spawnRandomBoss('world_boss_' + Date.now(), scaleMultiplier);
        setBossMaxHp(boss.maxHp);
        setBossHp(boss.hp);
        setBossName(boss.name);
        list.push(boss);
        AetheriaAudioEngine.setBossFightActive(true);
      } else {
        const themes = ['slimes', 'elites', 'mix'] as const;
        let theme: 'slimes' | 'elites' | 'mix' = 'mix';
        if (waveNum === 1) {
          theme = 'slimes';
        } else if (waveNum === 2) {
          theme = Math.random() > 0.5 ? 'slimes' : 'mix';
        } else {
          theme = themes[Math.floor(Math.random() * themes.length)];
        }
        
        setSpawnerPreset(theme === 'slimes' ? 'slimes' : 'elites');
        const scaleMultiplier = 1 + (waveNum - 1) * 0.15;
        
        if (theme === 'slimes') {
          const numSlimes = 4 + Math.floor(waveNum / 2);
          for (let i = 0; i < numSlimes; i++) {
            list.push(createRandomSlime(`w${waveNum}_slime_${i}`, scaleMultiplier));
          }
        } else if (theme === 'elites') {
          const numElites = Math.min(4, 1 + Math.floor(waveNum / 3));
          for (let i = 0; i < numElites; i++) {
            list.push(createRandomElite(`w${waveNum}_elite_${i}`, scaleMultiplier));
          }
        } else {
          const numSlimes = Math.max(2, 3 + Math.floor(waveNum / 3));
          const numElites = Math.max(1, Math.floor(waveNum / 4));
          for (let i = 0; i < numSlimes; i++) {
            list.push(createRandomSlime(`w${waveNum}_mix_slime_${i}`, scaleMultiplier));
          }
          for (let i = 0; i < numElites; i++) {
            list.push(createRandomElite(`w${waveNum}_mix_elite_${i}`, scaleMultiplier));
          }
        }
        setBossHp(null);
      }
    }

    enemiesRef.current = list;
    shardsRef.current = [];
    particlesRef.current = [];
    bossProjectilesRef.current = [];
    hasRevivedRef.current = false;
  };

  // Run on startup to spawn correct wave/dungeon enemies once battle starts
  // triggerSpawnWave internally handles dungeonMode + dungeonRoomType branching
  useEffect(() => {
    if (!battleStarted) return;
    triggerSpawnWave(1);
  }, [battleStarted, dungeonMode, dungeonRoomType]);

  const swapPartyIndex = (idx: number) => {
    const { combatParty: currentParty, activePartyIndex: currentPartyIndex } = loopStateRef.current;
    if (isPaused || isGameOver || countdownValue !== null) return;
    if (idx >= currentParty.length || idx < 0 || idx === currentPartyIndex) return;
    setActivePartyIndex(idx);
    const swapped = currentParty[idx];

    // Spawn burst effects at player position
    const px = playerRef.current.x;
    const py = playerRef.current.y;
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push(new CombatParticle(px, py, getElementColorHex(swapped.element), 4));
    }

    // Swapping trigger Resonance reaction check
    spawnFloatingDamageText(px, py - 40, `SWAP: ${swapped.name}!`, getElementColorHex(swapped.element), 13);

    // Weapon Swapping passive triggers
    setCombatParty(pList => pList.map((c, i) => {
      let charObj = { ...c };
      
      // If this is the incoming character
      if (i === idx) {
        // Widsith swap-in check
        if (charObj.equippedWeaponName?.includes('Widsith')) {
          if (!charObj.widsithCooldown || charObj.widsithCooldown <= 0) {
            const isAtkSong = Math.random() < 0.5;
            charObj.widsithBuffTimer = 600; // 10s
            charObj.widsithCooldown = 1800; // 30s
            if (isAtkSong) {
              charObj.widsithBuffAtk = 0.60;
              charObj.widsithBuffEle = 0;
              spawnFloatingDamageText(px, py - 55, '🎵 WIDSITH DEBUT: ATK +60%!', '#facc15', 12, true);
            } else {
              charObj.widsithBuffAtk = 0;
              charObj.widsithBuffEle = 0.48;
              spawnFloatingDamageText(px, py - 55, '🎵 WIDSITH DEBUT: ELEMENTAL +48%!', '#c084fc', 12, true);
            }
          }
        }

        // Thrilling Tales swap-out bonus check: if outgoing had TTDS, grant incoming +24% ATK
        const outgoing = pList[currentPartyIndex];
        if (outgoing?.equippedWeaponName?.includes('Thrilling Tales')) {
          if (!outgoing.widsithCooldown || outgoing.widsithCooldown <= 0) {
            charObj.swapBuffTimer = 600; // 10s
            charObj.swapBuffAtk = 0.24;
            spawnFloatingDamageText(px, py - 65, '📖 HERITAGE: ATK +24%!', '#60a5fa', 11, true);
          }
        }
      }

      // If this is the outgoing character
      if (i === currentPartyIndex) {
        if (charObj.equippedWeaponName?.includes('Thrilling Tales')) {
          if (!charObj.widsithCooldown || charObj.widsithCooldown <= 0) {
            charObj.widsithCooldown = 1200; // 20s cooldown
          }
        }
      }

      return charObj;
    }));
  };

  const triggerDodgeDash = () => {
    const { isDashing: currentIsDashing, combatParty: currentParty, activePartyIndex: currentPartyIndex } = loopStateRef.current;
    const currentActiveChar = currentParty[currentPartyIndex] || null;
    if (currentIsDashing || !currentActiveChar || dodgeCdRef.current > 0) return;
    
    // Stamina sprint requirement: dash costs 20 stamina
    if (staminaRef.current < 20) {
      spawnFloatingDamageText(playerRef.current.x, playerRef.current.y - 45, '⚠️ EXHAUSTED: NEED STAMINA!', '#ef4444', 11);
      return;
    }
    staminaRef.current = Math.max(0, staminaRef.current - 20);
    setStamina(Math.round(staminaRef.current));

    // Set cooldown (reduce by 30% if Zephyr Pace is active in Dungeon)
    const baseCd = loopStateRef.current.dungeonMode && loopStateRef.current.dungeonBuffs.includes('Zephyr Pace') ? 0.7 : 1.0;
    dodgeCdRef.current = baseCd;
    setDodgeCd(baseCd);

    setIsDashing(true);
    
    // Play SFX
    AetheriaAudioEngine.playDodge();

    // Propel player forward even if standing still!
    const dirX = playerRef.current.lastDirX;
    const dirY = playerRef.current.lastDirY;
    const dashDistance = 85;

    // Move player position immediate/slide in facing direction
    playerRef.current.x = Math.max(25, Math.min(WORLD_WIDTH - 25, playerRef.current.x + dirX * dashDistance));
    playerRef.current.y = Math.max(25, Math.min(WORLD_HEIGHT - 25, playerRef.current.y + dirY * dashDistance));

    // Push gorgeous visual wind/trail particles
    for (let i = 0; i < 18; i++) {
      const part = new CombatParticle(
        playerRef.current.x - dirX * (Math.random() * 40),
        playerRef.current.y - dirY * (Math.random() * 40),
        '#cbd5e1',
        2.2
      );
      part.vx = -dirX * 2 + (Math.random() - 0.5) * 2;
      part.vy = -dirY * 2 + (Math.random() - 0.5) * 2;
      particlesRef.current.push(part);
    }

    // Quick invincibility glide reset
    setTimeout(() => {
      setIsDashing(false);
    }, 150);

    // Filter telegraph triggers nearby for Perfect Dodge checks
    enemiesRef.current.forEach(enemy => {
      if (enemy.telegraphTimer > 5 && enemy.telegraphTimer < 45) {
        const dx = playerRef.current.x - enemy.x;
        const dy = playerRef.current.y - enemy.y;
        const dist = Math.hypot(dx, dy);
        
        // Perfect dodge distance threshold
        if (dist < enemy.radius + 100) {
          triggerPerfectDodge();
        }
      }
    });
  };

  const triggerPerfectDodge = () => {
    const { activePartyIndex: currentPartyIndex } = loopStateRef.current;
    setPerfectDodgeTriggered(true);
    setTimeDisordered(130); // sets frames of bullet slowdown
    onIncrementStat('perfectDodges');

    // Play SFX
    AetheriaAudioEngine.playWaveClear();

    // Fill Energy to max!
    setCombatParty(pList => pList.map((c, i) => {
      if (i === currentPartyIndex) {
        return { ...c, ultimateEnergy: c.ultimateMaxEnergy };
      }
      return c;
    }));

    // Alert floats
    const px = playerRef.current.x;
    const py = playerRef.current.y;
    spawnFloatingDamageText(px, py - 65, '⚡ PERFECT DODGE ⚡', '#a855f7', 16, true);
    spawnFloatingDamageText(px, py - 40, 'BULLET TIME + ENERGY CHARGED!', '#c084fc', 12);

    setTimeout(() => {
      setPerfectDodgeTriggered(false);
    }, 2500);
  };

  const triggerParryBlock = () => {
    const { combatParty: currentParty, activePartyIndex: currentPartyIndex } = loopStateRef.current;
    const currentActiveChar = currentParty[currentPartyIndex] || null;
    if (!currentActiveChar || parryCdRef.current > 0) return;

    // Set 1.0 second cooldown
    parryCdRef.current = 1.0;
    setParryCd(1.0);

    setIsParrying(true);
    
    // Play SFX
    AetheriaAudioEngine.playParry();
  };

  const triggerElementalSkill = () => {
    const { combatParty: currentParty, activePartyIndex: currentPartyIndex } = loopStateRef.current;
    const currentActiveChar = currentParty[currentPartyIndex] || null;
    if (!currentActiveChar) return;

    if (currentActiveChar.skillCooldownRemaining > 0) {
      // Feedback for skill on cooldown
      const px = playerRef.current.x;
      const py = playerRef.current.y;
      textsRef.current.push(new FloatingDamageText(
        px,
        py - 55,
        `⚠️ COOLDOWN: ${Math.ceil(currentActiveChar.skillCooldownRemaining)}s`,
        '#ef4444',
        13
      ));
      AetheriaAudioEngine.playClick();
      return;
    }

    // Play SFX
    AetheriaAudioEngine.playSkill();

    const px = playerRef.current.x;
    const py = playerRef.current.y;
    const pColor = getElementColorHex(currentActiveChar.element);

    // Dynamic Skill animations and radial hit registration
    for (let i = 0; i < 35; i++) {
      particlesRef.current.push(new CombatParticle(px, py, pColor, 4));
    }

    spawnFloatingDamageText(px, py - 55, `Skill: ${currentActiveChar.skills.skill.name}!`, pColor, 14);

    // Calculate Hit circle range
    const skillRadius = 150;
    enemiesRef.current.forEach(enemy => {
      if (enemy.hp <= 0) return;
      const dx = enemy.x - px;
      const dy = enemy.y - py;
      const dist = Math.hypot(dx, dy);

      if (dist < skillRadius + enemy.radius) {
        applySkillDamage(enemy, currentActiveChar.atk * currentActiveChar.skills.skill.damageMultiplier, currentActiveChar.element, false, false, 'skill');
      }
    });

    // Reset skill cooldowns
    setCombatParty(pList => pList.map((c, i) => {
      if (i === currentPartyIndex) {
        const has2Electro = loopStateRef.current.activeResonances.some(r => r.key === 'electro');
        const has2Anemo = loopStateRef.current.activeResonances.some(r => r.key === 'anemo');
        const hasSearingBlade = c.equippedWeaponName?.includes('Solar Searing Blade');

        let cdMultiplier = 1.0;
        if (has2Electro) cdMultiplier *= 0.80;
        if (has2Anemo) cdMultiplier *= 0.85;
        if (hasSearingBlade) cdMultiplier *= 0.80;

        const skillCdMax = 10.0 * cdMultiplier;

        const has2Hydro = loopStateRef.current.activeResonances.some(r => r.key === 'hydro');
        const resonanceEnergyMult = has2Hydro ? 1.20 : 1.0;
        const energyMultiplier = (loopStateRef.current.dungeonMode && loopStateRef.current.dungeonBuffs.includes('Recharge Matrix') ? 1.5 : 1.0) * resonanceEnergyMult;

        let debateTimerVal = c.debateClubTimer || 0;
        if (c.equippedWeaponName?.includes('Debate Club')) {
          debateTimerVal = 600; // 10s
        }

        return { 
          ...c, 
          skillCooldownRemaining: skillCdMax, 
          debateClubTimer: debateTimerVal,
          ultimateEnergy: Math.min(c.ultimateMaxEnergy, c.ultimateEnergy + 25 * energyMultiplier) 
        };
      }
      return c;
    }));
  };

  const triggerUltimate = () => {
    const { combatParty: currentParty, activePartyIndex: currentPartyIndex } = loopStateRef.current;
    const currentActiveChar = currentParty[currentPartyIndex] || null;
    if (!currentActiveChar) return;

    if (currentActiveChar.ultimateEnergy < currentActiveChar.ultimateMaxEnergy) {
      // Feedback for ultimate not ready yet
      const px = playerRef.current.x;
      const py = playerRef.current.y;
      spawnFloatingDamageText(
        px,
        py - 55,
        `⚠️ ENERGY LEVEL: ${Math.round(currentActiveChar.ultimateEnergy)}/${currentActiveChar.ultimateMaxEnergy} (Swing to charge!)`,
        '#f59e0b',
        12
      );
      AetheriaAudioEngine.playClick();
      return;
    }

    // Enter Ultimate Cutscene mode
    setIsUltCutsceneActive(true);
    setActiveUltCutscene(currentActiveChar);

    // Play SFX
    AetheriaAudioEngine.playUltimate();

    // Reset energy immediately to prevent double cast
    setCombatParty(pList => pList.map((c, i) => {
      if (i === currentPartyIndex) {
        return { ...c, ultimateEnergy: 0 };
      }
      return c;
    }));

    // Delay damage and visual explosion resolution by 750ms to match the cutscene duration
    setTimeout(() => {
      setIsUltCutsceneActive(false);
      setActiveUltCutscene(null);

      const px = playerRef.current.x;
      const py = playerRef.current.y;
      const pColor = getElementColorHex(currentActiveChar.element);

      // Massive cinematic circle lines
      for (let i = 0; i < 70; i++) {
         const part = new CombatParticle(px, py, pColor, 5);
         part.vx *= 2.5;
         part.vy *= 2.5;
         particlesRef.current.push(part);
      }

      spawnFloatingDamageText(px, py - 70, `💥 CELESTIAL ULTIMATE: ${currentActiveChar.skills.ultimate.name}! 💥`, '#fca5a5', 18, true);

      // Trigger powerful screen shake on ultimate cast!
      if (screenShakeEnabled) {
        shakeRef.current.intensity = 18;
        shakeRef.current.x = (Math.random() - 0.5) * 18;
        shakeRef.current.y = (Math.random() - 0.5) * 18;
        setIsUiShaking(true);
        setTimeout(() => setIsUiShaking(false), 400);
      }

      // Mega damage across all targets
      enemiesRef.current.forEach(enemy => {
         if (enemy.hp <= 0) return;
         applySkillDamage(enemy, currentActiveChar.atk * currentActiveChar.skills.ultimate.damageMultiplier, currentActiveChar.element, true, false, 'ultimate');
      });
    }, 750);
  };

  const triggerBasicAttack = () => {
    const { combatParty: currentParty, activePartyIndex: currentPartyIndex } = loopStateRef.current;
    const currentActiveChar = currentParty[currentPartyIndex] || null;
    if (!currentActiveChar) return;

    // Play SFX
    AetheriaAudioEngine.playSlash();

    const px = playerRef.current.x;
    const py = playerRef.current.y;
    const dirX = playerRef.current.lastDirX;
    const dirY = playerRef.current.lastDirY;
    const pColor = getElementColorHex(currentActiveChar.element);

    // Throw particles in front of looking direction
    const swipeX = px + dirX * 35;
    const swipeY = py + dirY * 35;

    for (let i = 0; i < 8; i++) {
      const part = new CombatParticle(swipeX, swipeY, pColor, 2.5);
      part.vx = dirX * 5 + (Math.random() - 0.5) * 3;
      part.vy = dirY * 5 + (Math.random() - 0.5) * 3;
      particlesRef.current.push(part);
    }

    // Check hit collision
    let hitSomething = false;
    const basicAttackRange = currentActiveChar.equippedWeaponName?.includes('Calamity Blaze') ? 60 :
                             currentActiveChar.equippedWeaponName?.includes('Solar Wind Bow') ? 100 : 40;

    enemiesRef.current.forEach(enemy => {
      if (enemy.hp <= 0) return;
      const dx = enemy.x - swipeX;
      const dy = enemy.y - swipeY;
      const dist = Math.hypot(dx, dy);

      if (dist < basicAttackRange + enemy.radius) {
        // Cryo resonance: +15% Crit Rate against Frozen/Cryo targets
        const has2Cryo = loopStateRef.current.activeResonances.some(r => r.key === 'cryo');
        let charCritRate = currentActiveChar.critRate;
        if (has2Cryo && (enemy.activeElements.includes('Cryo') || enemy.isFrozen > 0)) {
          charCritRate += 0.15;
        }

        // Royal Claymore focus stacks: +8% Crit Rate per stack
        if (currentActiveChar.equippedWeaponName?.includes('Royal Claymore')) {
          const stacks = currentActiveChar.royalStacks || 0;
          charCritRate += stacks * 0.08;
        }

        // Vigorous (Harbinger of Dawn): when HP is above 90%, +14% Crit Rate
        if (currentActiveChar.equippedWeaponName?.includes('Harbinger of Dawn') && (currentActiveChar.currentHp / currentActiveChar.maxHp >= 0.90)) {
          charCritRate += 0.14;
        }

        const crit = Math.random() < charCritRate;
        let baseDmg = currentActiveChar.atk * currentActiveChar.skills.basic.damageMultiplier;

        // White Tassel passive: +24% Normal Attack damage
        if (currentActiveChar.equippedWeaponName?.includes('White Tassel')) {
          baseDmg *= 1.24;
        }

        // Crescent Pike infusion flat damage
        if (currentActiveChar.equippedWeaponName?.includes('Crescent Pike') && currentActiveChar.crescentPikeTimer > 0) {
          baseDmg += currentActiveChar.atk * 0.20;
        }

        if (crit) {
          baseDmg *= (1 + currentActiveChar.critDmg);
          // Royal Claymore reset stacks on crit
          if (currentActiveChar.equippedWeaponName?.includes('Royal Claymore')) {
            currentActiveChar.royalStacks = 0;
          }
        } else {
          // Royal Claymore add stack on non-crit hit
          if (currentActiveChar.equippedWeaponName?.includes('Royal Claymore')) {
            currentActiveChar.royalStacks = Math.min(5, (currentActiveChar.royalStacks || 0) + 1);
          }
        }

        applySkillDamage(enemy, baseDmg, currentActiveChar.element, false, crit, 'basic');

        // Primordial Jade Spear double strike combo
        if (currentActiveChar.equippedWeaponName?.includes('Primordial Jade') && (!currentActiveChar.spearDoubleCd || currentActiveChar.spearDoubleCd <= 0)) {
          applySkillDamage(enemy, baseDmg * 0.75, currentActiveChar.element, false, crit, 'basic');
          currentActiveChar.spearDoubleCd = 30; // 0.5s cd
          spawnTextRef.current(enemy.x + 10, enemy.y - 20, '⚔️ Dual Strike!', '#eab308', 10);
        }

        // Abyssal Ocean Scepter Bubble Splash
        if (currentActiveChar.equippedWeaponName?.includes('Abyssal Ocean Scepter') && (!currentActiveChar.scepterBubbleCd || currentActiveChar.scepterBubbleCd <= 0)) {
          enemiesRef.current.forEach(other => {
            if (other.hp > 0 && Math.hypot(other.x - enemy.x, other.y - enemy.y) < 90) {
              applySkillDamage(other, currentActiveChar.atk * 0.40, 'Hydro', false, false, 'basic');
            }
          });
          for (let k = 0; k < 12; k++) {
            particlesRef.current.push(new CombatParticle(enemy.x, enemy.y, '#3b82f6', 4));
          }
          currentActiveChar.scepterBubbleCd = 45; // 0.75s cd
          spawnTextRef.current(enemy.x, enemy.y - 30, '🌊 Bubble Splash!', '#3b82f6', 10);
        }

        // Debate Club Blunt conclusion AoE explosion
        if (currentActiveChar.equippedWeaponName?.includes('Debate Club') && currentActiveChar.debateClubTimer > 0 && (!currentActiveChar.debateClubCd || currentActiveChar.debateClubCd <= 0)) {
          enemiesRef.current.forEach(other => {
            if (other.hp > 0 && Math.hypot(other.x - enemy.x, other.y - enemy.y) < 75) {
              applySkillDamage(other, currentActiveChar.atk * 0.60, currentActiveChar.element, false, false, 'basic');
            }
          });
          for (let k = 0; k < 10; k++) {
            particlesRef.current.push(new CombatParticle(enemy.x, enemy.y, '#e2e8f0', 3.5));
          }
          currentActiveChar.debateClubCd = 90; // 1.5s cd
          spawnTextRef.current(enemy.x, enemy.y - 25, '💥 Blunt conclusion!', '#e2e8f0', 10);
        }

        hitSomething = true;
      }
    });

    // Award energy build on every basic attack swing! Fills the gauge nicely
    setCombatParty(pList => pList.map((c, i) => {
      if (i === currentPartyIndex) {
        const has2Hydro = loopStateRef.current.activeResonances.some(r => r.key === 'hydro');
        const resonanceEnergyMult = has2Hydro ? 1.20 : 1.0;
        const energyMultiplier = (loopStateRef.current.dungeonMode && loopStateRef.current.dungeonBuffs.includes('Recharge Matrix') ? 1.5 : 1.0) * resonanceEnergyMult;
        const energyGain = (hitSomething ? 2 : 1) * energyMultiplier; // bonus reward for hitting targets
        return { ...c, ultimateEnergy: Math.min(c.ultimateMaxEnergy, c.ultimateEnergy + energyGain) };
      }
      return c;
    }));
  };

  const applySkillDamage = (enemy: any, baseDmg: number, type: ElementType, isUlt: boolean = false, isCrit: boolean = false, source: 'basic' | 'skill' | 'ultimate' = 'skill') => {
    const { combatParty: currentParty, activePartyIndex: currentPartyIndex, shieldWeight: currentShieldWeight } = loopStateRef.current;
    const currentActiveChar = currentParty[currentPartyIndex] || null;
    if (!currentActiveChar) return;

    let finalDmg = baseDmg;

    // Apply Widsith theme song buff
    if (currentActiveChar.widsithBuffTimer && currentActiveChar.widsithBuffTimer > 0) {
      if (currentActiveChar.widsithBuffAtk && currentActiveChar.widsithBuffAtk > 0) {
        finalDmg *= (1 + currentActiveChar.widsithBuffAtk);
      }
      if (currentActiveChar.widsithBuffEle && currentActiveChar.widsithBuffEle > 0) {
        finalDmg *= (1 + currentActiveChar.widsithBuffEle);
      }
    }

    // Apply Thrilling Tales buff
    if (currentActiveChar.swapBuffTimer && currentActiveChar.swapBuffTimer > 0 && currentActiveChar.swapBuffAtk) {
      finalDmg *= (1 + currentActiveChar.swapBuffAtk);
    }

    // Apply Solar Searing Blade (+10% elemental damage)
    if (currentActiveChar.equippedWeaponName?.includes('Solar Searing Blade')) {
      finalDmg *= 1.10;
    }

    // Apply 4 Unique element resonance (+15% DMG)
    const has4Unique = loopStateRef.current.activeResonances.some(r => r.key === 'unique');
    if (has4Unique) {
      finalDmg *= 1.15;
    }

    // Apply 2 Geo resonance (+15% DMG when protected by a shield)
    const has2Geo = loopStateRef.current.activeResonances.some(r => r.key === 'geo');
    if (has2Geo && currentShieldWeight > 0) {
      finalDmg *= 1.15;
    }

    let reactionName = '';
    let damageColor = '#ffffff';

    // Apply weather Pyro damage multiplier (+10% under Sunny weather)
    if (weatherRef.current === 'Sunny' && type === 'Pyro') {
      finalDmg *= 1.1;
    }

    // Apply element reaction engine
    const activeDebuffs = enemy.activeElements as ElementType[];

    // --- APPLY CONDITIONAL WEAPON DAMAGE MODIFIERS ---
    // Cool Steel (+12% DMG against Hydro/Cryo affected targets)
    if (currentActiveChar.equippedWeaponName?.includes('Cool Steel') && 
        (activeDebuffs.includes('Hydro') || activeDebuffs.includes('Cryo') || enemy.isFrozen > 0)) {
      finalDmg *= 1.12;
    }

    // Bloodtainted Greatsword (+16% DMG against Pyro/Electro affected targets)
    if (currentActiveChar.equippedWeaponName?.includes('Bloodtainted Greatsword') && 
        (activeDebuffs.includes('Pyro') || activeDebuffs.includes('Electro'))) {
      finalDmg *= 1.16;
    }

    // Raven Bow (+12% DMG against Pyro/Hydro affected targets)
    if (currentActiveChar.equippedWeaponName?.includes('Raven Bow') && 
        (activeDebuffs.includes('Pyro') || activeDebuffs.includes('Hydro'))) {
      finalDmg *= 1.12;
    }

    // Magic Guide (+12% DMG against Hydro/Electro affected targets)
    if (currentActiveChar.equippedWeaponName?.includes('Magic Guide') && 
        (activeDebuffs.includes('Hydro') || activeDebuffs.includes('Electro'))) {
      finalDmg *= 1.12;
    }

    // Dragon's Bane (+20% DMG against Hydro/Pyro affected targets)
    if (currentActiveChar.equippedWeaponName?.includes('Dragon\'s Bane') && 
        (activeDebuffs.includes('Hydro') || activeDebuffs.includes('Pyro'))) {
      finalDmg *= 1.20;
    }

    // Black Tassel (+40% DMG against slimes)
    if (currentActiveChar.equippedWeaponName?.includes('Black Tassel') && 
        enemy.name?.toLowerCase().includes('slime')) {
      finalDmg *= 1.40;
    }

    // Calamity Blaze staggered knockback
    if (currentActiveChar.equippedWeaponName?.includes('Calamity Blaze')) {
      const pushAngle = Math.atan2(enemy.y - playerRef.current.y, enemy.x - playerRef.current.x);
      enemy.x = Math.max(50, Math.min(WORLD_WIDTH - 50, enemy.x + Math.cos(pushAngle) * 35));
      enemy.y = Math.max(50, Math.min(WORLD_HEIGHT - 50, enemy.y + Math.sin(pushAngle) * 35));
    }

    // Favonius Windfall energy generation
    if (isCrit && currentActiveChar.equippedWeaponName?.includes('Favonius') && Math.random() < 0.60) {
      setCombatParty(pList => pList.map((c, i) => {
        if (i === currentPartyIndex) {
          return { ...c, ultimateEnergy: Math.min(c.ultimateMaxEnergy, c.ultimateEnergy + 6) };
        }
        return c;
      }));
      spawnTextRef.current(playerRef.current.x, playerRef.current.y - 30, '+6 ENERGY ⚡', '#a855f7', 10);
    }

    // Sacrificial Cooldown Reset
    if (source === 'skill' && currentActiveChar.equippedWeaponName?.includes('Sacrificial') && (!currentActiveChar.sacrificialCooldown || currentActiveChar.sacrificialCooldown <= 0)) {
      if (Math.random() < 0.40) {
        setCombatParty(pList => pList.map((c, i) => {
          if (i === currentPartyIndex) {
            return { ...c, skillCooldownRemaining: 0, sacrificialCooldown: 1800 }; // 30s cd
          }
          return c;
        }));
        spawnTextRef.current(playerRef.current.x, playerRef.current.y - 45, '🔄 SACRIFICIAL RESET!', '#38bdf8', 12, true);
      }
    }
    const index = activeDebuffs.indexOf(type);
    
    // Check Shatter Combo (Frozen State broken by heavy elemental strikes)
    if (enemy.isFrozen > 0 && (type === 'Anemo' || type === 'Geo' || type === 'Pyro' || type === 'Electro')) {
      finalDmg = Math.round(finalDmg * 2.6);
      enemy.isFrozen = 0; // shatter breaks freeze
      reactionName = '🌀❄️ TRIPLE HYPER-BLIZZARD SHATTER! ❄️🌀';
      damageColor = '#bae6fd';
      onIncrementStat('reactions');

      // Blast gorgeous ice particles
      for (let i = 0; i < 28; i++) {
        particlesRef.current.push(new CombatParticle(enemy.x, enemy.y, '#bae6fd', 4.5));
        particlesRef.current.push(new CombatParticle(enemy.x, enemy.y, '#38bdf8', 3));
      }

      // Freeze and shock all other combatants in area limits
      enemiesRef.current.forEach(other => {
        if (other.id !== enemy.id && other.hp > 0) {
          const bDist = Math.hypot(other.x - enemy.x, other.y - enemy.y);
          if (bDist < 160) {
            other.hp = Math.max(0, other.hp - 600);
            other.isFrozen = 120; // secondary freeze loop
            spawnTextRef.current(other.x, other.y - 25, `600 ❄️ FREZ!`, '#38bdf8', 11, false);
          }
        }
      });
    }
    else if (activeDebuffs.length > 0 && !activeDebuffs.includes(type)) {
      // Hydro + Pyro = Vaporize (2x damage)
      if ((activeDebuffs.includes('Hydro') && type === 'Pyro') || (activeDebuffs.includes('Pyro') && type === 'Hydro')) {
        finalDmg *= 2;
        reactionName = 'VAPORIZE (2x!)';
        damageColor = '#f97316';
        onIncrementStat('reactions');
        // Clear elements
        enemy.activeElements = [];
      }
      // Hydro + Cryo = Frozen (Freeze 3.5s)
      else if ((activeDebuffs.includes('Hydro') && type === 'Cryo') || (activeDebuffs.includes('Cryo') && type === 'Hydro')) {
        enemy.isFrozen = 200; // freeze timer frames
        reactionName = '🎨 FROZEN! 🎨';
        damageColor = '#38bdf8';
        onIncrementStat('reactions');
        enemy.activeElements = [];
      }
      // Dendro + Hydro = Bloom Eruption
      else if ((activeDebuffs.includes('Dendro') && type === 'Hydro') || (activeDebuffs.includes('Hydro') && type === 'Dendro')) {
        finalDmg += 750;
        reactionName = '🌿 BLOOM ERUPTION! 🌿';
        damageColor = '#22c55e';
        onIncrementStat('reactions');
        enemy.activeElements = [];

        // Spawn glorious core bloom green/hydro explosion particles
        for(let i = 0; i < 15; i++) {
          particlesRef.current.push(new CombatParticle(enemy.x, enemy.y, '#22c55e', 4.5));
          particlesRef.current.push(new CombatParticle(enemy.x, enemy.y, '#3b82f6', 3.5));
        }

        // Deal splash damage to all other targets!
        enemiesRef.current.forEach(other => {
          if (other.id !== enemy.id && other.hp > 0) {
            const splDist = Math.hypot(other.x - enemy.x, other.y - enemy.y);
            if (splDist < 120) {
              other.hp = Math.max(0, other.hp - 450);
              const isOtherCrit = Math.random() < 0.15;
              spawnTextRef.current(other.x, other.y - 20, `${isOtherCrit ? 'CRIT ' : ''}450 🌿`, '#22c55e', 11, isOtherCrit);
            }
          }
        });
      }
      // Dendro + Electro = Hyperbloom Quasar
      else if ((activeDebuffs.includes('Dendro') && type === 'Electro') || (activeDebuffs.includes('Electro') && type === 'Dendro')) {
        finalDmg = Math.round(finalDmg * 2.3);
        reactionName = '⚡ HYPERBLOOM QUASAR ⚡';
        damageColor = '#10b981';
        onIncrementStat('reactions');
        enemy.activeElements = [];

        // Trigger chain sparks to all nearby slimes!
        let sparkTargets = 0;
        enemiesRef.current.forEach(other => {
          if (other.id !== enemy.id && other.hp > 0 && sparkTargets < 3) {
            const chDist = Math.hypot(other.x - enemy.x, other.y - enemy.y);
            if (chDist < 150) {
              sparkTargets++;
              const shockDmg = Math.round(finalDmg * 0.4);
              other.hp = Math.max(0, other.hp - shockDmg);
              spawnTextRef.current(other.x, other.y - 12, `${shockDmg} ⚡`, '#a855f7', 10, false);
              for(let j = 0; j < 6; j++) {
                particlesRef.current.push(new CombatParticle(other.x, other.y, '#a855f7', 3));
              }
            }
          }
        });
      }
      // Pyro + Electro = Overloaded (Knockback + Red crit explosion)
      else if ((activeDebuffs.includes('Pyro') && type === 'Electro') || (activeDebuffs.includes('Electro') && type === 'Pyro')) {
        finalDmg += 400;
        reactionName = '💥 OVERLOADED 💥';
        damageColor = '#ec4899';
        onIncrementStat('reactions');
        // Shunt/push coordinates
        const pushAngle = Math.atan2(enemy.y - playerRef.current.y, enemy.x - playerRef.current.x);
        enemy.x += Math.cos(pushAngle) * 50;
        enemy.y += Math.sin(pushAngle) * 50;
        enemy.activeElements = [];
      }
      // Cryo + Pyro = Melt (2x damage)
      else if ((activeDebuffs.includes('Cryo') && type === 'Pyro') || (activeDebuffs.includes('Pyro') && type === 'Cryo')) {
        finalDmg *= 2;
        reactionName = 'MELT (2x!)';
        damageColor = '#f59e0b';
        onIncrementStat('reactions');
        enemy.activeElements = [];
      }
      // Hydro + Electro = Electro-Charged (Continuous tick shock & chain)
      else if ((activeDebuffs.includes('Hydro') && type === 'Electro') || (activeDebuffs.includes('Electro') && type === 'Hydro')) {
        finalDmg += 300;
        reactionName = '⚡ ELECTRO-CHARGED ⚡';
        damageColor = '#a855f7';
        onIncrementStat('reactions');
        enemy.activeElements = [];

        // Spark chains to nearby targets
        let shockCount = 0;
        enemiesRef.current.forEach(other => {
          if (other.id !== enemy.id && other.hp > 0 && shockCount < 3) {
            const dist = Math.hypot(other.x - enemy.x, other.y - enemy.y);
            if (dist < 150) {
              shockCount++;
              const chainDmg = 250;
              other.hp = Math.max(0, other.hp - chainDmg);
              spawnTextRef.current(other.x, other.y - 12, `${chainDmg} ⚡`, '#a855f7', 10);
              if (!other.activeElements.includes('Electro')) {
                other.activeElements.push('Electro');
              }
            }
          }
        });
      }
      // Cryo + Electro = Superconduct (DEF Shred applied)
      else if ((activeDebuffs.includes('Cryo') && type === 'Electro') || (activeDebuffs.includes('Electro') && type === 'Cryo')) {
        finalDmg += 200;
        reactionName = '⚡ SUPERCONDUCT (DEF SHRED) ⚡';
        damageColor = '#c084fc';
        onIncrementStat('reactions');
        enemy.activeElements = [];
        enemy.defShredTimer = 300; // 5 seconds at 60 FPS
      }
      // Dendro + Pyro = Burning
      else if ((activeDebuffs.includes('Dendro') && type === 'Pyro') || (activeDebuffs.includes('Pyro') && type === 'Dendro')) {
        enemy.burningTicks = 120; // 120 frames tick damage
        reactionName = '🔥 BURNING 🔥';
        damageColor = '#e11d48';
        enemy.activeElements = [];
      }
      // Geo + any Element = Crystallize drops
      else if (type === 'Geo') {
        const shardElement = activeDebuffs[0]; // grab the trigger
        shardsRef.current.push(new CrystalShard(enemy.x, enemy.y, shardElement, getElementColorHex(shardElement)));
        reactionName = '💎 CRYSTALLIZE SHARD DROPPED 💎';
        damageColor = '#eab308';
        onIncrementStat('reactions');
        enemy.activeElements = [];
      }
      // Anemo + any Element = Swirl spreads and consumes elements
      else if (type === 'Anemo') {
        const swirledElement = activeDebuffs[0];
        reactionName = '🌀 SWIRL SPLASH! 🌀';
        damageColor = '#34d399';
        onIncrementStat('reactions');

        // Spread swirled elemental application to nearby slimes
        enemiesRef.current.forEach(other => {
          if (other.id !== enemy.id && other.hp > 0) {
            const odx = other.x - enemy.x;
            const ody = other.y - enemy.y;
            if (Math.hypot(odx, ody) < 150) {
              if (!other.activeElements.includes(swirledElement)) {
                other.activeElements.push(swirledElement);
              }
            }
          }
        });

        enemy.activeElements = []; // consume swirled element
      }
    } else if (!activeDebuffs.includes(type) && source !== 'basic') {
      // Only skills and ultimates apply element statuses — basic attacks do not stack new debuffs
      enemy.activeElements.push(type);
    }

    // Trigger screen shake on reactions
    if (reactionName && screenShakeEnabled) {
      const intensity = isUlt ? 8 : 4;
      shakeRef.current.intensity = intensity;
      shakeRef.current.x = (Math.random() - 0.5) * intensity;
      shakeRef.current.y = (Math.random() - 0.5) * intensity;
    }

    // Apply Superconduct DEF Shred damage multiplier (+40% DMG)
    if (enemy.defShredTimer && enemy.defShredTimer > 0) {
      finalDmg = Math.round(finalDmg * 1.4);
    }

    // Decrease enemy HP
    finalDmg = Math.round(finalDmg);
    enemy.hp = Math.max(0, enemy.hp - finalDmg);
    
    // Play crispy hit sound!
    AetheriaAudioEngine.playHit();
    
    // Apply Vampiric Grace dungeon healing buff (3% of damage)
    if (loopStateRef.current.dungeonMode && loopStateRef.current.dungeonBuffs.includes('Vampiric Grace')) {
      const healAmount = Math.round(finalDmg * 0.03);
      if (healAmount > 0) {
        const { activePartyIndex: currentPartyIndex } = loopStateRef.current;
        setCombatParty(pList => pList.map((c, i) => {
          if (i === currentPartyIndex) {
            return { ...c, currentHp: Math.min(c.maxHp, c.currentHp + healAmount) };
          }
          return c;
        }));
        spawnTextRef.current(playerRef.current.x + (Math.random() - 0.5) * 20, playerRef.current.y - 30, `+${healAmount} HP`, '#10b981', 11);
      }
    }

    // Floating damage integer (DOM Floaters)
    const finalTextColor = isCrit ? '#facc15' : damageColor;
    spawnTextRef.current(
      enemy.x + (Math.random() - 0.5) * 30,
      enemy.y - enemy.radius - 10,
      `${isCrit ? 'CRIT ' : ''}${finalDmg}`,
      finalTextColor,
      isCrit ? 19 : 14,
      isCrit
    );

    if (reactionName) {
      spawnTextRef.current(enemy.x, enemy.y - enemy.radius - 35, reactionName, damageColor, 12, false);
    }

    // Death hook checking
    if (enemy.hp <= 0) {
      setGameScore(s => s + 100);
      onIncrementStat('enemiesDefeated');

      // Drop crystal shield shards on enemy death
      if (Math.random() < 0.45 && shardsRef.current.length < 5) {
        shardsRef.current.push(new CrystalShard(enemy.x, enemy.y, type, getElementColorHex(type)));
      }

      // Hero's Wit drop on enemy kill (30% chance per enemy, 1 book)
      if (!dungeonMode && Math.random() < 0.30) {
        onAddItems?.('char_xp', 1);
        spawnFloatingDamageText(enemy.x, enemy.y - 20, `📖 +1 Hero's Wit`, '#a78bfa', 11, false);
      }

      // Check if boss beaten
      if (enemy.type === 'Boss') {
        onIncrementStat('bossesBeaten');
        onEarnRewards(500, 25000, 150); // Massive boss payout!
        // Hero's Wit bonus on boss kill
        if (!dungeonMode) onAddItems?.('char_xp', 8);
        setBossHp(0);
        AetheriaAudioEngine.setBossFightActive(false);
        spawnTextRef.current(enemy.x, enemy.y, `🏆 ${enemy.name.toUpperCase()} DEFEATED! 🏆`, '#f59e0b', 24, true);
      } else {
        onEarnRewards(50, 400, 15); // Standard mob payout
      }

      // Dynamic automatic wave advancement check
      const anyAlive = enemiesRef.current.some(e => e.id !== enemy.id && e.hp > 0);
      if (!anyAlive && !waveClearMessage) {
        if (dungeonMode) {
          setDungeonVictory(true);
          AetheriaAudioEngine.playWaveClear();
          spawnTextRef.current(400, 200, '🏆 ROOM CLEANSED! 🏆', '#10b981', 20, true);
        } else {
          const rewardGems = 40 + currentWave * 15;
          const rewardMora = 500 + currentWave * 200;
          const rewardExp = 30 + currentWave * 15;
          
          AetheriaAudioEngine.playWaveClear();
          onEarnRewards(rewardGems, rewardMora, rewardExp);

          // Award Hero's Wit books on wave clear: 1 + 1 per 3 waves
          const witReward = 1 + Math.floor(currentWave / 3);
          onAddItems?.('char_xp', witReward);
          spawnFloatingDamageText(playerRef.current.x, playerRef.current.y - 60, `📖 +${witReward} Hero's Wit`, '#a78bfa', 13, true);

          const nextWave = currentWave + 1;
          if (onUpdateHighScore) {
            onUpdateHighScore(currentWave, gameScore + 200);
          }

          setWaveClearMessage(`WAVE ${currentWave} SECURED! +${rewardGems} Gems / +${rewardMora} Mora / +${rewardExp} XP`);
          setTimeout(() => {
            setWaveClearMessage(null);
            triggerSpawnWave(nextWave);
          }, 2200);
        }
      }
    }
  };

  // Main Loop logic animation
  useEffect(() => {
    let animationId: number;
    let lastFrameTime = performance.now();
    const ctx = canvasRef.current?.getContext('2d');

    const updateGameLoop = () => {
      const {
        combatParty: currentParty,
        activePartyIndex: currentPartyIndex,
        isParrying: currentIsParrying,
        shieldActive: currentShieldActive,
        shieldWeight: currentShieldWeight,
        dimensions: currentDimensions,
        isDashing: currentIsDashing,
        timeDisordered: currentTimeDisordered,
        isPaused: currentIsPaused,
        isGameOver: currentIsGameOver,
        battleStarted: currentBattleStarted,
        countdownValue: currentCountdownValue,
        fpsLimit: currentFpsLimit,
        isUltCutsceneActive: currentIsUltCutsceneActive
      } = loopStateRef.current;

      const currentActiveChar = currentParty[currentPartyIndex] || null;
      if (!ctx || !canvasRef.current || !currentActiveChar) {
        animationId = requestAnimationFrame(updateGameLoop);
        return;
      }

      const now = performance.now();
      const delta = now - lastFrameTime;
      const targetDelta = 1000 / 60; // 16.666ms

      if (currentFpsLimit === '60') {
        if (delta < targetDelta) {
          animationId = requestAnimationFrame(updateGameLoop);
          return;
        }
        // Adjust lastFrameTime to stay in sync
        lastFrameTime = now - (delta % targetDelta);
      } else {
        lastFrameTime = now;
      }

      if (!currentBattleStarted || currentIsPaused || currentIsGameOver || currentCountdownValue !== null || currentIsUltCutsceneActive) {
        // Redraw current frozen state but add a beautiful overlay
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.05)'; // Very faint fade transition look
        ctx.fillRect(0, 0, currentDimensions.width, currentDimensions.height);
        
        if (currentCountdownValue === null) {
          ctx.fillStyle = '#6366f1';
          ctx.font = 'bold 20px "Space Grotesk", sans-serif';
          ctx.textAlign = 'center';
          if (currentIsGameOver) {
            ctx.fillText('🎮 GAME OVER 🎮', currentDimensions.width / 2, currentDimensions.height / 2);
          } else if (currentIsPaused) {
            ctx.fillText('⏸️ GAME PAUSED ⏸️', currentDimensions.width / 2, currentDimensions.height / 2);
          } else {
            ctx.fillText('⚔️ PREPARING COMBAT ⚔️', currentDimensions.width / 2, currentDimensions.height / 2);
          }
        }
        ctx.restore();

        animationId = requestAnimationFrame(updateGameLoop);
        return;
      }

      // Keep bossHp and bossMaxHp in sync with the boss in enemiesRef.current
      const currentBoss = enemiesRef.current.find(e => e.type === 'Boss');
      if (currentBoss) {
        setBossHp(prev => (prev !== currentBoss.hp ? currentBoss.hp : prev));
        setBossMaxHp(prev => (prev !== currentBoss.maxHp ? currentBoss.maxHp : prev));
      } else {
        setBossHp(prev => (prev !== null ? null : prev));
      }

      // Weather Rotation timer (60fps * 20s = 1200 frames)
      weatherTimerRef.current -= 1 * combatSpeed;
      if (weatherTimerRef.current <= 0) {
        weatherTimerRef.current = 1200; // 20s
        setCurrentWeather(curr => {
          const weathers: ('Sunny' | 'Rain' | 'Thunderstorm' | 'Snow')[] = ['Sunny', 'Rain', 'Thunderstorm', 'Snow'];
          const idx = weathers.indexOf(curr);
          const nextIdx = (idx + 1) % weathers.length;
          const nextWeather = weathers[nextIdx];
          
          let msg = '';
          let color = '#fbbf24';
          if (nextWeather === 'Sunny') { msg = '☀️ WEATHER: SUNNY (Pyro DMG +10%)'; color = '#fb923c'; }
          else if (nextWeather === 'Rain') { msg = '🌧 WEATHER: RAIN (Wet status applied)'; color = '#38bdf8'; }
          else if (nextWeather === 'Thunderstorm') { msg = '⛈ WEATHER: THUNDERSTORM (Lightning hazards active)'; color = '#a855f7'; }
          else if (nextWeather === 'Snow') { msg = '❄ WEATHER: SNOW (Rapid stamina drain)'; color = '#67e8f9'; }
          
          weatherRef.current = nextWeather;
          AetheriaAudioEngine.updateWeatherBgm(nextWeather);
          spawnTextRef.current(400, 120, msg, color, 13, true);
          return nextWeather;
        });
      }

      // Apply Rain wetting ticks
      if (weatherRef.current === 'Rain') {
        rainTickRef.current += 1 * combatSpeed;
        if (rainTickRef.current >= 120) {
          rainTickRef.current = 0;
          enemiesRef.current.forEach(enemy => {
            if (enemy.hp > 0 && !enemy.activeElements.includes('Hydro')) {
              enemy.activeElements.push('Hydro');
              spawnTextRef.current(enemy.x, enemy.y - 20, '💧 WET 💧', '#3b82f6', 10);
            }
          });
        }
      }

      // Apply Thunderstorm lightning strikes
      if (weatherRef.current === 'Thunderstorm') {
        if (lightningStrikeVisualRef.current) {
          lightningStrikeVisualRef.current.duration -= 1 * combatSpeed;
          if (lightningStrikeVisualRef.current.duration <= 0) {
            lightningStrikeVisualRef.current = null;
          }
        }

        if (lightningWarningRef.current === null) {
          lightningTimerRef.current += 1 * combatSpeed;
          if (lightningTimerRef.current >= 210) { // every 3.5s
            lightningTimerRef.current = 0;
            let tx = Math.random() * WORLD_WIDTH;
            let ty = Math.random() * WORLD_HEIGHT;
            const rand = Math.random();
            if (rand < 0.4) {
              tx = playerRef.current.x;
              ty = playerRef.current.y;
            } else if (rand < 0.8 && enemiesRef.current.filter(e => e.hp > 0).length > 0) {
              const aliveEnemies = enemiesRef.current.filter(e => e.hp > 0);
              const randEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
              tx = randEnemy.x;
              ty = randEnemy.y;
            }
            lightningWarningRef.current = { x: tx, y: ty, timer: 50 };
          }
        } else {
          const warning = lightningWarningRef.current;
          warning.timer -= 1 * combatSpeed;
          
          if (warning.timer <= 0) {
            // Set lightning strike visual bolt duration (e.g. 6 frames)
            lightningStrikeVisualRef.current = { x: warning.x, y: warning.y, duration: 6 };
            
            for (let p = 0; p < 15; p++) {
              particlesRef.current.push(new CombatParticle(warning.x, warning.y, '#a855f7', 3.5));
            }
            
            const playerDist = Math.hypot(playerRef.current.x - warning.x, playerRef.current.y - warning.y);
            if (playerDist < 45 + playerRef.current.radius) {
              handlePlayerHit(null, 450);
              spawnTextRef.current(playerRef.current.x, playerRef.current.y, '⚡ LIGHTNING! -450', '#a855f7', 12, true);
            }
            
            enemiesRef.current.forEach(enemy => {
              if (enemy.hp > 0) {
                const enemyDist = Math.hypot(enemy.x - warning.x, enemy.y - warning.y);
                if (enemyDist < 45 + enemy.radius) {
                  enemy.hp = Math.max(0, enemy.hp - 1200);
                  if (!enemy.activeElements.includes('Electro')) {
                    enemy.activeElements.push('Electro');
                  }
                  spawnTextRef.current(enemy.x, enemy.y - 10, '1200 ⚡', '#a855f7', 12, true);
                  if (enemy.type === 'Boss') {
                    setBossHp(prev => (prev !== null ? Math.max(0, prev - 1200) : null));
                  }
                }
              }
            });
            
            if (screenShakeEnabled) {
              shakeRef.current.intensity = 10;
            }
            
            lightningWarningRef.current = null;
          }
        }
      } else {
        lightningStrikeVisualRef.current = null;
        lightningWarningRef.current = null;
      }

      // Local slow down factor for bullet frames
      const isBulletTime = currentTimeDisordered > 0;
      const speedModifier = isBulletTime ? 0.35 : 1.0;
      if (isBulletTime) setTimeDisordered(t => t - 1);

      // Decrement dodge and parry cooldowns (scaled by combatSpeed)
      if (dodgeCdRef.current > 0) {
        dodgeCdRef.current = Math.max(0, dodgeCdRef.current - 0.016 * combatSpeed);
        setDodgeCd(dodgeCdRef.current);
      }
      if (parryCdRef.current > 0) {
        parryCdRef.current = Math.max(0, parryCdRef.current - 0.016 * combatSpeed);
        setParryCd(parryCdRef.current);
      }

      // Clear Screen
      ctx.clearRect(0, 0, currentDimensions.width, currentDimensions.height);

      // Calculate camera scroll offsets to keep the player centered
      const camX = Math.max(0, Math.min(WORLD_WIDTH - currentDimensions.width, playerRef.current.x - currentDimensions.width / 2));
      const camY = Math.max(0, Math.min(WORLD_HEIGHT - currentDimensions.height, playerRef.current.y - currentDimensions.height / 2));

      ctx.save();

      // Apply screenshake
      if (shakeRef.current.intensity > 0.5) {
        const shakeMod = isMobile ? 0.5 : 1.0;
        ctx.translate(shakeRef.current.x * shakeMod, shakeRef.current.y * shakeMod);
        shakeRef.current.intensity *= 0.8;
        shakeRef.current.x = (Math.random() - 0.5) * shakeRef.current.intensity;
        shakeRef.current.y = (Math.random() - 0.5) * shakeRef.current.intensity;
      }

      // Apply camera translation
      ctx.translate(-camX, -camY);

      // Draw background board grid in world coordinates
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WORLD_WIDTH, y);
        ctx.stroke();
      }

      // Draw bounding arena wall in world coordinates
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.strokeRect(5, 5, WORLD_WIDTH - 10, WORLD_HEIGHT - 10);

      // Draw Sunny Weather Lens Flare in background (adjusted to viewport coordinates)
      if (weatherRef.current === 'Sunny') {
        const sunGrad = ctx.createRadialGradient(camX + currentDimensions.width * 0.85, 50, 10, camX + currentDimensions.width * 0.85, 50, 200);
        sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
        sunGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.02)');
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(camX, camY, currentDimensions.width, currentDimensions.height);
      }

      // --- PLAYER MOVEMENT CONTROL ---
      let dx = 0;
      let dy = 0;
      if (keyboardState.current['w'] || keyboardState.current['arrowup']) dy -= 1;
      if (keyboardState.current['s'] || keyboardState.current['arrowdown']) dy += 1;
      if (keyboardState.current['a'] || keyboardState.current['arrowleft']) dx -= 1;
      if (keyboardState.current['d'] || keyboardState.current['arrowright']) dx += 1;

      // Mobile joystick inputs overrides keyboard WASD
      const joystickActive = mobileJoystickState.current.active && Math.hypot(mobileJoystickState.current.x, mobileJoystickState.current.y) > 0.05;
      if (joystickActive) {
        dx = mobileJoystickState.current.x;
        dy = mobileJoystickState.current.y;
      }

      // Normalize speed
      const isMoving = dx !== 0 || dy !== 0;
      const isShiftHeld = keyboardState.current['shift'];
      const activeWeather = weatherRef.current;
      
      let runningSpeed = loopStateRef.current.dungeonMode && loopStateRef.current.dungeonBuffs.includes('Zephyr Pace') ? 2.5 * 1.15 : 2.5;
      
      if (isMoving && isShiftHeld && staminaRef.current > 0) {
        const sprintRate = loopStateRef.current.dungeonMode && loopStateRef.current.dungeonBuffs.includes('Zephyr Pace') ? 3.8 * 1.15 : 3.8;
        runningSpeed = sprintRate;
        const baseDrain = (15 / 60) * combatSpeed;
        const drainRate = activeWeather === 'Snow' ? baseDrain * 2.5 : baseDrain;
        staminaRef.current = Math.max(0, staminaRef.current - drainRate);
      } else {
        const baseRegen = (25 / 60) * combatSpeed;
        staminaRef.current = Math.min(100, staminaRef.current + baseRegen);
      }

      // Sync React state stamina periodically to avoid performance bottlenecks
      if (Math.random() < 0.1) {
        setStamina(Math.round(staminaRef.current));
      }

      if (isMoving) {
        const mag = Math.hypot(dx, dy);
        const has2Anemo = loopStateRef.current.activeResonances.some(r => r.key === 'anemo');
        const resonanceSpeedMultiplier = has2Anemo ? 1.15 : 1.0;
        let finalPlayerSpeed = currentIsDashing ? 8.2 : runningSpeed;
        
        const standsOnIcePatch = bossProjectilesRef.current.some(
          proj => proj.type === 'ice_patch' && Math.hypot(playerRef.current.x - proj.x, playerRef.current.y - proj.y) < proj.radius
        );
        if (standsOnIcePatch) {
          finalPlayerSpeed *= 0.5;
        }
        const currentSpeed = finalPlayerSpeed * speedModifier * resonanceSpeedMultiplier;
        playerRef.current.x = Math.max(25, Math.min(WORLD_WIDTH - 25, playerRef.current.x + (dx / mag) * currentSpeed));
        playerRef.current.y = Math.max(25, Math.min(WORLD_HEIGHT - 25, playerRef.current.y + (dy / mag) * currentSpeed));

        // Save last directional vectors
        playerRef.current.lastDirX = dx / mag;
        playerRef.current.lastDirY = dy / mag;

        // Add continuous trail walk particles depending on active element
        if (Math.random() < 0.25) {
          particlesRef.current.push(new CombatParticle(playerRef.current.x, playerRef.current.y, getElementColorHex(currentActiveChar.element), 2.5));
        }
      }

      // Draw stamina wheel next to player if not full (100)
      if (staminaRef.current < 100) {
        const stamPercent = staminaRef.current / 100;
        ctx.save();
        ctx.beginPath();
        // Draw background track
        ctx.arc(playerRef.current.x + playerRef.current.radius + 10, playerRef.current.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw active bar
        ctx.beginPath();
        ctx.arc(playerRef.current.x + playerRef.current.radius + 10, playerRef.current.y, 8, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * stamPercent));
        ctx.strokeStyle = activeWeather === 'Snow' ? '#38bdf8' : '#fbbf24'; // Cold cyan in snow, warm gold normally
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Automatically tick down character skill cooldowns (scaled by combatSpeed)
      // Automatically tick down character skill cooldowns and buff timers (scaled by combatSpeed)
      setCombatParty(pList => pList.map((c) => {
        let skillCD = c.skillCooldownRemaining;
        if (skillCD > 0) {
          skillCD = Math.max(0, skillCD - 0.016 * combatSpeed);
        }
        let sacCD = c.sacrificialCooldown || 0;
        if (sacCD > 0) {
          sacCD = Math.max(0, sacCD - 1 * combatSpeed);
        }
        let widsithCD = c.widsithCooldown || 0;
        if (widsithCD > 0) {
          widsithCD = Math.max(0, widsithCD - 1 * combatSpeed);
        }
        let widsithTimer = c.widsithBuffTimer || 0;
        if (widsithTimer > 0) {
          widsithTimer = Math.max(0, widsithTimer - 1 * combatSpeed);
        }
        let swapBuffTimer = c.swapBuffTimer || 0;
        if (swapBuffTimer > 0) {
          swapBuffTimer = Math.max(0, swapBuffTimer - 1 * combatSpeed);
        }
        let crescentPikeTimer = c.crescentPikeTimer || 0;
        if (crescentPikeTimer > 0) {
          crescentPikeTimer = Math.max(0, crescentPikeTimer - 1 * combatSpeed);
        }
        let debateClubTimer = c.debateClubTimer || 0;
        if (debateClubTimer > 0) {
          debateClubTimer = Math.max(0, debateClubTimer - 1 * combatSpeed);
        }
        let debateClubCd = c.debateClubCd || 0;
        if (debateClubCd > 0) {
          debateClubCd = Math.max(0, debateClubCd - 1 * combatSpeed);
        }
        let scepterBubbleCd = c.scepterBubbleCd || 0;
        if (scepterBubbleCd > 0) {
          scepterBubbleCd = Math.max(0, scepterBubbleCd - 1 * combatSpeed);
        }
        let spearDoubleCd = c.spearDoubleCd || 0;
        if (spearDoubleCd > 0) {
          spearDoubleCd = Math.max(0, spearDoubleCd - 1 * combatSpeed);
        }

        return {
          ...c,
          skillCooldownRemaining: skillCD,
          sacrificialCooldown: sacCD,
          widsithCooldown: widsithCD,
          widsithBuffTimer: widsithTimer,
          swapBuffTimer: swapBuffTimer,
          crescentPikeTimer: crescentPikeTimer,
          debateClubTimer: debateClubTimer,
          debateClubCd: debateClubCd,
          scepterBubbleCd: scepterBubbleCd,
          spearDoubleCd: spearDoubleCd
        };
      }));

      // --- UPDATE & DRAW BOSS PROJECTILES/HAZARDS ---
      const activeProjectiles: any[] = [];
      bossProjectilesRef.current.forEach(proj => {
        proj.timer -= 1 * combatSpeed;

        if (proj.vx !== undefined && proj.vy !== undefined) {
          proj.x += proj.vx * speedModifier * combatSpeed;
          proj.y += proj.vy * speedModifier * combatSpeed;
        }

        let isExpired = proj.timer <= 0;

        // Collision check with player
        const distToPlayer = Math.hypot(playerRef.current.x - proj.x, playerRef.current.y - proj.y);

        if (proj.type === 'fireball' || proj.type === 'ice_shard' || proj.type === 'lightning_orb') {
          if (distToPlayer < playerRef.current.radius + proj.radius) {
            handlePlayerHit(null, proj.damage);
            isExpired = true;

            // Spawn hit particles
            for (let i = 0; i < 8; i++) {
              particlesRef.current.push(new CombatParticle(proj.x, proj.y, proj.color, 2));
            }
          }
          // Out of bounds check
          if (proj.x < 0 || proj.x > 2000 || proj.y < 0 || proj.y > 2000) {
            isExpired = true;
          }
        } 
        else if (proj.type === 'ice_patch' || proj.type === 'fire_patch') {
          // Continuous damage check
          if (distToPlayer < proj.radius) {
            if (Math.floor(proj.timer) % 25 === 0) {
              handlePlayerHit(null, proj.damage);
            }
          }
        }
        else if (proj.type === 'meteor_warning' || proj.type === 'lightning_strike_warning') {
          if (isExpired) {
            // Detonate / strike!
            if (distToPlayer < proj.radius) {
              handlePlayerHit(null, proj.damage);
              if (proj.type === 'meteor_warning') {
                // Knockback player away from center of explosion
                const angle = Math.atan2(playerRef.current.y - proj.y, playerRef.current.x - proj.x);
                playerRef.current.x = Math.max(25, Math.min(WORLD_WIDTH - 25, playerRef.current.x + Math.cos(angle) * 75));
                playerRef.current.y = Math.max(25, Math.min(WORLD_HEIGHT - 25, playerRef.current.y + Math.sin(angle) * 75));
              }
            }
            // Spawn explosion particles
            const particleColor = proj.type === 'meteor_warning' ? '#dc2626' : '#a855f7';
            for (let i = 0; i < 20; i++) {
              const part = new CombatParticle(proj.x, proj.y, particleColor, proj.type === 'meteor_warning' ? 4.5 : 3);
              part.vx *= 2.2;
              part.vy *= 2.2;
              particlesRef.current.push(part);
            }
            if (proj.type === 'meteor_warning') {
              spawnTextRef.current(proj.x, proj.y, '💥 METEOR! 💥', '#f97316', 12, true);
            } else {
              spawnTextRef.current(proj.x, proj.y, '⚡ BOLT! ⚡', '#a855f7', 11, true);
            }
          }
        }

        // Draw projectile/hazard on canvas
        ctx.save();
        if (proj.type === 'fireball') {
          ctx.shadowBlur = 12;
          ctx.shadowColor = proj.color;
          ctx.fillStyle = proj.color;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (proj.type === 'ice_shard') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = proj.color;
          ctx.fillStyle = proj.color;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        else if (proj.type === 'lightning_orb') {
          ctx.shadowBlur = 15;
          ctx.shadowColor = proj.color;
          ctx.fillStyle = proj.color;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        else if (proj.type === 'fire_patch') {
          ctx.globalAlpha = 0.45;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        else if (proj.type === 'ice_patch') {
          ctx.globalAlpha = 0.45;
          ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        else if (proj.type === 'meteor_warning' || proj.type === 'lightning_strike_warning') {
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // expanding progress ring
          const pct = 1 - (proj.timer / proj.maxTimer);
          ctx.globalAlpha = 0.45;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius * pct, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        if (!isExpired) {
          activeProjectiles.push(proj);
        }
      });
      bossProjectilesRef.current = activeProjectiles;

      // --- DRAW CRYSTAL PICKUP SHARDS ---
      for (let i = shardsRef.current.length - 1; i >= 0; i--) {
        const shard = shardsRef.current[i];
        shard.draw(ctx);

        // Check magnet collision with player
        const collDist = Math.hypot(playerRef.current.x - shard.x, playerRef.current.y - shard.y);
        if (collDist < playerRef.current.radius + shard.radius) {
          // Grant custom bubble shield relative to element
          setShieldActive(shard.element);
          
          // Apply Bulwark Guard rogue-like buff (+40% shield strength) & Geo element resonance (+15%)
          const has2Geo = loopStateRef.current.activeResonances.some(r => r.key === 'geo');
          const geoMult = has2Geo ? 1.15 : 1.0;
          const baseShield = Math.round((loopStateRef.current.dungeonMode && loopStateRef.current.dungeonBuffs.includes('Bulwark Guard') ? 840 : 600) * geoMult);
          setShieldWeight(baseShield); // Shield HP buffer
          
          spawnFloatingDamageText(
            playerRef.current.x,
            playerRef.current.y - 30,
            `💎 SHIELD: ${shard.element.toUpperCase()} CORE! (${baseShield} HP)`,
            getElementColorHex(shard.element),
            11
          );

          // Crescent Pike infusion needle trigger
          setCombatParty(pList => pList.map((c, idx) => {
            if (idx === currentPartyIndex && c.equippedWeaponName?.includes('Crescent Pike')) {
              spawnFloatingDamageText(playerRef.current.x, playerRef.current.y - 45, '💉 INFUSION NEEDLE ACTIVE!', '#a78bfa', 11, true);
              return { ...c, crescentPikeTimer: 300 }; // 5s
            }
            return c;
          }));

          shardsRef.current.splice(i, 1);
        }
      }

      // --- ENEMIES AI AND DRAW STEP ---
      enemiesRef.current.forEach(enemy => {
        if (enemy.hp <= 0) return;

        // --- REAL BOSS MECHANICS AI STEP ---
        if (enemy.type === 'Boss') {
          // Detect phase transitions
          const hpPct = enemy.hp / enemy.maxHp;
          let newPhase = 1;
          if (hpPct <= 0.20) {
            newPhase = 3;
          } else if (hpPct <= 0.50) {
            newPhase = 2;
          }

          if (enemy.phase !== newPhase) {
            enemy.phase = newPhase;
            spawnTextRef.current(
              enemy.x,
              enemy.y - enemy.radius - 40,
              `⚠️ ${enemy.name.toUpperCase()} ENTERED PHASE ${newPhase}! ⚠️`,
              '#ef4444',
              16,
              true
            );
            if (screenShakeEnabled) {
              shakeRef.current.intensity = 15;
            }
          }

          // Attack logic
          if (enemy.attackCooldown === undefined) {
            enemy.attackCooldown = 0;
          }
          if (enemy.attackCooldown > 0) {
            enemy.attackCooldown -= 1 * combatSpeed;
          }

          const targetX = playerRef.current.x;
          const targetY = playerRef.current.y;
          const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);

          if (enemy.bossType === 'fire_dragon') {
            // FIRE DRAGON MECHANICS
            // Phase 1+: Fireballs every 110 frames
            if (enemy.attackCooldown <= 0) {
              enemy.attackCooldown = 110;
              const speed = 4.5;
              bossProjectilesRef.current.push({
                id: 'fireball_' + Date.now(),
                type: 'fireball',
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 12,
                damage: 260,
                element: 'Pyro',
                color: '#f97316',
                timer: 400
              });
              spawnTextRef.current(enemy.x, enemy.y - enemy.radius - 20, '🔥 Fireball!', '#f97316', 10);
            }

            // Phase 2+: Arena burns - spawn random fire patches
            if (enemy.phase >= 2) {
              if (enemy.firePatchTimer === undefined) enemy.firePatchTimer = 0;
              enemy.firePatchTimer += 1 * combatSpeed;
              if (enemy.firePatchTimer > 180) {
                enemy.firePatchTimer = 0;
                for (let k = 0; k < 3; k++) {
                  const px = targetX + (Math.random() - 0.5) * 350;
                  const py = targetY + (Math.random() - 0.5) * 350;
                  bossProjectilesRef.current.push({
                    id: 'fire_patch_' + Date.now() + '_' + k,
                    type: 'fire_patch',
                    x: px,
                    y: py,
                    radius: 45,
                    damage: 50,
                    element: 'Pyro',
                    color: '#ef4444',
                    timer: 300 // 5 seconds
                  });
                }
                spawnTextRef.current(enemy.x, enemy.y - enemy.radius - 25, '🔥 Arena Burns!', '#ef4444', 11);
              }
            }

            // Phase 3: Meteor attack - falling meteors
            if (enemy.phase === 3) {
              if (enemy.meteorTimer === undefined) enemy.meteorTimer = 0;
              enemy.meteorTimer += 1 * combatSpeed;
              if (enemy.meteorTimer > 90) {
                enemy.meteorTimer = 0;
                bossProjectilesRef.current.push({
                  id: 'meteor_' + Date.now(),
                  type: 'meteor_warning',
                  x: targetX,
                  y: targetY,
                  radius: 70,
                  damage: 600,
                  element: 'Pyro',
                  color: '#dc2626',
                  timer: 60, // 1s warning
                  maxTimer: 60
                });
                spawnTextRef.current(enemy.x, enemy.y - enemy.radius - 30, '💥 Meteors Falling!', '#dc2626', 12, true);
              }
            }
          } 
          else if (enemy.bossType === 'ice_golem') {
            // ICE GOLEM MECHANICS
            // Phase 1+: Ice shards spread every 130 frames
            if (enemy.attackCooldown <= 0) {
              enemy.attackCooldown = 130;
              const speed = 4.0;
              const angles = [angle - 0.25, angle, angle + 0.25];
              angles.forEach((ang, idx) => {
                bossProjectilesRef.current.push({
                  id: 'ice_shard_' + Date.now() + '_' + idx,
                  type: 'ice_shard',
                  x: enemy.x,
                  y: enemy.y,
                  vx: Math.cos(ang) * speed,
                  vy: Math.sin(ang) * speed,
                  radius: 10,
                  damage: 220,
                  element: 'Cryo',
                  color: '#38bdf8',
                  timer: 400
                });
              });
              spawnTextRef.current(enemy.x, enemy.y - enemy.radius - 20, '❄️ Ice Shards!', '#38bdf8', 10);
            }

            // Phase 2+: Blizzard - spawn cold ice patches
            if (enemy.phase >= 2) {
              if (enemy.icePatchTimer === undefined) enemy.icePatchTimer = 0;
              enemy.icePatchTimer += 1 * combatSpeed;
              if (enemy.icePatchTimer > 200) {
                enemy.icePatchTimer = 0;
                for (let k = 0; k < 2; k++) {
                  const px = targetX + (Math.random() - 0.5) * 300;
                  const py = targetY + (Math.random() - 0.5) * 300;
                  bossProjectilesRef.current.push({
                    id: 'ice_patch_' + Date.now() + '_' + k,
                    type: 'ice_patch',
                    x: px,
                    y: py,
                    radius: 50,
                    damage: 40,
                    element: 'Cryo',
                    color: '#bae6fd',
                    timer: 360 // 6 seconds
                  });
                }
                spawnTextRef.current(enemy.x, enemy.y - enemy.radius - 25, '❄️ Blizzard slow fields!', '#bae6fd', 11);
              }
            }

            // Phase 3: Frozen Tomb field
            if (enemy.phase === 3) {
              const playerDist = Math.hypot(targetX - enemy.x, targetY - enemy.y);
              if (playerDist < 250) {
                if (Math.random() < 0.05) {
                  handlePlayerHit(null, 100);
                  spawnTextRef.current(targetX, targetY - 20, '❄️ FROZEN FIELD -100', '#0284c7', 10);
                }
              }

              ctx.save();
              ctx.globalAlpha = 0.08;
              ctx.fillStyle = '#0284c7';
              ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(enemy.x, enemy.y, 250, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.restore();
            }
          }
          else if (enemy.bossType === 'thunderbird') {
            // TEMPEST THUNDERBIRD MECHANICS
            // Phase 1+: Rapid lightning warnings/strikes every 90 frames
            if (enemy.attackCooldown <= 0) {
              enemy.attackCooldown = 90;
              bossProjectilesRef.current.push({
                id: 'lightning_' + Date.now(),
                type: 'lightning_strike_warning',
                x: targetX,
                y: targetY,
                radius: 40,
                damage: 280,
                element: 'Electro',
                color: '#a855f7',
                timer: 45, // 0.75s warning
                maxTimer: 45
              });
              spawnTextRef.current(enemy.x, enemy.y - enemy.radius - 20, '⚡ Lightning strike targeting!', '#a855f7', 10);
            }

            // Phase 2+: Lightning walls
            if (enemy.phase >= 2) {
              if (enemy.lightningWallTimer === undefined) enemy.lightningWallTimer = 0;
              enemy.lightningWallTimer += 1 * combatSpeed;
              if (enemy.lightningWallTimer > 210) {
                enemy.lightningWallTimer = 0;
                const offsets = [
                  { dx: -120, dy: 60 },
                  { dx: 120, dy: 60 },
                  { dx: 0, dy: -120 }
                ];
                offsets.forEach((off, idx) => {
                  bossProjectilesRef.current.push({
                    id: 'lightning_wall_' + Date.now() + '_' + idx,
                    type: 'lightning_strike_warning',
                    x: targetX + off.dx,
                    y: targetY + off.dy,
                    radius: 35,
                    damage: 250,
                    element: 'Electro',
                    color: '#a855f7',
                    timer: 40,
                    maxTimer: 40
                  });
                });
                spawnTextRef.current(enemy.x, enemy.y - enemy.radius - 25, '⚡ Lightning Wall!', '#a855f7', 11);
              }
            }

            // Phase 3: Continuous thunderstorm strikes
            if (enemy.phase === 3) {
              if (enemy.thunderstormTimer === undefined) enemy.thunderstormTimer = 0;
              enemy.thunderstormTimer += 1 * combatSpeed;
              if (enemy.thunderstormTimer > 45) {
                enemy.thunderstormTimer = 0;
                bossProjectilesRef.current.push({
                  id: 'thunderstorm_' + Date.now(),
                  type: 'lightning_strike_warning',
                  x: targetX + (Math.random() - 0.5) * 60,
                  y: targetY + (Math.random() - 0.5) * 60,
                  radius: 30,
                  damage: 320,
                  element: 'Electro',
                  color: '#a855f7',
                  timer: 35,
                  maxTimer: 35
                });
              }
            }
          }
        }

        // Apply Superconduct DEF Shred timer checks
        if (enemy.defShredTimer && enemy.defShredTimer > 0) {
          enemy.defShredTimer -= 1 * combatSpeed;
          // Draw a dotted purple ring around shred-debuffed enemies
          ctx.save();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Check freeze status bypass
        if (enemy.isFrozen > 0) {
          enemy.isFrozen -= 1;
          // Draw frozen visual overlay iceblock cube
          ctx.save();
          ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.fillRect(enemy.x - enemy.radius - 4, enemy.y - enemy.radius - 4, enemy.radius * 2 + 8, enemy.radius * 2 + 8);
          ctx.strokeRect(enemy.x - enemy.radius - 4, enemy.y - enemy.radius - 4, enemy.radius * 2 + 8, enemy.radius * 2 + 8);
          ctx.restore();
          
          // Render frozen enemy icon details
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#bae6fd';
          ctx.fill();
          return; // Skip AI chase movement while frozen
        }

        // Apply burning continuous tick damage checks
        if (enemy.burningTicks > 0) {
          enemy.burningTicks -= 1;
          if (enemy.burningTicks % 20 === 0) {
            enemy.hp = Math.max(0, enemy.hp - 20);
            textsRef.current.push(new FloatingDamageText(enemy.x + (Math.random() - 0.5) * 15, enemy.y - enemy.radius, '20 🔥', '#f43f5e', 11));
          }
        }

        // AI Chasing logic
        const angleToPlayer = Math.atan2(playerRef.current.y - enemy.y, playerRef.current.x - enemy.x);
        // Apply a global 0.6x speed slowdown to make overall wave enemies slower as requested
        const globalWaveEnemySlowerMultiplier = 0.6;
        enemy.x += Math.cos(angleToPlayer) * enemy.speed * speedModifier * globalWaveEnemySlowerMultiplier * combatSpeed;
        enemy.y += Math.sin(angleToPlayer) * enemy.speed * speedModifier * globalWaveEnemySlowerMultiplier * combatSpeed;

        // Increase Telegraph Attack counter metrics
        enemy.telegraphTimer++;
        if (enemy.telegraphTimer > 120) {
          enemy.telegraphTimer = 0; // reset
        }

        // --- RENDER DANGER RED TELEGRAPH THREATS (smaller enemy ranges) ---
        if (enemy.telegraphTimer > 60) {
          ctx.save();
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          if (enemy.telegraphType === 'line') {
            // Draw narrower rectangle attack column targeting player
            ctx.fillRect(enemy.x - 20, enemy.y - 6, 180, 12);
          } else {
            // Smaller circle shock zone
            ctx.arc(enemy.x, enemy.y, 50, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          // Telegraph detonates/swipes exactly at 115 frames — tighter detonation radius
          if (enemy.telegraphTimer === 115) {
            const dmgDist = Math.hypot(playerRef.current.x - enemy.x, playerRef.current.y - enemy.y);
            if (dmgDist < 60) {
              handlePlayerHit(enemy);
            }
          }
        }

        // Check simple physical collision with active player frame
        const physDist = Math.hypot(playerRef.current.x - enemy.x, playerRef.current.y - enemy.y);
        if (physDist < playerRef.current.radius + enemy.radius) {
          // Continuous micro collision damage ticks
          if (Math.random() < 0.05) {
            handlePlayerHit(enemy, 35);
          }
        }

        // Draw Enemy circle sprite representation
        ctx.save();
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = enemy.color;
        ctx.fill();

        // Draw HP bar above enemy
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 15, enemy.radius * 2, 4);
        ctx.fillStyle = '#22c55e';
        const hpPct = enemy.hp / enemy.maxHp;
        ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 15, (enemy.radius * 2) * hpPct, 4);

        // Draw Element applied badges icons labels
        if (enemy.activeElements.length > 0) {
          enemy.activeElements.forEach((el: ElementType, idx: number) => {
            ctx.fillStyle = getElementColorHex(el);
            ctx.fillRect(enemy.x - 15 + idx * 8, enemy.y - enemy.radius - 23, 7, 7);
          });
        }
        ctx.restore();
      });

      // --- DRAW PLAYER CORE SHIELD AND MODEL ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(playerRef.current.x, playerRef.current.y, playerRef.current.radius, 0, Math.PI * 2);
      ctx.fillStyle = getElementColorHex(currentActiveChar.element);
      ctx.shadowBlur = 15;
      ctx.shadowColor = getElementColorHex(currentActiveChar.element);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Sword line indicators pointing to look vector
      ctx.beginPath();
      ctx.moveTo(playerRef.current.x, playerRef.current.y);
      ctx.lineTo(playerRef.current.x + playerRef.current.lastDirX * 25, playerRef.current.y + playerRef.current.lastDirY * 25);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // If Crystallize shield is loaded
      if (currentShieldActive && currentShieldWeight > 0) {
        ctx.beginPath();
        ctx.arc(playerRef.current.x, playerRef.current.y, playerRef.current.radius + 10, 0, Math.PI * 2);
        ctx.strokeStyle = getElementColorHex(currentShieldActive);
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // If active Shield Parry stance is toggled on screen
      if (currentIsParrying) {
        ctx.beginPath();
        ctx.arc(playerRef.current.x, playerRef.current.y, playerRef.current.radius + 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Lightning Warning Circle (World Coordinates)
      if (lightningWarningRef.current !== null) {
        const warning = lightningWarningRef.current;
        ctx.save();
        ctx.beginPath();
        ctx.arc(warning.x, warning.y, 45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.fillStyle = '#c084fc';
        ctx.font = 'bold 12px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', warning.x, warning.y);
        ctx.restore();
      }

      // Draw Lightning Bolt Strike Visual (World Coordinates)
      if (lightningStrikeVisualRef.current !== null) {
        const strike = lightningStrikeVisualRef.current;
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        let curX = strike.x;
        let curY = 0;
        ctx.moveTo(curX, curY);
        const segments = 6;
        const segHeight = strike.y / segments;
        for (let s = 1; s <= segments; s++) {
          curY = s * segHeight;
          if (s < segments) {
            curX = strike.x + (Math.random() - 0.5) * 25;
          } else {
            curX = strike.x;
          }
          ctx.lineTo(curX, curY);
        }
        ctx.stroke();
        ctx.restore();
      }

      // --- DRAW TEXTS AND EFFECTS PARTICLES (World Space) ---
      particlesRef.current.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
      if (isMobile && particlesRef.current.length > 50) {
        particlesRef.current = particlesRef.current.slice(-50);
      }

      textsRef.current.forEach((t) => {
        t.update();
        t.draw(ctx);
      });
      textsRef.current = textsRef.current.filter(t => t.life < t.maxLife);

      // Unconditional context restore to reverse the save/translations at the start of the rendering block
      ctx.restore();

      // --- DRAW FOREGROUND SCREEN SPACE OVERLAYS ---
      if (weatherRef.current === 'Rain' || weatherRef.current === 'Thunderstorm') {
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.18)';
        ctx.lineWidth = 1;
        for (let r = 0; r < 20; r++) {
          const rx = (Math.random() * dimensions.width);
          const ry = (Math.random() * dimensions.height);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 8, ry + 15);
          ctx.stroke();
        }
        ctx.restore();
      } else if (weatherRef.current === 'Snow') {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        for (let sn = 0; sn < 15; sn++) {
          const sx = (Math.random() * dimensions.width);
          const sy = (Math.random() * dimensions.height);
          const srad = 1.5 + Math.random() * 2;
          ctx.beginPath();
          ctx.arc(sx, sy, srad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- DRAW MINI-MAP OVERLAY (Separate canvas, Top-Right) ---
      const miniCanvas = minimapCanvasRef.current;
      if (miniCanvas) {
        const miniCtx = miniCanvas.getContext('2d');
        if (miniCtx) {
          const mapSize = 90; // compact size to fit layout perfectly
          const mapRadius = mapSize / 2;
          const centerX = mapRadius;
          const centerY = mapRadius;
          const mapX = 0;
          const mapY = 0;

          miniCtx.clearRect(0, 0, mapSize, mapSize);

          miniCtx.save();
          // Draw circular clip path
          miniCtx.beginPath();
          miniCtx.arc(centerX, centerY, mapRadius, 0, Math.PI * 2);
          miniCtx.clip();

          // Semi-transparent dark slate background
          miniCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          miniCtx.fillRect(mapX, mapY, mapSize, mapSize);

          // Grid lines (500px spacing in world space)
          miniCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          miniCtx.lineWidth = 1;
          for (let g = 500; g < 2000; g += 500) {
            const gx = mapX + (g / 2000) * mapSize;
            miniCtx.beginPath();
            miniCtx.moveTo(gx, mapY);
            miniCtx.lineTo(gx, mapY + mapSize);
            miniCtx.stroke();

            const gy = mapY + (g / 2000) * mapSize;
            miniCtx.beginPath();
            miniCtx.moveTo(mapX, gy);
            miniCtx.lineTo(mapX + mapSize, gy);
            miniCtx.stroke();
          }

          // Draw active enemies
          enemiesRef.current.forEach(enemy => {
            if (enemy.hp > 0) {
              const ex = enemy.x;
              const ey = enemy.y;
              const enemyMapX = mapX + (ex / 2000) * mapSize;
              const enemyMapY = mapY + (ey / 2000) * mapSize;
              
              if (enemy.type === 'Boss') {
                miniCtx.fillStyle = '#f97316'; // Orange for boss
                miniCtx.beginPath();
                miniCtx.arc(enemyMapX, enemyMapY, 4, 0, Math.PI * 2);
                miniCtx.fill();
                
                miniCtx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
                miniCtx.lineWidth = 1;
                miniCtx.beginPath();
                miniCtx.arc(enemyMapX, enemyMapY, 6.5, 0, Math.PI * 2);
                miniCtx.stroke();
              } else {
                miniCtx.fillStyle = '#ef4444'; // Red for normal enemies
                miniCtx.beginPath();
                miniCtx.arc(enemyMapX, enemyMapY, 2.2, 0, Math.PI * 2);
                miniCtx.fill();
              }
            }
          });

          // Draw player dot
          const px = playerRef.current.x;
          const py = playerRef.current.y;
          const playerMapX = mapX + (px / 2000) * mapSize;
          const playerMapY = mapY + (py / 2000) * mapSize;
          
          miniCtx.fillStyle = '#10b981'; // Green for player
          miniCtx.beginPath();
          miniCtx.arc(playerMapX, playerMapY, 3, 0, Math.PI * 2);
          miniCtx.fill();

          // Subtle pulse around player
          miniCtx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          miniCtx.lineWidth = 1;
          miniCtx.beginPath();
          miniCtx.arc(playerMapX, playerMapY, 4.5 + Math.sin(Date.now() / 150) * 1.2, 0, Math.PI * 2);
          miniCtx.stroke();

          miniCtx.restore(); // Restore clipping region

          // Mini-map border
          miniCtx.save();
          miniCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          miniCtx.lineWidth = 1.5;
          miniCtx.beginPath();
          miniCtx.arc(centerX, centerY, mapRadius, 0, Math.PI * 2);
          miniCtx.stroke();
          
          // Compass label
          miniCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          miniCtx.font = 'bold 7px monospace';
          miniCtx.textBaseline = 'middle';
          miniCtx.textAlign = 'center';
          miniCtx.fillText('N', centerX, mapY + 7);
          miniCtx.restore();
        }
      }

      animationId = requestAnimationFrame(updateGameLoop);
    };

    updateGameLoop();
    return () => {
      cancelAnimationFrame(animationId);
      AetheriaAudioEngine.setBossFightActive(false);
    };
  }, []);

  // Keyboard binding trackers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === 'escape' || key === 'p') {
        AetheriaAudioEngine.playClick();
        setIsPaused(prev => !prev);
        return;
      }

      if (!loopStateRef.current.battleStarted || loopStateRef.current.isPaused || loopStateRef.current.isGameOver || loopStateRef.current.countdownValue !== null) return;

      keyboardState.current[key] = true;

      // Handle direct key activations to bypass event delay issues in fast canvas updates
      if (key === 'j' || key === 'f') triggerBasicAttack();
      if (key === 'q') triggerUltimate();
      if (key === 'e') triggerElementalSkill();
      if (key === ' ') {
        e.preventDefault();
        triggerDodgeDash();
      }
      if (key === 'c') triggerParryBlock();
      if (key === '1') swapPartyIndex(0);
      if (key === '2') swapPartyIndex(1);
      if (key === '3') swapPartyIndex(2);
      if (key === '4') swapPartyIndex(3);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keyboardState.current[key] = false;
      if (key === 'c') {
        setIsParrying(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerBasicAttack, triggerUltimate, triggerElementalSkill, triggerDodgeDash, triggerParryBlock, swapPartyIndex]);

  // Handle combat damage logic hitting player target
  const handlePlayerHit = (enemy: any, amount: number = 200) => {
    const { combatParty: currentParty, activePartyIndex: currentPartyIndex, isParrying: currentIsParrying, shieldWeight: currentShieldWeight } = loopStateRef.current;
    const currentActiveChar = currentParty[currentPartyIndex] || null;
    if (!currentActiveChar) return;

    // If parry is active precisely
    if (currentIsParrying) {
      setIsParrying(false);
      onIncrementStat('successfulParries');
      
      const px = playerRef.current.x;
      const py = playerRef.current.y;
      
      // Detonate counter-strike damage reflected back on enemy
      const reflect = 750;
      applySkillDamage(enemy, reflect, currentActiveChar.element, false, true);
      
      spawnFloatingDamageText(px, py - 40, '🛡️ PERFECT PARRY COUNTER! 🛡️', '#06b6d4', 15, true);
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push(new CombatParticle(px, py, '#06b6d4', 3.5));
      }
      return;
    }

    // If shield absorbs damage first
    if (currentShieldWeight > 0) {
      setShieldWeight(w => {
        const remaining = w - amount;
        if (remaining <= 0) {
          setShieldActive(null);
          spawnFloatingDamageText(playerRef.current.x, playerRef.current.y - 30, '🚨 CRYSTAL SHIELD BROKEN!', '#ef4444', 11, true);
          return 0;
        }
        spawnFloatingDamageText(playerRef.current.x, playerRef.current.y - 25, `Shield absorbed ${amount}!`, '#38bdf8', 10);
        return remaining;
      });
      return;
    }

    // Decrease active character dynamic hp with proper gameover checks
    setCombatParty(pList => {
      let revived = false;
      const updatedParty = pList.map((c, idx) => {
        if (idx === currentPartyIndex) {
          const nextHp = c.currentHp - amount;
          if (nextHp <= 0 && loopStateRef.current.dungeonMode && loopStateRef.current.dungeonBuffs.includes('Aetheric Revival') && !hasRevivedRef.current) {
            hasRevivedRef.current = true;
            revived = true;
            return { ...c, currentHp: Math.round(c.maxHp * 0.5) };
          }
          return { ...c, currentHp: Math.max(0, nextHp) };
        }
        return c;
      });

      if (revived) {
        spawnFloatingDamageText(playerRef.current.x, playerRef.current.y - 30, '💖 REVIVED! +50% HP', '#fb7185', 14, true);
        AetheriaAudioEngine.playUltimate();
      } else {
        // Show float
        spawnFloatingDamageText(playerRef.current.x, playerRef.current.y, `-${amount}`, '#f43f5e', 14, true);
      }

      // Check if all party members are dead
      const anyAlive = updatedParty.some(c => c.currentHp > 0);
      if (!anyAlive) {
        setIsGameOver(true);
        AetheriaAudioEngine.playGameOver();
      } else {
        // Swap to another alive character if current active character just died
        const activeCharStillAlive = updatedParty[currentPartyIndex].currentHp > 0;
        if (!activeCharStillAlive) {
          const firstAliveIdx = updatedParty.findIndex(c => c.currentHp > 0);
          if (firstAliveIdx !== -1) {
            setActivePartyIndex(firstAliveIdx);
            const swapped = updatedParty[firstAliveIdx];
            spawnFloatingDamageText(playerRef.current.x, playerRef.current.y - 45, `FALLBACK: ${swapped.name}!`, getElementColorHex(swapped.element), 14);
          }
        }
      }
      return updatedParty;
    });
  };

  // Sound Engine synchronization values
  const [audioMuted, setAudioMuted] = useState(AetheriaAudioEngine.getMuteState());
  const [musicPlaying, setMusicPlaying] = useState(AetheriaAudioEngine.getMusicState());

  const toggleArenaMute = () => {
    const nextMuted = !audioMuted;
    AetheriaAudioEngine.setMute(nextMuted);
    setAudioMuted(nextMuted);
    AetheriaAudioEngine.playClick();
  };

  const toggleArenaMusic = () => {
    const nextPlaying = AetheriaAudioEngine.toggleMusic();
    setMusicPlaying(nextPlaying);
    AetheriaAudioEngine.playClick();
  };

  // Handlers for mouse aiming and click strikes on the canvas
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || isGameOver || countdownValue !== null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Convert viewport clicks to world coordinates
    const camX = Math.max(0, Math.min(WORLD_WIDTH - dimensions.width, playerRef.current.x - dimensions.width / 2));
    const camY = Math.max(0, Math.min(WORLD_HEIGHT - dimensions.height, playerRef.current.y - dimensions.height / 2));
    const worldClickX = clickX + camX;
    const worldClickY = clickY + camY;

    const dx = worldClickX - playerRef.current.x;
    const dy = worldClickY - playerRef.current.y;
    const mag = Math.hypot(dx, dy);
    
    if (mag > 5) {
      playerRef.current.lastDirX = dx / mag;
      playerRef.current.lastDirY = dy / mag;
    }

    triggerBasicAttack();
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || isGameOver || countdownValue !== null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Convert viewport mouse positions to world coordinates
    const camX = Math.max(0, Math.min(WORLD_WIDTH - dimensions.width, playerRef.current.x - dimensions.width / 2));
    const camY = Math.max(0, Math.min(WORLD_HEIGHT - dimensions.height, playerRef.current.y - dimensions.height / 2));
    const worldMouseX = mouseX + camX;
    const worldMouseY = mouseY + camY;

    const dx = worldMouseX - playerRef.current.x;
    const dy = worldMouseY - playerRef.current.y;
    const mag = Math.hypot(dx, dy);
    
    if (mag > 5) {
      playerRef.current.lastDirX = dx / mag;
      playerRef.current.lastDirY = dy / mag;
    }
  };

  const handleRestartCombat = () => {
    AetheriaAudioEngine.playClick();
    setGameScore(0);
    setCurrentWave(1);
    setIsGameOver(false);
    setIsPaused(false);
    setWaveClearMessage(null);
    setBossHp(null);
    setBattleStarted(false);
    AetheriaAudioEngine.setBossFightActive(false);
    
    setCombatParty(pList => pList.map(c => ({
      ...c,
      currentHp: c.maxHp,
      ultimateEnergy: 0
    })));
    
    // Quick indicator float
    spawnFloatingDamageText(400, 200, 'WARFARE RESET • WAVE 1 PREPARED', '#10b981', 16, true);
  };

  const bossHpPct = bossHp !== null ? bossHp / bossMaxHp : null;
  const bossPhase = bossHpPct === null ? 1 : bossHpPct <= 0.20 ? 3 : bossHpPct <= 0.50 ? 2 : 1;

  const activeTheme = getElementUiTheme(activeChar?.element);

  return (
    <div 
      className={isMobile 
        ? `fixed inset-0 z-50 w-screen h-screen bg-slate-950 overflow-hidden flex flex-col min-h-0 ${isUiShaking ? 'animate-shake' : ''}`
        : `bg-[#0b0f19]/85 border rounded-xl overflow-hidden flex flex-col h-full min-h-[600px] backdrop-blur-md transition-all duration-500 ${activeTheme.borderClass} ${activeTheme.shadowGlow} ${activeTheme.pulseGlowClass} ${isUiShaking ? 'animate-shake' : ''}`
      }
      id="arena_main_root"
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${activeTheme.bgGradient.replace('from-', '').split(' ')[0]}, #0b0f19)`
      }}
    >
      
      {/* Top Combat Info HUD */}
      <div className={`bg-[#060810]/95 ${isMobile ? 'px-4 py-2.5 flex-row items-center justify-between' : 'px-5 py-4 flex-col md:flex-row items-start md:items-center justify-between'} border-b border-white/10 flex gap-4`}>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-red-500 rounded-sm"></div>
            <h3 className="text-xs font-black text-rose-450 uppercase tracking-widest leading-none font-display flex flex-wrap items-center gap-2">
              <span>ACTIVE STAGE CONSOLE • <span className="text-yellow-450 font-mono">{dungeonMode ? 'DUNGEON' : 'WAVE'} {currentWave}</span></span>
              {/* Weather HUD Badge */}
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                currentWeather === 'Sunny' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                currentWeather === 'Rain' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                currentWeather === 'Thunderstorm' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                'bg-sky-400/10 border-sky-400/30 text-sky-300'
              } flex items-center gap-1`}>
                {currentWeather === 'Sunny' && <Sun className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />}
                {currentWeather === 'Rain' && <CloudRain className="w-3 h-3 text-cyan-400" />}
                {currentWeather === 'Thunderstorm' && <CloudLightning className="w-3 h-3 text-purple-400" />}
                {currentWeather === 'Snow' && <Snowflake className="w-3 h-3 text-sky-300 animate-pulse" />}
                <span>{currentWeather}</span>
              </span>
            </h3>
          </div>
          {!isMobile && (
            <p className="text-[10.5px] text-slate-400 mt-1 uppercase font-mono tracking-wide">
              Score: <span className="text-white font-bold">{gameScore} pts</span> • Aim Option: <span className="text-cyan-400">Mouse Click Strike</span>
            </p>
          )}
          {activeResonances.length > 0 && (
            <div className="flex gap-1.5 flex-wrap items-center mt-2">
              {activeResonances.map(res => (
                <span 
                  key={res.key} 
                  title={res.desc}
                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-emerald-500/10 border-emerald-500/35 text-emerald-400 flex items-center gap-1 shadow-sm select-none font-mono"
                >
                  ✨ {res.name}
                </span>
              ))}
            </div>
          )}
          {dungeonMode && dungeonBuffs && dungeonBuffs.length > 0 && (
            <div className="flex gap-1.5 flex-wrap items-center mt-1.5">
              {dungeonBuffs.map((buff, bIdx) => (
                <span 
                  key={bIdx}
                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-indigo-500/10 border-indigo-500/35 text-indigo-400 flex items-center gap-1 shadow-sm select-none font-mono"
                >
                  🔮 {buff}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Live Records and settings trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Highscore indicator badges */}
          {!isMobile && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-black uppercase rounded py-1 px-2.5 flex items-center gap-1">
              <Trophy className="w-2.5 h-2.5" /> High Score: Wave {highScoreWave}
            </div>
          )}

          <div className="flex gap-2">
            {/* System Audio buttons */}
            <button
              onClick={toggleArenaMute}
              title={audioMuted ? "Unmute Sounds" : "Mute Sounds"}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                audioMuted 
                  ? 'bg-red-500/10 border-red-500/35 text-red-400' 
                  : 'bg-black/40 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {!isMobile && (
              <button
                onClick={toggleArenaMusic}
                title="Toggle retro BGM tune"
                className={`p-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1 ${
                  musicPlaying 
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
                    : 'bg-black/40 border-white/10 text-slate-400'
                }`}
              >
                🎵 BGM: {musicPlaying ? "ON" : "OFF"}
              </button>
            )}


            {/* Pause buttons */}
            <button
              onClick={() => { AetheriaAudioEngine.playClick(); setIsPaused(p => !p); }}
              className="p-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-[9.5px] rounded-md font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-red-950/40"
            >
              <Pause className="w-3 h-3" /> <span className="hidden sm:inline">Pause</span>
            </button>

            {isMobile && onBackToMenu && (
              <button
                onClick={() => { AetheriaAudioEngine.playClick(); onBackToMenu(); }}
                className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-[9.5px] rounded-md font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-md border border-white/5"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary interactive Combat Container */}
      <div ref={containerRef} className="flex-1 min-h-[350px] bg-[#03060f] relative overflow-hidden flex flex-col justify-end">
        
        {/* Weather Sunny Ray beam visual overlay */}
        {currentWeather === 'Sunny' && (
          <div className="absolute inset-0 pointer-events-none sunny-beams-overlay z-10" />
        )}
        
        {/* DOM Damage Floating Numbers Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-30">
          <AnimatePresence>
            {domDamageTexts.map(t => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.5, y: t.y, x: t.x }}
                animate={{ opacity: 1, scale: t.isCrit ? 1.6 : 1.1, y: t.y - 65 }}
                exit={{ opacity: 0, scale: 0.8, y: t.y - 95 }}
                transition={{ type: 'spring', stiffness: 220, damping: t.isCrit ? 10 : 16 }}
                style={{
                  position: 'absolute',
                  color: t.color,
                  fontSize: `${t.size}px`,
                  fontWeight: '900',
                  textShadow: '0 2px 5px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.7)',
                  fontFamily: '"Space Grotesk", sans-serif',
                  whiteSpace: 'nowrap',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ROGUE DUNGEON ROOM CLEAR OVERLAY */}
        {dungeonVictory && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-55">
            <div className="bg-slate-900 border-2 border-emerald-500 rounded-xl p-8 max-w-sm w-full text-center space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-400 mx-auto">
                <Trophy className="w-8 h-8 text-emerald-400 animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-emerald-400 font-display tracking-widest uppercase">
                ROOM CLEANSED
              </h3>
              <p className="text-slate-400 text-xs font-mono uppercase">
                The dimensional link is stabilized. Proceed deeper into the ruins...
              </p>
              
              <button
                onClick={() => {
                  AetheriaAudioEngine.playClick();
                  if (onDungeonBattleEnd) {
                    const finalPartyHp: Record<string, number> = {};
                    const finalPartyUlt: Record<string, number> = {};
                    combatParty.forEach(c => {
                      finalPartyHp[c.id] = c.currentHp;
                      finalPartyUlt[c.id] = c.ultimateEnergy;
                    });
                    onDungeonBattleEnd(true, finalPartyHp, finalPartyUlt);
                  }
                }}
                className="w-full p-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-lg cursor-pointer transition-colors shadow-lg shadow-emerald-950/50"
              >
                ➡️ PROCEED TO NEXT ROOM
              </button>
            </div>
          </div>
        )}

        {/* WAVE ALERT SUCCESS BANNER OVERLAY */}
        {waveClearMessage && (
          <div className="absolute inset-0 bg-[#020617]/70 backdrop-blur-xs flex items-center justify-center z-35 animate-fade-in pointer-events-none">
            <div className="bg-slate-950/90 border border-emerald-500/30 p-8 rounded-xl max-w-sm text-center shadow-[0_0_40px_rgba(16,185,129,0.35)] flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/25 rounded-full flex items-center justify-center border border-emerald-400">
                <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-black text-emerald-400 font-display tracking-widest uppercase">AREA CLEANSED</h2>
              <p className="text-xs text-slate-300 font-mono uppercase tracking-wider">{waveClearMessage}</p>
              <div className="text-[10px] text-slate-500 font-mono">STABILIZING MATRIX FOR NEXT INCURSION...</div>
            </div>
          </div>
        )}

        {/* Dynamic active Boss Red Healthbar */}
        {spawnerPreset === 'boss' && bossHp !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-lg w-full px-4 z-40">
            <div className="bg-black/85 border border-white/15 p-3 rounded-lg flex flex-col gap-1.5 shadow-[0_0_25px_rgba(239,68,68,0.25)] backdrop-blur-md">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-extrabold text-red-400 tracking-wider uppercase font-display flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  {bossName || 'THE CALAMITY EROSION DRAKE'}
                </span>
                <span className="font-black text-slate-200 font-mono text-[11px]">{bossHp} / {bossMaxHp} HP</span>
              </div>
              <div className="bg-slate-950 rounded-sm h-3 overflow-hidden border border-white/10 p-[1px]">
                <div 
                  className="bg-gradient-to-r from-red-600 to-amber-500 h-full shadow-[0_0_10px_rgba(239,68,68,0.6)] transition-all duration-100"
                  style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Keyboard controllers help tip sheet */}
        {!isMobile && (
          <div className="absolute top-4 left-4 bg-black/80 border border-white/10 p-3 rounded-lg text-[9.5px] text-slate-350 space-y-1.5 backdrop-blur-md z-20 pointer-events-none hidden md:block">
          <div className="font-black text-amber-400 uppercase tracking-widest border-b border-white/10 pb-1 font-display">DIAGNOSTICS MATRIX</div>
          <div className="flex items-center gap-2 justify-between">
            <span>Movement Vector:</span>
            <span className="bg-white/10 px-1 py-0.2 rounded font-black text-slate-105 font-mono">WASD</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span>Mouse Target:</span>
            <span className="bg-cyan-500/10 px-1 py-0.2 rounded border border-cyan-500/30 font-black text-cyan-300 font-mono">Aim Coordinate</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span>Attack Slash:</span>
            <span className="bg-white/10 px-1.5 py-0.2 rounded font-black text-slate-100 font-mono text-[8px]">Left-Click or J/F</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span>Dodge Dash:</span>
            <span className="bg-white/10 px-1 py-0.2 rounded font-black text-emerald-400 font-mono">SPACE</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span>Shield Parry:</span>
            <span className="bg-white/10 px-1 py-0.2 rounded font-black text-cyan-400 font-mono">C</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span>Elemental Skill:</span>
            <span className="bg-white/10 px-1 py-0.2 rounded font-black text-indigo-400 font-mono">E</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span>Celestial Burst:</span>
            <span className="bg-white/10 px-1 py-0.2 rounded font-black text-amber-400 font-mono">Q</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span>Switch Hero:</span>
            <span className="bg-white/10 px-1 py-0.2 rounded font-black text-slate-205 font-mono">1-4</span>
          </div>
        </div>
        )}

        {/* START BATTLE OVERLAY */}
        <AnimatePresence>
          {!battleStarted && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.22 }}
                className="bg-[#0b0f19]/90 border border-indigo-500/30 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-[0_15px_40px_rgba(0,0,0,0.7)] relative"
                id="arena_deploy_overlay"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-pulse">
                  <Swords className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-100 font-display tracking-widest uppercase">
                    READY TO DEPLOY
                  </h3>
                  <p className="text-xs text-slate-400 font-mono uppercase tracking-wide">
                    {dungeonMode ? `Rogue Ruins Node • ${dungeonRoomType?.toUpperCase()}` : `Combat Arena • Wave ${currentWave}`}
                  </p>
                </div>
                
                <div className="bg-black/45 border border-white/5 p-4 rounded-xl space-y-3">
                  <span className="text-[9.5px] text-slate-500 uppercase block font-black text-left font-mono border-b border-white/5 pb-1">Deploying Strike Team:</span>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {combatParty.map((c) => (
                      <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate max-w-[120px] font-bold uppercase tracking-tight text-slate-200">{c.name}</span>
                        <span className="font-mono text-[9px] text-slate-500">LV.{c.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      AetheriaAudioEngine.playClick();
                      setBattleStarted(true);
                      startCountdown(() => {});
                    }}
                    className="w-full p-4 bg-indigo-650 hover:bg-indigo-550 active:scale-95 text-white text-xs rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
                  >
                    ⚔️ START BATTLE ⚔️
                  </button>
                  {onBackToMenu && (
                    <button
                      onClick={() => { AetheriaAudioEngine.playClick(); onBackToMenu(); }}
                      className="w-full p-2.5 bg-slate-900/60 hover:bg-slate-800 border border-white/10 text-slate-450 hover:text-white text-[10px] rounded-lg font-black uppercase tracking-widest cursor-pointer transition-all"
                    >
                      Abort and Exit
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ACTIVE PAUSE SCREEN MODAL OVERLAY */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl">
              <h3 className="text-lg font-black text-slate-100 font-display tracking-widest uppercase flex items-center justify-center gap-2">
                <Pause className="w-5 h-5 text-red-500" /> {t('paused', language)}
              </h3>
              <p className="text-slate-400 text-xs uppercase font-mono">
                {t('wave', language)}: {currentWave} • {t('score', language)}: {gameScore}
              </p>
              
              <div className="border border-white/5 bg-black/30 p-3 rounded-lg text-left text-[10px] text-slate-400 space-y-1 font-mono">
                <div>💥 REACTIONS TRIGGERED: <b className="text-white">AVAILABLE</b></div>
                <div>⚔️ SHARDS COLLECTIBLE: <b className="text-cyan-400">GEO REACTIONS</b></div>
              </div>

              <div className="flex flex-col gap-2 relative">
                <button
                  onClick={() => {
                    AetheriaAudioEngine.playClick();
                    setIsPaused(false);
                    startCountdown(() => {});
                  }}
                  className="w-full p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg font-black uppercase tracking-wider cursor-pointer"
                >
                  {t('resume', language)}
                </button>
                <button
                  onClick={() => {
                    AetheriaAudioEngine.playClick();
                    setPendingAction('restart');
                  }}
                  className="w-full p-2.5 bg-black/45 hover:bg-black/75 border border-white/10 text-slate-200 text-xs rounded-lg font-black uppercase tracking-wider cursor-pointer"
                >
                  {t('restart', language)} {t('wave', language)} {currentWave}
                </button>
                {onBackToMenu && (
                  <button
                    onClick={() => {
                      AetheriaAudioEngine.playClick();
                      setPendingAction('home');
                    }}
                    className="w-full p-2.5 bg-red-650/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 text-xs rounded-lg font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Home className="w-3.5 h-3.5" /> {t('back_to_menu', language)}
                  </button>
                )}
                {onExitToWiki && (
                  <button
                    onClick={() => {
                      AetheriaAudioEngine.playClick();
                      setPendingAction('wiki');
                    }}
                    className="w-full p-2.5 bg-sky-955/20 hover:bg-sky-600/30 border border-sky-500/20 text-sky-400 text-xs rounded-lg font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> {t('exit_to_wiki', language)}
                  </button>
                )}

                {pendingAction && (
                  <div className="absolute inset-[-1.5rem] bg-slate-950/95 backdrop-blur-sm rounded-xl p-4 flex flex-col justify-center items-center space-y-4 z-30">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-amber-400 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                        {t('misclick_notice', language)}
                      </h4>
                      <p className="text-[10px] text-slate-300 max-w-[200px] leading-relaxed">
                        {pendingAction === 'restart' && t('notice_restart', language)}
                        {pendingAction === 'home' && t('notice_home', language)}
                        {pendingAction === 'wiki' && t('notice_wiki', language)}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full max-w-[220px]">
                      <button
                        onClick={() => {
                          AetheriaAudioEngine.playClick();
                          const act = pendingAction;
                          setPendingAction(null);
                          if (act === 'restart') {
                            setIsPaused(false);
                            handleRestartCombat();
                          } else if (act === 'home') {
                            setIsPaused(false);
                            onBackToMenu?.();
                          } else if (act === 'wiki') {
                            setIsPaused(false);
                            onExitToWiki?.();
                          }
                        }}
                        className="flex-1 py-1.5 bg-red-650 hover:bg-red-600 text-white text-[10px] rounded font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-transform"
                      >
                        {t('confirm', language)}
                      </button>
                      <button
                        onClick={() => {
                          AetheriaAudioEngine.playClick();
                          setPendingAction(null);
                        }}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[10px] rounded font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-transform"
                      >
                        {t('cancel', language)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* HARD GAME OVER FATAL SCREEN OVERLAY */}
        {isGameOver && (
          <div className="absolute inset-0 bg-[#3f0000]/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-black/90 border-2 border-red-500 rounded-xl p-8 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
              <h3 className="text-2xl font-black text-rose-500 font-display tracking-wider uppercase">
                💀 PARTY DEFEATED 💀
              </h3>
              <p className="text-slate-350 text-xs">
                All frontline elemental combatants have fallen. The rift structures collapsed.
              </p>
              
              <div className="grid grid-cols-2 gap-4 border border-white/10 bg-black/50 p-4 rounded-lg font-mono">
                <div className="text-left text-[11px] text-slate-400">
                  WAVE REACHED: <div className="text-lg font-black text-white">{currentWave}</div>
                </div>
                <div className="text-left text-[11px] text-slate-400">
                  COMBAT SCORE: <div className="text-lg font-black text-yellow-500">{gameScore} pts</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {dungeonMode ? (
                  <button
                    onClick={() => {
                      AetheriaAudioEngine.playClick();
                      if (onDungeonBattleEnd) {
                        onDungeonBattleEnd(false, {}, {});
                      }
                    }}
                    className="w-full p-3 bg-red-700 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-lg cursor-pointer"
                  >
                    ❌ EXIT RUINS (Run Defeated)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleRestartCombat}
                      className="w-full p-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-lg cursor-pointer shadow-lg shadow-red-950/50"
                    >
                      📥 Renew Matrix & Try Again
                    </button>
                    {onBackToMenu && (
                      <button
                        onClick={() => { AetheriaAudioEngine.playClick(); onBackToMenu(); }}
                        className="w-full p-2.5 bg-[#0b0f19] hover:bg-slate-900 border border-white/10 text-slate-400 text-xs rounded-lg font-black uppercase tracking-wider cursor-pointer"
                      >
                        Return to Main Deck
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Countdown display timer overlay */}
        <AnimatePresence>
          {countdownValue !== null && (
            <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center z-50 pointer-events-none select-none">
              <motion.div
                key={countdownValue}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.8 }}
                className="text-center font-display font-black text-7xl md:text-9xl text-indigo-400 drop-shadow-[0_0_25px_rgba(99,102,241,0.65)]"
              >
                {countdownValue}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Ultimate Cutscene Overlay */}
        <AnimatePresence>
          {isUltCutsceneActive && activeUltCutscene && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 z-50 flex items-center justify-center pointer-events-none select-none"
            >
              {/* Sliding Colored Element Background Panel */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className={`absolute h-[180px] md:h-[220px] bg-gradient-to-r ${
                  activeUltCutscene.element === 'Pyro'
                    ? 'from-red-600/90 via-amber-500/80 to-transparent'
                    : activeUltCutscene.element === 'Hydro'
                      ? 'from-blue-600/90 via-cyan-500/80 to-transparent'
                      : activeUltCutscene.element === 'Electro'
                        ? 'from-purple-600/90 via-fuchsia-500/80 to-transparent'
                        : activeUltCutscene.element === 'Anemo'
                          ? 'from-teal-600/90 via-emerald-400/80 to-transparent'
                          : activeUltCutscene.element === 'Cryo'
                            ? 'from-sky-500/90 via-blue-400/80 to-transparent'
                            : activeUltCutscene.element === 'Geo'
                              ? 'from-amber-600/90 via-yellow-500/80 to-transparent'
                              : 'from-green-600/90 via-lime-500/80 to-transparent'
                } border-y-2 border-white/20 flex items-center px-8 md:px-24 justify-between overflow-hidden w-full`}
              >
                <div className="absolute right-10 opacity-10 text-white text-8xl md:text-9xl font-black uppercase tracking-tighter select-none">
                  {activeUltCutscene.element}
                </div>

                <div className="flex flex-col gap-1.5 md:gap-3 z-10 text-left">
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <span className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-950 ${
                      activeUltCutscene.element === 'Pyro' ? 'bg-red-400' :
                      activeUltCutscene.element === 'Hydro' ? 'bg-blue-400' :
                      activeUltCutscene.element === 'Electro' ? 'bg-purple-400' :
                      activeUltCutscene.element === 'Anemo' ? 'bg-teal-400' :
                      activeUltCutscene.element === 'Cryo' ? 'bg-sky-400' :
                      activeUltCutscene.element === 'Geo' ? 'bg-amber-400' : 'bg-green-400'
                    }`}>
                      {activeUltCutscene.element}
                    </span>
                    <span className="text-white/60 font-mono text-[10px] md:text-xs tracking-widest uppercase">Ultimate Activation</span>
                  </motion.div>

                  <motion.h1
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.35 }}
                    className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight font-display drop-shadow-md"
                  >
                    {activeUltCutscene.name}
                  </motion.h1>

                  <motion.p
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-amber-300 font-black font-mono text-sm md:text-lg uppercase tracking-wider"
                  >
                    ✦ {activeUltCutscene.skills?.ultimate?.name} ✦
                  </motion.p>
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 0.85 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                  className={`w-24 h-24 md:w-36 md:h-36 rounded-full border border-white/20 flex items-center justify-center shadow-2xl relative bg-black/40 shrink-0 ${
                    activeUltCutscene.element === 'Pyro' ? 'shadow-red-500/20' :
                    activeUltCutscene.element === 'Hydro' ? 'shadow-blue-500/20' :
                    activeUltCutscene.element === 'Electro' ? 'shadow-purple-500/20' :
                    activeUltCutscene.element === 'Anemo' ? 'shadow-teal-500/20' :
                    activeUltCutscene.element === 'Cryo' ? 'shadow-sky-500/20' :
                    activeUltCutscene.element === 'Geo' ? 'shadow-amber-500/20' : 'shadow-green-500/20'
                  }`}
                >
                  <Sparkles className={`w-12 h-12 md:w-16 md:h-16 ${
                    activeUltCutscene.element === 'Pyro' ? 'text-red-400 animate-pulse' :
                    activeUltCutscene.element === 'Hydro' ? 'text-blue-400 animate-pulse' :
                    activeUltCutscene.element === 'Electro' ? 'text-purple-400 animate-pulse' :
                    activeUltCutscene.element === 'Anemo' ? 'text-teal-400 animate-pulse' :
                    activeUltCutscene.element === 'Cryo' ? 'text-sky-400 animate-pulse' :
                    activeUltCutscene.element === 'Geo' ? 'text-amber-400 animate-pulse' : 'text-green-400 animate-pulse'
                  }`} />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boss HP Phase Arena Hazard warning overlay */}
        {bossHp !== null && bossHp > 0 && bossPhase >= 2 && (
          <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4">
            {/* Flashing Alert Banner */}
            <div className="flex justify-center w-full mt-24">
              {bossPhase === 2 ? (
                <div className="bg-amber-500/90 text-slate-950 font-black px-4 py-2 rounded-full border border-amber-300 shadow-lg text-[10px] md:text-xs uppercase tracking-widest animate-pulse flex items-center gap-1.5 pointer-events-auto">
                  <span>⚠️ WARNING: boss stage-wide hazards active ⚠️</span>
                </div>
              ) : (
                <div className="bg-red-600/95 text-white font-black px-5 py-2.5 rounded-full border border-red-400 shadow-xl text-xs md:text-sm uppercase tracking-widest animate-bounce flex items-center gap-2 pointer-events-auto">
                  <span>🚨 CRITICAL DANGER: APOCALYPSE STAGE HAREZARDS ACTIVE 🚨</span>
                </div>
              )}
            </div>

            {/* Screen edge vignette border */}
            {bossPhase === 2 ? (
              <div className="absolute inset-0 border-[8px] md:border-[16px] border-amber-500/20 shadow-[inset_0_0_50px_rgba(245,158,11,0.25)] pointer-events-none" style={{ boxSizing: 'border-box' }} />
            ) : (
              <div className="absolute inset-0 border-[10px] md:border-[20px] border-red-600/35 shadow-[inset_0_0_80px_rgba(220,38,38,0.45)] animate-pulse pointer-events-none" style={{ boxSizing: 'border-box' }} />
            )}
          </div>
        )}

        {/* Game Canvas */}
        <canvas 
          ref={canvasRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="w-full flex-1 touch-none cursor-crosshair block bg-[#02050c]"
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
        />

        {/* Fixed Mini-Map HUD Overlay */}
        <canvas 
          ref={minimapCanvasRef} 
          width={90} 
          height={90}
          className="absolute top-[60px] md:top-[70px] right-4 w-[90px] h-[90px] rounded-full border border-white/20 shadow-2xl z-40 bg-slate-950/85 backdrop-blur-md pointer-events-none select-none"
        />

        {/* On screen active controls overlay for mobile and clicking explorers */}
        {!isMobile && (
          <div className="bg-[#060810]/95 border-t border-white/10 p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 items-center gap-6 z-10 w-full backdrop-blur-md">
          
          {/* Party setup swaps row */}
          <div className="flex gap-3 justify-start">
            {combatParty.map((c, i) => {
              const activeRatio = (c.currentHp / c.maxHp) * 100;
              const charTemplate = PLAYABLE_CHARACTERS.find(p => p.id === c.id);
              const starCount = charTemplate ? charTemplate.rarity : 4;
              return (
                <button
                  key={c.id}
                  onClick={() => swapPartyIndex(i)}
                  disabled={c.currentHp <= 0}
                  className={`flex-1 p-3.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                    c.currentHp <= 0
                      ? 'opacity-40 bg-zinc-955/80 border-dashed border-red-900 text-slate-600'
                      : activePartyIndex === i
                        ? 'bg-[#0f172a] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                        : 'bg-[#04060b] border-white/5 text-slate-400 hover:border-slate-800'
                  }`}
                  id={`arena_char_swap_${i}`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="font-extrabold truncate max-w-[85px] text-slate-200 uppercase tracking-tight">{c.name}</span>
                      <span className="font-black text-amber-400 font-mono text-[11px]">L.{c.level}</span>
                    </div>
                    <div className="flex gap-0.5 select-none">
                      {Array.from({ length: starCount }).map((_, sIdx) => (
                        <Star key={sIdx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      ))}
                    </div>
                  </div>
                  <div className="bg-black/50 h-2 rounded overflow-hidden mt-2">
                    <div 
                      className={`h-full transition-all duration-150 ${
                        activeRatio > 50 ? 'bg-emerald-400' : activeRatio > 20 ? 'bg-amber-400' : 'bg-red-500 shadow-[0_0_5px_red]'
                      }`} 
                      style={{ width: `${activeRatio}%` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 text-[10px] font-mono">
                    <span className="text-amber-400 font-bold">ULT: <b className="font-bold text-amber-400">{Math.round((c.ultimateEnergy / c.ultimateMaxEnergy) * 100)}%</b></span>
                    {c.skillCooldownRemaining > 0 ? (
                      <span className="text-red-400 font-extrabold">{Math.ceil(c.skillCooldownRemaining)}s</span>
                    ) : (
                      <span className="text-indigo-400 font-bold">READY</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Combat Trigger Controls buttons */}
          <div className="flex flex-wrap gap-3.5 justify-center col-span-1 md:col-span-2">
            <button
              onClick={() => triggerBasicAttack()}
              className="bg-black/55 hover:bg-black/80 border border-white/15 text-slate-100 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all w-36 h-24 cursor-pointer hover:border-white/40 shadow-lg"
            >
              <Sword className="w-6 h-6 text-slate-200" />
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-200 font-display">Strike (L-Clk)</span>
            </button>

            <button
              onClick={() => triggerParryBlock()}
              disabled={parryCd > 0}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all w-36 h-24 cursor-pointer border shadow-lg ${
                parryCd > 0
                  ? 'bg-cyan-950/30 border-cyan-500/20 text-cyan-500/50 cursor-not-allowed opacity-50'
                  : 'bg-black/55 hover:bg-black/80 border-white/15 text-cyan-400 hover:border-cyan-400'
              }`}
            >
              <ShieldAlert className={`w-6 h-6 ${parryCd > 0 ? 'text-cyan-500/30' : 'text-cyan-400'}`} />
              <span className="text-xs uppercase font-extrabold tracking-widest font-display">
                {parryCd > 0 ? `${parryCd.toFixed(1)}s` : 'Parry [C]'}
              </span>
            </button>

            <button
              onClick={() => triggerDodgeDash()}
              disabled={dodgeCd > 0}
              className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all w-36 h-24 cursor-pointer border shadow-lg ${
                dodgeCd > 0
                  ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-500/50 cursor-not-allowed opacity-50'
                  : 'bg-black/55 hover:bg-black/80 border-white/15 text-emerald-400 hover:border-emerald-400'
              }`}
            >
              <RefreshCw className={`w-6 h-6 ${dodgeCd > 0 ? 'text-emerald-500/30' : 'text-emerald-400'}`} />
              <span className="text-xs uppercase font-extrabold tracking-widest font-display">
                {dodgeCd > 0 ? `${dodgeCd.toFixed(1)}s` : 'DASH [Spc]'}
              </span>
            </button>

            <button
              onClick={() => triggerElementalSkill()}
              className="bg-indigo-650/15 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all w-36 h-24 cursor-pointer hover:border-indigo-400 font-black shadow-[0_0_15px_rgba(99,102,241,0.25)]"
            >
              <Zap className="w-6 h-6 text-indigo-400" />
              <span className="text-xs uppercase font-extrabold tracking-widest font-display">SKILL [E]</span>
            </button>

            <button
              onClick={() => triggerUltimate()}
              className="bg-amber-400 hover:bg-amber-350 text-slate-950 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all w-36 h-24 cursor-pointer font-black shadow-[0_0_20px_rgba(251,191,36,0.45)] border border-amber-300/40"
            >
              <Sparkles className="w-6 h-6 text-slate-950 animate-spin" />
              <span className="text-xs uppercase font-extrabold tracking-widest font-display">Burst [Q]</span>
            </button>
          </div>
        </div>
        )}
      </div>

      {isMobile && (
        <>
          <div className="fixed left-4 top-14 z-40 flex flex-col gap-2 pointer-events-auto">
            {combatParty.map((c, i) => {
              const activeRatio = (c.currentHp / c.maxHp) * 100;
              const isCurrent = activePartyIndex === i;
              return (
                <button
                  key={c.id}
                  onClick={() => swapPartyIndex(i)}
                  disabled={c.currentHp <= 0 || isCurrent}
                  className={`p-1.5 px-2 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer flex items-center gap-2 h-9 ${
                    c.currentHp <= 0
                      ? 'opacity-40 bg-zinc-955 border-red-900 text-slate-600'
                      : isCurrent
                        ? 'bg-indigo-950/80 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                        : 'bg-slate-950/85 border-white/10 text-slate-400'
                  }`}
                  style={{
                    touchAction: 'none'
                  }}
                  onPointerDown={(e) => e.stopPropagation()} // Stop propagation to canvas
                >
                  <div className="flex flex-col justify-center leading-none">
                    <span className="text-[9px] font-black uppercase truncate max-w-[42px] text-slate-200">{c.name.substring(0, 4)}</span>
                    <span className="text-[8px] font-bold text-amber-500 font-mono mt-0.5">L.{c.level}</span>
                  </div>
                  <div className="w-8 bg-black/50 h-1.5 rounded-sm overflow-hidden shrink-0">
                    <div 
                      className={`h-full ${activeRatio > 50 ? 'bg-emerald-400' : activeRatio > 20 ? 'bg-amber-400' : 'bg-red-500 shadow-[0_0_5px_red]'}`} 
                      style={{ width: `${activeRatio}%` }} 
                    />
                  </div>
                  {c.ultimateEnergy >= c.ultimateMaxEnergy && c.currentHp > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          <MobileJoystick 
            onMove={(x, y, active) => {
              mobileJoystickState.current = { active, x, y };
            }}
          />
          <MobileControls 
            onAttack={() => {
              if (isPaused || isGameOver || countdownValue !== null) return;
              triggerBasicAttack();
            }}
            onSkill={() => {
              if (isPaused || isGameOver || countdownValue !== null) return;
              triggerElementalSkill();
            }}
            onUltimate={() => {
              if (isPaused || isGameOver || countdownValue !== null) return;
              triggerUltimate();
            }}
            onDodge={() => {
              if (isPaused || isGameOver || countdownValue !== null) return;
              triggerDodgeDash();
            }}
            onParry={() => {
              if (isPaused || isGameOver || countdownValue !== null) return;
              triggerParryBlock();
            }}
            onParryEnd={() => setIsParrying(false)}
            skillCooldown={activeChar?.skillCooldownRemaining || 0}
            dodgeCooldown={dodgeCd}
            parryCooldown={parryCd}
            ultimateEnergy={activeChar?.ultimateEnergy || 0}
            ultimateMaxEnergy={activeChar?.ultimateMaxEnergy || 100}
            activeElement={activeChar?.element || 'Anemo'}
          />
        </>
      )}
    </div>
  );
}
