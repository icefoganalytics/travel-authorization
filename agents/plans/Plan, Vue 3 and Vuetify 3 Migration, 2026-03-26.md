# Plan: Vue 3 and Vuetify 3 Migration

Related GitHub issue:
- https://github.com/icefoganalytics/travel-authorization/issues/100

## Current Goal

Finish the post-swap frontend migration work so the app is stable on:
- Vue 3
- Vuetify 3
- Vue Router 4
- Vue I18n 9

The dependency swap and app bootstrap work are already done. The remaining work
is mostly mechanical component migration plus a smaller typed cleanup pass.

## Current Status

Already done, summarized briefly:
- Vue 3 dependency swap and `createApp(...)` bootstrap
- Vuetify 3 plugin setup
- Vue Router 4 migration
- Vue I18n 9 migration
- Auth0 Vue migration
- removal of filters, `$snack`, `$http`, Vuex wiring, and Vuetify 2 shims
- major Vuetify 3 table, slot, badge, density, size, dark-prop, and icon-alignment updates

What is left:
- remaining shared `value` / `@input` component contracts
- remaining typed cleanup in shared wrappers and table/query helpers
- a small number of final Vuetify 2 prop/event stragglers found by search or runtime testing
- final validation cleanup and runtime verification after the broad async-validation pass

Useful current context:
- the app already boots on Vue 3 and Vuetify 3, so this is no longer a dependency-swap plan
- most remaining work is in component templates and shared wrapper contracts
- runtime warnings and broken UI are currently more important than the smaller type backlog
- recent work has been most effective when handled as broad mechanical families across the tree
- the broad Vuetify 3 async-validation migration pass is now in, so validation work is mostly follow-up verification and straggler cleanup rather than a large untouched family

## Remaining Work

### 1. Form Validation Behavior

Finish verifying the new Vuetify 3 async validation behavior across the app.

Focus:
- confirm the broad `await form.validate()` migration behaves correctly in the browser
- clean up any remaining reachable validation stragglers found by search or runtime testing
- keep wrapper `validate()` methods returning the correct Vuetify 3 result shape
- avoid pulling dead/orphaned components back into scope just to normalize validation there

Known places to check:
- high-traffic dialogs and form cards touched in the async-validation pass
- wrappers such as `HeaderActionsFormCard` and page-level form cards
- any runtime-tested flows that still feel inconsistent with `wrap`

Rule:
- handle these as discrete slices across the codebase
- each commit should contain one kind of migration only
- prefer fixing the same prop/component family everywhere at once instead of file-by-file

### 2. Remaining Shared Component Contract Migration

Finish converting shared Vue 2-style component APIs to Vue 3 contracts:
- `value` → `modelValue`
- `@input` → `@update:modelValue`
- normalize nullable Vuetify payloads at the boundary when needed
- do not widen public APIs unless the feature truly needs it

Focus first on:
- shared form controls
- shared dialogs
- shared card/form wrappers
- high-traffic table filters and table-adjacent controls

Current known contract families still worth checking:
- custom inputs still exposing `value`
- custom inputs still emitting `input`
- wrappers still normalizing old Vuetify payload shapes
- parent components still using old Vue 2 bindings against partially migrated children
- draggable/table integrations that still use non-Vue-3 event names for library reasons should be reviewed deliberately, not changed blindly

### 3. Typed Cleanup

Finish the smaller type backlog that remains after runtime mismatches:
- shared table/query helper typing
- route-query helpers and server-table page/per-page typing
- remaining travel-desk page mismatches
- report page prop mismatches
- remaining wrapper typing that still reflects Vue 2 assumptions

Rule:
- prefer fixing shared abstractions over page-local workarounds

Keep this behind runtime/API work unless a type issue blocks the next migration family.

### 4. Final Vuetify 3 Stragglers

Most broad Vuetify 2 → 3 surface families are already done. What remains here
should be handled opportunistically when surfaced by search or manual testing:
- `v-row dense`
- activator prop objects still passing old Vuetify density flags
- any final legacy prop/event cases surfaced by browser warnings
- `hide-details` and similar props only if they prove to be real Vuetify 3 mismatches

## Current Priorities

In order:
1. shared `modelValue` contract cleanup
2. validation verification and stragglers
3. leftover type errors
4. final Vuetify 3 stragglers and polish

## Working Rules

- Prefer discrete migration families over file-by-file cleanup.
- It is fine to touch many files if every change is the same kind of change.
- Keep commits grouped by one migration concern.
- Prefer `wrap` as the internal reference for current Vue 3 / Vuetify 3 patterns.
- Update this plan as the remaining work changes, but keep completed work brief.
- Do not let this file drift back into a historical migration diary.

## Pattern References

Use these as the primary pattern sources while finishing the migration:
- `/home/marlen/code/icefoganalytics/wrap`
  - first choice for Vue 3 + Vuetify 3 component patterns
  - especially for composables, `modelValue`, route-query usage, Vuetify plugin setup, and general `script setup` organization
- this repo’s already-migrated files
  - prefer copying a successful local pattern before inventing a new one
- browser runtime warnings
  - use them to drive the next Vuetify subcomponent/prop family
- `./bin/dev web npm run check-types -- --pretty false`
  - use this after each discrete slice to catch the next shared contract mismatch

## Still-Relevant Breaking Changes

Only keep the migration facts here that still matter for remaining work:

### Vue 3 / Shared Component Contracts

- `value` / `@input` → `modelValue` / `@update:modelValue`
- `$attrs` now includes listeners, `class`, and `style`
- slot/rendered dynamic component behavior is stricter, so raw async loaders need `defineAsyncComponent(...)` when used via `:is`

### Vuetify 3

- removed subcomponents must be replaced, not shimmed
  - `v-list-item-icon`, `v-list-item-content`, `v-list-item-avatar`, `v-list-item-action`, `v-list-item-group`
- input/control prop migrations still relevant:
  - variants moved to `variant`
  - sizes moved to `size`
  - `dense` moved to `density`
  - `item-text` moved to `item-title`
  - `input-value` moved to `model-value`
  - many text-field icons should use inner-icon props
- activator slots use `{ props }`, not `{ on, attrs }`
- `v-form.validate()` is async in Vuetify 3

## Where To Look Next

When picking the next slice, prefer this order:
1. remaining old prop/event families found by `rg`
2. shared custom component contracts (`value` / `input`)
3. validation follow-up found by browser testing
4. shared type abstractions that are still leaking Vue 2 assumptions

## Current Known Stragglers

Known remaining families still worth checking:
- shared inputs still using `value` props for public API
- shared inputs or wrappers still emitting `input`
- `v-row dense`
- activator-prop objects still passing old Vuetify density flags
- remaining `value` / `@input` shared contracts
- `hide-details` and similar props only if they prove to be real Vuetify 3 mismatches, not just because they look old

## Done When

This migration plan is complete when:
- the app no longer uses Vuetify 2-only component names, props, or slot patterns
- forms validate correctly under Vuetify 3 without relying on synchronous `validate()`
- shared components expose Vue 3-style `modelValue` contracts where appropriate
- web typecheck passes cleanly
- browser runtime warnings are reduced to ordinary app issues rather than framework-migration issues
