import * as BABYLON from '@babylonjs/core';
import { AutomaticCamera } from './automatic-camera';

export interface FollowCameraOptions {
  radius: number
  position: BABYLON.Vector3
  lockedTarget?: BABYLON.Nullable<BABYLON.AbstractMesh>
}

export class MyFollowCamera extends BABYLON.FollowCamera implements AutomaticCamera{
  automaticCameraEnabled: boolean = false;

  constructor(name: string, opts: FollowCameraOptions, scene: BABYLON.Scene) {
    super(name, opts.position, scene, opts.lockedTarget);
    
    this.radius = opts.radius;
    this.heightOffset = 2;
    this.rotationOffset = 0;
    this.cameraAcceleration = 0.1;
    this.maxCameraSpeed = 5;
    
    this.upperHeightOffsetLimit = 5;
    this.lowerHeightOffsetLimit = 0.5;
    this.speed = 0.1;  
    this.lowerRadiusLimit = 2;
    this.upperRadiusLimit = 50;

    this.attachControl(true);
  }

  setMoveToTarget(targetAlpha: number, targetBeta: number, targetRadius: number, speed: number) {
    return;
  }

  moveToTarget() {
    return;
  }
}