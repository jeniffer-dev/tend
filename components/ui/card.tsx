import * as React from 'react';

import { cn } from '@/lib/utils';

/* Design system §5: `rounded-xl border border-border bg-card shadow-sm`.
   Cards separate from the page by lightness, not by shadow — the card is
   *lighter* than the warm off-white page, with a 1px border and nothing
   heavier (§2 rule 3). */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 space-y-1.5', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-5', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardContent };
