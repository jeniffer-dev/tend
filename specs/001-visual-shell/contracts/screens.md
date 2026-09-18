# Phase 1 — UI contract: the ten screens

Tend exposes no API. Its interface is the set of screens, their routes and
the edges between them. That is what this contract fixes.

For each screen: its route, its one question, what must be on it, what must
not, and where it goes. Copy is not repeated here — `spec.md` §"Screen
copy" is the single source, and `lib/copy.ts` is its transcription.

## Route table

| Route | Screen | Opened from |
|---|---|---|
| `/first-run` | First run | direct entry only |
| `/` | Home | root |
| `/areas` | Areas | Week, Review, or First run |
| `/areas/[areaId]` | Area edit | Areas |
| `/areas/new` | Area edit (creating) | Areas `New area`, First run |
| `/tend/[areaId]` | Picker | Home |
| `/session/[taskId]` | Session | Picker |
| `/capture` | Capture | Home |
| `/inbox` | Inbox | Home |
| `/week` | Week | Home |
| `/review` | Review | Home |

## The back rule (FR-028 – FR-031)

```
Home                    root, no back control
├── Capture             → Home
├── Inbox               → Home
├── Week                → Home
│   └── Areas           → Week
├── Review              → Home
│   └── Areas           → Review
└── Picker              → Home
    └── Session         → Picker

First run               root, no back control
└── Area edit (new)     → Areas
    └── Areas           root in this case, no back control
```

Areas is the one screen whose back control is conditional. Area edit always
returns to Areas. Every other screen returns to its single opener.

## Per screen

### `/first-run` — Where do I start?

**Must have**: the invitation, the four color dots with their caption, one
primary action, the closing line about nothing being set up in advance.

**Must not have**: any area, any suggested or sample area, any navigation
to Home. A person with no areas has no Home to see.

**Goes to**: `/areas/new`.

---

### `/` — What am I tending right now?

**Must have**: the day's four daily areas rendered in their three
treatments (to-tend, past-rhythm, attended), the absence note for People,
the bottom navigation.

**Must have when the week is ending**: the Review entry, at the top, above
the areas, as a tappable line — not a badge, not a notification.

**Order (FR-013a)**: the areas still to be tended come first — `to-tend`
and `past-rhythm` together, in `sortOrder` — and every area already
attended today sinks below them, also in `sortOrder` among themselves.

This is what the HOME artboard draws, and the reason is the screen's one
question. What has been attended today is no longer an answer to *what am
I tending right now?*; it stays on the screen only so the day reads as
complete, and it earns its place at the bottom rather than in the middle
of what is still open. An attended area sitting between two Tend buttons
pushes live work below the fold, which is the one thing Home cannot do
(Article III: actionable in one tap from cold start).

`sortOrder` still governs *within* each group, so the order a person set
on the Areas screen is never rearranged — only the attended ones are
moved as a block.

**Must not have**: any inbox item, any week list, any history, any minute
count other than the attended line's, any Areas entry in the bottom
navigation (FR-029).

**Goes to**: `/tend/[areaId]` from a Tend button; `/capture`, `/inbox`,
`/week` from the bottom navigation; `/review` from the review entry.

---

### `/areas` — What am I paying attention to?

**Must have**: five areas in `sortOrder`, each with color, name and rhythm
line; drag-to-reorder; `New area`; the footer note; a removal confirmation
that states what happens to the area's tasks *and* to its past sessions
before offering the destructive action.

**Must not have**: a Tend button. Areas is where you decide what exists,
not where you act on it.

**Goes to**: `/areas/[areaId]` on tapping an area; `/areas/new` from
`New area`; back to its opener, or nowhere if opened from First run.

---

### `/areas/[areaId]` and `/areas/new` — What is this area, and how often?

**Must have**: `Back to areas` at the top; name field; five color swatches;
rhythm 1–5; On Home two-way choice; the three section notes; the footer
note. Each control shows its selected option.

**Creating differs from editing in exactly one way**: the name field is
empty and shows its placeholder. Defaults are rhythm 3, On Home
`Every day`, fifth palette color — from the design's own prototype.

**Must not have**: a Done button (clarification Q1), a delete action
(removal lives on Areas, where the consequences are explained), a
sessions-per-day or minutes control.

**Goes to**: `/areas`.

---

### `/tend/[areaId]` — What do I focus on for fifteen minutes?

**Must have**: the area name in the eyebrow, the area's week-list tasks
each with a last-session note, the first task selected on arrival, the
scope note, the primary action, the footer note about switching inside the
session.

**Must not have**: tasks from another area, inbox items, a way to add a
task. Capture is elsewhere.

**Goes to**: `/session/[taskId]` for the selected task; back to `/`.

---

### `/session/[taskId]` — What am I doing for these fifteen minutes?

**Must have**: area eyebrow, task heading, the switch-task action, the
clock, the clock note, the note field with its label and note, both closing
actions.

**Three states** via `?state=running|zero|past`, defaulting to `running`.
Identical layout and treatment in all three; only the clock string, the
clock note and the note content differ (FR-019).

**Must not have**: a visible state switcher, a pause or stop control, a
progress ring, red at any point, any pulsing, any countdown framing.

**Goes to**: `/tend/[areaId]` from the switch action and from both closing
actions.

---

### `/capture` — What did I just remember?

**Must have**: exactly one text field, four optional area chips with none
preselected, the note about where an item with no area goes, the primary
action.

**Must not have**: a date field, a priority control, a required area, a
second text field.

**Goes to**: `/`.

---

### `/inbox` — What have I not sorted yet?

**Must have**: three unsorted items, each with its captured label and a way
to give it an area; the footer note that nothing expires.

**Must not have**: a date framed as due, any sort or filter control, any
count framed as a backlog.

**Goes to**: `/`.

---

### `/week` — What am I committing to?

**Must have**: four areas, each with sessions committed and sessions
attended; `Change the rhythm`.

**Must not have**: minutes (FR-022), a percentage, a progress bar framed as
a target, People (clarification Q3).

**Goes to**: `/areas` from `Change the rhythm`; back to `/`.

---

### `/review` — What did I attend, and what went unattended?

**Must have**: `Attended` and `Unattended` as two labelled sections in that
order; three attended areas with their minutes; one unattended area; the
closing note; `Set this week's rhythm`.

**Must not have**: a chart, a trend, a comparison with last week, a total
framed as a score, any word suggesting failure.

**Goes to**: `/areas` from `Set this week's rhythm`; back to `/`.

## Contract-level invariants

These hold on every screen and are tested once, across all routes:

1. Every tappable control measures at least 44x44px at 390px and at 320px.
2. `document.documentElement.scrollWidth <= clientWidth` at both widths.
3. No two interactive controls overlap.
4. Every screen other than Home and First run offers a way back without the
   browser's back button — except Areas when opened from First run.
5. No rendered text contains an emoji, an exclamation mark, or any term
   from Article II's forbidden list.
6. Minutes appear only on `/review`, on the session clock, and in Home's
   attended line.
7. No element animates any property other than color.
