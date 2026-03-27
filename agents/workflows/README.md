# Workflows

This directory contains reusable AI workflows for the Travel Authorization system.

## Important

This file is an index, not the source of truth for workflow behavior.

Agents should use this README to discover relevant workflow files, then read the actual `*.md`
workflow files directly before acting. Do not rely on the summaries in this file alone for
implementation details, constraints, or required steps.

## Available Workflows

| Workflow | Description |
| --- | --- |
| [pull-request-management.md](./pull-request-management.md) | Create and edit well-structured pull requests following TravelAuth conventions |
| [testing-instructions.md](./testing-instructions.md) | Generate comprehensive testing instructions for pull requests |
| [github-issue-creation.md](./github-issue-creation.md) | Create well-structured GitHub issues using the project templates |
| [convert-js-api-to-typescript.md](./convert-js-api-to-typescript.md) | Convert JavaScript API client files to TypeScript |
| [convert-js-singular-composable-to-typescript.md](./convert-js-singular-composable-to-typescript.md) | Convert singular composables to TypeScript |
| [convert-js-plural-composable-to-typescript.md](./convert-js-plural-composable-to-typescript.md) | Convert plural composables to TypeScript |
| [convert-dialog-table-to-page-pattern.md](./convert-dialog-table-to-page-pattern.md) | Convert dialog-table flows to page-based edit patterns |

## Using Workflows

After identifying a relevant workflow here, read that workflow file end-to-end and follow the
workflow file itself as the authoritative instruction set.

For pull request tasks, agents should usually use
[pull-request-management.md](./pull-request-management.md) together with
[testing-instructions.md](./testing-instructions.md).

Example:

```text
Follow the workflow in agents/workflows/pull-request-management.md
to create a PR for my changes.
```

Example:

```text
Follow the workflow in agents/workflows/convert-js-api-to-typescript.md
to convert web/src/api/travel-desk-rental-cars-api.js to TypeScript.
```

See parent [agents/README.md](../README.md) for the broader agents directory overview.
