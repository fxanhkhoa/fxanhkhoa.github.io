/**
 * Shared Audio Synthesis & Voice Narration Engine
 * Built using native Web Audio API (zero external assets needed) and Web Speech API.
 * Supports multi-language narration (English 'en-US' & Vietnamese 'vi-VN').
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.speechSynth = window.speechSynthesis;
    this.voicesByLang = {};

    // Check localStorage preference
    const savedMute = localStorage.getItem('alphabet_odyssey_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }

    if (this.speechSynth) {
      this.initVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initVoices() {
    if (!this.speechSynth) return;
    const voices = this.speechSynth.getVoices();

    // Cache English voice
    this.voicesByLang['en'] = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google')))
      || voices.find(v => v.lang.startsWith('en'))
      || null;

    // Cache Vietnamese voice
    this.voicesByLang['vi'] = voices.find(v => v.lang.startsWith('vi') || v.lang.includes('VIE'))
      || voices.find(v => v.lang.startsWith('vi-VN'))
      || null;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('alphabet_odyssey_muted', this.isMuted);
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.audioCtx.currentTime);
    }
    if (this.isMuted && this.speechSynth) {
      this.speechSynth.cancel();
    }
    return this.isMuted;
  }

  /**
   * Play a warm bell / chime chord for a specific frequency
   */
  playLetterNote(frequency = 440) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;

    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, t);

    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 2, t);

    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.25, t + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.12, t + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.25);
    osc2.stop(t + 0.85);
  }

  /**
   * Cute bubble pop sound effect for clicks & taps
   */
  playPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  /**
   * Whoosh swoosh sound effect for fast transitions
   */
  playWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(330, t + 0.3);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  /**
   * Triumphant celebration fanfare arpeggio
   */
  playFanfare() {
    if (this.isMuted) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playLetterNote(freq), idx * 120);
    });
  }

  /**
   * Speak phonetic sound or educational phrase with language support
   */
  speak(text, lang = 'en') {
    if (this.isMuted || !this.speechSynth) return;
    this.speechSynth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langKey = lang.startsWith('vi') ? 'vi' : 'en';
    const voice = this.voicesByLang[langKey];
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = langKey === 'vi' ? 'vi-VN' : 'en-US';
    }
    utterance.rate = langKey === 'vi' ? 0.9 : 0.95;
    utterance.pitch = 1.05;
    this.speechSynth.speak(utterance);
  }
}

export const soundEngine = new SoundEngine();
