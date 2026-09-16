# Phase 0 — Research: Visual shell

Only one item in Technical Context was genuinely unknown: how to test a
feature whose acceptance criteria are physical measurements. The rest of
the stack is fixed by Constitution Article VI, so there was nothing to
choose. Four smaller questions arose while working the first one through
and are recorded because each shapes a task.

---

## 1. How are the acceptance criteria tested?

**Decision**: Playwright for everything dimensional and navigational;
Vitest for the copy lint. Both dev-only.

**Rationale**: The criteria that carry this feature are measurements:

- SC-002 — renders at 390px and 320px with no horizontal scrolling, no
  clipped text, no overlapping controls
- SC-003 — every tappable control is at least 44x44px at both widths
- SC-011 — every screen can be left without the browser's back button

None of these can be asserted without a layout engine. jsdom reports every
element as `0x0` because it does not lay anything out, so a Testing Library
assertion on size would pass or fail meaninglessly. Playwright drives a real
engine, sets a real viewport, and exposes `boundingBox()` and
`scrollWidth`/`clientWidth` — which is exactly the shape of these criteria.

Concretely:

| Criterion | How Playwright asserts it |
|---|---|
| 44x44px minimum | `boundingBox()` over every `button`, `a`, `input`, `[role=button]`; assert `width >= 44 && height >= 44` |
| No horizontal scroll | `document.documentElement.scrollWidth <= clientWidth` |
| No clipped text | `scrollWidth <= clientWidth` per text node container |
| No overlap | pairwise bounding-box intersection over interactive controls |
| Navigation, no dead ends | walk every route, assert a way back exists |

Each test runs twice, in a 390px and a 320px project, so one spec file
covers both widths without duplication.

**Alternatives considered**:

- *Testing Library + jsdom alone* — rejected above. It remains right for the
  copy lint, where there is no layout involved, but Vitest without a DOM is
  simpler still for that.
- *Manual verification on a device only* — this is required regardless
  (Article VII: verified "on a real device or device emulator"), but it
  cannot be the whole answer, because Article VII also requires every
  acceptance criterion to have at least one test naming it. Manual checking
  and Playwright cover different halves.
- *Visual snapshot / screenshot diffing* — rejected for this feature. It
  detects that something changed, not that a criterion holds, and it fails
  noisily on font rendering differences between machines. It would be worth
  revisiting once the design has stopped moving.

---

## 2. Where do the strings live?

**Decision**: One module, `lib/copy.ts`, with one export per screen. No
user-facing string is written inline in a component.

**Rationale**: FR-025 makes copy a requirement — character-exact. Three
things follow from centralising it:

- The spec's copy tables and `lib/copy.ts` can be diffed against each other
  by a person, which is not possible when strings are scattered across
  twenty components.
- One test enforces FR-026 (forbidden lexicon), FR-027 (no emoji, no
  exclamation mark, no apology) across the entire product by scanning a
  single module's exported values. Scattered strings would need a lint rule
  over JSX, which is both harder and easier to evade.
- When feature 002 makes strings dynamic, the interpolation points are
  already isolated.

**Alternatives considered**:

- *Strings inline in components* — the obvious default, rejected because it
  makes the lexicon rule unenforceable in any honest way.
- *An i18n library* — rejected. Article VI presumes new runtime
  dependencies rejected, Tend is single-language, and a translation layer
  would buy nothing here but indirection.

---

## 3. How do the three session states get rendered without adding UI?

**Decision**: One route, `session/[taskId]`, with the state selected by a
`?state=running|zero|past` query parameter, defaulting to `running`. No
control for it appears anywhere on screen.

**Rationale**: FR-019 requires the three states be identical in layout and
treatment. The strongest guarantee of that is that they are the same
component with three fixture inputs; three routes or three components would
let them drift. The query parameter keeps all three reachable for review
and for Playwright without putting a state switcher on a screen whose one
question is "what am I doing for these fifteen minutes?" — a switcher would
fail Article III's addition test immediately.

**Alternatives considered**:

- *Three separate routes* — more places for the three to diverge, and the
  divergence would be invisible until someone compared them side by side.
- *A visible toggle* — fails the addition test. Removing it would not break
  the screen's question, so it must not be added.

---

## 4. Which shadcn/ui primitives actually get installed?

**Decision**: Install on first use, not up front. Expected: Button, Card,
Input, Textarea. Badge and Tabs are likely unused in these ten screens.

**Rationale**: Article VI permits six primitives; it does not require six.
Reading the design, the ten screens use buttons, card-like grouped rows, one
single-line field and one multi-line field. The area colors are rendered as
dots and bars — spans with a background color — not as Badges. Nothing in
these screens switches views inside a page, which is the only thing Tabs is
allowed to do.

Scaffolding unused primitives would leave dead files that later invite use
for the wrong reason. If a screen turns out to need Badge or Tabs during
implementation, it is permitted and requires no justification — they are
already inside the six.

**Alternatives considered**:

- *Install all six up front* — rejected. Dead code that carries an implicit
  invitation.

---

## 5. Where does the navigation topology live?

**Decision**: `lib/routes.ts` — a route table plus the back rule from
FR-028 through FR-033.

**Rationale**: The back rule is conditional: Area edit always returns to
Areas, but Areas returns to whichever screen opened it, and returns nowhere
at all when that screen was First run. That is a rule with a branch in it.
A rule with a branch, expressed inline in a component, is the exact shape of
thing Article VI exists to prevent — and it would be duplicated across every
screen that renders a back control.

Keeping it in `lib/` also means the "no dead ends" test (FR-001) can walk
the table rather than hardcoding a list of routes that will drift.

**Alternatives considered**:

- *Rely on browser history* — rejected. `router.back()` produces the wrong
  destination when a screen is deep-linked or reloaded, and FR-031 requires
  Areas to render *no* back control in one specific case, which history
  cannot express.
- *Pass the opener as a prop through each screen* — rejected. It spreads one
  rule across ten call sites.

---

## Resolved

No `NEEDS CLARIFICATION` markers remain in Technical Context.
