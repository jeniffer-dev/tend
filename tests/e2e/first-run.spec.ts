import { expect, test } from '@playwright/test';

import { areaEdit, firstRun } from '../../lib/copy';
import { areas as fixtureAreas, CREATING_DEFAULTS } from '../../lib/fixtures';

/**
 * User Story 5 — arrive with nothing.
 * Covers FR-009, FR-031, FR-032 and the edge clarification found missing.
 */

test.describe('First run — where do I start?', () => {
  test.beforeEach(async ({ page }) => await page.goto('/first-run'));

  test('FR-009: the invitation, the dots with their caption, one action, the closing line', async ({ page }) => {
    await expect(page.getByText(firstRun.eyebrow, { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: firstRun.heading })).toBeVisible();
    for (const paragraph of firstRun.body) {
      await expect(page.getByText(paragraph)).toBeVisible();
    }
    await expect(page.getByText(firstRun.caption)).toBeVisible();
    await expect(page.getByRole('link', { name: firstRun.primaryAction })).toBeVisible();
    await expect(page.getByText(firstRun.footerNote)).toBeVisible();
  });

  test('FR-009: no area is listed and none is suggested', async ({ page }) => {
    const text = await page.getByTestId('screen').innerText();
    // The fixture names are one person's example. They must never be
    // offered to someone who has not made an area yet.
    for (const area of fixtureAreas) {
      expect(text, `First run suggests "${area.name}"`).not.toContain(area.name);
    }
  });

  test('FR-009: exactly one action, and no way to Home', async ({ page }) => {
    const actions = page.getByTestId('screen').getByRole('link');
    await expect(actions).toHaveCount(1);
    await expect(actions.first()).toHaveAttribute('href', '/areas/new');

    // A person with no areas has no Home to see.
    await expect(page.getByTestId('screen').locator('a[href="/"]')).toHaveCount(0);
  });

  test('the heading uses the empty-screen title role', async ({ page }) => {
    // Design system §3, admitted for this screen alone. Asserted because
    // it is the one place in the product allowed above a page title.
    const heading = page.getByRole('heading', { name: firstRun.heading });
    await expect(heading).toHaveCSS('font-size', '30px');
    await expect(heading).toHaveCSS('letter-spacing', '-0.75px');
  });

  test('FR-028: it is a root and shows no back control', async ({ page }) => {
    await expect(page.getByTestId('back-link')).toHaveCount(0);
  });

  test('FR-027: no apology, no exclamation mark, no emoji', async ({ page }) => {
    const text = await page.getByTestId('screen').innerText();
    expect(text).not.toContain('!');
    expect(text).not.toMatch(/\b(sorry|apolog\w*|oops|unfortunately)\b/i);
    expect(text).not.toMatch(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u
    );
  });

  test('FR-032: the action opens Area edit with an empty name and the prototype defaults', async ({ page }) => {
    await page.getByRole('link', { name: firstRun.primaryAction }).click();
    await expect(page).toHaveURL(/\/areas\/new$/);

    await expect(page.getByLabel(areaEdit.nameLabel)).toHaveValue('');
    await expect(page.getByLabel(areaEdit.nameLabel)).toHaveAttribute(
      'placeholder',
      areaEdit.namePlaceholder
    );
    expect(CREATING_DEFAULTS.rhythm).toBe(3);
    await expect(page.getByRole('button', { name: '3', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: areaEdit.onHomeOptions[0] })).toHaveAttribute('aria-pressed', 'true');
  });

  test('FR-031: leaving that screen lands on Areas, and Areas shows no back control', async ({ page }) => {
    await page.getByRole('link', { name: firstRun.primaryAction }).click();
    await page.getByRole('link', { name: areaEdit.topAction }).click();

    await expect(page).toHaveURL(/\/areas$/);
    // First run describes a state that no longer exists once an area has
    // been named, so there is nowhere behind Areas to go.
    await expect(page.getByTestId('back-link')).toHaveCount(0);
  });

  test('SC-011: First run reaches Areas in two taps', async ({ page }) => {
    await page.getByRole('link', { name: firstRun.primaryAction }).click();
    await page.getByRole('link', { name: areaEdit.topAction }).click();
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page).toHaveURL(/\/areas$/);
  });
});
