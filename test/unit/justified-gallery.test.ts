// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JustifiedGallery } from '@/justified-gallery';
import { EventType } from '@/events';

function makeGallery(width = 1000): HTMLElement {
  const gallery = document.createElement('div');
  vi.spyOn(gallery, 'offsetWidth', 'get').mockReturnValue(width);
  vi.spyOn(gallery, 'clientWidth', 'get').mockReturnValue(width);
  return gallery;
}

describe('JustifiedGallery constructor', () => {
  it('merges provided settings with the defaults', () => {
    const gallery = makeGallery();
    const jg = new JustifiedGallery(gallery, { rowHeight: 200 });
    expect(jg.settings.rowHeight).toBe(200);
    expect(jg.settings.margins).toBe(1); // default
  });

  it('throws when settings are invalid', () => {
    const gallery = makeGallery();
    expect(
      () =>
        new JustifiedGallery(gallery, {
          justifyThreshold: 5,
        })
    ).toThrow('justifyThreshold must be in the interval [0, 1]');
  });

  it('uses the explicit border when non-negative', () => {
    const gallery = makeGallery();
    const jg = new JustifiedGallery(gallery, { border: 5, margins: 10 });
    expect(jg.border).toBe(5);
  });

  it('falls back to margins for the border when border is negative', () => {
    const gallery = makeGallery();
    const jg = new JustifiedGallery(gallery, { border: -1, margins: 10 });
    expect(jg.border).toBe(10);
  });

  it('captures the gallery width at construction time', () => {
    const gallery = makeGallery(777);
    const jg = new JustifiedGallery(gallery);
    expect(jg.galleryWidth).toBe(777);
  });
});

describe('JustifiedGallery#displayEntry', () => {
  it('positions the entry and, when present, the image', () => {
    const gallery = makeGallery();
    const jg = new JustifiedGallery(gallery);

    const entry = document.createElement('a');
    entry.innerHTML = '<img src="a.jpg" alt="A cat">';
    const image = entry.querySelector('img') as HTMLImageElement;
    image.dataset.jgSrc = 'a.jpg';

    jg.displayEntry(entry, 10, 20, 300, 150, 150);

    expect(entry.style.width).toBe('300px');
    expect(entry.style.height).toBe('150px');
    expect(entry.style.top).toBe('20px');
    expect(entry.style.left).toBe('10px');
    expect(image.style.width).toBe('300px');
    expect(image.style.height).toBe('150px');
    expect(entry.classList.contains('jg-entry-visible')).toBe(true);
    expect(entry.querySelector('.jg-caption')?.textContent).toBe('A cat');
  });

  it('still shows the entry when it has no image', () => {
    const gallery = makeGallery();
    const jg = new JustifiedGallery(gallery);
    const entry = document.createElement('a');

    jg.displayEntry(entry, 0, 0, 100, 100, 100);

    expect(entry.classList.contains('jg-entry-visible')).toBe(true);
  });
});

describe('JustifiedGallery#updateEntries', () => {
  it('collects all matching direct children on a full rewind', () => {
    const gallery = makeGallery();
    gallery.innerHTML = '<a></a><a></a><span></span>';
    const jg = new JustifiedGallery(gallery);

    const found = jg.updateEntries(false);

    expect(found).toBe(true);
    expect(jg.entries).toHaveLength(2);
  });

  it('randomizes entries when randomize is enabled', () => {
    const gallery = makeGallery();
    gallery.innerHTML = '<a id="a1"></a><a id="a2"></a><a id="a3"></a>';
    const jg = new JustifiedGallery(gallery, { randomize: true });

    jg.updateEntries(false);

    expect(jg.entries.map((e) => e.id).sort()).toEqual(['a1', 'a2', 'a3']);
  });

  it('applies a string filter, marking non-matches as filtered', () => {
    const gallery = makeGallery();
    gallery.innerHTML = '<a class="keep"></a><a></a>';
    const jg = new JustifiedGallery(gallery, { filter: '.keep' });

    jg.updateEntries(false);

    expect(jg.entries).toHaveLength(1);
    expect(jg.entries[0].classList.contains('keep')).toBe(true);
  });
});

describe('JustifiedGallery#rewind', () => {
  it('resets the analysis state', () => {
    const gallery = makeGallery();
    const jg = new JustifiedGallery(gallery);
    jg.lastFetchedEntry = document.createElement('a');
    jg.lastAnalyzedIndex = 3;
    jg.rows = 2;
    jg.offY = 999;

    jg.rewind();

    expect(jg.lastFetchedEntry).toBeUndefined();
    expect(jg.lastAnalyzedIndex).toBe(-1);
    expect(jg.rows).toBe(0);
    expect(jg.offY).toBe(jg.settings.border);
    expect(jg.buildingRow.entriesBuff).toEqual([]);
  });
});

describe('JustifiedGallery#destroy', () => {
  it('resets styles, classes, and dataset attributes, and triggers the Destroy event', () => {
    const gallery = makeGallery();
    gallery.innerHTML =
      '<a class="jg-entry jg-entry-visible" style="width:1px" data-jg-loaded="true">' +
      '<img src="a.jpg" style="width:1px" data-jg-original-src="a.jpg" data-jg-original-srcloc="src" data-jg-src="a.jpg">' +
      '<div class="jg-caption" data-jg-created-caption="true"></div>' +
      '</a>';
    const entry = gallery.querySelector('a') as HTMLElement;
    entry.dataset.jgCreatedCaption = 'true';

    const triggerEvent = vi.fn();
    const jg = new JustifiedGallery(gallery, { triggerEvent });

    jg.destroy();

    expect(entry.style.width).toBe('');
    expect(entry.classList.contains('jg-entry')).toBe(false);
    expect(entry.classList.contains('jg-entry-visible')).toBe(false);
    expect(entry.querySelector('.jg-caption')).toBeNull();
    expect(gallery.classList.contains('justified-gallery')).toBe(false);
    expect(gallery.style.height).toBe('');
    expect(triggerEvent).toHaveBeenCalledWith(EventType.Destroy);
  });
});

describe('JustifiedGallery#init end-to-end (skipped-image path)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lays out entries whose dimensions are already known and fires events', () => {
    const gallery = makeGallery(1000);
    gallery.innerHTML =
      '<a><img src="a.jpg" width="300" height="200"></a>' +
      '<a><img src="b.jpg" width="300" height="200"></a>';

    const triggerEvent = vi.fn();
    const jg = new JustifiedGallery(gallery, {
      waitThumbnailsLoad: false,
      triggerEvent,
    });

    jg.init();
    vi.advanceTimersByTime(10);

    expect(gallery.classList.contains('justified-gallery')).toBe(true);
    expect(triggerEvent).toHaveBeenCalledWith(EventType.Complete);

    const images = gallery.querySelectorAll('img');
    images.forEach((img) => {
      expect((img as HTMLImageElement).style.width).not.toBe('');
    });
  });
});
