/**
 * AETHER GT - Procedural 3D Hypercar Multi-Layer Assembly
 * Built with Three.js featuring modular exploded-view sub-assemblies:
 * 1. Carbon Monocoque Chassis & Structural Battery Pack
 * 2. Twin High-Output Electric Motors & Inverters (Powertrain)
 * 3. Double-Wishbone Pushrod Suspension & Ceramic Brakes
 * 4. 4 Forged Aero Wheels with Low-Profile Tires
 * 5. Futuristic Digital Cockpit with Scissor Doors
 * 6. Carbon Composite Outer Aero Body Shell & Active Rear Wing
 * 7. Autonomous LiDAR & Radar Sensor Suite
 */

import * as THREE from 'three';

export class CarModel {
  constructor() {
    this.root = new THREE.Group();

    // Sub-assemblies for exploded view animation
    this.bodyGroup = new THREE.Group();
    this.chassisGroup = new THREE.Group();
    this.powertrainGroup = new THREE.Group();
    this.suspensionGroup = new THREE.Group();
    this.wheelsGroup = new THREE.Group();
    this.interiorGroup = new THREE.Group();
    this.doorsGroup = new THREE.Group();
    this.activeWingGroup = new THREE.Group();
    this.techSensorsGroup = new THREE.Group();
    this.lightsGroup = new THREE.Group();

    // Specific moving parts for animations
    this.wheels = [];
    this.doorLeft = null;
    this.doorRight = null;
    this.activeWing = null;
    this.lidarPod = null;
    this.sensorScanCone = null;

    // Materials dictionary for real-time customization
    this.materials = {};

    this.initMaterials();
    this.buildCar();
  }

  initMaterials() {
    // 1. Luxury Metallic Car Paint (PBR Clearcoat)
    this.materials.carPaint = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff, // Apex Cyber Cyan
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95
    });

    // 2. Matte Carbon Fiber
    this.materials.carbon = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.45,
      metalness: 0.65
    });

    // 3. Dark Smoked Glass / Windshield
    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0x111625,
      transmission: 0.85,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      metalness: 0.2,
      ior: 1.52
    });

    // 4. Brushed Titanium / Alloy
    this.materials.titanium = new THREE.MeshStandardMaterial({
      color: 0xd8dde8,
      metalness: 0.9,
      roughness: 0.25
    });

    // 5. Tire Rubber
    this.materials.rubber = new THREE.MeshStandardMaterial({
      color: 0x141416,
      roughness: 0.85,
      metalness: 0.05
    });

    // 6. High-Voltage Copper Busbars
    this.materials.copper = new THREE.MeshStandardMaterial({
      color: 0xff6b35,
      metalness: 0.8,
      roughness: 0.2
    });

    // 7. Battery Cells (Illuminated Cyan)
    this.materials.batteryCell = new THREE.MeshStandardMaterial({
      color: 0x00d2d3,
      emissive: 0x009999,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.5
    });

    // 8. Performance Brake Caliper (Hot Red)
    this.materials.caliper = new THREE.MeshStandardMaterial({
      color: 0xff2244,
      roughness: 0.25,
      metalness: 0.4
    });

    // 9. Drilled Ceramic Rotor
    this.materials.brakeRotor = new THREE.MeshStandardMaterial({
      color: 0x5a5f68,
      roughness: 0.35,
      metalness: 0.85
    });

    // 10. Headlights LED Matrix
    this.materials.headlights = new THREE.MeshBasicMaterial({
      color: 0xebf8ff
    });

    // 11. Taillight Horizon Bar
    this.materials.taillights = new THREE.MeshBasicMaterial({
      color: 0xff1030
    });

    // 12. Holographic HUD / Tech Glow
    this.materials.hologram = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
  }

  buildCar() {
    this.buildChassisAndBattery();
    this.buildPowertrainMotors();
    this.buildSuspensionAndBrakes();
    this.buildWheels();
    this.buildInterior();
    this.buildBodyShell();
    this.buildScissorDoors();
    this.buildActiveAeroWing();
    this.buildSensorsAndLiDAR();

    // Add all modular groups to car root
    this.root.add(this.chassisGroup);
    this.root.add(this.powertrainGroup);
    this.root.add(this.suspensionGroup);
    this.root.add(this.wheelsGroup);
    this.root.add(this.interiorGroup);
    this.root.add(this.bodyGroup);
    this.root.add(this.doorsGroup);
    this.root.add(this.activeWingGroup);
    this.root.add(this.techSensorsGroup);
    this.root.add(this.lightsGroup);

    // Initial positioning: car sits nicely on ground plane (y=0 is tire contact)
    this.root.position.set(0, 0, 0);
  }

  /* -------------------------------------------------------------
   * 1. Carbon Monocoque Chassis & Skateboard Battery
   * ------------------------------------------------------------- */
  buildChassisAndBattery() {
    // Structural Lower Floorpan (Skateboard)
    const floorGeo = new THREE.BoxGeometry(2.1, 0.16, 4.4);
    const floorMesh = new THREE.Mesh(floorGeo, this.materials.carbon);
    floorMesh.position.set(0, 0.3, 0);
    floorMesh.castShadow = true;
    floorMesh.receiveShadow = true;
    this.chassisGroup.add(floorMesh);

    // Battery Pack Casing
    const battCasingGeo = new THREE.BoxGeometry(1.7, 0.22, 2.8);
    const battCasing = new THREE.Mesh(battCasingGeo, this.materials.titanium);
    battCasing.position.set(0, 0.42, 0);
    this.chassisGroup.add(battCasing);

    // Prismatic Battery Module Array (Internal Glowing Cells)
    const rows = 4;
    const cols = 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.2, 12);
        const cell = new THREE.Mesh(cellGeo, this.materials.batteryCell);
        const xPos = (r - (rows - 1) / 2) * 0.36;
        const zPos = (c - (cols - 1) / 2) * 0.42;
        cell.position.set(xPos, 0.43, zPos);
        this.chassisGroup.add(cell);
      }
    }

    // Rear Aerodynamic Underbody Diffuser
    const diffuserGeo = new THREE.BoxGeometry(1.9, 0.15, 0.9);
    const diffuser = new THREE.Mesh(diffuserGeo, this.materials.carbon);
    diffuser.position.set(0, 0.32, -2.2);
    diffuser.rotation.x = -0.15;
    this.chassisGroup.add(diffuser);
  }

  /* -------------------------------------------------------------
   * 2. Powertrain: Dual Electric Motors & Silicon-Carbide Inverters
   * ------------------------------------------------------------- */
  buildPowertrainMotors() {
    // Front Dual-Rotor Motor Unit
    const frontMotor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.85, 20),
      this.materials.titanium
    );
    frontMotor.rotation.z = Math.PI / 2;
    frontMotor.position.set(0, 0.45, 1.45);
    this.powertrainGroup.add(frontMotor);

    // Front Inverter Box
    const frontInverter = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.25, 0.5),
      this.materials.carbon
    );
    frontInverter.position.set(0, 0.68, 1.45);
    this.powertrainGroup.add(frontInverter);

    // Rear High-Output Dual Axial Motor Unit
    const rearMotor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 1.05, 24),
      this.materials.titanium
    );
    rearMotor.rotation.z = Math.PI / 2;
    rearMotor.position.set(0, 0.52, -1.45);
    this.powertrainGroup.add(rearMotor);

    // Rear Dual Inverter & Cooling Reservoir
    const rearInverter = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.32, 0.65),
      this.materials.carbon
    );
    rearInverter.position.set(0, 0.78, -1.45);
    this.powertrainGroup.add(rearInverter);

    // High Voltage Copper Conduits (Connecting Battery to Motors)
    const conduitPositions = [-0.4, 0.4];
    conduitPositions.forEach(x => {
      const conduit = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8),
        this.materials.copper
      );
      conduit.rotation.x = Math.PI / 2;
      conduit.position.set(x, 0.46, 0);
      this.powertrainGroup.add(conduit);
    });
  }

  /* -------------------------------------------------------------
   * 3. Suspension: Double Wishbone Pushrod & Carbon-Ceramic Brakes
   * ------------------------------------------------------------- */
  buildSuspensionAndBrakes() {
    const wheelPositions = [
      { x: 1.05, z: 1.45, isFront: true },
      { x: -1.05, z: 1.45, isFront: true },
      { x: 1.08, z: -1.45, isFront: false },
      { x: -1.08, z: -1.45, isFront: false }
    ];

    wheelPositions.forEach((pos) => {
      const suspUnit = new THREE.Group();
      suspUnit.position.set(pos.x * 0.7, 0.48, pos.z);

      // Upper & Lower A-Arms
      const armUpper = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.25), this.materials.titanium);
      armUpper.position.set(pos.x > 0 ? 0.2 : -0.2, 0.12, 0);
      armUpper.rotation.z = pos.x > 0 ? 0.1 : -0.1;

      const armLower = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.3), this.materials.titanium);
      armLower.position.set(pos.x > 0 ? 0.2 : -0.2, -0.12, 0);

      // Pushrod Coilover Spring
      const shock = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12), this.materials.copper);
      shock.rotation.z = pos.x > 0 ? -0.45 : 0.45;
      shock.position.set(pos.x > 0 ? 0.05 : -0.05, 0.18, 0);

      suspUnit.add(armUpper, armLower, shock);
      this.suspensionGroup.add(suspUnit);

      // Brake Assembly (Mounted right behind the wheel hub)
      const brakeAssembly = new THREE.Group();
      brakeAssembly.position.set(pos.x, 0.48, pos.z);

      // Cross-Drilled Ceramic Rotor
      const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 24), this.materials.brakeRotor);
      rotor.rotation.z = Math.PI / 2;

      // Multi-Piston Monobloc Caliper
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.26), this.materials.caliper);
      caliper.position.set(pos.x > 0 ? -0.05 : 0.05, 0.22, 0.1);

      brakeAssembly.add(rotor, caliper);
      brakeAssembly.userData = { isBrake: true, isLeft: pos.x < 0, isFront: pos.isFront };
      this.suspensionGroup.add(brakeAssembly);
    });
  }

  /* -------------------------------------------------------------
   * 4. Wheels: Lightweight Forged Aero Rims & Low-Profile Tires
   * ------------------------------------------------------------- */
  buildWheels() {
    const wheelPositions = [
      { id: 'FL', x: 1.15, z: 1.45, isFront: true },
      { id: 'FR', x: -1.15, z: 1.45, isFront: true },
      { id: 'RL', x: 1.18, z: -1.45, isFront: false },
      { id: 'RR', x: -1.18, z: -1.45, isFront: false }
    ];

    wheelPositions.forEach((pos) => {
      const wheelHub = new THREE.Group();
      wheelHub.position.set(pos.x, 0.48, pos.z);

      // Low-Profile Performance Rubber Tire
      const tire = new THREE.Mesh(
        new THREE.TorusGeometry(0.46, 0.17, 16, 32),
        this.materials.rubber
      );
      tire.rotation.y = Math.PI / 2;
      tire.castShadow = true;

      // Forged Aerodynamic Rim Center
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.28, 20),
        this.materials.titanium
      );
      rim.rotation.z = Math.PI / 2;

      // Centerlock Nut & Turbine Blades
      const centerLock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.34, 12),
        this.materials.caliper
      );
      centerLock.rotation.z = Math.PI / 2;

      wheelHub.add(tire, rim, centerLock);
      wheelHub.userData = { id: pos.id, baseX: pos.x, baseZ: pos.z, isLeft: pos.x < 0 };

      this.wheels.push(wheelHub);
      this.wheelsGroup.add(wheelHub);
    });
  }

  /* -------------------------------------------------------------
   * 5. Cockpit & Futuristic Interior
   * ------------------------------------------------------------- */
  buildInterior() {
    // Twin Ergonomic Sport Bucket Seats
    [-0.45, 0.45].forEach((xPos) => {
      const seatGroup = new THREE.Group();
      seatGroup.position.set(xPos, 0.48, -0.2);

      // Seat base
      const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.15, 0.65), this.materials.carbon);
      // Seat backrest with side bolsters
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.75, 0.16), this.materials.carbon);
      backrest.position.set(0, 0.42, -0.28);
      backrest.rotation.x = 0.2;

      // Headrest
      const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.25, 0.14), this.materials.carbon);
      headrest.position.set(0, 0.88, -0.38);

      seatGroup.add(seatBase, backrest, headrest);
      this.interiorGroup.add(seatGroup);
    });

    // Minimalist Floating Dashboard Console
    const dash = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.26, 0.7),
      this.materials.carbon
    );
    dash.position.set(0, 0.85, 0.65);
    this.interiorGroup.add(dash);

    // Curved Panoramic Holographic Screen
    const screenGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.18, 24, 1, true, -Math.PI / 3, (Math.PI * 2) / 3);
    const screen = new THREE.Mesh(screenGeo, this.materials.hologram);
    screen.position.set(0, 0.95, 0.55);
    screen.rotation.y = Math.PI;
    this.interiorGroup.add(screen);

    // Yoke Steering Wheel (Driver side: x = -0.45)
    const yokeGroup = new THREE.Group();
    yokeGroup.position.set(-0.45, 0.86, 0.35);
    yokeGroup.rotation.x = -0.35;

    const yokeBar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 16, Math.PI * 1.3), this.materials.titanium);
    yokeBar.rotation.z = -Math.PI * 0.65;
    yokeGroup.add(yokeBar);
    this.interiorGroup.add(yokeGroup);
  }

  /* -------------------------------------------------------------
   * 6. Aerodynamic Composite Outer Body Shell
   * ------------------------------------------------------------- */
  buildBodyShell() {
    // Front Hood / Frunk (Low-slung wedge)
    const hoodGeo = new THREE.BoxGeometry(1.85, 0.18, 1.4);
    const hood = new THREE.Mesh(hoodGeo, this.materials.carPaint);
    hood.position.set(0, 0.68, 1.55);
    hood.rotation.x = 0.12;
    hood.castShadow = true;
    this.bodyGroup.add(hood);

    // Front Aerodynamic Carbon Splitter
    const splitter = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 0.06, 0.6),
      this.materials.carbon
    );
    splitter.position.set(0, 0.24, 2.3);
    this.bodyGroup.add(splitter);

    // Front Sculpted Fenders & Headlight Clusters
    [-0.95, 0.95].forEach((x) => {
      const fender = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.38, 1.45),
        this.materials.carPaint
      );
      fender.position.set(x, 0.62, 1.45);
      fender.castShadow = true;
      this.bodyGroup.add(fender);

      // Sharp Cyber LED Headlights
      const headlight = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.06, 0.3),
        this.materials.headlights
      );
      headlight.position.set(x * 0.85, 0.66, 2.15);
      headlight.rotation.y = x > 0 ? -0.25 : 0.25;
      this.lightsGroup.add(headlight);
    });

    // Glass Canopy / Windshield & Panoramic Roof
    const canopyGeo = new THREE.BoxGeometry(1.62, 0.48, 1.9);
    const canopy = new THREE.Mesh(canopyGeo, this.materials.glass);
    canopy.position.set(0, 1.05, 0.05);
    this.bodyGroup.add(canopy);

    // Rear Engine Cowl / Quarter Panels
    const rearCowlGeo = new THREE.BoxGeometry(2.0, 0.42, 1.6);
    const rearCowl = new THREE.Mesh(rearCowlGeo, this.materials.carPaint);
    rearCowl.position.set(0, 0.75, -1.35);
    rearCowl.castShadow = true;
    this.bodyGroup.add(rearCowl);

    // Full-Width Cyber Taillight Horizon Bar
    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.08, 0.08),
      this.materials.taillights
    );
    taillight.position.set(0, 0.76, -2.18);
    this.lightsGroup.add(taillight);
  }

  /* -------------------------------------------------------------
   * 7. Scissor Doors (Left & Right)
   * ------------------------------------------------------------- */
  buildScissorDoors() {
    // Left Scissor Door
    this.doorLeft = new THREE.Group();
    // Pivot anchor placed at front A-pillar base
    this.doorLeft.position.set(0.98, 0.62, 0.7);

    const dMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 1.25), this.materials.carPaint);
    dMeshL.position.set(0, 0.15, -0.6);
    dMeshL.castShadow = true;
    this.doorLeft.add(dMeshL);
    this.doorsGroup.add(this.doorLeft);

    // Right Scissor Door
    this.doorRight = new THREE.Group();
    this.doorRight.position.set(-0.98, 0.62, 0.7);

    const dMeshR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 1.25), this.materials.carPaint);
    dMeshR.position.set(0, 0.15, -0.6);
    dMeshR.castShadow = true;
    this.doorRight.add(dMeshR);
    this.doorsGroup.add(this.doorRight);
  }

  /* -------------------------------------------------------------
   * 8. Active Downforce Aero Wing
   * ------------------------------------------------------------- */
  buildActiveAeroWing() {
    this.activeWing = new THREE.Group();
    this.activeWing.position.set(0, 0.95, -2.05);

    // Dual Carbon Pylons
    [-0.55, 0.55].forEach((x) => {
      const pylon = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.32, 0.15),
        this.materials.carbon
      );
      pylon.position.set(x, 0.16, 0);
      this.activeWing.add(pylon);
    });

    // Aerofoil Blade
    const bladeGeo = new THREE.BoxGeometry(2.15, 0.06, 0.35);
    const blade = new THREE.Mesh(bladeGeo, this.materials.carbon);
    blade.position.set(0, 0.32, 0);
    blade.castShadow = true;
    this.activeWing.add(blade);

    this.activeWingGroup.add(this.activeWing);
  }

  /* -------------------------------------------------------------
   * 9. Autonomous Technology: LiDAR & Radar Sensors
   * ------------------------------------------------------------- */
  buildSensorsAndLiDAR() {
    // Solid-State LiDAR Pod on Roof
    this.lidarPod = new THREE.Group();
    this.lidarPod.position.set(0, 1.34, 0.2);

    const podCasing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.1, 16),
      this.materials.titanium
    );
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16),
      this.materials.hologram
    );
    lens.position.y = 0.04;

    this.lidarPod.add(podCasing, lens);
    this.techSensorsGroup.add(this.lidarPod);

    // Holographic Conical Scan Beam (Sensor Vision)
    const scanGeo = new THREE.ConeGeometry(2.2, 5.0, 24, 1, true);
    this.sensorScanCone = new THREE.Mesh(scanGeo, this.materials.hologram);
    this.sensorScanCone.rotation.x = -Math.PI / 2;
    this.sensorScanCone.position.set(0, 0.55, 4.6);
    this.sensorScanCone.visible = false;
    this.techSensorsGroup.add(this.sensorScanCone);
  }

  /* -------------------------------------------------------------
   * Exploded View & Scroll Transformations
   * factor: 0.0 (fully assembled) -> 1.0 (fully exploded)
   * ------------------------------------------------------------- */
  setExplosionProgress(progress) {
    const p = Math.max(0, Math.min(1.0, progress));

    // 1. Body shell lifts straight up into space
    this.bodyGroup.position.y = p * 1.8;
    this.bodyGroup.position.z = p * 0.4;

    // 2. Powertrain lifts moderately and shifts backward
    this.powertrainGroup.position.y = p * 0.85;

    // 3. Chassis remains grounded as anchor
    this.chassisGroup.position.y = -p * 0.25;

    // 4. Wheels slide laterally outwards
    this.wheels.forEach((w) => {
      const lateralDist = p * 1.4;
      w.position.x = w.userData.baseX + (w.userData.isLeft ? -lateralDist : lateralDist);
    });

    // 5. Suspension / Brakes expand outward
    this.suspensionGroup.children.forEach((child) => {
      if (child.userData && child.userData.isBrake) {
        const lateralDist = p * 1.0;
        child.position.x = (child.userData.isLeft ? -1.05 - lateralDist : 1.05 + lateralDist);
      }
    });

    // 6. Active Wing elevates high above the rear deck
    this.activeWingGroup.position.y = p * 1.5;
    this.activeWingGroup.position.z = -p * 0.8;

    // 7. Tech Sensors float above the roof
    this.techSensorsGroup.position.y = p * 2.2;
  }

  /* -------------------------------------------------------------
   * Scissor Doors Animation (0.0: closed -> 1.0: fully open)
   * ------------------------------------------------------------- */
  setDoorsProgress(progress) {
    const p = Math.max(0, Math.min(1.0, progress));
    if (this.doorLeft && this.doorRight) {
      // Rotate up along Z and forward along Y
      this.doorLeft.rotation.z = p * 0.95;
      this.doorLeft.rotation.y = p * 0.4;

      this.doorRight.rotation.z = -p * 0.95;
      this.doorRight.rotation.y = -p * 0.4;
    }
  }

  /* -------------------------------------------------------------
   * Active Aero Wing Tilt (0.0: stowed -> 1.0: high downforce)
   * ------------------------------------------------------------- */
  setWingProgress(progress) {
    const p = Math.max(0, Math.min(1.0, progress));
    if (this.activeWing) {
      this.activeWing.position.y = 0.95 + p * 0.35;
      this.activeWing.rotation.x = -p * 0.35;
    }
  }

  /* -------------------------------------------------------------
   * Change Car Paint Finish
   * ------------------------------------------------------------- */
  setPaintColor(hexColor) {
    if (this.materials.carPaint) {
      this.materials.carPaint.color.setHex(hexColor);
    }
  }
}
