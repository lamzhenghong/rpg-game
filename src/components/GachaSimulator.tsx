/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { WEAPONS_DATABASE } from '../data/weapons';
import { PlayableCharacter, ElementType, Weapon } from '../types';
import { Sparkles, Coins, HelpCircle, History, RefreshCw, Star, X, Info, Shield, Sword, Eye, Sparkle } from 'lucide-react';
import { AetheriaAudioEngine } from '../utils/audio';
import { LanguageType, t } from '../utils/i18n';
import aureliaBanner from '../../assets/aurelia_banner.png';
import kaelenBanner from '../../assets/kaelen_banner.png';
import weaponBanner from '../../assets/weapon_banner.png';

const getBannerImage = (featured5StarId: string, type: 'character' | 'weapon') => {
  if (type === 'weapon') return weaponBanner;
  if (featured5StarId === 'aurelia') return aureliaBanner;
  if (featured5StarId === 'kaelen') return kaelenBanner;
  return aureliaBanner;
};

const getBannerGradient = (featured5StarId: string, type: 'character' | 'weapon') => {
  if (type === 'weapon') {
    return 'linear-gradient(to right, rgba(15, 10, 15, 0.95) 0%, rgba(15, 10, 15, 0.7) 55%, rgba(15, 10, 15, 0.2) 100%)';
  }
  if (featured5StarId === 'aurelia') {
    return 'linear-gradient(to right, rgba(16, 10, 10, 0.95) 0%, rgba(16, 10, 10, 0.7) 55%, rgba(16, 10, 10, 0.2) 100%)';
  }
  if (featured5StarId === 'kaelen') {
    return 'linear-gradient(to right, rgba(10, 16, 28, 0.95) 0%, rgba(10, 16, 28, 0.7) 55%, rgba(10, 16, 28, 0.2) 100%)';
  }
  return 'linear-gradient(to right, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.75) 55%, rgba(11, 15, 25, 0.3) 100%)';
};

interface GachaCanvasAnimationProps {
  maxRarity: number;
}

function GachaCanvasAnimation({ maxRarity }: GachaCanvasAnimationProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to fill overlay
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const width = canvas.width;
    const height = canvas.height;

    // Determine colors based on rarity
    let primaryColor = '#06b6d4'; // 3★ Cyan
    let secondaryColor = '#38bdf8';
    if (maxRarity === 5) {
      primaryColor = '#f59e0b'; // 5★ Amber
      secondaryColor = '#fbbf24';
    } else if (maxRarity === 4) {
      primaryColor = '#a855f7'; // 4★ Purple
      secondaryColor = '#c084fc';
    }

    // Meteor state
    const meteor = {
      startX: width + 50,
      startY: -50,
      endX: width * 0.35,
      endY: height * 0.65,
      x: width + 50,
      y: -50,
      radius: maxRarity === 5 ? 12 : maxRarity === 4 ? 9 : 6,
      progress: 0,
      speed: 0.018, // speed factor
      angle: Math.atan2(height * 0.65 + 50, width * 0.35 - (width + 50))
    };

    // Particle pool
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
      maxLife: number;
    }> = [];

    // Explosion particles pool
    const explosionParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
      maxLife: number;
    }> = [];

    let isExploded = false;
    let frameId: number;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Background fade
      ctx.fillStyle = '#04060c';
      ctx.fillRect(0, 0, width, height);

      // Draw active background nebula glow
      const radialGlow = ctx.createRadialGradient(
        meteor.x, meteor.y, 10,
        meteor.x, meteor.y, meteor.radius * 8
      );
      radialGlow.addColorStop(0, primaryColor + '44');
      radialGlow.addColorStop(0.3, secondaryColor + '22');
      radialGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, meteor.radius * 8, 0, Math.PI * 2);
      ctx.fill();

      if (!isExploded) {
        // Move meteor along path
        meteor.progress += meteor.speed;
        
        // Easing out curve
        const t = meteor.progress;
        const easeT = 1 - Math.pow(1 - t, 3); // cubic ease out
        
        meteor.x = meteor.startX + (meteor.endX - meteor.startX) * easeT;
        meteor.y = meteor.startY + (meteor.endY - meteor.startY) * easeT;

        // Spawn trail particles
        const spawnCount = maxRarity === 5 ? 8 : maxRarity === 4 ? 5 : 3;
        for (let j = 0; j < spawnCount; j++) {
          particles.push({
            x: meteor.x + (Math.random() - 0.5) * meteor.radius,
            y: meteor.y + (Math.random() - 0.5) * meteor.radius,
            vx: -Math.cos(meteor.angle) * (1 + Math.random() * 3) + (Math.random() - 0.5) * 2,
            vy: -Math.sin(meteor.angle) * (1 + Math.random() * 3) + (Math.random() - 0.5) * 2,
            color: Math.random() < 0.3 ? '#ffffff' : Math.random() < 0.65 ? secondaryColor : primaryColor,
            size: Math.random() * (meteor.radius * 0.6) + 1,
            life: 0,
            maxLife: 25 + Math.random() * 25
          });
        }

        // Draw meteor head
        ctx.save();
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = secondaryColor;
        ctx.fill();
        ctx.restore();

        // Check if destination reached
        if (meteor.progress >= 1.0) {
          isExploded = true;
          // Spawn big explosion burst particles!
          const burstCount = maxRarity === 5 ? 120 : maxRarity === 4 ? 75 : 40;
          for (let k = 0; k < burstCount; k++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * (maxRarity === 5 ? 8 : maxRarity === 4 ? 6 : 4) + 1;
            explosionParticles.push({
              x: meteor.x,
              y: meteor.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: Math.random() < 0.25 ? '#ffffff' : Math.random() < 0.6 ? secondaryColor : primaryColor,
              size: Math.random() * (meteor.radius * 0.5) + 1.5,
              life: 0,
              maxLife: 40 + Math.random() * 40
            });
          }
        }
      }

      // Update and draw trail particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        } else {
          const alpha = 1 - p.life / p.maxLife;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      }

      // Update and draw explosion particles
      for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const ep = explosionParticles[i];
        ep.x += ep.vx;
        ep.y += ep.vy;
        // apply air resistance
        ep.vx *= 0.95;
        ep.vy *= 0.95;
        ep.life++;

        if (ep.life >= ep.maxLife) {
          explosionParticles.splice(i, 1);
        } else {
          const alpha = 1 - ep.life / ep.maxLife;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2);
          ctx.fillStyle = ep.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = ep.color;
          ctx.fill();
          ctx.restore();
        }
      }

      // Text HUD status info
      if (meteor.progress > 0.1) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 12px "Space Grotesk", "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        // Add spacing manually for compatibility
        const label = maxRarity === 5 ? '★ D I V I N E   S I G N A L   A L I G N E D ★' : maxRarity === 4 ? '★ S T E L L A R   H A R M O N Y   D E T E C T E D ★' : '★ A L I G N I N G   C O S M O S ★';
        ctx.fillText(label, width / 2, height * 0.85);
        ctx.restore();
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [maxRarity]);

  return (
    <div className="absolute inset-0 bg-[#04060c] z-50 flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

interface GachaSimulatorProps {
  aetherGems: number;
  mora: number;
  onModifyCurrencies: (gemsDiff: number, moraDiff: number) => void;
  ownedCharacterIds: string[];
  onUnlockCharacter: (id: string) => void;
  onAddWeapon?: (weapon: Weapon) => void;
  inventoryWeapons?: Weapon[];
  characterPortraits?: Record<string, number>;
  bannerPity5Star: Record<string, number>;
  bannerPity4Star: Record<string, number>;
  bannerGuaranteed5Star: Record<string, boolean>;
  onUpdatePity: (bannerId: string, pity5: number, pity4: number, guaranteed5?: boolean) => void;
  onLogPulls: (items: { name: string; rarity: number }[]) => void;
  pullHistoryList: { name: string; rarity: number; time: string }[];
  onShowAlert: (msg: string, solution?: string, type?: 'success' | 'error' | 'info') => void;
  devCheatsEnabled?: boolean;
  language?: LanguageType;
}

interface BannerDetails {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  type: 'character' | 'weapon';
  featured5Star: string;
  featured5StarId: string; // character id or weapon spec
  featured4Stars: string[];
  tag: string;
  themeColor: string; // border/glow class
  gradientStyle: string; // bg gradient
  details: string;
}

const BANNERS: BannerDetails[] = [
  {
    id: 'char_banner_1',
    title: 'Solar Crucible Dawning',
    subtitle: 'CHARACTER EVENT CONDUIT',
    desc: 'Unleash the ultimate power of solar flames! Greatly enhanced drop-rates for 5★ Aurelia Sunflare. Commands lightning fast Sword slashes.',
    type: 'character',
    featured5Star: 'Aurelia Sunflare',
    featured5StarId: 'aurelia',
    featured4Stars: ['Ignis Hearthward', 'Raijin Volt'],
    tag: '5★ Aurelia Sunflare (Pyro)',
    themeColor: 'border-orange-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    gradientStyle: 'from-orange-950/70 via-[#100d1c] to-[#08070f]',
    details: '5★ Rate: 50% chance to summon Aurelia Sunflare [EVENT LIMITED]. If not, any other random 5★ champion.'
  },
  {
    id: 'char_banner_2',
    title: 'Drifting Sea-Mist Tempest',
    subtitle: 'CHARACTER EVENT CONDUIT',
    desc: 'Brave the crushing waves and chilling blizzards! Uprated chance for 5★ Kaelen Tidebound. Controls powerful field elemental catalysts.',
    type: 'character',
    featured5Star: 'Kaelen Tidebound',
    featured5StarId: 'kaelen',
    featured4Stars: ['Marina Dewdrop', 'Lyra Frostbloom'],
    tag: '5★ Kaelen Tidebound (Hydro)',
    themeColor: 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    gradientStyle: 'from-cyan-950/70 via-[#0d152a] to-[#050811]',
    details: '5★ Rate: 50% chance to summon Kaelen Tidebound [EVENT LIMITED]. If not, any other random 5★ champion.'
  },
  {
    id: 'weapon_banner_1',
    title: 'Epitome Invocation: Custom Armory',
    subtitle: 'LEGENDARY WEAPON INVOCATION',
    desc: 'Forge your armaments with absolute accuracy! Select your desired 5★ Legendary Weapon and obtain it with a 100% guarantee on your next 5★ pull!',
    type: 'weapon',
    featured5Star: 'Solar Searing Blade (Sword)',
    featured5StarId: 'w_solar_searing',
    featured4Stars: ['Favonius Greatsword', 'Sacrificial Sword'],
    tag: '5★ Custom Weapon Selector',
    themeColor: 'border-rose-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    gradientStyle: 'from-rose-950/60 via-[#1c0d12] to-[#0f0709]',
    details: 'Guaranteed selected 5★ target weapon on roll. Select your weapon below.'
  }
];

export default function GachaSimulator({
  aetherGems,
  mora,
  onModifyCurrencies,
  ownedCharacterIds,
  onUnlockCharacter,
  onAddWeapon,
  inventoryWeapons = [],
  characterPortraits = {},
  bannerPity5Star,
  bannerPity4Star,
  bannerGuaranteed5Star = {},
  onUpdatePity,
  onLogPulls,
  pullHistoryList,
  onShowAlert,
  devCheatsEnabled = true,
  language = 'en'
}: GachaSimulatorProps) {
  const [selectedBannerIdx, setSelectedBannerIdx] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [currentPullResults, setCurrentPullResults] = useState<{ id: string; name: string; rarity: number; isCharacter: boolean; element?: ElementType; isNew?: boolean; nextPortrait?: number | null }[]>([]);
  const [showSplashItem, setShowSplashItem] = useState<{ id: string; name: string; rarity: number; isCharacter: boolean; element?: ElementType } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [showRatesInfo, setShowRatesInfo] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'none' | 'meteor' | 'showcase'>('none');
  const [maxRarityInPull, setMaxRarityInPull] = useState(3);
  const [selectedWeaponName, setSelectedWeaponName] = useState<string>('Solar Searing Blade');

  const [msRemaining, setMsRemaining] = useState(86400000 - (Date.now() % 86400000));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setMsRemaining(86400000 - (Date.now() % 86400000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isSwapped = Math.floor(Date.now() / 86400000) % 2 === 1;

  const dynamicBanners = BANNERS.map(banner => {
    if (banner.id === 'char_banner_1') {
      return isSwapped ? {
        ...banner,
        title: 'Drifting Sea-Mist Tempest (Rotated)',
        desc: 'The tides of ocean currents are rising! Greatly enhanced drop-rates for 5★ Kaelen Tidebound. Controls powerful field elemental catalysts.',
        featured5Star: 'Kaelen Tidebound',
        featured5StarId: 'kaelen',
        featured4Stars: ['Marina Dewdrop', 'Lyra Frostbloom'],
        tag: '5★ Kaelen Tidebound (Hydro)',
        themeColor: 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
        gradientStyle: 'from-cyan-950/70 via-[#0d152a] to-[#050811]',
        details: '5★ Rate: 50% chance to summon Kaelen Tidebound [EVENT LIMITED]. If not, any other random 5★ champion.'
      } : banner;
    }
    if (banner.id === 'char_banner_2') {
      return isSwapped ? {
        ...banner,
        title: 'Solar Crucible Dawning (Rotated)',
        desc: 'Solar flare eruptions are burning! Greatly enhanced drop-rates for 5★ Aurelia Sunflare. Commands lightning fast Sword slashes.',
        featured5Star: 'Aurelia Sunflare',
        featured5StarId: 'aurelia',
        featured4Stars: ['Ignis Hearthward', 'Raijin Volt'],
        tag: '5★ Aurelia Sunflare (Pyro)',
        themeColor: 'border-orange-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
        gradientStyle: 'from-orange-950/70 via-[#100d1c] to-[#08070f]',
        details: '5★ Rate: 50% chance to summon Aurelia Sunflare [EVENT LIMITED]. If not, any other random 5★ champion.'
      } : banner;
    }
    return banner;
  });

  const rawActiveBanner = dynamicBanners[selectedBannerIdx] || dynamicBanners[0];
  const activeBanner = rawActiveBanner.type === 'weapon' ? {
    ...rawActiveBanner,
    featured5Star: selectedWeaponName,
    tag: `5★ ${selectedWeaponName}`,
    details: `GUARANTEED target: 5★ ${selectedWeaponName}. No 50/50. Select your target below.`
  } : rawActiveBanner;

  const hours = Math.floor(msRemaining / 3600000);
  const minutes = Math.floor((msRemaining % 3600000) / 60000);
  const seconds = Math.floor((msRemaining % 60000) / 1000);
  const timerString = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

  const activePity5 = bannerPity5Star[activeBanner.id] ?? 0;
  const activePity4 = bannerPity4Star[activeBanner.id] ?? 0;

  const getElementColor = (element?: ElementType) => {
    if (!element) return 'text-slate-400';
    switch (element) {
      case 'Pyro': return 'text-rose-400';
      case 'Hydro': return 'text-cyan-300';
      case 'Cryo': return 'text-sky-200';
      case 'Electro': return 'text-purple-300';
      case 'Anemo': return 'text-emerald-350';
      case 'Geo': return 'text-amber-400';
      case 'Dendro': return 'text-green-300';
    }
  };

  const createWeaponFromPull = (name: string, rarity: 3 | 4 | 5): Weapon => {
    // Attempt to lookup exact template properties from our complete 30-weapons database
    const template = WEAPONS_DATABASE.find(w => w.name.toLowerCase().replace(/\s*\(.*\)/, '') === name.toLowerCase().replace(/\s*\(.*\)/, '')) 
      || WEAPONS_DATABASE.find(w => w.rarity === rarity) 
      || WEAPONS_DATABASE[0];

    return {
      id: 'w_' + Date.now() + '_' + Math.floor(Math.random() * 1000000),
      name: template.name,
      rarity: template.rarity,
      weaponType: template.weaponType,
      baseAtk: template.baseAtk,
      statBonus: template.statBonus,
      level: 1
    };
  };

  const executeWishPulls = (pullCount: number) => {
    // 10 Pull gets a nice discount: only 1440 Gems instead of 1600!
    const cost = pullCount === 10 ? 1440 : pullCount * 160;
    if (aetherGems < cost) {
      onShowAlert(
        "Insufficient Aether Gems to perform celestial wishes.",
        "Claim free developer rewards using '+20,000 Gems Tool' in the upper summon header, or clear campaign waves to claim massive quest tokens!",
        "error"
      );
      return;
    }

    onModifyCurrencies(-cost, 0);
    setPulling(true);
    setAnimationPhase('meteor');
    AetheriaAudioEngine.playClick();
    
    let localPity5 = activePity5;
    let localPity4 = activePity4;
    let localGuaranteed5 = bannerGuaranteed5Star[activeBanner.id] ?? false;
    let maxRarity = 3;

    const initialOwnedChars = new Set(ownedCharacterIds);
    const initialOwnedWeapons = new Set(inventoryWeapons.map(w => w.name));
    const tempPortraits = { ...characterPortraits };

    const results: { id: string; name: string; rarity: number; isCharacter: boolean; element?: ElementType; isNew?: boolean; nextPortrait?: number | null }[] = [];
    const pullsToLog: { name: string; rarity: number }[] = [];

    for (let i = 0; i < pullCount; i++) {
      localPity5++;
      localPity4++;

      let rolledRarity = 3;
      let isChar = false;
      let rolledId = '';
      let rolledName = '';
      let element: ElementType | undefined = undefined;

      const rand = Math.random();

      // check 5-star threshold (Hard pity at 90)
      const isFiveStar = rand < 0.006 || localPity5 >= 90;
      
      if (isFiveStar) {
        rolledRarity = 5;
        localPity5 = 0;

        if (activeBanner.type === 'character') {
          isChar = true;
          const isGuaranteed = localGuaranteed5;
          
          if (isGuaranteed || Math.random() < 0.5) {
            const chosen = PLAYABLE_CHARACTERS.find(c => c.id === activeBanner.featured5StarId);
            if (chosen) {
              rolledId = chosen.id;
              rolledName = chosen.name;
              element = chosen.element;
            }
            localGuaranteed5 = false;
          } else {
            // Roll any random standard 5-star character (other than featured, and excluding kaelen on aurelia's banner / aurelia on kaelen's banner)
            const standardFiveStars = PLAYABLE_CHARACTERS.filter(c => 
              c.rarity === 5 && 
              c.id !== activeBanner.featured5StarId &&
              (activeBanner.featured5StarId !== 'aurelia' || c.id !== 'kaelen') &&
              (activeBanner.featured5StarId !== 'kaelen' || c.id !== 'aurelia')
            );
            const chosen = standardFiveStars.length > 0 
              ? standardFiveStars[Math.floor(Math.random() * standardFiveStars.length)]
              : PLAYABLE_CHARACTERS.find(c => c.id === activeBanner.featured5StarId)!;
            rolledId = chosen.id;
            rolledName = chosen.name;
            element = chosen.element;
            
            localGuaranteed5 = true;
          }
        } else {
          // WEAPON CUSTOM BANNER: 100% Guaranteed self-selected 5★ Weapon drop!
          isChar = false;
          rolledId = 'weapon_5star';
          rolledName = selectedWeaponName;
        }
      } 
      // check 4-star threshold (Hard pity at 10)
      else if (rand < 0.051 + 0.006 || localPity4 >= 10) {
        rolledRarity = 4;
        localPity4 = 0;

        if (activeBanner.type === 'character') {
          isChar = true;
          const fourStars = PLAYABLE_CHARACTERS.filter(c => c.rarity === 4);
          const chosen = fourStars[Math.floor(Math.random() * fourStars.length)];
          rolledId = chosen.id;
          rolledName = chosen.name;
          element = chosen.element;
        } else {
          // Weapon banner four star: 100% Weapon
          isChar = false;
          const fourStarWeapons = WEAPONS_DATABASE.filter(w => w.rarity === 4);
          const chosen = fourStarWeapons[Math.floor(Math.random() * fourStarWeapons.length)];
          rolledName = chosen.name;
          rolledId = 'weapon_4star';
        }
      } 
      // 3-star standard roll (Hero on hero banner, Weapon on weapon banner)
      else {
        rolledRarity = 3;
        if (activeBanner.type === 'character') {
          isChar = true;
          const threeStars = PLAYABLE_CHARACTERS.filter(c => c.rarity === 3);
          const chosen = threeStars[Math.floor(Math.random() * threeStars.length)] || PLAYABLE_CHARACTERS[0];
          rolledId = chosen.id;
          rolledName = chosen.name;
          element = chosen.element;
        } else {
          isChar = false;
          const threeStarWeapons = WEAPONS_DATABASE.filter(w => w.rarity === 3);
          const chosen = threeStarWeapons[Math.floor(Math.random() * threeStarWeapons.length)];
          rolledName = chosen.name;
          rolledId = 'weapon_3star';
        }
      }

      if (rolledRarity > maxRarity) {
        maxRarity = rolledRarity;
      }

      let isNew = false;
      let nextPortrait: number | null = null;

      if (isChar && rolledId) {
        if (!initialOwnedChars.has(rolledId)) {
          isNew = true;
          initialOwnedChars.add(rolledId);
        } else {
          const currentLvl = tempPortraits[rolledId] || 0;
          const nextLvl = Math.min(6, currentLvl + 1);
          tempPortraits[rolledId] = nextLvl;
          nextPortrait = nextLvl;
        }
      } else {
        // Weapon
        if (!initialOwnedWeapons.has(rolledName)) {
          isNew = true;
          initialOwnedWeapons.add(rolledName);
        }
      }

      results.push({
        id: rolledId,
        name: rolledName,
        rarity: rolledRarity,
        isCharacter: isChar,
        element,
        isNew,
        nextPortrait
      });
      
      // Handle actual inventory unlocks and transfers in database ledger
      if (isChar && rolledId) {
        onUnlockCharacter(rolledId);
      } else {
        // If it is a weapon, dynamically forge and gift to player roster inventory so they can equip and refine!
        if (onAddWeapon) {
          const weaponObj = createWeaponFromPull(rolledName, rolledRarity as 3 | 4 | 5);
          onAddWeapon(weaponObj);
        }
      }
      
      pullsToLog.push({ name: rolledName, rarity: rolledRarity });
    }

    onLogPulls(pullsToLog);
    setMaxRarityInPull(maxRarity);
    onUpdatePity(activeBanner.id, localPity5, localPity4, localGuaranteed5);
    setCurrentPullResults(results);

    // Meteor delay triggers elegant gacha results showcase
    setTimeout(() => {
      setAnimationPhase('showcase');
      if (maxRarity >= 4) {
        AetheriaAudioEngine.playUltimate();
      } else {
        AetheriaAudioEngine.playWaveClear();
      }
      // Fullscreen splash modal disabled per request
      // const sorted = [...results].sort((a, b) => b.rarity - a.rarity);
      // const highTier = sorted.find(r => r.rarity >= 4);
      // if (highTier) {
      //   setShowSplashItem(highTier);
      // }
      setPulling(false);
    }, 2200);
  };

  const getMeteorImageColor = () => {
    if (maxRarityInPull === 5) return 'shadow-[0_0_80px_rgba(251,191,36,0.7)] border-amber-300';
    if (maxRarityInPull === 4) return 'shadow-[0_0_60px_rgba(168,85,247,0.6)] border-purple-400';
    return 'shadow-[0_0_40px_rgba(6,182,212,0.4)] border-cyan-500';
  };

  return (
    <div className="bg-[#0b0f19]/85 border border-white/10 rounded-xl overflow-hidden p-5 relative flex flex-col h-full shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md min-h-[600px]" id="gacha_main_container">
      
      {/* Absolute floating glowing overlay during wishing meteor */}
      {animationPhase === 'meteor' && (
        <GachaCanvasAnimation maxRarity={maxRarityInPull} />
      )}

      {/* Splash card popup for 4* or 5* characters/weapons */}
      <AnimatePresence>
        {showSplashItem && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-[#04060c]/95 z-55 flex items-center justify-center p-4"
            onClick={() => setShowSplashItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: -30 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-[#0b101e] max-w-md w-full border border-white/10 rounded-2xl p-6 shadow-[0_0_120px_rgba(251,191,36,0.15)] relative text-center flex flex-col justify-between min-h-[460px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowSplashItem(null)} 
                className="absolute top-4 right-4 p-2 bg-white/5 text-slate-400 hover:text-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-display flex justify-center items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> NEW UNLOCKED ACQUISITION
                </p>
                
                {/* Visual Avatar / Weapon icon frame */}
                <div className="flex justify-center">
                  <div className={`w-28 h-28 rounded-2xl flex items-center justify-center text-4xl font-black text-slate-950 relative border shadow-[0_0_35px_rgba(0,0,0,0.5)] ${
                    showSplashItem.isCharacter 
                      ? (PLAYABLE_CHARACTERS.find(c => c.id === showSplashItem.id)?.avatarPlaceholder || 'bg-amber-550')
                      : 'bg-gradient-to-tr from-slate-700 via-indigo-950 to-slate-900 border-indigo-400/30 text-indigo-200'
                  }`}>
                    {showSplashItem.isCharacter ? (
                      showSplashItem.name.charAt(0)
                    ) : (
                      <Sword className="w-12 h-12 text-amber-400" />
                    )}
                    {showSplashItem.isCharacter && (
                      <span className="absolute -bottom-2.5 bg-slate-900 border border-white/10 text-[9px] text-slate-200 font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                        {showSplashItem.element}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-100 flex items-center justify-center gap-1.5 uppercase font-display tracking-widest">
                    {showSplashItem.name}
                  </h3>
                  <div className="flex justify-center gap-0.5 mt-2">
                    {Array.from({ length: showSplashItem.rarity }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed italic border-t border-white/5 pt-4">
                  {showSplashItem.isCharacter 
                    ? (PLAYABLE_CHARACTERS.find(c => c.id === showSplashItem.id)?.backstory || 'A mighty wandering companion joining your cosmic legion.')
                    : (WEAPONS_DATABASE.find(w => w.name === showSplashItem.name)?.featureDesc || "Elite grade master armaments forged in Aetheric furnaces, complete with dynamic status parameters.")
                  }
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center gap-3">
                <div className="text-left">
                  <span className="text-[8.5px] text-slate-500 uppercase tracking-widest block font-bold">Category</span>
                  <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider font-mono">
                    {showSplashItem.isCharacter ? 'Playable Hero' : 'Equipment Armament'}
                  </span>
                </div>
                <button 
                  onClick={() => setShowSplashItem(null)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider px-5 py-2.5 rounded-lg active:scale-95 transition-all shadow-[0_0_15px_rgba(251,191,36,0.30)] cursor-pointer"
                >
                  CONFIRM ACQUISITION
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMON RESULTS CASCADE SHOWCASE MODAL */}
      <AnimatePresence>
        {animationPhase === 'showcase' && currentPullResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020308]/97 z-55 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto select-none"
          >
            {/* Ambient Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
              {Array.from({ length: 15 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`absolute rounded-full filter blur-xl animate-pulse ${
                    maxRarityInPull === 5 ? 'bg-amber-500/20' : maxRarityInPull === 4 ? 'bg-purple-500/10' : 'bg-cyan-500/10'
                  }`}
                  style={{
                    width: `${80 + Math.random() * 150}px`,
                    height: `${80 + Math.random() * 150}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDuration: `${3 + Math.random() * 5}s`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 max-w-5xl w-full flex flex-col items-center space-y-8">
              <div className="text-center space-y-1">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 font-mono"
                >
                  ⚡ SUMMON RIFT RESULTS STABILIZED ⚡
                </motion.div>
                <motion.h3
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-widest font-display text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-200"
                >
                  Acquisition Showcase
                </motion.h3>
              </div>

              {/* Staggered Cards Grid */}
              <div className={`grid gap-4 w-full justify-center ${
                currentPullResults.length === 1 
                  ? 'grid-cols-1 max-w-xs' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
              }`}>
                {currentPullResults.map((item, i) => {
                  const elColor = item.element ? getElementColor(item.element) : 'text-slate-400';
                  const isGold = item.rarity === 5;
                  const isPurple = item.rarity === 4;
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.2, opacity: 0, rotateY: 90, y: 40 }}
                      animate={{ scale: 1, opacity: 1, rotateY: 0, y: 0 }}
                      exit={{ scale: 0.2, opacity: 0, rotateY: -90, y: -40 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 160, 
                        damping: 14, 
                        delay: i * 0.08 
                      }}
                      className={`relative rounded-xl border p-4 flex flex-col justify-between items-center text-center min-h-[190px] transition-all backdrop-blur-md overflow-hidden group ${
                        isGold 
                          ? 'bg-amber-955/20 border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:border-amber-400' 
                          : isPurple 
                            ? 'bg-purple-955/20 border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400' 
                            : 'bg-slate-900/40 border-white/5 shadow-md hover:border-slate-800'
                      }`}
                    >
                      {/* NEW! Badge */}
                      {item.isNew && (
                        <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider z-20 shadow-sm animate-pulse">
                          NEW!
                        </div>
                      )}

                      {/* Element specific glow ripples */}
                      {item.element && (
                        <div className={`absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity bg-radial from-current to-transparent pointer-events-none ${elColor}`} />
                      )}

                      {/* Stars count */}
                      <div className="flex gap-0.5 z-10">
                        {Array.from({ length: item.rarity }).map((_, sIdx) => (
                          <Star key={sIdx} className={`w-2.5 h-2.5 fill-current ${
                            isGold ? 'text-amber-400' : isPurple ? 'text-purple-400' : 'text-cyan-400'
                          }`} />
                        ))}
                      </div>

                      {/* Icon representation */}
                      <div className="my-3 z-10">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-slate-950 border border-white/10 relative shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
                          item.isCharacter 
                            ? (PLAYABLE_CHARACTERS.find(c => c.id === item.id)?.avatarPlaceholder || 'bg-amber-550')
                            : 'bg-gradient-to-tr from-slate-700 via-indigo-950 to-slate-900 border-indigo-400/20 text-indigo-200'
                        }`}>
                          {item.isCharacter ? (
                            item.name.charAt(0)
                          ) : (
                            <Sword className="w-6 h-6 text-indigo-300" />
                          )}
                        </div>
                      </div>

                      {/* Rarity/Category text */}
                      <div className="space-y-1 z-10 w-full">
                        <span className="text-[10.5px] font-black text-slate-200 block truncate uppercase tracking-tighter w-full">
                          {item.name}
                          {item.nextPortrait !== undefined && item.nextPortrait !== null && (
                            <span className="text-amber-400 font-extrabold ml-1">
                              (P{item.nextPortrait})
                            </span>
                          )}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase tracking-widest block font-mono ${
                          item.element ? elColor : 'text-slate-500'
                        }`}>
                          {item.element ? item.element : item.rarity === 5 ? '5★ WEAPON' : item.rarity === 4 ? '4★ WEAPON' : '3★ WEAPON'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Confirmation Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: currentPullResults.length * 0.08 + 0.2 }}
                onClick={() => {
                  AetheriaAudioEngine.playClick();
                  setAnimationPhase('none');
                }}
                className="bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-lg cursor-pointer transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              >
                📥 Confirm Acquisitions
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar with credentials */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-white/10 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <h2 className="text-xs font-black text-slate-100 uppercase tracking-widest font-display">
              Celestial Wish Wells
            </h2>
          </div>
          <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide font-mono">
            Deploy wishes inside the solar rift. All weapon drops transfer to active character loadouts.
          </p>
        </div>

        {/* Currency displays */}
        <div className="flex items-center gap-3">
          <div className="bg-black/30 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] text-slate-400 font-mono uppercase">GEMS BALANCE:</span>
            <span className="text-[10px] font-black text-amber-400 font-mono">{aetherGems.toLocaleString()}</span>
          </div>

          {devCheatsEnabled && (
            <button 
              type="button"
              onClick={() => onModifyCurrencies(20000, 50000)}
              className="bg-[#0e1628] hover:bg-indigo-950/80 text-indigo-400 text-[9px] font-black uppercase tracking-wider px-3.5 py-2 rounded-lg border border-indigo-500/20 active:scale-95 transition-all cursor-pointer font-sans"
            >
              +20,000 Gems Tool
            </button>
          )}
        </div>
      </div>

      {/* Banner selection tabs */}
      <div className="flex flex-wrap gap-2 mt-4">
        {dynamicBanners.map((b, idx) => (
          <button
            key={b.id}
            onClick={() => {
              if (!pulling) setSelectedBannerIdx(idx);
            }}
            disabled={pulling}
            className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
              selectedBannerIdx === idx
                ? 'bg-slate-900 border-[#6366f1]/60 text-slate-100 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-display'
                : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
            }`}
          >
            {b.type === 'character' ? '👤 HERO:' : '⚔️ ARMAMENT:'} {b.tag}
          </button>
        ))}
      </div>

      {/* Main Gacha panel grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-4 flex-1">
        
        {/* Active Selected Banner details view */}
        <div 
          className={`lg:col-span-2 border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between ${activeBanner.themeColor}`}
          style={{
            backgroundImage: `${getBannerGradient(activeBanner.featured5StarId, activeBanner.type)}, url(${getBannerImage(activeBanner.featured5StarId, activeBanner.type)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-black px-2 py-0.5 rounded uppercase tracking-widest">
                {activeBanner.subtitle}
              </span>
              {activeBanner.type === 'character' && (
                <span className="text-[8.5px] bg-amber-400/10 text-amber-400 border border-amber-400/30 font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.1)]">
                  ⏱️ Rotation Switch: {timerString}
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-black tracking-widest text-[#f8fafc] uppercase leading-none font-display">
              {activeBanner.title}
            </h3>
            
            <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed font-sans mt-2">
              {activeBanner.desc}
            </p>

            <div className="text-[9.5px] bg-black/40 border border-white/5 p-3 rounded-lg text-slate-400 font-mono uppercase space-y-1 mt-4">
              <b className="text-[#a855f7] block font-extrabold mb-1">PROBABILITY UP-RATES:</b>
              <p>{activeBanner.details}</p>
            </div>

            {activeBanner.type === 'weapon' && (
              <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block font-display flex items-center gap-1">
                  🎯 Epitome Selection: Pick your target 5★ Weapon
                </span>
                <p className="text-[8.5px] text-slate-400 font-mono uppercase tracking-tight">
                  No 50/50 block. The next 5★ weapon you roll is guaranteed to be your selected target below.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {WEAPONS_DATABASE.filter(w => w.rarity === 5).map(weap => {
                    const isTarget = selectedWeaponName === weap.name;
                    return (
                      <button
                        key={weap.name}
                        onClick={() => {
                          setSelectedWeaponName(weap.name);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`p-2 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between min-h-[56px] select-none ${
                          isTarget
                            ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.2)] text-white'
                            : 'bg-black/35 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-tight line-clamp-1">{weap.name}</span>
                          <span className="text-[8px] opacity-70 uppercase font-mono">{weap.weaponType} • ATK {weap.baseAtk}</span>
                        </div>
                        {isTarget && (
                          <span className="absolute top-1 right-1 text-[7.5px] bg-amber-400 text-slate-950 font-black px-1 rounded uppercase tracking-tighter scale-90 leading-none py-0.5">
                            Target
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex flex-col xl:flex-row justify-between items-start xl:items-center text-xs text-slate-500 gap-4 w-full">
            <div className="flex flex-wrap gap-4">
              {/* 5★ Pity Ring Widget */}
              <div className="flex items-center gap-3 bg-black/45 border border-white/10 p-2.5 rounded-xl shadow-inner backdrop-blur-sm">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      className="stroke-slate-800"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      className={`transition-all duration-500 ${
                        activePity5 >= 75
                          ? 'stroke-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                          : 'stroke-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]'
                      }`}
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={2 * Math.PI * 22 * (1 - Math.min(activePity5 / 90, 1))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute font-mono font-black text-xs ${activePity5 >= 75 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {activePity5}
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">5★ Pity Status</span>
                  <span className="text-[10.5px] font-black font-mono text-slate-100">{activePity5} <span className="text-slate-500">/ 90</span></span>
                  <span className={`text-[8.5px] font-bold tracking-tight font-mono uppercase ${activePity5 >= 75 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                    {activePity5 >= 75 ? '⚠️ SOFT PITY ACTIVE' : `${90 - activePity5} to guaranteed`}
                  </span>
                  {activeBanner.type === 'character' && (
                    <span className={`text-[8.5px] font-bold tracking-tight font-mono uppercase mt-0.5 ${bannerGuaranteed5Star[activeBanner.id] ? 'text-emerald-400 font-extrabold' : 'text-slate-500'}`}>
                      {bannerGuaranteed5Star[activeBanner.id] ? '✨ NEXT 5★ GUARANTEED FEATURED' : '⚖️ 50/50 FEATURED CHANCE'}
                    </span>
                  )}
                </div>
              </div>

              {/* 4★ Pity Ring Widget */}
              <div className="flex items-center gap-3 bg-black/45 border border-white/10 p-2.5 rounded-xl shadow-inner backdrop-blur-sm">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      className="stroke-slate-800"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      className="stroke-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)] transition-all duration-500"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={2 * Math.PI * 22 * (1 - Math.min(activePity4 / 10, 1))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-mono font-black text-xs text-purple-400">
                    {activePity4}
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">4★ Pity Status</span>
                  <span className="text-[10.5px] font-black font-mono text-slate-100">{activePity4} <span className="text-slate-500">/ 10</span></span>
                  <span className="text-[8.5px] font-bold tracking-tight font-mono uppercase text-slate-400">
                    {activePity4 >= 8 ? '🔥 NEAR GUARANTEE' : `${10 - activePity4} to guaranteed`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowRatesInfo(true)}
                className="p-1.5 px-3 bg-[#0a0f1d] border border-white/10 hover:border-white/20 rounded-md flex items-center gap-1.5 hover:text-slate-200 transition-colors uppercase text-[9px] font-black tracking-wider cursor-pointer font-mono"
              >
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>RATES MATRIX</span>
              </button>
              <button 
                onClick={() => {
                  setHistoryPage(1);
                  setShowHistory(!showHistory);
                }}
                className="p-1.5 px-3 bg-[#0a0f1d] border border-white/10 hover:border-white/20 rounded-md flex items-center gap-1.5 hover:text-slate-200 transition-colors uppercase text-[9px] font-black tracking-wider cursor-pointer font-mono"
              >
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span> Summons HISTORY</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right side live actions and results */}
        <div className="bg-[#060811]/65 p-5 border border-white/10 rounded-xl flex flex-col justify-between">
          <div className="space-y-4 flex-1">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2 font-display">
              SUMMON MATRIX BUFFER
            </h4>

            {animationPhase === 'showcase' && currentPullResults.length > 0 ? (
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {currentPullResults.map((r, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      r.rarity === 5 
                        ? 'bg-amber-500/10 border-amber-500/30' 
                        : r.rarity === 4 
                          ? 'bg-purple-500/10 border-purple-500/30' 
                          : 'bg-slate-950/45 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        r.rarity === 5 ? 'bg-amber-400 animate-pulse' : r.rarity === 4 ? 'bg-purple-400' : 'bg-slate-400'
                      }`} />
                      <span className="text-[11px] font-extrabold text-slate-200 uppercase tracking-tighter truncate max-w-[110px]">
                        {r.name}
                      </span>
                      {r.nextPortrait !== undefined && r.nextPortrait !== null && (
                        <span className="text-[9px] text-amber-400 font-black shrink-0">
                          P{r.nextPortrait}
                        </span>
                      )}
                      {r.isNew && (
                        <span className="text-[8px] bg-rose-500 text-white font-black px-1 rounded shrink-0 leading-normal animate-pulse">
                          NEW!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-black/20 p-1 px-2 rounded shrink-0">
                      <span className={`text-[8.5px] font-extrabold uppercase tracking-wide font-mono ${getElementColor(r.element)}`}>
                        {r.element ? r.element : r.rarity === 5 ? '5★' : r.rarity === 4 ? '4★' : '3★'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-[10px] italic font-mono uppercase tracking-widest">
                Active core idle. Deploy single or multiple wish matrix streams...
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
            <button
              onClick={() => executeWishPulls(1)}
              disabled={pulling}
              className="bg-black/55 hover:bg-black/85 text-slate-200 border border-white/10 p-3 rounded-lg font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span>Single wish</span>
              <span className="text-[8.5px] text-slate-500 font-mono">160 GEMS</span>
            </button>

            <button
              onClick={() => executeWishPulls(10)}
              disabled={pulling}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 p-3 rounded-lg font-black text-[11px] uppercase tracking-widest flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-amber-400/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-1">
                <span>Summon x10</span>
                <span className="text-[8px] bg-red-500 text-white font-mono px-1 rounded-sm tracking-tight scale-90">-10%</span>
              </div>
              <div className="flex gap-1 text-[8.5px] font-mono font-black items-center">
                <span className="line-through text-slate-950/40">1600</span>
                <span className="text-red-700 font-bold">1440 GEMS</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Probability Modal info */}
      {showRatesInfo && (
        <div className="absolute inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0f1b] max-w-sm w-full border border-white/15 rounded-xl p-5 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest font-display">Wishes Probabilities Grid</h3>
              <button onClick={() => setShowRatesInfo(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[11px] font-mono uppercase">
              {activeBanner.type === 'character' ? (
                <>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="font-extrabold text-amber-400">5-Star Hero</span>
                    <span className="text-slate-400">0.6% Base (Hard 90)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="font-extrabold text-purple-400">4-Star Hero</span>
                    <span className="text-slate-400">5.1% Base (Hard 10)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="font-semibold text-slate-500">3-Star Hero</span>
                    <span className="text-slate-500">94.3% Base</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="font-extrabold text-amber-400">5-Star Armament Item</span>
                    <span className="text-slate-400">0.6% Base (Hard 90)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="font-extrabold text-purple-400">4-Star Armament Item</span>
                    <span className="text-slate-400">5.1% Base (Hard 10)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">3-Star Armament items</span>
                    <span className="text-slate-500">94.3% Base</span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-950 p-3 rounded border border-white/5 text-[9.5px] text-slate-400 leading-relaxed font-mono uppercase">
              Ledger standards are verified. Rates are guaranteed by local smart contracts. Banners have completely separate pity and do not carry counts over to keep rolls strictly independent.
            </div>
          </div>
        </div>
      )}

      {/* Wish History Log */}
      {showHistory && (
        <div className="absolute inset-0 bg-slate-950/95 z-55 flex items-center justify-center p-4" onClick={() => setShowHistory(false)}>
          <div className="bg-[#0c0f1b] max-w-md w-full border border-white/15 rounded-xl p-5 space-y-4 flex flex-col max-h-[500px] shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest flex items-center gap-2 font-display">
                <History className="w-4 h-4 text-emerald-400" />
                SUMMON MATRIX REPAIR JOURNAL
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
              {pullHistoryList.length > 0 ? (
                (() => {
                  const itemsPerPage = 10;
                  const totalPages = Math.ceil(pullHistoryList.length / itemsPerPage) || 1;
                  const startIndex = (historyPage - 1) * itemsPerPage;
                  const paginatedHistory = pullHistoryList.slice(startIndex, startIndex + itemsPerPage);
                  return (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {paginatedHistory.map((log, idx) => (
                          <div key={idx} className="p-2 bg-black/45 rounded border border-white/5 flex justify-between items-center text-xs">
                            <div>
                              <span className="text-slate-200 font-extrabold uppercase text-[11px] tracking-tight">{log.name}</span>
                              <span className="text-[9px] text-slate-500 ml-2 font-mono">{log.time}</span>
                            </div>
                            <span className={`text-[9.5px] font-black px-2 py-0.5 rounded uppercase font-mono ${
                              log.rarity === 5 ? 'bg-amber-400/20 text-amber-400' : log.rarity === 4 ? 'bg-purple-400/20 text-purple-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {log.rarity} Star
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex justify-between items-center pt-3 border-t border-white/10 text-xs">
                        <button
                          disabled={historyPage === 1}
                          onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                          className="px-3 py-1 bg-slate-900 border border-white/10 hover:border-white/20 hover:text-white rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors uppercase font-mono text-[10px]"
                        >
                          Prev
                        </button>
                        <span className="text-slate-400 font-mono text-[10.5px]">
                          PAGE {historyPage} OF {totalPages}
                        </span>
                        <button
                          disabled={historyPage === totalPages}
                          onClick={() => setHistoryPage(prev => Math.min(prev + 1, totalPages))}
                          className="px-3 py-1 bg-slate-900 border border-white/10 hover:border-white/20 hover:text-white rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors uppercase font-mono text-[10px]"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs italic font-mono uppercase">
                  WISH HISTORY REGISTRY IS VACANT
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
