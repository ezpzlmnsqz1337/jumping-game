import gameRoot from "../game-root";
import { ChatMessage } from "../multiplayer-session";
import { AbstractUI } from "./abstract-ui";
import { renderingCanvas } from "./ui-manager";

export const chatDiv = document.querySelector('.chat') as HTMLDivElement;
export const chatMessagesDiv = document.querySelector('.chat-messages') as HTMLDivElement;
export const chatInput = document.querySelector('.chat-input') as HTMLInputElement;

export const HIDE_CHAT_TIMEOUT_MS = 30000;

export class ChatUI extends AbstractUI {
  hideChatTimeout!: NodeJS.Timeout;
  
  sendChatMessage() {
    if (this.player.status !== 'in_chat') return;
    const text = chatInput.value;
    if (!text) return;
    const mp = gameRoot.multiplayer;
    this.addChatMessage({
      id: '',
      nickname: this.player.nickname,
      text,
      color: this.player.color
    });
    chatInput.value = '';
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
    chatMessagesDiv.appendChild(messageDiv);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
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
    chatInput.style.display = 'block';
    chatInput.focus();
    this.player.status = 'in_chat';
  }
  
  stopChat() {
    chatInput.style.display = 'none';
    renderingCanvas.focus();
    this.player.status = 'playing';
    this.restartChatTimeout();
  }
  
  showChat() {
    chatDiv.style.display = 'block';
  }
  
  hideChat() {
    chatDiv.style.display = 'none';
  }
  
  restartChatTimeout() {
    clearTimeout(this.hideChatTimeout);
    this.showChat();
    this.hideChatTimeout = setTimeout(() => {
      this.hideChat();
    }, HIDE_CHAT_TIMEOUT_MS);
  }

  bindUI() : void {
    chatDiv.style.display = 'none';
    chatInput.style.display = 'none';
  
    chatInput.addEventListener('blur', () => {
      this.stopChat();
    });
  }
}