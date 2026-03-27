# API Tests

This directory contains the backend test suite for TravelAuth using Vitest and Fishery factories.

## Running Tests

```bash
# Run all API tests
dev test_api

# Run a specific file once
dev test api -- api/tests/services/example.test.ts --run

# Run a pattern
dev test api -- --grep "travel desk"
```

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

## Test Lifecycle Notes

Vitest configuration loads the API test setup in roughly this order:

1. `api/vitest.config.mts` loads config and setup wiring
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
[`agents/templates/fishery-factory.md`](../../agents/templates/fishery-factory.md).

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
