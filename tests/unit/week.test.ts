import { describe, expect, it } from 'vitest';

import {
  endOfWeek,
  isInWeek,
  previousWeek,
  reviewWeekFor,
  startOfWeek,
  weekClosing,
  weekContaining,
  weekOf,
} from '@/lib/derive/week';
import type { Session } from '@/lib/state/types';

/** T011 — FR-005, FR-006, SC-002. */

const session = (startedAt: Date, endedAt: Date | null = null): Session => ({
  id: 's',
  taskId: 't',
  areaId: 'a',
  startedAt,
  endedAt,
  plannedMinutes: 15,
  actualMinutes: endedAt ? 20 : null,
  outcome: endedAt ? 'progressed' : null,
  progressNote: '',
});

describe('the week runs Monday to Sunday, local', () => {
  it('starts at Monday 00:00 from any day in the week', () => {
    for (const day of [7, 8, 9, 10, 11, 12, 13]) {
      const start = startOfWeek(new Date(2026, 8, day, 17, 30));
      expect([start.getFullYear(), start.getMonth(), start.getDate()]).toEqual([2026, 8, 7]);
      expect([start.getHours(), start.getMinutes(), start.getSeconds()]).toEqual([0, 0, 0]);
    }
  });

  it('ends at Sunday 23:59:59.999', () => {
    const end = endOfWeek(new Date(2026, 8, 9));
    expect([end.getMonth(), end.getDate()]).toEqual([8, 13]);
    expect([end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds()]).toEqual([
      23, 59, 59, 999,
    ]);
  });

  it('puts Monday 00:00 inside the week and one millisecond earlier outside it', () => {
    const week = weekContaining(new Date(2026, 8, 9));
    expect(isInWeek(session(new Date(2026, 8, 7, 0, 0, 0, 0)), week)).toBe(true);
    expect(isInWeek(session(new Date(2026, 8, 6, 23, 59, 59, 999)), week)).toBe(false);
  });

  it('is built from date parts, so a daylight-saving week still starts at local midnight', () => {
    /* Southern-hemisphere DST begins on the first Sunday of October; the
       clock jumps forward inside the week of 28 September. Subtracting
       seven 24-hour days from that Sunday lands an hour off. */
    const start = startOfWeek(new Date(2026, 9, 4, 12, 0));
    expect([start.getMonth(), start.getDate(), start.getHours()]).toEqual([8, 28, 0]);
    const end = endOfWeek(new Date(2026, 8, 28));
    expect([end.getMonth(), end.getDate(), end.getHours()]).toEqual([9, 4, 23]);
  });
});

describe('a session belongs to the week containing its start (FR-006, SC-002)', () => {
  it('counts a Sunday 23:58 session closed Monday 00:20 in the closing week', () => {
    const crossing = session(new Date(2026, 8, 13, 23, 58), new Date(2026, 8, 14, 0, 20));
    const closing = weekContaining(new Date(2026, 8, 13, 12, 0));
    const next = weekContaining(new Date(2026, 8, 14, 12, 0));

    expect(isInWeek(crossing, closing)).toBe(true);
    expect(isInWeek(crossing, next)).toBe(false);
    expect(weekOf(crossing).start.getDate()).toBe(7);
  });

  it('reads startedAt and never endedAt', () => {
    const openOnSunday = session(new Date(2026, 8, 13, 23, 58), null);
    expect(weekOf(openOnSunday).start.getDate()).toBe(7);
  });
});

describe('when the week closes (FR-019a)', () => {
  it('is Sunday on Sunday and Monday on Monday, and nothing on the other five days', () => {
    expect(weekClosing(new Date(2026, 8, 13, 13, 0))).toBe('sunday');
    expect(weekClosing(new Date(2026, 8, 14, 9, 0))).toBe('monday');
    for (const day of [8, 9, 10, 11, 12]) {
      expect(weekClosing(new Date(2026, 8, day, 9, 0))).toBeNull();
    }
  });

  it('shows the closing week on Sunday and the week that just closed on Monday', () => {
    expect(reviewWeekFor(new Date(2026, 8, 13, 13, 0)).start.getDate()).toBe(7);
    expect(reviewWeekFor(new Date(2026, 8, 14, 9, 0)).start.getDate()).toBe(7);
  });

  it('shows the week that last closed on Tuesday to Saturday (FR-019d)', () => {
    for (const day of [15, 16, 17, 18, 19]) {
      expect(reviewWeekFor(new Date(2026, 8, day, 12, 0)).start.getDate(), `the ${day}th`).toBe(7);
    }
  });

  it('with ?week=last, shows the week before the current one on every day (FR-019d)', () => {
    /* Sunday is the one day it differs from the default: the closing week
       is this one, and last week is the one before it. */
    expect(reviewWeekFor(new Date(2026, 8, 13, 13, 0), 'last').start.getDate()).toBe(31);
    for (const day of [14, 15, 16, 17, 18, 19]) {
      expect(reviewWeekFor(new Date(2026, 8, day, 12, 0), 'last').start.getDate(), `the ${day}th`).toBe(7);
    }
  });

  it('reaches the previous week from any day', () => {
    expect(previousWeek(new Date(2026, 8, 10)).start.getDate()).toBe(31);
  });
});
