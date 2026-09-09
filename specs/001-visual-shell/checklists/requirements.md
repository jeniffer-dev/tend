# Specification Quality Checklist: Visual shell

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-09
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

## Constitution alignment *(project-specific)*

- [x] Article III — every screen states its one question before any component
- [x] Article III — Home is actionable in one tap and carries nothing else
- [x] Article I — no streaks, badges, levels or pressure framing (FR-005)
- [x] Article I — nothing blocks; the exceeded area stays tappable (FR-006, edge cases)
- [x] Article II — forbidden lexicon excluded (FR-026); the one violation found (`Done` on Area edit) was resolved as Q1, not shipped
- [x] Article IV — 44x44px minimum stated as a requirement (FR-007) and a criterion (SC-003)
- [x] Article V — no spinners, no urgency, no celebration (FR-006, US1 scenario 4)
- [x] Article VI — no calculation in this feature at all (FR-002)
- [x] Article VII — acceptance criteria are observable and verified at 390px, plus 320px as requested

## Validation results

**Iteration 1 — 2026-09-09.** 17 of 18 passed. One item failed: three
clarifications open (Q1, Q2, Q3). All three were contradictions *inside the
approved design artifacts*, not gaps in the description, so none had a
defensible default.

No other item required a spec change. Requirements were written testable on
the first pass because the design file settles the visual questions that
would otherwise be ambiguous.

**Iteration 2 — 2026-09-09. All 18 pass.** The three clarifications were
resolved by the user:

| # | Contradiction | Resolution |
|---|---|---|
| Q1 | Area edit's `Done` violated Article II and duplicated the footer | `Back to areas`; footer trimmed to `Changes apply as you make them.` |
| Q2 | Two past-zero session notes in the same design file | The artboard string stands; the script's variant was scaffolding |
| Q3 | Home claimed People was on the week list; Week omitted it | Week unchanged; Home's absence note rewritten (option A) |

The Q3 replacement is the only string in the feature that is not
transcribed from the design file. It is recorded in spec.md §"The one
string that is not transcribed", with the reasoning for the wording.

**Iteration 3 — 2026-09-09, after `/speckit-clarify`. All 18 still pass.**
The scan found one genuinely unresolved area — navigation — which the
design file does not describe at all (it contains no links between
screens). Resolving it surfaced two further gaps:

| Found | Resolution |
|---|---|
| No route to Areas, and no back rule | FR-028 – FR-031. Areas opens from the two rhythm links already drawn; every non-Home screen returns to its opener; Home is the root |
| First run had no path to Areas — Week and Review are empty at that point | FR-032. `Name your first area` opens the empty Area edit and lands on Areas, which is a root in that case |
| The empty Area edit state is not drawn anywhere in the design | FR-033 plus a copy note. Defaults taken from the prototype script in the design file, not invented |

Also corrected during the scan: the Area edit name field carries
`Morning pages` as a **value**, not only as a placeholder. The first
transcription recorded only the placeholder, which made the drawn screen
look like the creating state when it is the editing state.

All other taxonomy categories came back Clear. Performance, scalability,
reliability, observability, security and integrations are inapplicable —
no network, no storage, no accounts.

**Status: ready for `/speckit-plan`.**

## Notes

- Q1 was raised by the user in the feature description. Q2 and Q3 were found while transcribing the copy — which is the argument for transcribing copy into the spec rather than pointing at the design file.
- `docs/design/Tend.dc.html` still carries the superseded Q1 and Q2 strings. It is a design artifact, not a build input; the spec is what implementation follows. Updating it is optional and belongs in its own commit.
- There is no Learning area. Five areas: Morning pages, Health, Home, People, Money — one of them (People) non-daily.
- One assumption carries into feature 002 and should not be lost: the design counts the weekly rhythm in **sessions**, while `docs/PRODUCT-SPEC.md` §3.1 types it as `weekly_budget_minutes`. Feature 001 computes nothing, so nothing breaks yet. The product spec needs an amendment before the domain is built.
