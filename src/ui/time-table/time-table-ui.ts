import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../../entities/player-entity';
import { TimeEntry } from '../../level-timer';
import type { ReplayMetadata } from '../../services/demo-service';
import { AbstractUI } from './../abstract-ui';

export class TimeTableUI extends AbstractUI {
  timesListDiv!: HTMLDivElement;
  replayMetadataDiv!: HTMLDivElement;

  noOfTimes: number = 0;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'time-table', player);
  }

  async bindUI() {
    await super.bindUI();
    this.timesListDiv = document.querySelector('.time-table') as HTMLDivElement;

    const existingMetadata = this.timesListDiv.querySelector(
      '.replay-metadata'
    ) as HTMLDivElement | null;

    if (existingMetadata) {
      this.replayMetadataDiv = existingMetadata;
    } else {
      this.replayMetadataDiv = document.createElement('div');
      this.replayMetadataDiv.className = 'replay-metadata';
      this.replayMetadataDiv.style.display = 'none';
      this.timesListDiv.appendChild(this.replayMetadataDiv);
    }

    this.rootElement = this.timesListDiv;
  }

  updateReplayMetadata(metadata: ReplayMetadata): void {
    if (!this.replayMetadataDiv) return;

    const sourceLabel =
      metadata.source === 'local'
        ? 'Local record'
        : metadata.source === 'bundled'
          ? 'Bundled map record'
          : 'Migrated legacy record';

    const details = [
      `Ghost: ${metadata.playerName}`,
      `Time: ${metadata.timeStr}`,
      `Map: ${metadata.mapName}`,
      `Date: ${new Date(metadata.completedAt).toLocaleDateString()}`,
      `Source: ${sourceLabel}`,
      `Replay v${metadata.replayVersion}`,
    ].join(' | ');

    this.replayMetadataDiv.innerText = details;
    this.replayMetadataDiv.style.display = 'block';
  }

  updateUI(times: Map<string, TimeEntry>): void {
    if (times.size === 0 || this.noOfTimes === times.size) return;
    this.noOfTimes = times.size;

    if (!this.timesListDiv) return;
    const previousList = this.timesListDiv.querySelector('ol');
    if (previousList) {
      previousList.remove();
    }

    const timesListOl = document.createElement('ol');
    times.forEach(time => {
      const timesListLi = document.createElement('li');

      timesListLi.innerText = `${time.timeStr} - ${time.nickname} (CP: ${time.checkpoints}) `;
      timesListOl.appendChild(timesListLi);
    });

    if (this.replayMetadataDiv && this.replayMetadataDiv.parentElement === this.timesListDiv) {
      this.timesListDiv.insertBefore(timesListOl, this.replayMetadataDiv);
      return;
    }

    this.timesListDiv.appendChild(timesListOl);
  }
}
