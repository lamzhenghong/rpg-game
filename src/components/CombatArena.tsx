/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { PlayableCharacter, ElementType, CombatCharacter, Weapon } from '../types';
import { 
  Sword, Zap, ShieldAlert, Sparkles, HelpCircle, Trophy, RefreshCw, RefreshCcw, 
  Swords, Plus, Star, Pause, Play, Volume2, VolumeX, Save, Home,
  Sun, CloudRain, CloudLightning, Snowflake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AetheriaAudioEngine } from '../utils/audio';
import { getAccumulatedPortraitBuffs } from '../utils/portraits';
import { WEAPONS_DATABASE } from '../data/weapons';

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;

interface CombatArenaProps {
  onEarnRewards: (gems: number, mora: number, exp: number) => void;
  ownedCharacterIds: string[];
  onIncrementStat: (pk: any, val?: number) => void;
  partyIds: string[];
  onChangeParty: (partyIds: string[]) => void;
  highScoreWave?: number;
  onUpdateHighScore?: (wave: number, score: number) => void;
  onBackToMenu?: () => void;
  characterLevels?: Record<string, number>;
  characterEquippedWeapon?: Record<string, string>;
  inventoryWeapons?: Weapon[];
  characterPortraits?: Record<string, number>;
  devCheatsEnabled?: boolean;
  screenShakeEnabled?: boolean;
  combatSpeed?: number;
  // Rogue-like Dungeon mode props
  dungeonMode?: boolean;
  dungeonBuffs?: string[];
  dungeonPartyHp?: Record<string, number>;
  dungeonPartyUlt?: Record<string, number>;
  dungeonRoomType?: 'battle' | 'elite' | 'boss';
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
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
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
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

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
  dungeonMode = false,
  dungeonBuffs = [],
  dungeonPartyHp = {},
  dungeonPartyUlt = {},
  dungeonRoomType,
  onDungeonBattleEnd
}: CombatArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active party list mapped to combat instances
  const [combatParty, setCombatParty] = useState<CombatCharacter[]>([]);
  const [activePartyIndex, setActivePartyIndex] = useState<number>(0);
  const activeChar = combatParty[activePartyIndex] || null;

  // Level selector for test items
  const [battleStarted, setBattleStarted] = useState<boolean>(false);
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
    battleStarted: false
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
      battleStarted
    };
  });

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

        const pLvl = characterPortraits?.[charTemplate.id] || 0;
        const pBuffs = getAccumulatedPortraitBuffs(charTemplate.id, pLvl);

        let baseHp = calculatedHp;
        let baseDef = calculatedDef;
        let baseAtk = calculatedAtk * (1 + bonusAtkPercent);
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
          skills: charTemplate.skills
        });
      }
    });

    if (list.length > 0) {
      setCombatParty(list);
      const firstAliveIdx = list.findIndex(c => c.currentHp > 0);
      setActivePartyIndex(firstAliveIdx !== -1 ? firstAliveIdx : 0);
    }
  }, [partyIds, characterLevels, characterEquippedWeapon, inventoryWeapons, dungeonMode, dungeonBuffs, dungeonPartyHp, dungeonPartyUlt]);

  // Handle resizing observer
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          const w = Math.max(width, 400);
          setDimensions(prev => {
            if (prev.width === w && prev.height === 400) {
              return prev;
            }
            return { width: w, height: 400 };
          });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

// Keyboard binding trackers moved below trigger functions to satisfy block scope compilation rules

  // Spawn enemies by progressive Wave and align with original presets
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

    if (waveNum === 1) {
      setSpawnerPreset('slimes');
      const slimesData: { element: ElementType; color: string; hp: number }[] = [
        { element: 'Pyro', color: '#f97316', hp: 500 },
        { element: 'Hydro', color: '#3b82f6', hp: 600 },
        { element: 'Cryo', color: '#60a5fa', hp: 450 },
        { element: 'Electro', color: '#a855f7', hp: 550 },
        { element: 'Dendro', color: '#22c55e', hp: 500 }
      ];

      slimesData.forEach((sd, idx) => {
        list.push({
          id: `w1_slime_${idx}`,
          name: `${sd.element} Slime`,
          type: 'Normal',
          element: sd.element,
          color: sd.color,
          x: centerX + (Math.random() - 0.5) * 800,
          y: centerY + (Math.random() - 0.5) * 800,
          radius: 23,
          hp: sd.hp,
          maxHp: sd.hp,
          speed: 1.2 + Math.random() * 0.4,
          activeElements: [] as ElementType[],
          telegraphTimer: 0,
          isFrozen: 0,
          burningTicks: 0
        });
      });
      setBossHp(null);
    } else if (waveNum === 2) {
      setSpawnerPreset('slimes');
      // Mix of 6 faster slimes
      const slimesData = [
        { element: 'Pyro' as ElementType, color: '#f97316', hp: 600 },
        { element: 'Hydro' as ElementType, color: '#3b82f6', hp: 700 },
        { element: 'Cryo' as ElementType, color: '#60a5fa', hp: 550 },
        { element: 'Electro' as ElementType, color: '#a855f7', hp: 650 },
        { element: 'Anemo' as ElementType, color: '#10b981', hp: 500 },
        { element: 'Dendro' as ElementType, color: '#22c55e', hp: 600 }
      ];
      slimesData.forEach((sd, idx) => {
        list.push({
          id: `w2_slime_${idx}`,
          name: `Aggressive ${sd.element} Slime`,
          type: 'Normal',
          element: sd.element,
          color: sd.color,
          x: centerX + (Math.random() - 0.5) * 1000,
          y: centerY + (Math.random() - 0.5) * 1000,
          radius: 23,
          hp: sd.hp,
          maxHp: sd.hp,
          speed: 1.5,
          activeElements: [] as ElementType[],
          telegraphTimer: 0,
          isFrozen: 0,
          burningTicks: 0
        });
      });
      setBossHp(null);
    } else if (waveNum === 3) {
      setSpawnerPreset('elites');
      // Wave 3: Elites preset (Abyss Berserker + Abyss Cryo Channeler)
      list.push({
        id: 'abyss_orc_1',
        name: 'Abyss Obsidian Berserker',
        type: 'Elite',
        element: 'Geo',
        color: '#78350f',
        x: centerX - 400,
        y: centerY,
        radius: 36,
        hp: 3500,
        maxHp: 3500,
        speed: 1.0,
        activeElements: [] as ElementType[],
        telegraphTimer: 0,
        telegraphType: 'circle',
        isFrozen: 0,
        burningTicks: 0
      });
      list.push({
        id: 'abyss_orc_2',
        name: 'Abyss Cryo Channeler',
        type: 'Elite',
        element: 'Cryo',
        color: '#0284c7',
        x: centerX + 400,
        y: centerY,
        radius: 35,
        hp: 2800,
        maxHp: 2800,
        speed: 0.9,
        activeElements: [] as ElementType[],
        telegraphTimer: 0,
        telegraphType: 'line',
        isFrozen: 0,
        burningTicks: 0
      });
      setBossHp(null);
    } else if (waveNum === 4) {
      setSpawnerPreset('elites');
      // Wave 4: 2 Elites + 2 Slimes
      list.push({
        id: 'w4_abyss_geo',
        name: 'Overlord Obsidian Berserker',
        type: 'Elite',
        element: 'Geo',
        color: '#78350f',
        x: centerX - 500,
        y: centerY - 200,
        radius: 38,
        hp: 4000,
        maxHp: 4000,
        speed: 1.1,
        activeElements: [] as ElementType[],
        telegraphTimer: 0,
        telegraphType: 'circle',
        isFrozen: 0,
        burningTicks: 0
      });
      list.push({
        id: 'w4_abyss_cryo',
        name: 'Cryo Arch-Channeller',
        type: 'Elite',
        element: 'Cryo',
        color: '#0284c7',
        x: centerX + 500,
        y: centerY + 200,
        radius: 35,
        hp: 3200,
        maxHp: 3200,
        speed: 1.0,
        activeElements: [] as ElementType[],
        telegraphTimer: 0,
        telegraphType: 'line',
        isFrozen: 0,
        burningTicks: 0
      });
      // Plus Pyro & Hydro slimes
      const slimes = [
        { element: 'Pyro' as ElementType, color: '#f97316' },
        { element: 'Hydro' as ElementType, color: '#3b82f6' }
      ];
      slimes.forEach((sd, i) => {
        list.push({
          id: `w4_slime_${i}`,
          name: `Overcharged ${sd.element} Slime`,
          type: 'Normal',
          element: sd.element,
          color: sd.color,
          x: centerX + (Math.random() - 0.5) * 300,
          y: centerY + (Math.random() - 0.5) * 300,
          radius: 23,
          hp: 800,
          maxHp: 800,
          speed: 1.4,
          activeElements: [] as ElementType[],
          telegraphTimer: 0,
          isFrozen: 0,
          burningTicks: 0
        });
      });
      setBossHp(null);
    } else if (waveNum === 5) {
      // Wave 5: BOSS (The Calamity Erosion Drake)
      setSpawnerPreset('boss');
      list.push({
        id: 'calamity_drake_boss',
        name: 'The Calamity Erosion Drake',
        type: 'Boss',
        element: 'Pyro',
        color: '#dc2626',
        x: centerX,
        y: centerY - 80,
        radius: 65,
        hp: bossMaxHp,
        maxHp: bossMaxHp,
        speed: 0.7,
        activeElements: [] as ElementType[],
        telegraphTimer: 0,
        telegraphType: 'boss_beam',
        isFrozen: 0,
        burningTicks: 0
      });
      setBossHp(bossMaxHp);
    } else {
      // Wave 6+: Infinite scaled survival
      setSpawnerPreset('elites');
      const scaleMultiplier = 1 + (waveNum - 5) * 0.25;
      
      // Giant Mech
      list.push({
        id: `w${waveNum}_sentinel`,
        name: `Epoch Ruin Guard Lv.${waveNum}`,
        type: 'Elite',
        element: waveNum % 2 === 0 ? 'Cryo' : 'Geo',
        color: waveNum % 2 === 0 ? '#0284c7' : '#78350f',
        x: centerX,
        y: centerY,
        radius: 40,
        hp: Math.round(5000 * scaleMultiplier),
        maxHp: Math.round(5000 * scaleMultiplier),
        speed: 1.1,
        activeElements: [] as ElementType[],
        telegraphTimer: 0,
        telegraphType: waveNum % 2 === 0 ? 'line' : 'circle',
        isFrozen: 0,
        burningTicks: 0
      });

      // Spawn 3 scaled slimes in flanking positions
      const elementsList: ElementType[] = ['Pyro', 'Hydro', 'Electro'];
      elementsList.forEach((el, idx) => {
        list.push({
          id: `w${waveNum}_scaled_slime_${idx}`,
          name: `Unstable ${el} Core`,
          type: 'Normal',
          element: el,
          color: getElementColorHex(el),
          x: centerX + (idx - 1) * 350 + (Math.random() - 0.5) * 100,
          y: centerY - 350 + Math.random() * 200,
          radius: 22 + Math.random() * 5,
          hp: Math.round(1000 * scaleMultiplier),
          maxHp: Math.round(1000 * scaleMultiplier),
          speed: 1.4,
          activeElements: [] as ElementType[],
          telegraphTimer: 0,
          isFrozen: 0,
          burningTicks: 0
        });
      });
      setBossHp(null);
    }

    enemiesRef.current = list;
    shardsRef.current = [];
    particlesRef.current = [];
  };

  const triggerSpawnEnemies = (preset: 'slimes' | 'elites' | 'boss') => {
    // Map existing preset UI buttons to waves
    if (preset === 'slimes') {
      triggerSpawnWave(1);
    } else if (preset === 'elites') {
      triggerSpawnWave(3);
    } else if (preset === 'boss') {
      triggerSpawnWave(5);
    }
  };

  // Run on startup to spawn correct wave/dungeon enemies once battle starts
  useEffect(() => {
    if (!battleStarted) return;
    if (dungeonMode && dungeonRoomType) {
      if (dungeonRoomType === 'battle') {
        triggerSpawnWave(1);
      } else if (dungeonRoomType === 'elite') {
        triggerSpawnWave(3);
      } else if (dungeonRoomType === 'boss') {
        triggerSpawnWave(5);
      }
    } else {
      triggerSpawnWave(1);
    }
  }, [battleStarted, dungeonMode, dungeonRoomType]);

  const swapPartyIndex = (idx: number) => {
    const { combatParty: currentParty, activePartyIndex: currentPartyIndex } = loopStateRef.current;
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
    const baseCd = dungeonMode && dungeonBuffs.includes('Zephyr Pace') ? 0.7 : 1.0;
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
        const energyMultiplier = dungeonMode && dungeonBuffs.includes('Recharge Matrix') ? 1.5 : 1.0;
        return { 
          ...c, 
          skillCooldownRemaining: currentActiveChar.skills.skill.cooldown, 
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

    // Play SFX
    AetheriaAudioEngine.playUltimate();

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

    // Absorb ultimate stats
    setCombatParty(pList => pList.map((c, i) => {
      if (i === currentPartyIndex) {
        return { ...c, ultimateEnergy: 0 };
      }
      return c;
    }));
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
    enemiesRef.current.forEach(enemy => {
      if (enemy.hp <= 0) return;
      const dx = enemy.x - swipeX;
      const dy = enemy.y - swipeY;
      const dist = Math.hypot(dx, dy);

      if (dist < 40 + enemy.radius) {
        const crit = Math.random() < currentActiveChar.critRate;
        let baseDmg = currentActiveChar.atk * currentActiveChar.skills.basic.damageMultiplier;
        if (crit) baseDmg *= (1 + currentActiveChar.critDmg);

        applySkillDamage(enemy, baseDmg, currentActiveChar.element, false, crit, 'basic');
        hitSomething = true;
      }
    });

    // Award energy build on every basic attack swing! Fills the gauge nicely
    setCombatParty(pList => pList.map((c, i) => {
      if (i === currentPartyIndex) {
        const energyMultiplier = dungeonMode && dungeonBuffs.includes('Recharge Matrix') ? 1.5 : 1.0;
        const energyGain = (hitSomething ? 8 : 4) * energyMultiplier; // bonus reward for hitting targets
        return { ...c, ultimateEnergy: Math.min(c.ultimateMaxEnergy, c.ultimateEnergy + energyGain) };
      }
      return c;
    }));
  };

  const applySkillDamage = (enemy: any, baseDmg: number, type: ElementType, isUlt: boolean = false, isCrit: boolean = false, source: 'basic' | 'skill' | 'ultimate' = 'skill') => {
    let finalDmg = Math.round(baseDmg);
    let reactionName = '';
    let damageColor = '#ffffff';

    // Apply weather Pyro damage multiplier (+10% under Sunny weather)
    if (weatherRef.current === 'Sunny' && type === 'Pyro') {
      finalDmg = Math.round(finalDmg * 1.1);
    }

    // Apply element reaction engine
    const activeDebuffs = enemy.activeElements as ElementType[];
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
      // Cryo + Electro = Superconduct
      else if ((activeDebuffs.includes('Cryo') && type === 'Electro') || (activeDebuffs.includes('Electro') && type === 'Cryo')) {
        finalDmg += 200;
        reactionName = '⚡ SUPERCONDUCT (DEF SHRED) ⚡';
        damageColor = '#c084fc';
        onIncrementStat('reactions');
        enemy.activeElements = [];
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
      // Anemo + any Element = Swirl spreads
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

    // Decrease enemy HP
    enemy.hp = Math.max(0, enemy.hp - finalDmg);
    
    // Play crispy hit sound!
    AetheriaAudioEngine.playHit();
    
    // Apply Vampiric Grace dungeon healing buff (3% of damage)
    if (dungeonMode && dungeonBuffs.includes('Vampiric Grace')) {
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

      // Check if boss beaten
      if (enemy.type === 'Boss') {
        onIncrementStat('bossesBeaten');
        onEarnRewards(500, 25000, 150); // Massive boss payout!
        setBossHp(0);
        spawnTextRef.current(enemy.x, enemy.y, '🏆 DRAKE DEFEATED! 🏆', '#f59e0b', 24, true);
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
        battleStarted: currentBattleStarted
      } = loopStateRef.current;

      const currentActiveChar = currentParty[currentPartyIndex] || null;
      if (!ctx || !canvasRef.current || !currentActiveChar) {
        animationId = requestAnimationFrame(updateGameLoop);
        return;
      }

      if (!currentBattleStarted || currentIsPaused || currentIsGameOver) {
        // Redraw current frozen state but add a beautiful overlay
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.05)'; // Very faint fade transition look
        ctx.fillRect(0, 0, currentDimensions.width, currentDimensions.height);
        
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
        if (Math.random() < 0.15) setDodgeCd(dodgeCdRef.current);
      } else if (dodgeCd > 0) {
        setDodgeCd(0);
      }
      if (parryCdRef.current > 0) {
        parryCdRef.current = Math.max(0, parryCdRef.current - 0.016 * combatSpeed);
        if (Math.random() < 0.15) setParryCd(parryCdRef.current);
      } else if (parryCd > 0) {
        setParryCd(0);
      }

      // Clear Screen
      ctx.clearRect(0, 0, currentDimensions.width, currentDimensions.height);

      // Calculate camera scroll offsets to keep the player centered
      const camX = Math.max(0, Math.min(WORLD_WIDTH - currentDimensions.width, playerRef.current.x - currentDimensions.width / 2));
      const camY = Math.max(0, Math.min(WORLD_HEIGHT - currentDimensions.height, playerRef.current.y - currentDimensions.height / 2));

      ctx.save();

      // Apply screenshake
      if (shakeRef.current.intensity > 0.5) {
        ctx.translate(shakeRef.current.x, shakeRef.current.y);
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

      // Normalize speed
      const isMoving = dx !== 0 || dy !== 0;
      const isShiftHeld = keyboardState.current['shift'];
      const activeWeather = weatherRef.current;
      
      let runningSpeed = dungeonMode && dungeonBuffs.includes('Zephyr Pace') ? 2.5 * 1.15 : 2.5;
      
      if (isMoving && isShiftHeld && staminaRef.current > 0) {
        const sprintRate = dungeonMode && dungeonBuffs.includes('Zephyr Pace') ? 3.8 * 1.15 : 3.8;
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
        const currentSpeed = (currentIsDashing ? 8.2 : runningSpeed) * speedModifier;
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
      setCombatParty(pList => {
        const hasCooldown = pList.some((c, idx) => idx === currentPartyIndex && c.skillCooldownRemaining > 0);
        if (!hasCooldown) return pList;
        return pList.map((c, idx) => {
          if (idx === currentPartyIndex && c.skillCooldownRemaining > 0) {
            return { ...c, skillCooldownRemaining: Math.max(0, c.skillCooldownRemaining - 0.016 * combatSpeed) };
          }
          return c;
        });
      });

      // --- DRAW CRYSTAL PICKUP SHARDS ---
      for (let i = shardsRef.current.length - 1; i >= 0; i--) {
        const shard = shardsRef.current[i];
        shard.draw(ctx);

        // Check magnet collision with player
        const collDist = Math.hypot(playerRef.current.x - shard.x, playerRef.current.y - shard.y);
        if (collDist < playerRef.current.radius + shard.radius) {
          // Grant custom bubble shield relative to element
          setShieldActive(shard.element);
          
          // Apply Bulwark Guard rogue-like buff (+40% shield strength)
          const baseShield = dungeonMode && dungeonBuffs.includes('Bulwark Guard') ? 840 : 600;
          setShieldWeight(baseShield); // Shield HP buffer
          
          spawnFloatingDamageText(
            playerRef.current.x,
            playerRef.current.y - 30,
            `💎 SHIELD: ${shard.element.toUpperCase()} CORE! (${baseShield} HP)`,
            getElementColorHex(shard.element),
            11
          );
          shardsRef.current.splice(i, 1);
        }
      }

      // --- ENEMIES AI AND DRAW STEP ---
      enemiesRef.current.forEach(enemy => {
        if (enemy.hp <= 0) return;

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

      animationId = requestAnimationFrame(updateGameLoop);
    };

    updateGameLoop();
    return () => cancelAnimationFrame(animationId);
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

      if (!loopStateRef.current.battleStarted || loopStateRef.current.isPaused || loopStateRef.current.isGameOver) return;

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
      const updatedParty = pList.map((c, idx) => {
        if (idx === currentPartyIndex) {
          return { ...c, currentHp: Math.max(0, c.currentHp - amount) };
        }
        return c;
      });

      // Show float
      spawnFloatingDamageText(playerRef.current.x, playerRef.current.y, `-${amount}`, '#f43f5e', 14, true);

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
    if (isPaused || isGameOver) return;
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
    if (isPaused || isGameOver) return;
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
    
    setCombatParty(pList => pList.map(c => ({
      ...c,
      currentHp: c.maxHp,
      ultimateEnergy: 0
    })));
    
    // Quick indicator float
    spawnFloatingDamageText(400, 200, 'WARFARE RESET • WAVE 1 PREPARED', '#10b981', 16, true);
  };

  const activeTheme = getElementUiTheme(activeChar?.element);

  return (
    <div 
      className={`bg-[#0b0f19]/85 border rounded-xl overflow-hidden flex flex-col h-full min-h-[600px] backdrop-blur-md transition-all duration-500 ${activeTheme.borderClass} ${activeTheme.shadowGlow} ${activeTheme.pulseGlowClass} ${isUiShaking ? 'animate-shake' : ''}`} 
      id="arena_main_root"
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${activeTheme.bgGradient.replace('from-', '').split(' ')[0]}, #0b0f19)`
      }}
    >
      
      {/* Top Combat Info HUD */}
      <div className="bg-[#060810]/95 px-5 py-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          <p className="text-[10.5px] text-slate-400 mt-1 uppercase font-mono tracking-wide">
            Score: <span className="text-white font-bold">{gameScore} pts</span> • Aim Option: <span className="text-cyan-400">Mouse Click Strike</span>
          </p>
        </div>

        {/* Live Records and settings trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Highscore indicator badges */}
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-black uppercase rounded py-1 px-2.5 flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5" /> High Score: Wave {highScoreWave}
          </div>

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

            {/* Manual Preset selectors */}
            {(['slimes', 'elites', 'boss'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => triggerSpawnEnemies(preset)}
                className={`p-1.5 px-3.5 text-[9.5px] font-black rounded-md uppercase tracking-wider border transition-all cursor-pointer ${
                  spawnerPreset === preset
                    ? 'bg-red-500/15 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                    : 'bg-black/35 border-white/10 text-slate-400 hover:text-slate-205'
                }`}
              >
                Spawn: {preset}
              </button>
            ))}

            {/* Pause buttons */}
            <button
              onClick={() => { AetheriaAudioEngine.playClick(); setIsPaused(p => !p); }}
              className="p-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-[9.5px] rounded-md font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-red-950/40"
            >
              <Pause className="w-3 h-3" /> Pause
            </button>
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
                  THE CALAMITY EROSION DRAKE
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
              <h3 className="text-lg font-black text-slate-105 font-display tracking-widest uppercase flex items-center justify-center gap-2">
                <Pause className="w-5 h-5 text-red-500" /> TIME SUSPENDED
              </h3>
              <p className="text-slate-400 text-xs uppercase font-mono">
                Current Wave: {currentWave} • Points: {gameScore}
              </p>
              
              <div className="border border-white/5 bg-black/30 p-3 rounded-lg text-left text-[10px] text-slate-400 space-y-1 font-mono">
                <div>💥 REACTIONS TRIGGERED: <b className="text-white">AVAILABLE</b></div>
                <div>⚔️ SHARDS COLLECTIBLE: <b className="text-cyan-400">GEO REACTIONS</b></div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { AetheriaAudioEngine.playClick(); setIsPaused(false); }}
                  className="w-full p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg font-black uppercase tracking-wider cursor-pointer"
                >
                  Resume Campaign
                </button>
                <button
                  onClick={handleRestartCombat}
                  className="w-full p-2.5 bg-black/45 hover:bg-black/75 border border-white/10 text-slate-200 text-xs rounded-lg font-black uppercase tracking-wider cursor-pointer"
                >
                  Restart Wave 1
                </button>
                {onBackToMenu && (
                  <button
                    onClick={() => { AetheriaAudioEngine.playClick(); onBackToMenu(); }}
                    className="w-full p-2.5 bg-red-650/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 text-xs rounded-lg font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Home className="w-3.5 h-3.5" /> Return To Home Menu
                  </button>
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

        {/* Game Canvas */}
        <canvas 
          ref={canvasRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="w-full flex-1 touch-none cursor-crosshair block bg-[#02050c]"
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
        />

        {/* On screen active controls overlay for mobile and clicking explorers */}
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
      </div>
    </div>
  );
}
