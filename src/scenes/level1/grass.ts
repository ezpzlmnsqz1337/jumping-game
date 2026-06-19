import * as BABYLON from '@babylonjs/core';

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
  for (const zone of EXCLUSION_ZONES) {
    if (
      x >= zone.x - zone.w / 2 &&
      x <= zone.x + zone.w / 2 &&
      z >= zone.z - zone.d / 2 &&
      z <= zone.z + zone.d / 2
    )
      return true;
  }
  return false;
}

function randomExcluded(halfMap: number): [number, number] {
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

// ── Vertex shader: wind animation runs entirely on GPU ──
const VERTEX_SHADER = `
  attribute vec3 position;
  attribute vec2 uv;

  // Per-instance attributes (stored in instance buffers)
  attribute vec4 instancePos;    // xy = world pos x/z, z = windPhase, w = colorMix
  attribute vec4 instanceData;   // x = rotY, y = scale, z = _unused, w = _unused

  uniform float uTime;
  uniform mat4 viewProjection;

  varying vec2 vUv;
  varying float vColorMix;

  void main() {
    vec3 pos = position;

    // Wind sway — stronger at the tip, zero at the base
    float windStrength = 0.07;
    float heightFactor = pos.y / 0.3;
    float wind = sin(uTime * 2.0 + instancePos.z) * windStrength * heightFactor;
    pos.x += wind;

    // Y-rotation of the blade
    float cosY = cos(instanceData.x);
    float sinY = sin(instanceData.x);
    vec3 rPos = vec3(
      pos.x * cosY - pos.z * sinY,
      pos.y,
      pos.x * sinY + pos.z * cosY
    );

    // Scale
    rPos *= instanceData.y;

    // World position
    rPos.x += instancePos.x;
    rPos.z += instancePos.y;
    rPos.y += 0.005;

    gl_Position = viewProjection * vec4(rPos, 1.0);
    vUv = uv;
    vColorMix = instancePos.w;
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  varying float vColorMix;

  void main() {
    // Two grass color variants blended by vColorMix (0..1)
    vec3 darkGreen = vec3(0.28, 0.50, 0.12);
    vec3 lightGreen = vec3(0.42, 0.72, 0.22);
    vec3 color = mix(darkGreen, lightGreen, vColorMix);

    // Slightly darker base, lighter tip
    float tip = vUv.y;
    color *= 0.7 + 0.5 * tip;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export async function createGrass(scene: BABYLON.Scene): Promise<void> {
  const COUNT = 30000;

  // ── 1. Create a single blade mesh (cross-quad, 9 vertices) ──
  const blade = new BABYLON.Mesh('grassBlade', scene);
  const positions = [
    -0.01, 0, 0, 0.01, 0, 0, -0.005, 0.2, 0, 0.005, 0.2, 0, 0, 0.3, 0, 0, 0, -0.01, 0, 0, 0.01, 0,
    0.2, -0.005, 0, 0.2, 0.005,
  ];
  const indices = [0, 1, 2, 2, 1, 3, 2, 3, 4, 5, 6, 7, 7, 6, 8, 7, 8, 4];
  const normals: number[] = [];
  const uvs = [0, 1, 1, 1, 0, 0.4, 1, 0.4, 0.5, 0, 0, 1, 1, 1, 0, 0.4, 1, 0.4];
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  const vd = new BABYLON.VertexData();
  vd.positions = positions;
  vd.indices = indices;
  vd.normals = normals;
  vd.uvs = uvs;
  vd.applyToMesh(blade);
  blade.isPickable = false;

  // ── 2. Custom ShaderMaterial ──
  const shaderMat = new BABYLON.ShaderMaterial(
    'grassMat',
    scene,
    {
      vertexSource: VERTEX_SHADER,
      fragmentSource: FRAGMENT_SHADER,
    },
    {
      attributes: ['position', 'uv', 'instancePos', 'instanceData'],
      uniforms: ['worldViewProjection', 'uTime'],
    }
  );
  // Babylon 7.x passes viewProjection as a built-in uniform for ShaderMaterial
  blade.material = shaderMat;

  // ── 3. Build per-instance buffers ──
  const halfMap = 48;
  const instancePosData = new Float32Array(COUNT * 4); // x, z, windPhase, colorMix
  const instanceDataData = new Float32Array(COUNT * 4); // rotY, scale, _, _

  for (let i = 0; i < COUNT; i++) {
    const [x, z] = randomExcluded(halfMap);
    instancePosData[i * 4 + 0] = x;
    instancePosData[i * 4 + 1] = z;
    instancePosData[i * 4 + 2] = Math.random() * Math.PI * 2; // windPhase
    instancePosData[i * 4 + 3] = Math.random(); // colorMix

    instanceDataData[i * 4 + 0] = Math.random() * Math.PI * 2; // rotY
    instanceDataData[i * 4 + 1] = 0.6 + Math.random() * 0.8; // scale
    instanceDataData[i * 4 + 2] = 0;
    instanceDataData[i * 4 + 3] = 0;
  }

  blade.thinInstanceSetBuffer('instancePos', instancePosData, 4);
  blade.thinInstanceSetBuffer('instanceData', instanceDataData, 4);

  // ⚡ Enable frustum culling on all instances
  blade.alwaysSelectAsActiveMesh = false;
  blade.receiveShadows = true;

  // ── 4. Wind animation: just update one float uniform each frame ──
  scene.onBeforeRenderObservable.add(() => {
    shaderMat.setFloat('uTime', Date.now() / 1000);
  });
}
