export interface TimerEntity {
  active: boolean;
  startedAt: number;
}

let timer = { active: false, startedAt: Date.now() };

export const createTimer = (): TimerEntity => {
  return timer;
}

export const startTimer = () => {
  timer.active = true;
  timer.startedAt = Date.now();
}

export const resetTimer = () => {
  timer.active = false;
  timer.startedAt = Date.now();
}

export const stopTimer = () => {
  timer.active = false;
  timer.startedAt = Date.now();
}

export const formatTime = (date: Date) => {
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');

  return `${minutes}:${seconds}.${milliseconds}`;
}