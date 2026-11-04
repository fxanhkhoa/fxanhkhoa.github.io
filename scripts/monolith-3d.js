/**
 * Concept 2: Floating Obsidian Monoliths / Architectural Spatial Gallery
 * Minimalist dark frosted glass & chrome monoliths standing in an atmospheric studio.
 * Staggered zig-zag depth formation receding into the distance.
 */

import * as THREE from 'three';

export class MonolithThreeScene {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    this.monoliths = [];
    this.monolithCount = 7;
    this.monolithSpacing = 28;

    this.scrollProgress = 0; // 0.0 to 6.0
    this.targetProgress = 0;
    this.currentStation = 0;

    this.spotLight = null;
    this.ambientLight = null;

    // Mouse Parallax & Orbit
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.userOrbit = { azimuth: 0, elevation: 0 };

    this.onStationChange = null;

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.setupFloor();
    this.buildMonoliths();
    this.setupEventListeners();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060914, 0.018);

    this.camera = new THREE.PerspectiveCamera(46, this.width / this.height, 0.1, 300);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(this.ambientLight);

    // Dynamic Tracking Spotlight
    this.spotLight = new THREE.SpotLight(0xfff5ea, 3.2, 50, Math.PI * 0.35, 0.45, 1.2);
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.scene.add(this.spotLight);

    // Cool neon rim light from beneath
    const cyanRim = new THREE.DirectionalLight(0x00f0ff, 1.4);
    cyanRim.position.set(-15, -5, -20);
    this.scene.add(cyanRim);

    const purpleRim = new THREE.DirectionalLight(0x8b5cf6, 1.4);
    purpleRim.position.set(15, -5, -20);
    this.scene.add(purpleRim);
  }

  setupFloor() {
    const floorGeo = new THREE.PlaneGeometry(160, 300, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050711,
      roughness: 0.25,
      metalness: 0.6
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -3.2, -120);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Grid wire overlay on floor
    const gridHelper = new THREE.GridHelper(300, 60, 0x00f0ff, 0x1e293b);
    gridHelper.position.set(0, -3.18, -120);
    this.scene.add(gridHelper);
  }

  buildMonoliths() {
    const themes = [
      { num: '00', title: 'PROLOGUE', color: 0x00f0ff, x: 0 },
      { num: '01', title: 'ORIGIN STORY', color: 0x00f5d4, x: -5.5 },
      { num: '02', title: 'TECH ARSENAL', color: 0x8b5cf6, x: 5.5 },
      { num: '03', title: 'MASTERPIECES', color: 0xffd166, x: -5.0 },
      { num: '04', title: 'CAREER ODYSSEY', color: 0x3b82f6, x: 5.0 },
      { num: '05', title: 'FREELANCE', color: 0xec4899, x: -4.5 },
      { num: '06', title: 'TRANSMISSION', color: 0x10b981, x: 0 }
    ];

    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f22,
      roughness: 0.15,
      metalness: 0.85
    });

    themes.forEach((theme, i) => {
      const z = -i * this.monolithSpacing;
      const group = new THREE.Group();
      group.position.set(theme.x, 0, z);

      // 1. Towering Obsidian Monolith Slab
      const slabGeo = new THREE.BoxGeometry(3.6, 5.8, 0.4);
      const slab = new THREE.Mesh(slabGeo, obsidianMat);
      slab.castShadow = true;
      slab.receiveShadow = true;
      group.add(slab);

      // 2. Glowing Neon Border Frame
      const trimGeo = new THREE.BoxGeometry(3.68, 5.88, 0.42);
      const trimMat = new THREE.MeshStandardMaterial({
        color: theme.color,
        emissive: theme.color,
        emissiveIntensity: 0.5,
        wireframe: true
      });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      group.add(trim);

      // 3. Floating Kinetic Crystal hovering on top
      const crystalGeo = new THREE.OctahedronGeometry(0.85, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: theme.color,
        emissive: theme.color,
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.95
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(0, 3.8, 0);
      group.add(crystal);

      // 4. Subtle holographic station plaque on front of slab
      const plaque = this.createMonolithPlaque(theme);
      plaque.position.set(0, 0, 0.22);
      group.add(plaque);

      this.scene.add(group);

      this.monoliths.push({
        index: i,
        group,
        crystal,
        theme,
        baseX: theme.x,
        baseZ: z
      });
    });
  }

  createMonolithPlaque(theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 512, 760);
    grad.addColorStop(0, '#0d152e');
    grad.addColorStop(1, '#080d1e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 760);

    // Golden inner frame
    ctx.strokeStyle = `#${theme.color.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 464, 712);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText(`STATION // ${theme.num}`, 54, 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Space Grotesk", sans-serif';
    ctx.fillText(theme.title, 54, 160);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(54, 195);
    ctx.lineTo(458, 195);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Architectural Spatial Station', 54, 250);
    ctx.fillText('Scroll to advance forward', 54, 290);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(3.3, 4.9);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });

    return new THREE.Mesh(geo, mat);
  }

  setScrollProgress(progress) {
    this.targetProgress = Math.max(0, Math.min(this.monolithCount - 1, progress));
  }

  updateCameraMotion(delta) {
    this.scrollProgress += (this.targetProgress - this.scrollProgress) * 0.085;

    const clamped = Math.max(0, Math.min(this.monolithCount - 1, this.scrollProgress));
    const idx = Math.floor(clamped);
    const frac = clamped - idx;

    const cur = this.monoliths[idx];
    const nxt = this.monoliths[Math.min(this.monolithCount - 1, idx + 1)];

    // Interpolate target monolith position
    const targetX = THREE.MathUtils.lerp(cur.baseX, nxt.baseX, frac);
    const targetZ = THREE.MathUtils.lerp(cur.baseZ, nxt.baseZ, frac);

    // Parallax mouse offsets
    const px = this.mouse.x * 1.6 + this.userOrbit.azimuth;
    const py = this.mouse.y * 1.1 + this.userOrbit.elevation;

    // Camera sits in front of the active monolith looking at it
    this.camera.position.set(targetX * 0.65 + px, 0.8 + py, targetZ + 6.8);
    this.camera.lookAt(targetX, 0.2, targetZ);

    if (this.spotLight) {
      this.spotLight.position.set(targetX + 3, 7, targetZ + 5);
      this.spotLight.target.position.set(targetX, 0, targetZ);
      this.spotLight.target.updateMatrixWorld();
    }

    const rounded = Math.round(this.scrollProgress);
    if (rounded !== this.currentStation) {
      this.currentStation = rounded;
      if (this.onStationChange) {
        this.onStationChange(rounded);
      }
    }
  }

  updateMonoliths(delta, time) {
    this.monoliths.forEach((m, i) => {
      // Rotate crystal
      if (m.crystal) {
        m.crystal.rotation.x = time * 0.7 + i;
        m.crystal.rotation.y = time * 0.9;
        m.crystal.position.y = 3.8 + Math.sin(time * 2 + i) * 0.18;
      }

      // Proximity breathing
      const dist = this.camera.position.distanceTo(m.group.position);
      if (dist < 14) {
        const angle = (this.camera.position.x - m.baseX) * 0.04;
        m.group.rotation.y = angle;
      } else {
        m.group.rotation.y = 0;
      }
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.handleResize());

    this.container.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
      this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;

      if (this.isDragging) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        this.userOrbit.azimuth += dx * 0.008;
        this.userOrbit.elevation += dy * 0.008;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
      }
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    if (!this.isDragging) {
      this.userOrbit.azimuth *= 0.94;
      this.userOrbit.elevation *= 0.94;
    }

    this.updateCameraMotion(delta);
    this.updateMonoliths(delta, time);

    this.renderer.render(this.scene, this.camera);
  }
}
