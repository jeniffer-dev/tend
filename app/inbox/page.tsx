import { BackLink } from '@/components/back-link';
import { InboxRow } from '@/features/inbox/inbox-row';
import { inbox as copy } from '@/lib/copy';
import { inboxItems } from '@/lib/fixtures';
import { backForScreen } from '@/lib/routes';

/**
 * Inbox — what have I not sorted yet?
 *
 * The three unsorted items and the line saying nothing here expires
 * (FR-021). No sort control, no filter, and no count framed as a backlog:
 * the pile is allowed to be a pile, and Article I forbids the app implying
 * that a person is behind on it.
 */
export default function InboxPage() {
  return (
    <div className="flex flex-col gap-5">
      <BackLink target={backForScreen('/inbox')} />

      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">{copy.eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{copy.heading}</h1>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {inboxItems.map((item) => (
          <InboxRow key={item.id} item={item} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground/50 text-pretty">{copy.footerNote}</p>
    </div>
  );
}
