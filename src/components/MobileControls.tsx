import React from 'react';
import { Sword, Zap, Sparkles, RefreshCw, ShieldAlert } from 'lucide-react';

interface MobileControlsProps {
  onAttack: () => void;
  onSkill: () => void;
  onUltimate: () => void;
  onDodge: () => void;
  onParry: () => void;
  onParryEnd?: () => void;
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
  onParryEnd,
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
      className="fixed bottom-4 right-4 z-50 select-none touch-none w-56 h-56 pointer-events-auto"
      onPointerDown={(e) => e.stopPropagation()} // Stop propagation to canvas
    >
      {/* 1. Attack Button (Center, largest) */}
      <button
        onPointerDown={(e) => handleAction(e, onAttack)}
        className="absolute bg-[#0d131f]/80 border border-white/20 active:bg-white/10 text-white rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer overflow-hidden z-20"
        style={{
          width: '72px',
          height: '72px',
          top: '76px',
          left: '76px',
          boxShadow: `0 0 12px rgba(255, 255, 255, 0.15), inset 0 0 8px rgba(255, 255, 255, 0.05)`,
          touchAction: 'none'
        }}
      >
        <Sword className="w-8 h-8 text-slate-100" />
      </button>

      {/* 2. Elemental Skill Button (Top) */}
      <button
        onPointerDown={(e) => {
          if (skillCooldown <= 0) {
            handleAction(e, onSkill);
          } else {
            e.stopPropagation();
          }
        }}
        disabled={skillCooldown > 0}
        className="absolute rounded-full flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer border relative overflow-hidden bg-[#0d131f]/80 disabled:opacity-50 z-20"
        style={{
          width: '48px',
          height: '48px',
          top: '22px',
          left: '88px',
          borderColor: skillCooldown > 0 ? 'rgba(255,255,255,0.05)' : `${elemColor}80`,
          color: skillCooldown > 0 ? '#64748b' : elemColor,
          boxShadow: skillCooldown > 0 ? 'none' : `0 0 15px ${elemColor}40, inset 0 0 8px ${elemColor}15`,
          touchAction: 'none'
        }}
      >
        <Zap className="w-4 h-4" />
        <span className="text-[7.5px] font-bold mt-0.5 tracking-wider">SKILL</span>
        {skillCooldown > 0 && (
          <div className="absolute inset-0 bg-[#0d131f]/90 flex items-center justify-center text-xs font-mono font-black text-red-400">
            {Math.ceil(skillCooldown)}s
          </div>
        )}
      </button>

      {/* 3. Parry/Block Button (Left) */}
      <button
        onPointerDown={(e) => {
          if (parryCooldown <= 0) {
            handleAction(e, onParry);
          } else {
            e.stopPropagation();
          }
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onParryEnd?.();
        }}
        onPointerCancel={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onParryEnd?.();
        }}
        disabled={parryCooldown > 0}
        className="absolute rounded-full flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer border relative overflow-hidden bg-[#0d131f]/80 disabled:opacity-50 z-20"
        style={{
          width: '48px',
          height: '48px',
          top: '88px',
          left: '22px',
          borderColor: parryCooldown > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(6, 182, 212, 0.6)',
          color: parryCooldown > 0 ? '#64748b' : '#22d3ee',
          boxShadow: parryCooldown > 0 ? 'none' : '0 0 15px rgba(6, 182, 212, 0.4), inset 0 0 8px rgba(6, 182, 212, 0.1)',
          touchAction: 'none'
        }}
      >
        <ShieldAlert className="w-4 h-4" />
        <span className="text-[7.5px] font-bold mt-0.5 tracking-wider">PARRY</span>
        {parryCooldown > 0 && (
          <div className="absolute inset-0 bg-[#0d131f]/90 flex items-center justify-center text-xs font-mono font-black text-red-400">
            {Math.ceil(parryCooldown)}s
          </div>
        )}
      </button>

      {/* 4. Dash/Dodge Button (Bottom) */}
      <button
        onPointerDown={(e) => {
          if (dodgeCooldown <= 0) {
            handleAction(e, onDodge);
          } else {
            e.stopPropagation();
          }
        }}
        disabled={dodgeCooldown > 0}
        className="absolute rounded-full flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer border relative overflow-hidden bg-[#0d131f]/80 disabled:opacity-50 z-20"
        style={{
          width: '48px',
          height: '48px',
          top: '154px',
          left: '88px',
          borderColor: dodgeCooldown > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.6)',
          color: dodgeCooldown > 0 ? '#64748b' : '#34d399',
          boxShadow: dodgeCooldown > 0 ? 'none' : '0 0 15px rgba(16, 185, 129, 0.4), inset 0 0 8px rgba(16, 185, 129, 0.1)',
          touchAction: 'none'
        }}
      >
        <RefreshCw className="w-4 h-4" />
        <span className="text-[7.5px] font-bold mt-0.5 tracking-wider">DASH</span>
        {dodgeCooldown > 0 && (
          <div className="absolute inset-0 bg-[#0d131f]/90 flex items-center justify-center text-xs font-mono font-black text-red-400">
            {Math.ceil(dodgeCooldown)}s
          </div>
        )}
      </button>

      {/* 5. Ultimate Burst Button (Right) */}
      <button
        onPointerDown={(e) => handleAction(e, onUltimate)}
        className="absolute rounded-full flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer border relative overflow-hidden bg-[#0d131f]/80 z-20"
        style={{
          width: '48px',
          height: '48px',
          top: '88px',
          left: '154px',
          borderColor: ultReady ? '#eab308' : 'rgba(255, 255, 255, 0.3)',
          color: ultReady ? '#fbbf24' : '#e2e8f0',
          boxShadow: ultReady 
            ? '0 0 15px rgba(234, 179, 8, 0.4), inset 0 0 8px rgba(234, 179, 8, 0.1)' 
            : '0 0 12px rgba(255, 255, 255, 0.15), inset 0 0 6px rgba(255, 255, 255, 0.05)',
          touchAction: 'none'
        }}
      >
        <Sparkles className={`w-4 h-4 ${ultReady ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        <span className="text-[7.5px] font-bold mt-0.5 tracking-wider">{ultPercent}%</span>
      </button>

      {/* Directional arrow pointer overlays pointing to center Attack button */}
      {/* Skill pointer down arrow */}
      <div 
        className="absolute top-[71px] left-[108px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] z-10 pointer-events-none" 
        style={{ borderTopColor: skillCooldown > 0 ? 'rgba(255, 255, 255, 0.2)' : elemColor }}
      />
      {/* Dash pointer up arrow */}
      <div 
        className="absolute top-[148px] left-[108px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-emerald-400/80 z-10 pointer-events-none" 
      />
      {/* Parry pointer right arrow */}
      <div 
        className="absolute top-[108px] left-[71px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-cyan-400/80 z-10 pointer-events-none" 
      />
      {/* Ultimate pointer left arrow */}
      <div 
        className="absolute top-[108px] left-[148px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-white/80 z-10 pointer-events-none" 
      />
    </div>
  );
}
