/**
 * English Alphabet Odyssey Controller
 */

import { ALPHABET_DATA } from './data.js';
import { AlphabetThreeScene } from '../../shared/js/three-scene.js';
import { soundEngine } from '../../shared/js/audio-synth.js';

class EnglishAlphabetApp {
  constructor() {
    this.threeScene = null;
    this.currentActiveIndex = -1;
    this.isTouring = false;
    this.tourInterval = null;
    this.toastTimeout = null;

    this.webglContainer = document.getElementById('webgl-container');
    this.progressBar = document.getElementById('scroll-progress');
    this.scrubberRail = document.getElementById('alphabet-rail');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.tourToggleBtn = document.getElementById('tour-toggle-btn');
    this.toastEl = document.getElementById('story-toast');
    this.mobileIndicator = document.getElementById('mobile-letter-label');
    this.mobilePrevBtn = document.getElementById('mobile-prev-btn');
    this.mobileNextBtn = document.getElementById('mobile-next-btn');

    this.init();
  }

  init() {
    this.threeScene = new AlphabetThreeScene(this.webglContainer, ALPHABET_DATA);

    this.renderChapters();
    this.renderScrubberRail();

    this.setupScrollListener();
    this.setupUIControls();
    this.setupKeyboardControls();

    this.handleScroll();
  }

  renderChapters() {
    const chaptersHTML = ALPHABET_DATA.map((data, idx) => {
      const vocabChips = data.vocab.map(v => `
        <button class="vocab-chip" data-word="${v.word}" title="${v.def}">
          <span>${v.emoji}</span>
          <span>${v.word}</span>
        </button>
      `).join('');

      return `
        <section class="story-chapter" id="chapter-${data.letter}" data-index="${idx}" style="--card-accent: ${data.theme.primary}; --card-glow: ${data.theme.primary}55;">
          <div class="letter-card">
            <div class="card-header-row">
              <div class="stamp-box">
                <div class="letter-stamp" data-index="${idx}" title="Click to bounce!">${data.letter}</div>
                <div class="phonics-badge">${data.phonics}</div>
              </div>
              <button class="voice-pronounce-btn" data-index="${idx}" title="Listen to pronunciation" aria-label="Listen">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>

            <h2 class="letter-title">${data.title}</h2>
            
            <div class="rhyme-box">
              "${data.rhyme}"
            </div>

            <p class="story-text">${data.story}</p>

            <div class="vocab-section-title">Words that start with ${data.letter}</div>
            <div class="vocab-tag-cloud">
              ${vocabChips}
            </div>

            <div class="card-hint-row">
              <i class="fa-solid fa-hand-pointer"></i>
              <span>Drag to inspect 3D letter • Tap to wobble</span>
            </div>
          </div>
        </section>
      `;
    }).join('');

    const epilogue = document.getElementById('chapter-epilogue');
    epilogue.insertAdjacentHTML('beforebegin', chaptersHTML);
  }

  renderScrubberRail() {
    const railHTML = ALPHABET_DATA.map((data, idx) => `
      <a href="#chapter-${data.letter}" class="scrub-item" data-index="${idx}" title="Jump to Letter ${data.letter}">
        ${data.letter}
      </a>
    `).join('');
    this.scrubberRail.innerHTML = railHTML;
  }

  setupScrollListener() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const totalProgress = Math.max(0, Math.min(1, scrollY / (docHeight || 1)));

    if (this.progressBar) {
      this.progressBar.style.width = `${(totalProgress * 100).toFixed(1)}%`;
    }

    const chapters = document.querySelectorAll('.story-chapter[data-index]');
    let activeIndex = 0;
    let minDistance = Infinity;
    const viewCenter = window.innerHeight * 0.45;

    chapters.forEach(chapter => {
      const rect = chapter.getBoundingClientRect();
      const distance = Math.abs(rect.top - viewCenter);
      if (distance < minDistance) {
        minDistance = distance;
        activeIndex = parseInt(chapter.dataset.index, 10);
      }
    });

    const firstChapter = chapters[0];
    const lastChapter = chapters[chapters.length - 1];

    if (firstChapter && lastChapter) {
      const startY = firstChapter.offsetTop;
      const endY = lastChapter.offsetTop;
      const totalSpan = endY - startY;
      let rawLetterProgress = ((scrollY - startY) / (totalSpan || 1)) * (ALPHABET_DATA.length - 1);
      rawLetterProgress = Math.max(0, Math.min(ALPHABET_DATA.length - 0.01, rawLetterProgress));

      if (this.threeScene) {
        this.threeScene.updateScrollProgress(rawLetterProgress);
      }
    }

    if (activeIndex !== this.currentActiveIndex && activeIndex >= 0 && activeIndex < ALPHABET_DATA.length) {
      this.onActiveLetterChange(activeIndex);
    }
  }

  onActiveLetterChange(newIndex) {
    this.currentActiveIndex = newIndex;
    const data = ALPHABET_DATA[newIndex];

    document.querySelectorAll('.story-chapter').forEach(ch => ch.classList.remove('active'));
    const activeChapter = document.getElementById(`chapter-${data.letter}`);
    if (activeChapter) {
      activeChapter.classList.add('active');
    }

    document.querySelectorAll('.scrub-item').forEach((item, idx) => {
      item.classList.toggle('active', idx === newIndex);
    });

    if (this.mobileIndicator) {
      this.mobileIndicator.textContent = `Letter ${data.letter} (${newIndex + 1}/${ALPHABET_DATA.length})`;
    }

    soundEngine.playLetterNote(data.noteFreq);

    if (this.isTouring) {
      soundEngine.speak(data.speechText, 'en');
    }
  }

  setupUIControls() {
    this.soundToggleBtn.addEventListener('click', () => {
      const isMuted = soundEngine.toggleMute();
      this.updateSoundButtonUI(isMuted);
      this.showToast(isMuted ? '🔇 Sound muted' : '🔊 Sound enabled');
    });

    this.tourToggleBtn.addEventListener('click', () => {
      this.toggleTourMode();
    });

    document.addEventListener('click', (e) => {
      const stamp = e.target.closest('.letter-stamp');
      if (stamp) {
        const index = parseInt(stamp.dataset.index, 10);
        soundEngine.playPop();
        if (this.threeScene) {
          this.threeScene.triggerLetterWobble();
        }
        const data = ALPHABET_DATA[index];
        if (data) soundEngine.speak(data.speechText, 'en');
        return;
      }

      const voiceBtn = e.target.closest('.voice-pronounce-btn');
      if (voiceBtn) {
        const index = parseInt(voiceBtn.dataset.index, 10);
        const data = ALPHABET_DATA[index];
        if (data) {
          soundEngine.playPop();
          soundEngine.speak(data.speechText, 'en');
        }
        return;
      }

      const vocabChip = e.target.closest('.vocab-chip');
      if (vocabChip) {
        const word = vocabChip.dataset.word;
        soundEngine.playPop();
        soundEngine.speak(word, 'en');
        return;
      }

      const scrubItem = e.target.closest('.scrub-item');
      if (scrubItem) {
        e.preventDefault();
        const index = parseInt(scrubItem.dataset.index, 10);
        this.jumpToLetter(index);
        return;
      }
    });

    if (this.mobilePrevBtn && this.mobileNextBtn) {
      this.mobilePrevBtn.addEventListener('click', () => {
        const target = Math.max(0, this.currentActiveIndex - 1);
        this.jumpToLetter(target);
      });
      this.mobileNextBtn.addEventListener('click', () => {
        const target = Math.min(ALPHABET_DATA.length - 1, this.currentActiveIndex + 1);
        this.jumpToLetter(target);
      });
    }

    window.addEventListener('letter-clicked', (e) => {
      const { letterIndex } = e.detail;
      const data = ALPHABET_DATA[letterIndex];
      soundEngine.playPop();
      if (data) {
        soundEngine.speak(data.speechText, 'en');
      }
    });

    this.updateSoundButtonUI(soundEngine.isMuted);
  }

  updateSoundButtonUI(isMuted) {
    if (!this.soundToggleBtn) return;
    this.soundToggleBtn.innerHTML = isMuted
      ? '<i class="fa-solid fa-volume-xmark"></i><span>Muted</span>'
      : '<i class="fa-solid fa-volume-high"></i><span>Sound On</span>';
    this.soundToggleBtn.classList.toggle('active', !isMuted);
  }

  jumpToLetter(index) {
    if (index < 0 || index >= ALPHABET_DATA.length) return;
    const data = ALPHABET_DATA[index];
    const targetEl = document.getElementById(`chapter-${data.letter}`);
    if (targetEl) {
      soundEngine.playWhoosh();
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleTourMode() {
    this.isTouring = !this.isTouring;
    this.tourToggleBtn.classList.toggle('active', this.isTouring);

    if (this.isTouring) {
      this.tourToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i><span>Pause Tour</span>';
      this.showToast('🚀 Story Tour started! Sit back & enjoy the journey');
      this.startTourLoop();
    } else {
      this.tourToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>Auto Tour</span>';
      this.showToast('⏸️ Story Tour paused');
      this.stopTourLoop();
    }
  }

  startTourLoop() {
    this.stopTourLoop();
    this.tourInterval = setInterval(() => {
      let nextIndex = this.currentActiveIndex + 1;
      if (nextIndex >= ALPHABET_DATA.length) {
        nextIndex = 0;
      }
      this.jumpToLetter(nextIndex);
    }, 5500);
  }

  stopTourLoop() {
    if (this.tourInterval) {
      clearInterval(this.tourInterval);
      this.tourInterval = null;
    }
  }

  setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toUpperCase();

      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        const targetIndex = key.charCodeAt(0) - 65;
        this.jumpToLetter(targetIndex);
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        this.jumpToLetter(Math.min(ALPHABET_DATA.length - 1, this.currentActiveIndex + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        this.jumpToLetter(Math.max(0, this.currentActiveIndex - 1));
      } else if (e.key === 'm' || e.key === 'M') {
        this.soundToggleBtn.click();
      } else if (e.key === 't' || e.key === 'T') {
        this.tourToggleBtn.click();
      }
    });
  }

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 2800);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new EnglishAlphabetApp();
});

