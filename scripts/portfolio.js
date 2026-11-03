/**
 * Kevin Bui - 3D Scrollytelling Portfolio Controller
 * Orchestrates Three.js 3D world, scroll synchronization, Auto Tour mode,
 * sound synthesis feedback, chapter scrubber rail, and EmailJS form handling.
 */

import { ProfileThreeScene } from './profile-3d.js';

class ProfileApp {
  constructor() {
    this.threeScene = null;
    this.audioCtx = null;
    this.isMuted = true; // default muted for peaceful entrance, click Sound On to enable
    this.isTouring = false;
    this.tourInterval = null;
    this.currentChapterIndex = 0;

    // Elements
    this.webglContainer = document.getElementById('webgl-container');
    this.progressBar = document.getElementById('scroll-progress');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.tourToggleBtn = document.getElementById('tour-toggle-btn');
    this.scrubberItems = document.querySelectorAll('.scrub-item');
    this.headerNavLinks = document.querySelectorAll('.header-nav-link');
    this.chapters = document.querySelectorAll('.story-chapter');
    this.topHeader = document.querySelector('.top-header');
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.header-nav-menu');

    this.chapterFrequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 493.88, 523.25]; // C4, D4, E4, G4, A4, B4, C5

    this.init();
  }

  init() {
    // 1. Initialize 3D Scene
    if (this.webglContainer) {
      this.threeScene = new ProfileThreeScene(this.webglContainer);
    }

    // 2. Setup Listeners
    this.setupScrollListener();
    this.setupHeaderControls();
    this.setupCompanyTabs();
    this.setupContactForm();
    this.setupMobileMenu();
    this.initTypedEffect();

    this.handleScroll();
  }

  // -------------------------------------------------------------
  // Audio Synthesis Feedback
  // -------------------------------------------------------------
  initAudio() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playChapterTone(index) {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    const freq = this.chapterFrequencies[index % this.chapterFrequencies.length];
    const t = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.5, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.08, t + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc2.connect(gain2);
    gain2.connect(this.audioCtx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 1.15);
    osc2.stop(t + 0.85);
  }

  // -------------------------------------------------------------
  // Scroll & Chapter Tracking
  // -------------------------------------------------------------
  setupScrollListener() {
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

    // 1. Update Progress Line
    if (totalHeight > 0 && this.progressBar) {
      const progress = (scrollY / totalHeight) * 100;
      this.progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    // 2. Header shadow
    if (this.topHeader) {
      if (scrollY > 40) {
        this.topHeader.classList.add('scrolled');
      } else {
        this.topHeader.classList.remove('scrolled');
      }
    }

    // 3. Detect Active Chapter
    const viewportMiddle = scrollY + window.innerHeight * 0.42;
    let newIndex = 0;

    this.chapters.forEach((chapter, idx) => {
      const top = chapter.offsetTop;
      const height = chapter.offsetHeight;
      if (viewportMiddle >= top && viewportMiddle < top + height) {
        newIndex = idx;
      }
    });

    if (newIndex !== this.currentChapterIndex) {
      this.currentChapterIndex = newIndex;
      this.playChapterTone(newIndex);
    }

    // 4. Update Scrubber Rail & Nav Links
    this.scrubberItems.forEach((item, idx) => {
      if (idx === this.currentChapterIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    this.headerNavLinks.forEach((link, idx) => {
      if (idx === this.currentChapterIndex) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 5. Notify 3D Scene with continuous scroll stage (0.0 to 6.0)
    if (this.threeScene) {
      const scrollRatio = totalHeight > 0 ? scrollY / totalHeight : 0;
      const scrollStage = scrollRatio * (this.chapters.length - 1);
      this.threeScene.setScrollProgress(scrollStage);
    }
  }

  // -------------------------------------------------------------
  // Header Controls (Auto Tour & Sound)
  // -------------------------------------------------------------
  setupHeaderControls() {
    // Sound Toggle
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        this.isMuted = !this.isMuted;
        if (!this.isMuted) {
          this.initAudio();
          this.soundToggleBtn.classList.add('active');
          this.soundToggleBtn.querySelector('i').className = 'fa-solid fa-volume-high';
          this.soundToggleBtn.querySelector('span').textContent = 'Sound On';
          this.playChapterTone(this.currentChapterIndex);
        } else {
          this.soundToggleBtn.classList.remove('active');
          this.soundToggleBtn.querySelector('i').className = 'fa-solid fa-volume-xmark';
          this.soundToggleBtn.querySelector('span').textContent = 'Muted';
        }
      });
    }

    // Auto Tour Mode
    if (this.tourToggleBtn) {
      this.tourToggleBtn.addEventListener('click', () => {
        if (this.isTouring) {
          this.stopAutoTour();
        } else {
          this.startAutoTour();
        }
      });
    }

    // Pause tour if user interacts / scrolls manually
    window.addEventListener('wheel', () => {
      if (this.isTouring) this.stopAutoTour();
    }, { passive: true });

    window.addEventListener('touchstart', () => {
      if (this.isTouring) this.stopAutoTour();
    }, { passive: true });
  }

  startAutoTour() {
    this.isTouring = true;
    this.tourToggleBtn.classList.add('active');
    this.tourToggleBtn.querySelector('i').className = 'fa-solid fa-pause';
    this.tourToggleBtn.querySelector('span').textContent = 'Pause Tour';

    let nextTargetIndex = (this.currentChapterIndex + 1) % this.chapters.length;

    this.tourInterval = setInterval(() => {
      if (nextTargetIndex >= this.chapters.length) {
        this.stopAutoTour();
        return;
      }
      this.chapters[nextTargetIndex].scrollIntoView({ behavior: 'smooth' });
      nextTargetIndex++;
    }, 4500);
  }

  stopAutoTour() {
    this.isTouring = false;
    clearInterval(this.tourInterval);
    if (this.tourToggleBtn) {
      this.tourToggleBtn.classList.remove('active');
      this.tourToggleBtn.querySelector('i').className = 'fa-solid fa-play';
      this.tourToggleBtn.querySelector('span').textContent = 'Auto Tour';
    }
  }

  // -------------------------------------------------------------
  // Mobile Menu
  // -------------------------------------------------------------
  setupMobileMenu() {
    if (!this.hamburger || !this.navMenu) return;

    this.hamburger.addEventListener('click', () => {
      this.hamburger.classList.toggle('active');
      this.navMenu.classList.toggle('active');
    });

    this.navMenu.querySelectorAll('.header-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
      });
    });
  }

  // -------------------------------------------------------------
  // Company & Project Dossier Tabs
  // -------------------------------------------------------------
  setupCompanyTabs() {
    // Company selection pills (ST Engineering, Bloom, NashTech, Hitachi)
    document.querySelectorAll('.company-pill-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const targetCompany = this.getAttribute('data-company');

        document.querySelectorAll('.company-pill-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        document.querySelectorAll('.company-pane').forEach(p => p.classList.remove('active'));
        const pane = document.getElementById(targetCompany);
        if (pane) pane.classList.add('active');
      });
    });

    // Sub-project tabs within each company
    document.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const pane = this.closest('.company-pane');
        const targetSub = this.getAttribute('data-sub');

        pane.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        pane.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
        const content = pane.querySelector(`#${targetSub}`);
        if (content) content.classList.add('active');
      });
    });
  }

  // -------------------------------------------------------------
  // EmailJS Contact Form
  // -------------------------------------------------------------
  setupContactForm() {
    const contactForm = document.getElementById('contact-form-3d');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const submitBtn = document.getElementById('submit-btn');
      const submitIcon = document.getElementById('submit-icon');
      const submitText = document.getElementById('submit-text');
      const successBox = document.getElementById('form-success');
      const errorBox = document.getElementById('form-error');

      if (submitBtn) submitBtn.disabled = true;
      if (submitIcon) submitIcon.className = 'fa-solid fa-spinner fa-spin';
      if (submitText) submitText.textContent = 'Transmitting...';

      if (successBox) successBox.style.display = 'none';
      if (errorBox) errorBox.style.display = 'none';

      const serviceID = 'service_9xr359p';
      const templateID = 'template_jmu7iyp';

      if (typeof emailjs === 'undefined') {
        if (errorBox) errorBox.style.display = 'block';
        resetState();
        return;
      }

      emailjs.sendForm(serviceID, templateID, this).then(
        () => {
          resetState();
          if (successBox) successBox.style.display = 'block';
          contactForm.reset();

          if (typeof gtag === 'function') {
            gtag('event', 'contact_form_submit', {
              event_category: 'Contact',
              event_label: 'success'
            });
          }
        },
        () => {
          resetState();
          if (errorBox) errorBox.style.display = 'block';
          if (typeof gtag === 'function') {
            gtag('event', 'contact_form_submit', {
              event_category: 'Contact',
              event_label: 'fail'
            });
          }
        }
      );

      function resetState() {
        if (submitBtn) submitBtn.disabled = false;
        if (submitIcon) submitIcon.className = 'fa-solid fa-paper-plane';
        if (submitText) submitText.textContent = 'Send Transmission';
      }
    });
  }

  // -------------------------------------------------------------
  // Dynamic Typing Subtitle
  // -------------------------------------------------------------
  initTypedEffect() {
    const target = document.getElementById('typed-text');
    if (!target || typeof Typed === 'undefined') return;

    new Typed('#typed-text', {
      strings: [
        'Full Stack Architect & Creative Technologist',
        'Interactive 3D Scrollytelling Engineer',
        'Cloud, Microservices & High-Concurrency Specialist',
        'Angular, SvelteKit & Distributed Systems'
      ],
      typeSpeed: 45,
      backSpeed: 25,
      backDelay: 2200,
      loop: true,
      showCursor: true,
      cursorChar: '_'
    });
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new ProfileApp();
});
