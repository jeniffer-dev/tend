import { expect, test, type Page } from '@playwright/test';

/**
 * T030 — nothing interrupts a session. Covers FR-012.
 *
 * Past zero the session keeps recording and counts upward. Nothing turns
 * red, nothing pulses, no dialog appears, no action is taken away, and the
 * layout does not move. A session has no maximum.
 */

const screen = (page: Page) => page.getByTestId('screen');

/** Anything that reads as alarm: a red channel well clear of the others, on
 *  any element on the screen. The palette has no red and none is reachable
 *  (design system §2, Article V). */
async function redElements(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="screen"]')!;
    const offenders: string[] = [];
    for (const el of Array.from(root.querySelectorAll('*'))) {
      const styles = getComputedStyle(el);
      for (const prop of ['color', 'backgroundColor', 'borderColor'] as const) {
        const match = styles[prop].match(/rgba?\((\d+), (\d+), (\d+)/);
        if (!match) continue;
        const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];
        if (r > 150 && r - g > 60 && r - b > 60) offenders.push(`${el.tagName}.${prop}`);
      }
    }
    return offenders;
  });
}

async function animatedElements(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelector('[data-testid="screen"]')!.querySelectorAll('*'))
      .filter((el) => {
        const styles = getComputedStyle(el);
        return styles.animationName !== 'none' || /transform|opacity|all/.test(styles.transitionProperty);
      })
      .map((el) => el.tagName)
  );
}

/** Home → Picker → a running session, waiting at each step. Fast-forwarding
 *  into a navigation that has not landed measures the screen you left, and
 *  that is what a session test looks like when it flakes. */
async function startOnHealth(page: Page) {
  await page.clock.install({ time: new Date('2026-09-13T13:00:00') });
  await page.goto('/?seed=001');
  await page.getByTestId('area-card').filter({ hasText: 'Health' }).getByRole('link', { name: 'Tend' }).click();
  await expect(page).toHaveURL(/\/tend\//);
  await page.getByRole('button', { name: 'Tend for fifteen minutes' }).click();
  await expect(page).toHaveURL(/\/session\//);
  await expect(page.getByTestId('session-clock')).toBeVisible();
}

test('past zero the screen is the same screen', async ({ page }) => {
  await startOnHealth(page);

  const before = {
    red: await redElements(page),
    animated: await animatedElements(page),
    buttons: await screen(page).getByRole('button').allInnerTexts(),
    /* The card, not the clock text. The string itself is one of the two
       things SC-003 lets differ, and `+30:00` is a character wider than
       `15:00`, so the span tracks it. What must not move is the box around
       it and everything below. */
    cardBox: JSON.stringify(await page.getByTestId('session-clock').locator('..').boundingBox()),
    clockLine: JSON.stringify(
      await page.getByTestId('session-clock').boundingBox().then((b) => ({ y: b!.y, height: b!.height }))
    ),
    noteBox: JSON.stringify(await page.getByLabel('Where you got to').boundingBox()),
  };

  /* Well past zero — half an hour over, which is twice the planned length. */
  await page.clock.fastForward('45:00');
  await expect(page.getByTestId('session-clock')).toHaveText('+30:00');

  expect(await redElements(page)).toEqual(before.red);
  expect(await animatedElements(page)).toEqual(before.animated);

  /* Both closing actions stay in place, and nothing is added. */
  expect(await screen(page).getByRole('button').allInnerTexts()).toEqual(before.buttons);

  /* No dialog, no alert, no prompt of any kind — inside Tend's own markup.
     Next injects a route announcer with `role="alert"` of its own, and it
     is the framework talking to a screen reader, not the product
     interrupting a session. */
  await expect(screen(page).getByRole('dialog')).toHaveCount(0);
  await expect(screen(page).getByRole('alert')).toHaveCount(0);
  await expect(screen(page).getByRole('alertdialog')).toHaveCount(0);

  /* And the layout does not move. */
  expect(
    JSON.stringify(await page.getByTestId('session-clock').locator('..').boundingBox())
  ).toBe(before.cardBox);
  expect(
    JSON.stringify(
      await page.getByTestId('session-clock').boundingBox().then((b) => ({ y: b!.y, height: b!.height }))
    )
  ).toBe(before.clockLine);
  expect(JSON.stringify(await page.getByLabel('Where you got to').boundingBox())).toBe(before.noteBox);
});

test('the session has no maximum and nothing reclaims it', async ({ page }) => {
  await startOnHealth(page);

  await page.clock.fastForward('03:00:00');
  await expect(page.getByTestId('session-clock')).toHaveText('+165:00');
  await expect(page.getByRole('button', { name: 'Done for now' })).toBeEnabled();
  expect(await screen(page).innerText()).not.toMatch(/expired|abandoned|too long/i);
});
