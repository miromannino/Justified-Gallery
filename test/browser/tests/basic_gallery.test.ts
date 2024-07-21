import { expect, test } from '@playwright/test';
import { getTestPageUrl } from './test-utils';

test('should load the test page correctly', async ({ page }) => {
  // Navigate to the test HTML page served by the Vite dev server
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
