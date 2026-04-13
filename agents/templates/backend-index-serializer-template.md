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
import { isNil } from "lodash"

import { Resource } from "@/models"
import { ResourcePolicy } from "@/policies"
import { UpdateService } from "@/services/resources"
import { IndexSerializer } from "@/serializers/resources"
import BaseController from "@/controllers/base-controller"

// In index() method:
const serializedResources = IndexSerializer.perform(resources, this.currentUser)

return this.response.status(200).json({
  resources: serializedResources,
  totalCount,
})
```

**Important:** Use `IndexSerializer.perform()` directly on arrays - don't map and call perform on each item. BaseSerializer handles arrays automatically.

**Important:** When updating a controller to use IndexSerializer, ensure the import order follows the controller import ordering pattern:

Within internal imports for controllers, group by conceptual distance:
- Utilities (logger, config)
- Models
- Policies
- Services
- Serializers
- Controllers

**Correct order:**
```typescript
import { isNil } from "lodash"

import { Resource } from "@/models"
import { ResourcePolicy } from "@/policies"
import { UpdateService } from "@/services/resources"

import { IndexSerializer } from "@/serializers/resources"

import BaseController from "@/controllers/base-controller"
```

**Incorrect order (Controllers before Serializers):**
```typescript
import BaseController from "@/controllers/base-controller"
import { IndexSerializer } from "@/serializers/resources"
