# Plans

This directory contains implementation planning documents for the TravelAuth project.

## Available Plans

See this directory for available plans. Plans are created as needed for complex implementation work
and follow the naming convention: `Type, Title, Date.md`.

## Using Plans

Plans are created when implementation requires analysis, staged rollout thinking, multiple options,
or cross-cutting decisions.

Example:

```text
Create a plan for completing Issue 314 and save it to agents/plans/
```

See parent [agents/README.md](../README.md) for general AI workflow documentation.

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

