# Tend

A personal system for attending to a few life areas in short, deliberate
sessions. The unit of success is the completed session, not the completed
task.

---

## What's in this folder

```
tend/
├── .specify/
│   └── memory/
│       └── constitution.md    ← governing principles, already written
├── docs/
│   ├── DESIGN-SYSTEM.md       ← visual source of truth
│   └── PRODUCT-SPEC.md        ← full product spec (raw material)
├── specs/                     ← spec-kit will fill this, one dir per feature
├── CLAUDE.md
└── README.md
```

Nothing here is code. This is the specification layer that comes before it.

---

## Setup

### 1. Initialize spec-kit in place

```bash
cd tend
git init
uvx --from git+https://github.com/github/spec-kit.git specify init --here --ai claude
```

It will warn about writing into a non-empty folder. Say yes.

### 2. Keep the constitution that's already here

`specify init` may overwrite `.specify/memory/constitution.md` with a
blank template. If it does, restore the version in this repo — do not run
`/speckit.constitution` to regenerate it. It was written against the real
design system and encodes decisions that a generated one will not have.

Verify with:

```bash
head -5 .specify/memory/constitution.md   # should say "Tend — Constitution"
```

### 3. Confirm the command prefix

Open Claude Code in the project and run `/help`. Depending on the spec-kit
version the commands are either `/specify` or `/speckit.specify`. Use
whichever your install shows.

---

## Build order

Features are sliced so the **visual shape is validated before any domain
logic is built**. Do not hand the whole product spec to `/specify` at once.

### Feature 001 — Visual shell

All screens navigable, fixture data hardcoded, no persistence, no business
logic. The goal is to open it on a phone and decide whether it feels calm.

Scope: Home, Session, Inbox, Week, Review. Acceptance criteria are visual
and verified at 390px.

### Feature 002 — Domain

`docs/PRODUCT-SPEC.md` in full: areas and weekly budgets, task hierarchy,
sessions with planned vs actual minutes, the weekly review ritual.

### Feature 003 — Persistence

Local-first storage. Decided in its own plan, not before.

---

## The loop, per feature

```
/specify   → what and why, no stack
/plan      → how, with the stack from Article VI
/tasks     → atomic numbered tasks
/analyze   → read-only; run it every time
/implement → code
```

Read each artifact before moving to the next. `analyze` catches
constitutional violations before they become code — it is not optional.

---

## Working on a phone

```bash
npm run dev -- --host
```

Then open the printed LAN address on the phone's browser. Iterating on the
real device is faster and more honest than the DevTools emulator.

---

## Decisions already made

| Decision | Value | Where |
|---|---|---|
| Name | Tend | — |
| Platform | Mobile web first, 390px base | Constitution IV |
| Stack | Next.js App Router, TS, Tailwind, shadcn/ui, Geist | Constitution VI |
| Background | `#F9F9F6` (the `#FAFAF8` in older docs is stale) | Constitution IV |
| Brand green | `hsl(155 35% 55%)`, unified | Constitution IV |
| Dark mode | Not in v1, light-only | Constitution IV |
| Container | `max-w-[720px]` single column, no multi-column grids | Constitution IV |

---

## Still open

- Does the week start Monday or Sunday?
- What happens to a session abandoned mid-run (app closed)?
- Persistence: local only, or sync later?
