import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../../entities/player-entity';
import { AbstractUI } from './../abstract-ui';


export class PerformanceUI extends AbstractUI {
  performanceDiv!: HTMLDivElement;
  fpsCounerDiv!: HTMLDivElement;

  fpsUpdateIntervalMs = 1000; // Update every second
  lastUpdateTime = 0;
  perfMonitor: BABYLON.PerformanceMonitor;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'performance', player);
    this.perfMonitor = new BABYLON.PerformanceMonitor();
  }

  async bindUI() {
    await super.bindUI();

    this.performanceDiv = document.querySelector('.performance') as HTMLDivElement;
    this.fpsCounerDiv = document.querySelector('.performance .fps .value') as HTMLDivElement;

    this.perfMonitor.enable();
    this.scene.onBeforeRenderObservable.add(() => this.updateUI());
    this.rootElement = this.performanceDiv;
  }

  updateUI(): void {
    this.perfMonitor.sampleFrame();
    const currentTime = performance.now();
    if (currentTime - this.lastUpdateTime >= this.fpsUpdateIntervalMs) {
      this.fpsCounerDiv.innerText = this.perfMonitor.instantaneousFPS.toFixed(0);
      this.lastUpdateTime = currentTime;
    }
  }
}