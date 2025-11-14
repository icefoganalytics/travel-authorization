import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("flight_statistic_jobs", (table) => {
    table.increments("id").primary()
    table.integer("progress").notNullable().defaultTo(0)
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now())
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now())
    table.timestamp("deleted_at").nullable()
  })

  await knex.raw(/* sql */ `
    INSERT INTO
      flight_statistic_jobs (id, progress, updated_at, created_at, deleted_at)
    SELECT
      id,
      COALESCE(progress, 0) AS progress,
      last_update AS updated_at,
      last_update AS created_at,
      NULL AS deleted_at
    FROM
      "StatisticsProgress"
  `)

  await knex.schema.dropTable("StatisticsProgress")
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("StatisticsProgress", (table) => {
    table.increments("id").notNullable().primary()
    table.dateTime("last_update").notNullable()
    table.integer("progress").nullable()
  })

  await knex.raw(/* sql */ `
    INSERT INTO
      "StatisticsProgress" (id, last_update, progress)
    SELECT
      id,
      updated_at AS last_update,
      progress
    FROM
      flight_statistic_jobs
    WHERE
      deleted_at IS NULL
  `)

  await knex.schema.dropTable("flight_statistic_jobs")
}
