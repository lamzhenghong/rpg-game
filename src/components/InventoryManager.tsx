/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { PlayableCharacter, Weapon, InventoryItem, ElementType, Quest } from '../types';
import { Shield, Sparkles, Coins, Hammer, Star, StarOff, ArrowUpCircle, BookOpen, Smile, User, Flame, Droplet, Snowflake, Zap, Wind, Leaf, Search, HelpCircle, CheckCircle2, Circle } from 'lucide-react';
import { AetheriaAudioEngine } from '../utils/audio';
import { WEAPONS_DATABASE } from '../data/weapons';
import { getAccumulatedPortraitBuffs } from '../utils/portraits';
import ElementalReactionsModal from './ElementalReactionsModal';
import { LanguageType, t } from '../utils/i18n';

export function getUpgradedWeaponStats(weapon: Weapon) {
  const lvl = weapon.level || 1;
  const upgradeSteps = Math.floor(lvl / 5);
  const calcBaseAtk = Math.round(weapon.baseAtk + (lvl * 2.5));

  let statBonusStr = weapon.statBonus || "None +0%";
  let baseBonusVal = 0;
  let parsedBonusLabel = "";
  const bonusNumMatch = statBonusStr.match(/(\d+(\.\d+)?)/);
  if (bonusNumMatch) {
    baseBonusVal = parseFloat(bonusNumMatch[1]);
    parsedBonusLabel = statBonusStr.replace(bonusNumMatch[1], "");
  }

  // Upgrades every 5 levels
  const upgradedBonusVal = Number((baseBonusVal * (1 + upgradeSteps * 0.12)).toFixed(1));
  const calcStatBonus = parsedBonusLabel ? `${parsedBonusLabel}${upgradedBonusVal}` : `${statBonusStr} (+${upgradeSteps * 12}%)`;

  let baseFeatureDesc = "Master tier armaments with scaled global combat potency.";
  const templ = WEAPONS_DATABASE.find(w => w.name === weapon.name);
  if (templ) {
    baseFeatureDesc = templ.featureDesc;
  }

  let calcFeatureDesc = baseFeatureDesc;
  // Upgrade passive stats in string dynamically!
  const percentMatches = baseFeatureDesc.match(/(\d+)%/g);
  if (percentMatches) {
    percentMatches.forEach(m => {
      const origVal = parseInt(m);
      const newVal = Math.round(origVal * (1 + upgradeSteps * 0.08));
      calcFeatureDesc = calcFeatureDesc.replace(m, `${newVal}%`);
    });
  }

  return {
    calcBaseAtk,
    calcStatBonus,
    calcFeatureDesc,
    upgradeSteps
  };
}

const ELEMENTS_LIST: ('all' | ElementType)[] = ['all', 'Pyro', 'Hydro', 'Cryo', 'Electro', 'Anemo', 'Geo', 'Dendro'];

const getElementBadgeIcon = (element: ElementType) => {
  switch (element) {
    case 'Pyro': return <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />;
    case 'Hydro': return <Droplet className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    case 'Cryo': return <Snowflake className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    case 'Electro': return <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    case 'Anemo': return <Wind className="w-3.5 h-3.5 text-emerald-300 shrink-0" />;
    case 'Geo': return <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    case 'Dendro': return <Leaf className="w-3.5 h-3.5 text-green-400 shrink-0" />;
    default: return null;
  }
};

interface InventoryManagerProps {
  mora: number;
  inventoryWeapons: Weapon[];
  inventoryItems: InventoryItem[];
  characterLevels: Record<string, number>;
  characterEquippedWeapon: Record<string, string>; // characterId -> weaponUid
  ownedCharacterIds: string[];
  onLevelUpCharacter: (id: string, costMora: number, costItems: number) => void;
  onEquipWeapon: (charId: string, weaponUid: string) => void;
  onModifyCurrencies: (gemsDiff: number, moraDiff: number) => void;
  onUpgradeWeapon?: (weaponUid: string) => void;
  onShowAlert: (msg: string, solution?: string, type?: 'success' | 'error' | 'info') => void;
  onAddItems?: (itemType: 'char_xp' | 'ascension', amount: number) => void;
  activeQuests?: Quest[];
  onClaimQuestReward?: (qId: string) => void;
  characterPortraits?: Record<string, number>;
  devCheatsEnabled?: boolean;
  language?: LanguageType;
}

export default function InventoryManager({
  mora,
  inventoryWeapons,
  inventoryItems,
  characterLevels,
  characterEquippedWeapon,
  ownedCharacterIds,
  onLevelUpCharacter,
  onEquipWeapon,
  onModifyCurrencies,
  onUpgradeWeapon,
  onShowAlert,
  onAddItems,
  activeQuests = [],
  onClaimQuestReward,
  characterPortraits = {},
  devCheatsEnabled = true,
  language = 'en'
}: InventoryManagerProps) {
  const [selectedCharId, setSelectedCharId] = useState<string>(ownedCharacterIds[0] || 'aurelia');
  const [activeTab, setActiveTab] = useState<'weapons' | 'items' | 'characters'>('characters');
  const [rarityFilter, setRarityFilter] = useState<'all' | 5 | 4 | 3>('all');
  const [elementFilter, setElementFilter] = useState<'all' | ElementType>('all');
  const [weaponSearchQuery, setWeaponSearchQuery] = useState('');
  const [isReactionsModalOpen, setIsReactionsModalOpen] = useState(false);
  const [activeQuestTab, setActiveQuestTab] = useState<'daily' | 'weekly' | 'normal'>('daily');

  const selectedChar = PLAYABLE_CHARACTERS.find(c => c.id === selectedCharId) || PLAYABLE_CHARACTERS[0];
  const charLevel = characterLevels[selectedChar.id] || 1;

  // Level Up requirement calculation
  // Level 1-50: uses Hero's Wit (char_xp); Level 50-80: uses Myconid Spore Catalyst (ascension)
  const getLevelUpCost = (currentLvl: number) => {
    return {
      mora: currentLvl * 800,
      materials: Math.ceil(currentLvl / 5)
    };
  };

  const costSpecs = getLevelUpCost(charLevel);
  const usesWit = charLevel < 50; // true = Hero's Wit, false = Myconid Spore Catalyst
  const xpBooksItem = inventoryItems.find(i => i.type === 'char_xp');
  const catalystItem = inventoryItems.find(i => i.type === 'ascension');
  const availableBooks = xpBooksItem ? xpBooksItem.count : 0;
  const availableCatalyst = catalystItem ? catalystItem.count : 0;
  const availableMaterial = usesWit ? availableBooks : availableCatalyst;
  const materialName = usesWit ? "Hero's Wit" : 'Myconid Spore Catalyst';

  const handleLevelUpClick = () => {
    if (charLevel >= 80) {
      onShowAlert(
        "Character has reached the absolute maximum level cap of 80!",
        "Level up weapons to match core parameters, deploy separate elemental cohorts, and perfect dodge / block in the Active Arena to defeat high tier slimes!",
        "error"
      );
      return;
    }
    if (mora < costSpecs.mora) {
      onShowAlert(
        "Insufficient Mora! Gold is required to complete Forge activities.",
        "Defeat more standard monsters / world bosses in the Active Combat Arena to gather Mora, or tap client-side '+100,000 Mora' fast developer helper button!",
        "error"
      );
      return;
    }
    if (availableMaterial < costSpecs.materials) {
      if (usesWit) {
        onShowAlert(
          "Insufficient Hero's Wit (Character XP Books) materials.",
          "Kill enemies and clear waves in Combat Arena, or complete kill/boss/parry/reaction quests to earn Hero's Wit books!",
          "error"
        );
      } else {
        onShowAlert(
          "Insufficient Myconid Spore Catalyst materials.",
          "Clear rooms in Rogue Ruins to earn Myconid Spore Catalysts! Higher rooms drop more — rooms 7-9 give 4-6, and the Boss room gives 8-12!",
          "error"
        );
      }
      return;
    }

    onLevelUpCharacter(selectedChar.id, costSpecs.mora, costSpecs.materials);
    AetheriaAudioEngine.playSkill();
  };

  // Filter weapons compatible with selected characters
  const activeCompatibleWeapons = inventoryWeapons.filter(
    w => w.weaponType === selectedChar.weaponType &&
    (weaponSearchQuery.trim() === '' || w.name.toLowerCase().includes(weaponSearchQuery.toLowerCase()))
  );

  const equippedWeaponId = characterEquippedWeapon[selectedChar.id];
  const activeEquippedWeapon = inventoryWeapons.find(w => w.id === equippedWeaponId);
  const wStats = activeEquippedWeapon ? getUpgradedWeaponStats(activeEquippedWeapon) : null;

  // Upper upgraded active parameters computed dynamically for HUD visualization
  let bonusCritRate = 0;
  let bonusCritDmg = 0;
  let bonusAtkPercent = 0;

  if (activeEquippedWeapon) {
    const upgradeSteps = Math.floor(activeEquippedWeapon.level / 5);
    const statBonusStr = activeEquippedWeapon.statBonus || "";
    let baseBonusVal = 0;
    const bonusNumMatch = statBonusStr.match(/(\d+(\.\d+)?)/);
    if (bonusNumMatch) {
      baseBonusVal = parseFloat(bonusNumMatch[1]);
    }

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

  const charMult = selectedChar.rarity === 5 ? 3.0 : selectedChar.rarity === 4 ? 1.5 : 1.0;
  const wpMult = activeEquippedWeapon ? (activeEquippedWeapon.rarity === 5 ? 3.0 : activeEquippedWeapon.rarity === 4 ? 1.5 : 1.0) : 1.0;

  const pLvl = characterPortraits?.[selectedChar.id] || 0;
  const pBuffs = getAccumulatedPortraitBuffs(selectedChar.id, pLvl);

  let baseHp = Math.round((selectedChar.baseStats.hp + charLevel * 14) * charMult);
  let baseDef = Math.round((selectedChar.baseStats.def + charLevel * 2.4) * charMult);

  const finalCharBaseAtk = Math.round((selectedChar.baseStats.atk + charLevel * 3.8) * charMult);
  const finalWeaponBaseAtk = activeEquippedWeapon ? Math.round((activeEquippedWeapon.baseAtk + (activeEquippedWeapon.level * 2.5)) * wpMult) : 10;
  const rawAtk = finalCharBaseAtk + finalWeaponBaseAtk;
  let baseAtk = Math.round(rawAtk * (1 + bonusAtkPercent));
  let baseCritRate = selectedChar.baseStats.critRate + bonusCritRate;
  let baseCritDmg = selectedChar.baseStats.critDmg + bonusCritDmg;

  // Apply Portrait buffs
  baseHp = Math.round(baseHp * (1 + pBuffs.hp));
  baseDef = Math.round(baseDef * (1 + pBuffs.def));
  baseAtk = Math.round(baseAtk * (1 + pBuffs.atk));
  baseCritRate += pBuffs.critRate;
  baseCritDmg += pBuffs.critDmg;

  const finalHp = baseHp;
  const finalDef = baseDef;
  const finalAtk = baseAtk;
  const finalCritRate = baseCritRate * 100;
  const finalCritDmg = baseCritDmg * 100;

  // Quick sandbox grant
  const handleCheatResources = () => {
    onModifyCurrencies(0, 100000); // Grand Mora topup!
    onShowAlert(
      "Developer Cheat Bypass Activated!",
      "Successfully loaded +100,000 Mora gold into your local save registry.",
      "success"
    );
    AetheriaAudioEngine.playWaveClear();
  };

  const handleCheatHeroWit = () => {
    onAddItems?.('char_xp', 100000);
    onShowAlert(
      "Developer Cheat: Hero's Wit Loaded!",
      "Successfully added +100,000 Hero's Wit (Character XP Boost) books to your inventory.",
      "success"
    );
    AetheriaAudioEngine.playWaveClear();
  };

  const handleCheatMyconid = () => {
    onAddItems?.('ascension', 100000);
    onShowAlert(
      "Developer Cheat: Myconid Spore Catalyst Loaded!",
      "Successfully added +100,000 Myconid Spore Catalyst to your inventory.",
      "success"
    );
    AetheriaAudioEngine.playWaveClear();
  };

  return (
    <div className="bg-[#0b0f19]/85 border border-white/10 rounded-xl overflow-hidden h-full flex flex-col min-h-[600px] shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md" id="inv_main_frame">
      {/* Header bar */}
      <div className="bg-black/40 p-6 border-b border-white/10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-widest font-display">
              Ascension Forge & Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wider">
            Elevate playable combat stats, optimize weapon slot combinations, and reinforce active loadouts.
          </p>
        </div>

        {/* Currency summary & triggers */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Reaction Cheat Sheet Button */}
          <button
            type="button"
            onClick={() => {
              setIsReactionsModalOpen(true);
              AetheriaAudioEngine.playClick();
            }}
            className="bg-indigo-600/30 hover:bg-indigo-650/50 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2 shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            Reaction Cheat Sheet
          </button>

          <div className="bg-black/30 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-[#fbbf24]" />
            <span className="text-xs text-slate-400 font-mono uppercase">Mora Gold:</span>
            <span className="text-sm font-black text-amber-400 font-mono">{mora.toLocaleString()}</span>
          </div>

          {devCheatsEnabled && (
            <button
              type="button"
              onClick={handleCheatResources}
              className="bg-black/55 hover:bg-black/85 text-slate-200 border border-white/10 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm hover:border-amber-500/30"
            >
              +100,000 Mora
            </button>
          )}
        </div>
      </div>

      {/* Main split dashboard pane */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* Left column selection list (Roster and Filters) */}
        <div className="bg-[#060811]/45 border border-white/10 rounded-xl p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex gap-1 bg-black/45 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => {
                  setActiveTab('characters');
                  AetheriaAudioEngine.playClick();
                }}
                className={`flex-1 text-center py-2.5 rounded-md text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'characters' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Roster
              </button>
              <button
                onClick={() => {
                  setActiveTab('weapons');
                  AetheriaAudioEngine.playClick();
                }}
                className={`flex-1 text-center py-2.5 rounded-md text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'weapons' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Armaments
              </button>
              <button
                onClick={() => {
                  setActiveTab('items');
                  AetheriaAudioEngine.playClick();
                }}
                className={`flex-1 text-center py-2.5 rounded-md text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'items' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Augments
              </button>
            </div>

            {/* Premium Rarity Filter Controls Row */}
            {(activeTab === 'characters' || activeTab === 'weapons') && (
              <div className="flex flex-col gap-2 bg-black/35 p-3 rounded-lg border border-white/5">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Rarity Rating:</span>
                <div className="flex gap-1.5">
                  {(['all', 5, 4, 3] as const).map((r) => {
                    const isSelected = rarityFilter === r;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          setRarityFilter(r);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`flex-1 text-center py-2 text-xs font-black rounded uppercase tracking-wider cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-slate-955 font-black'
                            : 'bg-black/40 text-slate-400 hover:text-slate-250 border border-white/5'
                        }`}
                      >
                        {r === 'all' ? 'ALL' : `${r}★`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Element Filter Controls Block */}
            {(activeTab === 'characters') && (
              <div className="flex flex-col gap-2 bg-black/35 p-3 rounded-lg border border-white/5">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Element Attunement:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {ELEMENTS_LIST.map((el) => {
                    const isSelected = elementFilter === el;
                    const colorClass = isSelected
                      ? 'bg-indigo-500 text-slate-950 font-black border-indigo-400/30'
                      : 'bg-black/40 text-slate-350 hover:bg-black/70 border-white/5';
                    
                    return (
                      <button
                        key={el}
                        onClick={() => {
                          setElementFilter(el);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`px-2.5 py-2 rounded text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all border ${colorClass}`}
                      >
                        {el === 'all' ? (
                          <span className={`${isSelected ? 'text-slate-950 font-black' : 'text-slate-300 font-bold'}`}>ALL ELEMENTS</span>
                        ) : (
                          <>
                            {getElementBadgeIcon(el)}
                            <span className={isSelected ? 'text-slate-950 font-black' : 'text-slate-200'}>{el}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'characters' && (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {(() => {
                  const visibleChars = PLAYABLE_CHARACTERS.filter(c => {
                    const isOwned = ownedCharacterIds.includes(c.id);
                    const matchesFilter = rarityFilter === 'all' || c.rarity === rarityFilter;
                    const matchesElement = elementFilter === 'all' || c.element === elementFilter;
                    return isOwned && matchesFilter && matchesElement;
                  }).sort((a, b) => {
                    const levelA = characterLevels[a.id] || 1;
                    const levelB = characterLevels[b.id] || 1;
                    if (levelA !== levelB) {
                      return levelB - levelA; // Leveled up characters first
                    }
                    if (a.rarity !== b.rarity) {
                      return b.rarity - a.rarity; // Higher rarity next
                    }
                    // Maintain original database order
                    const idxA = PLAYABLE_CHARACTERS.findIndex(c => c.id === a.id);
                    const idxB = PLAYABLE_CHARACTERS.findIndex(c => c.id === b.id);
                    return idxA - idxB;
                  });

                  if (visibleChars.length === 0) {
                    return (
                      <div className="text-center py-16 text-slate-500 text-sm italic font-mono uppercase">
                        {ownedCharacterIds.length === 0 
                          ? 'No heroes summoned yet. Visit Celestial Summons!' 
                          : `No matching ${rarityFilter === 'all' ? '' : rarityFilter + '★'} ${elementFilter === 'all' ? '' : elementFilter} heroes found.`}
                      </div>
                    );
                  }

                  return visibleChars.map(c => {
                    const level = characterLevels[c.id] || 1;
                    const isSelected = selectedCharId === c.id;

                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCharId(c.id);
                          AetheriaAudioEngine.playClick();
                          setWeaponSearchQuery(''); // Reset search for smoothness
                        }}
                        className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-[#0e1628] border-indigo-500/50 text-slate-100 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                            : 'bg-black/25 border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        {/* Left highlights glow bar for active profile selection */}
                        {isSelected && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                        )}

                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-slate-955 font-black text-base shrink-0 ${c.avatarPlaceholder}`}>
                            {c.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-sm uppercase tracking-tight text-white truncate max-w-[125px] font-display">
                                {c.name}
                              </span>
                              <div className="flex shrink-0 gap-0.5">
                                {Array.from({ length: c.rarity }).map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                                ))}
                              </div>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono uppercase mt-1 flex items-center gap-1 truncate">
                              {getElementBadgeIcon(c.element)}
                              <span className="truncate">{c.element} • {c.weaponType} Specialist</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-black font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded uppercase border border-amber-400/20 shrink-0">LV.{level}</span>
                      </button>
                    );
                  });
                })()}
              </div>
            )}

            {activeTab === 'weapons' && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {(() => {
                  const visibleWeapons = inventoryWeapons.filter(w => {
                    return rarityFilter === 'all' || w.rarity === rarityFilter;
                  }).sort((a, b) => {
                    const levelA = a.level || 1;
                    const levelB = b.level || 1;
                    if (levelA !== levelB) {
                      return levelB - levelA; // High level first
                    }
                    if (a.rarity !== b.rarity) {
                      return b.rarity - a.rarity; // High rarity first
                    }
                    // Maintain stable order
                    const idxA = inventoryWeapons.findIndex(item => item.id === a.id);
                    const idxB = inventoryWeapons.findIndex(item => item.id === b.id);
                    return idxA - idxB;
                  });

                  if (visibleWeapons.length === 0) {
                    return (
                      <div className="text-center py-16 text-slate-500 text-sm italic font-mono uppercase">
                        {inventoryWeapons.length === 0 
                          ? 'No forged weapons in armory ledger.' 
                          : `No ${rarityFilter}★ weapons found.`}
                      </div>
                    );
                  }

                  return visibleWeapons.map((w, idx) => (
                    <div key={idx} className="p-4 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center text-sm hover:bg-black/35 transition-all">
                      <div>
                        <span className="font-extrabold text-slate-200 uppercase text-sm tracking-tight block font-display">
                          {w.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase mt-1">
                          <div className="flex gap-0.5 select-none">
                            {Array.from({ length: w.rarity }).map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                            ))}
                          </div>
                          <span>• {w.weaponType} • ATK BASE: {w.baseAtk}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded uppercase border border-amber-400/20 shrink-0">LV.{w.level}/50</span>
                    </div>
                  ));
                })()}
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {inventoryItems.map((item, idx) => (
                  <div key={idx} className="p-4 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center text-sm hover:bg-black/35 transition-all">
                    <div>
                      <span className="font-extrabold text-slate-205 uppercase text-sm tracking-tight">{item.name}</span>
                      <span className="text-xs text-slate-400 block mt-1.5">{item.desc}</span>
                    </div>
                    <span className="font-black font-mono text-indigo-400 bg-indigo-400/10 border border-indigo-500/20 px-3 py-1 rounded text-xs shrink-0 self-center">x{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest block">Ledger signature status</span>
            <div className="text-sm text-emerald-400 font-extrabold uppercase mt-1">MATRIX ONLINE</div>
          </div>
        </div>

        {/* Right Columns (2 columns) display detail of selected character */}
        <div className="lg:col-span-2 bg-[#060811]/60 border border-white/10 p-6 rounded-xl flex flex-col justify-between shadow-[0_0_25px_rgba(99,102,241,0.06)]">
          <div className="space-y-6">
            
            {/* Header character profile details */}
            <div className="flex items-center gap-5 border-b border-white/15 pb-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black text-slate-955 shadow-[0_0_20px_rgba(0,0,0,0.6)] ring-2 ring-white/10 ${selectedChar.avatarPlaceholder}`}>
                {selectedChar.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-widest font-display">{selectedChar.name}</h3>
                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3 mt-1.5 uppercase font-[#95a5a6] font-mono">
                  <span className="font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 border border-amber-400/20 rounded">LEVEL {charLevel} / 80</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-bold">{selectedChar.element} ATTUNEMENT</span>
                  <span>•</span>
                  <span className="text-purple-455 font-bold text-purple-300">{selectedChar.weaponType} PROFESSIONAL</span>
                  <span>•</span>
                  <span className="text-amber-400 font-extrabold bg-amber-400/10 px-2.5 py-0.5 border border-amber-400/20 rounded">PORTRAIT P{pLvl}</span>
                </div>
              </div>
            </div>
            
            {/* Split layout: dynamic stats left, weapon selectors right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Stats column with weapon bonus updates shown */}
              <div className="space-y-5 p-6 bg-black/40 border border-white/10 rounded-xl relative">
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.7)]" />
                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Active combat parameters
                </h4>
                
                <div className="space-y-4 text-sm text-slate-200">
                  {/* ATK */}
                  <div className="flex flex-col border-b border-white/5 pb-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wide">Strike Attack Force (ATK)</span>
                      <span className="font-mono text-lg font-black text-amber-400">
                        {finalAtk}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono lowercase tracking-wide mt-1">
                      base: {Math.round(selectedChar.baseStats.atk * charMult)} + growth: {Math.round(charLevel * 3.8 * charMult)} + armament: {finalWeaponBaseAtk} {bonusAtkPercent > 0 ? ` (+${Math.round(bonusAtkPercent * 100)}% weapon bonus)` : ''} [rarity mult: {charMult}x]
                    </span>
                  </div>

                  {/* HP */}
                  <div className="flex flex-col border-b border-white/5 pb-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wide">Celestial Health Index (HP)</span>
                      <span className="font-mono text-lg font-black text-rose-400">
                        {finalHp}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono lowercase tracking-wide mt-1">
                      base: {Math.round(selectedChar.baseStats.hp * charMult)} + growth: {Math.round(charLevel * 14 * charMult)} HP
                    </span>
                  </div>

                  {/* DEF */}
                  <div className="flex flex-col border-b border-white/5 pb-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wide">Steel Barrier Defense (DEF)</span>
                      <span className="font-mono text-lg font-black text-blue-400">
                        {finalDef}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono lowercase tracking-wide mt-1">
                      base: {Math.round(selectedChar.baseStats.def * charMult)} + growth: {Math.round(charLevel * 2.4 * charMult)} DEF
                    </span>
                  </div>

                  {/* CRIT RATE */}
                  <div className="flex flex-col border-b border-white/5 pb-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wide">Strike Critical Rate (CRIT %)</span>
                      <span className="font-mono text-lg font-black text-emerald-400">
                        {finalCritRate.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono lowercase tracking-wide mt-1">
                      base: {(selectedChar.baseStats.critRate * 100).toFixed(1)}% + weapon bonus: {(bonusCritRate * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* CRIT DMG */}
                  <div className="flex flex-col pb-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wide">Critical Damage Multiplier</span>
                      <span className="font-mono text-lg font-black text-cyan-400">
                        {finalCritDmg.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono lowercase tracking-wide mt-1">
                      base: {(selectedChar.baseStats.critDmg * 100).toFixed(1)}% + weapon bonus: {(bonusCritDmg * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

              </div>

              {/* Weapon Equipment Selection and Active Weapon Forging */}
              <div className="space-y-6">
                <div className="bg-black/35 border border-white/10 rounded-xl p-5">
                  <h4 className="text-sm font-black text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-pink-400" />
                    Equip Armaments Slot
                  </h4>

                  {/* Searching Input Form Box */}
                  <div className="relative mb-3.5">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search compatible weapons..."
                      value={weaponSearchQuery}
                      onChange={(e) => setWeaponSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-black/45 border border-white/10 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                    />
                    {weaponSearchQuery && (
                      <button
                        onClick={() => setWeaponSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white font-extrabold text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {activeCompatibleWeapons.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          onEquipWeapon(selectedChar.id, w.id);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`w-full text-left p-3 rounded-lg border text-sm flex justify-between items-center transition-all cursor-pointer ${
                          equippedWeaponId === w.id
                            ? 'bg-[#0f172a] border-indigo-500/75 text-indigo-200 font-extrabold shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                            : 'bg-black/25 border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        <div>
                          <span className="truncate max-w-[140px] block font-black uppercase text-xs text-slate-100">{w.name}</span>
                          <span className="text-[11px] text-slate-400 block font-mono mt-1">Bonus: +{w.baseAtk} ATK • LV.{w.level}/50</span>
                        </div>
                        <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md ${
                          equippedWeaponId === w.id
                            ? 'bg-indigo-500/25 border border-indigo-500/40 text-indigo-300'
                            : 'bg-white/5 border border-white/15 text-slate-400'
                        }`}>
                          {equippedWeaponId === w.id ? 'Equipped' : 'Equip'}
                        </span>
                      </button>
                    ))}

                    {activeCompatibleWeapons.length === 0 && (
                      <div className="text-xs text-slate-500 italic py-8 text-center font-mono uppercase tracking-wider">
                        NO COMPATIBLE {selectedChar.weaponType.toUpperCase()} WEAPONS FOUND
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIVE WEAPON ENHANCER AND PASSIVE TAB (Moved to the right side!) */}
                {activeEquippedWeapon && (
                  <div className="bg-gradient-to-br from-indigo-950/30 to-black/55 border border-indigo-500/25 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden space-y-4">
                    <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                      <Hammer className="w-16 h-16 text-[#a855f7]" />
                    </div>

                    <div>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-black px-2.5 py-1 rounded font-mono uppercase tracking-wider">WEAPON FORGING</span>
                      <h5 className="text-[14px] font-black text-slate-200 mt-2 uppercase font-display truncate">{activeEquippedWeapon.name}</h5>
                      
                      {/* STAT ATTRIBUTE SUB-TYPE */}
                      <div className="mt-2.5 py-2 px-3 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold uppercase font-mono">STAT SUB-TYPE:</span>
                        <span className="font-black text-emerald-400 font-mono text-xs uppercase tracking-tight">
                          {wStats ? wStats.calcStatBonus : 'Crit Rate +10.0%'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-1 tracking-wider lowercase text-right">
                        * upgraded {Math.floor(Math.min(activeEquippedWeapon.level, 49) / 5)} times (+15% sub-bonus per 5 levels)
                      </span>

                      {activeEquippedWeapon.level >= 50 ? (
                        <p className="text-xs text-emerald-400 font-mono uppercase mt-2.5 font-black">
                          LEVEL: LV.{activeEquippedWeapon.level} (MAXED)
                        </p>
                      ) : (
                        <p className="text-xs text-slate-350 font-mono uppercase mt-2.5">
                          LEVEL PROGRESS: LV.{activeEquippedWeapon.level} ➔ <span className="text-emerald-400 font-black">LV.{activeEquippedWeapon.level + 1}</span> (ATK +2.5 & Enhancements)
                        </p>
                      )}
                      {activeEquippedWeapon.level >= 50 ? (
                        <p className="text-xs text-emerald-400 font-mono uppercase mt-1 font-black">
                          WEAPON HAS REACHED MAXIMUM LEVEL
                        </p>
                      ) : (
                        <p className="text-xs text-amber-400 font-black font-mono mt-1 uppercase tracking-wide">
                          UPGRADE COST: {(activeEquippedWeapon.level * 200).toLocaleString()} MORA
                        </p>
                      )}
                    </div>

                    {/* ACTIVE FORGED FEATURE (PASSIVE) INNER CARD */}
                    <div className="p-3.5 bg-gradient-to-br from-indigo-950/40 to-[#0c0d1b] border border-indigo-500/20 rounded-lg shadow-inner">
                      <span className="text-[11px] font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5 pb-1 border-b border-indigo-500/15 mb-2">
                        <Hammer className="w-3.5 h-3.5 text-indigo-400" />
                        Active Forged Feature (Passive)
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed italic font-sans">
                        "{wStats ? wStats.calcFeatureDesc : 'Unlocks dynamic strike speed with automatic level up boosts inside active arena trials.'}"
                      </p>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-[#fbbf24] font-mono uppercase font-black tracking-widest">
                          Refinement Stage: S{Math.floor(Math.min(activeEquippedWeapon.level, 49) / 5) + 1}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold text-right">
                          Passive Potency: +{Math.floor(Math.min(activeEquippedWeapon.level, 49) / 5) * 8}%
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={activeEquippedWeapon.level >= 50}
                      onClick={() => onUpgradeWeapon && onUpgradeWeapon(activeEquippedWeapon.id)}
                      className={`mt-2 ${
                        activeEquippedWeapon.level >= 50
                          ? 'bg-slate-800 text-slate-500 border-slate-700 shadow-none cursor-not-allowed border-slate-700 shadow-none'
                          : 'bg-indigo-650 hover:bg-indigo-550 text-white shadow-md border-indigo-500/20'
                      } font-black text-xs uppercase tracking-widest py-3 rounded-lg active:scale-95 transition-all text-center cursor-pointer border`}
                    >
                      {activeEquippedWeapon.level >= 50 ? 'WEAPON MAXED' : 'Enchant Weapon (Forge Level Up)'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-black/45 border border-white/10 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
              <div className="space-y-1 text-center md:text-left">
                <h5 className="text-xs font-black text-slate-300 uppercase tracking-widest">Ascend Attunement Sphere</h5>
                {charLevel >= 80 ? (
                  <p className="text-xs text-emerald-400 font-mono uppercase font-black">
                    CHARACTER LEVEL CAP REACHED (MAXED)
                  </p>
                ) : (
                  <p className="text-xs text-slate-450 leading-relaxed font-mono uppercase text-slate-300">
                    REQUIRED: <b className="text-[#fbbf24] font-black">{costSpecs.mora.toLocaleString()} MORA</b> FORGE REQUISITE &{' '}
                    {usesWit ? (
                      <><b className="text-indigo-400 font-mono font-black">{costSpecs.materials} HERO'S WIT</b> BOOKS (REMAINING: {availableBooks})</>
                    ) : (
                      <><b className="text-emerald-400 font-mono font-black">{costSpecs.materials} MYCONID SPORE CATALYST</b> (REMAINING: {availableCatalyst})</>
                    )}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 font-mono">
                  {charLevel >= 80
                    ? 'Maximum level reached. Character parameters are capped.'
                    : usesWit
                      ? 'LV.1•50: Uses Hero’s Wit • LV.50•80: Uses Myconid Spore Catalyst'
                      : 'LV.50•80: Requires Myconid Spore Catalyst from Rogue Ruins'}
                </p>
              </div>

              <button
                onClick={handleLevelUpClick}
                disabled={charLevel >= 80}
                className={`${
                  charLevel >= 80
                    ? 'bg-slate-800 text-slate-500 border-slate-700 shadow-none cursor-not-allowed border-slate-700 shadow-none'
                    : 'bg-amber-400 hover:bg-amber-350 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.30)] border-amber-300/30'
                } font-black text-xs uppercase tracking-widest px-6 py-3 rounded-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer border`}
              >
                <ArrowUpCircle className="w-5 h-5 text-slate-95" />
                <span>{charLevel >= 80 ? 'CHARACTER MAXED' : `Ascend Character (LV.${charLevel + 1})`}</span>
              </button>
            </div>

            {/* Developer cheat buttons for materials */}
            {devCheatsEnabled && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCheatHeroWit}
                  className="bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/20 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm hover:border-indigo-400/40"
                >
                  +100,000 Hero's Wit
                </button>
                <button
                  type="button"
                  onClick={handleCheatMyconid}
                  className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/20 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm hover:border-emerald-400/40"
                >
                  +100,000 Myconid Catalyst
                </button>
              </div>
            )}

            {/* --- ELEMENTAL REACTIONS CHEAT SHEET --- BELOW CHARACTER --- */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
                <h4 className="text-sm font-black text-slate-205 text-white uppercase tracking-widest font-display">
                  Elemental Reaction Matrix Cheat Sheet
                </h4>
              </div>
              <p className="text-xs text-slate-400 lowercase font-mono">
                infuse multiple elements in battle to trigger devastating hypercombos with status effects.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[350px] overflow-y-auto pr-1">
                {[
                  {
                    pair: ['Pyro 🟥', 'Hydro 🟦'],
                    name: 'Vaporize Combo',
                    mult: '2.0x DMG Multiplier',
                    effect: 'Instantly vaporizes slimes deals massive double damage.',
                    colorClass: 'from-orange-500/10 via-slate-900/40 to-blue-500/10 border-orange-500/20'
                  },
                  {
                    pair: ['Pyro 🟥', 'Electro 🟪'],
                    name: 'Overloaded Blast',
                    mult: '+400 Bonus DMG',
                    effect: 'Causes massive Area knockback shunt and pink kinetic explosion.',
                    colorClass: 'from-rose-500/10 via-slate-900/40 to-purple-500/10 border-rose-500/20'
                  },
                  {
                    pair: ['Hydro 🟦', 'Cryo ❄️'],
                    name: 'Frozen Hold',
                    mult: '3.5s Stun CC',
                    effect: 'Hostile targets are locked completely frozen and inactive.',
                    colorClass: 'from-blue-500/10 via-slate-900/40 to-sky-400/10 border-sky-400/20'
                  },
                  {
                    pair: ['Dendro 🟩', 'Hydro 🟦'],
                    name: 'Bloom Eruption',
                    mult: '+750 Splash DMG',
                    effect: 'Spawns nature cores that burst out green splash shockwaves.',
                    colorClass: 'from-emerald-500/10 via-slate-900/40 to-blue-500/10 border-emerald-500/20'
                  },
                  {
                    pair: ['Dendro 🟩', 'Electro 🟪'],
                    name: 'Hyperbloom Quasar',
                    mult: '2.3x DMG Multiplier',
                    effect: 'Shoots tracking homing sparks at up to 3 surrounding enemies.',
                    colorClass: 'from-emerald-500/10 via-slate-900/40 to-purple-500/10 border-emerald-400/20'
                  },
                  {
                    pair: ['Dendro 🟩', 'Pyro 🟥'],
                    name: 'Burning Ignition',
                    mult: 'Continuous ticks DoT',
                    effect: 'Deep ignition ticks burn HP for over 120 battle frames.',
                    colorClass: 'from-emerald-500/10 via-slate-900/40 to-red-500/10 border-red-500/20'
                  },
                  {
                    pair: ['Cryo ❄️', 'Electro 🟪'],
                    name: 'Superconduct Shred',
                    mult: '+200 DMG & DEF Shred',
                    effect: 'Reduces enemy defensive stats and deals instant cold snap damage.',
                    colorClass: 'from-sky-500/10 via-slate-900/40 to-purple-500/10 border-purple-500/20'
                  },
                  {
                    pair: ['Geo 🟨', 'Any Element'],
                    name: 'Crystallize Aegis',
                    mult: 'Active Shield Shard',
                    effect: 'Drops structural crystal shield shards to absorb incoming blows.',
                    colorClass: 'from-yellow-500/10 via-slate-900/40 to-slate-800/20 border-yellow-500/20'
                  },
                  {
                    pair: ['Anemo 🌀', 'Any Element'],
                    name: 'Swirl Gale Splash',
                    mult: 'Element Spreader',
                    effect: 'Spreads existing slimes debuffs to close combatants instantly.',
                    colorClass: 'from-teal-500/10 via-slate-900/40 to-sky-550/10 border-teal-500/20'
                  }
                ].map((rc, index) => (
                  <div key={index} className={`p-4 bg-gradient-to-br ${rc.colorClass} border rounded-xl space-y-2`}>
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-slate-400">
                        {rc.pair.join(' + ')}
                      </span>
                      <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-tight bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">
                        {rc.mult}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white uppercase tracking-wider font-display">{rc.name}</h5>
                      <p className="text-[11px] text-slate-450 text-slate-400 mt-1 leading-relaxed font-sans">{rc.effect}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- QUEST LOG COMPONENT --- ABOVE QUEST LOG, BELOW CHARACTER --- */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 bg-amber-400"></div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest font-display">
                    Squadron Quest ledger ({activeQuests.length} Remaining)
                  </h4>
                </div>
                
                {/* Visual tabs to toggle between Daily, Weekly, and Normal */}
                <div className="flex bg-black/45 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
                  {(['daily', 'weekly', 'normal'] as const).map((tab) => {
                    const count = activeQuests.filter(q => {
                      if (tab === 'normal') return q.group === 'normal' || !q.group;
                      return q.group === tab;
                    }).length;
                    return (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveQuestTab(tab);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          activeQuestTab === tab 
                            ? 'bg-amber-400 text-slate-950 shadow-md' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {tab === 'normal' ? 'campaign' : tab} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {(() => {
                  const filtered = activeQuests.filter(q => {
                    if (activeQuestTab === 'normal') return q.group === 'normal' || !q.group;
                    return q.group === activeQuestTab;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-10 bg-black/15 border border-dashed border-white/5 rounded-xl text-xs font-mono text-slate-500 uppercase tracking-widest">
                        All check-points in this sector completed!
                      </div>
                    );
                  }

                  return filtered.map((q) => {
                    const pct = Math.min(100, (q.currentValue / q.targetValue) * 100);
                    const isDaily = q.group === 'daily';
                    const isWeekly = q.group === 'weekly';
                    const diffTag = isDaily 
                      ? 'EASY DAILY' 
                      : isWeekly 
                        ? 'MEDIUM WEEKLY' 
                        : 'HARD CAMPAIGN';
                    const diffColor = isDaily 
                      ? 'bg-emerald-450/15 text-emerald-400 border-emerald-500/25' 
                      : isWeekly 
                        ? 'bg-purple-450/15 text-purple-300 border-purple-500/25' 
                        : 'bg-red-450/15 text-red-400 border-red-500/25';

                    return (
                      <div key={q.id} className="p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col gap-2 relative">
                        <div className="flex justify-between items-start gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8.5px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 border rounded ${diffColor}`}>
                                {diffTag}
                              </span>
                              <span className="text-[11px] font-black text-slate-100 uppercase tracking-wider leading-tight font-display">{q.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 leading-relaxed block mt-1">{q.desc}</span>
                          </div>
                          {q.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-405 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-705 text-slate-700 shrink-0 mt-0.5" />
                          )}
                        </div>

                        {/* Progress bar info */}
                        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 mt-1">
                          <div className="bg-slate-950 rounded-sm flex-1 h-2 overflow-hidden border border-white/5">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-300" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                          <span className="font-bold font-mono text-slate-200 shrink-0">{q.currentValue}/{q.targetValue}</span>
                        </div>

                        {/* Claim reward link */}
                        <div className="flex justify-between items-center pt-2.5 border-t border-white/5 mt-1">
                          <div className="text-[9.5px] text-slate-400 flex items-center gap-2 font-mono leading-none">
                            <span className="uppercase text-[8px] tracking-widest text-slate-500">REWARDS:</span>
                            <span className="text-amber-350 text-amber-350 font-black">+{q.rewardTokens}G</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-yellow-400 font-bold">+{q.rewardMora.toLocaleString()} Mora</span>
                          </div>

                          {q.completed ? (
                            <button
                              onClick={() => {
                                if (onClaimQuestReward) onClaimQuestReward(q.id);
                              }}
                              className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-widest transition-all duration-100 transform hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-amber-400/10"
                            >
                              CLAIM NOW
                            </button>
                          ) : (
                            <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-650 text-slate-500">IN PROGRESS</span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>

          <div className="text-[10px] text-slate-500 text-center mt-6 border-t border-white/5 pt-4 uppercase font-mono">
            *Ultimate metrics scale with active Forge levels. Armaments and level-up milestones amplify weapon stats and passive potentials every 5 levels!
          </div>

        </div>
      </div>

      {isReactionsModalOpen && (
        <ElementalReactionsModal
          isOpen={isReactionsModalOpen}
          onClose={() => setIsReactionsModalOpen(false)}
        />
      )}
    </div>
  );
}
