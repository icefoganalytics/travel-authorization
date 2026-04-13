# Templates

This directory contains reusable AI-oriented documentation templates for TravelAuth.

## Discovering Templates

Do not rely on a static index here — it goes stale. Instead, list the directory directly:

```bash
ls agents/templates/*.md
```

Then read any template file that looks relevant before acting. The template file itself is the
authoritative instruction set — do not rely on summaries.

## Template vs Workflow Separation

**Templates** should contain specific code examples showing what the final result should look like (e.g., what a TypeScript API file structure looks like).

**Workflows** (in `agents/workflows/`) should contain conversion patterns and process instructions (e.g., "start with this JavaScript file, follow these steps, reference this template").

When creating new documentation:
- Put end-state code examples in `agents/templates/`
- Put conversion patterns and process steps in `agents/workflows/`
- Reference templates from workflows: "See template: `backend-index-serializer.md`"

## Using Templates

Templates are useful when a task follows a repeated local pattern and benefits from a proven shape.

Example:

```text
Follow the template in agents/templates/fishery-factory.md
to add a new factory under api/tests/factories/.
```

See parent [agents/README.md](../README.md) for the broader agents directory overview.
