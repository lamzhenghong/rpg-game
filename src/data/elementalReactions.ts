/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ElementType } from '../types';

export interface ElementalReactionInfo {
  id: string;
  name: string;
  elements: readonly ElementType[];
  pairing: string;
  multiplier: string;
  effect: string;
  desc: string;
  colorClass: string;
  badgeBorder: string;
  textClass: string;
}

export const ELEMENTAL_REACTIONS: readonly ElementalReactionInfo[] = [
  {
    id: 'vaporize',
    name: 'Vaporize',
    elements: ['Hydro', 'Pyro'],
    pairing: 'Hydro + Pyro',
    multiplier: '2.0x Damage Multiplier',
    effect: 'Thermal Vaporization',
    desc: 'Amplifies the triggering attack to deal double damage. Highly effective for breaking single-target thermal nodes.',
    colorClass: 'from-orange-500/20 to-red-500/25 text-orange-400',
    badgeBorder: 'border-orange-500/30',
    textClass: 'text-orange-400'
  },
  {
    id: 'frozen',
    name: 'Frozen',
    elements: ['Hydro', 'Cryo'],
    pairing: 'Hydro + Cryo',
    multiplier: 'Incapacitation',
    effect: 'Deep Freeze (3.5s Stun)',
    desc: 'Locks the enemy in ice, completely incapacitating them. Frozen targets can be shattered by other dynamic elements.',
    colorClass: 'from-sky-500/20 to-blue-500/25 text-sky-400',
    badgeBorder: 'border-sky-500/30',
    textClass: 'text-sky-300'
  },
  {
    id: 'hyper-shatter',
    name: 'Hyper-Shatter',
    elements: ['Cryo', 'Hydro', 'Anemo'],
    pairing: 'Frozen + Anemo/Geo/Pyro/Electro',
    multiplier: '2.6x Damage + Splash',
    effect: 'Infrasonic Shatter & Secondary Freeze',
    desc: 'Striking a frozen target with heavy elements shatters the ice, dealing 2.6x damage and freezing adjacent slimes.',
    colorClass: 'from-cyan-400/20 to-indigo-500/25 text-cyan-300',
    badgeBorder: 'border-cyan-400/30 font-extrabold',
    textClass: 'text-cyan-300'
  },
  {
    id: 'bloom-eruption',
    name: 'Bloom Eruption',
    elements: ['Hydro', 'Dendro'],
    pairing: 'Hydro + Dendro',
    multiplier: '+750 Flat Damage',
    effect: 'Botanical Grass Rupture',
    desc: 'Spawns a rapid botanical seed core that bursts, dealing 750 trigger damage to the enemy and 450 splash damage to nearby enemies.',
    colorClass: 'from-green-500/20 to-emerald-500/25 text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    textClass: 'text-emerald-400'
  },
  {
    id: 'hyperbloom-quasar',
    name: 'Hyperbloom Quasar',
    elements: ['Hydro', 'Dendro', 'Electro'],
    pairing: 'Bloom + Electro',
    multiplier: '2.3x Damage + Chains',
    effect: 'Conductive Spark Chaining',
    desc: 'Triggers lightning sparks from botanical cores, dealing 2.3x damage to the target and propagating chain-shocks to up to 3 adjacent slimes.',
    colorClass: 'from-teal-500/20 to-purple-500/25 text-teal-300',
    badgeBorder: 'border-teal-400/30',
    textClass: 'text-teal-300'
  },
  {
    id: 'overloaded',
    name: 'Overloaded',
    elements: ['Pyro', 'Electro'],
    pairing: 'Pyro + Electro',
    multiplier: '+400 Flat Damage',
    effect: 'Kinetic Shockwave + Knockback',
    desc: 'Triggers a heat-energy explosion that flings the target outward, disrupting coordinate attacks and pushing back crowds.',
    colorClass: 'from-pink-500/20 to-rose-500/25 text-pink-400',
    badgeBorder: 'border-pink-500/30',
    textClass: 'text-pink-400'
  },
  {
    id: 'superconduct',
    name: 'Superconduct',
    elements: ['Cryo', 'Electro'],
    pairing: 'Cryo + Electro',
    multiplier: '+200 Flat Damage',
    effect: 'Armor Shred (Steel Weakening)',
    desc: 'Emits a frost surge that weakens target defense systems, amplifying standard steel-sword and dynamic strikes.',
    colorClass: 'from-purple-500/20 to-fuchsia-500/25 text-purple-400',
    badgeBorder: 'border-purple-500/30',
    textClass: 'text-purple-400'
  },
  {
    id: 'burning',
    name: 'Burning',
    elements: ['Dendro', 'Pyro'],
    pairing: 'Dendro + Pyro',
    multiplier: 'Continuous Ticking',
    effect: 'Thermal Ignite (120 Frame Burn)',
    desc: 'Ignites the targets inside a loop, applying fire damage over time to melt down larger slimes.',
    colorClass: 'from-rose-500/20 to-red-600/25 text-red-400',
    badgeBorder: 'border-rose-500/30',
    textClass: 'text-red-400'
  },
  {
    id: 'crystallize',
    name: 'Crystallize',
    elements: ['Geo'],
    pairing: 'Geo + Pyro/Hydro/Electro/Cryo',
    multiplier: 'Durable Ward Drop',
    effect: 'Durable Shield Crystal Protection',
    desc: 'Colliding Geo with Pyro, Hydro, Electro, or Cryo crystallization nodes drops protective crystals that grant a dynamic barrier.',
    colorClass: 'from-amber-500/20 to-yellow-600/25 text-amber-400',
    badgeBorder: 'border-amber-500/30',
    textClass: 'text-amber-400'
  },
  {
    id: 'swirl-splash',
    name: 'Swirl Splash',
    elements: ['Anemo'],
    pairing: 'Anemo + Applied Element',
    multiplier: 'AoE Debuff Spreading',
    effect: 'Aerodynamic Vector Propagation',
    desc: "Swirl spreads the target's existing element condition to all nearby slimes, preparing them for grand reaction chainings.",
    colorClass: 'from-emerald-400/20 to-teal-500/25 text-emerald-300',
    badgeBorder: 'border-emerald-400/30',
    textClass: 'text-emerald-300'
  },
  {
    id: 'melt',
    name: 'Melt',
    elements: ['Cryo', 'Pyro'],
    pairing: 'Cryo + Pyro',
    multiplier: '2.0x Damage Multiplier',
    effect: 'Thermal Liquefaction',
    desc: 'Melts Cryo armor or targets with Pyro heat, amplifying the triggering attack to deal double damage.',
    colorClass: 'from-orange-500/20 to-yellow-600/25 text-orange-350',
    badgeBorder: 'border-orange-400/30',
    textClass: 'text-orange-300'
  },
  {
    id: 'electro-charged',
    name: 'Electro-Charged',
    elements: ['Hydro', 'Electro'],
    pairing: 'Hydro + Electro',
    multiplier: '+300 Flat Damage + Chains',
    effect: 'Continuous Electrical Discharge',
    desc: 'Electrifies a wet target, dealing additional damage and propagating chain-shocks to up to 3 adjacent slimes.',
    colorClass: 'from-purple-500/20 to-blue-500/25 text-indigo-400',
    badgeBorder: 'border-indigo-400/30',
    textClass: 'text-indigo-400'
  }
];

export const getElementalReactionGuideLines = () =>
  ELEMENTAL_REACTIONS.map((reaction) =>
    `${reaction.name} (${reaction.pairing}): ${reaction.effect}. ${reaction.desc} Result: ${reaction.multiplier}.`
  );
