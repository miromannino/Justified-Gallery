import path from 'path';
import { fileURLToPath } from 'url';
import type { Page } from '@playwright/test';
import { SERVER_CONFIG } from '../../../vite.config';

const BASE_URL = `http://${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`;

/**
 * Generates the URL for the test HTML page that corresponds to the test file.
 * @param importMetaUrl The `import.meta.url` of the test file.
 * @returns The URL to the HTML page corresponding to the test file.
 */
export function getTestPageUrl(importMetaUrl: string): string {
  // Convert importMetaUrl to a file path
  const __filename = fileURLToPath(importMetaUrl);

  // Extract the file name without extension and add '.html'
  const testFileName = path.basename(__filename).split('.').shift() || '';

  return `${BASE_URL}/html/${testFileName}.html`;
}

/**
 * Waits until at least `count` `jg.complete` events have been recorded by
 * the page (via `window.jgCompletedCount`, incremented by a shared
 * `window.jgTriggerEvent` handler set up in the test page's script).
 * @param page The Playwright page.
 * @param count The number of completed galleries to wait for.
 */
export async function waitForCompletes(page: Page, count: number): Promise<void> {
  await page.waitForFunction(
    (n) => window.jgCompletedCount >= n,
    count
  );
}
