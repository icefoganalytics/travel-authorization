# Plans

This directory contains implementation planning documents for the TravelAuth project.

## Available Plans

See this directory for available plans. Plans are created as needed for complex implementation work
and follow the naming convention: `Type, Title, Date.md`.

## Using Plans

Plans are created when implementation requires analysis, staged rollout thinking, multiple options,
or cross-cutting decisions.

Plans in this repo are programmer-facing working documents, not business cases or product briefs.
They should help an engineer or coding agent complete the work safely and incrementally.

Write plans in task-focused language:

- Describe concrete code changes, rollout slices, validation steps, and cleanup work
- Prefer implementation constraints, dependency ordering, and file-level review notes
- Keep business context brief and only include enough to explain why the implementation matters
- Avoid turning plans into stakeholder-friendly narratives, roadmap prose, or status-report docs

Plans should also be executable in coherent slices. Large migrations in this repo, including the
Vue 3 migration work reflected in commit history, were completed by repeatedly narrowing the plan to
the next set of well-bounded tasks rather than carrying one giant checklist forever.

When planning a large migration or refactor:

- Break work into slices that can be implemented, reviewed, and verified independently
- Group slices by dependency direction or subsystem boundaries, not by arbitrary file counts
- Make it clear what can ship now, what depends on earlier slices, and what should be deleted
  instead of migrated
- Update the plan as slices land so the remaining work stays concise and current
- End the plan with cleanup work for temporary migration scaffolding, compatibility code, or
  migration-only docs when applicable

Example:

```text
Create a plan for completing Issue 314 and save it to agents/plans/
```

See parent [agents/README.md](../README.md) for general AI workflow documentation.

Do not overwrite this README when creating a new plan unless the request is specifically about
updating plan-directory documentation.

## Plan Structure

All plans should generally follow this shape:

```markdown
# Plan: [Descriptive Title]

## Problem Statement
[Clear description of the problem or opportunity]

## Current State Analysis
**Already Implemented:**
- [Current state bullets]

**Not Yet Implemented:**
- [Gap bullets]

## Key Findings
1. [Finding 1]
2. [Finding 2]

## Recommended Solution

### Phase 1: [Phase Name]
**Implementation:**
- [Steps]
**Benefits:**
- [Benefits]

## Decision Factors
1. [Factor 1]
2. [Factor 2]

## Recommended Action
[Specific recommendation with next steps]

## Files To Review
1. `path/to/file1` - [What to check]

## Out Of Scope
- [Out-of-scope items]

## Related Issues
- [Issue links]
```

## File Naming Convention

**Format:** `Type, Title, Date.md`

Examples:

- `Plan, Travel Desk Flight Segment Cost Tracking and Invoice Generation, 2026-03-26.md`
- `Implementation Plan, Stop-Based Travel Segment Model Refactoring, 2025-12-18.md`

Rules:

- Use commas to separate the three components
- Use ISO dates (`YYYY-MM-DD`)
- Prefer a descriptive title over abbreviations
- Use `Plan` when the work does not fit a narrower category
- Prefer creating a new dated file over renaming or reusing an older plan unless the work is truly
  the same plan evolving in place

## Quality Bar

A good implementation plan should be:

- Programmer-facing: written for the person doing the code changes
- Task-focused: centered on implementation steps, validation, and cleanup
- Sliceable: broken into coherent batches that can land independently
- Current: updated as completed slices reduce the remaining scope
- Disposable when temporary: migration-only plans should be retired or replaced once the work is
  done
- Minimal: include only what helps complete the work; less is more
- Complete by subtraction: prefer plans that remove unnecessary steps, scaffolding, and stale scope
  instead of expanding forever
- Preserve hard-to-rediscover references: keep known-good inputs, verified sample values, and other
  durable implementation references when they materially help future work
