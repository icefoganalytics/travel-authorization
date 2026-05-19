# Controllers

These files map api routes to services.
See https://guides.rubyonrails.org/routing.html#crud-verbs-and-actions

e.g.

```typescript
router.route("/api/forms").post(FormsController.create)
```

maps the `/api/forms` POST endpoint to the `FormsController#create` instance method.

Controllers are advantageous because they provide a suite of helper methods to access various request methods. .e.g. `currentUser`, or `params`. They also provide a location to perform policy checks.

Controllers should implement the BaseController, and provide instance methods.
The `BaseController` provides the magic that lets those methods map to an appropriate route.

## Local Pattern

- RESTful controllers extend `BaseController`.
- Standard CRUD actions are `index()`, `show()`, `create()`, `update()`, and `destroy()`.
- Routes follow the usual resource shape: `GET /api/resources`, `GET /api/resources/:id`,
  `POST /api/resources`, and so on.
- Controllers coordinate requests, policy checks, service calls, and serializer responses.
- Authorization uses `this.buildPolicy()` and policy scopes.
- Serializers format returned records instead of returning raw Sequelize models when association
  data is part of the response.

## Response Pattern

- Return policy information in create/update responses when callers need it: `{ record, policy }`.
- When create/update/show responses need association data beyond the base model, reload with the
  required includes and serialize the response.
- Log real failures with structured error context:
  ``logger.error(`Failed to [action] [resource]: ${error}`, { error })``.
- Use consistent error messages: `"Failed to [action] [resource]: ${error}"`.

## Namespacing

If you need an action that generates estimates for a given form, a POST route `/api/forms/:formId/estimates/generate` is the best way to avoid future conflicts and refactors. To implement this you need to "namespace/modularize" the controller. Generally speaking, it is more flexible to keep all routes as CRUD actions, and nest controllers as needed, than it is to add custom routes to a given controller.

e.g. `Forms.Estimates.GenerateController.create` is preferred to `FormsController#generateEstimates` because once you start using non-CRUD actions, your controllers will quickly expand beyond human readability and comprehension. Opting to use PascalCase for namespaces as that is the best way to avoid conflicts with local variables.

This is how you would create a namespaced controller:

```bash
api/
|-- src/
|   |-- controllers/
|       |-- forms/
|           |-- estimates/
|               |-- generate-controller.ts
|       |-- index.ts
```

```typescript
// api/src/controllers/forms/estimates/generate-controller.ts
import BaseController from "@/base-controller"

export class GenerateController extends BaseController {
  static create() {
    // Logic for generating estimates here...
  }
}
```

```typescript
// api/src/controllers/forms/estimates/index.ts
export { GenerateController } from "./generate-controller"
```

```typescript
// api/src/controllers/forms/index.ts
export * as Estimates from "./estimates"
```

```typescript
// api/src/controllers/index.ts
export * as Forms from "./forms"
```

```typescript
// api/src/routes/index.ts
import { Router } from "express"

import { Forms } from "@/controllers"

const router = Router()

router.post("/api/forms/:formId/estimates/generate", Forms.Estimates.GenerateController.create)
```
