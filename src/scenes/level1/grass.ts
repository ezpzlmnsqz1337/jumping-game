import * as BABYLON from '@babylonjs/core';

/** Exclusions zones — areas where grass should NOT be placed (platforms, walls) */
const EXCLUSION_ZONES: { x: number; z: number; w: number; d: number }[] = [
  // Stage 1 pillars
  { x: -3, z: 1, w: 2, d: 2 },
  { x: -3, z: -2, w: 2, d: 2 },
  { x: -3, z: -5, w: 2, d: 2 },
  { x: 0, z: -5, w: 2, d: 2 },
  { x: 0, z: -2, w: 2, d: 2 },
  { x: 0, z: 1, w: 2, d: 2 },
  { x: 3, z: 1, w: 2, d: 2 },
  { x: 3, z: -2, w: 2, d: 2 },
  { x: 3, z: -5, w: 2, d: 2 },
  // Stage 2 platform
  { x: 10, z: -2, w: 10, d: 10 },
  // Stage 3 platform
  { x: 10, z: -12, w: 10, d: 10 },
  // Stage 4 platform
  { x: 0, z: -12, w: 10, d: 10 },
  // Stage 5 platform
  { x: -10, z: -12, w: 10, d: 10 },
  // Stage 6 tower
  { x: -10, z: 8, w: 10, d: 10 },
  // Long jump platforms
  { x: 46, z: 0, w: 8, d: 92 },
  // Bunny hop start/end
  { x: -47.5, z: -40, w: 5, d: 20 },
  { x: 13.5, z: -40, w: 5, d: 20 },
  // Start trigger
  { x: -8, z: -2, w: 5, d: 7 },
  // Teleports
  { x: -15.9, z: -8, w: 1, d: 1 },
  { x: -15.9, z: -10, w: 1, d: 1 },
  { x: -15.9, z: -12, w: 1, d: 1 },
  { x: -15.9, z: -14, w: 1, d: 1 },
  { x: -15.9, z: -16, w: 1, d: 1 },
  // Big slide area
  { x: -14.5, z: 18.88, w: 9, d: 14 },
  // Bunker
  { x: -43, z: 11.8, w: 14, d: 25 },
];

function isInExclusionZone(x: number, z: number): boolean {
  for (const zone of EXCLUSION_ZONES) {
    const hw = zone.w / 2;
    const hd = zone.d / 2;
    if (x >= zone.x - hw && x <= zone.x + hw && z >= zone.z - hd && z <= zone.z + hd) {
      return true;
    }
  }
  return false;
}

/** Create a simple grass blade shape mesh (thin tapered quad) */
function createBladeShape(scene: BABYLON.Scene): BABYLON.Mesh {
  const blade = new BABYLON.Mesh('grassBladeShape', scene);

  // A tapered blade: wider at base, narrow at top
  const positions = [
    -0.01,
    0,
    0, // bottom-left
    0.01,
    0,
    0, // bottom-right
    -0.005,
    0.2,
    0, // mid-left
    0.005,
    0.2,
    0, // mid-right
    0,
    0.3,
    0, // tip
  ];
  // Two quads forming a tapered blade: [0,1,2, 2,1,3] + [2,3,4]
  const indices = [0, 1, 2, 2, 1, 3, 2, 3, 4];
  const normals: number[] = [];
  const uvs = [0, 1, 1, 1, 0, 0.4, 1, 0.4, 0.5, 0];

  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;
  vertexData.applyToMesh(blade);

  blade.isPickable = false;
  blade.setEnabled(false); // invisible — used only as shape source for SPS
  return blade;
}

export async function createGrass(scene: BABYLON.Scene): Promise<void> {
  const grassCount = 4000;

  // Grass color variations (Color4 with alpha=1)
  const colors = [
    new BABYLON.Color4(0.35, 0.65, 0.2, 1),
    new BABYLON.Color4(0.4, 0.7, 0.25, 1),
    new BABYLON.Color4(0.3, 0.55, 0.15, 1),
    new BABYLON.Color4(0.45, 0.75, 0.3, 1),
    new BABYLON.Color4(0.5, 0.8, 0.35, 1),
  ];

  const bladeShape = createBladeShape(scene);

  const sps = new BABYLON.SolidParticleSystem('grassSps', scene);
  sps.addShape(bladeShape, grassCount);

  const grassMesh = sps.buildMesh();
  grassMesh.receiveShadows = true;
  grassMesh.isPickable = false;

  // Distribute blades on the ground, avoiding exclusion zones
  const halfMap = 48;

  for (let i = 0; i < grassCount; i++) {
    const particle = sps.particles[i];

    let x: number;
    let z: number;
    let attempts = 0;
    do {
      x = (Math.random() - 0.5) * 2 * halfMap;
      z = (Math.random() - 0.5) * 2 * halfMap;
      attempts++;
    } while (isInExclusionZone(x, z) && attempts < 30);

    // Lift blades just above the ground to avoid z-fighting
    particle.position = new BABYLON.Vector3(x, 0.005, z);
    // Random Y-rotation so blades face different directions
    particle.rotation = new BABYLON.Vector3(0, Math.random() * Math.PI * 2, 0);

    // Random scale variation
    const s = 0.6 + Math.random() * 0.8;
    particle.scale = new BABYLON.Vector3(s, s, s);

    // Random color tint
    const c = colors[Math.floor(Math.random() * colors.length)];
    particle.color = c.clone();

    // Store wind phase for per-frame animation
    particle.props = { windPhase: Math.random() * Math.PI * 2 };
  }

  sps.setParticles();

  // Wind animation: gentle swaying of blades
  scene.onBeforeRenderObservable.add(() => {
    const time = Date.now() / 1000;
    const windStrength = 0.04;

    for (let i = 0; i < sps.particles.length; i++) {
      const p = sps.particles[i];
      const phase = (p.props as { windPhase: number }).windPhase;
      // Sway around local X axis (after Y rotation this translates to wind direction)
      p.rotation.x = Math.sin(time * 2 + phase) * windStrength;
    }

    sps.setParticles();
  });
}
