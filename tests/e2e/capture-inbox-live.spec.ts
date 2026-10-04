import { expect, test, type Page } from '@playwright/test';

/**
 * T043 — User Story 3: capture and sort for real.
 * Covers FR-020, FR-020a, FR-021, FR-021a, FR-022a, FR-030.
 *
 * Seeded, one `goto` per test, then taps. State lives in memory, so a
 * second `goto` would be a reset rather than a navigation (FR-023).
 */

const nav = (page: Page, name: string) =>
  page.getByTestId('bottom-nav').getByRole('link', { name }).click();
const field = (page: Page) => page.getByLabel('Capture');
const captureButton = (page: Page) => page.getByRole('button', { name: 'Capture', exact: true });
const heading = (page: Page) => page.getByRole('heading', { level: 1 });

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
});

test('Capture offers every area, daily or not, in the Areas order (FR-022a)', async ({ page }) => {
  await page.goto('/?seed=001');
  await nav(page, 'Capture');

  /* The chips are the toggles: buttons that carry aria-pressed. */
  const chips = page.locator('button[aria-pressed]');
  await expect(chips).toHaveText(['Morning pages', 'Health', 'Home', 'People', 'Money']);
});

test('Capture is disabled on an empty or whitespace-only field, with no message (FR-020a)', async ({ page }) => {
  await page.goto('/?seed=001');
  await nav(page, 'Capture');

  await expect(captureButton(page)).toBeDisabled();
  await field(page).fill('   \n  ');
  await expect(captureButton(page)).toBeDisabled();
  await field(page).fill('Call the bank');
  await expect(captureButton(page)).toBeEnabled();

  /* Nothing explains the disabled state: the screen's words are unchanged. */
  await field(page).fill('');
  await expect(page.getByTestId('screen')).not.toContainText(/empty|required|enter|type something/i);
});

test('with no area it goes to the inbox, and reads Captured today (FR-020, FR-030)', async ({ page }) => {
  await page.goto('/?seed=001');
  await nav(page, 'Capture');
  await field(page).fill('  Call the bank about the card  ');
  await captureButton(page).click();
  await expect(page).toHaveURL(/\/$/);

  await nav(page, 'Inbox');
  await expect(heading(page)).toHaveText('Four unsorted');
  const row = page.getByTestId('inbox-row').filter({ hasText: 'Call the bank about the card' });
  await expect(row).toContainText('Captured today');
  /* Trimmed, otherwise verbatim. */
  await expect(row.locator('span').first()).toHaveText('Call the bank about the card');
});

test('with an area it stays out of the inbox and reaches that area\'s list (FR-020)', async ({ page }) => {
  await page.goto('/?seed=001');
  await nav(page, 'Capture');
  await field(page).fill('Renew the passport');
  await page.getByRole('button', { name: 'People' }).click();
  await captureButton(page).click();

  await nav(page, 'Inbox');
  await expect(heading(page)).toHaveText('Three unsorted');
  await expect(page.getByTestId('screen')).not.toContainText('Renew the passport');

  await page.getByRole('link', { name: 'Back to home' }).click();
  await nav(page, 'Week');
  await expect(page.locator('[data-testid="week-row"][data-area="people"]')).toContainText(
    'Two tasks on the list.'
  );
});

test('Give it an area opens the chips, and one tap sorts the item (FR-021, FR-021a)', async ({ page }) => {
  await page.goto('/?seed=001');
  await nav(page, 'Inbox');
  await expect(heading(page)).toHaveText('Three unsorted');

  const dentist = page.getByTestId('inbox-row').filter({ hasText: 'Ask the dentist about the night guard' });
  const bike = page.getByTestId('inbox-row').filter({ hasText: 'Look up the bike shop that does tune-ups' });

  /* Closed until asked; the button keeps its approved words. */
  await expect(page.getByTestId('inbox-row-chips')).toHaveCount(0);
  await dentist.getByRole('button', { name: 'Give it an area' }).click();
  await expect(dentist.getByTestId('inbox-row-chips').getByRole('button')).toHaveText([
    'Morning pages', 'Health', 'Home', 'People', 'Money',
  ]);

  /* One row open at a time. */
  await bike.getByRole('button', { name: 'Give it an area' }).click();
  await expect(page.getByTestId('inbox-row-chips')).toHaveCount(1);
  await expect(bike.getByTestId('inbox-row-chips')).toBeVisible();

  /* Every chip is 44px tall at this width (Article IV). */
  for (const box of await bike.getByTestId('inbox-row-chips').getByRole('button').all()) {
    expect((await box.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }

  /* One tap, no second step: it leaves the inbox and reaches Health's list. */
  await bike.getByTestId('inbox-row-chips').getByRole('button', { name: 'Health' }).click();
  await expect(heading(page)).toHaveText('Two unsorted');
  await expect(bike).toHaveCount(0);

  await page.getByRole('link', { name: 'Back to home' }).click();
  await page.getByTestId('area-card').filter({ hasText: 'Health' }).getByRole('link', { name: 'Tend' }).click();
  await expect(page.getByTestId('screen')).toContainText('Look up the bike shop that does tune-ups');
});
