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
  m.setEnabled(false); // shape source only
  return m;
}

export async function createGrass(scene: BABYLON.Scene): Promise<void> {
  const COUNT = 30000;

  // Ground texture as grass material for the whole field
  const grassTex = getGreenTexture({ uScale: 10, vScale: 10 }, scene);

  // Build SPS
  const bladeShape = makeBladeMesh(scene);
  const sps = new BABYLON.SolidParticleSystem('grass', scene);
  sps.addShape(bladeShape, COUNT);
  const mesh = sps.buildMesh();

  // Apply the ground texture — blend with the green ground
  const mat = new BABYLON.StandardMaterial('grassMat', scene);
  mat.diffuseTexture = grassTex;
  mat.diffuseColor = new BABYLON.Color3(0.5, 0.75, 0.25);
  mat.backFaceCulling = false; // show blades from both sides
  mesh.material = mat;
  mesh.receiveShadows = true;
  mesh.isPickable = false;
  mesh.alwaysSelectAsActiveMesh = false;

  // Position all blades
  const halfMap = 48;
  const colors = [
    new BABYLON.Color4(0.3, 0.55, 0.15, 1),
    new BABYLON.Color4(0.35, 0.62, 0.2, 1),
    new BABYLON.Color4(0.4, 0.68, 0.25, 1),
    new BABYLON.Color4(0.45, 0.72, 0.3, 1),
    new BABYLON.Color4(0.5, 0.78, 0.32, 1),
  ];

  for (let i = 0; i < COUNT; i++) {
    const p = sps.particles[i];
    const [x, z] = randomPos(halfMap);
    p.position = new BABYLON.Vector3(x, 0.005, z);
    p.rotation = new BABYLON.Vector3(0, Math.random() * Math.PI * 2, 0);
    const s = 0.6 + Math.random() * 0.8;
    p.scale = new BABYLON.Vector3(s, s, s);
    p.color = colors[i % colors.length];
  }

  // ⚡ Build once, no per-frame updates
  sps.computeParticleColor = true;
  sps.computeParticleTexture = false;
  sps.setParticles();

  // Tiny random wind tilt baked in (static, no per-frame cost)
  for (let i = 0; i < COUNT; i++) {
    const p = sps.particles[i];
    p.rotation.z = (Math.random() - 0.5) * 0.04; // slight permanent bend
  }
  sps.setParticles();

  // Refresh bounding info and never cull — the mesh spans the whole map
  mesh.refreshBoundingInfo();
  mesh.alwaysSelectAsActiveMesh = true;
}
