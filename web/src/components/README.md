# Web Components

## Intent

This document exists to hold component-specific Vue and Vuetify guidance that would be too detailed
or fast-changing for `AGENTS.md`.

When a pattern is mainly about Vue components, Vuetify usage, or component composition, document it
here instead of expanding top-level project documentation.

## Vue Component Patterns

- Prefer explicit props over relying on `$attrs` for meaningful component API behavior.
- Keep shared context in the parent when practical, and pass it down rather than refetching the
  same record in multiple children.
- Keep each form component's public model contract consistent across fields instead of adding a
  one-off field event beside direct edits to a shared model object.
- Keep dependent-field rules in the specific form or card: watch its city field to update its
  province, rather than adding form-specific side effects to a shared location selector.
  Share repeated value parsing through pure utilities; keep state updates in the form watcher.
- Do not overwrite saved dependent fields when loading or replacing the form's record.
- Keep date-only form state as date-only values in the UI, and do datetime conversion only at the
  save boundary.
- Prefer simple one-way helpers over writable proxy computeds when a value is only needed for
  display or save-time transformation.
- When a prop needs parsing or another transformation, read `props.<name>` directly inside
  `computed`; the computed already tracks prop changes. Use `toRefs(props)` when passing an
  unchanged prop as a ref. Do not create an intermediate prop ref only to feed a computed
  transformation.
- Prefer small focused components over large multipurpose wrappers.
- Use component names that match the project naming convention described in `AGENTS.md`:
  `{Model}{Purpose}{VuetifyComponent}.vue`.
- Keep domain-specific component folders under `web/src/components/` in kebab-case directories.
- When components are tightly tied to routeable flows, keep page orchestration in `web/src/pages/`
  and reusable UI logic in `web/src/components/`.
- Prefer local template refs only where needed, and keep them grouped clearly near other local UI
  state.
- Consolidate role-specific components when one component with conditional rendering is clearer.
- Prefer existing list item components over hardcoded navigation structures.
- Use `v-if` for straightforward conditional rendering instead of computed component selection.
- Reduce nesting when wrappers such as extra `v-card-text` elements add no behavior.

## Collection Pagination

Use [EnhancedPagination](common/EnhancedPagination.vue) with
[useRouteQueryPagination](../use/utils/use-route-query-pagination.ts) for card and list collections.
Bind `page` and `perPage` to the API query and any `v-data-iterator`, and pass `totalCount` to the pager.
Expose `defaultPerPage` for configurable collection defaults. Use a unique `routeQuerySuffix` for
each collection so its page and page-size URL state do not affect neighboring collections.
The composable only synchronizes URL state; it does not implement pagination controls or fetch data.
For `v-data-table-server`, retain its native footer and bind the returned `page` and `perPage` refs
to `v-model:page` and `v-model:items-per-page`. It accepts initial page/page-size defaults and a
query-key suffix; it does not react to later changes to those options.
When a collection can fetch overlapping pages, abort superseded requests and preserve cancellation
through the HTTP client so an earlier request cannot update the displayed records or loading state.

## Naming

Use `{Model}{Purpose}{VuetifyComponent}.vue`.

1. **Model/Domain** - primary data model, such as `FlightStatistics` or `TravelAuthorization`
2. **Purpose** - specific function, such as `Filters`, `Jobs`, or `Edit`
3. **Vuetify Component** - wrapper shape, such as `Card`, `Dialog`, or `Select`

Put shared domain components in `/web/src/components/{model}/` using kebab-case directories and
PascalCase file names.

Group workflow-specific families beneath their domain when several components share the same
purpose. Expense-claim meal tables and totals cards live under `expenses/claim-submit/` and
`expenses/claim-review/`; shared expense controls stay at the domain root. These folders describe
workflow ownership, not a folder for every persisted status. Retain descriptive component names.

Examples:

- `FlightStatisticsFiltersCard.vue`
- `FlightStatisticsJobsDialog.vue`
- `UserTravelDeskAgentSelect.vue`

## Vuetify Notes

- Prefer Vuetify utility classes and theme semantics over ad hoc styling.
- Set shared component appearance through Vuetify theme configuration and `defaults`; use native props for local border, elevation, color, and variant choices so those choices remain overridable.
- Let headings and paragraphs inherit their component's foreground color. Global element colors can make text unreadable on colored cards and alerts.
- Use semantic theme colors (`primary`, `secondary`, `warning`) intentionally rather than piling on
  lighten/darken variants by default.
- Keep form layouts readable and consistent across cards, dialogs, and pages.
- Avoid non-Vuetify utility-class patterns that do not belong to this stack.
- Use Vuetify utility classes instead of custom CSS when available, such as `d-flex`,
  `align-center`, `bg-white`, and `h-full`.
- Remove redundant CSS that Vuetify already provides.
- Use `:loading` only for in-flight work. Avoid unexplained disabled buttons; when an action must be unavailable, use [`ConditionalTooltipButton`](common/ConditionalTooltipButton.vue) with tooltip text explaining the reason.
- Use `formRef.value.submit()` instead of `formRef.value.$el.submit()`.
- Prefer gap classes such as `ga-2` and `ga-3` over margin classes for flex spacing.
- Avoid `v-list-item-title` and `v-list-item-subtitle` for text that needs to wrap; use regular
  elements with utility classes.
- Use `useTemplateRef()` instead of `ref()` for template references. Omit explicit type arguments when Vue can infer the type from the static template ref.

## Related Docs

- [`../../../AGENTS.md`](../../../AGENTS.md) - project-wide frontend conventions
- [`../pages/README.md`](../pages/README.md) - routeable page guidance
- [`../layouts/README.md`](../layouts/README.md) - layout guidance
- [`../api/README.md`](../api/README.md) - frontend API layer guidance
- [`../use/README.md`](../use/README.md) - composable guidance
