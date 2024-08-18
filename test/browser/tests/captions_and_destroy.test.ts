import { EventType } from '@/types';
import { expect, test } from '@playwright/test';
import { getTestPageUrl } from './test-utils';

test('validate captions and destroy', async ({ page }) => {
  let completeEventPromiseResolve: () => void;
  const completeEventPromise = new Promise<void>((resolve) => {
    completeEventPromiseResolve = resolve;
  });

  await page.exposeFunction('trackEvent', (eventName: EventType) => {
    if (eventName === EventType.Complete) {
      completeEventPromiseResolve();
    }
  });

  await page.goto(getTestPageUrl(import.meta.url));

  await page.evaluate(() => {
    window.jg.init();
  });

  await completeEventPromise;

  // check that each link has exactly one caption after initialization
  const linksWithCaptions = await page.$$eval('#gallery a', (links) => {
    return links.map((link) => ({
      href: link.getAttribute('href'),
      captionCount: link.querySelectorAll('.jg-caption').length,
      hasAltText: link.querySelector('img')?.alt || '',
    }));
  });

  // assert that every link has exactly one caption
  linksWithCaptions.forEach((link) => {
    expect(link.captionCount).toBe(1); // Each link should have exactly 1 caption
  });

  await page.evaluate(() => {
    window.jg.destroy(); // Destroy the gallery
  });

  // check that after destroy, only the first image retains its caption
  const linksAfterDestroy = await page.$$eval('#gallery a', (links) => {
    return links.map((link) => ({
      href: link.getAttribute('href'),
      captionCount: link.querySelectorAll('.jg-caption').length,
    }));
  });

  // assert that only the first link retains its caption after destroy
  expect(linksAfterDestroy[0].captionCount).toBe(1);
  linksAfterDestroy.slice(1).forEach((link) => {
    expect(link.captionCount).toBe(0);
  });
});
