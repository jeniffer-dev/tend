import { expect, test } from '@playwright/test';

import { capture, inbox } from '../../lib/copy';
import { inboxItems } from '../../lib/fixtures';

/**
 * User Story 3 — capture now, sort later.
 * Covers FR-020 and FR-021.
 */

test.describe('Capture — what did I just remember?', () => {
  test.beforeEach(async ({ page }) => await page.goto('/capture'));

  test('FR-020: exactly one text field', async ({ page }) => {
    const fields = page.getByTestId('screen').locator('input[type="text"], input:not([type]), textarea');
    await expect(fields).toHaveCount(1);
    await expect(fields.first()).toHaveAttribute('placeholder', capture.fieldPlaceholder);
  });

  test('FR-020: no area is preselected', async ({ page }) => {
    const chips = page.locator('[aria-pressed]');
    await expect(chips).toHaveCount(capture.chips.length);
    for (const state of await chips.evaluateAll((els) => els.map((e) => e.getAttribute('aria-pressed')))) {
      expect(state).toBe('false');
    }
  });

  test('FR-020: a chip toggles on, and off again', async ({ page }) => {
    const health = page.getByRole('button', { name: 'Health' });

    await health.click();
    await expect(health).toHaveAttribute('aria-pressed', 'true');

    // The area is optional, so there has to be a way back to none.
    await health.click();
    await expect(health).toHaveAttribute('aria-pressed', 'false');
  });

  test('FR-020: choosing one chip clears the other', async ({ page }) => {
    await page.getByRole('button', { name: 'Health' }).click();
    await page.getByRole('button', { name: 'Money' }).click();

    await expect(page.getByRole('button', { name: 'Money' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Health' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('FR-020: states where an item with no area goes', async ({ page }) => {
    await expect(page.getByText(capture.footerNote)).toBeVisible();
  });

  test('carries no date field, no priority control, no second field', async ({ page }) => {
    await expect(page.getByTestId('screen').locator('input[type="date"], select')).toHaveCount(0);
    const text = await page.getByTestId('screen').innerText();
    for (const forbidden of ['Priority', 'Due', 'When', 'Repeat']) {
      expect(text, `Capture offers "${forbidden}"`).not.toContain(forbidden);
    }
  });

  test('FR-003: a toggled chip does not survive a reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Health' }).click();
    await expect(page.getByRole('button', { name: 'Health' })).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(page.getByRole('button', { name: 'Health' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('returns to Home', async ({ page }) => {
    /* Seeded, so `/` is where the back link stops. Unseeded, `/` replaces
       itself with `/first-run` after mount, and `toHaveURL` passed or failed
       by whether it polled first (navigation.spec.ts, FR-028). */
    await page.goto('/capture?seed=001');
    await page.getByTestId('back-link').click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Inbox — what have I not sorted yet?', () => {
  test.beforeEach(async ({ page }) => await page.goto('/inbox'));

  test('FR-021: three unsorted items, each with when it was captured and a way to sort it', async ({ page }) => {
    const rows = page.getByTestId('inbox-row');
    await expect(rows).toHaveCount(3);

    for (const [i, item] of inboxItems.entries()) {
      await expect(rows.nth(i)).toContainText(item.title);
      await expect(rows.nth(i)).toContainText(item.capturedLabel);
      await expect(rows.nth(i).getByRole('button', { name: inbox.giveItAnArea })).toBeVisible();
    }
  });

  test('FR-021: states that nothing here expires', async ({ page }) => {
    await expect(page.getByText(inbox.footerNote)).toBeVisible();
  });

  test('no date is framed as due or late, and nothing is a backlog', async ({ page }) => {
    const text = await page.getByTestId('screen').innerText();
    for (const forbidden of ['Due', 'Overdue', 'Late', 'Backlog', 'days ago', 'Sort', 'Filter']) {
      expect(text, `Inbox shows "${forbidden}"`).not.toContain(forbidden);
    }
    // The captured labels are plain strings, not rendered dates.
    await expect(page.getByTestId('screen').locator('time, input[type="date"]')).toHaveCount(0);
  });

  test('Article I: the count is stated, never framed as pressure', async ({ page }) => {
    await expect(page.getByRole('heading', { name: inbox.heading })).toBeVisible();
    const text = await page.getByTestId('screen').innerText();
    expect(text).not.toContain('%');
  });

  test('returns to Home', async ({ page }) => {
    /* Seeded for the same reason as Capture's. */
    await page.goto('/inbox?seed=001');
    await page.getByTestId('back-link').click();
    await expect(page).toHaveURL(/\/$/);
  });
});
