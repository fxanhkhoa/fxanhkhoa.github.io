/**
 * Shared Audio Synthesis & Voice Narration Engine
 *
 * For Vietnamese (vi):
 * Uses Google Translate's official native Vietnamese TTS audio service as the PRIMARY voice engine
 * to guarantee natural, authentic Vietnamese pronunciation (dấu sắc, huyền, hỏi, ngã, nặng)
 * without relying on quirky or missing system voices.
 *
 * For English (en):
 * Uses native Web Speech API with fallback to cloud TTS.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentAudio = null;
    this.cachedVoices = [];

    // Check localStorage preference
    const savedMute = localStorage.getItem('alphabet_odyssey_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }

    if (this.speechSynth) {
      this.initVoices();
      if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
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
    this.cachedVoices = this.speechSynth.getVoices() || [];
  }

  getEnglishVoice() {
    if (!this.speechSynth) return null;
    const voices = this.speechSynth.getVoices();
    const list = (voices && voices.length > 0) ? voices : this.cachedVoices;

    return list.find(v => {
      const lang = (v.lang || '').toLowerCase().replace('_', '-');
      const name = (v.name || '').toLowerCase();
      return (lang === 'en' || lang.startsWith('en-')) && (name.includes('natural') || name.includes('samantha') || name.includes('google'));
    }) || list.find(v => {
      const lang = (v.lang || '').toLowerCase().replace('_', '-');
      return lang === 'en' || lang.startsWith('en-');
    }) || null;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('alphabet_odyssey_muted', this.isMuted);

    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.audioCtx.currentTime);
    }
    if (this.isMuted) {
      this.stopAllAudio();
    }
    return this.isMuted;
  }

  stopAllAudio() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (this.speechSynth) {
      try {
        this.speechSynth.cancel();
      } catch (e) {}
    }
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
   * Main speech narration function
   * For Vietnamese: ALWAYS uses Google Translate native TTS audio service!
   * For English: Uses native SpeechSynthesis with cloud fallback.
   */
  speak(text, lang = 'en') {
    if (this.isMuted) return;

    this.stopAllAudio();

    const isVi = lang.startsWith('vi');

    if (isVi) {
      // Primary: Google Translate Vietnamese Audio Service
      this.playGoogleTTS(text, 'vi');
    } else {
      // English: SpeechSynthesis or fallback
      const enVoice = this.getEnglishVoice();
      if (this.speechSynth) {
        const utterance = new SpeechSynthesisUtterance(text);
        if (enVoice) {
          utterance.voice = enVoice;
        }
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        this.speechSynth.speak(utterance);
      } else {
        this.playGoogleTTS(text, 'en');
      }
    }
  }

  /**
   * Google Translate Natural Audio TTS
   * Streams high quality human audio in Vietnamese or English
   */
  playGoogleTTS(text, lang = 'vi') {
    if (this.isMuted) return;

    // Clean text: strip special phonetic notation like /a/ or extra symbols
    let clean = text
      .replace(/\/.*?\//g, '')
      .replace(/[\/\\#,+()$~%.'":*?<>{}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) clean = text;

    // Encode URI for Google Translate TTS endpoint
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(clean)}`;

    const audio = new Audio(url);
    this.currentAudio = audio;
    audio.volume = 0.95;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Google TTS audio playback note:', err);
        // Only if network audio is blocked, attempt fallback
        if (this.speechSynth) {
          const fallbackUtterance = new SpeechSynthesisUtterance(clean);
          fallbackUtterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
          this.speechSynth.speak(fallbackUtterance);
        }
      });
    }
  }
}

export const soundEngine = new SoundEngine();
