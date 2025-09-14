import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { GameLevel } from '../game-level';

export type GameEntityType = 'wall' | 'player' | 'trigger';

export class GameEntity {
  name: string;
  scene: BABYLON.Scene;
  level: GameLevel;
  protected _mesh: BABYLON.Nullable<BABYLON.Mesh> = null;
  type: GameEntityType = 'wall';

  constructor(name: string, level: GameLevel, scene: BABYLON.Scene) {
    this.scene = scene;
    this.name = name;
    this.level = level;
  }

  get mesh(): BABYLON.Nullable<BABYLON.Mesh> {
    return this._mesh;
  }

  set mesh(mesh: BABYLON.Mesh) {
    this._mesh = mesh;
    if (!this._mesh.metadata) this._mesh.metadata = {};
    this._mesh.metadata.entity = this;
  }

  static createLabelTag(scene: BABYLON.Scene, mesh: BABYLON.Mesh, nickname: string): void {
    // name tag
    const nickNameTextPlane = BABYLON.MeshBuilder.CreatePlane('label', { size: 2 }, scene);
    nickNameTextPlane.rotation = new BABYLON.Vector3(0, 0, 0);
    nickNameTextPlane.parent = mesh;
    nickNameTextPlane.position.y = 2;
    nickNameTextPlane.isPickable = false;
    nickNameTextPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    nickNameTextPlane.scaling = new BABYLON.Vector3(1, 5, 1);

    const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(nickNameTextPlane);

    const nickNameText = new GUI.TextBlock("labelText", nickname);
    nickNameText.color = "white";
    nickNameText.fontSize = "70px";
    nickNameText.shadowBlur = 0;
    nickNameText.outlineWidth = 10;
    nickNameText.outlineColor = "black";
    advancedTexture.addControl(nickNameText);

  }

  static createNameTag(scene: BABYLON.Scene, mesh: BABYLON.Mesh, nickname: string): void {
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

  static removeNameTag(scene: BABYLON.Scene, mesh: BABYLON.Mesh): void {
    if (!mesh) return;
    mesh.getChildMeshes().forEach(mesh => {
      if (mesh.name === 'nickname') {
        scene.removeMesh(mesh);
      }
    });
  }

  createPhysics(scene: BABYLON.Scene): void { }

  updatePhysicsBody(): void {
    if (!this.mesh) return;

    if (this.mesh.physicsBody) {
      this.mesh.physicsBody.getCollisionObservable().clear();
      this.mesh.physicsBody.dispose();
      this.mesh.physicsBody = null;
    }

    this.createPhysics(this.mesh.getScene());
  }

  serialize(): any {
    return {
      type: this.type,
      name: this.name,
      position: this.mesh?.position,
      rotation: this.mesh?.rotationQuaternion,
      scaling: this.mesh?.scaling,
      material: this.mesh?.material?.serialize()
    };
  }
}