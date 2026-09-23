# Specification Quality Checklist: Domain logic

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-23
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

All 16 items pass. Six clarifications were settled on 2026-09-23 and are
recorded in the spec's §Clarifications: an empty start with a separate
development mode, in-memory state only, empty-state copy written by the
product owner, numbers as words to twelve and figures from thirteen, day
names to seven days back, and an area counting as attended from the moment
a session starts.

Three further decisions were settled on 2026-09-23: the Review entry
appears Sunday and Monday with Week carrying a permanent route into the
previous week's Review, Capture's chips are every area in the Areas order,
and Home's absence note is one sentence naming the absent areas.

Twenty-five of the twenty-six new strings are approved and recorded in the
spec's §"Screen copy". The list closed at twenty-one before
`/speckit-analyze`, because removing an area with neither tasks nor past
sessions is its own case, which the pending list had missed. Five were added
after that pass and approved on 2026-09-23: Home's tending clause, Review's
three open-session forms, and the Picker's consequence line — the last of
which is the one still awaiting approval.

Two items that were more than wording are both settled. Home's absence note
becomes one sentence naming the areas, with a joining rule now in FR-022b.
And Week's `Look back on last week` passes Article III's addition test on
its merits — setting this week's rhythm without seeing the last one is
deciding blind — so it is recorded as passing rather than as an exception.

One item gates part of implementation and is recorded in the spec's
§"Open": the Picker's consequence line,
`A session on {task} is still running. Starting here closes it.`, is
written down with its rules and is not yet approved. FR-027 holds T002a and
T025a until it is. **Nothing else gates planning or implementation.**
