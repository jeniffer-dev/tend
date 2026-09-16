import { defineConfig, devices } from '@playwright/test';

/* Two projects, one per required width. Both name the width so a failure
   reads `44px minimum [320]` and tells you the control is fine on the
   design width and too small on the narrow one (quickstart.md).

   390px is the constitution's design width (Article IV); 320px was
   requested for this feature and is a second required width, not a
   replacement (spec.md §Assumptions). */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: '390',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
    {
      name: '320',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 568 } },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
