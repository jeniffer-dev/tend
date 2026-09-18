'use client';

import { AreaDot } from '@/components/area-dot';
import { Button } from '@/components/ui/button';
import { areas as copy } from '@/lib/copy';
import type { Area } from '@/lib/fixtures';

/**
 * The removal confirmation, replacing the row in place as the design draws
 * it.
 *
 * FR-011: it states what happens to the area's tasks *and* to its past
 * sessions before anything destructive is offered. The explanation is the
 * area's own fixture string, so it names that area's counts rather than
 * Money's.
 *
 * Both ways out are offered, and neither is styled as the expected one.
 * `Remove the area` is an outline button, not a destructive red one:
 * --destructive is reserved for genuinely destructive actions, and nothing
 * here removes anything (nothing is stored at all). Article I's calm holds
 * even in a confirmation — the screen explains and then waits.
 */
export function RemoveConfirmation({ area, onKeep }: { area: Area; onKeep: () => void }) {
  return (
    <div
      data-testid="remove-confirmation"
      className="flex flex-col gap-3.5 rounded-xl border border-foreground bg-card p-4 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2">
          <AreaDot color={area.color} />
          <span className="text-base font-semibold tracking-tight">{area.name}</span>
        </span>
        <span className="text-sm text-muted-foreground text-pretty">{area.rhythmLabel}</span>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
        {area.removalExplanation}
      </p>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onKeep}>
          {copy.removalAction}
        </Button>
        <Button variant="ghost" className="flex-1" onClick={onKeep}>
          {copy.keepAction}
        </Button>
      </div>
    </div>
  );
}
