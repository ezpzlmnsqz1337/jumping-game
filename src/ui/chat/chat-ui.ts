import * as BABYLON from '@babylonjs/core';
import { PlayerEntity } from '../../entities/player-entity';
import gameRoot from '../../game-root';
import { ChatMessage } from '../../multiplayer-session';
import { AbstractUI } from './../abstract-ui';
import { renderingCanvas } from './../ui-manager';

export const HIDE_CHAT_TIMEOUT_MS = 30000;

export class ChatUI extends AbstractUI {
  chatDiv!: HTMLDivElement;
  chatMessagesDiv!: HTMLDivElement;
  chatInput!: HTMLInputElement;

  hideChatTimeout!: NodeJS.Timeout;

  constructor(scene: BABYLON.Scene, player: PlayerEntity) {
    super(scene, 'chat', player);
  }

  sendChatMessage() {
    if (this.player.status !== 'in_chat') return;
    const text = this.chatInput.value;
    if (!text) return;
    const mp = gameRoot.multiplayer;
    this.addChatMessage({
      id: '',
      nickname: this.player.nickname,
      text,
      color: this.player.color
    });
    this.chatInput.value = '';
    if (mp) mp.sendChatMessage(text);
    this.stopChat();
  }

  addChatMessage(message: ChatMessage) {
    const messageDiv = document.createElement('div') as HTMLDivElement;
    const nicknameSpan = document.createElement('span') as HTMLSpanElement;
    nicknameSpan.classList.add(message.color);
    const textSpan = document.createElement('span') as HTMLSpanElement;
    nicknameSpan.innerText = `[${message.nickname}]: `;
    textSpan.innerText = message.text;
    messageDiv.appendChild(nicknameSpan);
    messageDiv.appendChild(textSpan);
    this.chatMessagesDiv.appendChild(messageDiv);
    this.chatMessagesDiv.scrollTop = this.chatMessagesDiv.scrollHeight;
    this.restartChatTimeout();
  }

  toggleChat() {
    if (this.player.status === 'in_lobby') return;
    if (this.player.status === 'in_chat') {
      this.stopChat();
    } else {
      this.startChat();
    }
  }

  startChat() {
    this.showChat();
    this.chatInput.style.display = 'block';
    this.chatInput.focus();
    this.player.status = 'in_chat';
    setTimeout(() => this.chatInput.value = '');
  }

  stopChat() {
    this.chatInput.style.display = 'none';
    renderingCanvas.focus();
    this.player.status = 'playing';
    this.restartChatTimeout();
  }

  showChat() {
    this.chatDiv.style.display = 'block';
  }

  hideChat() {
    this.chatDiv.style.display = 'none';
  }

  restartChatTimeout() {
    clearTimeout(this.hideChatTimeout);
    this.showChat();
    this.hideChatTimeout = setTimeout(() => {
      this.hideChat();
    }, HIDE_CHAT_TIMEOUT_MS);
  }

  async bindUI() {
    await super.bindUI();
    this.chatDiv = document.querySelector('.chat') as HTMLDivElement;
    this.chatMessagesDiv = document.querySelector('.chat-messages') as HTMLDivElement;
    this.chatInput = document.querySelector('.chat-input') as HTMLInputElement;
    this.rootElement = this.chatDiv;

    this.chatDiv.style.display = 'none';
    this.chatInput.style.display = 'none';

    this.chatInput.addEventListener('blur', () => {
      this.stopChat();
    });
  }
}