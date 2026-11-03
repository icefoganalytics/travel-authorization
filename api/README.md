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

The API is available through the gateway at `http://api.<gateway-hostname>` (without a port
binding). Replace `<gateway-hostname>` with the checkout-derived hostname shown by Vite at startup;
if `GATEWAY_HOSTNAME` is set, use that value. The matching browser origin is
`http://<gateway-hostname>`. Log in through that browser origin before inspecting API responses.

## Common Commands

Run API commands from the `api/` directory or through the repo-level `dev` wrapper:

```bash
dev up api
dev migrate up
dev migrate down
dev migrate make create-table-name
npm run start
npm run build
npm run lint
npm run check-types
```

See [../bin/README.md](../bin/README.md#testing) for the canonical test commands.

## Environment Variables

The source of truth for supported API environment variables is:

- [`src/config.ts`](./src/config.ts)

That file defines the loaded environment files and the supported API configuration surface.

## Shared Backend Library Adoption

Load the direct [packaged backend workflow](skill://express-light-rail/workflow.md) before applying local guidance; other clients resolve the [corresponding workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/express-light-rail-backend-workflow.md) in their verified release under the root [shared-base contract](../AGENTS.md#shared-standards-and-local-authority). These conceptual rails do not authorize replacing TravelAuth's controller, policy, serializer, or service bases. Those local contracts and PostgreSQL/Knex migrations remain authoritative.

The current lockfile resolves Express **4.18.2**, `@sequelize/core` and `@sequelize/postgres` **7.0.0-alpha.46**, and Knex **3.0.1**. The development API container resolved the same packages on Node **20.19.0**. Recheck the actual environment with `./bin/dev api node --version` and `./bin/dev api npm ls express @sequelize/core @sequelize/postgres knex express-light-rail --depth=0`; declaration ranges alone are not install evidence. `express-light-rail` is neither declared nor locked here and was absent from that installed dependency listing.

Published [`express-light-rail@0.3.0` metadata](https://registry.npmjs.org/express-light-rail/0.3.0) requires Node `>=22`, Express `^4.21.2`, and `@sequelize/core` `^7.0.0-alpha.43`. The observed Node and Express versions do not meet those requirements. The Sequelize peer range is not proof that TravelAuth's alpha.46 models, associations, transactions, or dialect behavior work with the library.

Before a separately accepted base-replacement change:

1. Select a published artifact and verify its actual engines/peers against the resolved runtime and installed dependency tree, including the PostgreSQL dialect. Plan any required upgrades separately.
2. Prove compatibility with local request helpers, resource-scoped policies, pagination/order limits, serializers and association preloads, action-service transactions, and existing error middleware; retain Auth0 and integration boundaries.
3. Exercise representative controller/service/serializer behavior and test setup through the [canonical wrapper](../bin/README.md#testing). Do not infer compatibility from matching names or peer ranges.

[Upstream adoption/patterns](https://github.com/klondikemarlen/express-light-rail/issues/4), [browser-safe contracts](https://github.com/klondikemarlen/express-light-rail/issues/5), and [opt-in tooling](https://github.com/klondikemarlen/express-light-rail/issues/6) own the related library work. Issue #425 changes guidance only: no package installation, runtime upgrade, or base replacement.

## Related Docs

- [../README.md](../README.md) - repo-level overview and quick start
- [../AGENTS.md](../AGENTS.md) - project-wide conventions and architecture
- [Report download architecture](/docs/architecture/report-downloads.md) - Travel Desk export contracts, generation, and runtime packaging
- [tests/README.md](./tests/README.md) - API testing guide
- [src/db/README.md](./src/db/README.md) - migrations, seeds, and database workflow
- [src/controllers/README.md](./src/controllers/README.md) - controller patterns
- [src/policies/README.md](./src/policies/README.md) - authorization patterns
- [src/serializers/README.md](./src/serializers/README.md) - serializer patterns
- [src/services/README.md](./src/services/README.md) - service-layer patterns
- [src/integrations/README.md](./src/integrations/README.md) - integrations guidance
- [src/queries/README.md](./src/queries/README.md) - reusable SQL query guidance
