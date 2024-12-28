import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from './entities/player';

export interface KeyStatus {
  KeyW: boolean,
  KeyS: boolean,
  KeyA: boolean,
  KeyD: boolean,
  Comma: boolean,
  Period: boolean,
  Space: boolean,
  ControlLeft: boolean
}

export interface Controls {
  keyStatus: KeyStatus,
  player: BABYLON.Nullable<PlayerEntity>
}

export const createControls = (scene: BABYLON.Scene) => {
  const keyStatus: KeyStatus = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Comma: false,
    Period: false,
    Space: false,
    ControlLeft: false
  }

  scene.actionManager = new BABYLON.ActionManager(scene);

  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnKeyDownTrigger,
      e => {
        let key = e.sourceEvent.code as string;
        if (key in keyStatus) {
          keyStatus[key as keyof typeof keyStatus] = true;
        }
      }
    )
  )

  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnKeyUpTrigger,
      e => {
        let key = e.sourceEvent.code as string;
        if (key in keyStatus) {
          keyStatus[key as keyof typeof keyStatus] = false;
        }
      }
    )
  )

  const controls: Controls = {
    keyStatus,
    player: null
  };

  scene.onBeforeRenderObservable.add(() => {
    const player = controls.player;
    if (!player) return;
    handleWSADMovement(keyStatus, player);
    handleTurning(keyStatus, player);
    handleJumping(keyStatus, player);

  });

  return controls;
}

const handleWSADMovement = (keyStatus: KeyStatus, player: PlayerEntity) => {
  if (
    keyStatus.KeyW ||
    keyStatus.KeyS ||
    keyStatus.KeyA ||
    keyStatus.KeyD
  ) {
    player.moving = true;
    const forward = player.mesh.getDirection(BABYLON.Axis.Z);
    const right = player.mesh.getDirection(BABYLON.Axis.X);
    const speed = (keyStatus.KeyS || keyStatus.KeyW) &&
      (keyStatus.KeyA || keyStatus.KeyD) ||
      player.jumping ?
      player.speed * 0.5 :
      player.speed;

    if (keyStatus.KeyW && !keyStatus.KeyS) {
      player.physics.body.applyImpulse(
        forward.scale(-speed),
        player.mesh.getAbsolutePosition()
      );
    }
    if (keyStatus.KeyS && !keyStatus.KeyW) {
      player.physics.body.applyImpulse(
        forward.scale(speed),
        player.mesh.getAbsolutePosition()
      );
    }
    if (keyStatus.KeyA && !keyStatus.KeyD) {
      player.physics.body.applyImpulse(
        right.scale(speed),
        player.mesh.getAbsolutePosition()
      );
    }
    if (keyStatus.KeyD && !keyStatus.KeyA) {
      player.physics.body.applyImpulse(
        right.scale(-speed),
        player.mesh.getAbsolutePosition()
      );
    }
  }
  if (player.physics.body.getLinearVelocity().length() === 0) {
    player.moving = false;
  }
}

const handleJumping = (keyStatus: KeyStatus, player: PlayerEntity) => {
  const jumpingPower = player.jumpingPower || 70;

  if (keyStatus.Space && !player.jumping) {
    player.jumping = true;
    player.moving = true;
    player.physics.body.applyImpulse(
      BABYLON.Vector3.Up().scale(jumpingPower),
      player.mesh.getAbsolutePosition()
    );
  }
}

const handleTurning = (keyStatus: KeyStatus, player: PlayerEntity) => {
  const rotationSpeed = player.rotationSpeed || 4;
  const forward = player.mesh.getDirection(BABYLON.Axis.Z);

  if (keyStatus.Comma && !keyStatus.Period) {
    player.physics.body.setAngularVelocity(new BABYLON.Vector3(0, -rotationSpeed, 0));
    if (keyStatus.KeyA && player.jumping) {
      player.physics.body.applyImpulse(
        forward.scale(-0.05),
        player.mesh.getAbsolutePosition()
      );
    }
  } else if (keyStatus.Period && !keyStatus.Comma) {
    player.physics.body.setAngularVelocity(new BABYLON.Vector3(0, rotationSpeed, 0));
    if (keyStatus.KeyD && player.jumping) {
      player.physics.body.applyImpulse(
        forward.scale(-0.05),
        player.mesh.getAbsolutePosition()
      );
    }
  } else {
    player.physics.body.setAngularVelocity(BABYLON.Vector3.Zero());
  }
}