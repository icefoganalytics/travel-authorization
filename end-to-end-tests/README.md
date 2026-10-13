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

Use `./bin/dev e2e test` from the repository root for the isolated full-stack environment. Arguments
after `--` are forwarded to Playwright.

The default suite runs three credential-free smoke checks:

- API status endpoint responds.
- Sign-in page renders.
- Root route redirects unauthenticated users away from protected content.

Set `E2E_AUTHENTICATED=true` to include all 15 discovered tests, including the authenticated
traveller, supervisor, travel-desk, and finance journey: request submission and approval, flight
options and rankings, booking, actual travel details, expense prefill and receipts, GL coding, and
final expense review. This coverage requires four distinct real Auth0 identities and the
application's existing booking-policy and review prerequisites. It does not bypass authentication,
grant policy access, seed workflow transitions, or waive required review.

## Running Tests

Run the smoke suite locally without account credentials:

```bash
./bin/dev e2e test
```

Pass Playwright options after `--`, for example:

```bash
./bin/dev e2e test -- --grep "sign-in page"
```

To opt in to authenticated coverage, provide each actor's email and password through your local,
unversioned environment: `TRAVELLER_EMAIL` / `TRAVELLER_PASSWORD`, `SUPERVISOR_EMAIL` /
`SUPERVISOR_PASSWORD`, `TRAVEL_DESK_EMAIL` / `TRAVEL_DESK_PASSWORD`, and `FINANCE_EMAIL` /
`FINANCE_PASSWORD`. Then run:

```bash
E2E_AUTHENTICATED=true ./bin/dev e2e test
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

For same-repository pull requests, main pushes, and manual runs, continuous integration sets
`E2E_AUTHENTICATED=true` and requests smoke and authenticated coverage. Fork pull requests run the
credential-free smoke suite because GitHub does not provide repository secrets to those events.
Configure the eight repository Actions secrets using the local variable names above with an `E2E_`
prefix, for example `E2E_SUPERVISOR_EMAIL` and `E2E_SUPERVISOR_PASSWORD`. Missing credentials fail
authentication setup; they do not silently skip coverage. Screenshots and videos are disabled
during authentication. Failure artifacts can contain test-account details; keep them private.
Both API-context and root release-context builds exclude authentication states and Playwright artifacts.

## Isolated Compose Stack

The wrapper fixes the Compose project name to `travel-authorization-e2e-test`, regardless of
`COMPOSE_PROJECT_NAME`, and combines `docker-compose.development.yml` with
`docker-compose.e2e-test.yml`. The overlay uses the standard `api`, `web`, `db`, and `db_trav_com`
service names plus the `end_to_end_tests` runner. Database volumes and test data are isolated by
project; the development database names and stack remain unchanged.

The test stack uses Docker's internal network, publishes no host ports, and keeps the Auth0 callback
at `http://localhost:8080` by sharing the web service's network namespace with the runner. It does
not apply the development gateway overlay, mount development source directories, or load development
environment files. The overlay adds test-only SQL readiness without changing normal development
startup dependencies. The runner image installs this package alone, not the API manifest; CI installs
the root Ruby dependencies before invoking the same wrapper command used locally.

Before each run, the wrapper resets the isolated project and volumes. It runs the test command and
removes the project and volumes afterward on both success and failure.

## Adding Tests

Wrap every `test()` in a meaningful `test.describe()` suite, grouped by workflow or behavior.

Keep each test focused on one outcome and assert the actual result directly. Use separate tests
instead of combining independent checks into assertion-only objects.
Serial browser stages may retain direct checkpoint assertions for their one transition. Use a
reasoned per-test `allow-multiple-expects` alignment exemption rather than aggregating results.

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
