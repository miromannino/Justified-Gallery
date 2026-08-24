import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

const CONFIGS: { id: string; margins: number; border: number }[] = [
  { id: 'margin0', margins: 0, border: 0 }, // border < 0 defaults to margins
  { id: 'margin1', margins: 1, border: 1 },
  { id: 'margin10', margins: 10, border: 10 },
  { id: 'margin20', margins: 20, border: 20 },
  { id: 'margin20border0', margins: 20, border: 0 },
  { id: 'margin20border5', margins: 20, border: 5 },
  { id: 'margin0border20', margins: 0, border: 20 },
];

test('margins and border control the spacing between and around entries', async ({
  page,
}) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await waitForCompletes(page, CONFIGS.length);

  for (const { id, margins, border } of CONFIGS) {
    const entries = await page.$$eval(`#${id} > a`, (els) =>
      els.map((el) => {
        const style = window.getComputedStyle(el);
        return {
          left: parseFloat(style.left),
          top: parseFloat(style.top),
          width: parseFloat(style.width),
          height: parseFloat(style.height),
        };
      })
    );

    // The first entry must be offset from the gallery edge by exactly `border`.
    expect(entries[0].left).toBeCloseTo(border, 0);
    expect(entries[0].top).toBeCloseTo(border, 0);

    // Adjacent entries within the same row must be separated by `margins`.
    const firstRowTop = entries[0].top;
    const firstRow = entries.filter((e) => e.top === firstRowTop);
    for (let i = 1; i < firstRow.length; i++) {
      const gap = firstRow[i].left - (firstRow[i - 1].left + firstRow[i - 1].width);
      expect(gap).toBeCloseTo(margins, 0);
    }

    // Rows must be separated vertically by `margins`.
    const rowTops = [...new Set(entries.map((e) => e.top))].sort((a, b) => a - b);
    if (rowTops.length > 1) {
      const firstRowHeight = Math.max(
        ...entries.filter((e) => e.top === rowTops[0]).map((e) => e.height)
      );
      const rowGap = rowTops[1] - (rowTops[0] + firstRowHeight);
      expect(rowGap).toBeCloseTo(margins, 0);
    }
  }
});
