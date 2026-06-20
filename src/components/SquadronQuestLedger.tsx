import React, { useState } from 'react';
import { Quest } from '../types';
import { CheckCircle2, Circle, Sparkles, Coins, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AetheriaAudioEngine } from '../utils/audio';

interface SquadronQuestLedgerProps {
  activeQuests: Quest[];
  onClaimQuestReward: (questId: string) => void;
  onClaimAllQuestRewards: () => void;
  layout: 'sidebar' | 'full';
}

export default function SquadronQuestLedger({ activeQuests, onClaimQuestReward, onClaimAllQuestRewards, layout }: SquadronQuestLedgerProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'normal'>('daily');

  const dailyQuests = activeQuests.filter(q => q.group === 'daily');
  const weeklyQuests = activeQuests.filter(q => q.group === 'weekly');
  const campaignQuests = activeQuests.filter(q => q.group === 'normal' || !q.group);

  const getFilteredQuests = () => {
    if (activeTab === 'daily') return dailyQuests;
    if (activeTab === 'weekly') return weeklyQuests;
    return campaignQuests;
  };

  const getTabCount = (tab: 'daily' | 'weekly' | 'normal') => {
    if (tab === 'daily') return dailyQuests.length;
    if (tab === 'weekly') return weeklyQuests.length;
    return campaignQuests.length;
  };

  const currentQuests = getFilteredQuests();
  const claimableCount = activeQuests.filter(q => q.completed).length;

  const handleTabClick = (tab: 'daily' | 'weekly' | 'normal') => {
    setActiveTab(tab);
    AetheriaAudioEngine.playClick();
  };

  if (layout === 'sidebar') {
    return (
      <div className="bg-[#0b0f19]/70 border-l-4 border-l-amber-400 border-y border-r border-white/10 p-5 rounded-r-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-amber-400 rounded-sm"></div>
            <h3 className="text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none font-display">
              Squadron Quest Ledger ({activeQuests.length} Remaining)
            </h3>
          </div>
          {claimableCount > 0 ? (
            <button
              onClick={() => {
                onClaimAllQuestRewards();
                AetheriaAudioEngine.playClick();
              }}
              className="text-[8px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider transition-all duration-100 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_8px_rgba(52,211,153,0.3)] animate-pulse"
            >
              CLAIM ALL ({claimableCount})
            </button>
          ) : (
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-mono">
              No Claims
            </span>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-black/40 border border-white/5 p-1 rounded-lg gap-1">
          {(['daily', 'weekly', 'normal'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'daily' ? 'DAILY' : tab === 'weekly' ? 'WEEKLY' : 'CAMPAIGN';
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 py-1.5 text-[9px] font-black rounded uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-202 hover:bg-white/5'
                }`}
              >
                {label} ({getTabCount(tab)})
              </button>
            );
          })}
        </div>

        {/* Quest List */}
        <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {currentQuests.map((q) => {
              const pct = Math.min(100, (q.currentValue / q.targetValue) * 100);
              const isDaily = q.group === 'daily';
              const isWeekly = q.group === 'weekly';

              return (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 bg-black/40 rounded-lg border border-white/5 flex flex-col gap-2 relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      {/* Difficulty Badge */}
                      {isDaily && (
                        <span className="inline-block text-[8px] font-black tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-1 py-0.2 rounded-sm uppercase">
                          Easy Daily
                        </span>
                      )}
                      {isWeekly && (
                        <span className="inline-block text-[8px] font-black tracking-wider text-indigo-400 bg-indigo-950/20 border border-indigo-500/20 px-1 py-0.2 rounded-sm uppercase">
                          Medium Weekly
                        </span>
                      )}
                      {!isDaily && !isWeekly && (
                        <span className="inline-block text-[8px] font-black tracking-wider text-rose-400 bg-rose-950/20 border border-rose-500/20 px-1 py-0.2 rounded-sm uppercase">
                          Hard Campaign
                        </span>
                      )}

                      <span className="text-[10.5px] font-black text-slate-100 block leading-tight uppercase font-display tracking-wide">
                        {q.name.toUpperCase()}
                      </span>
                      <span className="text-[9.5px] text-slate-400 leading-normal block">
                        {q.desc}
                      </span>
                    </div>

                    {q.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-1" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-700 shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Progress bar info */}
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 mt-1">
                    <div className="bg-slate-950 rounded-sm flex-1 h-2 overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-350"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-bold font-mono text-slate-200 shrink-0">
                      {q.currentValue.toLocaleString()}/{q.targetValue.toLocaleString()}
                    </span>
                  </div>

                  {/* Claim reward link */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <div className="text-[8.5px] text-slate-400 flex items-center gap-1.5 font-sans leading-none">
                      <span className="uppercase text-[8px] tracking-wider text-slate-500">REWARDS:</span>
                      <span className="text-sky-400 font-bold flex items-center gap-0.5">
                        +{q.rewardTokens}G
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        +{q.rewardMora.toLocaleString()} Mora
                      </span>
                    </div>

                    {q.completed ? (
                      <button
                        onClick={() => onClaimQuestReward(q.id)}
                        className="bg-amber-400 hover:bg-amber-350 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        CLAIM NOW
                      </button>
                    ) : (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {currentQuests.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              All quests in this category completed!
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full Screen / Wide Layout (for Quest tab)
  return (
    <div className="bg-[#0b0f19]/80 border border-white/10 p-6 md:p-8 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-6 bg-amber-400 rounded-sm shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
          <div>
            <h2 className="text-xl font-black text-[#f8fafc] uppercase tracking-widest leading-none font-display flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Squadron Quest Ledger
            </h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">
              Active Objectives Remaining: {activeQuests.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {claimableCount > 0 && (
            <button
              onClick={() => {
                onClaimAllQuestRewards();
                AetheriaAudioEngine.playClick();
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-lg uppercase tracking-wider transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.35)] flex items-center gap-1.5 animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              CLAIM ALL REWARDS ({claimableCount})
            </button>
          )}
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex bg-black/45 border border-white/10 p-1.5 rounded-xl gap-2 w-full max-w-lg">
        {(['daily', 'weekly', 'normal'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'daily' ? 'DAILY' : tab === 'weekly' ? 'WEEKLY' : 'CAMPAIGN';
          return (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 py-2.5 px-4 text-xs font-black rounded-lg uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                  : 'text-slate-400 hover:text-slate-202 hover:bg-white/5'
              }`}
            >
              <span>{label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono ${isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-white/5 text-slate-400'}`}>
                {getTabCount(tab)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quest Cards Grid */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {currentQuests.map((q) => {
            const pct = Math.min(100, (q.currentValue / q.targetValue) * 100);
            const isDaily = q.group === 'daily';
            const isWeekly = q.group === 'weekly';

            return (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="p-5 bg-black/40 rounded-xl border border-white/5 flex flex-col gap-4 relative overflow-hidden group hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      {/* Difficulty Badge */}
                      {isDaily && (
                        <span className="text-[9px] font-black tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                          Easy Daily
                        </span>
                      )}
                      {isWeekly && (
                        <span className="text-[9px] font-black tracking-wider text-indigo-400 bg-indigo-950/20 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
                          Medium Weekly
                        </span>
                      )}
                      {!isDaily && !isWeekly && (
                        <span className="text-[9px] font-black tracking-wider text-rose-400 bg-rose-950/20 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                          Hard Campaign
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide font-display flex items-center gap-1.5 mt-1">
                      {q.name.toUpperCase()}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                      {q.desc}
                    </p>
                  </div>

                  {q.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Progress bar info */}
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="bg-slate-950 rounded-full flex-1 h-2.5 overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-350"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-bold font-mono text-slate-200 shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                    {q.currentValue.toLocaleString()} / {q.targetValue.toLocaleString()}
                  </span>
                </div>

                {/* Claim reward link */}
                <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-1">
                  <div className="text-xs text-slate-400 flex items-center gap-2 font-sans leading-none">
                    <span className="uppercase text-[10px] tracking-wider text-slate-500 font-bold">REWARDS:</span>
                    <span className="text-sky-400 font-black flex items-center gap-1 bg-sky-950/20 border border-sky-500/10 px-2.5 py-1 rounded font-mono">
                      <Sparkles className="w-3 h-3" /> +{q.rewardTokens}G
                    </span>
                    <span className="text-slate-605 font-bold">•</span>
                    <span className="text-amber-400 font-black flex items-center gap-1 bg-amber-950/20 border border-amber-500/10 px-2.5 py-1 rounded font-mono">
                      <Coins className="w-3 h-3" /> +{q.rewardMora.toLocaleString()} Mora
                    </span>
                  </div>

                  {q.completed ? (
                    <button
                      onClick={() => onClaimQuestReward(q.id)}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-5 py-2.5 rounded-lg uppercase tracking-wider transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.35)]"
                    >
                      CLAIM NOW
                    </button>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-lg">
                      IN PROGRESS
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {currentQuests.length === 0 && (
          <div className="text-center py-20 text-slate-500 text-sm italic border border-dashed border-white/5 rounded-xl bg-black/20">
            ☀️ All quests in this category have been successfully resolved!
          </div>
        )}
      </div>
    </div>
  );
}
