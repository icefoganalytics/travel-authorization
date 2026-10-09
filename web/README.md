# Web Service

The web service is the frontend for Travel Authorization.

If you are new to the project, read the root [README.md](../README.md) first, then come back here
for frontend-specific details.

It is responsible for:

- rendering the Vue and Vuetify application
- handling browser-side authentication flow
- routing and page-level UI state
- calling the backend API
- hosting Travel Authorization, Travel Desk, and administration interfaces

## How It Is Used

In normal development, the web service is usually run through the `dev` wrapper.

To run only the web service:

```bash
dev up web
```

To run the full app stack instead:

```bash
dev up
```

The web app is available at the checkout-derived gateway hostname documented in the root
[README.md](../README.md#local-services). Compose supplies `VITE_API_BASE_URL` for the matching
`api.` hostname; the API permits that checkout's browser origin. A standalone Vite server uses
`http://localhost:3000` unless `VITE_API_BASE_URL` is set.
When the full stack boots in Docker, the web service waits for the API `/_status` endpoint before
starting.

When `GATEWAY_HOSTNAME` is set, Vite prints
`Open Travel Authorization: http://<gateway-hostname>/` when its server starts. Compose supplies
the checkout-derived hostname or an explicit override. Without that variable, standalone Vite
prints its actual local address instead.

## Common Commands

Run web commands from the `web/` directory or through the repo-level `dev` wrapper:

```bash
dev up web
npm run start
npm run build
npm run lint
npm run check-types
```

See [../bin/README.md](../bin/README.md#testing) for the canonical test commands.

What these are for:

- `dev up web`: boot the frontend service in Docker
- `npm run start`: run the local Vite dev server
- `npm run build`: build the production frontend bundle
- `npm run lint`: run frontend linting
- `npm run check-types`: run frontend type checking

## Open In Editor

When the frontend runs in Docker, Vue Devtools cannot launch your host editor directly from inside
the container. This project handles that by:

- proxying Vite `"/__open-in-editor"` requests from the container to a small host-side bridge
- translating container paths like `/usr/src/web/...` back to your host checkout path
- launching `$EDITOR` on the host, or returning an error if no editor is configured.

If you use the repo-level `dev` wrapper, this is automatic:

- `dev up` allocates a checkout-local bridge port and passes it to Vite's editor proxy.
- `dev up -d` keeps the bridge running after detached startup completes.
- `dev down` stops only that checkout's bridge; other worktrees remain available.

On Linux, `dev` includes `docker-compose.development.linux.yml` so the container can resolve
`host.docker.internal`.

The bridge prefers `OPEN_IN_EDITOR_COMMAND`, then `EDITOR`, and returns an error if neither is set.

The bridge records its PID and selected port under the checkout's `tmp/` directory. Set
`OPEN_IN_EDITOR_BRIDGE_PORT` before `dev up` only if you need a specific free host port; concurrent
checkouts must use different ports.

## Sample Travelport Text

If you need parsable sample flight text while testing the Travel Desk flight import flow, this block
has been used successfully in prior TravelAuth PR testing:

```text
WestJet WS3566 - Operated By: WESTJET ENCORE
Departure: 03 Dec 06:25 Cranbrook Municipal (YXC) Terminal:
Arrival:   03 Dec 07:09 Calgary Intl Arpt (YYC) Terminal:
Duration:  0 Hour(s) 44 Minutes
Status:    Sold
Class:     B

WestJet WS107
Departure: 03 Dec 09:00 Calgary Intl Arpt (YYC) Terminal:
Arrival:   03 Dec 09:47 Vancouver Intl Arpt (YVR) Terminal: M
Duration:  1 Hour(s) 47 Minutes
Status:    Sold
Class:     B
```

## Sample Invoice Number

If you need a known invoice number while testing the Travel Desk **Trip Information (PNR details)**
flow, use `39339`.

That value has been used in prior TravelAuth PR testing for itinerary and Passenger Name Record
flows.

## Sample General Ledger (GL) Codes

If you need known valid General Ledger codes while testing the expense submission flow, use one of
these values:

- `552-503010-0222-0006-09999`
- `552-502010-0222-3152-09999`

These values were used as valid examples in prior TravelAuth PR testing for expense coding and GL
validation flows.

## TypeScript And Editor Support

For Vue type support in editors, use:

- [VS Code](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

If you use VS Code, disable Vetur.

## Related Docs

- [../README.md](../README.md) - repo-level overview and quick start
- [../AGENTS.md](../AGENTS.md) - frontend conventions and component patterns
- [tests/README.md](./tests/README.md) - web testing directory guide
- [src/components/README.md](./src/components/README.md) - component-level guidance
- [src/api/README.md](./src/api/README.md) - frontend API layer guidance
- [src/pages/README.md](./src/pages/README.md) - page-level frontend guidance
- [src/layouts/README.md](./src/layouts/README.md) - layout guidance
