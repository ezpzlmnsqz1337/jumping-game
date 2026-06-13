import { describe, expect, it, vi } from 'vitest';
import { UIManager } from './ui-manager';

describe('UIManager', () => {
  it('bindUI initializes each UI once and skips on subsequent calls', async () => {
    const bindCalls: string[] = [];
    const mk = (name: string) => ({ bindUI: vi.fn(async () => bindCalls.push(name)) });

    const manager = {
      initialized: false,
      playerInfoUI: mk('playerInfoUI'),
      timerUI: mk('timerUI'),
      timeTableUI: mk('timeTableUI'),
      gameSettingsUI: mk('gameSettingsUI'),
      performanceUI: mk('performanceUI'),
      chatUI: mk('chatUI'),
      editorUI: mk('editorUI'),
      lobbyUI: mk('lobbyUI'),
    } as unknown as UIManager;

    await UIManager.prototype.bindUI.call(manager);
    await UIManager.prototype.bindUI.call(manager);

    expect(bindCalls).toEqual([
      'playerInfoUI',
      'timerUI',
      'timeTableUI',
      'gameSettingsUI',
      'performanceUI',
      'chatUI',
      'editorUI',
      'lobbyUI',
    ]);
    expect(manager.playerInfoUI.bindUI).toHaveBeenCalledTimes(1);
    expect(manager.timerUI.bindUI).toHaveBeenCalledTimes(1);
    expect(manager.timeTableUI.bindUI).toHaveBeenCalledTimes(1);
    expect(manager.gameSettingsUI.bindUI).toHaveBeenCalledTimes(1);
    expect(manager.performanceUI.bindUI).toHaveBeenCalledTimes(1);
    expect(manager.chatUI.bindUI).toHaveBeenCalledTimes(1);
    expect(manager.editorUI.bindUI).toHaveBeenCalledTimes(1);
    expect(manager.lobbyUI.bindUI).toHaveBeenCalledTimes(1);
  });

  it('constructor creates all UI components', async () => {
    vi.resetModules();
    document.body.innerHTML = '<canvas id="render-canvas"></canvas>';

    vi.doMock('./player-info/player-info-ui', () => ({
      PlayerInfoUI: class {
        kind = 'playerInfoUI';
      },
    }));
    vi.doMock('./timer/timer-ui', () => ({
      TimerUI: class {
        kind = 'timerUI';
      },
    }));
    vi.doMock('./time-table/time-table-ui', () => ({
      TimeTableUI: class {
        kind = 'timeTableUI';
      },
    }));
    vi.doMock('./game-settings/game-settings-ui', () => ({
      GameSettingsUI: class {
        kind = 'gameSettingsUI';
      },
    }));
    vi.doMock('./performance/performance-ui', () => ({
      PerformanceUI: class {
        kind = 'performanceUI';
      },
    }));
    vi.doMock('./chat/chat-ui', () => ({
      ChatUI: class {
        kind = 'chatUI';
      },
    }));
    vi.doMock('./editor/editor-ui', () => ({
      EditorUI: class {
        kind = 'editorUI';
      },
    }));
    vi.doMock('./lobby/lobby-ui', () => ({
      LobbyUI: class {
        kind = 'lobbyUI';
      },
    }));

    const { UIManager: MockedUIManager } = await import('./ui-manager');

    const manager = new MockedUIManager({} as never, {} as never);

    expect((manager.playerInfoUI as unknown as { kind: string }).kind).toBe('playerInfoUI');
    expect((manager.timerUI as unknown as { kind: string }).kind).toBe('timerUI');
    expect((manager.timeTableUI as unknown as { kind: string }).kind).toBe('timeTableUI');
    expect((manager.gameSettingsUI as unknown as { kind: string }).kind).toBe('gameSettingsUI');
    expect((manager.performanceUI as unknown as { kind: string }).kind).toBe('performanceUI');
    expect((manager.chatUI as unknown as { kind: string }).kind).toBe('chatUI');
    expect((manager.editorUI as unknown as { kind: string }).kind).toBe('editorUI');
    expect((manager.lobbyUI as unknown as { kind: string }).kind).toBe('lobbyUI');

    vi.doUnmock('./player-info/player-info-ui');
    vi.doUnmock('./timer/timer-ui');
    vi.doUnmock('./time-table/time-table-ui');
    vi.doUnmock('./game-settings/game-settings-ui');
    vi.doUnmock('./performance/performance-ui');
    vi.doUnmock('./chat/chat-ui');
    vi.doUnmock('./editor/editor-ui');
    vi.doUnmock('./lobby/lobby-ui');
  });
});
