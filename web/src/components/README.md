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
- Keep date-only form state as date-only values in the UI, and do datetime conversion only at the
  save boundary.
- Prefer simple one-way helpers over writable proxy computeds when a value is only needed for
  display or save-time transformation.
- Prefer small focused components over large multipurpose wrappers.
- Use component names that match the project naming convention described in `AGENTS.md`:
  `{Model}{Purpose}{VuetifyComponent}.vue`.
- Keep domain-specific component folders under `web/src/components/` in kebab-case directories.
- When components are tightly tied to routeable flows, keep page orchestration in `web/src/pages/`
  and reusable UI logic in `web/src/components/`.
- Prefer local template refs only where needed, and keep them grouped clearly near other local UI
  state.

## Vuetify Notes

- Prefer Vuetify utility classes and theme semantics over ad hoc styling.
- Use semantic theme colors (`primary`, `secondary`, `warning`) intentionally rather than piling on
  lighten/darken variants by default.
- Keep form layouts readable and consistent across cards, dialogs, and pages.
- Avoid non-Vuetify utility-class patterns that do not belong to this stack.

## Related Docs

- [`../../../AGENTS.md`](../../../AGENTS.md) - project-wide frontend conventions
- [`../pages/README.md`](../pages/README.md) - routeable page guidance
- [`../layouts/README.md`](../layouts/README.md) - layout guidance
- [`../api/README.md`](../api/README.md) - frontend API layer guidance
- [`../use/README.md`](../use/README.md) - composable guidance
