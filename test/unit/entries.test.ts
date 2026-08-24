// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  filterArray,
  getAllEntries,
  getNextEntries,
  insertToGallery,
  resetFilters,
} from '@/entries';

function makeGallery(html: string): HTMLElement {
  const gallery = document.createElement('div');
  gallery.innerHTML = html;
  return gallery;
}

describe('getAllEntries', () => {
  it('returns direct children matching the selector', () => {
    const gallery = makeGallery('<a href="#"></a><a href="#"></a><span></span>');
    const entries = getAllEntries(gallery, 'a');
    expect(entries).toHaveLength(2);
  });

  it('also includes div children even when the selector does not match them', () => {
    const gallery = makeGallery('<a href="#"></a><div></div><span></span>');
    const entries = getAllEntries(gallery, 'a');
    expect(entries.map((e) => e.tagName)).toEqual(['A', 'DIV']);
  });

  it('excludes the spinner element', () => {
    const gallery = makeGallery(
      '<a href="#"></a><div class="jg-spinner"></div>'
    );
    const entries = getAllEntries(gallery, 'a');
    expect(entries).toHaveLength(1);
    expect(entries[0].tagName).toBe('A');
  });
});

describe('getNextEntries', () => {
  it('returns the siblings after the given entry that match the selector', () => {
    const gallery = makeGallery(
      '<a id="a1" href="#"></a><a id="a2" href="#"></a><span></span><a id="a3" href="#"></a>'
    );
    const first = gallery.querySelector('#a1') as HTMLElement;
    const next = getNextEntries(first, 'a');
    expect(next.map((e) => e.id)).toEqual(['a2', 'a3']);
  });

  it('excludes the spinner from the siblings', () => {
    const gallery = makeGallery(
      '<a id="a1" href="#"></a><div class="jg-spinner"></div><a id="a2" href="#"></a>'
    );
    const first = gallery.querySelector('#a1') as HTMLElement;
    const next = getNextEntries(first, 'a');
    expect(next.map((e) => e.id)).toEqual(['a2']);
  });

  it('returns an empty array when there are no more siblings', () => {
    const gallery = makeGallery('<a id="a1" href="#"></a>');
    const first = gallery.querySelector('#a1') as HTMLElement;
    expect(getNextEntries(first, 'a')).toEqual([]);
  });
});

describe('insertToGallery', () => {
  it('appends the entries to the gallery in order', () => {
    const gallery = document.createElement('div');
    const e1 = document.createElement('a');
    e1.id = 'e1';
    const e2 = document.createElement('a');
    e2.id = 'e2';
    insertToGallery(gallery, [e2, e1]);
    expect(Array.from(gallery.children).map((c) => c.id)).toEqual([
      'e2',
      'e1',
    ]);
  });
});

describe('resetFilters', () => {
  it('removes the jg-filtered class from all entries', () => {
    const e1 = document.createElement('a');
    e1.classList.add('jg-filtered');
    const e2 = document.createElement('a');
    e2.classList.add('jg-filtered');
    resetFilters([e1, e2]);
    expect(e1.classList.contains('jg-filtered')).toBe(false);
    expect(e2.classList.contains('jg-filtered')).toBe(false);
  });
});

describe('filterArray', () => {
  it('returns all entries unchanged when filter is false', () => {
    const e1 = document.createElement('a');
    const entries = [e1];
    expect(filterArray(entries, false)).toBe(entries);
  });

  it('filters using a CSS selector string', () => {
    const e1 = document.createElement('a');
    e1.classList.add('keep');
    const e2 = document.createElement('a');

    const result = filterArray([e1, e2], '.keep');

    expect(result).toEqual([e1]);
    expect(e1.classList.contains('jg-filtered')).toBe(false);
    expect(e2.classList.contains('jg-filtered')).toBe(true);
  });

  it('marks non-matching entries as filtered and removes visibility', () => {
    const e2 = document.createElement('a');
    e2.classList.add('jg-entry-visible');
    filterArray([e2], '.keep');
    expect(e2.classList.contains('jg-filtered')).toBe(true);
    expect(e2.classList.contains('jg-entry-visible')).toBe(false);
  });

  it('filters using a predicate function', () => {
    const e1 = document.createElement('a');
    const e2 = document.createElement('a');
    const result = filterArray([e1, e2], (entry) => entry === e1);
    expect(result).toEqual([e1]);
    expect(e1.classList.contains('jg-filtered')).toBe(false);
    expect(e2.classList.contains('jg-filtered')).toBe(true);
  });
});
