'use client';

import { useState } from 'react';

import { BackLink } from '@/components/back-link';
import { InboxRow } from '@/features/inbox/inbox-row';
import { inbox as copy } from '@/lib/copy';
import { areaChoices, inboxView } from '@/lib/derive/screens';
import { backForScreen } from '@/lib/routes';
import { useToday } from '@/lib/state/clock';
import { useAppState, useDispatch } from '@/lib/state/provider';

/**
 * Inbox — what have I not sorted yet?
 *
 * The unsorted items, their count as the heading, and the line saying
 * nothing here expires. No sort control, no filter, and no count framed as
 * a backlog: the pile is allowed to be a pile, and Article I forbids the
 * app implying that a person is behind on it.
 *
 * Everything shown is `inboxView`'s. The page holds one thing of its own —
 * which row has its chips open — because that is a fact about this visit,
 * not about the tasks (FR-021a). Choosing a chip dispatches
 * `giveTaskAnArea`, and the item leaves because it now has an area.
 */
export default function InboxPage() {
  const state = useAppState();
  const dispatch = useDispatch();
  const now = useToday();
  const view = inboxView(state, now);
  const choices = areaChoices(state);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <BackLink target={backForScreen('/inbox')} />

      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">{copy.eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{view.heading}</h1>
        {view.emptyNote && (
          <p className="text-sm text-muted-foreground text-pretty">{view.emptyNote}</p>
        )}
      </div>

      {view.items.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {view.items.map((item) => (
            <InboxRow
              key={item.id}
              item={item}
              choices={choices}
              open={openId === item.id}
              onOpen={() => setOpenId(openId === item.id ? null : item.id)}
              onChoose={(areaId) => {
                dispatch({ type: 'giveTaskAnArea', taskId: item.id, areaId });
                setOpenId(null);
              }}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground/50 text-pretty">{copy.footerNote}</p>
    </div>
  );
}
