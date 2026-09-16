import { expect, test, type Page } from '@playwright/test';

import { sessionStates, type SessionState } from '../../lib/fixtures';

/**
 * FR-019 and SC-007 — the three session states are identical in layout and
 * in treatment, and differ only in the clock string, the clock note and the
 * note content.
 *
 * This is the assertion the quickstart says to make by flipping between the
 * three by hand: if anything shifts, FR-019 has failed, and the usual cause
 * is a clock string of a different length pushing something.
 */

const STATES: SessionState[] = ['running', 'zero', 'past'];
const URL = (state: SessionState) => `/session/book-the-blood-test?state=${state}`;

/** The geometry of every element that is not one of the three permitted
 *  differences, keyed so a failure names what moved. */
async function layout(page: Page) {
  return page.evaluate(() => {
    const round = (n: number) => Math.round(n);
    const pick = (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        x: round(r.x),
        y: round(r.y),
        w: round(r.width),
        h: round(r.height),
        color: s.color,
        background: s.backgroundColor,
        border: s.borderTopColor,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        opacity: s.opacity,
      };
    };
    return {
      heading: pick('h1'),
      eyebrow: pick('[data-testid="screen"] p'),
      clockCard: pick('[data-testid="session-clock"]')
        ? pick('[data-testid="session-clock"]')!.w > 0
          ? (() => {
              const el = document.querySelector('[data-testid="session-clock"]')!.parentElement!;
              const r = el.getBoundingClientRect();
              const s = getComputedStyle(el);
              return {
                x: Math.round(r.x),
                y: Math.round(r.y),
                w: Math.round(r.width),
                h: Math.round(r.height),
                background: s.backgroundColor,
                border: s.borderTopColor,
              };
            })()
          : null
        : null,
      note: pick('#progress-note'),
      label: pick('label[for="progress-note"]'),
    };
  });
}

/** The clock's own treatment — everything about it except the string. */
async function clockTreatment(page: Page) {
  return page.getByTestId('session-clock').evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      color: s.color,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      letterSpacing: s.letterSpacing,
      lineHeight: s.lineHeight,
      animationName: s.animationName,
      transitionProperty: s.transitionProperty,
    };
  });
}

test.describe('FR-019 / SC-007 — the three states are one screen', () => {
  test('layout does not move between states', async ({ page }) => {
    const seen: Record<string, unknown> = {};
    for (const state of STATES) {
      await page.goto(URL(state));
      await expect(page.getByTestId('session-clock')).toBeVisible();
      seen[state] = await layout(page);
    }
    expect(seen.zero, 'the at-zero state moved something').toEqual(seen.running);
    expect(seen.past, 'the well-past state moved something').toEqual(seen.running);
  });

  test('the clock carries one treatment in every state', async ({ page }) => {
    const seen: Record<string, unknown> = {};
    for (const state of STATES) {
      await page.goto(URL(state));
      seen[state] = await clockTreatment(page);
    }
    expect(seen.zero).toEqual(seen.running);
    expect(seen.past).toEqual(seen.running);
  });

  test('only the clock, the clock note and the note content differ', async ({ page }) => {
    for (const state of STATES) {
      await page.goto(URL(state));
      const fixture = sessionStates[state];

      await expect(page.getByTestId('session-clock')).toHaveText(fixture.clock);
      await expect(page.getByText(fixture.clockNote)).toBeVisible();
      await expect(page.locator('#progress-note')).toHaveValue(fixture.noteValue);
    }
  });

  test('FR-006: nothing is red and nothing pulses, least of all past zero', async ({ page }) => {
    for (const state of STATES) {
      await page.goto(URL(state));

      const reds = await page.getByTestId('screen').evaluate((root) => {
        const isRedish = (color: string) => {
          const m = color.match(/rgba?\(([^)]+)\)/);
          if (!m) return false;
          const [r, g, b, a = 1] = m[1].split(',').map((n) => parseFloat(n));
          if (a === 0) return false;
          return r > 150 && r > g * 1.6 && r > b * 1.6;
        };
        const out: string[] = [];
        for (const el of root.querySelectorAll('*')) {
          const s = getComputedStyle(el);
          for (const prop of [s.color, s.backgroundColor, s.borderTopColor]) {
            if (isRedish(prop)) out.push(`${el.tagName}.${el.className} ${prop}`);
          }
        }
        return out;
      });
      expect(reds, `red found in the ${state} state`).toEqual([]);

      const animated = await page.getByTestId('screen').evaluate((root) =>
        [...root.querySelectorAll('*')]
          .filter((el) => getComputedStyle(el).animationName !== 'none')
          .map((el) => el.tagName)
      );
      expect(animated, `something animates in the ${state} state`).toEqual([]);
    }
  });

  test('FR-004: the clock does not tick', async ({ page }) => {
    await page.goto(URL('running'));
    const before = await page.getByTestId('session-clock').innerText();
    await page.waitForTimeout(2500);
    const after = await page.getByTestId('session-clock').innerText();
    expect(after).toBe(before);
    expect(after).toBe(sessionStates.running.clock);
  });

  test('an unknown state falls back to running rather than breaking', async ({ page }) => {
    await page.goto('/session/book-the-blood-test?state=nonsense');
    await expect(page.getByTestId('session-clock')).toHaveText(sessionStates.running.clock);
  });
});
