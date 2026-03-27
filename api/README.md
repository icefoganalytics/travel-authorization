# API Service

The API service is the backend for Travel Authorization.

If you are new to the project, read the root [README.md](../README.md) first, then come back here
for backend-specific details.

It is responsible for:

- authentication and authorization
- travel authorization and Travel Desk business logic
- database access and migrations
- integrations and scheduled jobs
- serializer and policy-backed API responses

## How It Is Used

In normal development, the API service is usually run through the `dev` wrapper.

To run only the API service:

```bash
dev up api
```

To run the full app stack instead:

```bash
dev up
```

The API is then available at `http://localhost:3000`.

If you want to inspect API responses in a browser while developing, log in through the frontend at
`http://localhost:8080` first, then open `http://localhost:3000`.

## Common Commands

Run API commands from the `api/` directory or through the repo-level `dev` wrapper:

```bash
dev up api
dev test_api
dev migrate up
dev migrate down
dev migrate make create-table-name
npm run start
npm run build
npm run lint
npm run check-types
```

## Environment Variables

The source of truth for supported API environment variables is:

- [`src/config.ts`](./src/config.ts)

That file defines the loaded environment files and the supported API configuration surface.

## Related Docs

- [../README.md](../README.md) - repo-level overview and quick start
- [../AGENTS.md](../AGENTS.md) - project-wide conventions and architecture
- [tests/README.md](./tests/README.md) - API testing guide
- [src/db/README.md](./src/db/README.md) - migrations, seeds, and database workflow
- [src/controllers/README.md](./src/controllers/README.md) - controller patterns
- [src/policies/README.md](./src/policies/README.md) - authorization patterns
- [src/serializers/README.md](./src/serializers/README.md) - serializer patterns
- [src/services/README.md](./src/services/README.md) - service-layer patterns
- [src/integrations/README.md](./src/integrations/README.md) - integrations guidance
- [src/queries/README.md](./src/queries/README.md) - reusable SQL query guidance

