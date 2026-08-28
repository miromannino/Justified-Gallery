import { expect, test } from '@playwright/test';
import { getTestPageUrl, waitForCompletes } from './test-utils';

test('non-image entries (plain divs and image-less links) are laid out too', async ({
  page,
}) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await waitForCompletes(page, 1);

  // A plain <div> entry (no <a>, no <img>) still gets positioned by JG.
  const textDivStyle = await page.$eval('#textDiv', (el) => {
    const style = window.getComputedStyle(el);
    return { width: style.width, height: style.height, position: style.position };
  });
  expect(textDivStyle.position).toBe('absolute');
  expect(parseFloat(textDivStyle.width)).toBeGreaterThan(0);
  expect(parseFloat(textDivStyle.height)).toBeGreaterThan(0);

  // A <a> with a title but no <img> is laid out and does NOT get a
  // caption, since caption creation requires an image.
  const textLinkCaptionCount = await page.$eval(
    '#textLink',
    (el) => el.querySelectorAll('.jg-caption').length
  );
  expect(textLinkCaptionCount).toBe(0);
  const textLinkVisible = await page.$eval('#textLink', (el) =>
    el.classList.contains('jg-entry-visible')
  );
  expect(textLinkVisible).toBe(true);

  // A <a> with neither title nor image also gets laid out without a caption.
  const noTitleCaptionCount = await page.$eval(
    '#textLinkNoTitle',
    (el) => el.querySelectorAll('.jg-caption').length
  );
  expect(noTitleCaptionCount).toBe(0);

  // Regular image entries with a title still get their caption.
  const imageCaptionCounts = await page.$$eval(
    '#gallery > a:not(#textLink):not(#textLinkNoTitle)',
    (els) => els.map((el) => el.querySelectorAll('.jg-caption').length)
  );
  imageCaptionCounts.forEach((count) => expect(count).toBe(1));
});
