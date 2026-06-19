import * as BABYLON from '@babylonjs/core';
import { GameLevel } from '../../game-level';
import { getModel, ModelId } from '../../assets/models';

interface TreePlacement {
  position: BABYLON.Vector3;
  modelVariant: 0 | 1 | 2 | 3 | 4 | 5;
  /** Minimum uniform scale (default 0.7) */
  minScale?: number;
  /** Maximum uniform scale (default 1.4) */
  maxScale?: number;
}

/**
 * Tree placements carefully positioned outside all ground-level obstacles.
 *
 * Exclusion zones (ground-level XZ footprints, y≈0):
 *   Stage 1 pillars: x[-4,4] z[-6,2]
 *   Stage 2 platform: x[5,15] z[-7,3]
 *   Stage 3 platform: x[5,15] z[-17,-7]
 *   Stage 4 platform: x[-5,5] z[-17,-7]
 *   Stage 5 platform: x[-15,-5] z[-17,-7]
 *   Stage 6 tower:   x[-15,-5] z[3,13]
 *   Long jumps:      x[22,50] z[-47,47]
 *   Bunny hops:      x[-50,16] z[-50,-27] — dense small pads
 *   Slide zone:      x[-50,-5] z[-1,25] with obstacles
 *   Bunker walls:    x[-50,-36] z[-1,24]
 *   Border walls:    x±50.25 z±50.25
 *   Start trigger:   x[-10.5,-5.5] z[-5.5,1.5]
 *   Teleports:       x[-16.4,-15.4] z[-16.5,-7.5]
 */
const PLACEMENTS: TreePlacement[] = [
  // ── Spawn flanks (west side of spawn) ──
  { position: new BABYLON.Vector3(-14.5, 0, 4.5), modelVariant: 0 },
  { position: new BABYLON.Vector3(-14.5, 0, -1), modelVariant: 1 },
  { position: new BABYLON.Vector3(-14.5, 0, -6.5), modelVariant: 3 },
  { position: new BABYLON.Vector3(-20, 0, 1), modelVariant: 2 },
  { position: new BABYLON.Vector3(-20, 0, -2), modelVariant: 4 },
  { position: new BABYLON.Vector3(-20, 0, -6), modelVariant: 5 },

  // ── Spawn flanks (east side, clear of stage 2 platform x[5,15]) ──
  { position: new BABYLON.Vector3(16.5, 0, 5), modelVariant: 3 },
  { position: new BABYLON.Vector3(16.5, 0, -2), modelVariant: 0 },
  { position: new BABYLON.Vector3(22, 0, 5), modelVariant: 1 },
  { position: new BABYLON.Vector3(22, 0, -8), modelVariant: 4 },
  { position: new BABYLON.Vector3(22, 0, -18), modelVariant: 2 },

  // ── Along north border (z≈44..48, outside long jumps) ──
  { position: new BABYLON.Vector3(-10, 0, 45), modelVariant: 5, minScale: 0.9, maxScale: 1.5 },
  { position: new BABYLON.Vector3(-20, 0, 46), modelVariant: 0, minScale: 0.8, maxScale: 1.4 },
  { position: new BABYLON.Vector3(-30, 0, 47), modelVariant: 1, minScale: 0.9, maxScale: 1.5 },
  { position: new BABYLON.Vector3(-40, 0, 46), modelVariant: 2 },
  { position: new BABYLON.Vector3(10, 0, 48), modelVariant: 3 },
  { position: new BABYLON.Vector3(20, 0, 46), modelVariant: 4 },

  // ── Along south border (z≈-48..-45, outside bunny hops and long jumps) ──
  { position: new BABYLON.Vector3(5, 0, -48), modelVariant: 5 },
  { position: new BABYLON.Vector3(16, 0, -47), modelVariant: 0 },
  { position: new BABYLON.Vector3(-5, 0, -49), modelVariant: 4 },
  { position: new BABYLON.Vector3(16, 0, -52), modelVariant: 2 },
  { position: new BABYLON.Vector3(-10, 0, -52), modelVariant: 1 },

  // ── South-west corner (outside bunny hops and slide) ──
  { position: new BABYLON.Vector3(-44, 0, -20), modelVariant: 3 },
  { position: new BABYLON.Vector3(-44, 0, -8), modelVariant: 0 },
  { position: new BABYLON.Vector3(-38, 0, -20), modelVariant: 5 },

  // ── West border (outside slide zone and bunker, x≈-49) ──
  { position: new BABYLON.Vector3(-49, 0, -15), modelVariant: 2 },
  { position: new BABYLON.Vector3(-49, 0, -30), modelVariant: 4 },
  { position: new BABYLON.Vector3(-49, 0, -40), modelVariant: 1 },
  { position: new BABYLON.Vector3(-49, 0, 28), modelVariant: 3 },
  { position: new BABYLON.Vector3(-49, 0, 40), modelVariant: 0 },
  { position: new BABYLON.Vector3(-44, 0, 28), modelVariant: 5 },

  // ── East border (outside long jumps, x≈40..48) ──
  { position: new BABYLON.Vector3(42, 0, -30), modelVariant: 4, minScale: 0.9, maxScale: 1.5 },
  { position: new BABYLON.Vector3(48, 0, -15), modelVariant: 1 },
  { position: new BABYLON.Vector3(42, 0, 15), modelVariant: 2 },
  { position: new BABYLON.Vector3(48, 0, 30), modelVariant: 3 },
  { position: new BABYLON.Vector3(42, 0, 42), modelVariant: 0, minScale: 0.9, maxScale: 1.5 },

  // ── Slide zone edges ──
  { position: new BABYLON.Vector3(-20, 0, -6), modelVariant: 5 },
  { position: new BABYLON.Vector3(-20, 0, 27), modelVariant: 2 },
  { position: new BABYLON.Vector3(-34, 0, -6), modelVariant: 0 },
  { position: new BABYLON.Vector3(-34, 0, 27), modelVariant: 4 },

  // ── Between stage platforms (narrow gaps) ──
  { position: new BABYLON.Vector3(-2, 0, 4), modelVariant: 1, minScale: 0.6, maxScale: 1.0 },
  { position: new BABYLON.Vector3(4, 0, 5), modelVariant: 3, minScale: 0.6, maxScale: 1.0 },
  { position: new BABYLON.Vector3(-18, 0, 0), modelVariant: 0 },
  { position: new BABYLON.Vector3(-18, 0, -12), modelVariant: 2 },
  { position: new BABYLON.Vector3(-18, 0, -6), modelVariant: 4 },

  // ── Stage 6 tower surroundings ──
  { position: new BABYLON.Vector3(-16, 0, 15), modelVariant: 5 },
  { position: new BABYLON.Vector3(-4, 0, 15), modelVariant: 1 },
  { position: new BABYLON.Vector3(-16, 0, -2), modelVariant: 3 },
  { position: new BABYLON.Vector3(-4, 0, -2), modelVariant: 0 },

  // ── North of stage 3 wall ──
  { position: new BABYLON.Vector3(8, 0, 5), modelVariant: 2 },
  { position: new BABYLON.Vector3(12, 0, 5), modelVariant: 4 },
  { position: new BABYLON.Vector3(8, 0, -20), modelVariant: 0 },
  { position: new BABYLON.Vector3(16, 0, -20), modelVariant: 5 },

  // ── Scattered along open ground ──
  { position: new BABYLON.Vector3(-25, 0, 10), modelVariant: 3 },
  { position: new BABYLON.Vector3(-30, 0, 35), modelVariant: 1 },
  { position: new BABYLON.Vector3(-35, 0, 44), modelVariant: 4 },
  { position: new BABYLON.Vector3(-8, 0, -20), modelVariant: 2 },
  { position: new BABYLON.Vector3(30, 0, -25), modelVariant: 5 },
  { position: new BABYLON.Vector3(35, 0, 35), modelVariant: 0 },

  // ── Dense forest border (north-west corner) ──
  { position: new BABYLON.Vector3(-45, 0, 40), modelVariant: 1, minScale: 1.0, maxScale: 1.6 },
  { position: new BABYLON.Vector3(-42, 0, 43), modelVariant: 3, minScale: 0.8, maxScale: 1.4 },
  { position: new BABYLON.Vector3(-47, 0, 44), modelVariant: 5, minScale: 1.0, maxScale: 1.5 },
  { position: new BABYLON.Vector3(-40, 0, 38), modelVariant: 0, minScale: 0.9, maxScale: 1.5 },
  { position: new BABYLON.Vector3(-38, 0, 45), modelVariant: 2, minScale: 0.7, maxScale: 1.3 },

  // ── Dense forest border (south-east corner) ──
  { position: new BABYLON.Vector3(44, 0, -48), modelVariant: 4, minScale: 1.0, maxScale: 1.6 },
  { position: new BABYLON.Vector3(47, 0, -44), modelVariant: 1, minScale: 0.8, maxScale: 1.4 },
  { position: new BABYLON.Vector3(46, 0, -50), modelVariant: 0, minScale: 1.0, maxScale: 1.5 },
  { position: new BABYLON.Vector3(40, 0, -50), modelVariant: 5, minScale: 0.9, maxScale: 1.3 },
  { position: new BABYLON.Vector3(49, 0, -46), modelVariant: 2, minScale: 0.7, maxScale: 1.4 },

  // ── Dense forest border (north-east corner) ──
  { position: new BABYLON.Vector3(44, 0, 44), modelVariant: 3, minScale: 1.0, maxScale: 1.5 },
  { position: new BABYLON.Vector3(47, 0, 40), modelVariant: 0, minScale: 0.9, maxScale: 1.4 },
  { position: new BABYLON.Vector3(49, 0, 47), modelVariant: 5, minScale: 1.1, maxScale: 1.6 },
  { position: new BABYLON.Vector3(40, 0, 48), modelVariant: 1, minScale: 0.8, maxScale: 1.3 },
  { position: new BABYLON.Vector3(46, 0, 49), modelVariant: 4, minScale: 0.9, maxScale: 1.5 },
];

export interface CreateTreesResult {
  treeMeshes: BABYLON.AbstractMesh[];
}

/**
 * Loads tree models and places them around the map.
 * Returns the created meshes for shadow integration.
 */
export async function createTrees(
  scene: BABYLON.Scene,
  _level: GameLevel
): Promise<CreateTreesResult> {
  let tree01Meshes: BABYLON.Mesh[] = [];
  let tree02Meshes: BABYLON.Mesh[] = [];
  const treeMeshes: BABYLON.AbstractMesh[] = [];

  try {
    const [result1, result2] = await Promise.all([
      getModel(scene, ModelId.tree01),
      getModel(scene, ModelId.tree02),
    ]);

    // tree-01.glb contributes 1 mesh (CommonTree_1) -> variant 0
    tree01Meshes = result1.meshes.filter(
      (m): m is BABYLON.Mesh => m instanceof BABYLON.Mesh && m.getTotalVertices() > 0
    );
    // tree-02.glb contributes 5 meshes (NormalTree_1..5) -> variants 1..5
    tree02Meshes = result2.meshes.filter(
      (m): m is BABYLON.Mesh => m instanceof BABYLON.Mesh && m.getTotalVertices() > 0
    );
  } catch (err) {
    console.error('[Trees] Failed to load tree models:', err);
    return { treeMeshes };
  }

  // Variant mapping: 0 -> tree-01.glb, 1-5 -> tree-02.glb (first 5 meshes)
  const allSourceMeshes = [tree01Meshes[0], ...tree02Meshes];

  for (let index = 0; index < PLACEMENTS.length; index++) {
    const placement = PLACEMENTS[index];
    const sourceMesh = allSourceMeshes[placement.modelVariant];

    if (!sourceMesh) {
      console.error(`[Trees] Source mesh not found for variant ${placement.modelVariant}`);
      continue;
    }

    try {
      const clone = sourceMesh.clone(`tree-${index}-mesh`);
      if (!clone) {
        console.error(`[Trees] Failed to clone mesh for tree ${index}`);
        continue;
      }
      clone.material = sourceMesh.material;
      clone.isPickable = false;
      clone.receiveShadows = true;

      const node = new BABYLON.TransformNode(`tree-${index}`, scene);
      node.position = placement.position.clone();
      node.rotation = new BABYLON.Vector3(0, Math.random() * Math.PI * 2, 0);
      const minScale = placement.minScale ?? 0.7;
      const maxScale = placement.maxScale ?? 1.4;
      const s = minScale + Math.random() * (maxScale - minScale);
      node.scaling = new BABYLON.Vector3(s, s, s);

      clone.parent = node;
      clone.position = BABYLON.Vector3.Zero();

      // Collect all meshes under this node for shadow casting
      treeMeshes.push(clone);
      // Also include child meshes (GLB models can have multiple sub-meshes)
      clone.getChildMeshes().forEach(child => {
        child.receiveShadows = true;
        treeMeshes.push(child);
      });
    } catch (err) {
      console.error(`[Trees] Failed to create tree ${index}:`, err);
    }
  }

  return { treeMeshes };
}
