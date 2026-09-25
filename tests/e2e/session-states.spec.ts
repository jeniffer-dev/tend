import { expect, test, type Page } from '@playwright/test';

/**
 * T028 — the three moments of a session. Covers FR-011 and SC-003.
 *
 * This is 001's session-states spec remade, not deleted. What it protected
 * is still a requirement: the three moments must be identical in layout,
 * colour and controls, differing only in the clock string and the line
 * beneath it.
 *
 * 001 rendered three static fixtures through `?state=`. There is one real
 * clock now, so the test moves `now` instead — with Playwright's clock API,
 * which works because the app reads real time in exactly one place, the
 * provider's tick, and derives everything else from what that tick
 * publishes.
 */

const clock = (page: Page) => page.getByTestId('session-clock');
const clockNote = (page: Page) => page.getByTestId('session-clock-note');

type Snapshot = { box: string; colours: string[]; controls: string[] };

async function snapshot(page: Page): Promise<Snapshot> {
  const card = page.getByTestId('session-clock').locator('..');
  const box = JSON.stringify(await card.boundingBox());
  const colours = await card.evaluate((el) => {
    const styles = getComputedStyle(el);
    const clockEl = el.querySelector('[data-testid="session-clock"]')!;
    return [styles.backgroundColor, styles.borderColor, getComputedStyle(clockEl).color];
  });
  const controls = await page.getByRole('button').allInnerTexts();
  return { box, colours, controls };
}

test('the clock passes zero and keeps counting, and nothing else changes', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
  await page.goto('/?seed=001');
  await page.getByTestId('area-card').filter({ hasText: 'Health' }).getByRole('link', { name: 'Tend' }).click();
  await page.getByRole('button', { name: 'Tend for fifteen minutes' }).click();
  await expect(page).toHaveURL(/\/session\//);

  /* Before zero. */
  await page.clock.fastForward(44_000);
  await expect(clock(page)).toHaveText('14:16');
  await expect(clockNote(page)).toHaveText('Fifteen minutes on Health.');
  const before = await snapshot(page);

  /* At zero. */
  await page.clock.fastForward(14 * 60_000 + 16_000);
  await expect(clock(page)).toHaveText('0:00');
  await expect(clockNote(page)).toHaveText('Fifteen minutes. The session keeps recording from here.');
  const atZero = await snapshot(page);

  /* Well past it — the count carries a plus and keeps going. */
  await page.clock.fastForward(17 * 60_000 + 4_000);
  await expect(clock(page)).toHaveText('+17:04');
  await expect(clockNote(page)).toHaveText('Thirty-two minutes on Health. Close it when you are ready.');
  const past = await snapshot(page);

  /* SC-003 — identical in layout, colour and controls. */
  expect(atZero.box).toBe(before.box);
  expect(past.box).toBe(before.box);
  expect(atZero.colours).toEqual(before.colours);
  expect(past.colours).toEqual(before.colours);
  expect(atZero.controls).toEqual(before.controls);
  expect(past.controls).toEqual(before.controls);
});

test('the session has no maximum', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
  await page.goto('/?seed=001');
  await page.getByTestId('area-card').filter({ hasText: 'Health' }).getByRole('link', { name: 'Tend' }).click();
  await expect(page).toHaveURL(/\/tend\//);
  await page.getByRole('button', { name: 'Tend for fifteen minutes' }).click();
  /* Wait for the session screen before moving the clock. Fast-forwarding
     into a navigation that has not landed measures the screen you left. */
  await expect(page).toHaveURL(/\/session\//);
  await expect(clock(page)).toBeVisible();

  await page.clock.fastForward(3 * 60 * 60_000);
  await expect(clock(page)).toHaveText('+165:00');
  await expect(page.getByRole('button', { name: 'Done for now' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Mark it done' })).toBeEnabled();
});
