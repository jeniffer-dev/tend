import { expect, test, type Page } from '@playwright/test';

import { backForAreas, backForScreen, routes } from '../../lib/routes';

/**
 * The topology: no dead ends, and the conditional back rule.
 * Covers FR-001, FR-028 through FR-033 and SC-011.
 *
 * It walks lib/routes.ts rather than a list written here, so a screen
 * cannot be added without being walked.
 */

/** Every way off a screen, without the browser's back button. */
async function exits(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="screen"] a[href]')]
      .map((a) => a.getAttribute('href')!)
      .filter((href) => href && !href.startsWith('#'))
  );
}

for (const route of routes) {
  test(`FR-001: ${route.screen} (${route.href}) is not a dead end`, async ({ page }) => {
    await page.goto(route.href);
    const out = await exits(page);
    expect(out.length, `${route.href} offers no way onward`).toBeGreaterThan(0);
  });
}

test.describe('FR-028 — the back rule', () => {
  for (const route of routes) {
    const expected = route.path === '/areas' ? backForAreas(null) : backForScreen(route.path);

    test(`${route.screen} ${expected ? `returns to ${expected.href}` : 'is a root'}`, async ({
      page,
    }) => {
      /* Seeded, and the seed is what makes the last assertion mean anything.
         Unseeded, `/` has no areas and replaces itself with `/first-run`
         from an effect after mount, so `/` is a URL the page passes through
         rather than one it lands on. `toHaveURL` then passed whenever it
         polled before the effect ran and failed whenever it polled after —
         a different handful each run, and a pass that proved nothing when
         it came. With areas, `/` is where the back link stops. */
      await page.goto(`${route.href}?seed=001`);
      const back = page.getByTestId('back-link');

      if (!expected) {
        await expect(back, `${route.href} should be a root`).toHaveCount(0);
        return;
      }

      await expect(back).toHaveCount(1);
      await expect(back).toHaveAttribute('href', expected.href);
      await expect(back).toHaveText(expected.label);

      // And it actually goes there.
      await back.click();
      await expect(page).toHaveURL(new RegExp(`${expected.href === '/' ? '/' : expected.href}$`));
    });
  }
});

test.describe('FR-030 / FR-031 — Areas is the one conditional case', () => {
  test('opened from Week, it returns to Week', async ({ page }) => {
    await page.goto('/areas?from=week');
    await expect(page.getByTestId('back-link')).toHaveAttribute('href', '/week');
  });

  test('opened from Review, it returns to Review', async ({ page }) => {
    await page.goto('/areas?from=review');
    await expect(page.getByTestId('back-link')).toHaveAttribute('href', '/review');
  });

  test('opened from First run, it is a root and shows no back control', async ({ page }) => {
    await page.goto('/areas?from=first-run');
    await expect(page.getByTestId('back-link')).toHaveCount(0);
  });

  test('reached directly, it is a root', async ({ page }) => {
    await page.goto('/areas');
    await expect(page.getByTestId('back-link')).toHaveCount(0);
  });
});

test.describe('FR-032 / FR-033 — both routes into the empty Area edit', () => {
  test('First run opens it, and leaving lands on a rootless Areas', async ({ page }) => {
    await page.goto('/first-run');
    await page.getByRole('link', { name: 'Name your first area' }).click();
    await expect(page).toHaveURL(/\/areas\/new$/);

    await page.getByRole('link', { name: 'Back to areas' }).click();
    await expect(page).toHaveURL(/\/areas$/);
    await expect(page.getByTestId('back-link')).toHaveCount(0);
  });

  test('Areas opens the same screen from New area', async ({ page }) => {
    await page.goto('/areas');
    await page.getByRole('link', { name: 'New area' }).click();
    await expect(page).toHaveURL(/\/areas\/new$/);
  });
});

test.describe('FR-029 — Areas is reachable only from the two rhythm links', () => {
  test('Home bottom navigation carries no Areas entry', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('bottom-nav').getByRole('link')).toHaveText([
      'Capture',
      'Inbox',
      'Week',
    ]);
  });

  test('Week and Review both reach Areas', async ({ page }) => {
    for (const [from, action] of [
      ['/week', 'Change the rhythm'],
      ['/review', "Set this week's rhythm"],
    ]) {
      await page.goto(from);
      await page.getByRole('link', { name: action }).click();
      await expect(page).toHaveURL(/\/areas\?from=/);
    }
  });
});

test.describe('SC-011 — every screen is reachable in at most three taps', () => {
  test('from Home or First run', async ({ page }) => {
    // Home reaches its four neighbours in one tap, and the Session in two.
    const oneTap = [
      ['/capture', 'Capture'],
      ['/inbox', 'Inbox'],
      ['/week', 'Week'],
    ];
    for (const [href, name] of oneTap) {
      await page.goto('/');
      await page.getByTestId('bottom-nav').getByRole('link', { name }).click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
    }

    await page.goto('/');
    await page.getByRole('link', { name: 'The week closes tonight. Look back on it.' }).click();
    await expect(page).toHaveURL(/\/review$/);

    // Home → Picker → Session is two, and Review → Areas → Area edit is two.
    await page.goto('/');
    await page.getByTestId('area-card').filter({ hasText: 'Health' }).getByRole('link').click();
    await page.getByRole('link', { name: 'Tend for fifteen minutes' }).click();
    await expect(page).toHaveURL(/\/session\//);

    await page.goto('/review');
    await page.getByRole('link', { name: "Set this week's rhythm" }).click();
    await page.locator('[data-area="health"] a').first().click();
    await expect(page).toHaveURL(/\/areas\/health$/);
  });
});
