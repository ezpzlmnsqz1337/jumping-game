import * as BABYLON from '@babylonjs/core';

type CameraProperty = 'alpha' | 'beta' | 'radius' | 'position.x' | 'position.y' | 'position.z';

export class MyFollowCamera extends BABYLON.FollowCamera {
  automaticCameraEnabled: boolean = false;

  setMoveToTarget(targetAlpha: number, targetBeta: number, targetRadius: number, speed: number) {
    if (!this.automaticCameraEnabled) return;
    this.rotationOffset = (targetAlpha / Math.PI * 180) - 180;
    this.heightOffset = targetBeta * Math.PI / 10 + 1;
    return;
  }

  moveToTarget() {
    return;
  }
}

export const createFollowCamera = (scene: BABYLON.Scene, cameraOptions: CameraOptions) => {
  const camera = new MyFollowCamera('followCamera', cameraOptions.position, scene);
  camera.radius = cameraOptions.radius;
  camera.heightOffset = 2;
  camera.rotationOffset = 0;
  camera.cameraAcceleration = 0.1;
  camera.maxCameraSpeed = 5;
  
  camera.upperHeightOffsetLimit = 5;
  camera.lowerHeightOffsetLimit = 0.5;
  camera.speed = 0.1;  
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 50;

  camera.attachControl(true);
  return camera;
}

export class MyCamera extends BABYLON.ArcRotateCamera {
  movingToTarget: boolean = false;
  targetAlpha: number = 0;
  targetBeta: number = 0;
  targetRadius: number = 0;
  goLeft: boolean = false;

  automaticCameraEnabled: boolean = true;

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

  // moveToOld(property: CameraProperty, targetval: number, speed: number) {
  //   // not working :(
  //   const targetPropertyPath = property.split(".");
  //   let value: any = this;

  //   // Resolve the property path
  //   for (let index = 0; index < targetPropertyPath.length; index++) {
  //     if (value[targetPropertyPath[index]] === undefined) {
  //       console.error(`Property ${targetPropertyPath[index]} not found on camera`);
  //       return;
  //     }
  //     value = value[targetPropertyPath[index]];
  //   }
  //   console.log(`Animating property: ${property} from ${value} to ${targetval}`);

  //   const ease = new BABYLON.CubicEase();
  //   ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  //   const animation = new BABYLON.Animation(
  //     'cameraAnimation', // name
  //     property, // targetProperty
  //     speed, // frame per second
  //     BABYLON.Animation.ANIMATIONTYPE_FLOAT, // animation type
  //     BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT // loop mode
  //   );

  //   const keys = [
  //     { frame: 0, value: value },
  //     { frame: 120, value: targetval }
  //   ];

  //   animation.setKeys(keys);
  //   animation.setEasingFunction(ease);

  //   this.animations = [];
  //   this.animations.push(animation);

  //   const scene = this.getScene();
  //   if (scene) {
  //     if (scene) {
  //       scene.stopAnimation(this); // Ensure any previous animations are stopped
  //       scene.beginDirectAnimation(this, [animation], 0, 120, false);
  //       console.log('Animation started');
  //     } else {
  //       console.error('Scene not found');
  //     }
  //   }
  // }
}

export interface CameraOptions {
  alpha: number
  beta: number
  radius: number
  position: BABYLON.Vector3
}

export const createCamera = (scene: BABYLON.Scene, cameraOptions: CameraOptions) => {
  const camera = new MyCamera('mainArcRotateCamera',
    cameraOptions.alpha,
    cameraOptions.beta,
    cameraOptions.radius,
    cameraOptions.position,
    scene
  );
  camera.useAutoRotationBehavior = true;
  camera.wheelDeltaPercentage = 0.01;
  camera.speed = 0.1;
  camera.angularSensibilityX = 1000; // Adjust this value to change horizontal turning speed
  camera.angularSensibilityY = 1000; // Adjust this value to change vertical turning speed  
  camera.allowUpsideDown = false;
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 100;
  
  camera.collisionRadius = new BABYLON.Vector3(0.5, 0.5, 0.5);
  camera.checkCollisions = true;

  camera.upperBetaLimit = Math.PI / 2;

  camera.attachControl(true);

  return camera;
}

export const setCameraOptions = (camera: MyCamera | MyFollowCamera, cameraOptions: CameraOptions) => {
  camera.setMoveToTarget(
    cameraOptions.alpha,
    cameraOptions.beta,
    cameraOptions.radius,
    50
  )
  // camera.moveTo('alpha', cameraOptions.alpha, 0.1);
  // camera.moveTo('beta', cameraOptions.beta, 0.1);
  // camera.moveTo('radius', cameraOptions.radius, 0.1);
  // camera.moveTo('position.x', cameraOptions.position.x, 0.1);
  // camera.moveTo('position.y', cameraOptions.position.y, 0.1);
  // camera.moveTo('position.z', cameraOptions.position.z, 0.1);  

  // camera.alpha = cameraOptions.alpha;
  // camera.beta = cameraOptions.beta;
  // camera.radius = cameraOptions.radius;
  // camera.position.x = cameraOptions.position.x;
  // camera.position.y = cameraOptions.position.y;
  // camera.position.z = cameraOptions.position.z;
}