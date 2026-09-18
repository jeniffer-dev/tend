import { expect, test, type Page } from '@playwright/test';

import { areaEdit, areas, areas as copy } from '../../lib/copy';
import { areas as fixtureAreas, CREATING_DEFAULTS } from '../../lib/fixtures';

/**
 * User Story 2 — Areas and Area edit.
 * Covers FR-010 through FR-012, FR-030, FR-031, FR-033 and clarification Q1.
 */

const FIXTURE_ORDER = ['Morning pages', 'Health', 'Home', 'People', 'Money'];

const rowNames = async (page: Page) =>
  (await page.getByTestId('area-row').allInnerTexts()).map((t) => t.split('\n')[0].trim());

test.describe('Areas — what am I paying attention to?', () => {
  test.beforeEach(async ({ page }) => await page.goto('/areas'));

  test('FR-010: five areas in sortOrder, each with colour, name and rhythm line', async ({ page }) => {
    expect(await rowNames(page)).toEqual(FIXTURE_ORDER);

    // Selected by id, not by text: `hasText: 'Home'` would also match every
    // row whose rhythm line reads "in Home daily".
    for (const area of fixtureAreas) {
      await expect(page.locator(`[data-area="${area.id}"]`)).toContainText(area.rhythmLabel);
    }
    // The colour dot is rendered per row and is decorative, not a label.
    await expect(page.getByTestId('area-row').first().locator('span[aria-hidden]').first()).toBeAttached();
  });

  test('carries no Tend button — Areas is not where you act', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Tend', exact: true })).toHaveCount(0);
  });

  test('FR-010: dragging an area moves it in the list', async ({ page }) => {
    const handle = page.getByRole('button', { name: copy.reorderLabel('Morning pages') });
    const box = (await handle.boundingBox())!;
    const rows = await page.getByTestId('area-row').all();
    const step = (await rows[1].boundingBox())!.y - (await rows[0].boundingBox())!.y;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // Two rows down, in a few moves so the handler sees the travel.
    for (let i = 1; i <= 4; i++) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + (step * 2 * i) / 4);
    }
    await page.mouse.up();

    expect(await rowNames(page)).toEqual(['Health', 'Home', 'Morning pages', 'People', 'Money']);
  });

  test('the row lands where it is released, not past it', async ({ page }) => {
    const rows = await page.getByTestId('area-row').all();
    const first = (await rows[0].boundingBox())!;
    const second = (await rows[1].boundingBox())!;
    const handle = page.getByRole('button', { name: copy.reorderLabel('Morning pages') });
    const box = (await handle.boundingBox())!;

    // Travel exactly one row down and release there. An earlier build
    // reordered live *and* translated by the full travel, so the row ran
    // away at twice the speed of the pointer and overshot.
    const step = second.y - first.y;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 4; i++) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + (step * i) / 4);
    }
    await page.mouse.up();

    expect(await rowNames(page)).toEqual(['Health', 'Morning pages', 'Home', 'People', 'Money']);
  });

  test('the drag handle takes touch-action none so the page cannot scroll under it', async ({ page }) => {
    const touchAction = await page
      .getByRole('button', { name: copy.reorderLabel('Morning pages') })
      .evaluate((el) => getComputedStyle(el).touchAction);
    expect(touchAction).toBe('none');
  });

  test('the reorder handle is operable without a pointer', async ({ page }) => {
    await page.getByRole('button', { name: copy.reorderLabel('Morning pages') }).focus();
    await page.keyboard.press('ArrowDown');
    expect(await rowNames(page)).toEqual(['Health', 'Morning pages', 'Home', 'People', 'Money']);
  });

  test('FR-003: the reorder is not saved and a reload returns fixture order', async ({ page }) => {
    await page.getByRole('button', { name: copy.reorderLabel('Morning pages') }).focus();
    await page.keyboard.press('ArrowDown');
    expect(await rowNames(page)).not.toEqual(FIXTURE_ORDER);

    await page.reload();
    expect(await rowNames(page)).toEqual(FIXTURE_ORDER);
  });

  test('FR-011: removal states what happens to the tasks AND to the sessions', async ({ page }) => {
    await page.goto('/areas?confirm=money');

    const confirmation = page.getByTestId('remove-confirmation');
    await expect(confirmation).toBeVisible();

    // Both consequences, before either action is offered.
    await expect(confirmation).toContainText('keeps its five tasks');
    await expect(confirmation).toContainText('past sessions stay in Review');

    // And both ways out.
    await expect(confirmation.getByRole('button', { name: copy.removalAction })).toBeVisible();
    await expect(confirmation.getByRole('button', { name: copy.keepAction })).toBeVisible();
  });

  test('FR-011: the confirmation names the area own counts, not Money always', async ({ page }) => {
    await page.goto('/areas?confirm=health');
    await expect(page.getByTestId('remove-confirmation')).toContainText('Removing Health');
    await expect(page.getByTestId('remove-confirmation')).not.toContainText('Removing Money');
  });

  test('FR-011: Area edit starts the removal and Areas decides it', async ({ page }) => {
    await page.goto('/areas/money');

    // The trigger is a tertiary link, at the weight of the session's
    // `Mark it done` — not a button competing with the form.
    const link = page.getByRole('link', { name: copy.removalAction });
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(/\/areas\?confirm=money$/);
    await expect(page.getByTestId('remove-confirmation')).toContainText('Removing Money');
  });

  test('the row carries no remove control of its own', async ({ page }) => {
    await expect(page.getByTestId('area-row').first()).not.toContainText('Remove');
  });

  test('Keep it closes the confirmation and the row returns', async ({ page }) => {
    await page.goto('/areas?confirm=money');
    await page.getByRole('button', { name: copy.keepAction }).click();

    await expect(page.getByTestId('remove-confirmation')).toHaveCount(0);
    await expect(page.locator('[data-area="money"]')).toBeVisible();
  });

  test('Article IV: the destructive action carries no red', async ({ page }) => {
    await page.goto('/areas?confirm=money');
    const button = page.getByRole('button', { name: copy.removalAction });

    const style = await button.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.color, s.backgroundColor, s.borderTopColor];
    });
    for (const value of style) {
      const m = value.match(/rgba?\(([^)]+)\)/);
      if (!m) continue;
      const [r, g, b, a = 1] = m[1].split(',').map((n) => parseFloat(n));
      if (a === 0) continue;
      expect(r > 150 && r > g * 1.6 && r > b * 1.6, `${value} reads as red`).toBe(false);
    }
  });

  test('FR-033: New area opens the same empty Area edit', async ({ page }) => {
    await page.getByRole('link', { name: copy.secondaryAction }).click();
    await expect(page).toHaveURL(/\/areas\/new$/);
    await expect(page.getByLabel(areaEdit.nameLabel)).toHaveValue('');
  });

  test('FR-031: opened from First run, Areas is a root and shows no back control', async ({ page }) => {
    await page.goto('/areas?from=first-run');
    await expect(page.getByTestId('back-link')).toHaveCount(0);
  });

  test('FR-030: opened from Week or Review, Areas returns there', async ({ page }) => {
    for (const [from, href] of [
      ['week', '/week'],
      ['review', '/review'],
    ]) {
      await page.goto(`/areas?from=${from}`);
      await expect(page.getByTestId('back-link')).toHaveAttribute('href', href);
    }
  });
});

test.describe('Area edit — what is this area, and how often?', () => {
  test('FR-012: every control shows which option is selected', async ({ page }) => {
    await page.goto('/areas/health');

    await expect(page.getByLabel(areaEdit.nameLabel)).toHaveValue('Health');
    await expect(page.getByRole('button', { name: areaEdit.colorOptionLabels.primary })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: '3', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: areaEdit.onHomeOptions[0] })).toHaveAttribute('aria-pressed', 'true');

    // And the others do not.
    await expect(page.getByRole('button', { name: '2', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: areaEdit.onHomeOptions[1] })).toHaveAttribute('aria-pressed', 'false');
  });

  test('FR-012: tapping a control selects it and deselects the others', async ({ page }) => {
    await page.goto('/areas/health');

    await page.getByRole('button', { name: '5', exact: true }).click();
    await expect(page.getByRole('button', { name: '5', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: '3', exact: true })).toHaveAttribute('aria-pressed', 'false');

    await page.getByRole('button', { name: areaEdit.colorOptionLabels.load }).click();
    await expect(page.getByRole('button', { name: areaEdit.colorOptionLabels.load })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: areaEdit.colorOptionLabels.primary })).toHaveAttribute('aria-pressed', 'false');
  });

  test('creating differs from editing in exactly one visible way', async ({ page }) => {
    await page.goto('/areas/new');

    await expect(page.getByLabel(areaEdit.nameLabel)).toHaveValue('');
    await expect(page.getByLabel(areaEdit.nameLabel)).toHaveAttribute('placeholder', areaEdit.namePlaceholder);

    // The design's own prototype defaults: rhythm 3, Every day, fifth swatch.
    expect(CREATING_DEFAULTS.rhythm).toBe(3);
    await expect(page.getByRole('button', { name: '3', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: areaEdit.onHomeOptions[0] })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: areaEdit.colorOptionLabels.peak })).toHaveAttribute('aria-pressed', 'true');
  });

  test('clarification Q1: the top action is Back to areas, never Done', async ({ page }) => {
    for (const url of ['/areas/health', '/areas/new']) {
      await page.goto(url);
      await expect(page.getByRole('link', { name: areaEdit.topAction })).toBeVisible();
      await expect(page.getByTestId('screen').getByText('Done', { exact: true })).toHaveCount(0);
      // And the footer note lost its second sentence.
      await expect(page.getByText(areaEdit.footerNote)).toBeVisible();
      await expect(page.getByTestId('screen')).not.toContainText('Done takes you back');
    }
  });

  test('removal can be started here but never executed here', async ({ page }) => {
    await page.goto('/areas/health');

    // `Keep it` is the other half of the decision, and it belongs to the
    // confirmation on Areas. Its absence is what proves this screen only
    // starts the removal.
    await expect(page.getByText(areas.keepAction)).toHaveCount(0);
    await expect(page.getByTestId('remove-confirmation')).toHaveCount(0);
    await expect(page.getByTestId('screen')).not.toContainText('Delete');
  });

  test('creating offers no removal — there is nothing yet to remove', async ({ page }) => {
    await page.goto('/areas/new');
    await expect(page.getByRole('link', { name: areas.removalAction })).toHaveCount(0);
  });

  test('FR-030: Area edit always returns to Areas', async ({ page }) => {
    await page.goto('/areas/health');
    await page.getByRole('link', { name: areaEdit.topAction }).click();
    await expect(page).toHaveURL(/\/areas$/);
  });

  test('the rhythm row keeps five 44px controls on one line', async ({ page }) => {
    await page.goto('/areas/new');

    const boxes = await Promise.all(
      areaEdit.rhythmOptions.map(async (n) =>
        (await page.getByRole('button', { name: n, exact: true }).boundingBox())!
      )
    );
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    // One row: every control shares a top edge.
    const tops = new Set(boxes.map((b) => Math.round(b.y)));
    expect(tops.size, 'the rhythm controls wrapped onto more than one row').toBe(1);
  });
});
