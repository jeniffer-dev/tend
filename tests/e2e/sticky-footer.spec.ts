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
  '/week',
  '/review',
  '/first-run',
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

/**
 * The bar must not cover the end of the content.
 *
 * A bar pinned with `sticky bottom-0` sits over whatever is beneath it for
 * the whole of the scroll and only uncovers it at the very last pixel —
 * where, before this was fixed, the last line landed flush against the bar
 * with a gap of exactly 0. On Review that put the closing note behind
 * `Set this week's rhythm`, which is how it was found: on a phone, not here.
 *
 * Every content wrapper now reserves the bar's measured height beneath
 * itself, so the assertion is a real gap, not merely the absence of
 * overlap.
 */
for (const route of SCREENS_WITH_A_FOOTER) {
  test(`the footer does not cover the end of the content on ${route}`, async ({ page }) => {
    await page.goto(route);
    // The bar publishes its measured height at hydration. Measuring before
    // that reads the static fallback, which is a different (and deliberately
    // safe) number — so wait for the real one.
    await page.waitForFunction(() => {
      const root = document.querySelector('[data-testid="screen"]')!;
      const bar = [...root.querySelectorAll('*')].find(
        (el) => getComputedStyle(el).position === 'sticky'
      );
      return !!bar?.parentElement?.style.getPropertyValue('--footer-h');
    });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

    const measured = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="screen"]')!;
      const bar = [...root.querySelectorAll('*')].find(
        (el) => getComputedStyle(el).position === 'sticky'
      )!;

      let lowest = -Infinity;
      let text = '';
      for (const el of root.querySelectorAll('p, span, h1, h2, a, button, textarea, input')) {
        if (bar.contains(el)) continue;
        const box = el.getBoundingClientRect();
        if (box.height === 0) continue;
        if (!el.textContent?.trim() && el.tagName !== 'TEXTAREA' && el.tagName !== 'INPUT') continue;
        if (box.bottom > lowest) {
          lowest = box.bottom;
          text = (el.textContent ?? el.tagName).trim().slice(0, 40);
        }
      }

      return {
        gap: bar.getBoundingClientRect().top - lowest,
        barHeight: bar.getBoundingClientRect().height,
        text,
      };
    });

    // Not merely un-covered: clear of the bar by its own height, which is
    // the room the content wrapper reserves. The few pixels of tolerance are
    // subpixel — a text element's box bottom and its last line box do not
    // land on the same fractional pixel.
    expect(
      measured.gap,
      `"${measured.text}" clears the footer by only ${Math.round(measured.gap)}px of ${Math.round(measured.barHeight)}px`
    ).toBeGreaterThanOrEqual(measured.barHeight - 4);
  });
}
