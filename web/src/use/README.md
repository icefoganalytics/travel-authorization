# Frontend Composables

This directory holds the lightweight `use*` composables used for reactive data loading and shared
browser state.

## Intent

Composables should keep API fetching, loading state, and error state out of components while still
letting each caller provide reactive query or id inputs.

## Local Pattern

Each composable owns a reactive state object. Return state as refs and return functions directly.

Plural collection composables usually:

- accept an options ref or computed query object
- optionally accept `skipWatchIf`
- return records, `totalCount`, `isLoading`, and `isErrored`
- provide `fetch()` and `refresh()`
- watch options with `deep: true` and `immediate: true`

Singular record composables usually:

- accept an id ref or computed id
- allow `number | null | undefined`
- return the record, policy, `isLoading`, and `isErrored`
- provide `fetch()`, `refresh()`, and optionally `save()`
- watch the id immediately and skip nil ids

## Reactive Options

Options passed to composables should be reactive: a computed value, ref, or prop ref. This lets the
composable reload content whenever the options change.

Usage looks like:

```js
import { useExpenses } from "@/use/use-expenses"

const expenseOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: TYPES.EXPENSE,
  },
}))
const { expenses, isLoading, fetch } = useExpenses(expenseOptions)
```

## Chained Lookups

When you need to fetch a detail record based on a list lookup, chain composables with a computed id:

```typescript
const resourcesQuery = computed(() => ({
  where: {
    name: props.name,
  },
}))
const { resources } = useResources(resourcesQuery, {
  skipWatchIf: () => !isReady.value,
})
const resourceId = computed(() => resources.value[0]?.id)

const { resource } = useResource(resourceId)
```

When `resources` updates, `resourceId` recomputes and triggers the singular composable. Prefer this
over manual watchers and imperative `fetch()` calls when reactive chaining is enough.
