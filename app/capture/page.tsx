'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BackLink } from '@/components/back-link';
import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { CaptureForm } from '@/features/capture/capture-form';
import { capture as copy } from '@/lib/copy';
import { areaChoices } from '@/lib/derive/screens';
import { backForScreen } from '@/lib/routes';
import { useNowGetter } from '@/lib/state/clock';
import { useAppState, useDispatch } from '@/lib/state/provider';

/**
 * Capture — what did I just remember?
 *
 * One field, an optional area, and the way out. The note says where an item
 * with no area goes, because explaining the absence is the voice this
 * product uses (design system §7) — and because an inbox nobody understands
 * is an inbox nobody trusts.
 *
 * `Capture` records the task and goes to `/`, as 001's contract has always
 * said. With no area it lands in the inbox; with one it is assigned and on
 * that area's week list (FR-020). The moment is `useNowGetter()`'s, as for
 * every transition.
 *
 * The action is disabled while the field is only whitespace, and nothing
 * says why (FR-020a): there is nothing to capture, so nothing meaningful
 * is blocked, and a sentence explaining an empty box would be one more
 * thing to read between remembering and putting it down.
 */
export default function CapturePage() {
  const state = useAppState();
  const dispatch = useDispatch();
  const getNow = useNowGetter();
  const router = useRouter();

  const [text, setText] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const title = text.trim();

  const capture = () => {
    if (title === '') return;
    const now = getNow();
    dispatch({ type: 'capture', now, id: `task-${now.getTime()}`, title, areaId: selected });
    router.push('/');
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 pb-[var(--footer-h,15rem)]">
        <BackLink target={backForScreen('/capture')} />

        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">{copy.eyebrow}</p>

        <CaptureForm
          choices={areaChoices(state)}
          text={text}
          onText={setText}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      <StickyFooter>
        <Button className="w-full" disabled={title === ''} onClick={capture}>
          {copy.primaryAction}
        </Button>
      </StickyFooter>
    </div>
  );
}
