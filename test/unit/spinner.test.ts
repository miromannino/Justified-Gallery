// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadingSpinner } from '@/spinner';

describe('LoadingSpinner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a spinner element that is not running initially', () => {
    const spinner = new LoadingSpinner();
    expect(spinner.isRunning).toBe(false);
    expect(spinner.element.className).toBe('jg-spinner');
  });

  it('mounts the element into the gallery and reports its height on start', () => {
    const gallery = document.createElement('div');
    const spinner = new LoadingSpinner();
    Object.defineProperty(spinner.element, 'offsetHeight', {
      value: 42,
      configurable: true,
    });

    const onMounted = vi.fn();
    spinner.start(gallery, onMounted);

    expect(gallery.contains(spinner.element)).toBe(true);
    expect(onMounted).toHaveBeenCalledWith(42);
    expect(spinner.isRunning).toBe(true);
  });

  it('animates the spinner phases on an interval', () => {
    const gallery = document.createElement('div');
    const spinner = new LoadingSpinner();
    spinner.start(gallery, () => {});

    const spans = spinner.element.querySelectorAll('span');
    expect(spans[0].style.opacity).toBe('');

    vi.advanceTimersByTime(150);
    expect(spans[0].style.opacity).toBe('1');
  });

  it('does not create duplicate intervals when start is called twice', () => {
    const gallery = document.createElement('div');
    const spinner = new LoadingSpinner();
    spinner.start(gallery, () => {});
    const firstIsRunning = spinner.isRunning;
    spinner.start(gallery, () => {});

    expect(firstIsRunning).toBe(true);
    expect(spinner.isRunning).toBe(true);
  });

  it('stops the animation and removes the element from the DOM', () => {
    const gallery = document.createElement('div');
    const spinner = new LoadingSpinner();
    Object.defineProperty(spinner.element, 'offsetHeight', {
      value: 42,
      configurable: true,
    });
    spinner.start(gallery, () => {});

    const onUnmounting = vi.fn();
    spinner.stop(onUnmounting);

    expect(spinner.isRunning).toBe(false);
    expect(gallery.contains(spinner.element)).toBe(false);
    expect(onUnmounting).toHaveBeenCalledWith(42);
  });
});
