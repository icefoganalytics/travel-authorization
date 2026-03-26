# AI Agents & Workflows

This directory contains AI workflows and planning documents for TravelAuth.

## Important

Directory READMEs under `agents/` are primarily discovery documents.

Agents should use these READMEs to find relevant workflows or plans, then read the underlying files
directly. The individual workflow and plan files are the source of truth for task-specific
instructions.

## Directory Structure

```text
agents/
├── README.md
├── workflows/
│   ├── README.md
│   └── *.md
└── plans/
    └── *.md
```

## Workflows

Workflows are AI-readable documents that guide coding assistants through complex, multi-step tasks.
They typically include step-by-step instructions, implementation checklists, examples, and testing
guidance.

Use [workflows/README.md](./workflows/README.md) to discover the right workflow, then read the
actual workflow file before acting.

For pull request work, agents should usually use:

- `pull-request-management.md` for PR title and body structure
- the project conventions in [AGENTS.md](../AGENTS.md) for testing instructions and code style

## Plans

Plans are implementation documents that outline the steps to implement a feature or fix. They are
useful for larger efforts that need problem framing, staged rollout notes, schema planning, or open
questions captured in one place.

Use [plans/README.md](./plans/README.md) for naming and structure guidance before creating a new
plan.

## Best Practices

1. Keep `agents/workflows/*.md` as the single source of truth for workflow behavior.
2. Treat directory READMEs as indexes, not full task instructions.
3. Use descriptive workflow names.
4. Update `agents/workflows/README.md` when adding a workflow.
5. Create new dated plan files instead of overwriting older implementation plans.
