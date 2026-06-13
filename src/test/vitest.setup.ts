import { beforeAll, afterAll, vi } from 'vitest';

const JSDOM_NAVIGATION_NOT_IMPLEMENTED = 'Not implemented: navigation (except hash changes)';

let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;
const originalConsoleError = console.error;

beforeAll(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const joined = args
      .map(arg => (typeof arg === 'string' ? arg : String(arg)))
      .join(' ');

    if (joined.includes(JSDOM_NAVIGATION_NOT_IMPLEMENTED)) {
      return;
    }

    originalConsoleError(...(args as Parameters<typeof console.error>));
  });
});

afterAll(() => {
  consoleErrorSpy?.mockRestore();
});
