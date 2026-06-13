import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AbstractUI } from './abstract-ui';

class TestUI extends AbstractUI {}

describe('AbstractUI', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('formats arrays to fixed precision string', () => {
    const ui = new TestUI({} as never, 'demo', {} as never);
    expect(ui.arrayToString([1, 2.3456, -4.5])).toBe('[ 1.00, 2.35, -4.50 ]');
  });

  it('only updates innerText when content changes', () => {
    const ui = new TestUI({} as never, 'demo', {} as never);
    const element = document.createElement('div');
    element.innerText = 'existing';

    ui.setInnerText(element, 'existing');
    expect(element.innerText).toBe('existing');

    ui.setInnerText(element, 'updated');
    expect(element.innerText).toBe('updated');
  });

  it('loads css from expected asset path', () => {
    const ui = new TestUI({} as never, 'demo', {} as never);
    ui.loadCss();

    const link = document.head.querySelector('link[rel="stylesheet"]') as HTMLLinkElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('assets/ui/demo/demo.css');
  });

  it('bindUI loads css and html', async () => {
    const ui = new TestUI({} as never, 'demo', {} as never);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        text: async () => '<section class="demo-ui">ok</section>',
      })
    );

    await ui.bindUI();

    expect(document.head.querySelector('link[rel="stylesheet"]')).toBeTruthy();
    expect(document.body.querySelector('.demo-ui')?.textContent).toBe('ok');
    expect(fetch).toHaveBeenCalledWith('assets/ui/demo/demo.html', {
      method: 'GET',
    });
  });

  it('show toggles root element visibility when root exists', () => {
    const ui = new TestUI({} as never, 'demo', {} as never);
    ui.rootElement = document.createElement('div');

    ui.show(true);
    expect(ui.rootElement.style.display).toBe('block');

    ui.show(false);
    expect(ui.rootElement.style.display).toBe('none');
  });
});
