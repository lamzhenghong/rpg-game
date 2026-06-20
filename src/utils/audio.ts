/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple self-contained Web Audio API synthesizer for retro-arcade RPG effects and BGM
class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicTimerId: any = null;
  private notesPlayed: number = 0;
  private bgmVolScale: number = 1.0;
  private sfxVolScale: number = 1.0;
  private currentScreen: string = 'menu';
  private currentWeather: 'Sunny' | 'Rain' | 'Thunderstorm' | 'Snow' = 'Sunny';

  constructor() {
    // Lazy initialisation inside user interaction
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
      this.musicGain.gain.value = this.bgmVolScale * 0.15; // Scaled BGM
      this.musicGain.connect(this.masterGain);

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
      this.musicGain.gain.setValueAtTime(scale * 0.15, this.ctx.currentTime);
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

  public changeBgmForScreen(screen: string) {
    const validScreens = ['menu', 'wiki', 'arena', 'wish', 'inventory', 'quest', 'dungeon'];
    const targetScreen = validScreens.includes(screen) ? screen : 'menu';
    
    if (this.currentScreen === targetScreen) return;
    this.currentScreen = targetScreen;

    if (this.isMusicPlaying) {
      this.startBgmLoop();
    }
  }

  public updateWeatherBgm(weather: 'Sunny' | 'Rain' | 'Thunderstorm' | 'Snow') {
    if (this.currentWeather === weather) return;
    this.currentWeather = weather;
    
    if (this.isMusicPlaying && (this.currentScreen === 'arena' || this.currentScreen === 'dungeon')) {
      this.startBgmLoop();
    }
  }

  // --- PLAY PROCEDURAL SFX ---

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
        // Soothing progressive theme (original Am - F - C - G loop)
        melody = [
          440.00, 493.88, 523.25, 587.33,
          523.25, 440.00, 440.00, 0,
          349.23, 392.00, 440.00, 523.25,
          440.00, 349.23, 349.23, 0,
          523.25, 587.33, 659.25, 783.99,
          659.25, 523.25, 523.25, 0,
          392.00, 440.00, 493.88, 587.33,
          493.88, 392.00, 392.00, 587.33
        ];
        harmony = [
          220.00, 220.00, 220.00, 220.00,
          174.61, 174.61, 174.61, 174.61,
          261.63, 261.63, 261.63, 261.63,
          196.00, 196.00, 196.00, 196.00
        ];
        noteDuration = 0.3;
        intervalMs = 350;
        break;
    }

    this.musicTimerId = setInterval(() => {
      if (!this.ctx || this.isMuted || !this.isMusicPlaying) return;

      const step = this.notesPlayed % melody.length;
      const melodyFreq = melody[step];
      const harmonyFreq = harmony[Math.floor(this.notesPlayed / 2) % harmony.length];

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

      this.notesPlayed++;
    }, intervalMs);
  }
}

export const AetheriaAudioEngine = new AudioEngine();
