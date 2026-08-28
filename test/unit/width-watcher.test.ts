// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WidthWatcher } from '@/width-watcher';

function makeGallery(width: number): HTMLElement {
  const gallery = document.createElement('div');
  vi.spyOn(gallery, 'clientWidth', 'get').mockReturnValue(width);
  vi.spyOn(gallery, 'offsetWidth', 'get').mockReturnValue(width);
  Object.defineProperty(gallery, 'offsetParent', {
    value: document.body,
    configurable: true,
  });
  return gallery;
}

describe('WidthWatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call the callback when width has not changed beyond sensitivity', () => {
    const gallery = makeGallery(500);
    const onWidthChanged = vi.fn();
    const watcher = new WidthWatcher(gallery, 100, 5, onWidthChanged);
    watcher.start();

    vi.advanceTimersByTime(100);

    expect(onWidthChanged).not.toHaveBeenCalled();
  });

  it('calls the callback once the width changes beyond the sensitivity threshold', () => {
    const gallery = makeGallery(500);
    const onWidthChanged = vi.fn();
    const watcher = new WidthWatcher(gallery, 100, 5, onWidthChanged);
    watcher.start();

    vi.spyOn(gallery, 'clientWidth', 'get').mockReturnValue(600);
    vi.advanceTimersByTime(100);

    expect(onWidthChanged).toHaveBeenCalledWith(600);
  });

  it('does not call the callback when the gallery is not visible', () => {
    const gallery = makeGallery(500);
    Object.defineProperty(gallery, 'offsetParent', {
      value: null,
      configurable: true,
    });
    const onWidthChanged = vi.fn();
    const watcher = new WidthWatcher(gallery, 100, 5, onWidthChanged);
    watcher.start();

    vi.spyOn(gallery, 'clientWidth', 'get').mockReturnValue(900);
    vi.advanceTimersByTime(100);

    expect(onWidthChanged).not.toHaveBeenCalled();
  });

  it('stops polling after stop is called', () => {
    const gallery = makeGallery(500);
    const onWidthChanged = vi.fn();
    const watcher = new WidthWatcher(gallery, 100, 5, onWidthChanged);
    watcher.start();
    watcher.stop();

    vi.spyOn(gallery, 'clientWidth', 'get').mockReturnValue(900);
    vi.advanceTimersByTime(300);

    expect(onWidthChanged).not.toHaveBeenCalled();
  });
});
