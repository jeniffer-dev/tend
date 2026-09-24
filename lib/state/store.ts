/**
 * The reducer and its eleven transitions. T005, T006.
 *
 * Everything else in the feature is a read. These are the only ways state
 * changes, and each one is data-model.md §"State transitions" in code.
 *
 * Two rules govern the whole file:
 *
 * 1. **`actualMinutes` is written once, at close, and never recalculated**
 *    (FR-010a). Nothing here reads the timestamps to correct it.
 * 2. **An area is archived, never deleted** (FR-018). That is what makes
 *    the removal confirmation's promise about Review true: a deleted area
 *    would leave its sessions pointing at nothing.
 */

import { elapsedMinutes } from '@/lib/derive/format';
import {
  DEFAULT_SESSION_MINUTES,
  type Area,
  type AreaColor,
  type Rhythm,
  type Session,
  type State,
  type Task,
} from '@/lib/state/types';

export type Action =
  | { type: 'capture'; now: Date; id: string; title: string; areaId: string | null }
  | { type: 'giveTaskAnArea'; taskId: string; areaId: string }
  | { type: 'startSession'; now: Date; id: string; taskId: string; areaId: string }
  | { type: 'switchTask'; taskId: string }
  | { type: 'closeSession'; now: Date; outcome: 'completed' | 'progressed'; note: string }
  | { type: 'createArea'; id: string; name: string; color: AreaColor; sessionsPerWeek: Rhythm; isDaily: boolean }
  | { type: 'editArea'; areaId: string; changes: Partial<Pick<Area, 'name' | 'color' | 'sessionsPerWeek' | 'isDaily'>> }
  | { type: 'removeArea'; now: Date; areaId: string }
  | { type: 'reorderAreas'; orderedIds: string[] };

/** Close a running session in place. Used by the closing actions and by
 *  `startSession`, which closes the one before it (FR-015c). */
function closed(
  session: Session,
  now: Date,
  outcome: 'completed' | 'progressed',
  note: string
): Session {
  return {
    ...session,
    endedAt: now,
    /* Written here and nowhere else. */
    actualMinutes: elapsedMinutes(session.startedAt, now),
    outcome,
    progressNote: note,
  };
}

export function reduce(state: State, action: Action): State {
  switch (action.type) {
    /* 1 & 2 — capture. With no area it goes to the inbox; with one it does
       not. Same transition, one field apart (FR-020). */
    case 'capture': {
      const task: Task = {
        id: action.id,
        title: action.title,
        areaId: action.areaId,
        onWeekList: action.areaId !== null,
        capturedAt: action.now,
        doneAt: null,
      };
      return { ...state, tasks: [...state.tasks, task] };
    }

    /* 3 — giving an inbox item an area takes it out of the inbox (FR-021). */
    case 'giveTaskAnArea':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, areaId: action.areaId, onWeekList: true } : t
        ),
      };

    /*
     * 4 — start a session.
     *
     * If one is already running on a task in **another** area, it closes
     * first, as progressed with an empty note and its minutes written
     * (FR-015c). Nothing is blocked and nothing is confirmed twice; the
     * Picker stated the consequence before the action.
     *
     * If it is running in **this** area, this is the switch FR-015
     * promises: one session, `startedAt` untouched.
     *
     * The slot is emptied by the same transition that fills it, so at most
     * one session is ever open (FR-015d). That is what makes Review's
     * `One still open.` singular by construction.
     */
    case 'startSession': {
      const running = state.activeSessionId
        ? state.sessions.find((s) => s.id === state.activeSessionId) ?? null
        : null;

      if (running && running.endedAt === null && running.areaId === action.areaId) {
        return {
          ...state,
          sessions: state.sessions.map((s) =>
            s.id === running.id ? { ...s, taskId: action.taskId } : s
          ),
        };
      }

      const sessions =
        running && running.endedAt === null
          ? state.sessions.map((s) => (s.id === running.id ? closed(s, action.now, 'progressed', '') : s))
          : state.sessions;

      const started: Session = {
        id: action.id,
        taskId: action.taskId,
        areaId: action.areaId,
        startedAt: action.now,
        endedAt: null,
        plannedMinutes: DEFAULT_SESSION_MINUTES,
        actualMinutes: null,
        outcome: null,
        progressNote: '',
      };
      return { ...state, sessions: [...sessions, started], activeSessionId: started.id };
    }

    /* 5 — switch task mid-session. `startedAt` does not move: it is one
       session (FR-015). */
    case 'switchTask':
      if (!state.activeSessionId) return state;
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === state.activeSessionId ? { ...s, taskId: action.taskId } : s
        ),
      };

    /* 6 & 7 — the two closing actions. Done takes the task off the week
       list; progressed leaves it there with the note attached (FR-013). */
    case 'closeSession': {
      const running = state.sessions.find((s) => s.id === state.activeSessionId);
      if (!running || running.endedAt !== null) return state;
      const sessions = state.sessions.map((s) =>
        s.id === running.id ? closed(s, action.now, action.outcome, action.note) : s
      );
      const tasks =
        action.outcome === 'completed'
          ? state.tasks.map((t) =>
              t.id === running.taskId ? { ...t, doneAt: action.now, onWeekList: false } : t
            )
          : state.tasks;
      return { ...state, sessions, tasks, activeSessionId: null };
    }

    /* 10 — create an area. It goes last in the order, which is where a new
       thing belongs until the person moves it (FR-016). */
    case 'createArea': {
      const sortOrder = state.areas.reduce((max, a) => Math.max(max, a.sortOrder), 0) + 1;
      const area: Area = {
        id: action.id,
        name: action.name,
        color: action.color,
        sessionsPerWeek: action.sessionsPerWeek,
        isDaily: action.isDaily,
        sortOrder,
        archivedAt: null,
      };
      return { ...state, areas: [...state.areas, area] };
    }

    /* 11 — edit an area. Name, colour, rhythm and whether it waits on Home;
       `sortOrder` and `archivedAt` are not edited here, because reordering
       and removal are their own transitions (FR-017). */
    case 'editArea':
      return {
        ...state,
        areas: state.areas.map((a) => (a.id === action.areaId ? { ...a, ...action.changes } : a)),
      };

    /*
     * 8 — remove an area, which is archiving.
     *
     * Its tasks go to the inbox keeping their titles, and its sessions are
     * untouched (FR-018). PRODUCT-SPEC RF-04 says *archivar*, and that is
     * what lets the confirmation promise that the past sessions stay in
     * Review: Review resolves the name from the archived area.
     */
    case 'removeArea':
      return {
        ...state,
        areas: state.areas.map((a) =>
          a.id === action.areaId ? { ...a, archivedAt: action.now } : a
        ),
        tasks: state.tasks.map((t) =>
          t.areaId === action.areaId ? { ...t, areaId: null, onWeekList: false } : t
        ),
      };

    /* 9 — reorder. Home follows, because Home reads `sortOrder` (FR-019). */
    case 'reorderAreas':
      return {
        ...state,
        areas: state.areas.map((a) => {
          const index = action.orderedIds.indexOf(a.id);
          return index === -1 ? a : { ...a, sortOrder: index + 1 };
        }),
      };
  }
}
