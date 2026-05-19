# Services

Services provide a place to put logic for model create/read/update/delete (CRUD) actions.
If the codebase isn't using an object relational mapper (ORM), such as Sequelize, they also provide a pattern for model retrieval and lookups.

A standard usage example might look like this:

```typescript
class FormsController {
  create() {
    return FormService.create(this.request.body, this.currentUser)
      .then((form) => {
        return this.response.status(201).json({ form })
      })
      .catch((error) => {
        return this.response.status(422).json({ message: `Form submission failed: ${error}` })
      })
  }
}
```

In the above example, the controller handles the mapping of the action, while the actual model changes occur in the service.

The service should, for convenience, expose static methods, that call internal instance methods.

## Local Pattern

- Business logic belongs in services that extend `BaseService`.
- Call services via static methods such as `ServiceName.perform(args)`.
- Do not instantiate services directly at call sites.
- Services may call other services; keep controllers focused on request orchestration.

## Scaling

A pattern that supports very good scaling is to have per-action classes.

e.g.

```bash
services/
|-- index.ts
|-- estimates/
    |-- index.ts
    |-- bulk-generate.ts
```

With a class like

```typescript
// services/estimates/bulk-generate.ts
export class BulkGenerate extends BaseService {
  private formId: number

  constructor(formId: number) {
    super()
    this.formId = formId
  }

  static async perform(formId: number): Promise<Expense[]> {
    const instance = new this(formId)
    return instance.perform()
  }

  async perform(): Promise<Expense[]> {
    // some action
  }
}
```

Exported in estimates as:

```typescript
// services/estimates/index.ts
export * from "./bulk-generate"
```

Imported in services as

```typescript
// services/index.ts
// Namespaced services
export * as estimates from "./estimates"
```

The usages of this would be

```typescript
import { BulkGenerate } from "@/services/estimates"
// OR import { estimates } from "@/services"

export class GenerateController extends BaseController {
  async create() {
    return BulkGenerate.perform(this.formId).then((estimates) => {
      // OR estimates.BulkGenerate.perform
      return this.response.status(201).json({
        estimates,
        message: "Generated estimates",
      })
    })
  }
}
```
