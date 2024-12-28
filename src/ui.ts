import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from "./entities/player";
import { formatTime, getCurrentTimerTimeStr, TimerEntity } from './timer';
import { TimeEntry } from './timer';

export const bindUI = (scene: BABYLON.Scene, player: PlayerEntity, timer: TimerEntity) => {
  const uiTimer = document.querySelector('.timer > .value') as HTMLDivElement;

  const uiPlayerInfo = {
    hSpeed: document.querySelector('.player-info > .horizontal-speed > .value') as HTMLDivElement,
    vSpeed: document.querySelector('.player-info > .vertical-speed > .value') as HTMLDivElement,
    moving: document.querySelector('.player-info > .moving > .value') as HTMLDivElement,
    jumping: document.querySelector('.player-info > .jumping > .value') as HTMLDivElement
  }

  scene.onBeforeRenderObservable.add(() => {
    updateHorizontalSpeed(player, uiPlayerInfo.hSpeed);
    updateVerticalSpeed(player, uiPlayerInfo.vSpeed);
    updateMoving(player, uiPlayerInfo.moving);
    updateJumping(player, uiPlayerInfo.jumping);
    updateTime(timer, uiTimer);
  });
};

const updateHorizontalSpeed = (player: PlayerEntity, htmlEl: HTMLDivElement) => {
  const { x, z } = player.physics.body.getLinearVelocity();
  const hSpeed = new BABYLON.Vector3(x, 0, z).length().toFixed(2);
  if (htmlEl.innerText === hSpeed) return;
  htmlEl.innerText = hSpeed;
}

const updateVerticalSpeed = (player: PlayerEntity, htmlEl: HTMLDivElement) => {
  const { y } = player.physics.body.getLinearVelocity();
  const vSpeed = new BABYLON.Vector3(0, y, 0).length().toFixed(2);
  if (htmlEl.innerText === vSpeed) return;
  htmlEl.innerText = vSpeed;
}

const updateMoving = (player: PlayerEntity, htmlEl: HTMLDivElement) => {
  htmlEl.innerText = player.moving ? 'Yes' : 'No';
  htmlEl.classList.toggle('yes', player.moving);
  htmlEl.classList.toggle('no', !player.moving);
}

const updateJumping = (player: PlayerEntity, htmlEl: HTMLDivElement) => {
  htmlEl.innerText = player.jumping ? 'Yes' : 'No';
  htmlEl.classList.toggle('yes', player.jumping);
  htmlEl.classList.toggle('no', !player.jumping);
}

const updateTime = (timer: TimerEntity, htmlEl: HTMLDivElement) => {
  if (htmlEl.innerText !== '00:00.000') {
    htmlEl.innerText = formatTime(new Date(0));
  }
  if (!timer.active) return;
  htmlEl.innerText = getCurrentTimerTimeStr();
}

export const updateTimes = (times: TimeEntry[]) => {
  if (times.length === 0) return;
  document.querySelector('.times-list > div')?.remove();  
  const timesList = document.querySelector('.times-list > ol');
  if (!timesList) return;
  timesList.innerHTML = ''
  times.forEach(time => {
    const timeElement = document.createElement('li');
    let checkpoints = 'No checkpoints!'
    if (time.checkpoints > 0) {
      checkpoints = `${time.checkpoints} checkpoint`
    }
    if (time.checkpoints > 1) {
      checkpoints += 's'
    }
    timeElement.innerText = `${time.timeStr} - ${checkpoints} - ${time.nickname} `;
    timesList.appendChild(timeElement);
  });
};