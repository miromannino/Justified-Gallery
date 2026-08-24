// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { GalleryHeight } from '@/gallery-height';

function makeGallery(clientHeight: number): HTMLElement {
  const gallery = document.createElement('div');
  vi.spyOn(gallery, 'clientHeight', 'get').mockReturnValue(clientHeight);
  return gallery;
}

describe('GalleryHeight', () => {
  it('remembers the current height and applies it as a static height', () => {
    const gallery = makeGallery(100);
    const height = new GalleryHeight(gallery);
    height.remember();
    expect(gallery.style.height).toBe('100px');
  });

  it('setTemp only grows the height, never shrinks it', () => {
    const gallery = makeGallery(100);
    const height = new GalleryHeight(gallery);
    height.remember();

    height.setTemp(50);
    expect(gallery.style.height).toBe('100px');

    height.setTemp(200);
    expect(gallery.style.height).toBe('200px');
  });

  it('setFinal sets the exact height regardless of previous value', () => {
    const gallery = makeGallery(100);
    const height = new GalleryHeight(gallery);
    height.remember();
    height.setTemp(300);

    height.setFinal(50);
    expect(gallery.style.height).toBe('50px');

    // A subsequent setTemp should grow from the new final height, not the
    // old temp maximum.
    height.setTemp(60);
    expect(gallery.style.height).toBe('60px');
  });
});
