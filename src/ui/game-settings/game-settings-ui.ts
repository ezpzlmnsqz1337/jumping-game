import * as BABYLON from '@babylonjs/core';
import { AutomaticCamera } from '../../cameras/automatic-camera';
import { PlayerEntity } from '../../entities/player';
import gameRoot from '../../game-root';
import { AbstractUI } from '../abstract-ui';
import { renderingCanvas } from '../ui-manager';

export class GameSettingsUI extends AbstractUI {
  gameSettingsDiv!: HTMLDivElement;
  playerInfoCheckBox! : HTMLInputElement;
  automaticCameraCheckBox! : HTMLInputElement;
  followCameraCheckBox! : HTMLInputElement;
  collissionsCheckBox! : HTMLInputElement;

  followCameraEnabled = false;
    
  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'game-settings', player);
  }

  toggleFollowCamera() {
    const arcRotateCamera = this.scene.getCameraByName('arcRotateCamera');
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

    this.automaticCameraCheckBox.checked = (this.scene.activeCamera as any).automaticCameraEnabled;
    
    renderingCanvas.focus();
  }

  toggleCollissions() {
    gameRoot.multiplayer?.toggleCollissions();
    this.collissionsCheckBox.checked = this.player.collissionEnabled;
    renderingCanvas.focus();
  }

  toggleAutomaticCamera() {
    const camera = this.scene.activeCamera as unknown as AutomaticCamera;
    camera.automaticCameraEnabled = !camera.automaticCameraEnabled;
    this.automaticCameraCheckBox.checked = camera.automaticCameraEnabled;
    renderingCanvas.focus();
  }

  togglePlayerInfo() {
    gameRoot.uiManager?.playerInfoUI.show(this.playerInfoCheckBox.checked);
  }

  async bindUI() {
    await super.bindUI();
    this.gameSettingsDiv = document.querySelector('.game-settings') as HTMLInputElement;
    this.automaticCameraCheckBox = document.querySelector('.automatic-camera-enabled') as HTMLInputElement;
    this.followCameraCheckBox = document.querySelector('.follow-camera-enabled') as HTMLInputElement;
    this.collissionsCheckBox = document.querySelector('.collissions-enabled') as HTMLInputElement;
    this.playerInfoCheckBox = document.querySelector('.player-info-enabled') as HTMLInputElement;

    const camera = this.scene.activeCamera as unknown as AutomaticCamera;

    this.automaticCameraCheckBox.checked = camera.automaticCameraEnabled;

    this.automaticCameraCheckBox.addEventListener('click', () => {
      this.toggleAutomaticCamera();
    });

    this.followCameraCheckBox.addEventListener('click', () => {
      this.toggleFollowCamera();
    });

    this.collissionsCheckBox.checked = this.player.collissionEnabled;

    this.collissionsCheckBox.addEventListener('click', () => {
      this.toggleCollissions();
    });

    this.playerInfoCheckBox.checked = true;
    this.playerInfoCheckBox.addEventListener('click', () => {
      this.togglePlayerInfo();
    });
    
    this.rootElement = this.gameSettingsDiv;
  }
}