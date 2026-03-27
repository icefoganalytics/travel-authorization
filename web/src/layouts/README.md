# Layouts

Layouts are components that wrap a page or collection of pages.

Rules:

1. Layouts should provide shared page structure, not page-specific business logic.
2. Layouts may be used as route components when they host child routes.
3. Layouts follow the naming convention `<ModelName><Action>Layout` when tied to a specific domain flow.
4. Layouts should attempt to map folder structure to file structure, but may be nested when several layouts exist for the same model.
