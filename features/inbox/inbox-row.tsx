import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { inbox as copy } from '@/lib/copy';
import type { InboxItem } from '@/lib/fixtures';

/**
 * One unsorted item.
 *
 * The captured label is a literal fixture string, not a date. A date would
 * invite formatting logic in a component, and it would invite the framing
 * Article II forbids: nothing here is overdue, and nothing expires.
 *
 * The label wraps and the action does not, so a long capture grows the row
 * rather than squeezing the button below 44px at 320px.
 */
export function InboxRow({ item }: { item: InboxItem }) {
  return (
    <Card data-testid="inbox-row" className="flex flex-col gap-2.5 p-5">
      <span className="text-base font-semibold tracking-tight text-pretty">{item.title}</span>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="min-w-0 text-xs uppercase tracking-widest text-muted-foreground/45">
          {item.capturedLabel}
        </span>
        <Button variant="outline" className="shrink-0 whitespace-nowrap px-3.5">
          {copy.giveItAnArea}
        </Button>
      </div>
    </Card>
  );
}
