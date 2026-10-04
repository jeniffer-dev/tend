import { describe, expect, it } from 'vitest';

import {
  attendedToday,
  homeAreas,
  isPastRhythm,
  lastSessionForArea,
  minutesInWeek,
  minutesToday,
  onHomeToday,
  openSessionInWeek,
  sessionsInWeek,
} from '@/lib/derive/counting';
import { weekContaining } from '@/lib/derive/week';
import type { Area, Session, State } from '@/lib/state/types';

/** T013 — FR-006a, FR-009, FR-015a. */

const SUNDAY = new Date(2026, 8, 13, 13, 0);
const week = weekContaining(SUNDAY);

const area = (sessionsPerWeek: 1 | 2 | 3 | 4 | 5): Area => ({
  id: 'health',
  name: 'Health',
  color: 'primary',
  sessionsPerWeek,
  isDaily: true,
  sortOrder: 1,
  archivedAt: null,
  addedToHomeOn: null,
});

let n = 0;
const closed = (startedAt: Date, minutes: number): Session => ({
  id: `c${(n += 1)}`,
  taskId: 't',
  areaId: 'health',
  startedAt,
  endedAt: new Date(startedAt.getTime() + minutes * 60_000),
  plannedMinutes: 15,
  actualMinutes: minutes,
  outcome: 'progressed',
  progressNote: '',
});

const open = (startedAt: Date): Session => ({
  id: 'open',
  taskId: 't',
  areaId: 'health',
  startedAt,
  endedAt: null,
  plannedMinutes: 15,
  actualMinutes: null,
  outcome: null,
  progressNote: '',
});

const stateWith = (...sessions: Session[]): State => ({
  areas: [area(3)],
  tasks: [],
  sessions,
  activeSessionId: sessions.find((s) => s.endedAt === null)?.id ?? null,
});

describe('the rhythm is compared, never divided (FR-009)', () => {
  const three = [
    closed(new Date(2026, 8, 7, 9), 20),
    closed(new Date(2026, 8, 9, 9), 15),
    closed(new Date(2026, 8, 11, 9), 17),
  ];

  it('is not past the rhythm at it, and is past it above it', () => {
    expect(isPastRhythm(area(3), stateWith(...three), week)).toBe(false);
    expect(isPastRhythm(area(4), stateWith(...three), week)).toBe(false);
    expect(isPastRhythm(area(2), stateWith(...three), week)).toBe(true);
  });

  it('returns a boolean and never a proportion', () => {
    const result = isPastRhythm(area(2), stateWith(...three), week);
    expect(typeof result).toBe('boolean');
  });
});

describe('FR-006a — a session counts from its start and measures from its close', () => {
  const mixed = stateWith(
    closed(new Date(2026, 8, 7, 9), 22),
    closed(new Date(2026, 8, 7, 18), 30),
    open(new Date(2026, 8, 13, 12, 50))
  );

  it('counts the open session', () => {
    expect(sessionsInWeek(mixed, 'health', week)).toBe(3);
  });

  it('leaves the open session out of the minutes', () => {
    expect(minutesInWeek(mixed, 'health', week)).toBe(52);
  });

  it('hands back the open session so a screen can name it', () => {
    expect(openSessionInWeek(mixed, 'health', week)?.id).toBe('open');
    const allClosed = stateWith(closed(new Date(2026, 8, 7, 9), 22));
    expect(openSessionInWeek(allClosed, 'health', week)).toBeNull();
  });

  it('sums the recorded figure, not the timestamps', () => {
    /* A session whose record disagrees with its own clock: the record is
       right and the arithmetic is stale (FR-010a). */
    const stale: Session = { ...closed(new Date(2026, 8, 8, 9), 20), actualMinutes: 7 };
    expect(minutesInWeek(stateWith(stale), 'health', week)).toBe(7);
  });
});

describe('FR-015a — attended today starts when the session starts', () => {
  it('is true for a session that has started and not closed', () => {
    expect(attendedToday(stateWith(open(new Date(2026, 8, 13, 12, 50))), 'health', SUNDAY)).toBe(true);
  });

  it('stays true for a closed session earlier today, and false for yesterday', () => {
    expect(attendedToday(stateWith(closed(new Date(2026, 8, 13, 9, 30), 15)), 'health', SUNDAY)).toBe(true);
    expect(attendedToday(stateWith(closed(new Date(2026, 8, 12, 23, 50), 15)), 'health', SUNDAY)).toBe(false);
  });

  it('counts today in minutes from the closed sessions only', () => {
    const both = stateWith(closed(new Date(2026, 8, 13, 9, 30), 15), open(new Date(2026, 8, 13, 12, 50)));
    expect(minutesToday(both, 'health', SUNDAY)).toBe(15);
  });
});

describe('the last session on an area', () => {
  it('is the most recent by start, across a week boundary', () => {
    const across = stateWith(
      closed(new Date(2026, 8, 4, 9), 15),
      closed(new Date(2026, 8, 7, 18, 30), 30)
    );
    expect(lastSessionForArea(across, 'health')?.startedAt).toEqual(new Date(2026, 8, 7, 18, 30));
  });

  it('is nothing when the area has never been tended', () => {
    expect(lastSessionForArea(stateWith(), 'health')).toBeNull();
  });
});

describe('T038c — on Home today (FR-022, FR-022d)', () => {
  const people: Area = { ...area(1), id: 'people', name: 'People', isDaily: false, sortOrder: 2 };
  const added = (when: Date): Area => ({ ...people, addedToHomeOn: when });

  it('a daily area is always on Home', () => {
    expect(onHomeToday(area(3), SUNDAY)).toBe(true);
  });

  it('a non-daily area never added is not', () => {
    expect(onHomeToday(people, SUNDAY)).toBe(false);
  });

  it('added today, it is on Home for the rest of the local day', () => {
    expect(onHomeToday(added(new Date(2026, 8, 13, 8, 0)), SUNDAY)).toBe(true);
    expect(onHomeToday(added(new Date(2026, 8, 13, 8, 0)), new Date(2026, 8, 13, 23, 59, 59))).toBe(true);
  });

  it('added at 23:59, it is gone at 00:00 — nothing clears it, the date moved', () => {
    const lateOne = added(new Date(2026, 8, 13, 23, 59));
    expect(onHomeToday(lateOne, new Date(2026, 8, 13, 23, 59, 30))).toBe(true);
    expect(onHomeToday(lateOne, new Date(2026, 8, 14, 0, 0))).toBe(false);
  });

  it('added yesterday, it is not on Home today', () => {
    expect(onHomeToday(added(new Date(2026, 8, 12, 20, 0)), SUNDAY)).toBe(false);
  });

  it('an archived area is never on Home, daily or added', () => {
    expect(onHomeToday({ ...area(3), archivedAt: SUNDAY }, SUNDAY)).toBe(false);
    expect(onHomeToday({ ...added(SUNDAY), archivedAt: SUNDAY }, SUNDAY)).toBe(false);
  });

  it('homeAreas lists what is on Home today, in sortOrder', () => {
    const money: Area = { ...area(2), id: 'money', name: 'Money', sortOrder: 3 };
    const state: State = {
      areas: [money, added(SUNDAY), area(3)],
      tasks: [],
      sessions: [],
      activeSessionId: null,
    };
    expect(homeAreas(state, SUNDAY).map((a) => a.id)).toEqual(['health', 'people', 'money']);
    expect(homeAreas(state, new Date(2026, 8, 14, 9, 0)).map((a) => a.id)).toEqual(['health', 'money']);
  });
});
