/**
 * Scene Engine for AETHER GT 3D Product Tour
 * Manages Three.js WebGL rendering, studio lighting, camera path interpolation,
 * aerodynamic streamline particles, exploded-view orchestration, and 3D hotspot projection.
 */

import * as THREE from 'three';
import { CarModel } from './car-model.js';

export class SceneEngine {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Car instance
    this.car = null;

    // Aerodynamic streamline particles
    this.aeroParticles = null;
    this.showAero = false;

    // Studio Lights
    this.keyLight = null;
    this.rimLight = null;
    this.accentLight = null;

    // Scroll interpolation state
    this.scrollProgress = 0; // 0.0 to 6.0
    this.targetScrollProgress = 0;

    // Mouse parallax & manual drag orbit
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isUserDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.userOrbit = { azimuth: 0, elevation: 0 };

    // Camera trajectory keyframes for the 7 stages
    this.cameraKeyframes = [
      // 0: Intro / Stance (Wide 3/4 beauty view)
      { pos: new THREE.Vector3(4.8, 1.8, 5.6), lookAt: new THREE.Vector3(0, 0.6, 0), explode: 0.0, doors: 0.0, wing: 0.0, aero: false },
      // 1: Active Aerodynamics (Rear 3/4 focus with wing up & aero particles)
      { pos: new THREE.Vector3(-3.8, 2.2, -4.5), lookAt: new THREE.Vector3(0, 0.9, -1.2), explode: 0.0, doors: 0.0, wing: 1.0, aero: true },
      // 2: Exploded Powertrain & Battery (Low angle into motor core)
      { pos: new THREE.Vector3(3.2, 1.5, 0.8), lookAt: new THREE.Vector3(0, 0.6, 0.2), explode: 0.85, doors: 0.0, wing: 0.4, aero: false },
      // 3: Chassis & Pushrod Suspension (Side-view exploded wheels & brakes)
      { pos: new THREE.Vector3(4.4, 1.1, -1.2), lookAt: new THREE.Vector3(0.5, 0.5, -0.6), explode: 1.0, doors: 0.0, wing: 0.6, aero: false },
      // 4: Interior & Cockpit (Camera glides through scissor door inside cockpit)
      { pos: new THREE.Vector3(-0.45, 1.05, 0.08), lookAt: new THREE.Vector3(-0.35, 0.88, 1.4), explode: 0.15, doors: 1.0, wing: 0.0, aero: false },
      // 5: Autonomous Tech & LiDAR (High angle looking forward with sensor cone)
      { pos: new THREE.Vector3(0.2, 2.8, 3.2), lookAt: new THREE.Vector3(0, 0.8, 1.8), explode: 0.2, doors: 0.0, wing: 0.0, aero: false, sensorCone: true },
      // 6: Studio Launch & Customizer (Front 3/4 full assembly)
      { pos: new THREE.Vector3(-4.2, 1.4, 4.4), lookAt: new THREE.Vector3(0, 0.55, 0), explode: 0.0, doors: 0.0, wing: 0.35, aero: false }
    ];

    // Current camera positions
    this.currentCamPos = new THREE.Vector3().copy(this.cameraKeyframes[0].pos);
    this.currentLookAt = new THREE.Vector3().copy(this.cameraKeyframes[0].lookAt);

    // Hotspot 3D coordinates
    this.hotspots = [
      { id: 'hotspot-motor', worldPos: new THREE.Vector3(0, 0.65, -1.45), el: null },
      { id: 'hotspot-battery', worldPos: new THREE.Vector3(0, 0.42, 0), el: null },
      { id: 'hotspot-brakes', worldPos: new THREE.Vector3(1.2, 0.48, 1.45), el: null },
      { id: 'hotspot-wing', worldPos: new THREE.Vector3(0, 1.25, -2.1), el: null },
      { id: 'hotspot-cockpit', worldPos: new THREE.Vector3(-0.45, 0.9, 0.4), el: null },
      { id: 'hotspot-lidar', worldPos: new THREE.Vector3(0, 1.35, 0.2), el: null }
    ];

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.setupShowroomFloor();
    this.setupAeroParticles();

    // Instantiate 3D Car
    this.car = new CarModel();
    this.scene.add(this.car.root);

    this.setupEventListeners();
    this.bindHotspotElements();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07090e, 0.035);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);

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

  setupLighting() {
    // Ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambient);

    // Overhead Key Softbox
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(5, 8, 4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.camera.left = -6;
    this.keyLight.shadow.camera.right = 6;
    this.keyLight.shadow.camera.top = 6;
    this.keyLight.shadow.camera.bottom = -6;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    // Cyan Studio Rim Light
    this.rimLight = new THREE.DirectionalLight(0x00f0ff, 2.4);
    this.rimLight.position.set(-8, 5, -6);
    this.scene.add(this.rimLight);

    // Warm Accent Edge Light
    this.accentLight = new THREE.DirectionalLight(0xff6b35, 1.2);
    this.accentLight.position.set(6, 2, -6);
    this.scene.add(this.accentLight);

    // Ceiling Light Strips (Visual studio props)
    const stripGeo = new THREE.BoxGeometry(1.2, 0.08, 8.0);
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-2.4, 2.4].forEach(x => {
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(x, 4.6, 0);
      this.scene.add(strip);
    });
  }

  setupShowroomFloor() {
    // Reflective Glossy Studio Floor
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.28,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Subtle Radial Grid Floor Pattern
    const grid = new THREE.PolarGridHelper(16, 16, 8, 64, 0x00f0ff, 0x1f2638);
    grid.position.y = 0.005;
    this.scene.add(grid);
  }

  setupAeroParticles() {
    // Aerodynamic streamline tunnel
    const particleCount = 650;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.4;     // X width
      positions[i * 3 + 1] = 0.25 + Math.random() * 1.8;   // Y height
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12.0; // Z stream
      speeds[i] = 4.0 + Math.random() * 8.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleSpeeds = speeds;

    const material = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.065,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.aeroParticles = new THREE.Points(geometry, material);
    this.aeroParticles.visible = false;
    this.scene.add(this.aeroParticles);
  }

  setScrollProgress(progress) {
    this.targetScrollProgress = Math.max(0, Math.min(this.cameraKeyframes.length - 1, progress));
  }

  updateInterpolatedStage(delta) {
    // Smooth progress lerp
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;

    const totalKeyframes = this.cameraKeyframes.length - 1;
    const clampedProgress = Math.max(0, Math.min(totalKeyframes, this.scrollProgress));

    const index = Math.floor(clampedProgress);
    const fraction = clampedProgress - index;

    const kfA = this.cameraKeyframes[index];
    const kfB = this.cameraKeyframes[Math.min(totalKeyframes, index + 1)];

    // Interpolate camera position and lookAt
    const targetPos = new THREE.Vector3().lerpVectors(kfA.pos, kfB.pos, fraction);
    const targetLookAt = new THREE.Vector3().lerpVectors(kfA.lookAt, kfB.lookAt, fraction);

    // Apply manual user orbit drag offset if any
    const orbitRadius = targetPos.distanceTo(targetLookAt);
    const az = this.userOrbit.azimuth + (this.mouse.x * 0.15);
    const el = this.userOrbit.elevation + (this.mouse.y * 0.1);

    const orbitOffset = new THREE.Vector3(
      Math.sin(az) * orbitRadius * 0.2,
      Math.sin(el) * orbitRadius * 0.15,
      (Math.cos(az) - 1) * orbitRadius * 0.2
    );

    targetPos.add(orbitOffset);

    // Apply to camera
    this.camera.position.copy(targetPos);
    this.camera.lookAt(targetLookAt);

    // Interpolate car exploded states
    const targetExplode = kfA.explode + (kfB.explode - kfA.explode) * fraction;
    const targetDoors = kfA.doors + (kfB.doors - kfA.doors) * fraction;
    const targetWing = kfA.wing + (kfB.wing - kfA.wing) * fraction;

    if (this.car) {
      this.car.setExplosionProgress(targetExplode);
      this.car.setDoorsProgress(targetDoors);
      this.car.setWingProgress(targetWing);

      // Sensor cone visibility on stage 5
      if (this.car.sensorScanCone) {
        this.car.sensorScanCone.visible = (index === 5 || (index === 4 && fraction > 0.6));
      }
    }

    // Toggle aero particle stream
    const showAero = (kfA.aero && fraction < 0.5) || (kfB.aero && fraction >= 0.5);
    if (this.aeroParticles) {
      this.aeroParticles.visible = showAero;
    }

    // Update 3D interactive hotspot positions on screen
    this.updateHotspots();
  }

  bindHotspotElements() {
    this.hotspots.forEach(h => {
      h.el = document.getElementById(h.id);
    });
  }

  updateHotspots() {
    const tempV = new THREE.Vector3();
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    this.hotspots.forEach(h => {
      if (!h.el) return;

      tempV.copy(h.worldPos);
      tempV.project(this.camera);

      // Check if point is in front of camera
      const isVisible = (tempV.z < 1.0);

      if (isVisible) {
        const x = (tempV.x * halfWidth) + halfWidth;
        const y = -(tempV.y * halfHeight) + halfHeight;
        h.el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        h.el.style.opacity = '1';
        h.el.style.pointerEvents = 'auto';
      } else {
        h.el.style.opacity = '0';
        h.el.style.pointerEvents = 'none';
      }
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
      this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;

      if (this.isUserDragging) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        this.userOrbit.azimuth += dx * 0.005;
        this.userOrbit.elevation += dy * 0.005;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
      }
    });

    this.container.addEventListener('pointerdown', (e) => {
      this.isUserDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      this.isUserDragging = false;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Mouse parallax lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Decay user orbit when releasing drag
    if (!this.isUserDragging) {
      this.userOrbit.azimuth *= 0.95;
      this.userOrbit.elevation *= 0.95;
    }

    // Update scroll driven camera and exploded view
    this.updateInterpolatedStage(delta);

    // Animate aero particles streaming over the body
    if (this.aeroParticles && this.aeroParticles.visible) {
      const posAttr = this.aeroParticles.geometry.attributes.position;
      const arr = posAttr.array;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        arr[i * 3 + 2] -= this.particleSpeeds[i] * delta;
        // Wrap around when passing rear diffuser
        if (arr[i * 3 + 2] < -5.5) {
          arr[i * 3 + 2] = 5.5;
        }
      }
      posAttr.needsUpdate = true;
    }

    // LiDAR rotation animation
    if (this.car && this.car.lidarPod) {
      this.car.lidarPod.rotation.y = elapsed * 8.0;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
