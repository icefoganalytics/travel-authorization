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

To run authenticated coverage, provide `TRAVELLER_EMAIL`, `TRAVELLER_PASSWORD`, `ADMIN_EMAIL`, and
`ADMIN_PASSWORD` in your local, unversioned environment, then run:

```bash
E2E_AUTHENTICATED=true ./bin/dev test end-to-end-tests -- --project authenticated-chromium
```

The accounts must be distinct. The administrator also acts as supervisor, travel desk, and finance
reviewer; those application roles are seeded only in the isolated database. Setup verifies each
real session through `/api/current-user` and discovers its persisted subject before resetting data.
It saves reusable storage states and account metadata under ignored `tests/.auth/`. Passwords are
needed for initial login; valid storage states can be reused with just the two email variables.
Expired storage states fall back to normal login when a password is provided; otherwise setup
reports how to refresh the saved state.
If Auth0 presents a CAPTCHA, sign in normally and supply the corresponding real storage state;
the suite does not bypass challenges. Do not commit, upload, or share credentials or session files.

Continuous integration runs the default smoke suite without account credentials. Authenticated
coverage is opt-in, not silently skipped or claimed as continuous-integration coverage. Screenshots
and videos are disabled during authentication. Workflow artifacts can contain test-account details;
keep them private. Both API-context and root release-context builds exclude authentication states
and Playwright artifacts.

The wrapper forces the `travel-authorization-e2e-test` Compose project even when
`COMPOSE_PROJECT_NAME` is set. It resets that standalone stack and its named dependency volumes,
rebuilds all application and runner images, runs Playwright, and tears down on success or failure.
The stack uses Docker's internal network without host ports; the runner shares the frontend's
network namespace so the real Auth0 callback remains `http://localhost:8080`.
Vuetify is excluded from Vite dependency optimization to prevent page reloads when a cold stack first
visits auto-imported wizard components.

## Adding Tests

Import `test` and, when needed, `cleanEndToEndDatabases` from `../fixtures`; import `expect` from
`@playwright/test`. The fixture adds automatic database cleanup around every test. Stateful serial
workflows can opt out with `test.use({ preserveDatabase: true })`. Reset their databases once in
`test.beforeAll`, then seed only the prerequisite rows through
`authenticated-workflow-fixtures.ts`; it uses raw database queries so Playwright does not load
decorated Sequelize models during test discovery.

Prefer locators that match user-visible behavior, such as `page.getByRole()`, `page.getByLabel()`,
and `page.getByText()`.
