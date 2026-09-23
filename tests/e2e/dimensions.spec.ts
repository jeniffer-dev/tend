import { expect, test } from '@playwright/test';

import { routes } from '../../lib/routes';

/**
 * The physical criteria, on every route, at both widths.
 * Covers FR-007, FR-008, SC-002 and SC-003.
 *
 * These are the assertions the feature exists for and the reason the suite
 * is Playwright rather than jsdom: a layout engine at a real viewport is the
 * only thing that can answer them. jsdom reports every element as 0x0.
 *
 * The routes are walked from lib/routes.ts rather than listed here, so a
 * screen cannot be added without being measured.
 */

const INTERACTIVE = 'button, a, input, textarea, [role="button"]';

for (const route of routes) {
  test.describe(`${route.screen} (${route.href})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(route.href);
      await page.waitForFunction(() => document.readyState === 'complete');
    });

    test('SC-003: every tappable control is at least 44x44', async ({ page }) => {
      const small = await page.evaluate((selector) => {
        const out: string[] = [];
        for (const el of document.querySelectorAll(`[data-testid="screen"] ${selector}`)) {
          const box = el.getBoundingClientRect();
          if (box.width === 0 && box.height === 0) continue; // not rendered
          if (box.width < 44 || box.height < 44) {
            const label = (el.textContent || el.getAttribute('aria-label') || el.tagName).trim();
            out.push(`${label.slice(0, 40)} — ${Math.round(box.width)}x${Math.round(box.height)}`);
          }
        }
        return out;
      }, INTERACTIVE);

      expect(small, `controls under 44px on ${route.href}`).toEqual([]);
    });

    test('FR-008 / SC-002: the page does not scroll horizontally', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${route.href} scrolls horizontally`).toBeLessThanOrEqual(0);
    });

    test('SC-002: no text is clipped or truncated', async ({ page }) => {
      const clipped = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll('[data-testid="screen"] *')) {
          const style = getComputedStyle(el);
          const label = `${el.tagName} "${(el.textContent || '').trim().slice(0, 34)}"`;

          /* Content wider than its box is only *clipped* if the box cuts it
             off. With `overflow: visible` it simply paints into the gutter,
             which is what the back links do on purpose: a negative margin
             aligns their text with the heading while the tap target keeps
             its 44px. A textarea scrolls its own content by design. */
          const cuts = style.overflowX === 'hidden' || style.overflowX === 'clip';
          if (cuts && el.tagName !== 'TEXTAREA' && el.scrollWidth > el.clientWidth + 1) {
            out.push(label);
          }

          // Long names wrap; they never truncate into an ellipsis
          // (spec.md §Edge cases).
          if (style.textOverflow === 'ellipsis' && el.textContent?.trim()) {
            out.push(`${label} — truncates with an ellipsis`);
          }
        }
        return [...new Set(out)];
      });
      expect(clipped, `clipped text on ${route.href}`).toEqual([]);
    });

    test('SC-002: no two tappable controls overlap', async ({ page }) => {
      const overlaps = await page.evaluate((selector) => {
        const root = document.querySelector('[data-testid="screen"]')!;
        /* The sticky footer is excluded on purpose. It is *meant* to sit
           over the content as the page scrolls — that is design system §4's
           pattern — and what matters instead is that the content clears it
           at the end of the scroll, which tests/e2e/sticky-footer.spec.ts
           asserts on every screen that has one. */
        const bar = [...root.querySelectorAll('*')].find(
          (el) => getComputedStyle(el).position === 'sticky'
        );

        const boxes = [...root.querySelectorAll(selector)]
          .filter((el) => !bar?.contains(el))
          .map((el) => ({
            label: (el.textContent || el.getAttribute('aria-label') || el.tagName)
              .trim()
              .slice(0, 24),
            r: el.getBoundingClientRect(),
          }))
          .filter(({ r }) => r.width > 0 && r.height > 0);

        const out: string[] = [];
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i].r;
            const b = boxes[j].r;
            // Nesting is not overlapping: a link inside a card is fine.
            const contains =
              (a.left <= b.left && a.right >= b.right && a.top <= b.top && a.bottom >= b.bottom) ||
              (b.left <= a.left && b.right >= a.right && b.top <= a.top && b.bottom >= a.bottom);
            if (contains) continue;

            const dx = Math.min(a.right, b.right) - Math.max(a.left, b.left);
            const dy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (dx > 1 && dy > 1) out.push(`${boxes[i].label} ↔ ${boxes[j].label}`);
          }
        }
        return out;
      }, INTERACTIVE);

      expect(overlaps, `overlapping controls on ${route.href}`).toEqual([]);
    });
  });
}
