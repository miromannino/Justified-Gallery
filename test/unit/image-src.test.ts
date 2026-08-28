// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import {
  getSuffix,
  getUsedSuffix,
  imgSrcFromImage,
  newSrc,
  onImageEvent,
  removeSuffix,
  resetImgSrc,
} from '@/image-src';
import { JustifiedGallerySettingsDefaults } from '@/defaults';
import { JustifiedGallerySettings } from '@/settings';

function makeSettings(
  overrides: Partial<JustifiedGallerySettings> = {}
): JustifiedGallerySettings {
  return { ...JustifiedGallerySettingsDefaults, ...overrides };
}

describe('getSuffix', () => {
  const settings = makeSettings();
  const suffixRanges = [100, 240, 320, 500, 640, 1024];

  it('returns the suffix for the smallest range that fits the longest side', () => {
    expect(getSuffix(50, 80, settings, suffixRanges)).toBe('_t');
    expect(getSuffix(200, 100, settings, suffixRanges)).toBe('_m');
  });

  it('uses the longest side of width/height', () => {
    expect(getSuffix(1000, 50, settings, suffixRanges)).toBe('_b');
  });

  it('falls back to the largest range suffix when nothing fits', () => {
    expect(getSuffix(5000, 5000, settings, suffixRanges)).toBe('_b');
  });
});

describe('removeSuffix', () => {
  it('removes the suffix when present at the end', () => {
    expect(removeSuffix('image_m', '_m')).toBe('image');
  });

  it('returns the original string when the suffix is not present', () => {
    expect(removeSuffix('image', '_m')).toBe('image');
  });

  it('returns the original string when the suffix is empty', () => {
    expect(removeSuffix('image', '')).toBe('image');
  });
});

describe('getUsedSuffix', () => {
  const settings = makeSettings();

  it('finds the suffix used at the end of the string', () => {
    expect(getUsedSuffix('image_m', settings)).toBe('_m');
  });

  it('returns an empty string when no suffix matches', () => {
    expect(getUsedSuffix('image', settings)).toBe('');
  });
});

describe('newSrc', () => {
  it('uses the custom thumbnailPath function when defined', () => {
    const settings = makeSettings({
      thumbnailPath: (path, w, h) => `${path}?w=${w}&h=${h}`,
    });
    const image = document.createElement('img');
    const result = newSrc('a.jpg', 100, 50, image, settings, [100]);
    expect(result).toBe('a.jpg?w=100&h=50');
  });

  it('replaces the size suffix based on the sizeRangeSuffixes', () => {
    const settings = makeSettings();
    const image = document.createElement('img');
    const result = newSrc(
      'photo_t.jpg',
      1000,
      1000,
      image,
      settings,
      [100, 240, 320, 500, 640, 1024]
    );
    expect(result).toBe('photo_b.jpg');
  });

  it('adds a suffix to a src with no existing suffix', () => {
    const settings = makeSettings();
    const image = document.createElement('img');
    const result = newSrc('photo.jpg', 50, 50, image, settings, [
      100, 240, 320, 500, 640, 1024,
    ]);
    expect(result).toBe('photo_t.jpg');
  });
});

describe('imgSrcFromImage', () => {
  it('extracts the src attribute when data-safe-src is absent', () => {
    const image = document.createElement('img');
    image.setAttribute('src', 'a.jpg');
    const src = imgSrcFromImage(image);
    expect(src).toBe('a.jpg');
    expect(image.dataset.jgOriginalSrc).toBe('a.jpg');
    expect(image.dataset.jgSrc).toBe('a.jpg');
    expect(image.dataset.jgOriginalSrcLoc).toBe('src');
  });

  it('prefers data-safe-src over src', () => {
    const image = document.createElement('img');
    image.setAttribute('src', 'placeholder.jpg');
    image.dataset.safeSrc = 'real.jpg';
    const src = imgSrcFromImage(image);
    expect(src).toBe('real.jpg');
    expect(image.dataset.jgOriginalSrcLoc).toBe('data-safe-src');
  });

  it('returns an empty string when neither is present', () => {
    const image = document.createElement('img');
    expect(imgSrcFromImage(image)).toBe('');
  });
});

describe('resetImgSrc', () => {
  it('restores the original src when it was extracted from src', () => {
    const image = document.createElement('img');
    image.dataset.jgOriginalSrcLoc = 'src';
    image.dataset.jgOriginalSrc = 'original.jpg';
    resetImgSrc(image);
    expect(image.src).toContain('original.jpg');
  });

  it('clears the src when it was extracted from data-safe-src', () => {
    const image = document.createElement('img');
    image.src = 'something.jpg';
    image.dataset.jgOriginalSrcLoc = 'data-safe-src';
    resetImgSrc(image);
    expect(image.getAttribute('src')).toBe('');
  });
});

describe('onImageEvent', () => {
  it('does nothing when neither callback is passed', () => {
    expect(() => onImageEvent('a.jpg')).not.toThrow();
  });

  it('registers load and error listeners on a fresh Image', () => {
    const addEventListenerSpy = vi.spyOn(
      global.Image.prototype,
      'addEventListener'
    );
    const onLoad = vi.fn();
    const onError = vi.fn();
    onImageEvent('a.jpg', onLoad, onError);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'load',
      expect.any(Function),
      { once: true }
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
      { once: true }
    );

    addEventListenerSpy.mockRestore();
  });
});
