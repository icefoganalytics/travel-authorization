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

## Travel Desk Request Cutover

`GET /api/travel-desk/travel-authorizations` supplies the paginated authorization list for the
separate Travel Desk request workflow. System administrators see all records; all other accounts,
including department administrators, see only their own authorizations. Client filters only narrow
that visibility. This collection does not change supervisor or finance visibility in the general
authorization API.

The list returns planned segment dates, with historical stop fallback, and the persisted request's
own ID, status, and invoice number. Request creation and employee prefill remain part of approval.
Edits use the current resource APIs and state actions; the legacy `/api/traveldesk` aggregate
router is removed. During options review, an owner may update only a question's response, not its
text, type, or request identity. Existing booking permissions are unchanged.

Travel Desk resource responses serialize explicit public fields rather than ORM association graphs.
Flight-request and flight-option lists retain their nested options and segments; their individual
show/create/update responses are flat. Submit, options-provided, options-ranked, and book actions
return the request show contract, including `hasPassengerNameRecordDocument`. Associations loaded
only for permission checks are not returned.

## Environment Variables

The source of truth for supported API environment variables is:

- [`src/config.ts`](./src/config.ts)

That file defines the loaded environment files and the supported API configuration surface.

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
