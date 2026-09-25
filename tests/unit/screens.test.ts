import { describe, expect, it } from 'vitest';

import { homeView, pickerView, rhythmLabel, sessionView, weekView } from '@/lib/derive/screens';
import { SEED_001, SEED_001_ORIGIN } from '@/lib/seed/fixture-001';
import { reduce, type Action } from '@/lib/state/store';
import { EMPTY_STATE, type State } from '@/lib/state/types';

/**
 * T017 — each region's output for the ordinary case and for the empty ones.
 *
 * The ordinary case here is not invented: it is `?seed=001` at the moment
 * 001 describes, asserted against 001's approved strings character for
 * character. That is SC-001 for the screens Phase 3 builds, without a
 * browser.
 */

const NOW = SEED_001_ORIGIN;

describe('SC-001 — Home renders 001 copy, character for character', () => {
  const view = homeView(SEED_001, NOW);

  it('heads the screen with the day', () => {
    expect(view.heading).toBe('Sunday');
  });

  it('shows the four daily areas, attended below what is still open', () => {
    expect(view.cards.map((c) => c.areaId)).toEqual(['morning-pages', 'health', 'money', 'home']);
  });

  it('gives each card the treatment and the line 001 drew', () => {
    expect(view.cards.map((c) => [c.treatment, c.line])).toEqual([
      ['to-tend', 'Last attended Thursday.'],
      ['to-tend', 'Last attended Monday.'],
      ['past-rhythm', 'Past the two sessions you set for this week. Tend it anyway if it is what you want.'],
      ['attended', 'Attended today, 15 minutes'],
    ]);
  });

  it('accounts for the one area that is not daily, in one sentence', () => {
    expect(view.absenceNote).toBe(
      'People keeps a rhythm of one session a week. It is not a daily area, so it does not wait for you here.'
    );
  });

  it('offers Review on the Sunday the week closes', () => {
    expect(view.reviewEntry).toBe('The week closes tonight. Look back on it.');
    expect(homeView(SEED_001, new Date(2026, 8, 14, 9, 0)).reviewEntry).toBe(
      'Last week closed. Look back on it.'
    );
    expect(homeView(SEED_001, new Date(2026, 8, 15, 9, 0)).reviewEntry).toBeNull();
  });

  it('renders the rhythm line Areas shows', () => {
    expect(SEED_001.areas.map(rhythmLabel)).toEqual([
      'Three sessions a week · in Home daily',
      'Three sessions a week · in Home daily',
      'Two sessions a week · in Home daily',
      'One session a week · not in Home daily',
      'Two sessions a week · in Home daily',
    ]);
  });
});

describe('SC-001 — the Picker renders 001 copy', () => {
  const view = pickerView(SEED_001, 'health', NOW)!;

  it('offers the area week-list tasks that are not done', () => {
    expect(view.tasks.map((t) => t.title)).toEqual([
      'Book the blood test',
      'Refill the prescription',
      'Walk three mornings',
    ]);
  });

  it('gives each task its last-session note in one of the three forms', () => {
    expect(view.tasks.map((t) => t.lastSessionNote)).toEqual([
      'Found the lab. Need the referral number from the clinic.',
      'Not attended yet.',
      'Two mornings so far. Thursday is open.',
    ]);
  });

  it('says nothing about a session when none is running', () => {
    expect(view.consequence).toBeNull();
  });
});

describe('FR-015c — what the Picker says a start would close', () => {
  const running = reduce(SEED_001, {
    type: 'startSession',
    now: NOW,
    id: 'live',
    taskId: 'book-the-blood-test',
    areaId: 'health',
  });

  it('names the running task when the Picker is another area', () => {
    expect(pickerView(running, 'money', NOW)!.consequence).toBe(
      'A session on Book the blood test is still running. Starting here closes it.'
    );
  });

  it('names a long title in full, never truncated', () => {
    const longTitled = reduce(running, { type: 'switchTask', taskId: 'look-up-the-bike-shop' });
    expect(pickerView(longTitled, 'money', NOW)!.consequence).toBe(
      'A session on Look up the bike shop that does tune-ups is still running. Starting here closes it.'
    );
  });

  it('says nothing in the area the session is already running in', () => {
    expect(pickerView(running, 'health', NOW)!.consequence).toBeNull();
  });
});

describe('FR-015b — Home while a session runs', () => {
  it('reads Tending now alone on the first session of the day', () => {
    const running = reduce(SEED_001, {
      type: 'startSession', now: NOW, id: 'live', taskId: 'book-the-blood-test', areaId: 'health',
    });
    const card = homeView(running, NOW).cards.find((c) => c.areaId === 'health')!;
    expect([card.treatment, card.line]).toEqual(['tending-now', 'Tending now']);
  });

  it('keeps the minutes already attended today and adds the clause', () => {
    const running = reduce(SEED_001, {
      type: 'startSession', now: NOW, id: 'live', taskId: 'change-the-filter', areaId: 'home',
    });
    const card = homeView(running, NOW).cards.find((c) => c.areaId === 'home')!;
    expect([card.treatment, card.line]).toEqual(['tending-now', 'Attended today, 15 minutes · tending now']);
  });

  it('sorts the area being tended with the ones still open', () => {
    const running = reduce(SEED_001, {
      type: 'startSession', now: NOW, id: 'live', taskId: 'change-the-filter', areaId: 'home',
    });
    expect(homeView(running, NOW).cards.map((c) => c.areaId)).toEqual([
      'morning-pages', 'health', 'home', 'money',
    ]);
  });
});

describe('SC-003 — the session clock, before zero, at zero and past it', () => {
  const running = reduce(SEED_001, {
    type: 'startSession', now: NOW, id: 'live', taskId: 'book-the-blood-test', areaId: 'health',
  });
  const after = (seconds: number) => new Date(NOW.getTime() + seconds * 1000);

  it('differs in the clock string and the line beneath it, and in nothing else', () => {
    const moments = [after(44), after(15 * 60), after(32 * 60 + 4)].map((m) => sessionView(running, m)!);

    expect(moments.map((m) => m.clock)).toEqual(['14:16', '0:00', '+17:04']);
    expect(moments.map((m) => m.clockNote)).toEqual([
      'Fifteen minutes on Health.',
      'Fifteen minutes. The session keeps recording from here.',
      'Thirty-two minutes on Health. Close it when you are ready.',
    ]);

    /* Everything else is identical across the three. */
    for (const moment of moments) {
      expect(moment.areaName).toBe('Health');
      expect(moment.taskTitle).toBe('Book the blood test');
    }
  });

  it('is nothing at all when no session is running', () => {
    expect(sessionView(SEED_001, NOW)).toBeNull();
  });
});

describe('Week counts sessions and shows no minutes', () => {
  const view = weekView(SEED_001, NOW);

  it('renders the rows with a sessions label and a line', () => {
    const health = view.rows.find((r) => r.areaId === 'health')!;
    expect(health.sessionsLabel).toBe('Three sessions');
    expect(health.line).toBe('Three tasks on the list. Two sessions attended.');
  });

  it('agrees with a singular count', () => {
    const home = view.rows.find((r) => r.areaId === 'home')!;
    expect(home.line).toBe('Two tasks on the list. One session attended.');
  });

  it('never puts a minute figure on this screen (FR-007)', () => {
    const everything = [view.heading, view.emptyNote ?? '', ...view.rows.flatMap((r) => [r.sessionsLabel, r.line])];
    expect(everything.some((text) => /minute/i.test(text))).toBe(false);
  });

  it('counts an open session as a session, and says nothing about it being open', () => {
    const running = reduce(SEED_001, {
      type: 'startSession', now: NOW, id: 'live', taskId: 'book-the-blood-test', areaId: 'health',
    });
    const health = weekView(running, NOW).rows.find((r) => r.areaId === 'health')!;
    expect(health.line).toBe('Three tasks on the list. Three sessions attended.');
    expect(health.line).not.toContain('open');
  });
});

describe('the empty cases', () => {
  const oneArea: State = reduce(EMPTY_STATE, {
    type: 'createArea', id: 'health', name: 'Health', color: 'primary', sessionsPerWeek: 3, isDaily: true,
  });

  it('explains Home when no area is daily', () => {
    const noneDaily = reduce(oneArea, { type: 'editArea', areaId: 'health', changes: { isDaily: false } });
    expect(homeView(noneDaily, NOW).emptyNote).toBe(
      'No area waits for you here. You set each one to appear when you add it, so Home fills as you do.'
    );
  });

  it('says so when every daily area was attended today', () => {
    const steps: Action[] = [
      { type: 'capture', now: NOW, id: 't', title: 'Change the filter', areaId: 'health' },
      { type: 'startSession', now: NOW, id: 's', taskId: 't', areaId: 'health' },
      { type: 'closeSession', now: new Date(NOW.getTime() + 900_000), outcome: 'completed', note: '' },
    ];
    const attended = steps.reduce(reduce, oneArea);
    expect(homeView(attended, NOW).emptyNote).toBe('Every daily area was attended today. Nothing is waiting.');
  });

  it('withholds that note while a session is open, because something is waiting', () => {
    const steps: Action[] = [
      { type: 'capture', now: NOW, id: 't', title: 'Change the filter', areaId: 'health' },
      { type: 'startSession', now: NOW, id: 's', taskId: 't', areaId: 'health' },
    ];
    const tending = steps.reduce(reduce, oneArea);
    expect(homeView(tending, NOW).emptyNote).toBeNull();
  });

  it('distinguishes a Picker that never started from one that finished', () => {
    const never = pickerView(oneArea, 'health', NOW)!;
    expect([never.emptyHeading, never.emptyNote]).toEqual([
      'Nothing on the list',
      'Capture something for Health, or give an inbox item this area.',
    ]);

    const steps: Action[] = [
      { type: 'capture', now: NOW, id: 't', title: 'Change the filter', areaId: 'health' },
      { type: 'startSession', now: NOW, id: 's', taskId: 't', areaId: 'health' },
      { type: 'closeSession', now: new Date(NOW.getTime() + 900_000), outcome: 'completed', note: '' },
    ];
    const finished = steps.reduce(reduce, oneArea);
    const done = pickerView(finished, 'health', NOW)!;
    expect([done.emptyHeading, done.emptyNote]).toEqual([
      'Nothing on the list',
      'You closed everything on the Health list. Put something new on it when there is something.',
    ]);
  });

  it('names two absent areas in one sentence, joined', () => {
    const steps: Action[] = [
      { type: 'editArea', areaId: 'health', changes: { isDaily: false } },
      { type: 'createArea', id: 'money', name: 'Money', color: 'load', sessionsPerWeek: 2, isDaily: false },
      { type: 'createArea', id: 'home', name: 'Home', color: 'soft', sessionsPerWeek: 2, isDaily: true },
    ];
    const twoAbsent = steps.reduce(reduce, oneArea);
    expect(homeView(twoAbsent, NOW).absenceNote).toBe(
      'Health and Money keep a weekly rhythm. They are not daily areas, so they do not wait for you here.'
    );
  });

  it('says nothing about absence when every area is daily', () => {
    expect(homeView(oneArea, NOW).absenceNote).toBeNull();
  });
});
