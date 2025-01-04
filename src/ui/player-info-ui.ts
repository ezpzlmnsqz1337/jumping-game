import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { AbstractUI } from './abstract-ui';

export const hSpeed = document.querySelector('.player-info > .horizontal-speed > .value') as HTMLDivElement
export const vSpeed = document.querySelector('.player-info > .vertical-speed > .value') as HTMLDivElement
export const moving = document.querySelector('.player-info > .moving > .value') as HTMLDivElement
export const jumping = document.querySelector('.player-info > .jumping > .value') as HTMLDivElement

export class PlayerInfoUI extends AbstractUI {

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, player);
    this.player = player;
  }

  protected updateHorizontalSpeed(htmlEl: HTMLDivElement) {
    const { x, z } = this.player.physics.body.getLinearVelocity();
    const hSpeed = new BABYLON.Vector3(x, 0, z).length().toFixed(2);
    if (htmlEl.innerText === hSpeed) return;
    htmlEl.innerText = hSpeed;
  }

  protected updateVerticalSpeed(htmlEl: HTMLDivElement) {
    const { y } = this.player.physics.body.getLinearVelocity();
    const vSpeed = new BABYLON.Vector3(0, y, 0).length().toFixed(2);
    if (htmlEl.innerText === vSpeed) return;
    htmlEl.innerText = vSpeed;
  }

  protected updateMoving(htmlEl: HTMLDivElement) {
    htmlEl.innerText = this.player.moving ? 'Yes' : 'No';
    htmlEl.classList.toggle('yes', this.player.moving);
    htmlEl.classList.toggle('no', !this.player.moving);
  }

  protected updateJumping(htmlEl: HTMLDivElement) {
    htmlEl.innerText = this.player.jumping ? 'Yes' : 'No';
    htmlEl.classList.toggle('yes', this.player.jumping);
    htmlEl.classList.toggle('no', !this.player.jumping);
  }

  bindUI() : void {
    this.scene.onBeforeRenderObservable.add(() => this.updateUI());
  }

  updateUI(): void {
    this.updateHorizontalSpeed(hSpeed);
    this.updateVerticalSpeed(vSpeed);
    this.updateMoving(moving);
    this.updateJumping(jumping);      
  }
}