import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/* Vitest covers the copy lint only — scanning the user-facing strings of
   lib/copy.ts and lib/fixtures.ts for the Article II lexicon, emoji and
   exclamation marks. There is no DOM here on purpose: every criterion that
   needs a layout engine is a Playwright test (research.md §1). */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
