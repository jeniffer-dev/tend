/**
 * The week. T010.
 *
 * FR-005 — Monday 00:00 to Sunday 23:59:59.999, local time, as one boundary
 * for the whole system. No per-area weeks and no configurable start.
 */

import type { Session } from '@/lib/state/types';

export type Week = { start: Date; end: Date };

/**
 * Monday 00:00 local.
 *
 * **Built from local date parts, never by subtracting milliseconds.** Days
 * are not reliably 86,400,000ms apart under daylight saving, so subtracting
 * a duration lands an hour off twice a year and the week silently starts on
 * Sunday at 23:00 (research.md §3).
 */
export function startOfWeek(now: Date): Date {
  const day = now.getDay();
  /* getDay() is Sunday-based; Monday-based means Sunday is six days in. */
  const daysSinceMonday = (day + 6) % 7;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
}

/** Sunday 23:59:59.999 local, built the same way. */
export function endOfWeek(now: Date): Date {
  const start = startOfWeek(now);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
}

export const weekContaining = (now: Date): Week => ({
  start: startOfWeek(now),
  end: endOfWeek(now),
});

/** The week before the one containing `now`. */
export function previousWeek(now: Date): Week {
  const start = startOfWeek(now);
  const earlier = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 7);
  return weekContaining(earlier);
}

/**
 * FR-006 — a session counts toward the week containing its **start**,
 * however it ends. One begun at 23:58 on Sunday belongs to the week that is
 * closing even when it is closed on Monday.
 */
export const weekOf = (session: Session): Week => weekContaining(session.startedAt);

export const isInWeek = (session: Session, week: Week): boolean =>
  session.startedAt >= week.start && session.startedAt <= week.end;

/**
 * FR-019a — Home's Review entry appears on Sunday and on Monday, and on no
 * other day. Sunday shows the week that is closing; Monday, the week that
 * has just closed.
 */
export function weekClosing(now: Date): 'sunday' | 'monday' | null {
  const day = now.getDay();
  if (day === 0) return 'sunday';
  if (day === 1) return 'monday';
  return null;
}

export const isWeekClosing = (now: Date) => weekClosing(now) !== null;

/** Which week Review shows when it is reached from Home: the one closing on
 *  Sunday, the one that just closed on Monday (FR-019a). */
export function reviewWeekFor(now: Date): Week {
  return weekClosing(now) === 'monday' ? previousWeek(now) : weekContaining(now);
}
