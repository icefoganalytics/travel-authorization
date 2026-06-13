# Plan: Stabilize Playwright End-to-End Test Infrastructure

- **Source**: [Pull Request #394: Add Playwright End-to-End Testing Skeleton](https://github.com/icefoganalytics/travel-authorization/pull/394)

## Problem Statement

The Playwright end-to-end test skeleton adds the right high-level pieces, but the current setup has a
few reliability gaps that can make local and continuous integration runs test different systems. The
main goal is to make `dev test end-to-end-tests` run against the full application stack using clean
test databases, then tighten the smoke tests and documentation around that behavior.

## Current State Analysis

**Already Implemented:**

- A Playwright test runner lives under `api/end-to-end-tests/`.
- A Docker Compose e2e overlay defines test database names and runner environment variables.
- Continuous integration starts the app stack with the e2e overlay before running tests.
- Database cleanup fixtures reuse the existing API test cleanup helpers.

**Not Yet Implemented:**

- The local e2e command does not start the app stack with the e2e overlay before running tests.
- The documented local flow can point tests at the development app stack and development database.
- The e2e runner can lose image-installed dependencies when the host `api/` directory is bind-mounted.
- One smoke test claims to verify the API health endpoint but currently requests the frontend base URL.
- The skipped wizard skeleton is not clearly separated from runnable smoke coverage.

## Key Findings

1. Local e2e runs should be self-contained and use the test database stack by default.
2. Docker-based local runs should not depend on host-installed `node_modules`.
3. Smoke tests should assert the thing they name so failures are actionable.
4. Skipped future tests are acceptable in a skeleton branch, but the limitation should remain explicit.

## Recommended Solution

### Phase 1: Run Local End-to-End Tests Against The Test Stack

**Implementation:**

- Update `bin/dev` so `dev test end-to-end-tests` runs Playwright through the e2e Compose overlay,
  then tears the e2e stack down after the run.
- Run the local e2e command under a separate Docker Compose project name so cleanup does not target a
  normal development stack.
- Add e2e-specific service dependencies to `docker-compose.e2e-test.yml` so Compose owns startup
  ordering instead of duplicating service lists in Ruby.
- Update `bin/README.md` and `AGENTS.md` so local instructions say the command runs against test
  databases and does not require `dev up` first.

**Benefits:**

- Local and continuous integration runs exercise the same test-mode application stack.
- Developers are less likely to mutate development data while running end-to-end tests.

### Phase 2: Make The Docker Runner Independent Of Host Dependencies

**Implementation:**

- Adjust the `end_to_end_tests` service volume strategy so the bind mount does not hide installed
  dependencies, or install dependencies as part of the command in the mounted workspace.
- Prefer a pattern consistent with the existing project Docker workflow.

**Benefits:**

- Clean checkouts can run end-to-end tests without a local `npm install`.
- The Docker path remains the canonical path for local and continuous integration validation.

### Phase 3: Correct Smoke Test Coverage

**Implementation:**

- Change the health-check smoke test to request the real API health endpoint, or rename and rewrite it
  as a frontend route smoke test.
- Keep unauthenticated smoke tests minimal until an authentication storage-state fixture exists.

**Benefits:**

- Smoke failures point to the broken subsystem instead of an accidentally related route.

### Phase 4: Clarify Skeleton Coverage And Future Auth Work

**Implementation:**

- Keep skipped wizard tests if they are useful reference scaffolding, but make their status clear in
  pull request notes and documentation.
- Defer runnable authenticated coverage until storage-state fixtures and test credentials are in place.

**Benefits:**

- Reviewers know what is actually enforced by continuous integration today.
- Future authenticated tests have a clear next implementation path.

## Decision Factors

1. The e2e command should prioritize safety over speed by defaulting to test databases.
2. Local behavior should match continuous integration closely enough that failures reproduce.
3. Changes should land in small slices so each reliability fix can be reviewed independently.

## Recommended Action

Start with Phase 1. After review, continue through the remaining phases one at a time.

## Files To Review

1. `bin/dev` - Command orchestration for local end-to-end test runs.
2. `bin/README.md` - Local command documentation.
3. `AGENTS.md` - Agent-facing test workflow guidance.
4. `docker-compose.development.yml` - End-to-end runner service definition.
5. `docker-compose.e2e-test.yml` - Test-stack environment and database volume overlay.
6. `api/end-to-end-tests/tests/smoke.spec.ts` - Runnable smoke test coverage.

## Out Of Scope

- Building Auth0 storage-state fixtures.
- Making the skipped wizard tests runnable.
- Expanding end-to-end coverage beyond stabilizing the current skeleton.

## Related Issues

- [Pull Request #394: Add Playwright End-to-End Testing Skeleton](https://github.com/icefoganalytics/travel-authorization/pull/394)
