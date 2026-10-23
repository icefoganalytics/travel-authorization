---
description: Review TravelAuth TypeScript changes for correctness, maintainability, and project conventions
---

# Code Review Workflow

Use the [shared code-review workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/code-review-workflow.md) for scope discovery, evidence-first findings, simplicity review, and the findings/location/risk/fix output contract. Apply the TravelAuth checks below alongside [AGENTS.md](../../AGENTS.md); local conventions remain authoritative where the shared default differs.

## TravelAuth Contract Checks

- **Backend:** Check resource-scoped policies, collection scopes, and serializer shapes against frontend API types. Create/update/show responses must load required associations before serialization. Follow the [controller](../../api/src/controllers/README.md), [policy](../../api/src/policies/README.md), and [serializer](../../api/src/serializers/README.md) contracts.
- **Database:** Preserve PostgreSQL/Knex migration up/down behavior, existing data, nullable/default semantics, and Sequelize model mapping. Shared backend concepts do not authorize replacing local bases or upgrading dependencies.
- **TypeScript:** Keep the root prohibition on `any`, `@ts-ignore`, `@ts-expect-error`, and non-null assertions, including its explicit backend permission boundary. Prefer existing API/serializer/composable types and real narrowing.
- **Frontend:** Check route/layout nesting, breadcrumbs, return paths, data-presence loading, Vuetify 3 form refs (`submit()` and `useTemplateRef()` where applicable), and unique route-query suffixes for co-located tables/dialogs. Use the [component overlay](../../web/src/components/README.md).
- **Tests:** Follow [API](../../api/tests/README.md) or [UI](../../web/tests/README.md) conventions for mirrored source paths, nested `describe`, `test`, Arrange/Act/Assert comments, Fishery setup, direct assertions, and automatic mock cleanup. Keep negative spy assertions as `not.toHaveBeenCalled()`. The API's direct status/body pair and UI's one-direct-expect convention remain distinct; do not silently replace either with shared defaults.

[Draft #394](https://github.com/icefoganalytics/travel-authorization/pull/394) also changes the test-review wording. Preserve its direct returned-value/persisted-record assertion intent and separate independent outcomes; do not reintroduce the generic review body when integrating that branch.

## Related Workflows

- [Pull request overlay](pull-request-management-workflow.md): description, metadata, draft/readiness, and evidence placement.
- [Testing instructions](testing-instructions-workflow.md): TravelAuth setup and reproducible validation steps.
