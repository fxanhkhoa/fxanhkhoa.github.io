/**
 * Cybernetic Architect Rig & Scroll-Bound 3D Camera Engine
 *
 * A unified, cohesive 3D centerpiece for Kevin Bui's portfolio.
 * The camera's position, field of view (FOV), and the rig's exploded-view assembly
 * and animation timelines are mapped directly to continuous scroll depth.
 *
 * Built with Three.js.
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

    // Unified 3D Cybernetic Rig Components
    this.rig = null;
    this.kbMesh = null;
    this.coreInner = null;
    this.coreCage = null;
    this.corePanels = []; // Exploding outer shield panels
    this.gimbalRings = []; // Concentric tech rings
    this.techSatellites = [];
    this.milestoneTowers = [];
    this.laserSpline = null;
    this.beaconRadarRings = [];
    this.pedestalRing = null;

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

    // -------------------------------------------------------------
    // SCROLL-BOUND CAMERA KEYFRAMES (0.0 to 6.0)
    // -------------------------------------------------------------
    this.cameraKeyframes = [
      // 0: Prologue // Grand Wide 3/4 View of the Rig
      {
        pos: new THREE.Vector3(3.4, 1.8, 6.8),
        lookAt: new THREE.Vector3(0.4, 0.4, 0.0),
        fov: 52,
        explode: 0.0,
        lightColor: 0x00f0ff,
        rimColor: 0x8b5cf6
      },
      // 1: Origin // Low-Angle Macro Zoom into Exploded Core
      {
        pos: new THREE.Vector3(2.0, 0.8, 3.6),
        lookAt: new THREE.Vector3(0.0, 0.1, 0.0),
        fov: 40,
        explode: 1.0,
        lightColor: 0x00f5d4,
        rimColor: 0x6366f1
      },
      // 2: Arsenal // Dynamic Isometric High-Angle Orbit over Gimbal Rings
      {
        pos: new THREE.Vector3(-3.0, 3.4, 4.4),
        lookAt: new THREE.Vector3(0.0, 0.3, 0.0),
        fov: 48,
        explode: 0.4,
        lightColor: 0xa855f7,
        rimColor: 0x38bdf8
      },
      // 3: Masterpieces // Low-Angle Ground Showcase View of Emitter Pedestal
      {
        pos: new THREE.Vector3(2.8, -0.5, 4.8),
        lookAt: new THREE.Vector3(0.0, 0.6, 0.0),
        fov: 44,
        explode: 0.2,
        lightColor: 0xffd166,
        rimColor: 0xff477e
      },
      // 4: Odyssey // Gliding along the Milestone Monolith Spline
      {
        pos: new THREE.Vector3(-3.8, 1.5, 4.0),
        lookAt: new THREE.Vector3(-0.5, 0.4, -0.4),
        fov: 46,
        explode: 0.15,
        lightColor: 0x3b82f6,
        rimColor: 0x06b6d4
      },
      // 5: Expeditions // Floating Satellite Equilibrium Vantage
      {
        pos: new THREE.Vector3(3.2, 2.0, 4.6),
        lookAt: new THREE.Vector3(0.2, 0.1, 0.0),
        fov: 42,
        explode: 0.3,
        lightColor: 0xec4899,
        rimColor: 0xf59e0b
      },
      // 6: Epilogue // High Cosmic Horizon Perspective of Transmission Beacon
      {
        pos: new THREE.Vector3(0.2, 4.2, 5.8),
        lookAt: new THREE.Vector3(0.0, 0.4, 0.0),
        fov: 54,
        explode: 0.0,
        lightColor: 0x00f0ff,
        rimColor: 0x10b981
      }
    ];

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.setupStarfield();
    this.setupCyberGridFloor();
    this.setupEventListeners();
    this.loadFont();
    this.buildCyberneticRig();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060812, 0.024);

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
    const starCount = 1400;
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
    const grid = new THREE.PolarGridHelper(18, 18, 8, 64, 0x00f0ff, 0x1a2133);
    grid.position.y = -2.4;
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
  // BUILD UNIFIED CYBERNETIC ARCHITECT RIG
  // -------------------------------------------------------------
  buildCyberneticRig() {
    this.rig = new THREE.Group();
    this.rig.position.set(0, 0, 0);

    // 1. Hexagonal Base Emitter Stage
    const pedestalGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.35, 6);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0c111d,
      roughness: 0.3,
      metalness: 0.85
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -2.2;
    pedestal.receiveShadow = true;
    this.rig.add(pedestal);

    // Glowing emitter ring on pedestal
    const pRingGeo = new THREE.TorusGeometry(2.3, 0.04, 16, 64);
    const pRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    this.pedestalRing = new THREE.Mesh(pRingGeo, pRingMat);
    this.pedestalRing.rotation.x = Math.PI * 0.5;
    this.pedestalRing.position.y = -2.0;
    this.rig.add(this.pedestalRing);

    // 2. Central Quantum Core (Inner glowing sphere + crystal)
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0.1, 0);

    const innerSphereGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const innerSphereMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    this.coreInner = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    coreGroup.add(this.coreInner);

    const crystalGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f5d4,
      emissive: 0x044338,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
      reflectivity: 0.95
    });
    this.coreCage = new THREE.Mesh(crystalGeo, crystalMat);
    coreGroup.add(this.coreCage);

    // 3. Segmented Exploding Shield Panels (Exploded View Animation)
    this.corePanels = [];
    const panelGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.65, 8, 1, true, 0, Math.PI * 0.38);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x161f33,
      roughness: 0.25,
      metalness: 0.9,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 4; i++) {
      const panel = new THREE.Mesh(panelGeo, panelMat);
      const angle = (i * Math.PI) / 2;
      panel.rotation.y = angle;
      panel.userData = {
        basePos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(Math.cos(angle + 0.3) * 1.5, (i % 2 === 0 ? 0.6 : -0.6), Math.sin(angle + 0.3) * 1.5)
      };
      coreGroup.add(panel);
      this.corePanels.push(panel);
    }
    this.rig.add(coreGroup);

    // 4. 3D Extruded "KB" Monogram atop Core
    if (this.font) {
      const kbGeo = new TextGeometry('KB', {
        font: this.font,
        size: 1.6,
        height: 0.45,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.07,
        bevelSegments: 5
      });
      kbGeo.computeBoundingBox();
      const ox = -0.5 * (kbGeo.boundingBox.max.x - kbGeo.boundingBox.min.x);
      const oy = -0.5 * (kbGeo.boundingBox.max.y - kbGeo.boundingBox.min.y);
      kbGeo.translate(ox, oy, 0);

      const kbMat = new THREE.MeshPhysicalMaterial({
        color: 0xffd166,
        emissive: 0x78350f,
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 1.0,
        reflectivity: 0.95
      });
      this.kbMesh = new THREE.Mesh(kbGeo, kbMat);
      this.kbMesh.position.set(0, 2.1, 0);
      this.kbMesh.castShadow = true;
      this.rig.add(this.kbMesh);
    }

    // 5. Concentric Gimbal Tech Rings (Arsenal Gyroscope)
    this.gimbalRings = [];
    const ringColors = [0x00f0ff, 0xa855f7, 0xec4899];
    const ringRadii = [2.2, 2.65, 3.1];

    ringRadii.forEach((r, idx) => {
      const ringMesh = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.045, 16, 80),
        new THREE.MeshStandardMaterial({
          color: ringColors[idx],
          metalness: 0.85,
          roughness: 0.2
        })
      );
      this.rig.add(ringMesh);
      this.gimbalRings.push(ringMesh);
    });

    // Tech Gemstone Satellites
    this.techSatellites = [];
    const satColors = [0x00f0ff, 0x8b5cf6, 0xec4899, 0x10b981];
    for (let i = 0; i < 4; i++) {
      const sat = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22, 0),
        new THREE.MeshStandardMaterial({ color: satColors[i], emissive: satColors[i] })
      );
      this.rig.add(sat);
      this.techSatellites.push(sat);
    }

    // 6. Milestone Monolith Towers in Background Arc (Odyssey)
    this.milestoneTowers = [];
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25
    });

    const towerPositions = [];
    for (let i = 0; i < 4; i++) {
      const h = 1.6 + i * 0.45;
      const tMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, h, 0.42), towerMat);
      const angle = Math.PI * 0.75 + (i * Math.PI * 0.5) / 3;
      const dist = 3.6;
      tMesh.position.set(Math.cos(angle) * dist, -2.2 + h / 2, Math.sin(angle) * dist);
      this.rig.add(tMesh);
      this.milestoneTowers.push(tMesh);
      towerPositions.push(new THREE.Vector3(tMesh.position.x, tMesh.position.y + h / 2, tMesh.position.z));
    }

    // Laser Spline Tube connecting towers
    if (towerPositions.length > 1) {
      const splineCurve = new THREE.CatmullRomCurve3(towerPositions);
      const splineGeo = new THREE.TubeGeometry(splineCurve, 32, 0.04, 8, false);
      const splineMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
      this.laserSpline = new THREE.Mesh(splineGeo, splineMat);
      this.rig.add(this.laserSpline);
    }

    // 7. Top Transmission Beacon & Pulsating Radar Rings (Epilogue)
    const antennaGeo = new THREE.CylinderGeometry(0.04, 0.08, 1.2, 8);
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.9 });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(0, 3.2, 0);
    this.rig.add(antenna);

    this.beaconRadarRings = [];
    for (let i = 0; i < 3; i++) {
      const rMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.8 + i * 0.6, 0.85 + i * 0.6, 32),
        new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6 - i * 0.18
        })
      );
      rMesh.rotation.x = Math.PI * 0.5;
      rMesh.position.set(0, 3.8, 0);
      this.rig.add(rMesh);
      this.beaconRadarRings.push(rMesh);
    }

    this.scene.add(this.rig);
  }

  // -------------------------------------------------------------
  // CONTINUOUS SCROLL INPUT BINDING
  // -------------------------------------------------------------
  setScrollProgress(progress) {
    this.targetScrollProgress = Math.max(0, Math.min(this.cameraKeyframes.length - 1, progress));
  }

  updateScrollBoundTimeline(delta, elapsed) {
    // Smooth cinematic dampening for camera scroll progress
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.085;

    const totalKeyframes = this.cameraKeyframes.length - 1;
    const clampedProgress = Math.max(0, Math.min(totalKeyframes, this.scrollProgress));

    const index = Math.floor(clampedProgress);
    const fraction = clampedProgress - index;

    const kfA = this.cameraKeyframes[index];
    const kfB = this.cameraKeyframes[Math.min(totalKeyframes, index + 1)];

    // 1. CAMERA POSITION & LOOKAT ALONG SPLINE TRAJECTORY
    const targetPos = new THREE.Vector3().lerpVectors(kfA.pos, kfB.pos, fraction);
    const targetLookAt = new THREE.Vector3().lerpVectors(kfA.lookAt, kfB.lookAt, fraction);

    // Apply User Orbit & Parallax
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

    // 2. CAMERA FIELD OF VIEW (FOV)
    const targetFov = THREE.MathUtils.lerp(kfA.fov, kfB.fov, fraction);
    if (Math.abs(this.camera.fov - targetFov) > 0.01) {
      this.camera.fov = targetFov;
      this.camera.updateProjectionMatrix();
    }

    // 3. LIGHTING COLOR INTERPOLATION
    const colorA = new THREE.Color(kfA.lightColor);
    const colorB = new THREE.Color(kfB.lightColor);
    const rimA = new THREE.Color(kfA.rimColor);
    const rimB = new THREE.Color(kfB.rimColor);

    if (this.accentPointLight) {
      this.accentPointLight.color.lerpColors(colorA, colorB, fraction);
      this.accentPointLight.position.set(targetPos.x * 0.6, targetPos.y + 1, targetPos.z * 0.6);
    }
    if (this.rimLight) {
      this.rimLight.color.lerpColors(rimA, rimB, fraction);
    }

    // 4. OBJECT ANIMATION TIMELINES (Exploded View, Gimbal Rings, Pulse)
    const targetExplode = THREE.MathUtils.lerp(kfA.explode, kfB.explode, fraction);

    // Explode shield panels outward
    this.corePanels.forEach(panel => {
      panel.position.copy(panel.userData.explodeDir).multiplyScalar(targetExplode);
    });

    // Wobble bounce
    let wobbleScale = 1;
    if (this.wobble.active) {
      wobbleScale = 1 + Math.sin(this.wobble.time) * this.wobble.amp;
    }

    // Rotate core crystal
    if (this.coreInner) {
      const pulse = 1 + Math.sin(elapsed * 4) * 0.08;
      this.coreInner.scale.set(pulse * wobbleScale, pulse * wobbleScale, pulse * wobbleScale);
    }
    if (this.coreCage) {
      this.coreCage.rotation.y = elapsed * 0.4 + clampedProgress * 0.6;
      this.coreCage.rotation.x = Math.sin(elapsed * 0.3) * 0.2;
    }

    // Rotate KB Monogram
    if (this.kbMesh) {
      this.kbMesh.rotation.y = Math.sin(elapsed * 0.8) * 0.25;
      this.kbMesh.position.y = 2.1 + Math.sin(elapsed * 1.5) * 0.08;
    }

    // Gimbal Rings Rotation (Mapped to scroll speed + idle)
    if (this.gimbalRings.length === 3) {
      this.gimbalRings[0].rotation.x = elapsed * 0.5 + clampedProgress * 1.8;
      this.gimbalRings[1].rotation.y = elapsed * 0.7 + clampedProgress * 2.2;
      this.gimbalRings[2].rotation.z = elapsed * 0.9 + clampedProgress * 2.6;
    }

    // Orbiting Satellites
    this.techSatellites.forEach((sat, i) => {
      const a = elapsed * 1.2 + (i * Math.PI) / 2 + clampedProgress * 0.8;
      const r = 2.65;
      sat.position.set(Math.cos(a) * r, Math.sin(a * 2) * 0.4, Math.sin(a) * r);
    });

    // Radar Pulse Waves expansion
    this.beaconRadarRings.forEach((rRing, rIdx) => {
      const s = 1 + ((elapsed * 1.4 + rIdx * 0.6 + clampedProgress * 0.5) % 2.2);
      rRing.scale.set(s, s, s);
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.handleResize());

    // Drag to Orbit
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
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Mouse Parallax Lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Decay user orbit drag when released
    if (!this.isDragging) {
      this.userOrbit.azimuth *= 0.95;
      this.userOrbit.elevation *= 0.95;
    }

    // Wobble decay
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
    this.updateScrollBoundTimeline(delta, elapsedTime);

    this.renderer.render(this.scene, this.camera);
  }
}
