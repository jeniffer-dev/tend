import { expect, test, type Page } from '@playwright/test';

/**
 * T038g — User Story 6: a non-daily area reaches a session.
 * Covers FR-022, FR-022c, FR-022d, FR-022e and SC-011.
 *
 * Seeded, one `goto`, then taps. People is the seed's one non-daily area.
 * The seeded clock is origin plus real elapsed time, so `page.clock`
 * moves it — which is how the test reaches the next day without a reload.
 */

const PEOPLE_ABSENT =
  'People keeps a rhythm of one session a week. It is not a daily area, so it does not wait for you here.';

const weekRow = (page: Page, area: string) =>
  page.locator(`[data-testid="week-row"][data-area="${area}"]`);
const card = (page: Page, area: string) => page.getByTestId('area-card').filter({ hasText: area });
const toWeek = (page: Page) => page.getByTestId('bottom-nav').getByRole('link', { name: 'Week' }).click();

test('a non-daily area is added from Week, tended from Home, and leaves at midnight', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
  await page.goto('/?seed=001');
  await expect(page.getByText(PEOPLE_ABSENT)).toBeVisible();
  await expect(card(page, 'People')).toHaveCount(0);

  await toWeek(page);

  /* The action sits on People's row and on no daily row (FR-022c). */
  const action = page.getByRole('button', { name: 'Add it to Home today' });
  await expect(action).toHaveCount(1);
  await expect(weekRow(page, 'people').getByRole('button', { name: 'Add it to Home today' })).toBeVisible();

  /* 44×44 at whichever width this project runs (Article IV). */
  const box = (await action.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.width).toBeGreaterThanOrEqual(44);

  /* SC-011 — exactly four taps from Week to a running session on People. */
  let taps = 0;
  const tap = async (target: ReturnType<Page['getByRole']>) => {
    await target.click();
    taps += 1;
  };

  await tap(action);
  await expect(page).toHaveURL(/\/week$/);
  await expect(weekRow(page, 'people')).toContainText('On Home today.');
  await expect(page.getByRole('button', { name: 'Add it to Home today' })).toHaveCount(0);

  await tap(page.getByRole('link', { name: 'Back to home' }));
  /* An ordinary card with a Tend, and no sentence about People's absence. */
  await expect(card(page, 'People')).toBeVisible();
  await expect(page.getByText(PEOPLE_ABSENT)).toHaveCount(0);

  await tap(card(page, 'People').getByRole('link', { name: 'Tend' }));
  await tap(page.getByRole('button', { name: 'Tend for fifteen minutes' }));
  await expect(page).toHaveURL(/\/session\//);
  expect(taps, 'taps from Week to a running session').toBe(4);

  /* Closed, it is attended like any area: on Home and in Review. */
  await page.clock.fastForward('15:00');
  await page.getByRole('button', { name: 'Done for now' }).click();
  await page.getByRole('link', { name: 'Back to home' }).click();
  await expect(card(page, 'People')).toHaveAttribute('data-treatment', 'attended');

  await page.getByRole('link', { name: 'The week closes tonight. Look back on it.' }).click();
  await expect(page.getByTestId('review-section').nth(0)).toHaveAttribute('data-label', 'Attended');
  await expect(
    page.getByTestId('review-section').nth(0).locator('[data-testid="review-row"][data-area="people"]')
  ).toBeVisible();

  /* Past midnight: off Home, the absence note back, the action offered
     again. Nothing cleared it — the date moved (FR-022d). */
  await page.getByRole('link', { name: 'Back to home' }).click();
  await page.clock.fastForward('12:00:00');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Monday');
  await expect(card(page, 'People')).toHaveCount(0);
  await expect(page.getByText(PEOPLE_ABSENT)).toBeVisible();

  await toWeek(page);
  await expect(weekRow(page, 'people').getByRole('button', { name: 'Add it to Home today' })).toBeVisible();
});
