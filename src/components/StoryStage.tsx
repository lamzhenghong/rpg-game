import React from 'react';
import { StoryStageSpec, getStageSpec } from '../data/storyStages';
import { Star, X, ShieldAlert, Award, Swords, Sparkles, Coins } from 'lucide-react';
import { motion } from 'motion/react';

interface StoryStageProps {
  stageId: string;
  previousStars: number;
  onDeploy: (stageId: string, isHardMode: boolean) => void;
  onClose: () => void;
  isHardMode: boolean;
}

export default function StoryStage({ stageId, previousStars, onDeploy, onClose, isHardMode }: StoryStageProps) {
  const spec = getStageSpec(stageId);

  // Hard mode adjustments
  const recommendedLvl = isHardMode ? spec.recommendedLevel + 20 : spec.recommendedLevel;
  const gemsReward = isHardMode ? 0 : spec.firstClearRewards.gems; // Hard mode gets 2x mora/xp, no first clear gems
  const moraReward = isHardMode ? spec.firstClearRewards.mora * 2 : spec.firstClearRewards.mora;
  const charXpReward = isHardMode ? spec.firstClearRewards.charXp * 2 : spec.firstClearRewards.charXp;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-white/10 rounded-2xl p-4 md:p-6 max-w-md w-full shadow-[0_0_50px_rgba(99,102,241,0.2)] space-y-4 md:space-y-6 relative overflow-y-auto max-h-[90vh] md:max-h-none scrollbar-thin"
      >
        {/* Glow corner decorations */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center gap-2">
            <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${
              spec.difficulty === 'Boss' 
                ? 'bg-rose-950/60 border border-rose-500/40 text-rose-400' 
                : 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-400'
            }`}>
              {spec.difficulty === 'Boss' ? '👿 BOSS STAGE' : '⚔️ NORMAL STAGE'}
            </span>
            {isHardMode && (
              <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded bg-red-950 border border-red-500 text-red-300">
                🔴 HARD MODE
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
            {stageId} {spec.name}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5">
            {spec.desc}
          </p>
        </div>

        {/* Stats Summary Section */}
        <div className="grid grid-cols-2 gap-3.5 bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Recommended:</span>
            <span className="font-extrabold text-amber-400 text-sm">LV.{recommendedLvl}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Stars Earned:</span>
            <div className="flex gap-0.5 items-center mt-0.5">
              {[1, 2, 3].map((s) => (
                <Star 
                  key={s} 
                  className={`w-4 h-4 ${s <= previousStars ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-600'}`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Star Objectives list */}
        <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-white/5">
          <span className="text-[9.5px] text-slate-500 uppercase font-black tracking-widest block font-mono border-b border-white/5 pb-1">Stage Objectives:</span>
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center gap-2 text-xs">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-slate-200">Clear Stage (Victory)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex gap-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-slate-200">No Character Deaths</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex gap-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-slate-200">Finish under 1 minute</span>
            </div>
          </div>
        </div>

        {/* First Clear Rewards */}
        <div className="space-y-2">
          <span className="text-[9.5px] text-slate-500 uppercase font-black tracking-widest block font-mono">
            {isHardMode ? 'Stage Clear Drops:' : 'First Clear Rewards:'}
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {!isHardMode && gemsReward > 0 && (
              <div className="bg-[#0b1529] border border-sky-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs text-slate-200 shadow-sm shadow-sky-500/5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-sky-400">+{gemsReward}</span>
                <span className="text-[10px] text-slate-400">Gems</span>
              </div>
            )}
            <div className="bg-[#0b1529] border border-amber-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs text-slate-200 shadow-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-amber-400">+{moraReward.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">Mora</span>
            </div>
            <div className="bg-[#0b1529] border border-indigo-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs text-slate-200 shadow-sm">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-indigo-400">+{charXpReward}</span>
              <span className="text-[10px] text-slate-400">Hero's Wit</span>
            </div>
            {!isHardMode && spec.firstClearRewards.specialItem && (
              <div className="bg-[#1e112c] border border-purple-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs text-slate-200 shadow-sm w-full">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-purple-300 truncate">{spec.firstClearRewards.specialItem}</span>
                <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-500/30 px-1 py-0.5 rounded leading-none shrink-0 font-bold">1x UNIQUE</span>
              </div>
            )}
          </div>
        </div>

        {/* Deploy Action */}
        <button
          onClick={() => onDeploy(stageId, isHardMode)}
          className="w-full p-4 bg-indigo-600 hover:bg-indigo-550 active:scale-98 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2"
        >
          <Swords className="w-4 h-4 text-white" />
          <span>START STORY BATTLE</span>
        </button>
      </motion.div>
    </div>
  );
}
