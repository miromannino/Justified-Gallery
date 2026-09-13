import { expect, test } from '@playwright/test';
import { getTestPageUrl } from './test-utils';

test('should load the test page correctly', async ({ page }) => {
  await page.goto(getTestPageUrl(import.meta.url));
});

test('gallery should be set correctly', async ({ page }) => {
  await page.goto(getTestPageUrl(import.meta.url));

  // Test if a div with id "gallery" exists
  const gallery = await page.$('#gallery');
  expect(gallery).not.toBeNull();

  // Test if the gallery contains all links
  const links = await page.$$('#gallery a');
  expect(links.length).toBeGreaterThan(0);
});

test('images hidden by CSS before justified gallery runs, revealed once complete', async ({
  page,
}) => {
  await page.route('**/src/justified-gallery.ts*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.continue();
  });

  await page.goto(getTestPageUrl(import.meta.url), { waitUntil: 'commit' });
  await page.waitForSelector('#gallery > a', { state: 'attached' });
  await page.waitForFunction(() => document.styleSheets.length > 0);

  const firstLink = page.locator('#gallery > a').first();
  const hiddenOpacity = await firstLink.evaluate((el) =>
    parseFloat(window.getComputedStyle(el).opacity)
  );
  expect(hiddenOpacity).toBeLessThan(1);

  await expect(firstLink).toHaveClass(/jg-entry-visible/, { timeout: 5000 });
  const visibleOpacity = await firstLink.evaluate((el) =>
    parseFloat(window.getComputedStyle(el).opacity)
  );
  expect(visibleOpacity).toBe(1);
});

test('gallery should receive CSS correctly', async ({ page }) => {
  await page.goto(getTestPageUrl(import.meta.url));

  // Test if the div has position relative and overflow set to hidden
  const gallery = await page.$('#gallery');
  const computedStyles = await page.evaluate((element) => {
    return window.getComputedStyle(element!);
  }, gallery);
  expect(computedStyles.position).toBe('relative');
  expect(computedStyles.overflow).toBe('hidden');

  // Test if the gallery links are with position absolute
  const links = await page.$$('#gallery a');
  for (const link of links) {
    const linkStyle = await page.evaluate((element) => {
      return window.getComputedStyle(element!);
    }, link);
    expect(linkStyle.position).toBe('absolute');
  }
});
