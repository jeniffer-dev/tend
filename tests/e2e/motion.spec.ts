import { expect, test } from '@playwright/test';

import { routes } from '../../lib/routes';

/**
 * Constitution Article V — `transition-colors` only, and reduced motion
 * honoured.
 *
 * The rule is easy to hold on day one and easy to lose one convenience at a
 * time, which is why it is asserted over every element on every route
 * rather than reviewed.
 */

/** The properties `transition-colors` is allowed to name. */
const COLOUR_PROPERTIES = new Set([
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'text-decoration-color',
  'fill',
  'stroke',
  'none',
  'all',
]);

for (const route of routes) {
  test(`${route.screen} (${route.href}) animates nothing but colour`, async ({ page }) => {
    await page.goto(route.href);

    const offenders = await page.evaluate((allowed) => {
      const out: string[] = [];
      for (const el of document.querySelectorAll('[data-testid="screen"] *')) {
        const style = getComputedStyle(el);
        const label = `${el.tagName} "${(el.textContent || '').trim().slice(0, 24)}"`;

        for (const property of style.transitionProperty.split(',').map((p) => p.trim())) {
          if (!property) continue;
          if (!allowed.includes(property)) {
            out.push(`${label} transitions ${property}`);
          }
        }

        if (style.animationName !== 'none') {
          out.push(`${label} runs animation ${style.animationName}`);
        }
      }
      return [...new Set(out)];
    }, [...COLOUR_PROPERTIES]);

    expect(offenders, `non-colour motion on ${route.href}`).toEqual([]);
  });
}

test.describe('prefers-reduced-motion is honoured', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const route of routes) {
    test(`${route.screen} (${route.href}) declares no duration under reduced motion`, async ({
      page,
    }) => {
      await page.goto(route.href);

      const moving = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll('[data-testid="screen"] *')) {
          const style = getComputedStyle(el);
          const durations = [style.transitionDuration, style.animationDuration]
            .join(',')
            .split(',')
            .map((d) => parseFloat(d.trim()))
            .filter((d) => !Number.isNaN(d));

          if (durations.some((d) => d > 0)) {
            out.push(`${el.tagName} "${(el.textContent || '').trim().slice(0, 24)}"`);
          }
        }
        return [...new Set(out)];
      });

      expect(moving, `motion survives reduced-motion on ${route.href}`).toEqual([]);
    });
  }
});

test('no spinner exists anywhere in the product', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route.href);
    await expect(
      page.getByTestId('screen').locator('[role="progressbar"], .animate-spin, progress'),
      `${route.href} renders a spinner`
    ).toHaveCount(0);
  }
});
