# Backend Test Admin User Pattern

`User.isAdmin` is a virtual getter (`this.roles.includes("admin")`) with no setter.
Fishery merges factory overrides with `lodash.mergeWith`, which reads property
descriptors — getter-only properties are skipped at runtime, so passing `{ isAdmin: true }`
to `userFactory.create()` has no effect. Admin status depends entirely on the random
`roles` array assigned by the factory default.

## Create admin users

```typescript
import { User } from "@/models"

const admin = await userFactory.create({
  roles: [User.Roles.ADMIN],
})
```

## Create non-admin users

```typescript
const nonAdmin = await userFactory.create({
  roles: [User.Roles.USER],
})
```
