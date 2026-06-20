import React from 'react';
import { X, Sparkles, Flame, Droplet, Snowflake, Zap, Wind, ShieldAlert, Leaf } from 'lucide-react';
import { ElementType } from '../types';

interface ReactionDetails {
  name: string;
  elements: ElementType[];
  multiplier: string;
  effect: string;
  desc: string;
  colorClass: string;
  badgeBorder: string;
}

const REACTIONS_LIST: ReactionDetails[] = [
  {
    name: 'Vaporize',
    elements: ['Hydro', 'Pyro'],
    multiplier: '2.0x Damage Multiplier',
    effect: 'Thermal Vaporization',
    desc: 'Amplifies the triggering attack to deal double damage. Highly effective for breaking single-target thermal nodes.',
    colorClass: 'from-orange-500/20 to-red-500/25 text-orange-400',
    badgeBorder: 'border-orange-500/30'
  },
  {
    name: 'Frozen',
    elements: ['Hydro', 'Cryo'],
    multiplier: 'Incapacitation',
    effect: 'Deep Freeze (3.5s Stun)',
    desc: 'Locks the enemy in ice, completely incapacitating them. Frozen targets can be shattered by other dynamic elements.',
    colorClass: 'from-sky-500/20 to-blue-500/25 text-sky-400',
    badgeBorder: 'border-sky-500/30'
  },
  {
    name: 'Hyper-Shatter',
    elements: ['Cryo', 'Hydro', 'Anemo'],
    multiplier: '2.6x Damage + Splash',
    effect: 'Infrasonic Shatter & Secondary Freeze',
    desc: 'Striking a frozen target with heavy elements (Anemo, Geo, Pyro, Electro) shatters the ice, dealing 2.6x damage and freezing adjacent slimes.',
    colorClass: 'from-cyan-400/20 to-indigo-500/25 text-cyan-300',
    badgeBorder: 'border-cyan-400/30 font-extrabold'
  },
  {
    name: 'Bloom Eruption',
    elements: ['Hydro', 'Dendro'],
    multiplier: '+750 Flat Damage',
    effect: 'Botanical Grass Rupture',
    desc: 'Spawns a rapid botanical seed core that bursts, dealing 750 trigger damage to the enemy and 450 splash damage to nearby enemies.',
    colorClass: 'from-green-500/20 to-emerald-500/25 text-emerald-400',
    badgeBorder: 'border-emerald-500/30'
  },
  {
    name: 'Hyperbloom Quasar',
    elements: ['Hydro', 'Dendro', 'Electro'],
    multiplier: '2.3x Damage + Chains',
    effect: 'Conductive Spark Chaining',
    desc: 'Triggers lightning sparks from botanical cores, dealing 2.3x damage to the target and propagating chain-shocks to up to 3 adjacent slimes.',
    colorClass: 'from-teal-500/20 to-purple-500/25 text-teal-300',
    badgeBorder: 'border-teal-400/30'
  },
  {
    name: 'Overloaded',
    elements: ['Pyro', 'Electro'],
    multiplier: '+400 Flat Damage',
    effect: 'Kinetic Shockwave + Knockback',
    desc: 'Triggers a heat-energy explosion that flings the target outward, disrupting coordinate attacks and pushing back crowds.',
    colorClass: 'from-pink-500/20 to-rose-500/25 text-pink-400',
    badgeBorder: 'border-pink-500/30'
  },
  {
    name: 'Superconduct',
    elements: ['Cryo', 'Electro'],
    multiplier: '+200 Flat Damage',
    effect: 'Armor Shred (Steel Weakening)',
    desc: 'Emits a frost surge that weakens target defense systems, amplifying standard steel-sword and dynamic strikes.',
    colorClass: 'from-purple-500/20 to-fuchsia-500/25 text-purple-400',
    badgeBorder: 'border-purple-500/30'
  },
  {
    name: 'Burning',
    elements: ['Dendro', 'Pyro'],
    multiplier: 'Continuous Ticking',
    effect: 'Thermal Ignite (120 Frame Burn)',
    desc: 'Ignites the targets inside a loop, applying fire damage over time to melt down larger slimes.',
    colorClass: 'from-rose-500/20 to-red-600/25 text-red-400',
    badgeBorder: 'border-rose-500/30'
  },
  {
    name: 'Crystallize',
    elements: ['Geo'],
    multiplier: 'Durable Ward Drop',
    effect: 'Durable Shield Crystal Protection',
    desc: 'Colliding Geo with Pyro, Hydro, Electro, or Cryo crystallization nodes drops protective crystals that grant a dynamic barrier.',
    colorClass: 'from-amber-500/20 to-yellow-600/25 text-amber-400',
    badgeBorder: 'border-amber-500/30'
  },
  {
    name: 'Swirl Splash',
    elements: ['Anemo'],
    multiplier: 'Aoe Debuff Spreading',
    effect: 'Aerodynamic Vector Propagation',
    desc: 'Swirl spreads the target\'s existing element condition to all nearby slimes, preparing them for grand reaction chainings.',
    colorClass: 'from-emerald-400/20 to-teal-500/25 text-emerald-300',
    badgeBorder: 'border-emerald-400/30'
  },
  {
    name: 'Melt',
    elements: ['Cryo', 'Pyro'],
    multiplier: '2.0x Damage Multiplier',
    effect: 'Thermal Liquefaction',
    desc: 'Melts Cryo armor or targets with Pyro heat, amplifying the triggering attack to deal double damage.',
    colorClass: 'from-orange-500/20 to-yellow-600/25 text-orange-350',
    badgeBorder: 'border-orange-400/30'
  },
  {
    name: 'Electro-Charged',
    elements: ['Hydro', 'Electro'],
    multiplier: '+300 Flat Damage + Chains',
    effect: 'Continuous Electrical Discharge',
    desc: 'Electrifies a wet target, dealing additional damage and propagating chain-shocks to up to 3 adjacent slimes.',
    colorClass: 'from-purple-500/20 to-blue-500/25 text-indigo-400',
    badgeBorder: 'border-indigo-400/30'
  }
];

interface ElementalReactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ElementalReactionsModal({ isOpen, onClose }: ElementalReactionsModalProps) {
  if (!isOpen) return null;

  const getElementIcon = (element: ElementType) => {
    switch (element) {
      case 'Pyro': return <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />;
      case 'Hydro': return <Droplet className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'Cryo': return <Snowflake className="w-3.5 h-3.5 text-sky-300 shrink-0" />;
      case 'Electro': return <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'Anemo': return <Wind className="w-3.5 h-3.5 text-emerald-300 shrink-0" />;
      case 'Geo': return <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'Dendro': return <Leaf className="w-3.5 h-3.5 text-green-400 shrink-0" />;
      default: return null;
    }
  };

  const getElementBadgeColor = (element: ElementType) => {
    switch (element) {
      case 'Pyro': return 'bg-red-950/40 text-red-400 border border-red-500/20';
      case 'Hydro': return 'bg-blue-950/40 text-blue-400 border border-blue-500/20';
      case 'Cryo': return 'bg-sky-950/40 text-sky-300 border border-sky-400/25';
      case 'Electro': return 'bg-purple-950/40 text-purple-400 border border-purple-500/20';
      case 'Anemo': return 'bg-emerald-950/40 text-emerald-300 border border-emerald-400/25';
      case 'Geo': return 'bg-amber-950/40 text-amber-400 border border-amber-500/20';
      case 'Dendro': return 'bg-green-950/40 text-green-400 border border-green-500/20';
      default: return 'bg-white/5 text-slate-350';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#111625] to-[#070911] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(99,102,241,0.25)] flex flex-col max-h-[85vh] overflow-hidden"
        id="reactions_cheat_sheet_modal_body"
      >
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-center pb-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 animate-pulse">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-100 uppercase tracking-widest font-display">
                Elemental Reaction Matrix
              </h3>
              <p className="text-xs text-slate-400 font-mono uppercase mt-0.5">
                Scientific Combat Ledger & Formula Multiplication Cheat-Sheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all duration-150"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scrolling Content */}
        <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-6">
          
          {/* Reaction Grid list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REACTIONS_LIST.map((rx, idx) => (
              <div 
                key={idx}
                className={`p-5 rounded-xl bg-gradient-to-br ${rx.colorClass} border ${rx.badgeBorder} shadow-lg space-y-3 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-2">
                    <div>
                      <h4 className="text-base font-black uppercase tracking-wider font-display">
                        {rx.name}
                      </h4>
                      <p className="text-[11px] font-mono uppercase text-slate-400 mt-0.5">
                        {rx.effect}
                      </p>
                    </div>
                    {/* Elements loop */}
                    <div className="flex items-center gap-1 bg-black/45 px-2 py-1 rounded-lg border border-white/10 shrink-0">
                      {rx.elements.map((el, i) => (
                        <div 
                          key={i} 
                          title={el}
                          className={`flex items-center gap-1 text-[10px] uppercase font-black font-mono px-1.5 py-0.5 rounded-md ${getElementBadgeColor(el)}`}
                        >
                          {getElementIcon(el)}
                          <span className="hidden sm:inline text-[9px]">{el}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                    {rx.desc}
                  </p>
                </div>

                {/* Multiplier Badge Info */}
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-xs text-slate-500 font-mono font-bold uppercase">Multiplication Factor:</span>
                  <span className="font-mono text-xs font-black bg-black/50 border border-white/10 rounded px-2.5 py-1 text-slate-100 uppercase tracking-tight">
                    {rx.multiplier}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick guide and instructional footer */}
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl space-y-2">
            <h5 className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">
              ★ Combat Synergy Primer
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              To trigger reactions, apply initial elemental states using one character's elemental skill / ultimate, then quickly swap characters with Roster keys <b className="text-[#a855f7] bg-white/5 px-1 py-0.5 rounded text-[10px] font-mono">1, 2, 3, 4</b> and hit the affected slime with a different element type!
              Colliding elements results in instantaneous micro-detonations, massive flat bonus integers, freeze controls, or shock arrays.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-indigo-650 hover:bg-indigo-550 border border-indigo-500/20 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl cursor-pointer active:scale-95 transition-all text-center"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
