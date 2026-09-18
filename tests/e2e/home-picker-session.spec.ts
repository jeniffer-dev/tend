import { expect, test, type Page } from '@playwright/test';

import { home, picker, session } from '../../lib/copy';
import { sessionStates, weekListTasksForArea } from '../../lib/fixtures';

/**
 * User Story 1 — the sit-down-and-tend loop, across its three screens.
 * Covers FR-013 through FR-019 and SC-001.
 *
 * Every assertion runs twice, at 390px and at 320px, because the project
 * matrix in playwright.config.ts is what supplies the viewport.
 */

/**
 * Tend's own markup, scoped away from the Next.js dev overlay — which
 * injects a `role="status"` element of its own and would otherwise answer
 * questions this suite is asking about the product.
 */
const screen = (page: Page) => page.getByTestId('screen');

/** Every visible text on the screen, for the "must not have" assertions. */
async function screenText(page: Page) {
  return (await screen(page).innerText()).replace(/\s+/g, ' ');
}

test.describe('Home — what am I tending right now?', () => {
  test.beforeEach(async ({ page }) => await page.goto('/'));

  /* The expected order is written out literally rather than read back from
     lib/fixtures.ts. Deriving it from the same function the page uses would
     compare the code against itself and pass no matter what that function
     did. Morning pages before Health is fixture order; Home last is the
     rule. */
  const EXPECTED_ORDER = ['Morning pages', 'Health', 'Money', 'Home'];

  test('FR-013: shows the day areas in the order set on Areas', async ({ page }) => {
    const rendered = await page.getByTestId('area-card').allInnerTexts();
    expect(rendered.length).toBe(EXPECTED_ORDER.length);
    EXPECTED_ORDER.forEach((name, i) => expect(rendered[i]).toContain(name));
  });

  test('FR-013a: what was attended today sinks below what is still open', async ({ page }) => {
    const cards = page.getByTestId('area-card');

    // The attended card is last on the screen.
    await expect(cards.last()).toContainText('Attended today, 15 minutes');

    // And no card carrying a Tend button sits below it. This is the
    // assertion that matters: an attended row between two Tend buttons
    // pushes live work below the fold.
    const attendedY = (await cards.last().boundingBox())!.y;
    const tendableYs = await Promise.all(
      (await cards.filter({ has: page.getByRole('link', { name: home.tendAction }) }).all()).map(
        async (card) => (await card.boundingBox())!.y
      )
    );
    expect(tendableYs.length).toBe(3);
    for (const y of tendableYs) expect(y).toBeLessThan(attendedY);
  });

  test('FR-014: renders all three treatments — solid, outline, and collapsed', async ({ page }) => {
    // To tend: a solid Tend button.
    const solid = page.getByTestId('area-card').filter({ hasText: 'Health' }).getByRole('link', { name: home.tendAction });
    await expect(solid).toBeVisible();

    // Past its rhythm: still tappable, with the line saying so. Nothing is blocked.
    const money = page.getByTestId('area-card').filter({ hasText: 'Money' });
    await expect(money).toContainText('Past the two sessions you set for this week.');
    await expect(money.getByRole('link', { name: home.tendAction })).toBeEnabled();

    // Attended today: collapsed to one line, and no Tend button on it.
    const attended = page.getByTestId('area-card').filter({ hasText: 'Attended today, 15 minutes' });
    await expect(attended).toBeVisible();
    await expect(attended.getByRole('link', { name: home.tendAction })).toHaveCount(0);
  });

  test('FR-006: the past-rhythm treatment uses no red and no animation', async ({ page }) => {
    const button = page
      .getByTestId('area-card')
      .filter({ hasText: 'Money' })
      .getByRole('link', { name: home.tendAction });

    const style = await button.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, border: s.borderTopColor, bg: s.backgroundColor, animation: s.animationName };
    });
    for (const value of [style.color, style.border, style.bg]) {
      expect(isRedish(value), `${value} reads as red`).toBe(false);
    }
    expect(style.animation).toBe('none');
  });

  test('FR-015: explains People absence rather than omitting it silently', async ({ page }) => {
    await expect(page.getByText(home.absenceNote)).toBeVisible();
    await expect(page.getByTestId('area-card').filter({ hasText: 'People' })).toHaveCount(0);
  });

  test('FR-016: the review entry is a tappable line above the areas, not a badge', async ({ page }) => {
    const entry = page.getByRole('link', { name: home.reviewEntry });
    await expect(entry).toBeVisible();
    await expect(entry).toHaveAttribute('href', '/review');

    const entryBox = (await entry.boundingBox())!;
    const firstCard = (await page.getByTestId('area-card').first().boundingBox())!;
    expect(entryBox.y).toBeLessThan(firstCard.y);

    // Not a badge or a notification: nothing on the screen announces itself.
    await expect(screen(page).locator('[role="status"], [role="alert"]')).toHaveCount(0);
    await expect(entry).toHaveText(home.reviewEntry);
  });

  test('FR-013/FR-029: nav is Capture · Inbox · Week, with no Areas entry', async ({ page }) => {
    await expect(page.getByTestId('bottom-nav').getByRole('link')).toHaveText([
      home.nav.capture,
      home.nav.inbox,
      home.nav.week,
    ]);
    await expect(page.getByTestId('bottom-nav').getByRole('link', { name: 'Areas' })).toHaveCount(0);
  });

  test('FR-013: carries no inbox list, no week list and no history', async ({ page }) => {
    const text = await screenText(page);
    // `Attended` is deliberately absent from this list: Home's collapsed
    // card legitimately reads `Attended today, 15 minutes` (SC-006). What
    // must not appear is Review's and Inbox's content.
    for (const forbidden of [
      'Three unsorted',
      'Give it an area',
      'Four areas, ten sessions',
      'Unattended',
      'Week of 7 September',
      'Six sessions',
    ]) {
      expect(text, `Home shows "${forbidden}"`).not.toContain(forbidden);
    }
  });

  test('FR-028: Home is the root and shows no back control', async ({ page }) => {
    await expect(page.getByTestId('back-link')).toHaveCount(0);
  });
});

test.describe('Picker — what do I focus on for fifteen minutes?', () => {
  test.beforeEach(async ({ page }) => await page.goto('/tend/health'));

  test('FR-017: lists only Health week-list tasks, first one selected', async ({ page }) => {
    const expected = weekListTasksForArea('health');
    const options = page.getByRole('button', { name: /./ }).and(page.locator('[aria-pressed]'));
    await expect(options).toHaveCount(expected.length);

    for (const task of expected) {
      await expect(page.getByRole('button', { name: new RegExp(task.title) })).toBeVisible();
    }
    // No task from another area reaches this screen.
    await expect(page.getByText('Three pages, longhand')).toHaveCount(0);
    await expect(page.getByText('Reconcile September')).toHaveCount(0);

    await expect(options.first()).toHaveAttribute('aria-pressed', 'true');
    await expect(options.nth(1)).toHaveAttribute('aria-pressed', 'false');
  });

  test('FR-017: every task carries a last-session row, including one never attended', async ({ page }) => {
    await expect(page.getByText(picker.lastSessionLabel)).toHaveCount(weekListTasksForArea('health').length);
    await expect(page.getByText('Not attended yet.')).toBeVisible();
  });

  test('the selected task is bordered in the area own colour, 2px', async ({ page }) => {
    // Both areas are checked on purpose. One would pass against a hardcoded
    // colour; two prove the border is read from the area (design system §6).
    for (const [areaId, expected] of [
      ['health', 'rgb(100, 180, 147)'], // --current-primary  #64B493
      ['money', 'rgb(245, 166, 91)'], //  --current-load     #F5A65B
    ]) {
      await page.goto(`/tend/${areaId}`);
      const selected = page.locator('[aria-pressed="true"]');
      await expect(selected).toHaveCount(1);

      const border = await selected.evaluate((el) => {
        const s = getComputedStyle(el);
        return { color: s.borderTopColor, width: s.borderTopWidth };
      });
      expect(border.color).toBe(expected);
      expect(border.width).toBe('2px');
    }
  });

  test('selecting a task changes the colour and moves nothing', async ({ page }) => {
    const options = page.locator('[aria-pressed]');
    const geometryOf = () =>
      options.evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
        })
      );

    const before = await geometryOf();
    await options.nth(1).click();
    await expect(options.nth(1)).toHaveAttribute('aria-pressed', 'true');
    expect(await geometryOf(), 'selecting a task reflowed the list').toEqual(before);

    // Unselected rows keep the same 2px border, at the neutral token.
    const unselected = await options
      .first()
      .evaluate((el) => getComputedStyle(el).borderTopWidth);
    expect(unselected).toBe('2px');
  });

  test('carries no inbox item and no way to add a task', async ({ page }) => {
    const text = await screenText(page);
    expect(text).not.toContain('Ask the dentist about the night guard');
    expect(text).not.toContain(picker.heading + ' New');
    await expect(page.getByRole('link', { name: /capture/i })).toHaveCount(0);
  });
});

test.describe('Session — what am I doing for these fifteen minutes?', () => {
  test.beforeEach(async ({ page }) => await page.goto('/session/book-the-blood-test'));

  test('FR-018: shows area, task, clock, note field and both closing actions', async ({ page }) => {
    await expect(page.getByText(session.eyebrow('Health'))).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Book the blood test' })).toBeVisible();
    await expect(page.getByTestId('session-clock')).toHaveText(sessionStates.running.clock);
    await expect(page.getByLabel(session.noteLabel)).toBeVisible();
    await expect(page.getByRole('link', { name: session.switchAction('Health') })).toBeVisible();
    await expect(page.getByRole('link', { name: session.doneForNow })).toBeVisible();
    await expect(page.getByRole('link', { name: session.markItDone })).toBeVisible();
  });

  test('Article V: no spinner anywhere', async ({ page }) => {
    await expect(page.locator('[role="progressbar"], .animate-spin, progress')).toHaveCount(0);
  });

  test('carries no pause, no stop and no visible state switcher', async ({ page }) => {
    const text = await screenText(page);
    for (const forbidden of ['Pause', 'Stop', 'Resume', 'running', 'zero']) {
      expect(text, `Session shows "${forbidden}"`).not.toContain(forbidden);
    }
  });

  test('the switch action returns to the Picker for the same area', async ({ page }) => {
    await page.getByRole('link', { name: session.switchAction('Health') }).click();
    await expect(page).toHaveURL(/\/tend\/health$/);
    await expect(page.getByRole('heading', { name: picker.heading })).toBeVisible();
  });
});

test.describe('SC-001 — two taps from Home to a running session', () => {
  test('tap Tend, then tap the primary action, and nothing in between', async ({ page }) => {
    await page.goto('/');

    await page
      .getByTestId('area-card')
      .filter({ hasText: 'Health' })
      .getByRole('link', { name: home.tendAction })
      .click();
    await expect(page).toHaveURL(/\/tend\/health$/);

    await page.getByRole('link', { name: picker.primaryAction }).click();
    await expect(page).toHaveURL(/\/session\//);
    await expect(page.getByTestId('session-clock')).toBeVisible();
  });
});

/** True for any colour close enough to red to read as a warning. Guards
 *  FR-006 and Article IV: --destructive is for destructive actions only,
 *  and nothing about a rhythm or an elapsed clock is one. */
function isRedish(color: string): boolean {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return false;
  const [r, g, b, a = '1'] = m[1].split(',').map((n) => parseFloat(n));
  if (parseFloat(String(a)) === 0) return false;
  return r > 150 && r > g * 1.6 && r > b * 1.6;
}
