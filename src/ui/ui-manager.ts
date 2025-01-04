import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../entities/player';
import { ChatUI } from './chat/chat-ui';
import { EditorUI } from './editor/editor-ui';
import { LobbyUI } from './lobby/lobby-ui';
import { PerformanceUI } from './performance/performance-ui';
import { PlayerInfoUI } from './player-info/player-info-ui';
import { TimeTableUI } from './time-table/time-table-ui';
import { TimerUI } from './timer/timer-ui';
import { GameSettingsUI } from './game-settings/game-settings-ui';

export const renderingCanvas = document.querySelector('#render-canvas') as HTMLCanvasElement;

export class UIManager {
  protected initialized = false;

  scene: BABYLON.Scene;
  playerInfoUI: PlayerInfoUI;
  timerUI: TimerUI;
  timeTableUI: TimeTableUI;
  gameSettingsUI: GameSettingsUI;
  performanceUI: PerformanceUI;
  chatUI: ChatUI;
  editorUI: EditorUI;
  lobbyUI: LobbyUI;

  constructor(scene: BABYLON.Scene, player: PlayerEntity, gizmoManager?: BABYLON.GizmoManager) {
    this.scene = scene;
    this.playerInfoUI = new PlayerInfoUI(scene, player);
    this.timerUI = new TimerUI(scene, player);
    this.timeTableUI = new TimeTableUI(scene, player);
    this.gameSettingsUI = new GameSettingsUI(scene, player);
    this.performanceUI = new PerformanceUI(scene, player);
    this.chatUI = new ChatUI(scene, player);
    this.editorUI = new EditorUI(scene, player, gizmoManager);
    this.lobbyUI = new LobbyUI(scene, player);
  }

  async bindUI() {
    if (this.initialized) return;
    
    await this.playerInfoUI.bindUI();
    await this.timerUI.bindUI();
    await this.timeTableUI.bindUI();
    await this.gameSettingsUI.bindUI();
    await this.performanceUI.bindUI();
    await this.chatUI.bindUI();
    await this.editorUI.bindUI();
    await this.lobbyUI.bindUI();

    this.initialized = true;
  }
}
