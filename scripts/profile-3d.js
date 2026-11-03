/**
 * Scroll-Bound 3D Camera Path & Object Animation Timeline Engine
 *
 * The camera's position, field of view (FOV), lookAt target, and object animation timelines
 * (assembly, disassembly, exploded view, rotation, and lighting) are mapped directly
 * to continuous scroll depth.
 *
 * Built with Three.js for Kevin Bui's Portfolio.
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
    this.clock = new THREE.Clock();
    this.font = null;

    // Lighting
    this.ambientLight = null;
    this.keyLight = null;
    this.rimLight = null;
    this.accentPointLight = null;

    // Environmental elements
    this.starfield = null;
    this.gridFloor = null;

    // Continuous Scroll-Bound Camera & Timeline State
    this.scrollProgress = 0;       // Current damped progress (0.0 to 6.0)
    this.targetScrollProgress = 0; // Target progress (0.0 to 6.0)

    // Manual Drag Orbit & Mouse Parallax
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.userOrbit = { azimuth: 0, elevation: 0 };
    this.userVelocity = { velX: 0, velY: 0 };

    // Tap/Click spring bounce
    this.wobble = { active: false, time: 0, amp: 0 };
    this.raycaster = new THREE.Raycaster();
    this.mouseVector = new THREE.Vector2();

    // -------------------------------------------------------------
    // SCROLL-BOUND CAMERA KEYFRAMES (0.0 to 6.0)
    // Directly maps camera position, field of view, lookAt, and timeline states
    // -------------------------------------------------------------
    this.cameraKeyframes = [
      // Stage 0: Prologue // Wide Cinematic Front 3/4
      {
        pos: new THREE.Vector3(2.4, 0.6, 7.8),
        lookAt: new THREE.Vector3(1.2, 0.0, 0.0),
        fov: 52,
        lightColor: 0x00f0ff,
        rimColor: 0x8b5cf6,
        fogDensity: 0.024
      },
      // Stage 1: Origin // Low-angle macro zoom into Systems Core
      {
        pos: new THREE.Vector3(3.2, 1.6, 5.6),
        lookAt: new THREE.Vector3(1.0, 0.2, 0.0),
        fov: 40,
        lightColor: 0x00f5d4,
        rimColor: 0x6366f1,
        fogDensity: 0.026
      },
      // Stage 2: Arsenal // Dynamic high-angle orbit around Tech Gyroscope
      {
        pos: new THREE.Vector3(1.8, 3.4, 5.4),
        lookAt: new THREE.Vector3(1.2, 0.0, 0.0),
        fov: 48,
        lightColor: 0xa855f7,
        rimColor: 0x38bdf8,
        fogDensity: 0.025
      },
      // Stage 3: Masterpieces // Dramatic ground-level view of 3D showcases
      {
        pos: new THREE.Vector3(3.6, -0.4, 6.0),
        lookAt: new THREE.Vector3(1.0, 0.4, 0.0),
        fov: 44,
        lightColor: 0xffd166,
        rimColor: 0xff477e,
        fogDensity: 0.028
      },
      // Stage 4: Odyssey // Gliding alongside Enterprise Milestones spline
      {
        pos: new THREE.Vector3(2.2, 1.4, 4.8),
        lookAt: new THREE.Vector3(0.8, 0.3, -0.4),
        fov: 46,
        lightColor: 0x3b82f6,
        rimColor: 0x06b6d4,
        fogDensity: 0.025
      },
      // Stage 5: Expeditions // Equilibrium Polyhedra floating vantage
      {
        pos: new THREE.Vector3(3.4, 2.2, 5.2),
        lookAt: new THREE.Vector3(1.1, 0.1, 0.0),
        fov: 42,
        lightColor: 0xec4899,
        rimColor: 0xf59e0b,
        fogDensity: 0.026
      },
      // Stage 6: Epilogue // High-vantage cosmic broadcast perspective
      {
        pos: new THREE.Vector3(1.6, 3.8, 6.2),
        lookAt: new THREE.Vector3(0.8, -0.2, 0.0),
        fov: 54,
        lightColor: 0x00f0ff,
        rimColor: 0x10b981,
        fogDensity: 0.022
      }
    ];

    // Chapter Object Groups
    this.groupPrologue = null;
    this.groupOrigin = null;
    this.groupArsenal = null;
    this.groupMasterpieces = null;
    this.groupOdyssey = null;
    this.groupExpeditions = null;
    this.groupEpilogue = null;

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.setupStarfield();
    this.setupCyberGridFloor();
    this.setupEventListeners();
    this.loadFont();
    this.build3DTimelineObjects();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070612, 0.024);

    const initialKF = this.cameraKeyframes[0];
    this.camera = new THREE.PerspectiveCamera(initialKF.fov, this.width / this.height, 0.1, 100);
    this.camera.position.copy(initialKF.pos);
    this.camera.lookAt(initialKF.lookAt);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    this.keyLight.position.set(6, 9, 8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x8b5cf6, 1.5);
    this.rimLight.position.set(-8, -6, -5);
    this.scene.add(this.rimLight);

    this.accentPointLight = new THREE.PointLight(0x00f0ff, 3.8, 22, 1.2);
    this.accentPointLight.position.set(2, 1, 4);
    this.scene.add(this.accentPointLight);
  }

  setupStarfield() {
    const starCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x00f0ff),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0xffd166),
      new THREE.Color(0xffffff),
      new THREE.Color(0xec4899)
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 8 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70;

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

  setupCyberGridFloor() {
    // Subtle radial floor grid giving reference plane for spatial 3D camera travel
    const grid = new THREE.PolarGridHelper(18, 18, 8, 64, 0x00f0ff, 0x1f2638);
    grid.position.y = -2.6;
    grid.material.opacity = 0.25;
    grid.material.transparent = true;
    this.gridFloor = grid;
    this.scene.add(grid);
  }

  loadFont() {
    try {
      const loader = new FontLoader();
      this.font = loader.parse(FONT_DATA);
    } catch (e) {
      console.warn('FontLoader parse fallback:', e);
    }
  }

  // -------------------------------------------------------------
  // BUILD 3D OBJECTS FOR EACH TIMELINE STAGE
  // -------------------------------------------------------------
  build3DTimelineObjects() {
    const isDesktop = this.width > 960;
    const baseOffset = isDesktop ? 1.8 : 0;

    // Stage 0: 3D "KB" Monogram
    this.groupPrologue = new THREE.Group();
    this.groupPrologue.position.set(baseOffset, 0, 0);

    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      emissive: 0x071e2e,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 0.95,
      reflectivity: 0.95
    });

    if (this.font) {
      const kbGeo = new TextGeometry('KB', {
        font: this.font,
        size: 2.3,
        height: 0.55,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.08,
        bevelSegments: 5
      });
      kbGeo.computeBoundingBox();
      const ox = -0.5 * (kbGeo.boundingBox.max.x - kbGeo.boundingBox.min.x);
      const oy = -0.5 * (kbGeo.boundingBox.max.y - kbGeo.boundingBox.min.y);
      kbGeo.translate(ox, oy, -0.25);

      const kbMesh = new THREE.Mesh(kbGeo, goldMat);
      kbMesh.castShadow = true;
      this.groupPrologue.add(kbMesh);
      this.groupPrologue.userData.kbMesh = kbMesh;
    }

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.7, 0.05, 16, 100),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x3b0764, metalness: 0.8, roughness: 0.3 })
    );
    ring.rotation.x = Math.PI * 0.35;
    this.groupPrologue.add(ring);
    this.groupPrologue.userData.ring = ring;

    const sats = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xb45309 }));
      const a = (i * Math.PI * 2) / 3;
      s.position.set(Math.cos(a) * 2.7, Math.sin(a) * 2.7, 0);
      sats.add(s);
    }
    sats.rotation.x = Math.PI * 0.35;
    this.groupPrologue.add(sats);
    this.groupPrologue.userData.sats = sats;
    this.scene.add(this.groupPrologue);

    // Stage 1: Holographic Systems Core
    this.groupOrigin = new THREE.Group();
    this.groupOrigin.position.set(baseOffset, 0, 0);

    const innerCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.3, 0),
      new THREE.MeshPhysicalMaterial({ color: 0x00f5d4, emissive: 0x044338, roughness: 0.1, metalness: 0.1, transmission: 0.85, ior: 1.5 })
    );
    this.groupOrigin.add(innerCore);

    const cage = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.85, 1),
      new THREE.MeshStandardMaterial({ color: 0x6366f1, wireframe: true, emissive: 0x312e81 })
    );
    this.groupOrigin.add(cage);

    const nodes = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const n = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4 }));
      const t = (i * Math.PI * 2) / 8;
      n.position.set(Math.cos(t) * 2.4, Math.sin(t) * 2.4, (Math.random() - 0.5) * 1.5);
      nodes.add(n);
    }
    this.groupOrigin.add(nodes);
    this.groupOrigin.userData = { inner: innerCore, cage, nodes };
    this.scene.add(this.groupOrigin);

    // Stage 2: Orbital Tech Gyroscope
    this.groupArsenal = new THREE.Group();
    this.groupArsenal.position.set(baseOffset, 0, 0);

    const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.06, 16, 64), new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.8 }));
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.06, 16, 64), new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.8 }));
    const r3 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.06, 16, 64), new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.8 }));
    this.groupArsenal.add(r1);
    this.groupArsenal.add(r2);
    this.groupArsenal.add(r3);

    const centerGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.85, 0),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0x38bdf8, metalness: 0.2, roughness: 0.1, transmission: 0.7, clearcoat: 1.0 })
    );
    this.groupArsenal.add(centerGem);
    this.groupArsenal.userData = { r1, r2, r3, gem: centerGem };
    this.scene.add(this.groupArsenal);

    // Stage 3: Sci-Fi Masterpieces (Hypercar turbine & 3D 'A')
    this.groupMasterpieces = new THREE.Group();
    this.groupMasterpieces.position.set(baseOffset, 0, 0);

    const carRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.08, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x007799 })
    );
    carRing.rotation.x = Math.PI * 0.4;
    this.groupMasterpieces.add(carRing);

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
        new THREE.MeshPhysicalMaterial({ color: 0xffd166, emissive: 0x78350f, roughness: 0.2, metalness: 0.7 })
      );
      this.groupMasterpieces.add(aMesh);
    }
    this.groupMasterpieces.userData = { carRing };
    this.scene.add(this.groupMasterpieces);

    // Stage 4: Career Odyssey (Milestone Monoliths)
    this.groupOdyssey = new THREE.Group();
    this.groupOdyssey.position.set(baseOffset, 0, 0);

    const pillars = [];
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1e3a8a, metalness: 0.8, roughness: 0.2 });
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.6 + i * 0.35, 0.45), pillarMat);
      p.position.set((i - 1.5) * 1.25, (i - 1.5) * 0.25, (i % 2 === 0 ? 0.4 : -0.4));
      this.groupOdyssey.add(p);
      pillars.push(p);
    }
    const spline = new THREE.CatmullRomCurve3(pillars.map(p => p.position));
    const splineMesh = new THREE.Mesh(new THREE.TubeGeometry(spline, 32, 0.04, 8, false), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    this.groupOdyssey.add(splineMesh);
    this.groupOdyssey.userData = { pillars, splineMesh };
    this.scene.add(this.groupOdyssey);

    // Stage 5: Freelance Expeditions (Equilibrium Polyhedra)
    this.groupExpeditions = new THREE.Group();
    this.groupExpeditions.position.set(baseOffset, 0, 0);

    const polyCrystals = new THREE.Group();
    const polyMat = new THREE.MeshPhysicalMaterial({ color: 0xec4899, emissive: 0x701a75, metalness: 0.2, roughness: 0.1, transmission: 0.8, clearcoat: 1.0 });
    for (let i = 0; i < 5; i++) {
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.65 + (i % 2) * 0.25, 0), polyMat);
      const angle = (i * Math.PI * 2) / 5;
      c.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, (Math.random() - 0.5) * 1.2);
      polyCrystals.add(c);
    }
    this.groupExpeditions.add(polyCrystals);
    this.groupExpeditions.userData = { polyCrystals };
    this.scene.add(this.groupExpeditions);

    // Stage 6: Quantum Transmission Beacon
    this.groupEpilogue = new THREE.Group();
    this.groupEpilogue.position.set(baseOffset, 0, 0);

    const tower = new THREE.Mesh(
      new THREE.ConeGeometry(0.8, 2.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x003344, metalness: 0.8, roughness: 0.2 })
    );
    tower.rotation.x = Math.PI;
    this.groupEpilogue.add(tower);

    const radarRings = [];
    for (let i = 0; i < 3; i++) {
      const rRing = new THREE.Mesh(
        new THREE.RingGeometry(1.2 + i * 0.7, 1.25 + i * 0.7, 32),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 - i * 0.18 })
      );
      rRing.position.set(0, -1.2, 0);
      rRing.rotation.x = Math.PI * 0.5;
      this.groupEpilogue.add(rRing);
      radarRings.push(rRing);
    }
    this.groupEpilogue.userData = { tower, radarRings };
    this.scene.add(this.groupEpilogue);
  }

  // -------------------------------------------------------------
  // CONTINUOUS SCROLL INPUT BINDING
  // Maps 0.0 to 6.0 directly to the 3D Camera Path and Object Timelines
  // -------------------------------------------------------------
  setScrollProgress(progress) {
    this.targetScrollProgress = Math.max(0, Math.min(this.cameraKeyframes.length - 1, progress));
  }

  updateScrollBoundTimeline(delta) {
    // Smooth cinematic dampening for scroll progress
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.085;

    const totalKeyframes = this.cameraKeyframes.length - 1;
    const clampedProgress = Math.max(0, Math.min(totalKeyframes, this.scrollProgress));

    const index = Math.floor(clampedProgress);
    const fraction = clampedProgress - index;

    const kfA = this.cameraKeyframes[index];
    const kfB = this.cameraKeyframes[Math.min(totalKeyframes, index + 1)];

    // 1. SCROLL-BOUND CAMERA POSITION & LOOKAT INTERPOLATION
    const targetPos = new THREE.Vector3().lerpVectors(kfA.pos, kfB.pos, fraction);
    const targetLookAt = new THREE.Vector3().lerpVectors(kfA.lookAt, kfB.lookAt, fraction);

    // Apply User Orbit & Parallax on top of the camera path
    const orbitRadius = targetPos.distanceTo(targetLookAt);
    const az = this.userOrbit.azimuth + (this.mouse.x * 0.12);
    const el = this.userOrbit.elevation + (this.mouse.y * 0.08);

    const orbitOffset = new THREE.Vector3(
      Math.sin(az) * orbitRadius * 0.18,
      Math.sin(el) * orbitRadius * 0.12,
      (Math.cos(az) - 1) * orbitRadius * 0.18
    );
    targetPos.add(orbitOffset);

    this.camera.position.copy(targetPos);
    this.camera.lookAt(targetLookAt);

    // 2. SCROLL-BOUND CAMERA FIELD OF VIEW (FOV)
    const targetFov = THREE.MathUtils.lerp(kfA.fov, kfB.fov, fraction);
    if (Math.abs(this.camera.fov - targetFov) > 0.01) {
      this.camera.fov = targetFov;
      this.camera.updateProjectionMatrix();
    }

    // 3. SCROLL-BOUND DYNAMIC LIGHTING & FOG
    const colorA = new THREE.Color(kfA.lightColor);
    const colorB = new THREE.Color(kfB.lightColor);
    const rimA = new THREE.Color(kfA.rimColor);
    const rimB = new THREE.Color(kfB.rimColor);

    if (this.accentPointLight) {
      this.accentPointLight.color.lerpColors(colorA, colorB, fraction);
      this.accentPointLight.position.set(targetPos.x * 0.7, targetPos.y + 1, targetPos.z * 0.7);
    }
    if (this.rimLight) {
      this.rimLight.color.lerpColors(rimA, rimB, fraction);
    }
    if (this.scene.fog) {
      this.scene.fog.density = THREE.MathUtils.lerp(kfA.fogDensity, kfB.fogDensity, fraction);
    }

    // 4. SCROLL-BOUND OBJECT ANIMATION TIMELINES
    // Each group's scale, position, rotation, and explosion are a direct mathematical function of scrollProgress
    this.updateObjectTimeline(this.groupPrologue, 0, clampedProgress, (grp, weight, p) => {
      // Disassemble / Explode 'KB' as you scroll into Origin
      const explode = Math.max(0, p - 0.2) * 1.5;
      if (grp.userData.ring) grp.userData.ring.scale.set(1 + explode * 0.6, 1 + explode * 0.6, 1 + explode * 0.6);
      if (grp.userData.sats) grp.userData.sats.rotation.z = -p * 3.0;
    });

    this.updateObjectTimeline(this.groupOrigin, 1, clampedProgress, (grp, weight, p) => {
      // Unfold outer cage into exploded view revealing inner core
      const cageExplode = 1.0 + Math.sin(Math.min(1, Math.max(0, p - 0.5)) * Math.PI) * 0.6;
      if (grp.userData.cage) grp.userData.cage.scale.set(cageExplode, cageExplode, cageExplode);
      if (grp.userData.inner) grp.userData.inner.rotation.y = -p * 2.0;
    });

    this.updateObjectTimeline(this.groupArsenal, 2, clampedProgress, (grp, weight, p) => {
      // Orbiting gimbal rings expand and rotate into 3 axes
      if (grp.userData.r1) grp.userData.r1.rotation.x = p * 2.2;
      if (grp.userData.r2) grp.userData.r2.rotation.y = p * 2.8;
      if (grp.userData.r3) grp.userData.r3.rotation.z = p * 3.4;
    });

    this.updateObjectTimeline(this.groupMasterpieces, 3, clampedProgress, (grp, weight, p) => {
      if (grp.userData.carRing) grp.userData.carRing.rotation.z = p * 4.0;
    });

    this.updateObjectTimeline(this.groupOdyssey, 4, clampedProgress, (grp, weight, p) => {
      // Monolith heights dynamically respond to milestone scroll depth
      if (grp.userData.pillars) {
        grp.userData.pillars.forEach((pillar, pIdx) => {
          pillar.scale.y = 0.8 + Math.sin(p * 2 + pIdx * 1.2) * 0.35;
        });
      }
    });

    this.updateObjectTimeline(this.groupExpeditions, 5, clampedProgress, (grp, weight, p) => {
      if (grp.userData.polyCrystals) grp.userData.polyCrystals.rotation.y = p * 2.5;
    });

    this.updateObjectTimeline(this.groupEpilogue, 6, clampedProgress, (grp, weight, p) => {
      if (grp.userData.radarRings) {
        grp.userData.radarRings.forEach((r, rIdx) => {
          const s = 1 + (((p * 2.0 + rIdx * 0.6)) % 2.0);
          r.scale.set(s, s, s);
        });
      }
    });
  }

  updateObjectTimeline(group, targetStage, currentProgress, customFn) {
    if (!group) return;

    // Distance in timeline segments from target stage
    const dist = Math.abs(currentProgress - targetStage);

    if (dist < 1.0) {
      // In view: smooth weight curve (cosine bell)
      const weight = Math.cos(dist * (Math.PI / 2));
      group.visible = true;

      // Apply Spring Wobble if active
      let wobbleScale = 1;
      if (this.wobble.active) {
        wobbleScale = 1 + Math.sin(this.wobble.time) * this.wobble.amp;
      }

      const s = weight * wobbleScale;
      group.scale.set(s, s, s);

      // Apply user rotation
      group.rotation.y = (currentProgress * 0.8) + this.userOrbit.azimuth;
      group.rotation.x = Math.sin(currentProgress) * 0.15 + this.userOrbit.elevation;

      if (customFn) customFn(group, weight, currentProgress);
    } else {
      group.visible = false;
      group.scale.set(0.001, 0.001, 0.001);
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.handleResize());

    // Mouse / Touch Orbit Dragging
    this.container.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.userVelocity.velX = 0;
      this.userVelocity.velY = 0;
    });

    window.addEventListener('pointermove', (e) => {
      this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
      this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.dragStart.x;
        const deltaY = e.clientY - this.dragStart.y;
        this.userVelocity.velX = deltaX * 0.005;
        this.userVelocity.velY = deltaY * 0.005;
        this.userOrbit.azimuth += this.userVelocity.velX;
        this.userOrbit.elevation += this.userVelocity.velY;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
      }
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    // Click to wobble
    this.container.addEventListener('click', () => {
      this.wobble.active = true;
      this.wobble.time = 0;
      this.wobble.amp = 0.35;
    });
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const isDesktop = this.width > 960;
    const baseOffset = isDesktop ? 1.8 : 0;

    [
      this.groupPrologue,
      this.groupOrigin,
      this.groupArsenal,
      this.groupMasterpieces,
      this.groupOdyssey,
      this.groupExpeditions,
      this.groupEpilogue
    ].forEach(grp => {
      if (grp) grp.position.x = baseOffset;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Mouse Parallax Lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // User orbit drag decay
    if (!this.isDragging) {
      this.userOrbit.azimuth *= 0.95;
      this.userOrbit.elevation *= 0.95;
    }

    // Wobble bounce decay
    if (this.wobble.active) {
      this.wobble.time += delta * 12;
      this.wobble.amp *= 0.92;
      if (this.wobble.amp < 0.01) {
        this.wobble.active = false;
      }
    }

    // Starfield gentle celestial drift
    if (this.starfield) {
      this.starfield.rotation.y = elapsedTime * 0.018;
      this.starfield.rotation.x = elapsedTime * 0.008;
    }

    // Update Scroll-Bound Camera Path & Object Timelines
    this.updateScrollBoundTimeline(delta);

    this.renderer.render(this.scene, this.camera);
  }
}
