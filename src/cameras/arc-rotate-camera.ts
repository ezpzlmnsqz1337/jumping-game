import * as BABYLON from '@babylonjs/core';
import { AutomaticCamera } from './automatic-camera';

export interface ArcRotateCameraOptions {
  alpha: number
  beta: number
  radius: number
  position: BABYLON.Vector3
  lockedTarget?: BABYLON.AbstractMesh
}

export class MyArcRotateCamera extends BABYLON.ArcRotateCamera implements AutomaticCamera {
  movingToTarget: boolean = false;
  targetAlpha: number = 0;
  targetBeta: number = 0;
  targetRadius: number = 0;
  goLeft: boolean = false;

  automaticCameraEnabled: boolean = true;

  constructor(name: string, opts: ArcRotateCameraOptions, scene: BABYLON.Scene) {
    super(name, opts.alpha, opts.beta, opts.radius, opts.position, scene);
    this.useAutoRotationBehavior = true;
    this.wheelDeltaPercentage = 0.01;
    this.speed = 0.1;
    this.angularSensibilityX = 1000; // Adjust this value to change horizontal turning speed
    this.angularSensibilityY = 1000; // Adjust this value to change vertical turning speed  
    this.allowUpsideDown = false;
    this.lowerRadiusLimit = 2;
    this.upperRadiusLimit = 100;
    
    this.collisionRadius = new BABYLON.Vector3(0.5, 0.5, 0.5);
    this.checkCollisions = true;
  
    this.upperBetaLimit = Math.PI / 2;
  
    this.attachControl(true);
  }

  setMoveToTarget(targetAlpha: number, targetBeta: number, targetRadius: number, speed: number) {
    if (!this.automaticCameraEnabled) return;
    this.targetAlpha = targetAlpha % (Math.PI * 2);
    this.targetBeta = targetBeta;
    this.targetRadius = targetRadius;
    const diff = this.targetAlpha - this.alpha;
    this.goLeft = diff > 0 ? diff > Math.PI : diff > -Math.PI;
    this.movingToTarget = true;
  }

  moveToTarget() {
    if (!this.automaticCameraEnabled) {
      this.movingToTarget = false;
      return;
    }
    if (!this.movingToTarget) return;
    if (this.alpha < 0) this.alpha = Math.PI * 2 + this.alpha;
    if (this.alpha > Math.PI * 2) this.alpha = this.alpha % (Math.PI * 2);

    const factor = 0.01 * this._scene.getAnimationRatio();

    if (this.targetAlpha !== this.alpha) {
      if (this.goLeft) {
        this.alpha -= factor;
      } else {
        this.alpha += factor;
      }

      if (Math.abs(this.targetAlpha - this.alpha) < factor) {
        this.alpha = this.targetAlpha;
      }
    }

    if (this.targetBeta > this.beta + factor) {
      this.beta += factor;
    } else if (this.targetBeta < this.beta - factor) {
      this.beta -= factor;
    } else {
      this.beta = this.targetBeta;
    }

    if (this.targetRadius > this.radius + factor * 10) {
      this.radius += factor * 10;
    } else if (this.targetRadius < this.radius - factor * 10) {
      this.radius -= factor * 10;
    } else {
      this.radius = this.targetRadius;
    }

    if (
      this.targetAlpha === this.alpha &&
      this.targetBeta === this.beta &&
      this.targetRadius === this.radius
    ) {
      this.movingToTarget = false;
    }
  }
}
