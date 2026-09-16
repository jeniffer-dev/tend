import * as React from 'react';

import { cn } from '@/lib/utils';

/* Design system §5: the Input's conventions unrolled to multiple lines —
   same text-sm body size, same border token, same radius, same --ring focus
   treatment. It should read as an Input that got taller, not as a new
   control. It grows with `rows`, never with a drag handle: `resize-none`.

   Admitted as the sixth primitive for prose the user re-reads — the session
   progress note is only useful if it is legible when the task comes back
   around (Constitution Article VI). A single line still belongs in an Input. */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Textarea };
