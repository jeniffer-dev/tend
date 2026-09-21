import { expect, test } from '@playwright/test';

import { routes } from '../../lib/routes';

/**
 * FR-003 and SC-008 — nothing is stored, and a reload returns every screen
 * to its fixture state.
 *
 * Feature 001 has no persistence at all, and the point of asserting it is
 * that persistence is the kind of thing that arrives by accident: one
 * localStorage call to "remember the last thing" and the claim is false.
 */

test.describe('no storage API is touched', () => {
  for (const route of routes) {
    test(`${route.screen} (${route.href})`, async ({ page }) => {
      await page.goto(route.href);
      await page.waitForFunction(() => document.readyState === 'complete');

      const state = await page.evaluate(() => ({
        local: Object.keys(localStorage),
        session: Object.keys(sessionStorage),
        cookie: document.cookie,
      }));

      expect(state.local, `${route.href} wrote to localStorage`).toEqual([]);
      expect(state.session, `${route.href} wrote to sessionStorage`).toEqual([]);
      expect(state.cookie, `${route.href} set a cookie`).toBe('');
    });
  }

  test('no IndexedDB database is opened', async ({ page }) => {
    await page.goto('/');
    const databases = await page.evaluate(async () =>
      typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).length : 0
    );
    expect(databases).toBe(0);
  });
});

test.describe('SC-008 — a reload returns the fixture state', () => {
  test('the Picker forgets a changed selection', async ({ page }) => {
    await page.goto('/tend/health');
    const options = page.locator('[aria-pressed]');

    await options.nth(2).click();
    await expect(options.nth(2)).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(options.first()).toHaveAttribute('aria-pressed', 'true');
    await expect(options.nth(2)).toHaveAttribute('aria-pressed', 'false');
  });

  test('Capture forgets a toggled chip and a typed line', async ({ page }) => {
    await page.goto('/capture');
    await page.getByRole('button', { name: 'Money' }).click();
    await page.locator('textarea').fill('Something I just remembered');

    await page.reload();
    await expect(page.getByRole('button', { name: 'Money' })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('textarea')).toHaveValue('');
  });

  test('Area edit forgets every control', async ({ page }) => {
    await page.goto('/areas/health');
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('button', { name: 'When I add it' }).click();
    await page.getByLabel('Name').fill('Something else');

    await page.reload();
    await expect(page.getByRole('button', { name: '3', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Every day' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Name')).toHaveValue('Health');
  });

  test('Areas forgets a reorder', async ({ page }) => {
    await page.goto('/areas');
    const names = async () =>
      (await page.getByTestId('area-row').allInnerTexts()).map((t) => t.split('\n')[0].trim());

    const before = await names();
    await page.getByRole('button', { name: 'Reorder Morning pages' }).focus();
    await page.keyboard.press('ArrowDown');
    expect(await names()).not.toEqual(before);

    await page.reload();
    expect(await names()).toEqual(before);
  });

  test('the Session forgets a typed note', async ({ page }) => {
    await page.goto('/session/book-the-blood-test');
    await page.locator('#progress-note').fill('Half an idea');

    await page.reload();
    await expect(page.locator('#progress-note')).toHaveValue('');
  });
});

test('no screen claims that anything was saved', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route.href);
    const text = await page.getByTestId('screen').innerText();
    for (const claim of ['Saved', 'Saving', 'Autosave', 'Synced', 'Stored', 'Updated']) {
      expect(text, `${route.href} claims "${claim}"`).not.toContain(claim);
    }
  }
});
