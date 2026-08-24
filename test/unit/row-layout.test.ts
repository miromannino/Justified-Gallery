// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  BuildingRow,
  clearBuildingRow,
  prepareBuildingRow,
  RowLayoutContext,
} from '@/row-layout';
import { LastRowModes } from '@/settings';

function makeEntry(width: number, height: number): HTMLElement {
  const entry = document.createElement('a');
  entry.dataset.jgWidth = width.toString();
  entry.dataset.jgHeight = height.toString();
  entry.classList.add('jg-entry-visible');
  return entry;
}

function makeRow(entries: HTMLElement[]): BuildingRow {
  const aspectRatio = entries.reduce((sum, e) => {
    return (
      sum +
      parseFloat(e.dataset.jgWidth ?? '0') / parseFloat(e.dataset.jgHeight ?? '1')
    );
  }, 0);
  return { entriesBuff: entries, aspectRatio, width: 0, height: 0 };
}

function baseCtx(overrides: Partial<RowLayoutContext> = {}): RowLayoutContext {
  return {
    galleryWidth: 1000,
    border: 0,
    margins: 10,
    justifyThreshold: 0.9,
    rowHeight: 200,
    lastRow: LastRowModes.NO_JUSTIFY,
    rows: 0,
    offY: 0,
    ...overrides,
  };
}

describe('clearBuildingRow', () => {
  it('resets the buffer, aspect ratio and width', () => {
    const row: BuildingRow = {
      entriesBuff: [makeEntry(100, 100)],
      aspectRatio: 1,
      width: 100,
      height: 50,
    };
    clearBuildingRow(row);
    expect(row.entriesBuff).toEqual([]);
    expect(row.aspectRatio).toBe(0);
    expect(row.width).toBe(0);
    // height is intentionally left untouched by clearBuildingRow
    expect(row.height).toBe(50);
  });
});

describe('prepareBuildingRow', () => {
  it('justifies a full (non-last) row to fill the available width', () => {
    const entries = [makeEntry(300, 200), makeEntry(300, 200)];
    const row = makeRow(entries);
    const ctx = baseCtx();

    const result = prepareBuildingRow(row, ctx, false);

    expect(result).toBe(true);
    const totalWidth = entries.reduce(
      (sum, e) => sum + parseFloat(e.dataset.jgJwidth ?? '0'),
      0
    );
    const availableWidth = ctx.galleryWidth - 2 * ctx.border - ctx.margins;
    expect(totalWidth).toBe(availableWidth);
    expect(row.height).toBeGreaterThan(0);
  });

  it('does not justify a sparse last row when lastRow is nojustify', () => {
    const entries = [makeEntry(100, 200)];
    const row = makeRow(entries);
    const ctx = baseCtx({ lastRow: LastRowModes.NO_JUSTIFY });

    const result = prepareBuildingRow(row, ctx, true);

    expect(result).toBe(false);
    expect(parseFloat(entries[0].dataset.jgJheight ?? '0')).toBe(
      ctx.rowHeight
    );
  });

  it('hides the row when lastRow is hide and it is not justifiable', () => {
    const entries = [makeEntry(100, 200)];
    const row = makeRow(entries);
    const ctx = baseCtx({ lastRow: LastRowModes.HIDE });

    const result = prepareBuildingRow(row, ctx, true);

    expect(result).toBe(-1);
    expect(entries[0].classList.contains('jg-entry-visible')).toBe(false);
  });

  it('hides the row unconditionally when hiddenRow is true', () => {
    const entries = [makeEntry(300, 200), makeEntry(300, 200)];
    const row = makeRow(entries);
    const ctx = baseCtx();

    const result = prepareBuildingRow(row, ctx, false, true);

    expect(result).toBe(-1);
    entries.forEach((entry) =>
      expect(entry.classList.contains('jg-entry-visible')).toBe(false)
    );
  });

  it('always justifies the last row when lastRow is justify', () => {
    const entries = [makeEntry(100, 200)];
    const row = makeRow(entries);
    const ctx = baseCtx({ lastRow: LastRowModes.JUSTIFY });

    const result = prepareBuildingRow(row, ctx, true);

    expect(result).toBe(true);
    const availableWidth = ctx.galleryWidth - 2 * ctx.border;
    expect(parseFloat(entries[0].dataset.jgJwidth ?? '0')).toBe(
      availableWidth
    );
  });
});
