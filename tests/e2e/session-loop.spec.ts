import { expect, test, type Page } from '@playwright/test';

/**
 * T027 — User Story 1: a session that changes things.
 *
 * The loop 001 drew and could not close. Start a session, close it with a
 * note, and confirm Home, the Picker and Week each changed in the way the
 * session implies (SC-004).
 *
 * **Every step navigates inside the app.** State lives in memory for the
 * browser session (FR-023), so `page.goto` is a reset, not a navigation —
 * it is the reload 001's persistence.spec.ts asserts on, and using it here
 * would test the empty app while appearing to test the seeded one. One
 * `goto` per test, at the start, and links from there.
 */

const screen = (page: Page) => page.getByTestId('screen');
const text = async (page: Page) => (await screen(page).innerText()).replace(/\s+/g, ' ');

const card = (page: Page, area: string) =>
  page.getByTestId('area-card').filter({ hasText: area });

/** Home → Picker → a running session, by tapping. */
async function startSessionOn(page: Page, area: string) {
  await card(page, area).getByRole('link', { name: 'Tend' }).click();
  await expect(page).toHaveURL(/\/tend\//);
  await page.getByRole('button', { name: 'Tend for fifteen minutes' }).click();
  await expect(page).toHaveURL(/\/session\//);
}

const backHome = (page: Page) => page.getByRole('link', { name: 'Back to home' }).click();

test('a session closed as progressed changes Home, the Picker and Week', async ({ page }) => {
  await page.goto('/?seed=001');
  await startSessionOn(page, 'Health');

  await page.getByLabel('Where you got to').fill('Referral number found. Booked for the 22nd.');
  await page.getByRole('button', { name: 'Done for now' }).click();

  /* The Picker is where a closing action lands, and the note is there. */
  await expect(page).toHaveURL(/\/tend\/health/);
  await expect(screen(page)).toContainText('Referral number found. Booked for the 22nd.');

  /* Home reports the area attended today, and the session is counted. */
  await backHome(page);
  await expect(card(page, 'Health')).toHaveAttribute('data-treatment', 'attended');
  await expect(card(page, 'Health')).toContainText('Attended today');

  await page.getByTestId('bottom-nav').getByRole('link', { name: 'Week' }).click();
  await expect(page.getByTestId('week-row').filter({ hasText: 'Health' })).toContainText(
    'Three sessions attended.'
  );
});

test('a session closed as done takes its task off the week list', async ({ page }) => {
  await page.goto('/?seed=001');
  await startSessionOn(page, 'Health');

  const title = await page.getByRole('heading', { level: 1 }).innerText();
  await page.getByRole('button', { name: 'Mark it done' }).click();

  await expect(page).toHaveURL(/\/tend\/health/);
  await expect(screen(page)).not.toContainText(title);
});

test('a session closed with no note says it was attended without one', async ({ page }) => {
  await page.goto('/?seed=001');
  await startSessionOn(page, 'Health');
  await page.getByRole('button', { name: 'Done for now' }).click();
  await expect(screen(page)).toContainText('Attended. No note left.');
});

test('starting in another area closes the running one, and says so first', async ({ page }) => {
  await page.goto('/?seed=001');
  await startSessionOn(page, 'Health');
  const running = await page.getByRole('heading', { level: 1 }).innerText();

  /* Out of the session by its switch action, home, and into another area. */
  await page.getByRole('link', { name: /Tend something else/ }).click();
  await backHome(page);
  await card(page, 'Money').getByRole('link', { name: 'Tend' }).click();

  const consequence = page.getByTestId('picker-consequence');
  await expect(consequence).toHaveText(
    `A session on ${running} is still running. Starting here closes it.`
  );

  /* It states and does not gate: the action keeps its words and its place. */
  const action = page.getByRole('button', { name: 'Tend for fifteen minutes' });
  await expect(action).toBeEnabled();
  await action.click();
  await expect(page).toHaveURL(/\/session\//);

  /* The first session was recorded, not discarded: Health is attended. */
  await page.getByRole('link', { name: /Tend something else/ }).click();
  await backHome(page);
  await expect(card(page, 'Health')).toContainText('Attended today');
});

test('the Picker says nothing when the session is running in this same area', async ({ page }) => {
  await page.goto('/?seed=001');
  await startSessionOn(page, 'Health');

  await page.getByRole('link', { name: /Tend something else/ }).click();
  await expect(page).toHaveURL(/\/tend\/health/);
  await expect(page.getByTestId('picker-consequence')).toHaveCount(0);
  expect(await text(page)).toContain('You can switch to another task inside the session.');
});
