import * as BABYLON from '@babylonjs/core';
import { AutomaticCamera } from '../../cameras/automatic-camera';
import { PlayerEntity } from '../../entities/player-entity';
import gameRoot from '../../game-root';
import { AbstractUI } from '../abstract-ui';
import { renderingCanvas } from '../ui-manager';

export class GameSettingsUI extends AbstractUI {
  gameSettingsDiv!: HTMLDivElement;
  playerInfoCheckBox!: HTMLInputElement;
  automaticCameraCheckBox!: HTMLInputElement;
  followCameraCheckBox!: HTMLInputElement;
  collissionsCheckBox!: HTMLInputElement;
  editModeCheckBox!: HTMLInputElement;

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

    this.automaticCameraCheckBox.checked =
      (this.scene.activeCamera as { automaticCameraEnabled?: boolean }).automaticCameraEnabled ??
      false;

    renderingCanvas.focus();
  }

  toggleCollissions() {
    if (gameRoot.multiplayer) {
      gameRoot.multiplayer.toggleCollissions();
    } else {
      this.player.collisionEnabled = !this.player.collisionEnabled;
    }
    this.collissionsCheckBox.checked = this.player.collisionEnabled;
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

  toggleEditMode() {
    const enabled = this.editModeCheckBox.checked;
    window.dispatchEvent(new CustomEvent('editor-edit-mode-changed', { detail: { enabled } }));
    renderingCanvas.focus();
  }

  async bindUI() {
    await super.bindUI();
    this.gameSettingsDiv = document.querySelector('.game-settings') as HTMLInputElement;
    this.automaticCameraCheckBox = document.querySelector(
      '.automatic-camera-enabled'
    ) as HTMLInputElement;
    this.followCameraCheckBox = document.querySelector(
      '.follow-camera-enabled'
    ) as HTMLInputElement;
    this.collissionsCheckBox = document.querySelector('.collissions-enabled') as HTMLInputElement;
    this.playerInfoCheckBox = document.querySelector('.player-info-enabled') as HTMLInputElement;
    this.editModeCheckBox = document.querySelector('.edit-mode-enabled-global') as HTMLInputElement;

    if (gameRoot.multiplayer || !gameRoot.gizmoManager) {
      const editModeDiv = this.editModeCheckBox.closest('.edit-mode-visibility') as HTMLElement;
      if (editModeDiv) {
        editModeDiv.style.display = 'none';
      }
    }

    const camera = this.scene.activeCamera as unknown as AutomaticCamera;

    this.automaticCameraCheckBox.checked = camera.automaticCameraEnabled;

    this.automaticCameraCheckBox.addEventListener('click', () => {
      this.toggleAutomaticCamera();
    });

    this.followCameraCheckBox.addEventListener('click', () => {
      this.toggleFollowCamera();
    });

    this.collissionsCheckBox.checked = this.player.collisionEnabled;

    this.collissionsCheckBox.addEventListener('click', () => {
      this.toggleCollissions();
    });

    this.playerInfoCheckBox.checked = false;
    this.playerInfoCheckBox.addEventListener('click', () => {
      this.togglePlayerInfo();
    });

    this.editModeCheckBox.checked = true;
    this.editModeCheckBox.addEventListener('click', () => {
      this.toggleEditMode();
    });
    this.toggleEditMode();

    this.rootElement = this.gameSettingsDiv;
  }
}
