/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GDD_DATA } from '../data/world';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { WEAPONS_DATABASE } from '../data/weapons';
import { AetheriaAudioEngine } from '../utils/audio';
import { getPortraitInfoList } from '../utils/portraits';
import { Shield, Sparkles, BookOpen, Compass, Sword, Landmark, Hammer, Coins, Trophy, DollarSign, Image, Eye, User, Star, Flame, Droplet, Snowflake, Zap, Wind, Mountain, Leaf, Check, Layers } from 'lucide-react';
import { ElementType, WeaponType, Weapon, Artifact, ArtifactSlot, ArtifactSet } from '../types';
import { ARTIFACT_SETS, ARTIFACT_NAMES, getArtifactMainStat } from '../data/artifacts';
import { LanguageType, t } from '../utils/i18n';

import aureliaBanner from '../../assets/aurelia_banner.png';
import kaelenBanner from '../../assets/kaelen_banner.png';
import weaponBanner from '../../assets/weapon_banner.png';

import pyroBg from '../../assets/pyro_bg.png';
import hydroBg from '../../assets/hydro_bg.png';
import cryoBg from '../../assets/cryo_bg.png';
import electroBg from '../../assets/electro_bg.png';
import anemoBg from '../../assets/anemo_bg.png';
import geoBg from '../../assets/geo_bg.png';
import dendroBg from '../../assets/dendro_bg.png';

import swordBg from '../../assets/sword_bg.png';
import claymoreBg from '../../assets/claymore_bg.png';
import bowBg from '../../assets/bow_bg.png';
import catalystBg from '../../assets/catalyst_bg.png';
import polearmBg from '../../assets/polearm_bg.png';

const getCharacterBg = (charId: string, element: ElementType) => {
  if (charId === 'aurelia') return aureliaBanner;
  if (charId === 'kaelen') return kaelenBanner;
  switch (element) {
    case 'Pyro': return pyroBg;
    case 'Hydro': return hydroBg;
    case 'Cryo': return cryoBg;
    case 'Electro': return electroBg;
    case 'Anemo': return anemoBg;
    case 'Geo': return geoBg;
    case 'Dendro': return dendroBg;
    default: return pyroBg;
  }
};

const getWeaponBg = (weaponName: string, type: WeaponType) => {
  if (weaponName === 'Solar Searing Blade' || weaponName === 'Primordial Jade Winged-Spear' || weaponName === 'Solar Wind Bow' || weaponName === 'Abyssal Ocean Scepter' || weaponName === 'Calamity Blaze') {
    return weaponBanner;
  }
  switch (type) {
    case 'Sword': return swordBg;
    case 'Claymore': return claymoreBg;
    case 'Bow': return bowBg;
    case 'Catalyst': return catalystBg;
    case 'Polearm': return polearmBg;
    default: return swordBg;
  }
};

interface GDDViewerProps {
  onUnlockCharacter?: (id: string) => void;
  ownedCharacterIds: string[];
  characterPortraits?: Record<string, number>;
  inventoryWeapons?: Weapon[];
  inventoryArtifacts?: Artifact[];
  language?: LanguageType;
  unlockedLoreEntries?: string[];
  completedCharacterStoryActs?: Record<string, number>;
  initialTab?: 'lore' | 'nations' | 'characters' | 'weapons' | 'artifacts' | 'systems' | 'tutorial';
  initialCharacterId?: string;
  initialWeaponName?: string;
}

export default function GDDViewer({ 
  onUnlockCharacter, 
  ownedCharacterIds, 
  characterPortraits = {}, 
  inventoryWeapons = [], 
  inventoryArtifacts = [],
  initialTab,
  initialCharacterId,
  initialWeaponName,
  language = 'en',
  unlockedLoreEntries = [],
  completedCharacterStoryActs = {}
}: GDDViewerProps) {
  const [activeTab, setActiveTab] = React.useState<'lore' | 'nations' | 'characters' | 'weapons' | 'artifacts' | 'systems' | 'tutorial'>(initialTab || 'lore');
  const [selectedCharacterId, setSelectedCharacterId] = React.useState<string>(initialCharacterId || PLAYABLE_CHARACTERS[0].id);
  const [selectedWeaponName, setSelectedWeaponName] = useState<string>(initialWeaponName || WEAPONS_DATABASE[0].name);
  const [selectedNationName, setSelectedNationName] = useState<string>(GDD_DATA.nations[0].name);
  const [charSearch, setCharSearch] = useState('');
  const [weapSearch, setWeapSearch] = useState('');
  const [charOwnershipFilter, setCharOwnershipFilter] = useState<'all' | 'owned' | 'unowned'>('all');
  const [charRarityFilter, setCharRarityFilter] = useState<'all' | 5 | 4 | 3>('all');
  const [charElementFilter, setCharElementFilter] = useState<'all' | ElementType>('all');
  const [weapOwnershipFilter, setWeapOwnershipFilter] = useState<'all' | 'owned' | 'unowned'>('all');
  const [weapRarityFilter, setWeapRarityFilter] = useState<'all' | 5 | 4 | 3>('all');
  const [artSetFilter, setArtSetFilter] = useState<'all' | ArtifactSet>('all');
  const [artSlotFilter, setArtSlotFilter] = useState<'all' | ArtifactSlot>('all');
  const [artRarityFilter, setArtRarityFilter] = useState<'all' | 5 | 4 | 3>('all');
  const [selectedArtifactSetName, setSelectedArtifactSetName] = useState<ArtifactSet>('Vanguard');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  React.useEffect(() => {
    if (initialCharacterId) {
      setSelectedCharacterId(initialCharacterId);
    }
  }, [initialCharacterId]);

  React.useEffect(() => {
    if (initialWeaponName) {
      setSelectedWeaponName(initialWeaponName);
    }
  }, [initialWeaponName]);

  const getElementColor = (element: ElementType) => {
    switch (element) {
      case 'Pyro': return { text: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'bg-gradient-to-r from-orange-600 to-amber-500' };
      case 'Hydro': return { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', badge: 'bg-gradient-to-r from-blue-600 to-cyan-500' };
      case 'Cryo': return { text: 'text-sky-300', bg: 'bg-sky-300/10', border: 'border-sky-300/30', badge: 'bg-gradient-to-r from-sky-400 to-blue-400' };
      case 'Electro': return { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', badge: 'bg-gradient-to-r from-purple-600 to-fuchsia-500' };
      case 'Anemo': return { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', badge: 'bg-gradient-to-r from-emerald-500 to-teal-400' };
      case 'Geo': return { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-gradient-to-r from-amber-600 to-yellow-600' };
      case 'Dendro': return { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', badge: 'bg-gradient-to-r from-green-600 to-lime-500' };
    }
  };

  const getElementIcon = (element: ElementType) => {
    switch (element) {
      case 'Pyro': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'Hydro': return <Droplet className="w-4 h-4 text-blue-400" />;
      case 'Cryo': return <Snowflake className="w-4 h-4 text-sky-300" />;
      case 'Electro': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'Anemo': return <Wind className="w-4 h-4 text-emerald-400" />;
      case 'Geo': return <Mountain className="w-4 h-4 text-amber-500" />;
      case 'Dendro': return <Leaf className="w-4 h-4 text-green-400" />;
    }
  };

  const getSystemIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <Shield className="w-5 h-5 text-indigo-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-purple-400" />;
      case 'RefreshCw': return <Compass className="w-5 h-5 text-teal-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Sword': return <Sword className="w-5 h-5 text-rose-400" />;
      case 'Coins': return <Coins className="w-5 h-5 text-yellow-400" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-fuchsia-400" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5 text-green-400" />;
      default: return <BookOpen className="w-5 h-5 text-cyan-400" />;
    }
  };

  const selectedChar = PLAYABLE_CHARACTERS.find(c => c.id === selectedCharacterId) || PLAYABLE_CHARACTERS[0];
  const selectedNation = GDD_DATA.nations.find(n => n.name === selectedNationName) || GDD_DATA.nations[0];

  return (
    <div className="bg-[#0b0f19]/85 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col h-full min-h-[600px]" id="gdd_main_viewer">
      {/* Header bar */}
      <div className="bg-black/40 px-6 py-4 border-b border-white/10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-amber-400 animate-pulse"></span>
            <h2 className="text-sm font-black tracking-widest text-slate-100 uppercase font-display">
              Game Design Document (GDD)
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">
            Unravel dynamic narrative systems, biome coordinates, and core combat elements for <span className="font-extrabold text-[#f1f5f9]">PROJECT AETHERIA</span>
          </p>
        </div>

        {/* Tabs switcher */}
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none gap-1 bg-black/45 p-1 rounded-lg border border-white/10 w-full">
          {(['lore', 'nations', 'characters', 'weapons', 'artifacts', 'systems', 'tutorial'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'bg-amber-400 text-[#0f172a] shadow-[0_0_10px_rgba(251,191,36,0.30)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              id={`gdd_tab_${tab}`}
            >
              {tab === 'tutorial' ? 'How to Play' : tab === 'artifacts' ? t('artifacts', language) : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'lore' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
              key="tab_lore"
            >
              <div className="p-6 bg-gradient-to-br from-amber-600/10 via-slate-900 to-slate-900 border border-amber-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Landmark className="w-48 h-48 text-amber-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-amber-400 font-sans tracking-tight">
                  Welcome to {GDD_DATA.worldName}
                </h3>
                <p className="text-slate-300 leading-relaxed mt-3 text-sm max-w-3xl">
                  {GDD_DATA.introduction}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Story summary */}
                  <div className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-amber-500 rounded-full"></span>
                      The Core Campaign & Divine Prophecy
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {GDD_DATA.coreStory}
                    </p>
                  </div>

                  {/* Political conflicts */}
                  <div className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-4">
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-red-500 rounded-full"></span>
                      Current Geopolitical Conflicts
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {GDD_DATA.conflicts.map((conflict, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg group hover:border-slate-700 transition-colors">
                          <h5 className="text-xs font-bold text-red-400 flex items-center gap-2">
                            <span className="text-slate-500">0{idx + 1}.</span>
                            {conflict.title}
                          </h5>
                          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                            {conflict.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Unlocked Campaign Lore Chronicles */}
                  {unlockedLoreEntries && unlockedLoreEntries.length > 0 && (
                    <div className="p-5 bg-slate-950/60 border border-amber-500/25 rounded-xl space-y-4">
                      <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-3 bg-amber-500 rounded-full"></span>
                        📖 Unlocked Campaign Chronicles ({unlockedLoreEntries.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {unlockedLoreEntries.includes('chapter-1-clear') && (
                          <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-lg">
                            <span className="font-extrabold text-amber-400 text-xs uppercase tracking-wider block">Chapter 1 Clear: Ruins Core stabilized</span>
                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                              Defeating the Calamity Pyro Dragon stabilized the ancient ruins core. However, analysis of the core fragments reveals the anomalies were triggered intentionally by extra-dimensional core frequencies.
                            </p>
                          </div>
                        )}
                        {unlockedLoreEntries.includes('chapter-2-clear') && (
                          <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-lg">
                            <span className="font-extrabold text-amber-400 text-xs uppercase tracking-wider block">Chapter 2 Clear: Overlord stabilized</span>
                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                              With the defeat of the Glacial Frost Golem, the Frozen River shipping routes are clear. The Oracle confirms these tears act as calibrators, testing whether our party can channel elemental reactions.
                            </p>
                          </div>
                        )}
                        {unlockedLoreEntries.includes('chapter-3-clear') && (
                          <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-lg">
                            <span className="font-extrabold text-emerald-400 text-xs uppercase tracking-wider block">Chapter 3 Clear: Gate Opened</span>
                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                              Awakening and defeat of the Tempest Thunderbird dragon has restored flow to the Gates of Ancient Aetheria, unlocking access to advanced stardust summons and deep-dimensional vaults.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Technical Overview column */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4 h-fit">
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-blue-500 rounded-full"></span>
                    GDD Spec Sheet
                  </h4>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Target Frameworks</span>
                      <span className="font-semibold text-slate-200">Unity, Unreal Engine 5</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Target Platforms</span>
                      <span className="font-semibold text-slate-200">PC, Console, Browser Cross-play</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Game Engine Target</span>
                      <span className="font-semibold text-slate-200">UE 5.4 / Unity DOTS</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Visual Aesthetic</span>
                      <span className="font-semibold text-slate-200 text-right">Cel-Shaded Anime, Immersive High-Fidelity Atmosphere</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Playable Roster size</span>
                      <span className="font-semibold text-amber-400">20 Scheduled, 5 Available Now</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-400">Primary Monies</span>
                      <span className="font-semibold text-slate-200">AetherGems, Mora</span>
                    </div>

                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl mt-4">
                      <p className="text-[10px] text-slate-400 italic leading-relaxed">
                        "Designed to capitalize on emotional attachment through responsive elements, lore deep-dives, and competitive real-time boss battles."
                      </p>
                      <p className="text-[10px] text-amber-500 font-bold mt-2 text-right">
                        — Game Design Team
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'nations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              key="tab_nations"
            >
              {/* Left sidebar List of Nations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
                  Five Divine Sovereignties
                </h4>
                {GDD_DATA.nations.map((nation) => (
                  <button
                    key={nation.name}
                    onClick={() => setSelectedNationName(nation.name)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      selectedNationName === nation.name
                        ? `bg-slate-800/80 border-slate-700 shadow-lg text-slate-100`
                        : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${nation.iconColor}`}></div>
                      <div>
                        <div className="font-bold text-xs">{nation.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{nation.element}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Major details */}
              <div className="md:col-span-2 space-y-6">
                <div className={`p-6 bg-gradient-to-r ${selectedNation.iconColor} rounded-2xl relative overflow-hidden text-slate-950`}>
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Landmark className="w-48 h-48" />
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest opacity-80">NATION FACTSHEET</div>
                  <h3 className="text-3xl font-black tracking-tight mt-1">{selectedNation.name}</h3>
                  <p className="text-sm font-medium mt-3 opacity-90 max-w-2xl leading-relaxed">
                    {selectedNation.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl space-y-2.5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Divine Sovereignty</div>
                    <div>
                      <div className="text-xs text-slate-500">Ruling Incarnation / God</div>
                      <div className="text-xs font-bold text-slate-200">{selectedNation.god}</div>
                    </div>
                    <div className="border-t border-slate-900 pt-2">
                      <div className="text-xs text-slate-500">Capital City Grid</div>
                      <div className="text-xs font-bold text-slate-200">{selectedNation.capital}</div>
                    </div>
                    <div className="border-t border-slate-900 pt-2">
                      <div className="text-xs text-slate-500">Sovereign Regent</div>
                      <div className="text-xs font-bold text-slate-200">{selectedNation.ruler}</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Major political factions</div>
                    <div className="space-y-2 mt-1">
                      {selectedNation.majorFactions.map((fac, idx) => {
                        const [name, desc] = fac.split(':');
                        return (
                          <div key={idx} className="text-[11px] leading-relaxed">
                            <span className="font-bold text-amber-500">{name}:</span>
                            <span className="text-slate-300">{desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-5 border border-slate-800 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Dynastic Annals & Origin Arc</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedNation.history}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'characters' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
              key="tab_characters"
            >
              {/* Characters sidebar (20 entries) */}
              <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">
                  Roster Checklist ({PLAYABLE_CHARACTERS.length})
                </h4>
                <div className="px-2 mb-2">
                  <input
                    type="text"
                    value={charSearch}
                    onChange={(e) => setCharSearch(e.target.value)}
                    placeholder={t('search_placeholder', language)}
                  />
                  <div className="flex gap-1 mt-1.5">
                    {(['all', 'owned', 'unowned'] as const).map((filterOpt) => (
                      <button
                        key={filterOpt}
                        onClick={() => {
                          setCharOwnershipFilter(filterOpt);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`flex-1 text-center py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border transition-all ${
                          charOwnershipFilter === filterOpt
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                            : 'bg-slate-900/40 border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t(`filter_${filterOpt}`, language)}
                      </button>
                    ))}
                  </div>
                  {/* Rarity filter row */}
                  <div className="flex gap-1 mt-1.5 pt-1.5 border-t border-white/5">
                    {(['all', 5, 4, 3] as const).map((rarityOpt) => (
                      <button
                        key={rarityOpt}
                        onClick={() => {
                          setCharRarityFilter(rarityOpt);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`flex-1 text-center py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border transition-all ${
                          charRarityFilter === rarityOpt
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                            : 'bg-slate-900/40 border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {rarityOpt === 'all' ? 'All' : `${rarityOpt}★`}
                      </button>
                    ))}
                  </div>
                  {/* Element filter row */}
                  <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-white/5">
                    {(['all', 'Pyro', 'Hydro', 'Cryo', 'Electro', 'Anemo', 'Geo', 'Dendro'] as const).map((elemOpt) => {
                      const colors = elemOpt !== 'all' ? getElementColor(elemOpt) : null;
                      return (
                        <button
                          key={elemOpt}
                          onClick={() => {
                            setCharElementFilter(elemOpt);
                            AetheriaAudioEngine.playClick();
                          }}
                          className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded transition-all flex items-center gap-0.5 border ${
                            charElementFilter === elemOpt
                              ? elemOpt === 'all'
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                : `${colors?.bg} ${colors?.border} ${colors?.text}`
                              : 'bg-slate-900/40 border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {elemOpt !== 'all' && getElementIcon(elemOpt)}
                          <span>{elemOpt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {(() => {
                  const filtered = PLAYABLE_CHARACTERS.filter(char => {
                    const isOwned = ownedCharacterIds.includes(char.id);
                    const matchesOwnership = charOwnershipFilter === 'all' || 
                      (charOwnershipFilter === 'owned' && isOwned) || 
                      (charOwnershipFilter === 'unowned' && !isOwned);
                    
                    const matchesRarity = charRarityFilter === 'all' || char.rarity === charRarityFilter;

                    const matchesElement = charElementFilter === 'all' || char.element === charElementFilter;
 
                    const matchesSearch = char.name.toLowerCase().includes(charSearch.toLowerCase()) ||
                      char.element.toLowerCase().includes(charSearch.toLowerCase()) ||
                      char.weaponType.toLowerCase().includes(charSearch.toLowerCase());
 
                    return matchesOwnership && matchesRarity && matchesElement && matchesSearch;
                  });
                  // Sort by rarity descending
                  const sorted = [...filtered].sort((a, b) => b.rarity - a.rarity);
                  if (sorted.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-500 text-xs italic font-mono uppercase">
                        No matches found
                      </div>
                    );
                  }
                  return sorted.map((char) => {
                    const colors = getElementColor(char.element);
                    const isOwned = ownedCharacterIds.includes(char.id);
                    return (
                      <button
                        key={char.id}
                        onClick={() => setSelectedCharacterId(char.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                          selectedCharacterId === char.id
                            ? 'bg-slate-800 border-slate-700 shadow text-slate-100'
                            : 'bg-slate-900/30 border-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-950 font-black text-xs ${char.avatarPlaceholder}`}>
                            {char.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1">
                              {char.name}
                              {char.rarity === 5 && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 inline" />}
                            </div>
                            <div className={`text-[9px] font-semibold ${colors?.text}`}>
                              {char.element} • {char.weaponType}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isOwned ? (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black">UNLOCKED</span>
                          ) : (
                            <span className="text-[9px] bg-slate-800 text-slate-500 border border-slate-900 px-1.5 py-0.5 rounded font-black">LOCKED</span>
                          )}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Left big details sheet */}
              <div className="md:col-span-3 space-y-6">
                <div className="p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden bg-slate-950/90 shadow-xl">
                  {/* Background Watermark */}
                  <div 
                    className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
                    style={{
                      backgroundImage: `url(${getCharacterBg(selectedChar.id, selectedChar.element)})`,
                    }}
                  />
                  {/* Contents wrapper */}
                  <div className="relative z-10">
                  {/* Title Bar */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-900 pb-4 gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-950 shadow-md ${selectedChar.avatarPlaceholder}`}>
                        {selectedChar.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-100">{selectedChar.name}</h3>
                          <div className="flex gap-0.5">
                            {Array.from({ length: selectedChar.rarity }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 italic">"{selectedChar.title}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 ${getElementColor(selectedChar.element).badge} text-slate-950`}>
                        {getElementIcon(selectedChar.element)}
                        {selectedChar.element}
                      </div>
                      <div className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                        {selectedChar.weaponType}
                      </div>
                    </div>
                  </div>

                  {/* Split parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {/* Character Bio and Personality */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Personality Accent</h4>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/50">
                          {selectedChar.personality}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Confidential Backstory</h4>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/50">
                          {selectedChar.backstory}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Story Mission Logs</h4>
                        <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/50 text-xs text-slate-300">
                          {(() => {
                            const completedActs = completedCharacterStoryActs[selectedChar.id] || 0;
                            if (completedActs === 0) {
                              return <p className="italic text-slate-500 text-[10px]">No character story acts completed yet. Play them inside the Story Mode menu!</p>;
                            }
                            return (
                              <div className="space-y-2">
                                {completedActs >= 1 && (
                                  <div className="border-b border-slate-800 pb-1.5">
                                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-wide">Act I Cleared: Origin Mythos</span>
                                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                                      Unlocked secrets of {selectedChar.name}'s element alignment. Proven to excel under basic training criteria.
                                    </p>
                                  </div>
                                )}
                                {completedActs >= 2 && (
                                  <div className="border-b border-slate-800 pb-1.5">
                                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-wide">Act II Cleared: Awakening</span>
                                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                                      Tested against elemental hazards and ascended, gaining massive portrait stat multipliers.
                                    </p>
                                  </div>
                                )}
                                {completedActs >= 3 && (
                                  <div>
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wide">Act III Cleared: Sovereign</span>
                                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                                      Fully completed the dragon altars trial. Attained peak stardust connection.
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Stats Matrix */}
                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3 h-fit">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base Attribute scaling</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Base Max HP</span>
                          <span className="font-bold text-slate-200">{selectedChar.baseStats.hp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Base Atk Damage</span>
                          <span className="font-bold text-slate-200">{selectedChar.baseStats.atk}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Base Shield Def</span>
                          <span className="font-bold text-slate-200">{selectedChar.baseStats.def}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Sovereign Crit Rate</span>
                          <span className="font-bold text-amber-400">{(selectedChar.baseStats.critRate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Sovereign Crit Dmg</span>
                          <span className="font-bold text-amber-400">{(selectedChar.baseStats.critDmg * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="mt-6 border-t border-slate-900 pt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Action Skillset Spectrum</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Basic */}
                      <div className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1.5 hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">BASIC ATK</span>
                          <span className="text-[10px] text-slate-500">Multi: x{(selectedChar.skills.basic.damageMultiplier * 100).toFixed(0)}%</span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-200">{selectedChar.skills.basic.name}</h5>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{selectedChar.skills.basic.desc}</p>
                      </div>

                      {/* Skill */}
                      <div className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1.5 hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold px-1.5 py-0.5 rounded">ELEMENTAL SKILL (E)</span>
                          <span className="text-[10px] text-indigo-400">CD: {selectedChar.skills.skill.cooldown}s</span>
                        </div>
                        <h5 className="text-xs font-bold text-indigo-300">{selectedChar.skills.skill.name}</h5>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{selectedChar.skills.skill.desc}</p>
                      </div>

                      {/* Ultimate */}
                      <div className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1.5 hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold px-1.5 py-0.5 rounded">CELESTIAL ULTIMATE (Q)</span>
                          <span className="text-[10px] text-amber-400">Energy: 80</span>
                        </div>
                        <h5 className="text-xs font-bold text-amber-300">{selectedChar.skills.ultimate.name}</h5>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{selectedChar.skills.ultimate.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Portrait Attunement Matrix */}
                  <div className="mt-6 border-t border-slate-900 pt-6 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portrait Attunement Matrix</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getPortraitInfoList(selectedChar.element, selectedChar.id).map((port, pIdx) => {
                        const portLvl = pIdx + 1;
                        const currentPortraitLevel = characterPortraits?.[selectedChar.id] || 0;
                        const isUnlocked = currentPortraitLevel >= portLvl;
                        return (
                          <div 
                            key={pIdx} 
                            className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                              isUnlocked 
                                ? 'bg-slate-900/60 border-amber-500/35 text-slate-100 shadow-[0_0_12px_rgba(245,158,11,0.06)]' 
                                : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded tracking-wide ${
                                isUnlocked ? 'bg-amber-400 text-slate-955 text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}>
                                PORTRAIT P{portLvl}
                              </span>
                              <span className={`text-[8.5px] font-bold ${isUnlocked ? 'text-amber-400' : 'text-slate-400'}`}>
                                {isUnlocked ? 'ACTIVATED' : 'LOCKED'}
                              </span>
                            </div>
                            <h5 className={`text-xs font-black uppercase tracking-wide mt-1 ${isUnlocked ? 'text-slate-200' : 'text-slate-350'}`}>
                              {port.name}
                            </h5>
                            <p className={`text-[10px] leading-relaxed ${isUnlocked ? 'text-slate-300' : 'text-slate-400'}`}>
                              {port.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Relations Link */}
                  <div className="mt-6 border-t border-slate-900 pt-6 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Relations Codex</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedChar.relations.map((rel, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/30 border border-slate-800 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200">{rel.targetName}</span>
                            <span className="text-[10px] bg-slate-800 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{rel.type}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{rel.desc}</p>
                        </div>
                      ))}
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'weapons' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
              key="tab_weapons"
            >
              {/* Weapons sidebar catalog list */}
              <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <div className="flex items-center justify-between px-2 mb-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Weapon Armory ({WEAPONS_DATABASE.length})
                  </h4>
                </div>
                <div className="px-2 mb-2">
                  <input
                    type="text"
                    value={weapSearch}
                    onChange={(e) => setWeapSearch(e.target.value)}
                    placeholder={t('search_placeholder', language)}
                    className="w-full bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-amber-400 rounded-lg px-2.5 py-1 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none transition-all uppercase tracking-wide font-mono font-bold"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {(['all', 'owned', 'unowned'] as const).map((filterOpt) => (
                      <button
                        key={filterOpt}
                        onClick={() => {
                          setWeapOwnershipFilter(filterOpt);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`flex-1 text-center py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border transition-all ${
                          weapOwnershipFilter === filterOpt
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                            : 'bg-slate-900/40 border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t(`filter_${filterOpt}`, language)}
                      </button>
                    ))}
                  </div>
                  {/* Rarity filter row */}
                  <div className="flex gap-1 mt-1.5 pt-1.5 border-t border-white/5">
                    {(['all', 5, 4, 3] as const).map((rarityOpt) => (
                      <button
                        key={rarityOpt}
                        onClick={() => {
                          setWeapRarityFilter(rarityOpt);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`flex-1 text-center py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border transition-all ${
                          weapRarityFilter === rarityOpt
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                            : 'bg-slate-900/40 border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {rarityOpt === 'all' ? 'All' : `${rarityOpt}★`}
                      </button>
                    ))}
                  </div>
                </div>
                {(() => {
                  const filtered = WEAPONS_DATABASE.filter(weap => {
                    const isOwned = inventoryWeapons.some(w => w.name === weap.name);
                    const matchesOwnership = weapOwnershipFilter === 'all' || 
                      (weapOwnershipFilter === 'owned' && isOwned) || 
                      (weapOwnershipFilter === 'unowned' && !isOwned);
                    
                    const matchesRarity = weapRarityFilter === 'all' || weap.rarity === weapRarityFilter;

                    const matchesSearch = weap.name.toLowerCase().includes(weapSearch.toLowerCase()) ||
                      weap.weaponType.toLowerCase().includes(weapSearch.toLowerCase());
 
                    return matchesOwnership && matchesRarity && matchesSearch;
                  });
                  // Sort by rarity descending
                  const sorted = [...filtered].sort((a, b) => b.rarity - a.rarity);
                  if (sorted.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-500 text-xs italic font-mono uppercase">
                        No matches found
                      </div>
                    );
                  }
                  return sorted.map((weap) => {
                    const isSelected = selectedWeaponName === weap.name;
                    const isOwned = inventoryWeapons.some(w => w.name === weap.name);
                    return (
                      <button
                        key={weap.name}
                        onClick={() => {
                          setSelectedWeaponName(weap.name);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-slate-700 shadow text-slate-100'
                            : 'bg-slate-900/30 border-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {/* Rarity-colored badge indicator */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-slate-950 ${
                            weap.rarity === 5 ? 'bg-gradient-to-tr from-amber-600 to-amber-350' :
                            weap.rarity === 4 ? 'bg-gradient-to-tr from-purple-600 to-purple-400 text-white' :
                            'bg-gradient-to-tr from-blue-600 to-blue-400 text-white'
                          }`}>
                            {weap.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1">
                              {weap.name}
                            </div>
                            <div className="text-[9px] font-semibold text-slate-400">
                              {weap.weaponType} • {weap.rarity}★
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isOwned ? (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black">OWNED</span>
                          ) : (
                            <span className="text-[9px] bg-slate-800 text-slate-500 border border-slate-900 px-1.5 py-0.5 rounded font-black">LOCKED</span>
                          )}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Weapon Detail stats layout */}
              {(() => {
                const weap = WEAPONS_DATABASE.find(w => w.name === selectedWeaponName) || WEAPONS_DATABASE[0];
                return (
                  <div className="md:col-span-3 space-y-6">
                    <div className="p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden bg-slate-950/90 shadow-xl">
                      {/* Background Watermark */}
                      <div 
                        className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
                        style={{
                          backgroundImage: `url(${getWeaponBg(weap.name, weap.weaponType)})`,
                        }}
                      />
                      {/* Contents wrapper */}
                      <div className="relative z-10">
                      {/* Name Header and Rarity */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-900 pb-4 gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-950 shadow-md ${
                            weap.rarity === 5 ? 'bg-gradient-to-tr from-amber-600 to-amber-300' :
                            weap.rarity === 4 ? 'bg-gradient-to-tr from-purple-600 to-purple-400 text-white animate-pulse' :
                            'bg-gradient-to-tr from-blue-600 to-blue-400 text-white'
                          }`}>
                            {weap.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[8.5px] uppercase font-mono border px-2 py-0.5 rounded font-black tracking-widest ${
                                weap.rarity === 5 ? 'border-amber-500/30 text-amber-450 bg-amber-500/10' :
                                weap.rarity === 4 ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                                'border-blue-500/30 text-blue-455 bg-sky-500/10'
                              }`}>
                                {weap.rarity} Star Armament
                              </span>
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-100 font-sans tracking-tight mt-1 flex items-center gap-2">
                              {weap.name}
                              <div className="flex gap-0.5">
                                {Array.from({ length: weap.rarity }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                ))}
                              </div>
                            </h3>
                            <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Class Category: {weap.weaponType}</p>
                          </div>
                        </div>
                      </div>

                      {/* Prime stats grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-mono">Base Attack Power</span>
                            <div className="text-xl font-black text-slate-100 mt-0.5">{weap.baseAtk} <span className="text-xs text-rose-455 text-rose-400 font-medium">ATK</span></div>
                          </div>
                          <Sword className="w-8 h-8 text-rose-400/30" />
                        </div>

                        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-mono">Stat Attribute Sub-Type</span>
                            <div className="text-sm font-black text-slate-100 mt-1">{weap.statBonus}</div>
                          </div>
                          <Sparkles className="w-8 h-8 text-amber-400/30" />
                        </div>
                      </div>

                      {/* Passive feature */}
                      <div className="mt-6 p-5 bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/15 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 border-b border-indigo-500/10 pb-2">
                          <Hammer className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Active Forged Feature (Passive)</h4>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2 italic">
                          {weap.featureDesc}
                        </p>
                      </div>

                      {/* General weapon combat advice */}
                      <div className="mt-4 p-4 bg-slate-900/20 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-[8.5px] uppercase font-mono text-slate-500">Forge Synergy Guild</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Tempered of Aetheria's core, this {weap.weaponType} can be equipped on any hero aligned to the {weap.weaponType} class. Upgrade weapon level inside the **Hero Forge** panel to amplify the base attack and fully unlock stat scaling inside Combat Arena!
                        </p>
                      </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {activeTab === 'artifacts' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
              key="tab_artifacts"
            >
              {/* Left sidebar: Artifact Sets catalog */}
              <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <div className="flex items-center justify-between px-2 mb-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Artifact Sets
                  </h4>
                </div>
                
                {/* Search / Set select filter */}
                <div className="px-2 mb-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Filter by slot
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(['all', 'helmet', 'hands', 'leg', 'shoe'] as const).map((slotOpt) => (
                      <button
                        key={slotOpt}
                        onClick={() => {
                          setArtSlotFilter(slotOpt);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`text-center px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md border transition-all ${
                          artSlotFilter === slotOpt
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                            : 'bg-slate-900/40 border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {slotOpt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sets list buttons */}
                {(() => {
                  const setsList: ArtifactSet[] = ['Vanguard', 'Guardian', 'Celestial', 'Chrono'];
                  return setsList.map((setName) => {
                    const setInfo = ARTIFACT_SETS[setName];
                    const isSelected = selectedArtifactSetName === setName;
                    return (
                      <button
                        key={setName}
                        onClick={() => {
                          setSelectedArtifactSetName(setName);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-slate-700 shadow text-slate-100'
                            : 'bg-slate-900/30 border-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-slate-950 bg-gradient-to-tr from-amber-500 to-amber-300">
                            <Layers className="w-4 h-4 text-slate-900" />
                          </div>
                          <div>
                            <div className="font-bold text-xs">
                              {setInfo.name}
                            </div>
                            <div className="text-[9px] font-semibold text-slate-400 uppercase font-mono">
                              {setName} Set
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Right side: Selected set details and slot stats */}
              {(() => {
                const setName = selectedArtifactSetName;
                const setInfo = ARTIFACT_SETS[setName];
                
                return (
                  <div className="md:col-span-3 space-y-6">
                    <div className="p-6 rounded-2xl border border-slate-800/80 relative overflow-hidden bg-slate-950/90 shadow-xl">
                      <div className="relative z-10 space-y-4">
                        {/* Title and set descriptions */}
                        <div className="border-b border-slate-900 pb-4">
                          <h3 className="text-xl font-black tracking-wide text-slate-100 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-amber-400" />
                            {setInfo.name}
                          </h3>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold mt-1">
                            Set Bonus Matrix
                          </p>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-amber-400/5 border border-amber-400/10 p-3 rounded-xl">
                              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block font-mono">2-Piece Set Effect</span>
                              <p className="text-xs text-slate-350 mt-1 font-bold">{setInfo.desc2pc}</p>
                            </div>
                            <div className="bg-amber-400/10 border border-amber-400/20 p-3 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.05)]">
                              <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider block font-mono">4-Piece Set Effect</span>
                              <p className="text-xs text-amber-200 mt-1 font-extrabold">{setInfo.desc4pc}</p>
                            </div>
                          </div>
                        </div>

                        {/* Parts Grid */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Set Artifact Parts
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(['helmet', 'hands', 'leg', 'shoe'] as ArtifactSlot[]).map((slot) => {
                              // If a slot filter is set and it doesn't match, skip rendering this part
                              if (artSlotFilter !== 'all' && artSlotFilter !== slot) return null;
                              
                              const partName = ARTIFACT_NAMES[setName][slot];
                              
                              // Main stats details
                              const mainStatDesc = slot === 'helmet' ? 'HP%' :
                                                   slot === 'hands' ? 'DMG%' :
                                                   slot === 'leg' ? 'CRIT Chance%' : 'CRIT DMG%';
                                                   
                              const blueStat = getArtifactMainStat(slot, 3);
                              const purpleStat = getArtifactMainStat(slot, 4);
                              const goldStat = getArtifactMainStat(slot, 5);
                              
                              return (
                                <div key={slot} className="bg-slate-900/40 border border-slate-900 rounded-xl p-3.5 space-y-2.5 hover:border-slate-800/80 transition-all">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <span className="text-[8px] font-black uppercase text-amber-500 font-mono tracking-wider bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                        {slot} Slot
                                      </span>
                                      <h5 className="text-xs font-bold text-slate-200 mt-1">{partName}</h5>
                                    </div>
                                  </div>
                                  
                                  {/* Stats scaling table */}
                                  <div className="space-y-1 bg-black/20 p-2 rounded-lg border border-white/5">
                                    <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold border-b border-white/5 pb-1">
                                      <span>Rarity</span>
                                      <span>Main Stat Value ({mainStatDesc})</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] py-0.5">
                                      <span className="text-blue-400 font-bold">Blue (Common)</span>
                                      <span className="text-blue-300 font-mono font-bold">{blueStat.display}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] py-0.5">
                                      <span className="text-purple-400 font-bold">Purple (Rare)</span>
                                      <span className="text-purple-300 font-mono font-bold">{purpleStat.display}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] py-0.5">
                                      <span className="text-amber-400 font-bold">Gold (Legendary)</span>
                                      <span className="text-amber-300 font-mono font-bold">{goldStat.display}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Drop / grind mechanics lore guide */}
                        <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-xl space-y-1.5">
                          <span className="text-[8.5px] uppercase font-mono text-slate-500 block font-bold">Artifact Acquisition & Forge Integration</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Artifacts are rare armor modifications that provide significant percentage boosts. Equip up to 4 parts (Helmet, Hands, Leg, Shoe) per character under the **Hero Forge & Ascension** tab. Grind artifacts in the new **Artifact Grind** endless game mode where higher waves grant increasing chances of Purple and Gold rarities! Lock artifacts to prevent deletion, and salvage extras for extra resources.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {activeTab === 'systems' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
              key="tab_systems"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Combat systems */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Sword className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Real-time Combat Mechanics</h3>
                  </div>
                  {GDD_DATA.combatSystems.map((sys) => (
                    <div key={sys.id} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        {getSystemIcon(sys.iconName)}
                        <h4 className="text-xs font-bold text-slate-100">{sys.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{sys.summary}</p>
                      <ul className="space-y-1.5 pt-1">
                        {sys.details.map((det, i) => (
                          <li key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{det}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Gacha, Gear & Economy */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Core Progression Loops</h3>
                  </div>
                  {GDD_DATA.gachaSystems.concat(GDD_DATA.equipmentSystems).concat(GDD_DATA.economySystems).map((sys) => (
                    <div key={sys.id} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        {getSystemIcon(sys.iconName)}
                        <h4 className="text-xs font-bold text-slate-100">{sys.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{sys.summary}</p>
                      <ul className="space-y-1.5 pt-1">
                        {sys.details.map((det, i) => (
                          <li key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{det}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Endgame and Commercial */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Trophy className="w-5 h-5 text-fuchsia-500" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Retention & Monetization</h3>
                  </div>
                  {GDD_DATA.endgameSystems.concat(GDD_DATA.monetizationStrategies).map((sys) => (
                    <div key={sys.id} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        {getSystemIcon(sys.iconName)}
                        <h4 className="text-xs font-bold text-slate-100">{sys.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{sys.summary}</p>
                      <ul className="space-y-1.5 pt-1">
                        {sys.details.map((det, i) => (
                          <li key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{det}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tutorial' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
              key="tab_tutorial"
            >
              {/* Introduction Card */}
              <div className="p-6 bg-gradient-to-r from-indigo-900/40 to-slate-900/60 border border-indigo-500/20 rounded-xl space-y-3">
                <h4 className="font-black text-amber-400 text-sm uppercase tracking-widest flex items-center gap-2 font-display">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  COSMIC EXPEDITION CORE MANUAL
                </h4>
                <p className="text-slate-350 select-text leading-relaxed text-xs">
                  Welcome to <b>Project Aetheria</b>, an elite full-scale action gacha simulator where elemental reaction combinations meet high-stakes real-time arena survival. Gather ancient heroes, customize master armaments, and cleanse the endless solar rift.
                </p>
              </div>

              {/* Combat Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-[#0a0d1a] border border-white/5 rounded-xl space-y-4">
                  <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2 font-display">
                    <Sword className="w-4 h-4 text-rose-400" />
                    PC & Target Controls
                  </h4>
                  <div className="space-y-2.5 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between items-center bg-black/35 p-2 rounded border border-white/5">
                      <span className="text-slate-400">WASD MOVEMENT:</span>
                      <span className="font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded">Vanguard Vector</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/35 p-2 rounded border border-white/5">
                      <span className="text-slate-400">LEFT CLICK / J:</span>
                      <span className="font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded">Strike / Basic Slashes</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/35 p-2 rounded border border-white/5">
                      <span className="text-slate-400">SPACEBAR KEY:</span>
                      <span className="font-extrabold text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">High Evasion Dash</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/35 p-2 rounded border border-white/5">
                      <span className="text-slate-400">C KEY / PARRY:</span>
                      <span className="font-extrabold text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">Tactical Shield Parry</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/35 p-2 rounded border border-white/5">
                      <span className="text-slate-400">E KEY / TALENT:</span>
                      <span className="font-extrabold text-purple-400 bg-slate-800 px-2 py-0.5 rounded">Elemental Skill CD</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/35 p-2 rounded border border-white/5">
                      <span className="text-slate-400">Q KEY / BURST:</span>
                      <span className="font-extrabold text-amber-400 bg-slate-800 px-2 py-0.5 rounded">Divinity Burst (100% CD)</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/35 p-2 rounded border border-white/5">
                      <span className="text-slate-400">KEYS 1, 2, 3, 4:</span>
                      <span className="font-extrabold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">Instant Party Switch</span>
                    </div>
                  </div>
                </div>

                {/* Elemental Reactions */}
                <div className="p-5 bg-[#0a0d1a] border border-white/5 rounded-xl space-y-4">
                  <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2 font-display">
                    <Zap className="w-4 h-4 text-purple-400" />
                    Elemental Reactions Setup
                  </h4>
                  <div className="space-y-3 text-[11px] font-mono leading-relaxed">
                    <div className="bg-black/30 p-2.5 rounded border border-white/5 space-y-1">
                      <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wide">🔥 Melt (Pyro + Cryo)</span>
                      <p className="text-slate-400 leading-normal text-[10px]">Multiplies structural flash damage by 2.0x for instant elite disruption.</p>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded border border-white/5 space-y-1">
                      <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wide">💧 Vaporize (Hydro + Pyro)</span>
                      <p className="text-slate-400 leading-normal text-[10px]">Multiplies elemental shock damage by 1.5x with robust reliability.</p>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded border border-white/5 space-y-1">
                      <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wide">⚡ Overloaded (Pyro + Electro)</span>
                      <p className="text-slate-400 leading-normal text-[10px]">Triggers massive localized area explosions that stagger and push back all nearby elites.</p>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded border border-white/5 space-y-1">
                      <span className="text-[10px] font-extrabold text-sky-300 uppercase tracking-wide">❄️ Freeze / Shatter (Hydro + Cryo)</span>
                      <p className="text-slate-400 leading-normal text-[10px]">Fully locks hostiles in place. Hit frozen enemies with heavy weapons to deliver high impact Shatter hits.</p>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded border border-white/5 space-y-1">
                      <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wide">🛡️ Crystallize (Any Element + Geo)</span>
                      <p className="text-slate-400 leading-normal text-[10px]">Sinks enemies with Geo force, dropping combat shield shards. Pick them up to activate defensive barriers!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gacha & Power Scaling Guide */}
              <div className="p-6 bg-slate-950/60 border border-white/5 rounded-xl space-y-4">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2 font-display">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  SUMMONS, FORGING & HERO GROWTH
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1 bg-black/40 p-3.5 rounded border border-white/5">
                    <span className="font-extrabold text-slate-250 block uppercase tracking-wide mb-1 font-mono text-[10.5px]">EPIC RARITY ADVANTAGE</span>
                    <p className="text-slate-400 leading-relaxed text-[11px] font-mono lowercase">
                      Higher rarity brings monumental benefits! 4-star weapons and heroes scale 1.5x stronger than 3-star variants. 5-star divine items and gods scale 2x stronger than 4-star variants, resulting in a staggering 3x strength advantage over standard 3-star baselines!
                    </p>
                  </div>
                  <div className="space-y-1 bg-black/40 p-3.5 rounded border border-white/5">
                    <span className="font-extrabold text-slate-250 block uppercase tracking-wide mb-1 font-mono text-[10.5px]">THE FORGE & ARMAMENTS</span>
                    <p className="text-slate-400 leading-relaxed text-[11px] font-mono lowercase">
                      Equip unlocked weapons on matching character classes. Accumulate Mora gold and upgrade weapons directly in your Inventory slots to unlock bonus properties such as high Critical Rates, Attack Forces, or ultimate cooldown reduction triggers.
                    </p>
                  </div>
                  <div className="space-y-1 bg-black/40 p-3.5 rounded border border-white/5">
                    <span className="font-extrabold text-slate-250 block uppercase tracking-wide mb-1 font-mono text-[10.5px]">DURABLE ENDLESS ARENA</span>
                    <p className="text-slate-400 leading-relaxed text-[11px] font-mono lowercase">
                      Test your setups in the endless Arena. Every wave cleared rewards you with direct resources, topup materials, and Aether Wishes Gems. High scores persist in your localized terminal registry!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
