import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

test('square images stay square after layout', async ({ page }) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await waitForCompletes(page, 1);

  const entries = await page.$$eval('#gallery > a', (els) =>
    els.map((el) => {
      const style = window.getComputedStyle(el);
      return {
        width: parseFloat(style.width),
        height: parseFloat(style.height),
      };
    })
  );

  expect(entries.length).toBeGreaterThan(0);
  for (const entry of entries) {
    expect(Math.abs(entry.width - entry.height)).toBeLessThanOrEqual(2);
  }
});
