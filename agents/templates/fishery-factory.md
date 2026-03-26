# Fishery Factory Template

Template for creating TravelAuth test factories under `api/tests/factories/`.

## Intent

Use this template when adding or modernizing a factory so the new file matches existing TravelAuth
factory patterns.

## Simple Factory

Use plain `Factory.define<T>()` when the factory does not need custom helper methods.

**File:** `api/tests/factories/resource-name-factory.ts`

```typescript
import { Factory } from "fishery"
import { faker } from "@faker-js/faker/locale/en_CA"

import { ResourceName } from "@/models"

export const resourceNameFactory = Factory.define<ResourceName>(({ onCreate, sequence }) => {
  onCreate((resourceName) => {
    try {
      return resourceName.save()
    } catch (error) {
      console.error(error)
      throw new Error(
        `Could not create ResourceName with attributes: ${JSON.stringify(resourceName.dataValues, null, 2)}`
      )
    }
  })

  return ResourceName.build({
    title: `resource-${sequence}`,
    status: faker.helpers.arrayElement(["active", "draft"]),
  })
})

export default resourceNameFactory
```

## Factory With Associations

Use this when the factory needs to build or attach related models.

```typescript
import { Factory } from "fishery"

import { ResourceName } from "@/models"

import { associatedFactory } from "@/factories"
import { nestedSaveAndAssociateIfNew } from "@/factories/helpers"

export const resourceNameFactory = Factory.define<ResourceName>(({ associations, onCreate }) => {
  onCreate(async (resourceName) => {
    try {
      await nestedSaveAndAssociateIfNew(resourceName)
      return resourceName
    } catch (error) {
      console.error(error)
      throw new Error(
        `Could not create ResourceName with attributes: ${JSON.stringify(resourceName.dataValues, null, 2)}`
      )
    }
  })

  const associatedRecord =
    associations.associatedRecord ??
    associatedFactory.build({
      id: undefined,
    })

  const resourceName = ResourceName.build({
    associatedRecordId: associatedRecord.id,
  })

  resourceName.associatedRecord = associatedRecord

  return resourceName
})

export default resourceNameFactory
```

## Factory With Custom Helper Methods

Use `BaseFactory` when the factory needs custom chainable helpers such as `estimate()`.

```typescript
import { faker } from "@faker-js/faker"
import { type DeepPartial } from "fishery"

import { ResourceName } from "@/models"
import BaseFactory from "@/factories/base-factory"

class ResourceNameFactory extends BaseFactory<ResourceName> {
  active(params: Pick<DeepPartial<ResourceName>, "status"> = {}) {
    return this.params({
      status: params.status ?? "active",
    })
  }
}

export const resourceNameFactory = ResourceNameFactory.define(({ sequence, onCreate }) => {
  onCreate((resourceName) => resourceName.save())

  return ResourceName.build({
    title: `resource-${sequence}`,
    description: faker.lorem.sentence(),
  })
})

export default resourceNameFactory
```

## Local Rules Pulled From Existing Factories

- Prefer `Factory.define<T>()` unless you need custom chainable helpers
- Use `BaseFactory<T>` when the factory needs helper methods like `estimate()`
- Keep `onCreate(...)` near the top of the factory callback
- Include a detailed error message with `JSON.stringify(model.dataValues, null, 2)` when create
  fails
- Use `nestedSaveAndAssociateIfNew(...)` when associated models may need to be saved automatically
- Default associated builds to `{ id: undefined }` when you want the nested save helper to persist
  them
- Export both the named factory and a default export

## Reference Implementations

- `api/tests/factories/user-factory.ts`
- `api/tests/factories/expense-factory.ts`
- `api/tests/factories/travel-authorization-factory.ts`
