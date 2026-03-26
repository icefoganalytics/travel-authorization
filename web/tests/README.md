# Web Testing Guide

This directory contains the frontend test support files for the Travel Authorization web
application.

## Running Tests

```bash
dev test_web
```

To run tests from `web/` directly:

```bash
npm test
npm test -- --run
```

## Directory Overview

```text
web/tests/
├── support/       # Reusable test helpers
├── tsconfig.json  # Test TypeScript configuration
└── README.md
```

## Writing Tests

Frontend tests should mirror the source structure as closely as practical and focus on user-visible
behavior.

Guidelines:

1. Use `test`, not `it`
2. Use nested `describe` blocks with the full file path at the outer level
3. Prefer Arrange/Act/Assert comments in tests with meaningful setup
4. Focus assertions on what the user sees, what events emit, and what API calls happen
5. Prefer reusable helpers in `web/tests/support/` instead of duplicating mock setup

Example shape:

```typescript
describe("web/src/components/example/ExampleCard.vue", () => {
  describe("ExampleCard", () => {
    test("when the user saves, it emits the updated value", async () => {
      // Arrange

      // Act

      // Assert
    })
  })
})
```

## Current Support Files

- `web/tests/support/simple-dedent.js` - simple string helper used by tests

As the frontend test suite grows, prefer adding shared mocks and setup helpers under
`web/tests/support/` rather than embedding them repeatedly in test files.

## Best Practices

- Keep test data close to the test unless it is reused
- Use exact component names and route names from the code under test
- Test save flows, emitted events, and navigation behavior where those are the user-facing risks
- Add new README guidance here if frontend testing patterns become more specific over time
