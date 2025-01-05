import * as BABYLON from '@babylonjs/core';
import { PlayerColor } from '../../assets/colors';
import { MyCamera } from '../../camera';
import { PlayerEntity } from '../../entities/player';
import { getGameSettings } from '../../storage';
import { AbstractUI } from './../abstract-ui';
import { renderingCanvas } from './../ui-manager';
import gameRoot from '../../game-root';

export class LobbyUI extends AbstractUI {
  nicknameInput!: HTMLInputElement;
  playerColorsDivs!: NodeListOf<HTMLDivElement>;
  enterButton!: HTMLButtonElement;
  lobbyDiv!: HTMLDivElement;
  lobbyButtonDiv!: HTMLDivElement;

  open = true;
  lastCameraRadius: number;
  switchCameraOnClose = false;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'lobby', player);
    this.lastCameraRadius = (this.scene.activeCamera as MyCamera).radius || 6;
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
    };
    const camera = this.scene.activeCamera as MyCamera;
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

    const camera = this.scene.activeCamera as MyCamera;
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
  
  confirmLobby() {
    if (!this.isLobbyOpen()) return;
    if (this.player.status === 'in_chat') return;
  
    const nickname = this.nicknameInput.value.substring(0, 15);
    if (!nickname || !(this.nicknameInput.value.length > 3)) return;

    localStorage.setItem('color', this.player.color as PlayerColor);
    localStorage.setItem('nickname', nickname);

    (this.scene.activeCamera as MyCamera).useAutoRotationBehavior = false;
    this.player.changeNickname(nickname);
    this.closeLobby();
  }

  async bindUI() {
    await super.bindUI();

    this.nicknameInput = document.querySelector('.lobby .nickname-input') as HTMLInputElement;
    this.playerColorsDivs = document.querySelectorAll('.lobby .player-color > .colors > div') as NodeListOf<HTMLDivElement>;
    this.enterButton = document.querySelector('.lobby .enter') as HTMLButtonElement;
    this.lobbyDiv = document.querySelector('.lobby-wrapper') as HTMLDivElement;
    this.lobbyButtonDiv = document.querySelector('.ui-buttons .settings') as HTMLDivElement;

    this.lobbyDiv.style.display = this.open ? 'block' : 'none';
  
    const gameSettings = getGameSettings();
  
    this.nicknameInput.value = gameSettings.nickname;
  
    this.playerColorsDivs.forEach(div => {
      div.classList.toggle('selected', div.classList.contains(gameSettings.color));
      div.addEventListener('click', async () => {
        this.playerColorsDivs.forEach(x => x.classList.remove('selected'));
        div.classList.add('selected');
        await this.player.changeColor(div.classList[0] as PlayerColor);
      });
    });
  
    this.enterButton.addEventListener('click', () => {
      this.confirmLobby();
    });
  
    this.lobbyButtonDiv.addEventListener('click', () => this.openLobby());
    this.lobbyButtonDiv.style.display = this.open ? 'none' : 'block';
  
    // close lobby if player not a new player
    if (!gameSettings.newlyCreated) {
      this.confirmLobby();
    }
  }

  showOtherUIs(show: boolean) {
    gameRoot.uiManager?.timerUI.show(show);
    gameRoot.uiManager?.timeTableUI.show(show);
    gameRoot.uiManager?.gameSettingsUI.show(show);
    gameRoot.uiManager?.editorUI.show(show);
    gameRoot.uiManager?.performanceUI.show(show);
  }
}