import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

test('entries can be a <div> wrapping a <a><img></a>, with images sized correctly', async ({
  page,
}) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await waitForCompletes(page, 1);

  // Each top-level <div> is treated as the entry and gets positioned.
  const entries = await page.$$eval('#gallery > div', (els) =>
    els.map((el) => {
      const style = window.getComputedStyle(el);
      return { left: parseFloat(style.left), top: parseFloat(style.top), width: parseFloat(style.width) };
    })
  );
  expect(entries.length).toBeGreaterThan(0);

  // The nested <img> (inside <div> > <a> > <img>) is found and sized too.
  const images = await page.$$eval('#gallery > div img', (imgs) =>
    imgs.map((img) => {
      const style = window.getComputedStyle(img);
      return { width: parseFloat(style.width), height: parseFloat(style.height) };
    })
  );
  expect(images.length).toBe(entries.length);
  images.forEach((img) => {
    expect(img.width).toBeGreaterThan(0);
    expect(img.height).toBeGreaterThan(0);
  });

  // Adjacent entries within the same row are separated by the configured margins.
  const firstRowTop = entries[0].top;
  const firstRow = entries.filter((e) => e.top === firstRowTop);
  for (let i = 1; i < firstRow.length; i++) {
    const gap = firstRow[i].left - (firstRow[i - 1].left + firstRow[i - 1].width);
    expect(gap).toBeCloseTo(15, 0);
  }
});
