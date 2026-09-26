/**
 * What each screen asks for, and what it is given back. T016.
 *
 * The rule underneath (contracts/derivations.md): **a screen receives
 * finished strings and booleans. It never receives two numbers and a reason
 * to divide them.** One call per region, not one per value, so a component
 * cannot combine them wrongly and a test has one thing to assert against.
 *
 * Every function takes `now`. None reads the clock.
 */

import {
  areas002,
  home002 as homeCopy,
  picker002,
  session as sessionCopy,
  week002,
} from '@/lib/copy';
import {
  activeSession,
  areaById,
  attendedToday,
  dailyAreas,
  isPastRhythm,
  lastSessionForArea,
  lastSessionForTask,
  minutesToday,
  sessionsInWeek,
  taskById,
  unarchivedAreas,
  weekListTasks,
} from '@/lib/derive/counting';
import {
  clockString,
  dayName,
  elapsedMinutes,
  joinNames,
  numberWord,
  numberWordCapital,
  spellNumberCapital,
} from '@/lib/derive/format';
import { weekClosing, weekContaining } from '@/lib/derive/week';
import type { Area, State } from '@/lib/state/types';

/** The rhythm line Areas, and only Areas, renders whole. 001 stored it as
 *  `rhythmLabel`, and it is the first thing SC-001 checks. */
export const rhythmLabel = (area: Area): string =>
  areas002.rhythm(numberWordCapital(area.sessionsPerWeek), area.isDaily);

/* --------------------------------------------------------------- Home */

export type HomeTreatment = 'to-tend' | 'past-rhythm' | 'attended' | 'tending-now';

export type HomeCard = {
  areaId: string;
  name: string;
  color: Area['color'];
  treatment: HomeTreatment;
  line: string;
};

export type HomeView = {
  heading: string;
  cards: HomeCard[];
  absenceNote: string | null;
  reviewEntry: string | null;
  emptyNote: string | null;
};

/**
 * A card's treatment and its line, together, because they are one decision.
 *
 * `tending-now` is a fourth treatment rather than a variant of `attended`,
 * so the card cannot render a figure that does not exist yet (FR-015a). Its
 * line depends on what the day already holds: a session in progress adds to
 * the day rather than replacing it (FR-015b).
 */
function homeCard(state: State, area: Area, now: Date): HomeCard {
  const week = weekContaining(now);
  const running = activeSession(state);
  const isTending = running !== null && running.endedAt === null && running.areaId === area.id;
  const minutes = minutesToday(state, area.id, now);

  const common = { areaId: area.id, name: area.name, color: area.color };

  if (isTending) {
    return {
      ...common,
      treatment: 'tending-now',
      line: minutes > 0 ? homeCopy.attendedAndTending(numberWord(minutes)) : homeCopy.tendingNow,
    };
  }

  if (attendedToday(state, area.id, now)) {
    return { ...common, treatment: 'attended', line: homeCopy.attended(numberWord(minutes)) };
  }

  if (isPastRhythm(area, state, week)) {
    return {
      ...common,
      treatment: 'past-rhythm',
      line: homeCopy.pastRhythm(numberWord(area.sessionsPerWeek)),
    };
  }

  const last = lastSessionForArea(state, area.id);
  return {
    ...common,
    treatment: 'to-tend',
    line: last ? homeCopy.lastAttended(dayName(last.startedAt, now)) : homeCopy.neverAttended,
  };
}

/** FR-013a (001's) — what is still to be tended sorts above what was
 *  attended today, and `sortOrder` governs within each group. `tending-now`
 *  sorts with the open ones: it is the area you are in the middle of. */
const groupRank = (card: HomeCard): number => (card.treatment === 'attended' ? 1 : 0);

export function homeView(state: State, now: Date): HomeView {
  const daily = dailyAreas(state);
  const absent = unarchivedAreas(state).filter((a) => !a.isDaily);
  const running = activeSession(state);
  const sessionOpen = running !== null && running.endedAt === null;

  const cards = daily
    .map((area) => homeCard(state, area, now))
    .sort((a, b) => groupRank(a) - groupRank(b));

  const allAttended = cards.length > 0 && cards.every((c) => c.treatment === 'attended');

  /* The all-attended note is withheld while a session is open: something is
     waiting, and it is the session you are in (spec.md §"Screen copy"). */
  const emptyNote =
    daily.length === 0
      ? homeCopy.noDailyAreas
      : allAttended && !sessionOpen
        ? homeCopy.allAttended
        : null;

  let absenceNote: string | null = null;
  if (absent.length === 1) {
    absenceNote = homeCopy.absenceNoteOne(absent[0].name, numberWord(absent[0].sessionsPerWeek));
  } else if (absent.length > 1) {
    absenceNote = homeCopy.absenceNoteMany(joinNames(absent.map((a) => a.name)));
  }

  const closing = weekClosing(now);
  const reviewEntry =
    closing === 'sunday'
      ? homeCopy.reviewEntrySunday
      : closing === 'monday'
        ? homeCopy.reviewEntryMonday
        : null;

  return { heading: dayName(now, now), cards, absenceNote, reviewEntry, emptyNote };
}

/* ------------------------------------------------------------- Picker */

export type PickerTask = { id: string; title: string; lastSessionNote: string };

export type PickerView = {
  areaName: string;
  tasks: PickerTask[];
  emptyHeading: string | null;
  emptyNote: string | null;
  /** FR-015c — what starting here closes, or nothing. */
  consequence: string | null;
};

/** FR-014 — three answers, not 001's two. A task attended without a note is
 *  a different fact from one never attended, and says so. */
function lastSessionNote(state: State, taskId: string): string {
  const last = lastSessionForTask(state, taskId);
  if (!last) return picker002.neverAttended;
  return last.progressNote === '' ? picker002.attendedNoNote : last.progressNote;
}

export function pickerView(state: State, areaId: string, now: Date): PickerView | null {
  const area = areaById(state, areaId);
  if (!area || area.archivedAt !== null) return null;

  const tasks = weekListTasks(state, areaId).map((t) => ({
    id: t.id,
    title: t.title,
    lastSessionNote: lastSessionNote(state, t.id),
  }));

  /* The heading is the same either way; only the note distinguishes never
     having started from having finished. */
  const hadTasks = state.tasks.some((t) => t.areaId === areaId);
  const emptyHeading = tasks.length === 0 ? picker002.headingEmpty : null;
  const emptyNote =
    tasks.length === 0
      ? hadTasks
        ? picker002.noteAllDone(area.name)
        : picker002.noteNeverStarted(area.name)
      : null;

  /*
   * Shown only when the running session is on a task in ANOTHER area. In
   * this area, picking another task switches it inside the open session and
   * the 001 footer note already says so — a consequence line where there is
   * no consequence would fail the addition test (spec.md §"Screen copy").
   *
   * The title is interpolated verbatim and never truncated.
   */
  const running = activeSession(state);
  let consequence: string | null = null;
  if (running && running.endedAt === null && running.areaId !== areaId) {
    const task = taskById(state, running.taskId);
    if (task) consequence = picker002.stillRunning(task.title);
  }

  return { areaName: area.name, tasks, emptyHeading, emptyNote, consequence };
}

/* ------------------------------------------------------------ Session */

export type SessionView = {
  areaName: string;
  taskTitle: string;
  clock: string;
  clockNote: string;
  note: string;
};

/**
 * The clock and the line beneath it.
 *
 * SC-003 — the three moments differ in these two strings and in nothing
 * else. No layout, colour or control changes at zero, and nothing is taken
 * away past it.
 *
 * The line spells its minutes (`Thirty-two minutes on Health.`) while
 * Home's line writes figures (`Attended today, 15 minutes`). Both are 001's
 * approved copy and they disagree with FR-029, which is recorded at the
 * Phase 3 checkpoint rather than silently resolved either way.
 */
export function sessionView(state: State, now: Date): SessionView | null {
  const running = activeSession(state);
  if (!running || running.endedAt !== null) return null;
  const area = areaById(state, running.areaId);
  const task = taskById(state, running.taskId);
  if (!area || !task) return null;

  const elapsed = elapsedMinutes(running.startedAt, now);
  const planned = running.plannedMinutes;
  const clockNote =
    elapsed < planned
      ? sessionCopy.clockNoteBefore(spellNumberCapital(planned), area.name)
      : elapsed === planned
        ? sessionCopy.clockNoteAtZero(spellNumberCapital(planned))
        : sessionCopy.clockNoteAfter(spellNumberCapital(elapsed), area.name);

  return {
    areaName: area.name,
    taskTitle: task.title,
    clock: clockString(running.startedAt, now, planned),
    clockNote,
    note: running.progressNote,
  };
}

/* --------------------------------------------------------------- Week */

export type WeekRow = { areaId: string; name: string; color: Area['color']; sessionsLabel: string; line: string };

export type WeekView = { heading: string; rows: WeekRow[]; emptyNote: string | null };

/**
 * Week counts in sessions and **no minutes reach this screen** (FR-007).
 * The derivation that would produce a minute total is not offered to it.
 *
 * An open session is already counted here (FR-006a) and Week says nothing
 * about it being open, because Week has no minutes for the omission to
 * explain — the count is simply correct.
 *
 * Every unarchived area is a row, daily or not (FR-007a): a non-daily area
 * keeps a weekly rhythm, and this is where rhythms are counted. That
 * supersedes 001's clarification Q3, which kept People off this screen.
 */
/** A zero in either sentence is replaced by its `No …` form, never written
 *  as a number (FR-007a). Four whole templates, one per case. */
function weekRowLine(tasks: number, sessions: number): string {
  if (tasks === 0 && sessions === 0) return week002.rowLineNothing;
  if (tasks === 0) return week002.rowLineNoTasks(numberWordCapital(sessions));
  if (sessions === 0) return week002.rowLineNoSessions(numberWordCapital(tasks));
  return week002.rowLine(numberWordCapital(tasks), numberWordCapital(sessions));
}

export function weekView(state: State, now: Date): WeekView {
  const week = weekContaining(now);
  const areas = unarchivedAreas(state);
  const rows = areas.map((area) => ({
    areaId: area.id,
    name: area.name,
    color: area.color,
    sessionsLabel: week002.sessionsLabel(numberWordCapital(area.sessionsPerWeek)),
    line: weekRowLine(
      weekListTasks(state, area.id).length,
      sessionsInWeek(state, area.id, week)
    ),
  }));

  const committed = areas.reduce((total, a) => total + a.sessionsPerWeek, 0);
  const anyTasks = areas.some((a) => weekListTasks(state, a.id).length > 0);

  return {
    heading: week002.heading(numberWordCapital(areas.length), numberWord(committed)),
    rows,
    emptyNote: anyTasks ? null : week002.noTasksAnywhere,
  };
}
