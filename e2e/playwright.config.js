// @ts-check
import { defineConfig, devices } from '@playwright/test';

const CHROME = { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } };

export default defineConfig({
  testDir: '.',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:4323',
    screenshot: 'on',
    trace: 'off',
  },
  projects: [
    {
      // cms.spec.js — read-only page rendering tests, run in parallel
      name: 'cms',
      testMatch: 'cms.spec.js',
      use: { ...CHROME },
    },
    {
      // after.spec.js — rebuilds Astro; runs AFTER cms so it doesn't race
      name: 'cms-after',
      testMatch: 'after.spec.js',
      use: { ...CHROME },
      dependencies: ['cms'],
    },
  ],
  // No webServer — preview must be started manually before running tests
});
