# Stage 0 - base node customizations
FROM node:20.19.0-alpine3.21 AS base-node

RUN npm install -g npm@10.8.2

# Stage 1 - api build - requires development environment because typescript
FROM base-node AS api-build-stage

ENV NODE_ENV=development

WORKDIR /usr/src/api

COPY api/package*.json ./
COPY api/tsconfig*.json ./
RUN npm install

COPY api ./

RUN npm run build

RUN mkdir -p dist/db/seeds/data && cp src/db/seeds/data/*.csv dist/db/seeds/data/

# Stage 2 - web build - requires development environment to install vue-cli-service
FROM base-node AS web-build-stage

ARG RELEASE_TAG
ARG GIT_COMMIT_HASH

ENV VUE_APP_RELEASE_TAG=${RELEASE_TAG}
ENV VUE_APP_GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

ENV NODE_ENV=development

WORKDIR /usr/src/web

COPY web/package*.json ./
COPY web/tsconfig*.json ./
COPY web/babel.config.js ./
RUN npm install

COPY web ./

# Switching to production mode for build environment.
ENV NODE_ENV=production
RUN npm run build

# Stage 3 - production setup
FROM base-node

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ARG RELEASE_TAG
ARG GIT_COMMIT_HASH

ENV RELEASE_TAG=${RELEASE_TAG}
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

# Persists TZ=UTC effect after container build and into container run
# Ensures dates/times are consistently formated as UTC
# Conversion to local time should happen in the UI
ENV TZ=UTC
# Disables SSL certificate validation
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

ENV NODE_ENV=production
USER node

WORKDIR /home/node/app
RUN chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --from=api-build-stage --chown=node:node /usr/src/api/package*.json ./
RUN npm install && npm cache clean --force --loglevel=error

COPY --from=api-build-stage --chown=node:node /usr/src/api/dist ./dist
COPY --from=web-build-stage --chown=node:node /usr/src/web/dist ./dist/web

EXPOSE 3000

COPY --from=api-build-stage --chown=node:node /usr/src/api/bin/boot-app.sh ./bin/
RUN chmod +x ./bin/boot-app.sh

ENTRYPOINT ["./bin/boot-app.sh"]
