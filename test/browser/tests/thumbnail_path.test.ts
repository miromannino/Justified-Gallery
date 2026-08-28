import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

test('a custom thumbnailPath function overrides the default sizeRangeSuffixes logic', async ({
  page,
}) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await waitForCompletes(page, 1);

  const srcs = await page.$$eval('#gallery img', (imgs) =>
    imgs.map((img) => (img as HTMLImageElement).src)
  );

  expect(srcs.length).toBeGreaterThan(0);
  // The default suffix logic (based on rowHeight 300) would have picked
  // the "_z" thumbnail; the custom thumbnailPath always forces "_b".
  srcs.forEach((src) => {
    expect(src).toMatch(/_b\.jpg$/);
  });
});
