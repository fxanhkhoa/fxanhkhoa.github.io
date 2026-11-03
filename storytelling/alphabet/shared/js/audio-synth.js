/**
 * Shared Audio Synthesis & Voice Narration Engine
 * Built using native Web Audio API and dual-tier Voice Narration:
 * Tier 1: Web Speech API (when native Vietnamese/English voices are installed in OS/browser)
 * Tier 2: High-fidelity natural cloud audio TTS fallback (guaranteeing authentic native pronunciation
 *         even when OS lacks installed Vietnamese voice packs or when translation extensions interfere).
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voicesByLang = {};
    this.currentTTSAudio = null;

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
    const voices = this.speechSynth.getVoices();

    // Cache English voice
    this.voicesByLang['en'] = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google')))
      || voices.find(v => v.lang.startsWith('en'))
      || null;

    // Cache Vietnamese voice
    this.voicesByLang['vi'] = voices.find(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return l.startsWith('vi') || l.includes('vie') || n.includes('vietnam') || n.includes('tiếng việt') || n.includes('linh') || n.includes('mai');
    }) || null;
  }

  getVietnameseVoice() {
    if (!this.speechSynth) return null;
    if (this.voicesByLang['vi']) return this.voicesByLang['vi'];
    this.initVoices();
    return this.voicesByLang['vi'];
  }

  getEnglishVoice() {
    if (!this.speechSynth) return null;
    if (this.voicesByLang['en']) return this.voicesByLang['en'];
    this.initVoices();
    return this.voicesByLang['en'];
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('alphabet_odyssey_muted', this.isMuted);

    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.audioCtx.currentTime);
    }
    if (this.isMuted) {
      if (this.speechSynth) {
        this.speechSynth.cancel();
      }
      if (this.currentTTSAudio) {
        this.currentTTSAudio.pause();
        this.currentTTSAudio = null;
      }
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
   * Speak phonetic sound or educational phrase with robust multi-language & fallback support
   */
  speak(text, lang = 'en') {
    if (this.isMuted) return;

    // Stop any ongoing speech or TTS audio
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
    if (this.currentTTSAudio) {
      this.currentTTSAudio.pause();
      this.currentTTSAudio = null;
    }

    const isVi = lang.startsWith('vi');

    if (isVi) {
      const viVoice = this.getVietnameseVoice();

      // If browser/OS has a verified Vietnamese voice installed, use SpeechSynthesis
      if (viVoice) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = viVoice;
        utterance.lang = viVoice.lang || 'vi-VN';
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        this.speechSynth.speak(utterance);
        return;
      }

      // If NO Vietnamese voice is installed locally (common on English OS/Chrome setups),
      // play authentic crystal-clear Vietnamese pronunciation via audio TTS fallback
      this.playCloudTTS(text, 'vi');
    } else {
      // English pronunciation
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
        this.playCloudTTS(text, 'en');
      }
    }
  }

  /**
   * Authentic native pronunciation audio stream
   */
  playCloudTTS(text, lang = 'vi') {
    if (this.isMuted) return;

    // Sanitize punctuation for clean query
    const cleanText = text.replace(/[/\\#,+()$~%.'":*?<>{}]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(url);
    this.currentTTSAudio = audio;
    audio.volume = 0.9;

    audio.play().catch(err => {
      console.warn('Cloud TTS playback notice:', err);
      // Last-ditch SpeechSynthesis fallback
      if (this.speechSynth) {
        const fallbackUtterance = new SpeechSynthesisUtterance(cleanText);
        fallbackUtterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
        this.speechSynth.speak(fallbackUtterance);
      }
    });
  }
}

export const soundEngine = new SoundEngine();
