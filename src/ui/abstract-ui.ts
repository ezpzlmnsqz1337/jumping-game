import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';

export class AbstractUI {
  scene: BABYLON.Scene;
  player: PlayerEntity;
  name: string;
  rootElement!: HTMLElement;

  constructor(scene: BABYLON.Scene, name: string, player: PlayerEntity) {
    this.scene = scene;
    this.player = player;
    this.name = name;
  }

  loadCss() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `assets/ui/${this.name}/${this.name}.css`;
    document.head.appendChild(link);
  }

  async loadHtml() {
    const response = await fetch(`assets/ui/${this.name}/${this.name}.html`, {
      method: 'GET'
    });
    document.body.insertAdjacentHTML('beforeend', await response.text());
  }

  arrayToString(arr: number[]) {
    return `[ ${arr.map(x => x.toFixed(2)).join(', ')} ]`;
  }
  
  setInnerText(element: HTMLElement, text: string) {
    if (element.innerText === text) return;
    element.innerText = text;
  }

  async bindUI() {
    this.loadCss();
    await this.loadHtml();
  }

  updateUI(data?: any) {}

  show(show: boolean) {
    if (!this.rootElement) return;
    this.rootElement.style.display = show ? 'block' : 'none';
  }
}