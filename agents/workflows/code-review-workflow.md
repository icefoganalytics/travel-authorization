---
description: Review TravelAuth TypeScript changes for correctness, maintainability, and project conventions
---

# Code Review Workflow

Use this workflow when reviewing a branch, pull request, or local diff. Lead with concrete bugs,
regressions, missing tests, and maintainability risks. Style comments are only worth raising when
they affect clarity, consistency, or future safety.

## Review Steps

1. **Understand the scope**

   - Read the request, issue, PR body, or plan.
   - Check `git status` and the changed files.
   - Identify whether the change is backend, frontend, migration, test-only, documentation-only, or
     cross-cutting.

2. **Check behavior and contracts**

   - Verify controllers return the serializer shape expected by frontend API types.
   - Confirm create, update, and show responses reload required associations before serialization.
   - Check policies and scopes for access leaks, missing admin handling, or over-restrictive joins.
   - For migrations, confirm up/down paths, data preservation, and nullable/default behavior.

3. **Check TypeScript strictness**

   - No `any`, `@ts-ignore`, `@ts-expect-error`, or non-null assertions.
   - Use explicit guards, optional chaining, and nullish coalescing where data can be missing.
   - Prefer existing API response, serializer, and composable types over local one-off shapes.

4. **Check frontend behavior**

   - Verify route placement, layout nesting, breadcrumbs, and return paths match the intended flow.
   - Confirm loading state is based on data presence where practical.
   - Check form refs use Vuetify 3 patterns, including `submit()` and `useTemplateRef()` where
     applicable.
   - Ensure route-query state uses unique suffixes when multiple tables or dialogs share a page.

5. **Check tests**

   - Tests should mirror source structure and use `test`, not `it`.
   - Tests should include `// Arrange`, `// Act`, and `// Assert`.
   - Prefer Fishery factories for data setup.
   - Keep assertions focused; combine related state checks into one `toEqual` when that gives a
     clearer failure.
   - Use `expect(spy).not.toHaveBeenCalled()` for negative spy assertions.

6. **Check simplicity**
   - Flag new helpers, abstractions, options, or comments that do not solve a real current problem.
   - Prefer local fixes over broad refactors when the requested change is narrow.
   - Confirm old code was deleted when a replacement makes it unreachable.

## Output Format

List findings first, ordered by severity. Each finding should include a file and line reference,
the risk, and the concrete fix.

```text
[severity] Short finding title
File: path/to/file.ts:42
Risk: What can break or mislead users/developers.
Fix: One concrete change.
```

After findings, include open questions or assumptions. If there are no findings, say that clearly
and mention any test gaps or residual risk.

## Related Workflows

- [`./pull-request-management-workflow.md`](./pull-request-management-workflow.md) - Create and update pull requests
- [`./testing-instructions-workflow.md`](./testing-instructions-workflow.md) - Generate reviewer-friendly validation
  steps
