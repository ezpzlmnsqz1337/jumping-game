import * as BABYLON from '@babylonjs/core';
import { GameControls } from './controls';
import { PlayerEntity } from './entities/player-entity';
import { GameLevel } from './game-level';
import { MultiplayerSession } from './multiplayer-session';
import { GameStorage } from './game-storage';
import { UIManager } from './ui/ui-manager';
import { DemoService } from './services/demo-service';
import { type QualityTier } from './quality';

export class GameRoot {
  activeScene: BABYLON.Nullable<BABYLON.Scene> = null;
  engine: BABYLON.Nullable<BABYLON.Engine> = null;
  player: BABYLON.Nullable<PlayerEntity> = null;
  uiManager: BABYLON.Nullable<UIManager> = null;
  multiplayer?: MultiplayerSession;
  gizmoManager?: BABYLON.GizmoManager;
  level: BABYLON.Nullable<GameLevel> = null;
  gameSettings = GameStorage.getGameSettings();
  controls: BABYLON.Nullable<GameControls> = null;
  demoService = new DemoService();
  qualityTier: QualityTier = 'high';
}

const gameRoot = new GameRoot();
export default gameRoot;
