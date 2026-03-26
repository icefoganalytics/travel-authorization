# Web Testing Guide

This directory contains the frontend test support files for the Travel Authorization web
application.

## Running Tests

```bash
dev test_web
```

To run the tests from the `web/` directory directly:

```bash
npm test
npm test -- --run
```

## Directory Overview

```text
web/tests/
├── support/       # Reusable test helpers
├── utils/         # Utility-level tests
├── tsconfig.json  # Test TypeScript configuration
└── README.md
```

## Notes

- Frontend tests use Vitest.
- Keep test files close in structure to the source files they validate.
- Prefer reusable helpers in `web/tests/support/` for shared mocks or setup behavior.
- When frontend testing guidance becomes more specific, add it here instead of expanding the root
  README.
