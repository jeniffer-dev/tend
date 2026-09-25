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
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: '390',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
      /* A test only meaningful at the narrow width says so with a tag and is
         scoped here, not skipped inside itself: a skip reports a test that
         did not run, and Article VII does not let a test disappear quietly. */
      grepInvert: /@320-only/,
    },
    {
      name: '320',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 568 } },
    },
  ],
  /* A production build, on its own port, in its own dist directory.
     `next dev` compiles a route the first time it is requested, and a suite
     that navigates the same dozen routes over and over ends up measuring
     the compiler rather than the app: the same specs that pass in under a
     minute against a built server took 16 minutes parallel and 29 minutes
     serial against `next dev`, failing a different handful of navigations
     each run. Port 3001 and NEXT_DIST_DIR keep this off whatever is serving
     the phone on 3000.

     NEXT_DIST_DIR goes through `env`, not a `VAR=value cmd` prefix: the
     prefix is POSIX shell syntax, and on Windows the command runs in
     cmd.exe, which does not understand it. `&&` means the same in both. */
  webServer: {
    command: 'npm run build && npx next start --port 3001',
    env: { NEXT_DIST_DIR: '.next-test' },
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
