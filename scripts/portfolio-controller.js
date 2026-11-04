/**
 * Unified 3D Scrollytelling Portfolio Controller
 * Reusable controller powering all 3D concepts:
 * - Concept 1: Cosmic Warp Spline
 * - Concept 2: Obsidian Monolith Gallery
 * - Concept 3: Spiral Helix Carousel
 */

export class PortfolioController {
  constructor(SceneClass) {
    this.SceneClass = SceneClass;
    this.threeScene = null;
    this.audioCtx = null;
    this.isMuted = true;
    this.isTouring = false;
    this.tourInterval = null;
    this.currentStationIndex = 0;

    this.stationTitles = [
      { id: 'prologue', num: '00', name: 'Prologue // System Genesis', page: 'Station 1 of 7' },
      { id: 'origin', num: '01', name: 'Origin // The Architect\'s Path', page: 'Station 2 of 7' },
      { id: 'arsenal', num: '02', name: 'Arsenal // Technical Matrix', page: 'Station 3 of 7' },
      { id: 'creations', num: '03', name: 'Masterpieces // Live Flagships', page: 'Station 4 of 7' },
      { id: 'odyssey', num: '04', name: 'Odyssey // Career Milestones', page: 'Station 5 of 7' },
      { id: 'expeditions', num: '05', name: 'Expeditions // Freelance Consulting', page: 'Station 6 of 7' },
      { id: 'epilogue', num: '06', name: 'Epilogue // Initiate Transmission', page: 'Station 7 of 7' }
    ];

    this.musicalFrequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 493.88, 523.25]; // C4 to C5 harmonic scale

    // DOM Elements
    this.webglContainer = document.getElementById('webgl-container');
    this.progressBar = document.getElementById('scroll-progress');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.tourToggleBtn = document.getElementById('tour-toggle-btn');
    this.scrubberItems = document.querySelectorAll('.scrub-item');
    this.headerNavLinks = document.querySelectorAll('.header-nav-link');
    this.stages = document.querySelectorAll('.story-stage');
    this.topHeader = document.querySelector('.top-header');
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.header-nav-menu');

    // Reader HUD elements
    this.hudPageIndicator = document.getElementById('hud-page-indicator');
    this.hudChapterTitle = document.getElementById('hud-chapter-title');
    this.prevPageBtn = document.getElementById('prev-page-btn');
    this.nextPageBtn = document.getElementById('next-page-btn');
    this.hudActionsContainer = document.getElementById('hud-quick-actions');

    // Drawer Elements
    this.actionDrawer = document.getElementById('action-drawer');
    this.drawerBackdrop = document.getElementById('drawer-backdrop');
    this.closeDrawerBtn = document.getElementById('close-drawer-btn');
    this.openContactBtns = document.querySelectorAll('.open-contact-drawer-btn');
    this.openDossierBtns = document.querySelectorAll('.open-dossier-drawer-btn');
    this.drawerTabBtns = document.querySelectorAll('.drawer-tab-btn');
    this.drawerTabPanes = document.querySelectorAll('.drawer-tab-pane');

    this.init();
  }

  init() {
    // 1. Initialize Active 3D Scene Class
    if (this.webglContainer && this.SceneClass) {
      this.threeScene = new this.SceneClass(this.webglContainer);

      // Audio & Station trigger callback
      this.threeScene.onStationChange = (stationIdx) => {
        this.playStationTone(stationIdx);
      };
    }

    // 2. Setup listeners & handlers
    this.setupScrollListener();
    this.setupHeaderControls();
    this.setupHUDControls();
    this.setupDrawerControls();
    this.setupCompanyTabs();
    this.setupContactForm();
    this.setupMobileMenu();
    this.setupKeyboardNavigation();

    this.updateReaderHUD(0);
    this.handleScroll();
  }

  // -------------------------------------------------------------
  // Web Audio Harmonic Sound Feedback
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

  playStationTone(index) {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    const freq = this.musicalFrequencies[index % this.musicalFrequencies.length];
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
    gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.06, t + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc2.connect(gain2);
    gain2.connect(this.audioCtx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.9);
    osc2.stop(t + 0.65);
  }

  // -------------------------------------------------------------
  // Scroll Synchronization
  // -------------------------------------------------------------
  setupScrollListener() {
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Progress Bar
    if (totalHeight > 0 && this.progressBar) {
      const progress = (scrollY / totalHeight) * 100;
      this.progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    // Top Header scrolled shadow
    if (this.topHeader) {
      this.topHeader.classList.toggle('scrolled', scrollY > 30);
    }

    // Detect Active Station
    const viewportMiddle = scrollY + window.innerHeight * 0.45;
    let newIndex = 0;

    this.stages.forEach((stage, idx) => {
      const top = stage.offsetTop;
      const height = stage.offsetHeight;
      if (viewportMiddle >= top && viewportMiddle < top + height) {
        newIndex = idx;
      }
    });

    if (newIndex !== this.currentStationIndex) {
      this.currentStationIndex = newIndex;
      this.updateReaderHUD(newIndex);
    }

    this.scrubberItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === this.currentStationIndex);
    });

    this.headerNavLinks.forEach((link, idx) => {
      link.classList.toggle('active', idx === this.currentStationIndex);
    });

    // Notify 3D Scene (0.0 to 6.0)
    if (this.threeScene) {
      const scrollRatio = totalHeight > 0 ? scrollY / totalHeight : 0;
      const scrollStage = scrollRatio * 6.0;
      this.threeScene.setScrollProgress(scrollStage);
    }
  }

  // -------------------------------------------------------------
  // Bottom Reader HUD Navigation
  // -------------------------------------------------------------
  setupHUDControls() {
    if (this.prevPageBtn) {
      this.prevPageBtn.addEventListener('click', () => this.advanceStation(-1));
    }
    if (this.nextPageBtn) {
      this.nextPageBtn.addEventListener('click', () => this.advanceStation(1));
    }
  }

  advanceStation(direction) {
    const targetIndex = Math.max(0, Math.min(this.stages.length - 1, this.currentStationIndex + direction));
    this.goToStation(targetIndex);
  }

  goToStation(index) {
    const target = this.stages[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateReaderHUD(index) {
    const info = this.stationTitles[index] || this.stationTitles[0];
    if (this.hudChapterTitle) {
      this.hudChapterTitle.textContent = info.name;
    }
    if (this.hudPageIndicator) {
      this.hudPageIndicator.textContent = info.page;
    }

    if (this.prevPageBtn) {
      this.prevPageBtn.disabled = index === 0;
    }
    if (this.nextPageBtn) {
      this.nextPageBtn.disabled = index === this.stationTitles.length - 1;
    }

    if (!this.hudActionsContainer) return;
    this.hudActionsContainer.innerHTML = '';

    if (index === 0) {
      this.hudActionsContainer.innerHTML = `
        <a href="files/khoa-bui-28-02-2025.pdf" class="hud-pill-btn" download><i class="fa-solid fa-file-arrow-down"></i> Download CV</a>
        <button class="hud-pill-btn hud-pill-highlight" id="hud-fly-next"><i class="fa-solid fa-plane-departure"></i> Fly Ahead ▹</button>
      `;
      const btn = document.getElementById('hud-fly-next');
      if (btn) btn.addEventListener('click', () => this.advanceStation(1));
    } else if (index === 1) {
      this.hudActionsContainer.innerHTML = `
        <a href="files/khoa-bui-28-02-2025.pdf" class="hud-pill-btn" download><i class="fa-solid fa-download"></i> Official CV</a>
        <button class="hud-pill-btn" id="hud-open-dossier"><i class="fa-solid fa-layer-group"></i> Full Bio Dossier</button>
      `;
      const btn = document.getElementById('hud-open-dossier');
      if (btn) btn.addEventListener('click', () => this.openDrawer('dossier'));
    } else if (index === 2) {
      this.hudActionsContainer.innerHTML = `
        <button class="hud-pill-btn" id="hud-view-matrix"><i class="fa-solid fa-microchip"></i> Tech Stack Details</button>
      `;
      const btn = document.getElementById('hud-view-matrix');
      if (btn) btn.addEventListener('click', () => this.openDrawer('dossier'));
    } else if (index === 3) {
      this.hudActionsContainer.innerHTML = `
        <a href="storytelling/car/" class="hud-pill-btn hud-pill-highlight"><i class="fa-solid fa-car"></i> AETHER GT 3D</a>
        <a href="storytelling/alphabet/en/" class="hud-pill-btn"><i class="fa-solid fa-cube"></i> Alphabet Odyssey</a>
        <a href="https://eatwhat.io.vn" target="_blank" rel="noopener noreferrer" class="hud-pill-btn"><i class="fa-solid fa-utensils"></i> What To Eat</a>
      `;
    } else if (index === 4 || index === 5) {
      this.hudActionsContainer.innerHTML = `
        <button class="hud-pill-btn hud-pill-highlight" id="hud-career-dossier"><i class="fa-solid fa-timeline"></i> Interactive Career Dossier</button>
      `;
      const btn = document.getElementById('hud-career-dossier');
      if (btn) btn.addEventListener('click', () => this.openDrawer('dossier'));
    } else if (index === 6) {
      this.hudActionsContainer.innerHTML = `
        <button class="hud-pill-btn hud-pill-highlight" id="hud-send-msg"><i class="fa-solid fa-paper-plane"></i> Send Transmission ✉</button>
        <a href="https://www.linkedin.com/in/khoa-bui-anh-698ab2173" target="_blank" rel="noopener noreferrer" class="hud-pill-btn"><i class="fa-brands fa-linkedin-in"></i> LinkedIn</a>
        <a href="https://github.com/fxanhkhoa" target="_blank" rel="noopener noreferrer" class="hud-pill-btn"><i class="fa-brands fa-github"></i> GitHub</a>
      `;
      const btn = document.getElementById('hud-send-msg');
      if (btn) btn.addEventListener('click', () => this.openDrawer('transmission'));
    }
  }

  // -------------------------------------------------------------
  // Keyboard Navigation
  // -------------------------------------------------------------
  setupKeyboardNavigation() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        this.advanceStation(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.advanceStation(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.goToStation(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        this.goToStation(6);
      } else if (e.key === 'Escape') {
        this.closeDrawer();
      } else if (e.key.toLowerCase() === 'c') {
        this.openDrawer('transmission');
      }
    });
  }

  // -------------------------------------------------------------
  // Slide-Over Action Drawer (Contact & Detailed Dossier)
  // -------------------------------------------------------------
  setupDrawerControls() {
    if (this.closeDrawerBtn) {
      this.closeDrawerBtn.addEventListener('click', () => this.closeDrawer());
    }
    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener('click', () => this.closeDrawer());
    }

    this.openContactBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer('transmission');
      });
    });

    this.openDossierBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer('dossier');
      });
    });

    this.drawerTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchDrawerTab(tab);
      });
    });
  }

  openDrawer(tabName = 'transmission') {
    if (this.actionDrawer) {
      this.actionDrawer.classList.add('open');
      if (this.drawerBackdrop) this.drawerBackdrop.classList.add('open');
      this.switchDrawerTab(tabName);
    }
  }

  closeDrawer() {
    if (this.actionDrawer) {
      this.actionDrawer.classList.remove('open');
      if (this.drawerBackdrop) this.drawerBackdrop.classList.remove('open');
    }
  }

  switchDrawerTab(tabName) {
    this.drawerTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    this.drawerTabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.getAttribute('id') === `drawer-tab-${tabName}`);
    });
  }

  // -------------------------------------------------------------
  // Header Controls (Auto Flight Tour & Sound)
  // -------------------------------------------------------------
  setupHeaderControls() {
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        this.isMuted = !this.isMuted;
        if (!this.isMuted) {
          this.initAudio();
          this.soundToggleBtn.classList.add('active');
          this.soundToggleBtn.querySelector('i').className = 'fa-solid fa-volume-high';
          this.soundToggleBtn.querySelector('span').textContent = 'Sound On';
          this.playStationTone(this.currentStationIndex);
        } else {
          this.soundToggleBtn.classList.remove('active');
          this.soundToggleBtn.querySelector('i').className = 'fa-solid fa-volume-xmark';
          this.soundToggleBtn.querySelector('span').textContent = 'Muted';
        }
      });
    }

    if (this.tourToggleBtn) {
      this.tourToggleBtn.addEventListener('click', () => {
        if (this.isTouring) {
          this.stopAutoTour();
        } else {
          this.startAutoTour();
        }
      });
    }

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
    this.tourToggleBtn.querySelector('span').textContent = 'Pause Flight';

    this.tourInterval = setInterval(() => {
      if (this.currentStationIndex >= this.stages.length - 1) {
        this.stopAutoTour();
        return;
      }
      this.advanceStation(1);
    }, 5500);
  }

  stopAutoTour() {
    this.isTouring = false;
    clearInterval(this.tourInterval);
    if (this.tourToggleBtn) {
      this.tourToggleBtn.classList.remove('active');
      this.tourToggleBtn.querySelector('i').className = 'fa-solid fa-play';
      this.tourToggleBtn.querySelector('span').textContent = 'Auto Fly';
    }
  }

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

  setupCompanyTabs() {
    document.querySelectorAll('.company-tab-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const targetCompany = this.getAttribute('data-company');

        document.querySelectorAll('.company-tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        document.querySelectorAll('.company-section-pane').forEach(p => p.classList.remove('active'));
        const pane = document.getElementById(targetCompany);
        if (pane) pane.classList.add('active');
      });
    });

    document.querySelectorAll('.subtab-pill').forEach(btn => {
      btn.addEventListener('click', function () {
        const pane = this.closest('.company-section-pane');
        const targetSub = this.getAttribute('data-sub');

        pane.querySelectorAll('.subtab-pill').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        pane.querySelectorAll('.project-dossier-card').forEach(c => c.classList.remove('active'));
        const content = pane.querySelector(`#${targetSub}`);
        if (content) content.classList.add('active');
      });
    });
  }

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
}

export function initPortfolioApp(SceneClass) {
  document.addEventListener('DOMContentLoaded', () => {
    new PortfolioController(SceneClass);
  });
}
