# Controllers

Controllers connect Express routes to request handling and response shaping. Load the direct [packaged backend workflow](skill://express-light-rail/workflow.md) before this local overlay. Other clients use the [corresponding backend workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/express-light-rail-backend-workflow.md) in their verified release. Follow the root [shared-source and local-precedence contract](../../../AGENTS.md#shared-standards-and-local-authority), not a selector that can re-enter local workflow selection.

`BaseController` exposes static route-handler accessors such as `.index` and `.create`. Each
accessor constructs a controller instance and calls its matching instance action method. Route
handlers therefore use `Controller.create`, while controller classes implement `async create()`.

## Local Pattern

- RESTful controllers extend `BaseController`.
- Standard CRUD actions are `index()`, `show()`, `create()`, `update()`, and `destroy()`.
- Routes follow the usual resource shape: `GET /api/resources`, `GET /api/resources/:id`,
  `POST /api/resources`, and so on.
- Controllers coordinate requests, policy checks, service calls, and serializer responses.
- Authorization uses `this.buildPolicy()` and policy scopes.
- Record construction for state-dependent checks follows the
  [policy record-context contract](../policies/README.md#state-dependent-policies).
- Serializers format returned records instead of returning raw Sequelize models when association
  data is part of the response.

## Response Pattern

- Return policy information in create/update responses when callers need it: `{ record, policy }`.
- When create/update/show responses need association data beyond the base model, reload with the
  required includes and serialize the response.
- Log real failures with structured error context:
  ``logger.error(`Failed to [action] [resource]: ${error}`, { error })``.
- Use consistent error messages: `"Failed to [action] [resource]: ${error}"`.

## Namespaced Actions

Keep custom resource actions in nested controllers with resource-shaped routes instead of adding
custom methods to a parent controller. For example, the existing estimate-generation action lives
in [`GenerateController`](./travel-authorizations/estimates/generate-controller.ts) and is routed
through the `TravelAuthorizations.Estimates` namespace:

```typescript
router
  .route("/api/travel-authorizations/:travelAuthorizationId/estimates/generate")
  .post(TravelAuthorizations.Estimates.GenerateController.create)
```

The controller implements this as an instance `async create()` method; `BaseController.create`
provides the static route-handler accessor. Preserve the PascalCase namespace re-exports through
`api/src/controllers/index.ts`, `api/src/controllers/travel-authorizations/index.ts`, and
`api/src/controllers/travel-authorizations/estimates/index.ts`.
