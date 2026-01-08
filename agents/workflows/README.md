# Workflows

This directory contains reusable AI workflows for the Travel Authorization system.

## Available Workflows

### [convert-js-api-to-typescript.md](convert-js-api-to-typescript.md)

Complete workflow for converting JavaScript API client files to TypeScript.

**Includes:**
- Import updates with base-api types
- Object.freeze to enum conversion
- Type definitions from backend models
- WhereOptions, FiltersOptions, QueryOptions setup
- Method parameter and return type annotations
- Backward compatibility patterns

**Reference Files:** `travel-desk-flight-requests-api.ts`, `expenses-api.ts`, `per-diems-api.ts`

---

## Using Workflows

Workflows are designed to be used with AI coding assistants like Claude or Windsurf.

**Example:**
```
Follow the workflow in agents/workflows/convert-js-api-to-typescript.md
to convert web/src/api/travel-desk-rental-cars-api.js to TypeScript.
```

See parent [agents/README.md](../README.md) for setup instructions.

---

**Last Updated:** 2026-01-08
