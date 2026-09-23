import { expect, test } from '@playwright/test';

import { routes } from '../../lib/routes';

/**
 * FR-005 and Constitution Article I — no streak, badge, level or completion
 * percentage, on any screen.
 *
 * tests/unit/copy.test.ts covers the words. This is the rendered half: a
 * percentage can reach the screen as a bar's width or a meter element
 * without any string containing the word.
 */

for (const route of routes) {
  test.describe(`${route.screen} (${route.href})`, () => {
    test.beforeEach(async ({ page }) => await page.goto(route.href));

    test('renders no percentage', async ({ page }) => {
      const text = await page.getByTestId('screen').innerText();
      expect(text, `${route.href} renders a % character`).not.toContain('%');
    });

    test('renders no progress or meter element', async ({ page }) => {
      await expect(
        page.getByTestId('screen').locator('progress, meter, [role="progressbar"], [role="meter"]')
      ).toHaveCount(0);
    });

    test('renders no streak, badge, level or day count', async ({ page }) => {
      const text = await page.getByTestId('screen').innerText();
      // Whole words: `level` must not match `levelled`, and more to the
      // point `late` must not match `later` — Capture's note ends "where
      // you can sort it later", which is the voice this rule protects
      // rather than a violation of it.
      for (const word of ['streak', 'badge', 'level', 'points', 'score', 'rank']) {
        expect(text, `${route.href} renders "${word}"`).not.toMatch(new RegExp(`\\b${word}s?\\b`, 'i'));
      }
      for (const phrase of ['in a row', 'day streak', 'keep it up', 'you are behind']) {
        expect(text.toLowerCase(), `${route.href} renders "${phrase}"`).not.toContain(phrase);
      }
    });

    /* FR-002's most likely symptom. A proportion reaching the screen as a
       width is how a percentage gets in without a `%` anywhere: an element
       sized to a fraction of its parent is a computed completion figure
       whatever it is called. The 2px bars the WEEK artboard draws are
       exactly this shape, which is why they are not built. */
    test('no element is sized to a fraction of its parent', async ({ page }) => {
      const proportional = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll('[data-testid="screen"] *')) {
          const width = (el as HTMLElement).style.width;
          if (width && width.endsWith('%') && width !== '100%') {
            out.push(`${el.tagName} width:${width}`);
          }
        }
        return out;
      });
      expect(proportional, `${route.href} sizes an element by proportion`).toEqual([]);
    });
  });
}

test('Article I — no screen tells the person they are behind', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route.href);
    const text = await page.getByTestId('screen').innerText();
    for (const word of ['overdue', 'missed', 'failed', 'behind', 'late', 'slipping']) {
      expect(text, `${route.href} says "${word}"`).not.toMatch(new RegExp(`\\b${word}\\b`, 'i'));
    }
  }
});
