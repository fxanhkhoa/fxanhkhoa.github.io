/**
 * Concept 1: Cosmic Warp Spline 3D Engine
 * Camera flies continuously along a deep-space 3D spline trajectory.
 * Waypoint stations are positioned at deep Z intervals, moving from the far horizon
 * into hero focus as the user scrolls.
 */

import * as THREE from 'three';

export class WarpThreeScene {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Spline & Station Coordinates
    this.stations = [];
    this.stationCount = 7;
    this.stationSpacing = 36; // units apart in Z

    // Camera Flight Path
    this.curve = null;
    this.scrollProgress = 0; // 0.0 to 6.0
    this.targetProgress = 0;
    this.currentStation = 0;

    // Warp lines & particles
    this.warpLines = null;
    this.dustParticles = null;
    this.scrollVelocity = 0;
    this.lastScroll = 0;

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
    this.setupSpline();
    this.setupWarpParticles();
    this.buildStations();
    this.setupEventListeners();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x04060f, 0.015);

    this.camera = new THREE.PerspectiveCamera(52, this.width / this.height, 0.1, 400);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambient);

    // Dynamic travel spotlight attached near camera
    this.travelLight = new THREE.PointLight(0x00f0ff, 2.5, 45, 1.2);
    this.scene.add(this.travelLight);

    const warmLight = new THREE.DirectionalLight(0xffd166, 1.2);
    warmLight.position.set(10, 20, 10);
    this.scene.add(warmLight);
  }

  setupSpline() {
    // Elegant sweeping 3D flight trajectory through deep space
    const points = [];
    for (let i = 0; i <= this.stationCount; i++) {
      const z = -i * this.stationSpacing;
      // Gentle cinematic S-curve sway
      const x = Math.sin(i * 1.1) * 3.5;
      const y = Math.cos(i * 0.8) * 1.8;
      points.push(new THREE.Vector3(x, y, z));
    }
    this.curve = new THREE.CatmullRomCurve3(points);
    this.curve.curveType = 'centripetal';
  }

  setupWarpParticles() {
    // 1. Warp streaks rushing past the camera
    const streakCount = 800;
    const streakGeo = new THREE.BufferGeometry();
    const streakPositions = new Float32Array(streakCount * 6); // 2 vertices per line
    const streakColors = new Float32Array(streakCount * 6);

    const cyan = new THREE.Color(0x00f0ff);
    const purple = new THREE.Color(0x8b5cf6);
    const amber = new THREE.Color(0xffd166);

    for (let i = 0; i < streakCount; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = -Math.random() * (this.stationCount * this.stationSpacing + 50);
      const len = 1.5 + Math.random() * 4.0;

      const idx = i * 6;
      streakPositions[idx] = x;
      streakPositions[idx + 1] = y;
      streakPositions[idx + 2] = z;

      streakPositions[idx + 3] = x;
      streakPositions[idx + 4] = y;
      streakPositions[idx + 5] = z - len;

      const c = i % 3 === 0 ? cyan : i % 3 === 1 ? purple : amber;
      for (let v = 0; v < 2; v++) {
        streakColors[idx + v * 3] = c.r;
        streakColors[idx + v * 3 + 1] = c.g;
        streakColors[idx + v * 3 + 2] = c.b;
      }
    }

    streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
    streakGeo.setAttribute('color', new THREE.BufferAttribute(streakColors, 3));

    const streakMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.warpLines = new THREE.LineSegments(streakGeo, streakMat);
    this.scene.add(this.warpLines);

    // 2. Ambient cosmic floating dust
    const dustCount = 1200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 80;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      dustPos[i * 3 + 2] = -Math.random() * (this.stationCount * this.stationSpacing + 60);
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.16,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustParticles);
  }

  buildStations() {
    const stationThemes = [
      { num: '00', title: 'PROLOGUE', icon: '✦', color: 0x00f0ff, geo: 'torus' },
      { num: '01', title: 'ORIGIN STORY', icon: '🧭', color: 0x00f5d4, geo: 'octa' },
      { num: '02', title: 'TECH ARSENAL', icon: '⚡', color: 0x8b5cf6, geo: 'icosa' },
      { num: '03', title: 'MASTERPIECES', icon: '🏎️', color: 0xffd166, geo: 'portal' },
      { num: '04', title: 'CAREER ODYSSEY', icon: '🏛️', color: 0x3b82f6, geo: 'rings' },
      { num: '05', title: 'FREELANCE VENTURES', icon: '💼', color: 0xec4899, geo: 'tetra' },
      { num: '06', title: 'TRANSMISSION', icon: '✉️', color: 0x10b981, geo: 'beacon' }
    ];

    stationThemes.forEach((theme, i) => {
      const z = -i * this.stationSpacing;
      const point = this.curve.getPointAt(Math.min(1.0, (i / (this.stationCount - 1)) * 0.88));

      const stationGroup = new THREE.Group();
      stationGroup.position.copy(point);

      // 1. Large Holographic Gateway Ring
      const ringGeo = new THREE.TorusGeometry(3.6, 0.08, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: theme.color,
        emissive: theme.color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8
      });
      const gateRing = new THREE.Mesh(ringGeo, ringMat);
      stationGroup.add(gateRing);

      // 2. Concentric Inner Spinning Wireframe Ring
      const innerRingGeo = new THREE.TorusGeometry(2.8, 0.03, 12, 48);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.45
      });
      const innerRing = new THREE.Mesh(innerRingGeo, innerMat);
      stationGroup.add(innerRing);

      // 3. Central Kinetic Core Geometric Artifact
      let coreMesh;
      const coreMat = new THREE.MeshStandardMaterial({
        color: theme.color,
        emissive: theme.color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.9,
        wireframe: true
      });

      if (theme.geo === 'torus') {
        coreMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1.0, 0.28, 64, 16), coreMat);
      } else if (theme.geo === 'octa') {
        coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.3, 0), coreMat);
      } else if (theme.geo === 'icosa') {
        coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), coreMat);
      } else if (theme.geo === 'portal') {
        coreMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32), coreMat);
        coreMesh.rotation.x = Math.PI / 2;
      } else if (theme.geo === 'rings') {
        coreMesh = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.15, 16, 48), coreMat);
      } else if (theme.geo === 'tetra') {
        coreMesh = new THREE.Mesh(new THREE.TetrahedronGeometry(1.5, 0), coreMat);
      } else {
        coreMesh = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.4, 4), coreMat);
      }

      stationGroup.add(coreMesh);

      // 4. Floating Holographic Beacon Plaque (Canvas Texture)
      const plaque = this.createStationPlaque(theme);
      plaque.position.set(0, -3.2, 0);
      stationGroup.add(plaque);

      // 5. Surrounding Satellite Particles for this station
      const satGeo = new THREE.BufferGeometry();
      const satCount = 40;
      const satPos = new Float32Array(satCount * 3);
      for (let s = 0; s < satCount; s++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const rad = 3.8 + Math.random() * 1.5;
        satPos[s * 3] = rad * Math.sin(phi) * Math.cos(theta);
        satPos[s * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
        satPos[s * 3 + 2] = rad * Math.cos(phi);
      }
      satGeo.setAttribute('position', new THREE.BufferAttribute(satPos, 3));
      const satMat = new THREE.PointsMaterial({
        color: theme.color,
        size: 0.18,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const satellites = new THREE.Points(satGeo, satMat);
      stationGroup.add(satellites);

      this.scene.add(stationGroup);

      this.stations.push({
        index: i,
        group: stationGroup,
        gateRing,
        innerRing,
        coreMesh,
        satellites,
        theme
      });
    });
  }

  createStationPlaque(theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(6, 10, 24, 0.85)';
    ctx.roundRect(10, 10, 492, 140, 20);
    ctx.fill();

    ctx.strokeStyle = `#${theme.color.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 3;
    ctx.roundRect(10, 10, 492, 140, 20);
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillText(`SECTOR // ${theme.num}`, 36, 52);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText(theme.title, 36, 102);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const planeGeo = new THREE.PlaneGeometry(3.6, 1.1);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    return new THREE.Mesh(planeGeo, planeMat);
  }

  setScrollProgress(progress) {
    this.targetProgress = Math.max(0, Math.min(this.stationCount - 1, progress));
  }

  updateCameraAlongSpline(delta) {
    // Smooth dampening of progress
    const prev = this.scrollProgress;
    this.scrollProgress += (this.targetProgress - this.scrollProgress) * 0.085;
    this.scrollVelocity = Math.abs(this.scrollProgress - prev) / (delta || 0.016);

    // Normalize progress (0 to 1) along the spline curve
    const t = Math.max(0, Math.min(1.0, (this.scrollProgress / (this.stationCount - 1)) * 0.88));

    // Get current position on spline
    const camPos = this.curve.getPointAt(t);

    // Look slightly ahead along the curve for natural flight anticipation
    const lookAheadT = Math.min(1.0, t + 0.06);
    const targetPos = this.curve.getPointAt(lookAheadT);

    // Mouse parallax offsets
    const px = (this.mouse.x * 1.5) + this.userOrbit.azimuth;
    const py = (this.mouse.y * 1.2) + this.userOrbit.elevation;

    this.camera.position.set(camPos.x + px, camPos.y + py, camPos.z + 4.5);
    this.camera.lookAt(targetPos.x, targetPos.y, targetPos.z);

    // Keep travel light near camera
    if (this.travelLight) {
      this.travelLight.position.set(camPos.x, camPos.y + 1, camPos.z + 2);
    }

    // Check station passage
    const rounded = Math.round(this.scrollProgress);
    if (rounded !== this.currentStation) {
      this.currentStation = rounded;
      if (this.onStationChange) {
        this.onStationChange(rounded);
      }
    }
  }

  updateStations(delta, time) {
    this.stations.forEach((st, i) => {
      // Rotate kinetic elements
      st.gateRing.rotation.z = time * 0.35 + i;
      st.innerRing.rotation.x = time * 0.6 + i;
      st.innerRing.rotation.y = time * 0.45;

      if (st.coreMesh) {
        st.coreMesh.rotation.x = time * 0.8;
        st.coreMesh.rotation.y = time * 1.0;
        st.coreMesh.rotation.z = time * 0.5;
      }

      if (st.satellites) {
        st.satellites.rotation.y = time * 0.2 + i;
      }

      // Distance from camera to pulse scale & intensity
      const dist = this.camera.position.distanceTo(st.group.position);
      if (dist < 18) {
        const factor = 1.0 + Math.sin(time * 3 + i) * 0.04;
        st.group.scale.set(factor, factor, factor);
      } else {
        st.group.scale.set(1, 1, 1);
      }
    });

    // Warp streaks speed effect
    if (this.warpLines) {
      const pos = this.warpLines.geometry.attributes.position;
      const speed = 0.4 + this.scrollVelocity * 2.5;
      for (let i = 0; i < pos.count; i += 2) {
        let z1 = pos.getZ(i) + speed;
        let z2 = pos.getZ(i + 1) + speed;

        if (z1 > this.camera.position.z + 5) {
          const resetZ = this.camera.position.z - 80 - Math.random() * 80;
          const len = 2.0 + Math.random() * 5.0;
          pos.setZ(i, resetZ);
          pos.setZ(i + 1, resetZ - len);
        } else {
          pos.setZ(i, z1);
          pos.setZ(i + 1, z2);
        }
      }
      pos.needsUpdate = true;
    }
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

    // Mouse parallax lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    // Decay drag orbit
    if (!this.isDragging) {
      this.userOrbit.azimuth *= 0.94;
      this.userOrbit.elevation *= 0.94;
    }

    // Camera along spline
    this.updateCameraAlongSpline(delta);

    // Dynamic rotation of stations
    this.updateStations(delta, time);

    this.renderer.render(this.scene, this.camera);
  }
}
