# Backend Index Serializer Template

This template is for creating index serializers for backend controllers.

```typescript
import { pick } from "lodash"
import { Resource, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type ResourceAsIndex = Pick<
  Resource,
  | "id"
  | "field1"
  | "field2"
  // ... all fields to expose in list views
>

export class IndexSerializer extends BaseSerializer<Resource> {
  constructor(
    protected record: Resource,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): ResourceAsIndex {
    return pick(this.record, [
      "id",
      "field1",
      "field2",
      // ... all fields to expose
    ])
  }
}

export default IndexSerializer
```

**Usage in controller:**

```typescript
import { IndexSerializer } from "@/serializers/{resource-name}"

// In index() method:
const serializedResources = IndexSerializer.perform(resources, this.currentUser)

return this.response.status(200).json({
  resources: serializedResources,
  totalCount,
})
```

**Important:** Use `IndexSerializer.perform()` directly on arrays - don't map and call perform on each item. BaseSerializer handles arrays automatically.
