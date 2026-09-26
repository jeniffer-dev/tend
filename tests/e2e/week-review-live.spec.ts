import { expect, test, type Page } from '@playwright/test';

/**
 * T037 — User Story 2: the week counts itself.
 * Covers FR-007, FR-007a, FR-008, FR-008a, FR-008b, FR-009.
 *
 * Every figure is read against the seed's sessions, and one test adds a
 * session by tapping and watches both screens follow. One `goto` per test,
 * at the start: state lives in memory, so a second one is a reset
 * (FR-023).
 */

const screen = (page: Page) => page.getByTestId('screen');
const card = (page: Page, area: string) => page.getByTestId('area-card').filter({ hasText: area });
const weekRow = (page: Page, area: string) => page.locator(`[data-testid="week-row"][data-area="${area}"]`);
const reviewRow = (page: Page, area: string) =>
  page.locator(`[data-testid="review-row"][data-area="${area}"]`);

const toWeek = (page: Page) => page.getByTestId('bottom-nav').getByRole('link', { name: 'Week' }).click();
const backHome = (page: Page) => page.getByRole('link', { name: 'Back to home' }).click();

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
});

test('Week counts every area in sessions, and shows no minutes (FR-007, FR-007a)', async ({ page }) => {
  await page.goto('/week?seed=001');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Five areas, eleven sessions');
  await expect(page.getByTestId('week-row')).toHaveCount(5);
  await expect(weekRow(page, 'health')).toContainText('Three sessions');
  await expect(weekRow(page, 'health')).toContainText('Three tasks on the list. Two sessions attended.');
  await expect(weekRow(page, 'people')).toContainText('One task on the list. No sessions attended.');

  expect(await screen(page).innerText()).not.toMatch(/\bminutes?\b/i);
});

test('an area past its rhythm reads as extra, never as an excess (FR-009)', async ({ page }) => {
  await page.goto('/week?seed=001');

  /* Money: a rhythm of two and three sessions. Both figures are stated; no
     word compares them, and nothing is sized or coloured by the difference. */
  const money = weekRow(page, 'money');
  await expect(money).toContainText('Two sessions');
  await expect(money).toContainText('Three sessions attended.');
  const text = await money.innerText();
  for (const word of ['over', 'too many', 'exceed', 'extra', 'limit', '%']) {
    expect(text.toLowerCase(), `Money's row says "${word}"`).not.toContain(word);
  }
  await expect(money.locator('progress, meter, [role="progressbar"]')).toHaveCount(0);
});

test('Review: Attended before Unattended, with minutes as plain figures (FR-008, FR-008b)', async ({ page }) => {
  await page.goto('/review?seed=001');

  await expect(page.getByText('Week of 7 September')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Seven sessions');

  const sections = page.getByTestId('review-section');
  await expect(sections).toHaveCount(2);
  await expect(sections.nth(0)).toHaveAttribute('data-label', 'Attended');
  await expect(sections.nth(1)).toHaveAttribute('data-label', 'Unattended');
  const first = (await sections.nth(0).boundingBox())!;
  const second = (await sections.nth(1).boundingBox())!;
  expect(first.y).toBeLessThan(second.y);

  await expect(reviewRow(page, 'health')).toContainText(
    '52 minutes. Last note: Found the lab. Need the referral number from the clinic.'
  );
  await expect(reviewRow(page, 'money')).toContainText('Three sessions');
  await expect(reviewRow(page, 'money')).toContainText('31 minutes.');

  /* One closed session and no note keeps 001's one-line form. */
  await expect(reviewRow(page, 'home')).toHaveText(/One session, 15 minutes/);
  await expect(reviewRow(page, 'home').locator('p')).toHaveCount(0);

  /* Unattended is a name, faded, and the closing note says what it means. */
  const people = reviewRow(page, 'people');
  await expect(people).toHaveText('People');
  await expect(people).toHaveCSS('opacity', '0.55');
  await expect(
    page.getByText('Unattended is a fact about the week, not about you. Next week starts with the same areas.')
  ).toBeVisible();
});

test('a session tapped through changes Week and Review in one step (SC-004)', async ({ page }) => {
  await page.goto('/?seed=001');

  /* People is not daily, so it is not on Home; Health is. Close one there. */
  await card(page, 'Health').getByRole('link', { name: 'Tend' }).click();
  await page.getByRole('button', { name: 'Tend for fifteen minutes' }).click();
  await page.clock.fastForward('20:00');
  await page.getByLabel('Where you got to').fill('Referral number found.');
  await page.getByRole('button', { name: 'Done for now' }).click();
  await backHome(page);

  await toWeek(page);
  await expect(weekRow(page, 'health')).toContainText('Three sessions attended.');

  await backHome(page);
  await page.getByRole('link', { name: 'The week closes tonight. Look back on it.' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Eight sessions');
  await expect(reviewRow(page, 'health')).toContainText('Three sessions');
  await expect(reviewRow(page, 'health')).toContainText('72 minutes. Last note: Referral number found.');
});

test('an open session is counted, adds no minutes, and is named (FR-006a, FR-008a)', async ({ page }) => {
  await page.goto('/?seed=001');
  await card(page, 'Health').getByRole('link', { name: 'Tend' }).click();
  await page.getByRole('button', { name: 'Tend for fifteen minutes' }).click();
  await page.getByRole('link', { name: /Tend something else/ }).click();
  await backHome(page);

  await page.getByRole('link', { name: 'The week closes tonight. Look back on it.' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Eight sessions');
  await expect(reviewRow(page, 'health')).toContainText('Three sessions');
  await expect(reviewRow(page, 'health')).toContainText(
    '52 minutes. One still open. Last note: Found the lab. Need the referral number from the clinic.'
  );
});
