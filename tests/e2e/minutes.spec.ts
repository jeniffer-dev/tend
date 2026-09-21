import { expect, test } from '@playwright/test';

import { picker } from '../../lib/copy';
import { routes } from '../../lib/routes';

/**
 * SC-006 — minutes appear on Review, on the session clock, and in Home's
 * collapsed attended line. Nowhere else.
 *
 * This is the rule the product is most likely to lose quietly: Week is the
 * screen most tempted by minutes, and a rhythm counted in sessions stops
 * meaning anything the moment minutes appear beside it.
 */

const ALLOWED = new Set(['/', '/session/book-the-blood-test', '/review']);

const MINUTES = /\bmin(ute)?s?\b/i;

/**
 * FLAGGED — one approved string sits outside the three screens.
 *
 * The Picker's primary action is `Tend for fifteen minutes`. Read
 * literally, SC-006 says minutes appear on Review, the session clock and
 * Home's attended line and nowhere else, so that string contradicts it.
 *
 * What SC-006 protects is minutes as *reported data* — a figure about what
 * happened, which is what would undermine a rhythm counted in sessions. The
 * Picker's string is the length of the session you are about to start, in
 * the label of the button that starts it. It is named here rather than
 * quietly matched away, because an exception list is where a test like this
 * rots, and this one should stay exactly one entry long.
 */
const APPROVED_ELSEWHERE = [picker.primaryAction];

for (const route of routes) {
  test(`${route.screen} (${route.href})`, async ({ page }) => {
    await page.goto(route.href);
    let text = (await page.getByTestId('screen').innerText()).replace(/\s+/g, ' ');
    for (const approved of APPROVED_ELSEWHERE) text = text.split(approved).join('');

    const found = text.match(MINUTES);

    if (!ALLOWED.has(route.href)) {
      expect(found?.[0], `${route.href} reports minutes: "${found?.[0]}"`).toBeUndefined();
      return;
    }
    expect(found, `${route.href} should report minutes and does not`).not.toBeNull();
  });
}

test('the Picker exception is exactly one string, and it is the approved one', async ({ page }) => {
  await page.goto('/tend/health');
  const text = (await page.getByTestId('screen').innerText()).replace(/\s+/g, ' ');

  // It is there...
  expect(text).toContain(picker.primaryAction);
  // ...and it is the only mention on the screen.
  expect(text.split(picker.primaryAction).join('')).not.toMatch(MINUTES);
});

test('Home shows minutes only on the attended line', async ({ page }) => {
  await page.goto('/');

  const attended = page.getByTestId('area-card').filter({ hasText: 'Attended today' });
  await expect(attended).toContainText('15 minutes');

  // Every other card is free of them.
  const others = await page
    .getByTestId('area-card')
    .filter({ hasNotText: 'Attended today' })
    .allInnerTexts();
  for (const text of others) {
    expect(text, `a Home card other than the attended one shows minutes`).not.toMatch(MINUTES);
  }
});

test('the Session shows minutes on the clock note, in all three states', async ({ page }) => {
  for (const state of ['running', 'zero', 'past']) {
    await page.goto(`/session/book-the-blood-test?state=${state}`);
    await expect(page.getByTestId('screen')).toContainText(/minutes/i);
  }
});

test('Week counts in sessions and never in minutes', async ({ page }) => {
  await page.goto('/week');
  const text = await page.getByTestId('screen').innerText();

  expect(text).not.toMatch(/minutes?/i);
  // And it does still count — in sessions.
  expect(text).toMatch(/sessions?/i);
});

test('Review is the only place a minute figure sits beside an area', async ({ page }) => {
  await page.goto('/review');
  await expect(page.locator('[data-area="health"]')).toContainText('52 minutes');
  await expect(page.locator('[data-area="money"]')).toContainText('31 minutes');
  await expect(page.locator('[data-area="home"]')).toContainText('15 minutes');

  // The unattended area carries none: there is nothing to report.
  await expect(page.locator('[data-area="morning-pages"]')).not.toContainText(/minutes/i);
});
