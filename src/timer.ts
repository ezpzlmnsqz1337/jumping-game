export interface TimeEntry {
  nickname: string
  timeStr: string
  time: number
  checkpoints: number
}

export class LevelTimer {
  active: boolean = false;
  startedAt: number = 0;
  finishedAt: number = 0;

  start() {
    this.active = true;
    this.startedAt = Date.now();
    this.finishedAt = 0;
  }

  reset() {
    this.active = false;
    this.startedAt = 0;
    this.finishedAt = 0;
  }

  stop() {
    this.active = false;
    this.finishedAt = Date.now();
  }

  getTimeAsString() {
    if (!this.active && !this.finishedAt) return '00:00.000';
    if (this.finishedAt > 0) return LevelTimer.formatTime(new Date(this.finishedAt - this.startedAt));
    return LevelTimer.formatTime(new Date(Date.now() - this.startedAt));
  }

  getTime() {
    if (!this.active && !this.finishedAt) return 0;
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