# TravelAuth

TravelAuth is a full-stack travel authorization and approval system for the Yukon Government, streamlining the process of requesting, reviewing, and approving travel funding requests. The system manages the entire travel authorization workflow, from initial submission through approval and financial processing.

## Technology Stack

### Backend (API)

- Node.js + Express + TypeScript
- PostgreSQL database
- Knex.js for database migrations
- Sequelize for models and queries
- Docker Compose for containerization

### Frontend (Web)

- Vue 2 + Vuetify 2 (migrating to Vue 3 + Vuetify 3)
- Axios for API communication
- TypeScript for type safety

### Testing

- Vitest for test framework
- Well-structured test files mirroring source structure
- Database cleanup between tests
- Fishery factories for test data generation

This file follows the format from https://agents.md/ for AI agent documentation.

**Documentation philosophy:** This file focuses on patterns, conventions, and architecture rather than documenting specific features or domain models. When providing examples, use them to illustrate patterns rather than to exhaustively document every feature.

## Dev environment tips

- Start all services: `dev up` (or `docker compose -f docker-compose.development.yml up`)
- Start API only: `dev up api` - access at http://localhost:3000
- Start web only: `dev up web` - access at http://localhost:8080
- Stop and wipe database: `dev down -v`
- Access mail server UI: http://localhost:1080
- Access database CLI: `dev psql`
- Node debugging: `dev debug` or use Chrome at `chrome://inspect`
- Test files mirror source structure: `api/src/services/example.ts` → `api/tests/services/example.test.ts`
- Use `@/` import alias for src directory in both API and web
- Database should use snake_case (cleanup in progress), models use camelCase (Sequelize handles field mapping)
- Migrations run automatically on `dev up`, or manually via `dev migrate latest`
- Create migration: `dev migrate make create-table-name`
- Create seed: `dev seed make fill-table-name`
- Use Fishery factories for test data (e.g., `userFactory.create()`)

## Testing instructions

**Running tests:**

- Run all API tests: `dev test_api` (from project root)
- Run specific test file: `dev test api/tests/services/example.test.ts -- --run` (from project root)
- Run specific test file (alternative): `npm test -- tests/services/example.test.ts --run` (from `/api`)
- Watch mode: `dev test api/tests/services/example.test.ts` (from project root, omit `--run`)
- Watch mode (alternative): `npm test -- tests/services/example.test.ts` (from `/api`)
- Test specific pattern: `npm test -- --grep "creates a delegation"` (from `/api`)

**Test structure:**

- Test files mirror source structure: `api/src/services/example.ts` → `api/tests/services/example.test.ts`
- Use Fishery factories from `@/factories` for all test data (e.g., `userFactory.create()`)
- Tests automatically clean database before each test via `setup.ts` - no manual cleanup needed
- Always use AAA pattern with explicit comments: `// Arrange`, `// Act`, `// Assert`
- Test naming format: `"when [condition], [expected behavior]"` - use full entity names, not abbreviations (e.g., "workflow step player" not "player")
- Use `test` not `it` for test blocks
- Test files use nested describe blocks: file path → class name → method name (`.perform`)

**Test variable naming:**

- Use numbered entities: `user1`, `user2`, `position1`, `position2` (not `existingUser`, `newUser`, `currentUser`)
- Use most specific, descriptive variable names: `workflowStepPlayersAttributes` not `playersAttributes`
- Always create `userOrganization` relationships after creating users and organizations: `await userOrganizationFactory.create({ userId: user1.id, organizationId: organization.id })`

**Test assertions:**

- In service tests, use `findAll()` without where clauses to assert database state (test isolation handles cleanup)
- Focus assertions on database state, not service return values (unless specifically testing return values)
- For arrays of objects: `expect(result).toEqual([expect.objectContaining({ id: workflow.id })])`
- For errors: `await expect(service.perform(data)).rejects.toThrow("error message")`
- For spies: `const spy = vi.spyOn(Service, "perform").mockResolvedValue(result)`
- **For negative spy assertions:** Use `expect(spy).not.toHaveBeenCalled()` without arguments - never use `not.toHaveBeenCalledWith(...)` as it can create unsafe tests that pass but don't validate what you expect
- Controller tests: use `mockCurrentUser(user)` and `request().get("/api/path")` from `@/support`
- All tests must pass before committing

## Code style guidelines

- TypeScript for all new code - no `any`, no `@ts-expect-error`, no `@ts-ignore`, no `!` (non-null assertion)
- **No non-null assertions:** Never use `!` operator - use proper null handling with optional chaining (`?.`), nullish coalescing (`??`), or explicit type guards
- 2 spaces, no semicolons, double quotes, 100 char line limit (see `.prettierrc.yaml`)
- **No abbreviations:** Use full descriptive names for variables, functions, tables (e.g., `workflow` not `wf`, `migration` not `mig`)
- **SQL:** Fully spell out table names and column names - no abbreviated aliases
- **Number similar entities:** `user1`, `user2`, `position1`, `position2` for clarity
- **Expanded code style:** One thing per line, avoid terse functional chains
- **Guard clauses:** Early returns with blank line after each guard
- **Named constants:** Hoist magic numbers to named `const` at top of function/file
- camelCase for variables/functions, PascalCase for classes/types
- Services use static `.perform()` method and encapsulate business logic
- Services call other services, not queries directly (migrating away from separate query files)
- Test files use nested describe blocks: file path → class name → method name (`.perform`)
- **Import ordering (PEP8-style):**
  1. Node.js built-in modules (e.g., `path`, `fs`)
  2. Blank line
  3. External packages from node_modules (e.g., `express`, `lodash`, `@sequelize/core`)
  4. Blank line
  5. Internal imports from `@/` (config, utils, models, services, controllers, etc.)
  - Optionally group internal imports by category with blank lines between groups
  - Example: config imports, blank line, middleware imports, blank line, controller imports
  - Within each section, alphabetical ordering is strongly encouraged

## Environment-specific TypeScript patterns

- **Browser vs Node.js setTimeout types:** In browser Vue components, use `number` type for `setTimeout` return values, not `NodeJS.Timeout`
  - Browser: `const timer = ref<number | undefined>(undefined)` and `timer.value = setTimeout(callback, 1000)`
  - Node.js (API): `const timer = ref<NodeJS.Timeout | undefined>(undefined)` 
  - This prevents ESLint `'NodeJS' is not defined` errors in browser environments
  - Browser `setTimeout` is actually `window.setTimeout` and returns a numeric timer ID
  - Node.js `setTimeout` returns a `NodeJS.Timeout` object for additional functionality

## Architecture patterns

- **Service pattern:** Business logic in services with static `.perform()` methods
  - All services extend `BaseService` which provides a static `perform()` method
  - **ALWAYS call services using the static method:** `ServiceName.perform(args)`
  - **NEVER instantiate services directly:** `new ServiceName(args).perform()` is incorrect
  - The static `perform()` method handles instantiation internally and ensures proper type inference
  - Example correct: `await EnsureForWorkflowStepPlayerService.perform(workflowId, playerId)`
  - Example incorrect: `await new EnsureForWorkflowStepPlayerService(workflowId, playerId).perform()`
- **Controller pattern:** RESTful controllers extending BaseController
  - Standard CRUD methods: `index()`, `show()`, `create()`, `update()`, `destroy()`
  - Routes follow pattern: `GET /api/resources`, `GET /api/resources/:resourceId`, `POST /api/resources`, `PATCH /api/resources/:resourceId`, `DELETE /api/resources/:resourceId`
  - Policy checks via `this.buildPolicy()` for authorization; use `Policy.applyScope()` for query scoping
  - Serializers format output (IndexSerializer, ShowSerializer)
  - Nested controllers in subfolder for resource related actions: `controllers/resource/action-controller.ts`
- **Frontend API module pattern:** Type-safe API clients in `web/src/api/*-api.ts`
  - Export TypeScript types matching backend models and serializers
  - Export `WhereOptions`, `FiltersOptions`, and `QueryOptions` types for query parameters
  - Export API object with async methods: `list()`, `get()`, `create()`, `update()`, `delete()`
  - Methods return typed promises with data destructured from axios response
  - Import `Policy` type from `base-api` for endpoints that return policies
  - Example: `flightStatisticsApi.list(params)` → `Promise<{ flightStatistics: FlightStatisticAsIndex[], totalCount: number }>`
- **Frontend composable pattern:** Reactive data fetching in `web/src/use/use-*.ts`
  - **Plural form** (`useResources`) for list/collection endpoints:
    - Accept `options` ref with query parameters and optional `skipWatchIf` function
    - Return array state: `resources`, `totalCount`, `isLoading`, `isErrored`
    - Provide `fetch()` and `refresh` (alias) methods
    - Watch options with `deep: true, immediate: true` for auto-fetching
    - Example: `const { expenses, totalCount, isLoading, fetch } = useExpenses()`
  - **Singular form** (`useResource`) for single item endpoints:
    - Accept `id` ref (can be `number | null | undefined`)
    - Return single item state: `resource`, `policy`, `isLoading`, `isErrored`
    - Provide `fetch()` and `refresh` (alias) methods; optionally `save()` for editable resources
    - Watch id with `immediate: true`, skip fetch if id is nil (use `isNil()` check)
    - Policy type is generic `Policy` from base-api
    - Example: `const { expense, policy, isLoading, save } = useExpense(expenseId)`
  - Re-export types, enums, and constants from API module for convenience in both forms
- **Factory pattern:** Use Fishery factories for test data creation
- **Policy pattern:** Authorization scoping via policy classes
  - Policy checks via `this.buildPolicy()` in controllers for authorization
  - Use `Policy.applyScope()` for query scoping in `index()` methods
  - **Role checks:** Use `user.isAdmin` property (not `user.roles.includes(User.Roles.ADMIN)`)
  - Example: `if (this.user.isAdmin) return true`
- **Access control:** Direct user, position-based, team-based, position-team access patterns
- **Delegations:** Workflow/step player delegation with automatic cleanup
- **Soft deletes:** Models support `deletedAt` timestamp
- **Database:** Knex for migrations, Sequelize for ORM

## Security considerations

- Auth0 for authentication (requires third-party cookies in dev)
- All routes require authentication by default unless explicitly public
- Use policy scoping for user-specific data
- Never commit secrets - use environment variables
- Validate all user inputs
- Parameterized queries prevent SQL injection

## PR instructions

- Run `npm test` from `/api` - all tests must pass
- Fix any TypeScript errors - no `@ts-ignore` allowed
- Follow naming conventions - no abbreviations
- Write tests for new functionality following AAA pattern
- Use descriptive commit messages
- Reference Jira tickets when applicable
- Never `git push --force` on main branch
- Use `git push --force-with-lease` for feature branches if needed

**PR Testing Instructions Format:**

Always include a "Testing Instructions" section in PRs with numbered UI steps:

1. Start with standard setup steps:

   - `1. Run the test suite via 'dev test' (or 'dev test_api')`
   - `2. Boot the app via 'dev up'`
   - `3. Log in to the app at http://localhost:8080`

2. Navigation steps should reference specific UI elements:

   - Use exact button names: **Add User**, **Activate Position**, **Create Delegation**
   - Reference menu locations: "top right dropdown nav", "left sidebar nav"
   - Reference tabs by name: **Users** tab, **Positions** tab
   - Use navigation arrows: **Administration** → **Positions** → **Users** tab

3. Organize complex testing into test cases:

   - Use `## Test Case N: Description` subheadings for multiple scenarios
   - Number steps sequentially across all test cases (don't restart at 1)
   - Include expected outcomes: "Verify success message: 'X created!'"
   - Test both success and failure paths when relevant

4. Verification steps should be explicit:

   - "Verify the table displays **Column Name** column"
   - "Verify dates are formatted correctly"
   - "Verify error message contains: 'exact error text'"
   - "Verify you are redirected to the X page"

5. Include specific test data when helpful:

   - Example values: "Select '2025-10-15'" or "Enter 'Alice Smith'"
   - Specific URLs: `http://localhost:8080/administration/users/2/positions`

6. Format for readability:
   - Use bold for UI elements: **button names**, **field labels**, **page names**
   - Use inline code for: exact error messages, URLs, field values
   - Break complex forms into bullet lists with field names

Example pattern:

```markdown
## Testing Instructions

1. Run the test suite via `dev test` (or `dev test_api`)
2. Boot the app via `dev up`
3. Log in to the app at http://localhost:8080
4. Navigate to the Admin dashboard via the top right dropdown nav
5. Go to the **Positions** page via the left sidebar nav
6. Click on any position that has users assigned
7. Click the **Users** tab
8. Verify the table displays **Start Date** and **End Date** columns
9. Click the **Add User** button
10. Fill in the form:
    - **User**: Select any user
    - **Start Date**: Select a date
11. Click **Add User** to submit
12. Verify success message: "User added!"
```

## Configuration

Environment files (not committed):

- `.env.development` - Development config
- `.env.production` - Production config
- `.env.test` - Test config

**Minimal required variables** (most configuration is in docker-compose.development.yml):

- `NODE_ENV` - Environment (development, test, production)
- `API_PORT` - API server port (default: `3000`)
- `FRONTEND_URL` - Frontend URL (e.g., `http://localhost:8080`)
- `AUTH0_DOMAIN` - Auth0 domain
- `AUTH0_AUDIENCE` - Auth0 audience
- `AZURE_KEY` - Azure API key
- `YUKON_GOVERNMENT_FINANCE_API_KEY` - Finance API key

**Database configuration** (for local development outside Docker):

- `DB_HOST` - PostgreSQL host
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASS` - Database password
- `DB_PORT` - Database port (default: `5432`)

See `/api/src/config.ts` for complete configuration details.

## Common factories

Import from `@/factories`:

- `userFactory` - User entities
- `travelAuthorizationFactory` - Travel authorization records
- `travelAuthorizationPreApprovalFactory` - Pre-approval records
- `travelDeskTravelRequestFactory` - Travel desk requests
- `expenseFactory` - Expense records
- `travelSegmentFactory` - Travel segments
- `stopFactory` - Travel stops
- `locationFactory` - Location data
- `travelPurposeFactory` - Travel purposes
- `perDiemFactory` - Per diem allowances
- `travelAllowanceFactory` - Travel allowances
- `distanceMatrixFactory` - Distance matrix data

Example usage:

```typescript
import { userFactory, travelAuthorizationFactory } from "@/factories"

const user = userFactory.build({
  roles: [User.Roles.USER],
})

const travelAuthorization = travelAuthorizationFactory.build({
  status: TravelAuthorization.Statuses.DRAFT,
  userId: user.id,
})
```
