# End-to-End Testing

## Purpose

TravelAuth uses Playwright to verify that the browser, web application, API, and test databases work
together. The end-to-end suite provides release confidence without touching development data or a
running development stack.

## Architecture Boundary

Run end-to-end tests locally and in continuous integration with:

```bash
./bin/dev e2e test
```

The wrapper combines `docker-compose.development.yml` and `docker-compose.e2e-test.yml` in the
fixed `travel-authorization-e2e-test` project. The overlay uses the standard `api`, `web`, `db`, and
`db_trav_com` service names, plus the `end_to_end_tests` runner; there are no separate application
variants or profile activation. The isolated project uses separate database volumes and test
database names, leaving a running development stack and its data untouched.

The E2E stack omits the development gateway overlay, publishes no host ports, mounts no development
source directories, and does not load development environment files. The runner shares the web
service's network namespace so the real Auth0 callback remains `http://localhost:8080`. Normal
development retains its required environment-file configuration; test-only SQL readiness is defined
by the E2E overlay and does not change the normal API startup dependency.

The wrapper resets the isolated project before the run and removes its services and volumes after
success or failure. The default suite runs three credential-free smoke tests; setting
`E2E_AUTHENTICATED=true` includes all 15 discovered tests and requires the real accounts and
application policy prerequisites described in
[`end-to-end-tests/README.md`](../../end-to-end-tests/README.md).
The fixture cleans test databases before each test unless a stateful serial workflow opts out.

This makes the end-to-end environment independent of a developer's active stack and aligns local
execution with continuous integration. The same wrapper command is used in CI.

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

## Coverage Contract

Same-repository pull requests, pushes to `main`, and manual runs set `E2E_AUTHENTICATED=true` and
request the three smoke checks plus the complete authenticated journey with four distinct Auth0
accounts and UI actions, including booking and receipt uploads. Setup verifies authenticated
identities before seeding isolated prerequisite data with actor-specific application permissions.
The eight `E2E_` repository Actions secrets provide each actor's email and password. Missing
credentials fail setup rather than silently skipping coverage. Fork pull requests run only the
credential-free smoke checks because GitHub withholds repository secrets from those events.

## Continuous Integration Policy

The end-to-end workflow runs for pushes to `main` and when a pull request is marked ready for review.
It can also be started manually with GitHub Actions. It runs `./bin/dev e2e test`, matching the local
command.

## Executable References

- [`bin/README.md`](../../bin/README.md#testing) documents the canonical command and flags.
- [`end-to-end-tests/README.md`](../../end-to-end-tests/README.md) documents coverage, credentials,
  policy prerequisites, and isolation.
- The Compose files and workflow define the stack, secret policy, triggers, and failure artifacts;
  Playwright configuration and specifications define executable coverage.

## Publication Boundary

This knowledge base is repository documentation. No external documentation site is configured; any
future publication must explicitly select public files and audiences.
