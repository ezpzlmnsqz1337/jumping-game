import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../../entities/player-entity';
import { AbstractUI } from '../abstract-ui';

export class PlayerInfoUI extends AbstractUI {
  playerInfoDiv!: HTMLDivElement;
  hSpeedDiv!: HTMLSpanElement;
  vSpeedDiv!: HTMLSpanElement;
  movingBadge!: HTMLSpanElement;
  jumpingBadge!: HTMLSpanElement;
  fpsValueDiv!: HTMLSpanElement;

  private enabled = false;
  perfMonitor: BABYLON.PerformanceMonitor;
  fpsUpdateIntervalMs = 1000;
  lastFpsUpdate = 0;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'player-info', player);
    this.perfMonitor = new BABYLON.PerformanceMonitor();
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
    this.movingBadge.classList.toggle('active', this.player.moving);
  }

  protected updateJumping() {
    this.jumpingBadge.classList.toggle('active', this.player.jumping);
  }

  protected updateFps() {
    this.perfMonitor.sampleFrame();
    const now = performance.now();
    if (now - this.lastFpsUpdate >= this.fpsUpdateIntervalMs) {
      this.fpsValueDiv.innerText = this.perfMonitor.instantaneousFPS.toFixed(0);
      this.lastFpsUpdate = now;
    }
  }

  async bindUI() {
    await super.bindUI();
    this.playerInfoDiv = document.querySelector('.player-info') as HTMLDivElement;
    this.hSpeedDiv = document.querySelector('.horizontal-speed') as HTMLSpanElement;
    this.vSpeedDiv = document.querySelector('.vertical-speed') as HTMLSpanElement;
    this.movingBadge = document.querySelector('.moving-badge') as HTMLSpanElement;
    this.jumpingBadge = document.querySelector('.jumping-badge') as HTMLSpanElement;
    this.fpsValueDiv = document.querySelector('.fps-value') as HTMLSpanElement;

    this.perfMonitor.enable();
    this.scene.onBeforeRenderObservable.add(() => this.updateUI());
    this.rootElement = this.playerInfoDiv;
    this.show(false);
  }

  show(show: boolean): void {
    if (!this.rootElement) return;
    this.rootElement.style.display = show ? 'flex' : 'none';
  }

  toggle(): void {
    this.enabled = !this.enabled;
    this.show(this.enabled);
  }

  updateUI(): void {
    this.updateHorizontalSpeed();
    this.updateVerticalSpeed();
    this.updateMoving();
    this.updateJumping();
    this.updateFps();
  }
}
