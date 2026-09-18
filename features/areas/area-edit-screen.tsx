import Link from 'next/link';

import { AreaForm } from '@/features/areas/area-form';
import { areaEdit as copy } from '@/lib/copy';
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
 */
export function AreaEditScreen({
  name,
  color,
  rhythm,
  isDaily,
}: {
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

      <p className="pb-5 text-xs text-muted-foreground/50 text-pretty">{copy.footerNote}</p>
    </div>
  );
}
