import { AreaDot } from '@/components/area-dot';
import { Card } from '@/components/ui/card';
import type { Area, WeekRow as WeekRowFixture } from '@/lib/fixtures';

/**
 * One area's row on the Week screen: its name, the sessions committed, and
 * the line about what is on the list and what has been attended.
 *
 * Both strings are literal fixture values. Nothing here turns a pair of
 * counts into `Two sessions attended.` — the fixture stores the sentence
 * (FR-002, data-model.md).
 *
 * No minutes (FR-022). Week counts in sessions; minutes are a fact about
 * what happened and they belong on Review.
 *
 * FLAGGED — no progress bar. The WEEK artboard draws a 2px bar per row,
 * filled to 66% / 33% / 100% / 50%. contracts/screens.md §`/week` says this
 * screen must not have "a percentage, a progress bar framed as a target",
 * and a bar filled to the fraction of a rhythm is exactly that. It is left
 * out rather than argued away; putting it in is a contract amendment and a
 * fixture change, not an implementation detail.
 */
export function WeekRow({ area, row }: { area: Area; row: WeekRowFixture }) {
  return (
    <Card data-testid="week-row" data-area={area.id} className="flex flex-col gap-3.5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <AreaDot color={area.color} />
          <span className="text-base font-semibold tracking-tight">{area.name}</span>
        </span>
        <span className="text-sm text-muted-foreground">{row.sessionsLabel}</span>
      </div>
      <p className="text-sm text-muted-foreground text-pretty">{row.line}</p>
    </Card>
  );
}
