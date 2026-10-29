# Travelport Booking Feed integration

Use this boundary to read the Travelport source, not TravCom invoices. Travelport identifies booking files by the event-level record locator; a TravCom invoice number is a different identifier. This module does not expose an HTTP endpoint or decide who may view a travel request. Call it from an authorized application use case.

## Reading booking history

```typescript
import { TravelOrderEvent } from "@/integrations/travelport-integration/models"

const events = await TravelOrderEvent.findAllByRecordLocator("ZZ0001")
```

The lookup returns every matching source event with its passengers, air reservation segments, and optional service-fee transaction. Collection associations are loaded independently so multiple passengers do not multiply flight segments. An unknown locator returns an empty array. History ordering is deterministic for inspection, not a rule for selecting the current booking.

Keep source events separate until the consuming workflow has an authoritative selection rule. Booking (`B`) and fare (`F`) events can carry itinerary snapshots; ticketing (`T`) events can carry fees with no PNR version or flight segments. Do not discard unversioned ticketing events or passive `GK` segments, sum every historical fee, or reinterpret database arrival order as reservation-version order. Decimal service-fee values retain their database precision.

The source dictionary documents [event replacement and version semantics](https://support.travelport.com/webhelp/tbf/Content/Data%20Definitions/TravelOrderEvent.htm), [fare and service-fee triggers](https://support.travelport.com/webhelp/tbf/Content/Triggers/Data_Events_and_Triggers.htm), and [active/void service-fee status](https://support.travelport.com/webhelp/tbf/Content/Data%20Definitions/SFTrans.htm). Those definitions do not by themselves establish the deployed source's locator reuse, current-snapshot selection, or fee-document deduplication policy. The verified source schema, rather than newer documentation fields, controls the model mappings.

## Local development and tests

Follow the [development wrapper](../../../../bin/README.md) for startup and test commands. Development Compose supplies a separate SQL Server 2019 service, `db_travelport`, with the private alias `${COMPOSE_PROJECT_NAME}-db_travelport` and its own volume. It does not connect to production or require VPN access. Desktop gateway access uses `db-travelport.<gateway-hostname>` with encryption enabled; there is no directly published database port.

Startup follows the existing TravCom sequence: wait for the local server, create the local database when absent, run source-schema migrations, and load synthetic development data. The database names are `travelport_development` for the normal API and `travelport_test` for the API test runner. Test scenarios insert their own records and clean only their own Travelport test database; unrelated API tests do not acquire an extra per-test source cleanup.

The synthetic development fixture includes `ZZ0001`: thirteen booking snapshots and a separate fee event, with version 7 arriving after version 8. Other fictional locators cover fare events, multiple passengers, missing flights, and six flight segments. Names, routes, dates, locators, event identifiers, and fee amounts are synthetic—not production extracts.

## Production configuration

Only the deployed production application connects to the real booking-feed database. Supply these settings through the deployment's secure environment, not committed environment files:

| Setting                                          | Purpose                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| `TRAVELPORT_DB_HOST`                             | Production source SQL Server host.                                         |
| `TRAVELPORT_DB_NAME`                             | Source database name.                                                      |
| `TRAVELPORT_DB_USER`                             | A source account with read-only permissions.                               |
| `TRAVELPORT_DB_PASS`                             | That account's password.                                                   |
| `TRAVELPORT_DB_PORT`                             | SQL Server port; defaults to 1433.                                         |
| `TRAVELPORT_DB_TRUST_SERVER_CERTIFICATE_ENABLED` | Defaults to false; development Compose enables it for its local simulator. |

The production initializer returns before loading source database initialization actions. It must not create, migrate, or seed production-owned source objects. Production network routing, credentials, and install-specific selection semantics cannot be verified from the local simulator; validate them in the deployed environment without enabling simulator initialization there.

Source schema migrations and synthetic seeds belong only to local development and test setup. Do not add writes to the booking lookup or repoint TravCom's initialization at this source. Request linkage, itinerary UI cutover, and invoice generation remain separate consumer work under #293/#314.
