import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { GameLevel } from '../game-level';

export class GameEntity {
  name: string;
  scene: BABYLON.Scene;
  level: GameLevel;
  mesh: BABYLON.Nullable<BABYLON.Mesh> = null;

  constructor(name: string, level: GameLevel, scene: BABYLON.Scene) {
    this.scene = scene;
    this.name = name;
    this.level = level;
  } 

  static createNameTag(scene: BABYLON.Scene, mesh: BABYLON.Mesh, nickname: string) {
    // name tag
    const nickNameTextPlane = BABYLON.MeshBuilder.CreatePlane('nickname', { size: 2 }, scene);
    nickNameTextPlane.rotation = new BABYLON.Vector3(0, 0, 0);
    nickNameTextPlane.parent = mesh;
    nickNameTextPlane.position.y = 0.7;
    nickNameTextPlane.isPickable = false;
    nickNameTextPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(nickNameTextPlane);

    const nickNameText = new GUI.TextBlock("nickNameText", nickname);
    nickNameText.color = "white";
    nickNameText.fontSize = "70px";
    nickNameText.shadowBlur = 0;
    nickNameText.outlineWidth = 10;
    nickNameText.outlineColor = "black";
    advancedTexture.addControl(nickNameText);
  }

  static removeNameTag(scene: BABYLON.Scene, mesh: BABYLON.Mesh) {
    if (!mesh) return;
    mesh.getChildMeshes().forEach(mesh => {
      if (mesh.name === 'nickname') {
        scene.removeMesh(mesh);
      }
    });
  }
}