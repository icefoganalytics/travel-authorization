import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.string("benefits", 2000).alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    UPDATE travel_authorizations
    SET
      benefits = SUBSTRING(
        benefits
        FROM
          1 FOR 255
      )
  `)

  await knex.schema.alterTable("travel_authorizations", (table) => {
    table.string("benefits", 255).alter()
  })
}
