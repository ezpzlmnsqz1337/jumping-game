import * as BABYLON from '@babylonjs/core';
import { GameLevel } from '../../game-level';
import { getModel, ModelId } from '../../assets/models';

interface TreePlacement {
  position: BABYLON.Vector3;
  modelVariant: 0 | 1 | 2 | 3 | 4 | 5;
}

const PLACEMENTS: TreePlacement[] = [
  // Spawn area (4)
  { position: new BABYLON.Vector3(-14.5, 0, 3.5), modelVariant: 0 },
  { position: new BABYLON.Vector3(-14.5, 0, -5.5), modelVariant: 1 },
  { position: new BABYLON.Vector3(-9.0, 0, 3.5), modelVariant: 2 },
  { position: new BABYLON.Vector3(-9.0, 0, -5.5), modelVariant: 3 },

  // Stage 1-2 corridor sides (4)
  { position: new BABYLON.Vector3(-5, 0, 3), modelVariant: 4 },
  { position: new BABYLON.Vector3(5, 0, 3), modelVariant: 0 },
  { position: new BABYLON.Vector3(14, 0, 3), modelVariant: 1 },
  { position: new BABYLON.Vector3(14, 0, -5), modelVariant: 2 },

  // Stage 3 tower base (3)
  { position: new BABYLON.Vector3(15, 0, -10), modelVariant: 3 },
  { position: new BABYLON.Vector3(15, 0, -16), modelVariant: 4 },
  { position: new BABYLON.Vector3(5, 0, -16), modelVariant: 0 },

  // Stage 4 tower base (3)
  { position: new BABYLON.Vector3(5, 0, -10), modelVariant: 1 },
  { position: new BABYLON.Vector3(-5, 0, -10), modelVariant: 2 },
  { position: new BABYLON.Vector3(-5, 0, -16), modelVariant: 3 },

  // Stage 5 tower base (2)
  { position: new BABYLON.Vector3(-15, 0, -10), modelVariant: 4 },
  { position: new BABYLON.Vector3(-15, 0, -16), modelVariant: 0 },

  // Stage 6 (tower) base (4)
  { position: new BABYLON.Vector3(-15, 0, 5), modelVariant: 1 },
  { position: new BABYLON.Vector3(-5, 0, 5), modelVariant: 2 },
  { position: new BABYLON.Vector3(-15, 0, 11), modelVariant: 3 },
  { position: new BABYLON.Vector3(-5, 0, 11), modelVariant: 4 },

  // Slide zone perimeter (4)
  { position: new BABYLON.Vector3(-28, 0, 0), modelVariant: 0 },
  { position: new BABYLON.Vector3(-42, 0, 0), modelVariant: 1 },
  { position: new BABYLON.Vector3(-48, 0, 24), modelVariant: 2 },
  { position: new BABYLON.Vector3(-42, 0, 24), modelVariant: 3 },

  // Long jump corridor (3)
  { position: new BABYLON.Vector3(28, 0, -44), modelVariant: 4 },
  { position: new BABYLON.Vector3(28, 0, 0), modelVariant: 0 },
  { position: new BABYLON.Vector3(28, 0, 44), modelVariant: 1 },

  // Bunny hop area (2)
  { position: new BABYLON.Vector3(-47, 0, -38), modelVariant: 2 },
  { position: new BABYLON.Vector3(11, 0, -38), modelVariant: 3 },
];

export async function createTrees(scene: BABYLON.Scene, _level: GameLevel): Promise<void> {
  let tree01Meshes: BABYLON.Mesh[] = [];
  let tree02Meshes: BABYLON.Mesh[] = [];

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
    return;
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

      const node = new BABYLON.TransformNode(`tree-${index}`, scene);
      node.position = placement.position.clone();
      node.rotation = new BABYLON.Vector3(0, Math.random() * Math.PI * 2, 0);
      const s = 0.8 + Math.random() * 0.4;
      node.scaling = new BABYLON.Vector3(s, s, s);

      clone.parent = node;
      clone.position = BABYLON.Vector3.Zero();
    } catch (err) {
      console.error(`[Trees] Failed to create tree ${index}:`, err);
    }
  }
}
