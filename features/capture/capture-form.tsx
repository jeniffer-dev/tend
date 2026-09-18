'use client';

import { useState } from 'react';

import { AreaDot } from '@/components/area-dot';
import { Input } from '@/components/ui/input';
import { capture as copy } from '@/lib/copy';
import { areaById, captureChipAreaIds } from '@/lib/fixtures';
import { cn } from '@/lib/utils';

/**
 * Capture — what did I just remember?
 *
 * Exactly one text field, and the area is optional with nothing preselected
 * (FR-020). No date field, no priority control, no second field: capture
 * protects the session from becoming a sorting exercise, and every control
 * added here is one more decision between remembering a thing and being rid
 * of it.
 *
 * FLAGGED — the artboard draws this field as a four-row `<textarea>`; it is
 * an `Input` here. Constitution Article VI admits Textarea for prose the
 * user will re-read "and for nothing else", naming `Task.notes` and
 * `Session.progress_note`, and says plainly that a single line of text still
 * belongs in an Input. `One thing` is a single line. The constitution
 * outranks the design file, so this is the departure it requires — but it is
 * a visible one, and it is the kind of call worth overruling if the intent
 * was a roomy box to think in.
 *
 * A chip toggles off as readily as on. Nothing is stored (FR-003).
 */
export function CaptureForm() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <Input
        aria-label={copy.eyebrow}
        placeholder={copy.fieldPlaceholder}
        className="h-14 rounded-xl bg-card px-4 text-lg tracking-[-0.01em] shadow-sm"
      />

      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          {copy.areaLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {captureChipAreaIds.map((areaId) => {
            const area = areaById(areaId)!;
            const isSelected = selected === areaId;
            return (
              <button
                key={areaId}
                type="button"
                aria-pressed={isSelected}
                // Tapping the selected chip clears it: the area is optional,
                // so there has to be a way back to none.
                onClick={() => setSelected(isSelected ? null : areaId)}
                className={cn(
                  'flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
                  isSelected
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-card hover:bg-muted'
                )}
              >
                <AreaDot color={area.color} />
                {area.name}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground/50 text-pretty">{copy.footerNote}</p>
      </div>
    </div>
  );
}
