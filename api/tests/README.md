# API Tests

This directory contains the backend test suite for TravelAuth using Vitest and Fishery factories.

## Running Tests

See [../../bin/README.md](../../bin/README.md#testing) for the canonical API test commands and test container management guidelines.

## Test Structure

Tests should mirror `api/src/`:

- `api/src/models/user.ts` -> `api/tests/models/user.test.ts`
- `api/src/services/travel-authorizations/create-service.ts` ->
  `api/tests/services/travel-authorizations/create-service.test.ts`

Current top-level test areas include:

```text
api/tests/
├── controllers/
├── data/
├── factories/
├── integrations/
├── middleware/
├── models/
├── policies/
├── serializers/
├── services/
└── support/
```

If a source file moves, move its mirrored test file too. If a source file is deleted, delete the
stale test.

## Test Pattern

Prefer this structure:

```typescript
describe("api/src/services/example/create-service.ts", () => {
  describe("CreateService", () => {
    describe(".perform", () => {
      test("when the input is valid, it creates the record", async () => {
        // Arrange
        // Act
        // Assert
      })
    })
  })
})
```

Guidelines:

- Use `test`, not `it`
- Use nested `describe` blocks: file path -> class/model -> method
- Use explicit `// Arrange`, `// Act`, and `// Assert` comments
- Prefer numbered peer entities like `user1`, `user2`
- Prefer one strong assertion with `toEqual(...)` over many low-signal assertions
- Test names should describe condition and outcome: `"when [condition], it [expected behavior]"`
- Use Fishery factories for test data
- In API test files, group imports by role: code under test and domain models/services first, then
  a blank line, then test support and factories.
- Use descriptive variable names, such as `workflowStepPlayersAttributes`
- Name policy-scoped query results with `scoped{Model}`, such as
  `scopedTravelDeskTravelRequests`
- Assert database state with `findAll()` without redundant `where` clauses unless the filter is
  under test
- Use negative spy assertions such as `expect(spy).not.toHaveBeenCalled()`
- Avoid `not.toHaveBeenCalledWith(...)`
- Controller tests should use `mockCurrentUser(user)` and `request()` from `@/support`
- Controller response assertions should prefer the double-expect pattern so failures are readable:
  first assert `response.status`, then assert `response.body`.
- Controller happy-path tests should prefer the real controller -> service -> serializer pipeline
  when the risk is that serializers cannot parse service results.
- Mock service methods for narrow controller error paths, not for the serialization proof.
- When adding controller coverage for related endpoints, keep edge-case coverage parallel unless the
  routes intentionally differ: happy path, service failure, authorization denial, and not-found.
- Do not add local `vi.restoreAllMocks()` hooks; `api/vite.config.mts` already enables mock
  cleanup with `clearMocks`, `mockReset`, and `restoreMocks`.

For common factories, import from `@/factories`:

- `userFactory`
- `travelAuthorizationFactory`
- `expenseFactory`
- `travelSegmentFactory`

Prefer one strong assertion:

```typescript
expect(scopedRecords).toEqual([
  expect.objectContaining({
    id: record1.id,
  }),
])
```

Avoid many low-signal assertions:

```typescript
expect(result).toHaveLength(1)
expect(result[0].id).toEqual(record1.id)
```

## Test Lifecycle Notes

Vitest configuration loads the API test setup in roughly this order:

1. `api/vite.config.mts` loads config and setup wiring
2. `api/tests/global-setup.ts` prepares database state, migrations, and base seeds
3. `api/tests/setup.ts` runs per-file setup and cleanup hooks
4. The requested test file executes

Keep per-file setup lightweight. Expensive initialization belongs in global setup.

## Factories

Prefer Fishery factories from `@/factories` for creating test data.

Examples:

```typescript
import { travelAuthorizationFactory, userFactory } from "@/factories"

const user = await userFactory.create()
const travelAuthorization = await travelAuthorizationFactory.create({
  userId: user.id,
})
```

If you need a new factory, follow the reusable template in
[`agents/templates/fishery-factory-template.md`](../../agents/templates/fishery-factory-template.md).

## Editor Helper

If you use the `create-test-file` extension, this workspace config still helps generate mirrored
test paths:

```json
{
  "createTestFile.nameTemplate": "{filename}.test.{extension}",
  "createTestFile.languages": {
    "[vue]": {
      "createTestFile.nameTemplate": "{filename}.test.{extension}.ts"
    }
  },
  "createTestFile.pathMaps": [
    {
      "pathPattern": "(api)/src/?(.*)",
      "testFilePathPattern": "$1/tests/$2"
    },
    {
      "pathPattern": "(web)/src/?(.*)",
      "testFilePathPattern": "$1/tests/$2"
    }
  ]
}
```
