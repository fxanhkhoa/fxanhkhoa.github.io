/**
 * 3D Interactive Book Engine with Realistic Page Flip Animation
 *
 * Implements a real 3D Book where scrolling drives the continuous page flip:
 * - Each chapter is a physical 3D page spread.
 * - Upcoming pages are stacked in 3D depth and move forward as you scroll.
 * - Sheets physically bend, curl, and rotate 180° around the spine.
 * - Dynamic high-DPI canvas textures for pages with gold foil accents.
 *
 * Built with Three.js.
 */

import * as THREE from 'three';

export class BookThreeScene {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Lighting
    this.spotLight = null;
    this.ambientLight = null;
    this.rimLight = null;

    // Book 3D Meshes
    this.bookGroup = null;
    this.coverLeft = null;
    this.coverRight = null;
    this.spine = null;
    this.sheets = []; // Array of 6 flippable sheets

    // Scroll state
    this.scrollProgress = 0; // 0.0 to 6.0
    this.targetScrollProgress = 0;
    this.lastFlippedIndex = -1;

    // Mouse Parallax & Drag Orbit
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.userOrbit = { azimuth: 0, elevation: 0 };
    this.userVelocity = { velX: 0, velY: 0 };

    // Callback for page flip sound & click navigation
    this.onPageFlip = null;
    this.onPageClick = null;

    // Dimensions of each page in 3D units
    this.pageWidth = 3.1;
    this.pageHeight = 4.3;

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.setupStarfield();
    this.setupEventListeners();
    this.build3DBook();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060814, 0.028);

    this.camera = new THREE.PerspectiveCamera(44, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0.35, 7.2);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(this.ambientLight);

    // Focused warm reading spotlight
    this.spotLight = new THREE.SpotLight(0xfff6ea, 2.8, 18, Math.PI * 0.28, 0.45, 1.2);
    this.spotLight.position.set(0, 6, 5);
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.scene.add(this.spotLight);

    // Cool neon rim lights for edge glow
    this.rimLight = new THREE.DirectionalLight(0x00f0ff, 1.3);
    this.rimLight.position.set(-6, -3, -4);
    this.scene.add(this.rimLight);

    const rimLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.3);
    rimLight2.position.set(6, -3, -4);
    this.scene.add(rimLight2);
  }

  setupStarfield() {
    const starCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x00f0ff),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0xffd166),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 9 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const stars = new THREE.Points(geometry, material);
    this.scene.add(stars);
  }

  // -------------------------------------------------------------
  // BUILD 3D BOOK WITH 6 FLIPPABLE SHEETS
  // -------------------------------------------------------------
  build3DBook() {
    this.bookGroup = new THREE.Group();
    this.bookGroup.position.set(0, -0.1, 0);

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e1c,
      roughness: 0.35,
      metalness: 0.7
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0x5c3d06,
      metalness: 0.9,
      roughness: 0.2
    });

    // 1. Curved Book Spine (in center x = 0)
    const spineGeo = new THREE.CylinderGeometry(0.35, 0.35, this.pageHeight + 0.3, 16, 1, false, Math.PI * 0.5, Math.PI);
    this.spine = new THREE.Mesh(spineGeo, leatherMat);
    this.spine.rotation.y = Math.PI * 0.5;
    this.spine.position.set(0, 0, -0.28);
    this.bookGroup.add(this.spine);

    // 2. Hardcover Plates (Left and Right bases)
    const coverGeo = new THREE.BoxGeometry(this.pageWidth + 0.15, this.pageHeight + 0.25, 0.08);
    coverGeo.translate((this.pageWidth + 0.15) / 2, 0, 0);

    // Left Cover
    this.coverLeft = new THREE.Mesh(coverGeo, leatherMat);
    this.coverLeft.position.set(0, 0, -0.28);
    this.coverLeft.rotation.y = Math.PI;
    this.bookGroup.add(this.coverLeft);

    // Right Cover
    this.coverRight = new THREE.Mesh(coverGeo, leatherMat);
    this.coverRight.position.set(0, 0, -0.28);
    this.bookGroup.add(this.coverRight);

    // Gold decorative corner brackets on covers
    const cornerGeo = new THREE.BoxGeometry(0.35, 0.35, 0.09);
    const cornerTL = new THREE.Mesh(cornerGeo, goldTrimMat);
    cornerTL.position.set(this.pageWidth + 0.05, (this.pageHeight + 0.2) / 2, 0);
    this.coverRight.add(cornerTL);

    const cornerBL = new THREE.Mesh(cornerGeo, goldTrimMat);
    cornerBL.position.set(this.pageWidth + 0.05, -(this.pageHeight + 0.2) / 2, 0);
    this.coverRight.add(cornerBL);

    // 3. Create 6 Flippable Sheets (Pages 0 to 5)
    // Sheet 0: Front = Prologue (Hero) | Back = Origin Left
    // Sheet 1: Front = Origin Right   | Back = Arsenal Left
    // Sheet 2: Front = Arsenal Right  | Back = Masterpieces Left
    // Sheet 3: Front = Masterpieces Right | Back = Odyssey Left
    // Sheet 4: Front = Odyssey Right  | Back = Expeditions Left
    // Sheet 5: Front = Expeditions Right | Back = Epilogue Left
    this.sheets = [];
    const totalSheets = 6;
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();

    for (let i = 0; i < totalSheets; i++) {
      const sheetPivot = new THREE.Group();
      const initialZ = -0.035 * i;
      sheetPivot.position.set(0, 0, initialZ);

      // Segmented plane geometry to allow realistic page curl during flip
      const segmentsX = 28;
      const segmentsY = 14;
      const pageGeo = new THREE.PlaneGeometry(this.pageWidth, this.pageHeight, segmentsX, segmentsY);
      // Pivot around the spine at x = 0
      pageGeo.translate(this.pageWidth / 2, 0, 0);

      // Cache original positions for bending deformation
      const origPositions = pageGeo.attributes.position.clone();
      pageGeo.userData.origPositions = origPositions;

      // Create textures for front and back of this sheet
      const frontTex = this.createPageTexture(i, true);
      const backTex = this.createPageTexture(i, false);

      frontTex.anisotropy = maxAniso;
      backTex.anisotropy = maxAniso;

      // Flip back texture horizontally so it reads left-to-right when flipped 180°
      backTex.wrapS = THREE.RepeatWrapping;
      backTex.repeat.x = -1;
      backTex.offset.x = 1;

      const frontMat = new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: 0.45,
        metalness: 0.08,
        side: THREE.FrontSide
      });

      const backMat = new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.45,
        metalness: 0.08,
        side: THREE.BackSide
      });

      const frontMesh = new THREE.Mesh(pageGeo, frontMat);
      frontMesh.castShadow = true;
      frontMesh.receiveShadow = true;

      // Back mesh mirrored so it reads upright when flipped
      const backMesh = new THREE.Mesh(pageGeo, backMat);
      backMesh.castShadow = true;
      backMesh.receiveShadow = true;

      sheetPivot.add(frontMesh);
      sheetPivot.add(backMesh);

      sheetPivot.userData = {
        sheetIndex: i,
        pageGeo: pageGeo,
        frontMesh: frontMesh,
        backMesh: backMesh,
        origPositions: origPositions,
        baseZ: initialZ
      };

      this.bookGroup.add(sheetPivot);
      this.sheets.push(sheetPivot);
    }

    // 4. Paper block under left and right pages representing page thickness
    const pageEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xd8d3c8,
      roughness: 0.85,
      metalness: 0.05
    });

    const blockGeo = new THREE.BoxGeometry(this.pageWidth, this.pageHeight, 0.18);
    const leftBlock = new THREE.Mesh(blockGeo, pageEdgeMat);
    leftBlock.position.set(-this.pageWidth / 2, 0, -0.19);
    leftBlock.castShadow = true;
    leftBlock.receiveShadow = true;
    this.bookGroup.add(leftBlock);

    const rightBlock = new THREE.Mesh(blockGeo, pageEdgeMat);
    rightBlock.position.set(this.pageWidth / 2, 0, -0.19);
    rightBlock.castShadow = true;
    rightBlock.receiveShadow = true;
    this.bookGroup.add(rightBlock);

    // 5. Static Right Back Cover Page (Epilogue right side / form backing)
    const lastPageGeo = new THREE.PlaneGeometry(this.pageWidth, this.pageHeight);
    lastPageGeo.translate(this.pageWidth / 2, 0, -0.24);
    const lastPageTex = this.createLastPageTexture();
    lastPageTex.anisotropy = maxAniso;
    const lastPageMesh = new THREE.Mesh(
      lastPageGeo,
      new THREE.MeshStandardMaterial({ map: lastPageTex, roughness: 0.45, metalness: 0.08 })
    );
    lastPageMesh.receiveShadow = true;
    this.bookGroup.add(lastPageMesh);

    // 6. Desk surface beneath the book
    const deskGeo = new THREE.PlaneGeometry(28, 18);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x05070e,
      roughness: 0.7,
      metalness: 0.3
    });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, -this.pageHeight / 2 - 0.12, -0.32);
    desk.rotation.x = -Math.PI * 0.46;
    desk.receiveShadow = true;
    this.scene.add(desk);

    this.scene.add(this.bookGroup);
  }

  // -------------------------------------------------------------
  // DYNAMIC 2D CANVAS TEXTURES FOR CRISP 3D BOOK PAGES
  // -------------------------------------------------------------
  createPageTexture(sheetIndex, isFront) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1420;
    const ctx = canvas.getContext('2d');

    // Cyber-Parchment Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1420);
    bgGrad.addColorStop(0, '#0c1224');
    bgGrad.addColorStop(1, '#070a16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1420);

    // Elegant Golden Border Frame
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 1024 - 72, 1420 - 72);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(46, 46, 1024 - 92, 1420 - 92);

    // Spine shadow gradient
    const shadowGrad = ctx.createLinearGradient(isFront ? 0 : 1024, 0, isFront ? 140 : 1024 - 140, 0);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(0, 0, 1024, 1420);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    // Render Section Content based on sheet index & side
    this.drawPageArtwork(ctx, sheetIndex, isFront, texture);

    // Page Number
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '22px "JetBrains Mono", monospace';
    const pageNum = isFront ? (sheetIndex * 2 + 1) : (sheetIndex * 2);
    ctx.fillText(`— 0${pageNum} —`, isFront ? 880 : 100, 1370);

    return texture;
  }

  createLastPageTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1420;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#080c1a';
    ctx.fillRect(0, 0, 1024, 1420);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, 1024 - 72, 1420 - 72);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillText('FINAL CHAPTER // EPILOGUE', 80, 160);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 50px "Space Grotesk", sans-serif';
    ctx.fillText('Transmission Portal', 80, 250);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '26px "Plus Jakarta Sans", sans-serif';
    this.wrapText(ctx, 'Ready to build something extraordinary together? Send a direct dispatch to Kevin Bui using the transmission panel.', 80, 340, 820, 44);

    // Visual transmission card box
    ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.fillRect(80, 500, 820, 420);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 500, 820, 420);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 32px "Space Grotesk", sans-serif';
    ctx.fillText('TRANSMISSION STATUS: READY', 120, 570);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '22px "JetBrains Mono", monospace';
    ctx.fillText('• Form Service: EmailJS Active', 120, 630);
    ctx.fillText('• Security: Direct Encrypted Dispatch', 120, 680);
    ctx.fillText('• Response Window: Within 24 Hours', 120, 730);
    ctx.fillText('• Coordinates: fxanhkhoa@gmail.com', 120, 780);
    ctx.fillText('• Phone: +84 772 912 970', 120, 830);

    // Callout button prompt
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillText('CLICK "SEND TRANSMISSION" BELOW ✉', 120, 1020);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  drawPageArtwork(ctx, sheetIndex, isFront, texture) {
    if (sheetIndex === 0 && isFront) {
      // 00 PROLOGUE // COVER TITLE PAGE
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 30px "JetBrains Mono", monospace';
      ctx.fillText('BOOK OF CREATION // VOL. 2025', 100, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 68px "Space Grotesk", sans-serif';
      ctx.fillText('KEVIN BUI', 100, 260);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '600 32px "Space Grotesk", sans-serif';
      ctx.fillText('Full Stack Architect & 3D Technologist', 100, 320);

      // Gold Divider
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(100, 370);
      ctx.lineTo(920, 370);
      ctx.stroke();

      // Draw Avatar Image in top right
      const avatarImg = new Image();
      avatarImg.crossOrigin = 'anonymous';
      avatarImg.src = 'images/avatar.png';
      avatarImg.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(820, 230, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, 820 - 80, 230 - 80, 160, 160);
        ctx.restore();

        // Neon ring around avatar
        ctx.beginPath();
        ctx.arc(820, 230, 84, 0, Math.PI * 2);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.stroke();

        if (texture) texture.needsUpdate = true;
      };

      // Narrative intro
      ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
      ctx.font = '28px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'Over 6 years designing robust distributed systems, high-concurrency microservices, and interactive 3D WebGL experiences.', 100, 440, 800, 44);

      // Telemetry Boxes
      const metrics = [
        { val: '6+ Years', lbl: 'EXPERIENCE' },
        { val: '50+ Apps', lbl: 'SHIPPED' },
        { val: '30+ Clients', lbl: 'SATISFACTION' },
        { val: '10M+ Users', lbl: 'REACHED' }
      ];

      metrics.forEach((m, i) => {
        const x = 100 + (i % 2) * 420;
        const y = 620 + Math.floor(i / 2) * 160;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(x, y, 380, 120);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.strokeRect(x, y, 380, 120);

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 42px "Space Grotesk", sans-serif';
        ctx.fillText(m.val, x + 24, y + 58);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '18px "JetBrains Mono", monospace';
        ctx.fillText(m.lbl, x + 24, y + 96);
      });

      // Bottom flip cue
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText('SCROLL DOWN OR CLICK TO TURN PAGE ▹', 100, 1280);

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 42px "Space Grotesk", sans-serif';
        ctx.fillText(m.val, x + 24, y + 58);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '18px "JetBrains Mono", monospace';
        ctx.fillText(m.lbl, x + 24, y + 96);
      });

      // Bottom flip cue
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText('SCROLL DOWN TO TURN THE PAGE ▹', 100, 1280);

    } else if (sheetIndex === 0 && !isFront) {
      // 01 ORIGIN // LEFT PAGE
      ctx.fillStyle = '#00f5d4';
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillText('CHAPTER 01 // ORIGIN STORY', 80, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px "Space Grotesk", sans-serif';
      ctx.fillText('The Architect\'s Path', 80, 250);

      ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
      ctx.font = '26px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'From an enthusiastic engineering college graduate to a Lead Architect delivering high-stakes solutions for Singapore major hospitals, German industrial automation, and US SaaS platforms.', 80, 340, 820, 44);

      this.wrapText(ctx, 'My engineering philosophy revolves around full-cycle ownership: writing maintainable code from foundational databases and microservices up through polished user interfaces.', 80, 560, 820, 44);

      // Core pillars header
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Pillar I: Full-Cycle Engineering', 80, 820);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'End-to-end stewardship from database design, gRPC/GraphQL microservices, and Kubernetes cloud deployments to responsive frontend interfaces.', 80, 870, 820, 38);

    } else if (sheetIndex === 1 && isFront) {
      // 01 ORIGIN // RIGHT PAGE
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Pillar II: Low Latency & Concurrency', 80, 160);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'Engineering real-time video streaming, WebSocket synchronization, and hardware-software valve control with millisecond response times.', 80, 210, 820, 38);

      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Pillar III: 3D Scrollytelling', 80, 400);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'Blending Three.js WebGL, procedural typography, and camera choreography to transform static portfolios into narrative journeys.', 80, 450, 820, 38);

      // Resume Banner
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.fillRect(80, 700, 820, 180);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.strokeRect(80, 700, 820, 180);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 34px "Space Grotesk", sans-serif';
      ctx.fillText('Official Resume & Credentials', 110, 765);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Updated CV available for direct download via top header.', 110, 820);

    } else if (sheetIndex === 1 && !isFront) {
      // 02 ARSENAL // LEFT PAGE
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillText('CHAPTER 02 // TECHNICAL ARSENAL', 80, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px "Space Grotesk", sans-serif';
      ctx.fillText('The Tech Matrix', 80, 250);

      // Frontend
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Frontend & Reactive UI', 80, 350);
      const feSkills = ['Angular (2–19)', 'React.js', 'Next.js', 'SvelteKit', 'TypeScript', 'Tailwind CSS', 'SASS'];
      this.drawChips(ctx, feSkills, 80, 390, 820, '#00f0ff');

      // Backend
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Backend & Distributed Systems', 80, 720);
      const beSkills = ['Golang', 'Node.js', 'NestJS', 'GraphQL & Hasura', 'gRPC Microservices', 'WebSockets', 'WebRTC'];
      this.drawChips(ctx, beSkills, 80, 760, 820, '#a855f7');

    } else if (sheetIndex === 2 && isFront) {
      // 02 ARSENAL // RIGHT PAGE
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Cloud & Infrastructure', 80, 160);
      const cloudSkills = ['Kubernetes (K8s)', 'Docker Containers', 'Azure Cloud', 'AWS', 'PostgreSQL', 'MongoDB', 'Redis', 'CI/CD Pipelines'];
      this.drawChips(ctx, cloudSkills, 80, 200, 820, '#ec4899');

      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Creative 3D & Advanced Frontiers', 80, 560);
      const creativeSkills = ['Three.js & WebGL', 'Web Audio Synth', 'RxJS Reactive', 'NgRx Store', 'Flutter Mobile', 'Electron Desktop', 'MQTT IoT'];
      this.drawChips(ctx, creativeSkills, 80, 600, 820, '#ffd166');

    } else if (sheetIndex === 2 && !isFront) {
      // 03 MASTERPIECES // LEFT PAGE
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillText('CHAPTER 03 // MASTERPIECES', 80, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px "Space Grotesk", sans-serif';
      ctx.fillText('🏎️ AETHER GT', 80, 250);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText('3D EXPLODED HYPERCAR PRODUCT TOUR', 80, 310);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '26px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'A scroll-driven 3D product tour of an electric hypercar. The camera executes a 7-stage choreographed flythrough, disassembling aerodynamic body panels, dual motors, and cockpit.', 80, 380, 820, 44);

      ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.fillRect(80, 620, 820, 140);
      ctx.strokeStyle = '#00f0ff';
      ctx.strokeRect(80, 620, 820, 140);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Direct Link: storytelling/car/', 110, 680);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Includes real-time exploded view customizer studio.', 110, 725);

    } else if (sheetIndex === 3 && isFront) {
      // 03 MASTERPIECES // RIGHT PAGE
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px "Space Grotesk", sans-serif';
      ctx.fillText('🪐 Alphabet Odyssey', 80, 160);

      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText('BILINGUAL 3D SCROLLYTELLING (EN & VI)', 80, 220);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '26px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'An interactive 3D educational journey in English (A–Z) & Vietnamese (29 chữ cái). Features extruded 3D typography, procedural diacritics, and Web Audio synth.', 80, 290, 820, 44);

      // What To Eat
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px "Space Grotesk", sans-serif';
      ctx.fillText('🍳 What To Eat', 80, 580);

      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText('LIVE FOOD PLATFORM (eatwhat.io.vn)', 80, 640);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '26px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'Interactive food platform for indecisive foodies. Features thousands of recipes, ingredient profiles, and dish-based games (Flavor Wheel, Community Voting).', 80, 710, 820, 44);

    } else if (sheetIndex === 3 && !isFront) {
      // 04 ODYSSEY // LEFT PAGE
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillText('CHAPTER 04 // CAREER ODYSSEY', 80, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px "Space Grotesk", sans-serif';
      ctx.fillText('Enterprise Leadership', 80, 250);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('ST Engineering (Nov 2023 – Present)', 80, 350);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, '• Healthcare Operations Center: Modernized major Singapore hospital system with SvelteKit, NestJS, and real-time WebSockets.\n• CRM & Livestream: Engineered low-latency WebRTC streaming system.\n• SSRE & Manga Sahara: High-performance reading and quoting platforms.', 80, 400, 820, 40);

      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Bloom (Mar 2022 – Nov 2023)', 80, 700);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, '• The Dolce Diet: US SaaS diet rebuild for 10,000+ users with K8s auto-scaling.\n• D-Producer: Musical water fountain hardware-software sync with millisecond latency.', 80, 750, 820, 40);

    } else if (sheetIndex === 4 && isFront) {
      // 04 ODYSSEY // RIGHT PAGE
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('NashTech (June 2020 – Nov 2021)', 80, 160);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, '• CNC Control Software: German industrial manufacturing remote desktop interface (RDP/VNC) with Angular micro-frontends.\n• Smart Manufacturing: Real-time IPC shop-floor tracking for 100+ operators.\n• Wealth Management: High-security solution serving 10,000,000+ accounts.', 80, 210, 820, 40);

      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Hitachi Vantara (Feb 2019 – Jun 2020)', 80, 560);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, '• Vidole: Enterprise video platform.\n• Polymate: Big Data analytics with interactive D3.js visualization.\n• IoT Telemetry: MQTT & WebSocket device monitoring.', 80, 610, 820, 40);

    } else if (sheetIndex === 4 && !isFront) {
      // 05 EXPEDITIONS // LEFT PAGE
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillText('CHAPTER 05 // FREELANCE EXPEDITIONS', 80, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px "Space Grotesk", sans-serif';
      ctx.fillText('Specialized Consulting', 80, 250);

      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Smart Farm Bio-Safety Evaluation', 80, 360);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'Automated evaluation reporting system for USA smart farms with Excel report comparisons. Angular, TypeScript, Node.js, MongoDB (200+ active users).', 80, 410, 820, 38);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Orders Management Enterprise CRM', 80, 640);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'Multi-department enterprise CRM with stringent role-based access control (RBAC) and automated inventory deduction. Angular 13, NestJS, MongoDB.', 80, 690, 820, 38);

    } else if (sheetIndex === 5 && isFront) {
      // 05 EXPEDITIONS // RIGHT PAGE
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('Animal Farm Supply ERP', 80, 160);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'Agricultural ERP for feed suppliers tracking feed supplies, veterinary medications, stall workflows, and monthly revenue analytics.', 80, 210, 820, 38);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 30px "Space Grotesk", sans-serif';
      ctx.fillText('What To Eat Community Platform', 80, 440);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '24px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'Full-cycle community platform deployed on Kubernetes with SvelteKit, Golang, and MongoDB.', 80, 490, 820, 38);

    } else if (sheetIndex === 5 && !isFront) {
      // 06 EPILOGUE // LEFT PAGE
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillText('EPILOGUE // INITIATE TRANSMISSION', 80, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px "Space Grotesk", sans-serif';
      ctx.fillText('Let\'s Connect', 80, 250);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '26px "Plus Jakarta Sans", sans-serif';
      this.wrapText(ctx, 'Currently open to technical leadership roles, architectural consulting, and groundbreaking 3D web ventures.', 80, 340, 820, 44);

      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 28px "Space Grotesk", sans-serif';
      ctx.fillText('Email: fxanhkhoa@gmail.com', 80, 540);
      ctx.fillText('Phone: +84 772 912 970', 80, 610);
      ctx.fillText('Location: Ho Chi Minh City, Vietnam', 80, 680);
    }
  }

  drawChips(ctx, items, startX, startY, maxWidth, color) {
    let curX = startX;
    let curY = startY;

    items.forEach(item => {
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(item).width;
      const chipWidth = textWidth + 36;

      if (curX + chipWidth > startX + maxWidth) {
        curX = startX;
        curY += 56;
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(curX, curY, chipWidth, 44);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(curX, curY, chipWidth, 44);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(item, curX + 18, curY + 29);

      curX += chipWidth + 14;
    });
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const lines = text.split('\n');
    lines.forEach(line => {
      const words = line.split(' ');
      let currentLine = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(currentLine, x, y);
          currentLine = words[n] + ' ';
          y += lineHeight;
        } else {
          currentLine = testLine;
        }
      }
      ctx.fillText(currentLine, x, y);
      y += lineHeight;
    });
  }

  // -------------------------------------------------------------
  // CONTINUOUS SCROLL INPUT BINDING FOR PAGE FLIP
  // -------------------------------------------------------------
  setScrollProgress(progress) {
    this.targetScrollProgress = Math.max(0, Math.min(this.sheets.length, progress));
  }

  updateScrollBoundTimeline(delta) {
    // Smooth cinematic progress dampening
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.11;

    const clamped = Math.max(0, Math.min(this.sheets.length, this.scrollProgress));

    // Update each sheet's physical flip angle and curl
    this.sheets.forEach((sheetPivot, idx) => {
      const t = Math.max(0, Math.min(1, clamped - idx));

      // 1. Rotation around spine (0 to -PI)
      sheetPivot.rotation.y = -t * Math.PI;

      // 2. Exact Physical Z Stacking:
      // At t = 0 (on right stack): z = -0.035 * idx;
      // At t = 1 (on left stack): z = -0.035 * (this.sheets.length - 1 - idx);
      const rightZ = -0.035 * idx;
      const leftZ = -0.035 * (this.sheets.length - 1 - idx);
      const baseZ = THREE.MathUtils.lerp(rightZ, leftZ, t);

      // Arc lift during the flip
      const liftZ = Math.sin(t * Math.PI) * 0.48;
      sheetPivot.position.z = baseZ + liftZ;

      // 3. Deform vertices to create realistic paper curl/bend
      const pageGeo = sheetPivot.userData.pageGeo;
      const origPos = sheetPivot.userData.origPositions;
      const posAttr = pageGeo.attributes.position;

      if (t > 0.005 && t < 0.995) {
        const bend = Math.sin(t * Math.PI);
        const curlAmount = bend * 0.42;
        for (let i = 0; i < posAttr.count; i++) {
          const ox = origPos.getX(i);
          const oy = origPos.getY(i);
          const oz = origPos.getZ(i);

          const r = ox / this.pageWidth; // 0 at spine, 1 at outer edge
          // Curl outer edge towards reader, and slight corner twist
          const curlZ = Math.sin(r * Math.PI * 0.5) * curlAmount * (1 - t * 0.45);
          const cornerTwist = Math.sin(r * Math.PI * 0.5) * bend * 0.12 * (oy / this.pageHeight);

          posAttr.setXYZ(i, ox, oy, oz + curlZ + cornerTwist);
        }
        posAttr.needsUpdate = true;
        pageGeo.computeVertexNormals();
      } else {
        // Reset to flat
        for (let i = 0; i < posAttr.count; i++) {
          posAttr.setXYZ(i, origPos.getX(i), origPos.getY(i), origPos.getZ(i));
        }
        posAttr.needsUpdate = true;
      }
    });

    // Check for page flip sound trigger
    const currentFlips = Math.round(clamped);
    if (currentFlips !== this.lastFlippedIndex) {
      if (this.lastFlippedIndex !== -1 && this.onPageFlip) {
        this.onPageFlip(currentFlips);
      }
      this.lastFlippedIndex = currentFlips;
    }

    // Camera slight breathing motion & parallax
    const az = this.userOrbit.azimuth + (this.mouse.x * 0.1);
    const el = this.userOrbit.elevation + (this.mouse.y * 0.07);

    this.bookGroup.rotation.y = az;
    this.bookGroup.rotation.x = el;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.handleResize());

    let clickStartX = 0;
    let clickStartY = 0;

    // Drag to orbit book or click to flip
    this.container.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      clickStartX = e.clientX;
      clickStartY = e.clientY;
      this.userVelocity.velX = 0;
      this.userVelocity.velY = 0;
    });

    window.addEventListener('pointermove', (e) => {
      this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
      this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;

      if (this.isDragging) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        this.userVelocity.velX = dx * 0.005;
        this.userVelocity.velY = dy * 0.005;
        this.userOrbit.azimuth += this.userVelocity.velX;
        this.userOrbit.elevation += this.userVelocity.velY;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
      }
    });

    window.addEventListener('pointerup', (e) => {
      this.isDragging = false;
      const dist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);
      if (dist < 8 && this.onPageClick) {
        if (e.clientX > this.width * 0.53) {
          this.onPageClick(1); // Clicked right page -> flip forward
        } else if (e.clientX < this.width * 0.47) {
          this.onPageClick(-1); // Clicked left page -> flip backward
        }
      }
    });
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Responsive camera distance and book scale
    if (this.width < 600) {
      this.bookGroup.scale.set(0.68, 0.68, 0.68);
      this.camera.position.set(0, 0.2, 9.6);
    } else if (this.width < 1000) {
      this.bookGroup.scale.set(0.85, 0.85, 0.85);
      this.camera.position.set(0, 0.3, 8.2);
    } else {
      this.bookGroup.scale.set(1, 1, 1);
      this.camera.position.set(0, 0.35, 7.2);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // Mouse Parallax Lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Decay user orbit
    if (!this.isDragging) {
      this.userOrbit.azimuth *= 0.95;
      this.userOrbit.elevation *= 0.95;
    }

    // Update Scroll-Bound Page Flip Animation
    this.updateScrollBoundTimeline(delta);

    this.renderer.render(this.scene, this.camera);
  }
}
