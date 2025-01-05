import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../../entities/player';
import { LevelTimer } from '../../timer';
import { AbstractUI } from './../abstract-ui';

export class TimerUI extends AbstractUI {
  uiTimerDiv!: HTMLDivElement;
  uiCheckpointsDiv!: HTMLDivElement;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'timer', player);
  }

  updateTime() {
    const timer = this.player.level.timer as LevelTimer;
    if (this.uiTimerDiv.innerText === timer.getTimeAsString()) return
    this.uiTimerDiv.innerText = timer.getTimeAsString();
  }

  updateCheckpoints(noOfCheckpoints: number) {
    const value = `${noOfCheckpoints}`;
    if (this.uiCheckpointsDiv.innerText === value) return;
    this.uiCheckpointsDiv.innerText = `${value} checkpoint${noOfCheckpoints === 1 ? '' : 's'}`;
  }

  async bindUI() {
    await super.bindUI();
    this.uiTimerDiv = document.querySelector('.timer > div > .value') as HTMLDivElement;
    this.uiCheckpointsDiv = document.querySelector('.checkpoints > .value') as HTMLDivElement;

    this.scene.onBeforeRenderObservable.add(() => this.updateUI());
    this.rootElement = document.querySelector('.timer') as HTMLDivElement;
  }

  updateUI(): void {
    this.updateTime();
    this.updateCheckpoints(this.player.checkpoints.length);
  }

  show(show: boolean) {
    if (!this.rootElement) return;
    this.rootElement.style.display = show ? 'flex' : 'none';
  }
}