---
description: Walk through creating an implementation plan that lives in agents/plans/. Use when asked to write, review, or revise a plan for complex multi-step work.
---

# Create a Plan

Implementation plans live in [`agents/plans/`](../plans/) and are working documents for engineers or coding agents. They should help the reader complete the work safely and incrementally — not serve as stakeholder narratives or business cases.

## When to Create a Plan

Create a plan when the work requires:

- **Analysis** — multiple approaches to evaluate before deciding
- **Staged rollout** — ordering dependencies and slicing into independent batches
- **Cross-cutting decisions** — schema, API, or UI choices that affect multiple subsystems
- **Migration strategy** — old-to-new state transitions with cleanup

Do NOT create a plan for a single file change, a straightforward bug fix, or anything a single PR can handle.

## Plan Structure

Every plan should follow this shape:

```markdown
# Plan: [Descriptive Title]

- **Source**: [Link to the originating issue or PR]

## Problem Statement
[What problem or opportunity — keep this brief, just enough to justify the work]

## Current State Analysis
**Already Implemented:**
- [What exists today]

**Not Yet Implemented:**
- [Gap bullets]

## Key Findings
1. [Insights from exploring the codebase]

## Recommended Solution

### Phase 1: [Phase Name]
**Implementation:** [Concrete code steps]
**Benefits:** [Why this phase matters]

## Decision Factors
1. [Trade-offs that drove the recommendation]

## Recommended Action
[Ordered next steps]

## Files To Review
1. `path/to/file` - [What to check]

## Out Of Scope
- [Specifically excluded items]

## Related Issues
- [Issue links]
```

## Principles

- **Programmer-facing.** Describe concrete code changes, rollout slices, validation steps, and cleanup. Keep business context brief — just enough to explain why the implementation matters. Avoid stakeholder-friendly narratives, roadmap prose, and status-report docs.
- **Sliceable.** Break work into phases that can land, be reviewed, and be verified independently. Group by dependency direction or subsystem boundaries, not by arbitrary file counts. Make it clear what can ship now, what depends on earlier slices, and what should be deleted instead of migrated.
- **Current.** Update the plan as slices land so the remaining scope stays concise and accurate. End the plan with cleanup work for temporary scaffolding, compatibility code, or migration-only docs.
- **Minimal.** Include only what helps complete the work. Less is more. Prefer removing unnecessary steps, scaffolding, and stale scope over expanding forever.
- **Preserve hard-to-rediscover references.** Keep known-good inputs, verified sample values, or validated domain references when they materially help future work.

## Source Link

Every plan must link to its originating issue or PR at the top, right after the title. This makes the plan discoverable from both the issue tracker and the codebase:

```markdown
# Plan: Some Title

- **Source**: [Issue #123: Short Description](https://github.com/icefoganalytics/travel-authorization/issues/123)
```

## Naming Convention

```
Type, Title, Date.md
```

- Commas separate the three components.
- ISO dates (`YYYY-MM-DD`).
- Descriptive title — no abbreviations.
- Prefer `Plan` when the work does not fit a narrower category.
- Create a new dated file for new work; only update an existing file if the plan is evolving in place.

## Verification

After writing a plan, verify it against the codebase:
- Do the referenced files and paths actually exist?
- Are statuses, model fields, and component imports verified against the current code?
- Are the suggested status enum values actually present or confirmed missing?
- Do the phase dependencies form a valid topological order (no phase requires output from a later phase)?
