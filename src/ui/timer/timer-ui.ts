import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../../entities/player-entity';
import { LevelTimer } from '../../level-timer';
import gameRoot from '../../game-root';
import { AbstractUI } from './../abstract-ui';

export class TimerUI extends AbstractUI {
  uiTimerDiv!: HTMLDivElement;
  uiCheckpointsDiv!: HTMLDivElement;
  runStatusDiv!: HTMLDivElement;
  connectionStatusDiv!: HTMLDivElement;

  runStatusTimeout: ReturnType<typeof setTimeout> | null = null;

  connectionStatusTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'timer', player);
  }

  updateTime() {
    const timer = this.player.level.timer as LevelTimer;
    if (this.uiTimerDiv.innerText === timer.getTimeAsString()) return;
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
    this.runStatusDiv = document.querySelector('.timer > div > .run-status') as HTMLDivElement;
    this.connectionStatusDiv = document.querySelector(
      '.timer > div > .connection-status'
    ) as HTMLDivElement;

    this.scene.onBeforeRenderObservable.add(() => this.updateUI());
    this.rootElement = document.querySelector('.timer') as HTMLDivElement;
  }

  showRunStatus(status: 'ready' | 'running' | 'finished' | 'reset', detail = '') {
    if (!this.runStatusDiv) return;
    const text =
      status === 'ready'
        ? 'Run armed - leave start trigger to begin'
        : status === 'running'
          ? 'Run started'
          : status === 'finished'
          ? `Run finished${detail ? `: ${detail}` : ''}`
            : `Run reset${detail ? ` (${detail})` : ''}`;

    this.runStatusDiv.innerText = text;
    this.runStatusDiv.className = `run-status state-${status}`;
    this.runStatusDiv.style.display = 'block';

    // Sound mapping
    if (status === 'ready') {
      this.scene.sounds?.find(x => x.name === 'key-press')?.play();
    } else if (status === 'running') {
      this.scene.sounds?.find(x => x.name === 'key-press')?.play();
    } else if (status === 'reset') {
      if (detail === 'teleport') {
        this.scene.sounds?.find(x => x.name === 'water-splash1')?.play();
      } else {
        this.scene.sounds?.find(x => x.name === 'water-splash2')?.play();
      }
    }

    if (this.runStatusTimeout) clearTimeout(this.runStatusTimeout);
    this.runStatusTimeout = setTimeout(() => {
      if (!this.runStatusDiv) return;
      this.runStatusDiv.style.display = 'none';
    }, 4000);
  }

  showConnectionStatus(status: 'online' | 'offline', detail = '') {
    if (!this.connectionStatusDiv) return;
    
    // Only play sound if status actually changes to prevent spam
    const currentClass = this.connectionStatusDiv.className;
    const isNewStatus = !currentClass.includes(`state-${status}`);
    
    if (isNewStatus) {
      if (status === 'online') {
        this.scene.sounds?.find(x => x.name === 'open-lobby')?.play();
      } else {
        this.scene.sounds?.find(x => x.name === 'close-lobby')?.play();
      }
    }

    const text =
      status === 'online'
        ? `Multiplayer connected${detail ? ` (${detail})` : ''}`
        : `Multiplayer disconnected${detail ? ` (${detail})` : ''}`;

    this.connectionStatusDiv.innerText = text;
    this.connectionStatusDiv.className = `connection-status state-${status}`;
    this.connectionStatusDiv.style.display = 'block';

    if (this.connectionStatusTimeout) clearTimeout(this.connectionStatusTimeout);
    
    // Hide 'online' status after 4 seconds to reduce UI clutter. 
    // Keep 'offline' visible so player knows they are disconnected.
    if (status === 'online') {
      this.connectionStatusTimeout = setTimeout(() => {
        if (!this.connectionStatusDiv) return;
        this.connectionStatusDiv.style.display = 'none';
      }, 4000);
    }
  }

  updateUI(): void {
    this.updateTime();
    this.updateCheckpoints(this.player.checkpoints.length);

    const hasMultiplayer = Boolean(gameRoot.multiplayer);
    if (!hasMultiplayer) {
      if (this.connectionStatusDiv) {
        this.connectionStatusDiv.style.display = 'none';
      }
      return;
    }

    const mpOnline = Boolean(gameRoot.multiplayer?.room);
    if (!mpOnline && this.connectionStatusDiv?.style.display === 'none') {
      this.showConnectionStatus('offline', 'reconnecting');
    }
  }

  show(show: boolean) {
    if (!this.rootElement) return;
    this.rootElement.style.display = show ? 'flex' : 'none';
  }
}
