/**
 * The facts Tend stores. T004, per data-model.md.
 *
 * THE RULE THAT GOVERNS EVERY SHAPE HERE:
 *
 *   State holds facts. lib/derive/ holds the functions that turn facts and
 *   a moment into sentences. Components hold neither.
 *
 * This inverts 001's rule, and its purpose does not change. 001 stored the
 * displayed sentence because there was nowhere else to put the reduction;
 * now there is somewhere, so the practical test flips: **if you can read a
 * user-facing sentence in the state, the state is wrong.**
 * `Three sessions a week · in Home daily` is not a field. It is
 * `sessionsPerWeek: 3`, `isDaily: true`, and a function.
 *
 * Nothing here is persisted. Feature 003 decides what durable shape any of
 * it takes, and until then a reload is the reset (FR-023).
 */

/** The design system's brand tokens (§2). Colour encodes the area, never a
 *  status — there is no red here and none is reachable. Re-exported from
 *  001's module so there is one palette, not two. */
export type { AreaColor } from '@/lib/fixtures';
export { areaColorHex } from '@/lib/fixtures';

/** A rhythm, 1 to 5 (FR-016). Not a target and not a budget. */
export type Rhythm = 1 | 2 | 3 | 4 | 5;

export type Area = {
  id: string;
  name: string;
  color: import('@/lib/fixtures').AreaColor;
  sessionsPerWeek: Rhythm;
  isDaily: boolean;
  sortOrder: number;
  /** Set by Remove the area; never deleted (FR-018). An archived area is
   *  gone from Areas, Home, Week and Capture's chips, and survives only as
   *  the name its old sessions resolve to in Review. */
  archivedAt: Date | null;
};

export type Task = {
  id: string;
  title: string;
  /** null means the inbox. */
  areaId: string | null;
  onWeekList: boolean;
  capturedAt: Date;
  /** Set when a session closes it as completed (FR-013). */
  doneAt: Date | null;
};

export type SessionOutcome = 'completed' | 'progressed';

export type Session = {
  id: string;
  taskId: string;
  /** Denormalised, as PRODUCT-SPEC §3.3 has it. */
  areaId: string;
  startedAt: Date;
  /** null while running. */
  endedAt: Date | null;
  plannedMinutes: number;
  /**
   * Written once at close and never recomputed (FR-010a).
   *
   * The live clock stays derived from `startedAt` and `now`; this is the
   * record. They answer different questions — how long this session has
   * been going, and how long it went — and if they ever disagree, the
   * record is right and the arithmetic is stale.
   */
  actualMinutes: number | null;
  /** null while running. */
  outcome: SessionOutcome | null;
  /** `''` is a real state: attended, no note left. It is a different fact
   *  from never attended, and it has its own string. */
  progressNote: string;
};

export type State = {
  areas: Area[];
  tasks: Task[];
  sessions: Session[];
  activeSessionId: string | null;
};

export const EMPTY_STATE: State = {
  areas: [],
  tasks: [],
  sessions: [],
  activeSessionId: null,
};

/** The one duration the product names, and the only one (SC-006). */
export const DEFAULT_SESSION_MINUTES = 15;
