import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

test('a gallery of identical images produces a uniform grid', async ({ page }) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await waitForCompletes(page, 1);

  const entries = await page.$$eval('#gallery > a', (els) =>
    els.map((el) => {
      const style = window.getComputedStyle(el);
      return {
        top: parseFloat(style.top),
        width: parseFloat(style.width),
        height: parseFloat(style.height),
      };
    })
  );

  // Every non-last row has entries of identical (square) size.
  const rowTops = [...new Set(entries.map((e) => e.top))].sort((a, b) => a - b);
  expect(rowTops.length).toBeGreaterThan(1);

  for (const top of rowTops.slice(0, -1)) {
    const row = entries.filter((e) => e.top === top);
    for (const entry of row) {
      expect(Math.abs(entry.width - row[0].width)).toBeLessThanOrEqual(2);
      expect(Math.abs(entry.height - row[0].height)).toBeLessThanOrEqual(2);
      expect(Math.abs(entry.width - entry.height)).toBeLessThanOrEqual(2); // still square
    }
  }
});
