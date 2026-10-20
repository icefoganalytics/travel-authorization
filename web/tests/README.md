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
3. Name tests `when [condition], [behavior]` and use ordered `// Arrange`, `// Act`, and `// Assert` sections
4. Focus each test on one observable behavior, such as rendered controls, emitted events, or a query contract
5. Reuse infrastructure from `web/tests/support/`; keep each scenario's data, mounting, and actions inline
6. Use Vue Test Utils `mount` with jsdom and the shared `mockRouter` and `mockVuetify` helpers
7. Keep scenario data and mount options inline; reserve `beforeEach` for shared mock defaults
8. Mock API boundaries when exercising components with their real composables and children
9. Use `flushPromises` for asynchronous rendering and assert directly on DOM controls or public component contracts
10. Keep assertions in the final Assert section; await operations or explicit request signals in Act
11. Let the Vitest configuration reset mocks; use teardown only for real non-mock resources such as effect scopes

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

## Readable Assertions

The final assertion should make the expected behavior obvious without tracing a query or transformation.
Select the relevant card, input, event, or returned state into an explanatory variable immediately
above its expectation. Prefer `get`/`getComponent` for controls that must exist so a missing control
fails directly, rather than allowing optional chaining to produce `undefined`.

- Scope repeated fields to the relevant component or card before selecting a control. Avoid collecting
  every text field, filtering by its label, and mapping values into a separate summary array.
- Keep `expect` targets direct: an input's value, an emitted event, a real query object, or the
  composable's returned state. Put literal expected values beside the assertion.
- Prefer one meaningful assertion for one contract. Clear direct assertions may cover related facts
  that jointly prove that contract; split independently meaningful outcomes into separate scenarios.
- For a rendered collection, assert its exact ordered contents with one `toEqual` array, using
  `expect.objectContaining` for relevant DOM properties. Select the controls before `expect`;
  avoid separate length and per-item assertions for the same collection outcome.
- Do not construct synthetic objects or add query-summary helpers to bundle unrelated expectations.
- Keep actions before Assert. Do not assert an intermediate state, perform more actions, and then
  continue asserting in the same test. Use separate named scenarios for distinct transitions.
- Keep native promise-error matchers. When invoking the subject is the assertion, `// Act / Assert`
  is appropriate; do not add a redundant assertion or no-op action to separate the phases.

These conventions follow the same mounted-component and scenario-oriented approach as WRAP while
keeping TravelAuth's existing Fishery factories and shared router/Vuetify setup.

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
