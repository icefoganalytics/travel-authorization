# Templates

This directory contains reusable AI-oriented documentation templates for TravelAuth.

## Discovering Templates

Do not rely on a static index here — it goes stale. Instead, list the directory directly:

```bash
ls agents/templates/*.md
```

Then read any template file that looks relevant before acting. The template file itself is the
authoritative instruction set — do not rely on summaries.

## Using Templates

Templates are useful when a task follows a repeated local pattern and benefits from a proven shape.

Example:

```text
Follow the template in agents/templates/fishery-factory.md
to add a new factory under api/tests/factories/.
```

```text
Use the agents/templates/typescript-migration-slice.md template to
document the batch of files being converted in this PR.
```

See parent [agents/README.md](../README.md) for the broader agents directory overview.
