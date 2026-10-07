# End-to-End Tests

Playwright end-to-end tests for the full application stack live here.

## Current Coverage

The runnable test suite currently covers unauthenticated smoke checks only:

- API status endpoint responds.
- Sign-in page renders.
- Root route redirects unauthenticated users away from protected content.

`tests/travel-authorization-wizard.spec.ts` is a skipped skeleton for future authenticated workflow
coverage. It documents the intended multi-user pattern, but it is not enforced by continuous
integration until Auth0 storage-state fixtures and `SUPERVISOR_EMAIL` for a selectable supervisor exist.

## Running Tests

Use the project wrapper from the repository root:

```bash
./bin/dev test end-to-end-tests
```

The wrapper resets the isolated stack and dependency volumes, rebuilds the application and runner
images, runs Playwright, then tears the stack down. The stack uses Docker's internal network, so it
does not publish host ports or affect a running development stack.

## Adding Tests

Import `test` and, when needed, `cleanEndToEndDatabases` from `../fixtures`; import `expect` from
`@playwright/test`. The fixture adds automatic database cleanup around every test. Stateful serial
workflows can opt out with `test.use({ preserveDatabase: true })` and call
`test.beforeAll(cleanEndToEndDatabases)` to reset the databases once before their shared lifecycle.

Prefer locators that match user-visible behavior, such as `page.getByRole()` and `page.getByText()`.
