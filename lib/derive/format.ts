/**
 * How Tend writes numbers, days and the clock. T014.
 *
 * Every function here is pure and takes `now` when it needs a moment. None
 * reads the clock (research.md §2).
 */

const UNITS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const capitalise = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** Spell a number in full, however large, up to ninety-nine. This is NOT
 *  FR-029 — see `numberWord` for that. It exists for the one place the
 *  approved copy spells a number past twelve: the line under the session
 *  clock, which reads `Thirty-two minutes on Health.` while Home's line
 *  reads `Attended today, 15 minutes`. Both are approved and they disagree,
 *  which is recorded rather than resolved here. */
export function spellNumber(n: number): string {
  if (n < 0 || !Number.isInteger(n)) return String(n);
  if (n < 20) return UNITS[n];
  if (n > 99) return String(n);
  const tens = TENS[Math.floor(n / 10)];
  const unit = n % 10;
  return unit === 0 ? tens : `${tens}-${UNITS[unit]}`;
}

export const spellNumberCapital = (n: number) => capitalise(spellNumber(n));

/**
 * FR-029 — words up to twelve, figures from thirteen.
 *
 * This is what lets `Three sessions` and `52 minutes` both be correct. It
 * returns lowercase; the caller capitalises when the number opens a
 * sentence, because `Four areas, ten sessions` does both in one string.
 */
export function numberWord(n: number): string {
  if (!Number.isInteger(n) || n < 0) return String(n);
  return n <= 12 ? UNITS[n] : String(n);
}

export const numberWordCapital = (n: number) => capitalise(numberWord(n));

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** The local date, with the time thrown away. Built from date parts and
 *  never by subtracting milliseconds: days are not reliably 86,400,000ms
 *  apart under daylight saving (research.md §3). */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole days from `then` to `now`, by local calendar date. */
export function daysBetween(then: Date, now: Date): number {
  const a = startOfDay(then).getTime();
  const b = startOfDay(now).getTime();
  /* Both ends are local midnights, so the quotient is exact to the day even
     across a changeover; rounding absorbs the hour the clock moved. */
  return Math.round((b - a) / 86_400_000);
}

export const isSameDay = (a: Date, b: Date) => daysBetween(a, b) === 0;

/** `7 September`, the form Review's eyebrow uses. */
export const dateLabel = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

/**
 * FR-030 — a past day is named by its day name up to seven days back, and
 * by its date beyond that.
 *
 * Seven days back inclusive: on a Sunday, the previous Sunday is seven days
 * ago and still carries its name, which is the boundary T015 pins.
 */
export function dayName(then: Date, now: Date): string {
  const days = daysBetween(then, now);
  if (days <= 7) return DAYS[then.getDay()];
  return dateLabel(then);
}

/**
 * FR-022b — `A and B` for two, `A, B and C` for three or more.
 * One name is itself, and no name is an empty string the caller must not
 * render.
 */
export function joinNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * FR-011 — the clock counts down from fifteen minutes, reaches 0:00 and
 * continues upward with a `+`, with no maximum.
 *
 * It is derived from two timestamps, never counted down from a stored
 * remainder (research.md §4). That buys three things for free: there is no
 * terminal state to branch on, a dropped or throttled tick cannot make it
 * wrong, and a backgrounded tab shows the right number the moment it comes
 * back rather than however far a counter got.
 */
export function clockString(startedAt: Date, now: Date, plannedMinutes = 15): string {
  const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
  const remaining = plannedMinutes * 60 - elapsed;
  const sign = remaining < 0 ? '+' : '';
  const abs = Math.abs(remaining);
  const minutes = Math.floor(abs / 60);
  const seconds = abs % 60;
  return `${sign}${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Whole minutes elapsed, which is what the line under the clock names and
 *  what `actualMinutes` records at close. */
export function elapsedMinutes(startedAt: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 60_000));
}
