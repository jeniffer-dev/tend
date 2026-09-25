'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { BackLink } from '@/components/back-link';
import { PickerList } from '@/features/session/picker-list';
import { picker as copy } from '@/lib/copy';
import { pickerView } from '@/lib/derive/screens';
import { areaById } from '@/lib/derive/counting';
import { useToday } from '@/lib/state/clock';
import { useAppState } from '@/lib/state/provider';
import { backForScreen } from '@/lib/routes';

/**
 * Picker — what do I focus on for fifteen minutes?
 *
 * Only the selected area's week-list tasks that are not done. No inbox item
 * reaches this screen and there is no way to add a task here: capture is
 * elsewhere, and a session that begins by sorting is not a session.
 *
 * One call gives the screen everything: the tasks with their notes, the
 * empty heading and note when there are none, and the consequence line when
 * starting here would close a session running somewhere else.
 *
 * Goes back to Home, which is where it was opened from.
 */
export default function PickerPage({ params }: { params: Promise<{ areaId: string }> }) {
  const { areaId } = use(params);
  const state = useAppState();
  const now = useToday();

  const view = pickerView(state, areaId, now);
  const area = areaById(state, areaId);
  if (!view || !area) notFound();

  const header = (
    <>
      <BackLink target={backForScreen('/tend/[areaId]')} />
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          {copy.eyebrow(view.areaName)}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {view.emptyHeading ?? copy.heading}
        </h1>
        {/* The heading is the same whether the list was never started or
            has been finished; only the note tells them apart, and that is
            the note's whole job (spec.md §"Screen copy"). */}
        {view.emptyNote ? (
          <p data-testid="picker-empty-note" className="text-sm text-muted-foreground text-pretty">
            {view.emptyNote}
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="flex flex-1 flex-col">
      <PickerList
        areaId={areaId}
        tasks={view.tasks}
        scopeNote={copy.scopeNote(view.areaName)}
        color={area.color}
        consequence={view.consequence}
      >
        {header}
      </PickerList>
    </div>
  );
}
