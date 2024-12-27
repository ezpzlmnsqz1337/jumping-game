import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from "./entities/player";

export const bindUI = (scene: BABYLON.Scene, player: PlayerEntity) => {
  const uiPlayerInfo = {
    speed: document.querySelector('.player-info > .speed > .value') as HTMLDivElement,
    moving: document.querySelector('.player-info > .moving > .value') as HTMLDivElement,
    jumping: document.querySelector('.player-info > .jumping > .value') as HTMLDivElement
  }

  scene.onBeforeRenderObservable.add(() => {
    updateSpeed(player, uiPlayerInfo.speed);
    updateMoving(player, uiPlayerInfo.moving);
    updateJumping(player, uiPlayerInfo.jumping);
  });
};

const updateSpeed = (player: PlayerEntity, htmlEl: HTMLDivElement) => {
  const speed = player.physics.body.getLinearVelocity().length().toFixed(2);
  if(htmlEl.innerText === speed) return;
  htmlEl.innerText = speed;
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