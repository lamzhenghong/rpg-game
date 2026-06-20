import React from 'react';
import { Sword, Zap, Sparkles, RefreshCw, ShieldAlert } from 'lucide-react';

interface MobileControlsProps {
  onAttack: () => void;
  onSkill: () => void;
  onUltimate: () => void;
  onDodge: () => void;
  onParry: () => void;
  skillCooldown: number;
  dodgeCooldown: number;
  parryCooldown: number;
  ultimateEnergy: number;
  ultimateMaxEnergy: number;
  activeElement: string;
}

export default function MobileControls({
  onAttack,
  onSkill,
  onUltimate,
  onDodge,
  onParry,
  skillCooldown,
  dodgeCooldown,
  parryCooldown,
  ultimateEnergy,
  ultimateMaxEnergy,
  activeElement
}: MobileControlsProps) {
  
  // Element colors helper
  const getElementColorHex = (elem: string) => {
    switch (elem) {
      case 'Pyro': return '#ef4444'; // red-500
      case 'Hydro': return '#06b6d4'; // cyan-500
      case 'Cryo': return '#38bdf8'; // sky-400
      case 'Electro': return '#a855f7'; // purple-500
      case 'Anemo': return '#2dd4bf'; // teal-400
      case 'Geo': return '#f59e0b'; // amber-500
      case 'Dendro': return '#10b981'; // emerald-500
      default: return '#6366f1'; // indigo-500
    }
  };

  const elemColor = getElementColorHex(activeElement);
  const ultReady = ultimateEnergy >= ultimateMaxEnergy;
  const ultPercent = Math.min(100, Math.round((ultimateEnergy / ultimateMaxEnergy) * 100));

  // Helper to trigger actions immediately on pointer down for fast responsive gaming
  const handleAction = (e: React.PointerEvent<HTMLButtonElement>, callback: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    callback();
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 select-none touch-none w-64 h-64 flex items-center justify-center pointer-events-auto"
      onPointerDown={(e) => e.stopPropagation()} // Stop propagation to canvas
    >
      {/* 1. Attack Button (Center-right, largest) */}
      <button
        onPointerDown={(e) => handleAction(e, onAttack)}
        className="absolute bottom-4 right-4 w-20 h-20 bg-slate-900/80 border-2 border-white/20 active:bg-white/20 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform cursor-pointer overflow-hidden"
        style={{
          boxShadow: `0 0 20px rgba(255, 255, 255, 0.1)`,
          touchAction: 'none'
        }}
      >
        <Sword className="w-9 h-9 text-slate-100" />
      </button>

      {/* 2. Ultimate Burst Button (Top-right of Attack) */}
      <button
        onPointerDown={(e) => handleAction(e, onUltimate)}
        className={`absolute bottom-[136px] right-[30px] w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer border overflow-hidden`}
        style={{
          backgroundColor: ultReady ? '#eab308' : 'rgba(15, 23, 42, 0.85)',
          borderColor: ultReady ? '#fef08a' : 'rgba(255, 255, 255, 0.15)',
          boxShadow: ultReady ? '0 0 20px rgba(234, 179, 8, 0.5)' : 'none',
          color: ultReady ? '#0f172a' : '#94a3b8',
          touchAction: 'none'
        }}
      >
        <Sparkles className={`w-5 h-5 ${ultReady ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        <span className="text-[7.5px] font-mono font-black mt-0.5">{ultPercent}%</span>
      </button>

      {/* 3. Elemental Skill Button (Top-left of Attack) */}
      <button
        onPointerDown={(e) => {
          if (skillCooldown <= 0) {
            handleAction(e, onSkill);
          } else {
            e.stopPropagation();
          }
        }}
        disabled={skillCooldown > 0}
        className="absolute bottom-[136px] right-[96px] w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer border relative overflow-hidden bg-slate-900/85 disabled:opacity-50"
        style={{
          borderColor: skillCooldown > 0 ? 'rgba(255,255,255,0.05)' : `${elemColor}66`,
          color: skillCooldown > 0 ? '#64748b' : elemColor,
          boxShadow: skillCooldown > 0 ? 'none' : `0 0 15px ${elemColor}25`,
          touchAction: 'none'
        }}
      >
        <Zap className="w-5 h-5" />
        <span className="text-[8px] font-mono font-bold mt-0.5">SKILL</span>
        {skillCooldown > 0 && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-xs font-mono font-black text-red-400">
            {Math.ceil(skillCooldown)}s
          </div>
        )}
      </button>

      {/* 4. Dash/Dodge Button (Bottom-left of Attack) */}
      <button
        onPointerDown={(e) => {
          if (dodgeCooldown <= 0) {
            handleAction(e, onDodge);
          } else {
            e.stopPropagation();
          }
        }}
        disabled={dodgeCooldown > 0}
        className="absolute bottom-4 right-[96px] w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer border relative overflow-hidden bg-slate-900/85 disabled:opacity-50"
        style={{
          borderColor: dodgeCooldown > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.4)',
          color: dodgeCooldown > 0 ? '#64748b' : '#34d399',
          boxShadow: dodgeCooldown > 0 ? 'none' : '0 0 15px rgba(16, 185, 129, 0.15)',
          touchAction: 'none'
        }}
      >
        <RefreshCw className="w-5 h-5" />
        <span className="text-[8px] font-mono font-bold mt-0.5">DASH</span>
        {dodgeCooldown > 0 && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-xs font-mono font-black text-red-400">
            {Math.ceil(dodgeCooldown)}s
          </div>
        )}
      </button>

      {/* 5. Parry/Block Button (Center-left/bottom-center of Attack) */}
      <button
        onPointerDown={(e) => {
          if (parryCooldown <= 0) {
            handleAction(e, onParry);
          } else {
            e.stopPropagation();
          }
        }}
        disabled={parryCooldown > 0}
        className="absolute bottom-[76px] right-[96px] w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer border relative overflow-hidden bg-slate-900/85 disabled:opacity-50"
        style={{
          borderColor: parryCooldown > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(6, 182, 212, 0.4)',
          color: parryCooldown > 0 ? '#64748b' : '#22d3ee',
          boxShadow: parryCooldown > 0 ? 'none' : '0 0 15px rgba(6, 182, 212, 0.15)',
          touchAction: 'none'
        }}
      >
        <ShieldAlert className="w-5 h-5" />
        <span className="text-[8px] font-mono font-bold mt-0.5">PARRY</span>
        {parryCooldown > 0 && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-xs font-mono font-black text-red-400">
            {Math.ceil(parryCooldown)}s
          </div>
        )}
      </button>
    </div>
  );
}
