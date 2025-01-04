import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { ChatUI } from './chat-ui';
import { EditorUI } from './editor-ui';
import { GameOptionsUI } from './game-options-ui';
import { LobbyUI } from './lobby-ui';
import { PerformanceUI } from './performance-ui';
import { PlayerInfoUI } from './player-info-ui';
import { TimeTableUI } from './time-table-ui';
import { TimerUI } from './timer-ui';

export const renderingCanvas = document.querySelector('#render-canvas') as HTMLCanvasElement;

export class UIManager {
  protected initialized = false;

  scene: BABYLON.Scene;
  playerInfoUI: PlayerInfoUI;
  timerUI: TimerUI;
  timeTableUI: TimeTableUI;
  gameOptionsUI: GameOptionsUI;
  performanceUI: PerformanceUI;
  chatUI: ChatUI;
  editorUI: EditorUI;
  lobbyUI: LobbyUI;

  constructor(scene: BABYLON.Scene, player: PlayerEntity, gizmoManager?: BABYLON.GizmoManager) {
    this.scene = scene;
    this.playerInfoUI = new PlayerInfoUI(scene, player);
    this.timerUI = new TimerUI(scene, player);
    this.timeTableUI = new TimeTableUI(scene, player);
    this.gameOptionsUI = new GameOptionsUI(scene, player);
    this.performanceUI = new PerformanceUI(scene, player);
    this.chatUI = new ChatUI(scene, player);
    this.editorUI = new EditorUI(scene, player, gizmoManager);
    this.lobbyUI = new LobbyUI(scene, player);
  }

  bindUI() {
    if (this.initialized) return;
    
    this.playerInfoUI.bindUI();
    this.timerUI.bindUI();
    this.timeTableUI.bindUI();
    this.gameOptionsUI.bindUI();
    this.performanceUI.bindUI();
    this.chatUI.bindUI();
    this.editorUI.bindUI();
    this.lobbyUI.bindUI();

    this.initialized = true;
  }
}
