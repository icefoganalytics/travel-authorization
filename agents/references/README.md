# References

This directory holds source-of-truth notes for things the model should know in addition to, or instead of, its default knowledge.

## Purpose

Model knowledge has two limitations that this directory addresses:

1. **Gaps** — things too project-specific or niche to be in training data (e.g., "this project uses `gh` for GitHub operations").
2. **Staleness** — things the model knows, but wrongly (e.g., a tool that renamed itself after the training cut-off).

A reference file corrects or augments the model's knowledge on a single topic. It is not a workflow (multi-step process) or a template (code output) — it is pure "know this" content.

## When to Add a Reference

Add a file here when:

- A model makes the same factual error twice (e.g., wrong tool name, wrong default value).
- The project relies on a specific tool or convention unlikely to be in general training data.
- You want to override a model's default assumption with project-specific truth.

Correction references are expected to become obsolete as future models absorb the corrected fact. When that happens, delete the file.

## Discovering References

List the directory to find relevant topics:

```bash
ls agents/references/*.md | grep -v README
```

Read any file whose topic matches your current task.

## Creating a Reference

- One file per topic.
- Name it with a dash-separated slug describing the fact (e.g., `gh-issue-search.md`, `editor-env-var-names.md`).
- State the fact clearly and concisely. Include context, rationale, and a concrete example.
- Link to external source if one exists (docs, issue, PR).

See parent [agents/README.md](../README.md) for the broader agents directory overview.
