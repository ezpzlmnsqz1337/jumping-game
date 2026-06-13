export interface TimeEntry {
  nickname: string;
  timeStr: string;
  time: number;
  checkpoints: number;
}

export type RunState = 'idle' | 'armed' | 'running' | 'finished';

export class LevelTimer {
  active: boolean = false;
  startedAt: number = 0;
  finishedAt: number = 0;
  state: RunState = 'idle';

  armRun() {
    if (this.state === 'running') return false;
    this.active = false;
    this.startedAt = 0;
    this.finishedAt = 0;
    this.state = 'armed';
    return true;
  }

  startRun() {
    if (this.state !== 'armed') return false;
    this.active = true;
    this.startedAt = Date.now();
    this.finishedAt = 0;
    this.state = 'running';
    return true;
  }

  finishRun() {
    if (this.state !== 'running') return false;
    this.active = false;
    this.finishedAt = Date.now();
    this.state = 'finished';
    return true;
  }

  resetRun() {
    this.active = false;
    this.startedAt = 0;
    this.finishedAt = 0;
    this.state = 'idle';
    return true;
  }

  start() {
    return this.startRun();
  }

  reset() {
    return this.resetRun();
  }

  stop() {
    return this.finishRun();
  }

  isArmed() {
    return this.state === 'armed';
  }

  isRunning() {
    return this.state === 'running';
  }

  isFinished() {
    return this.state === 'finished';
  }

  getTimeAsString() {
    if (this.state === 'idle' || this.state === 'armed') return '00:00.000';
    if (this.finishedAt > 0)
      return LevelTimer.formatTime(new Date(this.finishedAt - this.startedAt));
    return LevelTimer.formatTime(new Date(Date.now() - this.startedAt));
  }

  getTime() {
    if (this.state === 'idle' || this.state === 'armed') return 0;
    if (this.finishedAt) return this.finishedAt - this.startedAt;
    return Date.now() - this.startedAt;
  }

  static formatTime(date: Date) {
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');

    return `${minutes}:${seconds}.${milliseconds}`;
  }
}
