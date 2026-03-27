# Queries

This directory contains reusable raw SQL query builders.

Use a query module when:

- the SQL is substantial enough that keeping it inline would make a model, service, or controller
  harder to read
- the SQL is reused in more than one place, or is likely to be reused
- the SQL should be tested directly as its own unit

Keep queries focused:

- return a single SQL fragment or subquery
- keep the SQL readable and explicit
- prefer dedicated query files over overly generic helpers when the callers are still model-specific

Typical usage patterns:

- models consume query builders from scopes
- services or other queries consume them when composing larger SQL expressions

Tests should mirror source structure:

- `api/src/queries/example/build-thing-query.ts`
- `api/tests/queries/example/build-thing-query.test.ts`

If a SQL fragment is only used once and is still easy to read inline, it does not need to move
here.
