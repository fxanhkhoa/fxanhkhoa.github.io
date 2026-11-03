/**
 * Interactive 3D World Engine for Alphabet Odyssey
 * Built with Three.js (ESM), featuring 3D extruded typography, dynamic PBR materials,
 * companion 3D thematic props for all 26 letters, camera choreography, and particle cosmos.
 */

import * as THREE from 'three';
import { FontLoader } from '../vendor/FontLoader.js';
import { TextGeometry } from '../vendor/TextGeometry.js';
import { FONT_DATA } from '../fonts/font-data.js';
import { ALPHABET_DATA } from './alphabet-data.js';

export class AlphabetThreeScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Font & 3D Letters
    this.font = null;
    this.letterMeshes = new Map(); // letter -> { group, letterMesh, propsGroup }
    this.currentLetterIndex = 0;
    this.targetLetterIndex = 0;
    this.scrollProgress = 0; // 0 to 25.99

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

    // Floating animation ticker
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
    // Ambient gentle illumination
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    // Key directional light with warm tint
    this.keyLight = new THREE.DirectionalLight(0xffeedd, 1.6);
    this.keyLight.position.set(6, 9, 8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    // Rim light from behind for silhouette pop
    const rimLight = new THREE.DirectionalLight(0x6699ff, 1.2);
    rimLight.position.set(-8, -6, -5);
    this.scene.add(rimLight);

    // Dynamic accent light that adapts to each letter's unique theme
    this.accentPointLight = new THREE.PointLight(0xff4757, 3.2, 18, 1.2);
    this.accentPointLight.position.set(0, 0, 3.5);
    this.scene.add(this.accentPointLight);
  }

  setupStarfield() {
    const starCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xffd27d),
      new THREE.Color(0xa0c8ff),
      new THREE.Color(0xff99bb),
      new THREE.Color(0xa7f3d0)
    ];

    for (let i = 0; i < starCount; i++) {
      // Cylinder distribution along Z-axis
      const radius = 6 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = 1.2 + Math.random() * 2.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom star shader/points material
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
    // Generate all 26 letter worlds in advance
    ALPHABET_DATA.forEach((data, index) => {
      const letterGroup = new THREE.Group();
      letterGroup.position.set(0, 0, 0);
      letterGroup.visible = (index === 0);

      // 1. Create 3D Extruded Letter Mesh
      const letterMesh = this.create3DLetterMesh(data.letter, data.theme);
      letterMesh.castShadow = true;
      letterMesh.receiveShadow = true;
      letterMesh.userData = { isLetter: true, letterIndex: index };
      letterGroup.add(letterMesh);

      // 2. Create Thematic Companion 3D Props
      const propsGroup = this.createCompanionProps(data.propType, data.theme);
      letterGroup.add(propsGroup);

      this.scene.add(letterGroup);
      this.letterMeshes.set(index, { group: letterGroup, letterMesh, propsGroup, data });
    });

    this.updateThemeColors(0);
  }

  create3DLetterMesh(char, theme) {
    let geometry;

    if (this.font) {
      geometry = new TextGeometry(char, {
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
    } else {
      // Fallback procedural cylinder/torus representation
      geometry = new THREE.TorusKnotGeometry(1.2, 0.38, 64, 16);
    }

    // Deluxe Toy-like PBR Physical Material
    const material = new THREE.MeshPhysicalMaterial({
      color: theme.threeColor,
      roughness: 0.22,
      metalness: 0.15,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      transmission: 0.05
    });

    return new THREE.Mesh(geometry, material);
  }

  createCompanionProps(propType, theme) {
    const group = new THREE.Group();

    const matA = new THREE.MeshStandardMaterial({
      color: theme.threePropColor,
      roughness: 0.3,
      metalness: 0.2
    });
    const matB = new THREE.MeshStandardMaterial({
      color: theme.threeColor,
      roughness: 0.2,
      metalness: 0.3
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.2,
      metalness: 0.8
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf0f3f8,
      roughness: 0.4
    });

    switch (propType) {
      case 'astronaut': {
        // Red Apple with leaf
        const apple = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), new THREE.MeshStandardMaterial({ color: 0xff2244, roughness: 0.25 }));
        apple.scale.set(1, 0.92, 1);
        apple.position.set(-2.8, 1.2, 0.5);
        // Leaf
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x2ecc71 }));
        leaf.rotation.z = Math.PI / 4;
        leaf.position.set(-2.7, 2.0, 0.5);
        // Astronaut helmet sphere with golden visor
        const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), whiteMat);
        helmet.position.set(2.8, -1.0, 0.8);
        const visor = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), goldMat);
        visor.position.set(2.8, -1.0, 1.3);
        group.add(apple, leaf, helmet, visor);
        break;
      }
      case 'butterfly': {
        // Fluttering butterfly with two wings
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
        bGroup.userData = { isButterfly: true, wingL, wingR };

        // Honeycomb ring
        const honey = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.18, 16, 6), goldMat);
        honey.position.set(-2.8, -1.0, 0.4);
        honey.rotation.x = Math.PI / 4;
        group.add(bGroup, honey);
        break;
      }
      case 'cosmos': {
        // Crescent moon & orbital ring
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
        // Arched dolphin body
        const dCurve = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.28, 16, 24, Math.PI * 1.1), matA);
        dCurve.position.set(2.7, 0.5, 0.5);
        dCurve.rotation.z = -Math.PI / 4;
        // Splash rings
        const splash = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 12, 32), whiteMat);
        splash.position.set(-2.5, -1.2, 0.5);
        splash.rotation.x = Math.PI / 2.2;
        group.add(dCurve, splash);
        break;
      }
      case 'earth': {
        // Earth sphere
        const earth = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), matB);
        earth.position.set(2.8, 0.6, 0.5);
        // Compass ring
        const compass = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 32), goldMat);
        compass.position.set(-2.6, -0.8, 0.5);
        compass.rotation.y = Math.PI / 5;
        group.add(earth, compass);
        break;
      }
      case 'firefly': {
        // Glowing orbs (fireflies)
        for (let i = 0; i < 5; i++) {
          const ff = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffd32a }));
          ff.position.set(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 4,
            0.5 + Math.random() * 2
          );
          group.add(ff);
        }
        // Campfire cone
        const fire = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.2, 8), matA);
        fire.position.set(-2.6, -1.0, 0.5);
        group.add(fire);
        break;
      }
      case 'galaxy': {
        // Spiral galaxy disc
        const spiralRing = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.6, 32), matA);
        spiralRing.rotation.x = Math.PI / 3;
        spiralRing.position.set(-2.6, 1.1, 0.5);
        // Guitar body silhouette (two overlapping cylinders)
        const gBody1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.25, 20), goldMat);
        gBody1.position.set(2.8, -0.7, 0.5);
        group.add(spiralRing, gBody1);
        break;
      }
      case 'balloon': {
        // Hot air balloon
        const bTop = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 24), matA);
        bTop.scale.set(1, 1.25, 1);
        bTop.position.set(2.6, 1.0, 0.5);
        const bBasket = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.35), goldMat);
        bBasket.position.set(2.6, -0.4, 0.5);
        group.add(bTop, bBasket);
        break;
      }
      case 'iceberg': {
        // Ice crystal peaks
        const ice1 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 5), matA);
        ice1.position.set(-2.7, -0.6, 0.5);
        const ice2 = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.3, 4), whiteMat);
        ice2.position.set(2.7, 0.8, 0.5);
        group.add(ice1, ice2);
        break;
      }
      case 'jellyfish': {
        // Bioluminescent jellyfish dome + tentacles
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), matA);
        dome.position.set(2.7, 1.2, 0.5);
        dome.rotation.x = Math.PI;
        group.add(dome);
        for (let i = 0; i < 4; i++) {
          const tentacle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), matB);
          tentacle.position.set(2.4 + (i * 0.2), 0.3, 0.5);
          group.add(tentacle);
        }
        break;
      }
      case 'kite': {
        // Diamond kite
        const kiteGeom = new THREE.ConeGeometry(0.85, 1.4, 4);
        const kite = new THREE.Mesh(kiteGeom, matA);
        kite.position.set(-2.7, 1.1, 0.5);
        kite.scale.set(1, 0.1, 1);
        kite.rotation.z = Math.PI / 4;
        group.add(kite);
        break;
      }
      case 'lighthouse': {
        // Lighthouse tower + beam cylinder
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 2.2, 12), whiteMat);
        tower.position.set(-2.7, -0.4, 0.5);
        const beam = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.5, 16), new THREE.MeshBasicMaterial({ color: 0xfff0a0, transparent: true, opacity: 0.35 }));
        beam.position.set(-1.0, 0.6, 0.5);
        beam.rotation.z = -Math.PI / 2.6;
        group.add(tower, beam);
        break;
      }
      case 'mountain': {
        // Low-poly peaks
        const m1 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.9, 4), matA);
        m1.position.set(2.7, -0.6, 0.5);
        const m2 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 4), whiteMat);
        m2.position.set(1.6, -0.8, 0.3);
        group.add(m1, m2);
        break;
      }
      case 'nebula': {
        // Volumetric nebula orbs
        for (let i = 0; i < 4; i++) {
          const cloud = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6 + i * 0.2, 1), matA);
          cloud.position.set(-2.8 + (i * 0.4), 0.8 - (i * 0.4), 0.5);
          group.add(cloud);
        }
        break;
      }
      case 'octopus': {
        // Octopus head + curved arms
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.8, 20, 20), matA);
        head.position.set(2.6, 0.8, 0.5);
        group.add(head);
        for (let i = 0; i < 4; i++) {
          const arm = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.1, 10, 16, Math.PI), matB);
          arm.position.set(2.2 + i * 0.3, 0.0, 0.5);
          group.add(arm);
        }
        break;
      }
      case 'planet': {
        // Saturn ringed planet
        const pOrb = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), matA);
        pOrb.position.set(-2.7, 0.6, 0.5);
        const pRing = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.7, 32), goldMat);
        pRing.position.set(-2.7, 0.6, 0.5);
        pRing.rotation.x = Math.PI / 2.5;
        group.add(pOrb, pRing);
        break;
      }
      case 'queen': {
        // Jeweled Crown
        const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.65, 0.55, 16), goldMat);
        crownBase.position.set(2.7, 0.8, 0.5);
        // Points on crown
        for (let i = 0; i < 5; i++) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 6), matA);
          const angle = (i / 5) * Math.PI * 2;
          spike.position.set(2.7 + Math.cos(angle) * 0.7, 1.25, 0.5 + Math.sin(angle) * 0.7);
          group.add(spike);
        }
        group.add(crownBase);
        break;
      }
      case 'rocket': {
        // Retro Rocket
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
      case 'star': {
        // 5-point Star (made from 5 cones + center)
        const starCenter = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), goldMat);
        starCenter.position.set(2.6, 0.7, 0.5);
        group.add(starCenter);
        const starRing = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.06, 16, 48), matA);
        starRing.position.set(2.6, 0.7, 0.5);
        starRing.rotation.x = Math.PI / 3;
        group.add(starRing);
        break;
      }
      case 'telescope': {
        // Telescope tube on tripod
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 2.0, 16), goldMat);
        tube.position.set(-2.6, 0.8, 0.5);
        tube.rotation.z = Math.PI / 3.5;
        group.add(tube);
        break;
      }
      case 'umbrella': {
        // Umbrella dome
        const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), matA);
        canopy.position.set(2.7, 1.1, 0.5);
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8), goldMat);
        handle.position.set(2.7, 0.3, 0.5);
        group.add(canopy, handle);
        break;
      }
      case 'volcano': {
        // Volcano cone with crater
        const volcano = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.2, 1.6, 16), new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.9 }));
        volcano.position.set(-2.6, -0.6, 0.5);
        const magma = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff3838 }));
        magma.position.set(-2.6, 0.25, 0.5);
        group.add(volcano, magma);
        break;
      }
      case 'whale': {
        // Blue whale body + spout
        const wBody = new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 20), matA);
        wBody.scale.set(1.7, 0.8, 0.9);
        wBody.position.set(2.6, 0.5, 0.5);
        const spout = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 12), whiteMat);
        spout.position.set(2.9, 1.35, 0.5);
        group.add(wBody, spout);
        break;
      }
      case 'xylophone': {
        // Rainbow bars
        const colors = [0xff4757, 0xffa502, 0x2ed573, 0x1e90ff, 0x9c88ff];
        colors.forEach((col, idx) => {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.4 - idx * 0.15, 0.12), new THREE.MeshStandardMaterial({ color: col }));
          bar.position.set(-3.2 + (idx * 0.32), 0.5, 0.5);
          group.add(bar);
        });
        break;
      }
      case 'yacht': {
        // Boat hull + sails
        const hull = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.7), matA);
        hull.position.set(2.6, -0.5, 0.5);
        const sail = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.5, 3), whiteMat);
        sail.position.set(2.6, 0.6, 0.5);
        group.add(hull, sail);
        break;
      }
      case 'zeppelin': {
        // Steampunk Zeppelin airship
        const zep = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 24), matA);
        zep.scale.set(2.1, 0.9, 0.9);
        zep.position.set(-2.5, 0.8, 0.5);
        const gondola = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.35), goldMat);
        gondola.position.set(-2.5, -0.1, 0.5);
        // Lightning bolt indicator
        const bolt = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 8, 24, Math.PI), matB);
        bolt.rotation.z = Math.PI / 4;
        bolt.position.set(2.6, 0.6, 0.5);
        group.add(zep, gondola, bolt);
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
    // progress is float 0 to 25
    this.scrollProgress = Math.max(0, Math.min(25.99, progress));
    const currentIndex = Math.floor(this.scrollProgress);
    const fraction = this.scrollProgress - currentIndex;

    if (currentIndex !== this.currentLetterIndex) {
      this.currentLetterIndex = currentIndex;
      this.updateThemeColors(currentIndex);
    }

    // Choreograph 3D positions & visibility
    ALPHABET_DATA.forEach((_, idx) => {
      const entry = this.letterMeshes.get(idx);
      if (!entry) return;

      const diff = idx - this.scrollProgress;

      // Only show current and immediately adjacent letters to maximize performance
      if (Math.abs(diff) <= 1.2) {
        entry.group.visible = true;

        // Position interpolation: incoming from bottom/depth, outgoing up/back
        const yOffset = -diff * 3.8;
        const zOffset = -Math.abs(diff) * 2.8;
        entry.group.position.set(0, yOffset, zOffset);

        // Scale: active letter is scale 1.0, outgoing scales slightly
        const scale = Math.max(0.001, 1.0 - Math.abs(diff) * 0.45);
        entry.group.scale.set(scale, scale, scale);

        // Rotation choreography: organic spin on scroll transition
        entry.letterMesh.rotation.y = diff * Math.PI * 0.9 + this.userRotation.y;
        entry.letterMesh.rotation.x = diff * 0.4 + this.userRotation.x;

        // Orbit companion props smoothly
        if (entry.propsGroup) {
          entry.propsGroup.rotation.y = diff * Math.PI * 1.2;
        }
      } else {
        entry.group.visible = false;
      }
    });

    // Camera organic depth drift
    const cameraTargetZ = 10.5 + Math.sin(this.scrollProgress * 0.5) * 0.8;
    this.camera.position.z += (cameraTargetZ - this.camera.position.z) * 0.1;
  }

  updateThemeColors(index) {
    const data = ALPHABET_DATA[index];
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

    // Mouse movement parallax
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

    // Canvas click detection for 3D interactions
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
          // Dispatch custom event for audio & visual feedback
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

    // Smooth mouse parallax lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Apply gentle camera floating + parallax
    this.camera.position.x = this.mouse.x * 0.85;
    this.camera.position.y = this.mouse.y * 0.6 + Math.sin(elapsedTime * 0.8) * 0.15;
    this.camera.lookAt(0, 0, 0);

    // Slowly drift starfield particles
    if (this.starfield) {
      this.starfield.rotation.y = elapsedTime * 0.02;
      this.starfield.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;
    }

    // Active letter gentle breathing and wobble physics
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

      // Gentle continuous bobbing
      const floatY = Math.sin(elapsedTime * 2.2) * 0.12;
      currentEntry.letterMesh.position.y = floatY;

      // Apply wobble scale
      currentEntry.letterMesh.scale.set(wobbleScale, wobbleScale, wobbleScale);

      // Organic slow companion prop animations
      if (currentEntry.propsGroup) {
        currentEntry.propsGroup.rotation.y += delta * 0.5;
        currentEntry.propsGroup.position.y = -floatY * 0.5;
      }

      // User drag inertia decay
      if (!this.isDragging) {
        this.userRotation.y *= 0.95;
        this.userRotation.x *= 0.95;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
