/**
 * Shared Interactive 3D World Engine for Alphabet Odyssey (EN & VI)
 * Built with Three.js (ESM), featuring 3D extruded typography, dynamic PBR materials,
 * procedural Vietnamese diacritic modeling (Ă, Â, Đ, Ê, Ô, Ơ, Ư),
 * companion 3D thematic props, camera choreography, and particle cosmos.
 */

import * as THREE from 'three';
import { FontLoader } from '../vendor/FontLoader.js';
import { TextGeometry } from '../vendor/TextGeometry.js';
import { FONT_DATA } from '../fonts/font-data.js';

export class AlphabetThreeScene {
  constructor(canvasContainer, alphabetData) {
    this.container = canvasContainer;
    this.alphabetData = alphabetData;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Font & 3D Letters
    this.font = null;
    this.letterMeshes = new Map();
    this.currentLetterIndex = 0;
    this.scrollProgress = 0;

    // Particles & Lights
    this.starfield = null;
    this.accentPointLight = null;
    this.keyLight = null;
    this.ambientLight = null;

    // Mouse Parallax & Interaction
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.raycaster = new THREE.Raycaster();
    this.mouseVector = new THREE.Vector2();
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.userRotation = { x: 0, y: 0, velX: 0, velY: 0 };

    // Wobble animation state for click bounces
    this.wobble = { active: false, time: 0, amp: 0 };
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLights();
    this.setupStarfield();
    this.setupEventListeners();
    this.loadFont();
    this.buildLetterWorld();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0518, 0.028);

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
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffeedd, 1.6);
    this.keyLight.position.set(6, 9, 8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    const rimLight = new THREE.DirectionalLight(0x6699ff, 1.2);
    rimLight.position.set(-8, -6, -5);
    this.scene.add(rimLight);

    this.accentPointLight = new THREE.PointLight(0xff4757, 3.2, 18, 1.2);
    this.accentPointLight.position.set(0, 0, 3.5);
    this.scene.add(this.accentPointLight);
  }

  setupStarfield() {
    const starCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xffd27d),
      new THREE.Color(0xa0c8ff),
      new THREE.Color(0xff99bb),
      new THREE.Color(0xa7f3d0)
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 6 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
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
      console.warn('Could not parse font data, using procedural fallback:', e);
    }
  }

  buildLetterWorld() {
    this.alphabetData.forEach((data, index) => {
      const letterGroup = new THREE.Group();
      letterGroup.position.set(0, 0, 0);
      letterGroup.visible = (index === 0);

      const letterMesh = this.create3DLetterMesh(data.letter, data.theme);
      letterMesh.castShadow = true;
      letterMesh.receiveShadow = true;
      letterMesh.userData = { isLetter: true, letterIndex: index };
      letterGroup.add(letterMesh);

      const propsGroup = this.createCompanionProps(data.propType, data.theme);
      letterGroup.add(propsGroup);

      this.scene.add(letterGroup);
      this.letterMeshes.set(index, { group: letterGroup, letterMesh, propsGroup, data });
    });

    this.updateThemeColors(0);
  }

  create3DLetterMesh(char, theme) {
    // Map Vietnamese diacritic letters to base font letter + procedural diacritic
    let baseChar = char;
    let diacritic = null;

    if (char === 'Ă') { baseChar = 'A'; diacritic = 'breve'; }
    else if (char === 'Â') { baseChar = 'A'; diacritic = 'circumflex'; }
    else if (char === 'Đ') { baseChar = 'D'; diacritic = 'crossbar'; }
    else if (char === 'Ê') { baseChar = 'E'; diacritic = 'circumflex'; }
    else if (char === 'Ô') { baseChar = 'O'; diacritic = 'circumflex'; }
    else if (char === 'Ơ') { baseChar = 'O'; diacritic = 'horn'; }
    else if (char === 'Ư') { baseChar = 'U'; diacritic = 'horn'; }

    const group = new THREE.Group();

    const material = new THREE.MeshPhysicalMaterial({
      color: theme.threeColor,
      roughness: 0.22,
      metalness: 0.15,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      transmission: 0.05
    });

    if (this.font) {
      const geometry = new TextGeometry(baseChar, {
        font: this.font,
        size: 2.8,
        height: 0.55,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.08,
        bevelOffset: 0,
        bevelSegments: 5
      });
      geometry.computeBoundingBox();
      const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
      const yOffset = -0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
      geometry.translate(centerOffset, yOffset, -0.25);

      const baseMesh = new THREE.Mesh(geometry, material);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Add Procedural Vietnamese Diacritic if applicable
      if (diacritic) {
        const diacriticObj = this.createDiacritic(diacritic, material);
        group.add(diacriticObj);
      }
    } else {
      const fallback = new THREE.Mesh(new THREE.TorusKnotGeometry(1.2, 0.38, 64, 16), material);
      group.add(fallback);
    }

    return group;
  }

  createDiacritic(type, material) {
    const group = new THREE.Group();

    if (type === 'breve') {
      // Ă: Upward curved crescent smile above A
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.12, 12, 24, Math.PI * 0.9),
        material
      );
      arc.position.set(0, 1.85, 0);
      arc.rotation.z = Math.PI * 1.05;
      group.add(arc);
    } else if (type === 'circumflex') {
      // Â, Ê, Ô: Inverted V roof hat (^)
      const leftRoof = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.18, 0.45), material);
      leftRoof.rotation.z = Math.PI / 4.5;
      leftRoof.position.set(-0.3, 1.95, 0);

      const rightRoof = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.18, 0.45), material);
      rightRoof.rotation.z = -Math.PI / 4.5;
      rightRoof.position.set(0.3, 1.95, 0);

      group.add(leftRoof, rightRoof);
    } else if (type === 'crossbar') {
      // Đ: Horizontal crossbar across the D spine
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.6), material);
      bar.position.set(-0.8, 0.45, 0);
      group.add(bar);
    } else if (type === 'horn') {
      // Ơ, Ư: Small hook on the top-right
      const hook = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.1, 10, 20, Math.PI * 1.1),
        material
      );
      hook.position.set(0.95, 1.75, 0);
      hook.rotation.z = -Math.PI / 3;
      group.add(hook);
    }

    return group;
  }

  createCompanionProps(propType, theme) {
    const group = new THREE.Group();

    const matA = new THREE.MeshStandardMaterial({ color: theme.threePropColor, roughness: 0.3, metalness: 0.2 });
    const matB = new THREE.MeshStandardMaterial({ color: theme.threeColor, roughness: 0.2, metalness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0f3f8, roughness: 0.4 });

    switch (propType) {
      case 'astronaut': {
        const apple = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), new THREE.MeshStandardMaterial({ color: 0xff2244, roughness: 0.25 }));
        apple.scale.set(1, 0.92, 1);
        apple.position.set(-2.8, 1.2, 0.5);
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x2ecc71 }));
        leaf.rotation.z = Math.PI / 4;
        leaf.position.set(-2.7, 2.0, 0.5);
        const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), whiteMat);
        helmet.position.set(2.8, -1.0, 0.8);
        const visor = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), goldMat);
        visor.position.set(2.8, -1.0, 1.3);
        group.add(apple, leaf, helmet, visor);
        break;
      }
      case 'bamboo': { // Măng tre cho Ă
        const shoot = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.9, 12), new THREE.MeshStandardMaterial({ color: 0x2ecc71 }));
        shoot.position.set(-2.7, 0.6, 0.5);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 12, 24), goldMat);
        ring.position.set(2.7, -0.6, 0.5);
        group.add(shoot, ring);
        break;
      }
      case 'mushroom': { // Cây nấm cho Â
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xff4757 }));
        cap.position.set(-2.6, 1.2, 0.5);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 1.2, 16), whiteMat);
        stem.position.set(-2.6, 0.5, 0.5);
        const pot = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), goldMat);
        pot.position.set(2.7, -0.5, 0.5);
        group.add(cap, stem, pot);
        break;
      }
      case 'butterfly': {
        const bGroup = new THREE.Group();
        bGroup.position.set(2.8, 1.2, 0.6);
        const wingGeom = new THREE.ConeGeometry(0.7, 1.3, 4);
        const wingL = new THREE.Mesh(wingGeom, matA);
        wingL.rotation.set(0, 0, Math.PI / 3);
        wingL.scale.set(1, 0.1, 1);
        const wingR = new THREE.Mesh(wingGeom, matA);
        wingR.rotation.set(0, 0, -Math.PI / 3);
        wingR.scale.set(1, 0.1, 1);
        bGroup.add(wingL, wingR);
        const honey = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.18, 16, 6), goldMat);
        honey.position.set(-2.8, -1.0, 0.4);
        honey.rotation.x = Math.PI / 4;
        group.add(bGroup, honey);
        break;
      }
      case 'lantern': { // Đèn lồng cho Đ
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 20), new THREE.MeshStandardMaterial({ color: 0xff3838, roughness: 0.3 }));
        body.position.set(-2.6, 0.8, 0.5);
        body.scale.set(0.9, 1.2, 0.9);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16), goldMat);
        cap.position.set(-2.6, 1.5, 0.5);
        const firefly = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffd32a }));
        firefly.position.set(2.7, -0.5, 0.5);
        group.add(body, cap, firefly);
        break;
      }
      case 'lotus': { // Hoa sen cho H
        const lotus = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.3, 8), new THREE.MeshStandardMaterial({ color: 0xff6b81 }));
        lotus.position.set(-2.6, 0.6, 0.5);
        lotus.rotation.x = Math.PI;
        const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x2ed573 }));
        leaf.position.set(-2.6, -0.1, 0.5);
        group.add(lotus, leaf);
        break;
      }
      case 'conical_hat': { // Nón lá cho N
        const hat = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 24), goldMat);
        hat.position.set(-2.6, 0.7, 0.5);
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), matA);
        star.position.set(2.6, -0.6, 0.5);
        group.add(hat, star);
        break;
      }
      case 'dragon': { // Rồng vàng cho R
        const spine = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.22, 12, 24, Math.PI * 1.2), goldMat);
        spine.position.set(-2.6, 0.6, 0.5);
        spine.rotation.z = Math.PI / 4;
        const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff3838 }));
        pearl.position.set(2.6, -0.5, 0.5);
        group.add(spine, pearl);
        break;
      }
      case 'cosmos': {
        const moon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 24), goldMat);
        moon.position.set(-2.6, 1.4, 0.5);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 16, 48), matA);
        ring.rotation.x = Math.PI / 2.6;
        ring.position.set(2.6, -0.8, 0.5);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 20), matB);
        orb.position.set(2.6, -0.8, 0.5);
        group.add(moon, ring, orb);
        break;
      }
      case 'dolphin': {
        const dCurve = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.28, 16, 24, Math.PI * 1.1), matA);
        dCurve.position.set(2.7, 0.5, 0.5);
        dCurve.rotation.z = -Math.PI / 4;
        const splash = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 12, 32), whiteMat);
        splash.position.set(-2.5, -1.2, 0.5);
        splash.rotation.x = Math.PI / 2.2;
        group.add(dCurve, splash);
        break;
      }
      case 'earth': {
        const earth = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), matB);
        earth.position.set(2.8, 0.6, 0.5);
        const compass = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 32), goldMat);
        compass.position.set(-2.6, -0.8, 0.5);
        compass.rotation.y = Math.PI / 5;
        group.add(earth, compass);
        break;
      }
      case 'firefly': {
        for (let i = 0; i < 5; i++) {
          const ff = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffd32a }));
          ff.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, 0.5 + Math.random() * 2);
          group.add(ff);
        }
        const fire = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.2, 8), matA);
        fire.position.set(-2.6, -1.0, 0.5);
        group.add(fire);
        break;
      }
      case 'galaxy': {
        const spiralRing = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.6, 32), matA);
        spiralRing.rotation.x = Math.PI / 3;
        spiralRing.position.set(-2.6, 1.1, 0.5);
        const gBody1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.25, 20), goldMat);
        gBody1.position.set(2.8, -0.7, 0.5);
        group.add(spiralRing, gBody1);
        break;
      }
      case 'balloon': {
        const bTop = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 24), matA);
        bTop.scale.set(1, 1.25, 1);
        bTop.position.set(2.6, 1.0, 0.5);
        const bBasket = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.35), goldMat);
        bBasket.position.set(2.6, -0.4, 0.5);
        group.add(bTop, bBasket);
        break;
      }
      case 'iceberg': {
        const ice1 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 5), matA);
        ice1.position.set(-2.7, -0.6, 0.5);
        const ice2 = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.3, 4), whiteMat);
        ice2.position.set(2.7, 0.8, 0.5);
        group.add(ice1, ice2);
        break;
      }
      case 'kite': {
        const kite = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.4, 4), matA);
        kite.position.set(-2.7, 1.1, 0.5);
        kite.scale.set(1, 0.1, 1);
        kite.rotation.z = Math.PI / 4;
        group.add(kite);
        break;
      }
      case 'star': {
        const starCenter = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), goldMat);
        starCenter.position.set(2.6, 0.7, 0.5);
        const starRing = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.06, 16, 48), matA);
        starRing.position.set(2.6, 0.7, 0.5);
        starRing.rotation.x = Math.PI / 3;
        group.add(starCenter, starRing);
        break;
      }
      case 'rocket': {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.8, 16), whiteMat);
        body.position.set(-2.7, 0.6, 0.5);
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 16), matA);
        nose.position.set(-2.7, 1.85, 0.5);
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 12), new THREE.MeshBasicMaterial({ color: 0xffa502 }));
        flame.rotation.x = Math.PI;
        flame.position.set(-2.7, -0.7, 0.5);
        group.add(body, nose, flame);
        break;
      }
      case 'umbrella': {
        const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), matA);
        canopy.position.set(2.7, 1.1, 0.5);
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8), goldMat);
        handle.position.set(2.7, 0.3, 0.5);
        group.add(canopy, handle);
        break;
      }
      default: {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), matA);
        sphere.position.set(2.6, 0.6, 0.5);
        group.add(sphere);
      }
    }

    return group;
  }

  updateScrollProgress(progress) {
    const maxIndex = this.alphabetData.length - 1;
    this.scrollProgress = Math.max(0, Math.min(maxIndex + 0.99, progress));
    const currentIndex = Math.floor(this.scrollProgress);

    if (currentIndex !== this.currentLetterIndex && currentIndex <= maxIndex) {
      this.currentLetterIndex = currentIndex;
      this.updateThemeColors(currentIndex);
    }

    this.alphabetData.forEach((_, idx) => {
      const entry = this.letterMeshes.get(idx);
      if (!entry) return;

      const diff = idx - this.scrollProgress;

      if (Math.abs(diff) <= 1.2) {
        entry.group.visible = true;

        const yOffset = -diff * 3.8;
        const zOffset = -Math.abs(diff) * 2.8;
        entry.group.position.set(0, yOffset, zOffset);

        const scale = Math.max(0.001, 1.0 - Math.abs(diff) * 0.45);
        entry.group.scale.set(scale, scale, scale);

        entry.letterMesh.rotation.y = diff * Math.PI * 0.9 + this.userRotation.y;
        entry.letterMesh.rotation.x = diff * 0.4 + this.userRotation.x;

        if (entry.propsGroup) {
          entry.propsGroup.rotation.y = diff * Math.PI * 1.2;
        }
      } else {
        entry.group.visible = false;
      }
    });

    const cameraTargetZ = 10.5 + Math.sin(this.scrollProgress * 0.5) * 0.8;
    this.camera.position.z += (cameraTargetZ - this.camera.position.z) * 0.1;
  }

  updateThemeColors(index) {
    const data = this.alphabetData[index];
    if (!data) return;

    if (this.accentPointLight) {
      this.accentPointLight.color.setHex(data.theme.threeColor);
    }
  }

  triggerLetterWobble() {
    this.wobble.active = true;
    this.wobble.time = 0;
    this.wobble.amp = 1.0;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
      this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.dragStart.x;
        const deltaY = e.clientY - this.dragStart.y;
        this.userRotation.y += deltaX * 0.008;
        this.userRotation.x += deltaY * 0.008;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
      }
    });

    this.container.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    this.container.addEventListener('click', (e) => {
      this.mouseVector.x = (e.clientX / this.width) * 2 - 1;
      this.mouseVector.y = -(e.clientY / this.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouseVector, this.camera);
      const entry = this.letterMeshes.get(this.currentLetterIndex);
      if (entry) {
        const intersects = this.raycaster.intersectObjects(entry.group.children, true);
        if (intersects.length > 0) {
          this.triggerLetterWobble();
          window.dispatchEvent(new CustomEvent('letter-clicked', {
            detail: { letterIndex: this.currentLetterIndex }
          }));
        }
      }
    });
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.camera.position.x = this.mouse.x * 0.85;
    this.camera.position.y = this.mouse.y * 0.6 + Math.sin(elapsedTime * 0.8) * 0.15;
    this.camera.lookAt(0, 0, 0);

    if (this.starfield) {
      this.starfield.rotation.y = elapsedTime * 0.02;
      this.starfield.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;
    }

    const currentEntry = this.letterMeshes.get(this.currentLetterIndex);
    if (currentEntry && currentEntry.group.visible) {
      let wobbleScale = 1.0;
      if (this.wobble.active) {
        this.wobble.time += delta * 12;
        wobbleScale = 1.0 + Math.sin(this.wobble.time) * 0.28 * Math.exp(-this.wobble.time * 0.35);
        if (this.wobble.time > 8) {
          this.wobble.active = false;
        }
      }

      const floatY = Math.sin(elapsedTime * 2.2) * 0.12;
      currentEntry.letterMesh.position.y = floatY;
      currentEntry.letterMesh.scale.set(wobbleScale, wobbleScale, wobbleScale);

      if (currentEntry.propsGroup) {
        currentEntry.propsGroup.rotation.y += delta * 0.5;
        currentEntry.propsGroup.position.y = -floatY * 0.5;
      }

      if (!this.isDragging) {
        this.userRotation.y *= 0.95;
        this.userRotation.x *= 0.95;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
