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

Development services run by default without a profile. Profiles are reserved for optional unit-test,
end-to-end, and design services. The development API loads its local environment file when present;
Compose can also validate the isolated end-to-end run without that local file. The wrapper targets
the test runner and its dependencies explicitly, so default development services are not started
in the test project.
The end-to-end frontend reuses the standard web build with test-only API routing, no development
bind mounts or gateway attachment, and a readiness check. The `test_web` unit-test runner does not
serve the application.

## Test Ownership and Runtime

End-to-end tests are system tests, not API tests: the Playwright browser exercises the `web` service,
which calls the `api` service and its isolated `travel_test` and `trav_com_test` databases. The
standalone top-level `end-to-end-tests/` package sits alongside `api/` and `web/` and owns its
dependencies, scripts, configuration, and Dockerfile. It imports the existing API database clients
and cleanup helpers through absolute aliases rather than duplicating their behavior.

The runner builds from the repository root, installs only the end-to-end dependency manifest under
`/usr/src/node_modules`, and copies the small API-source closure needed by those helpers. Shared
helpers resolve runner-owned dependencies through normal Node ancestor lookup; the API manifest is
not installed in this image. Authentication state, reports, host dependencies, and environment files
are excluded from the root build context.

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

- `end-to-end-tests/README.md` is the source of truth for current test coverage, authenticated
  prerequisites, test fixtures, and locator conventions.
- `bin/dev`, `docker-compose.development.yml`, and `.github/workflows/end-to-end-tests.yml` define the
  current execution behavior.
- The Playwright specifications under `end-to-end-tests/tests/` are the executable coverage
  evidence.

## Publication Boundary

This knowledge base is repository documentation. No external documentation site is configured; any
future publication must explicitly select public files and audiences.
