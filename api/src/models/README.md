# Models

Models should match the database schema, and optionally provide various helper methods, or translations between database naming conventions and JS naming conventions.

There should be one model per database table.

Additional guidance:

- Keep model concerns focused on persistence, associations, scopes, and model-adjacent helpers.
- Put business logic in services rather than growing models into service objects.
- Keep database naming in `snake_case` and model-facing names in `camelCase`.
