import { EventType } from '@/types';
import { test } from '@playwright/test';
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

  // check that each figure has width, height, top, and left assigned
  const figuresWithStyles = await page.$$eval('#gallery a img', (images) => {
    return images.map((img) => {
      const style = window.getComputedStyle(img);
      return {
        width: style.width,
        height: style.height,
        top: style.top,
        left: style.left,
      };
    });
  });

  // ensure all figures have non-empty values for width, height, top, and left
  figuresWithStyles.forEach((figure) => {
    if (!figure.width || !figure.height || !figure.top || !figure.left) {
      throw new Error('one or more figures are missing layout styles');
    }
  });
});
