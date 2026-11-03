/**
 * AETHER GT - Scrollytelling Product Tour Orchestrator
 * Coordinates Three.js 3D exploded view, scroll milestones, audio effects,
 * interactive studio customizer, and HUD telemetry updates.
 */

import { SceneEngine } from './scene-engine.js';
import { carAudio } from './car-audio.js';

class CarTourApp {
  constructor() {
    this.sceneEngine = null;
    this.currentStageIndex = 0;
    this.isTouring = false;
    this.tourInterval = null;
    this.isDoorsOpen = false;
    this.isWingDeployed = false;

    // DOM Elements
    this.canvasContainer = document.getElementById('canvas-container');
    this.scrollMeter = document.getElementById('scroll-meter');
    this.stages = document.querySelectorAll('.tour-stage');
    this.railDots = document.querySelectorAll('.rail-dot');
    this.soundBtn = document.getElementById('sound-toggle-btn');
    this.tourBtn = document.getElementById('tour-toggle-btn');
    this.doorsBtn = document.getElementById('doors-toggle-btn');
    this.wingBtn = document.getElementById('wing-toggle-btn');
    this.explodeSlider = document.getElementById('explode-slider');
    this.swatchButtons = document.querySelectorAll('.swatch-btn');

    this.init();
  }

  init() {
    // 1. Initialize 3D Scene
    this.sceneEngine = new SceneEngine(this.canvasContainer);

    // 2. Setup scroll listeners & UI interactions
    this.setupScrollListener();
    this.setupUIControls();
    this.setupCustomizer();
    this.setupKeyboardControls();

    // 3. Initial check
    this.handleScroll();
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

    // Update top progress line
    if (this.scrollMeter) {
      this.scrollMeter.style.width = `${(totalProgress * 100).toFixed(1)}%`;
    }

    // Determine current active stage
    const totalStages = this.stages.length;
    let activeIndex = 0;
    let minDistance = Infinity;
    const viewCenter = window.innerHeight * 0.45;

    this.stages.forEach((stage, idx) => {
      const rect = stage.getBoundingClientRect();
      const distance = Math.abs(rect.top - viewCenter);
      if (distance < minDistance) {
        minDistance = distance;
        activeIndex = idx;
      }
    });

    // Calculate fractional scroll progress for camera & exploded view
    const firstStage = this.stages[0];
    const lastStage = this.stages[totalStages - 1];

    if (firstStage && lastStage) {
      const startY = firstStage.offsetTop;
      const endY = lastStage.offsetTop;
      const totalSpan = endY - startY;
      let rawProgress = ((scrollY - startY) / (totalSpan || 1)) * (totalStages - 1);
      rawProgress = Math.max(0, Math.min(totalStages - 1, rawProgress));

      if (this.sceneEngine) {
        this.sceneEngine.setScrollProgress(rawProgress);
      }
    }

    // Handle stage change events & audio feedback
    if (activeIndex !== this.currentStageIndex) {
      this.onStageChange(activeIndex);
    }
  }

  onStageChange(newIndex) {
    const prevIndex = this.currentStageIndex;
    this.currentStageIndex = newIndex;

    // Highlight active stage card
    this.stages.forEach((st, idx) => {
      st.classList.toggle('active', idx === newIndex);
    });

    // Highlight rail dot
    this.railDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === newIndex);
    });

    // Trigger audio cues based on mechanical transitions
    if (newIndex === 2 || newIndex === 3) {
      // Exploding powertrain or suspension
      carAudio.playPneumaticRelease();
    } else if (prevIndex === 2 && newIndex < 2) {
      // Reassembly snap
      carAudio.playSnapLock();
    } else if (newIndex === 5) {
      // Autonomous LiDAR scanner pulse
      carAudio.playRadarPing();
    } else {
      carAudio.playClick();
    }
  }

  setupUIControls() {
    // Sound Toggle
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', () => {
        const isMuted = carAudio.toggleMute();
        this.updateSoundButtonUI(isMuted);
      });
      this.updateSoundButtonUI(carAudio.isMuted);
    }

    // Auto Tour Toggle
    if (this.tourBtn) {
      this.tourBtn.addEventListener('click', () => {
        this.toggleTourMode();
      });
    }

    // Chapter Rail Dots Click
    this.railDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const stageIndex = parseInt(dot.dataset.stage, 10);
        this.jumpToStage(stageIndex);
      });
    });

    // Hotspot Pin Click -> Jump to related stage
    document.querySelectorAll('.hotspot-pin').forEach((pin) => {
      pin.addEventListener('click', () => {
        const targetStage = parseInt(pin.dataset.stage, 10);
        if (!isNaN(targetStage)) {
          this.jumpToStage(targetStage);
        }
      });
    });
  }

  setupCustomizer() {
    // Paint Swatch Selector
    this.swatchButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.swatchButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const hex = parseInt(btn.dataset.color, 16);
        if (this.sceneEngine && this.sceneEngine.car) {
          this.sceneEngine.car.setPaintColor(hex);
          carAudio.playClick();
        }
      });
    });

    // Scissor Doors Toggle Button
    if (this.doorsBtn) {
      this.doorsBtn.addEventListener('click', () => {
        this.isDoorsOpen = !this.isDoorsOpen;
        this.doorsBtn.classList.toggle('active', this.isDoorsOpen);
        if (this.sceneEngine && this.sceneEngine.car) {
          this.sceneEngine.car.setDoorsProgress(this.isDoorsOpen ? 1.0 : 0.0);
          carAudio.playPneumaticRelease();
        }
      });
    }

    // Active Aero Wing Toggle Button
    if (this.wingBtn) {
      this.wingBtn.addEventListener('click', () => {
        this.isWingDeployed = !this.isWingDeployed;
        this.wingBtn.classList.toggle('active', this.isWingDeployed);
        if (this.sceneEngine && this.sceneEngine.car) {
          this.sceneEngine.car.setWingProgress(this.isWingDeployed ? 1.0 : 0.0);
          carAudio.playClick();
        }
      });
    }

    // Manual Exploded-View Slider
    if (this.explodeSlider) {
      this.explodeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        if (this.sceneEngine && this.sceneEngine.car) {
          this.sceneEngine.car.setExplosionProgress(val);
        }
      });
    }
  }

  jumpToStage(index) {
    if (index < 0 || index >= this.stages.length) return;
    const targetStage = this.stages[index];
    if (targetStage) {
      targetStage.scrollIntoView({ behavior: 'smooth' });
      carAudio.playClick();
    }
  }

  toggleTourMode() {
    this.isTouring = !this.isTouring;
    this.tourBtn.classList.toggle('active', this.isTouring);

    if (this.isTouring) {
      this.tourBtn.innerHTML = '<i class="fa-solid fa-pause"></i><span>Pause Tour</span>';
      this.startTourLoop();
    } else {
      this.tourBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>Auto Tour</span>';
      this.stopTourLoop();
    }
  }

  startTourLoop() {
    this.stopTourLoop();
    this.tourInterval = setInterval(() => {
      let nextIndex = this.currentStageIndex + 1;
      if (nextIndex >= this.stages.length) {
        nextIndex = 0;
      }
      this.jumpToStage(nextIndex);
    }, 6000);
  }

  stopTourLoop() {
    if (this.tourInterval) {
      clearInterval(this.tourInterval);
      this.tourInterval = null;
    }
  }

  updateSoundButtonUI(isMuted) {
    if (!this.soundBtn) return;
    this.soundBtn.innerHTML = isMuted
      ? '<i class="fa-solid fa-volume-xmark"></i><span>Muted</span>'
      : '<i class="fa-solid fa-volume-high"></i><span>Sound On</span>';
    this.soundBtn.classList.toggle('active', !isMuted);
  }

  setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        this.jumpToStage(Math.min(this.stages.length - 1, this.currentStageIndex + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        this.jumpToStage(Math.max(0, this.currentStageIndex - 1));
      } else if (e.key === 'm' || e.key === 'M') {
        if (this.soundBtn) this.soundBtn.click();
      } else if (e.key === 't' || e.key === 'T') {
        if (this.tourBtn) this.tourBtn.click();
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new CarTourApp();
});
