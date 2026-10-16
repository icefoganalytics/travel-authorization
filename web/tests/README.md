# Web Testing Guide

This directory contains the frontend test support files for the Travel Authorization web
application.

## Running Tests

See [../../bin/README.md](../../bin/README.md#testing) for the canonical web test commands.

## Directory Overview

```text
web/tests/
├── factories/     # Typed API response fixture factories
├── support/       # Reusable test helpers
├── setup.ts       # Vuetify prerequisites and automatic wrapper cleanup
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
6. Use Vue Test Utils `mount` with jsdom and the shared `mockRouter` and `mockVuetify` helpers
7. Keep scenario data and mount options inline; reserve `beforeEach` for shared mock defaults
8. Mock API boundaries when exercising components with their real composables and children
9. Use `flushPromises` for asynchronous rendering and assert directly on DOM controls or public component contracts

`tests/setup.ts` enables `enableAutoUnmount(afterEach)`, so wrappers are cleaned up automatically.
Explicitly unmount a wrapper only when unmounting is the behavior under test.

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

## Fixture Factories

Use Fishery factories under `web/tests/factories/` to build complete frontend API response objects.
Type each factory with the corresponding frontend API type rather than a backend database model.
Use `build` or `buildList` for the shared shape and keep scenario-specific values in the test setup.

## Current Support Files

- `web/tests/support/simple-dedent.js` - simple string helper used by tests
- `web/tests/support/mock-router.ts` - memory-history router for mounted component tests
- `web/tests/support/mock-vuetify.ts` - real Vuetify components and directives for mounted tests

As the frontend test suite grows, prefer adding shared mocks and setup helpers under
`web/tests/support/` rather than embedding them repeatedly in test files.

## Best Practices

- Keep test data close to the test unless it is reused
- Use exact component names and route names from the code under test
- Test save flows, emitted events, and navigation behavior where those are the user-facing risks
- Add new README guidance here if frontend testing patterns become more specific over time
