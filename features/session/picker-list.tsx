'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { picker as copy } from '@/lib/copy';
import { areaColorHex, type AreaColor } from '@/lib/fixtures';
import type { PickerTask } from '@/lib/derive/screens';
import { useNowGetter } from '@/lib/state/clock';
import { useDispatch } from '@/lib/state/provider';
import { sessionHref } from '@/lib/routes';
import { cn } from '@/lib/utils';

/**
 * The Picker's task list, with the first task already selected on arrival.
 *
 * Every task shows its last-session note — and `Not attended yet.` when
 * there is none, never an empty space, because a gap where a note should be
 * reads as something missing rather than as something not yet done. 002
 * gives it a third answer: a task attended without a note says so, which is
 * a different fact again (FR-014). All three arrive derived.
 *
 * This owns the primary action as well as the list, because the action
 * depends on which task is selected and lifting that selection into the
 * page would make the page a client component for one piece of state.
 *
 * The selected task carries a 2px border in the area's own colour (design
 * system §6). The colour is not chosen to mean *selected* — it is the
 * colour the task already carries everywhere else, turned up to mark which
 * one the session is about to be. Unselected rows carry the same 2px border
 * at `--border`: selecting changes the colour and nothing about the
 * geometry, because a row that moves when you touch it does not read calm.
 */
export function PickerList({
  areaId,
  tasks,
  scopeNote,
  color,
  consequence,
  children,
}: {
  areaId: string;
  tasks: PickerTask[];
  scopeNote: string;
  color: AreaColor;
  /** FR-015c — the finished sentence naming what starting here closes, or
   *  nothing at all. The component never sees the running session. */
  consequence: string | null;
  /** The screen's back control and heading. They live inside the content
   *  wrapper so the footer stays a sibling of it, which is what lets the
   *  wrapper reserve the footer's height beneath itself. */
  children?: React.ReactNode;
}) {
  const [selectedId, setSelectedId] = useState(tasks[0]?.id ?? null);
  const dispatch = useDispatch();
  const getNow = useNowGetter();
  const router = useRouter();

  const taskId = selectedId ?? tasks[0]?.id ?? null;

  /* Starting closes a session running in another area, as progressed with
     an empty note (FR-015c). It does not ask, and it does not block: the
     consequence was stated above the button. */
  function start() {
    if (!taskId) return;
    const now = getNow();
    dispatch({ type: 'startSession', now, id: `session-${now.getTime()}`, taskId, areaId });
    router.push(sessionHref(taskId));
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 pb-[var(--footer-h,15rem)]">
        {children}

        <div className="grid grid-cols-1 gap-3">
          {tasks.map((task) => {
            const isSelected = task.id === selectedId;
            return (
              <button
                key={task.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedId(task.id)}
                style={isSelected ? { borderColor: areaColorHex[color] } : undefined}
                className={cn(
                  'flex w-full flex-col gap-2 rounded-xl border-2 bg-card p-5 text-left shadow-sm transition-colors',
                  isSelected ? 'border-transparent' : 'border-border hover:border-muted-foreground/40'
                )}
              >
                <span className="text-base font-semibold tracking-tight">{task.title}</span>
                {/* No `Last session` label. It was cut by Article III's
                    addition test: the note reads as what it is without one,
                    and the Picker still answered its question without it. */}
                <span className="text-sm text-muted-foreground text-pretty">
                  {task.lastSessionNote}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground/50 text-pretty">{scopeNote}</p>
      </div>

      <StickyFooter className="flex flex-col gap-2">
        {/*
          The consequence, inside the bar and directly above the button it
          belongs to (FR-015c). In document flow it would sit above the fold
          while the button sits at the thumb, which is the one arrangement
          that lets someone act without reading it — the design system's own
          reason for the pattern (§4).

          It states and does not gate. The action keeps its approved words
          and its place, and nothing is confirmed twice.
        */}
        {consequence ? (
          <p
            data-testid="picker-consequence"
            className="text-sm leading-relaxed text-muted-foreground text-pretty"
          >
            {consequence}
          </p>
        ) : null}
        <Button className="w-full" onClick={start} disabled={taskId === null}>
          {copy.primaryAction}
        </Button>
        <p className="text-center text-xs text-muted-foreground/50">{copy.footerNote}</p>
      </StickyFooter>
    </>
  );
}
