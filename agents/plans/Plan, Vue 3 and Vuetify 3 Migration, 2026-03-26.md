# Plan: Vue 3 and Vuetify 3 Migration

Related GitHub issue:
- https://github.com/icefoganalytics/travel-authorization/issues/100

## Current Goal

Fix the remaining broken items so the app is fully stable on Vue 3 + Vuetify 3.

The framework swap, bootstrap, and broad mechanical migration are done. What remains
is a short list of confirmed-broken patterns found by codebase search.

## Remaining Work

### 1. `:value` on Vuetify 3 components → `:model-value`

`:value` is not a valid prop on Vuetify 3 input components. These render as empty/broken fields.

Files:
- `components/locations/LocationReadonlyTextField.vue` — `v-text-field :value=`
- `components/travel-allowances/EditTravelAllowanceDialog.vue` — 2× `v-text-field :value=`
- `components/travel-desk-flight-options/TravelDeskFlightOptionCard.vue` — 2× `v-text-field :value=`
- `components/per-diems/EditPerDiemDialog.vue` — 3× `v-text-field :value=`

Fix: replace `:value=` with `:model-value=` on every Vuetify input component.

### 2. Vue 2 `model:` option → `defineModel()` or `modelValue`

`components/travel-desk-flight-segments/TravelDeskFlightSegmentsWorkspaceCard.vue` uses
the Vue 2 `model: { prop: ..., event: ... }` option, which is removed in Vue 3. The
parent's `v-model` binding silently fails.

Fix: remove the `model:` option block, rename the prop to `modelValue`, and emit
`update:modelValue`.

### 3. `@input` on `<draggable>` → verify library event name

`components/travel-desk-flight-segments/TravelDeskFlightSegmentsDraggable.vue` uses
`@input` on `<draggable>`. This may be a vuedraggable library event rather than a
Vue contract issue — verify against the installed version and fix if broken.

### 4. `v-row dense` → remove or replace

`components/travel-authorizations/SummaryHeaderPanel.vue` uses `<v-row dense>`.
`dense` is not a valid Vuetify 3 `v-row` prop (it is silently ignored).

Fix: remove `dense` or replace with `density="compact"` if spacing needs to be tight.

### 5. Async validation runtime verification

The broad `await form.validate()` migration pass is in. Remaining work is runtime
verification — confirm forms behave correctly in the browser, especially:
- high-traffic dialogs and form cards
- `HeaderActionsFormCard` and page-level form wrappers

No known broken files from search — this is a manual testing pass.

## Working Rules

- Fix the same family everywhere at once, not file-by-file.
- Each commit should contain one kind of fix.
- Update this plan as items are completed or new broken items are found.

## Pattern References

- `/home/marlen/code/icefoganalytics/wrap` — first choice for Vue 3 + Vuetify 3 patterns
- this repo's already-migrated files — prefer copying a successful local pattern
- `./bin/dev web npm run check-types -- --pretty false` — run after each slice

## Done When

- no Vuetify 2-only props remain on Vuetify 3 components (`:value`, `dense`, `input-value`, etc.)
- `v-model` contracts use `modelValue` / `update:modelValue` (no Vue 2 `model:` option)
- forms validate correctly under async `v-form.validate()`
- browser runtime shows no framework-migration warnings
