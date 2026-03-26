# Frontend API Layer

This directory contains the frontend API modules that map browser code to backend endpoints.

## Intent

Keep HTTP access, endpoint paths, and response-envelope handling in one place so components and
composables do not need to know transport details.

## Naming

These files represent the application API layer, not third-party SDKs. If a file targets a
different external system directly, prefer a more specific directory name than `api/`.

## Local Pattern

Frontend API modules should:

- define the exported types used by the frontend
- expose a small CRUD-style surface such as `list`, `get`, `create`, `update`, and `delete`
- unwrap Axios response envelopes at the API-module boundary
- keep endpoint paths centralized here instead of scattering them across components

Example:

```typescript
import http from "@/api/http-client"

export const formsApi = {
  create(attributes: FormCreateAttributes) {
    return http.post("/api/forms", attributes).then(({ data }) => data)
  },
}

export default formsApi
```

## Why This Matters

- Components stay focused on UI state and user interactions
- If backend response shapes change, the translation layer is already centralized
- Shared query option types can live beside the API module that owns them

For broader frontend API conventions, see [../../../AGENTS.md](../../../AGENTS.md).
