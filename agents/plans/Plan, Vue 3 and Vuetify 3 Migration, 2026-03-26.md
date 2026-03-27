# Plan: Vue 3 and Vuetify 3 Migration

Related GitHub issue:
- https://github.com/icefoganalytics/travel-authorization/issues/100

## Problem Statement

TravelAuth still runs on Vue 2 and Vuetify 2 even though both are end-of-life.
Issue 100 was opened to migrate the project to Vue 3, and a later issue comment
also called out that Vue 2 reached end of life on 2023-12-31 and Vuetify 2
reached end of life on 2025-01-25.

This is now more than a dependency refresh. The frontend has already adopted
several bridge patterns such as Vue 2.7 Composition API usage under Vite, which
gives us a strong migration starting point, but the application shell, routing,
state, i18n, filters, and a large number of components still depend on Vue 2
and Vuetify 2 specific APIs.

## Execution Progress

**Completed Phase 1 slices:**
- Replaced and removed the legacy global Vue filter registry. Filter behavior
  now lives in shared utilities / formatters instead of `Vue.filter(...)`.
- Removed legacy `$snack` app usage and deleted the old snack plugin bootstrap.
- Removed dead legacy `$http` bootstrap wiring from `web/src/main.js`.

These completed slices should not be treated as remaining Phase 1 scope.

## Current State Analysis

**Already Implemented:**
- The web app already runs on Vite rather than Vue CLI.
- `web/package.json` is already on `vue@^2.7.0`, which means many components can
  already use Composition API imports from `"vue"`.
- The repo already uses `script setup` and typed composables in many newer
  files, which reduces migration risk for business logic.
- 88% of Vue components (303 of 344) already use `<script setup>` Composition
  API. Only 35 components still use Options API.
- Vuetify 2 is already wrapped behind local bridge helpers such as
  `useDisplayVuetify2()` and `useVuetify2SortByShim()`.
- The frontend is partially modernized in structure:
  `web/src` currently contains `344` Vue SFCs, `75` TypeScript files, and
  `102` JavaScript files, so the migration can be staged instead of starting
  from a legacy-only codebase.
- No legacy patterns found for: `destroyed`/`beforeDestroy` lifecycle hooks,
  functional components, old slot syntax (`slot=`/`slot-scope=`), `$on`/`$off`/
  `$once` event bus, `$children`, `.native` modifier, `Vue.extend`, or
  `Vue.observable`. These are already absent, which significantly reduces
  migration scope.

**Not Yet Implemented:**
- App bootstrap still uses `new Vue(...)` in `web/src/main.js`.
- Routing still uses Vue Router 3 and `Vue.use(VueRouter)` in
  `web/src/router.ts`.
- Global state still uses Vuex 3 and `new Vuex.Store(...)` in
  `web/src/store/index.js`, even though the desired migration target should be
  composable-first state rather than another centralized store.
- Internationalization still uses `vue-i18n` 8 with a Vue 2 plugin-style setup
  in `web/src/plugins/vue-i18n-plugin.js`.
- Vuetify integration still depends on Vuetify 2 and
  `@logue/vue2-helpers/vuetify` in `web/src/plugins/vuetify-plugin.js`.
- The codebase still contains a large Vue 2 compatibility surface, including
  `.sync`, `v-on="$listeners"`, `$scopedSlots`, `this.$set`, and direct
  `vuetify/lib/*` imports.

**Quantified Vue 2 Pattern Inventory:**

| Pattern | Count | Priority |
|---------|-------|----------|
| `:value=` prop (Vue 2 v-model) | 159 | HIGH |
| `.sync` modifier | 95 | HIGH |
| `@input=` event (Vue 2 v-model) | 86 | HIGH |
| `v-on="$listeners"` / `$listeners` | 72 | HIGH |
| Vuetify activator `{ on, attrs }` slot | 25 | MEDIUM |
| `$scopedSlots` | 14 | MEDIUM |
| Direct `$vuetify` access | 3 | LOW |
| `Vue.prototype` | 1 | LOW |
| `this.$set()` | 1 | LOW |

**Vuetify 2 Component Usage (most impacted):**

| Component | Occurrences |
|-----------|-------------|
| `v-card` | 915 |
| `v-btn` | 652 |
| `v-list` | 227 |
| `v-text-field` | 167 |
| `v-data-table` | 101 |
| `v-dialog` | 94 |
| `v-form` | 82 |
| `v-select` | 31 |
| `v-tabs` | 16 |
| `v-autocomplete` | 16 |
| `v-menu` | 12 |

## Key Findings

1. The project is already in a bridge state, not a pure Vue 2 legacy state.
   That makes a staged migration realistic.
2. The biggest blocker is not Vue core syntax. It is the amount of Vuetify 2
   component usage and Vuetify 2-specific helper code spread throughout the UI.
3. **Vuetify 2 is incompatible with `@vue/compat` (the Vue 3 compatibility
   build).** Vuetify 2 relies on Vue 2 internal APIs (VNode private properties)
   that the compat build does not support. This means Vue 3 and Vuetify 3 must
   be upgraded simultaneously; there is no gradual path where Vue 3 runs with
   Vuetify 2.
4. The correct strategy is therefore: do as much preparation as possible while
   still on Vue 2, then perform a single coordinated dependency swap (Vue,
   Vuetify, Router, i18n, and third-party Vue 2 libs all at once), while
   extracting Vuex responsibilities into composables rather than carrying a
   centralized store forward.
5. The repo still has enough JavaScript and Vue 2-era patterns that the
   migration should include targeted codemod-style cleanup work, not just
   dependency upgrades.
6. Several third-party dependencies beyond the core framework also need Vue 3
   compatible replacements (see Third-Party Dependency Migration Map below).

## Migration Tooling

These tools can automate significant portions of the mechanical migration work.

### Codemods (Run Before or During the Dependency Swap)

- **`@originjs/vue-codemod`** — Official community codemod with 18 transform
  rules. Run via `npx @originjs/vue-codemod ./src -a` to apply all transforms.
  Key transforms: `new-component-api` (new Vue → createApp), `new-global-api`
  (Vue.component/directive/mixin/use → app.*), `vue-router-v4`,
  `remove-vue-set-and-delete`, `rename-lifecycle`, `remove-listeners`,
  `remove-v-on-native`, `slot-attribute`/`slot-default`/`slot-scope-attribute`,
  `tree-shaking`, `add-emit-declarations`. Results are not guaranteed perfect;
  manual verification is required for every transform.

- **`vue-upgrade-tool`** (UnrefinedBrain) — A newer codemod built on
  `vue-metamorph` covering 28 Vue core transforms, 10+ Vue Router transforms,
  and 6 Vue Test Utils transforms. Run via
  `npx vue-upgrade-tool --files 'src/**/*'`. Good for a second pass after
  `vue-codemod`.

### Linting (Run Pre-Migration to Catch Patterns Early)

- **`eslint-plugin-vue`** with `plugin:vue/vue3-recommended` config. The current
  project uses `eslint-plugin-vue@^8.7.1` which should be updated to `10.4.0`
  for current Vue 3 migration rule coverage. Key rules:
  - `vue/no-deprecated-v-bind-sync` — detects `.sync` modifier (95 occurrences)
  - `vue/no-deprecated-slot-attribute` — detects old slot syntax
  - `vue/require-explicit-emits` — requires `emits` option
  - `vue/no-deprecated-v-on-native-modifier` — detects `.native` modifier
  - `vue/no-deprecated-destroyed-lifecycle` — detects old lifecycle hooks

### Vuetify-Specific

- **No automated Vuetify 2 → 3 migration tool exists.** There is no codemod or
  compat build for Vuetify. All Vuetify component prop, event, and slot changes
  must be migrated manually. The Vuetify 3 Upgrade Guide is the primary
  reference: https://vuetifyjs.com/en/getting-started/upgrade-guide/

## Third-Party Dependency Migration Map

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| `vue` | `^2.7.0` | `3.5.21` | Latest verified stable Vue 3 release |
| `vuetify` | `^2.7.2` | `3.12.4` | Latest targeted Vuetify 3 release; complete component API rewrite |
| `vue-router` | `^3.6.5` | `4.6.3` | Matches the newer `wrap` baseline; `createRouter()`, new history API |
| `vue-i18n` | `^8.28.2` | `9.14.5` | Latest stable `9.x` step for a lower-churn migration path |
| `@auth0/auth0-spa-js` | Current Vue 2 setup | Remove | Replace custom plugin usage during migration |
| N/A | N/A | Add `@auth0/auth0-vue@2.3.3` | Matches `wrap`; acceptable baseline until a newer verified bump is chosen |
| `@vitejs/plugin-vue2` | `^2.3.3` | `@vitejs/plugin-vue@5.2.4` | Matches `wrap` and current project family usage |
| `@logue/vue2-helpers` | `^2.3.0` | Remove | No longer needed |
| `vue2-helpers` | `^2.1.1` | Remove | No longer needed |
| `vue-demi` | `^0.14.10` | Remove or keep | Only if other deps still need it |
| `vue-apexcharts` | `^1.6.2` | `vue3-apexcharts@1.8.0` | Latest verified Vue 3 package |
| `vuedraggable` | `^2.24.3` | `vue-draggable-next@2.2.1` | Matches `wrap`; clearer Vue 3 path than legacy `vuedraggable` |
| `vue-pdf-embed` | `^1.2.1` | `vue-pdf-embed@2.1.3` | Latest verified Vue 3-compatible version |
| `sass` | `~1.32.13` | `1.92.0` | Latest verified stable Sass; supports Vuetify `@use` flow |
| `eslint-plugin-vue` | `^8.7.1` | `10.4.0` | Latest verified plugin release with Vue 3 support |
| `unplugin-vue-components` | `^28.7.0` | Same, reconfigure | Update resolver for Vuetify 3 |
| N/A | N/A | Add `vite-plugin-vuetify@2.1.2` | Latest verified Vuetify Vite integration |
| `@mdi/font` | Existing CSS font icons | Keep | Match `wrap` unless a strong reason emerges to switch |

## Specific Breaking Changes Requiring Manual Attention

### Vue Router 3 → 4

- `new Router()` → `createRouter()` with `history: createWebHistory()`
- `RouteConfig` type → `RouteRecordRaw`
- Catch-all route `path: "*"` (line 524 of `router.ts`) →
  `path: "/:pathMatch(.*)*"`
- `router.onReady()` → `router.isReady()` (already used in `auth0-plugin.js`,
  may be a polyfill or broken call under Router 3)
- `<router-link>` removes `append`, `event`, `tag`, `exact` props
- `<transition>` and `<keep-alive>` must wrap inside `<router-view>` slot:
  `<router-view v-slot="{ Component }"><component :is="Component" /></router-view>`
- Scroll behavior: `x`/`y` → `left`/`top`

### Vue 3 Core

- `.sync` modifier (95 occurrences) → `v-model:propName`
- `v-on="$listeners"` (72 occurrences) → remove (covered by `v-bind="$attrs"`)
- `$scopedSlots` (14 occurrences) → `$slots` (slots are now functions)
- `Vue.prototype.$http` → `app.config.globalProperties.$http` or provide/inject
- `Vue.prototype.$auth0` / `Vue.prototype.$snack` → provide/inject composable
- `this.$set()` (1 occurrence in `HealthCheckPage.vue`) → direct assignment
- Custom directive `v-yk-btn`: `bind` hook → `beforeMount`
- `v-if`/`v-for` precedence is reversed in Vue 3 (if both on same element)
- `$attrs` now includes `class`, `style`, and event listeners
- Transition class names: `.v-enter` → `.v-enter-from`, `.v-leave` →
  `.v-leave-from`

### Vuetify 2 → 3

- **Activator slots** (25 occurrences): `{ on, attrs }` → `{ props }` with
  `v-bind="props"`
- **v-model**: `value`/`@input` → `model-value`/`@update:model-value`
- **Vuetify input migration audit is required:** nearly every input-like
  component needs review for `value`/`@input` usage versus `v-model` /
  `model-value`. Prefer `v-model` directly where possible so Vue 3 maps to
  `modelValue` consistently for custom and Vuetify components.
- **v-data-table** (101 occurrences): headers `text` → `title`, `value` →
  `key`; split into `v-data-table`, `v-data-table-server`,
  `v-data-table-virtual`; slot names changed (`expanded-item` →
  `expanded-row`, `header` → `columns`)
- **Input variants**: `filled`/`outlined`/`solo` props → `variant` prop
- **Size props**: `small`/`x-small`/`large` → `size` prop
- **Density**: `dense` → `density="compact"`
- **v-btn**: `fab` removed; `flat`/`outlined`/`text`/`plain` → `variant` prop
- **v-select**: `item-text` → `item-title`
- **v-menu**: `offset-y`/`offset-x` → `offset` prop
- **v-checkbox**: `input-value` → `model-value`
- **Validation**: `validate-on-blur` → `validate-on="blur"`;
  `v-form.validate()` now returns a Promise
- **Color classes**: `success--text` → `text-success`
- **`background-color`** → `bg-color`
- **Layout system**: `app`, `clipped`, `fixed`, `stateless` props removed from
  `v-app-bar`/`v-navigation-drawer` (new layout system)
- **v-list** restructured: `v-list-item-content`/`v-list-item-icon`/
  `v-list-item-avatar` removed, use default/`prepend`/`append` slots
- **v-tabs**: `v-tabs-items` → `v-window`, `v-tab-item` → `v-window-item`
- **v-expansion-panel**: `v-expansion-panel-header` → `v-expansion-panel-title`,
  `v-expansion-panel-content` → `v-expansion-panel-text`
- **Theme setup**: `createVuetify()` with `theme.themes.light.colors` (not
  `theme.themes.light` directly)
- **Defaults configuration:** use Vuetify 3 `defaults` in `createVuetify()` to
  replace repeated local styling props where possible. `wrap` is the primary
  internal reference for this pattern.
- **Icon set must be configured explicitly:** use `mdi/font` initially to match
  `wrap` and reduce migration churn. A later SVG/tree-shaking optimization can
  be evaluated separately if needed.
- **$vuetify access**: `this.$vuetify.breakpoint` → `useDisplay()`,
  `this.$vuetify.theme` → `useTheme()`, `this.$vuetify.goTo()` → `useGoTo()`
- **SASS**: must switch from `@import` to `@use "vuetify/settings"` with
  `$variable` overrides
- **CSS audit is required:** `yk-style.css` and `vuetify2-extensions.css`
  should be reviewed for overrides that either break under Vuetify 3 or should
  be replaced by framework defaults, theme config, or utility classes.

### vue-i18n 8 → 9

- `new VueI18n()` → `createI18n()`
- `<i18n>` component → `<i18n-t>`, `path` prop → `keypath` prop
- `$tc` (used in composable bridge) → still available but returns string only
- Custom `missing` handler signature may change
- Linked messages: `@:(key)` → `@:{'key'}`
- The existing `useI18n()` bridge in `vue-i18n-plugin.js` can be replaced with
  the official `useI18n()` from `vue-i18n` v9

## Recommended Solution

Adopt a two-stage migration: first, prepare the codebase while still on Vue 2
(reducing the size of the breaking-change diff), then perform a single
coordinated dependency swap and fix remaining errors.

**Why not a gradual runtime upgrade?** Vuetify 2 is incompatible with Vue 3
(including `@vue/compat`). The app cannot run in a hybrid state where some parts
use Vue 3 and others use Vuetify 2. All core dependencies must switch together.

### Phase 1: Structural Decoupling (While Still on Vue 2)

**Goal:** Minimize the diff size of the dependency swap by eliminating Vue 2
patterns that can be fixed without changing the runtime.

**Implementation:**
- Validate Node runtime compatibility first across `Dockerfile`,
  `web/development.Dockerfile`, and `api/development.Dockerfile`. The repo is
  currently on `node:20.10.0-alpine3.19`, which appears sufficient for the
  currently targeted migration package set, but if the final chosen package
  versions require a newer Node release then upgrade the Dockerfiles before any
  dependency migration work begins.
- Create a dedicated migration branch and keep feature work flowing by merging
  from main frequently rather than freezing all frontend work.
- Update `eslint-plugin-vue` to `10.4.0` and enable
  `plugin:vue/vue3-recommended`. Use ESLint's `--fix` to auto-correct patterns
  where possible.
- Enable or trial `strict: true` in the web TypeScript config during this phase.
  If full strict mode cannot land in one PR, document the blockers and reduce
  them incrementally before the dependency swap.
- Run `@originjs/vue-codemod` and `vue-upgrade-tool` in dry-run mode to
  identify the full scope of mechanical transforms. Apply safe transforms
  (lifecycle renames, slot syntax, `this.$set` removal, emit declarations).
- Preserve the completed filter / `$snack` / dead `$http` cleanup work and do
  not reintroduce those global patterns while touching adjacent files.
- Replace the remaining `Vue.prototype.$auth0` usage as part of the coordinated
  Auth0 replacement during the Vue 3 swap rather than polishing the legacy Vue
  2 plugin path further.
- Do not introduce a Vue 2 `$listeners` compatibility shim as a Phase 1 bridge.
  Leave `$listeners` / `$scopedSlots` wrapper cleanup for the coordinated Vue 3
  swap, where each wrapper can be converted directly to explicit `emits`,
  `$attrs`, and Vue 3 slot patterns instead of adding temporary abstractions.
- Audit custom component APIs that currently emulate Vue 2 `v-model` via
  `value` and `@input`, and plan replacements using Vue 3 `v-model` /
  `modelValue` conventions where possible.
- Inventory current Vuex responsibilities and assign each one to a migration
  target:
  - server-backed resource state → existing or new `use-*` resource composables
  - feature-local shared state → focused composables colocated with the feature
  - true app-wide shell state → a minimal app composable, only if needed
- Use `/home/marlen/wrap` as the primary internal reference for composable-first
  Vue 3 patterns. If `wrap` does not have an example for a specific migration
  concern, check `/home/marlen/elcc-data-management`,
  `/home/marlen/dune-thrive`, or `/home/marlen/internal-data-portal`.
- Convert the remaining 35 Options API components to `<script setup>`
  Composition API where practical.
- Convert remaining `.js` infrastructure files (plugins, composables, and any
  extracted store helpers)
  to TypeScript.
- Document a front-end QA checklist for login, dashboard, travel request edit
  flows, expense flows, administration tables, and Travel Desk flows.
- Expand web test coverage around app bootstrap, auth, router navigation, and
  high-traffic CRUD flows.

**Pre-migration pattern cleanup targets:**
- `.sync` → leave as-is (requires Vue 3 `v-model:prop` syntax to replace)
- `$listeners` → leave as-is (requires Vue 3 `$attrs` merge to replace)
- `$scopedSlots` → leave as-is for now; replace alongside `$listeners` during
  the coordinated Vue 3 wrapper cleanup
- Filters → completed
- `Vue.prototype` → partially completed (`$snack` and dead `$http` removed;
  legacy Auth0 plugin remains and should be replaced during the coordinated
  Vue 3 swap)
- `this.$set` → replace with direct assignment (works in Vue 2.7 reactive)

**Benefits:**
- Reduces the breaking-change diff by hundreds of lines.
- Makes the dependency swap more reviewable and less error-prone.
- Allows multiple contributors to work in parallel with merged PRs.
- Gives us a known, shrinking list of blockers before the swap.

### Phase 2: Coordinated Dependency Swap

**Goal:** Switch all core runtime dependencies in a single coordinated step so
the app compiles and boots on Vue 3 + Vuetify 3.

**Implementation:**
- Lock the core migration dependency group to exact versions during the swap
  rather than loose ranges:
  `vue`, `vuetify`, `vue-router`, `vue-i18n`, `@vitejs/plugin-vue`,
  `vite-plugin-vuetify`, and other tightly-coupled migration dependencies.
  This reduces secondary dependency churn while component errors are being
  fixed.
- Upgrade `vue` from `^2.7.0` to `3.5.21`.
- Replace `@vitejs/plugin-vue2` with `@vitejs/plugin-vue@5.2.4`.
- Add `vite-plugin-vuetify@2.1.2` for Vuetify 3 treeshaking and auto-import.
- Update `unplugin-vue-components` resolver from `VuetifyResolver()` (v2) to
  Vuetify 3 configuration.
- Upgrade `vuetify` from `^2.7.2` to `3.12.4` (latest targeted Vuetify 3 release).
- Upgrade `vue-router` from `^3.6.5` to `4.6.3`.
- Upgrade `vue-i18n` from `^8.28.2` to `9.14.5`.
- Upgrade `sass` from `~1.32.13` to `1.92.0`.
- Replace the current Auth0 browser-SDK-based Vue 2 plugin setup with
  `@auth0/auth0-vue@2.3.3`, following `wrap` as the primary internal reference.
- Replace `vue-apexcharts@^1.6.2` with `vue3-apexcharts@1.8.0`.
- Replace `vuedraggable@^2.24.3` with `vue-draggable-next@2.2.1`.
- Upgrade `vue-pdf-embed` from `^1.2.1` to `2.1.3`.
- Remove `@logue/vue2-helpers`, `vue2-helpers`, and `vue-demi` (if unused).
- Convert `web/src/main.js` to Vue 3 bootstrap using `createApp(...)`:
  - `app.use(router)`, `app.use(vuetify)`, `app.use(i18n)`
  - Custom directive `v-yk-btn`: rename `bind` hook to `beforeMount`
  - Register ApexCharts: `app.use(VueApexCharts)` (vue3-apexcharts)
- Rewrite `web/src/plugins/vuetify-plugin.js` using `createVuetify()`:
  ```js
  import { createVuetify } from "vuetify"
  import "vuetify/styles"
  import { aliases, mdi } from "vuetify/iconsets/mdi"
  ```
- Add Vuetify 3 `defaults` configuration in `web/src/plugins/vuetify-plugin.js`
  to replace repeated UI prop conventions where possible.
- Standardize common global defaults in `createVuetify()`, especially
  `variant="outlined"` and `density="compact"` for the input families where
  that matches current app conventions.
- Keep the icon strategy on `mdi/font` during the migration to match `wrap` and
  avoid unnecessary icon churn during the framework upgrade.
- Modernize the Vuetify theme definition to follow a more robust structure like
  `wrap` rather than carrying forward a minimal Vuetify 2-era config.
- Audit `yk-style.css` and `vuetify2-extensions.css`:
  - migrate SASS overrides from `@import` to `@use`
  - remove overrides that conflict with Vuetify 3 utility classes
  - replace CSS workarounds with Vuetify 3 theme/defaults configuration where
    practical
- Rewrite `web/src/router.ts`:
  - `createRouter()` with `history: createWebHistory()`
  - `RouteConfig` → `RouteRecordRaw`
  - Catch-all `path: "*"` → `path: "/:pathMatch(.*)*"`
- Rewrite `web/src/plugins/auth0-plugin.js` around `@auth0/auth0-vue`, or
  replace it entirely if the official SDK makes the wrapper unnecessary.
- Replace `web/src/store/index.js` with composable-backed state:
  - extract app shell concerns such as `setAppSidebar` into a focused app-level
    composable
  - move store-backed resource logic into existing or new `use-*` composables
  - remove `new Vuex.Store()` entirely instead of migrating it to another store
    library
- Rewrite `web/src/plugins/vue-i18n-plugin.js`:
  - `createI18n()` with `legacy: false` for Composition API mode
  - Replace custom `useI18n()` bridge with official `useI18n()` from vue-i18n 9
  - Verify custom `missing` handler signature compatibility
- Run codemods (`vue-codemod -a` and `vue-upgrade-tool`) for remaining
  mechanical transforms:
  - `.sync` → `v-model:propName`
  - `v-on="$listeners"` → remove (now part of `$attrs`)
  - `$scopedSlots` → `$slots`
- Define a Minimum Viable Boot gate before Phase 3 begins. At minimum, confirm
  that these smoke-test routes load and remain usable on Vue 3 + Vuetify 3:
  - `/sign-in`
  - `/dashboard`
  - `/health-check`
  - one representative travel request flow route
  - one representative administration route

**Benefits:**
- Gets the app compiling and booting on Vue 3 + Vuetify 3 in one step.
- Avoids a non-functional intermediate state where Vue 3 runs with Vuetify 2.
- All infra-level changes are visible in a single reviewable diff.

### Phase 3: Vuetify 3 Component Migration (Shared Patterns First)

**Goal:** Update all Vuetify component usage to the v3 API, starting with
shared components that are reused across many pages.

**Implementation:**
- Replace `useDisplayVuetify2()` with Vuetify 3 `useDisplay()` composable.
- Replace `useVuetify2SortByShim()` with Vuetify 3 data-table sort conventions.
- Audit all manual `value` / `@input` bindings on custom components and
  Vuetify components. Replace them with `v-model` or Vue 3
  `model-value` / `@update:model-value` patterns as appropriate.
- Use a component-first migration order rather than broad feature waves:
  - data table wrappers and sort/query helpers first
  - shared input wrappers and `v-model`-heavy form components next
  - button, dialog, menu, and list primitives after that
  - feature screens only after shared component patterns have settled
- Migrate activator slots: `{ on, attrs }` → `{ props }` (25 occurrences).
- Migrate `v-data-table` usage (101 occurrences):
  - Header definition: `text` → `title`, `value` → `key`
  - Choose appropriate variant: `v-data-table`, `v-data-table-server`, or
    `v-data-table-virtual`
  - Update slot names and scoped slot signatures
- Migrate input components:
  - prefer `v-model` syntax instead of manual prop/event wiring where possible
  - `filled`/`outlined`/`solo` → `variant="filled"` / `"outlined"` / `"solo"`
  - `item-text` → `item-title` on `v-select`/`v-autocomplete`
  - `validate-on-blur` → `validate-on="blur"`
  - `v-form.validate()` now returns a Promise (update all await-less calls)
- Migrate `v-btn`: `fab` removed, `flat`/`outlined`/`text` → `variant` prop.
- Migrate `v-list`: remove `v-list-item-content`/`v-list-item-icon`/
  `v-list-item-avatar`, use `prepend`/`append` slots instead.
- Migrate `v-tabs`: `v-tabs-items` → `v-window`, `v-tab-item` →
  `v-window-item`.
- Migrate size/density: `small`/`dense` → `size="small"` /
  `density="compact"`.
- Migrate color classes: `success--text` → `text-success`.
- Migrate `background-color` → `bg-color`.
- Migrate `v-menu` `offset-y`/`offset-x` → `offset`.
- Update layout components if `app`/`clipped`/`fixed`/`stateless` are used.
- Introduce local wrapper components or helper composables where that reduces
  repeated migration work across tables, dialogs, and forms.

**Benefits:**
- Concentrates the Vuetify-specific churn in one focused pass.
- Shared components fixed first prevents repeating fixes across dozens of pages.

### Phase 4: Feature Screen Completion

**Goal:** Finish feature-specific pages after shared component patterns are
stable.

**Implementation:**
- Migrate high-traffic modules next:
  travel requests, manage travel requests, expenses, and dashboard tables.
- Migrate Travel Desk and administration modules after shared patterns have
  settled.
- Finish extracting any remaining feature-specific Vuex usage into
  composables.
- Migrate `vuedraggable` usage in
  `TravelDeskFlightSegmentsDraggable.vue` to the v4 API.
- Migrate `vue-apexcharts` usage in `FlightStatisticsPieChart.vue` and
  `FlightStatisticsBarChart.vue` to `vue3-apexcharts`.
- Migrate `vue-pdf-embed` usage in `PdfViewer.vue` to v2 API.
- Migrate the 49 files still importing from `vue2-helpers` to Vue 3 equivalents.
- Convert remaining JavaScript-heavy frontend infrastructure files to
  TypeScript as they are touched.

**Benefits:**
- Prioritizes the most reused code first.
- Prevents repeating migration fixes across dozens of components.

### Phase 5: Cleanup, Hardening, and Documentation

**Implementation:**
- Remove dead shims and bridge code that were only needed during migration.
- Remove Vue 2-only type shims such as `web/types/vuetify-2-types-shim.d.ts`.
- Remove `@logue/vue2-helpers` and `vue2-helpers` imports (49 files).
- Remove custom CSS files that compensated for Vuetify 2 limitations
  (`vuetify2-extensions.css`) if no longer needed.
- Refresh frontend documentation in `AGENTS.md` and any affected workflow docs
  once the new standard patterns are settled.
- Add changelog notes under `## [Unreleased]` describing the framework
  migration in user-facing language.
- Run full frontend linting, type-checking, tests, and end-to-end manual QA.
- Remove or clean up temporary migration artifacts from
  `/home/marlen/code/icefoganalytics/travel-authorization/agents/tmp` and any
  `now.*` scratch files that were only used during execution.
- Delete this migration plan file once the migration is complete and the work
  has been fully landed, since it is being committed temporarily to keep the
  implementation diff clear during execution.

**Benefits:**
- Leaves the codebase in a stable, supportable state instead of a half-migrated
  one.
- Updates project guidance so new work does not reintroduce legacy patterns.

## Decision Factors

1. **Supportability:** Vue 2 and Vuetify 2 are already out of support, so the
   migration has platform risk reduction value even before new features.
2. **`@vue/compat` is not viable:** Vuetify 2 depends on Vue 2 internal APIs
   that the compatibility build does not support. This rules out a gradual
   runtime migration and requires a coordinated dependency swap.
3. **Pre-migration preparation is the key risk mitigation:** The more Vue 2
   patterns we eliminate before the swap, the smaller and more reviewable the
   breaking-change diff becomes.
4. **Delivery risk:** A preparation-then-swap approach is lower risk than a
   long-lived broken branch, because all preparation PRs can be merged and
   tested individually on Vue 2.
5. **Module breadth:** The repo has a large frontend surface area (344 SFCs),
   so shared wrapper patterns will pay for themselves quickly.
6. **State strategy:** This migration should not preserve Vuex or introduce
   Pinia by default. The stronger target is composable-first state, using
   `/home/marlen/wrap` as the primary quality reference for how shared state,
   route-query state, data loading, and UI helpers should be structured in
   Vue 3.
7. **Vuetify churn:** Vuetify 3 is effectively a rewrite. No automated tooling
   exists. The 101 data tables, 94 dialogs, and 652 buttons each need manual
   prop/event/slot review.
8. **Codemods reduce manual effort but require verification:** Both
   `vue-codemod` and `vue-upgrade-tool` can automate mechanical transforms,
   but their output is not guaranteed correct and must be verified.
9. **`wrap` is the best internal quality reference:** Its Vuetify defaults,
   theme structure, composable-first state patterns, and `@auth0/auth0-vue`
   setup should be treated as the primary local model unless TravelAuth has a
   concrete reason to diverge.

## Explicit Decisions

1. **Migration pattern:** Keep the existing bridge-and-swap strategy. This is
   aligned with official Vue migration guidance for large codebases and with
   external guidance that warns against relying on `@vue/compat` when Vuetify 2
   is present.
2. **Runtime prerequisite:** Confirm that the Node version used by the repo's
   Dockerfiles is high enough for the final migration dependency set before
   upgrading packages. If it is not, upgrade Node first.
3. **State management:** Do not migrate to Vuex 4 or Pinia as a destination.
   The target is composable-first state, using `wrap` as the primary local
   reference.
4. **Icon strategy:** Use `mdi/font` during the migration to match `wrap` and
   minimize churn. Revisit SVG icons later only if there is a compelling
   performance or bundle-size reason.
5. **Dependency injection strategy:** Prefer direct imports and composables, or
   provide/inject where needed. Do not preserve legacy `this.$http` or
   `this.$snack` usage through `app.config.globalProperties`.
6. **TypeScript strictness:** Attempt to enable `strict: true` during Phase 1.
   If that cannot be completed immediately, shrink the gap before the runtime
   swap and document the remaining blockers explicitly.
7. **Vuetify global configuration:** Use Vuetify 3's global `defaults`
   configuration in `createVuetify()` to define the shared baseline behavior
   for common components, following the `wrap` pattern. This should be used for
   app-wide conventions like input variants, density, colors, button defaults,
   and similar repeated component props so those choices are configured once
   instead of repeated throughout templates.
8. **Auth0 integration:** Replace the custom browser-SDK-centric Vue 2 plugin
   path with `@auth0/auth0-vue`, following `wrap` unless TravelAuth has a
   specific requirement that forces a wrapper.
9. **Vuetify theme structure:** Modernize the theme definition during the swap
   instead of carrying forward a minimal Vuetify 2-style setup.
10. **Execution style:** Land the migration one minimum committable slice at a
   time. Each slice should leave the branch in a coherent, reviewable, and
   testable state rather than batching large unrelated changes together.
11. **Swap stabilization:** Use exact versions for the core migration
    dependency group during Phase 2, and do not move into component migration
    work until the Minimum Viable Boot smoke-test routes are passing.
12. **Scratch-work location:** Agents should write analysis artifacts,
    inventories, migration notes, and other temporary working documents to
    `/home/marlen/code/icefoganalytics/travel-authorization/agents/tmp`.
    Existing `now.*` files in the codebase may also be used as scratch pads
    when helpful, but they should be treated as temporary working surfaces
    rather than permanent project documentation.
13. **Listener and slot cleanup timing:** Do not add temporary Vue 2 shims for
    `$listeners` or `$scopedSlots` just to reduce template counts. Defer that
    work to the coordinated Vue 3 swap so wrappers can be converted directly to
    their real Vue 3 contracts.

## Recommended Action

Begin with a formal migration epic and execute the work in this order:

1. **Validate runtime prerequisites and structurally decouple on Vue 2:**
   confirm Dockerfile Node compatibility first, then update linting, trial or
   enable strict TypeScript, run codemods for safe transforms, continue
   removing preserve-worthy Vue 2 patterns, convert Options API stragglers, and
   expand test coverage.
2. **Coordinated dependency swap:** Upgrade Vue, Vuetify, Router, i18n, and all
   third-party Vue 2 libs simultaneously. Get the app compiling and booting
   without carrying Vuex forward.
3. **Component-first Vuetify migration:** Fix shared components first (data
   tables, inputs, dialogs, menus, lists, forms, layout), then finish feature
   screens.
4. **Cleanup:** Remove bridge code, type shims, and dead imports. Update docs.

All implementation work should be delivered one minimum committable slice at a
time. Each PR should be as small as possible while still leaving the codebase
in a coherent, reviewable, and testable state.

As agents work through this plan, they should write analysis artifacts,
inventories, audit notes, and other temporary working files to
`/home/marlen/code/icefoganalytics/travel-authorization/agents/tmp`.
Existing `now.*` files in the codebase may also be used as scratch pads when
helpful.

The first implementation slice should focus on Phase 1 only. Each Phase 1 PR
can be merged independently and tested on Vue 2, building confidence before the
coordinated swap.

## Files To Review

1. `web/package.json` - Current frontend dependency versions and upgrade scope.
2. `web/vite.config.js` - Vue 2 Vite plugin and component resolver setup.
3. `web/tsconfig*.json` - TypeScript strictness decision and migration blockers.
4. `Dockerfile`, `web/development.Dockerfile`, and `api/development.Dockerfile`
   - Node runtime baseline and first-step compatibility check for target
   package versions.
5. `web/src/main.js` - Vue 2 bootstrap entrypoint that must move to `createApp`.
6. `web/src/router.ts` - Router v3 setup, catch-all route on line 524.
7. `web/src/store/index.js` - Vuex 3 root store to inventory and extract into
   composables, including the `setAppSidebar` bug on line 46.
8. `web/src/plugins/vuetify-plugin.js` - Vuetify 2 initialization, icon strategy,
   defaults, and theme setup.
9. `web/src/plugins/vue-i18n-plugin.js` - Vue 2 style i18n with custom `useI18n` bridge.
10. `web/src/plugins/auth0-plugin.js` - Vue 2 plugin `install()` with `Vue.prototype`.
11. `web/src/use/utils/use-display-vuetify2.js` - Existing Vuetify 2 bridge helper.
12. `web/src/use/utils/use-vuetify2-sort-by-shim.js` - Existing data-table migration shim.
13. `web/types/vuetify-2-types-shim.d.ts` - Vuetify 2 type compatibility layer.
14. `web/src/yk-style.css` and `web/src/vuetify2-extensions.css` - CSS and
   SASS override audit surface.
15. `web/src/pages/` and `web/src/components/` - Main feature migration surface.
16. `agents/tmp/` and any existing `now.*` files - Approved temporary working
   surfaces for analysis artifacts and migration scratch work.

## Out Of Scope

- Rewriting unrelated frontend architecture beyond what is required to move the
  project to Vue 3, Vuetify 3, and composable-first state management.
- Large visual redesign work that is unrelated to framework compatibility.
- Backend API redesign unrelated to frontend migration needs.

## Related Issues

- https://github.com/icefoganalytics/travel-authorization/issues/100

## Internal Reference Projects

- Use `/home/marlen/wrap` as the primary quality reference for Vue 3 +
  Vuetify 3 implementation patterns. It has examples of most of the structures
  this migration will need.
- In particular, follow `wrap` for Vuetify `defaults`, theme structure,
  composable-first state, and `@auth0/auth0-vue` integration unless TravelAuth
  has a specific requirement that forces a different pattern.
- If `wrap` does not have a relevant example, check these secondary projects:
  `/home/marlen/elcc-data-management`, `/home/marlen/dune-thrive`, and
  `/home/marlen/internal-data-portal`.
- Treat those secondary projects as fallback references only. They may still be
  useful for Vue 3 examples, but `wrap` should drive the preferred patterns
  where possible.

## References

- Vue 3 Migration Guide: https://v3-migration.vuejs.org/
- Vue 3 Compat Build (not viable for this project): https://v3-migration.vuejs.org/migration-build
- HeroDevs Vue 2 to Vue 3 migration guidance: https://www.herodevs.com/blog-posts/what-it-really-takes-to-migrate-from-vue-2-to-vue-3
- Vuetify 3 Upgrade Guide: https://vuetifyjs.com/en/getting-started/upgrade-guide/
- Vue Router 4 Migration: https://router.vuejs.org/guide/migration/
- vue-i18n 9 Breaking Changes: https://vue-i18n.intlify.dev/guide/migration/breaking
- @originjs/vue-codemod: https://www.npmjs.com/package/@originjs/vue-codemod
- vue-upgrade-tool: https://github.com/UnrefinedBrain/vue-upgrade-tool
- eslint-plugin-vue Rules: https://eslint.vuejs.org/rules/
