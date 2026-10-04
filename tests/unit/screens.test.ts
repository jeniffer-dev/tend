import { describe, expect, it } from 'vitest';

import {
  areaChoices,
  homeView,
  inboxView,
  pickerView,
  reviewView,
  rhythmLabel,
  sessionView,
  weekView,
} from '@/lib/derive/screens';
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

  it('lists every area, daily or not (FR-007a, superseding 001 Q3)', () => {
    expect(view.rows.map((r) => r.areaId)).toEqual(['morning-pages', 'health', 'home', 'people', 'money']);
    expect(view.heading).toBe('Five areas, eleven sessions');
  });

  it('says a row has no sessions rather than writing a zero (FR-007a)', () => {
    const people = view.rows.find((r) => r.areaId === 'people')!;
    expect(people.sessionsLabel).toBe('One session');
    expect(people.line).toBe('One task on the list. No sessions attended.');
    expect(view.rows.some((r) => /\bzero\b|\b0\b/i.test(r.line))).toBe(false);
  });

  it('replaces both sentences when an area has neither tasks nor sessions', () => {
    const bare = reduce(EMPTY_STATE, {
      type: 'createArea', id: 'health', name: 'Health', color: 'primary', sessionsPerWeek: 3, isDaily: true,
    });
    expect(weekView(bare, NOW).rows[0].line).toBe('No tasks on the list. No sessions attended.');
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

describe('Review — what was attended, and what went unattended (T033, T035)', () => {
  const apply = (state: State, ...actions: Action[]) => actions.reduce(reduce, state);
  const at = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000);
  const start = (taskId: string, areaId: string, when = NOW): Action => ({
    type: 'startSession', now: when, id: `s-${taskId}-${when.getTime()}`, taskId, areaId,
  });
  const close = (when: Date, note = ''): Action => ({ type: 'closeSession', now: when, outcome: 'progressed', note });
  const row = (view: ReturnType<typeof reviewView>, areaId: string) =>
    [...view.attended, ...view.unattended].find((r) => r.areaId === areaId)!;

  const view = reviewView(SEED_001, NOW);

  it('names the week, and counts every session in it', () => {
    expect(view.eyebrow).toBe('Week of 7 September');
    expect(view.heading).toBe('Seven sessions');
    expect(view.headingNote).toBeNull();
  });

  it('lists Attended in the Areas order, then every area with none (FR-008b)', () => {
    expect(view.attended.map((r) => r.areaId)).toEqual(['morning-pages', 'health', 'home', 'money']);
    expect(view.unattended.map((r) => r.areaId)).toEqual(['people']);
  });

  it('gives each attended row its minutes and its most recent note', () => {
    expect(row(view, 'health')).toMatchObject({
      sessionsLabel: 'Two sessions',
      line: '52 minutes. Last note: Found the lab. Need the referral number from the clinic.',
    });
    /* Money's most recent session has a note; the one before it has none,
       and the most recent non-empty note is what the line carries. */
    expect(row(view, 'money')).toMatchObject({
      sessionsLabel: 'Three sessions',
      line: '31 minutes. Last note: Cancelled. The new one arrives next week.',
    });
  });

  it('keeps 001\'s one-line form for one closed session with no note', () => {
    expect(row(view, 'home')).toMatchObject({ sessionsLabel: 'One session, 15 minutes', line: null });
  });

  it('takes the no-note line for two or more closed sessions with no note', () => {
    const twice = apply(
      SEED_001,
      start('change-the-filter', 'home', at(10)), close(at(30)),
    );
    expect(row(reviewView(twice, at(40)), 'home')).toMatchObject({
      sessionsLabel: 'Two sessions',
      line: '35 minutes. No note this time.',
    });
  });

  it('writes minutes as words to twelve, capitalised where they open the line (FR-029)', () => {
    const short = apply(SEED_001, start('write-to-nan', 'people', at(10)), close(at(19), 'Started the letter.'));
    expect(row(reviewView(short, at(20)), 'people').line).toBe('Nine minutes. Last note: Started the letter.');

    const bare = apply(SEED_001, start('write-to-nan', 'people', at(10)), close(at(19)));
    expect(row(reviewView(bare, at(20)), 'people').sessionsLabel).toBe('One session, nine minutes');
  });

  it('gives an unattended row its name and no line (FR-008b)', () => {
    expect(row(view, 'people')).toMatchObject({ name: 'People', sessionsLabel: null, line: null });
  });

  it('shows the closing note, because something went unattended', () => {
    expect(view.closingNote).toBe(
      'Unattended is a fact about the week, not about you. Next week starts with the same areas.'
    );
    expect(view.everyAreaAttended).toBeNull();
  });

  describe('an open session (FR-006a, FR-008a)', () => {
    it('counts it, adds no minutes, and names it', () => {
      const running = apply(SEED_001, start('book-the-blood-test', 'health'));
      const v = reviewView(running, at(5));
      expect(v.heading).toBe('Eight sessions');
      expect(row(v, 'health')).toMatchObject({
        sessionsLabel: 'Three sessions',
        line: '52 minutes. One still open. Last note: Found the lab. Need the referral number from the clinic.',
      });
    });

    it('says so without a note when the closed ones have none', () => {
      const running = apply(SEED_001, start('change-the-filter', 'home'));
      expect(row(reviewView(running, at(5)), 'home').line).toBe(
        '15 minutes. One still open. No note this time.'
      );
    });

    it('renders no figure at all when the open one is the only session', () => {
      const running = apply(SEED_001, start('write-to-nan', 'people'));
      const v = reviewView(running, at(5));
      expect(row(v, 'people')).toMatchObject({
        sessionsLabel: 'One session',
        line: 'One still open. Minutes are recorded when it closes.',
      });
      expect(row(v, 'people').line).not.toMatch(/\b0\b|zero/i);
    });
  });

  it('says every area was attended, and drops the closing note', () => {
    const all = apply(SEED_001, start('write-to-nan', 'people', at(10)), close(at(25)));
    const v = reviewView(all, at(30));
    expect(v.unattended).toEqual([]);
    expect(v.everyAreaAttended).toBe('Every area was attended this week.');
    expect(v.closingNote).toBeNull();
  });

  it('keeps an archived area\'s sessions under its name, and forgets it otherwise (T035, FR-018)', () => {
    const archived = apply(SEED_001, { type: 'removeArea', now: NOW, areaId: 'health' });
    expect(row(reviewView(archived, NOW), 'health')).toMatchObject({ name: 'Health', sessionsLabel: 'Two sessions' });

    const quiet = apply(SEED_001, { type: 'removeArea', now: NOW, areaId: 'people' });
    expect(reviewView(quiet, NOW).unattended.map((r) => r.areaId)).toEqual([]);
  });

  it('shows the week before on ?week=last, and says which (FR-019d)', () => {
    const last = reviewView(SEED_001, NOW, 'last');
    expect(last.eyebrow).toBe('Week of 31 August');
    expect(last.heading).toBe('No sessions');
    expect(last.headingNote).toBe('Nothing was attended this week.');
    expect(last.attended).toEqual([]);
  });

  it('shows the week that closed, on the Monday after', () => {
    expect(reviewView(SEED_001, new Date(2026, 8, 14, 9, 0)).eyebrow).toBe('Week of 7 September');
  });

  it('never puts a percentage or a ratio on the screen (FR-004)', () => {
    const text = JSON.stringify(view);
    expect(text).not.toMatch(/%|\bout of\b|\d\/\d/);
  });
});

describe('T038e — a non-daily area added to Home for the day (User Story 6)', () => {
  const apply = (state: State, ...actions: Action[]) => actions.reduce(reduce, state);
  const MONDAY = new Date(2026, 8, 14, 9, 0);
  const addPeople: Action = { type: 'addToHomeToday', now: NOW, areaId: 'people' };
  const added = apply(SEED_001, addPeople);
  const weekRowFor = (state: State, now: Date, id: string) => weekView(state, now).rows.find((r) => r.areaId === id)!;

  describe('Week offers the action on non-daily rows only (FR-022c)', () => {
    it('offers it on People and on no daily row', () => {
      const view = weekView(SEED_001, NOW);
      expect(weekRowFor(SEED_001, NOW, 'people')).toMatchObject({ homeAction: 'Add it to Home today', onHomeNote: null });
      for (const row of view.rows.filter((r) => r.areaId !== 'people')) {
        expect(row, row.areaId).toMatchObject({ homeAction: null, onHomeNote: null });
      }
    });

    it('once used, says so in its place and offers nothing', () => {
      expect(weekRowFor(added, NOW, 'people')).toMatchObject({ homeAction: null, onHomeNote: 'On Home today.' });
    });

    it('offers it again the next day (scenario 5)', () => {
      expect(weekRowFor(added, MONDAY, 'people')).toMatchObject({ homeAction: 'Add it to Home today', onHomeNote: null });
    });
  });

  describe('Home holds it as an ordinary card (FR-022, FR-022d)', () => {
    it('shows People as a card in the Areas order, and names no one absent (scenario 3)', () => {
      const view = homeView(added, NOW);
      expect(view.cards.map((c) => c.areaId)).toEqual(['morning-pages', 'health', 'people', 'money', 'home']);
      expect(view.cards.find((c) => c.areaId === 'people')).toMatchObject({
        treatment: 'to-tend',
        /* The line any card would have: the seed's historical sessions put
           People's last one on 28 August, more than seven days back. */
        line: 'Last attended 28 August.',
      });
      expect(view.absenceNote).toBeNull();
    });

    it('is gone the next day, and the absence note is back (scenario 5)', () => {
      const view = homeView(added, MONDAY);
      expect(view.cards.map((c) => c.areaId)).not.toContain('people');
      expect(view.absenceNote).toBe(
        'People keeps a rhythm of one session a week. It is not a daily area, so it does not wait for you here.'
      );
    });
  });

  describe('Home\'s notes follow its cards (FR-022e)', () => {
    const quiet: State = apply(
      EMPTY_STATE,
      { type: 'createArea', id: 'people', name: 'People', color: 'recovery', sessionsPerWeek: 1, isDaily: false },
      { type: 'capture', now: NOW, id: 'nan', title: 'Write to Nan', areaId: 'people' },
    );

    it('says no area waits when Home has no card (scenario 7)', () => {
      const view = homeView(quiet, NOW);
      expect(view.cards).toEqual([]);
      expect(view.emptyNote).toBe(
        'No area waits for you here. You set each one to appear when you add it, so Home fills as you do.'
      );
    });

    it('does not say it once an area is added (scenario 7)', () => {
      const view = homeView(apply(quiet, addPeople), NOW);
      expect(view.cards.map((c) => c.areaId)).toEqual(['people']);
      expect(view.emptyNote).toBeNull();
    });

    it('does not say every daily area was attended when Home holds only added ones (scenario 6)', () => {
      const tended = apply(
        quiet,
        addPeople,
        { type: 'startSession', now: NOW, id: 's1', taskId: 'nan', areaId: 'people' },
        { type: 'closeSession', now: new Date(NOW.getTime() + 900_000), outcome: 'progressed', note: '' },
      );
      const view = homeView(tended, new Date(NOW.getTime() + 1_000_000));
      expect(view.cards).toMatchObject([{ areaId: 'people', treatment: 'attended' }]);
      expect(view.emptyNote).toBeNull();
    });
  });
});

describe('T039, T041 — Capture\'s chips and the Inbox', () => {
  const apply = (state: State, ...actions: Action[]) => actions.reduce(reduce, state);

  describe('areaChoices — every unarchived area in the Areas order (FR-022a)', () => {
    it('offers all five seeded areas, daily or not, in sortOrder', () => {
      expect(areaChoices(SEED_001).map((c) => c.name)).toEqual([
        'Morning pages', 'Health', 'Home', 'People', 'Money',
      ]);
    });

    it('follows a reorder and drops an archived area', () => {
      const changed = apply(
        SEED_001,
        { type: 'reorderAreas', orderedIds: ['money', 'health', 'home', 'people', 'morning-pages'] },
        { type: 'removeArea', now: NOW, areaId: 'home' },
      );
      expect(areaChoices(changed).map((c) => c.areaId)).toEqual(['money', 'health', 'people', 'morning-pages']);
    });
  });

  describe('inboxView (FR-020, FR-030)', () => {
    const view = inboxView(SEED_001, NOW);

    it('renders 001\'s heading and labels from the seed', () => {
      expect(view.heading).toBe('Three unsorted');
      expect(view.emptyNote).toBeNull();
      expect(view.items.map((i) => i.capturedLabel)).toEqual([
        'Captured Monday', 'Captured Monday', 'Captured 3 September',
      ]);
    });

    it('says today for something captured today', () => {
      const fresh = apply(SEED_001, { type: 'capture', now: NOW, id: 'new', title: 'Call the bank', areaId: null });
      const v = inboxView(fresh, NOW);
      expect(v.heading).toBe('Four unsorted');
      expect(v.items.find((i) => i.id === 'new')!.capturedLabel).toBe('Captured today');
    });

    it('leaves out what was captured with an area, or given one', () => {
      const sorted = apply(
        SEED_001,
        { type: 'capture', now: NOW, id: 'new', title: 'Call the bank', areaId: 'money' },
        { type: 'giveTaskAnArea', taskId: 'ask-the-dentist', areaId: 'health' },
      );
      const v = inboxView(sorted, NOW);
      expect(v.heading).toBe('Two unsorted');
      expect(v.items.map((i) => i.id)).not.toContain('new');
      expect(v.items.map((i) => i.id)).not.toContain('ask-the-dentist');
    });

    it('is Nothing unsorted, with its note, when empty', () => {
      const empty = apply(
        SEED_001,
        ...inboxView(SEED_001, NOW).items.map(
          (i): Action => ({ type: 'giveTaskAnArea', taskId: i.id, areaId: 'health' })
        ),
      );
      const v = inboxView(empty, NOW);
      expect(v).toMatchObject({
        heading: 'Nothing unsorted',
        emptyNote: 'Everything you captured has an area.',
        items: [],
      });
    });
  });
});
