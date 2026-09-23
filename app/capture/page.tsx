import { BackLink } from '@/components/back-link';
import { StickyFooter } from '@/components/sticky-footer';
import { Button } from '@/components/ui/button';
import { CaptureForm } from '@/features/capture/capture-form';
import { capture as copy } from '@/lib/copy';
import { backForScreen } from '@/lib/routes';

/**
 * Capture — what did I just remember?
 *
 * One field, an optional area, and the way out. The note says where an item
 * with no area goes, because explaining the absence is the voice this
 * product uses (design system §7) — and because an inbox nobody understands
 * is an inbox nobody trusts.
 */
export default function CapturePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 pb-[var(--footer-h,9rem)]">
        <BackLink target={backForScreen('/capture')} />

        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">{copy.eyebrow}</p>

        <CaptureForm />
      </div>

      <StickyFooter>
        <Button className="w-full">{copy.primaryAction}</Button>
      </StickyFooter>
    </div>
  );
}
