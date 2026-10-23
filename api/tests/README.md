# API Tests

This is the TravelAuth backend test suite, using Vitest and Fishery factories.

For the shared backend feature workflow, see the
[Express Light Rail backend workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/express-light-rail-backend-workflow.md).
For scenario-oriented verification, see the shared
[code-organization reference](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/code-organization-reference.md#scenario-oriented-verification).
For reusable factory traits and test service shape, see the shared
[test-factory-traits-and-service-shape workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/skills/test-factory-traits-and-service-shape/workflow.md).
The project’s test commands, helpers, and conventions below remain authoritative for TravelAuth.

## Running Tests

See [../../bin/README.md](../../bin/README.md#testing) for canonical API test commands and test
container management guidelines.

## Test Structure

Tests mirror `api/src/`:

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

## Local Test Conventions

- Use nested `describe` blocks in the order file path -> class/model -> method.
- Use `test`, not `it`, with names describing the condition and outcome:
  `"when [condition], it [expected behavior]"`.
- Structure scenarios with explicit `// Arrange`, `// Act`, and `// Assert` comments.
- Keep scenario-specific persisted records in each test's Arrange section; shared setup should not
  hide the scenario's starting state.
- In API test files, import code under test and domain models/services first, then a blank line,
  then test support and factories.
- Use descriptive variable names and numbered peer entities such as `user1`, `user2`.
- Name policy-scoped query results with `scoped{Model}`, such as
  `scopedTravelDeskTravelRequests`.
- For non-HTTP results, prefer one strong assertion with `toEqual(...)` over many low-signal
  assertions.
- Assert database state with `findAll()` without redundant `where` clauses unless the filter is
  under test.
- Use negative spy assertions such as `expect(spy).not.toHaveBeenCalled()`; avoid
  `not.toHaveBeenCalledWith(...)`.
- Do not add local `vi.restoreAllMocks()` hooks; `api/vite.config.mts` already enables mock cleanup
  with `clearMocks`, `mockReset`, and `restoreMocks`.

### Controller Tests

- Use `mockCurrentUser(user)` and `request()` from `@/support`.
- Assert `response.status` first, then assert `response.body` directly with `toEqual(...)`.
- Keep an HTTP status/body test focused on that response; cover persisted outcomes in a separate
  service or behavior test.
- Prefer the real controller -> service -> serializer path for happy-path coverage when it proves
  the serializer can parse service results. Mock service methods for narrow controller error paths.
- When related endpoints share a contract, keep happy path, service failure, authorization denial,
  and not-found coverage parallel unless their routes intentionally differ.

## Factories

Prefer Fishery factories from `@/factories`:

- `userFactory`
- `travelAuthorizationFactory`
- `expenseFactory`
- `generalLedgerCodingFactory`
- `travelSegmentFactory`

**Admin users:** `User.isAdmin` is a virtual getter (`this.roles.includes("admin")`) with no setter.
Fishery merges factory overrides with `lodash.mergeWith`, which skips getter-only properties at
runtime, so passing `{ isAdmin: true }` to `userFactory.create()` has no effect. Use `roles` instead:

```typescript
import { User } from "@/models"

import { userFactory } from "@/factories"

const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
const nonAdmin = await userFactory.create({ roles: [User.Roles.USER] })
```

If you need a new factory, follow the reusable
[`agents/templates/fishery-factory-template.md`](../../agents/templates/fishery-factory-template.md).

## Test Lifecycle Notes

Vitest config runs global setup before the test files and then loads the per-file setup:

1. `api/tests/global-setup.ts` runs `npm run initializers`.
2. `api/tests/setup.ts` runs before each test file, cleans the application and TravCom databases
   before each test, and resets mocked Axios after each test.
3. The requested test file executes.

Keep per-file setup lightweight. Expensive initialization belongs in global setup.

## Editor Helper

For the `create-test-file` extension, add this configuration to your editor settings to generate
mirrored test paths:

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
