---
description: Workflow for converting dialog-based request tables to page-based edit patterns with EditCard, EditDataTable, NewPage, and EditPage components.
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
1. **EditCard** - Wrapper with title and "New" button (navigates to NewPage). Naming: `{Model}EditCard.vue`.
2. **EditDataTable** - Server-paginated table with edit/delete actions (edit navigates to EditPage). Naming: `{Model}EditDataTable.vue`.
3. **NewPage** - Standalone page for creating new records. Naming: `{Model}NewPage.vue`.
4. **EditPage** - Standalone page for editing existing records. Naming: `{Model}EditPage.vue`.

**Decision Rules:**
- **Props from router are strings:** Route params are always strings. Create `...AsNumber` computed for API calls.
- **Where to put components:** EditCard/EditDataTable go in `web/src/components/{model-kebab-case}/`. NewPage/EditPage go in `web/src/pages/{parent-path}/{model-plural}/`.
- **Parent ID handling:** For child entities, NewPage receives parentId. EditPage may only need the modelId (depends on whether you need parent context).
- **returnTo vs fallbackRoute:** Use returnTo prop when the caller specifies where to go back. Use fallbackRoute when determining from route history.

## Reference Files

- `TravelDeskFlightRequestEditCard.vue` (EditCard pattern)
- `TravelDeskFlightRequestEditDataTable.vue` (EditDataTable pattern)
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
{Model}EditCard.vue (wrapper)
├── v-card with title
├── "New" button in header (navigates to NewPage)
└── {Model}EditDataTable.vue (table)
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

## Step 1: Create the EditDataTable Component

**Location:** `web/src/components/{model-kebab-case}/{Model}EditDataTable.vue`

**Example:** `TravelDeskRentalCarEditDataTable.vue`

### Template Structure

```vue
<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :headers="headers"
    :items="records"
    :loading="isNil(records)"
    :server-items-length="totalCount"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- Custom column templates as needed -->
    <template #item.dateField="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.actions="{ item: record }">
      <v-btn
        title="Edit"
        icon
        color="blue"
        @click.stop="goTo{Model}EditPage(record.id)"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        :loading="isDeleting"
        title="Delete"
        icon
        color="red"
        @click.stop="delete{Model}(record.id)"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
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
import { isNil } from "lodash"
import { ref, computed } from "vue"
import { useRouter } from "vue2-helpers/vue-router"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import formatDate from "@/utils/format-date"

import { {modelPlural}Api, type {Model}WhereOptions } from "@/api/{model-plural}-api"

import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"

import useSnack from "@/use/use-snack"
import use{ModelPlural} from "@/use/use-{model-plural}"

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 5

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
  {
    text: "Field 1",
    value: "field1",
  },
  {
    text: "Field 2",
    value: "field2",
    sortable: false,
  },
  // ... more headers (set sortable: false for non-sortable columns)
  {
    text: "Actions",
    value: "actions",
    align: "end",
    sortable: false,
  },
]

const page = useRouteQuery(`page${props.routeQuerySuffix}`, DEFAULT_PAGE, {
  transform: integerTransformerLegacy,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, DEFAULT_PER_PAGE, {
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
const { {modelPlural}: records, totalCount, refresh } = use{ModelPlural}(query)

const router = useRouter()

function goTo{Model}EditPage(recordId: number) {
  return router.push({
    name: "{model-plural}/{Model}EditPage",
    params: {
      {model}Id: recordId,
    },
  })
}

const isDeleting = ref(false)
const snack = useSnack()

async function delete{Model}(recordId: number) {
  if (!blockedToTrueConfirm("Are you sure you want to remove this record?")) {
    return
  }

  isDeleting.value = true
  try {
    await {modelPlural}Api.delete(recordId)
    snack.success("{Model} deleted successfully")
    await emitUpdatedAndRefresh()
  } catch (error) {
    console.error(`Failed to delete {model}: ${error}`, { error })
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

**Location:** `web/src/components/{model-kebab-case}/{Model}EditCard.vue`

**Example:** `TravelDeskRentalCarEditCard.vue`

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
      <{Model}EditDataTable
        ref="{model}EditDataTable"
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

import {Model}EditDataTable from "@/components/{model-kebab-case}/{Model}EditDataTable.vue"

const props = defineProps<{
  parentId: number
}>()

// TODO: switch to `updated: [void]` syntax in Vue 3
const emit = defineEmits<{
  (event: "updated"): void
}>()

const newRoute = computed(() => ({
  name: "{model-plural}/{Model}NewPage",
  params: {
    parentId: props.parentId,
  },
}))

const {model}EditDataTable = ref<InstanceType<typeof {Model}EditDataTable> | null>(null)

async function refresh() {
  await {model}EditDataTable.value?.refresh()
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
    title="New {Model} Request"
    header-tag="h2"
    lazy-validation
    @submit.prevent="createAndReturn"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h3 class="primary--text">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-icon-name</v-icon
          >
          1. Section Name
        </h3>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="{model}Attributes.field1"
              label="Field 1 *"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
        </v-row>

        <h3 class="primary--text mt-10">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-icon-name</v-icon
          >
          2. Section Name
        </h3>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="{model}Attributes.field2"
              label="Field 2"
              outlined
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <h3 class="primary--text mt-10 mt-md-0">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-note-text</v-icon
          >
          3. Additional Information
        </h3>
        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="{model}Attributes.additionalNotes"
              label="Additional Information"
              outlined
              rows="20"
              clearable
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-divider class="mt-md-10" />

    <template #actions>
      <v-btn
        color="primary"
        type="submit"
        :loading="isSaving"
        :disabled="isSaving"
      >
        Save {Model} Request
      </v-btn>
      <v-btn
        color="grey"
        :to="returnTo"
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
import { ref, computed } from "vue"
import { useRouter } from "vue2-helpers/vue-router"

import { required } from "@/utils/validators"
import useRouteQuery from "@/use/utils/use-route-query"

import {modelPlural}Api, { type {Model} } from "@/api/{model-plural}-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelTimesSummary from "@/use/travel-desk-travel-requests/use-travel-times-summary"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

const props = defineProps<{
  parentId: string
}>()

const parentIdAsNumber = computed(() => parseInt(props.parentId))

const { tripStartDate, tripEndDate } = useTravelTimesSummary(parentIdAsNumber)

const router = useRouter()
const defaultReturnTo = computed(() => {
  const routeLocation = router.resolve({
    name: "{parent-route}",
    params: {
      parentId: props.parentId,
    },
  })
  return routeLocation.href
})
const returnTo = useRouteQuery("returnTo", defaultReturnTo)

const {model}Attributes = ref<Partial<{Model}>>({
  parentId: parentIdAsNumber.value,
  field1: undefined,
  field2: undefined,
  // Initialize all fields with undefined
})

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isSaving = ref(false)
const snack = useSnack()

async function createAndReturn() {
  if (!headerActionsFormCard.value?.validate()) return

  isSaving.value = true
  try {
    await {modelPlural}Api.create({model}Attributes.value)
    snack.success("{Model} request created successfully!")

    return router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to create {model} request: ${error}`, { error })
    snack.error(`Failed to create {model} request: ${error}`)
  } finally {
    isSaving.value = false
  }
}

const breadcrumbs = computed(() => [
  {
    text: "Parent Entity",
    to: { name: "{parent-route}" },
  },
  {
    text: "Request",
    to: {
      name: "{parent-route}",
      params: { parentId: props.parentId },
    },
  },
  {
    text: "New {Model} Request",
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
    v-if="isNil(record)"
    type="card@2"
  />
  <HeaderActionsFormCard
    v-else
    ref="headerActionsFormCard"
    title="Edit {Model} Request"
    header-tag="h2"
    lazy-validation
    @submit.prevent="saveAndReturn"
  >
    <template #header-actions>
      <v-btn
        color="error"
        outlined
        :loading="isDeleting"
        :block="smAndDown"
        @click="deleteAndReturn"
      >
        Delete
      </v-btn>
    </template>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h3 class="primary--text">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-icon-name</v-icon
          >
          1. Section Name
        </h3>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="record.field1"
              label="Field 1 *"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
        </v-row>

        <h3 class="primary--text mt-10">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-icon-name</v-icon
          >
          2. Section Name
        </h3>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="record.field2"
              label="Field 2"
              outlined
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <h3 class="primary--text mt-10 mt-md-0">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-note-text</v-icon
          >
          3. Additional Information
        </h3>
        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="record.additionalNotes"
              label="Additional Information"
              outlined
              rows="20"
              clearable
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-divider class="mt-md-10" />

    <template #actions>
      <v-btn
        color="primary"
        type="submit"
        :loading="isSaving"
        :disabled="isSaving"
      >
        Save {Model} Request
      </v-btn>
      <v-btn
        color="grey"
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
import { ref, computed } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import { required } from "@/utils/validators"

import {modelPlural}Api from "@/api/{model-plural}-api"

import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useRouteHistory from "@/use/use-route-history"
import useSnack from "@/use/use-snack"
import use{Model} from "@/use/use-{model}"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

const props = defineProps<{
  {model}Id: string
}>()

const { smAndDown } = useDisplayVuetify2()

const {model}IdAsNumber = computed(() => parseInt(props.{model}Id))
const { {model}: record, refresh } = use{Model}({model}IdAsNumber)

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isSaving = ref(false)
const snack = useSnack()

async function saveAndReturn() {
  if (!headerActionsFormCard.value?.validate()) return

  isSaving.value = true
  try {
    await {modelPlural}Api.update({model}IdAsNumber.value, record.value)
    snack.success("{Model} request saved successfully!")
    await refresh()
  } catch (error) {
    console.error(`Failed to save {model} request: ${error}`, { error })
    snack.error(`Failed to save {model} request: ${error}`)
  } finally {
    isSaving.value = false
  }
}

const isDeleting = ref(false)
const router = useRouter()

async function deleteAndReturn() {
  if (!blockedToTrueConfirm("Are you sure you want to remove this {model} request?")) {
    return
  }

  isDeleting.value = true
  try {
    await {modelPlural}Api.delete({model}IdAsNumber.value)
    snack.success("{Model} request deleted successfully!")
    return router.replace(fallbackRoute)
  } catch (error) {
    console.error(`Failed to delete {model} request: ${error}`, { error })
    snack.error(`Failed to delete {model} request: ${error}`)
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

const breadcrumbs = computed(() => [
  {
    text: "Parent Entity",
    to: { name: "{parent-route}" },
  },
  {
    text: "Request",
    to: {
      name: "{parent-route}",
      params: { parentId: props.{model}Id },
    },
  },
  {
    text: "{Model} Request",
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

useBreadcrumbs(breadcrumbs)
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
| Edit Data Table | `{Model}EditDataTable.vue` | `TravelDeskRentalCarEditDataTable.vue` |
| Edit Card (wrapper) | `{Model}EditCard.vue` | `TravelDeskRentalCarEditCard.vue` |
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

### EditDataTable Component
- [ ] Uses `<script setup lang="ts">`
- [ ] Uses `withDefaults(defineProps<{...}>(), {...})` for props with defaults
- [ ] Uses `defineEmits<{ (event: "updated"): void }>()` call-signature syntax
- [ ] Uses v-data-table with server-side pagination and sorting
- [ ] Binds `:sort-by.sync` and `:sort-desc.sync` for sorting
- [ ] Uses sort utilities: `useVuetifySortByToSafeRouteQuery`, `useVuetify2SortByShim`, `useVuetifySortByToSequelizeSafeOrder`
- [ ] Passes `order` to query computed property
- [ ] Edit button calls `goTo{Model}EditPage(record.id)` via `@click.stop`
- [ ] Has delete button with confirmation
- [ ] Action methods are named descriptively (e.g., `delete{Model}` not `deleteItem`)
- [ ] Uses full, descriptive names for variables (e.g., `record` instead of `item`)
- [ ] Uses composable for data fetching
- [ ] Uses useRouteQuery for pagination state
- [ ] Emits "updated" event
- [ ] Exposes refresh() method

### EditCard Component
- [ ] Uses `<script setup lang="ts">`
- [ ] Uses `defineProps<{...}>()` for required props
- [ ] Uses `defineEmits<{ (event: "updated"): void }>()` call-signature syntax
- [ ] Wraps EditDataTable in v-card
- [ ] Has "New" button in card title that navigates to NewPage
- [ ] Passes where prop to EditDataTable
- [ ] Emits "updated" event
- [ ] Exposes refresh() method

### NewPage Component
- [ ] Uses `<script setup lang="ts">`
- [ ] Uses `defineProps<{ parentId: string }>()` (string type, not number)
- [ ] Creates `parentIdAsNumber` computed using `parseInt()` (not `Number()`)
- [ ] Uses HeaderActionsFormCard wrapper
- [ ] Has form validation with rules
- [ ] Has Save/Cancel action buttons
- [ ] Uses ref for attributes with descriptive naming (e.g., `{model}Attributes`)
- [ ] Action method named `createAndReturn()` (not `create{Model}()`)
- [ ] Uses `useRouteQuery` for `returnTo` with `defaultReturnTo` computed
- [ ] `defaultReturnTo` uses `router.resolve()` to get href
- [ ] Guard clause: `if (!headerActionsFormCard.value?.validate()) return`
- [ ] Success messages include "!" at the end
- [ ] Error messages use singular form: "Failed to create {model} request"
- [ ] Uses two-column layout with numbered sections and icons
- [ ] Section headers use `<h3 class="primary--text">` with `v-icon`
- [ ] Has `v-divider class="mt-md-10"` before actions
- [ ] Save button has `:disabled="isSaving"` and text "Save {Model} Request"
- [ ] Cancel button uses `color="grey"` and `:to="returnTo"`
- [ ] `breadcrumbs` is computed, then passed to `useBreadcrumbs(breadcrumbs)`

### EditPage Component
- [ ] Uses `<script setup lang="ts">`
- [ ] Uses `defineProps<{ {model}Id: string }>()` (string type, not number)
- [ ] Creates `{model}IdAsNumber` computed using `parseInt()` (not `Number()`)
- [ ] Uses `useDisplayVuetify2()` for responsive breakpoints (e.g., `smAndDown`)
- [ ] Uses HeaderActionsFormCard wrapper
- [ ] Has Delete button in header-actions slot with `:block="smAndDown"`
- [ ] Has v-skeleton-loader with `type="card@2"` for loading state
- [ ] Uses composable for loading entity (pass `...AsNumber` computed)
- [ ] Action methods named `saveAndReturn()` and `deleteAndReturn()`
- [ ] Guard clause: `if (!headerActionsFormCard.value?.validate()) return`
- [ ] Success messages include "!" at the end
- [ ] Error messages use singular form: "Failed to save/delete {model} request"
- [ ] Uses two-column layout with numbered sections and icons
- [ ] Section headers use `<h3 class="primary--text">` with `v-icon`
- [ ] Has `v-divider class="mt-md-10"` before actions
- [ ] Save button has `:disabled="isSaving"` and text "Save {Model} Request"
- [ ] Cancel button uses `color="grey"`
- [ ] Uses useRouteHistory for cancel navigation
- [ ] `breadcrumbs` is computed, then passed to `useBreadcrumbs(breadcrumbs)`

### Routes
- [ ] New page route defined with props: true
- [ ] Edit page route defined with props: true
- [ ] Route names follow `{model-plural}/{Model}NewPage` pattern

---

## Common Pitfalls

1. **Using `[String, Number]` prop type** - Page props from router are always strings; use `string` type and create `...AsNumber` computed using `parseInt()`
2. **Using old `defineProps({})` syntax** - TypeScript files should use `defineProps<{...}>()` or `withDefaults(defineProps<{...}>(), {...})`
3. **Using old `defineEmits([])` syntax** - TypeScript files should use call-signature syntax: `defineEmits<{ (event: "name"): void }>()`
4. **Forgetting to emit "updated"** - Parent components rely on this to know when to refresh
5. **Not exposing refresh()** - Needed for parent components to trigger data refresh
6. **Missing v-skeleton-loader** - EditPage should show skeleton while loading (use `type="card@2"`)
7. **Hardcoded routes** - Use `useRouteQuery("returnTo", defaultReturnTo)` for flexible return navigation
8. **Missing breadcrumbs** - Pages should set breadcrumbs for navigation
9. **Not initializing form attributes** - NewPage should initialize attributes with `undefined` values
10. **Using abbreviations** - Use full descriptive names (e.g., `record` or `{model}` instead of `item`)
11. **Passing string ID to API calls** - Always use the `...AsNumber` computed when calling API methods
12. **Using JSDoc for refs** - Use TypeScript generics instead: `ref<InstanceType<typeof Component> | null>(null)`
13. **Inconsistent directory structure** - Components should be in `web/src/components/{model-kebab-case}/`
14. **Not using named imports** - Import API methods using named imports instead of default imports
15. **Using magic numbers** - Hoist magic numbers to named constants (e.g., `const DEFAULT_PER_PAGE = 5`)
16. **Using `Number()` instead of `parseInt()`** - Use `parseInt()` for converting string props to numbers
17. **Not using `useRouteQuery` for returnTo** - Use `useRouteQuery("returnTo", defaultReturnTo)` pattern
18. **Missing section headers with icons** - Use numbered sections with `<h3 class="primary--text">` and `v-icon`
19. **Not using `useDisplayVuetify2`** - Import and use for responsive breakpoints like `smAndDown`
20. **Not using guard clauses** - Use `if (!headerActionsFormCard.value?.validate()) return` pattern

---

**Workflow Version:** 1.3
**Last Updated:** 2026-01-16
**Reference Files:** `TravelDeskOtherTransportationNewPage.vue`, `TravelDeskHotelNewPage.vue`, `TravelDeskRentalCarNewPage.vue`, `TravelDeskOtherTransportationEditPage.vue`
