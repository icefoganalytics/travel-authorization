# Backend Serializer Index Template

This template is for the index.ts file in a serializer directory.

```typescript
export { IndexSerializer } from "./index-serializer"
export { ShowSerializer } from "./show-serializer"
```

**Add bundle export to api/src/serializers/index.ts:**

```typescript
export * as ResourceName from "./{resource-name}"
```

**Example:**

```typescript
// api/src/serializers/flight-reconciliations/index.ts
export { IndexSerializer } from "./index-serializer"
export { ShowSerializer } from "./show-serializer"

// api/src/serializers/index.ts
export * as FlightReconciliations from "./flight-reconciliations"
```
