import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

test('randomize lays out entries in an order different from the DOM order', async ({
  page,
}) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await waitForCompletes(page, 1);

  const entries = await page.$$eval('#gallery > a', (els) =>
    els.map((el) => {
      const style = window.getComputedStyle(el);
      return { top: parseFloat(style.top), left: parseFloat(style.left) };
    })
  );

  // The DOM order is unchanged by randomize (entries are positioned, not
  // moved); recover the visual (reading) order and compare it to the
  // original DOM index order.
  const visualOrder = entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => a.entry.top - b.entry.top || a.entry.left - b.entry.left)
    .map((e) => e.index);

  const domOrder = entries.map((_, index) => index);

  // With 15 entries, the chance of the shuffled visual order matching the
  // original DOM order by chance is astronomically small.
  expect(visualOrder).not.toEqual(domOrder);
});
