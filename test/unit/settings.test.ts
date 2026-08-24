import { describe, expect, it } from 'vitest';
import { JustifiedGallerySettingsDefaults } from '@/defaults';
import {
  checkSettings,
  checkSizeRangesSuffixes,
  JustifiedGallerySettings,
  LastRowModes,
  retrieveMaxRowHeight,
  retrieveSuffixRanges,
} from '@/settings';

function makeSettings(
  overrides: Partial<JustifiedGallerySettings> = {}
): JustifiedGallerySettings {
  return { ...JustifiedGallerySettingsDefaults, ...overrides };
}

describe('LastRowModes', () => {
  it('exposes the expected string values', () => {
    expect(LastRowModes.JUSTIFY).toBe('justify');
    expect(LastRowModes.NO_JUSTIFY).toBe('nojustify');
    expect(LastRowModes.LEFT).toBe('left');
    expect(LastRowModes.CENTER).toBe('center');
    expect(LastRowModes.RIGHT).toBe('right');
    expect(LastRowModes.HIDE).toBe('hide');
  });
});

describe('checkSizeRangesSuffixes', () => {
  it('leaves numeric keys as numbers', () => {
    const settings = makeSettings({
      sizeRangeSuffixes: { 100: '_t', 500: '' },
    });
    checkSizeRangesSuffixes(settings);
    expect(settings.sizeRangeSuffixes).toEqual({ 100: '_t', 500: '' });
  });

  it('converts prefixed string keys (e.g. lt100) to numbers', () => {
    const settings = makeSettings({
      sizeRangeSuffixes: { lt100: '_t', lt500: '' },
    });
    checkSizeRangesSuffixes(settings);
    expect(settings.sizeRangeSuffixes).toEqual({ 100: '_t', 500: '' });
  });

  it('throws when sizeRangeSuffixes is not an object', () => {
    const settings = makeSettings({
      sizeRangeSuffixes: null as unknown as Record<number, string>,
    });
    expect(() => checkSizeRangesSuffixes(settings)).toThrow(
      'sizeRangeSuffixes must be defined and must be an object'
    );
  });

  it('throws when a key has no numeric part', () => {
    const settings = makeSettings({
      sizeRangeSuffixes: { small: '_t' },
    });
    expect(() => checkSizeRangesSuffixes(settings)).toThrow(
      "sizeRangeSuffixes keys must contain correct numbers (invalid key 'small')"
    );
  });
});

describe('retrieveSuffixRanges', () => {
  it('returns the numeric keys sorted ascending', () => {
    const settings = makeSettings({
      sizeRangeSuffixes: { 500: '', 100: '_t', 240: '_m' },
    });
    expect(retrieveSuffixRanges(settings)).toEqual([100, 240, 500]);
  });
});

describe('checkSettings', () => {
  it('accepts the default settings without throwing', () => {
    expect(() => checkSettings(makeSettings())).not.toThrow();
  });

  it('converts numeric strings for rowHeight, margins, border, maxRowsCount', () => {
    const settings = makeSettings({
      rowHeight: '150' as unknown as number,
      margins: '5' as unknown as number,
      border: '2' as unknown as number,
      maxRowsCount: '3' as unknown as number,
    });
    checkSettings(settings);
    expect(settings.rowHeight).toBe(150);
    expect(settings.margins).toBe(5);
    expect(settings.border).toBe(2);
    expect(settings.maxRowsCount).toBe(3);
  });

  it('throws for an invalid lastRow value', () => {
    const settings = makeSettings({
      lastRow: 'invalid' as unknown as LastRowModes,
    });
    expect(() => checkSettings(settings)).toThrow(/lastRow must be one of/);
  });

  it('throws when justifyThreshold is outside [0, 1]', () => {
    const settings = makeSettings({ justifyThreshold: 1.5 });
    expect(() => checkSettings(settings)).toThrow(
      'justifyThreshold must be in the interval [0, 1]'
    );
  });

  it('throws when captions is not a boolean', () => {
    const settings = makeSettings({
      captions: 'yes' as unknown as boolean,
    });
    expect(() => checkSettings(settings)).toThrow('captions must be a boolean');
  });

  it('throws when randomize is not a boolean', () => {
    const settings = makeSettings({
      randomize: 'yes' as unknown as boolean,
    });
    expect(() => checkSettings(settings)).toThrow(
      'randomize must be a boolean'
    );
  });

  it('throws when selector is not a string', () => {
    const settings = makeSettings({
      selector: 123 as unknown as string,
    });
    expect(() => checkSettings(settings)).toThrow(
      'selector must be a string'
    );
  });

  it('throws when sort is neither false nor a function', () => {
    const settings = makeSettings({
      sort: 'name' as unknown as false,
    });
    expect(() => checkSettings(settings)).toThrow(
      'sort must be false or a comparison function'
    );
  });

  it('throws when filter is not false, a function, or a string', () => {
    const settings = makeSettings({
      filter: 123 as unknown as false,
    });
    expect(() => checkSettings(settings)).toThrow(
      'filter must be false, a string, or a filter function'
    );
  });

  it('accepts a string filter', () => {
    const settings = makeSettings({ filter: '.visible' });
    expect(() => checkSettings(settings)).not.toThrow();
  });
});

describe('retrieveMaxRowHeight', () => {
  it('returns undefined when maxRowHeight is false', () => {
    const settings = makeSettings({ rowHeight: 120, maxRowHeight: false });
    expect(retrieveMaxRowHeight(settings)).toBeUndefined();
  });

  it('returns the number when maxRowHeight is a plain number', () => {
    const settings = makeSettings({ rowHeight: 120, maxRowHeight: 300 });
    expect(retrieveMaxRowHeight(settings)).toBe(300);
  });

  it('resolves a percentage string relative to rowHeight', () => {
    const settings = makeSettings({ rowHeight: 100, maxRowHeight: '300%' });
    expect(retrieveMaxRowHeight(settings)).toBe(300);
  });

  it('clamps the result to be at least rowHeight', () => {
    const settings = makeSettings({ rowHeight: 200, maxRowHeight: 50 });
    expect(retrieveMaxRowHeight(settings)).toBe(200);
  });

  it('throws for an invalid maxRowHeight type', () => {
    const settings = makeSettings({
      rowHeight: 120,
      maxRowHeight: {} as unknown as number,
    });
    expect(() => retrieveMaxRowHeight(settings)).toThrow(
      'maxRowHeight must be a number or a percentage'
    );
  });

  it('throws for a non-numeric maxRowHeight string', () => {
    const settings = makeSettings({
      rowHeight: 120,
      maxRowHeight: 'abc',
    });
    expect(() => retrieveMaxRowHeight(settings)).toThrow(
      'Invalid number for maxRowHeight'
    );
  });
});
