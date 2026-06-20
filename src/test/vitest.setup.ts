import { beforeAll, afterAll, vi } from 'vitest';

const JSDOM_NAVIGATION_NOT_IMPLEMENTED = 'Not implemented: navigation (except hash changes)';

let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;
const originalConsoleError = console.error;

// Polyfill ResizeObserver for jsdom (used by MobileControlsUI)
class ResizeObserverMock {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(_target: Element): void {
    // Immediately report initial size as 0
    this.callback([{ contentRect: { height: 0, width: 0 } } as ResizeObserverEntry], this);
  }
  unobserve(_target: Element): void {
    // noop
  }
  disconnect(): void {
    // noop
  }
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}

beforeAll(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const joined = args.map(arg => (typeof arg === 'string' ? arg : String(arg))).join(' ');

    if (joined.includes(JSDOM_NAVIGATION_NOT_IMPLEMENTED)) {
      return;
    }

    originalConsoleError(...(args as Parameters<typeof console.error>));
  });
});

afterAll(() => {
  consoleErrorSpy?.mockRestore();
});
