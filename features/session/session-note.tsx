import { Textarea } from '@/components/ui/textarea';
import { session as copy } from '@/lib/copy';

/**
 * Where you got to — the progress note.
 *
 * A Textarea rather than an Input because this is prose the user re-reads:
 * a session closed as progressed is only useful if the note explaining what
 * is left is legible when the task comes back around, and a single-line
 * field that scrolls its own content horizontally hides exactly that
 * (Article VI, the Textarea justification).
 *
 * `defaultValue` rather than `value`: the field is genuinely typeable and
 * genuinely unsaved. Nothing persists, and a reload returns it to the
 * fixture's content (FR-003).
 */
export function SessionNote({ value }: { value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="progress-note"
        className="text-xs uppercase tracking-widest text-muted-foreground/45"
      >
        {copy.noteLabel}
      </label>
      <Textarea
        id="progress-note"
        rows={5}
        defaultValue={value}
        placeholder={copy.notePlaceholder}
        className="min-h-[110px] bg-card leading-relaxed"
      />
      <p className="text-xs text-muted-foreground/50">{copy.noteNote}</p>
    </div>
  );
}
