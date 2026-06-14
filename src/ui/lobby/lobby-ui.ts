import * as BABYLON from '@babylonjs/core';
import { PlayerColor } from '../../assets/colors';
import { PlayerEntity } from '../../entities/player-entity';
import { AbstractUI } from './../abstract-ui';
import { renderingCanvas } from './../ui-manager';
import gameRoot from '../../game-root';
import { MyArcRotateCamera } from '../../cameras/arc-rotate-camera';
import { GameStorage } from '../../game-storage';
import { createTemplateLevelDocument } from '../../game-level';
import { isLevelDocument } from '../../level-document';

const LevelsKey = 'level-manager-selected-level';

export class LobbyUI extends AbstractUI {
  // Play view
  nicknameInput!: HTMLInputElement;
  nicknameErrorText!: HTMLSpanElement;
  playerColorsDivs!: NodeListOf<HTMLDivElement>;
  playButton!: HTMLButtonElement;
  levelListDiv!: HTMLDivElement;
  selectedLevelName = 'level1';

  // Editor tools (play view, dev-only)
  newLevelNameInput!: HTMLInputElement;
  createLevelButton!: HTMLButtonElement;
  importLevelButton!: HTMLButtonElement;
  importLevelInput!: HTMLInputElement;
  storedLevelListDiv!: HTMLDivElement;

  lobbyDiv!: HTMLDivElement;
  lobbyButtonDiv!: HTMLDivElement;

  open = true;
  lastCameraRadius: number;
  switchCameraOnClose = false;

  private isDev = import.meta.env.DEV;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'lobby', player);
    this.lastCameraRadius = (this.scene.activeCamera as MyArcRotateCamera).radius || 6;
  }

  openLobby() {
    if (this.isLobbyOpen()) return;
    if (this.player.status === 'in_chat') return;

    this.lobbyDiv.style.display = 'block';
    this.lobbyButtonDiv.style.display = 'none';
    this.open = true;

    if (this.scene.activeCamera!.name === 'followCamera') {
      gameRoot.uiManager?.gameSettingsUI.toggleFollowCamera();
      this.switchCameraOnClose = true;
    }
    const camera = this.scene.activeCamera as MyArcRotateCamera;
    camera.useAutoRotationBehavior = true;
    this.lastCameraRadius = camera.radius;
    camera.setMoveToTarget(camera.alpha + 0.01, camera.beta + 0.01, 3, 50);

    this.scene.sounds?.find(x => x.name === 'open-lobby')?.play();
    this.player.status = 'in_lobby';
    this.showOtherUIs(false);
  }

  closeLobby() {
    if (!this.isLobbyOpen()) return;

    this.lobbyDiv.style.display = 'none';
    this.lobbyButtonDiv.style.display = 'block';
    this.open = false;

    const camera = this.scene.activeCamera as MyArcRotateCamera;
    camera.useAutoRotationBehavior = false;

    const radius = this.lastCameraRadius > 0 ? this.lastCameraRadius : 6;
    camera.setMoveToTarget(camera.alpha + 0.01, camera.beta + 0.01, radius, 50);
    this.scene.sounds?.find(x => x.name === 'close-lobby')?.play();
    this.player.status = 'playing';
    this.showOtherUIs(true);

    if (this.switchCameraOnClose) {
      this.switchCameraOnClose = false;
      gameRoot.uiManager?.gameSettingsUI.toggleFollowCamera();
    }
    renderingCanvas.focus();
  }

  isLobbyOpen() {
    return this.open;
  }

  private async refreshLevelList() {
    if (this.isDev) {
      this.refreshClientLevelList();
    } else {
      this.refreshCurrentMapInfo();
    }
  }

  private refreshCurrentMapInfo() {
    const mapNameEl = document.querySelector('.map-info .map-name');
    const mapMetaEl = document.querySelector('.map-info .map-meta');
    if (mapNameEl && gameRoot.level) {
      mapNameEl.textContent = gameRoot.level.name;
    }
    if (mapMetaEl && gameRoot.level) {
      mapMetaEl.textContent = `${gameRoot.level.walls.length} walls`;
    }
  }

  private refreshClientLevelList() {
    const levels = GameStorage.listLevels();
    if (levels.length === 0) {
      this.levelListDiv.innerHTML = '<div class="no-levels">No levels found.</div>';
      return;
    }

    levels.forEach(level => {
      const entry = document.createElement('div');
      entry.className = `level-entry${level.name === this.selectedLevelName ? ' selected' : ''}`;
      entry.dataset.levelName = level.name;

      const source =
        level.triggers.length === 0 && level.walls.length <= 1 ? 'template' : 'imported';

      entry.innerHTML = `
        <div class="level-info">
          <div class="level-name">${level.name}</div>
          <div class="level-meta">${level.walls.length} walls &middot; ${level.startTriggers.length + level.endTriggers.length} triggers</div>
        </div>
        <div class="level-source-badge">${source}</div>
      `;

      entry.addEventListener('click', () => {
        this.levelListDiv
          .querySelectorAll('.level-entry')
          .forEach(e => e.classList.remove('selected'));
        entry.classList.add('selected');
        this.selectedLevelName = level.name;
      });

      this.levelListDiv.appendChild(entry);
    });
  }

  private refreshStoredLevels() {
    if (!this.storedLevelListDiv) return;

    const levels = GameStorage.listLevels();
    this.storedLevelListDiv.innerHTML = '';

    if (levels.length === 0) {
      this.storedLevelListDiv.innerHTML = '<div class="no-levels">No saved levels yet.</div>';
      return;
    }

    levels.forEach(level => {
      const entry = document.createElement('div');
      entry.className = 'stored-level-entry';
      entry.innerHTML = `
        <span class="sl-name">${level.name}</span>
        <span class="sl-meta">${level.walls.length} walls</span>
        <button class="export-level-btn" title="Export as JSON">Export</button>
        <button class="delete-level-btn" title="Delete level">Delete</button>
      `;

      entry.querySelector('.export-level-btn')?.addEventListener('click', () => {
        this.exportLevel(level.name);
      });
      entry.querySelector('.delete-level-btn')?.addEventListener('click', () => {
        GameStorage.deleteLevel(level.name);
        this.refreshStoredLevels();
        this.refreshLevelList();
      });

      this.storedLevelListDiv.appendChild(entry);
    });
  }

  private exportLevel(name: string) {
    const doc = GameStorage.getLevel(name);
    if (!doc) return;
    const payload = JSON.stringify(doc, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  confirmPlay() {
    if (this.player.status === 'in_chat') return;

    const nickname = this.nicknameInput.value.substring(0, 15);
    if (!nickname || this.nicknameInput.value.length === 0) {
      this.nicknameInput.classList.add('invalid');
      this.nicknameInput.focus();
      this.nicknameErrorText.style.display = 'block';
      return;
    }

    this.nicknameErrorText.style.display = 'none';
    this.nicknameInput.classList.remove('invalid');

    localStorage.setItem('color', this.player.color as PlayerColor);
    localStorage.setItem('nickname', nickname);
    this.player.changeNickname(nickname);

    if (this.isDev && this.selectedLevelName !== gameRoot.level?.name) {
      localStorage.setItem(LevelsKey, this.selectedLevelName);
      localStorage.removeItem('mp-server-address');
      localStorage.removeItem('mp-room-id');
      window.location.reload();
      return;
    }

    (this.scene.activeCamera as MyArcRotateCamera).useAutoRotationBehavior = false;
    this.closeLobby();
  }

  async bindUI() {
    await super.bindUI();

    this.lobbyDiv = document.querySelector('.lobby-wrapper') as HTMLDivElement;
    this.lobbyButtonDiv = document.querySelector('.ui-buttons .settings') as HTMLDivElement;

    this.lobbyDiv.classList.toggle('is-dev', this.isDev);
    this.lobbyDiv.style.display = this.open ? 'block' : 'none';
    this.showOtherUIs(!this.open);

    const gameSettings = GameStorage.getGameSettings();

    // Player setup
    this.nicknameInput = document.querySelector('.nickname-input') as HTMLInputElement;
    this.nicknameErrorText = document.querySelector('.lobby .error') as HTMLSpanElement;
    this.playerColorsDivs = document.querySelectorAll(
      '.colors > div'
    ) as NodeListOf<HTMLDivElement>;
    this.playButton = document.querySelector('.play-btn') as HTMLButtonElement;

    // Play view
    this.levelListDiv = document.querySelector('.level-list') as HTMLDivElement;

    // Editor tools (dev-only)
    this.newLevelNameInput = document.querySelector('.new-level-name') as HTMLInputElement;
    this.createLevelButton = document.querySelector('.create-level-btn') as HTMLButtonElement;
    this.importLevelButton = document.querySelector('.import-level-btn') as HTMLButtonElement;
    this.importLevelInput = document.querySelector('.import-level-input') as HTMLInputElement;
    this.storedLevelListDiv = document.querySelector('.stored-level-list') as HTMLDivElement;

    // Load selected level preference
    this.selectedLevelName = localStorage.getItem(LevelsKey) || gameRoot.level?.name || 'level1';

    // Nickname
    this.nicknameInput.value = gameSettings.nickname;

    // Color
    this.playerColorsDivs.forEach(div => {
      div.classList.toggle('selected', div.classList.contains(gameSettings.color));
      div.addEventListener('click', async () => {
        this.playerColorsDivs.forEach(x => x.classList.remove('selected'));
        div.classList.add('selected');
        await this.player.changeColor(div.classList[0] as PlayerColor);
      });
    });

    // Play button
    this.playButton.addEventListener('click', () => {
      this.confirmPlay();
    });

    // Level list
    await this.refreshLevelList();

    // Editor - create level
    this.createLevelButton.addEventListener('click', () => {
      const name = this.newLevelNameInput.value.trim() || 'My Custom Level';
      const doc = createTemplateLevelDocument(name);
      GameStorage.saveLevelDocument(doc);
      localStorage.setItem(LevelsKey, name);
      localStorage.removeItem('mp-server-address');
      localStorage.removeItem('mp-room-id');
      window.location.reload();
    });

    // Editor - import JSON
    this.importLevelButton.addEventListener('click', () => {
      this.importLevelInput.click();
    });
    this.importLevelInput.addEventListener('change', async () => {
      const file = this.importLevelInput.files?.[0];
      if (!file) return;
      try {
        const fileContent = await file.text();
        const parsed = JSON.parse(fileContent) as unknown;
        if (!isLevelDocument(parsed)) return;
        GameStorage.saveLevelDocument(parsed);
        this.refreshStoredLevels();
        this.refreshLevelList();
      } catch {
        return;
      }
    });

    // Editor - stored levels
    this.refreshStoredLevels();

    // Settings button
    this.lobbyButtonDiv.addEventListener('click', () => this.openLobby());
    this.lobbyButtonDiv.style.display = this.open ? 'none' : 'block';
  }

  showOtherUIs(show: boolean) {
    gameRoot.uiManager?.timerUI.show(show);
    gameRoot.uiManager?.timeTableUI.show(show);
    gameRoot.uiManager?.gameSettingsUI.show(show);
    gameRoot.uiManager?.editorUI.show(show);
  }
}
