import { ElementType } from '../types';

export const SPECIAL_ULTIMATE_UNLOCK_LEVEL = 40;
export const SPECIAL_ULTIMATE_COOLDOWN_MS = 60_000;

export type SpecialUltimateId = 'eternal_vapor' | 'worldstorm_genesis';
export type SpecialUltimateStyle = 'vapor' | 'worldstorm';

export interface SpecialUltimateDialogueLine {
  characterId: string;
  speaker: string;
  line: string;
}

export interface SpecialUltimateCombo {
  id: SpecialUltimateId;
  name: string;
  requiredCharacterIds: readonly [string, string];
  dialogue: readonly SpecialUltimateDialogueLine[];
  damageElement: ElementType;
  damageMultiplier: number;
  impactText: string;
  style: SpecialUltimateStyle;
}

export interface SpecialUltimateCombatant {
  id: string;
  currentHp?: number;
  ultimateEnergy: number;
  ultimateMaxEnergy: number;
}

export interface SpecialUltimateQuery {
  partyIds: readonly string[];
  combatParty: readonly SpecialUltimateCombatant[];
  activeCharacterId: string | null | undefined;
  playerLevel: number;
  devCheatsEnabled: boolean;
  cooldownReadyAt: number;
  now?: number;
}

export interface AvailableSpecialUltimate {
  combo: SpecialUltimateCombo;
  cooldownRemainingMs: number;
}

export const SPECIAL_ULTIMATE_COMBOS: readonly SpecialUltimateCombo[] = [
  {
    id: 'eternal_vapor',
    name: 'Eternal Vapor',
    requiredCharacterIds: ['aurelia', 'kaelen'],
    dialogue: [
      { characterId: 'aurelia', speaker: 'Aurelia', line: 'Together?' },
      { characterId: 'kaelen', speaker: 'Kaelen', line: 'Always.' }
    ],
    damageElement: 'Pyro',
    damageMultiplier: 10,
    impactText: 'MASSIVE VAPORIZE DETONATION',
    style: 'vapor'
  },
  {
    id: 'worldstorm_genesis',
    name: 'Worldstorm Genesis',
    requiredCharacterIds: ['maelis', 'veyra'],
    dialogue: [
      { characterId: 'maelis', speaker: 'Maelis', line: 'The forest answers.' },
      { characterId: 'veyra', speaker: 'Veyra', line: 'Then let the heavens roar.' }
    ],
    damageElement: 'Electro',
    damageMultiplier: 10.5,
    impactText: 'HYPERBLOOM WORLDSTORM',
    style: 'worldstorm'
  }
];

export const isSpecialUltimateUnlocked = (playerLevel: number, devCheatsEnabled: boolean) => {
  return devCheatsEnabled || playerLevel >= SPECIAL_ULTIMATE_UNLOCK_LEVEL;
};

export const getSpecialUltimateCooldownRemaining = (cooldownReadyAt: number, now: number = Date.now()) => {
  return Math.max(0, cooldownReadyAt - now);
};

const hasFullUltimateGauge = (combatant: SpecialUltimateCombatant | undefined) => {
  if (!combatant || (combatant.currentHp !== undefined && combatant.currentHp <= 0)) return false;
  return combatant.ultimateEnergy >= combatant.ultimateMaxEnergy;
};

export function getAvailableSpecialUltimate(query: SpecialUltimateQuery): AvailableSpecialUltimate | null {
  const now = query.now ?? Date.now();
  if (!isSpecialUltimateUnlocked(query.playerLevel, query.devCheatsEnabled)) return null;

  const cooldownRemainingMs = getSpecialUltimateCooldownRemaining(query.cooldownReadyAt, now);
  if (cooldownRemainingMs > 0) return null;

  const partyIdSet = new Set(query.partyIds);
  const combatantsById = new Map(query.combatParty.map(combatant => [combatant.id, combatant]));

  for (const combo of SPECIAL_ULTIMATE_COMBOS) {
    const [firstId, secondId] = combo.requiredCharacterIds;
    const comboIsInParty = partyIdSet.has(firstId) && partyIdSet.has(secondId);
    if (!comboIsInParty) continue;

    const activeIsParticipant = query.activeCharacterId === firstId || query.activeCharacterId === secondId;
    if (!activeIsParticipant) continue;

    if (!hasFullUltimateGauge(combatantsById.get(firstId))) continue;
    if (!hasFullUltimateGauge(combatantsById.get(secondId))) continue;

    return { combo, cooldownRemainingMs };
  }

  return null;
}

export const canUseSpecialUltimate = (query: SpecialUltimateQuery) => {
  return getAvailableSpecialUltimate(query) !== null;
};
