import * as BABYLON from '@babylonjs/core';
import { AutomaticCamera } from './automatic-camera';

export interface ArcRotateCameraOptions {
  alpha: number;
  beta: number;
  radius: number;
  position: BABYLON.Vector3;
  lockedTarget?: BABYLON.AbstractMesh;
}

export class MyArcRotateCamera extends BABYLON.ArcRotateCamera implements AutomaticCamera {
  movingToTarget: boolean = false;
  targetAlpha: number = 0;
  targetBeta: number = 0;
  targetRadius: number = 0;

  automaticCameraEnabled: boolean = true;

  constructor(name: string, opts: ArcRotateCameraOptions, scene: BABYLON.Scene) {
    super(name, opts.alpha, opts.beta, opts.radius, opts.position, scene);
    this.useAutoRotationBehavior = true;
    this.wheelDeltaPercentage = 0.004;
    this.speed = 0.1;
    this.angularSensibilityX = 2200;
    this.angularSensibilityY = 2200;
    this.allowUpsideDown = false;
    this.lowerRadiusLimit = 2;
    this.upperRadiusLimit = 100;

    this.collisionRadius = new BABYLON.Vector3(0.5, 0.5, 0.5);
    this.checkCollisions = true;

    this.upperBetaLimit = Math.PI / 2;

    this.attachControl(true);

    const keyboardInput = this.inputs.attached['keyboard'] as
      | { angularSpeed?: number; zoomingSensibility?: number }
      | undefined;
    if (keyboardInput) {
      keyboardInput.angularSpeed = 0.0035;
      keyboardInput.zoomingSensibility = 60;
    }
  }

  setMoveToTarget(targetAlpha: number, targetBeta: number, targetRadius: number, _speed: number) {
    if (!this.automaticCameraEnabled) return;
    this.targetAlpha = targetAlpha % (Math.PI * 2);
    this.targetBeta = targetBeta;
    this.targetRadius = targetRadius;
    this.movingToTarget = true;
  }

  getShortestAngularDelta(from: number, to: number) {
    const twoPi = Math.PI * 2;
    let delta = (to - from) % twoPi;
    if (delta > Math.PI) delta -= twoPi;
    if (delta < -Math.PI) delta += twoPi;
    return delta;
  }

  moveToTarget() {
    if (!this.automaticCameraEnabled) {
      this.movingToTarget = false;
      return;
    }
    if (!this.movingToTarget) return;
    if (this.alpha < 0) this.alpha = Math.PI * 2 + this.alpha;
    if (this.alpha > Math.PI * 2) this.alpha = this.alpha % (Math.PI * 2);

    const ratio = this._scene.getAnimationRatio();
    const lerpFactor = Math.min(0.35, Math.max(0.08, 0.12 * ratio));

    const alphaDelta = this.getShortestAngularDelta(this.alpha, this.targetAlpha);
    const betaDelta = this.targetBeta - this.beta;
    const radiusDelta = this.targetRadius - this.radius;

    this.alpha += alphaDelta * lerpFactor;
    this.beta += betaDelta * lerpFactor;
    this.radius += radiusDelta * lerpFactor;

    if (Math.abs(alphaDelta) < 0.001) {
      this.alpha = this.targetAlpha;
    }
    if (Math.abs(betaDelta) < 0.001) {
      this.beta = this.targetBeta;
    }
    if (Math.abs(radiusDelta) < 0.01) {
      this.radius = this.targetRadius;
    }

    if (
      Math.abs(alphaDelta) < 0.001 &&
      Math.abs(betaDelta) < 0.001 &&
      Math.abs(radiusDelta) < 0.01
    ) {
      this.movingToTarget = false;
    }
  }
}
