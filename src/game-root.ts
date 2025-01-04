import * as BABYLON from '@babylonjs/core';
import { GameControls } from './controls';
import { PlayerEntity } from './entities/player';
import { GameLevel } from './game-level';
import { MultiplayerSession } from './multiplayer-session';
import { GameSettings, getGameSettings } from './storage';
import { UIManager } from './ui/ui-manager';

export class GameRoot {
  activeScene: BABYLON.Nullable<BABYLON.Scene> = null;
  player: BABYLON.Nullable<PlayerEntity> = null;
  uiManager: BABYLON.Nullable<UIManager> = null;
  multiplayer?: MultiplayerSession;
  gizmoManager?: BABYLON.GizmoManager;
  level: BABYLON.Nullable<GameLevel> = null;
  gameSettings: GameSettings = getGameSettings();
  controls: BABYLON.Nullable<GameControls> = null;
}

const gameRoot = new GameRoot();
export default gameRoot;