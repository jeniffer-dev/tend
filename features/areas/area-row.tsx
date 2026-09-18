'use client';

import Link from 'next/link';

import { AreaDot } from '@/components/area-dot';
import { areas as copy } from '@/lib/copy';
import { cn } from '@/lib/utils';
import type { Area } from '@/lib/fixtures';

/**
 * One area on the Areas screen: its colour, its name, and the line stating
 * its rhythm and whether it waits on Home (FR-010).
 *
 * The rhythm line is the fixture's own `rhythmLabel` — a whole sentence,
 * never assembled here from `rhythm` and `isDaily`. Those two fields exist
 * for the Area edit controls' selected state and for nothing else.
 *
 * No Tend button. Areas is where you decide what exists, not where you act
 * on it (contracts/screens.md).
 *
 * No remove control either. Removal is started from Area edit — the screen
 * that is already about this one area — and decided here, in the
 * confirmation that replaces the row.
 */
export function AreaRow({
  area,
  isDragging,
  onReorderPointerDown,
  onReorderPointerMove,
  onReorderPointerUp,
  onReorderKeyDown,
}: {
  area: Area;
  isDragging: boolean;
  onReorderPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onReorderPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onReorderPointerUp: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onReorderKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div
      data-testid="area-row"
      data-area={area.id}
      className={cn(
        'flex items-center gap-2.5 rounded-xl border border-border bg-card py-3.5 pl-4 pr-2 shadow-sm transition-colors',
        isDragging && 'border-foreground'
      )}
    >
      <Link
        href={`/areas/${area.id}`}
        className="flex min-w-0 flex-1 flex-col gap-1 rounded-md py-1 transition-colors hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <AreaDot color={area.color} />
          <span className="text-base font-semibold tracking-tight">{area.name}</span>
        </span>
        <span className="text-sm text-muted-foreground text-pretty">{area.rhythmLabel}</span>
      </Link>

      {/* Three plain rules, as drawn — not an icon. Keyboard reorder is
          wired to the same control so the list is operable without a
          pointer; it adds no element to the screen. */}
      <button
        type="button"
        aria-label={copy.reorderLabel(area.name)}
        onPointerDown={onReorderPointerDown}
        onPointerMove={onReorderPointerMove}
        onPointerUp={onReorderPointerUp}
        onPointerCancel={onReorderPointerUp}
        onKeyDown={onReorderKeyDown}
        className="flex h-11 w-11 shrink-0 cursor-grab touch-none flex-col items-center justify-center gap-[3px] rounded-md transition-colors hover:bg-muted active:cursor-grabbing"
      >
        <span aria-hidden className="h-px w-3.5 bg-muted-foreground" />
        <span aria-hidden className="h-px w-3.5 bg-muted-foreground" />
        <span aria-hidden className="h-px w-3.5 bg-muted-foreground" />
      </button>
    </div>
  );
}
