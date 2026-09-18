'use client';

import Link from 'next/link';
import { useState } from 'react';

import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { picker as copy } from '@/lib/copy';
import { sessionHref } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { areaColorHex, type AreaColor, type Task } from '@/lib/fixtures';

/**
 * The Picker's task list, with the first task already selected on arrival
 * (FR-017). Every task shows its last-session note — and `Not attended
 * yet.` when there is none, never an empty space, because a gap where a
 * note should be reads as something missing rather than as something not
 * yet done.
 *
 * This owns the primary action as well as the list, because the action
 * depends on which task is selected and lifting that selection into the
 * page would make the page a client component for one piece of state.
 * Selection highlighting is the only client state in this feature, and it
 * does not survive a reload — nothing here is stored (FR-003).
 *
 * The selected task carries a 2px border in the area's own colour (design
 * system §6, added in 1.3.0). The colour is not chosen to mean *selected* —
 * it is the colour the task already carries everywhere else, turned up to
 * mark which one the session is about to be. It is read from the area
 * rather than hardcoded, because a fixed colour here would be the status
 * encoding §2 forbids.
 *
 * Unselected rows carry the same 2px border at `--border`. Selecting
 * changes the colour and nothing about the geometry: a border that grew on
 * selection would reflow the text, and a row that moves when you touch it
 * does not read as calm.
 */
export function PickerList({
  tasks,
  scopeNote,
  color,
}: {
  tasks: Task[];
  scopeNote: string;
  color: AreaColor;
}) {
  const [selectedId, setSelectedId] = useState(tasks[0]?.id ?? null);

  return (
    <>
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
              <span className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-widest text-muted-foreground/45">
                  {copy.lastSessionLabel}
                </span>
                <span className="text-sm text-muted-foreground text-pretty">
                  {task.lastSessionNote}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground/50 text-pretty">{scopeNote}</p>

      <StickyFooter className="flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link href={sessionHref(selectedId ?? tasks[0]?.id ?? '')}>{copy.primaryAction}</Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground/50">{copy.footerNote}</p>
      </StickyFooter>
    </>
  );
}
