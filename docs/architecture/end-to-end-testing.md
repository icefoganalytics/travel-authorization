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

It selects the `end-to-end-tests` profile in `docker-compose.development.yml` and a separate Docker
Compose project, recreates its named volumes, rebuilds the application and Playwright runner
images, runs the suite, then removes the isolated stack. Dedicated test services reuse development
builds and service settings through YAML anchors; no separate end-to-end Compose file is needed.
The fixture cleans test databases before each test unless a stateful serial workflow opts out.
The API waits for SQL Server readiness, the frontend waits for API readiness, and the runner waits
for frontend readiness. Test containers communicate internally and publish no host ports.

This makes the end-to-end environment independent of a developer's active stack and aligns local
execution with continuous integration.

Normal wrapper commands select the `development` profile. Inactive development services retain
their local environment-file requirements without requiring those files during end-to-end runs.

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

Continuous integration requests the three smoke checks and the complete authenticated travel
authorization journey using four distinct Auth0 accounts and UI actions, including booking and receipt
uploads. Its setup verifies authenticated identities before seeding isolated prerequisite data with
actor-specific application permissions. The eight `E2E_` repository Actions secrets provide each
actor's email and password; missing credentials fail setup rather than skipping coverage.
Fork pull requests run only smoke coverage because GitHub withholds repository secrets from those events.

## Continuous Integration Policy

The end-to-end workflow runs for pushes to `main` and when a pull request is marked ready for review.
It can also be started manually with GitHub Actions. This limits costly browser-stack runs during
draft development while preserving an explicit verification path.

## Authority

- `api/end-to-end-tests/README.md` is the source of truth for current test coverage, authenticated
  prerequisites, test fixtures, and locator conventions.
- `bin/dev`, `docker-compose.development.yml`, and `.github/workflows/end-to-end-tests.yml` define the
  current execution behavior.
- The Playwright specifications under `api/end-to-end-tests/tests/` are the executable coverage
  evidence.

## Publication Boundary

This knowledge base is repository documentation. No external documentation site is configured; any
future publication must explicitly select public files and audiences.
