# End-to-End Testing

## Purpose

TravelAuth uses Playwright to verify that the browser, web application, API, and test databases work
together. The end-to-end suite provides release confidence without touching development data or a
running development stack.

## Architecture Boundary

The canonical command is:

```bash
./bin/dev test end-to-end-tests
```

It creates a separate Docker Compose project with the end-to-end overlay, recreates dependency
volumes, rebuilds the application and Playwright runner images, runs the suite, then removes the
isolated stack. The fixture cleans the test databases before each test unless a stateful serial
workflow explicitly opts out. Its containers communicate on Docker's internal network and publish no
host ports.

This makes the end-to-end environment independent of a developer's active stack and aligns local
execution with continuous integration.
## Test Ownership and Runtime

End-to-end tests are system tests, not API tests: the Playwright browser exercises the `web` service,
which calls the `api` service and its isolated `travel_test` and `trav_com_test` databases. The
runner is stored in `api/end-to-end-tests/` because it reuses the API package's test tooling and
database-cleanup support. Its location does not make it an API-only test suite.

The Docker Compose project owns the complete test stack. Tests must not depend on a separately
started frontend or backend, because that can point a run at development data or a different build.
The stack builds the existing development images so local and continuous-integration runs exercise
the same source configuration.

The root [`Dockerfile`](../../Dockerfile) is the release image: it compiles the API and web
application into one production container. It is not the current pull-request test target. Add a
separate release-artifact smoke check only when the release pipeline needs to prove that compiled
image and its production configuration. Keeping that concern separate avoids making every source
change pay the production-image build cost.


## Coverage Contract

Continuous integration currently enforces unauthenticated smoke coverage for the API status endpoint,
the sign-in page, and the redirect away from protected content. The travel-authorization wizard is
an intentionally skipped specification for authenticated coverage; it is not evidence of enforced
behavior until Auth0 storage-state fixtures and deterministic accounts exist.

## Continuous Integration Policy

The end-to-end workflow runs for pushes to `main` and when a pull request is marked ready for review.
It can also be started manually with GitHub Actions. This limits costly browser-stack runs during
draft development while preserving an explicit verification path.

## Authority

- `api/end-to-end-tests/README.md` is the source of truth for current test coverage, authenticated
  prerequisites, test fixtures, and locator conventions.
- `bin/dev`, `docker-compose.e2e-test.yml`, and `.github/workflows/end-to-end-tests.yml` define the
  current execution behavior.
- The Playwright specifications under `api/end-to-end-tests/tests/` are the executable coverage
  evidence.

## Publication Boundary

This knowledge base is repository documentation. No external documentation site is configured; any
future publication must explicitly select public files and audiences.
