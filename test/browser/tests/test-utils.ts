import path from 'path';
import { fileURLToPath } from 'url';
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
