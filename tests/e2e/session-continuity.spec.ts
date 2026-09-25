import { expect, test, type Page } from '@playwright/test';

/**
 * T029 — a session survives the screens. Covers FR-024 and FR-015a.
 *
 * The store sits above the router, so walking away from the Session screen
 * is walking away from a screen and not from the session. Nothing ends a
 * session but a closing action.
 *
 * **Navigation is tapping, never `page.goto`.** State lives in memory
 * (FR-023), so a fresh load is the reload that resets it — which is exactly
 * what 001's persistence.spec.ts asserts and precisely what must not happen
 * in the middle of a continuity test.
 */

const card = (page: Page, area: string) =>
  page.getByTestId('area-card').filter({ hasText: area });

const backHome = (page: Page) => page.getByRole('link', { name: 'Back to home' }).click();
const leaveSession = (page: Page) =>
  page.getByRole('link', { name: /Tend something else/ }).click();

async function startOn(page: Page, area: string) {
  await card(page, area).getByRole('link', { name: 'Tend' }).click();
  await page.getByRole('button', { name: 'Tend for fifteen minutes' }).click();
  await expect(page).toHaveURL(/\/session\//);
}

test('a running session survives navigating away and back, and the clock advanced', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
  await page.goto('/?seed=001');
  await startOn(page, 'Health');
  await expect(page.getByTestId('session-clock')).toHaveText('15:00');

  /* Away to the Picker, then Home, where the area reads as being tended
     right now rather than as finished or as untouched (FR-015a). */
  await leaveSession(page);
  await backHome(page);
  await expect(card(page, 'Health')).toHaveAttribute('data-treatment', 'tending-now');
  await expect(card(page, 'Health')).toHaveText(/Tending now/);

  /* And on to a third screen, to be sure it is the store holding the
     session and not the screen it started on. */
  await page.getByTestId('bottom-nav').getByRole('link', { name: 'Week' }).click();
  await expect(page.getByTestId('week-row').first()).toBeVisible();
  await page.clock.fastForward('04:00');

  /* Back in, through the same area's Picker. Starting there switches the
     task inside the open session rather than beginning another, so the
     clock carries on from where it was (FR-015). */
  await backHome(page);
  await startOn(page, 'Health');
  await expect(page.getByTestId('session-clock')).toHaveText('11:00');
});

test('leaving the Session screen does not end the session', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
  await page.goto('/?seed=001');
  await startOn(page, 'Health');

  await leaveSession(page);
  await backHome(page);
  await page.getByTestId('bottom-nav').getByRole('link', { name: 'Inbox' }).click();
  await backHome(page);

  /* Still open: Health is being tended, not attended-and-finished. */
  await expect(card(page, 'Health')).toHaveAttribute('data-treatment', 'tending-now');

  /* And both ways out are still there, unchanged. */
  await startOn(page, 'Health');
  await expect(page.getByRole('button', { name: 'Done for now' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark it done' })).toBeVisible();
});

test('the area being tended sorts with the ones still open', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
  await page.goto('/?seed=001');
  await startOn(page, 'Money');
  await leaveSession(page);
  await backHome(page);

  /* Money was past its rhythm and sorted third; tending it does not sink
     it below the attended row, because it is the area you are in the
     middle of (contracts/derivations.md).

     Wait for both cards before reading the order. `allInnerTexts` resolves
     against whatever is on screen at that instant, and reading it before
     the seeded state has rendered compares an empty list to itself. */
  await expect(card(page, 'Money')).toHaveAttribute('data-treatment', 'tending-now');
  await expect(card(page, 'Home')).toHaveAttribute('data-treatment', 'attended');

  const order = await page.getByTestId('area-card').allInnerTexts();
  const money = order.findIndex((t) => t.includes('Money'));
  const attended = order.findIndex((t) => t.includes('Attended today'));
  expect(money).toBeLessThan(attended);
});

test('an area attended today can be tended again from Home, and the day keeps its minutes', async ({
  page,
}) => {
  /* T021b — FR-015e, and FR-015b reached by tapping. Before FR-015e the
     attended card had no Tend, so `· tending now` after a closed session
     was an approved string no tap could reach. */
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
  await page.goto('/?seed=001');

  await startOn(page, 'Health');
  await page.clock.fastForward('16:00');
  await page.getByLabel('Where you got to').fill('Referral number found.');
  await page.getByRole('button', { name: 'Done for now' }).click();
  await backHome(page);

  /* Attended, and still tendable: an outline Tend, enabled, not faded. */
  await expect(card(page, 'Health')).toHaveAttribute('data-treatment', 'attended');
  await expect(card(page, 'Health')).toContainText('Attended today, 16 minutes');
  await expect(card(page, 'Health')).toHaveCSS('opacity', '1');
  await expect(card(page, 'Health').getByRole('link', { name: 'Tend' })).toBeEnabled();

  /* Tend it again. The line keeps the sixteen minutes and adds the clause;
     a session in progress adds to the day rather than replacing it. */
  await startOn(page, 'Health');
  await leaveSession(page);
  await backHome(page);
  await expect(card(page, 'Health')).toHaveAttribute('data-treatment', 'tending-now');
  await expect(card(page, 'Health')).toContainText('Attended today, 16 minutes · tending now');
});
