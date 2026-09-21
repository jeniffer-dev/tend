import { notFound } from 'next/navigation';

import { BackLink } from '@/components/back-link';
import { PickerList } from '@/features/session/picker-list';
import { picker as copy } from '@/lib/copy';
import { areaById, weekListTasksForArea } from '@/lib/fixtures';
import { backForScreen } from '@/lib/routes';

/**
 * Picker — what do I focus on for fifteen minutes?
 *
 * Only the selected area's week-list tasks (FR-017). No inbox item reaches
 * this screen and there is no way to add a task here: capture is elsewhere,
 * and a session that begins by sorting is not a session.
 *
 * Goes back to Home, which is where it was opened from.
 */
export default async function PickerPage({ params }: { params: Promise<{ areaId: string }> }) {
  const { areaId } = await params;
  const area = areaById(areaId);
  if (!area) notFound();

  const tasks = weekListTasksForArea(area.id);

  return (
    <div className="flex flex-1 flex-col gap-5">
      <BackLink target={backForScreen('/tend/[areaId]')} />

      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          {copy.eyebrow(area.name)}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{copy.heading}</h1>
      </div>

      <PickerList tasks={tasks} scopeNote={copy.scopeNote(area.name)} color={area.color} />
    </div>
  );
}
