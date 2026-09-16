import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { BackTarget } from '@/lib/routes';

/**
 * The conditional back control.
 *
 * It renders nothing when the route has no opener — Home and First run are
 * roots, and Areas is a root too when First run opened it, because First run
 * describes a state that no longer exists once an area has been named
 * (FR-028, FR-031). The branch itself lives in lib/routes.ts; this component
 * only draws the answer.
 *
 * h-11 and the negative margin match Home's review entry: a quiet line the
 * thumb can still hit, aligned to the text above it rather than inset from
 * it.
 */
export function BackLink({ target, className }: { target: BackTarget | null; className?: string }) {
  if (!target) return null;

  return (
    <Link
      href={target.href}
      className={cn(
        '-ml-2.5 inline-flex h-11 items-center rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className
      )}
    >
      {target.label}
    </Link>
  );
}
