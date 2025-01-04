import { LevelTimer } from "../timer";
import { AbstractUI } from "./abstract-ui";

export const uiTimerDiv = document.querySelector('.timer > div > .value') as HTMLDivElement;
export const uiCheckpointsDiv = document.querySelector('.checkpoints > .value') as HTMLDivElement;

export class TimerUI extends AbstractUI {
  updateTime() {
    const timer = this.player.level.timer as LevelTimer;
    if (uiTimerDiv.innerText === timer.getTimeAsString()) return
    uiTimerDiv.innerText = timer.getTimeAsString();
  }

  updateCheckpoints(noOfCheckpoints: number) {
    const value = `${noOfCheckpoints}`;
    if (uiCheckpointsDiv.innerText === value) return;
    uiCheckpointsDiv.innerText = `${value} checkpoint${noOfCheckpoints === 1 ? '' : 's'}`;
  }

  bindUI(): void {
    this.scene.onBeforeRenderObservable.add(() => this.updateUI());
  }

  updateUI(): void {
    this.updateTime();
    this.updateCheckpoints(this.player.checkpoints.length);
  }
}