import * as BABYLON from '@babylonjs/core';
import { AutomaticCamera } from '../../cameras/automatic-camera';
import { PlayerEntity } from '../../entities/player-entity';
import gameRoot from '../../game-root';
import { GameStorage } from '../../game-storage';
import { resolveQualityTier, applyEngineQuality, type QualitySetting } from '../../quality';
import { AbstractUI } from '../abstract-ui';
import { renderingCanvas } from '../ui-manager';

export class GameSettingsUI extends AbstractUI {
  gameSettingsDiv!: HTMLDivElement;
  playerInfoCheckBox!: HTMLInputElement;
  automaticCameraCheckBox!: HTMLInputElement;
  followCameraCheckBox!: HTMLInputElement;
  collissionsCheckBox!: HTMLInputElement;
  editModeCheckBox!: HTMLInputElement;
  qualitySelect!: HTMLSelectElement;

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

    gameRoot.gameSettings.followCameraEnabled = this.followCameraEnabled;
    GameStorage.saveGameSettings(gameRoot.gameSettings);

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

    gameRoot.gameSettings.collisionsEnabled = this.player.collisionEnabled;
    GameStorage.saveGameSettings(gameRoot.gameSettings);

    renderingCanvas.focus();
  }

  toggleAutomaticCamera() {
    const camera = this.scene.activeCamera as unknown as AutomaticCamera;
    camera.automaticCameraEnabled = !camera.automaticCameraEnabled;
    this.automaticCameraCheckBox.checked = camera.automaticCameraEnabled;

    gameRoot.gameSettings.autoCameraEnabled = camera.automaticCameraEnabled;
    GameStorage.saveGameSettings(gameRoot.gameSettings);

    renderingCanvas.focus();
  }

  togglePlayerInfo() {
    gameRoot.uiManager?.playerInfoUI.show(this.playerInfoCheckBox.checked);

    gameRoot.gameSettings.playerInfoVisible = this.playerInfoCheckBox.checked;
    GameStorage.saveGameSettings(gameRoot.gameSettings);
  }

  toggleEditMode() {
    const enabled = this.editModeCheckBox.checked;
    window.dispatchEvent(new CustomEvent('editor-edit-mode-changed', { detail: { enabled } }));

    gameRoot.gameSettings.editModeEnabled = this.editModeCheckBox.checked;
    GameStorage.saveGameSettings(gameRoot.gameSettings);

    renderingCanvas.focus();
  }

  changeQuality(setting: QualitySetting) {
    gameRoot.gameSettings.qualityTier = setting;
    GameStorage.saveGameSettings(gameRoot.gameSettings);

    const newTier = resolveQualityTier(setting);
    gameRoot.qualityTier = newTier;

    if (gameRoot.engine) {
      applyEngineQuality(gameRoot.engine, newTier);
      gameRoot.engine.resize();
    }

    gameRoot.level?.recreateShadowsForTier(newTier);

    renderingCanvas.focus();
  }

  async bindUI() {
    await super.bindUI();
    this.gameSettingsDiv = document.querySelector('.game-settings') as HTMLDivElement;
    this.automaticCameraCheckBox = document.querySelector(
      '.automatic-camera-enabled'
    ) as HTMLInputElement;
    this.followCameraCheckBox = document.querySelector(
      '.follow-camera-enabled'
    ) as HTMLInputElement;
    this.collissionsCheckBox = document.querySelector('.collissions-enabled') as HTMLInputElement;
    this.playerInfoCheckBox = document.querySelector('.player-info-enabled') as HTMLInputElement;
    this.editModeCheckBox = document.querySelector('.edit-mode-enabled-global') as HTMLInputElement;
    this.qualitySelect = document.querySelector('.quality-tier') as HTMLSelectElement;

    if (gameRoot.multiplayer || !gameRoot.gizmoManager) {
      const editModeDiv = this.editModeCheckBox.closest('.edit-mode-visibility') as HTMLElement;
      if (editModeDiv) {
        editModeDiv.style.display = 'none';
      }
    }

    const camera = this.scene.activeCamera as unknown as AutomaticCamera;
    const settings = gameRoot.gameSettings;

    if (settings.autoCameraEnabled !== undefined) {
      camera.automaticCameraEnabled = settings.autoCameraEnabled;
    }
    this.automaticCameraCheckBox.checked = camera.automaticCameraEnabled;
    this.automaticCameraCheckBox.addEventListener('click', () => {
      this.toggleAutomaticCamera();
    });

    this.followCameraEnabled = false;
    this.followCameraCheckBox.checked = false;
    if (settings.followCameraEnabled === true) {
      this.toggleFollowCamera();
    }
    this.followCameraCheckBox.addEventListener('click', () => {
      this.toggleFollowCamera();
    });

    if (settings.collisionsEnabled !== undefined) {
      this.player.collisionEnabled = settings.collisionsEnabled;
    }
    this.collissionsCheckBox.checked = this.player.collisionEnabled;
    this.collissionsCheckBox.addEventListener('click', () => {
      this.toggleCollissions();
    });

    const playerInfoVisible = settings.playerInfoVisible ?? false;
    this.playerInfoCheckBox.checked = playerInfoVisible;
    this.togglePlayerInfo();
    this.playerInfoCheckBox.addEventListener('click', () => {
      this.togglePlayerInfo();
    });

    const editModeEnabled = settings.editModeEnabled ?? true;
    this.editModeCheckBox.checked = editModeEnabled;
    this.editModeCheckBox.addEventListener('click', () => {
      this.toggleEditMode();
    });
    this.toggleEditMode();

    this.qualitySelect.value = gameRoot.gameSettings.qualityTier ?? 'auto';
    this.qualitySelect.addEventListener('change', () => {
      this.changeQuality(this.qualitySelect.value as QualitySetting);
    });

    this.rootElement = this.gameSettingsDiv;
  }
}
