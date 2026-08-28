import { describe, expect, it } from 'vitest';
import { JustifiedGallerySettingsDefaults } from '@/defaults';
import { LastRowModes } from '@/settings';

describe('JustifiedGallerySettingsDefaults', () => {
  it('has sane default values', () => {
    expect(JustifiedGallerySettingsDefaults.rowHeight).toBe(120);
    expect(JustifiedGallerySettingsDefaults.margins).toBe(1);
    expect(JustifiedGallerySettingsDefaults.border).toBe(-1);
    expect(JustifiedGallerySettingsDefaults.maxRowHeight).toBe(false);
    expect(JustifiedGallerySettingsDefaults.maxRowsCount).toBe(0);
    expect(JustifiedGallerySettingsDefaults.lastRow).toBe(
      LastRowModes.NO_JUSTIFY
    );
    expect(JustifiedGallerySettingsDefaults.justifyThreshold).toBe(0.9);
    expect(JustifiedGallerySettingsDefaults.captions).toBe(true);
    expect(JustifiedGallerySettingsDefaults.randomize).toBe(false);
    expect(JustifiedGallerySettingsDefaults.rtl).toBe(false);
    expect(JustifiedGallerySettingsDefaults.sort).toBe(false);
    expect(JustifiedGallerySettingsDefaults.filter).toBe(false);
    expect(JustifiedGallerySettingsDefaults.selector).toBe('a');
    expect(JustifiedGallerySettingsDefaults.imgSelector).toBe(
      'img, a > img, svg, a > svg'
    );
  });

  it('has a valid extension regexp that matches file extensions', () => {
    const match = 'photo.jpg'.match(JustifiedGallerySettingsDefaults.extension);
    expect(match?.[0]).toBe('.jpg');
  });

  it('has a triggerEvent no-op that does not throw', () => {
    expect(() => JustifiedGallerySettingsDefaults.triggerEvent).not.toThrow();
  });

  it('defines a suffix for every documented size range', () => {
    expect(JustifiedGallerySettingsDefaults.sizeRangeSuffixes).toEqual({
      100: '_t',
      240: '_m',
      320: '_n',
      500: '',
      640: '_z',
      1024: '_b',
    });
  });
});
