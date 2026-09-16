import { cn } from '@/lib/utils';

/**
 * Design system §4's sticky footer, verbatim, in one place.
 *
 * Primary actions sit within thumb reach at the bottom of the viewport
 * (Article IV). The gradient fade is what keeps content legible as it
 * scrolls under the bar.
 *
 * It exists as a component rather than a copied class string because seven
 * screens use it, and a value with seven homes is the drift the design
 * system's §9 documents: one copy goes stale and the stale one gets built.
 */
export function StickyFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'sticky bottom-0 mt-8 bg-gradient-to-t from-background from-60% to-transparent pb-6 pt-7',
        className
      )}
    >
      {children}
    </div>
  );
}
