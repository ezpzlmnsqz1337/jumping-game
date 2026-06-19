import * as BABYLON from '@babylonjs/core';
import { getGreenTexture } from '../../assets/textures';

const EXCLUSION_ZONES: { x: number; z: number; w: number; d: number }[] = [
  { x: -3, z: 1, w: 2, d: 2 },
  { x: -3, z: -2, w: 2, d: 2 },
  { x: -3, z: -5, w: 2, d: 2 },
  { x: 0, z: -5, w: 2, d: 2 },
  { x: 0, z: -2, w: 2, d: 2 },
  { x: 0, z: 1, w: 2, d: 2 },
  { x: 3, z: 1, w: 2, d: 2 },
  { x: 3, z: -2, w: 2, d: 2 },
  { x: 3, z: -5, w: 2, d: 2 },
  { x: 10, z: -2, w: 10, d: 10 },
  { x: 10, z: -12, w: 10, d: 10 },
  { x: 0, z: -12, w: 10, d: 10 },
  { x: -10, z: -12, w: 10, d: 10 },
  { x: -10, z: 8, w: 10, d: 10 },
  { x: 46, z: 0, w: 8, d: 92 },
  { x: -47.5, z: -40, w: 5, d: 20 },
  { x: 13.5, z: -40, w: 5, d: 20 },
  { x: -8, z: -2, w: 5, d: 7 },
  { x: -15.9, z: -8, w: 1, d: 1 },
  { x: -15.9, z: -10, w: 1, d: 1 },
  { x: -15.9, z: -12, w: 1, d: 1 },
  { x: -15.9, z: -14, w: 1, d: 1 },
  { x: -15.9, z: -16, w: 1, d: 1 },
  { x: -14.5, z: 18.88, w: 9, d: 14 },
  { x: -43, z: 11.8, w: 14, d: 25 },
];

function isInExclusionZone(x: number, z: number): boolean {
  for (const zz of EXCLUSION_ZONES) {
    if (
      x >= zz.x - zz.w / 2 &&
      x <= zz.x + zz.w / 2 &&
      z >= zz.z - zz.d / 2 &&
      z <= zz.z + zz.d / 2
    )
      return true;
  }
  return false;
}

function randomPos(halfMap: number): [number, number] {
  let x: number,
    z: number,
    a = 0;
  do {
    x = (Math.random() - 0.5) * 2 * halfMap;
    z = (Math.random() - 0.5) * 2 * halfMap;
    a++;
  } while (isInExclusionZone(x, z) && a < 30);
  return [x, z];
}

/** Generate a cross-quad blade mesh (9 vertices) */
function makeBladeMesh(scene: BABYLON.Scene): BABYLON.Mesh {
  const m = new BABYLON.Mesh('_blade', scene);
  const pos = [
    -0.01, 0, 0, 0.01, 0, 0, -0.005, 0.2, 0, 0.005, 0.2, 0, 0, 0.25, 0, 0, 0, -0.01, 0, 0, 0.01, 0,
    0.2, -0.005, 0, 0.2, 0.005,
  ];
  const idx = [0, 1, 2, 2, 1, 3, 2, 3, 4, 5, 6, 7, 7, 6, 8, 7, 8, 4];
  const nrm: number[] = [];
  const uv = [0, 1, 1, 1, 0, 0.4, 1, 0.4, 0.5, 0, 0, 1, 1, 1, 0, 0.4, 1, 0.4];
  BABYLON.VertexData.ComputeNormals(pos, idx, nrm);
  const vd = new BABYLON.VertexData();
  vd.positions = pos;
  vd.indices = idx;
  vd.normals = nrm;
  vd.uvs = uv;
  vd.applyToMesh(m);
  m.isPickable = false;
  m.setEnabled(false);
  return m;
}

export interface GrassSystem {
  /** Call each frame with the player's world position */
  update(playerPos: BABYLON.Vector3): void;
}

/**
 * Build a massive grass field with player interaction.
 * Uses a spatial grid so only blades near the player get updated.
 */
export async function createGrass(scene: BABYLON.Scene): Promise<GrassSystem> {
  const COUNT = 300000;

  const grassTex = getGreenTexture({ uScale: 10, vScale: 10 }, scene);

  const bladeShape = makeBladeMesh(scene);
  const sps = new BABYLON.SolidParticleSystem('grass', scene);
  sps.addShape(bladeShape, COUNT);
  const mesh = sps.buildMesh();

  const mat = new BABYLON.StandardMaterial('grassMat', scene);
  mat.diffuseTexture = grassTex;
  mat.diffuseColor = new BABYLON.Color3(0.5, 0.75, 0.25);
  mat.backFaceCulling = false;
  mesh.material = mat;
  mesh.receiveShadows = true;
  mesh.isPickable = false;

  // ── Spatial grid for efficient lookups ──
  const CELL_SIZE = 3; // 3x3 unit cells
  const HALF_MAP = 48;
  const GRID_COLS = Math.ceil((HALF_MAP * 2) / CELL_SIZE); // 32
  const GRID_ROWS = GRID_COLS;

  /** Convert world XZ to grid column/row */
  const toGrid = (v: number) => Math.floor((v + HALF_MAP) / CELL_SIZE);
  const clampGrid = (v: number) => Math.max(0, Math.min(GRID_COLS - 1, v));

  // Each cell stores indices of blades inside it
  const grid: number[][] = Array.from({ length: GRID_COLS * GRID_ROWS }, () => []);

  // ── Position all blades and fill the grid ──
  const colors = [
    new BABYLON.Color4(0.3, 0.55, 0.15, 1),
    new BABYLON.Color4(0.35, 0.62, 0.2, 1),
    new BABYLON.Color4(0.4, 0.68, 0.25, 1),
    new BABYLON.Color4(0.45, 0.72, 0.3, 1),
    new BABYLON.Color4(0.5, 0.78, 0.32, 1),
  ];

  /** Store the REST rotation for each blade so we can revert after player leaves */
  const restRotationZ = new Float32Array(COUNT);
  const bladePosX = new Float32Array(COUNT);
  const bladePosZ = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const p = sps.particles[i];
    const [x, z] = randomPos(HALF_MAP);
    p.position = new BABYLON.Vector3(x, 0.005, z);
    p.rotation = new BABYLON.Vector3(0, Math.random() * Math.PI * 2, 0);
    const s = 0.6 + Math.random() * 0.8;
    p.scale = new BABYLON.Vector3(s, s, s);
    p.color = colors[i % colors.length];

    // Store position for grid + interaction
    bladePosX[i] = x;
    bladePosZ[i] = z;

    // Initial tilt (static wind effect)
    const tilt = (Math.random() - 0.5) * 0.04;
    p.rotation.z = tilt;
    restRotationZ[i] = tilt;

    // Assign to spatial grid
    const col = clampGrid(toGrid(x));
    const row = clampGrid(toGrid(z));
    grid[row * GRID_COLS + col].push(i);
  }

  sps.computeParticleColor = true;
  sps.computeParticleTexture = false;
  sps.setParticles();

  mesh.refreshBoundingInfo();
  mesh.alwaysSelectAsActiveMesh = true;

  // ── Player interaction state ──
  const INTERACT_RADIUS = 4;
  const INTERACT_RADIUS_SQ = INTERACT_RADIUS * INTERACT_RADIUS;
  const BEND_STRENGTH = 0.35;
  const GRID_CHECK_RADIUS = Math.ceil(INTERACT_RADIUS / CELL_SIZE) + 1; // cells to check around player

  /** Track which blades are currently bent so we can restore them */
  const currentlyBent = new Set<number>();

  // ── Return the update function ──
  return {
    update(playerPos: BABYLON.Vector3) {
      const px = playerPos.x;
      const pz = playerPos.z;

      const col = clampGrid(toGrid(px));
      const row = clampGrid(toGrid(pz));

      // Restore previously-bent blades to their rest rotation
      for (const idx of currentlyBent) {
        sps.particles[idx].rotation.z = restRotationZ[idx];
      }
      currentlyBent.clear();

      // Check blades in cells near the player
      const minR = clampGrid(row - GRID_CHECK_RADIUS);
      const maxR = clampGrid(row + GRID_CHECK_RADIUS);
      const minC = clampGrid(col - GRID_CHECK_RADIUS);
      const maxC = clampGrid(col + GRID_CHECK_RADIUS);

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const cell = grid[r * GRID_COLS + c];
          if (!cell.length) continue;

          for (const idx of cell) {
            const dx = bladePosX[idx] - px;
            const dz = bladePosZ[idx] - pz;
            const distSq = dx * dx + dz * dz;

            if (distSq < INTERACT_RADIUS_SQ) {
              const dist = Math.sqrt(distSq);
              const strength = (1 - dist / INTERACT_RADIUS) * BEND_STRENGTH;
              // Bend away from player direction — push the blade in the opposite direction
              const angle = Math.atan2(dz, dx);
              sps.particles[idx].rotation.z = restRotationZ[idx] + Math.cos(angle) * strength;
              currentlyBent.add(idx);
            }
          }
        }
      }

      // Only call setParticles if something changed
      if (currentlyBent.size > 0) {
        sps.setParticles();
      }
    },
  };
}
