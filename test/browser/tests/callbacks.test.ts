import { EventType } from '@/types';
import { expect, test } from '@playwright/test';
import { getTestPageUrl } from './test-utils';

test('should track event counts correctly', async ({ page }) => {
  const eventCounts: { [key in EventType]: number } = Object.values(
    EventType
  ).reduce(
    (acc, eventType) => ({ ...acc, [eventType]: 0 }),
    {} as { [key in EventType]: number }
  );

  let completeEventPromiseResolve: () => void;
  const completeEventPromise = new Promise<void>((resolve) => {
    completeEventPromiseResolve = resolve;
  });

  await page.exposeFunction('trackEvent', (eventName: EventType) => {
    eventCounts[eventName]++;

    if (eventName === EventType.Complete) {
      completeEventPromiseResolve();
    }
  });

  await page.goto(getTestPageUrl(import.meta.url));
  await page.waitForSelector('#gallery');
  await page.setViewportSize({ width: 700, height: 1200 });
  await completeEventPromise;

  // Test that callbacks are called
  expect(eventCounts[EventType.Complete]).toBe(1);
  expect(eventCounts[EventType.RowFlush]).toBe(4);
  expect(eventCounts[EventType.Destroy]).toBe(0);
});
