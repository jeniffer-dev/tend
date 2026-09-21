import { expect, test } from '@playwright/test';

/**
 * The primary action sits at the bottom of the viewport on every screen that
 * has one — Constitution Article IV, thumb reach.
 *
 * This exists because it broke quietly. `sticky bottom-0` alone only pins
 * the bar once the content is tall enough to scroll, so on a short screen
 * the action floated directly under the last paragraph with half a phone of
 * empty space beneath it. The first fix did not work either, and the reason
 * is worth a test rather than a comment: Tailwind's `space-y-4` on the page
 * container sets `margin-top` *and* `margin-bottom` on every later sibling,
 * so a footer placed as a direct child silently lost both its `mt-auto` and
 * its `-mb-8` and sat 32px short.
 *
 * Nothing about either failure is visible to a test that only asks whether
 * the button is on the page.
 */

const SCREENS_WITH_A_FOOTER = [
  '/',
  '/tend/health',
  '/session/book-the-blood-test',
  '/areas',
  '/capture',
];

for (const route of SCREENS_WITH_A_FOOTER) {
  test(`the footer reaches the bottom of the viewport on ${route}`, async ({ page }) => {
    await page.goto(route);

    const measured = await page.evaluate(() => {
      const all = [...document.querySelectorAll('[data-testid="screen"] *')];
      const bar = all.find((el) => getComputedStyle(el).position === 'sticky');
      if (!bar) return null;
      const action = bar.querySelector('a, button');
      return {
        barBottom: bar.getBoundingClientRect().bottom,
        actionBottom: action?.getBoundingClientRect().bottom ?? null,
        viewport: window.innerHeight,
      };
    });

    expect(measured, `no sticky footer found on ${route}`).not.toBeNull();

    // Flush with the bottom edge: the page container's own pb-8 must not
    // leave a band of background under the bar.
    expect(Math.round(measured!.viewport - measured!.barBottom)).toBe(0);

    // And the action itself is within thumb reach of that edge, rather than
    // stranded further up the screen.
    expect(measured!.viewport - measured!.actionBottom!).toBeLessThanOrEqual(80);
  });
}
