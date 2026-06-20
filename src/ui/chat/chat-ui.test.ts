import { beforeEach, describe, expect, it, vi } from 'vitest';

type ChatTestPlayer = {
  status: 'in_chat' | 'playing' | 'in_lobby' | 'afk';
  nickname: string;
  color: string;
};

describe('ChatUI', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.useFakeTimers();
    document.body.innerHTML = `
      <canvas id="render-canvas"></canvas>
      <div class="chat"></div>
      <div class="chat-messages"></div>
      <div class="chat-input-row">
        <input class="chat-input" />
        <button class="chat-send-btn">Send</button>
      </div>
    `;
  });

  it('sendChatMessage sends, appends message and exits chat', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { ChatUI } = await import('./chat-ui');

    const sendChatMessage = vi.fn();
    gameRoot.multiplayer = { sendChatMessage } as never;

    const player: ChatTestPlayer = {
      status: 'in_chat',
      nickname: 'tester',
      color: 'green',
    };

    const chatUi = new ChatUI({} as never, player as never);
    chatUi.chatDiv = document.querySelector('.chat') as HTMLDivElement;
    chatUi.chatMessagesDiv = document.querySelector('.chat-messages') as HTMLDivElement;
    chatUi.chatInput = document.querySelector('.chat-input') as HTMLInputElement;
    chatUi.chatSendBtn = document.querySelector('.chat-send-btn') as HTMLButtonElement;
    chatUi.chatInput.value = 'hello';

    chatUi.sendChatMessage();
    vi.runOnlyPendingTimers();

    expect(sendChatMessage).toHaveBeenCalledWith('hello');
    expect(chatUi.chatMessagesDiv.children).toHaveLength(1);
    expect(chatUi.chatInput.value).toBe('');
    expect(player.status).toBe('playing');
    expect(chatUi.chatInput.style.display).toBe('none');
  });

  it('sendChatMessage does nothing when not in chat mode', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { ChatUI } = await import('./chat-ui');

    const sendChatMessage = vi.fn();
    gameRoot.multiplayer = { sendChatMessage } as never;

    const player: ChatTestPlayer = {
      status: 'playing',
      nickname: 'tester',
      color: 'green',
    };

    const chatUi = new ChatUI({} as never, player as never);
    chatUi.chatDiv = document.querySelector('.chat') as HTMLDivElement;
    chatUi.chatMessagesDiv = document.querySelector('.chat-messages') as HTMLDivElement;
    chatUi.chatInput = document.querySelector('.chat-input') as HTMLInputElement;
    chatUi.chatInput.value = 'should-not-send';

    chatUi.sendChatMessage();

    expect(sendChatMessage).not.toHaveBeenCalled();
    expect(chatUi.chatMessagesDiv.children).toHaveLength(0);
    expect(chatUi.chatInput.value).toBe('should-not-send');
  });

  it('sendChatMessage does nothing on empty text even when in chat mode', async () => {
    const { default: gameRoot } = await import('../../game-root');
    const { ChatUI } = await import('./chat-ui');

    const sendChatMessage = vi.fn();
    gameRoot.multiplayer = { sendChatMessage } as never;

    const player: ChatTestPlayer = {
      status: 'in_chat',
      nickname: 'tester',
      color: 'green',
    };

    const chatUi = new ChatUI({} as never, player as never);
    chatUi.chatDiv = document.querySelector('.chat') as HTMLDivElement;
    chatUi.chatMessagesDiv = document.querySelector('.chat-messages') as HTMLDivElement;
    chatUi.chatInput = document.querySelector('.chat-input') as HTMLInputElement;
    chatUi.chatInput.value = '';

    chatUi.sendChatMessage();

    expect(sendChatMessage).not.toHaveBeenCalled();
    expect(chatUi.chatMessagesDiv.children).toHaveLength(0);
    expect(player.status).toBe('in_chat');
  });

  it('toggleChat starts and stops chat mode when player is playing', async () => {
    const { ChatUI } = await import('./chat-ui');

    const player: ChatTestPlayer = {
      status: 'playing',
      nickname: 'tester',
      color: 'green',
    };

    const chatUi = new ChatUI({} as never, player as never);
    chatUi.chatDiv = document.querySelector('.chat') as HTMLDivElement;
    chatUi.chatMessagesDiv = document.querySelector('.chat-messages') as HTMLDivElement;
    chatUi.chatInput = document.querySelector('.chat-input') as HTMLInputElement;
    chatUi.chatSendBtn = document.querySelector('.chat-send-btn') as HTMLButtonElement;

    chatUi.toggleChat();
    expect(player.status).toBe('in_chat');
    expect(chatUi.chatInput.style.display).toBe('block');

    chatUi.toggleChat();
    expect(player.status).toBe('playing');
    expect(chatUi.chatInput.style.display).toBe('none');
  });

  it('toggleChat does nothing while in lobby', async () => {
    const { ChatUI } = await import('./chat-ui');

    const player: ChatTestPlayer = {
      status: 'in_lobby',
      nickname: 'tester',
      color: 'green',
    };

    const chatUi = new ChatUI({} as never, player as never);
    chatUi.chatDiv = document.querySelector('.chat') as HTMLDivElement;
    chatUi.chatMessagesDiv = document.querySelector('.chat-messages') as HTMLDivElement;
    chatUi.chatInput = document.querySelector('.chat-input') as HTMLInputElement;

    chatUi.toggleChat();

    expect(player.status).toBe('in_lobby');
    expect(chatUi.chatInput.style.display).toBe('');
  });

  it('restartChatTimeout keeps chat visible and hides it after timeout', async () => {
    const { ChatUI, HIDE_CHAT_TIMEOUT_MS } = await import('./chat-ui');

    const player: ChatTestPlayer = {
      status: 'playing',
      nickname: 'tester',
      color: 'green',
    };

    const chatUi = new ChatUI({} as never, player as never);
    chatUi.chatDiv = document.querySelector('.chat') as HTMLDivElement;
    chatUi.chatMessagesDiv = document.querySelector('.chat-messages') as HTMLDivElement;
    chatUi.chatInput = document.querySelector('.chat-input') as HTMLInputElement;
    chatUi.chatSendBtn = document.querySelector('.chat-send-btn') as HTMLButtonElement;

    chatUi.restartChatTimeout();
    expect(chatUi.chatDiv.style.display).toBe('block');

    vi.advanceTimersByTime(HIDE_CHAT_TIMEOUT_MS);
    expect(chatUi.chatDiv.style.display).toBe('none');
  });

  it('bindUI initializes elements and blur stops chat', async () => {
    const { ChatUI } = await import('./chat-ui');

    const player: ChatTestPlayer = {
      status: 'playing',
      nickname: 'tester',
      color: 'green',
    };

    const chatUi = new ChatUI({} as never, player as never);
    chatUi.loadCss = vi.fn();
    chatUi.loadHtml = vi.fn(async () => {});

    await chatUi.bindUI();

    expect(chatUi.rootElement).toBe(chatUi.chatDiv);
    expect(chatUi.chatDiv.style.display).toBe('none');
    expect(chatUi.chatInput.style.display).toBe('none');

    chatUi.startChat();
    chatUi.chatInput.dispatchEvent(new Event('blur'));
    expect(player.status).toBe('playing');
  });

  it('stopChat hides input and restarts timeout', async () => {
    const { ChatUI } = await import('./chat-ui');

    const player: ChatTestPlayer = {
      status: 'in_chat',
      nickname: 'tester',
      color: 'green',
    };

    const chatUi = new ChatUI({} as never, player as never);
    chatUi.chatDiv = document.querySelector('.chat') as HTMLDivElement;
    chatUi.chatMessagesDiv = document.querySelector('.chat-messages') as HTMLDivElement;
    chatUi.chatInput = document.querySelector('.chat-input') as HTMLInputElement;
    chatUi.chatSendBtn = document.querySelector('.chat-send-btn') as HTMLButtonElement;

    chatUi.restartChatTimeout();
    expect(chatUi.chatDiv.style.display).toBe('block');

    chatUi.stopChat();

    expect(chatUi.chatInput.style.display).toBe('none');
    expect(player.status).toBe('playing');
    // Timeout should have been restarted — chat stays visible
    expect(chatUi.chatDiv.style.display).toBe('block');
  });
});
