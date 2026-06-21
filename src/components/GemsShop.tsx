/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Coins, ShoppingBag, Clock, Shield, Sparkles,
  Snowflake, Sparkle, BookOpen, Layers, CheckCircle2 
} from 'lucide-react';
import { SaveState, Artifact, ArtifactSlot, ArtifactSet } from '../types';
import { ARTIFACT_SETS, ARTIFACT_NAMES } from '../data/artifacts';
import { AetheriaAudioEngine } from '../utils/audio';

// Seeded random number generator for deterministic hourly rotation
class SeededRandom {
  seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  nextInt(min: number, max: number) {
    return Math.floor(this.next() * (max - min)) + min;
  }
  choice<T>(arr: T[] | readonly T[]): T {
    return arr[this.nextInt(0, arr.length)];
  }
}

export interface ShopItem {
  id: string; // shop_item_0 to shop_item_9
  type: 'material' | 'artifact' | 'skin';
  name: string;
  rarity: 'Common' | 'Rare' | 'Legendary';
  price: number;
  description: string;
  // Payloads
  materialId?: 'wit_exp' | 'ore_exp';
  materialCount?: number;
  artifactSet?: ArtifactSet;
  artifactSlot?: ArtifactSlot;
  artifactRarity?: 3 | 4 | 5;
  skinId?: string;
}

export const DAMAGE_SKINS = [
  { id: 'Ice', name: 'Ice Skin', rarity: 'Common', display: '❄1000❄', price: 20000, icon: '❄', desc: 'Encases all damage popups in frost crystals.' },
  { id: 'Void', name: 'Void Skin', rarity: 'Rare', display: '◈1000◈', price: 30000, icon: '◈', desc: 'Gives damage popups an ancient shadow void aura.' },
  { id: 'Celestial', name: 'Celestial Skin', rarity: 'Legendary', display: '✦✦1000✦✦', price: 50000, icon: '✦', desc: 'Surrounds critical damage integers in starlight sigils.' }
] as const;

interface GemsShopProps {
  saveState: SaveState;
  onUpdateSaveState: React.Dispatch<React.SetStateAction<SaveState>>;
  onShowAlert: (msg: string, solution?: string, type?: 'success' | 'error' | 'info') => void;
}

export default function GemsShop({ saveState, onUpdateSaveState, onShowAlert }: GemsShopProps) {
  const [timeLeft, setTimeLeft] = useState<string>('59:59');
  
  // Current hour index
  const currentHourBlock = Math.floor(Date.now() / (1000 * 60 * 60));

  // Determine time remaining to next top-of-hour refresh
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const msToNextHour = 3600000 - (now % 3600000);
      const minutes = Math.floor(msToNextHour / 60000);
      const seconds = Math.floor((msToNextHour % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate deterministic items for the current hour
  const shopItems = useMemo(() => {
    const rng = new SeededRandom(currentHourBlock);
    const items: ShopItem[] = [];

    const addedSkinIds = new Set<string>();
    const addedArtifacts = new Set<string>(); // Tracks "set_slot_rarity"

    // 1. Generate 2 Legendary Items
    for (let i = 0; i < 2; i++) {
      const rollType = rng.next();
      // Try to sell a Legendary Skin or a 5-Star Artifact
      const legendarySkins = DAMAGE_SKINS.filter(s => s.rarity === 'Legendary' && !addedSkinIds.has(s.id));
      
      if (rollType < 0.5 && legendarySkins.length > 0) {
        // Legendary Skin
        const skin = rng.choice(legendarySkins);
        addedSkinIds.add(skin.id);
        items.push({
          id: `shop_item_${items.length}`,
          type: 'skin',
          name: skin.name,
          rarity: 'Legendary',
          price: skin.price,
          description: skin.desc,
          skinId: skin.id
        });
      } else {
        // 5-Star Artifact
        let set: ArtifactSet = 'Vanguard';
        let slot: ArtifactSlot = 'helmet';
        for (let attempt = 0; attempt < 5; attempt++) {
          set = rng.choice(['Vanguard', 'Guardian', 'Celestial', 'Chrono']);
          slot = rng.choice(['helmet', 'hands', 'leg', 'shoe']);
          if (!addedArtifacts.has(`${set}_${slot}_5`)) {
            break;
          }
        }
        addedArtifacts.add(`${set}_${slot}_5`);
        const name = ARTIFACT_NAMES[set][slot];
        items.push({
          id: `shop_item_${items.length}`,
          type: 'artifact',
          name: name,
          rarity: 'Legendary',
          price: 2000,
          description: `5★ ${set} set piece for the ${slot} slot. Contains maximum stat scaling.`,
          artifactSet: set,
          artifactSlot: slot,
          artifactRarity: 5
        });
      }
    }

    // 2. Generate 8 Common/Rare Items
    while (items.length < 10) {
      const rollType = rng.next();

      if (rollType < 0.35) {
        // Material Bundle
        const isRare = rng.next() < 0.5;
        if (isRare) {
          // Hero's Wit
          const count = rng.choice([5, 10]);
          items.push({
            id: `shop_item_${items.length}`,
            type: 'material',
            name: `${count}x Hero's Wit`,
            rarity: 'Rare',
            price: count === 5 ? 250 : 500,
            description: `Character XP material. Grants substantial experience to level up heroes.`,
            materialId: 'wit_exp',
            materialCount: count
          });
        } else {
          // Myconid Spores
          const count = rng.choice([5, 10]);
          items.push({
            id: `shop_item_${items.length}`,
            type: 'material',
            name: `${count}x Myconid Spores`,
            rarity: 'Common',
            price: count === 5 ? 150 : 300,
            description: `Ascension material required to unlock level caps above level 50.`,
            materialId: 'ore_exp',
            materialCount: count
          });
        }
      } else if (rollType < 0.70) {
        // Artifact (3-Star or 4-Star)
        let set: ArtifactSet = 'Vanguard';
        let slot: ArtifactSlot = 'helmet';
        let rarity: 3 | 4 = 3;
        for (let attempt = 0; attempt < 5; attempt++) {
          set = rng.choice(['Vanguard', 'Guardian', 'Celestial', 'Chrono']);
          slot = rng.choice(['helmet', 'hands', 'leg', 'shoe']);
          rarity = rng.choice([3, 4]) as 3 | 4;
          if (!addedArtifacts.has(`${set}_${slot}_${rarity}`)) {
            break;
          }
        }
        addedArtifacts.add(`${set}_${slot}_${rarity}`);
        const name = ARTIFACT_NAMES[set][slot];
        
        items.push({
          id: `shop_item_${items.length}`,
          type: 'artifact',
          name: name,
          rarity: rarity === 4 ? 'Rare' : 'Common',
          price: rarity === 4 ? 800 : 300,
          description: `${rarity}★ ${set} set piece for the ${slot} slot.`,
          artifactSet: set,
          artifactSlot: slot,
          artifactRarity: rarity
        });
      } else {
        // Damage Skin (Common or Rare)
        const availableSkins = DAMAGE_SKINS.filter(s => s.rarity !== 'Legendary' && !addedSkinIds.has(s.id));
        if (availableSkins.length > 0) {
          const skin = rng.choice(availableSkins);
          addedSkinIds.add(skin.id);
          items.push({
            id: `shop_item_${items.length}`,
            type: 'skin',
            name: skin.name,
            rarity: skin.rarity,
            price: skin.price,
            description: skin.desc,
            skinId: skin.id
          });
        } else {
          // Fallback to a 4-Star Artifact if all common/rare skins are already added
          let set: ArtifactSet = 'Vanguard';
          let slot: ArtifactSlot = 'helmet';
          for (let attempt = 0; attempt < 5; attempt++) {
            set = rng.choice(['Vanguard', 'Guardian', 'Celestial', 'Chrono']);
            slot = rng.choice(['helmet', 'hands', 'leg', 'shoe']);
            if (!addedArtifacts.has(`${set}_${slot}_4`)) {
              break;
            }
          }
          addedArtifacts.add(`${set}_${slot}_4`);
          const name = ARTIFACT_NAMES[set][slot];
          items.push({
            id: `shop_item_${items.length}`,
            type: 'artifact',
            name: name,
            rarity: 'Rare',
            price: 800,
            description: `4★ ${set} set piece for the ${slot} slot.`,
            artifactSet: set,
            artifactSlot: slot,
            artifactRarity: 4
          });
        }
      }
    }

    return items;
  }, [currentHourBlock]);

  // Handle Purchasing an Item
  const handlePurchase = (item: ShopItem) => {
    const unlockedSkins = saveState.unlockedDamageSkins || ['Default'];
    if (item.type === 'skin' && item.skinId && unlockedSkins.includes(item.skinId)) {
      onShowAlert('Already Owned!', 'You already own this damage skin.', 'info');
      return;
    }

    if (saveState.aetherGems < item.price) {
      onShowAlert(`Insufficient Aether Gems! Required: ${item.price} gems.`, 'Earn gems by completing quests or clearing waves.', 'error');
      return;
    }

    // Play purchase audio
    AetheriaAudioEngine.playClick();

    onUpdateSaveState(prev => {
      const currentGems = prev.aetherGems - item.price;
      const purchased = [...(prev.purchasedShopItemIds || [])];
      
      // Prevent double buying in the same hour
      if (purchased.includes(item.id)) return prev;
      purchased.push(item.id);

      let updatedArtifacts = prev.inventoryArtifacts ? [...prev.inventoryArtifacts] : [];
      let updatedItems = [...prev.inventoryItems];
      let updatedSkins = prev.unlockedDamageSkins ? [...prev.unlockedDamageSkins] : ['Default'];

      if (item.type === 'material' && item.materialId && item.materialCount) {
        // Add materials to inventory
        updatedItems = updatedItems.map(invItem => {
          if (invItem.id === item.materialId) {
            return { ...invItem, count: invItem.count + (item.materialCount || 0) };
          }
          return invItem;
        });
      } else if (item.type === 'artifact' && item.artifactSet && item.artifactSlot && item.artifactRarity) {
        // Create new artifact
        const newArt: Artifact = {
          id: `shop_art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: item.name,
          slot: item.artifactSlot,
          set: item.artifactSet,
          rarity: item.artifactRarity,
          isLocked: false
        };
        updatedArtifacts.push(newArt);
      } else if (item.type === 'skin' && item.skinId) {
        // Unlock damage skin
        if (!updatedSkins.includes(item.skinId)) {
          updatedSkins.push(item.skinId);
        }
      }

      onShowAlert(`Successfully purchased ${item.name}!`, `Spent ${item.price} Aether Gems.`, 'success');

      return {
        ...prev,
        aetherGems: currentGems,
        inventoryArtifacts: updatedArtifacts,
        inventoryItems: updatedItems,
        unlockedDamageSkins: updatedSkins,
        purchasedShopItemIds: purchased
      };
    });
  };

  return (
    <div className="bg-[#0b0f19]/70 border border-white/10 p-6 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md space-y-6">
      
      {/* Shop Header Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-2 font-display">
            <Coins className="w-4 h-4 text-[#fbbf24] animate-bounce" />
            Celestial Gems Shop
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">
            Exchange your earned Aether Gems for leveling materials, powerful artifacts, and rare combat damage skins.
          </p>
        </div>

        {/* Refresh Timer Display */}
        <div className="flex items-center gap-2 bg-black/45 px-3 py-1.5 rounded-lg border border-white/5 font-mono select-none">
          <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Refreshes In: <span className="text-indigo-300 font-extrabold">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {shopItems.map((item) => {
          const isPurchased = (saveState.purchasedShopItemIds || []).includes(item.id);
          const canAfford = saveState.aetherGems >= item.price;
          const isOwnedSkin = item.type === 'skin' && item.skinId && (saveState.unlockedDamageSkins || ['Default']).includes(item.skinId);
          
          let rarityColor = 'text-slate-400 bg-slate-500/5 border-slate-500/20';
          let glowColor = '';
          if (item.rarity === 'Legendary') {
            rarityColor = 'text-amber-400 bg-amber-500/5 border-amber-500/30';
            glowColor = 'shadow-[0_0_15px_rgba(251,191,36,0.1)]';
          } else if (item.rarity === 'Rare') {
            rarityColor = 'text-purple-400 bg-purple-500/5 border-purple-500/20';
            glowColor = 'shadow-[0_0_15px_rgba(168,85,247,0.05)]';
          } else {
            rarityColor = 'text-blue-400 bg-blue-500/5 border-blue-500/20';
          }

          let iconElement = <Layers className="w-6 h-6" />;
          if (item.type === 'material') {
            iconElement = <BookOpen className="w-6 h-6 text-emerald-400" />;
          } else if (item.type === 'skin') {
            if (item.skinId === 'Ice') iconElement = <Snowflake className="w-6 h-6 text-sky-400" />;
            else if (item.skinId === 'Void') iconElement = <Sparkle className="w-6 h-6 text-violet-500" />;
            else iconElement = <Sparkles className="w-6 h-6 text-amber-400" />;
          }

          return (
            <div 
              key={item.id} 
              className={`border rounded-xl p-4.5 flex flex-col justify-between space-y-4 transition-all relative ${
                isPurchased || isOwnedSkin
                  ? 'bg-black/25 border-white/5 opacity-55' 
                  : `bg-[#060811]/45 hover:bg-[#070b16]/65 border-white/10 hover:border-white/20 hover:scale-[1.01] ${glowColor}`
              }`}
            >
              {/* Rarity Tag */}
              <div className="flex justify-between items-start">
                <span className={`text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${rarityColor}`}>
                  {item.rarity}
                </span>
                
                {item.type === 'skin' && (
                  <span className="text-[7.5px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded-full">
                    Skin
                  </span>
                )}
              </div>

              {/* Central Item Display */}
              <div className="flex flex-col items-center text-center space-y-2 py-2">
                <div className="w-12 h-12 rounded-full bg-black/45 border border-white/5 flex items-center justify-center shadow-inner">
                  {iconElement}
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11.5px] font-black text-slate-200 uppercase tracking-tight line-clamp-1 leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-[9.5px] text-slate-400 line-clamp-2 h-7 leading-relaxed px-1">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Price & Purchase Footer */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center justify-center gap-1 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span className="text-xs font-black text-slate-200">{item.price.toLocaleString()}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider pl-0.5">Gems</span>
                </div>

                 {isPurchased ? (
                  <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Out of Stock
                  </div>
                ) : isOwnedSkin ? (
                  <button
                    disabled
                    className="w-full py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider font-mono cursor-not-allowed"
                  >
                    🔒 Owned
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    className={`w-full py-2 rounded-lg flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider cursor-pointer font-mono transition-all active:scale-95 ${
                      canAfford 
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20' 
                        : 'bg-black/30 border border-white/5 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Purchase
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
