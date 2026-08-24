// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import {
  captionFromEntry,
  displayEntryCaption,
  imgFromEntry,
  isValidCaption,
  showImg,
} from '@/dom';

describe('imgFromEntry', () => {
  it('finds the image matching the selector inside the entry', () => {
    const entry = document.createElement('div');
    entry.innerHTML = '<img src="a.jpg">';
    const img = imgFromEntry(entry, 'img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('a.jpg');
  });

  it('returns null when no image matches', () => {
    const entry = document.createElement('div');
    expect(imgFromEntry(entry, 'img')).toBeNull();
  });
});

describe('captionFromEntry', () => {
  it('finds an existing .jg-caption element', () => {
    const entry = document.createElement('div');
    entry.innerHTML = '<div class="jg-caption">Hello</div>';
    const caption = captionFromEntry(entry);
    expect(caption).not.toBeNull();
    expect(caption?.textContent).toBe('Hello');
  });

  it('returns null when there is no caption', () => {
    const entry = document.createElement('div');
    expect(captionFromEntry(entry)).toBeNull();
  });
});

describe('isValidCaption', () => {
  it('returns false for null, undefined, or blank strings', () => {
    expect(isValidCaption(null)).toBe(false);
    expect(isValidCaption(undefined)).toBe(false);
    expect(isValidCaption('')).toBe(false);
    expect(isValidCaption('   ')).toBe(false);
  });

  it('returns true for a non-blank string', () => {
    expect(isValidCaption('a caption')).toBe(true);
  });
});

describe('showImg', () => {
  it('adds the jg-entry-visible class and calls the callback', () => {
    const entry = document.createElement('div');
    const callback = vi.fn();
    showImg(entry, callback);
    expect(entry.classList.contains('jg-entry-visible')).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);
  });


  it('does not throw when no callback is provided', () => {
    const entry = document.createElement('div');
    expect(() => showImg(entry)).not.toThrow();
    expect(entry.classList.contains('jg-entry-visible')).toBe(true);
  });
});

describe('displayEntryCaption', () => {
  it('does nothing when captions are disabled', () => {
    const entry = document.createElement('div');
    entry.innerHTML = '<img src="a.jpg" alt="A cat">';
    displayEntryCaption(entry, 'img', false);
    expect(captionFromEntry(entry)).toBeNull();
  });

  it('does nothing when there is no image', () => {
    const entry = document.createElement('div');
    displayEntryCaption(entry, 'img', true);
    expect(captionFromEntry(entry)).toBeNull();
  });

  it('leaves an existing caption untouched', () => {
    const entry = document.createElement('div');
    entry.innerHTML =
      '<img src="a.jpg" alt="A cat"><div class="jg-caption">Existing</div>';
    displayEntryCaption(entry, 'img', true);
    expect(captionFromEntry(entry)?.textContent).toBe('Existing');
  });

  it('creates a caption from the alt attribute when missing', () => {
    const entry = document.createElement('div');
    entry.innerHTML = '<img src="a.jpg" alt="A cat">';
    displayEntryCaption(entry, 'img', true);
    const caption = captionFromEntry(entry);
    expect(caption?.textContent).toBe('A cat');
    expect(entry.dataset.jgCreatedCaption).toBe('true');
  });

  it('falls back to the entry title attribute when alt is missing', () => {
    const entry = document.createElement('div');
    entry.setAttribute('title', 'A title caption');
    entry.innerHTML = '<img src="a.jpg">';
    displayEntryCaption(entry, 'img', true);
    expect(captionFromEntry(entry)?.textContent).toBe('A title caption');
  });

  it('creates no caption when neither alt nor title is valid', () => {
    const entry = document.createElement('div');
    entry.innerHTML = '<img src="a.jpg">';
    displayEntryCaption(entry, 'img', true);
    expect(captionFromEntry(entry)).toBeNull();
  });
});
