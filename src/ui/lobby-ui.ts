import * as BABYLON from '@babylonjs/core';
import { PlayerColor } from '../assets/colors';
import { MyCamera } from '../camera';
import { getGameSettings } from '../storage';
import { renderingCanvas } from "./ui-manager";
import { AbstractUI } from './abstract-ui';
import { PlayerEntity } from '../entities/player';

export const nicknameInput = document.querySelector('.lobby .nickname-input') as HTMLInputElement;
export const playerColorsDivs = document.querySelectorAll('.lobby .player-color > .colors > div') as NodeListOf<HTMLDivElement>;
export const enterButton = document.querySelector('.lobby .enter') as HTMLButtonElement;
export const lobbyDiv = document.querySelector('.lobby-wrapper') as HTMLDivElement;
export const lobbyButtonDiv = document.querySelector('.ui-buttons .settings') as HTMLDivElement;

export class LobbyUI extends AbstractUI {
  open = true;
  lastCameraRadius: number;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, player);
    this.lastCameraRadius = (this.scene.activeCamera as MyCamera).radius || 6;
  }
  
  openLobby() {
    if (this.isLobbyOpen()) return;
    if (this.player.status === 'in_chat') return;

    lobbyDiv.style.display = 'block';
    lobbyButtonDiv.style.display = 'none';
    this.open = true;
    
    const camera = this.scene.activeCamera as MyCamera;
    camera.useAutoRotationBehavior = true;
    this.lastCameraRadius = camera.radius;
    camera.setMoveToTarget(camera.alpha + 0.01, camera.beta + 0.01, 3, 50);

    this.scene.sounds?.find(x => x.name === 'open-lobby')?.play();
    this.player.status = 'in_lobby';  
  }
  
  closeLobby() {
    if (!this.isLobbyOpen()) return;

    lobbyDiv.style.display = 'none';
    lobbyButtonDiv.style.display = 'block';
    this.open = false;

    const camera = this.scene.activeCamera as MyCamera;
    camera.useAutoRotationBehavior = false;
    
    const radius = this.lastCameraRadius > 0 ? this.lastCameraRadius : 6;
    camera.setMoveToTarget(camera.alpha + 0.01, camera.beta + 0.01, radius, 50);
    this.scene.sounds?.find(x => x.name === 'close-lobby')?.play();
    this.player.status = 'playing';
    
    renderingCanvas.focus();
  }
  
  isLobbyOpen() {
    return this.open;
  }
  
  confirmLobby() {
    if (!this.isLobbyOpen()) return;
    if (this.player.status === 'in_chat') return;
  
    const nickname = nicknameInput.value.substring(0, 15);
    if (!nickname || !(nicknameInput.value.length > 3)) return;

    localStorage.setItem('color', this.player.color as PlayerColor);
    localStorage.setItem('nickname', nickname);

    (this.scene.activeCamera as MyCamera).useAutoRotationBehavior = false;
    this.player.changeNickname(nickname);
    this.closeLobby();
  }

  bindUI(): void {
      lobbyDiv.style.display = this.open ? 'block' : 'none';
    
      const gameSettings = getGameSettings();
    
      nicknameInput.value = gameSettings.nickname;
    
      playerColorsDivs.forEach(div => {
        div.classList.toggle('selected', div.classList.contains(gameSettings.color));
        div.addEventListener('click', async () => {
          playerColorsDivs.forEach(x => x.classList.remove('selected'));
          div.classList.add('selected');
          await this.player.changeColor(div.classList[0] as PlayerColor);
        });
      });
    
      enterButton.addEventListener('click', () => {
        this.confirmLobby();
      });
    
      lobbyButtonDiv.addEventListener('click', () => this.openLobby());
      lobbyButtonDiv.style.display = this.open ? 'none' : 'block';
    
      // close lobby if player not a new player
      if (!gameSettings.newlyCreated) {
        this.confirmLobby();
      }
  }

  updateUI(): void {   
  }
}