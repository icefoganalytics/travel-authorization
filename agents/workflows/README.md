# Workflows

This directory contains reusable AI workflows for the Travel Authorization system.

## Discovering Workflows

Do not rely on a static index here — it goes stale. Instead, list the directory directly:

```bash
ls agents/workflows/*.md
```

Then read any workflow file that looks relevant before acting. The workflow file itself is the
authoritative instruction set — do not rely on summaries.

## Using Workflows

After identifying a relevant workflow, read it end-to-end and follow it as the authoritative
instruction set.

Example:

```text
Follow the workflow in agents/workflows/pull-request-management-workflow.md
to create a PR for my changes.
```

```text
Follow the workflow in agents/workflows/convert-js-api-to-typescript-workflow.md
to convert web/src/api/travel-desk-rental-cars-api.js to TypeScript.
```

See parent [agents/README.md](../README.md) for the broader agents directory overview.
