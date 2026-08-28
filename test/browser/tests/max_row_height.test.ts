import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

test('maxRowHeight caps the height of an otherwise too-tall justified row', async ({
  page,
}) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await waitForCompletes(page, 2);

  const cappedHeight = await page.$eval('#capped > a', (el) =>
    parseFloat(window.getComputedStyle(el).height)
  );
  const uncappedHeight = await page.$eval('#uncapped > a', (el) =>
    parseFloat(window.getComputedStyle(el).height)
  );

  // With only two portrait images, a fully justified row is naturally much
  // taller than the configured rowHeight, unless maxRowHeight caps it.
  expect(cappedHeight).toBeLessThanOrEqual(120);
  expect(uncappedHeight).toBeGreaterThan(120);
});
