import { expect, test, type Page } from '@playwright/test';

/**
 * T038 — Review is reachable on every day, and says which week it shows.
 * Covers FR-019a, FR-019b, FR-019c, FR-019d.
 *
 * One `goto`, then seven days walked forward with `page.clock`. The seed
 * starts on Sunday 13 September and its clock is origin plus real elapsed
 * time (research.md §5), so fast-forwarding the browser's clock moves the
 * seeded day, and the day clock's midnight timer turns it over.
 *
 * Every step is a tap. State lives in memory, and a second `goto` would be
 * a reset rather than a navigation (FR-023).
 */

const DAYS = [
  /* day, Home's entry, the default week, the week Week's link reaches */
  ['Sunday', 'The week closes tonight. Look back on it.', 'Week of 7 September', 'Week of 31 August'],
  ['Monday', 'Last week closed. Look back on it.', 'Week of 7 September', 'Week of 7 September'],
  ['Tuesday', null, 'Week of 7 September', 'Week of 7 September'],
  ['Wednesday', null, 'Week of 7 September', 'Week of 7 September'],
  ['Thursday', null, 'Week of 7 September', 'Week of 7 September'],
  ['Friday', null, 'Week of 7 September', 'Week of 7 September'],
  ['Saturday', null, 'Week of 7 September', 'Week of 7 September'],
] as const;

const backHome = (page: Page) => page.getByRole('link', { name: 'Back to home' }).click();
const eyebrow = (page: Page) => page.getByTestId('screen').locator('p').first();

test('every day has a route into Review, and each says which week it shows', async ({ page }) => {
  test.setTimeout(90_000);
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
  await page.goto('/?seed=001');

  for (const [day, entry, defaultWeek, linkWeek] of DAYS) {
    await expect(page.getByRole('heading', { level: 1 }), 'the seeded day').toHaveText(day);

    /* Home's entry: Sunday and Monday only (FR-019a). */
    const entries = page.getByRole('link', { name: /Look back on it\.$/ });
    if (entry) {
      await expect(entries).toHaveText([entry]);
      await entries.click();
      await expect(eyebrow(page), `${day}, from Home`).toHaveText(defaultWeek);
      await backHome(page);
    } else {
      await expect(entries, `${day} has no entry on Home`).toHaveCount(0);
    }

    /* Week's link: every day, always the week before this one (FR-019b). */
    await page.getByTestId('bottom-nav').getByRole('link', { name: 'Week' }).click();
    await page.getByRole('link', { name: 'Look back on last week' }).click();
    await expect(page).toHaveURL(/\/review\?week=last$/);
    await expect(eyebrow(page), `${day}, from Week`).toHaveText(linkWeek);

    /* Areas and back: `Back to review` carries no parameter, and from
       Monday to Saturday the default is the same week (FR-019d). */
    await page.getByRole('link', { name: "Set this week's rhythm" }).click();
    await page.getByRole('link', { name: 'Back to review' }).click();
    await expect(eyebrow(page), `${day}, back from Areas`).toHaveText(defaultWeek);

    await backHome(page);
    await page.clock.fastForward('24:00:00');
  }
});
