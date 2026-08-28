import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

test('broken images are skipped without blocking the gallery from completing', async ({
  page,
}) => {
  await page.goto(getTestPageUrl(import.meta.url));

  // The 'jg.complete' event must still fire even though some images 404.
  await waitForCompletes(page, 1);

  const entries = await page.$$eval('#gallery > a', (els) =>
    els.map((el) => ({
      title: el.getAttribute('title'),
      visible: el.classList.contains('jg-entry-visible'),
    }))
  );

  const broken = entries.filter((e) => e.title?.startsWith('broken'));
  const valid = entries.filter((e) => !e.title?.startsWith('broken'));

  expect(valid.length).toBe(2);
  expect(broken.length).toBe(3);

  valid.forEach((entry) => expect(entry.visible).toBe(true));
  broken.forEach((entry) => expect(entry.visible).toBe(false));
});
