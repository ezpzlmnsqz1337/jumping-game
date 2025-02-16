import * as BABYLON from '@babylonjs/core';
import { GameControls } from './controls';
import { Editor } from './editor';
import { PlayerEntity } from './entities/player-entity';
import { GameLevel } from './game-level';
import { GameStorage } from './game-storage';
import { MultiplayerSession } from './multiplayer-session';
import { DemoService } from './services/demo-service';
import { UIManager } from './ui/ui-manager';

export class GameRoot {
  activeScene: BABYLON.Nullable<BABYLON.Scene> = null;
  player: BABYLON.Nullable<PlayerEntity> = null;
  uiManager: BABYLON.Nullable<UIManager> = null;
  multiplayer?: MultiplayerSession;
  gizmoManager?: BABYLON.GizmoManager;
  level: BABYLON.Nullable<GameLevel> = null;
  editor: BABYLON.Nullable<Editor> = null;
  gameSettings = GameStorage.getGameSettings();
  controls: BABYLON.Nullable<GameControls> = null;
  demoService = new DemoService();
}

const gameRoot = new GameRoot();
export default gameRoot;