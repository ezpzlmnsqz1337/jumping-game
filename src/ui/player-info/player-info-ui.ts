import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../../entities/player-entity';
import { AbstractUI } from '../abstract-ui';

export class PlayerInfoUI extends AbstractUI {
  playerInfoDiv!: HTMLDivElement;
  hSpeedDiv!: HTMLDivElement;
  vSpeedDiv!: HTMLDivElement;
  movingDiv!: HTMLDivElement;
  jumpingDiv!: HTMLDivElement;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'player-info', player);
  }

  protected updateHorizontalSpeed() {
    const { x, z } = this.player.physics.body.getLinearVelocity();
    const hSpeed = new BABYLON.Vector3(x, 0, z).length().toFixed(2);
    if (this.hSpeedDiv.innerText === hSpeed) return;
    this.hSpeedDiv.innerText = hSpeed;
  }

  protected updateVerticalSpeed() {
    const { y } = this.player.physics.body.getLinearVelocity();
    const vSpeed = new BABYLON.Vector3(0, y, 0).length().toFixed(2);
    if (this.vSpeedDiv.innerText === vSpeed) return;
    this.vSpeedDiv.innerText = vSpeed;
  }

  protected updateMoving() {
    const newValue = this.player.moving ? 'Yes' : 'No';
    if (this.movingDiv.innerText === newValue) return;
    this.movingDiv.innerText = this.player.moving ? 'Yes' : 'No';
    this.movingDiv.classList.toggle('yes', this.player.moving);
    this.movingDiv.classList.toggle('no', !this.player.moving);
  }

  protected updateJumping() {
    const newValue = this.player.jumping ? 'Yes' : 'No';
    if (this.movingDiv.innerText === newValue) return;
    this.jumpingDiv.innerText = this.player.jumping ? 'Yes' : 'No';
    this.jumpingDiv.classList.toggle('yes', this.player.jumping);
    this.jumpingDiv.classList.toggle('no', !this.player.jumping);
  }

  async bindUI() {
    await super.bindUI();
    this.playerInfoDiv = document.querySelector('.player-info') as HTMLDivElement
    this.hSpeedDiv = document.querySelector('.player-info > .horizontal-speed > .value') as HTMLDivElement
    this.vSpeedDiv = document.querySelector('.player-info > .vertical-speed > .value') as HTMLDivElement
    this.movingDiv = document.querySelector('.player-info > .moving > .value') as HTMLDivElement
    this.jumpingDiv = document.querySelector('.player-info > .jumping > .value') as HTMLDivElement

    this.scene.onBeforeRenderObservable.add(() => this.updateUI());
    this.rootElement = this.playerInfoDiv;
  }

  show(show: boolean): void {
    if (!this.rootElement) return;
    this.rootElement.style.display = show ? 'flex' : 'none';
  }

  updateUI(): void {
    this.updateHorizontalSpeed();
    this.updateVerticalSpeed();
    this.updateMoving();
    this.updateJumping();
  }
}