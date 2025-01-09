import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../../entities/player-entity';
import { TimeEntry } from '../../level-timer';
import { AbstractUI } from './../abstract-ui';

export class TimeTableUI extends AbstractUI {
  timesListDiv!: HTMLDivElement;

  noOfTimes: number = 0;
  
  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'time-table', player);
  }

  async bindUI() {
    await super.bindUI();
    this.timesListDiv = document.querySelector('.time-table') as HTMLDivElement;
    this.rootElement = this.timesListDiv;
  }

  updateUI(times: Map<string, TimeEntry>): void {
    if (times.size === 0 || this.noOfTimes === times.size) return;
    this.noOfTimes = times.size;
    
    if (!this.timesListDiv) return;
    this.timesListDiv.innerHTML = ''
    const timesListOl = document.createElement('ol');
    times.forEach(time => {
      const timesListLi = document.createElement('li');
  
      timesListLi.innerText = `${time.timeStr} - ${time.nickname} (CP: ${time.checkpoints}) `;
      timesListOl.appendChild(timesListLi);
      this.timesListDiv.appendChild(timesListOl);
    });
  }
}