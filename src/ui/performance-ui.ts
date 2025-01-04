import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { AbstractUI } from "./abstract-ui";

export const fpsCounerDiv = document.querySelector('.performance .fps .value') as HTMLDivElement;

export class PerformanceUI extends AbstractUI {
  fpsUpdateIntervalMs = 1000; // Update every second
  lastUpdateTime = 0;
  perfMonitor: BABYLON.PerformanceMonitor;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, player);
    this.perfMonitor = new BABYLON.PerformanceMonitor();
  }

  bindUI(): void {
    this.perfMonitor.enable();
    this.scene.onBeforeRenderObservable.add(() => this.updateUI());
  }

  updateUI(): void {
    this.perfMonitor.sampleFrame();
    const currentTime = performance.now();
    if (currentTime - this.lastUpdateTime >= this.fpsUpdateIntervalMs) {
      fpsCounerDiv.innerText = this.perfMonitor.instantaneousFPS.toFixed(0);
      this.lastUpdateTime = currentTime;
    }
  }
}