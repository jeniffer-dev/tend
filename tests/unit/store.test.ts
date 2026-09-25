import { describe, expect, it } from 'vitest';

import { reduce, type Action } from '@/lib/state/store';
import { EMPTY_STATE, type State } from '@/lib/state/types';

/** T009 — all eleven transitions, and the invariant that makes Review's
 *  `One still open.` singular by construction. */

const run = (state: State, ...actions: Action[]) => actions.reduce(reduce, state);
const at = (day: number, hour: number, minute = 0) => new Date(2026, 8, day, hour, minute);

const withArea = run(EMPTY_STATE, {
  type: 'createArea',
  id: 'health',
  name: 'Health',
  color: 'primary',
  sessionsPerWeek: 3,
  isDaily: true,
});

describe('areas', () => {
  it('creates one at the end of the order, unarchived', () => {
    expect(withArea.areas).toHaveLength(1);
    expect(withArea.areas[0]).toMatchObject({ sortOrder: 1, archivedAt: null, sessionsPerWeek: 3 });

    const two = run(withArea, {
      type: 'createArea',
      id: 'money',
      name: 'Money',
      color: 'load',
      sessionsPerWeek: 2,
      isDaily: false,
    });
    expect(two.areas[1].sortOrder).toBe(2);
  });

  it('edits name, colour, rhythm and daily in place, and touches nothing else', () => {
    const edited = run(withArea, {
      type: 'editArea',
      areaId: 'health',
      changes: { sessionsPerWeek: 5, isDaily: false, name: 'Body' },
    });
    expect(edited.areas[0]).toMatchObject({ name: 'Body', sessionsPerWeek: 5, isDaily: false });
    expect(edited.areas[0].sortOrder).toBe(withArea.areas[0].sortOrder);
    expect(edited.areas[0].archivedAt).toBeNull();
  });

  it('reorders by rewriting sortOrder', () => {
    const two = run(withArea, {
      type: 'createArea',
      id: 'money',
      name: 'Money',
      color: 'load',
      sessionsPerWeek: 2,
      isDaily: true,
    });
    const reordered = run(two, { type: 'reorderAreas', orderedIds: ['money', 'health'] });
    expect(reordered.areas.find((a) => a.id === 'money')?.sortOrder).toBe(1);
    expect(reordered.areas.find((a) => a.id === 'health')?.sortOrder).toBe(2);
  });

  it('archives rather than deletes, moves its tasks to the inbox, and leaves its sessions alone', () => {
    const seeded = run(
      withArea,
      { type: 'capture', now: at(7, 9), id: 't1', title: 'Book the blood test', areaId: 'health' },
      { type: 'startSession', now: at(7, 10), id: 's1', taskId: 't1', areaId: 'health' },
      { type: 'closeSession', now: at(7, 10, 20), outcome: 'progressed', note: 'Called the lab.' },
      { type: 'removeArea', now: at(13, 13), areaId: 'health' }
    );

    expect(seeded.areas).toHaveLength(1);
    expect(seeded.areas[0].archivedAt).toEqual(at(13, 13));
    expect(seeded.tasks[0]).toMatchObject({ areaId: null, title: 'Book the blood test' });
    expect(seeded.sessions).toHaveLength(1);
    expect(seeded.sessions[0].areaId).toBe('health');
  });
});

describe('capture and the inbox', () => {
  it('sends a capture with no area to the inbox and one with an area out of it', () => {
    const captured = run(
      withArea,
      { type: 'capture', now: at(7, 9), id: 'loose', title: 'Ask the dentist', areaId: null },
      { type: 'capture', now: at(7, 9), id: 'placed', title: 'Refill it', areaId: 'health' }
    );
    expect(captured.tasks.find((t) => t.id === 'loose')).toMatchObject({ areaId: null, onWeekList: false });
    expect(captured.tasks.find((t) => t.id === 'placed')).toMatchObject({ areaId: 'health', onWeekList: true });
  });

  it('takes an item out of the inbox when it is given an area', () => {
    const sorted = run(
      withArea,
      { type: 'capture', now: at(7, 9), id: 'loose', title: 'Ask the dentist', areaId: null },
      { type: 'giveTaskAnArea', taskId: 'loose', areaId: 'health' }
    );
    expect(sorted.tasks[0]).toMatchObject({ areaId: 'health', onWeekList: true });
  });
});

describe('sessions', () => {
  const started = run(
    withArea,
    { type: 'capture', now: at(13, 9), id: 't1', title: 'Book the blood test', areaId: 'health' },
    { type: 'capture', now: at(13, 9), id: 't2', title: 'Walk three mornings', areaId: 'health' },
    { type: 'startSession', now: at(13, 13), id: 's1', taskId: 't1', areaId: 'health' }
  );

  it('starts with no end, no outcome and no minutes', () => {
    expect(started.activeSessionId).toBe('s1');
    expect(started.sessions[0]).toMatchObject({ endedAt: null, outcome: null, actualMinutes: null });
  });

  it('switches task mid-session without moving startedAt: it is one session', () => {
    const switched = run(started, { type: 'switchTask', taskId: 't2' });
    expect(switched.sessions).toHaveLength(1);
    expect(switched.sessions[0].taskId).toBe('t2');
    expect(switched.sessions[0].startedAt).toEqual(at(13, 13));
  });

  it('writes actualMinutes once at close, and no later action changes it', () => {
    const closed = run(started, {
      type: 'closeSession',
      now: at(13, 13, 37),
      outcome: 'progressed',
      note: 'Found the lab.',
    });
    expect(closed.sessions[0].actualMinutes).toBe(37);

    const later = run(
      closed,
      { type: 'startSession', now: at(13, 15), id: 's2', taskId: 't2', areaId: 'health' },
      { type: 'closeSession', now: at(13, 15, 5), outcome: 'completed', note: '' },
      { type: 'editArea', areaId: 'health', changes: { sessionsPerWeek: 1 } }
    );
    expect(later.sessions.find((s) => s.id === 's1')?.actualMinutes).toBe(37);
  });

  it('closing as done sets doneAt and takes the task off the week list', () => {
    const done = run(started, { type: 'closeSession', now: at(13, 13, 20), outcome: 'completed', note: '' });
    expect(done.tasks.find((t) => t.id === 't1')).toMatchObject({ doneAt: at(13, 13, 20), onWeekList: false });
    expect(done.activeSessionId).toBeNull();
  });

  it('closing as progressed does neither, and keeps the note', () => {
    const progressed = run(started, {
      type: 'closeSession',
      now: at(13, 13, 20),
      outcome: 'progressed',
      note: 'Need the referral number.',
    });
    expect(progressed.tasks.find((t) => t.id === 't1')).toMatchObject({ doneAt: null, onWeekList: true });
    expect(progressed.sessions[0].progressNote).toBe('Need the referral number.');
  });

  it('keeps an empty note as a real state: attended, no note left', () => {
    const noNote = run(started, { type: 'closeSession', now: at(13, 13, 20), outcome: 'progressed', note: '' });
    expect(noNote.sessions[0].progressNote).toBe('');
    expect(noNote.sessions[0].endedAt).not.toBeNull();
  });
});

describe('FR-015c, FR-015d — starting a session closes the one before it', () => {
  const twoAreas = run(
    withArea,
    { type: 'createArea', id: 'money', name: 'Money', color: 'load', sessionsPerWeek: 2, isDaily: true },
    { type: 'capture', now: at(13, 9), id: 't1', title: 'Book the blood test', areaId: 'health' },
    { type: 'capture', now: at(13, 9), id: 't2', title: 'Reconcile September', areaId: 'money' },
    { type: 'startSession', now: at(13, 13), id: 's1', taskId: 't1', areaId: 'health' }
  );

  it('closes a session running in another area, as progressed with an empty note', () => {
    const second = run(twoAreas, { type: 'startSession', now: at(13, 13, 24), id: 's2', taskId: 't2', areaId: 'money' });
    const first = second.sessions.find((s) => s.id === 's1');

    expect(first).toMatchObject({ outcome: 'progressed', progressNote: '', actualMinutes: 24 });
    expect(first?.endedAt).toEqual(at(13, 13, 24));
    expect(second.activeSessionId).toBe('s2');
  });

  it('switches instead of closing when the session is running in this same area', () => {
    const sameArea = run(twoAreas, {
      type: 'capture', now: at(13, 9), id: 't3', title: 'Walk three mornings', areaId: 'health',
    });
    const switched = run(sameArea, { type: 'startSession', now: at(13, 13, 24), id: 's3', taskId: 't3', areaId: 'health' });

    expect(switched.sessions).toHaveLength(1);
    expect(switched.sessions[0].id).toBe('s1');
    expect(switched.sessions[0].taskId).toBe('t3');
    expect(switched.sessions[0].startedAt).toEqual(at(13, 13));
  });

  it('holds the invariant: after any sequence of starts, at most one session is open', () => {
    let state = twoAreas;
    const plan: Array<[string, string]> = [
      ['t2', 'money'], ['t1', 'health'], ['t2', 'money'], ['t1', 'health'], ['t2', 'money'],
    ];
    plan.forEach(([taskId, areaId], i) => {
      state = reduce(state, { type: 'startSession', now: at(13, 14 + i), id: `x${i}`, taskId, areaId });
    });

    const open = state.sessions.filter((s) => s.endedAt === null);
    expect(open).toHaveLength(1);
    expect(open[0].id).toBe(state.activeSessionId);
    expect(state.sessions.filter((s) => s.endedAt !== null).every((s) => s.actualMinutes !== null)).toBe(true);
  });
});
