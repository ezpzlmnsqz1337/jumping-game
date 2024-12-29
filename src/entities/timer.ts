export interface TimerEntity {
  active: boolean;
  startedAt: number;
  finishedAt: number | null;
}


export interface TimeEntry {
  nickname: string
  timeStr: string
  time: number
  checkpoints: number
}

let timer: TimerEntity = { active: false, startedAt: Date.now(), finishedAt: null };

export const createTimer = (): TimerEntity => {
  return timer;
}

export const startTimer = () => {
  timer.active = true;
  timer.startedAt = Date.now();
  timer.finishedAt = null;
}

export const resetTimer = () => {
  timer.active = false;
  timer.startedAt = Date.now();
  timer.finishedAt = null;
}

export const stopTimer = () => {
  timer.active = false;
  timer.finishedAt = Date.now();
}

export const isTimerActive = () => {
  return timer.active;
}

export const getCurrentTimerTimeStr = () => {
  if (!timer.active && !timer.finishedAt) return '00:00.000';
  if (timer.finishedAt) return formatTime(new Date(timer.finishedAt - timer.startedAt));
  return formatTime(new Date(Date.now() - timer.startedAt));
}

export const getCurrentTimerTime = () => {
  if (!timer.active && !timer.finishedAt) return 0;
  if (timer.finishedAt) return timer.finishedAt - timer.startedAt;
  return Date.now() - timer.startedAt;
}

export const formatTime = (date: Date) => {
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');

  return `${minutes}:${seconds}.${milliseconds}`;
}