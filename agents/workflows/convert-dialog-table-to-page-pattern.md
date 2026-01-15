---
description: Workflow for converting dialog-based request tables to page-based edit patterns with EditTableCard, EditTable, NewPage, and EditPage components.
auto_execution_mode: 1
---

# Convert Dialog-Based Table to Page Pattern Workflow

## Intent

**WHY this workflow exists:** Legacy components use inline dialogs for create/edit which causes:
- Complex state management (dialog open/close, form data, validation)
- Poor URL navigation (no bookmarkable edit links)
- Mixed concerns (table + forms in one component)
- Difficult testing (can't navigate directly to edit state)

The page-based pattern separates concerns: tables display data, pages handle forms.

**WHAT this workflow produces:** Four components that work together:
1. **EditCard** - Wrapper with title and "New" button (navigates to NewPage)
2. **EditDataTable** - Server-paginated table with edit/delete actions (edit navigates to EditPage)
3. **NewPage** - Standalone page for creating new items
4. **EditPage** - Standalone page for editing existing items

**Decision Rules:**
- **Props from router are strings:** Route params are always strings. Create `...AsNumber` computed for API calls.
- **Where to put components:** EditCard/EditDataTable go in `components/{model-plural}/`. NewPage/EditPage go in `pages/{parent-path}/{model-plural}/`.
- **Parent ID handling:** For child entities, NewPage receives parentId. EditPage may only need the modelId (depends on whether you need parent context).
- **returnTo vs fallbackRoute:** Use returnTo prop when the caller specifies where to go back. Use fallbackRoute when determining from route history.

## Reference Files

- `TravelDeskFlightRequestsEditCard.vue` (EditCard pattern)
- `TravelDeskFlightRequestsEditDataTable.vue` (EditDataTable pattern)
- `TravelPreApprovalEditPage.vue` (EditPage pattern)
- `TravelPreApprovalNewPage.vue` (NewPage pattern)

## Prerequisites

Before starting, ensure:

- [ ] The API client exists in `web/src/api/` (preferably TypeScript)
- [ ] The composable exists in `web/src/use/` (both singular and plural)
- [ ] You understand the model's fields and relationships
- [ ] Routes are defined for the new pages (or plan to add them)

---

## Overview

**Source Pattern (legacy):**
```
RentalCarRequestTable.vue
├── TitleCard wrapper
├── Inline NewRentalCarRequest dialog (for create)
├── v-data-table with edit/delete buttons
└── Inline NewRentalCarRequest dialog (for edit)
```

**Target Pattern (modern):**
```
{Model}sEditCard.vue (wrapper)
├── v-card with title
├── "New" button in header (navigates to NewPage)
└── {Model}sEditTable.vue (table)
    ├── v-data-table
    └── Edit (navigates to EditPage) / Delete buttons in actions column

{Model}NewPage.vue (standalone page)
├── HeaderActionsFormCard
├── Form fields
└── Save/Cancel actions

{Model}EditPage.vue (standalone page)
├── HeaderActionsFormCard
├── Delete button in header
├── Form fields
└── Save/Cancel actions
```

---

## Step 1: Create the EditTable Component

**Location:** `web/src/components/{model-plural}/{Model}sEditTable.vue`

**Example:** `TravelDeskRentalCarsEditTable.vue`

### Template Structure

```vue
<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :headers="headers"
    :items="items"
    :loading="isLoading"
    :server-items-length="totalCount"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- Custom column templates as needed -->
    <template #item.dateField="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.actions="{ item }">
      <v-btn
        title="Edit"
        icon
        color="blue"
        @click.stop="goTo{Model}EditPage(item.id)"
        ><v-icon>mdi-pencil</v-icon></v-btn
      >
      <v-btn
        :loading="isDeleting"
        title="Delete"
        icon
        color="red"
        @click.stop="deleteItem(item.id)"
        ><v-icon>mdi-close</v-icon></v-btn
      >
    </template>

    <!-- Pass-through slots -->
    <template
      v-for="(_, slotName) in $scopedSlots"
      #[slotName]="slotData"
    >
      <slot
        :name="slotName"
        v-bind="slotData"
      ></slot>
    </template>
  </v-data-table>
</template>
```

### Script Structure

```vue
<script setup lang="ts">
import { ref, computed } from "vue"
import { useRouter } from "vue2-helpers/vue-router"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import formatDate from "@/utils/format-date"

import {modelPlural}Api, type {Model}WhereOptions } from "@/api/{model-plural}-api"

import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"

import useSnack from "@/use/use-snack"
import use{ModelPlural} from "@/use/use-{model-plural}"

const props = withDefaults(
  defineProps<{
    where?: {Model}WhereOptions
    filters?: Record<string, unknown>
    routeQuerySuffix?: string
  }>(),
  {
    where: () => ({}),
    filters: () => ({}),
    routeQuerySuffix: "",
  }
)

// TODO: switch to `updated: [void]` syntax in Vue 3
const emit = defineEmits<{
  (event: "updated"): void
}>()

const headers = [
  { text: "Field 1", value: "field1" },
  { text: "Field 2", value: "field2", sortable: false },
  // ... more headers (set sortable: false for non-sortable columns)
  { text: "Actions", value: "actions", align: "end", sortable: false },
]

const page = useRouteQuery(`page${props.routeQuerySuffix}`, 1, {
  transform: integerTransformerLegacy,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, 5, {
  transform: integerTransformerLegacy,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  { key: "field1", order: "asc" },
])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const query = computed(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { items, totalCount, isLoading, refresh } = use{ModelPlural}(query)

const router = useRouter()

function goTo{Model}EditPage(itemId: number) {
  return router.push({
    name: "{model-plural}/{Model}EditPage",
    params: { {model}Id: itemId },
  })
}

const isDeleting = ref(false)
const snack = useSnack()

async function deleteItem(itemId: number) {
  if (!blockedToTrueConfirm("Are you sure you want to remove this item?")) return

  isDeleting.value = true
  try {
    await {modelPlural}Api.delete(itemId)
    snack.success("Item deleted successfully")
    await emitUpdatedAndRefresh()
  } catch (error) {
    console.error(error)
  } finally {
    isDeleting.value = false
  }
}

async function emitUpdatedAndRefresh() {
  emit("updated")
  await refresh()
}

defineExpose({
  refresh,
})
</script>
```

---

## Step 2: Create the EditCard Component (Wrapper)

**Location:** `web/src/components/{model-plural}/{Model}sEditCard.vue`

**Example:** `TravelDeskRentalCarsEditCard.vue`

### Template Structure

```vue
<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <h3 class="mb-0">{Model} Requests</h3>
      <v-spacer />
      <v-btn
        class="my-0"
        color="primary"
        :to="newRoute"
      >
        New {Model}
      </v-btn>
    </v-card-title>
    <v-card-text>
      <{Model}sEditTable
        ref="{model}sEditTable"
        :where="{
          parentId: parentId,
        }"
        route-query-suffix="{Model}"
        v-bind="$attrs"
        @updated="emit('updated')"
      />
    </v-card-text>
  </v-card>
</template>
```

### Script Structure

```vue
<script setup lang="ts">
import { computed, ref } from "vue"

import {Model}sEditTable from "@/components/{model-plural}/{Model}sEditTable.vue"

const props = defineProps<{
  parentId: number
}>()

// TODO: switch to `updated: [void]` syntax in Vue 3
const emit = defineEmits<{
  (event: "updated"): void
}>()

const newRoute = computed(() => ({
  name: "{model-plural}/{Model}NewPage",
  params: { parentId: props.parentId },
}))

const {model}sEditTable = ref<InstanceType<typeof {Model}sEditTable> | null>(null)

async function refresh() {
  await {model}sEditTable.value?.refresh()
}

defineExpose({
  refresh,
})
</script>
```

---

## Step 3: Create the NewPage Component

**Location:** `web/src/pages/{model-plural}/{Model}NewPage.vue`

**Example:** `TravelDeskRentalCarNewPage.vue`

### Template Structure

```vue
<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="New {Model}"
    header-tag="h2"
    lazy-validation
    @submit.prevent="createItem"
  >
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="attributes.field1"
          label="Field 1 *"
          :rules="[required]"
          outlined
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="attributes.field2"
          label="Field 2"
          outlined
        />
      </v-col>
    </v-row>

    <!-- Add more form fields as needed -->

    <template #actions>
      <v-btn
        class="my-0"
        color="primary"
        :loading="isLoading"
        type="submit"
      >
        Save
      </v-btn>
      <v-btn
        class="my-0"
        color="warning"
        outlined
        :to="cancelRoute"
      >
        Cancel
      </v-btn>
    </template>
  </HeaderActionsFormCard>
</template>
```

### Script Structure

```vue
<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue2-helpers/vue-router"

import { required } from "@/utils/validators"

import {modelPlural}Api from "@/api/{model-plural}-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

const props = defineProps<{
  parentId: string
}>()

const parentIdAsNumber = computed(() => Number(props.parentId))

const attributes = ref({
  parentId: parentIdAsNumber.value,
  field1: undefined,
  field2: undefined,
  // Initialize all fields with undefined
})

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isLoading = ref(false)
const snack = useSnack()
const router = useRouter()

async function createItem() {
  if (headerActionsFormCard.value === null) return
  if (!headerActionsFormCard.value.validate()) return

  isLoading.value = true
  try {
    await {modelPlural}Api.create(attributes.value)
    snack.success("{Model} created successfully")
    return router.push(cancelRoute.value)
  } catch (error) {
    console.error(`Failed to create {model}: ${error}`, { error })
    snack.error(`Failed to create {model}: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const cancelRoute = computed(() => ({
  name: "{parent-route}",
  params: { parentId: props.parentId },
}))

const breadcrumbs = computed(() => [
  {
    text: "Parent Entity",
    to: { name: "{parent-route}" },
  },
  {
    text: "New {Model}",
    to: { name: "{model-plural}/{Model}NewPage" },
  },
])
useBreadcrumbs(breadcrumbs)
</script>
```

---

## Step 4: Create the EditPage Component

**Location:** `web/src/pages/{model-plural}/{Model}EditPage.vue`

**Example:** `TravelDeskRentalCarEditPage.vue`

### Template Structure

```vue
<template>
  <v-skeleton-loader
    v-if="isNil(item)"
    type="card"
  />
  <HeaderActionsFormCard
    v-else
    ref="headerActionsFormCard"
    title="Edit {Model}"
    header-tag="h2"
    lazy-validation
    @submit.prevent="saveWrapper"
  >
    <template #header-actions>
      <v-btn
        class="my-0"
        color="error"
        outlined
        :loading="isDeleting"
        @click="deleteItem"
      >
        Delete
      </v-btn>
    </template>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="item.field1"
          label="Field 1 *"
          :rules="[required]"
          outlined
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="item.field2"
          label="Field 2"
          outlined
        />
      </v-col>
    </v-row>

    <!-- Add more form fields as needed -->

    <template #actions>
      <v-btn
        color="primary"
        :loading="isLoading"
        type="submit"
      >
        Save
      </v-btn>
      <v-btn
        color="warning"
        outlined
        :to="previousRouteOrFallback"
      >
        Cancel
      </v-btn>
    </template>
  </HeaderActionsFormCard>
</template>
```

### Script Structure

```vue
<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import { required } from "@/utils/validators"

import {modelPlural}Api from "@/api/{model-plural}-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useRouteHistory from "@/use/use-route-history"
import useSnack from "@/use/use-snack"
import use{Model} from "@/use/use-{model}"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

const props = defineProps<{
  {model}Id: string
}>()

const {model}IdAsNumber = computed(() => Number(props.{model}Id))
const { {model}: item, isLoading, refresh } = use{Model}({model}IdAsNumber)

const snack = useSnack()

async function saveWrapper() {
  isLoading.value = true
  try {
    await {modelPlural}Api.update({model}IdAsNumber.value, item.value)
    snack.success("{Model} saved successfully")
    await refresh()
  } catch (error) {
    console.error(`Failed to save {model}: ${error}`, { error })
    snack.error(`Failed to save {model}: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const isDeleting = ref(false)
const router = useRouter()

async function deleteItem() {
  if (!blockedToTrueConfirm("Are you sure you want to remove this {model}?")) return

  isDeleting.value = true
  try {
    await {modelPlural}Api.delete({model}IdAsNumber.value)
    snack.success("{Model} deleted successfully")
    return router.replace(fallbackRoute)
  } catch (error) {
    console.error(`Failed to delete {model}: ${error}`, { error })
    snack.error(`Failed to delete {model}: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

const fallbackRoute = {
  name: "{parent-route}",
}

const { previousRoute } = useRouteHistory()
const previousRouteOrFallback = computed(() => {
  if (["{parent-route}", "{list-route}"].includes(previousRoute.value?.name)) {
    return previousRoute.value
  }
  return fallbackRoute
})

useBreadcrumbs([
  {
    text: "Parent Entity",
    to: { name: "{parent-route}" },
  },
  {
    text: "{Model}",
    to: {
      name: "{model-plural}/{Model}Page",
      params: { {model}Id: props.{model}Id },
    },
  },
  {
    text: "Edit",
    to: {
      name: "{model-plural}/{Model}EditPage",
      params: { {model}Id: props.{model}Id },
    },
  },
])
</script>
```

---

## Step 5: Add Routes (if needed)

**Location:** `web/src/router.ts`

### For Standalone Entities (no parent)

```typescript
{
  path: "{model-plural}/new",
  name: "{model-plural}/{Model}NewPage",
  component: () => import("@/pages/{model-plural}/{Model}NewPage.vue"),
  props: true,
},
{
  path: "{model-plural}/:{model}Id/edit",
  name: "{model-plural}/{Model}EditPage",
  component: () => import("@/pages/{model-plural}/{Model}EditPage.vue"),
  props: true,
},
```

### For Child Entities (nested under parent)

When the model belongs to a parent entity, nest routes under the parent's path:

```typescript
// Example: Rental cars belong to a travel desk travel request
{
  path: "{parent-plural}/:{parentModel}Id/{model-plural}/new",
  name: "{parent-plural}/{model-plural}/{Model}NewPage",
  component: () => import("@/pages/{parent-plural}/{model-plural}/{Model}NewPage.vue"),
  props: true,
},
{
  path: "{parent-plural}/:{parentModel}Id/{model-plural}/:{model}Id/edit",
  name: "{parent-plural}/{model-plural}/{Model}EditPage",
  component: () => import("@/pages/{parent-plural}/{model-plural}/{Model}EditPage.vue"),
  props: true,
},
```

**Concrete Example (rental cars under travel desk):**
```typescript
{
  path: "travel-desk/:travelDeskTravelRequestId/rental-cars/new",
  name: "travel-desk/rental-cars/TravelDeskRentalCarNewPage",
  component: () => import("@/pages/travel-desk/rental-cars/TravelDeskRentalCarNewPage.vue"),
  props: true,
},
{
  path: "travel-desk/:travelDeskTravelRequestId/rental-cars/:travelDeskRentalCarId/edit",
  name: "travel-desk/rental-cars/TravelDeskRentalCarEditPage",
  component: () => import("@/pages/travel-desk/rental-cars/TravelDeskRentalCarEditPage.vue"),
  props: true,
},
```

**Note:** When using nested routes, the NewPage and EditPage components will receive both the parent ID and (for edit) the model ID as props. Update `goTo{Model}EditPage` and `newRoute` accordingly.

---

## Naming Conventions

| Pattern | Naming | Example |
|---------|--------|---------|
| Edit Table (plural) | `{Model}sEditTable.vue` | `TravelDeskRentalCarsEditTable.vue` |
| Edit Card (wrapper) | `{Model}sEditCard.vue` | `TravelDeskRentalCarsEditCard.vue` |
| New Page | `{Model}NewPage.vue` | `TravelDeskRentalCarNewPage.vue` |
| Edit Page | `{Model}EditPage.vue` | `TravelDeskRentalCarEditPage.vue` |

---

## Key Differences from Legacy Pattern

| Aspect | Legacy Pattern | Modern Pattern |
|--------|---------------|----------------|
| Create/Edit UI | Inline dialogs in table | Separate pages (NewPage, EditPage) |
| State Management | Local `data()` with tmpId | Composables with API calls |
| Data Source | Props passed from parent | Server-side via composable |
| Pagination | None (client-side) | Server-side with useRouteQuery |
| Delete | Array splice | API call with confirmation |
| Form Wrapper | TitleCard | HeaderActionsFormCard (pages) |
| Navigation | None | Router links to New/Edit pages |
| Breadcrumbs | None | useBreadcrumbs hook |

---

## Checklist

### EditTable Component
- [ ] Uses `<script setup lang="ts">`
- [ ] Uses `withDefaults(defineProps<{...}>(), {...})` for props with defaults
- [ ] Uses `defineEmits<{ (event: "updated"): void }>()` call-signature syntax
- [ ] Uses v-data-table with server-side pagination and sorting
- [ ] Binds `:sort-by.sync` and `:sort-desc.sync` for sorting
- [ ] Uses sort utilities: `useVuetifySortByToSafeRouteQuery`, `useVuetify2SortByShim`, `useVuetifySortByToSequelizeSafeOrder`
- [ ] Passes `order` to query computed property
- [ ] Edit button calls `goTo{Model}EditPage(item.id)` via `@click.stop`
- [ ] Has delete button with confirmation
- [ ] Uses composable for data fetching
- [ ] Uses useRouteQuery for pagination state
- [ ] Emits "updated" event
- [ ] Exposes refresh() method

### EditCard Component
- [ ] Uses `<script setup lang="ts">`
- [ ] Uses `defineProps<{...}>()` for required props
- [ ] Uses `defineEmits<{ (event: "updated"): void }>()` call-signature syntax
- [ ] Wraps EditTable in v-card
- [ ] Has "New" button in card title that navigates to NewPage
- [ ] Passes where prop to EditTable
- [ ] Emits "updated" event
- [ ] Exposes refresh() method

### NewPage Component
- [ ] Uses `<script setup lang="ts">`
- [ ] Uses `defineProps<{ parentId: string }>()` (string type, not number)
- [ ] Creates `parentIdAsNumber` computed for numeric operations
- [ ] Uses HeaderActionsFormCard wrapper
- [ ] Has form validation with rules
- [ ] Has Save/Cancel action buttons
- [ ] Uses ref for attributes (not loaded data)
- [ ] Navigates on successful create
- [ ] Sets breadcrumbs

### EditPage Component
- [ ] Uses `<script setup lang="ts">`
- [ ] Uses `defineProps<{ modelId: string }>()` (string type, not number)
- [ ] Creates `modelIdAsNumber` computed for API calls and composables
- [ ] Uses HeaderActionsFormCard wrapper
- [ ] Has Delete button in header-actions slot
- [ ] Has v-skeleton-loader for loading state
- [ ] Uses composable for loading entity (pass `...AsNumber` computed)
- [ ] Has Save/Cancel action buttons
- [ ] Uses useRouteHistory for cancel navigation
- [ ] Sets breadcrumbs with Edit step

### Routes
- [ ] New page route defined with props: true
- [ ] Edit page route defined with props: true
- [ ] Route names follow `{model-plural}/{Model}NewPage` pattern

---

## Common Pitfalls

1. **Using `[String, Number]` prop type** - Page props from router are always strings; use `string` type and create `...AsNumber` computed
2. **Using old `defineProps({})` syntax** - TypeScript files should use `defineProps<{...}>()` or `withDefaults(defineProps<{...}>(), {...})`
3. **Using old `defineEmits([])` syntax** - TypeScript files should use call-signature syntax: `defineEmits<{ (event: "name"): void }>()`
4. **Forgetting to emit "updated"** - Parent components rely on this to know when to refresh
5. **Not exposing refresh()** - Needed for parent components to trigger data refresh
6. **Missing v-skeleton-loader** - EditPage should show skeleton while loading
7. **Hardcoded routes** - Use computed routes based on previousRoute for flexibility
8. **Missing breadcrumbs** - Pages should set breadcrumbs for navigation
9. **Not initializing form attributes** - NewPage should initialize attributes with `undefined` values
10. **Using v-model directly on loaded data** - EditPage can modify loaded entity; NewPage uses separate ref
11. **Passing string ID to API calls** - Always use the `...AsNumber` computed when calling API methods
12. **Using JSDoc for refs** - Use TypeScript generics instead: `ref<InstanceType<typeof Component> | null>(null)`

---

**Workflow Version:** 1.1
**Last Updated:** 2026-01-15
**Reference Files:** `TravelDeskFlightRequestsEditCard.vue`, `TravelDeskFlightRequestsEditTable.vue`, `TravelPreApprovalEditPage.vue`, `TravelPreApprovalNewPage.vue`
