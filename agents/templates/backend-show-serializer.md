# Backend Show Serializer Template

This template is for creating show serializers for backend controllers.

```typescript
import { pick } from "lodash"
import { Resource, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type ResourceAsShow = Pick<
  Resource,
  "id" | "field1" | "field2"
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
