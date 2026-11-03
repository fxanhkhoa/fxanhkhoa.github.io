/**
 * Interactive 3D Scrollytelling Scene for Kevin Bui's Profile
 * Built with Three.js in the signature Alphabet Odyssey style.
 *
 * Features:
 * - 7 Unique 3D chapter worlds (Extruded 3D "KB" monogram, Holographic System Core,
 *   Orbital Tech Gyroscope, 3D Masterpieces, Career Milestones spline,
 *   Freelance Crystal polyhedra, and Quantum Transmission Beacon).
 * - Drag-to-rotate 3D model interaction with physics inertia.
 * - Tap / Click wobble spring bounce animation.
 * - Dynamic camera choreography and smooth chapter blending synchronized with scroll.
 * - 1400+ twinkling celestial starfield and dynamic PBR lighting.
 */

import * as THREE from 'three';
import { FontLoader } from '../storytelling/alphabet/shared/vendor/FontLoader.js';
import { TextGeometry } from '../storytelling/alphabet/shared/vendor/TextGeometry.js';
import { FONT_DATA } from '../storytelling/alphabet/shared/fonts/font-data.js';

export class ProfileThreeScene {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.font = null;

    // Lighting
    this.ambientLight = null;
    this.keyLight = null;
    this.rimLight = null;
    this.accentPointLight = null;

    // Starfield & Particles
    this.starfield = null;
    this.floatingDust = null;

    // Chapter 3D Groups (0 to 6)
    this.chapterGroups = [];
    this.activeChapterIndex = 0;
    this.scrollProgress = 0;
    this.targetCameraY = 0;

    // Interaction & Mouse
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.raycaster = new THREE.Raycaster();
    this.mouseVector = new THREE.Vector2();
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.userRotation = { x: 0, y: 0 };
    this.userVelocity = { velX: 0, velY: 0 };

    // Click wobble bounce
    this.wobble = { active: false, time: 0, amp: 0 };
    this.clock = new THREE.Clock();

    // Chapter Color Schemes
    this.chapterThemes = [
      { primary: 0x00f0ff, secondary: 0x8b5cf6, bg: '#080716' }, // 00 Prologue (Cyan/Purple)
      { primary: 0x00f5d4, secondary: 0x6366f1, bg: '#060b17' }, // 01 Origin (Emerald/Indigo)
      { primary: 0xa855f7, secondary: 0x38bdf8, bg: '#0b0718' }, // 02 Arsenal (Neon Purple/Cyan)
      { primary: 0xffd166, secondary: 0xff477e, bg: '#14091c' }, // 03 Masterpieces (Gold/Pink)
      { primary: 0x3b82f6, secondary: 0x06b6d4, bg: '#050c1e' }, // 04 Odyssey (Sapphire/Cyan)
      { primary: 0xec4899, secondary: 0xf59e0b, bg: '#160818' }, // 05 Expeditions (Fuchsia/Amber)
      { primary: 0x00f0ff, secondary: 0x10b981, bg: '#040812' }  // 06 Epilogue (Radiant Cyan)
    ];

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLights();
    this.setupStarfield();
    this.setupEventListeners();
    this.loadFont();
    this.buildChapterWorlds();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x080716, 0.024);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 11);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    this.keyLight.position.set(6, 9, 8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x6699ff, 1.4);
    this.rimLight.position.set(-8, -6, -5);
    this.scene.add(this.rimLight);

    this.accentPointLight = new THREE.PointLight(0x00f0ff, 3.5, 20, 1.2);
    this.accentPointLight.position.set(2, 0, 4);
    this.scene.add(this.accentPointLight);
  }

  setupStarfield() {
    const starCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x00f0ff),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0xffd166),
      new THREE.Color(0xffffff),
      new THREE.Color(0xa7f3d0)
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 7 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 65;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  loadFont() {
    try {
      const loader = new FontLoader();
      this.font = loader.parse(FONT_DATA);
    } catch (e) {
      console.warn('FontLoader parse fallback:', e);
    }
  }

  buildChapterWorlds() {
    // Determine 3D model center offset based on screen width
    const isDesktop = this.width > 960;
    const offsetX = isDesktop ? 2.5 : 0;
    const offsetY = isDesktop ? 0 : 0.6;

    // -------------------------------------------------------------
    // Chapter 0: 3D Extruded "KB" Monogram with Golden Orbiters
    // -------------------------------------------------------------
    const group0 = new THREE.Group();
    group0.position.set(offsetX, offsetY, 0);

    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      emissive: 0x0a2233,
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      reflectivity: 0.95
    });

    if (this.font) {
      const kbGeo = new TextGeometry('KB', {
        font: this.font,
        size: 2.2,
        height: 0.55,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.08,
        bevelSegments: 5
      });
      kbGeo.computeBoundingBox();
      const centerOffsetX = -0.5 * (kbGeo.boundingBox.max.x - kbGeo.boundingBox.min.x);
      const centerOffsetY = -0.5 * (kbGeo.boundingBox.max.y - kbGeo.boundingBox.min.y);
      kbGeo.translate(centerOffsetX, centerOffsetY, -0.25);

      const kbMesh = new THREE.Mesh(kbGeo, goldMaterial);
      kbMesh.castShadow = true;
      group0.add(kbMesh);
    } else {
      const fallbackMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1.2, 0.4, 64, 16), goldMaterial);
      group0.add(fallbackMesh);
    }

    // Outer Gyroscope Planetary Ring
    const ringGeo = new THREE.TorusGeometry(2.6, 0.05, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x4c1d95,
      metalness: 0.8,
      roughness: 0.3
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI * 0.35;
    group0.add(ringMesh);

    // Orbiting Satellites
    const satellitesGroup0 = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffa500 })
      );
      const angle = (i * Math.PI * 2) / 3;
      sat.position.set(Math.cos(angle) * 2.6, Math.sin(angle) * 2.6, 0);
      satellitesGroup0.add(sat);
    }
    satellitesGroup0.rotation.x = Math.PI * 0.35;
    group0.add(satellitesGroup0);

    group0.userData = { satellites: satellitesGroup0, ring: ringMesh };
    this.scene.add(group0);
    this.chapterGroups.push(group0);

    // -------------------------------------------------------------
    // Chapter 1: Holographic Systems Core (Layered Crystalline Polyhedron)
    // -------------------------------------------------------------
    const group1 = new THREE.Group();
    group1.position.set(offsetX, offsetY, 0);
    group1.visible = false;

    // Inner glowing crystal
    const innerCrystal = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.3, 0),
      new THREE.MeshPhysicalMaterial({
        color: 0x00f5d4,
        emissive: 0x044338,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.85,
        ior: 1.5,
        reflectivity: 0.9
      })
    );
    group1.add(innerCrystal);

    // Outer wireframe cage
    const wireCage = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.85, 1),
      new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        wireframe: true,
        emissive: 0x312e81
      })
    );
    group1.add(wireCage);

    // Orbiting data nodes
    const dataNodes = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const node = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.18, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4 })
      );
      const theta = (i * Math.PI * 2) / 8;
      node.position.set(Math.cos(theta) * 2.4, Math.sin(theta) * 2.4, (Math.random() - 0.5) * 1.5);
      dataNodes.add(node);
    }
    group1.add(dataNodes);

    group1.userData = { inner: innerCrystal, cage: wireCage, nodes: dataNodes };
    this.scene.add(group1);
    this.chapterGroups.push(group1);

    // -------------------------------------------------------------
    // Chapter 2: Orbital Tech Gyroscope (Concentric Tech Rings)
    // -------------------------------------------------------------
    const group2 = new THREE.Group();
    group2.position.set(offsetX, offsetY, 0);
    group2.visible = false;

    const ringMat1 = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.8, roughness: 0.2 });
    const ringMat2 = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.8, roughness: 0.2 });
    const ringMat3 = new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.8, roughness: 0.2 });

    const gRing1 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.06, 16, 64), ringMat1);
    const gRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.06, 16, 64), ringMat2);
    const gRing3 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.06, 16, 64), ringMat3);

    group2.add(gRing1);
    group2.add(gRing2);
    group2.add(gRing3);

    // Tech Gemstone in center
    const centerGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.85, 0),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: 0x38bdf8,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.7,
        clearcoat: 1.0
      })
    );
    group2.add(centerGem);

    group2.userData = { ring1: gRing1, ring2: gRing2, ring3: gRing3, gem: centerGem };
    this.scene.add(group2);
    this.chapterGroups.push(group2);

    // -------------------------------------------------------------
    // Chapter 3: Sci-Fi Masterpieces (Hypercar Silhouette & 3D 'A')
    // -------------------------------------------------------------
    const group3 = new THREE.Group();
    group3.position.set(offsetX, offsetY, 0);
    group3.visible = false;

    // Sleek Hypercar wireframe speed-ring
    const carRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.08, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x0099bb })
    );
    carRing.rotation.x = Math.PI * 0.4;
    group3.add(carRing);

    // 3D Extruded letter "A" for Alphabet Odyssey
    if (this.font) {
      const aGeo = new TextGeometry('A', {
        font: this.font,
        size: 1.8,
        height: 0.45,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.06
      });
      aGeo.computeBoundingBox();
      const aOffX = -0.5 * (aGeo.boundingBox.max.x - aGeo.boundingBox.min.x);
      const aOffY = -0.5 * (aGeo.boundingBox.max.y - aGeo.boundingBox.min.y);
      aGeo.translate(aOffX + 0.8, aOffY, 0);

      const aMesh = new THREE.Mesh(
        aGeo,
        new THREE.MeshPhysicalMaterial({ color: 0xffd166, emissive: 0x996600, roughness: 0.2, metalness: 0.7 })
      );
      group3.add(aMesh);
    }

    // Mini Hypercar energy reactor
    const carReactor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.4, 32),
      new THREE.MeshStandardMaterial({ color: 0x111625, metalness: 0.9, roughness: 0.3 })
    );
    carReactor.position.set(-1.0, 0, 0);
    carReactor.rotation.x = Math.PI * 0.5;
    group3.add(carReactor);

    group3.userData = { ring: carRing, reactor: carReactor };
    this.scene.add(group3);
    this.chapterGroups.push(group3);

    // -------------------------------------------------------------
    // Chapter 4: Career Odyssey (Floating Milestone Monoliths)
    // -------------------------------------------------------------
    const group4 = new THREE.Group();
    group4.position.set(offsetX, offsetY, 0);
    group4.visible = false;

    const milestonesGroup = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1e3a8a,
      metalness: 0.8,
      roughness: 0.2
    });

    const pillars = [];
    for (let i = 0; i < 4; i++) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.6 + i * 0.35, 0.45), pillarMat);
      const px = (i - 1.5) * 1.25;
      const py = (i - 1.5) * 0.25;
      pillar.position.set(px, py, (i % 2 === 0 ? 0.4 : -0.4));
      milestonesGroup.add(pillar);
      pillars.push(pillar);
    }
    group4.add(milestonesGroup);

    // Spline laser connector
    const curve = new THREE.CatmullRomCurve3(pillars.map(p => p.position));
    const splineGeo = new THREE.TubeGeometry(curve, 32, 0.04, 8, false);
    const splineMesh = new THREE.Mesh(
      splineGeo,
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    group4.add(splineMesh);

    group4.userData = { milestones: milestonesGroup, pillars };
    this.scene.add(group4);
    this.chapterGroups.push(group4);

    // -------------------------------------------------------------
    // Chapter 5: Freelance Expeditions (Equilibrium Polyhedra)
    // -------------------------------------------------------------
    const group5 = new THREE.Group();
    group5.position.set(offsetX, offsetY, 0);
    group5.visible = false;

    const crystals = new THREE.Group();
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xec4899,
      emissive: 0x831843,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.8,
      clearcoat: 1.0
    });

    for (let i = 0; i < 5; i++) {
      const cMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.65 + (i % 2) * 0.25, 0), crystalMat);
      const angle = (i * Math.PI * 2) / 5;
      cMesh.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, (Math.random() - 0.5) * 1.2);
      crystals.add(cMesh);
    }
    group5.add(crystals);

    group5.userData = { crystals };
    this.scene.add(group5);
    this.chapterGroups.push(group5);

    // -------------------------------------------------------------
    // Chapter 6: Quantum Transmission Beacon (Pulse Radar Waves)
    // -------------------------------------------------------------
    const group6 = new THREE.Group();
    group6.position.set(offsetX, offsetY, 0);
    group6.visible = false;

    // Beacon tower
    const towerGeo = new THREE.ConeGeometry(0.8, 2.5, 6);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x005577,
      metalness: 0.8,
      roughness: 0.2
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.rotation.x = Math.PI;
    group6.add(tower);

    // Radar pulse rings
    const pulseRings = [];
    for (let i = 0; i < 3; i++) {
      const pRing = new THREE.Mesh(
        new THREE.RingGeometry(1.2 + i * 0.7, 1.25 + i * 0.7, 32),
        new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6 - i * 0.18
        })
      );
      pRing.position.set(0, -1.2, 0);
      pRing.rotation.x = Math.PI * 0.5;
      group6.add(pRing);
      pulseRings.push(pRing);
    }

    group6.userData = { tower, pulseRings };
    this.scene.add(group6);
    this.chapterGroups.push(group6);

    this.updateThemeColors(0);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.handleResize());

    // Mouse / Touch Dragging to Rotate Active 3D Model
    this.container.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.userVelocity.velX = 0;
      this.userVelocity.velY = 0;
    });

    window.addEventListener('pointermove', (e) => {
      // Mouse Parallax
      this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
      this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.dragStart.x;
        const deltaY = e.clientY - this.dragStart.y;
        this.userVelocity.velX = deltaX * 0.007;
        this.userVelocity.velY = deltaY * 0.007;
        this.userRotation.y += this.userVelocity.velX;
        this.userRotation.x += this.userVelocity.velY;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
      }
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    // Tap / Click Wobble Bounce
    this.container.addEventListener('click', (e) => {
      this.mouseVector.x = (e.clientX / this.width) * 2 - 1;
      this.mouseVector.y = -(e.clientY / this.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouseVector, this.camera);
      const activeGroup = this.chapterGroups[this.activeChapterIndex];
      if (activeGroup) {
        const intersects = this.raycaster.intersectObjects(activeGroup.children, true);
        if (intersects.length > 0) {
          this.triggerWobble();
        }
      }
    });
  }

  triggerWobble() {
    this.wobble.active = true;
    this.wobble.time = 0;
    this.wobble.amp = 0.35;
  }

  onScroll(scrollProgress, activeChapterIndex) {
    this.scrollProgress = scrollProgress;

    if (activeChapterIndex !== this.activeChapterIndex && activeChapterIndex >= 0 && activeChapterIndex < this.chapterGroups.length) {
      this.transitionToChapter(activeChapterIndex);
    }

    // Camera subtle drift
    this.targetCameraY = (scrollProgress - 0.5) * -1.8;
  }

  transitionToChapter(newIndex) {
    const oldIndex = this.activeChapterIndex;
    this.activeChapterIndex = newIndex;

    this.chapterGroups.forEach((group, idx) => {
      if (idx === newIndex) {
        group.visible = true;
        group.scale.set(0.2, 0.2, 0.2);
      }
    });

    this.updateThemeColors(newIndex);
  }

  updateThemeColors(index) {
    const theme = this.chapterThemes[index] || this.chapterThemes[0];
    if (this.accentPointLight) {
      this.accentPointLight.color.setHex(theme.primary);
    }
    if (this.rimLight) {
      this.rimLight.color.setHex(theme.secondary);
    }
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Reposition chapter groups for responsive layout
    const isDesktop = this.width > 960;
    const offsetX = isDesktop ? 2.5 : 0;
    const offsetY = isDesktop ? 0 : 0.6;

    this.chapterGroups.forEach(grp => {
      grp.position.x = offsetX;
      grp.position.y = offsetY;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Mouse Parallax Lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Apply Camera Position
    this.camera.position.x = this.mouse.x * 0.8;
    this.camera.position.y += (this.targetCameraY + this.mouse.y * 0.5 - this.camera.position.y) * 0.06;
    this.camera.lookAt(0, 0, 0);

    // Starfield subtle rotation
    if (this.starfield) {
      this.starfield.rotation.y = elapsedTime * 0.02;
      this.starfield.rotation.x = elapsedTime * 0.01;
    }

    // Inertial user rotation decay
    if (!this.isDragging) {
      this.userVelocity.velX *= 0.94;
      this.userVelocity.velY *= 0.94;
      this.userRotation.y += this.userVelocity.velX;
      this.userRotation.x += this.userVelocity.velY;
    }

    // Click Wobble decay
    let wobbleScale = 1;
    if (this.wobble.active) {
      this.wobble.time += delta * 12;
      this.wobble.amp *= 0.92;
      wobbleScale = 1 + Math.sin(this.wobble.time) * this.wobble.amp;
      if (this.wobble.amp < 0.01) {
        this.wobble.active = false;
      }
    }

    // Animate Active Chapter Group
    this.chapterGroups.forEach((group, idx) => {
      if (!group.visible) return;

      if (idx === this.activeChapterIndex) {
        // Scale in to 1.0 smoothly
        group.scale.lerp(new THREE.Vector3(wobbleScale, wobbleScale, wobbleScale), 0.08);

        // Apply base idle rotation + user rotation
        group.rotation.y = elapsedTime * 0.25 + this.userRotation.y;
        group.rotation.x = Math.sin(elapsedTime * 0.4) * 0.12 + this.userRotation.x;
      } else {
        // Fade/scale out
        group.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.1);
        if (group.scale.x < 0.05) {
          group.visible = false;
        }
      }

      // Specific Chapter Inner Animations
      if (idx === 0 && group.userData.satellites) {
        group.userData.satellites.rotation.z = -elapsedTime * 0.8;
      } else if (idx === 1 && group.userData.inner) {
        group.userData.inner.rotation.y = -elapsedTime * 0.6;
        group.userData.cage.rotation.y = elapsedTime * 0.4;
      } else if (idx === 2 && group.userData.ring1) {
        group.userData.ring1.rotation.x = elapsedTime * 0.7;
        group.userData.ring2.rotation.y = elapsedTime * 0.9;
        group.userData.ring3.rotation.z = elapsedTime * 1.1;
      } else if (idx === 3 && group.userData.ring) {
        group.userData.ring.rotation.z = elapsedTime * 1.2;
      } else if (idx === 4 && group.userData.pillars) {
        group.userData.pillars.forEach((p, pIdx) => {
          p.position.y += Math.sin(elapsedTime * 1.5 + pIdx) * 0.003;
        });
      } else if (idx === 5 && group.userData.crystals) {
        group.userData.crystals.rotation.y = elapsedTime * 0.5;
      } else if (idx === 6 && group.userData.pulseRings) {
        group.userData.pulseRings.forEach((r, rIdx) => {
          const s = 1 + ((elapsedTime * 1.2 + rIdx * 0.6) % 1.8);
          r.scale.set(s, s, s);
        });
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}
