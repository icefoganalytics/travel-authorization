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
├── plans/
│   └── *.md
├── references/
│   ├── README.md
│   └── *.md
├── templates/
│   ├── README.md
│   └── *.md
└── workflows/
    ├── README.md
    └── *.md
```

## Workflows

Workflows are process guidance — step-by-step instructions for complex, multi-step tasks. They cover
the "how": conversion patterns, review checklists, PR structure, testing instructions.

Use [workflows/README.md](./workflows/README.md) to discover the right workflow, then read the
actual workflow file before acting.

For pull request work, agents should usually use:

- `pull-request-management-workflow.md` for PR title and body structure
- `testing-instructions-workflow.md` for detailed, reviewer-friendly validation steps
- the project conventions in [AGENTS.md](../AGENTS.md) for code style and broader repo rules

## Templates

Templates show the "what" — end-state code examples for recurring patterns (serializers, factories,
API modules, dialogs). They are the concrete output a workflow should produce.

Use [templates/README.md](./templates/README.md) to discover the available templates, then read the
actual template file before using it.

Together, **workflows + templates replace what other tools call "skills"**: process in the workflow,
end state in the template.

## References

References augment or correct the model's knowledge with project-specific facts. They are not
process (workflows) or output (templates) — they are pure "know this" content for topics the model
gets wrong or doesn't know at all.

Examples:
- A tool that renamed itself after the model's training cut-off.
- A project-specific convention that varies from the default.
- A lookup pattern (e.g., "how to find a GitHub issue number by topic").

Reference files are expected to become obsolete as models improve. Delete them when the model no
longer needs the hint.

Use [references/README.md](./references/README.md) for detailed guidance, then read the individual
reference file whose topic matches your current task.

## Plans

Plans are a separate category — exploratory, multi-phase implementation documents. They are not
workflows or templates. Plans frame the problem, stage the rollout, and capture schema decisions
before any code is written.

Use [plans/README.md](./plans/README.md) for naming and structure guidance before creating a new
plan.

## Best Practices

1. Keep `agents/workflows/*.md` as the single source of truth for workflow behavior.
2. Treat directory READMEs as indexes, not full task instructions.
3. Use descriptive workflow names.
4. Create new dated plan files instead of overwriting older implementation plans.
5. Prefer discovery guidance over static file inventories in directory READMEs.
6. Delete reference files when the model no longer needs them — they are temporary by design.
