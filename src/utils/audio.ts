/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SPECIAL_ULTIMATE_BGM_NAME = 'Resonance of Aetheria';
export const SPECIAL_ULTIMATE_THEME_DURATION_MS = 9_000;
const BASE_BGM_GAIN = 0.15;
const BASE_SPECIAL_ULTIMATE_GAIN = 0.17;
const MOBILE_BGM_VOLUME_MULTIPLIER = 1.45;

export const getBgmVolumeMultiplierForDevice = (isMobile: boolean) => {
  return isMobile ? MOBILE_BGM_VOLUME_MULTIPLIER : 1;
};

const detectMobileAudioDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent || '';
  const hasTouch = navigator.maxTouchPoints > 0;
  return hasTouch && /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
};

// Simple self-contained Web Audio API synthesizer for retro-arcade RPG effects and BGM
class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private specialUltimateGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicTimerId: any = null;
  private specialUltimateTimerIds: ReturnType<typeof setTimeout>[] = [];
  private specialUltimateIntervalId: ReturnType<typeof setInterval> | null = null;
  private isSpecialUltimateThemePlaying: boolean = false;
  private notesPlayed: number = 0;
  private bgmVolScale: number = 1.0;
  private sfxVolScale: number = 1.0;
  private currentScreen: string = 'menu';
  private currentWeather: 'Sunny' | 'Rain' | 'Thunderstorm' | 'Snow' = 'Sunny';
  private isBossFightActive: boolean = false;
  private isMobileAudioDevice: boolean = detectMobileAudioDevice();

  constructor() {
    // Lazy initialisation inside user interaction
  }

  private getEffectiveBgmGain() {
    return BASE_BGM_GAIN * this.bgmVolScale * getBgmVolumeMultiplierForDevice(this.isMobileAudioDevice);
  }

  private getSpecialUltimateGainTarget() {
    return BASE_SPECIAL_ULTIMATE_GAIN * this.bgmVolScale * getBgmVolumeMultiplierForDevice(this.isMobileAudioDevice);
  }

  private fadeGain(gainNode: GainNode | null, targetValue: number, duration: number) {
    if (!this.ctx || !gainNode) return;
    const now = this.ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(Math.max(0.0001, gainNode.gain.value), now);
    gainNode.gain.linearRampToValueAtTime(Math.max(0.0001, targetValue), now + duration);
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Setup gain structure
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.getEffectiveBgmGain(); // Scaled BGM
      this.musicGain.connect(this.masterGain);

      this.specialUltimateGain = this.ctx.createGain();
      this.specialUltimateGain.gain.value = 0.0001;
      this.specialUltimateGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolScale * 0.5; // Scaled SFX
      this.sfxGain.connect(this.masterGain);

      // Start music if flags were active
      if (this.isMusicPlaying) {
        this.startBgmLoop();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.value = muted ? 0 : 0.8;
    }
  }

  public getMuteState() {
    return this.isMuted;
  }

  public getMusicState() {
    return this.isMusicPlaying;
  }

  public setBgmVolume(scale: number) {
    this.bgmVolScale = scale;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.getEffectiveBgmGain(), this.ctx.currentTime);
    }
  }

  public setSfxVolume(scale: number) {
    this.sfxVolScale = scale;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(scale * 0.5, this.ctx.currentTime);
    }
  }

  public getBgmVolume() {
    return this.bgmVolScale;
  }

  public getSfxVolume() {
    return this.sfxVolScale;
  }

  public pauseCombatTheme() {
    if (!this.ctx || !this.musicGain) return;
    this.fadeGain(this.musicGain, this.getEffectiveBgmGain() * 0.16, 0.45);
  }

  public resumeCombatTheme() {
    if (!this.ctx || !this.musicGain || !this.isMusicPlaying) return;
    this.fadeGain(this.musicGain, this.getEffectiveBgmGain(), 0.85);
  }

  private clearSpecialUltimateThemeTimers() {
    if (this.specialUltimateIntervalId) {
      clearInterval(this.specialUltimateIntervalId);
      this.specialUltimateIntervalId = null;
    }
    this.specialUltimateTimerIds.forEach(timerId => clearTimeout(timerId));
    this.specialUltimateTimerIds = [];
  }

  private scheduleSpecialUltimateNote(step: number) {
    if (!this.ctx || !this.specialUltimateGain) return;

    const now = this.ctx.currentTime;
    const roots = [110.00, 130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 329.63];
    const root = roots[step % roots.length];
    const phase = step < 7 ? 'activation' : step < 18 ? 'build' : 'climax';

    const playTone = (
      freq: number,
      type: OscillatorType,
      gainValue: number,
      duration: number,
      delay: number = 0,
      detune: number = 0,
    ) => {
      if (!this.ctx || !this.specialUltimateGain || freq <= 0) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const start = now + delay;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      osc.detune.setValueAtTime(detune, start);
      filter.type = phase === 'activation' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(phase === 'climax' ? 1200 : 760, start);
      filter.Q.setValueAtTime(phase === 'climax' ? 1.5 : 2.6, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(gainValue, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.specialUltimateGain);
      osc.start(start);
      osc.stop(start + duration + 0.04);
    };

    const playImpact = (gainValue: number, duration: number, delay: number = 0) => {
      if (!this.ctx || !this.specialUltimateGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + delay;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(105, start);
      osc.frequency.exponentialRampToValueAtTime(28, start + duration);
      gain.gain.setValueAtTime(gainValue, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(this.specialUltimateGain);
      osc.start(start);
      osc.stop(start + duration + 0.03);
    };

    if (phase === 'activation') {
      if (step % 2 === 0) playImpact(0.32, 0.24);
      playTone(root, 'sawtooth', 0.08, 0.42);
      playTone(root * 0.5, 'triangle', 0.08, 0.55);
      return;
    }

    if (phase === 'build') {
      playTone(root * 2, 'sawtooth', 0.09, 0.58);
      playTone(root * 3, 'triangle', 0.07, 0.7, 0.02);
      playTone(root * 4, 'sine', 0.045, 0.74, 0.06);
      if (step % 3 === 0) playImpact(0.2, 0.18);
      return;
    }

    playTone(root * 2, 'sawtooth', 0.14, 0.62, 0, -8);
    playTone(root * 2, 'sawtooth', 0.1, 0.62, 0, 8);
    playTone(root * 3, 'triangle', 0.09, 0.72, 0.02);
    playTone(root * 4, 'sine', 0.055, 0.78, 0.05);
    if (step % 2 === 0) playImpact(0.28, 0.22);
  }

  public playSpecialUltimateTheme() {
    this.resume();
    if (!this.ctx || !this.specialUltimateGain || this.isMuted) return;
    if (this.isSpecialUltimateThemePlaying) return;

    this.isSpecialUltimateThemePlaying = true;
    this.pauseCombatTheme();

    const now = this.ctx.currentTime;
    this.specialUltimateGain.gain.cancelScheduledValues(now);
    this.specialUltimateGain.gain.setValueAtTime(0.0001, now);
    this.specialUltimateGain.gain.linearRampToValueAtTime(this.getSpecialUltimateGainTarget(), now + 0.35);

    let step = 0;
    this.scheduleSpecialUltimateNote(step++);
    this.specialUltimateIntervalId = setInterval(() => {
      this.scheduleSpecialUltimateNote(step++);
    }, 280);

    this.specialUltimateTimerIds = [
      setTimeout(() => this.stopSpecialUltimateTheme(), SPECIAL_ULTIMATE_THEME_DURATION_MS)
    ];
  }

  public stopSpecialUltimateTheme(resumeCombat: boolean = true) {
    this.clearSpecialUltimateThemeTimers();
    if (this.ctx && this.specialUltimateGain) {
      this.fadeGain(this.specialUltimateGain, 0.0001, 0.75);
    }
    this.isSpecialUltimateThemePlaying = false;
    if (resumeCombat) {
      this.resumeCombatTheme();
    }
  }

  public changeBgmForScreen(screen: string) {
    const validScreens = ['menu', 'wiki', 'arena', 'wish', 'inventory', 'quest', 'dungeon'];
    const targetScreen = validScreens.includes(screen) ? screen : 'menu';
    
    if (this.currentScreen === targetScreen) return;
    this.currentScreen = targetScreen;

    if (this.isBossFightActive) return;

    if (this.isMusicPlaying) {
      this.startBgmLoop();
    }
  }

  public updateWeatherBgm(weather: 'Sunny' | 'Rain' | 'Thunderstorm' | 'Snow') {
    if (this.currentWeather === weather) return;
    this.currentWeather = weather;
    
    if (this.isBossFightActive) return;

    if (this.isMusicPlaying && (this.currentScreen === 'arena' || this.currentScreen === 'dungeon')) {
      this.startBgmLoop();
    }
  }

  public setBossFightActive(active: boolean) {
    if (this.isBossFightActive === active) return;
    this.isBossFightActive = active;
    if (this.isMusicPlaying) {
      this.startBgmLoop();
    }
  }

  // --- PLAY PROCEDURAL SFX ---

  public playSummonSwoop(maxRarity: number) {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const duration = maxRarity >= 5 ? 2.5 : maxRarity === 4 ? 1.8 : 1.2;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(maxRarity >= 5 ? 1800 : maxRarity === 4 ? 1200 : 800, this.ctx.currentTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + duration * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playSummonExplosion(maxRarity: number) {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const duration = maxRarity >= 5 ? 2.0 : maxRarity === 4 ? 1.4 : 0.8;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + duration);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(maxRarity >= 5 ? 300 : 200, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + duration * 0.5);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + duration);
    osc2.stop(this.ctx.currentTime + duration);

    // If 5-star, add a high bell resonance chime for legendary impact
    if (maxRarity >= 5) {
      const playBell = (freq: number, delay: number) => {
        if (!this.ctx) return;
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
        bGain.gain.setValueAtTime(0.3, this.ctx.currentTime + delay);
        bGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + 1.2);
        bOsc.connect(bGain);
        bGain.connect(this.sfxGain!);
        bOsc.start(this.ctx.currentTime + delay);
        bOsc.stop(this.ctx.currentTime + delay + 1.2);
      };
      playBell(880, 0.05);
      playBell(1100, 0.15);
      playBell(1320, 0.25);
    }
  }

  public playClick() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playSlash() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Synthesize friction noise slash via rapid sawtooth swept frequency
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playHit() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Heavy crash impact
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 0.15);
    osc2.stop(this.ctx.currentTime + 0.15);
  }

  public playDodge() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playParry() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Metal shield clang: high triangle wave with fast decay
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1240, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.25);
    osc2.stop(this.ctx.currentTime + 0.25);
  }

  public playSkill() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Beautiful resonance sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playUltimate() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Celestial roar boom
    const oscMajor = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    oscMajor.type = 'sawtooth';
    oscMajor.frequency.setValueAtTime(180, this.ctx.currentTime);
    oscMajor.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.8);

    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(90, this.ctx.currentTime);
    oscSub.frequency.setValueAtTime(40, this.ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.80);

    oscMajor.connect(gain);
    oscSub.connect(gain);
    gain.connect(this.sfxGain!);

    oscMajor.start();
    oscSub.start();
    oscMajor.stop(this.ctx.currentTime + 0.8);
    oscSub.stop(this.ctx.currentTime + 0.8);
  }

  public playSpecialUltimate() {
    this.playUltimate();
    if (!this.ctx || this.isMuted) return;

    const playTone = (freq: number, delay: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, this.ctx!.currentTime + delay + 0.45);

      gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.22, this.ctx!.currentTime + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + 0.52);
    };

    playTone(220, 0.08);
    playTone(330, 0.18);
    playTone(495, 0.28);
  }

  public playWaveClear() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Positive major triad arpeggio
    const playNote = (freq: number, delay: number, dur: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);
      
      gain.gain.setValueAtTime(0, this.ctx!.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.15, this.ctx!.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + dur);
    };

    // Notes: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    playNote(523.25, 0.0, 0.3);
    playNote(659.25, 0.1, 0.3);
    playNote(783.99, 0.2, 0.3);
    playNote(1046.50, 0.3, 0.6);
  }

  public playLevelUp() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Upward pentatonic scale: C5, D5, E5, G5, A5, C6, E6
    const playNote = (freq: number, delay: number, dur: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + dur);
    };

    const freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1318.51];
    freqs.forEach((f, idx) => {
      playNote(f, idx * 0.08, 0.4);
    });
  }

  public playGameOver() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Unfortunate sad minor sound
    const playNote = (freq: number, delay: number, dur: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);
      
      gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + delay + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + dur);
    };

    // Notes: A4 (440Hz), F4 (349Hz), C#4 (277Hz)
    playNote(440, 0.0, 0.3);
    playNote(349.23, 0.15, 0.3);
    playNote(277.18, 0.3, 0.8);
  }

  // --- LOOPING BACKGROUND MUSIC SYNTHESIZER ---

  public toggleMusic() {
    this.isMusicPlaying = !this.isMusicPlaying;
    if (this.isMusicPlaying) {
      this.resume();
      if (this.ctx) {
        this.startBgmLoop();
      }
    } else {
      this.stopBgmLoop();
    }
    return this.isMusicPlaying;
  }

  /** Call this on the very first user interaction to auto-start BGM */
  public startMusic() {
    if (this.isMusicPlaying) return; // already running
    this.isMusicPlaying = true;
    this.resume();
    if (this.ctx) {
      this.startBgmLoop();
    }
  }

  private stopBgmLoop() {
    if (this.musicTimerId) {
      clearInterval(this.musicTimerId);
      this.musicTimerId = null;
    }
  }

  private startBgmLoop() {
    this.stopBgmLoop();
    
    // Setup track note frequencies and harmonies based on active screen
    let melody: number[] = [];
    let harmony: number[] = [];
    let noteDuration = 0.3;
    let intervalMs = 350;

    if (this.isBossFightActive) {
      // Orchestral choir strings brass loop (Am / Phrygian epic boss loop)
      melody = [220.00, 220.00, 261.63, 220.00, 293.66, 220.00, 277.18, 329.63];
      harmony = [110.00, 110.00, 130.81, 130.81, 146.83, 146.83, 138.59, 164.81];
      noteDuration = 0.25;
      intervalMs = 180;
    } else {
      switch (this.currentScreen) {
        case 'wiki':
          // Relaxing, slow study melody (C-major pentatonic chill)
          melody = [261.63, 329.63, 392.00, 493.88, 440.00, 523.25, 659.25, 440.00];
          harmony = [130.81, 130.81, 164.81, 164.81, 220.00, 220.00, 196.00, 196.00];
          noteDuration = 0.45;
          intervalMs = 500;
          break;
        case 'wish':
          // Upbeat, epic gacha pull march
          melody = [523.25, 587.33, 783.99, 659.25, 698.46, 783.99, 1046.50, 783.99];
          harmony = [261.63, 293.66, 392.00, 329.63, 349.23, 392.00, 523.25, 392.00];
          noteDuration = 0.22;
          intervalMs = 250;
          break;
        case 'arena':
        case 'dungeon':
          // High tempo battle melody that adapts to weather conditions!
          if (this.currentWeather === 'Sunny') {
            // Energetic, bright battle melody (Sunny: Fire focus, major/pentatonic blues)
            melody = [440.00, 554.37, 587.33, 659.25, 739.99, 880.00, 739.99, 659.25];
            harmony = [110.00, 110.00, 146.83, 146.83, 164.81, 164.81, 220.00, 220.00];
            noteDuration = 0.15;
            intervalMs = 180;
          } else if (this.currentWeather === 'Rain') {
            // Flowing, liquid arpeggiated battle melody (Rain: Hydro focus, flowing 6/8 minor)
            melody = [392.00, 440.00, 523.25, 587.33, 659.25, 523.25, 440.00, 392.00];
            harmony = [98.00, 98.00, 110.00, 110.00, 130.81, 130.81, 146.83, 146.83];
            noteDuration = 0.22;
            intervalMs = 210;
          } else if (this.currentWeather === 'Thunderstorm') {
            // Chaotic, rapid lightning melody (Thunderstorm: Electro focus, fast diminished and chromatic intervals)
            melody = [440.00, 466.16, 523.25, 554.37, 622.25, 659.25, 783.99, 830.61];
            harmony = [110.00, 116.54, 130.81, 138.59, 155.56, 164.81, 196.00, 207.65];
            noteDuration = 0.11;
            intervalMs = 130;
          } else if (this.currentWeather === 'Snow') {
            // Frozen, slow stamina-draining melody (Snow: Cryo focus, slow chilly high-pitched notes)
            melody = [523.25, 0, 587.33, 0, 659.25, 0, 783.99, 0];
            harmony = [130.81, 130.81, 146.83, 146.83, 164.81, 164.81, 196.00, 196.00];
            noteDuration = 0.45;
            intervalMs = 380;
          } else {
            // Fallback Minor blues
            melody = [440.00, 523.25, 587.33, 622.25, 659.25, 783.99, 880.00, 783.99];
            harmony = [110.00, 110.00, 130.81, 130.81, 146.83, 146.83, 164.81, 164.81];
            noteDuration = 0.15;
            intervalMs = 180;
          }
          break;
        case 'inventory':
        case 'quest':
          // Cozy crafting theme
          melody = [349.23, 440.00, 523.25, 659.25, 587.33, 698.46, 880.00, 783.99];
          harmony = [174.61, 174.61, 261.63, 261.63, 293.66, 293.66, 392.00, 392.00];
          noteDuration = 0.35;
          intervalMs = 380;
          break;
        case 'menu':
        default:
          // Epic fantasy RPG menu theme (Am - F - C - G - Em - F - Dm - E loop)
          melody = [
            440.00, 523.25, 659.25, 880.00, 783.99, 659.25, 523.25, 659.25, // Am
            349.23, 440.00, 523.25, 698.46, 659.25, 523.25, 440.00, 523.25, // F
            523.25, 659.25, 783.99, 1046.50, 987.77, 783.99, 659.25, 783.99, // C
            392.00, 493.88, 587.33, 783.99, 698.46, 587.33, 493.88, 587.33, // G
            329.63, 392.00, 493.88, 659.25, 587.33, 493.88, 392.00, 493.88, // Em
            349.23, 440.00, 523.25, 698.46, 659.25, 523.25, 440.00, 523.25, // F
            293.66, 349.23, 440.00, 587.33, 523.25, 440.00, 349.23, 440.00, // Dm
            329.63, 415.30, 493.88, 659.25, 587.33, 493.88, 415.30, 493.88  // E
          ];
          harmony = [
            220.00, 174.61, 261.63, 196.00, 164.81, 174.61, 146.83, 164.81
          ];
          noteDuration = 0.28;
          intervalMs = 320;
          break;
      }
    }

    this.musicTimerId = setInterval(() => {
      if (!this.ctx || this.isMuted || !this.isMusicPlaying) return;

      const step = this.notesPlayed % melody.length;
      const melodyFreq = melody[step];
      const harmonyFreq = (this.currentScreen === 'menu' && !this.isBossFightActive)
        ? harmony[Math.floor(step / 8) % harmony.length]
        : harmony[Math.floor(this.notesPlayed / 2) % harmony.length];

      if (this.isBossFightActive) {
        // Epic Synthesized Orchestral Boss BGM (Double-kick drums, choir fifths, detuned sawtooth brass/strings)
        const playKick = (time: number) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150, time);
          osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.15);
          gain.gain.setValueAtTime(0.25, time);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
          osc.connect(gain);
          gain.connect(this.musicGain!);
          osc.start(time);
          osc.stop(time + 0.16);
        };

        const playSnare = (time: number) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, time);
          osc.frequency.exponentialRampToValueAtTime(80, time + 0.12);
          gain.gain.setValueAtTime(0.12, time);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
          osc.connect(gain);
          gain.connect(this.musicGain!);
          osc.start(time);
          osc.stop(time + 0.13);
        };

        const playChoir = (freq: number, time: number, duration: number) => {
          if (freq === 0 || !this.ctx) return;
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);
          
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, time);
          filter.Q.setValueAtTime(3.0, time);
          
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.1, time + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain!);
          
          osc.start(time);
          osc.stop(time + duration + 0.1);
        };

        const playBrass = (freq: number, time: number, duration: number) => {
          if (freq === 0 || !this.ctx) return;
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(freq, time);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(freq * 1.008, time); // detuned chorus

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(freq * 4, time);
          filter.frequency.exponentialRampToValueAtTime(freq * 1.5, time + duration);

          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.12, time + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain!);

          osc1.start(time);
          osc2.start(time);
          osc1.stop(time + duration + 0.05);
          osc2.stop(time + duration + 0.05);
        };

        const playStrings = (freq: number, time: number, duration: number) => {
          if (freq === 0 || !this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.08, time + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
          
          osc.connect(gain);
          gain.connect(this.musicGain!);
          osc.start(time);
          osc.stop(time + duration + 0.1);
        };

        // Heavy drums: Kick on step 0, 2, 4, 6. Snare on 1, 3, 5, 7.
        if (step % 2 === 0) {
          playKick(this.ctx.currentTime);
        } else {
          playSnare(this.ctx.currentTime);
        }

        // Choir: root + fifth for epicness
        playChoir(melodyFreq, this.ctx.currentTime, noteDuration);
        playChoir(melodyFreq * 1.5, this.ctx.currentTime, noteDuration);

        // Brass: powerful horns
        playBrass(harmonyFreq * 2, this.ctx.currentTime, noteDuration * 1.5);

        // Strings: backing chords on every 4 steps
        if (step % 4 === 0) {
          playStrings(harmonyFreq, this.ctx.currentTime, noteDuration * 3.5);
          playStrings(harmonyFreq * 1.25, this.ctx.currentTime, noteDuration * 3.5);
        }
      } else if (this.currentScreen === 'menu') {
        const playPiano = (freq: number, time: number, duration: number) => {
          if (freq === 0 || !this.ctx) return;
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(freq, time);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq * 2, time);
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.24, time + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
          const osc2Gain = this.ctx.createGain();
          osc2Gain.gain.setValueAtTime(0.06, time);
          osc2Gain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.4);
          osc1.connect(gain);
          osc2.connect(osc2Gain);
          osc2Gain.connect(gain);
          gain.connect(this.musicGain!);
          osc1.start(time);
          osc2.start(time);
          osc1.stop(time + duration + 0.1);
          osc2.stop(time + duration + 0.1);
        };

        const playStrings = (freq: number, time: number, duration: number) => {
          if (freq === 0 || !this.ctx) return;
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(freq, time);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(freq * 1.006, time);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(freq * 2.5, time);
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.12, time + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain!);
          osc1.start(time);
          osc2.start(time);
          osc1.stop(time + duration + 0.1);
          osc2.stop(time + duration + 0.1);
        };

        const playChoir = (freq: number, time: number, duration: number) => {
          if (freq === 0 || !this.ctx) return;
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(750, time);
          filter.Q.setValueAtTime(2.0, time);
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.08, time + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain!);
          osc.start(time);
          osc.stop(time + duration + 0.1);
        };

        const playDeepDrum = (time: number) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(65, time);
          osc.frequency.exponentialRampToValueAtTime(25, time + 0.2);
          gain.gain.setValueAtTime(0.35, time);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
          osc.connect(gain);
          gain.connect(this.musicGain!);
          osc.start(time);
          osc.stop(time + 0.22);
        };

        const playShaker = (time: number) => {
          if (!this.ctx) return;
          const bufferSize = this.ctx.sampleRate * 0.04;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(4000, time);
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.02, time);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain!);
          noise.start(time);
          noise.stop(time + 0.05);
        };

        // 1. Play Piano melody
        playPiano(melodyFreq, this.ctx.currentTime, noteDuration * 1.5);

        // 2. Play backing strings on root note (lasts 8 steps)
        if (step % 8 === 0) {
          playStrings(harmonyFreq, this.ctx.currentTime, noteDuration * 7.5);
          playStrings(harmonyFreq * 1.5, this.ctx.currentTime, noteDuration * 7.5); // fifth harmony
        }

        // 3. Play soft choir pad sweep on steps 0 and 4 of each chord
        if (step % 4 === 0) {
          playChoir(harmonyFreq * 2, this.ctx.currentTime, noteDuration * 3.5);
        }

        // 4. Play deep orchestral bass drum on steps 0 and 4
        if (step % 4 === 0) {
          playDeepDrum(this.ctx.currentTime);
        }

        // 5. Play light shaker/tambourine on steps 2 and 6
        if (step % 4 === 2) {
          playShaker(this.ctx.currentTime);
        }
      } else {
        const playBgmNode = (freq: number, type: 'triangle' | 'sine', gainVal: number) => {
          if (freq === 0) return;
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

          gain.gain.setValueAtTime(0, this.ctx!.currentTime);
          gain.gain.linearRampToValueAtTime(gainVal, this.ctx!.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + noteDuration);

          osc.connect(gain);
          gain.connect(this.musicGain!);

          osc.start();
          osc.stop(this.ctx!.currentTime + noteDuration + 0.1);
        };

        // Play soft lead voice
        playBgmNode(melodyFreq, 'sine', 0.15);

        // Play bass support line on every other step
        if (this.notesPlayed % 2 === 0) {
          playBgmNode(harmonyFreq, 'triangle', 0.1);
        }
      }

      this.notesPlayed++;
    }, intervalMs);
  }
}

export const AetheriaAudioEngine = new AudioEngine();
