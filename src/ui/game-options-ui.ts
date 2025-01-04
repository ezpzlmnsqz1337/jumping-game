import { MyCamera, MyFollowCamera } from "../camera";
import gameRoot from "../game-root";
import { AbstractUI } from "./abstract-ui";
import { renderingCanvas } from "./ui-manager";

export const automaticCameraCheckBox = document.querySelector('.automatic-camera-enabled') as HTMLInputElement;
export const followCameraCheckBox = document.querySelector('.follow-camera-enabled') as HTMLInputElement;
export const collissionsCheckBox = document.querySelector('.collissions-enabled') as HTMLInputElement;

export class GameOptionsUI extends AbstractUI {
  followCameraEnabled = false;

  toggleFollowCamera() {
    const arcRotateCamera = this.scene.getCameraByName('mainArcRotateCamera');
    const followCamera = this.scene.getCameraByName('followCamera');

    if (this.followCameraEnabled) {
      followCamera?.storeState();
      this.scene.activeCamera = arcRotateCamera;
      arcRotateCamera?.restoreState();
    } else {
      arcRotateCamera?.storeState();
      this.scene.activeCamera = followCamera;
      followCamera?.restoreState();
    }

    this.followCameraEnabled = !this.followCameraEnabled;
    followCameraCheckBox.checked = this.followCameraEnabled;
    renderingCanvas.focus();
  }

  bindUI() {
    const camera = this.scene.activeCamera as MyCamera | MyFollowCamera;

    automaticCameraCheckBox.setAttribute('checked', camera.automaticCameraEnabled ? 'true' : 'false');

    automaticCameraCheckBox.addEventListener('click', () => {
      (this.scene.cameras as MyCamera[] | MyFollowCamera[]).forEach(camera => {
        camera.automaticCameraEnabled = !camera.automaticCameraEnabled;
      });
      renderingCanvas.focus();
    });

    followCameraCheckBox.addEventListener('click', () => {
      this.toggleFollowCamera();
    });

    collissionsCheckBox.checked = this.player.collissionEnabled;

    collissionsCheckBox.addEventListener('click', () => {
      gameRoot.multiplayer?.toggleCollissions();
      collissionsCheckBox.checked = this.player.collissionEnabled;
    });
  }
}