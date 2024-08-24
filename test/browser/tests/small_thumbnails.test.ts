import { expect, test } from '@playwright/test';
import { getTestPageUrl } from './test-utils';

test('should load larger images after initial thumbnails', async ({ page }) => {
  await page.goto(getTestPageUrl(import.meta.url));
  await page.waitForSelector('#gallery img');

  // check that all images initially have filenames ending with '_t'
  const initialImagesWithThumbnail = await page.$$eval('#gallery img', (imgs) =>
    imgs.map((img) => (img as HTMLImageElement).src)
  );
  expect(initialImagesWithThumbnail.length).toBe(
    await page.$$eval('#gallery img', (imgs) => imgs.length)
  );

  await page.evaluate(() => {
    window.jg.init(); // Call init on the global JustifiedGallery object
  });

  await page.waitForFunction(() => {
    // Check that there are no images with '_t' in their filenames anymore
    const images = Array.from(
      document.querySelectorAll('#gallery img')
    ) as HTMLImageElement[];
    return images.every((img) => !img.src.includes('_t')); // All images should no longer have '_t'
  });

  // validate that all images are now larger
  const imagesWithoutThumbnail = await page.$$eval('#gallery img', (images) =>
    images
      .map((img) => (img as HTMLImageElement).src)
      .filter((src) => !src.includes('_t'))
  );

  // Assert that all images no longer have '_t' in their filenames
  expect(imagesWithoutThumbnail.length).toBe(
    await page.$$eval('#gallery img', (imgs) => imgs.length)
  );
});
