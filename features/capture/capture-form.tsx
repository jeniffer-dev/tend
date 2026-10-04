'use client';

import { AreaChip } from '@/components/area-chip';
import { Textarea } from '@/components/ui/textarea';
import { capture as copy } from '@/lib/copy';
import type { AreaChoice } from '@/lib/derive/screens';

/**
 * Capture — what did I just remember?
 *
 * Exactly one text field, and the area is optional with nothing preselected
 * (FR-020). No date field, no priority control, no second field: capture
 * protects the session from becoming a sorting exercise, and every control
 * added here is one more decision between remembering a thing and being rid
 * of it.
 *
 * The field is a four-row Textarea, as the artboard draws it. Constitution
 * Article VI admits it here as its third case (amended 1.2.0): something
 * the person has just remembered and needs room to put down, even though
 * they will not re-read it.
 *
 * The chips are every unarchived area in the Areas order (FR-022a), handed
 * in already derived; 001 hardcoded four ids that happened to be the daily
 * ones, which was never a rule. A chip toggles off as readily as on.
 *
 * The form is controlled: the page holds the text and the choice, because
 * the action that uses them sits in the sticky footer, outside this form.
 */
export function CaptureForm({
  choices,
  text,
  onText,
  selected,
  onSelect,
}: {
  choices: AreaChoice[];
  text: string;
  onText: (text: string) => void;
  selected: string | null;
  onSelect: (areaId: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Textarea
        aria-label={copy.eyebrow}
        rows={4}
        value={text}
        onChange={(e) => onText(e.target.value)}
        placeholder={copy.fieldPlaceholder}
        className="min-h-[104px] rounded-xl bg-card p-4 text-lg leading-snug tracking-[-0.01em] shadow-sm"
      />

      <div className="flex flex-col gap-2.5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/45">
          {copy.areaLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {choices.map((choice) => {
            const isSelected = selected === choice.areaId;
            return (
              <AreaChip
                key={choice.areaId}
                choice={choice}
                pressed={isSelected}
                // Tapping the selected chip clears it: the area is optional,
                // so there has to be a way back to none.
                onClick={() => onSelect(isSelected ? null : choice.areaId)}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground/50 text-pretty">{copy.footerNote}</p>
      </div>
    </div>
  );
}
