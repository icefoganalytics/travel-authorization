# End-to-End Tests

Playwright end-to-end tests for the full application stack live in this standalone top-level npm
package.

## Package Ownership

This package owns its end-to-end sources, fixtures, Playwright configuration, TypeScript and ESLint
configuration, dependency manifest and lockfile, and runner image. The database-cleanup fixture
imports the existing API helpers through `@/tests/support/*`; cleanup logic and API clients are not
duplicated here.

Its TypeScript aliases map `@/end-to-end-tests/*` to this package, `@/tests/support/*` to the shared
API test-support directory, and `@/*` to the API source tree used by those helpers. The Docker
runner installs only this package's dependency manifest under `/usr/src/node_modules` and includes
the small API-source closure needed by shared helpers. It does not install the API manifest; normal
Node ancestor module lookup shares the runner-owned dependencies with the copied API helpers.

## Package Scripts

- `npm test` runs type-checking, linting, then Playwright.
- `npm run check-types` runs the package's strict TypeScript check.
- `npm run lint` lints package TypeScript using the repository ignore rules.
- `npm run ts-node -- finance-api-stub.ts` runs the finance API stub.

Use the repository wrapper for the isolated full-stack environment. It forwards options after `--`
to Playwright.

## Current Coverage

The default suite runs three credential-free smoke checks:

- API status endpoint responds.
- Sign-in page renders.
- Root route redirects unauthenticated users away from protected content.

The opt-in authenticated suite exercises the traveller, supervisor, travel-desk, and finance journey:
request submission and approval, flight options and rankings, booking, actual travel details,
expense prefill and receipts, GL coding, and final expense review. It requires four distinct real
Auth0 identities and the application's required booking-policy and review prerequisites. The suite
does not bypass authentication, grant policy access, seed workflow transitions, or waive required
review.

## Running Tests

Use the project wrapper from the repository root:

```bash
./bin/dev test end-to-end-tests
```

To run authenticated coverage, provide each actor's email and password in your local, unversioned
environment: `TRAVELLER_EMAIL` / `TRAVELLER_PASSWORD`, `SUPERVISOR_EMAIL` / `SUPERVISOR_PASSWORD`,
`TRAVEL_DESK_EMAIL` / `TRAVEL_DESK_PASSWORD`, and `FINANCE_EMAIL` / `FINANCE_PASSWORD`. Then run:

```bash
E2E_AUTHENTICATED=true ./bin/dev test end-to-end-tests -- --project authenticated-chromium
```

All four accounts must have distinct Auth0 subjects. The isolated database gives the traveller and
supervisor the `user` role, travel desk `travel_desk_user`, and finance `finance_user`; no actor uses
administrator privileges. Setup verifies each real session through `/api/current-user` and discovers
its persisted subject before resetting data. It saves reusable storage states and account metadata
under ignored `tests/.auth/`. Passwords are needed for initial login; valid storage states can be
reused with the four email variables.
Expired storage states fall back to normal login when a password is provided; otherwise setup
reports how to refresh the saved state.
If Auth0 presents a CAPTCHA, sign in normally and supply the corresponding real storage state;
the suite does not bypass challenges. Do not commit, upload, or share credentials or session files.

For same-repository pull requests, main pushes, and manual runs, continuous integration requests both
smoke and authenticated coverage with `E2E_AUTHENTICATED=true`. Fork pull requests run smoke coverage
only because GitHub does not provide repository secrets to those events.
Configure the eight repository Actions secrets using the local variable names above with an `E2E_`
prefix, for example `E2E_SUPERVISOR_EMAIL` and `E2E_SUPERVISOR_PASSWORD`. Missing credentials fail
authentication setup; they do not silently skip the workflow. Screenshots and videos are disabled
during authentication. Workflow artifacts can contain test-account details; keep them private.
Both API-context and root release-context builds exclude authentication states and Playwright artifacts.

The wrapper forces the `travel-authorization-e2e-test` Compose project even when
`COMPOSE_PROJECT_NAME` is set. It selects the `end-to-end-tests` profile from
`docker-compose.development.yml`, resets that isolated stack and its named volumes, rebuilds the
application and runner images, runs Playwright, and tears down on success or failure. The runner
image installs this package alone and does not install the API manifest. Normal wrapper commands
select the `development` profile.

The API waits for a successful SQL Server query before starting TravCom initialization. The test
frontend waits for the API status endpoint, and the runner waits for the frontend health check. The
stack uses Docker's internal network without host ports; the runner shares the frontend's network
namespace so the real Auth0 callback remains `http://localhost:8080`.

## Adding Tests

Wrap every `test()` in a meaningful `test.describe()` suite, grouped by workflow or behavior.

Keep each test focused on one outcome and assert the actual result directly. Use separate tests
instead of combining independent checks into assertion-only objects.

Put reusable browser actions in `support/` and plain Fishery data builders in `factories/`, not
inside spec files. Encoded upload fixtures live in `data/`; factories decode them once. Keep
workflow assertions in the specs; support actions own the synchronization needed to perform
their operation.

Use the package-owned absolute import aliases: `@/end-to-end-tests/...` for E2E files and
`@/tests/support/...` for the shared API test helpers. Do not duplicate those helpers or replace the
package aliases with relative imports.

Import `test` and, when needed, `cleanEndToEndDatabases` from `@/end-to-end-tests/fixtures`;
import `expect` from `@playwright/test`. The fixture adds automatic database cleanup around every
test. Stateful serial workflows can opt out with `test.use({ preserveDatabase: true })`.
Reset their databases once in `test.beforeAll`, then seed only the prerequisite rows through
`authenticated-workflow-fixtures.ts`; it uses raw database queries so Playwright does not load
decorated Sequelize models during test discovery.

Prefer locators that match user-visible behavior, such as `page.getByRole()`, `page.getByLabel()`,
and `page.getByText()`.
