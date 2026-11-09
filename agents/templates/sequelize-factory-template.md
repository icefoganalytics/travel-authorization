# Sequelize Factory Template

Use Factory Shark 2.0.0 for application-model factories under `api/tests/factories/`. Keep plain-object web fixtures in their existing Fishery library. The [API test guide](../../api/tests/README.md#factories) owns fixture setup and relationship boundaries.

## Factory With Parent Relationships

Return attributes from the generator. Factory Shark builds the Sequelize instance and saves registered `belongsTo` parents before `create()` saves the record.

```typescript
import { faker } from "@faker-js/faker"
import FactoryShark from "factory-shark"

import { TravelAuthorization } from "@/models"

import { travelPurposeFactory, userFactory } from "@/factories"

export const travelAuthorizationFactory = FactoryShark.define(
  TravelAuthorization,
  ({ associate }) => {
    associate("user", userFactory)
    associate("purpose", travelPurposeFactory)

    return {
      slug: faker.string.uuid(),
    }
  }
)

export default travelAuthorizationFactory
```

Pass persisted parents or foreign keys when creating a record. For heterogeneous parent models, pass typed association parameters directly to `create()`:

```typescript
const travelAuthorization = await travelAuthorizationFactory.create({
  user,
  purpose,
})
```

Foreign-key overrides take precedence over association instances. A `build()` with a foreign key attaches only an `{ id }` placeholder, not a loaded model. Tests that need a complete unsaved association graph must assign those instances explicitly after building. Do not pass unsaved parent instances to `create()` expecting them to be saved.

For `hasMany` or `hasOne`, create the parent first, then related records with its foreign key and reload the association if needed. Put recurring relationship setup in an opt-in named factory trait; do not recreate a generic recursive persistence helper.

## Factory With Custom Helpers

Construct a subclass explicitly when it exposes domain-specific builders. The inherited static `define()` returns a base factory, not the subclass.

```typescript
import FactoryShark, { type GeneratorFn } from "factory-shark"

import { Expense } from "@/models"

class ExpenseFactory extends FactoryShark<Expense> {
  constructor(generator: GeneratorFn<Expense>) {
    super(Expense, generator, {})
  }

  estimate() {
    return this.params({
      type: Expense.Types.ESTIMATE,
    })
  }
}
```

Use the existing [expense factory](../../api/tests/factories/expense-factory.ts) for its complete defaults and description generation. Keep the named export and default export conventions.

## Attributes, Hooks, and Lists

- `factory.build(overrides).dataValues` provides unsaved attributes for request payloads.
- Create a list with an explicit loop; reuse one configured builder so its sequence advances. New builders have independent sequences.
- Use `afterCreate` for an explicit association reload or an opt-in persisted relationship trait, not for saving the parent again.
- Let validation and database errors propagate with their original details; do not replace them with an attribute dump.
- Keep `Buffer` values as attributes. Verify exact bytes through both build and persisted reload when changing binary fixtures.
- Factory Shark's documented model contract requires an `id` primary key and supports `belongsTo` only. Do not change production schemas or invent IDs to fit unsupported models.

## Reference Implementations

- [User factory](../../api/tests/factories/user-factory.ts)
- [Expense factory](../../api/tests/factories/expense-factory.ts)
- [Travel authorization factory](../../api/tests/factories/travel-authorization-factory.ts)
