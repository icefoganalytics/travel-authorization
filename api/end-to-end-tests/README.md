# End-to-End Tests

Playwright end-to-end tests for the full application stack live here.

## Current Coverage

The default suite runs three credential-free smoke checks:

- API status endpoint responds.
- Sign-in page renders.
- Root route redirects unauthenticated users away from protected content.

The opt-in authenticated suite uses real Auth0 sessions and exercises the complete traveller,
supervisor, travel-desk, and finance journey: request submission and approval, flight options and
rankings, PNR upload and booking, actual travel details, expense prefill and receipts, GL coding,
and final expense review. It does not bypass authentication or seed workflow transitions.

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
`COMPOSE_PROJECT_NAME` is set. It overlays test isolation onto the shared development service
definitions, resets that separate stack and its named volumes, rebuilds all application and runner
images, runs Playwright, and tears down on success or failure.
The API waits for a successful SQL Server query before starting TravCom initialization.
The stack uses Docker's internal network without host ports; the runner shares the frontend's
network namespace so the real Auth0 callback remains `http://localhost:8080`.
Vuetify is excluded from Vite dependency optimization to prevent page reloads when a cold stack first
visits auto-imported wizard components.

## Adding Tests

Wrap every `test()` in a meaningful `test.describe()` suite, grouped by workflow or behavior.

Keep each test focused on one outcome and assert the actual result directly. Use separate tests
instead of combining independent checks into assertion-only objects.

Import `test` and, when needed, `cleanEndToEndDatabases` from `../fixtures`; import `expect` from
`@playwright/test`. The fixture adds automatic database cleanup around every test. Stateful serial
workflows can opt out with `test.use({ preserveDatabase: true })`. Reset their databases once in
`test.beforeAll`, then seed only the prerequisite rows through
`authenticated-workflow-fixtures.ts`; it uses raw database queries so Playwright does not load
decorated Sequelize models during test discovery.

Prefer locators that match user-visible behavior, such as `page.getByRole()`, `page.getByLabel()`,
and `page.getByText()`.
