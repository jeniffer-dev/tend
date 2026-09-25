import { expect, test, type Page } from '@playwright/test';

/**
 * T025c — the sticky footer's tallest shape still fits its reservation.
 * Covers SC-007.
 *
 * The bar measures itself and publishes its height, but the value used
 * before hydration is a constant, and that constant has to be at least as
 * tall as the tallest footer. The Picker's consequence line made a fourth
 * shape — a line, the action, the existing note — and it is the tallest.
 *
 * This is what pins the number: a longer string or a fourth wrapped line
 * fails here rather than failing on a slow phone, where an under-reserved
 * first paint hides the end of the list behind the bar.
 */

/** `15rem` in components/sticky-footer.tsx and at its call sites. */
const FALLBACK_PX = 240;

const card = (page: Page, area: string) =>
  page.getByTestId('area-card').filter({ hasText: area });

/** A session running in one area, then the Picker of another — the only
 *  state in which the fourth footer shape exists. */
async function pickerWithConsequence(page: Page) {
  await page.goto('/?seed=001');
  await card(page, 'Health').getByRole('link', { name: 'Tend' }).click();
  await page.getByRole('button', { name: 'Tend for fifteen minutes' }).click();
  await expect(page).toHaveURL(/\/session\//);

  await page.getByRole('link', { name: /Tend something else/ }).click();
  await page.getByRole('link', { name: 'Back to home' }).click();
  await card(page, 'Money').getByRole('link', { name: 'Tend' }).click();
  await expect(page.getByTestId('picker-consequence')).toBeVisible();
}

const footer = (page: Page) => page.getByTestId('picker-consequence').locator('..');

/* 320px is where the consequence line wraps furthest. The reservation is
   one constant for every width, so the narrow one is what has to fit. The
   tag, not a skip, is what scopes it: playwright.config.ts keeps `@320-only`
   out of the 390 project, so the test never appears there as skipped. */
test('the tallest footer fits the pre-hydration reservation', { tag: '@320-only' }, async ({
  page,
}) => {
  await pickerWithConsequence(page);

  const height = (await footer(page).boundingBox())!.height;
  expect(
    height,
    `the footer is ${Math.ceil(height)}px and the reservation is ${FALLBACK_PX}px`
  ).toBeLessThanOrEqual(FALLBACK_PX);
});

test('the bar does not cover the end of the list', async ({ page }) => {
  await pickerWithConsequence(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  /* The last thing in the content, which on the Picker is the scope note. */
  const note = page.getByText('Anything captured since sits in the inbox.');
  const box = (await note.boundingBox())!;
  const barTop = (await footer(page).boundingBox())!.y;

  expect(box.y + box.height).toBeLessThanOrEqual(barTop);
});
