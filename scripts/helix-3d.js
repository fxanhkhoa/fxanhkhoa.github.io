/**
 * Concept 3: Deep-Space 3D Spiral Helix Carousel
 * Sections are arranged along a mathematical 3D spiral ribbon in deep space.
 * Scrolling rotates the helix, sweeping upcoming cards from the deep background
 * directly to the foreground hero position.
 */

import * as THREE from 'three';

export class HelixThreeScene {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    this.helixGroup = null;
    this.coreMesh = null;
    this.cards = [];
    this.cardCount = 7;

    // Helix Geometry Parameters
    this.radius = 7.5;
    this.angleStep = (Math.PI * 2) / 6.2; // Angle between cards
    this.yStep = -1.8;
    this.zStep = -14.0;

    this.scrollProgress = 0; // 0.0 to 6.0
    this.targetProgress = 0;
    this.currentStation = 0;

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
    this.setupSpiralRibbon();
    this.buildCore();
    this.buildHelixCards();
    this.setupEventListeners();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050714, 0.016);

    this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 0.1, 300);
    this.camera.position.set(0, 0.4, 9.2);

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
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);

    const keyLight = new THREE.PointLight(0x00f0ff, 3.0, 50, 1.2);
    keyLight.position.set(0, 6, 8);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffd166, 1.4);
    rimLight.position.set(-10, 10, -15);
    this.scene.add(rimLight);
  }

  setupSpiralRibbon() {
    this.helixGroup = new THREE.Group();
    this.scene.add(this.helixGroup);

    // Glowing spline track tube visualizing the spiral path
    const points = [];
    const totalPoints = 120;
    for (let i = 0; i <= totalPoints; i++) {
      const p = (i / totalPoints) * this.cardCount;
      const angle = p * this.angleStep;
      const x = Math.sin(angle) * this.radius;
      const y = p * this.yStep;
      const z = p * this.zStep;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.06, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    this.helixGroup.add(tube);
  }

  buildCore() {
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, -3.0, -45);

    // Quantum sphere
    const sphereGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x3b0764,
      wireframe: true,
      metalness: 0.9,
      roughness: 0.2
    });
    this.coreMesh = new THREE.Mesh(sphereGeo, sphereMat);
    coreGroup.add(this.coreMesh);

    // Orbital ring
    const ringGeo = new THREE.TorusGeometry(4.2, 0.08, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.4
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    coreGroup.add(ring);
    this.coreRing = ring;

    this.scene.add(coreGroup);
  }

  buildHelixCards() {
    const themes = [
      { num: '00', title: 'PROLOGUE', color: 0x00f0ff, desc: 'Full Stack Architect' },
      { num: '01', title: 'ORIGIN STORY', color: 0x00f5d4, desc: 'The Architect\'s Path' },
      { num: '02', title: 'TECH ARSENAL', color: 0x8b5cf6, desc: 'Battle-Tested Tech' },
      { num: '03', title: 'MASTERPIECES', color: 0xffd166, desc: 'AETHER GT & Live Apps' },
      { num: '04', title: 'CAREER ODYSSEY', color: 0x3b82f6, desc: 'Enterprise Leadership' },
      { num: '05', title: 'FREELANCE', color: 0xec4899, desc: 'Client Expeditions' },
      { num: '06', title: 'TRANSMISSION', color: 0x10b981, desc: 'Direct Encrypted Dispatch' }
    ];

    themes.forEach((theme, i) => {
      const angle = i * this.angleStep;
      const x = Math.sin(angle) * this.radius;
      const y = i * this.yStep;
      const z = i * this.zStep;

      const cardGroup = new THREE.Group();
      cardGroup.position.set(x, y, z);

      // 1. Sleek Glass Tablet
      const boxGeo = new THREE.BoxGeometry(4.2, 5.6, 0.15);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x0a1024,
        roughness: 0.2,
        metalness: 0.8
      });
      const box = new THREE.Mesh(boxGeo, boxMat);
      cardGroup.add(box);

      // 2. Glowing Neon Rim Edge
      const wireGeo = new THREE.BoxGeometry(4.26, 5.66, 0.16);
      const wireMat = new THREE.MeshBasicMaterial({
        color: theme.color,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      cardGroup.add(wire);

      // 3. Crisp Front Canvas Face
      const faceMesh = this.createHelixCardFace(theme);
      faceMesh.position.set(0, 0, 0.09);
      cardGroup.add(faceMesh);

      // Tangent rotation so active card faces directly towards camera
      cardGroup.rotation.y = angle;

      this.helixGroup.add(cardGroup);

      this.cards.push({
        index: i,
        group: cardGroup,
        theme,
        baseAngle: angle,
        baseX: x,
        baseY: y,
        baseZ: z
      });
    });
  }

  createHelixCardFace(theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 680;
    const ctx = canvas.getContext('2d');

    // Deep parchment gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 680);
    grad.addColorStop(0, '#0d152a');
    grad.addColorStop(1, '#070a16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 680);

    // Neon Frame
    ctx.strokeStyle = `#${theme.color.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 472, 640);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText(`SPIRAL // ${theme.num}`, 46, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px "Space Grotesk", sans-serif';
    ctx.fillText(theme.title, 46, 145);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(46, 180);
    ctx.lineTo(466, 180);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(theme.desc, 46, 230);
    ctx.fillText('3D Helical Milestone Pod', 46, 270);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(3.9, 5.2);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });

    return new THREE.Mesh(geo, mat);
  }

  setScrollProgress(progress) {
    this.targetProgress = Math.max(0, Math.min(this.cardCount - 1, progress));
  }

  updateHelixMotion(delta) {
    this.scrollProgress += (this.targetProgress - this.scrollProgress) * 0.085;

    // Shift entire helix group along the spiral trajectory so active card lands at origin
    const p = this.scrollProgress;
    const currentAngle = p * this.angleStep;

    this.helixGroup.position.x = -Math.sin(currentAngle) * this.radius;
    this.helixGroup.position.y = -p * this.yStep;
    this.helixGroup.position.z = -p * this.zStep;

    // Rotate helix around Y axis to bring active card to face forward
    this.helixGroup.rotation.y = -currentAngle;

    // Mouse parallax offsets on camera
    const px = this.mouse.x * 1.4 + this.userOrbit.azimuth;
    const py = this.mouse.y * 1.0 + this.userOrbit.elevation;
    this.camera.position.x = px;
    this.camera.position.y = 0.4 + py;
    this.camera.lookAt(0, 0, 0);

    const rounded = Math.round(this.scrollProgress);
    if (rounded !== this.currentStation) {
      this.currentStation = rounded;
      if (this.onStationChange) {
        this.onStationChange(rounded);
      }
    }
  }

  updateKineticCore(delta, time) {
    if (this.coreMesh) {
      this.coreMesh.rotation.x = time * 0.4;
      this.coreMesh.rotation.y = time * 0.6;
    }
    if (this.coreRing) {
      this.coreRing.rotation.z = time * 0.5;
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

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    if (!this.isDragging) {
      this.userOrbit.azimuth *= 0.94;
      this.userOrbit.elevation *= 0.94;
    }

    this.updateHelixMotion(delta);
    this.updateKineticCore(delta, time);

    this.renderer.render(this.scene, this.camera);
  }
}
