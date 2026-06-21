import React from 'react';
import { Star, Trophy, Sparkles, Coins, Award, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface StoryRewardsProps {
  stageId: string;
  isHardMode: boolean;
  isFirstClear: boolean;
  starsEarned: number;
  deathsCount: number;
  durationSecs: number;
  gemsReward: number;
  moraReward: number;
  charXpReward: number;
  specialItem?: string;
  ascensionMaterialCount?: number;
  onProceed: () => void;
}

export default function StoryRewards({
  stageId,
  isHardMode,
  isFirstClear,
  starsEarned,
  deathsCount,
  durationSecs,
  gemsReward,
  moraReward,
  charXpReward,
  specialItem,
  ascensionMaterialCount,
  onProceed
}: StoryRewardsProps) {
  return (
    <div className="fixed inset-0 z-55 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-4 md:p-6 max-w-md w-full text-center space-y-4 md:space-y-6 shadow-[0_0_60px_rgba(251,191,36,0.15)] relative overflow-y-auto max-h-[90vh] md:max-h-none scrollbar-thin"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Triumphant Header Icon */}
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-400 mx-auto animate-bounce">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>

        {/* Clear title */}
        <div className="space-y-1">
          <h3 className="text-2xl md:text-3xl font-black text-amber-400 font-display tracking-widest uppercase">
            STAGE CLEARED!
          </h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
            Stage {stageId} {isHardMode ? 'Hard Mode' : 'Campaign'} Stabilized
          </p>
        </div>

        {/* Stars calculation display */}
        <div className="bg-black/45 p-4 rounded-xl border border-white/5 space-y-3">
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-8 h-8 ${
                  s <= starsEarned
                    ? 'text-amber-400 fill-amber-400 animate-pop-pulse'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Checklist breakdown */}
          <div className="text-left text-[11px] space-y-2 mt-2 font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span>⭐ Clear Stage (Victory)</span>
              <span className="text-emerald-400 font-bold uppercase">SUCCESS</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>⭐⭐ No Character Deaths</span>
              <span className={deathsCount === 0 ? 'text-emerald-400 font-bold uppercase' : 'text-slate-500 uppercase'}>
                {deathsCount === 0 ? 'SUCCESS' : `FAILED (${deathsCount} KO)`}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>⭐⭐⭐ Under 1 Minute</span>
              <span className={durationSecs < 60 ? 'text-emerald-400 font-bold uppercase' : 'text-slate-500 uppercase'}>
                {durationSecs < 60 ? `SUCCESS (${durationSecs}s)` : `FAILED (${durationSecs}s)`}
              </span>
            </div>
          </div>
        </div>

        {/* Rewards grid */}
        <div className="space-y-2.5">
          <span className="text-[9.5px] text-slate-500 uppercase font-black tracking-widest block font-mono">
            {isFirstClear ? '🎁 First Clear Payout:' : 'Reclear Drops:'}
          </span>
          
          <div className="grid grid-cols-2 gap-2 text-left">
            {gemsReward > 0 && (
              <div className="bg-slate-950/60 border border-sky-500/10 p-2.5 rounded-lg flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase">Gems</span>
                  <span className="font-extrabold text-sky-400 text-sm">+{gemsReward}</span>
                </div>
              </div>
            )}
            <div className="bg-slate-950/60 border border-amber-500/10 p-2.5 rounded-lg flex items-center gap-2 text-xs">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">Mora</span>
                <span className="font-extrabold text-amber-400 text-sm">+{moraReward.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-slate-950/60 border border-indigo-500/10 p-2.5 rounded-lg flex items-center gap-2 text-xs col-span-2">
              <Award className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">Character XP (Hero's Wit)</span>
                <span className="font-extrabold text-indigo-400 text-sm">+{charXpReward} Books</span>
              </div>
            </div>
            {isFirstClear && (ascensionMaterialCount || 0) > 0 && (
              <div className="bg-slate-950/60 border border-purple-500/10 p-2.5 rounded-lg flex items-center gap-2 text-xs col-span-2">
                <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase">Ascension Materials</span>
                  <span className="font-extrabold text-purple-400 text-sm">+{ascensionMaterialCount} Spore Catalysts</span>
                </div>
              </div>
            )}
            {isFirstClear && specialItem && (
              <div className="bg-slate-950/60 border border-rose-500/10 p-2.5 rounded-lg flex items-center gap-2 text-xs col-span-2">
                <Trophy className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase">Special Core Item</span>
                  <span className="font-extrabold text-rose-400 text-xs truncate block max-w-[280px]">{specialItem}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={onProceed}
          className="w-full p-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-95"
        >
          Confirm & Proceed
        </button>
      </motion.div>
    </div>
  );
}
