# Backend Serializer Index Template

## Purpose
Barrel export file for bundling serializer exports from a resource directory.

## Template

```typescript
export {
  IndexSerializer,
  type ResourceAsIndex as AsIndex,
} from "./index-serializer"

export {
  ShowSerializer,
  type ResourceAsShow as AsShow,
} from "./show-serializer"
```

## Instructions

1. Create this file at `api/src/serializers/{resource}/index.ts`
2. Export IndexSerializer and its AsIndex type (if it exists)
3. Export ShowSerializer and its AsShow type (if it exists)
4. Use the `as` syntax to export the type with the shorter name (AsIndex, AsShow)
5. This allows importing with: `import { IndexSerializer, AsIndex } from "@/serializers/{resource}"`

## Important: Add Bundle Export to Main Serializers Index

After creating the serializer index file, you must also add a bundle export to the main serializers index file at `api/src/serializers/index.ts`:

```typescript
// Add this line to the Bundles section in alphabetical order
export * as Resources from "./resources"
```

Replace `Resources` with the PascalCase plural form of your resource name (e.g., PerDiems, TravelAllowances, Locations).

## Example

```typescript
// api/src/serializers/per-diems/index.ts
export {
  IndexSerializer,
  type PerDiemAsIndex as AsIndex,
} from "./index-serializer"

// api/src/serializers/index.ts
export * as PerDiems from "./per-diems"
```

## Related Files

- `index-serializer.ts` - The IndexSerializer implementation
- `show-serializer.ts` - The ShowSerializer implementation
- `api/src/serializers/index.ts` - Main serializers index file (add bundle export here)
