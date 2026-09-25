import { describe, expect, it } from 'vitest';

import {
  clockString,
  dateLabel,
  dayName,
  daysBetween,
  elapsedMinutes,
  joinNames,
  numberWord,
  numberWordCapital,
  spellNumberCapital,
} from '@/lib/derive/format';

/** T015 — FR-011, FR-022b, FR-029, FR-030. */

describe('FR-029 — words to twelve, figures from thirteen', () => {
  it('writes twelve as a word and thirteen as a figure', () => {
    expect(numberWord(12)).toBe('twelve');
    expect(numberWord(13)).toBe('13');
    expect(numberWordCapital(12)).toBe('Twelve');
    expect(numberWordCapital(13)).toBe('13');
  });

  it('crosses the boundary in both directions and nowhere else', () => {
    expect([0, 1, 11].map(numberWord)).toEqual(['zero', 'one', 'eleven']);
    expect([14, 52, 99].map(numberWord)).toEqual(['14', '52', '99']);
  });

  it('lets `Three sessions` and `52 minutes` coexist, which is the whole point', () => {
    expect(`${numberWordCapital(3)} sessions`).toBe('Three sessions');
    expect(`${numberWord(52)} minutes`).toBe('52 minutes');
  });
});

describe('FR-030 — day names to seven days back, dates beyond', () => {
  const sunday = new Date(2026, 8, 13, 13, 0);

  it('names the day at exactly seven days back and dates it at eight', () => {
    expect(dayName(new Date(2026, 8, 6, 9, 0), sunday)).toBe('Sunday');
    expect(dayName(new Date(2026, 8, 5, 9, 0), sunday)).toBe('5 September');
  });

  it('names the recent days 001 names', () => {
    expect(dayName(new Date(2026, 8, 10, 7, 40), sunday)).toBe('Thursday');
    expect(dayName(new Date(2026, 8, 7, 18, 30), sunday)).toBe('Monday');
    expect(dayName(sunday, sunday)).toBe('Sunday');
  });

  it('counts whole calendar days, not elapsed hours', () => {
    expect(daysBetween(new Date(2026, 8, 12, 23, 50), sunday)).toBe(1);
    expect(dateLabel(new Date(2026, 8, 7))).toBe('7 September');
  });
});

describe('FR-022b — joining names', () => {
  it('joins one, two and three', () => {
    expect(joinNames(['People'])).toBe('People');
    expect(joinNames(['People', 'Money'])).toBe('People and Money');
    expect(joinNames(['People', 'Money', 'Home'])).toBe('People, Money and Home');
  });

  it('gives nothing for no names, so the caller renders no sentence', () => {
    expect(joinNames([])).toBe('');
  });
});

describe('FR-011 — the clock passes zero and keeps going', () => {
  const start = new Date(2026, 8, 13, 13, 0, 0);
  const after = (seconds: number) => new Date(start.getTime() + seconds * 1000);

  it('counts down, reaches 0:00, and counts up with a plus', () => {
    expect(clockString(start, after(44))).toBe('14:16');
    expect(clockString(start, after(15 * 60))).toBe('0:00');
    expect(clockString(start, after(32 * 60 + 4))).toBe('+17:04');
  });

  it('has no maximum', () => {
    expect(clockString(start, after(3 * 60 * 60))).toBe('+165:00');
  });

  it('is derived from two timestamps, so a dropped tick cannot make it wrong', () => {
    /* Jumping straight from one minute in to forty gives the same answer a
       tick-by-tick counter would have reached, which is what makes a
       backgrounded tab correct the moment it comes back. */
    expect(clockString(start, after(40 * 60))).toBe('+25:00');
    expect(elapsedMinutes(start, after(40 * 60))).toBe(40);
  });

  it('spells the minutes the line beneath it names', () => {
    expect(spellNumberCapital(15)).toBe('Fifteen');
    expect(spellNumberCapital(32)).toBe('Thirty-two');
  });
});
