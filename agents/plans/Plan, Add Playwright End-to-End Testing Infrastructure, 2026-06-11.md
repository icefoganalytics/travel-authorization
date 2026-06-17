# Plan: Add Playwright End-to-End Testing Infrastructure

## Problem Statement

Issue #124 asks for end-to-end tests to reduce QA overhead on each release. No automated browser
tests exist today. This plan sets up a minimal Playwright skeleton that follows the project's
existing Docker Compose test patterns and integrates with `dev test`.

## Current State Analysis

**Already Implemented:**
- ✅ `end-to-end-tests/` directory at repo root (branch `feature/e2e-testing-playwright`)
- ✅ `end-to-end-tests/package.json` with `@playwright/test ^1.52.0` and run scripts
- ✅ `end-to-end-tests/playwright.config.ts` — Chromium, `BASE_URL` env, screenshots/video on failure
- ✅ `end-to-end-tests/tsconfig.json`
- ✅ `end-to-end-tests/tests/smoke.spec.ts` — 3 smoke tests (health check, sign-in page, auth redirect)
- ✅ `end-to-end-tests/.gitignore`, `.env.example`
- ✅ `.github/workflows/end-to-end-tests.yml` — CI workflow (has a bug, see below)
- ✅ `end-to-end-tests/development.Dockerfile` — based on `mcr.microsoft.com/playwright:v1.52.0-jammy`
- ✅ `AGENTS.md` updated with End-to-End Tests section
- ✅ Draft PR #394 open

**Not Yet Implemented:**
- ✅ Pin `@playwright/test` to exact `1.52.0` (must match Docker image version)
- ✅ `end_to_end_tests` service in `docker-compose.development.yml`
- ✅ `dev test end-to-end-tests` command in `bin/dev`
- ✅ Fix CI workflow: use `touch api/.env.development` instead of copying non-existent example file
- ✅ `AGENTS.md` local run section updated with `dev test end-to-end-tests`
- ✅ `bin/README.md` Testing section documents `dev test end-to-end-tests`
- [ ] Commit, push, update PR via `create-pull-request` skill

## Key Findings

1. **`api/.env.development.example` does not exist.** The project has `.env.development`
   (gitignored) but no example file. CI workflow fails on the copy step. Fix: `touch api/.env.development`
   to satisfy `docker compose`'s `env_file:` requirement without exposing secrets. The
   `x-default-environment` anchor in docker-compose already provides all runtime values.

2. **`wrap` test pattern (for reference).** The sibling project runs tests directly on the CI
   runner via `actions/setup-node` + `npm ci` + `npm test -- --run`. No Docker Compose for unit
   tests. Travel-authorization uses Docker Compose for everything; follow that pattern for
   end-to-end tests to stay consistent.

3. **Playwright Docker image pins browser version.** `mcr.microsoft.com/playwright:v1.52.0-jammy`
   has Chromium pre-installed for exactly v1.52.0. The `@playwright/test` package version must be
   pinned to `1.52.0` (exact, not `^1.52.0`) to avoid drift causing browser/driver mismatches.

4. **`BASE_URL` env var bridges local vs Docker.** `playwright.config.ts` already uses
   `process.env.BASE_URL ?? "http://localhost:8080"`. The Docker service will set
   `BASE_URL: http://web:8080` so Docker-internal routing works. No config change needed.

5. **`dev test end-to-end-tests` should run with `--no-deps`.** The end-to-end test service has
   no `depends_on` entries; the full stack is expected to be up via `dev up` first.

## Implementation Steps

### Step 1: Pin Playwright version and add Dockerfile ✅ (Dockerfile done)
- `end-to-end-tests/package.json`: change `"@playwright/test": "^1.52.0"` → `"1.52.0"`
- `end-to-end-tests/development.Dockerfile`: FROM playwright image, npm install ✅

### Step 2: Add `end_to_end_tests` Docker service
In `docker-compose.development.yml`, after `test_web`:
```yaml
end_to_end_tests:
  build:
    context: ./end-to-end-tests
    dockerfile: development.Dockerfile
  command: /bin/true
  environment:
    BASE_URL: http://web:8080
  tty: true
  volumes:
    - ./end-to-end-tests:/usr/src/end-to-end-tests
```

### Step 3: Update `bin/dev`
In `test` method, add `elsif service == "end-to-end-tests"` branch.
Add `test_end_to_end` method:
```ruby
def test_end_to_end(*args, **kwargs)
  run(*%w[--no-deps end_to_end_tests npm run test], *args, **kwargs)
end
```

### Step 4: Fix CI workflow
Replace the failing step:
```yaml
# Bad (file doesn't exist):
run: cp api/.env.development.example api/.env.development

# Good:
run: touch api/.env.development
```

Also start `db_trav_com` to prevent API startup errors, and wait for it before proceeding.

### Step 5: Update docs
- `AGENTS.md`: Replace raw npm commands with `dev test end-to-end-tests`
- `bin/README.md`: Add `./bin/dev test end-to-end-tests` to Testing section

### Step 6: Commit, push, update PR
- Commit with `:gear:` emoji
- Push to `feature/e2e-testing-playwright`
- Use `create-pull-request` skill to update PR #394

## Out of Scope

- Auth0 test-user fixture for authenticated routes (follow-up issue)
- Full CI test run verification (needs secrets not in CI)
- Multiple browser targets (Chromium only for now)

## Related Issues

- https://github.com/icefoganalytics/travel-authorization/issues/124
- Draft PR: https://github.com/icefoganalytics/travel-authorization/pull/394
