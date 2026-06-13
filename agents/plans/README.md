# Plans

This directory contains implementation planning documents for the TravelAuth project.

## Discovering Plans

List the directory to see available plans:

```bash
ls agents/plans/*.md | grep -v README
```

Then read any plan that matches the scope of the work.

## Creating a Plan

Follow the [create-a-plan-workflow](../workflows/create-a-plan-workflow.md) for guidance on writing,
structuring, and naming a new plan.

## Source Link

Every plan must link to its originating issue or PR at the top, right after the title heading.
This keeps the plan discoverable from both the issue tracker and the codebase:

```markdown
# Plan: Some Title

- **Source**: [Issue #123: Short Description](https://github.com/icefoganalytics/travel-authorization/issues/123)
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

See parent [agents/README.md](../README.md) for the broader agents directory overview.

Do not overwrite this README when creating a new plan unless the request is specifically about
updating plan-directory documentation.
