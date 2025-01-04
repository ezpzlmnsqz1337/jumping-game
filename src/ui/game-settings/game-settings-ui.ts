import * as BABYLON from '@babylonjs/core';
import { MyCamera, MyFollowCamera } from '../../camera';
import { PlayerEntity } from '../../entities/player';
import gameRoot from '../../game-root';
import { AbstractUI } from '../abstract-ui';
import { renderingCanvas } from '../ui-manager';

export class GameSettingsUI extends AbstractUI {
  automaticCameraCheckBox! : HTMLInputElement;
  followCameraCheckBox! : HTMLInputElement;
  collissionsCheckBox! : HTMLInputElement;

  followCameraEnabled = false;
    
  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'game-settings', player);
  }

  toggleFollowCamera() {
    const arcRotateCamera = this.scene.getCameraByName('mainArcRotateCamera');
    const followCamera = this.scene.getCameraByName('followCamera');

    if (this.followCameraEnabled) {
      followCamera?.storeState();
      this.scene.activeCamera = arcRotateCamera;
      arcRotateCamera?.restoreState();
    } else {
      arcRotateCamera?.storeState();
      this.scene.activeCamera = followCamera;
      followCamera?.restoreState();
    }

    this.followCameraEnabled = !this.followCameraEnabled;
    this.followCameraCheckBox.checked = this.followCameraEnabled;
    renderingCanvas.focus();
  }

  async bindUI() {
    await super.bindUI();
    this.automaticCameraCheckBox = document.querySelector('.automatic-camera-enabled') as HTMLInputElement;
    this.followCameraCheckBox = document.querySelector('.follow-camera-enabled') as HTMLInputElement;
    this.collissionsCheckBox = document.querySelector('.collissions-enabled') as HTMLInputElement;

    const camera = this.scene.activeCamera as MyCamera | MyFollowCamera;

    this.automaticCameraCheckBox.checked = camera.automaticCameraEnabled;

    this.automaticCameraCheckBox.addEventListener('click', () => {
      (this.scene.cameras as MyCamera[] | MyFollowCamera[]).forEach(camera => {
        camera.automaticCameraEnabled = !camera.automaticCameraEnabled;
      });
      renderingCanvas.focus();
    });

    this.followCameraCheckBox.addEventListener('click', () => {
      this.toggleFollowCamera();
    });

    this.collissionsCheckBox.checked = this.player.collissionEnabled;

    this.collissionsCheckBox.addEventListener('click', () => {
      gameRoot.multiplayer?.toggleCollissions();
      this.collissionsCheckBox.checked = this.player.collissionEnabled;
    });
  }
}