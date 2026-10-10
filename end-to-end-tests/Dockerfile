FROM mcr.microsoft.com/playwright:v1.60.0-noble

WORKDIR /usr/src

COPY end-to-end-tests/package*.json ./

RUN npm ci

COPY end-to-end-tests/ ./end-to-end-tests/

COPY api/src/config.ts ./api/src/config.ts
COPY api/src/db/db-client.ts ./api/src/db/db-client.ts
COPY api/src/utils/logger.ts ./api/src/utils/logger.ts
COPY api/src/integrations/trav-com-integration/db/db-client.ts ./api/src/integrations/trav-com-integration/db/db-client.ts
COPY api/src/integrations/trav-com-integration/db/mssql-type-extensions/ ./api/src/integrations/trav-com-integration/db/mssql-type-extensions/
COPY api/src/integrations/trav-com-integration/utils/compact-sql.ts ./api/src/integrations/trav-com-integration/utils/compact-sql.ts
COPY api/tests/support/clean-database.ts ./api/tests/support/clean-database.ts
COPY api/tests/support/clean-trav-com-database.ts ./api/tests/support/clean-trav-com-database.ts

WORKDIR /usr/src/end-to-end-tests

CMD ["/bin/true"]
