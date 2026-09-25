/**
 * Counting sessions, and measuring them. T012.
 *
 * **No function here returns a ratio.** `sessionsInWeek` and
 * `sessionsPerWeek` both exist, and dividing them is one line away at every
 * call site — which is the shape Article I forbids. `isPastRhythm` returns
 * a boolean, and the screens are given sentences (plan.md §"The second
 * gate").
 *
 * The rule that runs through the whole module: **a session counts from its
 * start and measures from its close** (FR-006a). An open session is a
 * session everywhere something is counted, and contributes no minutes until
 * `actualMinutes` is written at close.
 */

import { isSameDay } from '@/lib/derive/format';
import { isInWeek, type Week } from '@/lib/derive/week';
import type { Area, Session, State, Task } from '@/lib/state/types';

export const sessionsForArea = (state: State, areaId: string): Session[] =>
  state.sessions.filter((s) => s.areaId === areaId);

export const sessionsInWeekFor = (state: State, areaId: string, week: Week): Session[] =>
  sessionsForArea(state, areaId).filter((s) => isInWeek(s, week));

/** How many sessions that area has in that week, open ones included. */
export const sessionsInWeek = (state: State, areaId: string, week: Week): number =>
  sessionsInWeekFor(state, areaId, week).length;

/**
 * The total `actualMinutes` of that area's **closed** sessions that week.
 * Review only (SC-006).
 *
 * It reads the recorded figure and never the timestamps. `actualMinutes` is
 * written once at close and is the answer even when the arithmetic would
 * disagree (FR-010a).
 */
export const minutesInWeek = (state: State, areaId: string, week: Week): number =>
  sessionsInWeekFor(state, areaId, week).reduce((total, s) => total + (s.actualMinutes ?? 0), 0);

/** The session in that week with no `endedAt`, if there is one. There is
 *  never more than one: starting a session closes the running one
 *  (FR-015c, FR-015d). */
export const openSessionInWeek = (state: State, areaId: string, week: Week): Session | null =>
  sessionsInWeekFor(state, areaId, week).find((s) => s.endedAt === null) ?? null;

/** FR-009 — more sessions than the rhythm means the extra ones are extra.
 *  Never a proportion, never a verdict. */
export const isPastRhythm = (area: Area, state: State, week: Week): boolean =>
  sessionsInWeek(state, area.id, week) > area.sessionsPerWeek;

/**
 * FR-015a — an area counts as attended today from the moment a session on
 * it **starts**, not from when it closes. Leaving a session without closing
 * it must not erase the day.
 */
export const attendedToday = (state: State, areaId: string, now: Date): boolean =>
  sessionsForArea(state, areaId).some((s) => isSameDay(s.startedAt, now));

/** Minutes attended today, from closed sessions only. The running session
 *  joins them when it closes (FR-015b). */
export const minutesToday = (state: State, areaId: string, now: Date): number =>
  sessionsForArea(state, areaId)
    .filter((s) => isSameDay(s.startedAt, now))
    .reduce((total, s) => total + (s.actualMinutes ?? 0), 0);

/** The most recent session on that area, by start. */
export function lastSessionForArea(state: State, areaId: string): Session | null {
  const sessions = sessionsForArea(state, areaId);
  if (sessions.length === 0) return null;
  return sessions.reduce((latest, s) => (s.startedAt > latest.startedAt ? s : latest));
}

/** The most recent session on that task, by start. What the Picker's
 *  last-session note is a question about (FR-014). */
export function lastSessionForTask(state: State, taskId: string): Session | null {
  const sessions = state.sessions.filter((s) => s.taskId === taskId);
  if (sessions.length === 0) return null;
  return sessions.reduce((latest, s) => (s.startedAt > latest.startedAt ? s : latest));
}

/* ---------------------------------------------------------------- lookups */

export const unarchivedAreas = (state: State): Area[] =>
  state.areas.filter((a) => a.archivedAt === null).sort((a, b) => a.sortOrder - b.sortOrder);

export const dailyAreas = (state: State): Area[] =>
  unarchivedAreas(state).filter((a) => a.isDaily);

/**
 * Every lookup of an area is one of two questions, and the distinction is
 * load-bearing (data-model.md):
 *
 * - "Which areas are there?" — `unarchivedAreas`. Areas, Home, Week,
 *   Capture's chips, and every count in a heading.
 * - "Which area was this session against?" — `areaById`. Review only,
 *   because the session happened and Review has to be able to name it.
 */
export const areaById = (state: State, areaId: string): Area | null =>
  state.areas.find((a) => a.id === areaId) ?? null;

export const taskById = (state: State, taskId: string): Task | null =>
  state.tasks.find((t) => t.id === taskId) ?? null;

/** The area's week-list tasks that are not done — what the Picker offers. */
export const weekListTasks = (state: State, areaId: string): Task[] =>
  state.tasks.filter((t) => t.areaId === areaId && t.onWeekList && t.doneAt === null);

/** Tasks with no area. The inbox is a question, not a place (FR-020). */
export const inboxTasks = (state: State): Task[] =>
  state.tasks.filter((t) => t.areaId === null && t.doneAt === null);

export const activeSession = (state: State): Session | null =>
  state.activeSessionId ? state.sessions.find((s) => s.id === state.activeSessionId) ?? null : null;
