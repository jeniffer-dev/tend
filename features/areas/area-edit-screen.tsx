import Link from 'next/link';

import { AreaForm } from '@/features/areas/area-form';
import { areaEdit as copy, areas as areasCopy } from '@/lib/copy';
import type { AreaColor, Rhythm } from '@/lib/fixtures';

/**
 * Area edit — what is this area, and how often?
 *
 * Editing and creating are the same screen. They differ in exactly one
 * visible way: the name field carries a value when editing and shows its
 * placeholder when creating (contracts/screens.md). One component renders
 * both so the two cannot drift.
 *
 * The top action is `Back to areas`, never `Done`. Article II reserves Done
 * for task completion, and the approved design's `Done` here was a known
 * violation resolved in clarification Q1 — which also cut the footer note's
 * second sentence, because it restated what the button does.
 *
 * Removal is *started* here and never executed here. `Remove the area` is a
 * tertiary text link at the end of the screen, carrying the same weight as
 * the session's `Mark it done`: present, reachable, and not competing with
 * anything. Tapping it returns to Areas with that row in the confirmation
 * state the artboard draws, where the two real choices live. The screen
 * that explains the consequences is the screen that decides.
 */
export function AreaEditScreen({
  areaId,
  name,
  color,
  rhythm,
  isDaily,
}: {
  /** Absent when creating: there is nothing yet to remove. */
  areaId?: string;
  name: string;
  color: AreaColor;
  rhythm: Rhythm;
  isDaily: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">{copy.eyebrow}</p>
        <Link
          data-testid="back-link"
          href="/areas"
          className="-mr-2.5 inline-flex h-11 items-center rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copy.topAction}
        </Link>
      </div>

      <AreaForm
        defaultName={name}
        defaultColor={color}
        defaultRhythm={rhythm}
        defaultIsDaily={isDaily}
      />

      <p className="text-xs text-muted-foreground/50 text-pretty">{copy.footerNote}</p>

      {areaId && (
        <Link
          href={`/areas?confirm=${areaId}`}
          /* -ml-2.5 cancels the px-2.5, so the text lines up with the rest
             of the content while the tap target keeps its 44px — the same
             pattern as BackLink and Home's review entry. Without it the
             label sat 10px right of everything above it. */
          className="-ml-2.5 mb-5 inline-flex h-11 items-center justify-center self-start rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {areasCopy.removalAction}
        </Link>
      )}
    </div>
  );
}
