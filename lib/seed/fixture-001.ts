/**
 * State equivalent to 001's fixtures, and the moment they describe. T018.
 *
 * **Never a default path.** It loads only under `?seed=001`, read once at
 * the provider, and writes nothing (FR-025, FR-026).
 *
 * Both halves are required. 001's copy says `Sunday`,
 * `Last attended Monday.` and `Week of 7 September`, every one of which is
 * a function of the current date, so seeding the data without seeding the
 * moment would make SC-001 fail every day but one.
 *
 * ## Where this seed does not reproduce 001, and why
 *
 * 001 stored each sentence, so its fixtures were never asked to agree with
 * one another. Asked to agree, four of them do not, and no seed can satisfy
 * both sides:
 *
 * - **Morning pages.** Home reads `Last attended Thursday.` and Week reads
 *   `One session attended.`, while Review lists it under Unattended with
 *   `No sessions this week.` Thursday the 10th is inside the week of the
 *   7th. Home and Week agree; Review cannot also be true.
 * - **Health.** Week reads `Two sessions attended.` and Review reads
 *   `Three sessions`, of the same week.
 * - **Money.** Home's `past-rhythm` treatment needs more sessions than the
 *   rhythm of two, while Week reads `Both sessions attended.` and Review
 *   reads `Two sessions`.
 * - **Home.** Week reads `Two tasks on the list.` and 001 has no task in
 *   that area at all.
 *
 * This seed follows **Home and Week**, which agree with each other, and
 * lets Review differ. It is recorded here rather than resolved: which side
 * is right is the product owner's call, and inventing a reading to make the
 * numbers line up would be the fixture problem again with extra steps.
 */

import type { AreaColor, Rhythm, Session, State, Task } from '@/lib/state/types';

/** Sunday 13 September 2026, 13:00 local — the moment 001's copy describes,
 *  with the closing week running Monday the 7th to Sunday the 13th.
 *
 *  The hour is load-bearing. Parity holds while the seeded moment is still
 *  Sunday; at local midnight the heading becomes `Monday` and Home's Review
 *  entry changes string, both correctly. Thirteen hundred leaves eleven
 *  hours, longer than any sitting, and it is an hour at which the fixture
 *  reads true: something has been attended today and the week still closes
 *  tonight. */
export const SEED_001_ORIGIN = new Date(2026, 8, 13, 13, 0, 0, 0);

const at = (day: number, hour: number, minute = 0) => new Date(2026, 8, day, hour, minute, 0, 0);

type AreaSeed = {
  id: string;
  name: string;
  color: AreaColor;
  sessionsPerWeek: Rhythm;
  isDaily: boolean;
};

const AREAS: AreaSeed[] = [
  { id: 'morning-pages', name: 'Morning pages', color: 'peak', sessionsPerWeek: 3, isDaily: true },
  { id: 'health', name: 'Health', color: 'primary', sessionsPerWeek: 3, isDaily: true },
  { id: 'home', name: 'Home', color: 'soft', sessionsPerWeek: 2, isDaily: true },
  { id: 'people', name: 'People', color: 'recovery', sessionsPerWeek: 1, isDaily: false },
  { id: 'money', name: 'Money', color: 'load', sessionsPerWeek: 2, isDaily: true },
];

/* The five week-list tasks 001 draws, plus the ones its counts imply. Task
   titles are fixture data — one person's example — and not user-facing
   product strings, which is the distinction 001 drew for the same reason. */
const OPEN_TASKS: Array<[string, string, string]> = [
  ['book-the-blood-test', 'Book the blood test', 'health'],
  ['refill-the-prescription', 'Refill the prescription', 'health'],
  ['walk-three-mornings', 'Walk three mornings', 'health'],
  ['three-pages-longhand', 'Three pages, longhand', 'morning-pages'],
  ['reconcile-september', 'Reconcile September', 'money'],
  ['change-the-filter', 'Change the filter', 'home'],
  ['book-the-chimney-sweep', 'Book the chimney sweep', 'home'],
  ['write-to-nan', 'Write to Nan', 'people'],
];

/* Tasks already closed as done. They are off the week list and out of the
   Picker, and they are what the week's other sessions were against. */
const DONE_TASKS: Array<[string, string, string, Date]> = [
  ['the-september-pages', 'The September pages', 'morning-pages', at(10, 7, 40)],
  ['sort-the-statements', 'Sort the statements', 'money', at(9, 20, 15)],
  ['cancel-the-old-card', 'Cancel the old card', 'money', at(11, 19, 30)],
  ['wipe-down-the-shelves', 'Wipe down the shelves', 'home', at(13, 9, 30)],
];

const INBOX: Array<[string, string, Date]> = [
  ['ask-the-dentist', 'Ask the dentist about the night guard', at(7, 8, 10)],
  ['look-up-the-bike-shop', 'Look up the bike shop that does tune-ups', at(7, 21, 5)],
  /* 001 reads `Captured last Thursday`, which FR-030 cannot produce: a day
     eight or more days back is written as a date. Seeded at Thursday the
     3rd, it reads `Captured 3 September`. Recorded above. */
  ['read-back-the-notes', 'Read back the notes from the workshop', at(3, 16, 45)],
];

type SessionSeed = {
  taskId: string;
  areaId: string;
  startedAt: Date;
  minutes: number;
  outcome: 'completed' | 'progressed';
  note: string;
};

/* This week — Monday the 7th to Sunday the 13th. These are the sessions the
   screens in Phase 3 are read against, and every line they produce is
   001's, character for character. */
const THIS_WEEK: SessionSeed[] = [
  /* Health: two sessions, both Monday, so Home reads `Last attended
     Monday.` and Week reads `Two sessions attended.` Their minutes total
     52, which is what Review reads. */
  {
    taskId: 'walk-three-mornings',
    areaId: 'health',
    startedAt: at(7, 7, 5),
    minutes: 22,
    outcome: 'progressed',
    note: 'Two mornings so far. Thursday is open.',
  },
  {
    taskId: 'book-the-blood-test',
    areaId: 'health',
    startedAt: at(7, 18, 30),
    minutes: 30,
    outcome: 'progressed',
    note: 'Found the lab. Need the referral number from the clinic.',
  },
  /* Morning pages: one session, Thursday, on a task since closed — which is
     why the Picker's only Morning pages task still reads
     `Not attended yet.` while Home reads `Last attended Thursday.` */
  {
    taskId: 'the-september-pages',
    areaId: 'morning-pages',
    startedAt: at(10, 7, 40),
    minutes: 18,
    outcome: 'completed',
    note: 'Filled the last page. Starting a new notebook.',
  },
  /* Money: three sessions against a rhythm of two, which is what makes Home
     read `Past the two sessions you set for this week.` None is today, so
     the treatment is past-rhythm rather than attended. */
  {
    taskId: 'sort-the-statements',
    areaId: 'money',
    startedAt: at(8, 20, 0),
    minutes: 12,
    outcome: 'progressed',
    note: 'Statements sorted through August.',
  },
  {
    taskId: 'sort-the-statements',
    areaId: 'money',
    startedAt: at(9, 20, 15),
    minutes: 9,
    outcome: 'completed',
    note: '',
  },
  {
    taskId: 'cancel-the-old-card',
    areaId: 'money',
    startedAt: at(11, 19, 30),
    minutes: 10,
    outcome: 'completed',
    note: 'Cancelled. The new one arrives next week.',
  },
  /* Home: one session today, fifteen minutes, which is Home's attended line
     and Review's `One session, 15 minutes` both. */
  {
    taskId: 'wipe-down-the-shelves',
    areaId: 'home',
    startedAt: at(13, 9, 30),
    minutes: 15,
    outcome: 'completed',
    note: '',
  },
];

/**
 * Sessions before this week, which exist so the removal confirmations can
 * name the counts 001 approved: Morning pages nine, Health fourteen, Home
 * seven, People four, Money eleven.
 *
 * They are generated rather than written out. Each is a closed session on
 * that area's oldest task, a week or more back, so nothing in this week or
 * in `lastAttended` is disturbed.
 */
const HISTORICAL_TOTALS: Record<string, number> = {
  'morning-pages': 9,
  health: 14,
  home: 7,
  people: 4,
  money: 11,
};

function historicalSessions(): SessionSeed[] {
  const out: SessionSeed[] = [];
  for (const [areaId, total] of Object.entries(HISTORICAL_TOTALS)) {
    const thisWeek = THIS_WEEK.filter((s) => s.areaId === areaId).length;
    const anchor =
      OPEN_TASKS.find(([, , a]) => a === areaId)?.[0] ??
      DONE_TASKS.find(([, , a]) => a === areaId)?.[0];
    if (!anchor) continue;
    for (let i = 0; i < total - thisWeek; i += 1) {
      /* Back through August, one every couple of days. Well clear of the
         week boundary, so no historical session can change a count that
         SC-001 reads. */
      out.push({
        taskId: anchor,
        areaId,
        startedAt: new Date(2026, 7, 28 - i * 2, 9, 0, 0, 0),
        minutes: 15,
        outcome: 'completed',
        note: '',
      });
    }
  }
  return out;
}

function build(): State {
  const tasks: Task[] = [
    ...OPEN_TASKS.map(([id, title, areaId]) => ({
      id,
      title,
      areaId,
      onWeekList: true,
      capturedAt: at(7, 8, 0),
      doneAt: null,
    })),
    ...DONE_TASKS.map(([id, title, areaId, doneAt]) => ({
      id,
      title,
      areaId,
      onWeekList: false,
      capturedAt: at(7, 8, 0),
      doneAt,
    })),
    ...INBOX.map(([id, title, capturedAt]) => ({
      id,
      title,
      areaId: null,
      onWeekList: false,
      capturedAt,
      doneAt: null,
    })),
  ];

  const sessions: Session[] = [...THIS_WEEK, ...historicalSessions()].map((s, i) => ({
    id: `seed-session-${i}`,
    taskId: s.taskId,
    areaId: s.areaId,
    startedAt: s.startedAt,
    endedAt: new Date(s.startedAt.getTime() + s.minutes * 60_000),
    plannedMinutes: 15,
    actualMinutes: s.minutes,
    outcome: s.outcome,
    progressNote: s.note,
  }));

  return {
    areas: AREAS.map((a, i) => ({ ...a, sortOrder: i + 1, archivedAt: null })),
    tasks,
    sessions,
    activeSessionId: null,
  };
}

export const SEED_001: State = build();
