# Services

Load the direct [packaged backend workflow](skill://express-light-rail/workflow.md) and its linked [code-organization reference](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/code-organization-reference.md) before this local overlay. Other clients use the [corresponding backend workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/express-light-rail-backend-workflow.md) in their verified release. The root [shared-source contract](../../../AGENTS.md#shared-standards-and-local-authority) governs availability and conflicts; project-local service and data-access conventions remain authoritative.

## Local Pattern

- Put reusable or multi-step business logic in services that extend `BaseService`.
- Implement the action as an instance `perform()` method. `BaseService.perform(...)` constructs the
  service with the supplied arguments and invokes that instance method.
- Call action services through `ServiceName.perform(...)`; do not instantiate them at call sites.
- Keep controllers focused on request orchestration, authorization, status codes, and response shape.
- Organize related action services under domain directories and export them through the existing
  service index files.

For example, [`BulkGenerateService`](./estimates/bulk-generate-service.ts) receives its arguments
through the inherited static `perform()` method, then performs the work in its instance method.

## IndexService Pattern

For paginated list endpoints that include summary aggregates, use an `IndexService`.

See the local [IndexService template](../../../agents/templates/backend-index-service-template.md).

Key points:

- Accept `where`, `scopes`, `order`, `limit`, `offset`, and `currentUser` in the constructor.
- Call `Model.count()` and `Model.findAll()` through the scoped model returned by
  `Policy.applyScope`.
- Compute summaries through a separate `computeSummaries()` → `compute{Summary}()` pipeline.
- When a policy scope produces a JOIN, use `.aggregate()` with `includeIgnoreAttributes: false`,
  `plain: true`, and `?? 0`, following the local template.
