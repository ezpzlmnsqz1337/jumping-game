import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';

export class AbstractUI {
  scene: BABYLON.Scene;
  player: PlayerEntity;
  gizmoManager?: BABYLON.GizmoManager;

  constructor(scene: BABYLON.Scene, player: PlayerEntity, gizmoManager?: BABYLON.GizmoManager) {
    this.scene = scene;
    this.player = player;
    this.gizmoManager = gizmoManager;
  }

  arrayToString(arr: number[]) {
    return `[ ${arr.map(x => x.toFixed(2)).join(', ')} ]`;
  }
  
  setInnerText(element: HTMLElement, text: string) {
    if (element.innerText === text) return;
    element.innerText = text;
  }

  bindUI(): void {}

  updateUI(data?: any): void {}
}