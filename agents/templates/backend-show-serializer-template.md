# Backend Show Serializer Template

This template is for creating show serializers for backend controllers.

```typescript
import { isUndefined, pick } from "lodash"

import { Resource, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type ResourceAsShow = Pick<
  Resource,
  | "id"
  | "field1"
  | "field2"
  // ... all fields to expose in detail views
>

export class ShowSerializer extends BaseSerializer<Resource> {
  constructor(
    protected record: Resource,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): ResourceAsShow {
    // Validate eager-loaded associations if needed
    // const { someAssoc } = this.record
    // if (isUndefined(someAssoc)) {
    //   throw new Error("Expected someAssoc to be preloaded")
    // }

    return pick(this.record, [
      "id",
      "field1",
      "field2",
      // ... all fields to expose
    ])
  }
}

export default ShowSerializer
```

**Usage in controller:**

```typescript
import { ShowSerializer } from "@/serializers/{resource-name}"

// In show() method:
const serializedResource = ShowSerializer.perform(resource, this.currentUser)

return this.response.status(200).json({
  resource: serializedResource,
  policy,
})

// In update() method:
const serializedResource = ShowSerializer.perform(resource, this.currentUser)

return this.response.status(200).json({
  resource: serializedResource,
  policy,
})
```

**For nested associations**, delegate via private methods:

```typescript
import { isNil, isUndefined, pick } from "lodash"

import { Child, User } from "@/models"
import { ShowSerializer as ChildSerializer } from "@/serializers/children"
import BaseSerializer from "@/serializers/base-serializer"

// In perform():
const serializedChildren = this.serializeChildren(children)
const serializedChild = this.serializeChild(child)

return {
  ...pick(this.record, ["id", "field1"]),
  children: serializedChildren,
  child: serializedChild,
}

// Private methods at the bottom of the class:

private serializeChildren(children: Child[]): ChildAsReference[] {
  return ChildSerializer.perform(children)
}

private serializeChild(child: Child | null): ChildAsReference | null {
  if (isNil(child)) return null

  return ChildSerializer.perform(child)
}
```

**Important:** Use `Serializer.perform()` directly — the static method on BaseSerializer handles both single records and arrays automatically. Don't map and call perform on each item.

**Important:** When a serializer needs `currentUser` (e.g., for policy-gated fields), keep the private method pattern:

```typescript
private serializeChild(child: Child): ChildAsReference {
  return ChildSerializer.perform(child, this.currentUser)
}
```

**Important:** When adding a ShowSerializer, don't forget to:

1. Add `ShowSerializer` and `type ResourceAsShow as AsShow` to the serializer index (`api/src/serializers/{resource}/index.ts`)
2. Ensure the serializer index already exports from the main serializers barrel (`api/src/serializers/index.ts`)
3. Update the controller's `show()` (and `update()` if applicable) to use `ShowSerializer.perform()`
