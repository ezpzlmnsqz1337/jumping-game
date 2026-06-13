import * as BABYLON from '@babylonjs/core';
import { AutomaticCamera } from './automatic-camera';

export interface FollowCameraOptions {
  radius: number;
  position: BABYLON.Vector3;
  lockedTarget?: BABYLON.Nullable<BABYLON.AbstractMesh>;
}

export class MyFollowCamera extends BABYLON.FollowCamera implements AutomaticCamera {
  automaticCameraEnabled: boolean = false;
  wallClearance = 0.4;
  minWallDistance = 1.2;
  minPlayerDistance = 1.35;

  constructor(name: string, opts: FollowCameraOptions, scene: BABYLON.Scene) {
    super(name, opts.position, scene, opts.lockedTarget);

    this.radius = opts.radius;
    this.heightOffset = 2.2;
    this.rotationOffset = 0;
    this.cameraAcceleration = 0.06;
    this.maxCameraSpeed = 2.2;

    this.upperHeightOffsetLimit = 6;
    this.lowerHeightOffsetLimit = 0.5;
    this.speed = 0.1;
    this.lowerRadiusLimit = 2;
    this.upperRadiusLimit = 50;

    this.attachControl(true);

    const pointersInput = this.inputs.attached['pointers'] as
      | { warningEnable?: boolean; angularSensibilityX?: number; angularSensibilityY?: number }
      | undefined;
    const keyboardInput = this.inputs.attached['keyboard'] as
      | { heightSensibility?: number; rotationSensibility?: number; radiusSensibility?: number }
      | undefined;
    const mouseWheelInput = this.inputs.attached['mousewheel'] as
      | { wheelPrecision?: number; wheelDeltaPercentage?: number }
      | undefined;

    if (pointersInput) {
      pointersInput.warningEnable = false;
      pointersInput.angularSensibilityX = 1500;
      pointersInput.angularSensibilityY = 1500;
    }

    if (keyboardInput) {
      keyboardInput.heightSensibility = 0.05;
      keyboardInput.rotationSensibility = 0.18;
      keyboardInput.radiusSensibility = 0.09;
    }

    if (mouseWheelInput) {
      mouseWheelInput.wheelDeltaPercentage = 0;
      mouseWheelInput.wheelPrecision = 1.1;
    }

    scene.onBeforeRenderObservable.add(() => this.applyWallAvoidance());
  }

  applyWallAvoidance() {
    if (this.getScene().activeCamera !== this) return;
    if (!this.lockedTarget) return;

    const targetPosition = this.lockedTarget.getAbsolutePosition().add(new BABYLON.Vector3(0, 0.5, 0));
    const desiredCameraPosition = this.position.clone();
    const toCamera = desiredCameraPosition.subtract(targetPosition);
    const distance = toCamera.length();
    if (distance <= this.minWallDistance) return;

    const direction = toCamera.normalize();
    const ray = new BABYLON.Ray(targetPosition, direction, distance);
    const hit = this.getScene().pickWithRay(ray, mesh => mesh.name === 'wall');

    if (!hit?.hit || !hit.distance) return;

    let safeDistance = Math.max(this.minWallDistance, hit.distance - this.wallClearance);

    const targetBoundingRadius = this.lockedTarget.getBoundingInfo().boundingSphere.radiusWorld;
    const minDistanceFromPlayer = Math.max(this.minPlayerDistance, targetBoundingRadius + 0.65);
    if (safeDistance < minDistanceFromPlayer) {
      safeDistance = minDistanceFromPlayer;
    }

    this.position = targetPosition.add(direction.scale(safeDistance));
  }

  setMoveToTarget(
    _targetAlpha: number,
    _targetBeta: number,
    _targetRadius: number,
    _speed: number
  ) {
    return;
  }

  moveToTarget() {
    return;
  }
}
