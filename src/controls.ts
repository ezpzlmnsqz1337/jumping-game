import * as BABYLON from '@babylonjs/core';
import { Checkpoint, PlayerEntity } from './entities/player-entity';
import gameRoot from './game-root';
import { GameLevel } from './game-level';

export interface KeyStatus {
  KeyW: boolean;
  KeyS: boolean;
  KeyA: boolean;
  KeyD: boolean;
  Comma: boolean;
  Period: boolean;
  Space: boolean;
  ControlLeft: boolean;
}

export class GameControls {
  keyStatus: KeyStatus = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Comma: false,
    Period: false,
    Space: false,
    ControlLeft: false,
  };

  /** Sets a key status flag. Used by both keyboard events and mobile controls. */
  setKeyStatus(key: keyof KeyStatus, pressed: boolean): void {
    this.keyStatus[key] = pressed;
  }

  bindControls(scene: BABYLON.Scene, player: PlayerEntity): void {
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, e => {
        const key = e.sourceEvent.code as string;
        if (key in this.keyStatus) {
          this.keyStatus[key as keyof typeof this.keyStatus] = true;
        }
      })
    );

    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, e => {
        const key = e.sourceEvent.code as string;
        if (key in this.keyStatus) {
          this.keyStatus[key as keyof typeof this.keyStatus] = false;
        }
      })
    );

    scene.onBeforeRenderObservable.add(() => {
      if (!player || ['in_lobby', 'in_chat'].includes(player.status)) return;
      const deltaTime = scene.getAnimationRatio();
      this.handleWSADMovement(player, deltaTime);
      this.handleTurning(player, deltaTime);
      this.handleJumping(player);
    });

    window.addEventListener('keypress', e => {
      if (e.code === 'Enter') {
        gameRoot.uiManager?.lobbyUI.confirmPlay();
        gameRoot.uiManager?.chatUI.sendChatMessage();
      }
      if (e.code === 'KeyL') {
        gameRoot.uiManager?.lobbyUI.openLobby();
      }
      if (e.code === 'Backquote') {
        gameRoot.uiManager?.playerInfoUI.toggle();
      }
      if (player && !['in_lobby', 'in_chat'].includes(player.status)) {
        this.handleRespawn(e.code, player);
        this.handleCheckpoints(e.code, player);
        this.handleCollissions(e.code);
        this.handleFollowCamera(e.code);
        this.handleOpenChat(e.code);
      }
    });

    document.addEventListener('keyup', e => {
      if (e.code === 'F2') {
        e.preventDefault();
        gameRoot.uiManager?.playerInfoUI.toggle();
      }
    });
  }

  private readonly strafeOrJumpSpeedMultiplier = 0.5;
  private readonly maxHorizontalSpeed = 20;

  handleWSADMovement(player: PlayerEntity, deltaTime: number) {
    if (!player.mesh) return;
    const keyStatus = this.keyStatus;
    if (keyStatus.KeyW || keyStatus.KeyS || keyStatus.KeyA || keyStatus.KeyD) {
      player.moving = true;
      const forward = player.mesh.getDirection(BABYLON.Axis.Z);
      const right = player.mesh.getDirection(BABYLON.Axis.X);
      const isDiagonal = (keyStatus.KeyS || keyStatus.KeyW) && (keyStatus.KeyA || keyStatus.KeyD);
      const speedMultiplier = isDiagonal || player.jumping ? this.strafeOrJumpSpeedMultiplier : 1;
      const speed = player.speed * speedMultiplier * deltaTime;

      const { x, z } = player.physics.body.getLinearVelocity();
      const hSpeed = new BABYLON.Vector3(x, 0, z).length();
      if (hSpeed < this.maxHorizontalSpeed) {
        if (keyStatus.KeyW && !keyStatus.KeyS) {
          player.physics.body.applyImpulse(
            forward.scale(-speed),
            player.mesh.getAbsolutePosition()
          );
        }
        if (keyStatus.KeyS && !keyStatus.KeyW) {
          player.physics.body.applyImpulse(forward.scale(speed), player.mesh.getAbsolutePosition());
        }
        if (keyStatus.KeyA && !keyStatus.KeyD) {
          player.physics.body.applyImpulse(right.scale(speed), player.mesh.getAbsolutePosition());
        }
        if (keyStatus.KeyD && !keyStatus.KeyA) {
          player.physics.body.applyImpulse(right.scale(-speed), player.mesh.getAbsolutePosition());
        }
      }
    }

    if (player.physics.body.getLinearVelocity().length() === 0) {
      player.moving = false;
    }
  }

  handleJumping(player: PlayerEntity) {
    if (!player.mesh) return;
    const keyStatus = this.keyStatus;

    if (keyStatus.Space && !player.jumping) {
      player.jump();
    }
  }

  handleTurning(player: PlayerEntity, deltaTime: number) {
    if (!player.mesh) return;

    const keyStatus = this.keyStatus;
    const rotationSpeed = player.rotationSpeed;
    const forward = player.mesh.getDirection(BABYLON.Axis.Z);
    const strafeBoostSpeed =
      player.strafeBoostSpeed * (deltaTime < 1 ? deltaTime * 1.2 : deltaTime);

    if (keyStatus.Comma && !keyStatus.Period) {
      player.physics.body.setAngularVelocity(new BABYLON.Vector3(0, -rotationSpeed, 0));
      if (keyStatus.KeyA && player.jumping) {
        player.physics.body.applyImpulse(
          forward.scale(-strafeBoostSpeed),
          player.mesh.getAbsolutePosition()
        );
      }
    } else if (keyStatus.Period && !keyStatus.Comma) {
      player.physics.body.setAngularVelocity(new BABYLON.Vector3(0, rotationSpeed, 0));
      if (keyStatus.KeyD && player.jumping) {
        player.physics.body.applyImpulse(
          forward.scale(-strafeBoostSpeed),
          player.mesh.getAbsolutePosition()
        );
      }
    } else {
      player.physics.body.setAngularVelocity(BABYLON.Vector3.Zero());
    }
  }

  handleCheckpoints(key: string, player: PlayerEntity) {
    if (!player.mesh) return;

    if ('Digit1' === key) {
      if (!player.jumping) {
        player.checkpoints.push({
          position: player.mesh.getAbsolutePosition().clone(),
          rotationQuaternion: player.mesh.rotationQuaternion!.clone(),
        });
        player.lastCheckpointIndex = player.checkpoints.length - 1;
      }
    }
    if ('Digit2' === key) {
      if (player.checkpoints.length > 0) {
        this.loadCheckpoint(player, player.checkpoints[player.lastCheckpointIndex]);
      }
    }
    if ('Digit3' === key) {
      const newCheckpointIndex = player.lastCheckpointIndex - 1;
      if (player.checkpoints.length > 0 && newCheckpointIndex >= 0) {
        player.lastCheckpointIndex = newCheckpointIndex;
        this.loadCheckpoint(player, player.checkpoints[newCheckpointIndex]);
      }
    }
    if ('Digit4' === key) {
      const newCheckpointIndex = player.lastCheckpointIndex + 1;
      if (player.checkpoints.length > newCheckpointIndex) {
        player.lastCheckpointIndex = newCheckpointIndex;
        this.loadCheckpoint(player, player.checkpoints[newCheckpointIndex]);
      }
    }
  }

  handleRespawn(key: string, player: PlayerEntity) {
    if (!player.mesh) return;
    const level = gameRoot.level as GameLevel;

    if ('KeyR' === key) {
      const previousPlayerPosition = player.mesh.position.clone();
      const spawnPointMesh = level.getRandomSpawnPoint()?.mesh as BABYLON.Mesh | undefined;
      if (!spawnPointMesh) return;
      player.physics.body.disablePreStep = true;
      player.mesh.position = spawnPointMesh.position.clone();
      player.mesh.position.y += 1;
      player.mesh.rotationQuaternion = (
        spawnPointMesh.rotationQuaternion || BABYLON.Quaternion.Identity()
      ).clone();
      player.physics.body.setLinearVelocity(BABYLON.Vector3.Zero());
      player.physics.body.setAngularVelocity(BABYLON.Vector3.Zero());
      player.physics.body.disablePreStep = false;
      this.translateFreeCameraWithPlayer(player, previousPlayerPosition);

      if (gameRoot.multiplayer) {
        gameRoot.multiplayer.pendingTeleportFlag = true;
      }
    }
  }

  loadCheckpoint(player: PlayerEntity, checkpoint: Checkpoint) {
    if (!player.mesh) return;

    const previousPlayerPosition = player.mesh.position.clone();
    player.physics.body.disablePreStep = true;
    player.mesh.position = checkpoint.position.clone();
    player.mesh.rotationQuaternion = checkpoint.rotationQuaternion.clone();
    player.physics.body.setLinearVelocity(BABYLON.Vector3.Zero());
    player.physics.body.setAngularVelocity(BABYLON.Vector3.Zero());
    player.physics.body.disablePreStep = false;
    this.translateFreeCameraWithPlayer(player, previousPlayerPosition);

    if (gameRoot.multiplayer) {
      gameRoot.multiplayer.pendingTeleportFlag = true;
    }
  }

  private translateFreeCameraWithPlayer(
    player: PlayerEntity,
    previousPlayerPosition: BABYLON.Vector3
  ) {
    if (!player.mesh) return;

    const activeCamera = player.mesh.getScene().activeCamera;
    if (!(activeCamera instanceof BABYLON.ArcRotateCamera)) return;
    if (activeCamera.lockedTarget) return;

    const delta = player.mesh.position.subtract(previousPlayerPosition);
    if (delta.lengthSquared() === 0) return;

    activeCamera.target = activeCamera.target.add(delta);
  }

  handleCollissions(key: string) {
    if ('KeyC' === key) {
      gameRoot.uiManager?.gameSettingsUI.toggleCollissions();
    }
  }

  handleFollowCamera(key: string) {
    if ('KeyF' === key) {
      gameRoot.uiManager?.gameSettingsUI.toggleFollowCamera();
    }
  }

  handleOpenChat(key: string) {
    if ('KeyT' === key) {
      gameRoot.uiManager?.chatUI.toggleChat();
    }
  }
}
