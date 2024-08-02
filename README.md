# Travel Authorization

## General Stack

### API (Back-end)

- [Node](https://nodejs.org/en) + [Express](https://expressjs.com/)

- [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)

- [Knex](https://knexjs.org/guide/)

### Front-End

- [Vue2](https://v2.vuejs.org/) + [Vuetify](https://vuetifyjs.com/en/getting-started/installation/)

- [Axios](https://github.com/axios/axios)

### Database

- Postgres DB - [psql](https://www.postgresql.org/docs/current/app-psql.html)

- [Docker Compose](https://docs.docker.com/compose/compose-file/)

---

## Development

1. In the `api` folder.

2. Create a `.env.development` file with this content. It must match the config in `docker-compose.db.yml`

   ```bash
   AUTH0_DOMAIN=https://dev-0tc6bn14.eu.auth0.com
   AUTH0_AUDIENCE=testing
   ```

3. Go back to the top level directory.

4. [Set up the `dev`](#set-up-dev-command) command, or use `docker compose -f docker-compose.development.yml` instead of `dev` in all instructions.

5. Boot the api, web, and db services via `dev up` or `docker compose -f docker-compose.development.yml up`. This will run the boot pipeline and create the database, run migrations, and run seeds.

6. Stop the api, web, and db services via `ctrl+c` or `dev down` or if you want to wipe the database `dev down -v`.

### API Service (a.k.a back-end)

1. Boot only the api service using:

   ```bash
   dev up api

   # or

   docker compose -f docker-compose.development.yml up api
   ```

2. Access the api by logging in to the front-end, then going to http://localhost:3000

### Web Service (a.k.a. front-end)

1. Boot only the web service using:

   ```bash
   dev up web

   # or

   docker compose -f docker-compose.development.yml up web
   ```

2. Log in to the front-end service at http://localhost:8080

### DB Service (a.k.a database service)

1. Boot only the db service using:

   ```bash
   dev up db

   # or

   docker compose -f docker-compose.development.yml up db
   ```

   > Migrations run automatically, as do seeds. We need to change the seed format for production as it currently wipes the database during seeding.

2. You can access the `psql` command line via

   ```bash
   dev psql

   # or

   docker compose -f docker-compose.development.yml exec db psql "postgresql://app:itsallgood@localhost:5432/travel_development"
   ```

You can also run migrations and seeding manually after login in to the web UI by going to

- http://localhost:3000/migrate/latest
- http://localhost:3000/migrate/up
- http://localhost:3000/migrate/down
- http://localhost:3000/migrate/seed

You can also skip seeding if database is not empty by setting the `SKIP_SEEDING_UNLESS_EMPTY=true` environment variable.

### Troubleshooting

If you are getting a bunch of "Login required" errors in the console, make sure that you have disabled any kind of enhanced tracking protection.

Auth0 use third-party cookies for authentication, and they get blocked by all major browsers
by default.

## Testing

With `dev` helper run: `dev test api` or `dev test web`.

### Back-end

1. Run the api test suite via `dev test_api`.

See [api/tests/README.md](./api/tests/README.md) for more detailed info.

### Front-end

Run `dev test_web` to run the front-end tests.
Currently can only test `.js` files. `.vue` files are not yet supported.

## Migrations

You can generate migrations via the api service code. Currently uses [knex Migration CLI](https://knexjs.org/guide/migrations.html#migration-cli) using `dev knex ...` or `cd api && npm run knex ...`.

### Create a New Migration

```bash
dev knex migrate:make migration-name
```

This will generate a migration of the form:

- `api/src/db/migrations/20231013235256_migration-name.ts`

Ideally the full name would be dash cased but that would require switching to `umzug/Sequelize`.

### Running Migrations

```bash
dev knex migrate:latest
dev knex migrate:up
```

### Rolling Migrations Backwards

```bash
dev knex migrate:rollback
dev knex migrate:rollback --all
dev knex migrate:down
```

## Set up `dev` command

The `dev` command vastly simplifies development using docker compose. It only requires `ruby`; however, `direnv` and `asdf` will make it easier to use.

It's simply a wrapper around docker compose with the ability to quickly add custom helpers.

All commands are just strings joined together, so it's easy to add new commmands. `dev` prints out each command that it runs, so that you can run the command manually to debug it, or just so you learn some docker compose syntax as you go.

1. (optional) Install `asdf` as seen in https://asdf-vm.com/guide/getting-started.html.

   e.g. for Linux

   ```bash
   apt install curl git

   git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.12.0

   echo '
   # asdf
   . "$HOME/.asdf/asdf.sh"
   . "$HOME/.asdf/completions/asdf.bash"
   ' >> ~/.bashrc
   ```

2. Install `ruby` via `asdf` as seen here https://github.com/asdf-vm/asdf-ruby, or using whatever custom Ruby install method works for your platform.

   e.g. for Linux

   ```bash
   asdf plugin add ruby https://github.com/asdf-vm/asdf-ruby.git

   # install version from .tool-versions file
   asdf install ruby

   asdf reshim ruby
   ```

   You will now be able to run the `./bin/dev` command.

3. (optional) Install [direnv](https://direnv.net/) and create an `.envrc` with

   ```bash
    #!/usr/bin/env bash

    PATH_add bin
   ```

   and then run `direnv allow`.

   You will now be able to do `dev xxx` instead ov `./bin/dev xxx`.

# Deploying

## Production Environment (remote)

1. Create the appropriate database, as specified by the `DB_NAME` environment variable, and
2. Make sure the `public` schema exists in that database.

## Test Production Build Locally

Files:

- [Dockerfile](./Dockerfile)
- [docker-compose.yml](./docker-compose.yml)
- Non-commited `.env` file

1. Create a `.env` file in top level directory with the appropriate values.

   ```bash
   DB_HOST="db"
   DB_PORT="5432"
   DB_USER="app"
   DB_PASS="itsallgood"
   DB_NAME="travel_production"

   AWS_LOGGING_ENABLED="true"
   AWS_LOGGING_GROUP="travel-authorization"
   AWS_LOGGING_STREAM="travel-auth-dev.ynet.gov.yk.ca"
   AWS_LOGGING_REGION="ca-central-1"
   AWS_LOGGING_ACCESS_ID="some-id"
   AWS_LOGGING_ACCESS_KEY="some-key"
   ```

   - [ ] TODO: investigate if additional custom environment variables are needed

2. (optional) If testing build arguments do

   ```bash
   docker compose build \
      --build-arg RELEASE_TAG=2024.01.8.1 \
      --build-arg GIT_COMMIT_HASH=532bd759c301ddc3352a1cee41ceac8061bfa3f7
   ```

   or

   ```bash
   docker compose build \
      --build-arg RELEASE_TAG=$(date +%Y.%m.%d) \
      --build-arg GIT_COMMIT_HASH=$(git rev-parse HEAD)
   ```

   and then in the next step drop the `--build` flag.

3. Build and boot the production image via

   ```bash
   docker compose up --build
   ```

4. Go to http://localhost:3000/ and log in.

5. Navigate around the app and do some stuff and see if it works.
