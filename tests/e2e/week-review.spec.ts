import { expect, test } from '@playwright/test';

import { review, week } from '../../lib/copy';
import { reviewRows, weekRows } from '../../lib/fixtures';

/**
 * User Story 4 — look at the week and look back.
 * Covers FR-022, FR-023, FR-024 and FR-029.
 */

test.describe('Week — what am I committing to?', () => {
  test.beforeEach(async ({ page }) => await page.goto('/week'));

  test('FR-022: four areas with sessions committed and sessions attended', async ({ page }) => {
    const rows = page.getByTestId('week-row');
    await expect(rows).toHaveCount(4);

    for (const row of weekRows) {
      const rendered = page.locator(`[data-area="${row.areaId}"]`);
      await expect(rendered).toContainText(row.sessionsLabel);
      await expect(rendered).toContainText(row.line);
    }
  });

  test('clarification Q3: People is absent from Week', async ({ page }) => {
    await expect(page.locator('[data-area="people"]')).toHaveCount(0);
    await expect(page.getByTestId('screen')).not.toContainText('People');
  });

  test('FR-022: no minutes on this screen', async ({ page }) => {
    const text = await page.getByTestId('screen').innerText();
    expect(text).not.toMatch(/\bminutes?\b/i);
  });

  test('FR-005: no percentage and no progress element', async ({ page }) => {
    const text = await page.getByTestId('screen').innerText();
    expect(text).not.toContain('%');
    await expect(page.getByTestId('screen').locator('progress, meter, [role="progressbar"]')).toHaveCount(0);
  });

  test('FR-029: Change the rhythm reaches Areas and Areas returns here', async ({ page }) => {
    await page.getByRole('link', { name: week.action }).click();
    await expect(page).toHaveURL(/\/areas\?from=week$/);
    await expect(page.getByTestId('back-link')).toHaveAttribute('href', '/week');
  });

  test('returns to Home', async ({ page }) => {
    await page.getByTestId('back-link').click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Review — what did I attend, and what went unattended?', () => {
  test.beforeEach(async ({ page }) => await page.goto('/review'));

  test('FR-023: Attended and Unattended are two labelled sections, Attended first', async ({ page }) => {
    const sections = page.getByTestId('review-section');
    await expect(sections).toHaveCount(2);
    await expect(sections.nth(0)).toContainText(review.attendedLabel);
    await expect(sections.nth(1)).toContainText(review.unattendedLabel);

    const first = (await sections.nth(0).boundingBox())!;
    const second = (await sections.nth(1).boundingBox())!;
    expect(first.y).toBeLessThan(second.y);
  });

  test('FR-023: three attended areas and one unattended', async ({ page }) => {
    const sections = page.getByTestId('review-section');
    await expect(sections.nth(0).getByTestId('review-row')).toHaveCount(3);
    await expect(sections.nth(1).getByTestId('review-row')).toHaveCount(1);

    for (const row of reviewRows) {
      const rendered = page.locator(`[data-area="${row.areaId}"]`);
      if (row.sessionsLabel) await expect(rendered).toContainText(row.sessionsLabel);
      if (row.line) await expect(rendered).toContainText(row.line);
    }
  });

  test('FR-023: minutes appear here, as a plain figure', async ({ page }) => {
    await expect(page.locator('[data-area="health"]')).toContainText('52 minutes');
    await expect(page.locator('[data-area="money"]')).toContainText('31 minutes');
    await expect(page.locator('[data-area="home"]')).toContainText('One session, 15 minutes');
  });

  test('FR-024: the unattended area is a fact about the week, not about the person', async ({ page }) => {
    const unattended = page.getByTestId('review-section').nth(1);
    await expect(unattended).toContainText('No sessions this week.');
    await expect(page.getByText(review.closingNote)).toBeVisible();

    // Article II's forbidden framing, on the screen most tempted by it.
    const text = await page.getByTestId('screen').innerText();
    for (const forbidden of ['Overdue', 'Missed', 'Failed', 'Behind', 'Streak']) {
      expect(text, `Review says "${forbidden}"`).not.toContain(forbidden);
    }
  });

  test('Article IV: the unattended row is faded, never red', async ({ page }) => {
    const row = page.getByTestId('review-section').nth(1).getByTestId('review-row').first();
    await expect(row).toHaveCSS('opacity', '0.55');

    const reds = await row.evaluate((el) =>
      [el, ...el.querySelectorAll('*')].filter((n) => {
        const s = getComputedStyle(n as Element);
        return [s.color, s.backgroundColor, s.borderTopColor].some((c) => {
          const m = c.match(/rgba?\(([^)]+)\)/);
          if (!m) return false;
          const [r, g, b, a = 1] = m[1].split(',').map(Number);
          return a !== 0 && r > 150 && r > g * 1.6 && r > b * 1.6;
        });
      }).length
    );
    expect(reds).toBe(0);
  });

  test('carries no chart, no trend, no comparison with last week', async ({ page }) => {
    await expect(page.getByTestId('screen').locator('svg, canvas, progress, meter')).toHaveCount(0);
    const text = await page.getByTestId('screen').innerText();
    for (const forbidden of ['Last week', 'vs', 'Trend', 'Average', 'Total', '%']) {
      expect(text, `Review shows "${forbidden}"`).not.toContain(forbidden);
    }
  });

  test('FR-029: Set this week rhythm reaches Areas and Areas returns here', async ({ page }) => {
    await page.getByRole('link', { name: review.action }).click();
    await expect(page).toHaveURL(/\/areas\?from=review$/);
    await expect(page.getByTestId('back-link')).toHaveAttribute('href', '/review');
  });

  test('returns to Home', async ({ page }) => {
    await page.getByTestId('back-link').click();
    await expect(page).toHaveURL(/\/$/);
  });
});
