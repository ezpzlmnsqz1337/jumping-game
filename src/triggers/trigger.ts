import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player-entity';
import { defaultTriggerColor } from '../assets/colors';
import { GameLevel } from '../game-level';
import {
  serializeVector3,
  type SerializableCameraTarget,
  type SerializedTrigger,
  type SerializedTriggerKind,
} from '../level-document';

export interface CreateTriggerOptions {
  level: GameLevel;
  position?: BABYLON.Vector3;
  scaling?: BABYLON.Vector3;
  rotationQuaternion?: BABYLON.Quaternion;
  isVisible?: boolean;
  debugType?: 'trigger' | 'camera-trigger';
  triggerType?: SerializedTriggerKind;
  cameraTarget?: SerializableCameraTarget;
  [key: string]: unknown;
}

export class Trigger {
  level: GameLevel;
  mesh: BABYLON.Mesh;
  debugType: 'trigger' | 'camera-trigger';
  triggerType: SerializedTriggerKind;
  cameraTarget?: SerializableCameraTarget;

  constructor(scene: BABYLON.Scene, opts: CreateTriggerOptions) {
    this.level = opts.level;
    this.debugType = opts.debugType || 'trigger';
    this.triggerType = opts.triggerType || 'generic';
    this.cameraTarget = opts.cameraTarget;

    const material = new BABYLON.StandardMaterial('triggerMaterial');
    material.diffuseColor = defaultTriggerColor;
    material.alpha = 0.7;

    this.mesh = BABYLON.MeshBuilder.CreateBox('trigger', { size: 1, ...opts }, scene);
    this.mesh.isVisible = opts.isVisible || false;
    this.mesh.position = opts.position || new BABYLON.Vector3(0, 0, 0);
    this.mesh.scaling = opts.scaling || new BABYLON.Vector3(1, 1, 1);
    this.mesh.rotationQuaternion =
      opts.rotationQuaternion?.clone() || BABYLON.Quaternion.Identity();
    this.mesh.checkCollisions = true;
    this.mesh.metadata = {
      debugType: this.debugType,
      triggerType: this.triggerType,
      cameraTarget: this.cameraTarget,
      triggerSettings: {
        isVisible: this.mesh.isVisible,
        checkCollisions: this.mesh.checkCollisions,
      },
    };

    this.level.triggers.push(this);

    this.mesh.actionManager = new BABYLON.ActionManager(scene);
    this.mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        {
          trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
          parameter: this.level.player,
        },
        () => this.onEnter(this.mesh, this.level.player as PlayerEntity)
      )
    );
    this.mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        {
          trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
          parameter: this.level.player,
        },
        () => this.onExit(this.mesh, this.level.player as PlayerEntity)
      )
    );
    this.mesh.material = material;
  }

  onEnter(_trigger: BABYLON.Mesh, _player: PlayerEntity) {}

  onExit(_trigger: BABYLON.Mesh, _player: PlayerEntity) {}

  serialize(): SerializedTrigger {
    let boxSize: { x: number; y: number; z: number } | undefined;
    if (this.triggerType === 'camera') {
      const worldSize = this.mesh.getBoundingInfo().boundingBox.extendSize.scale(2);
      const sx = this.mesh.scaling.x || 1;
      const sy = this.mesh.scaling.y || 1;
      const sz = this.mesh.scaling.z || 1;
      boxSize = {
        x: worldSize.x / sx,
        y: worldSize.y / sy,
        z: worldSize.z / sz,
      };
    }

    return {
      triggerType: this.triggerType,
      debugType: this.debugType,
      position: serializeVector3(this.mesh.position),
      scaling: serializeVector3(this.mesh.scaling),
      boxSize,
      rotation: this.mesh.rotationQuaternion
        ? {
            x: this.mesh.rotationQuaternion.x,
            y: this.mesh.rotationQuaternion.y,
            z: this.mesh.rotationQuaternion.z,
            w: this.mesh.rotationQuaternion.w,
          }
        : undefined,
      isVisible: this.mesh.isVisible,
      cameraTarget: this.cameraTarget,
    };
  }
}
