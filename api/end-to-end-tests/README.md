# End-to-End Tests

Playwright end-to-end tests for the full application stack live here.

## Current Coverage

The runnable test suite currently covers unauthenticated smoke checks only:

- API health check responds and reports the test database.
- Sign-in page renders.
- Root route redirects unauthenticated users away from protected content.

`tests/travel-authorization-wizard.spec.ts` is a skipped skeleton for future authenticated workflow
coverage. It documents the intended multi-user pattern, but it is not enforced by continuous
integration until Auth0 storage-state fixtures exist.

## Running Tests

Use the project wrapper from the repository root:

```bash
./bin/dev test end-to-end-tests
```

The wrapper starts the application stack in test mode, runs Playwright, and tears the stack down after
the run.

## Adding Tests

Import `test` and `expect` from `@playwright/test`. The test TypeScript configuration remaps that
module to `fixtures.ts`, which adds automatic database cleanup around every test.

Prefer locators that match user-visible behavior, such as `page.getByRole()` and `page.getByText()`.
