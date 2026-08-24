import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

test('portrait images keep their aspect ratio and pack multiple per row', async ({
  page,
}) => {
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

  // Every entry stays portrait (narrower than it is tall).
  for (const entry of entries) {
    expect(entry.width).toBeLessThan(entry.height);
  }

  // With a rowHeight of 400 and ~9:16 images, several fit side by side in
  // a 700px-wide viewport.
  const firstRowTop = entries[0].top;
  const firstRowCount = entries.filter((e) => e.top === firstRowTop).length;
  expect(firstRowCount).toBeGreaterThan(1);
});
