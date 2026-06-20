import React, { useState, useEffect } from 'react';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { ElementType, Weapon, CombatCharacter } from '../types';
import { 
  Trophy, ShieldAlert, Sparkles, Heart, Zap, Play, ArrowRight, Shield, Award,
  Flame, Droplets, Wind, Orbit, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AetheriaAudioEngine } from '../utils/audio';
import CombatArena from './CombatArena';

interface RogueDungeonProps {
  partyIds: string[];
  ownedCharacterIds: string[];
  characterLevels: Record<string, number>;
  characterEquippedWeapon: Record<string, string>;
  inventoryWeapons: Weapon[];
  characterPortraits: Record<string, number>;
  onEarnRewards: (gems: number, mora: number, exp: number) => void;
  onIncrementStat: (pk: any, val?: number) => void;
  onBackToMenu: () => void;
  devCheatsEnabled?: boolean;
  screenShakeEnabled?: boolean;
  combatSpeed?: number;
}

const DUNGEON_BUFFS = [
  { name: 'Aetheric Edge', desc: '⚔️ Attack Power increased by +25% inside battles.' },
  { name: 'Bulwark Guard', desc: '🛡️ Crystal Shield capacity increased by +40%.' },
  { name: 'Recharge Matrix', desc: '⚡ Ultimate Energy Charge Rate increased by +50%.' },
  { name: 'Crystalline Focus', desc: '🎯 Critical Strike Rate increased by +15%.' },
  { name: 'Vampiric Grace', desc: '🧛 Life Steal: Heals active character for 3% of all damage dealt.' },
  { name: 'Zephyr Pace', desc: '💨 Movement Speed +15% & Dodge Dash cooldown reduced by -30%.' },
];

export default function RogueDungeon({
  partyIds,
  ownedCharacterIds,
  characterLevels,
  characterEquippedWeapon,
  inventoryWeapons,
  characterPortraits,
  onEarnRewards,
  onIncrementStat,
  onBackToMenu,
  devCheatsEnabled = true,
  screenShakeEnabled = true,
  combatSpeed = 1.0
}: RogueDungeonProps) {
  // Parse helper for loading state from localStorage
  const getSavedValue = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem('aetheria_ruins_save_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed[key] !== undefined) {
          return parsed[key];
        }
      }
    } catch (e) {
      console.error(`Error loading ${key} from save`, e);
    }
    return defaultValue;
  };

  // Run states
  const [runActive, setRunActive] = useState<boolean>(() => getSavedValue('runActive', false));
  const [currentRoomIdx, setCurrentRoomIdx] = useState<number>(() => getSavedValue('currentRoomIdx', 0));
  const [dungeonMap, setDungeonMap] = useState<('battle' | 'elite' | 'rest' | 'buff' | 'boss')[]>(() => getSavedValue('dungeonMap', []));
  const [partyHp, setPartyHp] = useState<Record<string, number>>(() => getSavedValue('partyHp', {}));
  const [partyUlt, setPartyUlt] = useState<Record<string, number>>(() => getSavedValue('partyUlt', {}));
  const [activeBuffs, setActiveBuffs] = useState<string[]>(() => getSavedValue('activeBuffs', []));
  
  // Choice states
  const [offeredBuffs, setOfferedBuffs] = useState<string[]>(() => getSavedValue('offeredBuffs', []));
  const [roomCompleted, setRoomCompleted] = useState<boolean>(() => getSavedValue('roomCompleted', false));
  const [runFinished, setRunFinished] = useState<'victory' | 'defeat' | null>(() => getSavedValue('runFinished', null));
  const [runPartyIds, setRunPartyIds] = useState<string[]>(() => getSavedValue('runPartyIds', []));
  
  const [combatActive, setCombatActive] = useState<boolean>(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState<boolean>(false);

  // Auto-save effect
  useEffect(() => {
    if (runActive) {
      const saveData = {
        runActive,
        currentRoomIdx,
        dungeonMap,
        partyHp,
        partyUlt,
        activeBuffs,
        offeredBuffs,
        roomCompleted,
        runFinished,
        runPartyIds
      };
      localStorage.setItem('aetheria_ruins_save_v1', JSON.stringify(saveData));
    } else {
      localStorage.removeItem('aetheria_ruins_save_v1');
    }
  }, [
    runActive,
    currentRoomIdx,
    dungeonMap,
    partyHp,
    partyUlt,
    activeBuffs,
    offeredBuffs,
    roomCompleted,
    runFinished,
    runPartyIds
  ]);

  // Report room progress to stats on mount/load
  useEffect(() => {
    if (runActive) {
      onIncrementStat('rogueRoom', currentRoomIdx + 1);
    }
  }, [runActive, currentRoomIdx]);

  // Initialize a new run
  const handleStartRun = () => {
    AetheriaAudioEngine.playClick();
    
    // Generate map of 30 rooms
    const map: ('battle' | 'elite' | 'rest' | 'buff' | 'boss')[] = [];
    for (let i = 1; i <= 29; i++) {
      if (i === 5 || i === 11 || i === 17 || i === 23 || i === 27) {
        map.push('buff');
      } else if (i === 8 || i === 15 || i === 22 || i === 26) {
        map.push('rest');
      } else if (i === 4 || i === 10 || i === 16 || i === 20 || i === 25 || i === 28) {
        map.push('elite');
      } else {
        map.push('battle');
      }
    }
    map.push('boss');
    
    // Initialize healths from character levels (max Hp calculation)
    const initialHps: Record<string, number> = {};
    const initialUlts: Record<string, number> = {};
    partyIds.forEach(id => {
      const charTemplate = PLAYABLE_CHARACTERS.find(c => c.id === id);
      if (charTemplate) {
        const charLvl = characterLevels[id] || 1;
        const charMult = charTemplate.rarity === 5 ? 3.0 : charTemplate.rarity === 4 ? 1.5 : 1.0;
        const calculatedHp = (charTemplate.baseStats.hp + (charLvl * 14)) * charMult;
        
        // Add portrait buffs if any
        const pLvl = characterPortraits?.[id] || 0;
        const pBuffs = getAccumulatedPortraitBuffs(id, pLvl);
        const finalHp = Math.round(calculatedHp * (1 + pBuffs.hp));
        
        initialHps[id] = finalHp;
        initialUlts[id] = 40; // Starts at 40 energy (50% charge)
      }
    });

    setRunPartyIds(partyIds);
    setDungeonMap(map);
    setPartyHp(initialHps);
    setPartyUlt(initialUlts);
    setActiveBuffs([]);
    setCurrentRoomIdx(0);
    setRunActive(true);
    setRoomCompleted(false);
    setRunFinished(null);
    setCombatActive(false);
    onIncrementStat('rogueRoom', 1);
    
    // Auto trigger first room check
    evaluateRoomEnter(0, map, initialHps);
  };

  // Helper helper to fetch portrait buffs
  function getAccumulatedPortraitBuffs(charId: string, level: number) {
    return { hp: level * 0.05, atk: level * 0.05, def: level * 0.05, critRate: level * 0.01, critDmg: level * 0.02 };
  }

  const evaluateRoomEnter = (
    idx: number, 
    map: ('battle' | 'elite' | 'rest' | 'buff' | 'boss')[],
    hps: Record<string, number>
  ) => {
    const rType = map[idx];
    setRoomCompleted(false);
    
    if (rType === 'buff') {
      // Pick 3 random buffs
      const shuffled = [...DUNGEON_BUFFS].sort(() => 0.5 - Math.random());
      setOfferedBuffs(shuffled.slice(0, 3).map(b => b.name));
    } else if (rType === 'rest') {
      // Direct choices
    } else {
      // Battle/Elite/Boss - player triggers combat
    }
  };

  // Rest choices
  const handleRestChoice = (type: 'heal' | 'ult') => {
    AetheriaAudioEngine.playWaveClear();
    if (type === 'heal') {
      // Restore all characters back to 100% max HP
      const healedHps = { ...partyHp };
      runPartyIds.forEach(id => {
        const charTemplate = PLAYABLE_CHARACTERS.find(c => c.id === id);
        if (charTemplate) {
          const charLvl = characterLevels[id] || 1;
          const charMult = charTemplate.rarity === 5 ? 3.0 : charTemplate.rarity === 4 ? 1.5 : 1.0;
          const calculatedHp = (charTemplate.baseStats.hp + (charLvl * 14)) * charMult;
          const pLvl = characterPortraits?.[id] || 0;
          const pBuffs = getAccumulatedPortraitBuffs(id, pLvl);
          healedHps[id] = Math.round(calculatedHp * (1 + pBuffs.hp));
        }
      });
      setPartyHp(healedHps);
    } else {
      // Charge celestial bursts to 100% (80 max energy)
      const chargedUlts = { ...partyUlt };
      runPartyIds.forEach(id => {
        chargedUlts[id] = 80;
      });
      setPartyUlt(chargedUlts);
    }
    setRoomCompleted(true);
  };

  // Buff selection
  const handleSelectBuff = (buffName: string) => {
    AetheriaAudioEngine.playUltimate();
    setActiveBuffs(prev => [...prev, buffName]);
    setRoomCompleted(true);
  };

  // Handle combat end callback
  const handleDungeonBattleEnd = (victory: boolean, remainingHps: Record<string, number>, remainingUlts?: Record<string, number>) => {
    setCombatActive(false);
    if (victory) {
      setPartyHp(remainingHps);
      if (remainingUlts) {
        setPartyUlt(remainingUlts);
      }
      setRoomCompleted(true);
      
      // If it was the final room (Boss), trigger victory!
      if (dungeonMap[currentRoomIdx] === 'boss') {
        setRunFinished('victory');
        onEarnRewards(500, 20000, 150); // Massive gems/mora!
        onIncrementStat('bossesBeaten');
      }
    } else {
      setRunFinished('defeat');
    }
  };

  // Proceed to next room
  const handleProceedNextRoom = () => {
    AetheriaAudioEngine.playClick();
    const nextIdx = currentRoomIdx + 1;
    if (nextIdx < dungeonMap.length) {
      onIncrementStat('rogueRoom', nextIdx + 1);
      setCurrentRoomIdx(nextIdx);
      evaluateRoomEnter(nextIdx, dungeonMap, partyHp);
    }
  };

  const currentRoomType = dungeonMap[currentRoomIdx];

  // Helper to fetch element icons
  const getElementIcon = (el: ElementType) => {
    switch (el) {
      case 'Pyro': return <Flame className="w-3.5 h-3.5 text-red-400" />;
      case 'Hydro': return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Anemo': return <Wind className="w-3.5 h-3.5 text-teal-350" />;
      default: return <Orbit className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  if (runFinished) {
    const isWin = runFinished === 'victory';
    return (
      <div className="bg-[#0b0f19]/85 border border-white/10 rounded-xl p-8 max-w-lg mx-auto text-center space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.65)] backdrop-blur-md">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 mx-auto ${
          isWin ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.25)]' : 'bg-red-500/10 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.25)]'
        }`}>
          {isWin ? <Award className="w-10 h-10 text-amber-400" /> : <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />}
        </div>

        <div className="space-y-1">
          <h3 className={`text-2xl font-black font-display tracking-widest uppercase ${
            isWin ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-350' : 'text-red-500'
          }`}>
            {isWin ? '🏆 RUINS CLEARED 🏆' : '💀 RUN TERMINATED 💀'}
          </h3>
          <p className="text-slate-400 text-xs font-mono uppercase tracking-wide">
            {isWin ? 'Matrices stabilized. Rifts locked.' : `Matrix collapsed at room ${currentRoomIdx + 1}/10`}
          </p>
        </div>

        {isWin ? (
          <div className="border border-white/5 bg-slate-950/50 p-4 rounded-xl space-y-3 font-mono">
            <span className="text-[10px] text-slate-500 uppercase block font-black border-b border-white/5 pb-1">Rewards Claimed</span>
            <div className="flex justify-around text-xs">
              <span className="text-amber-400 font-extrabold flex items-center gap-1">💎 +500 GEMS</span>
              <span className="text-yellow-500 font-extrabold flex items-center gap-1">🪙 +20,000 MORA</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-355 italic max-w-sm mx-auto leading-relaxed uppercase">
            Rift structures fractured under pressure. Regenerate wishes, refine weapons, and attempt the matrix deep dive again.
          </p>
        )}

        <button
          onClick={() => {
            AetheriaAudioEngine.playClick();
            setRunActive(false);
            setRunFinished(null);
          }}
          className={`w-full p-3 font-black text-xs uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
            isWin 
              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20' 
              : 'bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200'
          }`}
        >
          Return to Deck Console
        </button>
      </div>
    );
  }

  if (runActive) {
    if (combatActive) {
      return (
        <CombatArena 
          partyIds={runPartyIds}
          onChangeParty={() => {}}
          onEarnRewards={onEarnRewards}
          onIncrementStat={onIncrementStat}
          ownedCharacterIds={ownedCharacterIds}
          characterLevels={characterLevels}
          characterEquippedWeapon={characterEquippedWeapon}
          inventoryWeapons={inventoryWeapons}
          characterPortraits={characterPortraits}
          dungeonMode={true}
          dungeonBuffs={activeBuffs}
          dungeonPartyHp={partyHp}
          dungeonPartyUlt={partyUlt}
          dungeonRoomType={currentRoomType === 'elite' ? 'elite' : currentRoomType === 'boss' ? 'boss' : 'battle'}
          onDungeonBattleEnd={handleDungeonBattleEnd}
          devCheatsEnabled={devCheatsEnabled}
          screenShakeEnabled={screenShakeEnabled}
          combatSpeed={combatSpeed}
        />
      );
    }

    return (
      <div className="bg-[#0b0f19]/85 border border-white/10 rounded-xl overflow-hidden p-6 flex flex-col md:flex-row gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.65)] backdrop-blur-md min-h-[500px]" id="dungeon_run_container">
        
        {/* Left exploration status panel */}
        <div className="w-full md:w-1/3 border border-white/5 bg-[#05060b]/45 rounded-xl p-5 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono border-b border-white/10 pb-2">
              Deep Dive Matrix Info
            </h4>
            
            <div className="space-y-2">
              <span className="text-[9.5px] text-slate-500 uppercase block font-black">Ruins Active Buffs ({activeBuffs.length})</span>
              {activeBuffs.length === 0 ? (
                <div className="text-[10px] text-slate-600 font-mono uppercase italic py-2">No blessings acquired...</div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {activeBuffs.map((bName, bIdx) => (
                    <span 
                      key={bIdx} 
                      className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[8.5px] font-bold rounded py-0.5 px-2 uppercase tracking-wide"
                    >
                      {bName.replace(' ', ' • ')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Party status HP list */}
            <div className="space-y-2.5 pt-2 border-t border-white/5">
              <span className="text-[9.5px] text-slate-500 uppercase block font-black">Roster Vital Signals</span>
              <div className="space-y-2">
                {runPartyIds.map(id => {
                  const pc = PLAYABLE_CHARACTERS.find(c => c.id === id);
                  if (!pc) return null;
                  const currentH = partyHp[id] !== undefined ? partyHp[id] : 100;
                  const charLvl = characterLevels[id] || 1;
                  const charMult = pc.rarity === 5 ? 3.0 : pc.rarity === 4 ? 1.5 : 1.0;
                  const calculatedHp = (pc.baseStats.hp + (charLvl * 14)) * charMult;
                  const pLvl = characterPortraits?.[pc.id] || 0;
                  const pBuffs = getAccumulatedPortraitBuffs(pc.id, pLvl);
                  const maxH = Math.round(calculatedHp * (1 + pBuffs.hp));
                  const isDead = currentH <= 0;
                  
                  return (
                    <div key={id} className="bg-black/30 p-2 rounded-lg border border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isDead ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className="text-[10.5px] font-black text-slate-300 uppercase tracking-tighter truncate max-w-[80px]">
                          {pc.name}
                        </span>
                      </div>
                      
                      <div className="flex-1 max-w-[80px] bg-slate-950 rounded-sm h-1.5 overflow-hidden p-[1px] border border-white/5">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${Math.max(0, (currentH / maxH) * 100)}%` }}
                        />
                      </div>
                      
                      <span className="text-[9px] font-mono font-black text-slate-400">
                        {isDead ? ' fallen' : `${currentH}/${maxH}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              AetheriaAudioEngine.playClick();
              setShowAbandonConfirm(true);
            }}
            className="w-full py-2 bg-red-955/20 border border-red-500/20 text-red-400 hover:bg-red-955/40 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Abandon Matrix Run
          </button>
        </div>

        {/* Right active room action area */}
        <div className="flex-1 flex flex-col justify-between gap-6">
          
          {/* Header Map Node Tracker */}
          <div className="bg-[#05060b]/45 border border-white/5 p-4 rounded-xl">
            <span className="text-[9.5px] text-slate-500 uppercase block font-black mb-3">Dimensional Rift Node Track</span>
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
              {dungeonMap.map((type, idx) => {
                const isActive = idx === currentRoomIdx;
                const isPassed = idx < currentRoomIdx;
                return (
                  <div key={idx} className="flex items-center flex-1 min-w-[25px]">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono border transition-all ${
                      isActive 
                        ? 'bg-indigo-500 border-indigo-400 text-slate-950 shadow-[0_0_12px_rgba(99,102,241,0.5)] scale-110'
                        : isPassed
                          ? 'bg-slate-900 border-indigo-500/40 text-indigo-400'
                          : 'bg-black/30 border-white/5 text-slate-500'
                    }`}>
                      {idx + 1}
                    </div>
                    {idx < dungeonMap.length - 1 && (
                      <div className={`h-[2px] flex-1 min-w-[5px] ${isPassed ? 'bg-indigo-500/40' : 'bg-white/5'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Interactive Center Box */}
          <div className="flex-1 border border-white/5 bg-[#05060b]/45 rounded-xl p-8 flex flex-col items-center justify-center min-h-[220px]">
            <AnimatePresence mode="wait">
              
              {/* Room Choice Selected UI */}
              {!roomCompleted ? (
                <motion.div
                  key="room_active"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full text-center space-y-6"
                >
                  
                  {/* Buff Selection Room */}
                  {currentRoomType === 'buff' && (
                    <div className="space-y-6 w-full">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded uppercase tracking-wider font-mono font-black animate-pulse">
                          🌿 BLESSING OF AEON
                        </span>
                        <h4 className="text-lg font-black text-slate-100 uppercase tracking-widest font-display">Blessing Matrix Selection</h4>
                        <p className="text-[10px] text-slate-400 max-w-sm mx-auto uppercase">Choose one blessing matrix stream to carry forward</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                        {offeredBuffs.map((bName) => {
                          const buffObj = DUNGEON_BUFFS.find(db => db.name === bName);
                          return (
                            <button
                              key={bName}
                              onClick={() => handleSelectBuff(bName)}
                              className="bg-black/45 hover:bg-slate-900 border border-white/5 hover:border-indigo-500/40 p-4 rounded-xl text-center space-y-2 flex flex-col justify-between items-center transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-400">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                              </div>
                              <span className="text-[11px] font-black text-slate-200 block uppercase tracking-tight">{bName}</span>
                              <p className="text-[9px] text-slate-400 font-sans leading-snug">{buffObj?.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Rest site Room */}
                  {currentRoomType === 'rest' && (
                    <div className="space-y-6 max-w-sm mx-auto">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded uppercase tracking-wider font-mono font-black">
                          🕯️ RIFT CAFE
                        </span>
                        <h4 className="text-lg font-black text-slate-100 uppercase tracking-widest font-display">Aether Rest Site</h4>
                        <p className="text-[10px] text-slate-400 uppercase">Select one action matrix to rejuvenate vital sign indices</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 w-full">
                        <button
                          onClick={() => handleRestChoice('heal')}
                          className="bg-black/45 hover:bg-[#0c1912] border border-white/5 hover:border-emerald-500/40 p-4 rounded-xl flex items-center gap-4 transition-all duration-300 active:scale-95 cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:border-emerald-400">
                            <Heart className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-black text-slate-200 block uppercase tracking-wide">Restore Life Force</span>
                            <span className="text-[9px] text-slate-400 font-mono block">Heals all active party members back to 100% max HP.</span>
                          </div>
                        </button>

                        <button
                          onClick={() => handleRestChoice('ult')}
                          className="bg-black/45 hover:bg-[#1a140b] border border-white/5 hover:border-amber-500/40 p-4 rounded-xl flex items-center gap-4 transition-all duration-300 active:scale-95 cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:border-amber-400">
                            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-black text-slate-200 block uppercase tracking-wide">Charge Celestial Bursts</span>
                            <span className="text-[9px] text-slate-400 font-mono block">Charges all characters ultimate energy indices to 100%.</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Battle / Elite / Boss trigger screen */}
                  {(currentRoomType === 'battle' || currentRoomType === 'elite' || currentRoomType === 'boss') && (
                    <div className="space-y-6 max-w-sm mx-auto">
                      <div className="space-y-1">
                        <span className={`text-[9px] border px-2 py-0.5 rounded uppercase tracking-wider font-mono font-black ${
                          currentRoomType === 'boss' ? 'bg-red-500/10 border-red-500/35 text-red-400 animate-pulse' :
                          currentRoomType === 'elite' ? 'bg-purple-500/10 border-purple-500/35 text-purple-400' :
                          'bg-indigo-500/10 border-indigo-500/35 text-indigo-400'
                        }`}>
                          {currentRoomType === 'boss' ? '👿 THREAT DETECTED: Boss Room' :
                           currentRoomType === 'elite' ? '⚔️ THREAT DETECTED: Elite Combat' :
                           '⚔️ CONFLICT ZONE: Battle Room'}
                        </span>
                        <h4 className="text-lg font-black text-slate-100 uppercase tracking-widest font-display">
                          {currentRoomType === 'boss' ? 'THE DRAKE CALAMITY RIFT' :
                           currentRoomType === 'elite' ? 'Epoch Ruin Sentinel guard' :
                           'Cognitive Slime Matrix'}
                        </h4>
                        <p className="text-[10px] text-slate-450 uppercase">Prepare indices. Eliminate all threats to progress.</p>
                      </div>

                      <button
                        onClick={() => {
                          AetheriaAudioEngine.playClick();
                          setCombatActive(true);
                        }}
                        className={`w-full p-4 font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all ${
                          currentRoomType === 'boss' 
                            ? 'bg-red-650 hover:bg-red-550 text-white shadow-lg shadow-red-950/40 hover:scale-105' 
                            : 'bg-indigo-650 hover:bg-indigo-550 text-white shadow-lg shadow-indigo-950/40 hover:scale-105'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" /> Deploy Strike Squad
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="room_cleared"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center space-y-5 max-w-sm mx-auto"
                >
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16_185,129,0.15)]">
                    <Trophy className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-emerald-400 uppercase tracking-widest font-display">Node Cleansed</h4>
                    <p className="text-[10px] text-slate-450 uppercase">Rift signals stabilized. Safe to progress deeper.</p>
                  </div>
                  
                  <button
                    onClick={handleProceedNextRoom}
                    className="w-full p-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 hover:scale-105 duration-200"
                  >
                    Proceed Deeper <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Custom Abandon Confirmation Modal */}
        <AnimatePresence>
          {showAbandonConfirm && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md bg-gradient-to-b from-[#160d0d] to-[#0a0505] border border-red-500/30 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-center space-y-6"
                id="ruins_abandon_modal"
              >
                {/* Alert Icon */}
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/35 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(239,68,68,0.15)] animate-pulse">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>

                {/* Title & Warning */}
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-red-400 uppercase tracking-widest font-display">
                    Abandon Matrix Run?
                  </h3>
                  <p className="text-xs text-slate-350 font-mono leading-relaxed uppercase">
                    Abandoning the ruins will terminate your progress at room {currentRoomIdx + 1}/30. All active blessings and temporary HP indicators will be permanently lost.
                  </p>
                </div>

                {/* Button Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      AetheriaAudioEngine.playClick();
                      setShowAbandonConfirm(false);
                    }}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Abort (Keep Running)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      AetheriaAudioEngine.playClick();
                      setShowAbandonConfirm(false);
                      setRunActive(false);
                    }}
                    className="flex-1 py-3 bg-red-650 hover:bg-red-550 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.25)] cursor-pointer"
                  >
                    Confirm Abandon
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Welcome / Entrance Screen
  return (
    <div className="bg-[#0b0f19]/85 border border-white/10 rounded-xl overflow-hidden p-6 md:p-8 max-w-2xl mx-auto flex flex-col md:flex-row gap-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md" id="dungeon_welcome_card">
      <div className="flex-1 space-y-6">
        <div>
          <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">
            Rogue-Like ruins
          </span>
          <h3 className="text-xl md:text-2xl font-black text-slate-100 uppercase tracking-widest font-display mt-2">
            Aether Ruins Explorer
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Every deep dive generates a new pathway of rifts. Collect custom blessings, maintain frontline roster HP indices, and purge the Calamity Erosion Drake at Node 30.
          </p>
        </div>

        <div className="space-y-2.5 bg-black/40 border border-white/5 p-4 rounded-xl">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block font-display">Ruins Core Constraints:</span>
          <div className="space-y-1.5 text-[10px] font-mono text-slate-350 uppercase">
            <div>• ROOM NODES: <b className="text-slate-100">30 levels generated per matrix deep dive</b></div>
            <div>• PARTY HEALTH: <b className="text-red-400">Hp persists between battle nodes</b></div>
            <div>• ULTIMATE BURSTS: <b className="text-amber-400">Energies carry forward</b></div>
            <div>• blessings: <b className="text-indigo-400">Choose buffs along the matrix choice rooms</b></div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleStartRun}
            className="w-full p-4 bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_25px_rgba(79,70,229,0.3)] cursor-pointer"
          >
            Initialize Matrix Deep Dive
          </button>
          <button
            onClick={() => {
              AetheriaAudioEngine.playClick();
              onBackToMenu();
            }}
            className="w-full p-2.5 bg-slate-900/60 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-350 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
          >
            Return to Main Menu
          </button>
        </div>
      </div>

      <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 space-y-4">
        <h4 className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest font-mono">
          Roster Deploy Status
        </h4>
        <div className="space-y-2">
          {partyIds.map((id, index) => {
            const pc = PLAYABLE_CHARACTERS.find(c => c.id === id);
            if (!pc) return null;
            return (
              <div key={id} className="bg-[#030408]/60 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getElementIcon(pc.element)}
                  <span className="text-[10.5px] font-black text-slate-200 uppercase tracking-tighter truncate max-w-[90px]">
                    {pc.name}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">
                  READY
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
