import Link from 'next/link';

import { home as copy } from '@/lib/copy';

/**
 * The way into Review, at the top of Home when the week is ending.
 *
 * FR-016 asks for a tappable line, not a notification and not a badge — so
 * it is a link styled as the quiet sentence it is: no count, no dot, no
 * colour, nothing that would make it read as something demanding attention.
 * Article I forbids the app telling anyone they are behind, and a badge on
 * Home would do exactly that without using a single word.
 *
 * The negative margin aligns its text with the heading above while keeping
 * the tap target 44px tall (Article IV).
 */
export function ReviewEntry() {
  return (
    <Link
      href="/review"
      className="-ml-2.5 inline-flex min-h-11 items-center self-start rounded-md px-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copy.reviewEntry}
    </Link>
  );
}
