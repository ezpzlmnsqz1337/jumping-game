import { describe, expect, it, vi } from 'vitest';
import { PerformanceUI } from './performance-ui';

type PerfMonitorMock = {
  enable: () => void;
  sampleFrame: () => void;
  instantaneousFPS: number;
};

describe('PerformanceUI', () => {
  it('updateUI samples frame every call', () => {
    const scene = { onBeforeRenderObservable: { add: vi.fn() } };
    const ui = new PerformanceUI(scene as never, {} as never);
    const perfMonitor: PerfMonitorMock = {
      enable: vi.fn(),
      sampleFrame: vi.fn(),
      instantaneousFPS: 120,
    };

    ui.perfMonitor = perfMonitor as never;
    ui.fpsCounerDiv = document.createElement('div');
    ui.fpsUpdateIntervalMs = 1000;
    ui.lastUpdateTime = 0;

    const nowSpy = vi.spyOn(performance, 'now');
    nowSpy.mockReturnValue(100);
    ui.updateUI();
    nowSpy.mockReturnValue(200);
    ui.updateUI();

    expect(perfMonitor.sampleFrame).toHaveBeenCalledTimes(2);
  });

  it('updateUI refreshes fps text only when interval elapsed', () => {
    const scene = { onBeforeRenderObservable: { add: vi.fn() } };
    const ui = new PerformanceUI(scene as never, {} as never);
    const perfMonitor: PerfMonitorMock = {
      enable: vi.fn(),
      sampleFrame: vi.fn(),
      instantaneousFPS: 75.7,
    };

    ui.perfMonitor = perfMonitor as never;
    ui.fpsCounerDiv = document.createElement('div');
    ui.fpsCounerDiv.innerText = 'old';
    ui.fpsUpdateIntervalMs = 1000;
    ui.lastUpdateTime = 1000;

    const nowSpy = vi.spyOn(performance, 'now');
    nowSpy.mockReturnValue(1500);
    ui.updateUI();
    expect(ui.fpsCounerDiv.innerText).toBe('old');

    nowSpy.mockReturnValue(2100);
    ui.updateUI();
    expect(ui.fpsCounerDiv.innerText).toBe('76');
    expect(ui.lastUpdateTime).toBe(2100);
  });

  it('bindUI wires elements, enables monitor, and subscribes render callback', async () => {
    document.body.innerHTML = `
      <div class="performance">
        <div class="fps"><span class="value"></span></div>
      </div>
    `;

    const add = vi.fn();
    const scene = { onBeforeRenderObservable: { add } };
    const ui = new PerformanceUI(scene as never, {} as never);
    const perfMonitor: PerfMonitorMock = {
      enable: vi.fn(),
      sampleFrame: vi.fn(),
      instantaneousFPS: 60,
    };
    ui.perfMonitor = perfMonitor as never;

    ui.loadCss = vi.fn();
    ui.loadHtml = vi.fn(async () => {});

    await ui.bindUI();

    expect(ui.performanceDiv).toBeTruthy();
    expect(ui.fpsCounerDiv).toBeTruthy();
    expect(perfMonitor.enable).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledTimes(1);
    expect(ui.rootElement).toBe(ui.performanceDiv);
  });
});
