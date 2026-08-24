import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

test('maxRowsCount limits the gallery to the given number of rows', async ({
  page,
}) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await waitForCompletes(page, 1);

  const entries = await page.$$eval('#gallery > a', (els) =>
    els.map((el) => ({
      top: parseFloat(window.getComputedStyle(el).top) || 0,
      visible: el.classList.contains('jg-entry-visible'),
    }))
  );

  const visibleEntries = entries.filter((e) => e.visible);
  const hiddenEntries = entries.filter((e) => !e.visible);

  // There are enough images to naturally form more than 2 rows.
  expect(hiddenEntries.length).toBeGreaterThan(0);

  // Only entries from the first 2 rows are visible.
  const visibleRows = new Set(visibleEntries.map((e) => e.top));
  expect(visibleRows.size).toBe(2);
});
