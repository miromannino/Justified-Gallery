// playwright.config.ts (or vitest.workspace.ts if integrating)
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  name: 'browser',
  testDir: './test/browser',
  reporter: [['list'], ['json', { outputFile: 'e2e-results.json' }]],
  use: {
    headless: !!process.env.CI,
    viewport: { width: 700, height: 700 },
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
