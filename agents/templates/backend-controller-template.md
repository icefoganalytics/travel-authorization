# Controller Template

Controllers follow Rails-style RESTful conventions mapped to Express routes.

## Full CRUD Controller

Use for top-level resources that need the full set of list/show/create/update/delete actions.

```typescript
import { isNil } from "lodash"

import logger from "@/utils/logger"

import { SomeModel } from "@/models"
import { SomeModelPolicy } from "@/policies"
import {
  CreateService,
  UpdateService,
  DestroyService,
} from "@/services/some-models"
import { IndexSerializer, ShowSerializer } from "@/serializers/some-models"
import BaseController from "@/controllers/base-controller"

export class SomeModelsController extends BaseController<SomeModel> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([["createdAt", "DESC"]])
      const scopedModels = SomeModelPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedModels.count({ where })
      const models = await scopedModels.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      const serializedModels = IndexSerializer.perform(models, this.currentUser)
      return this.response.json({
        someModels: serializedModels,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching some models: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve some models: ${error}`,
      })
    }
  }

  async show() {
    try {
      const model = await this.loadModel()
      if (isNil(model)) {
        return this.response.status(404).json({
          message: "Some model not found.",
        })
      }

      const policy = this.buildPolicy(model)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this some model.",
        })
      }

      const serializedModel = ShowSerializer.perform(model, this.currentUser)
      return this.response.status(200).json({
        someModel: serializedModel,
        policy,
      })
    } catch (error) {
      logger.error(`Error fetching some model: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve some model: ${error}`,
      })
    }
  }

  async create() {
    try {
      const model = this.buildModel()
      const policy = this.buildPolicy(model)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create this some model.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newModel = await CreateService.perform(permittedAttributes, this.currentUser)
      const serializedModel = ShowSerializer.perform(newModel)
      return this.response.status(201).json({
        someModel: serializedModel,
      })
    } catch (error) {
      logger.error(`Error creating some model: ${error}`, { error })
      return this.response.status(422).json({
        message: `Some model creation failed: ${error}`,
      })
    }
  }

  async update() {
    try {
      const model = await this.loadModel()
      if (isNil(model)) {
        return this.response.status(404).json({
          message: "Some model not found.",
        })
      }

      const policy = this.buildPolicy(model)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this some model.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedModel = await UpdateService.perform(
        model,
        permittedAttributes,
        this.currentUser
      )
      const serializedModel = ShowSerializer.perform(updatedModel)
      return this.response.json({
        someModel: serializedModel,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating some model: ${error}`, { error })
      return this.response.status(422).json({
        message: `Some model update failed: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const model = await this.loadModel()
      if (isNil(model)) {
        return this.response.status(404).json({
          message: "Some model not found.",
        })
      }

      const policy = this.buildPolicy(model)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this some model.",
        })
      }

      await DestroyService.perform(model, this.currentUser)
      return this.response.status(204).end()
    } catch (error) {
      logger.error(`Error deleting some model: ${error}`, { error })
      return this.response.status(422).json({
        message: `Some model deletion failed: ${error}`,
      })
    }
  }

  private loadModel(): Promise<SomeModel | null> {
    return SomeModel.findByPk(this.params.someModelId, {
      include: ["association"],
    })
  }

  private buildModel() {
    const attributes = this.request.body
    const model = SomeModel.build(attributes)
    return model
  }

  private buildPolicy(record: SomeModel): SomeModelPolicy {
    return new SomeModelPolicy(this.currentUser, record)
  }
}

export default SomeModelsController
```

### Variations by action count

Not every CRUD action is needed. Pick only the actions the resource requires:

| Actions | Example | Pattern |
|---------|---------|---------|
| `index` only | `StopsController` | Read-only list, no serializers |
| `index` + `show` | `LocationsController`, `TravelPurposesController` | Read-only, no policy checks |
| `index` + `show` + `update` | `PerDiemsController`, `TravelAllowancesController` | Mutable, policy-gated |
| Full CRUD | `TravelAuthorizationsController`, `ExpensesController`, `GeneralLedgerCodingsController` | All five actions |

For read-only reference data with no authorization, skip the policy entirely and use `Model.withScope()` directly:

```typescript
const scopedModels = SomeModel.withScope(scopes)
```

## Stateful Action Controller

Use for workflow state transitions (submit, approve, deny, send-back, etc.). These live in subdirectories and implement only `create()`.

```typescript
import { isNil } from "lodash"

import logger from "@/utils/logger"

import { SomeModel } from "@/models"
import { SomeService } from "@/services/some-namespace"
import { SomePolicy } from "@/policies/some-namespace"
import { ShowSerializer } from "@/serializers/some-namespace"

import BaseController from "@/controllers/base-controller"

export class SomeController extends BaseController {
  async create() {
    try {
      if (isNil(this.params.someId)) {
        return this.response.status(404).json({
          message: "Missing some id param.",
        })
      }

      const record = await this.loadSomeRecord()
      if (isNil(record)) {
        return this.response.status(404).json({
          message: "Some record not found.",
        })
      }

      const policy = this.buildPolicy(record)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to perform this action.",
        })
      }

      const { someAttribute } = this.request.body
      const updatedRecord = await SomeService.perform(record, someAttribute, this.currentUser)
      const serializedRecord = ShowSerializer.perform(updatedRecord)

      return this.response.status(200).json({
        someRecord: serializedRecord,
      })
    } catch (error) {
      logger.error(`Failed to perform action: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to perform action: ${error}`,
      })
    }
  }

  private loadSomeRecord(): Promise<SomeModel | null> {
    return SomeModel.findByPk(this.params.someId, {
      include: ["association"],
    })
  }

  private buildPolicy(record: SomeModel): SomePolicy {
    return new SomePolicy(this.currentUser, record)
  }
}

export default SomeController
```

All stateful action controllers:
- Extend `BaseController` (no generic type parameter)
- Have only a `create()` method
- Route as `POST /api/:parentResource/:parentId/:action-name`
- Check `policy.create()` (not `policy.update()`)

## Sub-resource Controller

Use for managing join-table associations (add/remove related records). Route as nested under the parent resource.

```typescript
async create() {
  try {
    const parent = await this.loadParent()
    if (isNil(parent)) {
      return this.response.status(404).json({
        message: "Parent not found.",
      })
    }

    const child = await this.loadChild()
    if (isNil(child)) {
      return this.response.status(404).json({
        message: "Child not found.",
      })
    }

    const policy = this.buildPolicy(parent)
    if (!policy.update()) {
      return this.response.status(403).json({
        message: "You are not authorized to modify this parent.",
      })
    }

    await CreateService.perform(parent, child, this.currentUser)
    return this.response.status(201).end()
  } catch (error) {
    logger.error(`Failed to add child: ${error}`, { error })
    return this.response.status(422).json({
      message: `Failed to add child: ${error}`,
    })
  }
}
```

Policy is checked against the parent's `update()` permission — adding/removing a sub-resource is a modification to the parent.

## Download / File-serving Controller

For streaming binary content, `create()` delegates to `show()`:

```typescript
async create() {
  return this.show()
}

async show() {
  try {
    const record = await this.loadRecord()
    if (isNil(record)) {
      return this.response.status(404).json({ message: "Record not found." })
    }
    // ... policy check, load attachment ...
    const { name, content, mimeType } = attachment
    return this.response.status(200).type(mimeType).attachment(name).send(content)
  } catch (error) {
    logger.error(`Failed to download file: ${error}`, { error })
    return this.response.status(422).json({ message: `Download failed: ${error}` })
  }
}
```

## Pattern Rules

- Use `try/catch` with intermediate variables, not `.then()/.catch()` chaining.
- Validate required params early with guard clauses.
- Each step produces an intermediate variable (record, policy, updatedRecord, serializedRecord).
- Use `import BaseController from "@/controllers/base-controller"` (default import).
- Log real failures with `logger.error()` with structured error context before returning the error response.
- Error catch block returns `status(422)` for mutation actions (create/update/destroy), `status(400)` or `status(500)` for read actions (index/show).
- Return `201` for create, `204` (with `.end()`) for destroy, `200` for everything else.
- Use `policy.permitAttributesForCreate()` / `policy.permitAttributesForUpdate()` to filter request body to permitted attributes.
- Include `policy` in the response body for `show()` and `update()` when the frontend needs it for conditional rendering.
- Private helper methods: `loadModel()` (findByPk with includes), `buildModel()` (Model.build from body), `buildPolicy()`.
- For stateful action controllers, check `policy.create()` — the action is conceptually "creating" a state transition event.
- For sub-resource controllers, check the parent's `policy.update()` — adding/removing modifies the parent.
- Route names in `api/src/routes/index.ts` should be alphabetical by action name.
