'use client';

import { AreaChip } from '@/components/area-chip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { inbox as copy } from '@/lib/copy';
import type { AreaChoice, InboxItem } from '@/lib/derive/screens';

/**
 * One unsorted item.
 *
 * The captured label arrives derived — `Captured today`, a day's name, or a
 * date (FR-030). Nothing here formats a date, and nothing frames one as
 * due: nothing here is overdue, and nothing expires.
 *
 * **`Give it an area` opens the row** (FR-021a). The button keeps its
 * approved words and its place; tapping it reveals Capture's chips beneath
 * it — the same component, every unarchived area in the Areas order — and
 * tapping a chip gives the item that area at once. The row then leaves the
 * Inbox, because the Inbox is what has no area. One row is open at a time;
 * the page decides which, so opening one closes another.
 *
 * The label wraps and the action does not, so a long capture grows the row
 * rather than squeezing the button below 44px at 320px.
 */
export function InboxRow({
  item,
  choices,
  open,
  onOpen,
  onChoose,
}: {
  item: InboxItem;
  choices: AreaChoice[];
  open: boolean;
  onOpen: () => void;
  onChoose: (areaId: string) => void;
}) {
  return (
    <Card data-testid="inbox-row" data-task={item.id} className="flex flex-col gap-2.5 p-5">
      <span className="text-base font-semibold tracking-tight text-pretty">{item.title}</span>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="min-w-0 text-xs uppercase tracking-widest text-muted-foreground/45">
          {item.capturedLabel}
        </span>
        <Button
          variant="outline"
          aria-expanded={open}
          onClick={onOpen}
          className="shrink-0 whitespace-nowrap px-3.5"
        >
          {copy.giveItAnArea}
        </Button>
      </div>

      {open && (
        <div data-testid="inbox-row-chips" className="flex flex-wrap gap-2 pt-1">
          {choices.map((choice) => (
            <AreaChip key={choice.areaId} choice={choice} onClick={() => onChoose(choice.areaId)} />
          ))}
        </div>
      )}
    </Card>
  );
}
