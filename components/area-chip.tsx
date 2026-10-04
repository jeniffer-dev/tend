'use client';

import { AreaDot } from '@/components/area-dot';
import type { AreaChoice } from '@/lib/derive/screens';
import { cn } from '@/lib/utils';

/**
 * An area as a chip: its dot and its name, 44px tall.
 *
 * One component, two screens. Capture uses it to choose an area for what
 * is being captured; the Inbox uses it inside a row to give an item its
 * area (FR-021a). Drawn twice, the two would drift apart in one of them,
 * and the person would be choosing between areas that look different
 * depending on where they are standing.
 *
 * `pressed` is Capture's toggle state. The Inbox's chips act on the first
 * tap and are never pressed, so they leave it unset.
 */
export function AreaChip({
  choice,
  pressed,
  onClick,
}: {
  choice: AreaChoice;
  pressed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
        pressed
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-card hover:bg-muted'
      )}
    >
      <AreaDot color={choice.color} />
      {choice.name}
    </button>
  );
}
