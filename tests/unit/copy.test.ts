import { describe, expect, it } from 'vitest';

import * as copy from '@/lib/copy';
import * as fixtures from '@/lib/fixtures';

/**
 * The copy lint — FR-026, FR-027, SC-005.
 *
 * It scans every user-facing string Tend can render: the exports of
 * lib/copy.ts, and the display strings in lib/fixtures.ts, which are copy in
 * everything but name (data-model.md stores the displayed sentence, so the
 * lexicon rule has to reach it too).
 *
 * What this file does NOT check is that the strings match the approved copy
 * character for character. A test comparing lib/copy.ts against itself
 * proves nothing, and extracting the strings from the design file at test
 * time would need an exception list for the three strings this spec
 * deliberately overruled — and an exception list is where such a test rots.
 * SC-004 is verified by review instead (spec.md §"How FR-002, SC-004 and
 * SC-010 are verified").
 */

/** Article II's forbidden lexicon. Each is matched on a word boundary so
 *  that `projected` or `timertest` would not trip it — and so that a real
 *  use cannot hide inside a longer word either. */
const FORBIDDEN = [
  'start task',
  'timer',
  'pomodoro',
  'sprint',
  'category',
  'bucket',
  'project',
  'overdue',
  'missed',
  'failed',
  'behind',
  'streak',
  'badge',
];

/** Any emoji or pictograph. Excludes the middot (·) and em dash (—), which
 *  are approved punctuation and appear throughout the copy. */
const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/u;

/** Walk an export tree and yield every string in it, keyed by its path so a
 *  failure names the offending entry rather than just the offending word.
 *  Functions of an area name are called with a fixture area so their output
 *  is linted too. */
function collect(value: unknown, path: string, out: Array<[string, string]>) {
  if (typeof value === 'string') {
    out.push([path, value]);
    return;
  }
  if (typeof value === 'function') {
    const produced = (value as (areaName: string) => unknown)('Health');
    if (typeof produced === 'string') out.push([`${path}('Health')`, produced]);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => collect(item, `${path}[${i}]`, out));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, inner] of Object.entries(value)) collect(inner, `${path}.${key}`, out);
  }
}

const userFacing: Array<[string, string]> = [];
collect(copy, 'copy', userFacing);

/* The fixture fields that reach the screen. `id`, `color`, `sortOrder` and
   the booleans do not, so they are not linted — an id of `book-the-blood-test`
   is a route segment, not a sentence. */
const fixtureStrings: Array<[string, string]> = [
  ...fixtures.areas.flatMap((a) => [
    [`area(${a.id}).name`, a.name] as [string, string],
    [`area(${a.id}).rhythmLabel`, a.rhythmLabel] as [string, string],
    [`area(${a.id}).removalExplanation`, a.removalExplanation] as [string, string],
  ]),
  ...fixtures.homeCards.map((c) => [`homeCard(${c.areaId}).line`, c.line] as [string, string]),
  ...fixtures.tasks.flatMap((t) => [
    [`task(${t.id}).title`, t.title] as [string, string],
    [`task(${t.id}).lastSessionNote`, t.lastSessionNote] as [string, string],
  ]),
  ...fixtures.inboxItems.flatMap((i) => [
    [`inboxItem(${i.id}).title`, i.title] as [string, string],
    [`inboxItem(${i.id}).capturedLabel`, i.capturedLabel] as [string, string],
  ]),
  ...Object.values(fixtures.sessionStates).flatMap((s) => [
    [`session(${s.state}).clock`, s.clock] as [string, string],
    [`session(${s.state}).clockNote`, s.clockNote] as [string, string],
    [`session(${s.state}).noteValue`, s.noteValue] as [string, string],
  ]),
  ...fixtures.weekRows.flatMap((w) => [
    [`weekRow(${w.areaId}).sessionsLabel`, w.sessionsLabel] as [string, string],
    [`weekRow(${w.areaId}).line`, w.line] as [string, string],
  ]),
  ...fixtures.reviewRows.flatMap((r) =>
    [
      r.sessionsLabel ? ([`reviewRow(${r.areaId}).sessionsLabel`, r.sessionsLabel] as [string, string]) : null,
      r.line ? ([`reviewRow(${r.areaId}).line`, r.line] as [string, string]) : null,
    ].filter((x): x is [string, string] => x !== null)
  ),
];

const all = [...userFacing, ...fixtureStrings];

describe('the copy lint', () => {
  it('finds strings to lint', () => {
    expect(all.length).toBeGreaterThan(60);
  });

  describe('FR-026 — no word from Article II\'s forbidden lexicon', () => {
    it.each(FORBIDDEN)('never uses "%s"', (term) => {
      const pattern = new RegExp(`\\b${term}\\b`, 'i');
      const offenders = all.filter(([, text]) => pattern.test(text));
      expect(offenders, `"${term}" appears in: ${offenders.map(([k]) => k).join(', ')}`).toEqual([]);
    });
  });

  describe('FR-027 — no emoji, no exclamation mark, no apology', () => {
    it('contains no emoji', () => {
      const offenders = all.filter(([, text]) => EMOJI.test(text));
      expect(offenders.map(([k]) => k)).toEqual([]);
    });

    it('contains no exclamation mark', () => {
      const offenders = all.filter(([, text]) => text.includes('!'));
      expect(offenders.map(([k]) => k)).toEqual([]);
    });

    it('contains no apology', () => {
      const pattern = /\b(sorry|apolog\w*|oops|unfortunately)\b/i;
      const offenders = all.filter(([, text]) => pattern.test(text));
      expect(offenders.map(([k]) => k)).toEqual([]);
    });
  });

  describe('Article I — no pressure framing', () => {
    it('states no percentage', () => {
      const offenders = all.filter(([, text]) => text.includes('%'));
      expect(offenders.map(([k]) => k)).toEqual([]);
    });
  });

  describe('Article II — Done is reserved for task completion', () => {
    it('uses Done only on the session action that completes a task', () => {
      const withDone = all.filter(([, text]) => /\bdone\b/i.test(text));
      expect(withDone.map(([k]) => k).sort()).toEqual([
        'copy.session.doneForNow',
        'copy.session.markItDone',
      ]);
    });
  });
});
