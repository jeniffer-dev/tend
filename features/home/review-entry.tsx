import Link from 'next/link';

import { reviewHref } from '@/lib/routes';

/**
 * The way into Review, at the top of Home when the week is ending.
 *
 * A tappable line, not a notification and not a badge — so it is styled as
 * the quiet sentence it is: no count, no dot, no colour, nothing that would
 * make it read as something demanding attention. Article I forbids the app
 * telling anyone they are behind, and a badge on Home would do exactly that
 * without using a single word.
 *
 * 002 gives it two sentences and a silence. It reads one thing on the
 * Sunday a week is closing, another on the Monday after, and it is not
 * rendered at all on the other five days (FR-019a). Which of the three
 * applies is decided in lib/, and this component is handed the line or is
 * not rendered.
 *
 * The negative margin aligns its text with the heading above while keeping
 * the tap target 44px tall (Article IV).
 */
export function ReviewEntry({ line }: { line: string }) {
  return (
    <Link
      href={reviewHref}
      className="-ml-2.5 inline-flex min-h-11 items-center self-start rounded-md px-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {line}
    </Link>
  );
}
