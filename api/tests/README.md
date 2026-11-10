# API Tests

This is the TravelAuth backend test suite, using Vitest and Factory Shark application-model factories.

Load the direct [packaged review workflow](skill://code-review/workflow.md) and its [Scenario-Oriented Verification reference](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/code-organization-reference.md#scenario-oriented-verification) before applying this test overlay. For reusable factory traits, load the direct [factory workflow](skill://test-fixtures/workflow.md) when relevant. Other clients resolve the corresponding sources in their verified release, as described in the root [shared-base declaration](../../AGENTS.md#shared-standards-and-local-authority).

The commands, helpers, import grouping, and assertion conventions below remain TravelAuth deltas. The direct HTTP status/body pair intentionally exposes one coupled response without a new matcher dependency; it is not two independent outcomes or permission to bundle assertions into synthetic objects. Preserve current local precedence and obtain an explicit owner decision for a genuine conflicting rule.

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
- Keep download-header assertions in separate focused tests rather than adding them to the
  status/body response test.
- Prefer the real controller -> service -> serializer path for happy-path coverage when it proves
  the serializer can parse service results. Mock service methods for narrow controller error paths.
- When related endpoints share a contract, keep happy path, service failure, authorization denial,
  and not-found coverage parallel unless their routes intentionally differ.

## Factories

Arrange persisted records through Factory Shark factories from `@/factories`, not direct model `create` or `bulkCreate` calls. Add a factory when one is missing; keep scenario-specific values and relationships explicit in each test. Examples:

- `userFactory`
- `travelAuthorizationFactory`
- `expenseFactory`
- `generalLedgerCodingFactory`
- `travelSegmentFactory`

**Admin users:** `User.isAdmin` is a virtual getter (`this.roles.includes("admin")`) with no setter.
It is not a factory attribute. Use `roles` instead:

```typescript
import { User } from "@/models"

import { userFactory } from "@/factories"

const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
const nonAdmin = await userFactory.create({ roles: [User.Roles.USER] })
```

Use the [Factory Shark 2.4.0 authoring templates](https://github.com/klondikemarlen/factory-shark/blob/v2.4.0/docs/templates/factory-authoring.md) for factory definitions, associations, custom builders, hooks, `include`, `createList`, and `attributesFor`. The upstream guide owns library behavior; use the guide matching the installed package version.

Keep application factories under `api/tests/factories/`, import models from `@/models`, and expose factories through `@/factories`. Preserve named and default factory exports. Follow the [user factory](factories/user-factory.ts) and [travel authorization factory](factories/travel-authorization-factory.ts) for local conventions; the [expense factory](factories/expense-factory.ts) owns the domain-specific `estimate` builder and description defaults.

Prefer `.associations(...)` for supplied model relationships when supported by the installed library, rather than assigning associations after fixture creation. Keep explicit foreign-key inputs when the scenario tests foreign-key behavior.

TravCom invoice, detail, and segment fixtures also use Factory Shark. Its keyless city model uses `createCity` from the integration's fixture bundle; create cities explicitly and pass their `cityCode` values to segments. Do not invent primary keys or alter the external schema to fit a fixture library. Web plain-object fixtures retain Fishery and must not import API models.

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
